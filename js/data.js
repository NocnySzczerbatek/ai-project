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
  'rockruff>lycanroc': {pl:'Poz. 25 (pora dnia)',en:'Lvl 25 (time of day)'},
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
  water:    [[130,'gyarados',['water','flying']],[260,'swampert',['water','ground']],[350,'milotic',['water']],[658,'greninja',['water','dark']],[748,'toxapex',['water','poison']],[818,'inteleon',['water']]],
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
