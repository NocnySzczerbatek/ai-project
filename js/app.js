/* ================================================================
   app.js — Inicjalizacja i punkt wejścia aplikacji
   ================================================================ */

/* ── Inicjalizacja aplikacji ── */
async function init() {
  // Wersjonowanie cache — czyszczenie starych danych przy zmianie wersji
  var COB_VERSION = '2.1';
  try {
    var storedVer = localStorage.getItem('cob_version');
    if (storedVer !== COB_VERSION) {
      localStorage.removeItem('cob_pokemon_list');
      localStorage.setItem('cob_version', COB_VERSION);
    }
  } catch(e) {}

  // Załaduj zapisany język
  currentLang = localStorage.getItem('cob_lang') || 'pl';
  document.querySelectorAll('.lang-btn').forEach(function(b){b.classList.toggle('active',b.dataset.lang===currentLang);});
  // Załaduj zapisany zespół
  loadTeam();

  setStatus((currentLang==='en'?'Fetching Pok\u00e9mon list from PokeAPI...':'Pobieranie listy Pok\u00e9mon\u00f3w z PokeAPI...'), true);
  var cached = localStorage.getItem('cob_pokemon_list');
  if (cached) {
    allPokemon = JSON.parse(cached);
    setStatus((currentLang==='en'?'Loaded ':'Za\u0142adowano ')+allPokemon.length+(currentLang==='en'?' Pok\u00e9mon from cache.':' Pok\u00e9mon\u00f3w z cache.'), false);
  } else {
    try {
      var res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
      var data = await res.json();
      allPokemon = data.results.map(function(p){
        var parts = p.url.split('/').filter(Boolean);
        var id = parseInt(parts[parts.length - 1]);
        return { id: id, name: p.name };
      }).filter(function(p){ return p.id <= 1025; });
      localStorage.setItem('cob_pokemon_list', JSON.stringify(allPokemon));
      setStatus((currentLang==='en'?'Loaded ':'Za\u0142adowano ')+allPokemon.length+(currentLang==='en'?' Pok\u00e9mon.':' Pok\u00e9mon\u00f3w.'), false);
    } catch (e) {
      setStatus((currentLang==='en'?'Connection error with PokeAPI!':'B\u0142\u0105d po\u0142\u0105czenia z PokeAPI!'), false);
    }
  }
  // Zastosuj zapisany język do elementów nagłówka
  if(currentLang==='en')setLang('en');
  applyFilters();
  showPage('welcome');
  // Wyczyść timer ładowania — strona załadowana pomyślnie
  if (window._cobClearLoadTimer) window._cobClearLoadTimer();
  // Sprawdź hash dla deep linku
  if (window.location.hash.startsWith('#pokemon-')) {
    var hid = parseInt(window.location.hash.replace('#pokemon-',''));
    if (hid) { var found = allPokemon.find(function(p){return p.id===hid;}); if(found) loadDetail(found.id, found.name); }
  }
}

/* ── Filtrowanie listy ── */
function applyFilters() {
  var q = searchQuery.trim().toLowerCase();
  filteredList = allPokemon.filter(function(p) {
    if (selectedGen > 0) {
      var range = GEN_RANGES[selectedGen];
      if (p.id < range[0] || p.id > range[1]) return false;
    }
    if (q) return p.name.includes(q) || String(p.id).includes(q);
    return true;
  });
  listOffset = 0;
  renderList();
}

/* ── Renderowanie listy Pokémonów z lazy loading ── */
function renderList() {
  var container = document.getElementById('pokemon-list');
  document.getElementById('pokemon-count').textContent = filteredList.length + ' ' + t('gen.pokemon');
  if (!filteredList.length) {
    container.innerHTML = '<div class="empty-state"><span class="big-icon">\ud83d\udd0d</span>'+t('gen.noResults')+'</div>';
    return;
  }
  var chunk = filteredList.slice(0, listOffset + PAGE_SIZE);
  container.innerHTML = '';
  chunk.forEach(function(p) {
    var div = document.createElement('div');
    div.className = 'pokemon-entry' + (p.id === selectedId ? ' selected' : '');
    div.dataset.id = p.id;
    var hasFriendship = FRIENDSHIP_EVOS.has(p.name);
    var hasTrade = p.name in LINK_CABLE_EVOS;
    div.innerHTML = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+p.id+'.png" onerror="this.src=\'data:image/svg+xml,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\'/>\'" />'
      + '<span class="entry-name">'+p.name+'</span>'
      + '<span class="entry-id">#'+String(p.id).padStart(3,'0')+'</span>'
      + '<div class="entry-badges">'
      + (hasFriendship ? '<span class="badge-friendship" title="Ewolucja przez przyja\u017a\u0144">\u2665</span>' : '')
      + (hasTrade ? '<span class="badge-trade" title="Ewolucja przez wymian\u0119 (Link Cable)">\u21c4</span>' : '')
      + '</div>';
    div.addEventListener('click', function(){ loadDetail(p.id, p.name); });
    container.appendChild(div);
  });
  if (chunk.length < filteredList.length) {
    var sentinel = document.createElement('div');
    sentinel.style.cssText = 'height:4px';
    sentinel.id = 'list-sentinel';
    container.appendChild(sentinel);
    var obs = new IntersectionObserver(function(entries){
      if (entries[0].isIntersecting) { obs.disconnect(); listOffset += PAGE_SIZE; renderList(); }
    });
    obs.observe(sentinel);
  }
}

/* ================================================================
   Nasłuchiwanie zdarzeń
   ================================================================ */
document.getElementById('search-input').addEventListener('input', function(e) {
  searchQuery = e.target.value; applyFilters();
});
document.getElementById('gen-filters').addEventListener('click', function(e) {
  var btn = e.target.closest('.gen-filter-btn');
  if (!btn) return;
  document.querySelectorAll('.gen-filter-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  selectedGen = parseInt(btn.dataset.gen);
  applyFilters();
});

/* ── Start aplikacji ── */
init();
