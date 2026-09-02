/* ================================================================
   pages.js — Routing stron i renderowanie podstron
   ================================================================ */

/* ── RANKING RENDERER ── */
function renderRankingPage() {
  var allTypesArr = Array.isArray(ALL_TYPES) ? ALL_TYPES : Object.keys(TYPE_HEX || {});
  var rankingData = (typeof TYPE_RANKING !== 'undefined' && TYPE_RANKING) ? TYPE_RANKING : {};
  var typeClr = (TYPE_HEX && TYPE_HEX[rankingSelectedType]) || '#888';
  var html = '<div class="page-title"><span>'+t('sec.ranking')+'</span></div>';
  html += '<div style="text-align:center;font-size:18px;color:#ccc;margin-bottom:16px;font-weight:700">'+t('ranking.desc')+'</div>';
  html += '<div class="ranking-nav-btns">';
  allTypesArr.forEach(function(tp) {
    var cls = tp === rankingSelectedType ? 'ranking-nav-btn type-badge type-'+tp+' active-rank' : 'ranking-nav-btn type-badge type-'+tp;
    html += '<button class="'+cls+'" onclick="selectRankingType(\''+tp+'\')">' + typeName(tp) + '</button>';
  });
  html += '</div>';
  var pokes = rankingData[rankingSelectedType] || [];
  html += '<div class="ranking-section" style="border-color:'+typeClr+';box-shadow:0 0 20px '+typeClr+'44,0 0 40px '+typeClr+'22">';
  html += '<div class="ranking-type-header" style="border:1px solid '+typeClr+'55;background:'+typeClr+'18"><span class="type-badge type-'+rankingSelectedType+'" style="font-size:18px!important;padding:6px 18px!important">' + typeName(rankingSelectedType) + '</span>';
  html += '<h3>Top 6 ' + typeName(rankingSelectedType) + '</h3></div>';
  html += '<div class="ranking-grid">';
  pokes.forEach(function(p, idx) {
    var artUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + p[0] + '.png';
    var spriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + p[0] + '.png';
    var typeBadges = p[2].map(function(tp){ return '<span class="type-badge type-'+tp+'">'+typeName(tp)+'</span>'; }).join('');
    /* Dynamic per-Pokemon counters based on individual type weaknesses */
    var counters = getCountersForPokemon(p[0], p[2]);
    var counterHTML = '';
    counters.forEach(function(c) {
      var cSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + c.id + '.png';
      counterHTML += '<div class="ranking-counter-item">' +
        '<img src="'+cSprite+'" loading="lazy" alt="'+c.name+'"/>' +
        '<span class="ranking-counter-name">' + c.name + '</span>' +
        '<span class="ranking-counter-reason">' + c.reason + '</span></div>';
    });
    var cardClr = TYPE_HEX[p[2][0]] || typeClr;
    html += '<div class="ranking-card" style="border-color:'+cardClr+'66;box-shadow:0 0 12px '+cardClr+'33">' +
      '<span class="ranking-card-rank">#' + (idx+1) + '</span>' +
      '<div class="ranking-card-header">' +
      '<img src="'+artUrl+'" loading="lazy" onerror="this.src=\''+spriteUrl+'\'" alt="'+p[1]+'"/>' +
      '<div><div class="ranking-card-name">' + p[1] + '</div>' +
      '<div class="ranking-card-types">' + typeBadges + '</div></div></div>' +
      '<div class="ranking-counters" style="border-top-color:'+cardClr+'33">' +
      '<div class="ranking-counters-title">\u2694 ' + t('ranking.counters') + '</div>' +
      counterHTML + '</div>' +
      '<button class="ranking-build-btn" onclick="loadBuildFromRanking('+p[0]+',\''+p[1]+'\')">' +
      '\ud83d\udccb ' + t('ranking.buildBtn') + '</button></div>';
  });
  html += '</div></div>';
  return html;
}

function selectRankingType(tp) {
  rankingSelectedType = tp;
  showPage('ranking');
}

function loadBuildFromRanking(id, name) {
  loadDetail(id, name).then(function() {
    setTimeout(function() {
      var comp = document.querySelector('.comp-section');
      if (comp) comp.scrollIntoView({behavior:'smooth',block:'start'});
    }, 600);
  });
}

function safeRenderPageSection(renderFn, fallbackText) {
  if (typeof renderFn === 'function') {
    try {
      return renderFn();
    } catch (e) {
      console.warn('safeRenderPageSection failed:', e);
    }
  }
  return '<div class="empty-state"><span class="big-icon">⚠</span><div>' + (fallbackText || (currentLang === 'en' ? 'The section is temporarily unavailable.' : 'Sekcja jest chwilowo niedostępna.')) + '</div></div>';
}

function openPokedex() {
  var sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768 && !sidebar.classList.contains('mobile-open')) toggleHamburger();
  window.setTimeout(function() { document.getElementById('search-input').focus(); }, 150);
}

function renderDailyTeamCards(team) {
  return team.map(function(member) {
    var color = (TYPE_HEX && TYPE_HEX[member.types[0]]) || '#888';
    var role = ROLE_LABELS[member.role] ? (ROLE_LABELS[member.role][currentLang] || ROLE_LABELS[member.role].pl) : member.role;
    var types = member.types.map(function(type) { return '<span class="type-badge type-'+type+'">'+typeName(type)+'</span>'; }).join('');
    return '<button class="daily-team-member" style="--type-glow:'+color+'" onclick="openDetail('+member.id+',\''+member.name+'\')"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+member.id+'.png" loading="lazy" alt="'+member.name+'"/><span class="daily-team-name">'+member.name+'</span><span class="daily-team-role">'+role+'</span><span class="daily-team-types">'+types+'</span></button>';
  }).join('');
}

function refreshDailyTeam() {
  var team = getDailyTeam(Date.now());
  var container = document.getElementById('daily-team-members');
  if (container) container.innerHTML = renderDailyTeamCards(team);
  window._dailyTeam = team;
}

function loadDailyTeam() {
  loadDailyTeamIntoAnalyzer(window._dailyTeam || getDailyTeam());
}

function renderDashboard() {
  var dailyTeam = getDailyTeam();
  window._dailyTeam = dailyTeam;
  var searchPlaceholder = currentLang === 'en' ? 'Search the Pokedex by name or number...' : 'Szukaj w Pokedexie po nazwie lub numerze...';
  var description = currentLang === 'en' ? 'Build stronger teams, inspect every Pokemon and prepare for the next server battle.' : 'Buduj mocniejsze zespoly, sprawdzaj kazdego Pokemona i przygotuj sie na kolejna serwerowa walke.';
  return '<section class="dashboard-hero"><div class="dashboard-kicker">COBBLEMON DATABASE</div><h1>Cobblemon Mastery</h1><p>'+description+'</p><div class="dashboard-search"><input class="mc-input" type="search" placeholder="'+searchPlaceholder+'" onfocus="openPokedex()" oninput="document.getElementById(\'search-input\').value=this.value;searchQuery=this.value;applyFilters()"/><button class="mc-btn dashboard-search-btn" onclick="openPokedex()" aria-label="Pokedex">&#128269;</button></div><button class="dashboard-pokedex-link" onclick="openPokedex()">'+(currentLang==='en'?'Open Pokedex':'Otworz Pokedex')+' <span>&rarr;</span></button></section>'
    +'<section class="daily-team-panel"><div><div class="dashboard-kicker">'+(currentLang==='en'?'DAILY SQUAD':'ZESPOL DNIA')+'</div><h2>'+(currentLang==='en'?'Ready for six roles':'Gotowy sklad szesciu rol')+'</h2><p>'+(currentLang==='en'?'A balanced starting point selected from the competitive pool.':'Zbalansowany punkt startowy wybrany z puli konkurencyjnej.')+'</p></div><div class="daily-team-actions"><button class="mc-btn" onclick="refreshDailyTeam()" title="'+(currentLang==='en'?'Draw another team':'Losuj ponownie')+'">&#10227;</button><button class="mc-btn daily-team-load" onclick="loadDailyTeam()">'+(currentLang==='en'?'Use in PvP analyzer':'Uzyj w analizatorze PvP')+'</button></div><div class="daily-team-members" id="daily-team-members">'+renderDailyTeamCards(dailyTeam)+'</div></section>'
    +renderFavoritesSection();
}

function showPage(page) {
  currentPage = page;
  document.body.classList.toggle('dashboard-page', page === 'welcome');
  var main = document.getElementById('main-area');
  if (!main) return;

  try {
  if (page === 'welcome') {
    main.innerHTML = renderDashboard()
      + '<div class="welcome-grid">'
      + '<div class="welcome-card accent-green"><h3>&#9876; '+t('welcome.what')+'</h3><p>'+t('welcome.whatDesc')+'</p></div>'
      + '<div class="welcome-card accent-teal"><h3>&#9876; '+t('nav.team')+'</h3><p>'+(currentLang==='en'?'Analyze your PvP team composition and type coverage.':'Analizuj sklad druzyny PvP i pokrycie typow.')+'</p><p><button class="mc-btn" onclick="showPage(\'team-analyzer\')">&rarr; '+t('nav.team')+'</button></p></div>'
      + '<div class="welcome-card accent-blue"><h3>&#9878; '+t('nav.typechart')+'</h3><p>'+(currentLang==='en'?'Check weaknesses, resistances and immunities with dual-type support.':'Sprawdz slabosci, odpornosci i immunitety z obsluga dwoch typow.')+'</p><p><button class="mc-btn" onclick="showPage(\'type-chart\')">&rarr; '+t('nav.typechart')+'</button></p></div>'
      + '<div class="welcome-card accent-apricorn"><h3>&#127822; '+t('nav.apricorns')+'</h3><p>'+(currentLang==='en'?'Craft unique Pokeballs from Apricorns.':'Craftuj unikalne Pokeballe z Apricornow.')+'</p><p><button class="mc-btn" onclick="showPage(\'apricorns\')">&rarr; '+t('nav.apricorns')+'</button></p></div>'
      + '<div class="welcome-card accent-gold"><h3>&#128230; '+t('nav.items')+'</h3><p>'+(currentLang==='en'?'All key items in one place.':'Wszystkie wazne przedmioty w jednym miejscu.')+'</p><p><button class="mc-btn" onclick="showPage(\'items\')">&rarr; '+t('nav.items')+'</button></p></div>'
      + '<div class="welcome-card accent-purple"><h3>&#10024; '+t('sec.megaz')+'</h3><p>'+(currentLang==='en'?'Mega Evolutions, Z-Moves and build tools.':'Mega Ewolucje, Ruchy Z i narzedzia do buildow.')+'</p><p><button class="mc-btn" onclick="showPage(\'mega-z\')">&rarr; '+t('sec.megaz')+'</button></p></div>'
      + '</div>';
    return;
  }
  if (page === 'welcome') {
    main.innerHTML =
      '<div class="page-title"><span>\ud83c\udfe0 Cobblemon Mastery Guide</span></div>'
      + renderFavoritesSection()
      + '<div class="welcome-grid">'
      + '<div class="welcome-card accent-green"><h3>\u2694 '+t('welcome.what')+'</h3><p>'+t('welcome.whatDesc')+'</p></div>'
      + '<div class="welcome-card accent-green"><h3>\ud83d\udd0d '+t('welcome.howUse')+'</h3><ul><li>'+(currentLang==='en'?'Search for a Pok\u00e9mon in the sidebar':'Wyszukaj Pok\u00e9mona w pasku po lewej')+'</li><li>'+(currentLang==='en'?'Filter by generation (I\u2013IX)':'Filtruj wed\u0142ug generacji (I\u2013IX)')+'</li><li>\u2665 = '+(currentLang==='en'?'friendship evolution':'ewolucja przez przyja\u017a\u0144')+'</li><li>\u21c4 = '+(currentLang==='en'?'trade evolution':'ewolucja przez wymian\u0119')+'</li><li>\u2b50 = '+(currentLang==='en'?'add to favorites':'dodaj do ulubionych')+'</li></ul></div>'
      + '<div class="welcome-card accent-cyan"><h3>\ud83d\udd17 '+t('welcome.link')+'</h3><p>'+(currentLang==='en'?'Replaces the Pok\u00e9mon trade from the original games. Activate in hand near another player.':'Zast\u0119puje wymian\u0119 Pok\u00e9mon\u00f3w z oryginalnych gier. Aktywuj w r\u0119ce, b\u0119d\u0105c blisko innego gracza.')+'</p></div>'
      + '<div class="welcome-card accent-apricorn"><h3>\ud83c\udf4e '+t('nav.apricorns')+'</h3><p>'+(currentLang==='en'?'Collect Apricorns from trees and craft unique Pok\u00e9balls!':'Zbieraj Apricorny z drzew i craftuj unikalne Pokeballsy!')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'apricorns\')" style="background:rgba(40,100,40,0.75);border-color:rgba(80,220,80,0.3)">\u2192 '+t('nav.apricorns')+'</button></p></div>'
      + '<div class="welcome-card accent-gold"><h3>\ud83d\udce6 '+t('nav.items')+'</h3><p>'+(currentLang==='en'?'All key items in one place.':'Wszystkie wa\u017cne przedmioty w jednym miejscu.')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'items\')" style="background:rgba(100,80,30,0.75);border-color:rgba(220,180,60,0.3)">\u2192 '+t('nav.items')+'</button></p></div>'
      + '<div class="welcome-card accent-teal"><h3>\u2694 '+t('nav.team')+'</h3><p>'+(currentLang==='en'?'Analyze your PvP team composition and type coverage.':'Analizuj sk\u0142ad dru\u017cyny PvP i pokrycie typ\u00f3w.')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'team-analyzer\')" style="background:rgba(40,100,110,0.75);border-color:rgba(80,200,220,0.3)">\u2192 '+t('nav.team')+'</button></p></div>'
      + '<div class="welcome-card accent-blue"><h3>\u2696 '+t('nav.typechart')+'</h3><p>'+(currentLang==='en'?'Check your Pok\u00e9mon\'s weaknesses, resistances and immunities with dual-type support.':'Sprawd\u017a s\u0142abo\u015bci, odporno\u015bci i immunitety swojego Pok\u00e9mona z obs\u0142ug\u0105 podw\u00f3jnych typ\u00f3w.')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'type-chart\')" style="background:rgba(40,50,110,0.75);border-color:rgba(100,120,255,0.3)">\u2192 '+t('nav.typechart')+'</button></p></div>'
      + '<div class="welcome-card accent-purple"><h3>\ud83c\udfc6 '+t('nav.ranking')+'</h3><p>'+(currentLang==='en'?'Explore the Top 6 Pok\u00e9mon of each type with counter-strategies and build recommendations.':'Przegl\u0105daj Top 6 Pok\u00e9mon\u00f3w ka\u017cdego typu z kontrstrategiami i rekomendacjami build\u00f3w.')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'ranking\')" style="background:rgba(70,40,120,0.75);border-color:rgba(160,100,255,0.3)">\u2192 '+t('nav.ranking')+'</button></p></div>'
      + '<div class="welcome-card accent-red"><h3>\u2694 '+t('nav.battle')+'</h3><p>'+t('battle.welcomeDesc')+'</p><p style="margin-top:6px"><a class="mc-btn" href="arena.html" style="background:rgba(140,40,40,0.75);border-color:rgba(255,80,80,0.3);text-decoration:none">\u2192 '+t('nav.battle')+'</a></p></div>'
      + '<div class="welcome-card" style="border-color:rgba(180,140,255,0.35);box-shadow:0 0 10px rgba(160,100,255,0.12)"><h3 style="color:#c0a0ff">\u2728 '+t('sec.megaz')+'</h3><p>'+(currentLang==='en'?'All Pok\u00e9mon with Mega Evolutions and exclusive Z-Moves \u2014 click to open builds & IV calculator.':'Wszystkie Pok\u00e9mony z Mega Ewolucjami i ekskluzywne Ruchy Z \u2014 kliknij, by otworzy\u0107 buildy i kalkulator IV.')+'</p><p style="margin-top:6px"><button class="mc-btn" onclick="showPage(\'mega-z\')" style="background:rgba(70,40,120,0.75);border-color:rgba(180,140,255,0.3)">\u2192 '+t('sec.megaz')+'</button></p></div>'
      + '</div>';
  }

  if (page === 'detail-loading') {
    main.innerHTML = '<div class="empty-state"><div class="loading-spinner" style="margin:0 auto 16px"></div>'+(currentLang==='en'?'Loading Pok\u00e9mon data...':'\u0141adowanie danych Pok\u00e9mona...')+'</div>';
  }

  if (page === 'items') {
    var itemsHtml = safeRenderPageSection(renderItems, currentLang === 'en' ? 'Items list could not load.' : 'Lista przedmiotów nie mogła się załadować.');
    main.innerHTML =
      '<div class="page-title"><span>📦 '+t('sec.items')+'</span></div>'
      + '<div class="items-grid">' + itemsHtml + '</div>';
  }

  if (page === 'apricorns') {
    var apricornsHtml = safeRenderPageSection(renderApricorns, currentLang === 'en' ? 'Apricorn data could not load.' : 'Dane o apricornach nie mogły się załadować.');
    main.innerHTML =
      '<div class="page-title"><span>🌾 '+t('sec.apricorns')+'</span></div>'
      + '<div class="mc-panel" style="margin-bottom:16px"><h2>ℹ️ '+t('apricorn.how')+'</h2><p style="font-size:18px;color:#aaa;line-height:1.6">'+t('apricorn.howDesc')+'</p></div>'
      + '<div class="apricorn-grid">' + apricornsHtml + '</div>';
  }

  if (page === 'team-analyzer') {
    loadTeam();
    main.innerHTML =
      '<div class="page-title"><span>\u2694 '+t('sec.team')+'</span></div>'
      + '<div class="team-section"><h2>\ud83d\udee1 '+t('sec.team')+'</h2>'
      + '<div id="team-analyzer-content"></div></div>';
    renderTeamPage();
  }

  if (page === 'type-chart') {
    wcType1 = ''; wcType2 = '';
    main.innerHTML =
      '<div class="page-title"><span>'+t('sec.typechart')+'</span></div>'
      + renderWeaknessChecker();
    wcUpdateDisplay();
  }

  if (page === 'battle-sim') {
    window.location.href = 'arena.html';
    return;
  }

  if (page === 'ranking') {
    main.innerHTML = renderRankingPage();
  }

  if (page === 'mega-z') {
    main.innerHTML = renderMegaZPage();
  }
  } catch(e) {
    console.error('showPage error ['+page+']:', e);
    main.innerHTML = '<div class="empty-state"><span class="big-icon">\u26a0</span>'
      + (currentLang==='en' ? 'Page failed to render. Try again.' : 'Błąd renderowania strony. Spróbuj ponownie.')
      + '<br><button class="mc-btn" style="margin-top:12px" onclick="showPage(\''+page+'\')">\ud83d\udd04 '
      + (currentLang==='en' ? 'Retry' : 'Ponów') + '</button></div>';
  }
}

/* ── MEGA / Z-MOVE PAGE RENDERER ── */
function escAttr(value) {
  // JSON.stringify uses double quotes, which must not collide with the double-quoted HTML attribute they're embedded in
  return JSON.stringify(value).replace(/"/g, '&quot;');
}

function renderMegaZPage() {
  var megaData = Array.isArray(MEGA_EVO_DATA) ? MEGA_EVO_DATA : [];
  var zData    = Array.isArray(Z_MOVE_DATA) ? Z_MOVE_DATA : [];
  var formsData = Array.isArray(REGIONAL_FORMS_DATA) ? REGIONAL_FORMS_DATA : [];
  var tab = window._megaZTab || 'mega';
  var html = '<div class="page-title"><span>\u2728 ' + (currentLang==='en' ? 'Mega Evolutions & Z-Moves' : 'Mega Ewolucje i Ruchy Z') + '</span></div>';

  html += '<div class="megaz-tab-row">';
  html += '<button class="megaz-tab-btn' + (tab==='mega' ? ' active' : '') + '" onclick="window._megaZTab=\'mega\';showPage(\'mega-z\')">';
  html += '\u2b21 ' + (currentLang==='en' ? 'Mega Evolutions' : 'Mega Ewolucje') + ' <span class="megaz-tab-count">' + megaData.length + '</span></button>';
  html += '<button class="megaz-tab-btn' + (tab==='zmove' ? ' active' : '') + '" onclick="window._megaZTab=\'zmove\';showPage(\'mega-z\')">';
  html += '\u26a1 ' + (currentLang==='en' ? 'Z-Moves' : 'Ruchy Z') + ' <span class="megaz-tab-count">' + zData.length + '</span></button>';
  html += '<button class="megaz-tab-btn' + (tab==='forms' ? ' active' : '') + '" onclick="window._megaZTab=\'forms\';showPage(\'mega-z\')">';
  html += '\uD83C\uDF0D ' + (currentLang==='en' ? 'Regional Forms' : 'Regionalne Formy') + ' <span class="megaz-tab-count">' + formsData.length + '</span></button>';
  html += '</div>';

  if (tab === 'mega') {
    html += '<div class="megaz-intro">';
    html += currentLang==='en'
      ? '<strong>Mega Evolutions</strong> &mdash; temporary power-ups activated by a Mega Stone during battle (Gen VI). Click any card to open full Build, IV Calculator and Competitive recommendations.'
      : '<strong>Mega Ewolucje</strong> &mdash; tymczasowe wzmocnienia aktywowane przez Mega Kamie\u0144 podczas walki (Gen VI). Kliknij kart\u0119, by otworzy\u0107 Build, Kalkulator IV i rekomendacje Competitive.';
    html += '</div>';

    var ashM = megaData.find(function(m){ return m.special; });
    if (ashM) {
      var note = typeof ashM.specialNote==='object' ? (ashM.specialNote[currentLang]||ashM.specialNote.pl) : '';
      var ashId = Number(ashM.fid || ashM.id || 658);
      var ashName = ashM.megaName || ashM.name || 'Ash-Greninja';
      var ashArt = ashM.fid
        ? 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + ashM.fid + '.png'
        : 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png';
      html += '<div class="megaz-ash-card" onclick="openDetail(' + escAttr(String(ashId)) + ',' + escAttr(ashName) + ')">';
      html += '<div class="megaz-ash-left"><img src="'+ashArt+'" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png\'" loading="lazy" alt="Ash-Greninja"/></div>';
      html += '<div class="megaz-ash-body">';
      html += '<div class="megaz-ash-banner">\u2728 SPECJALNA FORMA &mdash; Battle Bond</div>';
      html += '<div class="megaz-ash-name">Ash-Greninja</div>';
      html += '<div class="megaz-ash-types">'+ashM.types.map(function(tp){ return '<span class="type-badge type-'+tp+'">'+typeName(tp)+'</span>'; }).join('')+'</div>';
      html += '<div class="megaz-ash-desc">'+note+'</div>';
      html += '</div>';
      html += '<div class="megaz-ash-right">';
      html += '<div class="megaz-ash-bst">BST <strong>'+ashM.bst+'</strong></div>';
      html += '<div class="megaz-ash-ability">Battle Bond</div>';
      html += '<div class="megaz-ash-cta">\ud83d\udccb '+(currentLang==='en'?'Full Build & Calculator':'Pe\u0142ny Build i Kalkulator')+'</div>';
      html += '</div></div>';
    }

    var ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';
    html += '<div class="megaz-grid">';
    megaData.filter(function(m){ return !m.special; }).forEach(function(m) {
      var mainId = Number(m.fid || m.id || 1);
      var mainName = m.megaName || m.name || 'Pokémon';
      var altId = Number((m.formB && (m.formB.fid || m.formB.id)) || mainId);
      var altName = m.formB ? (m.formB.megaName || m.formB.name || mainName) : mainName;
      var artUrl  = ART + mainId + '.png';
      var artUrlB = ART + altId + '.png';
      var fallUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + String(m.id || mainId) + '.png';
      var fallUrlB = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + String((m.formB && m.formB.id) || altId) + '.png';
      var color   = TYPE_HEX[m.types[0]] || '#888';
      var typeBadges = m.types.map(function(tp){ return '<span class="type-badge type-'+tp+'">'+typeName(tp)+'</span>'; }).join('');
      html += '<div class="megaz-card" data-main-id="'+String(mainId)+'" data-alt-id="'+String(altId)+'" data-main-name="'+mainName+'" data-alt-name="'+altName+'" data-form="main" style="border-color:'+color+'55;box-shadow:0 0 10px '+color+'22" onclick="var card=this; var form=card.getAttribute(\'data-form\')||\'main\'; var id=form===\'alt\' ? Number(card.getAttribute(\'data-alt-id\')) : Number(card.getAttribute(\'data-main-id\')); var name=form===\'alt\' ? card.getAttribute(\'data-alt-name\') : card.getAttribute(\'data-main-name\'); openDetail(id, name);">';
      html += '<div class="megaz-card-img"><img src="'+artUrl+'" onerror="this.src=\''+fallUrl+'\'" loading="lazy" alt="'+mainName+'"/></div>';
      html += '<div class="megaz-card-body">';
      html += '<div class="megaz-card-name" style="color:'+color+'">'+mainName+'</div>';
      if (m.formB) {
        html += '<div class="megaz-card-forms">'
          + '<span class="megaz-form-tag" style="cursor:pointer" onclick="event.stopPropagation();var card=this.closest(\'.megaz-card\');card.setAttribute(\'data-form\',\'main\');var img=card.querySelector(\'img\');var nameEl=card.querySelector(\'.megaz-card-name\');img.src=\''+artUrl+'\';img.onerror=function(){this.src=\''+fallUrl+'\'};nameEl.textContent=card.getAttribute(\'data-main-name\');">X</span>'
          + '<span class="megaz-form-tag" style="cursor:pointer;margin-left:4px" onclick="event.stopPropagation();var card=this.closest(\'.megaz-card\');card.setAttribute(\'data-form\',\'alt\');var img=card.querySelector(\'img\');var nameEl=card.querySelector(\'.megaz-card-name\');img.src=\''+artUrlB+'\';img.onerror=function(){this.src=\''+fallUrlB+'\'};nameEl.textContent=card.getAttribute(\'data-alt-name\');">Y</span>'
          + '</div>';
      }
      html += '<div class="megaz-card-types">'+typeBadges+'</div>';
      html += '<div class="megaz-card-row"><span class="megaz-label">'+(currentLang==='en'?'Ability':'Zdolno\u015b\u0107')+'</span><span class="megaz-val">'+m.ability+'</span></div>';
      html += '<div class="megaz-card-row"><span class="megaz-label">'+(currentLang==='en'?'Stone':'Kamie\u0144')+'</span><span class="megaz-stone">'+m.stone+'</span></div>';
      html += '<div class="megaz-card-row"><span class="megaz-label">BST</span><span class="megaz-bst" style="color:'+color+'">'+m.bst+'</span></div>';
      html += '</div>';
      html += '<div class="megaz-card-footer">\ud83d\udccb '+(currentLang==='en'?'Build & Calculator':'Build i Kalkulator')+'</div>';
      html += '</div>';
    });
    html += '</div>';
  } else if (tab === 'zmove') {
    html += '<div class="megaz-intro">';
    html += currentLang==='en'
      ? '<strong>Exclusive Z-Moves</strong> &mdash; signature Z-Moves for specific Pok&eacute;mon requiring a matching Z-Crystal and base move (Gen VII). Click any card to view full Build and Competitive data.'
      : '<strong>Ekskluzywne Ruchy Z</strong> &mdash; unikalne Ruchy Z dla konkretnych Pok\u00e9mon\u00f3w, wymagaj\u0105ce odpowiedniego Z-Kryszta\u0142u i bazowego ataku (Gen VII). Kliknij kart\u0119, by zobaczy\u0107 Build i dane Competitive.';
    html += '</div>';
    html += '<div class="megaz-grid">';
    zData.forEach(function(z) {
      var artUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + z.id + '.png';
      var fallUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + z.id + '.png';
      var color = TYPE_HEX[z.type] || '#888';
      var desc = typeof z.desc === 'object' ? (z.desc[currentLang] || z.desc.pl) : z.desc;
      var zId = Number(z.id || 1);
      var zName = z.name || 'pokemon';
      html += '<div class="megaz-card zmove-card" style="border-color:'+color+'55;box-shadow:0 0 10px '+color+'22" onclick="openDetail(' + escAttr(String(zId)) + ',' + escAttr(zName) + ')">';
      html += '<div class="megaz-card-img"><img src="'+artUrl+'" onerror="this.src=\''+fallUrl+'\'" loading="lazy" alt="'+zName+'"/></div>';
      html += '<div class="megaz-card-body">';
      html += '<div class="megaz-card-name" style="color:'+color+'">'+z.zmove+'</div>';
      html += '<div class="megaz-card-pokemon">'+z.name.charAt(0).toUpperCase()+z.name.slice(1).replace(/-/g,' ')+'</div>';
      html += '<div class="megaz-card-types"><span class="type-badge type-'+z.type+'">'+typeName(z.type)+'</span></div>';
      html += '<div class="megaz-card-row"><span class="megaz-label">'+(currentLang==='en'?'Base Move':'Bazowy Ruch')+'</span><span class="megaz-val">'+z.baseMove+'</span></div>';
      if (z.power > 0) {
        html += '<div class="megaz-card-row"><span class="megaz-label">'+(currentLang==='en'?'Power':'Moc')+'</span><span class="megaz-bst" style="color:'+color+'">'+z.power+'</span></div>';
      } else {
        html += '<div class="megaz-card-row"><span class="megaz-label">'+(currentLang==='en'?'Power':'Moc')+'</span><span class="megaz-val">'+(currentLang==='en'?'Status':'Status')+'</span></div>';
      }
      html += '<div class="megaz-card-desc">'+desc+'</div>';
      html += '</div>';
      html += '<div class="megaz-card-footer">\ud83d\udccb '+(currentLang==='en'?'Build & Calculator':'Build i Kalkulator')+'</div>';
      html += '</div>';
    });
    html += '</div>';
  } else if (tab === 'forms') {
    html += '<div class="megaz-intro">';
    html += currentLang==='en'
      ? '<strong>Regional Forms</strong> &mdash; Alolan, Galarian, Hisuian and Paldean variants with different types and abilities. Click any card to open full Build, IV Calculator and Competitive data for that specific form.'
      : '<strong>Regionalne Formy</strong> &mdash; Warianty Alo\u0142a\u0144skie, Galari\u0144skie, Hisuia\u0144skie i Paldejskie z innymi typami i zdolno\u015bciami. Kliknij kart\u0119, by otworzy\u0107 Build, Kalkulator IV i dane Competitive tej formy.';
    html += '</div>';
    var regionColors = { Alola:'#f59e0b', Galar:'#8b5cf6', Hisui:'#10b981', Paldea:'#ef4444', Forma:'#00c8ff' };
    html += '<div class="megaz-grid">';
    formsData.forEach(function(f) {
      var spriteId = Number(f.baseId || f.id || 1);
      var spriteUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + spriteId + '.png';
      var color = TYPE_HEX[f.types[0]] || '#888';
      var regionColor = regionColors[f.region] || '#888';
      var typeBadges = f.types.map(function(tp){ return '<span class="type-badge type-'+tp+'">'+typeName(tp)+'</span>'; }).join('');
      var desc = typeof f.desc === 'object' ? (f.desc[currentLang] || f.desc.pl) : f.desc;
      var formName = f.formName || f.name || 'Pokémon';
      html += '<div class="megaz-card" style="border-color:'+color+'55;box-shadow:0 0 10px '+color+'22" onclick="openDetail(' + escAttr(String(spriteId)) + ',' + escAttr(formName) + ')">';
      html += '<div class="megaz-card-img" style="position:relative">';
      html += '<img src="'+spriteUrl+'" loading="lazy" alt="'+formName+'" style="width:72px;height:72px;image-rendering:pixelated"/>';
      html += '<span class="megaz-region-badge" style="background:'+regionColor+'22;border:1px solid '+regionColor+'88;color:'+regionColor+'">'+f.region+'</span>';
      html += '</div>';
      html += '<div class="megaz-card-body">';
      html += '<div class="megaz-card-name" style="color:'+color+'">'+formName+'</div>';
      html += '<div class="megaz-card-types">'+typeBadges+'</div>';
      html += '<div class="megaz-card-desc">'+desc+'</div>';
      html += '</div>';
      html += '<div class="megaz-card-footer">\ud83d\udccb '+(currentLang==='en'?'Build & Calculator':'Build i Kalkulator')+'</div>';
      html += '</div>';
    });
    html += '</div>';
  }
  return html;
}
