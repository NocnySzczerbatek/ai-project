/* ================================================================
   app.js — Inicjalizacja i punkt wejścia aplikacji
   ================================================================ */

/* ── Inicjalizacja aplikacji ── */
async function init() {
  // Wersjonowanie cache — czyszczenie starych danych przy zmianie wersji
  var COB_VERSION = '2.2';
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
    try { allPokemon = JSON.parse(cached); } catch(e) { allPokemon = []; }
    setStatus((currentLang==='en'?'Loaded ':'Za\u0142adowano ')+allPokemon.length+(currentLang==='en'?' Pok\u00e9mon from cache.':' Pok\u00e9mon\u00f3w z cache.'), false);
  } else {
    try {
      var res = await fetchWithTimeout('https://pokeapi.co/api/v2/pokemon?limit=10000', 12000);
      if (!res.ok) throw new Error('HTTP '+res.status);
      var data = await res.json();
      allPokemon = (data.results || []).map(function(p){
        var parts = p.url.split('/').filter(Boolean);
        var id = parseInt(parts[parts.length - 1]);
        return { id: id, name: p.name };
      }).filter(function(p){ return p.id <= 1025; });
      localStorage.setItem('cob_pokemon_list', JSON.stringify(allPokemon));
      setStatus((currentLang==='en'?'Loaded ':'Za\u0142adowano ')+allPokemon.length+(currentLang==='en'?' Pok\u00e9mon.':' Pok\u00e9mon\u00f3w.'), false);
    } catch (e) {
      // Fallback — generuj listę z samych ID (bez nazw z API)
      allPokemon = [];
      for (var i = 1; i <= 1025; i++) { allPokemon.push({ id: i, name: 'pokemon-'+i }); }
      setStatus((currentLang==='en'?'PokeAPI unavailable — basic list loaded.':'PokeAPI niedostępne — załadowano listę podstawową.'), false);
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
    var hid = window.location.hash.replace('#pokemon-','');
    if (hid) {
      openDetail(hid, hid);
    }
  }
}

/* ── Filtrowanie listy ── */
function getPokedexEntries() {
  var entries = Array.isArray(allPokemon) ? allPokemon.slice() : [];
  var knownIds = {};
  entries.forEach(function(pokemon) { knownIds[String(pokemon.fid || pokemon.id)] = true; });
  if (!Array.isArray(MEGA_EVO_DATA)) return entries;

  MEGA_EVO_DATA.forEach(function(form) {
    var formId = Number(form.fid || form.id);
    if (!formId || knownIds[String(formId)]) return;
    knownIds[String(formId)] = true;
    entries.push({
      id: formId,
      fid: formId,
      baseId: Number(form.id),
      name: String(form.megaName || form.name || '').toLowerCase(),
      megaName: form.megaName,
      types: form.types || [],
      isMega: true
    });
  });
  return entries;
}

function applyFilters() {
  var q = searchQuery.trim().toLowerCase();
  filteredList = getPokedexEntries().filter(function(p) {
    if (selectedGen > 0) {
      var range = GEN_RANGES[selectedGen];
      var generationId = Number(p.baseId || p.id);
      if (generationId < range[0] || generationId > range[1]) return false;
    }
    if (q) return p.name.toLowerCase().includes(q) || String(p.fid || p.id).includes(q) || String(p.baseId || '').includes(q);
    return true;
  });
  listOffset = 0;
  renderList();
}

function matchPokemonKey(p, targetId) {
  if (!p || !targetId) return false;
  var normalizedTarget = String(targetId).trim();
  if (!normalizedTarget) return false;

  return (
    p.fid == targetId ||
    p.id == targetId ||
    p.name == targetId ||
    p.slug == targetId ||
    p.megaName == targetId ||
    p.formName == targetId ||
    p.baseId == targetId
  );
}

function resolveExactPokemonTarget(targetId) {
  var key = String(targetId || '').trim();
  if (!key) return null;

  if (Array.isArray(allPokemon)) {
    for (var i = 0; i < allPokemon.length; i++) {
      var p = allPokemon[i];
      if (matchPokemonKey(p, key)) return p;
    }
  }

  if (Array.isArray(MEGA_EVO_DATA)) {
    for (var j = 0; j < MEGA_EVO_DATA.length; j++) {
      var form = MEGA_EVO_DATA[j];
      if (matchPokemonKey(form, key)) return form;
    }
  }

  return null;
}

function openDetail(targetId, fallbackName) {
  var exactMatch = resolveExactPokemonTarget(targetId);

  if (exactMatch) {
    var resolvedId = Number(exactMatch.fid || exactMatch.id || exactMatch.baseId || 1);
    var resolvedName = exactMatch.megaName || exactMatch.formName || exactMatch.name || fallbackName || 'pokemon';
    loadDetail(resolvedId, resolvedName);
    return;
  }

  loadDetail(Number(targetId) || 1, fallbackName || String(targetId || 'pokemon') || 'pokemon');
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
    var detailKey = Number(p.fid || p.id || 1);
    var spriteId = Number(p.fid || p.id || 1);
    var displayName = p.megaName || p.formName || p.name;
    var div = document.createElement('div');
    div.className = 'pokemon-entry' + (detailKey === selectedId ? ' selected' : '');
    div.dataset.id = String(detailKey);
    var hasFriendship = FRIENDSHIP_EVOS.has(p.name);
    var hasTrade = p.name in LINK_CABLE_EVOS;
    div.innerHTML = '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+spriteId+'.png" onerror="this.src=\'data:image/svg+xml,<svg xmlns=\\\'http://www.w3.org/2000/svg\\\'/ >\'" alt="'+p.name+'" />'
      + '<span class="entry-name">'+displayName+'</span>'
      + '<span class="entry-id">#'+String(detailKey).padStart(3,'0')+'</span>'
      + '<div class="entry-badges">'
      + (hasFriendship ? '<span class="badge-friendship" title="Ewolucja przez przyjaźń">♥</span>' : '')
      + (hasTrade ? '<span class="badge-trade" title="Ewolucja przez wymianę (Link Cable)">⥄</span>' : '')
      + '</div>';
    div.addEventListener('click', function(){ openDetail(String(detailKey), displayName); });
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
