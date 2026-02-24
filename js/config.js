/* ================================================================
   config.js — Stałe konfiguracyjne aplikacji
   ================================================================ */

// Wersja cache — używana do invalidacji localStorage
var COB_VERSION = '2.1';

// Rozmiar strony listy Pokémonów (lazy loading)
var PAGE_SIZE = 80;

// Klucze localStorage
var FAVORITES_KEY = 'cob_favorites';
var TEAM_KEY = 'cob_team';

// Zakresy numerów Pokémonów dla każdej generacji
var GEN_RANGES = [
  null,
  [1,151],[152,251],[252,386],[387,493],
  [494,649],[650,721],[722,809],[810,905],[906,1025]
];

// Kolory statystyk bazowych
var STAT_COLORS = {
  hp:'#ff5555', attack:'#f08030', defense:'#f8d030',
  'special-attack':'#6890f0', 'special-defense':'#78c850', speed:'#f85888'
};

// Nazwy statystyk (skrócone)
var STAT_NAMES = {
  hp:'HP', attack:'ATK', defense:'DEF',
  'special-attack':'SP.ATK', 'special-defense':'SP.DEF', speed:'SPD'
};

// Pokémony ewoluujące przez przyjaźń
var FRIENDSHIP_EVOS = new Set([
  'pichu','cleffa','igglybuff','togepi','chansey','golbat','eevee',
  'azurill','budew','buneary','riolu','happiny','munchlax','chingling',
  'woobat','swadloon'
]);

// Szczegóły ewolucji przez przyjaźń
const FRIENDSHIP_DETAIL = {
  'pichu':'Pichu → Pikachu (wysoka przyjaźń)',
  'cleffa':'Cleffa → Clefairy (wysoka przyjaźń)',
  'igglybuff':'Igglybuff → Jigglypuff (wysoka przyjaźń)',
  'togepi':'Togepi → Togetic (wysoka przyjaźń)',
  'chansey':'Chansey → Blissey (wysoka przyjaźń)',
  'golbat':'Golbat → Crobat (wysoka przyjaźń)',
  'eevee':'Eevee → Espeon (dzień + przyjaźń) / Umbreon (noc + przyjaźń)',
  'azurill':'Azurill → Marill (wysoka przyjaźń)',
  'budew':'Budew → Roselia (wysoka przyjaźń, dzień)',
  'buneary':'Buneary → Lopunny (wysoka przyjaźń)',
  'riolu':'Riolu → Lucario (wysoka przyjaźń, dzień)',
  'happiny':'Happiny → Chansey (niesiony Okrągły Kamień + przyjaźń)',
  'munchlax':'Munchlax → Snorlax (wysoka przyjaźń)',
  'chingling':'Chingling → Chimecho (wysoka przyjaźń, noc)',
  'woobat':'Woobat → Swoobat (wysoka przyjaźń)',
  'swadloon':'Swadloon → Leavanny (wysoka przyjaźń)',
};

// Ewolucje przez Link Cable (wymianę)
const LINK_CABLE_EVOS = {
  'kadabra':   { result:'Alakazam', item:null },
  'machoke':   { result:'Machamp', item:null },
  'graveler':  { result:'Golem', item:null },
  'haunter':   { result:'Gengar', item:null },
  'onix':      { result:'Steelix', item:'Metal Coat' },
  'scyther':   { result:'Scizor', item:'Metal Coat' },
  'seadra':    { result:'Kingdra', item:'Dragon Scale' },
  'slowpoke':  { result:'Slowking', item:"King's Rock" },
  'poliwhirl': { result:'Politoed', item:"King's Rock" },
  'porygon':   { result:'Porygon2', item:'Up-Grade' },
  'porygon2':  { result:'Porygon-Z', item:'Dubious Disc' },
  'clamperl':  { result:'Huntail / Gorebyss', item:'Deep Sea Tooth / Deep Sea Scale' },
  'boldore':   { result:'Gigalith', item:null },
  'gurdurr':   { result:'Conkeldurr', item:null },
  'phantump':  { result:'Trevenant', item:null },
  'pumpkaboo': { result:'Gourgeist', item:null },
  'spritzee':  { result:'Aromatisse', item:'Sachet' },
  'swirlix':   { result:'Slurpuff', item:'Whipped Dream' },
  'karrablast':{ result:'Escavalier', item:null },
  'shelmet':   { result:'Accelgor', item:null },
  'rhydon':    { result:'Rhyperior', item:'Protector' },
  'electabuzz':{ result:'Electivire', item:'Electirizer' },
  'magmar':    { result:'Magmortar', item:'Magmarizer' },
  'dusclops':  { result:'Dusknoir', item:'Reaper Cloth' },
  'feebas':    { result:'Milotic', item:'Prism Scale' },
};
