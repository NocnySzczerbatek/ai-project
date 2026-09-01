const https = require('https');
const fs = require('fs');

const megaFormsData = `abomasnow,460,10060
absol,359,10057
aerodactyl,142,10042
aggron,306,10053
alakazam,65,10037
altaria,334,10067
ampharos,181,10045
audino,531,10069
banette,354,10056
barbaracle,689,10298
baxcalibur,908,10325
beedrill,15,10090
blastoise,9,10036
blaziken,257,10050
camerupt,323,10087
chandelure,609,10291
charizard,6,10034
charizard,6,10035
chesnaught,652,10292
chimecho,358,10306
clefable,35,10278
crabominable,740,10315
darkrai,491,10312
delphox,653,10293
diancie,719,10075
dragalge,691,10299
dragonite,149,10281
drampa,776,10302
eelektross,644,10290
emboar,500,10286
excadrill,530,10287
falinks,876,10303
feraligatr,160,10283
floette,670,10296
froslass,478,10285
gallade,475,10068
garchomp,445,10058
gardevoir,282,10051
gengar,94,10038
glalie,362,10074
glimmora,868,10321
golisopod,768,10316
golurk,623,10313
greninja,658,10294
gyarados,130,10041
hawlucha,701,10300
heatran,485,10311
heracross,214,10047
houndoom,228,10048
kangaskhan,115,10039
latias,380,10062
latios,381,10063
lopunny,428,10088
lucario,448,10059
magearna,801,10317
malamar,687,10297
manectric,310,10055
mawile,303,10052
medicham,308,10054
meganium,154,10282
meowstic,676,10314
meowstic,676,10326
metagross,376,10076
mewtwo,150,10043
mewtwo,150,10044
pidgeot,18,10073
pinsir,127,10040
pyroar,667,10295
raichu,26,10304
raichu,26,10305
rayquaza,384,10079
sableye,302,10066
salamence,373,10089
sceptile,254,10065
scizor,212,10046
scolipede,545,10288
scovillain,843,10320
scrafty,560,10289
sharpedo,319,10070
skarmory,227,10284
slowbro,80,10071
staraptor,398,10308
starmie,121,10280
steelix,208,10072
swampert,260,10064
tyranitar,248,10049
venusaur,3,10033
victreebel,71,10279
zeraora,807,10319
zygarde,718,10301`;

function fetchPokemon(pokemonId) {
  return new Promise((resolve, reject) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonId}`;
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

async function generateMegaData() {
  console.log('Pobieranie danych z PokeAPI...\n');
  
  const lines = megaFormsData.trim().split('\n');
  const processed = new Map();
  
  for (const line of lines) {
    const [baseName, basePokemonIdStr, megaPokemonIdStr] = line.split(',').map(x => x.trim());
    const basePokemonId = parseInt(basePokemonIdStr);
    const megaPokemonId = parseInt(megaPokemonIdStr);
    
    if (!processed.has(basePokemonId)) {
      processed.set(basePokemonId, []);
    }
    processed.get(basePokemonId).push({ baseName, megaPokemonId });
  }
  
  const megaEvoArray = [];
  let count = 0;
  
  for (const [basePokemonId, forms] of processed.entries()) {
    try {
      const basePokemonData = await fetchPokemon(basePokemonId);
      const basePokemonName = basePokemonData.name;
      
      for (const form of forms) {
        const megaPokemonData = await fetchPokemon(form.megaPokemonId);
        const megaTypes = megaPokemonData.types.map(t => t.type.name);
        const megaAbility = megaPokemonData.abilities[0]?.ability.name || 'unknown';
        const megaBST = megaPokemonData.stats.reduce((sum, s) => sum + s.base_stat, 0);
        
        let megaName = `Mega ${basePokemonName.charAt(0).toUpperCase() + basePokemonName.slice(1)}`;
        if (form.baseName.includes('-x')) megaName += ' X';
        if (form.baseName.includes('-y')) megaName += ' Y';
        
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
          448: 'Lucarionite', 460: 'Abomasite', 475: 'Galladite', 531: 'Audinite',
          719: 'Diancite', 658: 'Battle Bond'
        };
        
        const stone = stoneMap[basePokemonId] || `${megaName} Stone`;
        const sdnSlug = basePokemonName.toLowerCase() + 'mega' + (form.baseName.includes('-x') ? 'x' : form.baseName.includes('-y') ? 'y' : '');
        
        megaEvoArray.push({
          id: basePokemonId,
          name: basePokemonName,
          megaName: megaName,
          types: megaTypes,
          ability: megaAbility,
          bst: megaBST,
          stone: stone,
          sdn: sdnSlug,
          fid: form.megaPokemonId
        });
        
        count++;
        console.log(`✓ ${count}. ${megaName} (ID: ${basePokemonId} -> ${form.megaPokemonId})`);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error(`✗ Error with Pokemon ${basePokemonId}:`, error.message);
    }
  }
  
  const jsCode = megaEvoArray.map((entry, idx) => {
    let line = `  {id:${entry.id},name:'${entry.name}',megaName:'${entry.megaName}',types:['${entry.types.join("','")}'],ability:'${entry.ability}',bst:${entry.bst},stone:'${entry.stone}',sdn:'${entry.sdn}',fid:${entry.fid}}`;
    if (idx < megaEvoArray.length - 1) line += ',';
    return line;
  }).join('\n');
  
  const result = `var MEGA_EVO_DATA = [\n${jsCode}\n];\n`;
  
  fs.writeFileSync('./MEGA_EVO_DATA_NEW.js', result);
  console.log(`\n✓ Wygenerowano MEGA_EVO_DATA_NEW.js z ${megaEvoArray.length} formami`);
}

generateMegaData().catch(console.error);
