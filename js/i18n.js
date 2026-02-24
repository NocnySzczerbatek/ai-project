/* ================================================================
   i18n.js — System wielojęzyczności (PL/EN)
   ================================================================ */

// Aktualny język — domyślnie PL
let currentLang = localStorage.getItem('cob_lang') || 'pl';

/* ── Nazwy natur po polsku ── */
var NATURE_NAMES_PL = {
  'Hardy':'Twarda','Lonely':'Samotna','Brave':'Odważna','Adamant':'Zdecydowana','Naughty':'Psotna',
  'Bold':'Zuchwała','Docile':'Uległa','Relaxed':'Spokojna','Impish':'Przekorna','Lax':'Lekkomyślna',
  'Timid':'Nieśmiała','Hasty':'Pospiesszna','Serious':'Poważna','Jolly':'Wesoła','Naive':'Naiwna',
  'Modest':'Skromna','Mild':'Łagodna','Quiet':'Cicha','Bashful':'Wstydliwa','Rash':'Porywcza',
  'Calm':'Spokojna','Gentle':'Delikatna','Sassy':'Zuchwała','Careful':'Ostrożna','Quirky':'Dziwaczna'
};

function natureName(enName) {
  if (currentLang === 'pl' && NATURE_NAMES_PL[enName]) return NATURE_NAMES_PL[enName];
  return enName;
}

/* ── Nazwy przedmiotów po polsku ── */
var ITEM_NAMES_PL = {
  'Choice Band':'Wstęga Wyboru','Choice Specs':'Okulary Wyboru','Choice Scarf':'Szalik Wyboru',
  'Life Orb':'Sfera Życia','Leftovers':'Resztki','Focus Sash':'Szarfa Skupienia',
  'Assault Vest':'Kamizelka Szturmowa','Rocky Helmet':'Skalny Hełm','Eviolite':'Eviolit',
  'Ability Shield':'Tarcza Umiejętności','Sitrus Berry':'Jagoda Sitrus','Lum Berry':'Jagoda Lum',
  'Metal Coat':'Metalowa Powłoka','Dragon Scale':'Smocza Łuska',"King's Rock":'Skała Króla',
  'Soothe Bell':'Dzwonek Łagodności',
  'Expert Belt':'Pas Eksperta','Weakness Policy':'Polityka Słabości',
  'Light Clay':'Lekka Glina','Heavy-Duty Boots':'Ciężkie Buty',
  'Toxic Orb':'Toksyczna Sfera','Flame Orb':'Płomienna Sfera',
  'Air Balloon':'Balonik','Safety Goggles':'Okulary Ochronne',
  'Mental Herb':'Zioło Psycho','Red Card':'Czerwona Kartka',
  'Scope Lens':'Luneta','White Herb':'Białe Zioło',
  'Loaded Dice':'Obciążone Kości','Throat Spray':'Spray do Gardła',
  'Protective Pads':'Ochraniacze','Covert Cloak':'Maskujący Płaszcz',
  'Black Sludge':'Czarny Szlam'
};

function itemName(enName) {
  if (currentLang === 'pl' && ITEM_NAMES_PL[enName]) return ITEM_NAMES_PL[enName];
  return enName;
}

/* ── Baza danych przedmiotów kompetytywnych ── */
var COMP_ITEM_DB = {
  'Choice Band':      {slug:'choice-band',      desc:{pl:'Atak \u00d71.5 \u2014 tylko jeden ruch',en:'Atk \u00d71.5 \u2014 one move only'}},
  'Choice Specs':     {slug:'choice-specs',      desc:{pl:'Sp.Atak \u00d71.5 \u2014 tylko jeden ruch',en:'SpAtk \u00d71.5 \u2014 one move only'}},
  'Choice Scarf':     {slug:'choice-scarf',      desc:{pl:'Szybko\u015b\u0107 \u00d71.5 \u2014 tylko jeden ruch',en:'Speed \u00d71.5 \u2014 one move only'}},
  'Life Orb':         {slug:'life-orb',          desc:{pl:'+30% obra\u017ce\u0144, -10% P\u017b za atak',en:'+30% damage, -10% HP per attack'}},
  'Leftovers':        {slug:'leftovers',         desc:{pl:'Regeneruje 1/16 P\u017b co tur\u0119',en:'Restores 1/16 HP per turn'}},
  'Focus Sash':       {slug:'focus-sash',        desc:{pl:'Przetrwa jeden cios z pe\u0142nego P\u017b',en:'Survives one hit at full HP'}},
  'Assault Vest':     {slug:'assault-vest',      desc:{pl:'Sp.Obr \u00d71.5 \u2014 tylko ataki',en:'SpDef \u00d71.5 \u2014 attacks only'}},
  'Rocky Helmet':     {slug:'rocky-helmet',      desc:{pl:'Zadaje 1/6 P\u017b przy kontakcie',en:'Deals 1/6 HP on contact'}},
  'Eviolite':         {slug:'eviolite',          desc:{pl:'Obr i Sp.Obr \u00d71.5 (niewyewol.)',en:'Def & SpDef \u00d71.5 (NFE)'}},
  'Expert Belt':      {slug:'expert-belt',       desc:{pl:'+20% do super-skutecznych',en:'+20% to super-effective moves'}},
  'Weakness Policy':  {slug:'weakness-policy',   desc:{pl:'+2 Atk/SpAtk po super-skut. ciosie',en:'+2 Atk/SpAtk after SE hit'}},
  'Light Clay':       {slug:'light-clay',        desc:{pl:'Reflect/L.Screen na 8 tur',en:'Reflect/L.Screen for 8 turns'}},
  'Heavy-Duty Boots': {slug:'heavy-duty-boots',  desc:{pl:'Ignoruje pu\u0142apki wej\u015bcia',en:'Ignores entry hazards'}},
  'Toxic Orb':        {slug:'toxic-orb',         desc:{pl:'Zatruwa po 1 turze (Guts)',en:'Poisons after 1 turn (Guts combo)'}},
  'Flame Orb':        {slug:'flame-orb',         desc:{pl:'Podpala po 1 turze (Guts)',en:'Burns after 1 turn (Guts combo)'}},
  'Black Sludge':     {slug:'black-sludge',      desc:{pl:'1/16 P\u017b/tur\u0119 (typy Poison)',en:'1/16 HP/turn (Poison types)'}},
  'Air Balloon':      {slug:'air-balloon',       desc:{pl:'Immunitet na Ziemi\u0119 (do trafienia)',en:'Ground immunity (until hit)'}},
  'Safety Goggles':   {slug:'safety-goggles',    desc:{pl:'Odporno\u015b\u0107 na pogod\u0119 i proszki',en:'Weather/powder immunity'}},
  'Sitrus Berry':     {slug:'sitrus-berry',      desc:{pl:'+25% P\u017b poni\u017cej 50%',en:'+25% HP below 50%'}},
  'Lum Berry':        {slug:'lum-berry',         desc:{pl:'Leczy status jednorazowo',en:'Cures status once'}},
  'Mental Herb':      {slug:'mental-herb',       desc:{pl:'Blokuje Taunt/Encore raz',en:'Blocks Taunt/Encore once'}},
  'Red Card':         {slug:'red-card',          desc:{pl:'Wymusza zmian\u0119 po trafieniu',en:'Forces switch after hit'}},
  'Scope Lens':       {slug:'scope-lens',        desc:{pl:'+1 stopie\u0144 krytycznych',en:'+1 critical hit stage'}},
  'White Herb':       {slug:'white-herb',        desc:{pl:'Resetuje obni\u017cone staty raz',en:'Resets lowered stats once'}},
  'Loaded Dice':      {slug:'loaded-dice',       desc:{pl:'Multi-hit: 4-5 trafie\u0144',en:'Multi-hit: 4-5 hits'}},
  'Protective Pads':  {slug:'protective-pads',   desc:{pl:'Blokuje efekty kontaktowe',en:'Blocks contact effects'}},
  'Covert Cloak':     {slug:'covert-cloak',      desc:{pl:'Blokuje dodatkowe efekty atak\u00f3w',en:'Blocks additional effects'}},
  'Throat Spray':     {slug:'throat-spray',      desc:{pl:'+1 SpAtk po ruchu d\u017awi\u0119kowym',en:'+1 SpAtk after sound move'}}
};

function getCompItemDesc(itemEN) {
  var entry = COMP_ITEM_DB[itemEN];
  if (!entry) return '';
  return entry.desc[currentLang] || entry.desc.en || '';
}

function getCompItemSlug(itemEN) {
  var entry = COMP_ITEM_DB[itemEN];
  if (entry) return entry.slug;
  return itemEN.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}

/* ── Nazwy typów ── */
const TYPE_NAMES_PL = {
  normal:'Normalny',fire:'Ogie\u0144',water:'Woda',electric:'Elektryczny',grass:'Trawa',
  ice:'L\u00f3d',fighting:'Walka',poison:'Truc.',ground:'Ziemia',flying:'Lataj\u0105cy',
  psychic:'Psycho',bug:'Robak',rock:'Ska\u0142a',ghost:'Duch',dragon:'Smok',
  dark:'Mrok',steel:'Stal',fairy:'Bajkowy'
};

const TYPE_NAMES_EN = {
  normal:'Normal',fire:'Fire',water:'Water',electric:'Electric',grass:'Grass',
  ice:'Ice',fighting:'Fighting',poison:'Poison',ground:'Ground',flying:'Flying',
  psychic:'Psychic',bug:'Bug',rock:'Rock',ghost:'Ghost',dragon:'Dragon',
  dark:'Dark',steel:'Steel',fairy:'Fairy'
};

function typeName(n){return currentLang==='en'?(TYPE_NAMES_EN[n]||n):(TYPE_NAMES_PL[n]||n);}

/* ── Obiekt tłumaczeń ── */
const TR = {
  'nav.items':       {pl:'Przedmioty',en:'Items'},
  'nav.apricorns':   {pl:'Apricorny',en:'Apricorns'},
  'nav.start':       {pl:'Start',en:'Home'},
  'nav.team':        {pl:'Zesp\u00f3\u0142 PvP',en:'PvP Team'},
  'nav.search':      {pl:'SZUKAJ POK\u00c9MONA',en:'SEARCH POK\u00c9MON'},
  'nav.subtitle':    {pl:'Serwerowa Baza Cobblemon \u00b7 Minecraft Mod',en:'Cobblemon Server Database \u00b7 Minecraft Mod'},
  'nav.genBadge':    {pl:'Generacje 1\u20139',en:'Generations 1\u20139'},
  'stat.hp':{pl:'P\u017b',en:'HP'},'stat.atk':{pl:'ATAK',en:'ATK'},'stat.def':{pl:'OBR',en:'DEF'},
  'stat.spatk':{pl:'Sp.ATAK',en:'SpATK'},'stat.spdef':{pl:'Sp.OBR',en:'SpDEF'},'stat.spe':{pl:'SZYB',en:'SPE'},
  'sec.baseStats':   {pl:'Statystyki bazowe',en:'Base Stats'},
  'sec.iv':          {pl:'Individual Values (IV)',en:'Individual Values (IV)'},
  'sec.evo':         {pl:'\u0141a\u0144cuch ewolucji',en:'Evolution Chain'},
  'evo.level':       {pl:'Poz.',en:'Lvl'},
  'evo.trade':       {pl:'Link Cable',en:'Link Cable'},
  'evo.friendship':  {pl:'Przyja\u017a\u0144',en:'Friendship'},
  'evo.day':         {pl:'Dzie\u0144',en:'Day'},
  'evo.night':       {pl:'Noc',en:'Night'},
  'evo.rain':        {pl:'Deszcz',en:'Rain'},
  'evo.male':        {pl:'\u2642 Samiec',en:'\u2642 Male'},
  'evo.female':      {pl:'\u2640 Samica',en:'\u2640 Female'},
  'evo.atkGtDef':    {pl:'ATK > DEF',en:'ATK > DEF'},
  'evo.defGtAtk':    {pl:'DEF > ATK',en:'DEF > ATK'},
  'evo.atkEqDef':    {pl:'ATK = DEF',en:'ATK = DEF'},
  'evo.move':        {pl:'Zna atak:',en:'Knows move:'},
  'evo.moveType':    {pl:'Zna atak typu:',en:'Knows move type:'},
  'evo.held':        {pl:'Trzyma:',en:'Holds:'},
  'evo.stone':       {pl:'U\u017cyj:',en:'Use:'},
  'sec.moves':       {pl:'Pe\u0142na lista atak\u00f3w',en:'Full Move List'},
  'sec.comp':        {pl:'Competitive Build',en:'Competitive Build'},
  'sec.cobblemon':   {pl:'Polecane dla Cobblemon',en:'Cobblemon Recommendations'},
  'sec.biomes':      {pl:'Habitat / Biomy',en:'Habitat / Biomes'},
  'sec.calc':        {pl:'Oce\u0144 mojego Pok\u00e9mona',en:'Rate My Pok\u00e9mon'},
  'sec.items':       {pl:'Kluczowe Przedmioty Cobblemon',en:'Key Cobblemon Items'},
  'sec.apricorns':   {pl:'Apricorny i Pok\u00e9balle',en:'Apricorns & Pok\u00e9balls'},
  'sec.team':        {pl:'Analizator Zespo\u0142u PvP',en:'PvP Team Analyzer'},
  'sec.favorites':   {pl:'Twoje Ulubione Buildy',en:'Your Favorite Builds'},
  'sec.basicData':   {pl:'Dane podstawowe',en:'Basic Data'},
  'team.search':     {pl:'Wyszukaj Pok\u00e9mona...',en:'Search Pok\u00e9mon...'},
  'team.clear':      {pl:'Wyczy\u015b\u0107 Zesp\u00f3\u0142',en:'Clear Team'},
  'team.empty':      {pl:'Kliknij aby doda\u0107',en:'Click to add'},
  'team.weak':       {pl:'S\u0142abo\u015bci zespo\u0142u',en:'Team Weaknesses'},
  'team.resist':     {pl:'Odporno\u015bci zespo\u0142u',en:'Team Resistances'},
  'team.neutral':    {pl:'Neutralne',en:'Neutral'},
  'team.immune':     {pl:'Immunitety',en:'Immunities'},
  'team.desc':       {pl:'Dodaj do 6 Pok\u00e9mon\u00f3w i sprawd\u017a pokrycie typ\u00f3w.', en:'Add up to 6 Pok\u00e9mon and check your type coverage.'},
  'det.height':      {pl:'Wzrost',en:'Height'},
  'det.weight':      {pl:'Waga',en:'Weight'},
  'det.types':       {pl:'Typy',en:'Types'},
  'det.abilities':   {pl:'Zdolno\u015bci',en:'Abilities'},
  'det.habitat':     {pl:'Habitat',en:'Habitat'},
  'det.catch':       {pl:'Wsp. \u0142apania',en:'Catch Rate'},
  'det.baseExp':     {pl:'Bazowe Do\u015bw.',en:'Base Exp.'},
  'biome.spawn':     {pl:'Pora spawnu',en:'Spawn Time'},
  'biome.day':       {pl:'Dzie\u0144',en:'Day'},
  'biome.night':     {pl:'Noc',en:'Night'},
  'biome.any':       {pl:'Dowolna',en:'Any'},
  'biome.biomes':    {pl:'Biomy Minecraft',en:'Minecraft Biomes'},
  'mv.level':        {pl:'Przez poziom',en:'Level Up'},
  'mv.tm':           {pl:'TM/TR',en:'TM/TR'},
  'mv.egg':          {pl:'Egg Moves',en:'Egg Moves'},
  'mv.power':        {pl:'MOC',en:'PWR'},
  'mv.lvl':          {pl:'Poz.',en:'Lv.'},
  'mv.attack':       {pl:'Atak',en:'Attack'},
  'mv.type':         {pl:'Typ',en:'Type'},
  'build.phys':      {pl:'Fizyczny Atakuj\u0105cy',en:'Physical Attacker'},
  'build.spec':      {pl:'Specjalny Atakuj\u0105cy',en:'Special Attacker'},
  'build.def':       {pl:'Defensywny',en:'Defensive'},
  'build.ev':        {pl:'Rozk\u0142ad EV',en:'EV Spread'},
  'build.nature':    {pl:'Natura',en:'Nature'},
  'build.item':      {pl:'Przedmiot',en:'Item'},
  'build.ability':   {pl:'Zdolno\u015b\u0107',en:'Ability'},
  'build.abilityHidden': {pl:'[ukryta]',en:'[hidden]'},
  'build.abilityRec':    {pl:'Zalecana dla tego buildu',en:'Recommended for this build'},
  'build.best4':     {pl:'Najlepsze 4 Ataki',en:'Best 4 Moves'},
  'build.copyLink':  {pl:'Kopiuj Link do Buildu',en:'Copy Build Link'},
  'build.mixed':     {pl:'Mieszany',en:'Mixed'},
  'build.support':   {pl:'Wsparcie',en:'Support'},
  'build.niche':     {pl:'Niszowy',en:'Niche'},
  'build.bestChoice': {pl:'NAJLEPSZY WYB\u00d3R',en:'BEST CHOICE'},
  'build.mainItem':  {pl:'G\u0142\u00f3wny',en:'Primary'},
  'build.altItems':  {pl:'Alternatywy',en:'Alternatives'},
  'gen.loading':     {pl:'\u0141adowanie...',en:'Loading...'},
  'gen.noResults':   {pl:'Brak wynik\u00f3w',en:'No results'},
  'gen.all':         {pl:'Wszystkie',en:'All'},
  'gen.evaluate':    {pl:'Oce\u0144!',en:'Rate!'},
  'gen.sum':         {pl:'Suma',en:'Total'},
  'gen.donate':      {pl:'Wesprzyj rozw\u00f3j projektu',en:'Support the Project'},
  'gen.coffee':      {pl:'Postaw kawk\u0119',en:'Buy a Coffee'},
  'gen.donateDesc':  {pl:'Cobblemon Mastery Guide to darmowy projekt. Je\u015bli pomaga Ci w grze, rozwa\u017c wsparcie!',en:'Cobblemon Mastery Guide is a free project. If it helps you, consider supporting us!'},
  'gen.ad':          {pl:'Miejsce na Twoj\u0105 reklam\u0119 \u2014 skontaktuj si\u0119 z nami!',en:'Your ad here \u2014 contact us!'},
  'gen.adLabel':     {pl:'REKLAMA',en:'AD'},
  'gen.pokemon':     {pl:'Pok\u00e9mon\u00f3w',en:'Pok\u00e9mon'},
  'apricorn.how':    {pl:'JAK ZBIERA\u0106 APRICORNY?',en:'HOW TO COLLECT APRICORNS?'},
  'apricorn.howDesc':{pl:'Drzewa Apricorn\u00f3w rosn\u0105 naturalnie w r\u00f3\u017cnych biomach. Zbieraj owoce i craftuj Pok\u00e9balle w Cobblemon Crafting Bench.',en:'Apricorn trees grow naturally in various biomes. Collect fruits and craft Pok\u00e9balls at the Cobblemon Crafting Bench.'},
  'welcome.what':    {pl:'Czym jest Cobblemon?',en:'What is Cobblemon?'},
  'welcome.whatDesc':{pl:'Cobblemon to mod do Minecrafta integruj\u0105cy creatury inspirowane Pok\u00e9monami. \u0141ap, trenuj i ewoluuj swoje stworzenia w \u015bwiecie Minecrafta!',en:'Cobblemon is a Minecraft mod featuring Pok\u00e9mon-inspired creatures. Catch, train and evolve your creatures in the Minecraft world!'},
  'welcome.howUse':  {pl:'Jak u\u017cywa\u0107 bazy?',en:'How to use the database?'},
  'welcome.friend':  {pl:'Przyja\u017a\u0144 (/checkfriendship)',en:'Friendship (/checkfriendship)'},
  'welcome.link':    {pl:'Link Cable (Wymiana)',en:'Link Cable (Trade)'},
  'nav.typechart':   {pl:'Kalkulator S\u0142abo\u015bci',en:'Weakness Checker'},
  'sec.typechart':   {pl:'\u2696 Kalkulator S\u0142abo\u015bci',en:'\u2696 Weakness Checker'},
  'tc.intro':        {pl:'Wybierz typ(y) swojego Pok\u00e9mona, aby sprawdzi\u0107 na co jest s\u0142aby, odporny lub ca\u0142kowicie immunizowany. Obs\u0142uguje podw\u00f3jne typy z mno\u017cnikami \u00d74!',en:'Select your Pok\u00e9mon\'s type(s) to check weaknesses, resistances and immunities. Supports dual types with \u00d74 multipliers!'},
  'tc.pickType':     {pl:'Wybierz typ',en:'Pick a type'},
  'tc.type1':        {pl:'\ud83d\udee1 TYP PIERWSZY',en:'\ud83d\udee1 PRIMARY TYPE'},
  'tc.type2':        {pl:'\ud83d\udee1 TYP DRUGI (opcjonalny)',en:'\ud83d\udee1 SECONDARY TYPE (optional)'},
  'tc.none':         {pl:'Brak',en:'None'},
  'tc.clear':        {pl:'\u2716 Wyczy\u015b\u0107',en:'\u2716 Clear'},
  'tc.critical':     {pl:'\u26a0 KRYTYCZNA S\u0141ABO\u015a\u0106 (\u00d74)',en:'\u26a0 CRITICAL WEAKNESS (\u00d74)'},
  'tc.threats':      {pl:'\ud83d\udd25 Zagro\u017cenia',en:'\ud83d\udd25 Threats'},
  'tc.resists':      {pl:'\ud83d\udee1 Odporno\u015bci',en:'\ud83d\udee1 Resistances'},
  'tc.immune':       {pl:'\ud83d\udeab Immunitet',en:'\ud83d\udeab Immunity'},
  'tc.neutral':      {pl:'Neutralne (\u00d71)',en:'Neutral (\u00d71)'},
  'tc.emptyState':   {pl:'\u2190 Wybierz typ po lewej, aby zobaczy\u0107 wyniki',en:'\u2190 Select a type above to see results'},
  'tc.analyzing':    {pl:'Analiza typ\u00f3w:',en:'Analyzing types:'},
  'tc.resX4':        {pl:'\u00d74',en:'\u00d74'},
  'tc.resX2':        {pl:'\u00d72',en:'\u00d72'},
  'tc.resHalf':      {pl:'\u00d70.5',en:'\u00d70.5'},
  'tc.resQuarter':   {pl:'\u00d70.25',en:'\u00d70.25'},
  'nav.battle':      {pl:'Arena Walki',en:'Battle Arena'},
  'battle.random':   {pl:'\ud83c\udfb2 Losuj Pok\u00e9mona',en:'\ud83c\udfb2 Random Pok\u00e9mon'},
  'battle.searchPoke':{pl:'Szukaj Pok\u00e9mona...',en:'Search Pok\u00e9mon...'},
  'battle.ivLabel':  {pl:'Individual Values (IV) \u2014 0-31',en:'Individual Values (IV) \u2014 0-31'},
  'battle.selectFirst':{pl:'Najpierw wybierz Pok\u00e9mona',en:'Select a Pok\u00e9mon first'},
  'battle.startBattle':{pl:'ROZPOCZNIJ WALK\u0118!',en:'START BATTLE!'},
  'battle.intro':    {pl:'Wybierz Pok\u00e9mony, dostosuj IV, Natur\u0119 i Zdolno\u015b\u0107, a nast\u0119pnie walcz! System automatycznie dobierze 4 najlepsze ataki.',en:'Choose Pok\u00e9mon, customize IVs, Nature and Ability, then fight! The system auto-picks the 4 best moves.'},
  'battle.yourPoke':  {pl:'\ud83d\udc64 TW\u00d3J POK\u00c9MON',en:'\ud83d\udc64 YOUR POK\u00c9MON'},
  'battle.opponent':  {pl:'\ud83c\udfaf PRZECIWNIK',en:'\ud83c\udfaf OPPONENT'},
  'battle.opponentThink':{pl:'\u23f3 Przeciwnik my\u015bli...',en:'\u23f3 Opponent is thinking...'},
  'battle.victory':  {pl:'\ud83c\udfc6 ZWYCI\u0118STWO!',en:'\ud83c\udfc6 VICTORY!'},
  'battle.defeat':   {pl:'\ud83d\udc80 PORA\u017bKA!',en:'\ud83d\udc80 DEFEAT!'},
  'battle.rematch':  {pl:'\ud83d\udd04 Rewan\u017c',en:'\ud83d\udd04 Rematch'},
  'battle.newBattle': {pl:'\u2699 Nowa Walka',en:'\u2699 New Battle'},
  'battle.knownMoves':{pl:'Znane Ataki:',en:'Known Moves:'},
  'battle.fasterOpp': {pl:'Przeciwnik jest szybszy!',en:'The opponent is faster!'},
  'battle.superEff':  {pl:'Bardzo skuteczne!',en:"It's super effective!"},
  'battle.notVeryEff':{pl:'Ma\u0142o skuteczne...',en:"It's not very effective..."},
  'battle.noEffect':  {pl:'Brak efektu!',en:'It has no effect!'},
  'battle.yourUsed':  {pl:'Tw\u00f3j %p u\u017cy\u0142 %m!',en:'Your %p used %m!'},
  'battle.oppUsed':   {pl:'Przeciwny %p u\u017cy\u0142 %m!',en:"Opponent's %p used %m!"},
  'battle.fainted':   {pl:'\ud83d\udc80 %p zemdla\u0142!',en:'\ud83d\udc80 %p fainted!'},
  'battle.yourWon':   {pl:'Tw\u00f3j %p wygra\u0142 walk\u0119!',en:'Your %p won the battle!'},
  'battle.yourLost':  {pl:'Tw\u00f3j %p zemdla\u0142!',en:'Your %p fainted!'},
  'battle.se':        {pl:'BSkut!',en:'SE!'},
  'battle.nve':       {pl:'MS',en:'NVE'},
  'battle.phys':      {pl:'Fiz',en:'Phys'},
  'battle.spec':      {pl:'Spec',en:'Spec'},
  'battle.welcomeDesc':{pl:'Symuluj walk\u0119 Pok\u00e9mon\u00f3w z pe\u0142n\u0105 mechanik\u0105 obra\u017ce\u0144, IV, Natur i typ\u00f3w!',en:'Simulate Pok\u00e9mon battles with full damage mechanics, IVs, Natures and types!'},
  'nav.ranking':      {pl:'Ranking Typ\u00f3w',en:'Type Ranking'},
  'sec.ranking':      {pl:'\ud83c\udfc6 Ranking Typ\u00f3w \u2014 Top 6 Cobblemon',en:'\ud83c\udfc6 Type Ranking \u2014 Top 6 Cobblemon'},
  'ranking.counters':  {pl:'Najlepsze Kontry',en:'Best Counters'},
  'ranking.buildBtn':  {pl:'Build & Counter-Strategy',en:'Build & Counter-Strategy'},
  'ranking.desc':      {pl:'Najlepsze Pok\u00e9mony ka\u017cdego typu z kontrstrategi\u0105. Kliknij aby za\u0142adowa\u0107 build.',en:'Best Pok\u00e9mon of each type with counter-strategy. Click to load build.'},
};

/* ── Funkcja tłumaczenia ── */
function t(key){var e=TR[key];if(!e)return key;return e[currentLang]||e['pl']||key;}

/* ================================================================
   setLang — Przełączanie języka
   ================================================================ */
function setLang(lang){
  currentLang=lang;
  localStorage.setItem('cob_lang',lang);
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===lang);});
  // Aktualizacja tekstów nagłówka
  var sub=document.querySelector('.header-subtitle');if(sub)sub.textContent=t('nav.subtitle');
  var lbl=document.querySelector('.sidebar-search label');if(lbl)lbl.textContent='\ud83d\udd0d '+t('nav.search');
  var inp=document.getElementById('search-input');if(inp)inp.placeholder=currentLang==='en'?'e.g. Pikachu...':'np. Pikachu...';
  var gb=document.getElementById('badge-gen');if(gb)gb.innerHTML='\ud83c\udf3f '+t('nav.genBadge');
  var ab=document.querySelector('.gen-filter-btn[data-gen="0"]');if(ab)ab.textContent=t('gen.all');
  var bi=document.getElementById('btn-items');if(bi)bi.innerHTML='\ud83d\udce6 '+t('nav.items');
  var ba=document.getElementById('btn-apricorns');if(ba)ba.innerHTML='\ud83c\udf4e '+t('nav.apricorns');
  var bs=document.getElementById('btn-start');if(bs)bs.innerHTML='\ud83c\udfe0 '+t('nav.start');
  var bt=document.getElementById('btn-team');if(bt)bt.innerHTML='\u2694 '+t('nav.team');
  var bc=document.getElementById('btn-typechart');if(bc)bc.innerHTML='\u2696 '+t('nav.typechart');
  var bb=document.getElementById('btn-battle');if(bb)bb.innerHTML='\u2694 '+t('nav.battle');
  var brk=document.getElementById('btn-ranking');if(brk)brk.innerHTML='\ud83c\udfc6 '+t('nav.ranking');
  // Aktualizacja paska donacji
  var dt=document.getElementById('donate-title');if(dt)dt.textContent=t('gen.donate');
  var dd=document.getElementById('donate-desc');if(dd)dd.textContent=t('gen.donateDesc');
  var db=document.getElementById('donate-btn-text');if(db)db.textContent=t('gen.coffee');
  // Re-render aktualnej strony
  if(currentPage==='welcome')showPage('welcome');
  else if(currentPage==='items')showPage('items');
  else if(currentPage==='apricorns')showPage('apricorns');
  else if(currentPage==='team-analyzer')showPage('team-analyzer');
  else if(currentPage==='type-chart')showPage('type-chart');
  else if(currentPage==='ranking')showPage('ranking');
  else if(currentPage==='battle-sim')window.location.href='arena.html';
  else if(selectedId){var f=allPokemon.find(function(p){return p.id===selectedId;});if(f)loadDetail(f.id,f.name);}
}
