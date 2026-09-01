const https = require('https');

const forms = [
  'kangaskhan-mega',
  'pinsir-mega',
  'gyarados-mega',
  'aerodactyl-mega',
  'mewtwo-mega-x',
  'mewtwo-mega-y',
  'ampharos-mega',
  'steelix-mega',
  'scizor-mega',
  'heracross-mega',
  'houndoom-mega',
  'tyranitar-mega',
  'sceptile-mega',
  'blaziken-mega',
  'swampert-mega',
  'gardevoir-mega',
  'sableye-mega',
  'mawile-mega',
  'aggron-mega',
  'medicham-mega',
  'manectric-mega',
  'sharpedo-mega',
  'camerupt-mega',
  'altaria-mega',
  'banette-mega',
  'absol-mega',
  'glalie-mega',
  'salamence-mega',
  'metagross-mega',
  'latias-mega',
  'latios-mega',
  'rayquaza-mega',
  'lopunny-mega',
  'lucario-mega',
  'abomasnow-mega',
  'gallade-mega',
  'audino-mega',
  'diancie-mega'
];

function fetchPokemonData(formName) {
  return new Promise((resolve, reject) => {
    const url = `https://pokeapi.co/api/v2/pokemon-form/${formName}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // The 'pokemon' field contains the pokemon data
          const pokemonUrl = json.pokemon.url;
          // Extract the ID from the URL (e.g., https://pokeapi.co/api/v2/pokemon/6/ -> 6)
          const pokemonId = pokemonUrl.split('/').filter(x => x).pop();
          resolve({ form: formName, pokemonId: pokemonId });
        } catch (e) {
          reject(new Error(`Failed to parse JSON for ${formName}: ${e.message}`));
        }
      });
    }).on('error', (err) => {
      reject(new Error(`Failed to fetch ${formName}: ${err.message}`));
    });
  });
}

async function main() {
  console.log('Fetching Pokemon IDs for Mega Evolutions...\n');
  
  const results = [];
  
  for (const form of forms) {
    try {
      const result = await fetchPokemonData(form);
      results.push(result);
      console.log(`${result.form}: ${result.pokemonId}`);
    } catch (error) {
      console.error(`Error for ${form}: ${error.message}`);
    }
  }
  
  console.log('\n=== Summary ===\n');
  results.forEach(r => {
    console.log(`${r.form}: ${r.pokemonId}`);
  });
}

main();
