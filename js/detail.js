/* ================================================================
   detail.js — Renderowanie szczegółów Pokémona i buildów
   ================================================================ */

async function loadDetail(id, name) {
  selectedId = id;
  document.querySelectorAll('.pokemon-entry').forEach(function(el){
    el.classList.toggle('selected', parseInt(el.dataset.id) === id);
  });
  // close mobile menu
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('active');
  showPage('detail-loading');
  setStatus('Pobieranie danych: '+name+'...', true);
  try {
    var data = detailCache[id];
    if (!data) {
      var results = await Promise.all([
        fetch('https://pokeapi.co/api/v2/pokemon/'+id),
        fetch('https://pokeapi.co/api/v2/pokemon-species/'+id)
      ]);
      var p = await results[0].json();
      var s = await results[1].json();
      data = { p:p, s:s };
      detailCache[id] = data;
    }
    // Fetch ability details
    if (!data.abilityDetails) {
      try {
        var abilityPromises = data.p.abilities.map(function(a){
          return fetch('https://pokeapi.co/api/v2/ability/'+a.ability.name).then(function(r){return r.json();});
        });
        data.abilityDetails = await Promise.all(abilityPromises);
      } catch(e2) { data.abilityDetails = []; }
      detailCache[id] = data;
    }
    var evoChainUrl = data.s.evolution_chain ? data.s.evolution_chain.url : null;
    var evoChain = null;
    if (evoChainUrl) { var evoRes = await fetch(evoChainUrl); evoChain = await evoRes.json(); }
    renderDetail(data.p, data.s, evoChain, name, data.abilityDetails);
    setStatus('#'+String(id).padStart(3,'0')+' '+name, false);
    window.location.hash = 'pokemon-'+id;
  } catch(e) {
    setStatus('B\u0142\u0105d podczas pobierania danych.', false);
    document.getElementById('main-area').innerHTML = '<div class="empty-state"><span class="big-icon">\u26a0</span>B\u0142\u0105d po\u0142\u0105czenia z PokeAPI.</div>';
  }
}

/* ================================================================
   RENDER DETAIL
   ================================================================ */
function renderDetail(p, s, evoChain, name, abilityDetails) {
  var isFriendship = FRIENDSHIP_EVOS.has(p.name);
  var isTradeEvo = p.name in LINK_CABLE_EVOS;
  var flavor = '';
  if (s.flavor_text_entries) {
    var fe = s.flavor_text_entries.find(function(f){return f.language.name==='en';});
    if (fe) flavor = fe.flavor_text.replace(/\f/g,' ');
  }

  // ── IV helpers ──
  function getIVColor(iv) { return iv>=28?'#55ff55':iv>=20?'#f8d030':iv>=10?'#f08030':'#ff5555'; }
  function getIVLabel(iv) {
    if(iv>=28) return '<span style="color:#55ff55">Doskona\u0142e</span>';
    if(iv>=20) return '<span style="color:#f8d030">Dobre</span>';
    if(iv>=10) return '<span style="color:#f08030">S\u0142abe</span>';
    return '<span style="color:#ff5555">Z\u0142e</span>';
  }

  function buildIVSection(stats) {
    var statMap = {}; stats.forEach(function(s){statMap[s.stat.name]=s.base_stat;});
    var atk=statMap['attack']||0, spatk=statMap['special-attack']||0, def=statMap['defense']||0, spdef=statMap['special-defense']||0, spe=statMap['speed']||0, hp=statMap['hp']||0;
    var isPhysical=atk>=spatk+15,isSpecial=spatk>=atk+15,isMixed=!isPhysical&&!isSpecial,isTank=(def+spdef)/2>=90&&spe<80,isSpeedy=spe>=80,isTrickRoom=spe<=50;
    var role='\u2696 Zbalansowany';
    if(isPhysical&&isSpeedy)role='\u2694 Fizyczny Atakuj\u0105cy';else if(isPhysical&&isTank)role='\ud83d\udee1 Fizyczny Tank';else if(isPhysical)role='\u2694 Fizyczny';else if(isSpecial&&isSpeedy)role='\u2728 Specjalny Atakuj\u0105cy';else if(isSpecial&&isTank)role='\ud83d\udd2e Specjalny Tank';else if(isSpecial)role='\u2728 Specjalny';else if(isTank)role='\ud83d\udee1 Tank';else if(isSpeedy)role='\ud83d\udca8 Szybko\u015bciowy';else if(isMixed)role='\u2694\u2728 Mieszany';
    var targets={};
    targets['hp']={val:'31',color:'#55ff55',prio:true,note:'Zawsze przydatne'};
    if(isTrickRoom)targets['speed']={val:'0',color:'#aaa',prio:false,note:'Trick Room'};else if(isSpeedy)targets['speed']={val:'31',color:'#55ff55',prio:true,note:'Kluczowe'};else targets['speed']={val:'\u226520',color:'#f8d030',prio:false,note:'Pomocne'};
    if(isPhysical||isMixed)targets['attack']={val:'31',color:'#55ff55',prio:true,note:'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'};else targets['attack']={val:'0',color:'#888',prio:false,note:'Nie u\u017cywasz'};
    if(isSpecial||isMixed)targets['special-attack']={val:'31',color:'#55ff55',prio:true,note:'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'};else targets['special-attack']={val:'0',color:'#888',prio:false,note:'Nie u\u017cywasz'};
    if(isTank||def>=100)targets['defense']={val:'31',color:'#55ff55',prio:true,note:'Warto maksowa\u0107'};else targets['defense']={val:'\u226520',color:'#f8d030',prio:false,note:'Przydatne'};
    if(isTank||spdef>=100)targets['special-defense']={val:'31',color:'#55ff55',prio:true,note:'Warto maksowa\u0107'};else targets['special-defense']={val:'\u226520',color:'#f8d030',prio:false,note:'Przydatne'};
    var mustBe31=['hp','attack','defense','special-attack','special-defense','speed'].filter(function(sn){return targets[sn].val==='31';}).map(function(sn){return '<span style="color:'+(STAT_COLORS[sn]||'#fff')+'">'+STAT_NAMES[sn]+'</span>';});
    var mustBe0=['attack','special-attack','speed'].filter(function(sn){return targets[sn].val==='0';}).map(function(sn){return '<span style="color:#888">'+STAT_NAMES[sn]+'</span>';});
    var summaryLine='Celuj w <b style="color:#55ff55">31</b>: '+mustBe31.join(', ');
    if(mustBe0.length)summaryLine+='<br>Zostaw na <b style="color:#888">0</b>: '+mustBe0.join(', ');
    var ORDER=['hp','attack','defense','special-attack','special-defense','speed'];
    var rows=ORDER.map(function(sn){
      var label=STAT_NAMES[sn]||sn;var color=STAT_COLORS[sn]||'#888';var t=targets[sn];
      var rowClass=t.prio?'iv-row iv-row-priority':'iv-row';var prioIcon=t.prio?'\u2b50':'\u25aa';
      var defaultVal=t.val==='0'?0:31;
      return '<div class="'+rowClass+'" id="iv-row-'+sn+'">'
        +'<span class="iv-priority" title="'+t.note+'">'+prioIcon+'</span>'
        +'<span class="iv-name" style="color:'+color+'">'+label+'</span>'
        +'<div class="iv-hybrid" data-stat="'+sn+'">' 
        +'<input type="range" min="0" max="31" value="'+defaultVal+'" oninput="syncIVHybrid(this,\'range\')" />' 
        +'<input class="iv-input" type="number" min="0" max="31" value="'+defaultVal+'" data-stat="'+sn+'" oninput="syncIVHybrid(this,\'number\')" />' 
        +'</div>'
        +'<div class="iv-bar-wrap"><div class="iv-bar" id="ivbar-'+sn+'" style="width:'+Math.round(defaultVal/31*100)+'%;background:'+getIVColor(defaultVal)+'"></div></div>'
        +'<div class="iv-target" style="color:'+t.color+'" title="'+t.note+'">CEL: '+t.val+'</div>'
        +'<div class="iv-label" id="ivlabel-'+sn+'">'+getIVLabel(defaultVal)+'</div></div>';
    }).join('');
    return '<div class="iv-section"><h2>\ud83c\udfb2 Individual Values (IV) <span style="font-size:11px;color:#aaa;font-family:VT323,monospace">skala 0\u201331</span></h2>'
      +'<div class="iv-role-badge">Rola: '+role+'</div>'
      +'<div class="iv-summary">'+summaryLine+'</div>'
      +'<div style="font-size:14px;color:#666;margin-bottom:6px">\u2b50 priorytet | \u25aa mniej wa\u017cne | Zmie\u0144 liczby \u017ceby sprawdzi\u0107</div>'
      +rows
      +'<div class="iv-legend">'
      +'<div class="iv-legend-item"><div class="iv-legend-dot" style="background:#55ff55"></div>28\u201331 Doskona\u0142e</div>'
      +'<div class="iv-legend-item"><div class="iv-legend-dot" style="background:#f8d030"></div>20\u201327 Dobre</div>'
      +'<div class="iv-legend-item"><div class="iv-legend-dot" style="background:#f08030"></div>10\u201319 S\u0142abe</div>'
      +'<div class="iv-legend-item"><div class="iv-legend-dot" style="background:#ff5555"></div>0\u20139 Z\u0142e</div>'
      +'</div></div>';
  }

  // ── ROLE DETECTION ──
  function detectRole(statMap) {
    var atk=statMap['attack']||0,spatk=statMap['special-attack']||0,def=statMap['defense']||0,spdef=statMap['special-defense']||0,spe=statMap['speed']||0,hp=statMap['hp']||0;
    var isPhys=atk>=spatk+15,isSpec=spatk>=atk+15,isMixed=!isPhys&&!isSpec,isTank=(def+spdef)/2>=90&&spe<80,isFast=spe>=80,isTR=spe<=50;
    var label='\u2696 Zbalansowany';
    if(isPhys&&isFast)label='\u2694 Fizyczny Atakuj\u0105cy';else if(isPhys&&isTank)label='\ud83d\udee1 Fizyczny Tank';else if(isPhys)label='\u2694 Fizyczny (wolny)';else if(isSpec&&isFast)label='\u2728 Specjalny Atakuj\u0105cy';else if(isSpec&&isTank)label='\ud83d\udd2e Specjalny Tank';else if(isSpec)label='\u2728 Specjalny (wolny)';else if(isTank)label='\ud83d\udee1 Tank';else if(isFast)label='\ud83d\udca8 Szybki Mieszany';else label='\u2694\u2728 Mieszany';
    return {atk:atk,spatk:spatk,def:def,spdef:spdef,spe:spe,hp:hp,isPhys:isPhys,isSpec:isSpec,isMixed:isMixed,isTank:isTank,isFast:isFast,isTR:isTR,label:label};
  }

  // ── BUILD GENERATOR ──
  // ── ABILITY RECOMMENDATION LOGIC ──
  var ABILITY_PREF = {
    physical: ['huge-power','pure-power','tough-claws','sheer-force','iron-fist','moxie','technician','skill-link','guts','sand-rush','swift-swim','chlorophyll','reckless','adaptability','hustle','strong-jaw','no-guard','scrappy','defiant','intrepid-sword'],
    special: ['adaptability','download','soul-heart','beast-boost','serene-grace','sheer-force','magic-guard','protean','libero','tinted-lens','drought','drizzle','electric-surge','psychic-surge','grassy-surge','misty-surge','transistor','dragons-maw','compound-eyes'],
    defensive: ['regenerator','multiscale','magic-bounce','magic-guard','unaware','natural-cure','sturdy','intimidate','imposter','poison-heal','thick-fat','water-absorb','volt-absorb','flash-fire','levitate','marvel-scale','fur-coat','ice-scales','prankster','heatproof'],
    mixed: ['protean','libero','adaptability','sheer-force','download','beast-boost','soul-heart','galvanize','pixilate','refrigerate','aerilate','tough-claws','hustle','no-guard'],
    support: ['prankster','regenerator','magic-bounce','natural-cure','intimidate','drizzle','drought','snow-warning','sand-stream','unaware','poison-heal','levitate','thick-fat','serene-grace','synchronize','trace','healer'],
    niche: ['speed-boost','contrary','magic-guard','simple','moody','disguise','wonder-guard','huge-power','pure-power','gorilla-tactics','ice-scales','fur-coat','skill-link','technician']
  };

  function pickAbility(pokemonAbilities, abilityDetails, buildType) {
    var prefs = ABILITY_PREF[buildType] || [];
    var abilities = pokemonAbilities || [];
    var details = abilityDetails || [];
    // Score each ability
    var scored = abilities.map(function(a, idx) {
      var slug = a.ability.name;
      var prefIdx = prefs.indexOf(slug);
      var score = prefIdx !== -1 ? (prefs.length - prefIdx) : 0;
      if (a.is_hidden && score > 0) score += 5; // hidden competitive abilities are often best
      if (!a.is_hidden && score === 0) score = 1; // prefer non-hidden as baseline
      var detail = details[idx] || null;
      return { slug: slug, isHidden: a.is_hidden, score: score, detail: detail };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored[0] || null;
  }

  function getAbilityText(abilityDetail) {
    if (!abilityDetail) return { name: '?', desc: '' };
    var eName = abilityDetail.name || '?';
    // Get localized name
    var nameEntry;
    if (currentLang === 'pl') {
      nameEntry = (abilityDetail.names || []).find(function(n){ return n.language.name === 'pl'; });
    }
    if (!nameEntry) nameEntry = (abilityDetail.names || []).find(function(n){ return n.language.name === 'en'; });
    var displayName = nameEntry ? nameEntry.name : eName.replace(/-/g, ' ');
    // Get localized description
    var descEntry;
    var langCode = currentLang === 'pl' ? 'pl' : 'en';
    var flavorEntries = abilityDetail.flavor_text_entries || [];
    descEntry = flavorEntries.filter(function(f){ return f.language.name === langCode; }).pop();
    if (!descEntry && langCode === 'pl') descEntry = flavorEntries.filter(function(f){ return f.language.name === 'en'; }).pop();
    var desc = descEntry ? descEntry.flavor_text.replace(/\n/g, ' ').replace(/\f/g, ' ') : '';
    return { name: displayName, desc: desc };
  }

  function renderItemBox(mainItem, altItems) {
    var mainSlug = getCompItemSlug(mainItem);
    var mainDesc = getCompItemDesc(mainItem);
    var mainName = itemName(mainItem);
    var mainImg = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+mainSlug+'.png" onerror="this.parentNode.innerHTML=\'<span style=color:#555;font-size:32px>\u25a1</span>\'" style="width:48px;height:48px" />';
    var mainHTML = '<div class="item-main">' +
      '<div class="item-main-label">\ud83d\udd39 '+t('build.mainItem')+'</div>' +
      '<div style="margin:6px 0">'+mainImg+'</div>' +
      '<div class="item-big-name">'+mainName+'</div>' +
      (mainName !== mainItem ? '<div style="font-size:11px;color:#555">('+mainItem+')</div>' : '') +
      '<div class="item-big-desc">'+mainDesc+'</div></div>';
    var altsHTML = '';
    if (altItems && altItems.length > 0) {
      var altCards = altItems.map(function(ai) {
        var aSlug = getCompItemSlug(ai);
        var aName = itemName(ai);
        var aDesc = getCompItemDesc(ai);
        var aImg = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/'+aSlug+'.png" onerror="this.style.display=\'none\'" style="width:24px;height:24px" />';
        return '<div class="item-alt-card">' + aImg +
          '<div class="item-alt-info"><div class="item-alt-name">'+aName+'</div>' +
          (aName !== ai ? '<div style="font-size:10px;color:#555">('+ai+')</div>' : '') +
          '<div class="item-alt-desc">'+aDesc+'</div></div></div>';
      }).join('');
      altsHTML = '<div class="item-alt-section">' +
        '<div class="item-alt-label">'+t('build.altItems')+'</div>' +
        '<div class="item-alt-grid">' + altCards + '</div></div>';
    }
    return '<div class="comp-box"><div class="comp-box-title">\ud83d\udce6 '+t('build.item')+'</div>' +
      '<div class="item-layout">' + mainHTML + altsHTML + '</div></div>';
  }

  function generateBuild(statMap, pokemonTypes, moves, buildType, pokemonAbilities, abilityDetails) {
    var r = detectRole(statMap);
    var spread, note, nName, nUp, nDown, nWhy, item, altItems;
    if (buildType === 'physical') {
      if(r.isFast) spread=[['attack',252],['speed',252],['hp',4]]; else spread=[['attack',252],['hp',252],['defense',4]];
      note=currentLang==='en'?'Max physical damage.':'Maksuj fizyczne obra\u017cenia.';
      if(r.isFast){nName='Jolly';nUp='+Szybk.';nDown='-Sp.Atak';nWhy=currentLang==='en'?'Faster without losing Atk':'Szybszy bez straty Ataku';}
      else{nName='Adamant';nUp='+Atak';nDown='-Sp.Atak';nWhy=currentLang==='en'?'Max Atk':'Maks Atak';}
      if(r.spe>=100){item='Choice Band';altItems=['Life Orb','Focus Sash'];}
      else{item='Life Orb';altItems=['Choice Band','Assault Vest'];}
    } else if (buildType === 'special') {
      if(r.isFast) spread=[['special-attack',252],['speed',252],['hp',4]]; else spread=[['special-attack',252],['hp',252],['special-defense',4]];
      note=currentLang==='en'?'Max special damage.':'Maksuj specjalne obra\u017cenia.';
      if(r.isFast){nName='Timid';nUp='+Szybk.';nDown='-Atak';nWhy=currentLang==='en'?'Faster without losing SpAtk':'Szybszy bez straty Sp.Atak';}
      else{nName='Modest';nUp='+Sp.Atak';nDown='-Atak';nWhy=currentLang==='en'?'Max SpAtk':'Maks Sp.Atak';}
      if(r.spe>=100){item='Choice Specs';altItems=['Life Orb','Focus Sash'];}
      else{item='Life Orb';altItems=['Choice Specs','Assault Vest'];}
    } else if (buildType === 'defensive') {
      var defMore = r.def >= r.spdef;
      if(defMore) spread=[['hp',252],['defense',252],['special-defense',4]]; else spread=[['hp',252],['special-defense',252],['defense',4]];
      note=currentLang==='en'?'Maximum endurance.':'Maksymalna wytrzyma\u0142o\u015b\u0107.';
      if(defMore){nName='Impish';nUp='+'+(currentLang==='en'?'Def':'Obrona');nDown='-Sp.Atak';nWhy=currentLang==='en'?'Physical endurance':'Fizyczna wytrzyma\u0142o\u015b\u0107';}
      else{nName='Calm';nUp='+'+(currentLang==='en'?'SpDef':'Sp.Obr');nDown='-Atak';nWhy=currentLang==='en'?'Special endurance':'Specjalna wytrzyma\u0142o\u015b\u0107';}
      item='Leftovers';altItems=['Rocky Helmet','Sitrus Berry'];
    } else if (buildType === 'mixed') {
      spread=[['attack',128],['special-attack',128],['speed',252]];
      note=currentLang==='en'?'Balanced offensive coverage.':'Zbalansowana ofensywa mieszana.';
      if(r.isFast){nName='Naive';nUp='+Szybk.';nDown='-Sp.Obr';nWhy=currentLang==='en'?'Speed without losing offense':'Szybko\u015b\u0107 bez utraty ofensywy';}
      else if(r.atk>r.spatk){nName='Lonely';nUp='+Atak';nDown='-Obrona';nWhy=currentLang==='en'?'Max physical for mixed':'Maks fiz. dla mieszanego';}
      else{nName='Mild';nUp='+Sp.Atak';nDown='-Obrona';nWhy=currentLang==='en'?'Max special for mixed':'Maks spec. dla mieszanego';}
      item='Life Orb';altItems=['Expert Belt','Weakness Policy'];
    } else if (buildType === 'support') {
      var defMore2 = r.def >= r.spdef;
      spread=[['hp',252],[defMore2?'defense':'special-defense',252],[defMore2?'special-defense':'defense',4]];
      note=currentLang==='en'?'Team support and utility.':'Wsparcie dru\u017cyny i u\u017cyteczno\u015b\u0107.';
      if(defMore2){nName='Bold';nUp='+'+(currentLang==='en'?'Def':'Obrona');nDown='-Atak';nWhy=currentLang==='en'?'Max bulk for support':'Maks obrona dla wsparcia';}
      else{nName='Calm';nUp='+'+(currentLang==='en'?'SpDef':'Sp.Obr');nDown='-Atak';nWhy=currentLang==='en'?'Max SpDef for support':'Maks Sp.Obr dla wsparcia';}
      item='Light Clay';altItems=['Leftovers','Mental Herb','Red Card'];
    } else {
      // niche
      if(r.spe<=50){
        spread=[[r.isPhys?'attack':'special-attack',252],['hp',252],[r.isPhys?'defense':'special-defense',4]];
        note=currentLang==='en'?'Trick Room abuser \u2014 minimum speed.':'Pod Trick Room \u2014 minimalna szybko\u015b\u0107.';
        nName=r.isPhys?'Brave':'Quiet';nUp=r.isPhys?'+Atak':'+Sp.Atak';nDown='-Szybk.';nWhy=currentLang==='en'?'Min speed for Trick Room':'Min szybko\u015b\u0107 pod Trick Room';
        item=r.isPhys?'Choice Band':'Choice Specs';altItems=['Life Orb','Assault Vest'];
      } else {
        spread=[[r.isPhys?'attack':'special-attack',252],['speed',252],['hp',4]];
        note=currentLang==='en'?'Revenge killer / lead.':'Revenge killer / lead.';
        nName=r.isPhys?'Jolly':'Timid';nUp='+Szybk.';nDown=r.isPhys?'-Sp.Atak':'-Atak';nWhy=currentLang==='en'?'Max speed for revenge kills':'Maks szybko\u015b\u0107 na revenge kille';
        item='Focus Sash';altItems=['Choice Scarf','Heavy-Duty Boots','Air Balloon'];
      }
    }
    var total = spread.reduce(function(s,e){return s+e[1];},0);
    var evRows = spread.map(function(e){
      var sn=e[0],val=e[1],color=STAT_COLORS[sn]||'#888',pct=Math.round(val/252*100);
      return '<div class="ev-row"><span class="ev-amount">'+val+'</span><span class="ev-stat-name" style="color:'+color+'">'+(STAT_NAMES[sn]||sn)+'</span><div class="ev-bar-bg"><div class="ev-bar" style="width:'+pct+'%;background:'+color+'"></div></div></div>';
    }).join('');
    var evHTML='<div class="comp-box"><div class="comp-box-title">\ud83d\udcca '+t('build.ev')+' <span style="font-size:10px;color:#888;font-family:VT323,monospace">(max 510)</span></div>'+evRows+'<div class="ev-total">'+t('gen.sum')+': '+total+'/510</div><div style="font-size:14px;color:#666;margin-top:5px">'+note+'</div></div>';
    var natureHTML='<div class="comp-box"><div class="comp-box-title">\ud83d\udc8e '+t('build.nature')+'</div><div class="nature-badge">'+natureName(nName)+'</div><div style="font-size:12px;color:#555;margin-bottom:4px">('+nName+')</div><div class="nature-detail"><span class="nature-up">\u25b2 '+nUp+'</span> | <span class="nature-down">\u25bc '+nDown+'</span></div><div style="font-size:14px;color:#666;margin-top:6px">'+nWhy+'</div></div>';
    var itemHTML = renderItemBox(item, altItems);
    // Ability box
    var picked = pickAbility(pokemonAbilities, abilityDetails, buildType);
    var abilText = picked ? getAbilityText(picked.detail) : { name: '?', desc: '' };
    var hiddenTag = (picked && picked.isHidden) ? '<span class="ability-hidden-tag">'+t('build.abilityHidden')+'</span>' : '';
    var recTag = (picked && picked.score > 1) ? '<div class="ability-rec-tag">\u2705 '+t('build.abilityRec')+'</div>' : '';
    var abilityHTML='<div class="ability-box"><div class="comp-box-title">\u26a1 '+t('build.ability')+'</div><div class="ability-name">'+abilText.name+hiddenTag+'</div><div class="ability-desc">'+abilText.desc+'</div>'+recTag+'</div>';
    var movesHTML = buildBest4ForType(moves, pokemonTypes, statMap, buildType);
    return '<div class="comp-grid-full">'+evHTML+'</div>'
      +'<div class="comp-grid">'+natureHTML+itemHTML+abilityHTML+'</div>'
      +'<div class="comp-box-title" style="margin-bottom:8px">\u2694 '+t('build.best4')+'</div>'
      +'<div style="font-size:14px;color:#666;margin-bottom:8px">'+(currentLang==='en'?'Automatically selected based on types and stats.':'Automatycznie dobrane na podstawie typ\u00f3w i statystyk.')+'</div>'
      +'<div class="best4-grid">'+movesHTML+'</div>';
  }

  // ── BEST 4 FOR BUILD TYPE ──
  function buildBest4ForType(moves, pokemonTypes, statMap, buildType) {
    var r = detectRole(statMap);
    var typeSet = new Set(pokemonTypes);
    var pool = [];
    moves.forEach(function(m){
      var vgd = m.version_group_details.slice().sort(function(a,b){return b.version_group.url.localeCompare(a.version_group.url,undefined,{numeric:true});})[0];
      if(!vgd) return;
      var method = vgd.move_learn_method.name;
      if(!['level-up','machine','egg'].includes(method)) return;
      var nm = m.move.name, md = MOVE_DATA[nm], lv = vgd.level_learned_at;
      var power = md?md[0]:0, mtype = md?md[1]:'normal', cat = md?md[2]:(power>0?(r.isPhys?'P':'S'):'Z');
      var score = 0;
      if(cat==='Z'){
        var offSetup=['swords-dance','dragon-dance','nasty-plot','quiver-dance','tail-glow','shell-smash','belly-drum','work-up','geomancy','calm-mind','bulk-up','coil'];
        var defSetup=['recover','roost','soft-boiled','slack-off','milk-drink','synthesis','moonlight','morning-sun','wish','rest','shore-up'];
        if(buildType==='defensive'||buildType==='support'){
          if(defSetup.includes(nm))score=90;else if(['stealth-rock','toxic','will-o-wisp','thunder-wave','spikes'].includes(nm))score=70;else if(offSetup.includes(nm))score=30;else score=20;
          if(buildType==='support'){if(['stealth-rock','toxic','will-o-wisp','thunder-wave','spikes','reflect','light-screen','aurora-veil','tailwind','sticky-web','trick-room','healing-wish','rapid-spin','defog','u-turn','volt-switch','knock-off','encore','taunt','yawn','haze','whirlwind','roar'].includes(nm))score+=30;}
        } else {
          if(offSetup.includes(nm))score=80;else if(defSetup.includes(nm))score=15;else score=10;
        }
      } else {
        score = power;
        if(buildType==='physical'&&cat==='P')score*=1.5;else if(buildType==='special'&&cat==='S')score*=1.5;else if(buildType==='mixed')score*=1.2;else if(buildType==='defensive'||buildType==='support')score*=0.8;
        if(buildType==='physical'&&cat==='S')score*=0.3;
        if(buildType==='special'&&cat==='P')score*=0.3;
        if(buildType==='mixed'){if(cat==='P')score*=1.1;if(cat==='S')score*=1.1;}
        if(typeSet.has(mtype))score*=1.5;
        var prioMoves=['extreme-speed','quick-attack','aqua-jet','ice-shard','mach-punch','bullet-punch','sucker-punch','shadow-sneak','vacuum-wave','first-impression'];
        if(prioMoves.includes(nm))score+=25;
      }
      pool.push({nm:nm,power:power,mtype:mtype,cat:cat,score:score,lv:lv,method:method});
    });
    var seen = new Set();
    var unique = pool.filter(function(m){if(seen.has(m.nm))return false;seen.add(m.nm);return true;});
    unique.sort(function(a,b){return b.score-a.score;});
    var chosen=[],typeCounts={};
    for(var i=0;i<unique.length&&chosen.length<4;i++){
      var m=unique[i],tc=typeCounts[m.mtype]||0;
      if(tc>=2)continue;
      typeCounts[m.mtype]=(tc||0)+1;chosen.push(m);
    }
    for(var i=0;i<unique.length&&chosen.length<4;i++){if(!chosen.includes(unique[i]))chosen.push(unique[i]);}
    if(!chosen.length)return '<div style="color:#666">Brak danych o atakach.</div>';
    var stars=function(sc){return sc>=180?'\u2b50\u2b50\u2b50\u2b50':sc>=120?'\u2b50\u2b50\u2b50':sc>=60?'\u2b50\u2b50':'\u2b50';};
    var catLabel=function(cat){return cat==='P'?'<span class="move-cat-p">Fiz.</span>':cat==='S'?'<span class="move-cat-s">Spec.</span>':'<span class="move-cat-z">Status</span>';};
    return chosen.map(function(m,i){
      var isStab=typeSet.has(m.mtype);
      var stabL=isStab?'<span class="move-stab">STAB</span>':'<span class="move-coverage">'+typeName(m.mtype)+'</span>';
      var pwrStr=m.power>0?'<span class="move-power">MOC: '+m.power+'</span>':'<span class="move-power" style="color:#666">Status</span>';
      return '<div class="move-card"><span class="move-card-num">'+(i+1)+'</span><div class="move-card-name">'+typeIconHTML(m.mtype,18)+' '+m.nm.replace(/-/g,' ')+'</div><div class="move-card-meta">'+catLabel(m.cat)+stabL+pwrStr+'</div><div class="move-stars">'+stars(m.score)+'</div></div>';
    }).join('');
  }

  // ── ELIGIBLE BUILDS ──
  function getEligibleBuilds(statMap) {
    var atk=statMap['attack']||0, spatk=statMap['special-attack']||0;
    var def=statMap['defense']||0, spdef=statMap['special-defense']||0;
    var spe=statMap['speed']||0, hp=statMap['hp']||0;
    var builds = ['physical','special','defensive'];
    if (atk >= 65 && spatk >= 65) builds.push('mixed');
    if (hp >= 60 && (def >= 65 || spdef >= 65)) builds.push('support');
    if (spe <= 50 || spe >= 100 || builds.length <= 3) builds.push('niche');
    return builds;
  }

  // ── SORT BUILDS BY BASE STATS PRIORITY ──
  function sortBuildsByStats(builds, statMap) {
    var atk  = statMap['attack'] || 0;
    var spatk = statMap['special-attack'] || 0;
    var def  = statMap['defense'] || 0;
    var spdef = statMap['special-defense'] || 0;
    var spe  = statMap['speed'] || 0;
    var hp   = statMap['hp'] || 0;
    var totalOff = atk + spatk;
    var totalDef = def + spdef + hp;
    var scored = builds.map(function(b) {
      var score = 0;
      switch (b.key) {
        case 'physical':
          score = atk * 3 + spe;
          if (atk > spatk) score += (atk - spatk) * 2;
          break;
        case 'special':
          score = spatk * 3 + spe;
          if (spatk > atk) score += (spatk - atk) * 2;
          break;
        case 'defensive':
          score = def * 2 + spdef * 2 + hp * 1.5;
          if (totalDef > totalOff * 1.2) score += 80;
          break;
        case 'mixed':
          score = atk * 1.5 + spatk * 1.5 + spe;
          var diff = Math.abs(atk - spatk);
          if (diff < 20) score += 60;
          else score -= diff;
          break;
        case 'support':
          score = hp * 2 + def + spdef + 30;
          if (totalDef > totalOff * 1.3) score += 60;
          break;
        case 'niche':
          score = spe * 1.5 + Math.max(atk, spatk);
          if (spe <= 50) score += 30;
          if (spe >= 100) score += 20;
          break;
      }
      return { build: b, score: score };
    });
    scored.sort(function(a, b) { return b.score - a.score; });
    return scored.map(function(s) { return s.build; });
  }

  // ── COMPETITIVE SECTION WITH UP TO 6 BUILDS ──
  function buildCompetitiveSection(stats, pokemonTypes, moves, pokemonAbilities, abilityDetails) {
    var statMap = {}; stats.forEach(function(s){statMap[s.stat.name]=s.base_stat;});
    var r = detectRole(statMap);
    lastBuildData = {statMap:statMap, pokemonTypes:pokemonTypes, r:r};
    var allBuilds = [
      {key:'physical',  label:t('build.phys'),    icon:'\u2694'},
      {key:'special',   label:t('build.spec'),    icon:'\u2728'},
      {key:'defensive', label:t('build.def'),     icon:'\ud83d\udee1'},
      {key:'mixed',     label:t('build.mixed'),   icon:'\ud83d\udd00'},
      {key:'support',   label:t('build.support'), icon:'\ud83d\udc9a'},
      {key:'niche',     label:t('build.niche'),   icon:'\ud83c\udfaf'}
    ];
    var eligible = getEligibleBuilds(statMap);
    var filteredBuilds = allBuilds.filter(function(b){ return eligible.indexOf(b.key) !== -1; });
    var builds = sortBuildsByStats(filteredBuilds, statMap);
    var tabsHTML = builds.map(function(b,i){
      var bestStar = i===0 ? '<span class="best-choice-star">\u2b50</span>' : '';
      var bestBadge = i===0 ? ' <span class="best-choice-badge">'+t('build.bestChoice')+'</span>' : '';
      return '<button class="build-tab'+(i===0?' active':'')+'" onclick="switchBuildTab(this,\'build-panel-'+i+'\')">'+bestStar+(i+1)+'. '+b.icon+' '+b.label+bestBadge+'</button>';
    }).join('');
    var panelsHTML = builds.map(function(b,i){
      return '<div class="build-panel'+(i===0?' active':'')+'" id="build-panel-'+i+'">'+generateBuild(statMap,pokemonTypes,moves,b.key,pokemonAbilities,abilityDetails)+'</div>';
    }).join('');
    return '<div class="comp-section"><h2>\ud83c\udfc6 '+t('sec.comp')+' \u2014 '+r.label+'</h2><button class="copy-link-btn" id="copy-link-btn" onclick="copyBuildLink()">\ud83d\udd17 '+t('build.copyLink')+'</button>'
      +'<div class="build-tabs">'+tabsHTML+'</div>'
      +panelsHTML
      +'</div>';
  }

  // ── FULL MOVELIST with type icons ──
  function buildMovesSection(moves) {
    var lvlMoves=[],tmMoves=[],eggMoves=[];
    moves.forEach(function(m){
      var vgd=m.version_group_details.slice().sort(function(a,b){return b.version_group.url.localeCompare(a.version_group.url,undefined,{numeric:true});})[0];
      if(!vgd)return;
      var method=vgd.move_learn_method.name,lv=vgd.level_learned_at,nm=m.move.name;
      if(method==='level-up')lvlMoves.push({name:nm,lv:lv});
      else if(method==='machine')tmMoves.push({name:nm});
      else if(method==='egg')eggMoves.push({name:nm});
    });
    lvlMoves.sort(function(a,b){return a.lv-b.lv;});tmMoves.sort(function(a,b){return a.name.localeCompare(b.name);});eggMoves.sort(function(a,b){return a.name.localeCompare(b.name);});
    var lvlHTML=lvlMoves.length?'<table class="move-table"><tr><th>'+t('mv.lvl')+'</th><th>'+t('mv.attack')+'</th><th>'+t('mv.type')+'</th><th>'+t('mv.power')+'</th></tr>'+lvlMoves.map(function(m){var md=MOVE_DATA[m.name];var mt=md?md[1]:'normal';return '<tr><td><span class="move-lv">'+(m.lv||'\u2014')+'</span></td><td class="move-name">'+typeIconHTML(mt,16)+' '+m.name.replace(/-/g,' ')+'</td><td><span class="type-badge type-'+mt+'" style="font-size:12px;padding:1px 6px">'+typeName(mt)+'</span></td><td style="color:#f8d030;font-size:17px">'+(md?md[0]||'\u2014':'\u2014')+'</td></tr>';}).join('')+'</table>':'<div style="color:#666">'+(currentLang==='en'?'None.':'Brak.')+'</div>';
    var tmHTML=tmMoves.length?'<div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:4px">'+tmMoves.map(function(m){var md=MOVE_DATA[m.name];var mt=md?md[1]:'normal';return '<span class="move-tm">'+typeIconHTML(mt,14)+' '+m.name.replace(/-/g,' ')+'</span>';}).join('')+'</div>':'<div style="color:#666">'+(currentLang==='en'?'None.':'Brak.')+'</div>';
    var eggHTML=eggMoves.length?'<div style="display:flex;flex-wrap:wrap;gap:6px;padding-top:4px">'+eggMoves.map(function(m){var md=MOVE_DATA[m.name];var mt=md?md[1]:'normal';return '<span style="background:#1a0a1a;color:#c084fc;border:1px solid #7c3aed;padding:1px 8px;font-size:15px">'+typeIconHTML(mt,14)+' '+m.name.replace(/-/g,' ')+'</span>';}).join('')+'</div>':'<div style="color:#666">'+(currentLang==='en'?'None.':'Brak.')+'</div>';
    return '<div class="moves-section"><h2>\ud83d\udcdc '+t('sec.moves')+'</h2><div class="moves-tabs"><button class="moves-tab active" onclick="switchMovesTab(this,\'mv-lvl\')">\ud83d\udcc8 '+t('mv.level')+' ('+lvlMoves.length+')</button><button class="moves-tab" onclick="switchMovesTab(this,\'mv-tm\')">\ud83d\udcbf '+t('mv.tm')+' ('+tmMoves.length+')</button>'+(eggMoves.length?'<button class="moves-tab" onclick="switchMovesTab(this,\'mv-egg\')">\ud83e\udd5a '+t('mv.egg')+' ('+eggMoves.length+')</button>':'')+'</div><div class="moves-panel active" id="mv-lvl">'+lvlHTML+'</div><div class="moves-panel" id="mv-tm">'+tmHTML+'</div>'+(eggMoves.length?'<div class="moves-panel" id="mv-egg">'+eggHTML+'</div>':'')+'</div>';
  }

  // ── CALCULATOR SECTION ──
  function buildCalculatorSection(stats, abilityDetailsArr) {
    var statMap={}; stats.forEach(function(s){statMap[s.stat.name]=s.base_stat;});
    var calcEligible = getEligibleBuilds(statMap);
    var _bLabels = {'physical':t('build.phys'),'special':t('build.spec'),'defensive':t('build.def'),'mixed':t('build.mixed'),'support':t('build.support'),'niche':t('build.niche')};
    var calcBuildOpts = calcEligible.map(function(key){return '<option value="'+key+'">'+(_bLabels[key]||key)+'</option>';}).join('');
    var ORDER=['hp','attack','defense','special-attack','special-defense','speed'];
    var ivRows = ORDER.map(function(sn){
      return '<div class="calc-box"><label>'+(STAT_NAMES[sn]||sn)+' IV (0-31)</label><div class="calc-iv-hybrid"><input type="range" min="0" max="31" value="31" oninput="syncCalcIVHybrid(this,\'range\',\''+sn+'\')" /><input class="calc-field" type="number" min="0" max="31" value="31" id="calc-iv-'+sn+'" oninput="syncCalcIVHybrid(this,\'number\',\''+sn+'\')" /></div></div>';
    }).join('');
    var natures = ['Hardy','Lonely','Brave','Adamant','Naughty','Bold','Docile','Relaxed','Impish','Lax','Timid','Hasty','Serious','Jolly','Naive','Modest','Mild','Quiet','Bashful','Rash','Calm','Gentle','Sassy','Careful','Quirky'];
    var natureOpts = natures.map(function(n){return '<option value="'+n+'">'+natureName(n)+(natureName(n)!==n?' ('+n+')':'')+'</option>';}).join('');
    var abilities = p.abilities.map(function(a){return a.ability.name;});
    var adArr = abilityDetailsArr || [];
    var abilityOpts = abilities.map(function(a, idx){
      var detail = adArr[idx];
      var localName = a;
      if (detail) {
        var ne; if(currentLang==='pl') ne=(detail.names||[]).find(function(n){return n.language.name==='pl';});
        if(!ne) ne=(detail.names||[]).find(function(n){return n.language.name==='en';});
        if(ne) localName=ne.name;
      }
      var isH = p.abilities.find(function(ab){return ab.ability.name===a;}).is_hidden;
      return '<option value="'+a+'">'+localName+(isH?' ['+(currentLang==='en'?'hidden':'ukryta')+']':'')+'</option>';
    }).join('');
    return '<div class="calc-section"><h2>\ud83e\uddee '+t('sec.calc')+'</h2>'
      +'<div style="font-size:16px;color:#888;margin-bottom:10px">'+(currentLang==='en'?'Enter your IVs, choose Nature and Ability to compare with the optimal build.':'Wpisz swoje IV, wybierz Natur\u0119 i Zdolno\u015b\u0107, aby por\u00f3wna\u0107 z optymalnym buildem.')+'</div>'
      +'<div class="calc-grid">'+ivRows+'</div>'
      +'<div class="calc-grid"><div class="calc-box"><label>'+t('build.nature')+'</label><select class="calc-select" id="calc-nature">'+natureOpts+'</select></div>'
      +'<div class="calc-box"><label>'+t('build.ability')+'</label><select class="calc-select" id="calc-ability">'+abilityOpts+'</select></div></div>'
      +'<div class="calc-grid"><div class="calc-box"><label>'+(currentLang==='en'?'Compare with build:':'Por\u00f3wnaj z buildem:')+'</label><select class="calc-select" id="calc-build-type">'+calcBuildOpts+'</select></div>'
      +'<div class="calc-box" style="display:flex;align-items:flex-end"><button class="mc-btn" onclick="evaluatePokemon()" style="width:100%">\ud83d\udcca '+t('gen.evaluate')+'</button></div></div>'
      +'<div class="calc-verdict" id="calc-verdict"><span class="verdict-emoji">\u2753</span>'+(currentLang==='en'?'Enter data and click "Rate!"':'Wpisz dane i kliknij "Oce\u0144!"')+'</div></div>';
  }

  // Build stats HTML
  var statsHTML = p.stats.map(function(st){
    var sname=STAT_NAMES[st.stat.name]||st.stat.name,val=st.base_stat,pct=Math.min(100,Math.round(val/255*100)),color=STAT_COLORS[st.stat.name]||'#888';
    return '<div class="stat-row"><span class="stat-name">'+sname+'</span><span class="stat-val">'+val+'</span><div class="stat-bar-bg"><div class="stat-bar" style="width:'+pct+'%;background:'+color+'"></div></div></div>';
  }).join('');

  var typesHTML = p.types.map(function(tp){return '<span class="type-badge type-'+tp.type.name+'">'+typeName(tp.type.name)+'</span>';}).join('');
  var evoHTML = evoChain ? renderEvoChain(evoChain.chain) : '<span style="color:#666">'+(currentLang==='en'?'No evolution data':'Brak danych ewolucji')+'</span>';

  // Cobblemon section
  var cobHTML = '';
  if (isFriendship) {
    var detail = FRIENDSHIP_DETAIL[p.name] || (currentLang==='en'?'Requires high friendship.':'Wymaga wysokiej przyja\u017ani.');
    cobHTML += '<div class="info-row"><span class="info-icon">\ud83d\udc9b</span><div class="info-text"><em>'+(currentLang==='en'?'Friendship Evolution':'Ewolucja przez Przyja\u017a\u0144')+'</em><br>'+detail+'<br>'+(currentLang==='en'?'Check friendship level:':'Sprawd\u017a poziom przyja\u017ani komend\u0105:')+'<div class="cmd-block">/checkfriendship @s</div></div></div>';
  }
  if (isTradeEvo) {
    var te = LINK_CABLE_EVOS[p.name];
    cobHTML += '<div class="info-row"><span class="info-icon">\ud83d\udd17</span><div class="info-text"><em>'+(currentLang==='en'?'Link Cable Evolution':'Ewolucja przez Link Cable')+'</em> \u2192 <em>'+te.result+'</em><br>'+(te.item?(currentLang==='en'?'Held item: ':'Trzymany przedmiot: ')+'<code>'+te.item+'</code><br>':'')+(currentLang==='en'?'Use Link Cable and activate in hand.':'U\u017cyj Link Cable i aktywuj go w r\u0119ce.')+'</div></div>';
  }

  var abilitiesHTML = p.abilities.map(function(a){
    return '<span style="color:'+(a.is_hidden?'#a855f7':'#55ffff')+'">'+a.ability.name+(a.is_hidden?' <span style="font-size:13px;color:#a855f7">['+(currentLang==='en'?'hidden':'ukryta')+']</span>':'')+'</span>';
  }).join(', ');
  var height=(p.height/10).toFixed(1),weight=(p.weight/10).toFixed(1);
  function getGen(id){for(var g=1;g<=9;g++){var r=GEN_RANGES[g];if(id>=r[0]&&id<=r[1])return (currentLang==='en'?'Generation ':'Generacja ')+['I','II','III','IV','V','VI','VII','VIII','IX'][g-1];}return '?';}
  if(!cobHTML)cobHTML='<div class="info-row"><span class="info-icon">\u2705</span><div class="info-text">'+(currentLang==='en'?'This Pok\u00e9mon has no special Cobblemon requirements.':'Ten Pok\u00e9mon nie wymaga specjalnych warunk\u00f3w Cobblemon.')+'</div></div>';
  var artworkUrl = (p.sprites&&p.sprites.other&&p.sprites.other['official-artwork']?p.sprites.other['official-artwork'].front_default:null) || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+p.id+'.png';
  var isFav = isFavorite(p.id);

  // Build biome section
  var biomeHTML = buildBiomeSection(s.habitat, p.types);

  document.getElementById('main-area').innerHTML =
    '<div class="page-title"><span>#'+String(p.id).padStart(3,'0')+' '+p.name.toUpperCase()+' <button class="fav-star'+(isFav?' active':'')+'" id="fav-star-btn" onclick="toggleFavorite('+p.id+',\''+p.name+'\')" title="'+(currentLang==='en'?'Add to favorites':'Dodaj do ulubionych')+'">\u2b50</button></span></div>'
    +'<div class="detail-grid"><div>'
    +'<div class="mc-panel pokemon-portrait"><img src="'+artworkUrl+'" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+p.id+'.png\'" alt="'+p.name+'" style="width:160px;height:160px"/><div class="pokemon-name-big">'+p.name+'</div><div class="pokemon-number">#'+String(p.id).padStart(3,'0')+' \u00b7 '+getGen(p.id)+'</div><div class="types" style="margin-top:10px">'+typesHTML+'</div><hr class="section-sep" style="margin:10px 0"><div style="font-size:16px;color:#888;font-style:italic;max-width:200px;margin:0 auto;text-align:center">'+flavor+'</div></div>'
    +'<div class="mc-panel" style="margin-top:12px"><h2>\ud83d\udccb '+t('sec.basicData')+'</h2><div class="info-entry"><span class="info-label">'+t('det.height')+':</span><span class="info-value">'+height+' m</span></div><div class="info-entry"><span class="info-label">'+t('det.weight')+':</span><span class="info-value">'+weight+' kg</span></div><div class="info-entry"><span class="info-label">'+t('det.types')+':</span><span class="info-value">'+p.types.map(function(tp){return typeName(tp.type.name);}).join(', ')+'</span></div><div class="info-entry"><span class="info-label">'+t('det.abilities')+':</span><span class="info-value" style="font-size:16px">'+abilitiesHTML+'</span></div><div class="info-entry"><span class="info-label">'+t('det.habitat')+':</span><span class="info-value">'+(s.habitat?s.habitat.name:'\u2014')+'</span></div><div class="info-entry"><span class="info-label">'+t('det.catch')+':</span><span class="info-value">'+s.capture_rate+'/255</span></div><div class="info-entry"><span class="info-label">'+t('det.baseExp')+':</span><span class="info-value">'+(p.base_experience||'?')+'</span></div></div>'
    +biomeHTML
    +'</div>'
    +'<div>'
    +'<div class="mc-panel"><h2>\ud83d\udcca '+t('sec.baseStats')+'</h2>'+statsHTML+'<div style="font-size:15px;color:#666;margin-top:6px;">'+t('gen.sum')+': <span style="color:#fff">'+p.stats.reduce(function(a,st){return a+st.base_stat;},0)+'</span></div></div>'
    +buildIVSection(p.stats)
    +'<div class="mc-panel" style="margin-top:12px"><h2>\ud83e\uddec '+t('sec.evo')+'</h2><div class="evo-chain" id="evo-chain-container">'+evoHTML+'</div></div></div></div>'
    +'<div class="cobblemon-section" style="margin-top:16px"><h2><span class="cob-icon">\u2694</span> '+t('sec.cobblemon')+'</h2>'+cobHTML+'</div>'
    +buildCompetitiveSection(p.stats, p.types.map(function(tp){return tp.type.name;}), p.moves, p.abilities, abilityDetails || [])
    +buildMovesSection(p.moves)
    +buildCalculatorSection(p.stats, abilityDetails)
    +'<div style="height:40px"></div>';

  document.querySelectorAll('.iv-input').forEach(function(inp){updateIVBar(inp);});
  initAllIVSliders();
  document.querySelectorAll('.evo-item[data-evo-name]').forEach(function(el){
    el.addEventListener('click', function(){
      var n=el.dataset.evoName;var found=allPokemon.find(function(p){return p.name===n;});
      if(found)loadDetail(found.id,found.name);
    });
  });
}
