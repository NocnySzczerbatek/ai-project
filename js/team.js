/* ================================================================
   team.js — Analizator zespołu PvP
   ================================================================ */

let teamSlots=[];

function loadTeam(){try{var s=localStorage.getItem(TEAM_KEY);teamSlots=s?JSON.parse(s):[];}catch(e){teamSlots=[];}}
function saveTeam(){localStorage.setItem(TEAM_KEY,JSON.stringify(teamSlots));}
function clearTeam(){teamSlots=[];localStorage.removeItem(TEAM_KEY);renderTeamPage();}
function removeFromTeam(id){teamSlots=teamSlots.filter(function(s){return s.id!==id;});saveTeam();renderTeamPage();}

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
  results.classList.remove('open');
  document.getElementById('team-search-input').value='';
  try{
    var data=detailCache[id];
    if(!data){var res=await fetch('https://pokeapi.co/api/v2/pokemon/'+id);var p=await res.json();data={p:p};detailCache[id]=data;}
    var types=data.p.types.map(function(t){return t.type.name;});
    teamSlots.push({id:id,name:name,types:types});
    saveTeam();renderTeamPage();
  }catch(e){teamSlots.push({id:id,name:name,types:['normal']});saveTeam();renderTeamPage();}
}

function renderTeamPage(){
  var container=document.getElementById('team-analyzer-content');
  if(!container)return;
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
  container.innerHTML='<div style="font-size:16px;color:#888;margin-bottom:12px">'+t('team.desc')+'</div>'
    +'<div class="team-search-wrap">'
    +'<input class="mc-input" id="team-search-input" type="text" placeholder="'+t('team.search')+'" oninput="onTeamSearch(this)" autocomplete="off"/>'
    +'<div class="team-search-results" id="team-search-results"></div></div>'
    +'<div class="team-slots">'+slotsHTML+'</div>'
    +'<div style="display:flex;gap:8px;margin-bottom:16px">'
    +'<button class="mc-btn" onclick="clearTeam()" style="background:#5a2020;border-top-color:#8a4040;border-left-color:#8a4040">\ud83d\uddd1 '+t('team.clear')+'</button></div>'
    +defenseHTML;
}
