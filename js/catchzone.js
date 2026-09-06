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
/* ================================================================
   MINI-GRAFIKI PRZEDMIOTOW (prawdziwe sprite'y PokeAPI zamiast emoji)
   ================================================================ */
// energy-bottle i mega-stone to wlasne przedmioty tej gry (nie istnieja w
// oryginalnych grach Pokemon) — podpinamy pod najblizsze wizualnie realne sprite'y.
const ITEM_SPRITE_OVERRIDES = { 'energy-bottle': 'energy-root', 'mega-stone': 'key-stone' };
function itemSpriteUrl(slug) {
  const real = ITEM_SPRITE_OVERRIDES[slug] || slug;
  return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/' + real + '.png';
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
  needsLogin: false,
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
    const session = sessionData && sessionData.session;
    // Brief pkt 6: bez cichego auto-logowania anonimowego dla NOWYCH wizyt —
    // gracz musi wybrac Discord/Google/Microsoft. Istniejace sesje (w tym stare
    // anonimowe konta testowe) dzialaja dalej bez zmian, zeby nic nie zgubic.
    if (!session) { czState.needsLogin = true; render(); return; }
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
  // Grafika ekranu logowania/samouczka znika, gdy tylko gracz wejdzie do wlasciwej gry
  document.body.classList.toggle('cz-pre-game', !(czState.profile && czState.profile.tutorial_completed));
  const app = document.getElementById('cz-app');
  if (!app) return;
  if (!SUPABASE_CONFIGURED) { app.innerHTML = renderSetupBanner(); return; }
  if (czState.initError) {
    app.innerHTML = `<div class="cz-setup-banner" style="color:var(--red);border-color:rgba(255,77,106,.35);background:rgba(255,77,106,.08)">⚠ Błąd połączenia z Supabase: ${escapeHtml(czState.initError)}</div>`;
    return;
  }
  if (czState.needsLogin && !czState.profile) { app.innerHTML = renderLoginScreen(); return; }
  if (!czState.profile) { app.innerHTML = '<div class="cz-loading">⏳ Ładowanie profilu Trenera...</div>'; return; }
  if (!czState.profile.starter_region) { app.innerHTML = renderRegionSelect(); return; }
  if (!czState.profile.tutorial_completed || czState.result) {
    // trzymamy ekran nagrody (Krok 4) dopoki gracz go nie potwierdzi (enterGame),
    // inaczej tutorial_completed=true w tym samym takcie od razu przeskakuje do menu
    app.innerHTML = renderTutorialOverlay();
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
    case 'announcements': return renderAnnouncements();
    case 'weather': return renderWeather();
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
   EKRAN LOGOWANIA (brief pkt 6) — Discord/Google/Microsoft (OAuth).
   UWAGA: to tylko KOD klienta. Zeby przyciski realnie dzialaly, trzeba
   jeszcze w Supabase Dashboard -> Authentication -> Providers wlaczyc kazdy
   z tych 3 providerow i podac Client ID/Secret zalozone osobno w Discord
   Developer Portal / Google Cloud Console / Microsoft Entra — to jedyny krok,
   ktorego nie da sie zrobic z poziomu kodu (wymaga Twoich kont deweloperskich).
   ================================================================ */
const OAUTH_PROVIDERS = [
  { key: 'discord', label: 'Discord' },
  { key: 'google', label: 'Google' },
  { key: 'azure', label: 'Microsoft' }
];
function renderLoginScreen() {
  const tiles = OAUTH_PROVIDERS.map((p) => `<button class="cz-oauth-tile cz-oauth-${p.key}" ${czState.busy ? 'disabled' : ''} onclick="signInWithProvider('${p.key}')">
    ${p.key === 'azure' ? '<div class="cz-oauth-ms-logo"><span></span><span></span><span></span><span></span></div>' : `<div class="cz-oauth-glyph">${p.key === 'discord' ? '🎮' : 'G'}</div>`}
    <div class="cz-oauth-label">Zaloguj przez ${p.label}</div>
  </button>`).join('');
  return `<div class="cz-overlay"><div class="cz-overlay-card">
    <div class="cz-professor"><div class="cz-professor-avatar">🧑‍🔬</div>
      <div class="cz-speech-bubble">Witaj w Cobblemon Catch Zone! Zaloguj się, żeby zapisać swój postęp.</div></div>
    <div class="cz-oauth-grid">${tiles}</div>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
  </div></div>`;
}
async function signInWithProvider(provider) {
  if (czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { data: sessionData } = await sbClient.auth.getSession();
    const session = sessionData && sessionData.session;
    const redirectTo = window.location.origin + window.location.pathname;
    // Sesja anonimowa juz istnieje (stare konto testowe) -> laczymy tozsamosc
    // zamiast zakladac nowe konto, zeby nie zgubic postepu gracza.
    const { error } = session && session.user && session.user.is_anonymous
      ? await sbClient.auth.linkIdentity({ provider, options: { redirectTo } })
      : await sbClient.auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (error) throw error;
    // signInWithOAuth/linkIdentity przekierowuja przegladarke — kod po tym
    // punkcie zwykle sie nie wykona (strona i tak nawiguje do providera).
  } catch (e) { czState.error = friendlyError(e); czState.busy = false; render(); }
}

/* ================================================================
   WYBOR REGIONU STARTOWEGO (brief pkt 6) — jednorazowy, jak samouczek.
   Tylko Kanto ma dane (startery/dzikie spawny/itd.) — reszta regionow to
   zapowiedz ".locked" (brief pkt 9: rozbudowa bazy region po regionie).
   ================================================================ */
const REGIONS = [
  { key: 'kanto', pl: 'Kanto', icon: '🌿', locked: false },
  { key: 'johto', pl: 'Johto', icon: '🔔', locked: true },
  { key: 'hoenn', pl: 'Hoenn', icon: '🌋', locked: true },
  { key: 'sinnoh', pl: 'Sinnoh', icon: '❄️', locked: true },
  { key: 'unova', pl: 'Unova', icon: '🌆', locked: true },
  { key: 'kalos', pl: 'Kalos', icon: '🗼', locked: true },
  { key: 'alola', pl: 'Alola', icon: '🌴', locked: true },
  { key: 'galar', pl: 'Galar', icon: '⚔️', locked: true },
  { key: 'paldea', pl: 'Paldea', icon: '🍇', locked: true }
];
function renderRegionSelect() {
  const tiles = REGIONS.map((r) => `<div class="cz-menu-tile${r.locked ? ' locked' : ''}" ${r.locked ? '' : `onclick="confirmRegion('${r.key}')"`}>
    <div class="cz-menu-icon">${r.icon}</div><div class="cz-menu-label">${r.pl}</div>
  </div>`).join('');
  return `<div class="cz-overlay"><div class="cz-overlay-card">
    <div class="cz-professor"><div class="cz-professor-avatar">🧑‍🔬</div>
      <div class="cz-speech-bubble">Z jakiego regionu pochodzisz, młody Trenerze? To określi, jakie Pokémony spotkasz na swojej drodze.</div></div>
    <div class="cz-menu-grid">${tiles}</div>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
  </div></div>`;
}
async function confirmRegion(region) {
  if (czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { error } = await sbClient.rpc('rpc_set_starter_region', { p_region: region });
    if (error) throw error;
    czState.profile.starter_region = region;
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
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
  return `<div class="cz-overlay"><div class="cz-overlay-card">${renderSkipButton()}<div class="cz-step-indicator">${dots}</div>${body}</div></div>`;
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
      <div class="cz-inv-chip"><img class="cz-item-icon" src="${itemSpriteUrl('energy-bottle')}" alt=""/><div class="cz-inv-qty">5×</div><div class="cz-inv-label">Flakon Energii</div></div>
      <div class="cz-inv-chip"><img class="cz-item-icon" src="${itemSpriteUrl('poke-ball')}" alt=""/><div class="cz-inv-qty">10×</div><div class="cz-inv-label">Poké Ball</div></div>
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
          <button class="cz-btn cz-btn-primary" onclick="enterGame()">▶ Rozpocznij Przygodę</button>
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
function enterGame() {
  czState.result = null;
  render();
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
    { icon: '🔄', label: 'GTS', action: "openScreenAsync('gts',loadGts)" },
    { icon: '📢', label: 'Ogłoszenia', action: "openScreen('announcements')" },
    { icon: '✨', label: 'Wydarzenie dnia', locked: true },
    { icon: '🌤️', label: 'Pogoda', action: "openScreen('weather')" }
  ];
  const tiles = menuItems.map(m => `<div class="cz-menu-tile${m.locked ? ' locked' : ''}" ${m.locked ? '' : `onclick="${m.action}"`}>
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

// Statyczna tresc (latwa do zmiany w kodzie) — brief pkt 4: kafelek zamiast
// rozwijania pelnej tresci na glownym ekranie menu.
const ANNOUNCEMENTS = [
  { date: '2026-09-06', title: 'Auto-Battle na żywo!', text: 'Walki z Trenerami, Salami i dzikimi Pokémonami toczą się teraz automatycznie — silnik sam wybiera ataki, Ty oglądasz pełny log rundy po rundzie.' },
  { date: '2026-09-06', title: 'Kupiec w Drużynie', text: 'Możesz teraz sprzedawać złapane Pokémony za Catch Coins na ekranie Drużyna/PC Box.' },
  { date: '2026-09-06', title: 'Darmowe leczenie', text: 'Ulecz całą drużynę za darmo, bez limitu, przyciskiem na ekranie Drużyny.' }
];
function renderAnnouncements() {
  const rows = ANNOUNCEMENTS.map((a) => `<div class="cz-gym-row" style="align-items:flex-start;flex-direction:column;gap:4px">
    <div style="display:flex;justify-content:space-between;width:100%"><b>${escapeHtml(a.title)}</b><span style="color:var(--gray);font-size:11px">${escapeHtml(a.date)}</span></div>
    <div style="color:var(--gray);font-size:13px">${escapeHtml(a.text)}</div>
  </div>`).join('');
  return `${screenHeader('📢 Ogłoszenia')}<div class="cz-gym-list">${rows}</div>`;
}
// Pogoda per biom to REALNY mechanizm juz uzywany w walkach (obrazenia od pogody
// co runde — patrz battleEngine.ts weatherChipDamage) — ten ekran tylko go tlumaczy
// graczowi, nie wymysla nowej mechaniki.
const BIOME_WEATHER = {
  desert: '🌪 Burza piaskowa', mountain: '🌪 Burza piaskowa', snow: '🌨 Grad',
  ocean: '🌧 Deszcz', swamp: '🌧 Deszcz', volcano: '☀ Silne słońce'
};
function renderWeather() {
  const rows = BIOMES.map((b) => `<div class="cz-gym-row"><div>${b.icon} <b>${escapeHtml(b.pl)}</b></div><div style="color:var(--gray);font-size:12px">${BIOME_WEATHER[b.key] || 'Brak (neutralnie)'}</div></div>`).join('');
  return `${screenHeader('🌤️ Pogoda')}
    <div style="color:var(--gray);font-size:12px;margin-bottom:10px">Pogoda w biomie wpływa na walki — co rundę zadaje obrażenia Pokémonom nieodpornym na dany typ pogody (np. Burza piaskowa nie szkodzi typom Skała/Ziemia/Stal).</div>
    <div class="cz-gym-list">${rows}</div>`;
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
  { slug: 'poke-ball', name: 'Poké Ball' }, { slug: 'great-ball', name: 'Great Ball' },
  { slug: 'ultra-ball', name: 'Ultra Ball' }, { slug: 'dusk-ball', name: 'Dusk Ball' },
  { slug: 'master-ball', name: 'Master Ball' }
];
// Podglad szansy na zlapanie (klient) — dokladnie ta sama formula co Edge Function
// catch-attempt (serwer i tak liczy autorytatywnie na nowo); patrz supabase/functions/catch-attempt.
const BALL_MULT_PREVIEW = { 'poke-ball': 1.0, 'great-ball': 1.5, 'ultra-ball': 2.0, 'dusk-ball': 1.0, 'master-ball': Infinity };
function isNightUtc() { const h = new Date().getUTCHours(); return h >= 20 || h < 6; }
function computeCatchChancePreview() {
  const enc = czState.currentEncounter;
  if (!enc || enc.baseCatchRate == null || !enc.max_hp) return null;
  if (enc.ball === 'master-ball') return 100;
  let ballMult = BALL_MULT_PREVIEW[enc.ball] != null ? BALL_MULT_PREVIEW[enc.ball] : 1.0;
  if (enc.ball === 'dusk-ball') ballMult = isNightUtc() ? 3.0 : 1.0;
  const berryMult = enc.useBerry ? 1.25 : 1.0;
  const curHp = enc.current_hp != null ? enc.current_hp : enc.max_hp;
  const hpFactor = (3 * enc.max_hp - 2 * curHp) / (3 * enc.max_hp);
  return Math.round(Math.min(100, Math.max(0, hpFactor * enc.baseCatchRate * ballMult * berryMult)));
}
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
  const biomeTiles = BIOMES.map((b) => `<button class="cz-biome-tile ${czState.selectedBiome === b.key ? 'selected' : ''}" onclick="czState.selectedBiome='${b.key}';render()">
    <div class="cz-biome-icon">${b.icon}</div><div class="cz-biome-label">${b.pl}</div>
  </button>`).join('');
  return `${screenHeader('🗺️ Eksploracja')}
    <div class="cz-energy-demo"><div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${p.energy}%"></div></div>
      <div class="cz-energy-caption">${p.energy} / 100 Energii</div></div>
    <label class="cz-biome-heading">Biom</label>
    <div class="cz-biome-grid">${biomeTiles}</div>
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
  if (r.event_type === 'item') return `<div class="cz-wild-card cz-item-found"><img class="cz-item-icon cz-item-icon-lg" src="${itemSpriteUrl(r.found_item_slug)}" alt=""/><div class="cz-catch-result" style="color:var(--gold)">🎁 Znaleziono ${r.found_item_qty}× Poké Ball!</div></div>`;
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
    if (row.event_type === 'item') await refreshInventory();
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}

/* ---- MODUL 3: Catch Engine ---- */
async function openCatchScreen(encounterId, speciesId) {
  czState.currentEncounter = {
    id: encounterId, species_id: speciesId, ball: 'poke-ball', useBerry: false,
    current_hp: null, max_hp: null, speciesName: null, baseCatchRate: null, battle: null
  };
  czState.catchOutcome = null; czState.screen = 'catch'; czState.error = null; render();
  // Podglad HP + wsp. lapania jest tylko pomocniczy (UI) — autorytatywna szansa
  // i tak liczy sie od nowa na serwerze w catch-attempt, wiec brak internetu tutaj
  // nie blokuje rzutu Ballem, po prostu nie pokaze paska szansy.
  try {
    const [{ data: enc }, { data: sp }] = await Promise.all([
      sbClient.from('encounters').select('current_hp,max_hp').eq('id', encounterId).maybeSingle(),
      sbClient.from('pokemon_species').select('name,base_catch_rate').eq('id', speciesId).maybeSingle()
    ]);
    if (enc && czState.currentEncounter) { czState.currentEncounter.current_hp = enc.current_hp; czState.currentEncounter.max_hp = enc.max_hp; }
    if (sp && czState.currentEncounter) { czState.currentEncounter.speciesName = sp.name; czState.currentEncounter.baseCatchRate = sp.base_catch_rate; }
  } catch (e) { /* podglad opcjonalny, ignorujemy */ }
  render();
}
function renderBallPicker(enc, inv) {
  const opts = BALLS.map((b) => {
    const qty = inv[b.slug] || 0;
    const sel = enc.ball === b.slug ? 'selected' : '';
    return `<button type="button" class="cz-ball-option ${sel}" onclick="selectBall('${b.slug}')" title="${escapeAttr(b.name)}">
      <img src="${itemSpriteUrl(b.slug)}" alt="${escapeAttr(b.name)}"/><span class="cz-ball-qty">${qty}</span>
    </button>`;
  }).join('');
  return `<div class="cz-name-row"><label>Poké Ball</label><div class="cz-ball-picker">${opts}</div></div>`;
}
function selectBall(slug) {
  if (!czState.currentEncounter) return;
  czState.currentEncounter.ball = slug;
  render();
}
function renderCatch() {
  const enc = czState.currentEncounter;
  if (!enc) return renderExplore();
  if (enc.battle) return renderBattle();
  if (enc.teamSelect) return renderTeamSelectForBattle(enc);
  const name = enc.speciesName || ('pokemon-' + enc.species_id);
  const urls = spriteUrls(enc.species_id, name);
  const inv = czState.inventory || {};
  if (czState.catchOutcome) {
    const o = czState.catchOutcome;
    const resultLabel = o.fledAfterFaint ? '💀 Dziki Pokémon zemdlał w walce i uciekł!'
      : o.fledAfterLoss ? '💀 Twoja drużyna zemdlała — Pokémon uciekł w zamieszaniu!'
      : (o.success ? '✨ Złapano!' : '💨 Pokémon uciekł...');
    return `${screenHeader('🎯 Łapanie')}<div class="cz-summary">
      <div class="cz-catch-result" style="font-size:16px;color:${o.success ? 'var(--green)' : 'var(--red)'}">${resultLabel}</div>
      ${(o.fledAfterFaint || o.fledAfterLoss) ? '' : `<div style="color:var(--gray);font-size:12px;margin-top:6px">Szansa: ${o.chance}% • Pozostało Ballów: ${o.balls_remaining}</div>`}
      <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="openScreen('explore')">◀ Wróć do eksploracji</button></div>
    </div>`;
  }
  const chance = computeCatchChancePreview();
  const hpKnown = !!enc.max_hp;
  const curHp = enc.current_hp != null ? enc.current_hp : enc.max_hp;
  const hpPct = hpKnown ? Math.max(0, Math.round((curHp / enc.max_hp) * 100)) : 100;
  const hpColor = hpPct > 50 ? 'var(--green)' : hpPct > 20 ? 'var(--gold)' : 'var(--red)';
  return `${screenHeader('🎯 Łapanie')}
    <div class="cz-catch-scene"><div class="cz-wild-card"><img src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)"/></div></div>
    ${hpKnown ? `<div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${hpPct}%;background:${hpColor}"></div></div><div class="cz-energy-caption">${curHp}/${enc.max_hp} HP</div>` : ''}
    ${renderBallPicker(enc, inv)}
    <label style="display:flex;align-items:center;gap:8px;margin:10px 0;font-size:13px"><input type="checkbox" onchange="czState.currentEncounter.useBerry=this.checked;render()" ${inv['razz-berry'] ? '' : 'disabled'}/> <img class="cz-item-icon" src="${itemSpriteUrl('razz-berry')}" alt=""/> Użyj Razz Berry (+25%, ${inv['razz-berry'] || 0} szt.)</label>
    ${chance != null ? `<div class="cz-catch-chance"><span class="cz-catch-chance-label">🎯 Szansa na złapanie</span><div class="cz-catch-chance-bar-bg"><div class="cz-catch-chance-bar-fill" style="width:${chance}%"></div></div><span class="cz-catch-chance-pct">${chance}%</span></div>` : ''}
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div class="cz-step-actions" style="justify-content:space-between">
      <button class="cz-btn" ${czState.busy ? 'disabled' : ''} onclick="startWildBattle()">⚔️ Walcz</button>
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
/* ---- MODUL 4b: Wybor Pokemona z druzyny przed walka z dzikim stworkiem ---- */
// "Walcz" nie rusza od razu z domyslnym slotem #1 — najpierw pokazujemy siatke
// calej aktywnej druzyny (sprite, poziom, pasek HP, wskaznik przywiazania),
// dopiero wybor gracza tworzy realna instancje walki (rpc_create_wild_battle).
async function startWildBattle() {
  const enc = czState.currentEncounter;
  if (!enc || czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.from('user_pokemon').select('*,pokemon_species(name)')
      .eq('owner_id', czState.profile.id).not('party_slot', 'is', null).order('party_slot');
    if (error) throw error;
    if (!data || !data.length) throw new Error('Twoja drużyna jest pusta — dodaj Pokémona do drużyny.');
    enc.teamSelect = data;
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
function renderTeamSelectForBattle(enc) {
  const cards = enc.teamSelect.map((p) => {
    const name = (p.pokemon_species && p.pokemon_species.name) || ('pokemon-' + p.species_id);
    const urls = spriteUrls(p.species_id, name);
    const fainted = p.current_hp <= 0;
    return `<div class="cz-mon-pick-card ${fainted ? 'fainted' : ''}" ${fainted ? '' : `onclick="confirmBattleLead('${p.id}')"`}>
      <img class="cz-mon-pick-sprite" src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)" alt="${escapeAttr(name)}"/>
      <div class="cz-mon-pick-name">${escapeHtml(p.nickname || name)} Lv${p.level} ${bondBadge(p)}</div>
      ${hpBarHtml(p)}
      ${fainted ? '<div class="cz-mon-pick-fainted">Zemdlał</div>' : ''}
    </div>`;
  }).join('');
  return `${screenHeader('🐾 Wybierz Pokémona do walki')}
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    <div class="cz-mon-pick-grid">${cards}</div>
    <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn" onclick="cancelTeamSelect()">✕ Anuluj</button></div>`;
}
function cancelTeamSelect() {
  const enc = czState.currentEncounter;
  if (enc) enc.teamSelect = null;
  render();
}
async function confirmBattleLead(pokemonId) {
  const enc = czState.currentEncounter;
  if (!enc || czState.busy) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_create_wild_battle', { p_encounter_id: enc.id, p_lead_pokemon_id: pokemonId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    enc.teamSelect = null;
    enc.battle = { id: row.battle_id, state: row.state, result: null, returnTo: 'catch' };
    czState.currentBattle = enc.battle;
  } catch (e) { czState.error = friendlyError(e); czState.busy = false; render(); return; }
  await runAutoBattle();
}
// Wywolywane po zakonczeniu walki (win/loss) zamiast goToMenu(), gdy walka
// wystartowala z ekranu Lapania — wraca do Lapania z zaktualizowanym HP dzikiego.
function endBattleReturn() {
  const b = czState.currentBattle;
  if (b && b.returnTo === 'catch' && czState.currentEncounter) {
    const wildAfter = b.state.bot_team[0];
    czState.currentEncounter.current_hp = Math.max(0, wildAfter.current_hp);
    czState.currentEncounter.battle = null;
    czState.currentBattle = null;
    czState.catchOutcome = b.result === 'win' ? { success: false, fledAfterFaint: true } : { success: false, fledAfterLoss: true };
    render();
    return;
  }
  czState.currentBattle = null;
  goToMenu();
}

/* ---- MODUL 4: Walka (Boty / Sale / PvP) — auto-battle, silnik gra za gracza ---- */
async function startBotBattle() {
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_create_bot_battle', { p_biome: czState.selectedBiome || 'plains' });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.currentBattle = { id: row.battle_id, state: row.state, result: null };
    czState.screen = 'battle';
  } catch (e) { czState.error = friendlyError(e); czState.busy = false; render(); return; }
  await runAutoBattle();
}
async function startGymBattle(gymId) {
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_create_gym_battle', { p_gym_id: gymId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    czState.currentBattle = { id: row.battle_id, state: row.state, result: null };
    czState.screen = 'battle';
  } catch (e) { czState.error = friendlyError(e); czState.busy = false; render(); return; }
  await runAutoBattle();
}
const WEATHER_INFO = { sandstorm: '🌪 Burza piaskowa', hail: '🌨 Grad', rain: '🌧 Deszcz', 'harsh-sun': '☀ Silne słońce' };
// Celnosc (C) nie jest realna staty Pokemona w tym silniku (brak systemu etapow
// celnosci/unikania) — pokazujemy staly bazowy poziom 100%, zeby karta nie klamala.
function renderCombatantCard(c) {
  const hpPct = Math.max(0, Math.round((c.current_hp / c.max_hp) * 100));
  const hpColor = hpPct > 50 ? 'var(--green)' : hpPct > 20 ? 'var(--gold)' : 'var(--red)';
  const types = (Array.isArray(c.types) ? c.types : []).map((t) => `<span class="cz-type-chip cz-type-${t}">${t}</span>`).join('');
  return `<div class="cz-battle-side">
    <div class="cz-battle-name">${escapeHtml(c.name)} Lvl${c.level}</div>
    <div class="cz-battle-types">${types}</div>
    <div class="cz-energy-bar-bg"><div class="cz-energy-bar-fill" style="width:${hpPct}%;background:${hpColor}"></div></div>
    <div style="font-size:11px;color:var(--gray)">${Math.max(0, c.current_hp)}/${c.max_hp} HP</div>
    <div class="cz-battle-statgrid">
      <div>A <b>${c.attack}</b></div><div>O <b>${c.defense}</b></div>
      <div>SA <b>${c.special_attack}</b></div><div>SO <b>${c.special_defense}</b></div>
      <div>P <b>${c.speed}</b></div><div>C <b>100%</b></div>
    </div>
    <div class="cz-battle-ability">Zdolność: <b>${c.ability ? escapeHtml(c.ability) : '—'}</b></div>
  </div>`;
}
// Log jest {turn,text} (zamiast plaskich stringow) — grupujemy po rundach.
// Defensywnie obslugujemy tez stary format (plain string), gdyby jakas walka
// sprzed tej zmiany mial jeszcze taki log. Auto-battle pokazuje CALA historie
// (walka jest juz rozstrzygnieta w calosci, wiec nie ma potrzeby ciac do 4 ostatnich rund).
function renderRoundLog(log) {
  if (!log || !log.length) return '';
  const rounds = []; const byTurn = {};
  log.forEach((entry) => {
    const isObj = entry && typeof entry === 'object';
    const t = isObj && entry.turn != null ? entry.turn : 1;
    const text = isObj ? entry.text : entry;
    if (!byTurn[t]) { byTurn[t] = []; rounds.push(t); }
    byTurn[t].push(text);
  });
  return rounds.map((t) => `<div class="cz-round-block"><div class="cz-round-title">Runda ${t}</div>${byTurn[t].map((l) => `<div class="cz-round-line">${escapeHtml(l)}</div>`).join('')}</div>`).join('');
}
// Auto-battle: gracz nie wybiera ataku/zamiany/mega — silnik serwerowy rozstrzyga
// cala walke za jednym zapytaniem (patrz runAutoBattle) i tu pokazujemy juz gotowy wynik.
function renderBattle() {
  const b = czState.currentBattle;
  if (!b) return renderMainMenu();
  const st = b.state;
  const player = st.player_team[st.active_player_idx];
  const bot = st.bot_team[st.active_bot_idx];
  const weatherBadge = st.weather ? `<div class="cz-weather-badge">${WEATHER_INFO[st.weather] || st.weather}</div>` : '';
  let resultHtml = '';
  if (b.result) {
    const backLabel = b.returnTo === 'catch' ? '◀ Wróć do Łapania' : '◀ Menu';
    const levelUpLine = b.monLeveledUp ? `<div style="color:var(--gold);font-weight:800;margin-top:6px">🎉 ${escapeHtml(player.name)} awansował na poziom ${b.monLevel}!</div>` : '';
    resultHtml = `<div class="cz-summary-reward" style="margin-top:14px;text-align:center">
      <div style="font-weight:800;color:${b.result === 'win' ? 'var(--green)' : 'var(--red)'}">${b.result === 'win' ? '🏆 Zwycięstwo!' : '💀 Porażka'}</div>
      ${b.result === 'win' ? `<div style="font-size:13px;color:var(--white);margin-top:8px;line-height:1.9;text-align:left;max-width:260px;margin-inline:auto">
        <div>🧑 Postać +${b.expGain || 0} doświadczenia</div>
        <div>🐾 ${escapeHtml(player.name)} +${b.monExpGain || 0} doświadczenia</div>
        <div>💰 +${b.coinGain || 0} Catch Coins</div>
      </div>${levelUpLine}` : ''}
      <div class="cz-step-actions" style="justify-content:center"><button class="cz-btn cz-btn-primary" onclick="endBattleReturn()">${backLabel}</button></div>
    </div>`;
  }
  return `${screenHeader('⚔️ Walka')}
    ${weatherBadge}
    <div class="cz-battle-grid">
      ${renderCombatantCard(player)}
      ${renderCombatantCard(bot)}
    </div>
    ${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}
    ${!b.result && czState.busy ? '<div class="cz-loading">⚔️ Walka trwa automatycznie...</div>' : ''}
    <div class="cz-battle-log">${renderRoundLog(st.log)}</div>
    ${resultHtml}`;
}
// Jedno zapytanie rozstrzyga CALA walke (silnik gra za obie strony az do konca) —
// patrz autoResolveBattle w supabase/functions/_shared/battleEngine.ts.
async function runAutoBattle() {
  const b = czState.currentBattle;
  if (!b || b.result) return;
  czState.busy = true; czState.error = null; render();
  try {
    const data = await callFn('battle-turn', { battle_id: b.id });
    b.state = data.state; b.result = data.result;
    b.expGain = data.exp_gain; b.coinGain = data.coin_gain;
    b.monExpGain = data.mon_exp_gain; b.monLevel = data.mon_level; b.monLeveledUp = data.mon_leveled_up;
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
    sbClient.from('user_pokemon').select('*,pokemon_species(name)').eq('owner_id', czState.profile.id).not('party_slot', 'is', null).order('party_slot'),
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
async function drawTrainerCard() {
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
  const party = (czState.cardParty || []).slice(0, 6);
  // Ramka+etykieta rysuja sie od razu (zawsze widoczne); sprite doladowuje sie
  // asynchronicznie i nadpisuje szare tlo, z fallbackiem artwork -> staty sprite.
  party.forEach((mon, i) => {
    const x = 24 + i * 100;
    ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, 166, 88, 88);
    ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.strokeRect(x, 166, 88, 88);
    ctx.fillStyle = '#f1f5f9'; ctx.font = '11px Inter, sans-serif';
    ctx.fillText((mon.nickname || ('#' + mon.species_id)) + ' Lv' + mon.level, x + 4, 262);
  });
  await Promise.all(party.map((mon, i) => new Promise((resolve) => {
    const name = (mon.pokemon_species && mon.pokemon_species.name) || ('pokemon-' + mon.species_id);
    const urls = spriteUrls(mon.species_id, name);
    const x = 24 + i * 100;
    const draw = (img) => { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(x, 166, 88, 88); ctx.drawImage(img, x, 166, 88, 88); resolve(); };
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => draw(img);
    img.onerror = () => {
      const img2 = new Image(); img2.crossOrigin = 'anonymous';
      img2.onload = () => draw(img2);
      img2.onerror = () => resolve(); // ramka+etykieta zostaja jako fallback
      img2.src = urls.sprite;
    };
    img.src = urls.artwork;
  })));
}
function downloadTrainerCard() {
  const canvas = document.getElementById('cz-trainer-canvas');
  if (!canvas) return;
  try {
    const a = document.createElement('a');
    a.download = 'karta-trenera-' + (czState.profile.trainer_name || 'trener') + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  } catch (e) {
    czState.error = 'Nie udało się wygenerować obrazu karty (błąd CORS grafik). Spróbuj ponownie.';
    render();
  }
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
  const { data } = await sbClient.from('user_pokemon').select('*,pokemon_species(name,base_catch_rate)').eq('owner_id', czState.profile.id).order('party_slot', { ascending: true, nullsFirst: false });
  czState.myPokemon = data || [];
}
function nextFreeSlot() {
  const used = new Set((czState.myPokemon || []).filter((p) => p.party_slot != null).map((p) => p.party_slot));
  for (let i = 1; i <= 6; i++) if (!used.has(i)) return i;
  return null;
}
// "Partner od poczatku" — brak realnego systemu przyjazni w danych, wiec jako
// wskaznik przywiazania uzywamy faktu, ze ten Pokemon to oryginalny starter (Krok 1 samouczka).
function bondBadge(p) { return p.caught_biome === 'tutorial' ? '<span class="cz-bond-badge" title="Partner od początku przygody">❤</span>' : ''; }
// Podglad ceny sprzedazy (klient) — dokladnie ta sama formula co rpc_sell_pokemon
// (serwer i tak liczy autorytatywnie na nowo). Rzadkosc = odwrotnosc base_catch_rate.
function estimateSellPrice(p) {
  const catchRate = (p.pokemon_species && p.pokemon_species.base_catch_rate) || 45;
  return Math.max(5, Math.floor(p.level * 1.5 + (255 - catchRate) * 0.15));
}
function hpBarHtml(p) {
  const pct = p.max_hp ? Math.max(0, Math.round((p.current_hp / p.max_hp) * 100)) : 100;
  const color = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--gold)' : 'var(--red)';
  return `<div class="cz-energy-bar-bg" style="height:9px"><div class="cz-energy-bar-fill" style="width:${pct}%;background:${color}"></div></div><div class="cz-mon-hp-label">${Math.max(0, p.current_hp)}/${p.max_hp} HP</div>`;
}
function renderTeam() {
  if (czState.myPokemon === null) return `${screenHeader('🐾 Drużyna i PC Box')}<div class="cz-loading">Ładowanie...</div>`;
  const anyDamaged = czState.myPokemon.some((p) => p.current_hp < p.max_hp);
  const healBtn = anyDamaged ? `<div class="cz-step-actions" style="justify-content:center;margin-bottom:10px"><button class="cz-btn cz-btn-primary" ${czState.busy ? 'disabled' : ''} onclick="healTeam()">💊 Ulecz drużynę (za darmo)</button></div>` : '';
  const rows = czState.myPokemon.map((p) => {
    const inParty = p.party_slot != null;
    const fainted = p.current_hp <= 0;
    const name = (p.pokemon_species && p.pokemon_species.name) || ('pokemon-' + p.species_id);
    const urls = spriteUrls(p.species_id, name);
    const price = estimateSellPrice(p);
    return `<div class="cz-gym-row"><div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
      <img class="cz-team-sprite" src="${urls.animated}" data-fallback="${urls.artwork}|${urls.sprite}" onerror="imgFallback(this)" alt="${escapeAttr(name)}"/>
      <div style="flex:1;min-width:0">
        <div>${escapeHtml(p.nickname || name)} Lv${p.level} ${bondBadge(p)}${fainted ? ' <span class="cz-mon-pick-fainted" style="margin:0">Zemdlony</span>' : ''}
        ${inParty ? `<span style="color:var(--green);font-size:11px">(Drużyna #${p.party_slot})</span>` : '<span style="color:var(--gray);font-size:11px">(PC Box)</span>'}</div>
        <div style="max-width:180px;margin-top:4px">${hpBarHtml(p)}</div>
      </div></div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:stretch">
        ${inParty ? `<button class="cz-btn" onclick="setPartySlot('${p.id}',null)">Do Boxa</button>` : `<button class="cz-btn cz-btn-primary" onclick="setPartySlot('${p.id}',${nextFreeSlot()})">Do Drużyny</button>`}
        <button class="cz-btn" ${czState.busy ? 'disabled' : ''} onclick="sellPokemon('${p.id}','${escapeAttr(p.nickname || name)}',${price})">💰 Sprzedaj (~${price})</button>
      </div>
    </div>`;
  }).join('') || '<div style="color:var(--gray);text-align:center;padding:16px">Brak Pokémonów</div>';
  return `${screenHeader('🐾 Drużyna i PC Box')}${czState.error ? `<div class="cz-error-box">⚠ ${escapeHtml(czState.error)}</div>` : ''}${healBtn}<div class="cz-gym-list">${rows}</div>`;
}
async function healTeam() {
  czState.busy = true; czState.error = null; render();
  try { await sbClient.rpc('rpc_heal_team'); await loadTeamAndBox(); }
  catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
}
// Sprzedaz jest nieodwracalna (kasuje wiersz user_pokemon) — potwierdzenie przez
// natywny confirm() zamiast budowac osobny ekran/modal dla jednej akcji.
async function sellPokemon(pokemonId, displayName, estimatedPrice) {
  if (czState.busy) return;
  if (!confirm(`Sprzedać ${displayName} za ~${estimatedPrice} Catch Coins? Tej operacji nie można cofnąć.`)) return;
  czState.busy = true; czState.error = null; render();
  try {
    const { data, error } = await sbClient.rpc('rpc_sell_pokemon', { p_pokemon_id: pokemonId });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (row) czState.profile.catch_coins = row.catch_coins;
    await loadTeamAndBox();
  } catch (e) { czState.error = friendlyError(e); }
  finally { czState.busy = false; render(); }
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
  const rows = czState.fullInventory.map((i) => `<div class="cz-inv-chip"><img class="cz-item-icon" src="${itemSpriteUrl(i.item_slug)}" alt=""/><div class="cz-inv-qty">${i.quantity}×</div><div class="cz-inv-label">${escapeHtml((i.item_catalog && i.item_catalog.name) || i.item_slug)}</div></div>`).join('');
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
