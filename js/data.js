/* ================================================================
   data.js — Statyczne dane (ataki, biomy, ewolucje, przedmioty)
   ================================================================ */

/* ================================================================
   MOVE DATA
   ================================================================ */
const MOVE_DATA = {
  'hyper-voice':[90,'normal','S'],'boomburst':[140,'normal','S'],'body-slam':[85,'normal','P'],
  'double-edge':[120,'normal','P'],'facade':[70,'normal','P'],'return':[102,'normal','P'],
  'quick-attack':[40,'normal','P'],'extreme-speed':[80,'normal','P'],'last-resort':[140,'normal','P'],
  'swift':[60,'normal','S'],'swords-dance':[0,'normal','Z'],'rest':[0,'normal','Z'],
  'protect':[0,'normal','Z'],'substitute':[0,'normal','Z'],'recover':[0,'normal','Z'],
  'wish':[0,'normal','Z'],'belly-drum':[0,'normal','Z'],'work-up':[0,'normal','Z'],
  'slack-off':[0,'normal','Z'],'soft-boiled':[0,'normal','Z'],'milk-drink':[0,'normal','Z'],
  'shell-smash':[0,'normal','Z'],'egg-bomb':[100,'normal','P'],
  'thunderbolt':[90,'electric','S'],'thunder':[110,'electric','S'],'wild-charge':[90,'electric','P'],
  'volt-switch':[70,'electric','S'],'discharge':[80,'electric','S'],'thunder-punch':[75,'electric','P'],
  'spark':[65,'electric','P'],'rising-voltage':[70,'electric','S'],'nuzzle':[20,'electric','P'],
  'flamethrower':[90,'fire','S'],'fire-blast':[110,'fire','S'],'flare-blitz':[120,'fire','P'],
  'fire-punch':[75,'fire','P'],'mystical-fire':[75,'fire','S'],'overheat':[130,'fire','S'],
  'heat-wave':[95,'fire','S'],'will-o-wisp':[0,'fire','Z'],'burning-jealousy':[70,'fire','S'],
  'surf':[90,'water','S'],'hydro-pump':[110,'water','S'],'waterfall':[80,'water','P'],
  'scald':[80,'water','S'],'aqua-jet':[40,'water','P'],'aqua-tail':[90,'water','P'],
  'liquidation':[85,'water','P'],'flip-turn':[60,'water','P'],'rain-dance':[0,'water','Z'],
  'sparkling-aria':[90,'water','S'],'surging-strikes':[25,'water','P'],
  'moonblast':[95,'fairy','S'],'dazzling-gleam':[80,'fairy','S'],'play-rough':[90,'fairy','P'],
  'draining-kiss':[50,'fairy','S'],'disarming-voice':[40,'fairy','S'],'geomancy':[0,'fairy','Z'],
  'fleur-cannon':[130,'fairy','S'],'spirit-break':[75,'fairy','P'],'strange-steam':[90,'fairy','S'],
  'psychic':[90,'psychic','S'],'psyshock':[80,'psychic','S'],'future-sight':[120,'psychic','S'],
  'extrasensory':[80,'psychic','S'],'zen-headbutt':[80,'psychic','P'],'psybeam':[65,'psychic','S'],
  'calm-mind':[0,'psychic','Z'],'trick-room':[0,'psychic','Z'],'agility':[0,'psychic','Z'],
  'reflect':[0,'psychic','Z'],'stored-power':[20,'psychic','S'],'expanding-force':[80,'psychic','S'],
  'prismatic-laser':[160,'psychic','S'],'amnesia':[0,'psychic','Z'],'cosmic-power':[0,'psychic','Z'],
  'close-combat':[120,'fighting','P'],'aura-sphere':[80,'fighting','S'],'drain-punch':[75,'fighting','P'],
  'high-jump-kick':[130,'fighting','P'],'mach-punch':[40,'fighting','P'],'superpower':[120,'fighting','P'],
  'focus-blast':[120,'fighting','S'],'sacred-sword':[90,'fighting','P'],'bulk-up':[0,'fighting','Z'],
  'hammer-arm':[100,'fighting','P'],'thunderous-kick':[90,'fighting','P'],'vacuum-wave':[40,'fighting','S'],
  'earthquake':[100,'ground','P'],'earth-power':[90,'ground','S'],'stomping-tantrum':[75,'ground','P'],
  'dig':[80,'ground','P'],'stealth-rock':[0,'ground','Z'],'spikes':[0,'ground','Z'],
  'scorching-sands':[70,'ground','S'],'shore-up':[0,'ground','Z'],
  'energy-ball':[90,'grass','S'],'leaf-blade':[90,'grass','P'],'giga-drain':[75,'grass','S'],
  'power-whip':[120,'grass','P'],'wood-hammer':[120,'grass','P'],'leaf-storm':[130,'grass','S'],
  'solar-beam':[120,'grass','S'],'seed-bomb':[80,'grass','P'],'leech-seed':[0,'grass','Z'],
  'synthesis':[0,'grass','Z'],'grassy-glide':[70,'grass','P'],'spore':[0,'grass','Z'],
  'petal-dance':[120,'grass','S'],
  'ice-beam':[90,'ice','S'],'blizzard':[110,'ice','S'],'ice-punch':[75,'ice','P'],
  'ice-shard':[40,'ice','P'],'icicle-crash':[85,'ice','P'],'freeze-dry':[70,'ice','S'],
  'glacial-lance':[120,'ice','P'],'aurora-veil':[0,'ice','Z'],'triple-axel':[20,'ice','P'],
  'shadow-ball':[80,'ghost','S'],'phantom-force':[90,'ghost','P'],'poltergeist':[110,'ghost','P'],
  'shadow-claw':[70,'ghost','P'],'shadow-sneak':[40,'ghost','P'],'moongeist-beam':[100,'ghost','S'],
  'hex':[65,'ghost','S'],'astral-barrage':[120,'ghost','S'],'destiny-bond':[0,'ghost','Z'],
  'dark-pulse':[80,'dark','S'],'crunch':[80,'dark','P'],'knock-off':[65,'dark','P'],
  'night-slash':[70,'dark','P'],'sucker-punch':[70,'dark','P'],'throat-chop':[80,'dark','P'],
  'wicked-blow':[80,'dark','P'],'nasty-plot':[0,'dark','Z'],'taunt':[0,'dark','Z'],
  'parting-shot':[0,'dark','Z'],'night-daze':[85,'dark','S'],'darkest-lariat':[85,'dark','P'],
  'fiery-wrath':[90,'dark','S'],'lash-out':[75,'dark','P'],
  'dragon-pulse':[85,'dragon','S'],'outrage':[120,'dragon','P'],'dragon-claw':[80,'dragon','P'],
  'draco-meteor':[130,'dragon','S'],'dragon-dance':[0,'dragon','Z'],'dual-chop':[40,'dragon','P'],
  'dragon-rush':[100,'dragon','P'],'clanging-scales':[110,'dragon','S'],'eternabeam':[160,'dragon','S'],
  'iron-head':[80,'steel','P'],'flash-cannon':[80,'steel','S'],'heavy-slam':[100,'steel','P'],
  'gyro-ball':[100,'steel','P'],'meteor-mash':[90,'steel','P'],'iron-defense':[0,'steel','Z'],
  'bullet-punch':[40,'steel','P'],'sunsteel-strike':[100,'steel','P'],'steel-beam':[140,'steel','S'],
  'stone-edge':[100,'rock','P'],'rock-slide':[75,'rock','P'],'power-gem':[80,'rock','S'],
  'meteor-beam':[120,'rock','S'],'head-smash':[150,'rock','P'],
  'sludge-bomb':[90,'poison','S'],'gunk-shot':[120,'poison','P'],'poison-jab':[80,'poison','P'],
  'sludge-wave':[95,'poison','S'],'toxic':[0,'poison','Z'],'shell-side-arm':[90,'poison','S'],
  'bug-buzz':[90,'bug','S'],'leech-life':[80,'bug','P'],'x-scissor':[80,'bug','P'],
  'u-turn':[70,'bug','P'],'lunge':[80,'bug','P'],'first-impression':[90,'bug','P'],'quiver-dance':[0,'bug','Z'],
  'brave-bird':[120,'flying','P'],'hurricane':[110,'flying','S'],'air-slash':[75,'flying','S'],
  'acrobatics':[55,'flying','P'],'fly':[90,'flying','P'],'aerial-ace':[60,'flying','P'],
  'roost':[0,'flying','Z'],'tailwind':[0,'flying','Z'],'defog':[0,'flying','Z'],'dual-wingbeat':[40,'flying','P'],
};

/* ================================================================
   BIOME MAPPING
   ================================================================ */
const HABITAT_BIOMES = {
  cave:            {biomes:['Lush Caves','Dripstone Caves','Deep Dark'],icon:'\u26f0'},
  forest:          {biomes:['Forest','Birch Forest','Dark Forest','Flower Forest'],icon:'\ud83c\udf32'},
  grassland:       {biomes:['Plains','Sunflower Plains','Meadow'],icon:'\ud83c\udf3f'},
  mountain:        {biomes:['Stony Peaks','Jagged Peaks','Windswept Hills'],icon:'\ud83c\udfd4'},
  rare:            {biomes:['Deep Dark','End Highlands','Mushroom Fields'],icon:'\u2728'},
  'rough-terrain': {biomes:['Badlands','Savanna','Windswept Forest','Stony Shore'],icon:'\ud83c\udfdc'},
  sea:             {biomes:['Ocean','Deep Ocean','Warm Ocean','Lukewarm Ocean'],icon:'\ud83c\udf0a'},
  urban:           {biomes:['Plains (Villages)','Savanna (Villages)'],icon:'\ud83c\udfe0'},
  'waters-edge':   {biomes:['River','Beach','Swamp','Mangrove Swamp'],icon:'\ud83c\udfd6'}
};
function getSpawnTime(types){
  var tn=types.map(function(t){return t.type.name;});
  if(tn.includes('ghost')||tn.includes('dark'))return 'night';
  if(tn.includes('fairy')||tn.includes('psychic'))return 'day';
  if(tn.includes('bug'))return 'day';
  return 'any';
}
function buildBiomeSection(habitat,types){
  var hab=habitat?habitat.name:null;
  var biomeData=hab&&HABITAT_BIOMES[hab]?HABITAT_BIOMES[hab]:{biomes:['Plains','Forest','Meadow'],icon:'\ud83c\udf0d'};
  var spawnTime=getSpawnTime(types);
  var timeLabels={day:'\u2600 '+t('biome.day'),night:'\ud83c\udf19 '+t('biome.night'),any:'\u2600\ud83c\udf19 '+t('biome.any')};
  var biomeTags=biomeData.biomes.map(function(b){return '<span class="biome-tag">'+biomeData.icon+' '+b+'</span>';}).join('');
  var timeTag='<span class="time-tag">'+(timeLabels[spawnTime]||timeLabels['any'])+'</span>';
  return '<div class="biome-section"><h2>\ud83c\udf0d '+t('sec.biomes')+'</h2>'
    +'<div style="margin-bottom:8px;font-size:16px;color:#888">'+t('biome.biomes')+':</div>'
    +'<div class="biome-tags">'+biomeTags+'</div>'
    +'<div style="margin-top:10px;font-size:16px;color:#888">'+t('biome.spawn')+':</div>'
    +'<div class="biome-tags" style="margin-top:4px">'+timeTag+'</div></div>';
}

/* ================================================================
   COBBLEMON EVO OVERRIDES
   ================================================================ */
var COBBLEMON_EVO_EXTRA = {
    'greninja>ash-greninja': {pl:'Forma aktywowana przez umiejętność Battle Bond po użyciu Czapki Asha przy 255 Friendship',en:'Form activated by Battle Bond ability after using Ash Cap at 255 Friendship'},
  'goomy>sliggoo':     {pl:'+ Deszcz',en:'+ Rain'},
  'sliggoo>goodra':    {pl:'+ Deszcz',en:'+ Rain'},
  'eevee>espeon':      {pl:'+ Dzie\u0144',en:'+ Day'},
  'eevee>umbreon':     {pl:'+ Noc',en:'+ Night'},
  'eevee>leafeon':     {pl:'Kamie\u0144 Li\u015bcia',en:'Leaf Stone'},
  'eevee>glaceon':     {pl:'Kamie\u0144 Lodu',en:'Ice Stone'},
  'eevee>sylveon':     {pl:'+ Atak Fairy',en:'+ Fairy move'},
  'budew>roselia':     {pl:'+ Dzie\u0144',en:'+ Day'},
  'riolu>lucario':     {pl:'+ Dzie\u0144',en:'+ Day'},
  'chingling>chimecho':{pl:'+ Noc',en:'+ Night'},
  'sneasel>weavile':   {pl:'+ Noc + Ostry Szpon',en:'+ Night + Razor Claw'},
  'happiny>chansey':   {pl:'+ Okr\u0105g\u0142y Kam.',en:'+ Oval Stone'},
  'gligar>gliscor':    {pl:'+ Noc + Ostry K\u0142yk',en:'+ Night + Razor Fang'},
  'magneton>magnezone':{pl:'Kamie\u0144 Gromu',en:'Thunder Stone'},
  'nosepass>probopass': {pl:'Kamie\u0144 Gromu',en:'Thunder Stone'},
  'charjabug>vikavolt': {pl:'Kamie\u0144 Gromu',en:'Thunder Stone'},
  'crabrawler>crabominable':{pl:'Kamie\u0144 Lodu',en:'Ice Stone'},
  'pikachu>raichu':    {pl:'Kamie\u0144 Gromu',en:'Thunder Stone'},
  'exeggcute>exeggutor':{pl:'Kamie\u0144 Li\u015bcia',en:'Leaf Stone'},
  'cubone>marowak':    {pl:'Poz. 28',en:'Lvl 28'},
  'tyrogue>hitmonlee': {pl:'ATK > DEF',en:'ATK > DEF'},
  'tyrogue>hitmonchan':{pl:'DEF > ATK',en:'DEF > ATK'},
  'tyrogue>hitmontop': {pl:'ATK = DEF',en:'ATK = DEF'},
  'wurmple>silcoon':   {pl:'Losowo',en:'Random'},
  'wurmple>cascoon':   {pl:'Losowo',en:'Random'},
  'feebas>milotic':    {pl:'Link Cable + Pryzmowa \u0141uska',en:'Link Cable + Prism Scale'},
  'inkay>malamar':     {pl:'Poz. 30 + Obr\u00f3\u0107 ekran',en:'Lvl 30 + Flip screen'},
  'pancham>pangoro':   {pl:'Poz. 32 + Mroczny w dru\u017cynie',en:'Lvl 32 + Dark type in party'},
  'mantyke>mantine':   {pl:'Remoraid w dru\u017cynie',en:'Remoraid in party'},
  'rockruff>lycanroc': {pl:'Poz. 25 \u2014 <b>3 Formy</b>:<br>\u2600 Dzie\u0144 = Lycanroc Midday (Rock)<br>\ud83c\udf19 Noc = Lycanroc Midnight (Rock, Anger Point)<br>\ud83c\udf06 Zmierzch + Own Tempo = Lycanroc Dusk (Rock, Tough Claws)',en:'Lvl 25 \u2014 <b>3 Forms</b>:<br>\u2600 Day = Lycanroc Midday (Rock)<br>\ud83c\udf19 Night = Lycanroc Midnight (Rock, Anger Point)<br>\ud83c\udf06 Dusk + Own Tempo = Lycanroc Dusk (Rock, Tough Claws)'},
  'cosmoem>solgaleo':  {pl:'Poz. 53 (dzie\u0144)',en:'Lvl 53 (day)'},
  'cosmoem>lunala':    {pl:'Poz. 53 (noc)',en:'Lvl 53 (night)'},
  'kubfu>urshifu':     {pl:'Wie\u017ca Stylu',en:'Tower of Style'},
  'applin>flapple':    {pl:'Kwa\u015bne Jab\u0142ko',en:'Tart Apple'},
  'applin>appletun':   {pl:'S\u0142odkie Jab\u0142ko',en:'Sweet Apple'},
  'milcery>alcremie':  {pl:'Obr\u00f3\u0107 z s\u0142odyczami',en:'Spin with sweets'},
  'yamask>runerigus':  {pl:'49+ DMG + \u0141uk Kamieni',en:'49+ DMG + Stone Bridge'},
  'galarian_yamask>runerigus':{pl:'49+ DMG + \u0141uk',en:'49+ DMG + Arc'},
  'farfetchd>sirfetchd':{pl:'3 Kryt. Trafienia',en:'3 Critical Hits'},
  'kadabra>alakazam':  {pl:'Link Cable',en:'Link Cable'},
  'machoke>machamp':   {pl:'Link Cable',en:'Link Cable'},
  'graveler>golem':    {pl:'Link Cable',en:'Link Cable'},
  'haunter>gengar':    {pl:'Link Cable',en:'Link Cable'},
  'boldore>gigalith':  {pl:'Link Cable',en:'Link Cable'},
  'gurdurr>conkeldurr':{pl:'Link Cable',en:'Link Cable'},
  'phantump>trevenant':{pl:'Link Cable',en:'Link Cable'},
  'pumpkaboo>gourgeist':{pl:'Link Cable',en:'Link Cable'},
  'onix>steelix':      {pl:'Link Cable + Metalowa Pow\u0142oka',en:'Link Cable + Metal Coat'},
  'scyther>scizor':    {pl:'Link Cable + Metalowa Pow\u0142oka',en:'Link Cable + Metal Coat'},
  'seadra>kingdra':    {pl:'Link Cable + Smocza \u0141uska',en:'Link Cable + Dragon Scale'},
  'slowpoke>slowking': {pl:'Link Cable + Ska\u0142a Kr\u00f3la',en:"Link Cable + King's Rock"},
  'poliwhirl>politoed':{pl:'Link Cable + Ska\u0142a Kr\u00f3la',en:"Link Cable + King's Rock"},
  'porygon>porygon2':  {pl:'Link Cable + Ulepszenie',en:'Link Cable + Up-Grade'},
  'porygon2>porygon-z':{pl:'Link Cable + W\u0105tpliwy Dysk',en:'Link Cable + Dubious Disc'},
  'spritzee>aromatisse':{pl:'Link Cable + Saszetka',en:'Link Cable + Sachet'},
  'swirlix>slurpuff':  {pl:'Link Cable + Bita \u015amietana',en:'Link Cable + Whipped Dream'},
  'clamperl>huntail':  {pl:'Link Cable + Z\u0105b G\u0142\u0119bin',en:'Link Cable + Deep Sea Tooth'},
  'clamperl>gorebyss': {pl:'Link Cable + \u0141uska G\u0142\u0119bin',en:'Link Cable + Deep Sea Scale'},
  'karrablast>escavalier':{pl:'Link Cable (z Shelmet)',en:'Link Cable (with Shelmet)'},
  'shelmet>accelgor':  {pl:'Link Cable (z Karrablast)',en:'Link Cable (with Karrablast)'},
  'rhydon>rhyperior':  {pl:'Link Cable + Protektor',en:'Link Cable + Protector'},
  'electabuzz>electivire':{pl:'Link Cable + Elektrowzmacniacz',en:'Link Cable + Electirizer'},
  'magmar>magmortar':  {pl:'Link Cable + Magmowzmacniacz',en:'Link Cable + Magmarizer'},
  'dusclops>dusknoir': {pl:'Link Cable + Tkanina \u017ba\u0142oby',en:'Link Cable + Reaper Cloth'}
};

/* ================================================================
   ITEMS DATA & RENDER
   ================================================================ */
var ITEMS_DATA = [
  { name:{pl:'Link Cable',en:'Link Cable'},                    slug:'linking-cord',   desc:{pl:'Zast\u0119puje wymian\u0119 Pok\u00e9mon\u00f3w. Aktywuj w r\u0119ce blisko gracza.',en:'Replaces Pok\u00e9mon trade. Activate in hand near a player.'}, tag:{pl:'Ewolucja',en:'Evolution'} },
  { name:{pl:'Kamie\u0144 Gromu',en:'Thunder Stone'},          slug:'thunder-stone',  desc:{pl:'Ewoluuje: Pikachu\u2192Raichu, Eevee\u2192Jolteon',en:'Evolves: Pikachu\u2192Raichu, Eevee\u2192Jolteon'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Ognia',en:'Fire Stone'},             slug:'fire-stone',     desc:{pl:'Ewoluuje: Vulpix\u2192Ninetales, Growlithe\u2192Arcanine, Eevee\u2192Flareon',en:'Evolves: Vulpix\u2192Ninetales, Growlithe\u2192Arcanine, Eevee\u2192Flareon'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Wody',en:'Water Stone'},             slug:'water-stone',    desc:{pl:'Ewoluuje: Poliwhirl\u2192Poliwrath, Shellder\u2192Cloyster, Eevee\u2192Vaporeon',en:'Evolves: Poliwhirl\u2192Poliwrath, Shellder\u2192Cloyster, Eevee\u2192Vaporeon'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Li\u015bcia',en:'Leaf Stone'},       slug:'leaf-stone',     desc:{pl:'Ewoluuje: Exeggcute\u2192Exeggutor, Weepinbell\u2192Victreebel',en:'Evolves: Exeggcute\u2192Exeggutor, Weepinbell\u2192Victreebel'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Ksi\u0119\u017cyca',en:'Moon Stone'},slug:'moon-stone',     desc:{pl:'Ewoluuje: Nidorina\u2192Nidoqueen, Clefairy\u2192Clefable',en:'Evolves: Nidorina\u2192Nidoqueen, Clefairy\u2192Clefable'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 S\u0142o\u0144ca',en:'Sun Stone'},   slug:'sun-stone',      desc:{pl:'Ewoluuje: Gloom\u2192Bellossom, Sunkern\u2192Sunflora',en:'Evolves: Gloom\u2192Bellossom, Sunkern\u2192Sunflora'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Zmierzchu',en:'Dusk Stone'},         slug:'dusk-stone',     desc:{pl:'Ewoluuje: Murkrow\u2192Honchkrow, Misdreavus\u2192Mismagius',en:'Evolves: Murkrow\u2192Honchkrow, Misdreavus\u2192Mismagius'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 \u015awietlisty',en:'Shiny Stone'},  slug:'shiny-stone',    desc:{pl:'Ewoluuje: Togetic\u2192Togekiss, Roselia\u2192Roserade',en:'Evolves: Togetic\u2192Togekiss, Roselia\u2192Roserade'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Kamie\u0144 Lodu',en:'Ice Stone'},               slug:'ice-stone',      desc:{pl:'Ewoluuje: Alolan Sandshrew\u2192Sandslash, Alolan Vulpix\u2192Ninetales',en:'Evolves: Alolan Sandshrew\u2192Sandslash, Alolan Vulpix\u2192Ninetales'}, tag:{pl:'Kamie\u0144',en:'Stone'} },
  { name:{pl:'Metalowa Pow\u0142oka',en:'Metal Coat'},         slug:'metal-coat',     desc:{pl:'Trzymany przez Onix\u2192Steelix lub Scyther\u2192Scizor (Link Cable)',en:'Held by Onix\u2192Steelix or Scyther\u2192Scizor (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Smocza \u0141uska',en:'Dragon Scale'},           slug:'dragon-scale',   desc:{pl:'Trzymany przez Seadra\u2192Kingdra (Link Cable)',en:'Held by Seadra\u2192Kingdra (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Ska\u0142a Kr\u00f3la',en:"King's Rock"},        slug:'kings-rock',     desc:{pl:'Slowpoke\u2192Slowking lub Poliwhirl\u2192Politoed (Link Cable)',en:'Slowpoke\u2192Slowking or Poliwhirl\u2192Politoed (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Ulepszenie',en:'Up-Grade'},                      slug:'up-grade',       desc:{pl:'Porygon\u2192Porygon2 (Link Cable)',en:'Porygon\u2192Porygon2 (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'W\u0105tpliwy Dysk',en:'Dubious Disc'},          slug:'dubious-disc',   desc:{pl:'Porygon2\u2192Porygon-Z (Link Cable)',en:'Porygon2\u2192Porygon-Z (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Z\u0105b G\u0142\u0119bin',en:'Deep Sea Tooth'}, slug:'deep-sea-tooth', desc:{pl:'Clamperl\u2192Huntail (Link Cable)',en:'Clamperl\u2192Huntail (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'\u0141uska G\u0142\u0119bin',en:'Deep Sea Scale'},slug:'deep-sea-scale', desc:{pl:'Clamperl\u2192Gorebyss (Link Cable)',en:'Clamperl\u2192Gorebyss (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Saszetka',en:'Sachet'},                          slug:'sachet',         desc:{pl:'Spritzee\u2192Aromatisse (Link Cable)',en:'Spritzee\u2192Aromatisse (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Bita \u015amietana',en:'Whipped Dream'},         slug:'whipped-dream',  desc:{pl:'Swirlix\u2192Slurpuff (Link Cable)',en:'Swirlix\u2192Slurpuff (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Pryzmowa \u0141uska',en:'Prism Scale'},          slug:'prism-scale',    desc:{pl:'Feebas\u2192Milotic (Link Cable)',en:'Feebas\u2192Milotic (Link Cable)'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Mikstura',en:'Potion / Max Potion'},             slug:'potion',         desc:{pl:'Leczy P\u017b pok\u00e9mona.',en:'Heals Pok\u00e9mon HP.'}, tag:{pl:'Leczenie',en:'Healing'} },
  { name:{pl:'O\u017cywienie',en:'Revive'},                    slug:'revive',         desc:{pl:'Przywraca omdla\u0142ego pok\u00e9mona do 50% P\u017b',en:'Revives fainted Pok\u00e9mon to 50% HP'}, tag:{pl:'Leczenie',en:'Healing'} },
  { name:{pl:'Dzwonek \u0141agodno\u015bci',en:'Soothe Bell'}, slug:'soothe-bell',    desc:{pl:'Przyspiesza zdobywanie Friendship.',en:'Speeds up Friendship gain.'}, tag:{pl:'Przyja\u017a\u0144',en:'Friendship'} },
  { name:{pl:'Resztki',en:'Leftovers'},                        slug:'leftovers',      desc:{pl:'Regeneruje 1/16 P\u017b co tur\u0119.',en:'Restores 1/16 HP per turn.'}, tag:{pl:'Trzymany',en:'Held Item'} },
  { name:{pl:'Tarcza Umiej\u0119tno\u015bci',en:'Ability Shield'},slug:'ability-shield',desc:{pl:'Chroni umiej\u0119tno\u015b\u0107 posiadacza przed zmian\u0105 lub zablokowaniem.',en:'Protects the holder\u2019s Ability from being changed or suppressed.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Kamizelka Szturmowa',en:'Assault Vest'},         slug:'assault-vest',   desc:{pl:'Zwi\u0119ksza Sp. Def o 50%, ale blokuje ruchy statusowe.',en:'Boosts Sp. Def by 50% but prevents status moves.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Wst\u0119ga Wyboru',en:'Choice Band'},           slug:'choice-band',    desc:{pl:'Zwi\u0119ksza Atak o 50%, ale pozwala u\u017cywa\u0107 tylko jednego ruchu.',en:'Boosts Attack by 50% but locks into one move.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Szalik Wyboru',en:'Choice Scarf'},               slug:'choice-scarf',   desc:{pl:'Zwi\u0119ksza Szybko\u015b\u0107 o 50%, ale pozwala u\u017cywa\u0107 tylko jednego ruchu.',en:'Boosts Speed by 50% but locks into one move.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Okulary Wyboru',en:'Choice Specs'},              slug:'choice-specs',   desc:{pl:'Zwi\u0119ksza Sp. Atak o 50%, ale pozwala u\u017cywa\u0107 tylko jednego ruchu.',en:'Boosts Sp. Atk by 50% but locks into one move.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Eviolit',en:'Eviolite'},                         slug:'eviolite',       desc:{pl:'Zwi\u0119ksza Def i Sp.Def o 50% dla Pok\u00e9mon\u00f3w, kt\u00f3re mog\u0105 jeszcze ewoluowa\u0107.',en:'Boosts Def and Sp.Def by 50% for Pok\u00e9mon that can still evolve.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Szarfa Skupienia',en:'Focus Sash'},              slug:'focus-sash',     desc:{pl:'Pozwala prze\u017cy\u0107 atak z 1 HP przy pe\u0142nym zdrowiu (zu\u017cywa si\u0119).',en:'Survives a KO hit with 1 HP at full health (consumed).'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Sfera \u017bycia',en:'Life Orb'},                slug:'life-orb',       desc:{pl:'Zwi\u0119ksza moc atak\u00f3w o 30%, ale zabiera 10% HP przy ka\u017cdym trafieniu.',en:'Boosts move power by 30% but costs 10% HP per hit.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Skalny He\u0142m',en:'Rocky Helmet'},            slug:'rocky-helmet',   desc:{pl:'Zadaje obra\u017cenia przeciwnikowi przy ataku fizycznym na posiadacza.',en:'Damages the attacker when they make contact.'}, tag:{pl:'PvP',en:'PvP'} },
  { name:{pl:'Jagoda Sitrus',en:'Sitrus Berry'},               slug:'sitrus-berry',   desc:{pl:'Leczy 25% HP, gdy zdrowie spadnie poni\u017cej 50%.',en:'Restores 25% HP when health drops below 50%.'}, tag:{pl:'Jagoda',en:'Berry'} },
  { name:{pl:'Jagoda Lum',en:'Lum Berry'},                     slug:'lum-berry',      desc:{pl:'Leczy dowolny status (zatrucie, para\u017c, sen itp.).',en:'Cures any status condition (poison, paralysis, sleep, etc.).'}, tag:{pl:'Jagoda',en:'Berry'} },
];

function renderItems() {
  if (!Array.isArray(ITEMS_DATA) || !ITEMS_DATA.length) return '<div class="empty-state">Brak danych przedmiotów.</div>';
  return ITEMS_DATA.map(function(item) {
    var imgTag = '<img class="item-icon-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+item.slug+'.png" onerror="this.parentNode.innerHTML=\'<span style=color:#555;font-size:28px>\u25A1</span>\'" />';
    var itemName = typeof item.name==='object'?item.name[currentLang]||item.name.pl:item.name;
    var desc = typeof item.desc==='object'?item.desc[currentLang]||item.desc.pl:item.desc;
    var tag = typeof item.tag==='object'?item.tag[currentLang]||item.tag.pl:item.tag;
    return '<div class="item-card"><div class="item-icon-only">'+imgTag+'</div><div><div class="item-name">'+itemName+'</div><div class="item-desc">'+desc+'</div><span class="item-tag">'+tag+'</span></div></div>';
  }).join('');
}

/* ================================================================
   APRICORNS DATA & RENDER
   ================================================================ */
var APRICORNS_DATA = [
  { hex:'#222', color:{pl:'Czarny',en:'Black'}, ball:'Heavy Ball', ballSlug:'heavy-ball', effect:{pl:'\u0141atwiej \u0142apa\u0107 ci\u0119\u017ckie Pok\u00e9mony (\u2265 451.5 kg)',en:'Easier to catch heavy Pok\u00e9mon (\u2265451.5 kg)'} },
  { hex:'#3366cc', color:{pl:'Niebieski',en:'Blue'}, ball:'Lure Ball', ballSlug:'lure-ball', effect:{pl:'3\u00d7 skuteczno\u015b\u0107 przy \u0142apaniu w wodzie',en:'3\u00d7 catch rate when fishing'} },
  { hex:'#33aa33', color:{pl:'Zielony',en:'Green'}, ball:'Friend Ball', ballSlug:'friend-ball', effect:{pl:'Z\u0142owiony Pok\u00e9mon startuje z 200 Friendship',en:'Caught Pok\u00e9mon starts with 200 Friendship'} },
  { hex:'#dd66aa', color:{pl:'R\u00f3\u017cowy',en:'Pink'}, ball:'Love Ball', ballSlug:'love-ball', effect:{pl:'8\u00d7 skuteczno\u015b\u0107 na t\u0119 sam\u0105 sp., odmient\u0105 p\u0142e\u0107',en:'8\u00d7 rate on same species, different gender'} },
  { hex:'#cc3333', color:{pl:'Czerwony',en:'Red'}, ball:'Level Ball', ballSlug:'level-ball', effect:{pl:'Wy\u017cszy mno\u017cnik gdy Tw\u00f3j Pok\u00e9mon ma wy\u017cszy level',en:'Higher multiplier when your Pok\u00e9mon has higher level'} },
  { hex:'#ddd', color:{pl:'Bia\u0142y',en:'White'}, ball:'Fast Ball', ballSlug:'fast-ball', effect:{pl:'4\u00d7 skuteczno\u015b\u0107 na Pok\u00e9mony, kt\u00f3re uciekaj\u0105',en:'4\u00d7 rate on Pok\u00e9mon that flee'} },
  { hex:'#ddcc33', color:{pl:'\u017b\u00f3\u0142ty',en:'Yellow'}, ball:'Moon Ball', ballSlug:'moon-ball', effect:{pl:'4\u00d7 skuteczno\u015b\u0107 na ewoluuj\u0105ce Moon Stonem',en:'4\u00d7 rate on Moon Stone evolutions'} },
];

function renderApricorns() {
  if (!Array.isArray(APRICORNS_DATA) || !APRICORNS_DATA.length) return '<div class="empty-state">Brak danych Apricornów.</div>';
  return APRICORNS_DATA.map(function(a) {
    var ballImg = '<img class="item-icon-img" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+a.ballSlug+'.png" onerror="this.parentNode.innerHTML=\'\u25cf\'" style="vertical-align:middle" />';
    var colorName = typeof a.color==='object'?a.color[currentLang]||a.color.pl:a.color;
    var effect = typeof a.effect==='object'?a.effect[currentLang]||a.effect.pl:a.effect;
    return '<div class="apricorn-card"><div class="apricorn-fruit" style="background:'+a.hex+'"></div><div class="apricorn-name">'+colorName+' Apricorn</div><div class="apricorn-arrow">\u25bc</div><div class="apricorn-ball">'+ballImg+' '+a.ball+'</div><div class="apricorn-effect">'+effect+'</div></div>';
  }).join('');
}

/* ================================================================
   TYPE RANKING — Top 6 Pokémonów na typ
   ================================================================ */
const TYPE_RANKING = {
  normal:   [[143,'snorlax',['normal']],[242,'blissey',['normal']],[474,'porygon-z',['normal']],[398,'staraptor',['normal','flying']],[428,'lopunny',['normal']],[289,'slaking',['normal']]],
  fire:     [[6,'charizard',['fire','flying']],[59,'arcanine',['fire']],[257,'blaziken',['fire','fighting']],[392,'infernape',['fire','fighting']],[637,'volcarona',['bug','fire']],[815,'cinderace',['fire']]],
  water:    [[130,'gyarados',['water','flying']],[260,'swampert',['water','ground']],[350,'milotic',['water']],[658,'greninja',['water','dark']],[658.1,'ash-greninja',['water','dark'],{formOf:'greninja',special:true}],[748,'toxapex',['water','poison']],[818,'inteleon',['water']]],
  electric: [[135,'jolteon',['electric']],[243,'raikou',['electric']],[462,'magnezone',['electric','steel']],[466,'electivire',['electric']],[807,'zeraora',['electric']],[894,'regieleki',['electric']]],
  grass:    [[3,'venusaur',['grass','poison']],[497,'serperior',['grass']],[591,'amoonguss',['grass','poison']],[598,'ferrothorn',['grass','steel']],[812,'rillaboom',['grass']],[724,'decidueye',['grass','ghost']]],
  ice:      [[131,'lapras',['water','ice']],[461,'weavile',['dark','ice']],[473,'mamoswine',['ice','ground']],[471,'glaceon',['ice']],[646,'kyurem',['dragon','ice']],[713,'avalugg',['ice']]],
  fighting: [[68,'machamp',['fighting']],[257,'blaziken',['fire','fighting']],[448,'lucario',['fighting','steel']],[534,'conkeldurr',['fighting']],[620,'mienshao',['fighting']],[892,'urshifu',['fighting','dark']]],
  poison:   [[34,'nidoking',['poison','ground']],[94,'gengar',['ghost','poison']],[452,'drapion',['poison','dark']],[591,'amoonguss',['grass','poison']],[748,'toxapex',['water','poison']],[758,'salazzle',['poison','fire']]],
  ground:   [[260,'swampert',['water','ground']],[330,'flygon',['ground','dragon']],[445,'garchomp',['dragon','ground']],[450,'hippowdon',['ground']],[530,'excadrill',['ground','steel']],[553,'krookodile',['ground','dark']]],
  flying:   [[6,'charizard',['fire','flying']],[149,'dragonite',['dragon','flying']],[227,'skarmory',['steel','flying']],[468,'togekiss',['fairy','flying']],[663,'talonflame',['fire','flying']],[823,'corviknight',['flying','steel']]],
  psychic:  [[65,'alakazam',['psychic']],[196,'espeon',['psychic']],[282,'gardevoir',['psychic','fairy']],[376,'metagross',['steel','psychic']],[579,'reuniclus',['psychic']],[858,'hatterene',['psychic','fairy']]],
  bug:      [[212,'scizor',['bug','steel']],[214,'heracross',['bug','fighting']],[416,'vespiquen',['bug','flying']],[637,'volcarona',['bug','fire']],[826,'orbeetle',['bug','psychic']],[851,'centiskorch',['fire','bug']]],
  rock:     [[142,'aerodactyl',['rock','flying']],[248,'tyranitar',['rock','dark']],[464,'rhyperior',['ground','rock']],[526,'gigalith',['rock']],[745,'lycanroc',['rock']],[839,'coalossal',['rock','fire']]],
  ghost:    [[94,'gengar',['ghost','poison']],[609,'chandelure',['ghost','fire']],[681,'aegislash',['steel','ghost']],[778,'mimikyu',['ghost','fairy']],[855,'polteageist',['ghost']],[887,'dragapult',['dragon','ghost']]],
  dragon:   [[149,'dragonite',['dragon','flying']],[373,'salamence',['dragon','flying']],[445,'garchomp',['dragon','ground']],[612,'haxorus',['dragon']],[635,'hydreigon',['dark','dragon']],[887,'dragapult',['dragon','ghost']]],
  dark:     [[248,'tyranitar',['rock','dark']],[359,'absol',['dark']],[461,'weavile',['dark','ice']],[553,'krookodile',['ground','dark']],[635,'hydreigon',['dark','dragon']],[861,'grimmsnarl',['dark','fairy']]],
  steel:    [[212,'scizor',['bug','steel']],[376,'metagross',['steel','psychic']],[462,'magnezone',['electric','steel']],[530,'excadrill',['ground','steel']],[598,'ferrothorn',['grass','steel']],[823,'corviknight',['flying','steel']]],
  fairy:    [[36,'clefable',['fairy']],[282,'gardevoir',['psychic','fairy']],[468,'togekiss',['fairy','flying']],[700,'sylveon',['fairy']],[778,'mimikyu',['ghost','fairy']],[858,'hatterene',['psychic','fairy']]]
};

/* ── Counter Pool — różnorodne Pokémony do dynamicznego dobierania kontrpicków ── */
const COUNTER_POOL = [
  {id:6,  name:'charizard',  types:['fire','flying'],    atk:['fire','flying']},
  {id:658,name:'greninja',  types:['water','dark'],    atk:['water','dark']},
  {id:658.1,name:'ash-greninja',types:['water','dark'],atk:['water','dark'],formOf:'greninja',special:true},
  {id:34, name:'nidoking',   types:['poison','ground'],  atk:['poison','ground','ice']},
  {id:59, name:'arcanine',   types:['fire'],             atk:['fire']},
  {id:65, name:'alakazam',   types:['psychic'],          atk:['psychic']},
  {id:68, name:'machamp',    types:['fighting'],         atk:['fighting']},
  {id:94, name:'gengar',     types:['ghost','poison'],   atk:['ghost','poison']},
  {id:130,name:'gyarados',   types:['water','flying'],   atk:['water']},
  {id:131,name:'lapras',     types:['water','ice'],      atk:['water','ice']},
  {id:149,name:'dragonite',  types:['dragon','flying'],  atk:['dragon']},
  {id:212,name:'scizor',     types:['bug','steel'],      atk:['bug','steel']},
  {id:248,name:'tyranitar',  types:['rock','dark'],      atk:['rock','dark']},
  {id:257,name:'blaziken',   types:['fire','fighting'],  atk:['fire','fighting']},
  {id:260,name:'swampert',   types:['water','ground'],   atk:['water','ground']},
  {id:282,name:'gardevoir',  types:['psychic','fairy'],  atk:['psychic','fairy']},
  {id:376,name:'metagross',  types:['steel','psychic'],  atk:['steel']},
  {id:392,name:'infernape',  types:['fire','fighting'],  atk:['fire','fighting']},
  {id:445,name:'garchomp',   types:['dragon','ground'],  atk:['ground','dragon']},
  {id:448,name:'lucario',    types:['fighting','steel'], atk:['fighting','steel']},
  {id:461,name:'weavile',    types:['dark','ice'],       atk:['dark','ice']},
  {id:462,name:'magnezone',  types:['electric','steel'], atk:['electric','steel']},
  {id:468,name:'togekiss',   types:['fairy','flying'],   atk:['fairy']},
  {id:530,name:'excadrill',  types:['ground','steel'],   atk:['ground','steel']},
  {id:534,name:'conkeldurr', types:['fighting'],         atk:['fighting']},
  {id:598,name:'ferrothorn', types:['grass','steel'],    atk:['grass']},
  {id:609,name:'chandelure', types:['ghost','fire'],     atk:['ghost','fire']},
  {id:637,name:'volcarona',  types:['bug','fire'],       atk:['bug','fire']},
  {id:663,name:'talonflame', types:['fire','flying'],    atk:['fire','flying']},
  {id:681,name:'aegislash',  types:['steel','ghost'],    atk:['steel','ghost']},
  {id:778,name:'mimikyu',    types:['ghost','fairy'],    atk:['ghost','fairy']},
  {id:812,name:'rillaboom',  types:['grass'],            atk:['grass']},
  {id:887,name:'dragapult',  types:['dragon','ghost'],   atk:['dragon','ghost']},
  {id:892,name:'urshifu',    types:['fighting','dark'],  atk:['fighting','dark']}
];

/* ================================================================
   MEGA EVOLUTION DATA
   ================================================================ */
var MEGA_EVO_DATA = [
  // fid = PokeAPI Pokemon ID → used for official-artwork URL
  {id:3,  name:'venusaur',   megaName:'Mega Venusaur',        types:['grass','poison'],     ability:'Thick Fat',     bst:625, stone:'Venusaurite',     sdn:'venusaurmega',   fid:10033},
  {id:6,  name:'charizard',  megaName:'Mega Charizard X',     types:['fire','dragon'],      ability:'Tough Claws',   bst:634, stone:'Charizardite X',  sdn:'charizardmegax', fid:10034, formB:{megaName:'Mega Charizard Y',types:['fire','flying'],ability:'Drought',bst:634,stone:'Charizardite Y',sdn:'charizardmegay',fid:10035}},
  {id:9,  name:'blastoise',  megaName:'Mega Blastoise',       types:['water'],              ability:'Mega Launcher', bst:630, stone:'Blastoisinite',   sdn:'blastoisemega',  fid:10036},
  {id:15, name:'beedrill',   megaName:'Mega Beedrill',        types:['bug','poison'],       ability:'Adaptability',  bst:495, stone:'Beedrillite',     sdn:'beedrillmega',   fid:10090},
  {id:18, name:'pidgeot',    megaName:'Mega Pidgeot',         types:['normal','flying'],    ability:'No Guard',      bst:579, stone:'Pidgeotite',      sdn:'pidgeotmega',    fid:10073},
  {id:65, name:'alakazam',   megaName:'Mega Alakazam',        types:['psychic'],            ability:'Trace',         bst:590, stone:'Alakazite',       sdn:'alakazammega',   fid:10037},
  {id:80, name:'slowbro',    megaName:'Mega Slowbro',         types:['water','psychic'],    ability:'Shell Armor',   bst:590, stone:'Slowbronite',     sdn:'slowbromega',    fid:10071},
  {id:94, name:'gengar',     megaName:'Mega Gengar',          types:['ghost','poison'],     ability:'Shadow Tag',    bst:600, stone:'Gengarite',       sdn:'gengarmega',     fid:10038},
  {id:115,name:'kangaskhan', megaName:'Mega Kangaskhan',      types:['normal'],             ability:'Parental Bond', bst:590, stone:'Kangaskhanite',   sdn:'kangaskhanmega', fid:10039},
  {id:127,name:'pinsir',     megaName:'Mega Pinsir',          types:['bug','flying'],       ability:'Aerilate',      bst:600, stone:'Pinsirite',       sdn:'pinsirmega',     fid:10040},
  {id:130,name:'gyarados',   megaName:'Mega Gyarados',        types:['water','dark'],       ability:'Mold Breaker',  bst:640, stone:'Gyaradosite',     sdn:'gyaradosmega',   fid:10041},
  {id:142,name:'aerodactyl', megaName:'Mega Aerodactyl',      types:['rock','flying'],      ability:'Tough Claws',   bst:615, stone:'Aerodactylite',   sdn:'aerodactylmega', fid:10042},
  {id:150,name:'mewtwo',     megaName:'Mega Mewtwo X',        types:['psychic','fighting'], ability:'Steadfast',     bst:780, stone:'Mewtwonite X',    sdn:'mewtwomegax',    fid:10043, formB:{megaName:'Mega Mewtwo Y',types:['psychic'],ability:'Insomnia',bst:780,stone:'Mewtwonite Y',sdn:'mewtwomegay',fid:10044}},
  {id:181,name:'ampharos',   megaName:'Mega Ampharos',        types:['electric','dragon'],  ability:'Mold Breaker',  bst:610, stone:'Ampharosite',     sdn:'ampharosmega',   fid:10045},
  {id:208,name:'steelix',    megaName:'Mega Steelix',         types:['steel','ground'],     ability:'Sand Force',    bst:610, stone:'Steelixite',      sdn:'steelixmega',    fid:10072},
  {id:212,name:'scizor',     megaName:'Mega Scizor',          types:['bug','steel'],        ability:'Technician',    bst:600, stone:'Scizorite',       sdn:'scizormega',     fid:10046},
  {id:214,name:'heracross',  megaName:'Mega Heracross',       types:['bug','fighting'],     ability:'Skill Link',    bst:600, stone:'Heracronite',     sdn:'heracrossmega',  fid:10047},
  {id:228,name:'houndoom',   megaName:'Mega Houndoom',        types:['dark','fire'],        ability:'Solar Power',   bst:580, stone:'Houndoominite',   sdn:'houndoommega',   fid:10048},
  {id:248,name:'tyranitar',  megaName:'Mega Tyranitar',       types:['rock','dark'],        ability:'Sand Stream',   bst:700, stone:'Tyranitarite',    sdn:'tyranitarmega',  fid:10049},
  {id:254,name:'sceptile',   megaName:'Mega Sceptile',        types:['grass','dragon'],     ability:'Lightning Rod', bst:630, stone:'Sceptilite',      sdn:'sceptilemega',   fid:10065},
  {id:257,name:'blaziken',   megaName:'Mega Blaziken',        types:['fire','fighting'],    ability:'Speed Boost',   bst:630, stone:'Blazikenite',     sdn:'blazikenmega',   fid:10050},
  {id:260,name:'swampert',   megaName:'Mega Swampert',        types:['water','ground'],     ability:'Swift Swim',    bst:635, stone:'Swampertite',     sdn:'swampertmega',   fid:10064},
  {id:282,name:'gardevoir',  megaName:'Mega Gardevoir',       types:['psychic','fairy'],    ability:'Pixilate',      bst:618, stone:'Gardevoirite',    sdn:'gardevoirmega',  fid:10051},
  {id:302,name:'sableye',    megaName:'Mega Sableye',         types:['dark','ghost'],       ability:'Magic Bounce',  bst:480, stone:'Sableyite',       sdn:'sableyemega',    fid:10066},
  {id:303,name:'mawile',     megaName:'Mega Mawile',          types:['steel','fairy'],      ability:'Huge Power',    bst:480, stone:'Mawilite',        sdn:'mawilemega',     fid:10052},
  {id:306,name:'aggron',     megaName:'Mega Aggron',          types:['steel'],              ability:'Filter',        bst:630, stone:'Aggronite',       sdn:'aggronmega',     fid:10053},
  {id:308,name:'medicham',   megaName:'Mega Medicham',        types:['fighting','psychic'], ability:'Pure Power',    bst:510, stone:'Medichamite',     sdn:'medichammega',   fid:10054},
  {id:310,name:'manectric',  megaName:'Mega Manectric',       types:['electric'],           ability:'Intimidate',    bst:575, stone:'Manectite',       sdn:'manectricmega',  fid:10055},
  {id:319,name:'sharpedo',   megaName:'Mega Sharpedo',        types:['water','dark'],       ability:'Strong Jaw',    bst:560, stone:'Sharpedonite',    sdn:'sharpedomega',   fid:10070},
  {id:323,name:'camerupt',   megaName:'Mega Camerupt',        types:['fire','ground'],      ability:'Sheer Force',   bst:560, stone:'Cameruptite',     sdn:'cameruptmega',   fid:10087},
  {id:334,name:'altaria',    megaName:'Mega Altaria',         types:['dragon','fairy'],     ability:'Pixilate',      bst:590, stone:'Altarianite',     sdn:'altariamega',    fid:10067},
  {id:354,name:'banette',    megaName:'Mega Banette',         types:['ghost'],              ability:'Prankster',     bst:555, stone:'Banettite',       sdn:'banettemega',    fid:10056},
  {id:359,name:'absol',      megaName:'Mega Absol',           types:['dark'],               ability:'Magic Bounce',  bst:565, stone:'Absolite',        sdn:'absolmega',      fid:10057},
  {id:362,name:'glalie',     megaName:'Mega Glalie',          types:['ice'],                ability:'Refrigerate',   bst:580, stone:'Glalitite',       sdn:'glaliemega',     fid:10074},
  {id:373,name:'salamence',  megaName:'Mega Salamence',       types:['dragon','flying'],    ability:'Aerilate',      bst:700, stone:'Salamencite',     sdn:'salamencemega',  fid:10089},
  {id:376,name:'metagross',  megaName:'Mega Metagross',       types:['steel','psychic'],    ability:'Tough Claws',   bst:700, stone:'Metagrossite',    sdn:'metagrossmega',  fid:10076},
  {id:380,name:'latias',     megaName:'Mega Latias',          types:['dragon','psychic'],   ability:'Levitate',      bst:700, stone:'Latiasite',       sdn:'latiasmega',     fid:10062},
  {id:381,name:'latios',     megaName:'Mega Latios',          types:['dragon','psychic'],   ability:'Levitate',      bst:700, stone:'Latiosite',       sdn:'latiosmega',     fid:10063},
  {id:384,name:'rayquaza',   megaName:'Mega Rayquaza',        types:['dragon','flying'],    ability:'Delta Stream',  bst:780, stone:'Dragon Ascent',   sdn:'rayquazamega',   fid:10079},
  {id:428,name:'lopunny',    megaName:'Mega Lopunny',         types:['normal','fighting'],  ability:'Scrappy',       bst:580, stone:'Lopunnite',       sdn:'lopunnymega',    fid:10088},
  {id:448,name:'lucario',    megaName:'Mega Lucario',         types:['fighting','steel'],   ability:'Adaptability',  bst:625, stone:'Lucarionite',     sdn:'lucariomega',    fid:10059},
  {id:460,name:'abomasnow',  megaName:'Mega Abomasnow',       types:['grass','ice'],        ability:'Snow Warning',  bst:594, stone:'Abomasite',       sdn:'abomasnowmega',  fid:10060},
  {id:475,name:'gallade',    megaName:'Mega Gallade',         types:['psychic','fighting'], ability:'Inner Focus',   bst:618, stone:'Galladite',       sdn:'gallademega',    fid:10068},
  {id:531,name:'audino',     megaName:'Mega Audino',          types:['normal','fairy'],     ability:'Healer',        bst:545, stone:'Audinite',        sdn:'audinomega',     fid:10069},
  {id:719,name:'diancie',    megaName:'Mega Diancie',         types:['rock','fairy'],       ability:'Magic Bounce',  bst:700, stone:'Diancite',        sdn:'dianciemega',    fid:10075},
  // ── SPECJALNE FORMY ──
  {id:'ash-greninja', name:'ash-greninja', megaName:'Ash-Greninja', types:['water','dark'], ability:'Battle Bond', bst:640, stone:'Battle Bond — 255 Friendship + Ash Cap', sdn:'greninjaash', fid:10117, special:true, specialNote:{pl:'Aktywuj Battle Bond — Greninja z Czapką Asha przy 255 Friendship. Po nokaucie zamienia się w Ash-Greninja z gigantycznym Water Shuriken.',en:'Activate Battle Bond — Greninja with Ash\'s Cap at 255 Friendship. After a KO it transforms, boosting Speed/SpAtk and powering Water Shuriken.'}}
];

/* ================================================================
   Z-MOVE DATA (Ekskluzywne Ruchy Z)
   ================================================================ */
var Z_MOVE_DATA = [
  {id:25, name:'pikachu',    zmove:'Catastropika',                baseMove:'Volt Tackle',    type:'electric',power:210,desc:{pl:'Ekskluzywny Ruch Z Pikachu \u2014 musi zna\u0107 Volt Tackle',en:'Pikachu exclusive Z-Move \u2014 must know Volt Tackle'}},
  {id:26, name:'raichu',     zmove:'Stoked Sparksurfer',          baseMove:'Thunderbolt',    type:'electric',power:175,desc:{pl:'Ekskluzywny dla Alola Raichu',en:'Exclusive to Alolan Raichu'}},
  {id:133,name:'eevee',      zmove:'Extreme Evoboost',            baseMove:'Last Resort',    type:'normal',  power:0,  desc:{pl:'+2 do wszystkich statystyk, wymaga Last Resort',en:'+2 to all stats, requires Last Resort'}},
  {id:143,name:'snorlax',    zmove:'Pulverizing Pancake',         baseMove:'Giga Impact',    type:'normal',  power:210,desc:{pl:'Ekskluzywny dla Snorlax',en:'Snorlax exclusive'}},
  {id:151,name:'mew',        zmove:'Genesis Supernova',           baseMove:'Psychic',        type:'psychic', power:185,desc:{pl:'Tworzy Psychic Terrain, ekskluzywny dla Mew',en:'Sets Psychic Terrain, Mew exclusive'}},
  {id:448,name:'lucario',    zmove:'Breakneck Blitz',             baseMove:'Extreme Speed',  type:'normal',  power:200,desc:{pl:'Lucario \u2014 najlepszy Normal Z-Move z Extreme Speed',en:'Lucario \u2014 best Normal Z-Move with Extreme Speed'}},
  {id:724,name:'decidueye',  zmove:'Sinister Arrow Raid',         baseMove:'Spirit Shackle', type:'ghost',   power:180,desc:{pl:'Ekskluzywny dla Decidueye',en:'Decidueye exclusive'}},
  {id:727,name:'incineroar', zmove:'Malicious Moonsault',         baseMove:'Darkest Lariat', type:'dark',    power:180,desc:{pl:'Ekskluzywny dla Incineroar',en:'Incineroar exclusive'}},
  {id:730,name:'primarina',  zmove:'Oceanic Operetta',            baseMove:'Sparkling Aria', type:'water',   power:195,desc:{pl:'Ekskluzywny dla Primarina',en:'Primarina exclusive'}},
  {id:745,name:'lycanroc',   zmove:'Splintered Stormshards',      baseMove:'Stone Edge',     type:'rock',    power:190,desc:{pl:'Ekskluzywny dla Lycanroc',en:'Lycanroc exclusive'}},
  {id:778,name:'mimikyu',    zmove:"Let's Snuggle Forever",       baseMove:'Play Rough',     type:'fairy',   power:190,desc:{pl:'Ekskluzywny dla Mimikyu',en:'Mimikyu exclusive'}},
  {id:784,name:'kommo-o',    zmove:'Clangorous Soulblaze',        baseMove:'Clanging Scales',type:'dragon',  power:185,desc:{pl:'Ekskluzywny dla Kommo-o, zwi\u0119ksza wszystkie staty',en:"Kommo-o exclusive, boosts all stats"}},
  {id:785,name:'tapu-koko',  zmove:'Guardian of Alola',           baseMove:"Nature's Madness",type:'fairy',  power:0,  desc:{pl:'Ruch Z Opiekun\u00f3w Alola \u2014 zadaje 75% max HP',en:'Alola Guardian Z-Move \u2014 deals 75% of max HP'}},
  {id:786,name:'tapu-lele',  zmove:'Guardian of Alola',           baseMove:"Nature's Madness",type:'fairy',  power:0,  desc:{pl:'Ruch Z Opiekun\u00f3w Alola \u2014 zadaje 75% max HP',en:'Alola Guardian Z-Move \u2014 deals 75% of max HP'}},
  {id:787,name:'tapu-bulu',  zmove:'Guardian of Alola',           baseMove:"Nature's Madness",type:'fairy',  power:0,  desc:{pl:'Ruch Z Opiekun\u00f3w Alola \u2014 zadaje 75% max HP',en:'Alola Guardian Z-Move \u2014 deals 75% of max HP'}},
  {id:788,name:'tapu-fini',  zmove:'Guardian of Alola',           baseMove:"Nature's Madness",type:'fairy',  power:0,  desc:{pl:'Ruch Z Opiekun\u00f3w Alola \u2014 zadaje 75% max HP',en:'Alola Guardian Z-Move \u2014 deals 75% of max HP'}},
  {id:791,name:'solgaleo',   zmove:'Searing Sunraze Smash',       baseMove:'Sunsteel Strike', type:'steel',  power:200,desc:{pl:'Ignoruje zdolno\u015bci przeciwnika',en:"Ignores the opponent's ability"}},
  {id:792,name:'lunala',     zmove:'Menacing Moonraze Maelstrom', baseMove:'Moongeist Beam',  type:'ghost',  power:200,desc:{pl:'Ignoruje zdolno\u015bci przeciwnika',en:"Ignores the opponent's ability"}},
  {id:800,name:'necrozma',   zmove:'Light That Burns the Sky',    baseMove:'Photon Geyser',   type:'psychic',power:200,desc:{pl:'U\u017cywa lepszego z Atk/Sp.Atk, ignoruje zdolno\u015bci',en:'Uses higher of Atk/SpAtk, ignores abilities'}},
  {id:802,name:'marshadow',  zmove:'Soul-Stealing 7-Star Strike', baseMove:'Spectral Thief',  type:'ghost',  power:195,desc:{pl:'Kradnie statystyki przeciwnika przed atakiem',en:'Steals opponent stats before hitting'}}
];

/* ================================================================
   REGIONAL FORMS DATA
   ================================================================ */
var REGIONAL_FORMS_DATA = [
  // ── ALOLAN FORMS ──
  {baseId:26,  slug:'raichu-alola',     formName:'Alolan Raichu',     region:'Alola', types:['electric','psychic'], desc:{pl:'Surfuje na ogonie \u2014 Electric/Psychic forma z Aloli',en:'Surfs on its tail \u2014 Electric/Psychic form from Alola'}},
  {baseId:38,  slug:'ninetales-alola',  formName:'Alolan Ninetales',  region:'Alola', types:['ice','fairy'],        desc:{pl:'Lodowo-bajkowa li\u015bcia z Aloli \u2014 Snow Warning',en:'Ice/Fairy fox from Alola \u2014 Snow Warning ability'}},
  {baseId:103, slug:'exeggutor-alola',  formName:'Alolan Exeggutor',  region:'Alola', types:['grass','dragon'],     desc:{pl:'Wysoki jak palma \u2014 Grass/Dragon z Aloli',en:'Tall as a palm tree \u2014 Grass/Dragon from Alola'}},
  {baseId:105, slug:'marowak-alola',    formName:'Alolan Marowak',    region:'Alola', types:['fire','ghost'],       desc:{pl:'Ognisty duch \u2014 pali ko\u015b\u0107 duchow\u0105 moc\u0105',en:'Fire/Ghost \u2014 burns its bone with spirit fire'}},
  {baseId:28,  slug:'sandslash-alola',  formName:'Alolan Sandslash',  region:'Alola', types:['ice','steel'],        desc:{pl:'Stalowo-lodowa forma \u2014 ostre lodowe kolce',en:'Ice/Steel form \u2014 sharp icy spikes'}},
  {baseId:37,  slug:'vulpix-alola',     formName:'Alolan Vulpix',     region:'Alola', types:['ice'],                desc:{pl:'\u015anie\u017cna lisiczka z Aloli \u2014 Snow Warning',en:'Snow fox from Alola \u2014 Snow Warning'}},
  {baseId:52,  slug:'meowth-alola',     formName:'Alolan Meowth',     region:'Alola', types:['dark'],               desc:{pl:'Mroczna forma Meowtha \u2014 zarozumia\u0142y i ciemny',en:'Dark form \u2014 conceited and cunning'}},
  {baseId:53,  slug:'persian-alola',    formName:'Alolan Persian',    region:'Alola', types:['dark'],               desc:{pl:'Okr\u0105g\u0142otwarzowy mroczny Persian \u2014 Fur Coat',en:'Round-faced Dark Persian \u2014 Fur Coat ability'}},
  {baseId:88,  slug:'grimer-alola',     formName:'Alolan Grimer',     region:'Alola', types:['poison','dark'],      desc:{pl:'Kolorowy truj\u0105cy Grimer z Aloli',en:'Colorful Poison/Dark Grimer from Alola'}},
  {baseId:89,  slug:'muk-alola',        formName:'Alolan Muk',        region:'Alola', types:['poison','dark'],      desc:{pl:'T\u0119czowy Poison/Dark Muk \u2014 Power of Alchemy',en:'Rainbow Poison/Dark Muk \u2014 Power of Alchemy'}},
  {baseId:76,  slug:'golem-alola',      formName:'Alolan Golem',      region:'Alola', types:['rock','electric'],    desc:{pl:'Elektryczny Golem \u2014 strzela namagnesowanymi kulami',en:'Electric Golem \u2014 shoots magnetized rock balls'}},
  {baseId:27,  slug:'sandshrew-alola',  formName:'Alolan Sandshrew',  region:'Alola', types:['ice','steel'],        desc:{pl:'Lodowy je\u017c stalowy z Aloli',en:'Ice/Steel hedgehog from Alola'}},
  // ── GALARIAN FORMS ──
  {baseId:77,  slug:'ponyta-galar',     formName:'Galarian Ponyta',   region:'Galar', types:['psychic'],            desc:{pl:'R\u00f3\u017cowy kucyk z Galaru \u2014 Pastel Veil',en:'Pink pony from Galar \u2014 Pastel Veil ability'}},
  {baseId:78,  slug:'rapidash-galar',   formName:'Galarian Rapidash', region:'Galar', types:['psychic','fairy'],    desc:{pl:'Psycho-bajkowy jednoróg \u2014 Fairy/Psychic coverage',en:'Psychic/Fairy unicorn \u2014 great Fairy/Psychic coverage'}},
  {baseId:80,  slug:'slowbro-galar',    formName:'Galarian Slowbro',  region:'Galar', types:['poison','psychic'],   desc:{pl:'Truciznowy Slowbro z Galaru \u2014 Shell Side Arm STAB',en:'Poison/Psychic Slowbro \u2014 Shell Side Arm STAB'}},
  {baseId:83,  slug:'farfetchd-galar',  formName:"Galarian Farfetch'd",region:'Galar',types:['fighting'],           desc:{pl:'Wojowniczy Farfetch\u0027d \u2014 ewoluuje w Sir Fetch\u0027d',en:"Fighting Farfetch'd \u2014 evolves into Sir Fetched"}},
  {baseId:110, slug:'weezing-galar',    formName:'Galarian Weezing',  region:'Galar', types:['poison','fairy'],     desc:{pl:'Bajkowy truj\u0105cy Weezing \u2014 Neutralizing Gas',en:'Poison/Fairy Weezing \u2014 Neutralizing Gas ability'}},
  {baseId:122, slug:'mr-mime-galar',    formName:'Galarian Mr. Mime', region:'Galar', types:['ice','psychic'],      desc:{pl:'Lodowy Mime z Galaru \u2014 ewoluuje w Mr. Rime',en:'Ice/Psychic Mr. Mime \u2014 evolves into Mr. Rime'}},
  {baseId:554, slug:'darmanitan-galar', formName:'Galarian Darmanitan',region:'Galar',types:['ice'],               desc:{pl:'Lodowy ba\u0142wan \u2014 Zen Mode: Ice/Fire',en:'Ice snowman \u2014 Zen Mode changes to Ice/Fire type'}},
  {baseId:618, slug:'stunfisk-galar',   formName:'Galarian Stunfisk', region:'Galar', types:['ground','steel'],     desc:{pl:'Stalowa pu\u0142apka pod\u0142ogi z Galaru',en:'Ground/Steel floor trap from Galar'}},
  {baseId:569, slug:'corsola-galar',    formName:'Galarian Corsola',  region:'Galar', types:['ghost'],              desc:{pl:'Duch martwego korala \u2014 ewoluuje w Cursola',en:'Ghost coral \u2014 evolves into Cursola'}},
  {baseId:262, slug:'linoone-galar',    formName:'Galarian Linoone',  region:'Galar', types:['dark','normal'],      desc:{pl:'Mroczny Linoone \u2014 ewoluuje w Obstagoon',en:'Dark/Normal Linoone \u2014 evolves into Obstagoon'}},
  // ── HISUIAN FORMS ──
  {baseId:58,  slug:'growlithe-hisui',  formName:'Hisuian Growlithe', region:'Hisui', types:['fire','rock'],        desc:{pl:'Skalisto-ogniowy pies z Hisui \u2014 Intimidate',en:'Fire/Rock dog from Hisui \u2014 Intimidate ability'}},
  {baseId:59,  slug:'arcanine-hisui',   formName:'Hisuian Arcanine',  region:'Hisui', types:['fire','rock'],        desc:{pl:'Legendarne Fire/Rock Arcanine \u2014 Rock Head',en:'Legendary Fire/Rock Arcanine \u2014 Rock Head ability'}},
  {baseId:100, slug:'voltorb-hisui',    formName:'Hisuian Voltorb',   region:'Hisui', types:['electric','grass'],   desc:{pl:'Drewniany Voltorb \u2014 Electric/Grass',en:'Wooden Voltorb \u2014 Electric/Grass type'}},
  {baseId:101, slug:'electrode-hisui',  formName:'Hisuian Electrode', region:'Hisui', types:['electric','grass'],   desc:{pl:'Drewniany Electrode \u2014 Chlorophyll',en:'Wooden Electrode \u2014 Chlorophyll ability'}},
  {baseId:157, slug:'typhlosion-hisui', formName:'Hisuian Typhlosion',region:'Hisui', types:['fire','ghost'],       desc:{pl:'Ognisto-duchowy Typhlosion \u2014 Frisk',en:'Fire/Ghost Typhlosion \u2014 ghostly fire'}},
  {baseId:503, slug:'samurott-hisui',   formName:'Hisuian Samurott',  region:'Hisui', types:['water','dark'],       desc:{pl:'Ciemny rycerz wodny \u2014 Water/Dark + Sharpness',en:'Water/Dark knight \u2014 Sharpness ability'}},
  {baseId:571, slug:'zoroark-hisui',    formName:'Hisuian Zoroark',   region:'Hisui', types:['normal','ghost'],     desc:{pl:'Normal/Ghost lisica \u2014 Illusion + z\u0142e duchy',en:'Normal/Ghost fox \u2014 Illusion + evil spirits'}},
  {baseId:628, slug:'braviary-hisui',   formName:'Hisuian Braviary',  region:'Hisui', types:['psychic','flying'],   desc:{pl:'Psycho-lataj\u0105cy orze\u0142 \u2014 Tinted Lens',en:'Psychic/Flying eagle \u2014 Tinted Lens ability'}},
  {baseId:724, slug:'decidueye-hisui',  formName:'Hisuian Decidueye', region:'Hisui', types:['grass','fighting'],   desc:{pl:'Waleczna sowa Grass/Fighting \u2014 Scrappy',en:'Grass/Fighting owl \u2014 Scrappy ability'}},
  // ── PALDEAN FORMS ──
  {baseId:194, slug:'wooper-paldea',    formName:'Paldean Wooper',    region:'Paldea',types:['poison','ground'],    desc:{pl:'Paldejski Wooper \u2014 Poison/Ground, ewoluuje w Clodsire',en:'Paldean Wooper \u2014 Poison/Ground, evolves into Clodsire'}},
  // ── FORMY ALTERNATYWNE ──
  {baseId:744, slug:'lycanroc-midday',    formName:'Lycanroc Midday',    region:'Forma', types:['rock'], desc:{pl:'\u2600 Ewolucja w dzie\u0144 (Poz.25) \u2014 wysoka SPD 112, Keen Eye / Sand Rush / Steadfast',en:'\u2600 Evolve at day (Lvl25) \u2014 high SPD 112, Keen Eye / Sand Rush / Steadfast'}},
  {baseId:744, slug:'lycanroc-midnight', formName:'Lycanroc Midnight',   region:'Forma', types:['rock'], desc:{pl:'\ud83c\udf19 Ewolucja w nocy (Poz.25) \u2014 wysoki ATK 115, Keen Eye / Vital Spirit / No Guard',en:'\ud83c\udf19 Evolve at night (Lvl25) \u2014 high ATK 115, Keen Eye / Vital Spirit / No Guard'}},
  {baseId:744, slug:'lycanroc-dusk',     formName:'Lycanroc Dusk',       region:'Forma', types:['rock'], desc:{pl:'\ud83c\udf06 Ewolucja o zmierzchu z Own Tempo (Poz.25) \u2014 ATK 117 + SPD 110, Tough Claws',en:'\ud83c\udf06 Evolve at dusk with Own Tempo (Lvl25) \u2014 ATK 117 + SPD 110, Tough Claws'}},
  {baseId:892, slug:'urshifu-single-strike', formName:'Urshifu Single Strike', region:'Forma', types:['fighting','dark'],  desc:{pl:'\ud83c\udff9 Wie\u017ca Ciemno\u015bci \u2014 Fighting/Dark, Wicked Blow przebija os\u0142ony',en:'\ud83c\udff9 Tower of Darkness \u2014 Fighting/Dark, Wicked Blow ignores protection'}},
  {baseId:892, slug:'urshifu-rapid-strike', formName:'Urshifu Rapid Strike', region:'Forma', types:['fighting','water'], desc:{pl:'\ud83c\udff9 Wie\u017ca Wody \u2014 Fighting/Water, Surging Strikes zawsze trafiony krytycznie',en:'\ud83c\udff9 Tower of Waters \u2014 Fighting/Water, Surging Strikes always critical hit'}},
  {baseId:479, slug:'rotom-heat',  formName:'Rotom-Heat',  region:'Forma', types:['electric','fire'],   desc:{pl:'Mikrofal\u00f3wka \u2014 Electric/Fire, Overheat STAB',en:'Microwave \u2014 Electric/Fire, Overheat STAB'}},
  {baseId:479, slug:'rotom-wash',  formName:'Rotom-Wash',  region:'Forma', types:['electric','water'],  desc:{pl:'Pralka \u2014 Electric/Water, Hydro Pump STAB \u2014 najlepszy kompetytywnie',en:'Washing machine \u2014 Electric/Water, Hydro Pump STAB \u2014 best competitively'}},
  {baseId:479, slug:'rotom-frost', formName:'Rotom-Frost', region:'Forma', types:['electric','ice'],    desc:{pl:'Zamra\u017carka \u2014 Electric/Ice, Blizzard STAB',en:'Refrigerator \u2014 Electric/Ice, Blizzard STAB'}},
  {baseId:479, slug:'rotom-fan',   formName:'Rotom-Fan',   region:'Forma', types:['electric','flying'], desc:{pl:'Wentylator \u2014 Electric/Flying, Air Slash STAB',en:'Fan \u2014 Electric/Flying, Air Slash STAB'}},
  {baseId:479, slug:'rotom-mow',   formName:'Rotom-Mow',   region:'Forma', types:['electric','grass'],  desc:{pl:'Kosiarka \u2014 Electric/Grass, Leaf Storm STAB',en:'Lawnmower \u2014 Electric/Grass, Leaf Storm STAB'}},
  {baseId:487, slug:'giratina-origin', formName:'Giratina Origin', region:'Forma', types:['ghost','dragon'], desc:{pl:'Z Platynow\u0105 Kulk\u0105 \u2014 Sp.Atk 120, Shadow Force + Levitate brak',en:'With Griseous Orb \u2014 SpAtk 120, Shadow Force + no Levitate'}},
  {baseId:641, slug:'tornadus-therian', formName:'Tornadus Therian', region:'Forma', types:['flying'], desc:{pl:'Forma Therian z Lustrem Objawienia \u2014 Regenerator + 121 Sp.Atk',en:'Therian Form with Reveal Glass \u2014 Regenerator + 121 SpAtk'}},
  {baseId:642, slug:'thundurus-therian', formName:'Thundurus Therian', region:'Forma', types:['electric','flying'], desc:{pl:'Forma Therian z Lustrem Objawienia \u2014 Volt Absorb + 145 Sp.Atk',en:'Therian Form with Reveal Glass \u2014 Volt Absorb + 145 SpAtk'}},
  {baseId:646, slug:'kyurem-black', formName:'Black Kyurem', region:'Forma', types:['dragon','ice'], desc:{pl:'Fuzja z Zekromem \u2014 ATK 170, Teravolt, Freeze Shock',en:'Fusion with Zekrom \u2014 ATK 170, Teravolt, Freeze Shock'}},
  {baseId:646, slug:'kyurem-white', formName:'White Kyurem', region:'Forma', types:['dragon','ice'], desc:{pl:'Fuzja z Reshiramem \u2014 Sp.Atk 170, Turboblaze, Ice Burn',en:'Fusion with Reshiram \u2014 SpAtk 170, Turboblaze, Ice Burn'}}
];
