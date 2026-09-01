const https = require('https');

const forms = [
  'abomasnow-mega',
  'absol-mega',
  'absol-mega-z',
  'aerodactyl-mega',
  'aggron-mega',
  'alakazam-mega',
  'altaria-mega',
  'ampharos-mega',
  'audino-mega',
  'banette-mega',
  'barbaracle-mega',
  'baxcalibur-mega',
  'beedrill-mega',
  'blastoise-mega',
  'blaziken-mega',
  'camerupt-mega',
  'chandelure-mega',
  'charizard-mega-x',
  'charizard-mega-y',
  'chesnaught-mega',
  'chimecho-mega',
  'clefable-mega',
  'crabominable-mega',
  'darkrai-mega',
  'delphox-mega',
  'diancie-mega',
  'dragalge-mega',
  'dragonite-mega',
  'drampa-mega',
  'eelektross-mega',
  'emboar-mega',
  'excadrill-mega',
  'falinks-mega',
  'feraligatr-mega',
  'floette-mega',
  'froslass-mega',
  'gallade-mega',
  'garchomp-mega',
  'garchomp-mega-z',
  'gardevoir-mega',
  'gengar-mega',
  'glalie-mega',
  'glimmora-mega',
  'golisopod-mega',
  'golurk-mega',
  'greninja-mega',
  'gyarados-mega',
  'hawlucha-mega',
  'heatran-mega',
  'heracross-mega',
  'houndoom-mega',
  'kangaskhan-mega',
  'latias-mega',
  'latios-mega',
  'lopunny-mega',
  'lucario-mega',
  'lucario-mega-z',
  'magearna-mega',
  'magearna-original-mega',
  'malamar-mega',
  'manectric-mega',
  'mawile-mega',
  'medicham-mega',
  'meganium-mega',
  'meowstic-female-mega',
  'meowstic-male-mega',
  'metagross-mega',
  'mewtwo-mega-x',
  'mewtwo-mega-y',
  'pidgeot-mega',
  'pinsir-mega',
  'pyroar-mega',
  'raichu-mega-x',
  'raichu-mega-y',
  'rayquaza-mega',
  'sableye-mega',
  'salamence-mega',
  'sceptile-mega',
  'scizor-mega',
  'scolipede-mega',
  'scovillain-mega',
  'scrafty-mega',
  'sharpedo-mega',
  'skarmory-mega',
  'slowbro-mega',
  'staraptor-mega',
  'starmie-mega',
  'steelix-mega',
  'swampert-mega',
  'tatsugiri-curly-mega',
  'tatsugiri-droopy-mega',
  'tatsugiri-stretchy-mega',
  'tyranitar-mega',
  'venusaur-mega',
  'victreebel-mega',
  'zeraora-mega',
  'zygarde-mega'
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
