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

/* ── Kolory i style suwaków IV ── */
function getIVSliderColor(val) {
  if (val >= 31) return '#55ffff';
  if (val >= 26) return '#88ff88';
  if (val >= 16) return '#f8d030';
  return '#ff5555';
}

function applyIVSliderStyle(rangeEl, val) {
  var color = getIVSliderColor(val);
  var pct = Math.round(val / 31 * 100);
  rangeEl.style.setProperty('--iv-thumb', color);
  rangeEl.style.setProperty('--iv-track', color);
  rangeEl.style.setProperty('--iv-pct', pct + '%');
  var parent = rangeEl.closest('.iv-slider-row, .calc-slider-row');
  if (parent) {
    parent.style.setProperty('--iv-thumb', color);
    parent.style.setProperty('--iv-track', color);
    parent.style.setProperty('--iv-pct', pct + '%');
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
    var color = val>=28?'#55ff55':val>=20?'#f8d030':val>=10?'#f08030':'#ff5555';
    bar.style.width = pct + '%'; bar.style.background = color;
  }
  if (lbl) {
    if(val>=28) lbl.innerHTML='<span style="color:#55ff55">Doskona\u0142e</span>';
    else if(val>=20) lbl.innerHTML='<span style="color:#f8d030">Dobre</span>';
    else if(val>=10) lbl.innerHTML='<span style="color:#f08030">S\u0142abe</span>';
    else lbl.innerHTML='<span style="color:#ff5555">Z\u0142e</span>';
  }
}

function syncCalcIVSlider(rangeEl, sn) {
  var val = parseInt(rangeEl.value);
  if (isNaN(val)) val = 0;
  if (val < 0) val = 0; if (val > 31) val = 31;
  applyIVSliderStyle(rangeEl, val);
  var valSpan = document.getElementById('calc-iv-val-' + sn);
  if (valSpan) valSpan.textContent = val;
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
  var color = val>=28?'#55ff55':val>=20?'#f8d030':val>=10?'#f08030':'#ff5555';
  bar.style.width = pct + '%'; bar.style.background = color;
  if(val>=28) lbl.innerHTML='<span style="color:#55ff55">Doskona\u0142e</span>';
  else if(val>=20) lbl.innerHTML='<span style="color:#f8d030">Dobre</span>';
  else if(val>=10) lbl.innerHTML='<span style="color:#f08030">S\u0142abe</span>';
  else lbl.innerHTML='<span style="color:#ff5555">Z\u0142e</span>';
}
