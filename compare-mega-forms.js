const existingForms = [
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

const apiForms = [
  'meganium', 'yanmega', 'venusaur-mega', 'charizard-mega-x', 'charizard-mega-y',
  'blastoise-mega', 'alakazam-mega', 'gengar-mega', 'kangaskhan-mega', 'pinsir-mega',
  'gyarados-mega', 'aerodactyl-mega', 'mewtwo-mega-x', 'mewtwo-mega-y', 'ampharos-mega',
  'scizor-mega', 'heracross-mega', 'houndoom-mega', 'tyranitar-mega', 'blaziken-mega',
  'gardevoir-mega', 'mawile-mega', 'aggron-mega', 'medicham-mega', 'manectric-mega',
  'banette-mega', 'absol-mega', 'garchomp-mega', 'lucario-mega', 'abomasnow-mega',
  'latias-mega', 'latios-mega', 'swampert-mega', 'sceptile-mega', 'sableye-mega',
  'altaria-mega', 'gallade-mega', 'audino-mega', 'sharpedo-mega', 'slowbro-mega',
  'steelix-mega', 'pidgeot-mega', 'glalie-mega', 'diancie-mega', 'metagross-mega',
  'rayquaza-mega', 'camerupt-mega', 'lopunny-mega', 'salamence-mega', 'beedrill-mega',
  'clefable-mega', 'victreebel-mega', 'starmie-mega', 'dragonite-mega', 'meganium-mega',
  'feraligatr-mega', 'skarmory-mega', 'froslass-mega', 'emboar-mega', 'excadrill-mega',
  'scolipede-mega', 'scrafty-mega', 'eelektross-mega', 'chandelure-mega', 'chesnaught-mega',
  'delphox-mega', 'greninja-mega', 'pyroar-mega', 'floette-mega', 'malamar-mega',
  'barbaracle-mega', 'dragalge-mega', 'hawlucha-mega', 'zygarde-mega', 'drampa-mega',
  'falinks-mega', 'raichu-mega-x', 'raichu-mega-y', 'chimecho-mega', 'absol-mega-z',
  'staraptor-mega', 'garchomp-mega-z', 'lucario-mega-z', 'heatran-mega', 'darkrai-mega',
  'golurk-mega', 'meowstic-male-mega', 'crabominable-mega', 'golisopod-mega', 'magearna-mega',
  'magearna-original-mega', 'zeraora-mega', 'scovillain-mega', 'glimmora-mega', 'tatsugiri-curly-mega',
  'tatsugiri-droopy-mega', 'tatsugiri-stretchy-mega', 'baxcalibur-mega', 'meowstic-female-mega'
];

console.log('=== ANALIZA MEGA FORM ===\n');
console.log('[1] Twoja obecna lista: ' + existingForms.length + ' form');
console.log('[2] API z mega w nazwie: ' + apiForms.length + ' form\n');

// Formy NIE będące Mega Evolution (to zwykłe Pokémony)
const notMega = ['meganium', 'yanmega'];
const trueMegaFromApi = apiForms.filter(f => !notMega.includes(f));

console.log('[3] Prawidłowe Mega formy (bez meganium/yanmega): ' + trueMegaFromApi.length + ' form\n');

// Brakujące
const existing = new Set(existingForms);
const missing = trueMegaFromApi.filter(f => !existing.has(f));

console.log('=== BRAKUJACE MEGA FORMY (' + missing.length + ') ===\n');
missing.forEach(f => {
  console.log('- ' + f);
});

console.log('\n=== NOWA KOMPLETNA LISTA DLA fetch-mega-ids.js ===\n');
console.log('const forms = [');
trueMegaFromApi.sort().forEach((f, i) => {
  const comma = i < trueMegaFromApi.length - 1 ? ',' : '';
  console.log('  \'' + f + '\'' + comma);
});
console.log('];');
