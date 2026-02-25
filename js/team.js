/* ================================================================
   team.js — Analizator zespołu PvP + Teambuilder AI + Meta Teams
   ================================================================ */

let teamSlots=[];

function loadTeam(){try{var s=localStorage.getItem(TEAM_KEY);teamSlots=s?JSON.parse(s):[];}catch(e){teamSlots=[];}}
function saveTeam(){localStorage.setItem(TEAM_KEY,JSON.stringify(teamSlots));}
function clearTeam(){teamSlots=[];localStorage.removeItem(TEAM_KEY);renderTeamPage();}
function removeFromTeam(id){teamSlots=teamSlots.filter(function(s){return s.id!==id;});saveTeam();renderTeamPage();}

/* ================================================================
   RECOMMENDATION POOL — rozszerzony, z rolami i atakami ofensywnymi
   ================================================================ */
var TEAM_REC_POOL = [
  {id:6,   name:'charizard',   types:['fire','flying'],     atk:['fire','flying'],           role:'sp-atk'},
  {id:3,   name:'venusaur',    types:['grass','poison'],    atk:['grass','poison'],           role:'sp-atk'},
  {id:9,   name:'blastoise',   types:['water'],             atk:['water','ice'],              role:'defense'},
  {id:34,  name:'nidoking',    types:['poison','ground'],   atk:['poison','ground','ice'],    role:'sp-atk'},
  {id:36,  name:'clefable',    types:['fairy'],             atk:['fairy'],                    role:'support'},
  {id:59,  name:'arcanine',    types:['fire'],              atk:['fire'],                     role:'ph-atk'},
  {id:65,  name:'alakazam',    types:['psychic'],           atk:['psychic'],                  role:'sp-atk'},
  {id:68,  name:'machamp',     types:['fighting'],          atk:['fighting'],                 role:'ph-atk'},
  {id:94,  name:'gengar',      types:['ghost','poison'],    atk:['ghost','poison'],           role:'sp-atk'},
  {id:113, name:'chansey',     types:['normal'],            atk:['normal'],                   role:'support'},
  {id:130, name:'gyarados',    types:['water','flying'],    atk:['water','flying'],           role:'ph-atk'},
  {id:131, name:'lapras',      types:['water','ice'],       atk:['water','ice'],              role:'defense'},
  {id:143, name:'snorlax',     types:['normal'],            atk:['normal'],                   role:'defense'},
  {id:149, name:'dragonite',   types:['dragon','flying'],   atk:['dragon','flying'],          role:'ph-atk'},
  {id:196, name:'espeon',      types:['psychic'],           atk:['psychic'],                  role:'sp-atk'},
  {id:197, name:'umbreon',     types:['dark'],              atk:['dark'],                     role:'defense'},
  {id:212, name:'scizor',      types:['bug','steel'],       atk:['bug','steel'],              role:'ph-atk'},
  {id:214, name:'heracross',   types:['bug','fighting'],    atk:['bug','fighting'],           role:'ph-atk'},
  {id:227, name:'skarmory',    types:['steel','flying'],    atk:['steel','flying'],           role:'defense'},
  {id:242, name:'blissey',     types:['normal'],            atk:['normal'],                   role:'support'},
  {id:248, name:'tyranitar',   types:['rock','dark'],       atk:['rock','dark'],              role:'ph-atk'},
  {id:257, name:'blaziken',    types:['fire','fighting'],   atk:['fire','fighting'],          role:'ph-atk'},
  {id:260, name:'swampert',    types:['water','ground'],    atk:['water','ground'],           role:'defense'},
  {id:282, name:'gardevoir',   types:['psychic','fairy'],   atk:['psychic','fairy'],          role:'sp-atk'},
  {id:350, name:'milotic',     types:['water'],             atk:['water','ice'],              role:'defense'},
  {id:373, name:'salamence',   types:['dragon','flying'],   atk:['dragon','flying','fire'],   role:'ph-atk'},
  {id:376, name:'metagross',   types:['steel','psychic'],   atk:['steel','psychic'],          role:'ph-atk'},
  {id:392, name:'infernape',   types:['fire','fighting'],   atk:['fire','fighting'],          role:'ph-atk'},
  {id:445, name:'garchomp',    types:['dragon','ground'],   atk:['ground','dragon'],          role:'ph-atk'},
  {id:448, name:'lucario',     types:['fighting','steel'],  atk:['fighting','steel'],         role:'ph-atk'},
  {id:450, name:'hippowdon',   types:['ground'],            atk:['ground'],                   role:'defense'},
  {id:461, name:'weavile',     types:['dark','ice'],        atk:['dark','ice'],               role:'ph-atk'},
  {id:462, name:'magnezone',   types:['electric','steel'],  atk:['electric','steel'],         role:'sp-atk'},
  {id:468, name:'togekiss',    types:['fairy','flying'],    atk:['fairy','flying'],           role:'sp-atk'},
  {id:471, name:'glaceon',     types:['ice'],               atk:['ice'],                      role:'sp-atk'},
  {id:473, name:'mamoswine',   types:['ice','ground'],      atk:['ice','ground'],             role:'ph-atk'},
  {id:497, name:'serperior',   types:['grass'],             atk:['grass'],                    role:'sp-atk'},
  {id:530, name:'excadrill',   types:['ground','steel'],    atk:['ground','steel'],           role:'ph-atk'},
  {id:534, name:'conkeldurr',  types:['fighting'],          atk:['fighting'],                 role:'ph-atk'},
  {id:553, name:'krookodile',  types:['ground','dark'],     atk:['ground','dark'],            role:'ph-atk'},
  {id:591, name:'amoonguss',   types:['grass','poison'],    atk:['grass','poison'],           role:'support'},
  {id:598, name:'ferrothorn',  types:['grass','steel'],     atk:['grass','steel'],            role:'defense'},
  {id:609, name:'chandelure',  types:['ghost','fire'],      atk:['ghost','fire'],             role:'sp-atk'},
  {id:612, name:'haxorus',     types:['dragon'],            atk:['dragon'],                   role:'ph-atk'},
  {id:635, name:'hydreigon',   types:['dark','dragon'],     atk:['dark','dragon','fire'],     role:'sp-atk'},
  {id:637, name:'volcarona',   types:['bug','fire'],        atk:['bug','fire'],               role:'sp-atk'},
  {id:658, name:'greninja',    types:['water','dark'],      atk:['water','dark','ice'],       role:'sp-atk'},
  {id:663, name:'talonflame',  types:['fire','flying'],     atk:['fire','flying'],            role:'ph-atk'},
  {id:681, name:'aegislash',   types:['steel','ghost'],     atk:['steel','ghost'],            role:'defense'},
  {id:700, name:'sylveon',     types:['fairy'],             atk:['fairy'],                    role:'sp-atk'},
  {id:748, name:'toxapex',     types:['water','poison'],    atk:['water','poison'],           role:'defense'},
  {id:778, name:'mimikyu',     types:['ghost','fairy'],     atk:['ghost','fairy'],            role:'ph-atk'},
  {id:812, name:'rillaboom',   types:['grass'],             atk:['grass'],                    role:'ph-atk'},
  {id:815, name:'cinderace',   types:['fire'],              atk:['fire'],                     role:'ph-atk'},
  {id:818, name:'inteleon',    types:['water'],             atk:['water','ice'],              role:'sp-atk'},
  {id:823, name:'corviknight',  types:['flying','steel'],   atk:['flying','steel'],           role:'defense'},
  {id:858, name:'hatterene',   types:['psychic','fairy'],   atk:['psychic','fairy'],          role:'sp-atk'},
  {id:861, name:'grimmsnarl',  types:['dark','fairy'],      atk:['dark','fairy'],             role:'support'},
  {id:887, name:'dragapult',   types:['dragon','ghost'],    atk:['dragon','ghost'],           role:'sp-atk'},
  {id:892, name:'urshifu',     types:['fighting','dark'],   atk:['fighting','dark'],          role:'ph-atk'}
];

/* ================================================================
   TOP 10 META TEAMS
   ================================================================ */
var META_TEAMS = [
  {
    label: {pl:'Rain Team', en:'Rain Team'},
    desc: {pl:'Deszczowa druzyna z szybkimi atakami Wody i wsparciem Swift Swim.', en:'Rain-boosted Water attacks with Swift Swim sweepers.'},
    members: [
      {id:260, name:'swampert', types:['water','ground']},
      {id:130, name:'gyarados', types:['water','flying']},
      {id:658, name:'greninja', types:['water','dark']},
      {id:598, name:'ferrothorn', types:['grass','steel']},
      {id:887, name:'dragapult', types:['dragon','ghost']},
      {id:462, name:'magnezone', types:['electric','steel']}
    ]
  },
  {
    label: {pl:'Sun Team', en:'Sun Team'},
    desc: {pl:'Sloneczna druzyna z poteznym Ogniem i Chlorophyll sweperami.', en:'Sun-boosted Fire attacks and Chlorophyll sweepers.'},
    members: [
      {id:6,   name:'charizard', types:['fire','flying']},
      {id:3,   name:'venusaur', types:['grass','poison']},
      {id:637, name:'volcarona', types:['bug','fire']},
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:468, name:'togekiss', types:['fairy','flying']},
      {id:681, name:'aegislash', types:['steel','ghost']}
    ]
  },
  {
    label: {pl:'Sand Team', en:'Sand Team'},
    desc: {pl:'Piaskowa burza ze wzmocnionymi typami Skalnym i Stalowym.', en:'Sandstorm team with boosted Rock/Steel/Ground types.'},
    members: [
      {id:248, name:'tyranitar', types:['rock','dark']},
      {id:530, name:'excadrill', types:['ground','steel']},
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:598, name:'ferrothorn', types:['grass','steel']},
      {id:748, name:'toxapex', types:['water','poison']},
      {id:887, name:'dragapult', types:['dragon','ghost']}
    ]
  },
  {
    label: {pl:'Hyper Offense', en:'Hyper Offense'},
    desc: {pl:'Pelna agresja — szybkie KO i momentum z U-turn/Volt Switch.', en:'Full aggression — fast KOs and momentum with VoltTurn.'},
    members: [
      {id:257, name:'blaziken', types:['fire','fighting']},
      {id:461, name:'weavile', types:['dark','ice']},
      {id:887, name:'dragapult', types:['dragon','ghost']},
      {id:530, name:'excadrill', types:['ground','steel']},
      {id:212, name:'scizor', types:['bug','steel']},
      {id:658, name:'greninja', types:['water','dark']}
    ]
  },
  {
    label: {pl:'Balance', en:'Balance'},
    desc: {pl:'Zbalansowana druzyna z dobrym pokryciem ofensywnym i defensywnym.', en:'Balanced team with solid offensive and defensive coverage.'},
    members: [
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:823, name:'corviknight', types:['flying','steel']},
      {id:748, name:'toxapex', types:['water','poison']},
      {id:609, name:'chandelure', types:['ghost','fire']},
      {id:468, name:'togekiss', types:['fairy','flying']},
      {id:598, name:'ferrothorn', types:['grass','steel']}
    ]
  },
  {
    label: {pl:'Stall Team', en:'Stall Team'},
    desc: {pl:'Defensywna strategia — wyczerpuj przeciwnika statusami i hazardami.', en:'Defensive stalling with status, hazards, and recovery.'},
    members: [
      {id:748, name:'toxapex', types:['water','poison']},
      {id:227, name:'skarmory', types:['steel','flying']},
      {id:242, name:'blissey', types:['normal']},
      {id:598, name:'ferrothorn', types:['grass','steel']},
      {id:197, name:'umbreon', types:['dark']},
      {id:36,  name:'clefable', types:['fairy']}
    ]
  },
  {
    label: {pl:'Trick Room', en:'Trick Room'},
    desc: {pl:'Odwrocona szybkosc — wolne tanki atakuja pierwsze.', en:'Reversed Speed — slow tanks move first.'},
    members: [
      {id:858, name:'hatterene', types:['psychic','fairy']},
      {id:376, name:'metagross', types:['steel','psychic']},
      {id:534, name:'conkeldurr', types:['fighting']},
      {id:143, name:'snorlax', types:['normal']},
      {id:609, name:'chandelure', types:['ghost','fire']},
      {id:591, name:'amoonguss', types:['grass','poison']}
    ]
  },
  {
    label: {pl:'Volt-Turn', en:'Volt-Turn'},
    desc: {pl:'Kontrola momentum przez ciagle rotacje z Volt Switch i U-Turn.', en:'Momentum control with Volt Switch and U-Turn pivots.'},
    members: [
      {id:212, name:'scizor', types:['bug','steel']},
      {id:462, name:'magnezone', types:['electric','steel']},
      {id:663, name:'talonflame', types:['fire','flying']},
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:350, name:'milotic', types:['water']},
      {id:861, name:'grimmsnarl', types:['dark','fairy']}
    ]
  },
  {
    label: {pl:'Dragon Spam', en:'Dragon Spam'},
    desc: {pl:'Smoki z pelnym pokryciem typow i Fairy-killerami.', en:'Dragon-heavy with full type coverage and Fairy answers.'},
    members: [
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:149, name:'dragonite', types:['dragon','flying']},
      {id:635, name:'hydreigon', types:['dark','dragon']},
      {id:887, name:'dragapult', types:['dragon','ghost']},
      {id:462, name:'magnezone', types:['electric','steel']},
      {id:212, name:'scizor', types:['bug','steel']}
    ]
  },
  {
    label: {pl:'Fairy Core', en:'Fairy Core'},
    desc: {pl:'Bajkowe trio z odpornosciami na Smoka plus stalowe wsparcie.', en:'Fairy core with Dragon immunity plus Steel-type support.'},
    members: [
      {id:468, name:'togekiss', types:['fairy','flying']},
      {id:282, name:'gardevoir', types:['psychic','fairy']},
      {id:36,  name:'clefable', types:['fairy']},
      {id:681, name:'aegislash', types:['steel','ghost']},
      {id:445, name:'garchomp', types:['dragon','ground']},
      {id:748, name:'toxapex', types:['water','poison']}
    ]
  }
];

/* ================================================================
   DEFENSIVE ANALYSIS
   ================================================================ */
function computeTeamDefense(){
  var result={};
  ALL_TYPES.forEach(function(at){result[at]={weak:0,resist:0,immune:0,neutral:0};});
  teamSlots.forEach(function(slot){
    ALL_TYPES.forEach(function(at){
      var mult=1;
      slot.types.forEach(function(dt){
        if(!TYPE_EFF[dt])return;
        if(TYPE_EFF[dt].weak.includes(at))mult*=2;
        else if(TYPE_EFF[dt].resist.includes(at))mult*=0.5;
        else if(TYPE_EFF[dt].immune.includes(at))mult*=0;
      });
      if(mult===0)result[at].immune++;else if(mult>1)result[at].weak++;else if(mult<1)result[at].resist++;else result[at].neutral++;
    });
  });
  return result;
}

/* ================================================================
   OFFENSIVE COVERAGE — jakie typy druzyna moze atakowac
   ================================================================ */
function computeTeamOffense(){
  var covered={};
  ALL_TYPES.forEach(function(def){covered[def]=0;});
  teamSlots.forEach(function(slot){
    var atkTypes=[];
    var poolEntry=TEAM_REC_POOL.find(function(r){return r.id===slot.id;});
    if(poolEntry) atkTypes=poolEntry.atk;
    else atkTypes=slot.types;
    atkTypes.forEach(function(at){
      ALL_TYPES.forEach(function(def){
        var eff=TYPE_EFF[def];
        if(!eff)return;
        if(eff.weak.includes(at))covered[def]++;
      });
    });
  });
  return covered;
}

/* ================================================================
   ROLE ANALYSIS — jakie role sa w druzynie
   ================================================================ */
function getTeamRoles(){
  var roles={'ph-atk':0,'sp-atk':0,'defense':0,'support':0};
  teamSlots.forEach(function(slot){
    var entry=TEAM_REC_POOL.find(function(r){return r.id===slot.id;});
    if(entry && roles[entry.role]!==undefined) roles[entry.role]++;
    else roles['ph-atk']++;
  });
  return roles;
}

var ROLE_LABELS={
  'ph-atk':  {pl:'Fizyczny Atakujacy',en:'Physical Attacker'},
  'sp-atk':  {pl:'Specjalny Atakujacy',en:'Special Attacker'},
  'defense': {pl:'Defensywny',en:'Defensive'},
  'support': {pl:'Wsparcie',en:'Support'}
};

/* ================================================================
   TEAMBUILDER AI — algorytm rekomendacji
   ================================================================ */
function getTeamRecommendations(){
  if(teamSlots.length===0||teamSlots.length>=6) return [];
  var defense=computeTeamDefense();
  var offense=computeTeamOffense();
  var roles=getTeamRoles();
  /* Typy na ktore druzyna jest slaba (wiecej weak niz resist+immune) */
  var weakTypes=ALL_TYPES.filter(function(tp){return defense[tp].weak>defense[tp].resist+defense[tp].immune;});
  /* Typy ktore druzyna nie pokrywa ofensywnie */
  var uncoveredOff=ALL_TYPES.filter(function(tp){return offense[tp]===0;});
  /* Brakujace role */
  var missingRoles=[];
  var totalSlots=teamSlots.length;
  if(roles['defense']===0 && totalSlots>=2) missingRoles.push('defense');
  if(roles['support']===0 && totalSlots>=3) missingRoles.push('support');
  if(roles['sp-atk']===0 && totalSlots>=2) missingRoles.push('sp-atk');
  if(roles['ph-atk']===0 && totalSlots>=2) missingRoles.push('ph-atk');

  var teamIds=teamSlots.map(function(s){return s.id;});
  var scored=[];

  TEAM_REC_POOL.forEach(function(cand){
    if(teamIds.includes(cand.id)) return;
    var score=0;
    var reasons=[];

    /* 1. Pokrywa slabosci defensywne — glowny czynnik */
    var coversWeak=0;
    cand.types.forEach(function(ct){
      var eff=TYPE_EFF[ct];
      if(!eff) return;
      weakTypes.forEach(function(wt){
        if(eff.resist.includes(wt)){score+=4;coversWeak++;}
        if(eff.immune.includes(wt)){score+=6;coversWeak++;}
      });
    });
    if(coversWeak>0){
      var coveredNames=[];
      cand.types.forEach(function(ct){
        var eff=TYPE_EFF[ct]; if(!eff) return;
        weakTypes.forEach(function(wt){
          if(eff.resist.includes(wt)||eff.immune.includes(wt)){
            if(coveredNames.indexOf(typeName(wt))<0) coveredNames.push(typeName(wt));
          }
        });
      });
      reasons.push((currentLang==='en'?'Covers weakness: ':'Pokrywa slabosci: ')+coveredNames.join(', '));
    }

    /* 2. Pokrywa braki ofensywne */
    var coversOff=0;
    cand.atk.forEach(function(at){
      uncoveredOff.forEach(function(def){
        var eff=TYPE_EFF[def]; if(!eff) return;
        if(eff.weak.includes(at)){score+=3;coversOff++;}
      });
    });
    if(coversOff>0){
      reasons.push((currentLang==='en'?'Adds offensive coverage':'Dodaje pokrycie ofensywne'));
    }

    /* 3. Spelnia brakujaca role */
    if(missingRoles.includes(cand.role)){
      score+=5;
      var rl=ROLE_LABELS[cand.role];
      reasons.push((currentLang==='en'?'Fills role: ':'Pełni role: ')+(rl?rl[currentLang]||rl.pl:cand.role));
    }

    /* 4. Synergia typow — nie duplikuje typow juz w druzynie */
    var teamTypes=[];
    teamSlots.forEach(function(s){s.types.forEach(function(tp){if(teamTypes.indexOf(tp)<0)teamTypes.push(tp);});});
    var isUnique=cand.types.every(function(ct){return teamTypes.indexOf(ct)<0;});
    if(isUnique){score+=2;reasons.push(currentLang==='en'?'Unique typing':'Unikalny typ');}

    if(score>0) scored.push({id:cand.id,name:cand.name,types:cand.types,role:cand.role,score:score,reasons:reasons});
  });

  scored.sort(function(a,b){return b.score-a.score;});
  return scored.slice(0,6);
}

/* ================================================================
   SEARCH
   ================================================================ */
let teamSearchTimeout=null;

function onTeamSearch(input){
  clearTimeout(teamSearchTimeout);
  var q=input.value.trim().toLowerCase();
  var results=document.getElementById('team-search-results');
  if(q.length<2){results.classList.remove('open');return;}
  teamSearchTimeout=setTimeout(function(){
    var matches=allPokemon.filter(function(p){return p.name.includes(q)||String(p.id).includes(q);}).slice(0,8);
    if(!matches.length){results.innerHTML='<div class="team-search-item" style="color:#666">'+t('gen.noResults')+'</div>';results.classList.add('open');return;}
    results.innerHTML=matches.map(function(p){
      return '<div class="team-search-item" onclick="addTeamPokemon('+p.id+',\''+p.name+'\')">'
        +'<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+p.id+'.png"/>'
        +'<span>'+p.name+'</span><span style="color:#666;margin-left:auto">#'+String(p.id).padStart(3,'0')+'</span></div>';
    }).join('');
    results.classList.add('open');
  },200);
}

async function addTeamPokemon(id,name){
  if(teamSlots.length>=6||teamSlots.some(function(s){return s.id===id;}))return;
  var results=document.getElementById('team-search-results');
  if(results) results.classList.remove('open');
  var inp=document.getElementById('team-search-input');
  if(inp) inp.value='';
  try{
    var data=detailCache[id];
    if(!data){var res=await fetch('https://pokeapi.co/api/v2/pokemon/'+id);var p=await res.json();data={p:p};detailCache[id]=data;}
    var types=data.p.types.map(function(t){return t.type.name;});
    teamSlots.push({id:id,name:name,types:types});
    saveTeam();renderTeamPage();
  }catch(e){teamSlots.push({id:id,name:name,types:['normal']});saveTeam();renderTeamPage();}
}

/* ================================================================
   LOAD META TEAM
   ================================================================ */
function loadMetaTeam(idx){
  var mt=META_TEAMS[idx];
  if(!mt) return;
  teamSlots=mt.members.map(function(m){return {id:m.id,name:m.name,types:m.types};});
  saveTeam();
  renderTeamPage();
  /* Scroll to team slots */
  var el=document.querySelector('.team-slots');
  if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
}

/* ================================================================
   RENDER
   ================================================================ */
function renderTeamPage(){
  var container=document.getElementById('team-analyzer-content');
  if(!container)return;

  /* ── SLOTS ── */
  var slotsHTML='';
  for(var i=0;i<6;i++){
    if(i<teamSlots.length){
      var slot=teamSlots[i];
      var typeBadges=slot.types.map(function(tp){return '<span class="type-badge type-'+tp+'" style="font-size:11px;padding:1px 6px">'+typeName(tp)+'</span>';}).join('');
      slotsHTML+='<div class="team-slot filled"><span class="slot-num">'+(i+1)+'</span>'
        +'<button class="slot-remove" onclick="removeFromTeam('+slot.id+')" title="Usu\u0144">\u2715</button>'
        +'<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+slot.id+'.png"/>'
        +'<div class="slot-name">'+slot.name+'</div>'
        +'<div class="slot-types">'+typeBadges+'</div></div>';
    }else{
      slotsHTML+='<div class="team-slot"><span class="slot-num">'+(i+1)+'</span>'
        +'<div style="color:#555;font-size:32px">+</div>'
        +'<div style="color:#555;font-size:14px">'+t('team.empty')+'</div></div>';
    }
  }

  /* ── ROLE SUMMARY ── */
  var roleSummaryHTML='';
  if(teamSlots.length>0){
    var roles=getTeamRoles();
    roleSummaryHTML='<div class="team-role-summary"><h3>\ud83c\udfad '+t('team.roles')+'</h3><div class="role-bar-grid">';
    var roleKeys=['ph-atk','sp-atk','defense','support'];
    var roleIcons={
      'ph-atk':'\u2694','sp-atk':'\ud83d\udd2e','defense':'\ud83d\udee1','support':'\ud83d\udc9a'
    };
    roleKeys.forEach(function(rk){
      var rl=ROLE_LABELS[rk];
      var label=rl?rl[currentLang]||rl.pl:rk;
      var count=roles[rk]||0;
      var pct=teamSlots.length>0?Math.round(count/teamSlots.length*100):0;
      roleSummaryHTML+='<div class="role-bar-row"><span class="role-bar-label">'+(roleIcons[rk]||'')+' '+label+'</span>'
        +'<div class="role-bar-track"><div class="role-bar-fill role-bar-'+rk+'" style="width:'+pct+'%"></div></div>'
        +'<span class="role-bar-count">'+count+'</span></div>';
    });
    roleSummaryHTML+='</div></div>';
  }

  /* ── DEFENSE ANALYSIS ── */
  var defenseHTML='';
  if(teamSlots.length>0){
    var analysis=computeTeamDefense();
    var weakTypes=ALL_TYPES.filter(function(tp){return analysis[tp].weak>analysis[tp].resist+analysis[tp].immune;});
    var resistTypes=ALL_TYPES.filter(function(tp){return analysis[tp].resist+analysis[tp].immune>analysis[tp].weak;});
    var immuneTypes=ALL_TYPES.filter(function(tp){return analysis[tp].immune>0;});
    var neutralTypes=ALL_TYPES.filter(function(tp){return !weakTypes.includes(tp)&&!resistTypes.includes(tp);});
    defenseHTML='<div class="defense-summary"><h3>\ud83d\udd34 '+t('team.weak')+' ('+weakTypes.length+')</h3>'
      +'<div class="defense-grid">'+weakTypes.map(function(tp){return '<div class="defense-entry defense-weak">'+typeIconHTML(tp,18)+' '+typeName(tp)+' <span style="margin-left:auto;font-size:13px">'+analysis[tp].weak+'\u00d7</span></div>';}).join('')+'</div></div>'
      +'<div class="defense-summary" style="margin-top:8px"><h3>\ud83d\udfe2 '+t('team.resist')+' ('+resistTypes.length+')</h3>'
      +'<div class="defense-grid">'+resistTypes.map(function(tp){return '<div class="defense-entry defense-resist">'+typeIconHTML(tp,18)+' '+typeName(tp)+' <span style="margin-left:auto;font-size:13px">'+analysis[tp].resist+'\u00d7</span></div>';}).join('')+'</div></div>';
    if(immuneTypes.length)defenseHTML+='<div class="defense-summary" style="margin-top:8px"><h3>\ud83d\udfe3 '+t('team.immune')+' ('+immuneTypes.length+')</h3>'
      +'<div class="defense-grid">'+immuneTypes.map(function(tp){return '<div class="defense-entry defense-immune">'+typeIconHTML(tp,18)+' '+typeName(tp)+'</div>';}).join('')+'</div></div>';
    defenseHTML+='<div class="defense-summary" style="margin-top:8px"><h3>\u26aa '+t('team.neutral')+' ('+neutralTypes.length+')</h3>'
      +'<div class="defense-grid">'+neutralTypes.map(function(tp){return '<div class="defense-entry defense-neutral">'+typeIconHTML(tp,18)+' '+typeName(tp)+'</div>';}).join('')+'</div></div>';
  }

  /* ── AI RECOMMENDATIONS ── */
  var recsHTML='';
  if(teamSlots.length>0 && teamSlots.length<6){
    var recs=getTeamRecommendations();
    if(recs.length>0){
      recsHTML='<div class="team-ai-section"><h3>\ud83e\udde0 '+t('team.aiTitle')+'</h3>'
        +'<div class="team-ai-desc">'+t('team.aiDesc')+'</div>'
        +'<div class="team-rec-grid">';
      recs.forEach(function(r){
        var typeBadges=r.types.map(function(tp){return '<span class="type-badge type-'+tp+'" style="font-size:10px;padding:1px 5px">'+typeName(tp)+'</span>';}).join('');
        var roleLabel=ROLE_LABELS[r.role]?ROLE_LABELS[r.role][currentLang]||ROLE_LABELS[r.role].pl:r.role;
        var reasonsList=r.reasons.map(function(rs){return '<li>'+rs+'</li>';}).join('');
        recsHTML+='<div class="team-rec-card" onclick="addTeamPokemon('+r.id+',\''+r.name+'\')">'
          +'<img class="team-rec-sprite" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+r.id+'.png" loading="lazy" alt="'+r.name+'"/>'
          +'<div class="team-rec-name">'+r.name+'</div>'
          +'<div class="team-rec-types">'+typeBadges+'</div>'
          +'<div class="team-rec-role">'+roleLabel+'</div>'
          +'<ul class="team-rec-reasons">'+reasonsList+'</ul>'
          +'<div class="team-rec-score">\u2b50 '+r.score+'</div>'
          +'</div>';
      });
      recsHTML+='</div></div>';
    }
  }

  /* ── META TEAMS ── */
  var metaHTML='<div class="team-meta-section"><h3>\ud83c\udfc6 '+t('team.metaTitle')+'</h3>'
    +'<div class="team-meta-desc">'+t('team.metaDesc')+'</div>'
    +'<div class="team-meta-grid">';
  META_TEAMS.forEach(function(mt,idx){
    var label=mt.label[currentLang]||mt.label.pl;
    var desc=mt.desc[currentLang]||mt.desc.pl;
    var sprites=mt.members.map(function(m){
      return '<div class="meta-member-mini"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+m.id+'.png" loading="lazy" alt="'+m.name+'" title="'+m.name+'"/><span>'+m.name+'</span></div>';
    }).join('');
    metaHTML+='<div class="team-meta-card">'
      +'<div class="meta-card-label">'+label+'</div>'
      +'<div class="meta-card-desc">'+desc+'</div>'
      +'<div class="meta-card-members">'+sprites+'</div>'
      +'<button class="mc-btn meta-load-btn" onclick="loadMetaTeam('+idx+')">\ud83d\udce5 '+t('team.metaLoad')+'</button>'
      +'</div>';
  });
  metaHTML+='</div></div>';

  /* ── ASSEMBLE ── */
  container.innerHTML='<div style="font-size:16px;color:#888;margin-bottom:12px">'+t('team.desc')+'</div>'
    +'<div class="team-search-wrap">'
    +'<input class="mc-input" id="team-search-input" type="text" placeholder="'+t('team.search')+'" oninput="onTeamSearch(this)" autocomplete="off"/>'
    +'<div class="team-search-results" id="team-search-results"></div></div>'
    +'<div class="team-slots">'+slotsHTML+'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:16px">'
    +'<button class="mc-btn" onclick="clearTeam()" style="background:#5a2020;border-top-color:#8a4040;border-left-color:#8a4040">\ud83d\uddd1 '+t('team.clear')+'</button></div>'
    +roleSummaryHTML
    +defenseHTML
    +recsHTML
    +metaHTML;
}
