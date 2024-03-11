import axios from 'axios';
import fs from 'fs';

const states = JSON.parse(fs.readFileSync('./states.json'));
let headersList = {
  Accept: '*/*',
  Origin: 'https://inecnigeria.org',
  Connection: 'keep-alive'
};

async function fetchData(state_id, lga_id, ward_id) {
  let bodyContent = new FormData();
  let script = 'lgaView.php';
  bodyContent.append('state_id', state_id);

  if (lga_id) {
    bodyContent.append('lga_id', lga_id);
    script = 'wardView.php';
  }

  if (ward_id) {
    bodyContent.append('ward_id', ward_id);
    script = 'pollingView.php';
  }

  const response = await axios.post(
    `https://inecnigeria.org/wp-content/themes/independent-national-electoral-commission/custom/views/${script}`,
    bodyContent,
    { headers: headersList }
  );
  return response.data;
}

// Necessary function to filer out inconsistencies in data
function filterObjectValues(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return [];
  }
  return Object.values(obj).filter((value) => typeof value === 'object' && value !== null);
}

(async () => {
  let promises = states.map(async (s, index) => {
    console.log(`Fetching data for state ${s.name} (${index + 1}/${states.length})...`);
    let state = {
      name: s.name,
      id: s.id,
      lgas: []
    };
    const lgas = await fetchData(s.id);
    for (let j = 0; j < filterObjectValues(lgas).length; j++) {
      const l = filterObjectValues(lgas)[j];
      console.log(`Fetching data for LGA ${l.name} (${j + 1}/${filterObjectValues(lgas).length}) in ${s.name}...`);
      let lga = {
        name: l.name,
        id: l.abbreviation,
        wards: []
      };
      const wards = filterObjectValues(await fetchData(s.id, l.abbreviation));
      for (let k = 0; k < filterObjectValues(wards).length; k++) {
        const w = filterObjectValues(wards)[k];
        console.log(`Fetching data for ward ${w.name} (${k + 1}/${filterObjectValues(wards).length}) in LGA ${l.name}...`);
        let ward = {
          name: w.name,
          id: w.abbreviation,
          punits: []
        };
        const pollingUnits = filterObjectValues(await fetchData(s.id, l.abbreviation, w.id));
        for (const p of pollingUnits) {
          ward.punits.push({
            name: p.name,
            id: p.abbreviation,
            location: p.precise_location
          });
        }
        lga.wards.push(ward);
      }
      state.lgas.push(lga);
    }
    return state;
  });

  let out = await Promise.all(promises);

  fs.writeFileSync('ng_demographics.json', JSON.stringify(out));
})();
