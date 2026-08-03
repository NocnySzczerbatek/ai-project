/* ================================================================
   utils.js — Funkcje pomocnicze UI
   ================================================================ */

/* ── Pasek statusu ── */
function setStatus(text, loading) {
  document.getElementById('status-text').textContent = text;
  document.getElementById('spinner').classList.toggle('active', loading);
}

/* ── Przełączanie zakładek ataków ── */
function switchMovesTab(btn, panelId) {
  var section = btn.closest('.moves-section');
  section.querySelectorAll('.moves-tab').forEach(function(b){b.classList.remove('active');});
  section.querySelectorAll('.moves-panel').forEach(function(p){p.classList.remove('active');});
  btn.classList.add('active');
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ── Przełączanie zakładek buildów ── */
function switchBuildTab(btn, panelId) {
  var section = btn.closest('.comp-section');
  section.querySelectorAll('.build-tab').forEach(function(b){b.classList.remove('active');});
  section.querySelectorAll('.build-panel').forEach(function(p){p.classList.remove('active');});
  btn.classList.add('active');
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  // Dynamic header — update section title to match active tab
  var label = btn.getAttribute('data-build-label');
  if (label) {
    var h2 = section.querySelector('h2');
    if (h2) h2.innerHTML = '\uD83C\uDFC6 ' + t('sec.comp') + ' \u2014 ' + label;
  }
  // Update IV recommendations for the selected build type
  var buildType = btn.getAttribute('data-build-type');
  if (buildType && window._detailStatMap) {
    updateIVSectionForBuild(buildType);
  }
}

/* ── Dynamiczna aktualizacja sekcji IV po zmianie buildu ── */
function updateIVSectionForBuild(buildType) {
  var statMap = window._detailStatMap;
  if (!statMap) return;
  var ivSection = document.querySelector('.iv-section');
  if (!ivSection) return;

  var atk   = statMap['attack'] || 0;
  var spatk = statMap['special-attack'] || 0;
  var def   = statMap['defense'] || 0;
  var spdef = statMap['special-defense'] || 0;
  var spe   = statMap['speed'] || 0;
  var isPhys = atk >= spatk + 15;
  var isFast = spe >= 80;
  var isTR   = spe <= 50;
  var isTank = (def + spdef) / 2 >= 90 && spe < 80;

  var ORDER = ['hp','attack','defense','special-attack','special-defense','speed'];
  var targets = {};

  if (buildType === 'defensive') {
    var physWall = def >= spdef;
    targets['hp']              = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Key for survival':'Kluczowe dla przetrwania'};
    targets['defense']         = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Defensive priority':'Priorytet obronny'};
    targets['special-defense'] = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Defensive priority':'Priorytet obronny'};
    targets['attack']          = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Minimize Foul Play':'Minimalizacja Foul Play'};
    targets['special-attack']  = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Not used offensively':'Nie u\u017cywasz ofensywnie'};
    targets['speed']           = {val:'\u226520',color:'#f8d030', prio:false, note: currentLang==='en'?'Secondary for wall':'Drugorz\u0119dne dla walla'};

  } else if (buildType === 'support') {
    targets['hp']              = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Always useful':'Zawsze przydatne'};
    targets['defense']         = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Bulk for utility':'Wytrzyma\u0142o\u015b\u0107 dru\u017cynowa'};
    targets['special-defense'] = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Bulk for utility':'Wytrzyma\u0142o\u015b\u0107 dru\u017cynowa'};
    targets['attack']          = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Not used':'Nie u\u017cywasz'};
    targets['special-attack']  = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Not used':'Nie u\u017cywasz'};
    targets['speed']           = {val:'\u226520',color:'#f8d030', prio:false, note: currentLang==='en'?'Secondary':'Drugorz\u0119dne'};

  } else if (buildType === 'physical') {
    targets['hp']              = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Always useful':'Zawsze przydatne'};
    targets['attack']          = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Main damage source':'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'};
    targets['defense']         = isTank ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Worth maxing':'Warto maksowa\u0107'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
    targets['special-attack']  = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Not used':'Nie u\u017cywasz'};
    targets['special-defense'] = isTank ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Worth maxing':'Warto maksowa\u0107'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
    targets['speed']           = isTR ? {val:'0',color:'#aaa',prio:false,note:'Trick Room'} : isFast ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Key':'Kluczowe'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Pomocne'};

  } else if (buildType === 'special') {
    targets['hp']              = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Always useful':'Zawsze przydatne'};
    targets['attack']          = {val:'0',       color:'#888',    prio:false, note: currentLang==='en'?'Minimize Foul Play/Confusion':'Minimalizacja Foul Play/Confusion'};
    targets['defense']         = isTank ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Worth maxing':'Warto maksowa\u0107'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
    targets['special-attack']  = {val:'31',      color:'#55ff55', prio:true,  note: currentLang==='en'?'Main damage source':'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'};
    targets['special-defense'] = isTank ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Worth maxing':'Warto maksowa\u0107'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
    targets['speed']           = isTR ? {val:'0',color:'#aaa',prio:false,note:'Trick Room'} : isFast ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Key':'Kluczowe'} : {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Pomocne'};

  } else if (buildType === 'mixed') {
    targets['hp']              = {val:'31',      color:'#55ff55', prio:true, note: currentLang==='en'?'Always useful':'Zawsze przydatne'};
    targets['attack']          = {val:'31',      color:'#55ff55', prio:true, note: currentLang==='en'?'Physical coverage':'Fizyczne pokrycie'};
    targets['defense']         = {val:'\u226520',color:'#f8d030', prio:false,note: currentLang==='en'?'Helpful':'Przydatne'};
    targets['special-attack']  = {val:'31',      color:'#55ff55', prio:true, note: currentLang==='en'?'Special coverage':'Specjalne pokrycie'};
    targets['special-defense'] = {val:'\u226520',color:'#f8d030', prio:false,note: currentLang==='en'?'Helpful':'Przydatne'};
    targets['speed']           = {val:'31',      color:'#55ff55', prio:true, note: currentLang==='en'?'Key':'Kluczowe'};

  } else { // niche
    if (isTR) {
      targets['hp']              = {val:'31', color:'#55ff55', prio:true,  note: currentLang==='en'?'Bulk for Trick Room':'Wytrzyma\u0142o\u015b\u0107 pod TR'};
      targets['attack']          = isPhys ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Max power under TR':'Maks moc pod TR'} : {val:'0',color:'#888',prio:false,note:currentLang==='en'?'Not used':'Nie u\u017cywasz'};
      targets['defense']         = {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
      targets['special-attack']  = !isPhys ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Max power under TR':'Maks moc pod TR'} : {val:'0',color:'#888',prio:false,note:currentLang==='en'?'Not used':'Nie u\u017cywasz'};
      targets['special-defense'] = {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
      targets['speed']           = {val:'0', color:'#aaa', prio:false, note: currentLang==='en'?'Trick Room — min speed':'Trick Room \u2014 min szybko\u015b\u0107'};
    } else {
      targets['hp']              = {val:'31',      color:'#55ff55', prio:true, note: currentLang==='en'?'Always useful':'Zawsze przydatne'};
      targets['attack']          = isPhys ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Main damage source':'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'} : {val:'0',color:'#888',prio:false,note:currentLang==='en'?'Not used':'Nie u\u017cywasz'};
      targets['defense']         = {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
      targets['special-attack']  = !isPhys ? {val:'31',color:'#55ff55',prio:true,note:currentLang==='en'?'Main damage source':'G\u0142\u00f3wne \u017ar\u00f3d\u0142o obra\u017ce\u0144'} : {val:'0',color:'#888',prio:false,note:currentLang==='en'?'Not used':'Nie u\u017cywasz'};
      targets['special-defense'] = {val:'\u226520',color:'#f8d030',prio:false,note:currentLang==='en'?'Helpful':'Przydatne'};
      targets['speed']           = {val:'31',      color:'#55ff55',prio:true, note: currentLang==='en'?'Max speed':'Maks szybko\u015b\u0107'};
    }
  }

  // Update each IV row in the DOM
  ORDER.forEach(function(sn) {
    var tgt = targets[sn];
    if (!tgt) return;
    var row = document.getElementById('iv-row-' + sn);
    if (!row) return;

    row.setAttribute('data-target-val', tgt.val);
    row.classList.toggle('iv-row-priority', !!tgt.prio);

    var prioIcon = row.querySelector('.iv-priority');
    if (prioIcon) prioIcon.textContent = tgt.prio ? '\u2b50' : '\u25aa';

    var targetSpan = row.querySelector('.iv-target');
    if (targetSpan) {
      targetSpan.style.color = tgt.color;
      targetSpan.textContent = 'CEL: ' + tgt.val;
      targetSpan.title = tgt.note;
    }

    var slider = row.querySelector('input[type="range"]');
    if (slider) {
      var newVal = tgt.val === '0' ? 0 : 31;
      slider.value = newVal;
      syncIVSlider(slider);
    }
  });

  // Update summary line
  var summaryDiv = ivSection.querySelector('.iv-summary');
  if (summaryDiv) {
    var must31 = ORDER.filter(function(sn){ return targets[sn] && targets[sn].val === '31'; }).map(function(sn){
      return '<span style="color:'+(STAT_COLORS[sn]||'#fff')+'">'+(STAT_NAMES[sn]||sn)+'</span>';
    });
    var must0 = ORDER.filter(function(sn){ return targets[sn] && targets[sn].val === '0'; }).map(function(sn){
      return '<span style="color:#888">'+(STAT_NAMES[sn]||sn)+'</span>';
    });
    var line = (currentLang==='en'?'Target <b style="color:#55ff55">31</b>: ':'Celuj w <b style="color:#55ff55">31</b>: ') + (must31.length ? must31.join(', ') : '\u2014');
    if (must0.length) line += '<br>'+(currentLang==='en'?'Leave at <b style="color:#888">0</b>: ':'Zostaw na <b style="color:#888">0</b>: ') + must0.join(', ');
    summaryDiv.innerHTML = line;
  }

  // Update role badge
  var roleBadge = ivSection.querySelector('.iv-role-badge');
  if (roleBadge) {
    var roleLabels = {
      physical:  currentLang==='en'?'\u2694 Physical Attacker':'\u2694 Fizyczny Atakuj\u0105cy',
      special:   currentLang==='en'?'\u2728 Special Attacker':'\u2728 Specjalny Atakuj\u0105cy',
      defensive: currentLang==='en'?'\ud83d\udee1 Defensive':'\ud83d\udee1 Defensywny',
      mixed:     currentLang==='en'?'\u2694\u2728 Mixed':'\u2694\u2728 Mieszany',
      support:   currentLang==='en'?'\ud83d\udc9a Support':'\ud83d\udc9a Wsparcie',
      niche:     currentLang==='en'?'\ud83c\udfaf Niche':'\ud83c\udfaf Niszowy'
    };
    roleBadge.textContent = (currentLang==='en'?'Role: ':'Rola: ') + (roleLabels[buildType] || buildType);
  }

  window._detailBuildType = buildType;
}

/* ── Hamburger menu mobilne ── */
function toggleHamburger() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('active');
}

/* ── Kopiowanie linku do buildu ── */
function copyBuildLink() {
  var url = window.location.origin + window.location.pathname + (selectedId ? '#pokemon-'+selectedId : '');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function(){
      var btn = document.getElementById('copy-link-btn');
      if(btn){btn.textContent='\u2705 Skopiowano!';setTimeout(function(){btn.textContent='\ud83d\udd17 Kopiuj Link do Buildu';},2000);}
    }).catch(function(){
      cobFallbackCopy(url);
    });
  } else {
    cobFallbackCopy(url);
  }
}

function cobFallbackCopy(url) {
  try {
    var ta = document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
    var btn = document.getElementById('copy-link-btn');
    if(btn){btn.textContent='\u2705 Skopiowano!';setTimeout(function(){btn.textContent='\ud83d\udd17 Kopiuj Link do Buildu';},2000);}
  } catch(e) {}
}

/* ── Kolory i style suwaków IV — Heatmap RPG ── */
function getIVSliderColor(val) {
  if (val >= 31) return '#00f2ff';
  if (val >= 20) return '#39ff14';
  if (val >= 10) return '#ffaa00';
  return '#ff003c';
}

function getIVTierClass(val) {
  if (val >= 31) return 'iv-perfect';
  if (val >= 20) return 'iv-good';
  if (val >= 10) return 'iv-average';
  return 'iv-poor';
}

function getIVGlow(color) {
  switch (color) {
    case '#00f2ff': return '0 0 12px rgba(0,242,255,0.9), 0 0 28px rgba(0,242,255,0.5), 0 0 48px rgba(0,242,255,0.2)';
    case '#39ff14': return '0 0 10px rgba(57,255,20,0.8), 0 0 24px rgba(57,255,20,0.4)';
    case '#ffaa00': return '0 0 10px rgba(255,170,0,0.8), 0 0 24px rgba(255,170,0,0.4)';
    case '#ff003c': return '0 0 10px rgba(255,0,60,0.8), 0 0 24px rgba(255,0,60,0.4)';
    default:       return '0 0 12px rgba(0,242,255,0.9), 0 0 28px rgba(0,242,255,0.5)';
  }
}

function applyIVSliderStyle(rangeEl, val) {
  var color = getIVSliderColor(val);
  var tierClass = getIVTierClass(val);
  var glow = getIVGlow(color);
  var pct = Math.round(val / 31 * 100);

  /* Ustaw CSS custom properties na inpucie */
  rangeEl.style.setProperty('--iv-thumb', color);
  rangeEl.style.setProperty('--iv-track', color);
  rangeEl.style.setProperty('--iv-pct', pct + '%');
  rangeEl.style.setProperty('--iv-glow', glow);

  /* Ustaw gradient BEZPOŚREDNIO na inpucie — wymusza repaint pseudo-elementów w WebKit */
  var gradient = 'linear-gradient(to right, ' + color + ' 0%, ' + color + ' ' + pct + '%, rgba(0,0,0,0.6) ' + pct + '%, rgba(0,0,0,0.6) 100%)';
  rangeEl.style.background = gradient;

  /* Propaguj zmienne na rodzica */
  var parent = rangeEl.closest('.iv-slider-row, .calc-slider-row');
  if (parent) {
    parent.style.setProperty('--iv-thumb', color);
    parent.style.setProperty('--iv-track', color);
    parent.style.setProperty('--iv-pct', pct + '%');
    parent.style.setProperty('--iv-glow', glow);
  }

  /* Aktualizuj klasę wiersza IV — usuń starą, dodaj nową */
  var row = rangeEl.closest('.iv-row, .calc-box, .battle-iv-box');
  if (row) {
    row.classList.remove('iv-perfect', 'iv-good', 'iv-average', 'iv-poor');
    row.classList.add(tierClass);
  }

  /* Aktualizuj kolor wartości liczbowej */
  var valSpan = parent ? parent.querySelector('.iv-val') : null;
  if (valSpan) {
    valSpan.style.color = color;
  }
}

function syncIVSlider(rangeEl) {
  var val = parseInt(rangeEl.value);
  if (isNaN(val)) val = 0;
  if (val < 0) val = 0; if (val > 31) val = 31;
  var sn = rangeEl.dataset.stat;

  // Check if this stat's target is 0 — if so, value 0 = perfect (green)
  var row = rangeEl.closest('.iv-row');
  var targetVal = row ? row.getAttribute('data-target-val') : null;
  var isTargetZero = targetVal === '0';

  if (isTargetZero && val === 0) {
    // Override: value 0 is perfect for this stat
    applyIVSliderStyle(rangeEl, 31); // apply perfect styling
    rangeEl.style.background = 'linear-gradient(to right, #00f2ff 0%, #00f2ff 1%, rgba(0,0,0,0.6) 1%, rgba(0,0,0,0.6) 100%)';
  } else {
    applyIVSliderStyle(rangeEl, val);
  }

  /* Aktualizuj wyświetlaną wartość */
  var valSpan = document.getElementById('iv-val-' + sn);
  if (valSpan) {
    valSpan.textContent = val;
    if (isTargetZero && val === 0) valSpan.style.color = '#00f2ff';
  }
  /* Aktualizuj pasek i etykietę */
  var bar = document.getElementById('ivbar-' + sn);
  var lbl = document.getElementById('ivlabel-' + sn);
  if (bar) {
    var pct = Math.round(val / 31 * 100);
    var color = val>=31?'#00f2ff':val>=20?'#39ff14':val>=10?'#ffaa00':'#ff003c';
    if (isTargetZero && val === 0) { color = '#00f2ff'; pct = 100; }
    bar.style.width = pct + '%'; bar.style.background = color;
  }
  if (lbl) {
    if (isTargetZero && val === 0) lbl.innerHTML='<span style="color:#00f2ff">Doskona\u0142e</span>';
    else if(val>=31) lbl.innerHTML='<span style="color:#00f2ff">Doskona\u0142e</span>';
    else if(val>=20) lbl.innerHTML='<span style="color:#39ff14">Dobre</span>';
    else if(val>=10) lbl.innerHTML='<span style="color:#ffaa00">\u015arednie</span>';
    else lbl.innerHTML='<span style="color:#ff003c">S\u0142abe</span>';
  }
}

function syncCalcIVSlider(rangeEl, sn) {
  var val = parseInt(rangeEl.value);
  if (isNaN(val)) val = 0;
  if (val < 0) val = 0; if (val > 31) val = 31;
  applyIVSliderStyle(rangeEl, val);
  var valSpan = document.getElementById('calc-iv-val-' + sn);
  if (valSpan) valSpan.textContent = val;
  if (typeof updateCalcSliderTier === 'function') updateCalcSliderTier(rangeEl, sn);
}

function syncBattleIVSlider(rangeEl, side, sn) {
  var val = parseInt(rangeEl.value);
  if (isNaN(val)) val = 0;
  if (val < 0) val = 0; if (val > 31) val = 31;
  applyIVSliderStyle(rangeEl, val);
  var valSpan = rangeEl.parentNode.querySelector('.iv-val');
  if (valSpan) valSpan.textContent = val;
  battleUpdateFromInputs(side);
}

function initAllIVSliders() {
  document.querySelectorAll('.iv-slider-row input[type="range"], .calc-slider-row input[type="range"]').forEach(function(r) {
    // For IV section sliders inside .iv-row with data-target-val, use syncIVSlider
    // which correctly handles target=0 styling
    var ivRow = r.closest('.iv-row');
    if (ivRow) {
      syncIVSlider(r);
    } else {
      applyIVSliderStyle(r, parseInt(r.value) || 0);
    }
  });
}

function updateIVBar(sn, val) {
  if (typeof val === 'undefined') return;
  if (val < 0) val = 0; if (val > 31) val = 31;
  var pct = Math.round(val / 31 * 100);
  var bar = document.getElementById('ivbar-' + sn);
  var lbl = document.getElementById('ivlabel-' + sn);
  if (!bar || !lbl) return;
  var color = val>=28?'#00ff99':val>=20?'#ffcc00':val>=10?'#ff8800':'#ff4444';
  bar.style.width = pct + '%'; bar.style.background = color;
  if(val>=28) lbl.innerHTML='<span style="color:#00ff99">Doskona\u0142e</span>';
  else if(val>=20) lbl.innerHTML='<span style="color:#ffcc00">Dobre</span>';
  else if(val>=10) lbl.innerHTML='<span style="color:#ff8800">\u015arednie</span>';
  else lbl.innerHTML='<span style="color:#ff4444">S\u0142abe</span>';
}
