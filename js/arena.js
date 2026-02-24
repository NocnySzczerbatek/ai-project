/* Arena Walk — Cobblemon Battle Simulator | Logika gry, AI, ranking, Firebase */

/* ================================================================
   LANGUAGE
   ================================================================ */
let currentLang = localStorage.getItem('cob_lang') || 'pl';
const TR = {
  'title':{pl:'⚔ Arena Walk — Symulator Bitew',en:'⚔ Battle Arena — Battle Simulator'},
  'back':{pl:'Powrót',en:'Back'},
  'mode.my':{pl:'🎮 Mój Pokémon',en:'🎮 My Pokémon'},
  'mode.random':{pl:'🎲 Losuj Obu',en:'🎲 Randomize Both'},
  'mode.desc.my':{pl:'Wybierz Pokémona, ustaw IV, Naturę i Ability.',en:'Choose a Pokémon, set IVs, Nature and Ability.'},
  'mode.desc.random':{pl:'Losowy Pokémon z losowymi IV i Naturą.',en:'Random Pokémon with random IVs and Nature.'},
  'setup.player':{pl:'👤 TWÓJ POKÉMON',en:'👤 YOUR POKÉMON'},
  'setup.opponent':{pl:'🎯 PRZECIWNIK',en:'🎯 OPPONENT'},
  'setup.search':{pl:'Szukaj Pokémona...',en:'Search Pokémon...'},
  'setup.random':{pl:'🎲 Losuj Pokémona',en:'🎲 Random Pokémon'},
  'setup.ivLabel':{pl:'Individual Values (IV) — 0-31',en:'Individual Values (IV) — 0-31'},
  'setup.selectFirst':{pl:'Najpierw wybierz Pokémona',en:'Select a Pokémon first'},
  'setup.start':{pl:'⚔ ROZPOCZNIJ WALKĘ!',en:'⚔ START BATTLE!'},
  'setup.intro':{pl:'Wybierz Pokémony, dostosuj statystyki i walcz! System automatycznie dobierze najlepsze 4 ataki.',en:'Choose Pokémon, customize stats and fight! The system auto-picks the best 4 moves.'},
  'battle.nature':{pl:'Natura',en:'Nature'},
  'battle.ability':{pl:'Zdolność',en:'Ability'},
  'battle.moves':{pl:'Znane Ataki:',en:'Known Moves:'},
  'battle.faster':{pl:'Przeciwnik jest szybszy!',en:'The opponent is faster!'},
  'battle.superEff':{pl:'Bardzo skuteczne!',en:"It's super effective!"},
  'battle.notVeryEff':{pl:'Mało skuteczne...',en:"It's not very effective..."},
  'battle.noEffect':{pl:'Brak efektu!',en:'It has no effect!'},
  'battle.yourUsed':{pl:'Twój %p użył %m!',en:'Your %p used %m!'},
  'battle.oppUsed':{pl:'Wrogi %p użył %m!',en:"Foe's %p used %m!"},
  'battle.fainted':{pl:'💀 %p zemdlał!',en:'💀 %p fainted!'},
  'battle.victory':{pl:'🏆 ZWYCIĘSTWO!',en:'🏆 VICTORY!'},
  'battle.defeat':{pl:'💀 PORAŻKA!',en:'💀 DEFEAT!'},
  'battle.rematch':{pl:'🔄 Rewanż',en:'🔄 Rematch'},
  'battle.newBattle':{pl:'⚙ Nowa Walka',en:'⚙ New Battle'},
  'battle.continue':{pl:'⚔ Walcz Dalej (Streak)',en:'⚔ Continue (Streak)'},
  'battle.miss':{pl:'Atak spudłował!',en:'The attack missed!'},
  'battle.crit':{pl:'Trafienie krytyczne!',en:'Critical hit!'},
  'battle.burned':{pl:'%p został poparzony!',en:'%p was burned!'},
  'battle.paralyzed':{pl:'%p został sparaliżowany!',en:'%p was paralyzed!'},
  'battle.poisoned':{pl:'%p został zatruty!',en:'%p was poisoned!'},
  'battle.cantMove':{pl:'%p jest sparaliżowany i nie może się ruszyć!',en:"%p is paralyzed and can't move!"},
  'battle.burnDmg':{pl:'%p cierpi z powodu poparzenia! (-%d HP)',en:'%p is hurt by its burn! (-%d HP)'},
  'battle.poisonDmg':{pl:'%p cierpi z powodu zatrucia! (-%d HP)',en:'%p is hurt by poison! (-%d HP)'},
  'battle.statUp':{pl:'%s %p wzrósł o %n!',en:"%p's %s rose by %n!"},
  'battle.statDown':{pl:'%s %p spadł o %n!',en:"%p's %s fell by %n!"},
  'battle.phys':{pl:'Fiz',en:'Phys'},
  'battle.spec':{pl:'Spec',en:'Spec'},
  'battle.status':{pl:'Status',en:'Status'},
  'battle.se':{pl:'BSkut!',en:'SE!'},
  'battle.nve':{pl:'MS',en:'NVE'},
  'battle.opponentThink':{pl:'⏳ Przeciwnik myśli...',en:'⏳ Opponent is thinking...'},
  'battle.streak':{pl:'Seria zwycięstw',en:'Win Streak'},
  'battle.bestStreak':{pl:'Najlepsza seria',en:'Best Streak'},
  'coach.title':{pl:'🧠 Rada Trenera',en:'🧠 Trainer\'s Advice'},
  'coach.usePhys':{pl:'Użyj ataków FIZYCZNYCH — wróg ma niską Obronę (%d).',en:'Use PHYSICAL attacks — foe has low Defense (%d).'},
  'coach.useSpec':{pl:'Użyj ataków SPECJALNYCH — wróg ma niską Sp.Obr (%d).',en:'Use SPECIAL attacks — foe has low Sp.Def (%d).'},
  'coach.seTypes':{pl:'Typy skuteczne na wroga:',en:'Super-effective types against foe:'},
  'coach.beware':{pl:'⚠ Uważaj — wróg jest szybszy!',en:'⚠ Beware — foe is faster!'},
  'coach.youFaster':{pl:'✅ Jesteś szybszy — atakujesz pierwszy.',en:'✅ You are faster — you attack first.'},
  'coach.statusTip':{pl:'💡 Wróg nie ma statusu — rozważ nałożenie Burn/Paralyze.',en:'💡 Foe has no status — consider applying Burn/Paralyze.'},
  'coach.hpLow':{pl:'🩸 Wróg ma mało HP — skończ go!',en:'🩸 Foe has low HP — finish it off!'},
  'lb.title':{pl:'🏆 Ranking Globalny',en:'🏆 Global Leaderboard'},
  'lb.rank':{pl:'#',en:'#'},
  'lb.nick':{pl:'Nick',en:'Nick'},
  'lb.streak':{pl:'Seria',en:'Streak'},
  'lb.date':{pl:'Data',en:'Date'},
  'lb.empty':{pl:'Brak wyników. Wygraj walkę, aby pojawić się w rankingu!',en:'No results. Win a battle to appear on the leaderboard!'},
  'nick.label':{pl:'Twój nick (3-20 znaków):',en:'Your nickname (3-20 chars):'},
  'nick.placeholder':{pl:'Wpisz nick...',en:'Enter nickname...'},
  'nick.save':{pl:'💾 Zapisz wynik',en:'💾 Save Score'},
  'nick.error.length':{pl:'Nick musi mieć od 3 do 20 znaków.',en:'Nickname must be 3-20 characters.'},
  'nick.error.bad':{pl:'⛔ Nick zawiera niedozwolone treści!',en:'⛔ Nickname contains prohibited content!'},
  'nick.saved':{pl:'✅ Wynik zapisany!',en:'✅ Score saved!'},
  'noResults':{pl:'Brak wyników',en:'No results'},
  'loading':{pl:'Ładowanie...',en:'Loading...'},
};
function t(k){const e=TR[k];if(!e)return k;return e[currentLang]||e.pl||k;}
function setLang(l){
  currentLang=l;localStorage.setItem('cob_lang',l);
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===l));
  document.getElementById('btn-back-text').textContent=t('back');
  showSetup();
}

/* ================================================================
   TYPE DATA
   ================================================================ */
const TYPE_EFF={
  normal:{weak:['fighting'],resist:[],immune:['ghost']},
  fire:{weak:['water','ground','rock'],resist:['fire','grass','ice','bug','steel','fairy'],immune:[]},
  water:{weak:['electric','grass'],resist:['fire','water','ice','steel'],immune:[]},
  electric:{weak:['ground'],resist:['electric','flying','steel'],immune:[]},
  grass:{weak:['fire','ice','poison','flying','bug'],resist:['water','electric','grass','ground'],immune:[]},
  ice:{weak:['fire','fighting','rock','steel'],resist:['ice'],immune:[]},
  fighting:{weak:['flying','psychic','fairy'],resist:['bug','rock','dark'],immune:[]},
  poison:{weak:['ground','psychic'],resist:['fighting','poison','bug','grass','fairy'],immune:[]},
  ground:{weak:['water','grass','ice'],resist:['poison','rock'],immune:['electric']},
  flying:{weak:['electric','ice','rock'],resist:['fighting','bug','grass'],immune:['ground']},
  psychic:{weak:['bug','ghost','dark'],resist:['fighting','psychic'],immune:[]},
  bug:{weak:['fire','flying','rock'],resist:['fighting','ground','grass'],immune:[]},
  rock:{weak:['water','grass','fighting','ground','steel'],resist:['normal','fire','poison','flying'],immune:[]},
  ghost:{weak:['ghost','dark'],resist:['poison','bug'],immune:['normal','fighting']},
  dragon:{weak:['ice','dragon','fairy'],resist:['fire','water','electric','grass'],immune:[]},
  dark:{weak:['fighting','bug','fairy'],resist:['ghost','dark'],immune:['psychic']},
  steel:{weak:['fire','fighting','ground'],resist:['normal','grass','ice','flying','psychic','bug','rock','dragon','steel','fairy'],immune:['poison']},
  fairy:{weak:['poison','steel'],resist:['fighting','bug','dark'],immune:['dragon']}
};
const ALL_TYPES=Object.keys(TYPE_EFF);
const TYPE_NAMES_PL={normal:'Normalny',fire:'Ogień',water:'Woda',electric:'Elektryczny',grass:'Trawa',ice:'Lód',fighting:'Walka',poison:'Truc.',ground:'Ziemia',flying:'Latający',psychic:'Psycho',bug:'Robak',rock:'Skała',ghost:'Duch',dragon:'Smok',dark:'Mrok',steel:'Stal',fairy:'Bajkowy'};
const TYPE_NAMES_EN={normal:'Normal',fire:'Fire',water:'Water',electric:'Electric',grass:'Grass',ice:'Ice',fighting:'Fighting',poison:'Poison',ground:'Ground',flying:'Flying',psychic:'Psychic',bug:'Bug',rock:'Rock',ghost:'Ghost',dragon:'Dragon',dark:'Dark',steel:'Steel',fairy:'Fairy'};
function typeName(n){return currentLang==='en'?(TYPE_NAMES_EN[n]||n):(TYPE_NAMES_PL[n]||n)}
const TYPE_COLORS={normal:'#a8a878',fire:'#f08030',water:'#6890f0',electric:'#f8d030',grass:'#78c850',ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',dark:'#705848',steel:'#b8b8d0',fairy:'#ee99ac'};
function typeIcon(tp,sz){sz=sz||18;const c=TYPE_COLORS[tp]||'#888';const l=typeName(tp).substring(0,3).toUpperCase();return `<span style="display:inline-block;width:${sz}px;height:${sz}px;border-radius:50%;background:${c};text-align:center;line-height:${sz}px;font-size:${sz*.5}px;color:#fff;font-family:VT323,monospace;vertical-align:middle;margin-right:2px;border:1px solid rgba(0,0,0,.3)" title="${typeName(tp)}">${l}</span>`}

const STAT_NAMES={hp:'HP',attack:'ATK',defense:'DEF','special-attack':'SpATK','special-defense':'SpDEF',speed:'SPE'};
const STAT_COLORS_MAP={hp:'#ff5555',attack:'#f08030',defense:'#f8d030','special-attack':'#6890f0','special-defense':'#78c850',speed:'#f85888'};
const STAT_ORDER=['hp','attack','defense','special-attack','special-defense','speed'];

/* ================================================================
   NATURE DATA
   ================================================================ */
const NATURE_MODS={
  Hardy:{up:null,down:null},Lonely:{up:'attack',down:'defense'},Brave:{up:'attack',down:'speed'},
  Adamant:{up:'attack',down:'special-attack'},Naughty:{up:'attack',down:'special-defense'},
  Bold:{up:'defense',down:'attack'},Docile:{up:null,down:null},Relaxed:{up:'defense',down:'speed'},
  Impish:{up:'defense',down:'special-attack'},Lax:{up:'defense',down:'special-defense'},
  Timid:{up:'speed',down:'attack'},Hasty:{up:'speed',down:'defense'},Serious:{up:null,down:null},
  Jolly:{up:'speed',down:'special-attack'},Naive:{up:'speed',down:'special-defense'},
  Modest:{up:'special-attack',down:'attack'},Mild:{up:'special-attack',down:'defense'},
  Quiet:{up:'special-attack',down:'speed'},Bashful:{up:null,down:null},
  Rash:{up:'special-attack',down:'special-defense'},Calm:{up:'special-defense',down:'attack'},
  Gentle:{up:'special-defense',down:'defense'},Sassy:{up:'special-defense',down:'speed'},
  Careful:{up:'special-defense',down:'special-attack'},Quirky:{up:null,down:null}
};
const ALL_NATURES=Object.keys(NATURE_MODS);
const NATURE_PL={Hardy:'Twarda',Lonely:'Samotna',Brave:'Odważna',Adamant:'Zdecydowana',Naughty:'Psotna',Bold:'Zuchwała',Docile:'Uległa',Relaxed:'Spokojna',Impish:'Przekorna',Lax:'Lekkomyślna',Timid:'Nieśmiała',Hasty:'Pospieszna',Serious:'Poważna',Jolly:'Wesoła',Naive:'Naiwna',Modest:'Skromna',Mild:'Łagodna',Quiet:'Cicha',Bashful:'Wstydliwa',Rash:'Porywcza',Calm:'Spokojna',Gentle:'Delikatna',Sassy:'Zuchwała',Careful:'Ostrożna',Quirky:'Dziwaczna'};
function natName(n){return currentLang==='pl'?(NATURE_PL[n]||n):n}

/* ================================================================
   MOVE DATABASE [power, type, category, accuracy, effect]
   category: P=physical, S=special, Z=status
   effect: null | {status:'burn'|'paralyze'|'poison',target:'foe'}
           | {stages:{stat:amount},target:'self'|'foe'}
   ================================================================ */
const MOVES={
  // NORMAL
  'tackle':[40,'normal','P',100,null],'body-slam':[85,'normal','P',100,{status:'paralyze',chance:30,target:'foe'}],
  'double-edge':[120,'normal','P',100,null],'facade':[70,'normal','P',100,null],'return':[102,'normal','P',100,null],
  'quick-attack':[40,'normal','P',100,null],'extreme-speed':[80,'normal','P',100,null],
  'hyper-voice':[90,'normal','S',100,null],'boomburst':[140,'normal','S',100,null],
  'swift':[60,'normal','S',999,null],
  'swords-dance':[0,'normal','Z',999,{stages:{attack:2},target:'self'}],
  'belly-drum':[0,'normal','Z',999,{stages:{attack:6},target:'self',hpCost:.5}],
  'shell-smash':[0,'normal','Z',999,{stages:{attack:2,'special-attack':2,speed:2,defense:-1,'special-defense':-1},target:'self'}],
  'work-up':[0,'normal','Z',999,{stages:{attack:1,'special-attack':1},target:'self'}],
  'growl':[0,'normal','Z',100,{stages:{attack:-1},target:'foe'}],
  'screech':[0,'normal','Z',85,{stages:{defense:-2},target:'foe'}],
  'protect':[0,'normal','Z',999,null],'substitute':[0,'normal','Z',999,null],
  'recover':[0,'normal','Z',999,{heal:.5,target:'self'}],'rest':[0,'normal','Z',999,{heal:1,target:'self'}],
  'wish':[0,'normal','Z',999,{heal:.5,target:'self'}],
  // ELECTRIC
  'thunderbolt':[90,'electric','S',100,{status:'paralyze',chance:10,target:'foe'}],
  'thunder':[110,'electric','S',70,{status:'paralyze',chance:30,target:'foe'}],
  'wild-charge':[90,'electric','P',100,null],'volt-switch':[70,'electric','S',100,null],
  'discharge':[80,'electric','S',100,{status:'paralyze',chance:30,target:'foe'}],
  'thunder-punch':[75,'electric','P',100,{status:'paralyze',chance:10,target:'foe'}],
  'nuzzle':[20,'electric','P',100,{status:'paralyze',chance:100,target:'foe'}],
  'thunder-wave':[0,'electric','Z',90,{status:'paralyze',chance:100,target:'foe'}],
  // FIRE
  'flamethrower':[90,'fire','S',100,{status:'burn',chance:10,target:'foe'}],
  'fire-blast':[110,'fire','S',85,{status:'burn',chance:10,target:'foe'}],
  'flare-blitz':[120,'fire','P',100,{status:'burn',chance:10,target:'foe'}],
  'fire-punch':[75,'fire','P',100,{status:'burn',chance:10,target:'foe'}],
  'overheat':[130,'fire','S',90,{stages:{'special-attack':-2},target:'self'}],
  'mystical-fire':[75,'fire','S',100,{stages:{'special-attack':-1},target:'foe'}],
  'heat-wave':[95,'fire','S',90,{status:'burn',chance:10,target:'foe'}],
  'will-o-wisp':[0,'fire','Z',85,{status:'burn',chance:100,target:'foe'}],
  // WATER
  'surf':[90,'water','S',100,null],'hydro-pump':[110,'water','S',80,null],
  'waterfall':[80,'water','P',100,null],'scald':[80,'water','S',100,{status:'burn',chance:30,target:'foe'}],
  'aqua-jet':[40,'water','P',100,null],'aqua-tail':[90,'water','P',90,null],
  'liquidation':[85,'water','P',100,{stages:{defense:-1},target:'foe',chance:20}],
  'flip-turn':[60,'water','P',100,null],
  // FAIRY
  'moonblast':[95,'fairy','S',100,{stages:{'special-attack':-1},target:'foe',chance:30}],
  'dazzling-gleam':[80,'fairy','S',100,null],'play-rough':[90,'fairy','P',90,{stages:{attack:-1},target:'foe',chance:10}],
  'draining-kiss':[50,'fairy','S',100,null],
  // PSYCHIC
  'psychic':[90,'psychic','S',100,{stages:{'special-defense':-1},target:'foe',chance:10}],
  'psyshock':[80,'psychic','S',100,null],'future-sight':[120,'psychic','S',100,null],
  'zen-headbutt':[80,'psychic','P',90,null],
  'calm-mind':[0,'psychic','Z',999,{stages:{'special-attack':1,'special-defense':1},target:'self'}],
  'trick-room':[0,'psychic','Z',999,null],
  'agility':[0,'psychic','Z',999,{stages:{speed:2},target:'self'}],
  // FIGHTING
  'close-combat':[120,'fighting','P',100,{stages:{defense:-1,'special-defense':-1},target:'self'}],
  'aura-sphere':[80,'fighting','S',999,null],'drain-punch':[75,'fighting','P',100,null],
  'high-jump-kick':[130,'fighting','P',90,null],'mach-punch':[40,'fighting','P',100,null],
  'superpower':[120,'fighting','P',100,{stages:{attack:-1,defense:-1},target:'self'}],
  'focus-blast':[120,'fighting','S',70,null],
  'bulk-up':[0,'fighting','Z',999,{stages:{attack:1,defense:1},target:'self'}],
  // GROUND
  'earthquake':[100,'ground','P',100,null],'earth-power':[90,'ground','S',100,{stages:{'special-defense':-1},target:'foe',chance:10}],
  'stomping-tantrum':[75,'ground','P',100,null],
  'stealth-rock':[0,'ground','Z',999,null],'spikes':[0,'ground','Z',999,null],
  // GRASS
  'energy-ball':[90,'grass','S',100,{stages:{'special-defense':-1},target:'foe',chance:10}],
  'leaf-blade':[90,'grass','P',100,null],'giga-drain':[75,'grass','S',100,null],
  'power-whip':[120,'grass','P',85,null],'wood-hammer':[120,'grass','P',100,null],
  'leaf-storm':[130,'grass','S',90,{stages:{'special-attack':-2},target:'self'}],
  'seed-bomb':[80,'grass','P',100,null],'leech-seed':[0,'grass','Z',90,null],
  'spore':[0,'grass','Z',100,null],
  // ICE
  'ice-beam':[90,'ice','S',100,null],'blizzard':[110,'ice','S',70,null],
  'ice-punch':[75,'ice','P',100,null],'ice-shard':[40,'ice','P',100,null],
  'icicle-crash':[85,'ice','P',90,null],'freeze-dry':[70,'ice','S',100,null],
  'aurora-veil':[0,'ice','Z',999,null],
  // GHOST
  'shadow-ball':[80,'ghost','S',100,{stages:{'special-defense':-1},target:'foe',chance:20}],
  'phantom-force':[90,'ghost','P',100,null],'poltergeist':[110,'ghost','P',90,null],
  'shadow-claw':[70,'ghost','P',100,null],'shadow-sneak':[40,'ghost','P',100,null],
  'hex':[65,'ghost','S',100,null],
  // DARK
  'dark-pulse':[80,'dark','S',100,null],'crunch':[80,'dark','P',100,{stages:{defense:-1},target:'foe',chance:20}],
  'knock-off':[65,'dark','P',100,null],'sucker-punch':[70,'dark','P',100,null],
  'throat-chop':[80,'dark','P',100,null],'night-slash':[70,'dark','P',100,null],
  'nasty-plot':[0,'dark','Z',999,{stages:{'special-attack':2},target:'self'}],
  'taunt':[0,'dark','Z',100,null],
  // DRAGON
  'dragon-pulse':[85,'dragon','S',100,null],'outrage':[120,'dragon','P',100,null],
  'dragon-claw':[80,'dragon','P',100,null],'draco-meteor':[130,'dragon','S',90,{stages:{'special-attack':-2},target:'self'}],
  'dragon-dance':[0,'dragon','Z',999,{stages:{attack:1,speed:1},target:'self'}],
  // STEEL
  'iron-head':[80,'steel','P',100,null],'flash-cannon':[80,'steel','S',100,{stages:{'special-defense':-1},target:'foe',chance:10}],
  'heavy-slam':[100,'steel','P',100,null],'meteor-mash':[90,'steel','P',90,{stages:{attack:1},target:'self',chance:20}],
  'bullet-punch':[40,'steel','P',100,null],
  'iron-defense':[0,'steel','Z',999,{stages:{defense:2},target:'self'}],
  // ROCK
  'stone-edge':[100,'rock','P',80,null],'rock-slide':[75,'rock','P',90,null],
  'power-gem':[80,'rock','S',100,null],'head-smash':[150,'rock','P',80,null],
  // POISON
  'sludge-bomb':[90,'poison','S',100,{status:'poison',chance:30,target:'foe'}],
  'gunk-shot':[120,'poison','P',80,{status:'poison',chance:30,target:'foe'}],
  'poison-jab':[80,'poison','P',100,{status:'poison',chance:30,target:'foe'}],
  'toxic':[0,'poison','Z',90,{status:'poison',chance:100,target:'foe'}],
  // BUG
  'bug-buzz':[90,'bug','S',100,{stages:{'special-defense':-1},target:'foe',chance:10}],
  'x-scissor':[80,'bug','P',100,null],'u-turn':[70,'bug','P',100,null],
  'leech-life':[80,'bug','P',100,null],'first-impression':[90,'bug','P',100,null],
  'quiver-dance':[0,'bug','Z',999,{stages:{'special-attack':1,'special-defense':1,speed:1},target:'self'}],
  // FLYING
  'brave-bird':[120,'flying','P',100,null],'hurricane':[110,'flying','S',70,null],
  'air-slash':[75,'flying','S',95,null],'acrobatics':[55,'flying','P',100,null],
  'aerial-ace':[60,'flying','P',999,null],'dual-wingbeat':[40,'flying','P',90,null],
  'roost':[0,'flying','Z',999,{heal:.5,target:'self'}],
  'tailwind':[0,'flying','Z',999,null],'defog':[0,'flying','Z',999,null],
};

/* ================================================================
   PRIORITY MOVES
   ================================================================ */
const PRIORITY_MOVES=new Set(['quick-attack','extreme-speed','aqua-jet','ice-shard','mach-punch','bullet-punch','sucker-punch','shadow-sneak','first-impression']);

/* ================================================================
   SAFETY FILTER (Strict Policy)
   ================================================================ */
const BAD_WORDS_RAW=[
  // PL profanity
  'kurw','chuj','pierdol','jeba','skurw','szmata','dziwk','cipa','cipk','fiut','kutaf','kutas',
  'pedal','pedale','cwel','suka','spier','zajeb','odpierd','popierd','wypierd','napierd','dopierd',
  'rozpierd','zapier','ciota','gnoj','gnid','dupek','dupe','gowno','gówno','sranie','srac','sraj',
  // PL hate
  'negr','nygr','czarnuch','zydz','żydz','ciapak','ciapat','asfalt','bambus',
  // EN profanity
  'fuck','fuc','sh1t','shit','bitch','cunt','dick','cock','puss','tits','boob','slut','whore',
  'whor','hoe','milf','porn','onlyfans','xxx','dildo','boner','orgasm',
  // EN hate
  'nigge','nigg','nigga','fagg','faggo','trann','retard','spastic','downie',
  'chink','gook','spic','wetback','kike','towelhead','raghead','coon',
  // General hate
  'nazi','hitler','himmler','goebbels','kkk','1488','sieg heil','white power','white suprem',
  // Sexual
  'hentai','yaoi','yuri','futanari','loli','shota','nsfw','r34','rule34'
];

function normalizeText(text){
  let s=text.toLowerCase().trim();
  const map={'@':'a','$':'s','0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','!':'i','|':'l',
    '¡':'i','€':'e','ę':'e','ó':'o','ą':'a','ś':'s','ł':'l','ż':'z','ź':'z','ć':'c','ń':'n'};
  let r='';for(let i=0;i<s.length;i++){r+=(map[s[i]]||s[i])}
  r=r.replace(/[^a-z0-9 ]/g,'');
  r=r.replace(/(.)\1{2,}/g,'$1$1');
  return r;
}

function isNickSafe(nick){
  if(!nick||nick.length<3||nick.length>20)return{safe:false,reason:'length'};
  const normalized=normalizeText(nick);
  const noSpaces=normalized.replace(/\s+/g,'');
  for(const bad of BAD_WORDS_RAW){
    if(noSpaces.includes(bad)||normalized.includes(bad)){
      return{safe:false,reason:'bad'};
    }
  }
  return{safe:true};
}

/* ================================================================
   FIREBASE (optional)
   ================================================================ */
// ⚠ REPLACE with your Firebase config to enable global leaderboard
const FIREBASE_CONFIG={
  apiKey:"",
  authDomain:"",
  projectId:"",
  storageBucket:"",
  messagingSenderId:"",
  appId:""
};
let db=null;
let firebaseEnabled=false;
function initFirebase(){
  try{
    if(FIREBASE_CONFIG.apiKey&&FIREBASE_CONFIG.projectId){
      firebase.initializeApp(FIREBASE_CONFIG);
      db=firebase.firestore();
      firebaseEnabled=true;
      console.log('Firebase connected');
    }
  }catch(e){console.warn('Firebase init failed:',e)}
}

/* ================================================================
   LEADERBOARD (LocalStorage + Firebase)
   ================================================================ */
const LB_KEY='arena_leaderboard';
const NICK_KEY='arena_nick';
const STREAK_KEY='arena_streak';
const BEST_STREAK_KEY='arena_best_streak';

function getLBLocal(){try{return JSON.parse(localStorage.getItem(LB_KEY))||[]}catch(e){return[]}}
function saveLBLocal(lb){localStorage.setItem(LB_KEY,JSON.stringify(lb))}
function getSavedNick(){return localStorage.getItem(NICK_KEY)||''}
function saveNick(nick){localStorage.setItem(NICK_KEY,nick)}
function getCurrentStreak(){return parseInt(localStorage.getItem(STREAK_KEY))||0}
function setCurrentStreak(v){localStorage.setItem(STREAK_KEY,String(v))}
function getBestStreak(){return parseInt(localStorage.getItem(BEST_STREAK_KEY))||0}
function setBestStreak(v){localStorage.setItem(BEST_STREAK_KEY,String(v))}

async function saveToLeaderboard(nick,streak){
  // Local
  let lb=getLBLocal();
  const existing=lb.findIndex(e=>e.nick===nick);
  if(existing>=0){
    if(streak>lb[existing].streak){lb[existing].streak=streak;lb[existing].date=Date.now();}
  }else{
    lb.push({nick,streak,date:Date.now()});
  }
  lb.sort((a,b)=>b.streak-a.streak);
  lb=lb.slice(0,50);
  saveLBLocal(lb);
  // Firebase
  if(firebaseEnabled&&db){
    try{
      const ref=db.collection('leaderboard').doc(nick);
      const doc=await ref.get();
      if(doc.exists){
        const data=doc.data();
        if(streak>data.streak){
          await ref.update({streak,date:firebase.firestore.FieldValue.serverTimestamp()});
        }
      }else{
        await ref.set({nick,streak,date:firebase.firestore.FieldValue.serverTimestamp()});
      }
    }catch(e){console.warn('Firebase save error:',e)}
  }
}

async function loadLeaderboard(){
  if(firebaseEnabled&&db){
    try{
      const snap=await db.collection('leaderboard').orderBy('streak','desc').limit(20).get();
      const results=[];
      snap.forEach(doc=>{const d=doc.data();results.push({nick:d.nick,streak:d.streak,date:d.date?d.date.toMillis?d.date.toMillis():d.date:0})});
      if(results.length>0)return results;
    }catch(e){console.warn('Firebase load error:',e)}
  }
  return getLBLocal();
}

/* ================================================================
   STATE
   ================================================================ */
let allPokemon=[];
let detailCache={};
let setupData={player:null,opponent:null};
let battleState=null;
let searchTimeout=null;
let currentStreak=getCurrentStreak();
let bestStreak=getBestStreak();
let currentView='setup'; // setup | battle

/* ================================================================
   STAT CALCULATION
   ================================================================ */
const LEVEL=50;
const STAGE_MULTS={'-6':2/8,'-5':2/7,'-4':2/6,'-3':2/5,'-2':2/4,'-1':2/3,'0':1,'1':3/2,'2':4/2,'3':5/2,'4':6/2,'5':7/2,'6':8/2};

function calcStat(base,iv,ev,statName,nature){
  if(statName==='hp')return Math.floor(((2*base+iv+Math.floor(ev/4))*LEVEL/100))+LEVEL+10;
  let raw=Math.floor(((2*base+iv+Math.floor(ev/4))*LEVEL/100))+5;
  const mod=NATURE_MODS[nature];
  if(mod&&mod.up===statName)raw=Math.floor(raw*1.1);
  if(mod&&mod.down===statName)raw=Math.floor(raw*0.9);
  return raw;
}

function getEffStat(base,stage){
  const s=Math.max(-6,Math.min(6,stage));
  return Math.floor(base*STAGE_MULTS[String(s)]);
}

function getTypeEff(moveType,defTypes){
  let m=1;
  defTypes.forEach(dt=>{
    if(!TYPE_EFF[dt])return;
    if(TYPE_EFF[dt].immune.includes(moveType))m*=0;
    else if(TYPE_EFF[dt].weak.includes(moveType))m*=2;
    else if(TYPE_EFF[dt].resist.includes(moveType))m*=0.5;
  });
  return m;
}

/* ================================================================
   AUTO EV & NATURE & MOVES
   ================================================================ */
function detectRole(sm){
  const a=sm.attack||0,sa=sm['special-attack']||0,d=sm.defense||0,sd=sm['special-defense']||0,sp=sm.speed||0;
  return{isPhys:a>=sa+15,isSpec:sa>=a+15,isMixed:!(a>=sa+15)&&!(sa>=a+15),isTank:(d+sd)/2>=90&&sp<80,isFast:sp>=80};
}

function autoEV(sm){
  const r=detectRole(sm);
  const ev={hp:0,attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0};
  if(r.isPhys&&r.isFast){ev.attack=252;ev.speed=252;ev.hp=4}
  else if(r.isPhys){ev.attack=252;ev.hp=252;ev.defense=4}
  else if(r.isSpec&&r.isFast){ev['special-attack']=252;ev.speed=252;ev.hp=4}
  else if(r.isSpec){ev['special-attack']=252;ev.hp=252;ev['special-defense']=4}
  else if(r.isTank){ev.hp=252;ev.defense=128;ev['special-defense']=128}
  else{ev.hp=4;ev.attack=126;ev['special-attack']=126;ev.speed=252}
  return ev;
}

function autoNature(sm){
  const r=detectRole(sm);
  if(r.isPhys&&r.isFast)return'Jolly';
  if(r.isPhys)return'Adamant';
  if(r.isSpec&&r.isFast)return'Timid';
  if(r.isSpec)return'Modest';
  return'Hardy';
}

function selectMoves(pokemonData,types,sm){
  const r=detectRole(sm);
  const typeSet=new Set(types);
  const pool=[];
  pokemonData.moves.forEach(m=>{
    const vgd=m.version_group_details.slice().sort((a,b)=>b.version_group.url.localeCompare(a.version_group.url,undefined,{numeric:true}))[0];
    if(!vgd)return;
    const method=vgd.move_learn_method.name;
    if(!['level-up','machine','egg'].includes(method))return;
    const nm=m.move.name;
    const md=MOVES[nm];
    if(!md)return;
    const[power,mtype,cat,acc,eff]=md;
    let score=0;
    if(cat==='Z'){
      // Status moves
      if(eff&&eff.stages){
        const selfBuff=eff.target==='self';
        const totalStages=Object.values(eff.stages).reduce((a,b)=>a+Math.abs(b),0);
        score=selfBuff?(totalStages*30+20):(totalStages*25+15);
      }else if(eff&&eff.status){
        score=60;
      }else if(eff&&eff.heal){
        score=50;
      }else{score=10}
    }else{
      score=power;
      if((r.isPhys&&cat==='P')||(r.isSpec&&cat==='S'))score*=1.4;
      if(r.isPhys&&cat==='S')score*=0.3;
      if(r.isSpec&&cat==='P')score*=0.3;
      if(typeSet.has(mtype))score*=1.5;
      if(PRIORITY_MOVES.has(nm))score+=25;
      score*=(acc>=100||acc===999)?1:(acc/100);
    }
    pool.push({name:nm,power,type:mtype,category:cat,accuracy:acc,score,effect:eff});
  });
  const seen=new Set();
  const unique=pool.filter(m=>{if(seen.has(m.name))return false;seen.add(m.name);return true});
  unique.sort((a,b)=>b.score-a.score);
  // Pick max 1 status, rest damage, with type diversity
  const chosen=[];const typeCounts={};let statusCount=0;
  for(let i=0;i<unique.length&&chosen.length<4;i++){
    const m=unique[i];
    if(m.category==='Z'){
      if(statusCount>=1)continue;
      statusCount++;
    }else{
      const tc=typeCounts[m.type]||0;
      if(tc>=2)continue;
      typeCounts[m.type]=(tc||0)+1;
    }
    chosen.push(m);
  }
  for(let i=0;i<unique.length&&chosen.length<4;i++){
    if(!chosen.includes(unique[i]))chosen.push(unique[i]);
  }
  if(!chosen.length)chosen.push({name:'tackle',power:40,type:'normal',category:'P',accuracy:100,score:40,effect:null});
  return chosen;
}

/* ================================================================
   BUILD POKEMON
   ================================================================ */
async function buildPokemon(id,ivs,nature,abilitySlug){
  let data=detailCache[id];
  if(!data){
    const res=await fetch('https://pokeapi.co/api/v2/pokemon/'+id);
    const p=await res.json();
    data={p};detailCache[id]=data;
  }
  const p=data.p;
  const types=p.types.map(t=>t.type.name);
  const sm={};p.stats.forEach(s=>{sm[s.stat.name]=s.base_stat});
  const evs=autoEV(sm);
  const computed={};
  STAT_ORDER.forEach(sn=>{computed[sn]=calcStat(sm[sn]||50,ivs[sn]||0,evs[sn]||0,sn,nature)});
  const moves=selectMoves(p,types,sm);
  const ability=abilitySlug||(p.abilities[0]?p.abilities[0].ability.name:'unknown');
  const artwork=(p.sprites?.other?.['official-artwork']?.front_default)||'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png';
  return{
    id,name:p.name,types,baseStats:sm,ivs,evs,nature,ability,
    computedStats:computed,moves,
    maxHp:computed.hp,currentHp:computed.hp,
    sprite:p.sprites.front_default||'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png',
    artwork,
    status:null, // burn|paralyze|poison|null
    stages:{attack:0,defense:0,'special-attack':0,'special-defense':0,speed:0}
  };
}

function randomIVs(){const iv={};STAT_ORDER.forEach(s=>{iv[s]=Math.floor(Math.random()*32)});return iv}

/* ================================================================
   DAMAGE CALC (v2.0 with accuracy, crits, status, stages)
   ================================================================ */
function calcDamage(attacker,defender,move){
  if(move.power===0)return{damage:0,effectiveness:1,crit:false,missed:false};
  // Accuracy check
  const acc=move.accuracy===999?100:move.accuracy;
  if(Math.random()*100>=acc)return{damage:0,effectiveness:1,crit:false,missed:true};
  let atkStat,defStat;
  if(move.category==='P'){
    atkStat=getEffStat(attacker.computedStats.attack,attacker.stages.attack);
    defStat=getEffStat(defender.computedStats.defense,defender.stages.defense);
    // Burn halves physical attack
    if(attacker.status==='burn')atkStat=Math.floor(atkStat*0.5);
  }else{
    atkStat=getEffStat(attacker.computedStats['special-attack'],attacker.stages['special-attack']);
    defStat=getEffStat(defender.computedStats['special-defense'],defender.stages['special-defense']);
  }
  let dmg=((2*LEVEL/5+2)*move.power*atkStat/defStat)/50+2;
  // STAB
  if(attacker.types.includes(move.type))dmg*=1.5;
  // Type effectiveness
  const eff=getTypeEff(move.type,defender.types);
  dmg*=eff;
  // Critical hit (6.25%)
  const crit=Math.random()<0.0625;
  if(crit)dmg*=1.5;
  // Random factor
  dmg*=(0.85+Math.random()*0.15);
  return{damage:Math.max(1,Math.floor(dmg)),effectiveness:eff,crit,missed:false};
}

/* ================================================================
   BATTLE ENGINE
   ================================================================ */
function addLog(msg,type){battleState.log.push({msg,type:type||'neutral'})}

function processStatusDamage(poke,label){
  if(!poke.status||poke.currentHp<=0)return;
  if(poke.status==='burn'){
    const dmg=Math.max(1,Math.floor(poke.maxHp/16));
    poke.currentHp=Math.max(0,poke.currentHp-dmg);
    addLog(t('battle.burnDmg').replace('%p',poke.name).replace('%d',dmg),'log-status');
  }else if(poke.status==='poison'){
    const dmg=Math.max(1,Math.floor(poke.maxHp/8));
    poke.currentHp=Math.max(0,poke.currentHp-dmg);
    addLog(t('battle.poisonDmg').replace('%p',poke.name).replace('%d',dmg),'log-status');
  }
}

function canMove(poke){
  if(poke.status==='paralyze'&&Math.random()<0.25){
    addLog(t('battle.cantMove').replace('%p',poke.name),'log-status');
    return false;
  }
  return true;
}

function applyMoveEffects(move,attacker,defender,result){
  if(!move.effect)return;
  const eff=move.effect;
  // Status application
  if(eff.status&&eff.target==='foe'&&!defender.status){
    const chance=eff.chance||0;
    if(result.missed)return; // don't apply on miss
    if(Math.random()*100<chance){
      defender.status=eff.status;
      const msgs={'burn':t('battle.burned'),'paralyze':t('battle.paralyzed'),'poison':t('battle.poisoned')};
      addLog((msgs[eff.status]||'').replace('%p',defender.name),'log-status');
    }
  }
  // Stat stages
  if(eff.stages){
    const target=eff.target==='self'?attacker:defender;
    // For damage moves, secondary effects only trigger on hit with chance
    if(move.power>0&&eff.target==='foe'){
      if(result.missed)return;
      const chance=eff.chance||100;
      if(Math.random()*100>=chance)return;
    }
    for(const[stat,amount]of Object.entries(eff.stages)){
      const old=target.stages[stat]||0;
      const nu=Math.max(-6,Math.min(6,old+amount));
      target.stages[stat]=nu;
      const diff=nu-old;
      if(diff!==0){
        const statLabel=STAT_NAMES[stat]||stat;
        if(diff>0)addLog(t('battle.statUp').replace('%s',statLabel).replace('%p',target.name).replace('%n','+'+diff),'log-stage');
        else addLog(t('battle.statDown').replace('%s',statLabel).replace('%p',target.name).replace('%n',diff),'log-stage');
      }
    }
  }
  // Healing
  if(eff.heal&&eff.target==='self'&&!result.missed){
    const healAmt=Math.floor(attacker.maxHp*eff.heal);
    attacker.currentHp=Math.min(attacker.maxHp,attacker.currentHp+healAmt);
    addLog(`${attacker.name} ${currentLang==='pl'?'odzyskał':'recovered'} ${healAmt} HP!`,'log-stage');
  }
}

function executeMove(attacker,defender,move,isPlayer){
  const mn=move.name.replace(/-/g,' ');
  const label=isPlayer?t('battle.yourUsed'):t('battle.oppUsed');
  // Status moves
  if(move.category==='Z'){
    addLog(label.replace('%p',attacker.name).replace('%m',mn),'neutral');
    if(move.effect){
      applyMoveEffects(move,attacker,defender,{missed:false});
    }
    return{damage:0,effectiveness:1,crit:false,missed:false};
  }
  const result=calcDamage(attacker,defender,move);
  if(result.missed){
    addLog(label.replace('%p',attacker.name).replace('%m',mn)+' — '+t('battle.miss'),'log-miss');
    showFloatingText(isPlayer?'opponent':'player','MISS!','float-miss');
    return result;
  }
  defender.currentHp=Math.max(0,defender.currentHp-result.damage);
  let effMsg='';let logType='neutral';
  if(result.effectiveness>=2){effMsg=' ('+t('battle.superEff')+')';logType='log-se';showFloatingText(isPlayer?'opponent':'player',currentLang==='pl'?'B.SKUTECZNE!':'SUPER EFF!','float-se')}
  else if(result.effectiveness>0&&result.effectiveness<1){effMsg=' ('+t('battle.notVeryEff')+')';logType='log-nve';showFloatingText(isPlayer?'opponent':'player',currentLang==='pl'?'MAŁO SKUT.':'NOT VERY EFF','float-nve')}
  else if(result.effectiveness===0){effMsg=' ('+t('battle.noEffect')+')';logType='log-imm'}
  let critMsg=result.crit?' ⚡'+t('battle.crit'):'';
  if(result.crit){showFloatingText(isPlayer?'opponent':'player','CRITICAL HIT!','float-crit')}
  showFloatingText(isPlayer?'opponent':'player','-'+result.damage+' HP','float-dmg');
  addLog(label.replace('%p',attacker.name).replace('%m',mn)+' (-'+result.damage+' HP)'+effMsg+critMsg,logType);
  // Shake animation on defender
  triggerShake(isPlayer?'opponent':'player');
  // Attack dash on attacker
  triggerDash(isPlayer?'player':'opponent',isPlayer);
  // Apply secondary effects
  applyMoveEffects(move,attacker,defender,result);
  return result;
}

function getEffSpeed(poke){
  let spd=getEffStat(poke.computedStats.speed,poke.stages.speed);
  if(poke.status==='paralyze')spd=Math.floor(spd*0.5);
  return spd;
}

/* ================================================================
   AI OPPONENT
   ================================================================ */
function aiPickMove(opponent,player){
  let bestMove=null,bestScore=-1;
  opponent.moves.forEach(m=>{
    let score=0;
    if(m.category==='Z'){
      // Status moves
      if(m.effect&&m.effect.stages&&m.effect.target==='self'){
        const hasLowStages=Object.values(opponent.stages).some(s=>s<2);
        score=hasLowStages?45:10;
      }else if(m.effect&&m.effect.status&&!player.status){
        score=55;
      }else if(m.effect&&m.effect.heal){
        score=opponent.currentHp<opponent.maxHp*0.4?70:15;
      }else{score=5}
    }else{
      const eff=getTypeEff(m.type,player.types);
      score=m.power*eff;
      if(opponent.types.includes(m.type))score*=1.5;
      if(m.category==='P'&&opponent.computedStats.attack>opponent.computedStats['special-attack'])score*=1.1;
      if(m.category==='S'&&opponent.computedStats['special-attack']>opponent.computedStats.attack)score*=1.1;
      score*=((m.accuracy>=100||m.accuracy===999)?1:m.accuracy/100);
    }
    // Add small random variance for unpredictability
    score*=(0.9+Math.random()*0.2);
    if(score>bestScore){bestScore=score;bestMove=m}
  });
  return bestMove||opponent.moves[0];
}

/* ================================================================
   AI COACHING PANEL
   ================================================================ */
function generateCoachingTips(){
  if(!battleState)return'';
  const p=battleState.player,o=battleState.opponent;
  const tips=[];
  // Physical vs Special recommendation
  const oDef=getEffStat(o.computedStats.defense,o.stages.defense);
  const oSpd=getEffStat(o.computedStats['special-defense'],o.stages['special-defense']);
  if(oDef<oSpd)tips.push({cls:'coach-phys',icon:'💪',text:t('coach.usePhys').replace('%d',oDef)});
  else tips.push({cls:'coach-spec',icon:'🔮',text:t('coach.useSpec').replace('%d',oSpd)});
  // Super-effective types
  const seTypes=ALL_TYPES.filter(tp=>{const e=getTypeEff(tp,o.types);return e>=2});
  if(seTypes.length){
    tips.push({cls:'coach-info',icon:'🎯',text:t('coach.seTypes')+' '+seTypes.map(tp=>`<span class="type-badge type-${tp}" style="font-size:12px;padding:1px 6px">${typeName(tp)}</span>`).join(' ')});
  }
  // Speed comparison
  const pSpd=getEffSpeed(p),oSpdEff=getEffSpeed(o);
  if(oSpdEff>pSpd)tips.push({cls:'coach-warn',icon:'⚡',text:t('coach.beware')});
  else tips.push({cls:'coach-info',icon:'✅',text:t('coach.youFaster')});
  // Status tip
  if(!o.status)tips.push({cls:'coach-info',icon:'💡',text:t('coach.statusTip')});
  // Low HP
  if(o.currentHp<o.maxHp*0.25)tips.push({cls:'coach-phys',icon:'🩸',text:t('coach.hpLow')});
  return`<div class="coaching-panel"><h3>${t('coach.title')}</h3>${tips.map(tip=>`<div class="coach-tip ${tip.cls}"><span class="tip-icon">${tip.icon}</span>${tip.text}</div>`).join('')}</div>`;
}

/* ================================================================
   ANIMATIONS
   ================================================================ */
function showFloatingText(side,text,cls){
  setTimeout(()=>{
    const wrap=document.getElementById('b-img-wrap-'+side);
    if(!wrap)return;
    const el=document.createElement('div');
    el.className='float-text '+cls;
    el.textContent=text;
    el.style.left=(10+Math.random()*40)+'px';
    el.style.top='10px';
    wrap.appendChild(el);
    setTimeout(()=>el.remove(),1300);
  },100);
}

function triggerShake(side){
  const img=document.getElementById('b-img-'+side);
  if(!img)return;
  img.classList.remove('shake');
  void img.offsetWidth;
  img.classList.add('shake');
}

function triggerDash(side,isRight){
  const img=document.getElementById('b-img-'+side);
  if(!img)return;
  const cls=isRight?'attack-dash-right':'attack-dash-left';
  img.classList.remove(cls);
  void img.offsetWidth;
  img.classList.add(cls);
}

function getHpColor(pct){return pct>50?'#55ff55':pct>20?'#f8d030':'#ff5555'}

/* ================================================================
   RENDER: SETUP
   ================================================================ */
async function showSetup(){
  currentView='setup';
  battleState=null;
  setupData={player:null,opponent:null};
  const app=document.getElementById('app');
  const natureOpts=ALL_NATURES.map(n=>{
    const nm=NATURE_MODS[n];
    let hint='';
    if(nm.up&&nm.down)hint=` (+${STAT_NAMES[nm.up]||nm.up} / -${STAT_NAMES[nm.down]||nm.down})`;
    return`<option value="${n}">${natName(n)} (${n})${hint}</option>`;
  }).join('');

  function cardHTML(side,label,color){
    const ivInputs=STAT_ORDER.map(sn=>`<div class="iv-box"><label style="color:${STAT_COLORS_MAP[sn]||'#888'}">${STAT_NAMES[sn]||sn}</label><input type="number" min="0" max="31" value="31" id="biv-${side}-${sn}" onchange="updateFromInputs('${side}')"/></div>`).join('');
    return`<div class="mc-panel setup-card ${side}"><h3>${label}</h3>`+
      `<button class="random-btn" onclick="randomPokemon('${side}')">${t('setup.random')}</button>`+
      `<div class="search-wrap"><input class="mc-input" id="search-${side}" type="text" placeholder="${t('setup.search')}" oninput="onSearch('${side}',this)" autocomplete="off"/>`+
      `<div class="search-results" id="search-results-${side}"></div></div>`+
      `<div id="preview-${side}" style="min-height:50px"><div style="color:#555;text-align:center;padding:16px;font-size:16px">${t('setup.selectFirst')}</div></div>`+
      `<div style="margin-top:6px;font-size:13px;color:#888">${t('setup.ivLabel')}:</div>`+
      `<div class="iv-grid">${ivInputs}</div>`+
      `<div class="sel-row"><label>${t('battle.nature')}</label><select id="bnat-${side}" onchange="updateFromInputs('${side}')">${natureOpts}</select></div>`+
      `<div class="sel-row"><label>${t('battle.ability')}</label><select id="babil-${side}" onchange="updateFromInputs('${side}')"><option>${t('setup.selectFirst')}</option></select></div></div>`;
  }

  app.innerHTML=`<div class="page-title"><span>${t('title')}</span></div>`+
    `<div style="text-align:center;margin-bottom:14px;font-size:16px;color:#888">${t('setup.intro')}</div>`+
    `<div class="mode-bar">`+
    `<button class="mode-btn mode-random" onclick="randomBoth()">${t('mode.random')}</button>`+
    `</div>`+
    `<div class="setup-grid">${cardHTML('player',t('setup.player'),'var(--green)')}${cardHTML('opponent',t('setup.opponent'),'var(--red)')}</div>`+
    `<div class="start-wrap"><button class="start-btn" id="start-btn" onclick="startBattle()" disabled>⚔ ${t('setup.start')}</button></div>`+
    `<div class="streak-display" style="text-align:center">${t('battle.streak')}: <span style="color:var(--green)">${currentStreak}</span> | ${t('battle.bestStreak')}: <span style="color:var(--gold)">${bestStreak}</span></div>`+
    `<div id="leaderboard-container"></div>`;
  // Load leaderboard asynchronously
  renderLeaderboardSection().then(html=>{
    const container=document.getElementById('leaderboard-container');
    if(container)container.outerHTML=html;
  });
}

async function renderLeaderboardSection(){
  const lb=await loadLeaderboard();
  if(!lb.length)return`<div class="mc-panel leaderboard" style="margin-top:20px"><h2>${t('lb.title')}</h2><div style="color:#555;text-align:center;padding:20px">${t('lb.empty')}</div></div>`;
  const rows=lb.slice(0,15).map((e,i)=>{
    const rankCls=i===0?'lb-rank-1':i===1?'lb-rank-2':i===2?'lb-rank-3':'';
    const d=e.date?new Date(e.date).toLocaleDateString():'—';
    return`<tr><td class="lb-rank ${rankCls}">${i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</td><td class="lb-nick" title="${e.nick}">${e.nick}</td><td class="lb-streak">${e.streak}🔥</td><td style="color:#666;font-size:13px">${d}</td></tr>`;
  }).join('');
  return`<div class="mc-panel leaderboard" style="margin-top:20px"><h2>${t('lb.title')}</h2><table class="lb-table"><thead><tr><th>${t('lb.rank')}</th><th>${t('lb.nick')}</th><th>${t('lb.streak')}</th><th>${t('lb.date')}</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ================================================================
   SEARCH & SELECT
   ================================================================ */
function onSearch(side,input){
  clearTimeout(searchTimeout);
  const q=input.value.trim().toLowerCase();
  const results=document.getElementById('search-results-'+side);
  if(q.length<2){results.classList.remove('open');return}
  searchTimeout=setTimeout(()=>{
    const matches=allPokemon.filter(p=>p.name.includes(q)||String(p.id).includes(q)).slice(0,8);
    if(!matches.length){results.innerHTML=`<div class="search-item" style="color:#666">${t('noResults')}</div>`;results.classList.add('open');return}
    results.innerHTML=matches.map(p=>`<div class="search-item" onclick="pickPokemon('${side}',${p.id})"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png"/><span>${p.name}</span><span style="color:#666;margin-left:auto">#${String(p.id).padStart(3,'0')}</span></div>`).join('');
    results.classList.add('open');
  },200);
}

async function pickPokemon(side,id){
  document.getElementById('search-results-'+side).classList.remove('open');
  const inp=document.getElementById('search-'+side);
  if(inp)inp.value='';
  let data=detailCache[id];
  if(!data){
    const res=await fetch('https://pokeapi.co/api/v2/pokemon/'+id);
    const p=await res.json();
    data={p};detailCache[id]=data;
  }
  const sm={};data.p.stats.forEach(s=>{sm[s.stat.name]=s.base_stat});
  const ivs={};STAT_ORDER.forEach(sn=>{ivs[sn]=31});
  const nature=autoNature(sm);
  const ability=data.p.abilities[0]?data.p.abilities[0].ability.name:'unknown';
  const pokemon=await buildPokemon(id,ivs,nature,ability);
  setupData[side]={id,ivs,nature,ability,pokemon,data};
  renderPreview(side);
}

async function randomPokemon(side){
  const poke=allPokemon[Math.floor(Math.random()*allPokemon.length)];
  let data=detailCache[poke.id];
  if(!data){
    const res=await fetch('https://pokeapi.co/api/v2/pokemon/'+poke.id);
    const p=await res.json();
    data={p};detailCache[poke.id]=data;
  }
  const ivs=randomIVs();
  const nature=ALL_NATURES[Math.floor(Math.random()*ALL_NATURES.length)];
  const abilities=data.p.abilities;
  const ability=abilities.length?abilities[Math.floor(Math.random()*abilities.length)].ability.name:'unknown';
  const pokemon=await buildPokemon(poke.id,ivs,nature,ability);
  setupData[side]={id:poke.id,ivs,nature,ability,pokemon,data};
  renderPreview(side);
}

async function randomBoth(){
  await randomPokemon('player');
  await randomPokemon('opponent');
}

function renderPreview(side){
  const s=setupData[side];
  if(!s)return;
  const p=s.pokemon;
  const container=document.getElementById('preview-'+side);
  if(!container)return;
  const typesH=p.types.map(tp=>`<span class="type-badge type-${tp}" style="font-size:12px;padding:1px 6px">${typeName(tp)}</span>`).join('');
  const movesH=p.moves.map(m=>`<span class="move-chip">${typeIcon(m.type,14)} ${m.name.replace(/-/g,' ')} <span style="color:#f8d030;font-size:12px">${m.power||'—'}</span> <span style="color:#888;font-size:11px">${m.accuracy===999?'∞':m.accuracy+'%'}</span></span>`).join('');
  container.innerHTML=`<div class="preview"><img src="${p.artwork}" onerror="this.src='${p.sprite}'"/>`+
    `<div><div class="preview-name">${p.name}</div><div class="preview-types">${typesH}</div>`+
    `<div style="font-size:13px;color:#888;margin-top:3px">HP: ${p.maxHp} | ${t('battle.nature')}: ${natName(p.nature)}</div></div></div>`+
    `<div style="margin-top:4px"><div style="font-size:13px;color:#888;margin-bottom:3px">${t('battle.moves')}:</div>${movesH}</div>`;
  // Update IV inputs
  STAT_ORDER.forEach(sn=>{const inp=document.getElementById('biv-'+side+'-'+sn);if(inp)inp.value=s.ivs[sn]});
  const natSel=document.getElementById('bnat-'+side);
  if(natSel)natSel.value=s.nature;
  const abilSel=document.getElementById('babil-'+side);
  if(abilSel){
    abilSel.innerHTML='';
    s.data.p.abilities.forEach(a=>{
      const opt=document.createElement('option');
      opt.value=a.ability.name;
      opt.textContent=a.ability.name.replace(/-/g,' ')+(a.is_hidden?` [${currentLang==='en'?'hidden':'ukryta'}]`:'');
      if(a.ability.name===s.ability)opt.selected=true;
      abilSel.appendChild(opt);
    });
  }
  document.getElementById('start-btn').disabled=!(setupData.player&&setupData.opponent);
}

async function updateFromInputs(side){
  const s=setupData[side];
  if(!s)return;
  const ivs={};
  STAT_ORDER.forEach(sn=>{const inp=document.getElementById('biv-'+side+'-'+sn);ivs[sn]=inp?Math.min(31,Math.max(0,parseInt(inp.value)||0)):s.ivs[sn]});
  const natSel=document.getElementById('bnat-'+side);
  const nature=natSel?natSel.value:s.nature;
  const abilSel=document.getElementById('babil-'+side);
  const ability=abilSel?abilSel.value:s.ability;
  s.ivs=ivs;s.nature=nature;s.ability=ability;
  s.pokemon=await buildPokemon(s.id,ivs,nature,ability);
  renderPreview(side);
}

/* ================================================================
   START BATTLE
   ================================================================ */
async function startBattle(){
  if(!setupData.player||!setupData.opponent)return;
  await updateFromInputs('player');
  await updateFromInputs('opponent');
  battleState={
    player:JSON.parse(JSON.stringify(setupData.player.pokemon)),
    opponent:JSON.parse(JSON.stringify(setupData.opponent.pokemon)),
    log:[],turn:0,isPlayerTurn:true,battleOver:false
  };
  // Determine who goes first
  const pSpd=getEffSpeed(battleState.player),oSpd=getEffSpeed(battleState.opponent);
  if(oSpd>pSpd)battleState.isPlayerTurn=false;
  currentView='battle';
  renderArena();
  if(!battleState.isPlayerTurn){
    addLog(t('battle.faster'),'neutral');
    renderArena();
    setTimeout(()=>aiTurn(),1200);
  }
}

/* ================================================================
   RENDER: BATTLE ARENA
   ================================================================ */
function renderArena(){
  if(!battleState)return;
  const app=document.getElementById('app');
  const p=battleState.player,o=battleState.opponent;
  const pHpPct=Math.max(0,p.currentHp/p.maxHp*100);
  const oHpPct=Math.max(0,o.currentHp/o.maxHp*100);

  // Player move buttons
  const moveBtns=p.moves.map((m,i)=>{
    const eff=getTypeEff(m.type,o.types);
    let effCls='',effTxt='';
    if(m.category!=='Z'){
      if(eff>=2){effCls=' super-effective';effTxt=`<span class="m-eff se">${t('battle.se')}</span>`}
      else if(eff>0&&eff<1){effCls=' not-very-effective';effTxt=`<span class="m-eff nve">${t('battle.nve')}</span>`}
      else if(eff===0){effCls=' immune';effTxt=`<span class="m-eff imm">IMM</span>`}
    }
    const dis=battleState.battleOver||!battleState.isPlayerTurn?' disabled':'';
    const catL=m.category==='P'?t('battle.phys'):m.category==='S'?t('battle.spec'):t('battle.status');
    const accStr=m.accuracy===999?'∞':m.accuracy+'%';
    return`<button class="move-btn${effCls}"${dis} onclick="playerMove(${i})">${effTxt}`+
      `<span class="m-name">${typeIcon(m.type,16)} ${m.name.replace(/-/g,' ')}</span>`+
      `<span class="m-meta"><span>${catL}</span>|<span style="color:#f8d030">PWR:${m.power||'—'}</span>|<span class="m-acc">ACC:${accStr}</span></span></button>`;
  }).join('');

  function renderStages(stages){
    const entries=Object.entries(stages).filter(([k,v])=>v!==0);
    if(!entries.length)return'';
    return`<div class="stages-bar">${entries.map(([k,v])=>{
      const cls=v>0?'stage-up':'stage-down';
      return`<span class="stage-chip ${cls}">${STAT_NAMES[k]||k} ${v>0?'+':''}${v}</span>`;
    }).join('')}</div>`;
  }

  function renderStatus(status){
    if(!status)return'';
    const labels={burn:'BRN 🔥',paralyze:'PAR ⚡',poison:'PSN ☠'};
    return`<span class="status-badge status-${status}">${labels[status]||status}</span>`;
  }

  function renderStatPreview(poke){
    return`<div class="stat-preview">${STAT_ORDER.map(sn=>{
      const base=poke.computedStats[sn];
      const stage=poke.stages[sn]||0;
      const eff=sn==='hp'?poke.currentHp:getEffStat(base,stage);
      let color=STAT_COLORS_MAP[sn]||'#888';
      if(stage>0)color=`var(--green)`;
      if(stage<0)color=`var(--red)`;
      return`<div class="stat-item"><span class="s-name" style="color:${STAT_COLORS_MAP[sn]||'#888'}">${STAT_NAMES[sn]||sn}</span><span class="s-val" style="color:${color}">${eff}${stage!==0&&sn!=='hp'?` (${stage>0?'+':''}${stage})`:''}</span></div>`;
    }).join('')}</div>`;
  }

  const pTypesH=p.types.map(tp=>`<span class="type-badge type-${tp}" style="font-size:12px;padding:1px 6px">${typeName(tp)}</span>`).join('');
  const oTypesH=o.types.map(tp=>`<span class="type-badge type-${tp}" style="font-size:12px;padding:1px 6px">${typeName(tp)}</span>`).join('');
  const logHTML=battleState.log.map(e=>`<div class="log-entry ${e.type}">${e.msg}</div>`).join('');
  const waitHTML=(!battleState.isPlayerTurn&&!battleState.battleOver)?`<div class="waiting">${t('battle.opponentThink')}</div>`:'';
  const coachHTML=(!battleState.battleOver)?generateCoachingTips():'';

  // Opponent known moves
  const oMovesH=o.moves.map(m=>`<span class="move-chip">${typeIcon(m.type,14)} ${m.name.replace(/-/g,' ')} <span style="color:#f8d030;font-size:12px">${m.power||'—'}</span></span>`).join('');

  let resultHTML='';
  if(battleState.battleOver){
    const isWin=o.currentHp<=0;
    const streakInfo=`<div class="streak-display">${t('battle.streak')}: <span style="color:var(--green)">${currentStreak}</span> | ${t('battle.bestStreak')}: <span style="color:var(--gold)">${bestStreak}</span></div>`;
    const nickVal=getSavedNick();
    const nickSection=isWin?`<div class="nick-section"><label>${t('nick.label')}</label>`+
      `<input class="mc-input" id="nick-input" type="text" maxlength="20" placeholder="${t('nick.placeholder')}" value="${nickVal}" oninput="validateNick()"/>`+
      `<div class="nick-error" id="nick-error"></div>`+
      `<button class="mc-btn mc-btn-green save-btn" id="save-btn" onclick="saveScore()">${t('nick.save')}</button></div>`:'';
    resultHTML=`<div class="result-panel ${isWin?'victory':'defeat'}"><h2>${isWin?t('battle.victory'):t('battle.defeat')}</h2>`+
      `<div style="font-size:18px;color:#aaa">${isWin?t('battle.victory'):t('battle.defeat')}</div>`+
      streakInfo+
      `<div class="result-buttons">`+
      `<button class="mc-btn mc-btn-green" onclick="startBattle()">${t('battle.rematch')}</button>`+
      (isWin?`<button class="mc-btn mc-btn-green" onclick="continueStreak()">${t('battle.continue')}</button>`:'')+
      `<button class="mc-btn" onclick="showSetup()">${t('battle.newBattle')}</button></div>`+
      nickSection+`</div>`;
  }

  app.innerHTML=`<div class="page-title"><span>⚔ ${currentLang==='pl'?'Arena Walk':'Battle Arena'} — ${currentLang==='pl'?'Tura':'Turn'} ${battleState.turn+1}</span></div>`+
    `<div class="battle-grid">`+
    // PLAYER CARD
    `<div class="mc-panel battle-card player-card">`+
    `<div style="font-family:'Press Start 2P',monospace;font-size:9px;color:var(--green);margin-bottom:6px">${t('setup.player')}</div>`+
    `<div class="b-header"><div class="b-img-wrap" id="b-img-wrap-player"><img class="b-img" id="b-img-player" src="${p.artwork}" onerror="this.src='${p.sprite}'"/></div>`+
    `<div><div class="b-name">${p.name}</div><div class="preview-types">${pTypesH}</div>${renderStatus(p.status)}<div class="b-meta">${natName(p.nature)} | ${p.ability.replace(/-/g,' ')}</div></div></div>`+
    `<div class="hp-section"><div class="hp-label"><span class="hp-text">HP</span><span class="hp-val">${Math.max(0,p.currentHp)} / ${p.maxHp}</span></div>`+
    `<div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${pHpPct}%;background:${getHpColor(pHpPct)}"></div></div></div>`+
    renderStages(p.stages)+
    renderStatPreview(p)+
    `<div class="moves-grid">${moveBtns}</div>${waitHTML}</div>`+
    // OPPONENT CARD
    `<div class="mc-panel battle-card opponent-card">`+
    `<div style="font-family:'Press Start 2P',monospace;font-size:9px;color:var(--red);margin-bottom:6px">${t('setup.opponent')}</div>`+
    `<div class="b-header"><div class="b-img-wrap" id="b-img-wrap-opponent"><img class="b-img" id="b-img-opponent" src="${o.artwork}" onerror="this.src='${o.sprite}'"/></div>`+
    `<div><div class="b-name">${o.name}</div><div class="preview-types">${oTypesH}</div>${renderStatus(o.status)}<div class="b-meta">${natName(o.nature)} | ${o.ability.replace(/-/g,' ')}</div></div></div>`+
    `<div class="hp-section"><div class="hp-label"><span class="hp-text">HP</span><span class="hp-val">${Math.max(0,o.currentHp)} / ${o.maxHp}</span></div>`+
    `<div class="hp-bar-bg"><div class="hp-bar-fill" style="width:${oHpPct}%;background:${getHpColor(oHpPct)}"></div></div></div>`+
    renderStages(o.stages)+
    renderStatPreview(o)+
    `<div style="margin-top:10px"><div style="font-size:13px;color:#666;margin-bottom:3px">${t('battle.moves')}:</div>${oMovesH}</div></div>`+
    `</div>`+
    resultHTML+
    coachHTML+
    `<div class="battle-log" id="battle-log">${logHTML}</div>`;
  const logEl=document.getElementById('battle-log');
  if(logEl)logEl.scrollTop=logEl.scrollHeight;
}

/* ================================================================
   PLAYER / AI TURNS
   ================================================================ */
function playerMove(idx){
  if(!battleState||battleState.battleOver||!battleState.isPlayerTurn)return;
  const p=battleState.player,o=battleState.opponent;
  // Check if player can move (paralyze)
  if(!canMove(p)){
    battleState.isPlayerTurn=false;
    renderArena();
    setTimeout(()=>processTurnEnd('player'),600);
    return;
  }
  const move=p.moves[idx];
  // Attack dash animation
  triggerDash('player',true);
  const result=executeMove(p,o,move,true);
  battleState.isPlayerTurn=false;
  battleState.turn++;
  if(o.currentHp<=0){
    addLog(t('battle.fainted').replace('%p',o.name),'log-faint');
    battleState.battleOver=true;
    onBattleEnd(true);
    renderArena();return;
  }
  renderArena();
  setTimeout(()=>processTurnEnd('player'),800);
}

function processTurnEnd(who){
  if(battleState.battleOver)return;
  const p=battleState.player,o=battleState.opponent;
  // Status damage at end of turn
  if(who==='player'){
    processStatusDamage(p,'player');
    if(p.currentHp<=0){
      addLog(t('battle.fainted').replace('%p',p.name),'log-faint');
      battleState.battleOver=true;
      onBattleEnd(false);
      renderArena();return;
    }
    processStatusDamage(o,'opponent');
    if(o.currentHp<=0){
      addLog(t('battle.fainted').replace('%p',o.name),'log-faint');
      battleState.battleOver=true;
      onBattleEnd(true);
      renderArena();return;
    }
    renderArena();
    setTimeout(()=>aiTurn(),800);
  }else{
    processStatusDamage(o,'opponent');
    if(o.currentHp<=0){
      addLog(t('battle.fainted').replace('%p',o.name),'log-faint');
      battleState.battleOver=true;
      onBattleEnd(true);
      renderArena();return;
    }
    processStatusDamage(p,'player');
    if(p.currentHp<=0){
      addLog(t('battle.fainted').replace('%p',p.name),'log-faint');
      battleState.battleOver=true;
      onBattleEnd(false);
      renderArena();return;
    }
    battleState.isPlayerTurn=true;
    renderArena();
  }
}

function aiTurn(){
  if(!battleState||battleState.battleOver)return;
  const o=battleState.opponent,p=battleState.player;
  // Check paralyze
  if(!canMove(o)){
    renderArena();
    setTimeout(()=>processTurnEnd('opponent'),600);
    return;
  }
  const move=aiPickMove(o,p);
  triggerDash('opponent',false);
  const result=executeMove(o,p,move,false);
  if(p.currentHp<=0){
    addLog(t('battle.fainted').replace('%p',p.name),'log-faint');
    battleState.battleOver=true;
    onBattleEnd(false);
    renderArena();return;
  }
  renderArena();
  setTimeout(()=>processTurnEnd('opponent'),800);
}

function onBattleEnd(playerWon){
  if(playerWon){
    currentStreak++;
    setCurrentStreak(currentStreak);
    if(currentStreak>bestStreak){bestStreak=currentStreak;setBestStreak(bestStreak)}
  }else{
    currentStreak=0;
    setCurrentStreak(0);
  }
}

async function continueStreak(){
  // Keep player, generate new random opponent
  await randomPokemon('opponent');
  // Rebuild player
  setupData.player.pokemon=await buildPokemon(setupData.player.id,setupData.player.ivs,setupData.player.nature,setupData.player.ability);
  await startBattle();
}

/* ================================================================
   NICK VALIDATION & SAVE
   ================================================================ */
function validateNick(){
  const inp=document.getElementById('nick-input');
  const err=document.getElementById('nick-error');
  const btn=document.getElementById('save-btn');
  if(!inp||!err||!btn)return;
  const nick=inp.value.trim();
  const result=isNickSafe(nick);
  if(result.safe){
    inp.classList.remove('error');
    err.classList.remove('visible');
    btn.disabled=false;
  }else{
    inp.classList.add('error');
    err.textContent=result.reason==='length'?t('nick.error.length'):t('nick.error.bad');
    err.classList.add('visible');
    btn.disabled=true;
  }
}

async function saveScore(){
  const inp=document.getElementById('nick-input');
  if(!inp)return;
  const nick=inp.value.trim();
  const result=isNickSafe(nick);
  if(!result.safe)return;
  saveNick(nick);
  const streak=getBestStreak();
  await saveToLeaderboard(nick,streak);
  const btn=document.getElementById('save-btn');
  if(btn){btn.textContent=t('nick.saved');btn.disabled=true}
  // Refresh leaderboard display
  const lbHTML=await renderLeaderboardSection();
  const existing=document.querySelector('.leaderboard');
  if(existing)existing.outerHTML=lbHTML;
}

/* ================================================================
   INIT
   ================================================================ */
async function init(){
  currentLang=localStorage.getItem('cob_lang')||'pl';
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('active',b.dataset.lang===currentLang));
  document.getElementById('btn-back-text').textContent=t('back');
  initFirebase();
  // Load pokemon list
  const cached=localStorage.getItem('cob_pokemon_list');
  if(cached){
    allPokemon=JSON.parse(cached);
  }else{
    try{
      const res=await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      const data=await res.json();
      allPokemon=data.results.map(p=>{const parts=p.url.split('/').filter(Boolean);return{id:parseInt(parts[parts.length-1]),name:p.name}}).filter(p=>p.id<=1025);
      localStorage.setItem('cob_pokemon_list',JSON.stringify(allPokemon));
    }catch(e){
      document.getElementById('app').innerHTML=`<div style="text-align:center;padding:40px;color:var(--red)">⚠ ${currentLang==='pl'?'Błąd połączenia z PokeAPI':'PokeAPI connection error'}</div>`;
      return;
    }
  }
  currentStreak=getCurrentStreak();
  bestStreak=getBestStreak();
  showSetup();
}

// Close search dropdowns on click outside
document.addEventListener('click',e=>{
  if(!e.target.closest('.search-wrap')){
    document.querySelectorAll('.search-results').forEach(el=>el.classList.remove('open'));
  }
});

init();
