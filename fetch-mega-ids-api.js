// Fetch Pokemon ID and data for all Mega Evolution forms from PokeAPI
const https = require('https');

const megaForms = [
  'abomasnow-mega', 'absol-mega', 'absol-mega-z', 'aerodactyl-mega', 'aggron-mega',
  'alakazam-mega', 'altaria-mega', 'ampharos-mega', 'audino-mega', 'banette-mega',
  'barbaracle-mega', 'baxcalibur-mega', 'beedrill-mega', 'blastoise-mega', 'blaziken-mega',
  'camerupt-mega', 'chandelure-mega', 'charizard-mega-x', 'charizard-mega-y', 'chesnaught-mega',
  'chimecho-mega', 'clefable-mega', 'crabominable-mega', 'darkrai-mega', 'delphox-mega',
  'diancie-mega', 'dragalge-mega', 'dragonite-mega', 'drampa-mega', 'eelektross-mega',
  'emboar-mega', 'excadrill-mega', 'falinks-mega', 'feraligatr-mega', 'floette-mega',
  'froslass-mega', 'gallade-mega', 'garchomp-mega', 'garchomp-mega-z', 'gardevoir-mega',
  'gengar-mega', 'glalie-mega', 'glimmora-mega', 'golisopod-mega', 'golurk-mega',
  'greninja-mega', 'gyarados-mega', 'hawlucha-mega', 'heatran-mega', 'heracross-mega',
  'houndoom-mega', 'kangaskhan-mega', 'latias-mega', 'latios-mega', 'lopunny-mega',
  'lucario-mega', 'lucario-mega-z', 'magearna-mega', 'magearna-original-mega', 'malamar-mega',
  'manectric-mega', 'mawile-mega', 'medicham-mega', 'meganium-mega', 'meowstic-female-mega',
  'meowstic-male-mega', 'metagross-mega', 'mewtwo-mega-x', 'mewtwo-mega-y', 'pidgeot-mega',
  'pinsir-mega', 'pyroar-mega', 'raichu-mega-x', 'raichu-mega-y', 'rayquaza-mega',
  'sableye-mega', 'salamence-mega', 'sceptile-mega', 'scizor-mega', 'scolipede-mega',
  'scovillain-mega', 'scrafty-mega', 'sharpedo-mega', 'skarmory-mega', 'slowbro-mega',
  'staraptor-mega', 'starmie-mega', 'steelix-mega', 'swampert-mega', 'tatsugiri-curly-mega',
  'tatsugiri-droopy-mega', 'tatsugiri-stretchy-mega', 'tyranitar-mega', 'venusaur-mega',
  'victreebel-mega', 'zeraora-mega', 'zygarde-mega'
];

function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getMegaEvolutionData() {
  const results = [];
  const stoneNames = {
    'abomasnow': 'Abomasite',
    'absol': 'Absolite',
    'aerodactyl': 'Aerodactylite',
    'aggron': 'Aggronite',
    'alakazam': 'Alakazite',
    'altaria': 'Altarianite',
    'ampharos': 'Amphorosite',
    'audino': 'Audinite',
    'banette': 'Banettite',
    'barbaracle': 'Barbaracleite',
    'baxcalibur': 'Baxcalibur Mega Stone',
    'beedrill': 'Beedrillite',
    'blastoise': 'Blastoisinite',
    'blaziken': 'Blazikenite',
    'camerupt': 'Cameruptite',
    'chandelure': 'Chandelureit',
    'charizard': 'Charizardite',
    'chesnaught': 'Chesnaught Mega Stone',
    'chimecho': 'Chimecho Mega Stone',
    'clefable': 'Clefablite',
    'crabominable': 'Crabominable Mega Stone',
    'darkrai': 'Darkrai Mega Stone',
    'delphox': 'Delphox Mega Stone',
    'diancie': 'Diancie Mega Stone',
    'dragalge': 'Dragalgeite',
    'dragonite': 'Dragonitite',
    'drampa': 'Drampa Mega Stone',
    'eelektross': 'Eelektross Mega Stone',
    'emboar': 'Emboar Mega Stone',
    'excadrill': 'Excadrillite',
    'falinks': 'Falinks Mega Stone',
    'feraligatr': 'Feraligatrite',
    'floette': 'Floettite',
    'froslass': 'Froslass Mega Stone',
    'gallade': 'Galladite',
    'garchomp': 'Garchompite',
    'gardevoir': 'Gardevoirite',
    'gengar': 'Gengarite',
    'glalie': 'Glalitite',
    'glimmora': 'Glimmora Mega Stone',
    'golisopod': 'Golisopod Mega Stone',
    'golurk': 'Golurk Mega Stone',
    'greninja': 'Greninjite',
    'gyarados': 'Gyaradosite',
    'hawlucha': 'Hawlucha Mega Stone',
    'heatran': 'Heatran Mega Stone',
    'heracross': 'Heracronite',
    'houndoom': 'Houndoominite',
    'kangaskhan': 'Kangaskhanite',
    'latias': 'Latiasite',
    'latios': 'Latiosite',
    'lopunny': 'Lopunnite',
    'lucario': 'Lucarionite',
    'magearna': 'Magearna Mega Stone',
    'malamar': 'Malamar Mega Stone',
    'manectric': 'Manectite',
    'mawile': 'Mawilite',
    'medicham': 'Medichamite',
    'meganium': 'Meganium Mega Stone',
    'meowstic': 'Meowstic Mega Stone',
    'metagross': 'Metagrossite',
    'mewtwo': 'Mewtwonite',
    'pidgeot': 'Pidgeotite',
    'pinsir': 'Pinsirite',
    'pyroar': 'Pyroar Mega Stone',
    'raichu': 'Raichu Mega Stone',
    'rayquaza': 'Rayquaza Mega Stone',
    'sableye': 'Sablenite',
    'salamence': 'Salamencite',
    'sceptile': 'Sceptilite',
    'scizor': 'Scizorite',
    'scolipede': 'Scolipede Mega Stone',
    'scovillain': 'Scovillain Mega Stone',
    'scrafty': 'Scrafty Mega Stone',
    'sharpedo': 'Sharpedonite',
    'skarmory': 'Skarmory Mega Stone',
    'slowbro': 'Slowbronite',
    'staraptor': 'Staraptor Mega Stone',
    'starmie': 'Starmie Mega Stone',
    'steelix': 'Steelixite',
    'swampert': 'Swampertite',
    'tatsugiri': 'Tatsugiri Mega Stone',
    'tyranitar': 'Tyranitarite',
    'venusaur': 'Venusaurite',
    'victreebel': 'Victreebel Mega Stone',
    'zeraora': 'Zeraora Mega Stone',
    'zygarde': 'Zygarde Mega Stone'
  };

  console.log(`Fetching data for ${megaForms.length} Mega Evolution forms...`);

  for (let i = 0; i < megaForms.length; i++) {
    const formName = megaForms[i];
    try {
      // Fetch form data from PokeAPI
      const formUrl = `https://pokeapi.co/api/v2/pokemon-form/${formName}`;
      const formData = await fetchAPI(formUrl);
      
      // Get pokemon ID from the pokemon field
      const pokemonId = formData.pokemon.url.split('/').slice(-2, -1)[0];
      
      // Get base pokemon name
      const basePokemonName = formData.pokemon.name;
      
      // Get types from the form
      const types = formData.types.map(t => t.type.name);
      
      // Get abilities
      let ability = '';
      if (formData.abilities && formData.abilities.length > 0) {
        ability = formData.abilities[0].ability.name;
      }
      
      // Fetch pokemon species data for BST
      const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
      const pokemonData = await fetchAPI(pokemonUrl);
      
      const bst = pokemonData.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
      ability = ability || pokemonData.abilities[0].ability.name;
      
      // Generate megaName from form name
      const megaName = formName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Get stone name
      const baseName = basePokemonName.replace('-mega', '').replace('-original', '').split('-')[0];
      const stone = stoneNames[baseName] || `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}ite`;
      
      results.push({
        id: pokemonId,
        name: basePokemonName,
        megaName: megaName,
        types: types,
        ability: ability,
        bst: bst,
        stone: stone,
        sdn: formName,
        fid: pokemonId
      });
      
      console.log(`✓ ${i + 1}/${megaForms.length} - ${formName} (ID: ${pokemonId})`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`✗ Error fetching ${formName}:`, error.message);
    }
  }
  
  return results;
}

async function main() {
  try {
    const data = await getMegaEvolutionData();
    
    console.log('\n\n// Ready to paste into data.js - MEGA_EVO_DATA array:\n');
    
    // Generate JavaScript code
    console.log('const MEGA_EVO_DATA = [');
    data.forEach((item, index) => {
      const types = `['${item.types.join("', '")}']`;
      console.log(`  {id:${item.id}, name:'${item.name}', megaName:'${item.megaName}', types:${types}, ability:'${item.ability}', bst:${item.bst}, stone:'${item.stone}', sdn:'${item.sdn}', fid:${item.fid}}${index < data.length - 1 ? ',' : ''}`);
    });
    console.log('];');
    
    console.log(`\n\n// Total: ${data.length} Mega Evolution forms processed`);
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

main();
