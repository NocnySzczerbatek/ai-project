/* ================================================================
   pages.js — Routing stron i renderowanie podstron
   ================================================================ */

/* ── RANKING RENDERER ── */
function renderRankingPage() {
  var typeClr = TYPE_HEX[rankingSelectedType] || '#888';
  var html = '<div class="page-title"><span>'+t('sec.ranking')+'</span></div>';
  html += '<div style="text-align:center;font-size:18px;color:#ccc;margin-bottom:16px;font-weight:700">'+t('ranking.desc')+'</div>';
  html += '<div class="ranking-nav-btns">';
  ALL_TYPES.forEach(function(tp) {
    var cls = tp === rankingSelectedType ? 'ranking-nav-btn type-badge type-'+tp+' active-rank' : 'ranking-nav-btn type-badge type-'+tp;
    html += '<button class="'+cls+'" onclick="selectRankingType(\''+tp+'\')">' + typeName(tp) + '</button>';
  });
  html += '</div>';
  var pokes = TYPE_RANKING[rankingSelectedType] || [];
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

function showPage(page) {
  currentPage = page;
  var main = document.getElementById('main-area');

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
      + '</div>';
  }

  if (page === 'detail-loading') {
    main.innerHTML = '<div class="empty-state"><span class="big-icon">\u2699</span>'+(currentLang==='en'?'Loading Pok\u00e9mon data...':'\u0141adowanie danych Pok\u00e9mona...')+'</div>';
  }

  if (page === 'items') {
    main.innerHTML =
      '<div class="page-title"><span>\ud83d\udce6 '+t('sec.items')+'</span></div>'
      + '<div class="items-grid">' + renderItems() + '</div>';
  }

  if (page === 'apricorns') {
    main.innerHTML =
      '<div class="page-title"><span>\ud83c\udf4e '+t('sec.apricorns')+'</span></div>'
      + '<div class="mc-panel" style="margin-bottom:16px"><h2>\u2139\ufe0f '+t('apricorn.how')+'</h2><p style="font-size:18px;color:#aaa;line-height:1.6">'+t('apricorn.howDesc')+'</p></div>'
      + '<div class="apricorn-grid">' + renderApricorns() + '</div>';
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
}
