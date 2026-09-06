/* Cobblemon Catch Zone — Auth (Anonymous) + Profile + Samouczek FTUE (Focus Overlay, 4 kroki)
   Cala logika zaufania (Zero-Trust) zyje w Postgres RPC (supabase/schema.sql):
   rpc_set_trainer_name, rpc_complete_tutorial. Ten plik tylko wysyla intencje
   i renderuje to, co zwroci serwer — nigdy nie liczy nagrod lokalnie. */

/* ================================================================
   KONFIGURACJA SUPABASE
   ================================================================ */
// ⚠ UZUPEŁNIJ danymi swojego projektu (Project Settings → API).
// "anonKey" to publiczny klucz "anon" / "publishable" — bezpieczny w kliencie,
// bo wszystkie zapisy i tak przechodzą przez RLS + funkcje SECURITY DEFINER.
const SUPABASE_CONFIG = { url: 'https://haourlvzdbbzzufyzxyk.supabase.co', anonKey: 'sb_publishable_ZvQrxytjGj6_s0oMoMxTTQ_KAiF1bss' };
const SUPABASE_CONFIGURED = !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey);
let sbClient = null;
if (SUPABASE_CONFIGURED && window.supabase) {
  sbClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
}

/* ================================================================
   DANE STARTERÓW + SPRITE'Y (Showdown animowany -> artwork -> staty PokeAPI)
   ================================================================ */
const STARTERS = [
  { id: 1, name: 'bulbasaur', types: ['grass', 'poison'] },
  { id: 4, name: 'charmander', types: ['fire'] },
  { id: 7, name: 'squirtle', types: ['water'] }
];
function showdownSlug(name) { return String(name || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }
function spriteUrls(id, name) {
  return {
    animated: 'https://play.pokemonshowdown.com/sprites/ani/' + showdownSlug(name) + '.gif',
    artwork: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/' + id + '.png',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png'
  };
}
function imgFallback(img) {
  const chain = (img.dataset.fallback || '').split('|').filter(Boolean);
  if (!chain.length) { img.onerror = null; return; }
  img.src = chain.shift();
  img.dataset.fallback = chain.join('|');
}
function escapeHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, '&quot;'); }
function friendlyError(e) {
  return (e && (e.message || e.error_description || e.error)) || 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';
}

/* ================================================================
   STAN KLIENTA (wyłącznie UI — żadnych nagród/sald liczonych lokalnie)
   ================================================================ */
const czState = {
  step: 1,
  selectedStarter: null,
  nameValue: '',
  nameError: null,
  practiceCaught: false,
  profile: null,
  initError: null,
  busy: false,
  error: null,
  result: null,
  // Moduly 2-7
  screen: 'menu',
  selectedBiome: 'plains',
  lastExploreResult: null,
  inventory: null,
  fullInventory: null,
  currentEncounter: null,
  catchOutcome: null,
  currentBattle: null,
  pvpResult: null,
  gyms: null,
  earnedGymIds: null,
  badges: null,
  ranking: null,
  gtsListings: null,
  myPokemon: null,
  myPokemonForGts: null,
  cardParty: null,
  cardBadges: null,
  shopMessage: null
};

/* ================================================================
   BOOTSTRAP: Anonymous Sign-In + odczyt/utworzenie profilu
   ================================================================ */
async function initCatchZone() {
  render();
  if (!SUPABASE_CONFIGURED || !sbClient) return;
  try {
    const { data: sessionData } = await sbClient.auth.getSession();
    let session = sessionData && sessionData.session;
    if (!session) {
      const { data, error } = await sbClient.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }
    const userId = session.user.id;
    let profile = null;
    // trigger fn_handle_new_user tworzy profil synchronicznie, ale dajemy
    // kilka prob na wypadek opoznienia po stronie klienta
    for (let i = 0; i < 5 && !profile; i++) {
      const { data, error } = await sbClient.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      profile = data;
      if (!profile) await new Promise(r => setTimeout(r, 400));
    }
    if (!profile) throw new Error('Nie udało się utworzyć profilu gracza.');
    czState.profile = profile;
    if (profile.tutorial_completed) await refreshInventory();
  } catch (e) {
    czState.initError = friendlyError(e);
  }
  render();
}

/* ================================================================
   RENDER (dispatcher)
   ================================================================ */
function render() {
  const app = document.getElementById('cz-app');
  if (!app) return;
  if (!SUPABASE_CONFIGURED) { app.innerHTML = renderSetupBanner(); return; }
  if (czState.initError) {
    app.innerHTML = `<div class="cz-setup-banner" style="color:var(--red);border-color:rgba(255,77,106,.35);background:rgba(255,77,106,.08)">⚠ Błąd połączenia z Supabase: ${escapeHtml(czState.initError)}</div>`;
    return;
  }
  if (!czState.profile) { app.innerHTML = '<div class="cz-loading">⏳ Ładowanie profilu Trenera...</div>'; return; }
  if (!czState.profile.tutorial_completed) {
    app.innerHTML = renderSkipButton() + renderTutorialOverlay();
    return;
  }
  app.innerHTML = renderScreen();
  if (czState.screen === 'card') drawTrainerCard();
}

function renderScreen() {
  switch (czState.screen) {
    case 'explore': return renderExplore();
    case 'catch': return renderCatch();
    case 'battle': return renderBattle();
    case 'pvp_result': return renderPvpResult();
    case 'gyms': return renderGyms();
    case 'badges': return renderBadges();
    case 'card': return renderCard();
    case 'gts': return renderGts();
    case 'shop': return renderShop();
    case 'team': return renderTeam();
    case 'inventory': return renderInventory();
    case 'ranking': return renderRanking();
    default: return renderMainMenu();
  }
}

function renderSetupBanner() {
  return `<div class="cz-setup-banner">
    ⚠ Catch Zone wymaga konfiguracji Supabase.<br/>
    Uzupełnij <code>SUPABASE_CONFIG.url</code> i <code>SUPABASE_CONFIG.anonKey</code> w <code>js/catchzone.js</code>,
    uruchom <code>supabase/schema.sql</code> w swoim projekcie i włącz Anonymous Sign-In
    (Authentication → Providers) w Supabase Dashboard.
  </div>`;
}

/* ================================================================
   FOCUS OVERLAY — SAMOUCZEK (4 KROKI) + PRZYCISK POMIŃ
   ================================================================ */
function renderSkipButton() {
  return `<button class="cz-skip-btn" ${czState.busy ? 'disabled' : ''} onclick="skipTutorial()">⏭ POMIŃ SAMOUCZEK</button>`;
}

function renderTutorialOverlay() {
  const dots = [1, 2, 3, 4].map(n => {
    const cls = n === czState.step ? 'active' : (n < czState.step ? 'done' : '');
    return `<div class="cz-step-dot ${cls}"></div>`;
  }).join('');
  let body;
  if (czState.step === 1) body = renderStep1();
  else if (czState.step === 2) body = renderStep2();
  else if (czState.step === 3) body = renderStep3();
  else body = renderStep4();
  return `<div class="cz-overlay"><div class="cz-overlay-card"><div class="cz-step-indicator">${dots}</div>${body}</div></div>`;
}

/* ---- Krok 1: Profesor + imię + starter ---- */
function renderStep1() {
  const cards = STARTERS.map(s => {
    const sel = czState.selectedStarter === s.id ? 'selected' : '';
    const urls = spriteUrls(s.id, s.name);
    const types = s.types.map(t => `<span class="cz-type-chip cz-type-${t}">${t}</span>`).join('');
    return `<div class="cz-starter-card ${sel}" onclick="selectStarter(${s.id})">
      <img src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)" alt="${s.name}"/>
      <div class="cz-starter-name">${s.name}</div>
      <div class="cz-starter-types">${types}</div>
    </div>`;
  }).join('');
  const canNext = czState.selectedStarter && czState.nameValue.trim().length >= 3 && !czState.busy;
  return `
    <div class="cz-professor">
      <div class="cz-professor-avatar">🧑‍🔬</div>
      <div class="cz-speech-bubble">Witaj, młody Trenerze! Jestem Profesor Cobble. Zanim wyruszysz w podróż po świecie Cobblemon, muszę poznać Twoje imię oraz Twojego pierwszego partnera.</div>
    </div>
    <div class="cz-name-row">
      <label for="cz-name-input">Imię Trenera (3–20 znaków)</label>
      <input id="cz-name-input" class="cz-input ${czState.nameError ? 'error' : ''}" type="text" maxlength="20"
        value="${escapeAttr(czState.nameValue)}" oninput="onNameInput(this.value)" placeholder="np. Ash" />
      <div class="cz-field-error">${czState.nameError ? escapeHtml(czState.nameError) : ''}</div>
    </div>
    <div class="cz-starter-grid">${cards}</div>
    <div class="cz-step-actions">
      <button class="cz-btn cz-btn-primary" ${canNext ? '' : 'disabled'} onclick="confirmStep1()">${czState.busy ? 'Zapisywanie...' : 'Dalej ▶'}</button>
    </div>`;
}
function selectStarter(id) { czState.selectedStarter = id; render(); }
function onNameInput(v) {
  czState.nameValue = v;
  czState.nameError = (v.trim().length > 0 && v.trim().length < 3) ? 'Minimum 3 znaki' : null;
  // patchujemy DOM bezposrednio, zeby input nie tracil fokusu przy kazdym znaku
  const errEl = document.querySelector('.cz-field-error');
  if (errEl) errEl.textContent = czState.nameError || '';
  const btn = document.querySelector('.cz-step-actions .cz-btn-primary');
  if (btn) btn.disabled = !(czState.selectedStarter && v.trim().length >= 3) || czState.busy;
}
async function confirmStep1() {
  if (!czState.selectedStarter || czState.nameValue.trim().length < 3 || czState.busy) return;
  czState.busy = true; czState.nameError = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_set_trainer_name', { p_name: czState.nameValue.trim() });
    if (error) throw error;
    czState.profile.trainer_name = data;
    czState.step = 2;
  } catch (e) {
    czState.nameError = friendlyError(e);
  } finally {
    czState.busy = false; render();
  }
}

/* ---- Krok 2: pierwsze wyreżyserowane łapanie (100% skutecznosc, bez RPC) ---- */
function renderStep2() {
  const wild = { id: 16, name: 'pidgey' };
  const urls = spriteUrls(wild.id, wild.name);
  const caught = czState.practiceCaught;
  return `
    <div class="cz-speech-bubble" style="margin-bottom:16px">Świetnie! Teraz pokażę Ci, jak łapać dzikie Pokémony. Rzuć Poké Ballem w Pidgey — tym razem gwarantuję sukces!</div>
    <div class="cz-catch-scene">
      <div class="cz-wild-card" id="cz-wild-card">
        <img src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)" alt="${wild.name}"/>
      </div>
      <div class="cz-catch-result">${caught ? '✨ Złapano! ✨' : ''}</div>
      <button class="cz-btn cz-btn-primary" ${caught ? 'disabled' : ''} onclick="throwPracticeBall()">🔴 Rzuć Poké Ballem</button>
    </div>
    <div class="cz-step-actions">
      <button class="cz-btn cz-btn-primary" ${caught ? '' : 'disabled'} onclick="czState.step=3;render()">Dalej ▶</button>
    </div>`;
}
function throwPracticeBall() {
  const card = document.getElementById('cz-wild-card');
  if (card) card.classList.add('shaking');
  setTimeout(() => {
    if (card) { card.classList.remove('shaking'); card.classList.add('caught'); }
    czState.practiceCaught = true;
    render();
  }, 500);
}

/* ---- Krok 3: prezentacja Energii + ekwipunku (informacyjny, bez RPC) ---- */
function renderStep3() {
  return `
    <div class="cz-speech-bubble">To Twój pasek Energii — zużywasz go podczas eksploracji (2–5 za krok), regeneruje się +1 co 3 minuty, maksymalnie do 100.</div>
    <div class="cz-energy-demo">
      <div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill"></div></div>
      <div class="cz-energy-caption">100 / 100 Energii</div>
    </div>
    <div class="cz-speech-bubble" style="margin:16px 0">Na start otrzymasz też podstawowy ekwipunek:</div>
    <div class="cz-inventory-preview">
      <div class="cz-inv-chip"><div class="cz-inv-icon">🧪</div><div class="cz-inv-qty">5×</div><div class="cz-inv-label">Flakon Energii</div></div>
      <div class="cz-inv-chip"><div class="cz-inv-icon">⚪</div><div class="cz-inv-qty">10×</div><div class="cz-inv-label">Poké Ball</div></div>
    </div>
    <div class="cz-step-actions">
      <button class="cz-btn cz-btn-primary" onclick="czState.step=4;render()">Dalej ▶</button>
    </div>`;
}

/* ---- Krok 4: podsumowanie + realny zapis (rpc_complete_tutorial) ---- */
function renderStep4() {
  const starter = STARTERS.find(s => s.id === czState.selectedStarter) || STARTERS[0];
  const urls = spriteUrls(starter.id, starter.name);
  if (czState.busy) {
    return `<div class="cz-summary"><div class="cz-loading">⏳ Zapisywanie profilu na serwerze...</div></div>`;
  }
  if (czState.result) {
    const r = czState.result;
    return `
      <div class="cz-summary">
        <h2 style="font-weight:800;color:var(--green);margin-bottom:8px">🎉 Gotowe, Trenerze ${escapeHtml(czState.profile.trainer_name)}!</h2>
        <div class="cz-summary-reward">
          <img src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)" alt="${starter.name}"/>
          <ul class="cz-summary-list">
            <li>🐾 ${escapeHtml(starter.name)} (Lvl 1) dołączył do drużyny</li>
            <li>⭐ Poziom Trenera: ${escapeHtml(r.trainer_level)}</li>
            <li>🧪 Flakony Energii: ${escapeHtml(r.energy_bottles)}</li>
            <li>⚪ Poké Ball: ${escapeHtml(r.poke_balls)}</li>
            <li>💰 Catch Coins: ${escapeHtml(r.catch_coins)}</li>
          </ul>
        </div>
        <div class="cz-step-actions" style="justify-content:center">
          <button class="cz-btn cz-btn-primary" onclick="render()">▶ Rozpocznij Przygodę</button>
        </div>
      </div>`;
  }
  return `
    <div class="cz-summary">
      <div class="cz-speech-bubble">Podsumowanie: wybrałeś ${escapeHtml(starter.name)} jako partnera. Kliknij, aby zapisać profil na serwerze i rozpocząć grę.</div>
      ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
      <div class="cz-step-actions" style="justify-content:center">
        <button class="cz-btn cz-btn-primary" onclick="finishTutorial()">✅ Potwierdź i graj</button>
      </div>
    </div>`;
}

/* ---- Zapis nagród: jedna wspólna, atomowa funkcja RPC dla normalnego przebiegu i Skip ---- */
async function callCompleteTutorial(starterId) {
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_complete_tutorial', { p_starter_species_id: starterId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.result = row;
    czState.profile.tutorial_completed = true;
    czState.profile.trainer_level = row.trainer_level;
  } catch (e) {
    czState.error = friendlyError(e);
  } finally {
    czState.busy = false; render();
  }
}
function finishTutorial() {
  callCompleteTutorial(czState.selectedStarter || STARTERS[0].id);
}
function skipTutorial() {
  if (czState.busy) return;
  czState.step = 4;
  callCompleteTutorial(czState.selectedStarter || STARTERS[0].id);
}

/* ================================================================
   MENU GŁÓWNE (szkielet — pełna zawartość w kolejnych ETAPach)
   ================================================================ */
function renderMainMenu() {
  const p = czState.profile;
  const menuItems = [
    { icon: '🗺️', label: 'Eksploracja', action: "openScreen('explore')" },
    { icon: '⚔️', label: 'PvP', action: "openScreenAsync('ranking',loadRanking)" },
    { icon: '🤖', label: 'Trenerzy', action: "startBotBattle()" },
    { icon: '🎒', label: 'Ekwipunek', action: "openScreenAsync('inventory',loadInventoryFull)" },
    { icon: '🐾', label: 'Drużyna', action: "openScreenAsync('team',loadTeamAndBox)" },
    { icon: '📦', label: 'PC Box', action: "openScreenAsync('team',loadTeamAndBox)" },
    { icon: '🏆', label: 'Odznaki', action: "openScreenAsync('badges',loadBadges)" },
    { icon: '🏟️', label: 'Sale', action: "openScreenAsync('gyms',loadGyms)" },
    { icon: '🏆', label: 'Ranking', action: "openScreenAsync('ranking',loadRanking)" },
    { icon: '👤', label: 'Profil', action: "openScreenAsync('card',loadTrainerCardData)" },
    { icon: '🛒', label: 'Sklep', action: "openScreen('shop')" },
    { icon: '🔄', label: 'GTS', action: "openScreenAsync('gts',loadGts)" }
  ];
  const tiles = menuItems.map(m => `<div class="cz-menu-tile" onclick="${m.action}">
    <div class="cz-menu-icon">${m.icon}</div><div class="cz-menu-label">${m.label}</div>
  </div>`).join('');
  return `
    <div class="cz-profile-card">
      <div class="cz-profile-avatar">🧑‍🚀</div>
      <div class="cz-profile-info">
        <div class="cz-profile-name">${escapeHtml(p.trainer_name)}</div>
        <div class="cz-profile-meta">Trainer Level ${escapeHtml(p.trainer_level)}</div>
        <div class="cz-profile-stats">
          <div class="cz-profile-stat">⚡ Energia <b>${escapeHtml(p.energy)}/100</b></div>
          <div class="cz-profile-stat">💰 Coins <b>${escapeHtml(p.catch_coins)}</b></div>
          <div class="cz-profile-stat">🧪 Flakony <b>${escapeHtml(p.energy_bottles)}</b></div>
        </div>
      </div>
    </div>
    <div class="cz-menu-grid">${tiles}</div>`;
}


/* ================================================================
   MODULY 2-7: Eksploracja, Catch Engine, Walka (Boty/Sale/PvP),
   Progresja/Odznaki/Karta Trenera, GTS/Sklep. Zasada niezmienna:
   rpc_* (SQL) = proste operacje; callFn -> Edge Function (TS) = zlozona
   logika (Catch Engine, silnik walki, PvP) — nigdy liczone lokalnie.
   ================================================================ */
const BIOMES = [
  { key: 'forest', icon: '🌲', pl: 'Las' }, { key: 'cave', icon: '⛰️', pl: 'Jaskinia' },
  { key: 'ocean', icon: '🌊', pl: 'Ocean' }, { key: 'mountain', icon: '🏔️', pl: 'Góry' },
  { key: 'plains', icon: '🌾', pl: 'Równiny' }, { key: 'desert', icon: '🏜️', pl: 'Pustynia' },
  { key: 'snow', icon: '❄️', pl: 'Śnieg' }, { key: 'swamp', icon: '🐸', pl: 'Bagno' },
  { key: 'volcano', icon: '🌋', pl: 'Wulkan' }, { key: 'cyber', icon: '⚡', pl: 'Cyber-Lab' },
  { key: 'sky', icon: '🌌', pl: 'Niebo' }, { key: 'void', icon: '👻', pl: 'Otchłań' }
];
const BALLS = [
  { slug: 'poke-ball', icon: '⚪', name: 'Poké Ball' }, { slug: 'great-ball', icon: '🔵', name: 'Great Ball' },
  { slug: 'ultra-ball', icon: '🟡', name: 'Ultra Ball' }, { slug: 'dusk-ball', icon: '⚫', name: 'Dusk Ball' },
  { slug: 'master-ball', icon: '🟣', name: 'Master Ball' }
];
const TYPE_COLORS = { normal:'#a8a878',fire:'#f08030',water:'#6890f0',electric:'#f8d030',grass:'#78c850',ice:'#98d8d8',
  fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',rock:'#b8a038',
  ghost:'#705898',dragon:'#7038f8',dark:'#705848',steel:'#b8b8d0',fairy:'#ee99ac' };

function screenHeader(title) {
  return `<div class="cz-screen-header"><button class="cz-btn" onclick="goToMenu()">◀ Menu</button><h2>${title}</h2></div>`;
}
function goToMenu() { czState.screen = 'menu'; czState.error = null; render(); }
function openScreen(name) { czState.screen = name; czState.error = null; render(); }
async function openScreenAsync(name, loader) {
  czState.screen = name; czState.error = null; render();
  try { if (loader) await loader(); } catch (e) { czState.error = friendlyError(e); }
  render();
}
// Wywoluje Edge Function (zlozona logika Zero-Trust) przez sesje uzytkownika
async function callFn(name, body) {
  const { data, error } = await sbClient.functions.invoke(name, { body });
  if (error) {
    let msg = error.message || 'Błąd funkcji serwera';
    try { if (error.context && error.context.json) { const ctx = await error.context.json(); if (ctx && ctx.error) msg = ctx.error; } } catch (_) { /* ignore */ }
    throw new Error(msg);
  }
  return data;
}
async function refreshInventory() {
  const { data } = await sbClient.from('inventory').select('item_slug,quantity').eq('owner_id', czState.profile.id);
  const map = {}; (data || []).forEach((r) => { map[r.item_slug] = r.quantity; });
  czState.inventory = map;
}

/* ---- MODUL 2: Eksploracja ---- */
function renderExplore() {
  const p = czState.profile;
  const biomeOpts = BIOMES.map((b) => `<option value="${b.key}" ${czState.selectedBiome === b.key ? 'selected' : ''}>${b.icon} ${b.pl}</option>`).join('');
  return `${screenHeader('🗺️ Eksploracja')}
    <div class="cz-energy-demo"><div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${p.energy}%"></div></div>
      <div class="cz-energy-caption">${p.energy} / 100 Energii</div></div>
    <div class="cz-name-row"><label>Biom</label><select class="cz-input" onchange="czState.selectedBiome=this.value">${biomeOpts}</select></div>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div>${renderExploreResult()}</div>
    <div class="cz-step-actions" style="justify-content:center">
      <button class="cz-btn cz-btn-primary" ${czState.busy ? 'disabled' : ''} onclick="doExploreStep()">${czState.busy ? '⏳...' : '👣 Zrób krok (2-5 Energii)'}</button>
    </div>`;
}
function renderExploreResult() {
  const r = czState.lastExploreResult;
  if (!r) return '';
  if (r.event_type === 'wild') return `<div class="cz-wild-card"><div class="cz-catch-result">🐾 Dziki Pokémon! (Lvl ${r.level})</div><button class="cz-btn cz-btn-primary" onclick="openCatchScreen('${r.encounter_id}',${r.species_id})">Podejdź bliżej</button></div>`;
  if (r.event_type === 'bot') return `<div class="cz-wild-card"><div class="cz-catch-result">🤖 Trener-Bot chce walczyć!</div><button class="cz-btn cz-btn-primary" onclick="startBotBattle()">Walcz</button></div>`;
  if (r.event_type === 'pvp') return `<div class="cz-wild-card"><div class="cz-catch-result">👤 Napotkano gracza: ${escapeHtml(r.opponent_name)}!</div><button class="cz-btn cz-btn-primary" onclick="startPvp('${r.opponent_id}')">Wyzwij</button></div>`;
  return `<div class="cz-catch-result" style="color:var(--gray)">Cisza... nic się nie wydarzyło.</div>`;
}
async function doExploreStep() {
  if (czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_explore_step', { p_biome: czState.selectedBiome });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.profile.energy = row.energy;
    czState.lastExploreResult = row;
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}

/* ---- MODUL 3: Catch Engine ---- */
function openCatchScreen(encounterId, speciesId) {
  czState.currentEncounter = { id: encounterId, species_id: speciesId, ball: 'poke-ball', useBerry: false };
  czState.catchOutcome = null; czState.screen = 'catch'; czState.error = null; render();
}
function renderCatch() {
  const enc = czState.currentEncounter;
  if (!enc) return renderExplore();
  const urls = spriteUrls(enc.species_id, String(enc.species_id));
  const inv = czState.inventory || {};
  const ballOpts = BALLS.map((b) => `<option value="${b.slug}" ${enc.ball === b.slug ? 'selected' : ''}>${b.icon} ${b.name} (${inv[b.slug] || 0})</option>`).join('');
  if (czState.catchOutcome) {
    const o = czState.catchOutcome;
    return `${screenHeader('🎯 Łapanie')}<div class="cz-summary">
      <div class="cz-catch-result" style="font-size:16px;color:${o.success ? 'var(--green)' : 'var(--red)'}">${o.success ? '✨ Złapano!' : '💨 Pokémon uciekł...'}</div>
      <div style="color:var(--gray);font-size:12px;margin-top:6px">Szansa: ${o.chance}% • Pozostało Ballów: ${o.balls_remaining}</div>
      <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="openScreen('explore')">◀ Wróć do eksploracji</button></div>
    </div>`;
  }
  return `${screenHeader('🎯 Łapanie')}
    <div class="cz-catch-scene"><div class="cz-wild-card"><img src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)"/></div></div>
    <div class="cz-name-row"><label>Poké Ball</label><select class="cz-input" onchange="czState.currentEncounter.ball=this.value">${ballOpts}</select></div>
    <label style="display:flex;align-items:center;gap:8px;margin:10px 0;font-size:13px"><input type="checkbox" onchange="czState.currentEncounter.useBerry=this.checked" ${inv['razz-berry'] ? '' : 'disabled'}/> Użyj Razz Berry (+25%, ${inv['razz-berry'] || 0} szt.)</label>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div class="cz-step-actions" style="justify-content:center">
      <button class="cz-btn cz-btn-primary" ${czState.busy ? 'disabled' : ''} onclick="throwRealBall()">🔴 ${czState.busy ? 'Rzucanie...' : 'Rzuć Ballem'}</button>
    </div>`;
}
async function throwRealBall() {
  const enc = czState.currentEncounter;
  if (!enc || czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const data = await callFn('catch-attempt', { encounter_id: enc.id, ball_slug: enc.ball, use_razz_berry: !!enc.useBerry });
    czState.catchOutcome = data;
    await refreshInventory();
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}

/* ---- MODUL 4: Walka (Boty / Sale / PvP) ---- */
async function startBotBattle() {
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_create_bot_battle', { p_biome: czState.selectedBiome || 'plains' });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.currentBattle = { id: row.battle_id, state: row.state, result: null, mustSwitch: false };
    czState.screen = 'battle';
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function startGymBattle(gymId) {
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_create_gym_battle', { p_gym_id: gymId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.currentBattle = { id: row.battle_id, state: row.state, result: null, mustSwitch: false };
    czState.screen = 'battle';
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
function renderBattle() {
  const b = czState.currentBattle;
  if (!b) return renderMainMenu();
  const st = b.state;
  const player = st.player_team[st.active_player_idx];
  const bot = st.bot_team[st.active_bot_idx];
  const pHpPct = Math.max(0, (player.current_hp / player.max_hp) * 100);
  const bHpPct = Math.max(0, (bot.current_hp / bot.max_hp) * 100);
  const hpColor = (pct) => (pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--gold)' : 'var(--red)');
  const movesHtml = (player.moves && player.moves.length ? player.moves : [{ slug: 'tackle', name: 'Tackle' }])
    .map((m) => `<button class="cz-btn" ${b.result || b.mustSwitch || czState.busy ? 'disabled' : ''} onclick="doBattleAction({type:'attack',move_slug:'${m.slug}'})">${escapeHtml(m.name)}</button>`).join('');
  const switchHtml = st.player_team.map((pm, i) => (i === st.active_player_idx || pm.current_hp <= 0) ? '' :
    `<button class="cz-btn" ${czState.busy ? 'disabled' : ''} onclick="doBattleAction({type:'switch',to_index:${i}})">🔄 ${escapeHtml(pm.name)}</button>`).join('');
  const logHtml = (st.log || []).slice(-8).map((l) => `<div>${escapeHtml(l)}</div>`).join('');
  let resultHtml = '';
  if (b.result) {
    resultHtml = `<div class="cz-summary-reward" style="margin-top:14px;text-align:center">
      <div style="font-weight:800;color:${b.result === 'win' ? 'var(--green)' : 'var(--red)'}">${b.result === 'win' ? '🏆 Zwycięstwo!' : '💀 Porażka'}</div>
      ${b.result === 'win' ? `<div style="font-size:12px;color:var(--gray);margin-top:4px">+${b.expGain || 0} EXP, +${b.coinGain || 0} Coins</div>` : ''}
      <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="goToMenu()">◀ Menu</button></div>
    </div>`;
  }
  return `${screenHeader('⚔️ Walka')}
    <div class="cz-battle-grid">
      <div class="cz-battle-side"><div class="cz-battle-name">${escapeHtml(player.name)} Lvl${player.level}${player.mega_active ? ' ✨MEGA' : ''}</div>
        <div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${pHpPct}%;background:${hpColor(pHpPct)}"></div></div>
        <div style="font-size:11px;color:var(--gray)">${Math.max(0, player.current_hp)}/${player.max_hp} HP</div></div>
      <div class="cz-battle-side"><div class="cz-battle-name">${escapeHtml(bot.name)} Lvl${bot.level}</div>
        <div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${bHpPct}%;background:${hpColor(bHpPct)}"></div></div>
        <div style="font-size:11px;color:var(--gray)">${Math.max(0, bot.current_hp)}/${bot.max_hp} HP</div></div>
    </div>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    ${b.mustSwitch && !b.result ? '<div class="cz-error-box" style="color:var(--gold);border-color:rgba(255,176,32,.35);background:rgba(255,176,32,.08)">Twój Pokémon zemdlał — wybierz następnego!</div>' : ''}
    <div class="cz-battle-actions">${b.mustSwitch ? '' : movesHtml}${switchHtml}
      <button class="cz-btn" ${b.result || czState.busy ? 'disabled' : ''} onclick="doBattleAction({type:'mega'})">✨ Mega Ewolucja</button>
    </div>
    <div class="cz-battle-log">${logHtml}</div>
    ${resultHtml}`;
}
async function doBattleAction(action) {
  const b = czState.currentBattle;
  if (!b || czState.busy || b.result) return;
  czState.busy = true; czState.error = null; render();
  try {
    const data = await callFn('battle-turn', { battle_id: b.id, action });
    b.state = data.state; b.result = data.result; b.mustSwitch = data.must_switch;
    b.expGain = data.exp_gain; b.coinGain = data.coin_gain;
    if (data.profile) { czState.profile.trainer_level = data.profile.trainer_level; czState.profile.catch_coins = data.profile.catch_coins; }
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function startPvp(opponentId) {
  czState.busy = true; czState.error = null; render();
  try {
    const data = await callFn('pvp-challenge', { opponent_id: opponentId });
    czState.pvpResult = data;
    if (data.catch_coins != null) czState.profile.catch_coins = data.catch_coins;
    czState.screen = 'pvp_result';
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
function renderPvpResult() {
  const r = czState.pvpResult;
  if (!r) return renderMainMenu();
  return `${screenHeader('⚔️ Wynik PvP')}<div class="cz-summary">
    <div style="font-weight:800;font-size:18px;color:${r.i_won ? 'var(--green)' : 'var(--red)'}">${r.i_won ? '🏆 Wygrałeś pojedynek!' : '💀 Przegrałeś pojedynek'}</div>
    <div style="color:var(--gray);font-size:12px;margin-top:6px">${r.i_won ? `Skradzione monety: ${r.coins_stolen}` : `Skradziono Ci: ${r.coins_stolen} Coins`}</div>
    <div class="cz-battle-log" style="margin-top:12px;text-align:left">${(r.log || []).slice(0, 20).map((l) => `<div>${escapeHtml(l)}</div>`).join('')}</div>
    <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="goToMenu()">◀ Menu</button></div>
  </div>`;
}

/* ---- MODUL 5: Sale / Odznaki (parallax) / Karta Trenera ---- */
async function loadGyms() {
  const { data } = await sbClient.from('gyms').select('id,region,order_no,leader_name,leader_type').order('region').order('order_no');
  czState.gyms = data || [];
  const { data: pb } = await sbClient.from('player_badges').select('badges(gym_id)').eq('profile_id', czState.profile.id);
  czState.earnedGymIds = new Set((pb || []).map((b) => b.badges && b.badges.gym_id).filter(Boolean));
}
function renderGyms() {
  if (czState.gyms === null) return `${screenHeader('🏟️ Sale')}<div class="cz-loading">Ładowanie...</div>`;
  const rows = czState.gyms.map((g) => {
    const earned = czState.earnedGymIds && czState.earnedGymIds.has(g.id);
    return `<div class="cz-gym-row"><div><b>${g.order_no}. ${escapeHtml(g.leader_name)}</b>
      <span class="cz-type-chip" style="background:${TYPE_COLORS[g.leader_type] || '#888'}">${escapeHtml(g.leader_type)}</span>
      <span style="color:var(--gray);font-size:11px"> ${escapeHtml(g.region)}</span></div>
      ${earned ? '<span style="color:var(--gold)">🏆 Zdobyto</span>' : `<button class="cz-btn cz-btn-primary" ${czState.busy ? 'disabled' : ''} onclick="startGymBattle('${g.id}')">Wyzwij</button>`}
    </div>`;
  }).join('');
  return `${screenHeader('🏟️ Sale')}${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}<div class="cz-gym-list">${rows}</div>`;
}
async function loadBadges() {
  const { data } = await sbClient.from('player_badges').select('badge_id,badges(id,name,gym_id)').eq('profile_id', czState.profile.id);
  czState.badges = data || [];
}
function renderBadges() {
  if (czState.badges === null) return `${screenHeader('🏆 Odznaki')}<div class="cz-loading">Ładowanie...</div>`;
  if (!czState.badges.length) return `${screenHeader('🏆 Odznaki')}<div style="text-align:center;color:var(--gray);padding:20px">Brak odznak — pokonaj Lidera Sali!</div>`;
  const cards = czState.badges.map((b) => {
    const badge = b.badges;
    const featured = czState.profile.featured_badge_id === badge.id;
    return `<div class="cz-badge-3d" onmousemove="badgeTilt(event,this)" onmouseleave="badgeReset(this)">
      <div class="cz-badge-3d-inner"><div class="cz-badge-icon">🏅</div><div class="cz-badge-name">${escapeHtml(badge.name)}</div></div>
      <button class="cz-btn ${featured ? 'cz-btn-primary' : ''}" style="margin-top:8px;width:100%" onclick="setFeaturedBadge('${badge.id}')">${featured ? '⭐ Wyróżniona' : 'Ustaw jako Featured'}</button>
    </div>`;
  }).join('');
  const gyroBtn = (typeof DeviceOrientationEvent !== 'undefined') ? '<div class="cz-step-actions" style="justify-content:center"><button class="cz-btn" onclick="enableGyroTilt()">📱 Włącz żyroskop (mobile)</button></div>' : '';
  return `${screenHeader('🏆 Odznaki')}<div class="cz-badge-grid">${cards}</div>${gyroBtn}`;
}
function badgeTilt(e, el) {
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  el.querySelector('.cz-badge-3d-inner').style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 24}deg)`;
}
function badgeReset(el) { el.querySelector('.cz-badge-3d-inner').style.transform = ''; }
function enableGyroTilt() {
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission().then((state) => { if (state === 'granted') attachGyroListener(); });
  } else attachGyroListener();
}
function attachGyroListener() {
  window.addEventListener('deviceorientation', (e) => {
    document.querySelectorAll('.cz-badge-3d-inner').forEach((el) => {
      const x = Math.max(-24, Math.min(24, e.gamma || 0));
      const y = Math.max(-24, Math.min(24, (e.beta || 0) - 45));
      el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });
  });
}
async function setFeaturedBadge(badgeId) {
  czState.busy = true; render();
  try { await sbClient.rpc('rpc_set_featured_badge', { p_badge_id: badgeId }); czState.profile.featured_badge_id = badgeId; }
  catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function loadTrainerCardData() {
  const [{ data: party }, { data: badgesData }] = await Promise.all([
    sbClient.from('user_pokemon').select('*').eq('owner_id', czState.profile.id).not('party_slot', 'is', null).order('party_slot'),
    sbClient.from('player_badges').select('badges(name)').eq('profile_id', czState.profile.id)
  ]);
  czState.cardParty = party || [];
  czState.cardBadges = (badgesData || []).map((b) => b.badges && b.badges.name).filter(Boolean);
}
function renderCard() {
  return `${screenHeader('🪪 Karta Trenera')}
    <canvas id="cz-trainer-canvas" width="640" height="360" style="width:100%;max-width:640px;border-radius:12px;border:1px solid var(--border);display:block;margin:0 auto"></canvas>
    <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="downloadTrainerCard()">⬇ Pobierz PNG</button></div>`;
}
function drawTrainerCard() {
  const canvas = document.getElementById('cz-trainer-canvas');
  if (!canvas || !czState.profile) return;
  const ctx = canvas.getContext('2d');
  const p = czState.profile;
  const grad = ctx.createLinearGradient(0, 0, 640, 360);
  grad.addColorStop(0, '#0d1220'); grad.addColorStop(1, '#141a2e');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 640, 360);
  ctx.strokeStyle = 'rgba(52,230,164,.5)'; ctx.lineWidth = 3; ctx.strokeRect(6, 6, 628, 348);
  ctx.fillStyle = '#34e6a4'; ctx.font = 'bold 26px Inter, sans-serif'; ctx.fillText(p.trainer_name || 'Trener', 24, 46);
  ctx.fillStyle = '#f1f5f9'; ctx.font = '16px Inter, sans-serif'; ctx.fillText('Trainer Level ' + p.trainer_level, 24, 72);
  ctx.fillStyle = '#ffb020'; ctx.fillText('💰 ' + p.catch_coins + ' Catch Coins', 24, 96);
  ctx.fillStyle = '#94a3b8'; ctx.font = '13px Inter, sans-serif';
  ctx.fillText('Odznaki: ' + (czState.cardBadges && czState.cardBadges.length ? czState.cardBadges.join(', ') : 'brak'), 24, 122);
  ctx.fillText('Drużyna:', 24, 150);
  (czState.cardParty || []).slice(0, 6).forEach((mon, i) => {
    const x = 24 + i * 100;
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, 166, 88, 88);
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.strokeRect(x, 166, 88, 88);
    ctx.fillStyle = '#f1f5f9'; ctx.font = '11px Inter, sans-serif';
    ctx.fillText((mon.nickname || ('#' + mon.species_id)) + ' Lv' + mon.level, x + 4, 262);
  });
}
function downloadTrainerCard() {
  const canvas = document.getElementById('cz-trainer-canvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.download = 'karta-trenera-' + (czState.profile.trainer_name || 'trener') + '.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

/* ---- MODUL 6: GTS + Sklep ---- */
async function loadGts() {
  const { data } = await sbClient.from('gts_listings').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(30);
  czState.gtsListings = data || [];
  const { data: mine } = await sbClient.from('user_pokemon').select('id,species_id,nickname,level').eq('owner_id', czState.profile.id);
  czState.myPokemonForGts = mine || [];
}
function renderGts() {
  if (czState.gtsListings === null) return `${screenHeader('🔄 GTS')}<div class="cz-loading">Ładowanie...</div>`;
  const rows = czState.gtsListings.map((l) => `<div class="cz-gym-row">
    <div>Pokémon #${l.pokemon_id.slice(0, 8)} — <b>${l.asking_price} Coins</b></div>
    ${l.seller_id === czState.profile.id ? `<button class="cz-btn" onclick="cancelGtsListing('${l.id}')">Anuluj</button>` : `<button class="cz-btn cz-btn-primary" onclick="buyGtsListing('${l.id}')">Kup</button>`}
  </div>`).join('') || '<div style="color:var(--gray);text-align:center;padding:16px">Brak aktywnych ofert</div>';
  return `${screenHeader('🔄 GTS')}${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div class="cz-gym-list">${rows}</div>${renderGtsListForm()}`;
}
function renderGtsListForm() {
  const opts = (czState.myPokemonForGts || []).map((p) => `<option value="${p.id}">${escapeHtml(p.nickname || ('#' + p.species_id))} Lv${p.level}</option>`).join('');
  if (!opts) return '';
  return `<div class="cz-name-row" style="margin-top:16px"><label>Wystaw swojego Pokémona</label>
    <select class="cz-input" id="cz-gts-pokemon">${opts}</select>
    <input class="cz-input" id="cz-gts-price" type="number" min="1" placeholder="Cena w Catch Coins" style="margin-top:6px"/>
    <button class="cz-btn cz-btn-primary" style="margin-top:6px;width:100%" ${czState.busy ? 'disabled' : ''} onclick="listOnGts()">Wystaw (5% prowizji)</button>
  </div>`;
}
async function listOnGts() {
  const pokeSel = document.getElementById('cz-gts-pokemon'), priceInp = document.getElementById('cz-gts-price');
  const price = parseInt(priceInp && priceInp.value, 10);
  if (!pokeSel || !price || price <= 0) { czState.error = 'Podaj poprawną cenę'; render(); return; }
  czState.busy = true; render();
  try { await sbClient.rpc('rpc_gts_list', { p_pokemon_id: pokeSel.value, p_price: price }); await loadGts(); }
  catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function buyGtsListing(id) {
  czState.busy = true; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_gts_buy', { p_listing_id: id });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.profile.catch_coins = row.catch_coins;
    await loadGts();
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function cancelGtsListing(id) {
  czState.busy = true; render();
  try { await sbClient.rpc('rpc_gts_cancel', { p_listing_id: id }); await loadGts(); }
  catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
function renderShop() {
  const skus = [
    { sku: 'energy-pack-3', name: '3× Flakon Energii', price: '4,99 zł' },
    { sku: 'energy-crate-10', name: '10× Flakon Energii + 2× Great Ball', price: '12,99 zł' },
    { sku: 'master-ball-1', name: 'Master Ball', price: '9,99 zł' }
  ];
  const rows = skus.map((s) => `<div class="cz-gym-row"><div>${escapeHtml(s.name)}</div>
    <button class="cz-btn cz-btn-primary" ${czState.busy ? 'disabled' : ''} onclick="buySku('${s.sku}')">${s.price}</button></div>`).join('');
  return `${screenHeader('🛒 Sklep')}
    ${czState.shopMessage ? `<div class="cz-error-box" style="color:var(--gold);border-color:rgba(255,176,32,.35);background:rgba(255,176,32,.08)">${escapeHtml(czState.shopMessage)}</div>` : ''}
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div class="cz-gym-list">${rows}</div>`;
}
async function buySku(sku) {
  czState.busy = true; czState.error = null; czState.shopMessage = null; render();
  try {
    const data = await callFn('shop-checkout', { sku });
    czState.shopMessage = data.message || (data.payment_configured === false ? 'Płatności jeszcze nieaktywne — zamówienie zapisane jako oczekujące.' : 'Zamówienie utworzone.');
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}

/* ---- Drużyna / PC Box / Ekwipunek / Ranking ---- */
async function loadTeamAndBox() {
  const { data } = await sbClient.from('user_pokemon').select('*').eq('owner_id', czState.profile.id).order('party_slot', { ascending: true, nullsFirst: false });
  czState.myPokemon = data || [];
}
function nextFreeSlot() {
  const used = new Set((czState.myPokemon || []).filter((p) => p.party_slot != null).map((p) => p.party_slot));
  for (let i = 1; i <= 6; i++) if (!used.has(i)) return i;
  return null;
}
function renderTeam() {
  if (czState.myPokemon === null) return `${screenHeader('🐾 Drużyna i PC Box')}<div class="cz-loading">Ładowanie...</div>`;
  const rows = czState.myPokemon.map((p) => {
    const inParty = p.party_slot != null;
    return `<div class="cz-gym-row"><div>${escapeHtml(p.nickname || ('#' + p.species_id))} Lv${p.level}
      ${inParty ? `<span style="color:var(--green);font-size:11px">(Drużyna #${p.party_slot})</span>` : '<span style="color:var(--gray);font-size:11px">(PC Box)</span>'}</div>
      ${inParty ? `<button class="cz-btn" onclick="setPartySlot('${p.id}',null)">Do Boxa</button>` : `<button class="cz-btn cz-btn-primary" onclick="setPartySlot('${p.id}',${nextFreeSlot()})">Do Drużyny</button>`}
    </div>`;
  }).join('') || '<div style="color:var(--gray);text-align:center;padding:16px">Brak Pokémonów</div>';
  return `${screenHeader('🐾 Drużyna i PC Box')}${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}<div class="cz-gym-list">${rows}</div>`;
}
async function setPartySlot(pokemonId, slot) {
  if (slot !== null && !slot) { czState.error = 'Drużyna jest pełna (max 6)'; render(); return; }
  czState.busy = true; render();
  try { await sbClient.rpc('rpc_set_party_slot', { p_pokemon_id: pokemonId, p_slot: slot }); await loadTeamAndBox(); }
  catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
async function loadInventoryFull() {
  const { data } = await sbClient.from('inventory').select('item_slug,quantity,item_catalog(name)').eq('owner_id', czState.profile.id);
  czState.fullInventory = data || [];
  await refreshInventory();
}
function renderInventory() {
  if (!czState.fullInventory) return `${screenHeader('🎒 Ekwipunek')}<div class="cz-loading">Ładowanie...</div>`;
  const rows = czState.fullInventory.map((i) => `<div class="cz-inv-chip"><div class="cz-inv-qty">${i.quantity}×</div><div class="cz-inv-label">${escapeHtml((i.item_catalog && i.item_catalog.name) || i.item_slug)}</div></div>`).join('');
  return `${screenHeader('🎒 Ekwipunek')}<div class="cz-inventory-preview">${rows || '<div style="color:var(--gray)">Pusto</div>'}</div>`;
}
async function loadRanking() {
  const { data, error } = await sbClient.rpc('rpc_get_ranking', { p_limit: 20 });
  czState.ranking = error ? [] : data;
}
function renderRanking() {
  if (czState.ranking === null) return `${screenHeader('🏆 Ranking')}<div class="cz-loading">Ładowanie...</div>`;
  const rows = czState.ranking.map((r, i) => `<div class="cz-gym-row"><div>#${i + 1} <b>${escapeHtml(r.trainer_name)}</b> — Lvl ${r.trainer_level} <span style="color:var(--gray);font-size:11px">🏅×${r.badge_count}</span></div>
    ${r.id !== czState.profile.id ? `<button class="cz-btn" ${czState.busy ? 'disabled' : ''} onclick="startPvp('${r.id}')">⚔️ Wyzwij</button>` : '<span style="color:var(--gray);font-size:11px">To Ty</span>'}
  </div>`).join('');
  return `${screenHeader('🏆 Ranking')}${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}<div class="cz-gym-list">${rows}</div>`;
}

document.addEventListener('DOMContentLoaded', initCatchZone);
