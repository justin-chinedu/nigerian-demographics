

# Installation and Setup

This script fetches data for Nigerian states, LGAs, and wards from INEC's remote server. Follow the instructions below to install, clone, and run the script.

## Prerequisites

- Node.js installed on your machine

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/justin-chinedu/nigerian-demographics.git
   ```

2. Navigate to the project directory:

   ```bash
   cd nigerian-demographics
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

## Usage

The `states.json` file contains data for Nigerian states.

1. Run the script:

   ```bash
   node fetch.js
   ```

   The script will fetch data for states, LGAs, wards and polling units and save it to `ng_demographics.json`.

---

