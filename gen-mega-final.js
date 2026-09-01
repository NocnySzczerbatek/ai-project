const https = require('https');
const fs = require('fs');

// Read CSV file
const csvData = fs.readFileSync('./ALL_MEGA_FORMS.csv', 'utf8');
const lines = csvData.trim().split('\n').slice(1); // Skip header

// Parse CSV
const megaForms = [];
const seen = new Set();

lines.forEach(line => {
  const parts = line.split(',');
  const megaFormName = parts[0];
  const pokemonId = parseInt(parts[1]);
  
  // Skip duplicates and Z-move variants
  const key = `${pokemonId}`;
  if (seen.has(key)) return;
  seen.add(key);
  
  // Extract base name from mega form name
  let baseName = megaFormName
    .replace('-mega', '')
    .replace('-x', '')
    .replace('-y', '')
    .replace('-z', '')
    .replace('-male', '')
    .replace('-female', '')
    .replace('-original', '')
    .replace('-curly', '')
    .replace('-droopy', '')
    .replace('-stretchy', '');
  
  if (!baseName) return;
  
  megaForms.push({ megaFormName, pokemonId, baseName });
});

// Fetch Pokemon data from API
function fetchPokemon(pokemonId) {
  return new Promise((resolve, reject) => {
    https.get(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`, (res) => {
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

async function generateData() {
  console.log(`Processing ${megaForms.length} unique Mega forms...\n`);
  
  const dataArray = [];
  
  for (let i = 0; i < megaForms.length; i++) {
    const {megaFormName, pokemonId, baseName} = megaForms[i];
    
    try {
      // Fetch Mega form Pokemon data
      const megaData = await fetchPokemon(pokemonId);
      const megaTypes = megaData.types.map(t => t.type.name);
      const megaAbility = megaData.abilities[0]?.ability.name || megaData.abilities[1]?.ability.name || 'unknown';
      const megaBST = megaData.stats.reduce((sum, s) => sum + s.base_stat, 0);
      
      // Get base Pokemon ID for artwork (most forms use next ID)
      const basePokemonId = megaData.id;
      let basePokemonName = baseName;
      
      // Map custom names where needed
      const nameMap = {
        'charizard': 'charizard',
        'mewtwo': 'mewtwo',
        'raichu': 'raichu',
        'meowstic': 'meowstic'
      };
      
      if (nameMap[baseName]) {
        basePokemonName = nameMap[baseName];
      }
      
      // Generate Mega name
      let megaName = `Mega ${basePokemonName.charAt(0).toUpperCase() + basePokemonName.slice(1)}`;
      if (megaFormName.includes('-x')) megaName += ' X';
      if (megaFormName.includes('-y')) megaName += ' Y';
      if (megaFormName.includes('-original')) megaName += ' (Original)';
      if (megaFormName.includes('-male')) megaName += ' (Male)';
      if (megaFormName.includes('-female')) megaName += ' (Female)';
      
      // Mega stone mapping
      const stoneMap = {
        3: 'Venusaurite', 6: 'Charizardite', 9: 'Blastoisinite', 15: 'Beedrillite',
        18: 'Pidgeotite', 65: 'Alakazite', 80: 'Slowbronite', 94: 'Gengarite',
        115: 'Kangaskhanite', 127: 'Pinsirite', 130: 'Gyaradosite', 142: 'Aerodactylite',
        150: 'Mewtwonite', 181: 'Ampharosite', 208: 'Steelixite', 212: 'Scizorite',
        214: 'Heracronite', 228: 'Houndoominite', 248: 'Tyranitarite', 254: 'Sceptilite',
        257: 'Blazikenite', 260: 'Swampertite', 282: 'Gardevoirite', 302: 'Sableyite',
        303: 'Mawilite', 306: 'Aggronite', 308: 'Medichamite', 310: 'Manectite',
        319: 'Sharpedonite', 323: 'Cameruptite', 334: 'Altarianite', 354: 'Banettite',
        359: 'Absolite', 362: 'Glalitite', 373: 'Salamencite', 376: 'Metagrossite',
        380: 'Latiasite', 381: 'Latiosite', 384: 'Dragon Ascent', 428: 'Lopunnite',
        448: 'Lucarionite', 460: 'Abomasite', 475: 'Galladite', 531: 'Audinite', 719: 'Diancite',
        658: 'Battle Bond'
      };
      
      const stone = stoneMap[basePokemonId] || `${megaName} Stone`;
      const sdnSlug = basePokemonName.toLowerCase() + 'mega' +
        (megaFormName.includes('-x') ? 'x' : megaFormName.includes('-y') ? 'y' : '');
      
      dataArray.push({
        id: basePokemonId,
        name: basePokemonName,
        megaName: megaName,
        types: megaTypes,
        ability: megaAbility,
        bst: megaBST,
        stone: stone,
        sdn: sdnSlug,
        fid: pokemonId
      });
      
      console.log(`✓ ${i + 1}/${megaForms.length} ${megaName} (${basePokemonId} -> ${pokemonId})`);
      await new Promise(r => setTimeout(r, 50));
      
    } catch (error) {
      console.error(`✗ Error with ${megaFormName} (${pokemonId}):`, error.message);
    }
  }
  
  // Generate JavaScript
  const jsLines = dataArray.map((e, idx) => {
    let line = `  {id:${e.id},name:'${e.name}',megaName:'${e.megaName}',types:['${e.types.join("','")}'],ability:'${e.ability}',bst:${e.bst},stone:'${e.stone}',sdn:'${e.sdn}',fid:${e.fid}}`;
    if (idx < dataArray.length - 1) line += ',';
    return line;
  });
  
  const result = `var MEGA_EVO_DATA = [\n${jsLines.join('\n')}\n];\n`;
  fs.writeFileSync('./MEGA_EVO_DATA_COMPLETE.js', result);
  
  console.log(`\n✅ Generated MEGA_EVO_DATA_COMPLETE.js with ${dataArray.length} entries`);
}

generateData().catch(console.error);
