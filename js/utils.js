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
  applyIVSliderStyle(rangeEl, val);
  /* Aktualizuj wyświetlaną wartość */
  var valSpan = document.getElementById('iv-val-' + sn);
  if (valSpan) valSpan.textContent = val;
  /* Aktualizuj pasek i etykietę */
  var bar = document.getElementById('ivbar-' + sn);
  var lbl = document.getElementById('ivlabel-' + sn);
  if (bar) {
    var pct = Math.round(val / 31 * 100);
    var color = val>=31?'#00f2ff':val>=20?'#39ff14':val>=10?'#ffaa00':'#ff003c';
    bar.style.width = pct + '%'; bar.style.background = color;
  }
  if (lbl) {
    if(val>=31) lbl.innerHTML='<span style="color:#00f2ff">Doskona\u0142e</span>';
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
    applyIVSliderStyle(r, parseInt(r.value) || 0);
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
