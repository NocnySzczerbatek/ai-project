/* ================================================================
   calculator.js — Ocena Pokémona (kalkulator IV/Natura)
   ================================================================ */

/* ── Dynamiczna klasa CSS dla wiersza statystyki ── */
function updateCalcSliderTier(rangeEl, sn) {
  var val = parseInt(rangeEl.value) || 0;
  if (val < 0) val = 0; if (val > 31) val = 31;
  var tierClass = getIVTierClass(val);
  var color = getIVSliderColor(val);
  var row = rangeEl.closest('.calc-box');
  if (row) {
    row.classList.remove('iv-perfect', 'iv-good', 'iv-average', 'iv-poor');
    row.classList.add(tierClass);
  }
  var valSpan = document.getElementById('calc-iv-val-' + sn);
  if (valSpan) {
    valSpan.style.color = color;
  }
}

function evaluatePokemon() {
  if (!lastBuildData) return;
  var buildType = document.getElementById('calc-build-type').value;
  var ORDER = ['hp','attack','defense','special-attack','special-defense','speed'];
  var ivs = {};
  ORDER.forEach(function(sn) {
    var el = document.getElementById('calc-iv-'+sn);
    ivs[sn] = el ? parseInt(el.value)||0 : 31;
  });
  var nature = document.getElementById('calc-nature').value;

  // Define ideal IVs per build type
  var idealIVs = {};
  if (buildType === 'physical') {
    idealIVs = {hp:31, attack:31, defense:20, 'special-attack':0, 'special-defense':20, speed:31};
  } else if (buildType === 'special') {
    idealIVs = {hp:31, attack:0, defense:20, 'special-attack':31, 'special-defense':20, speed:31};
  } else if (buildType === 'mixed') {
    idealIVs = {hp:31, attack:31, defense:20, 'special-attack':31, 'special-defense':20, speed:31};
  } else if (buildType === 'support') {
    idealIVs = {hp:31, attack:0, defense:31, 'special-attack':0, 'special-defense':31, speed:20};
  } else if (buildType === 'niche') {
    idealIVs = {hp:31, attack:31, defense:20, 'special-attack':31, 'special-defense':20, speed:31};
  } else {
    idealIVs = {hp:31, attack:0, defense:31, 'special-attack':0, 'special-defense':31, speed:20};
  }

  // Define ideal natures
  var idealNatures = {
    physical: ['Adamant','Jolly'],
    special: ['Modest','Timid'],
    defensive: ['Bold','Calm','Impish','Careful'],
    mixed: ['Naive','Hasty','Lonely','Mild'],
    support: ['Bold','Calm','Impish','Careful'],
    niche: ['Brave','Quiet','Jolly','Timid','Adamant','Modest']
  };

  // Define key stats per build
  var keyStats = {
    physical: ['attack','speed'],
    special: ['special-attack','speed'],
    defensive: ['hp','defense','special-defense'],
    mixed: ['attack','special-attack','speed'],
    support: ['hp','defense','special-defense'],
    niche: ['attack','special-attack','speed']
  };

  // Score calculation
  var totalScore = 0, maxScore = 0;
  var keys = keyStats[buildType] || [];
  ORDER.forEach(function(sn) {
    var weight = keys.includes(sn) ? 3 : 1;
    var ideal = idealIVs[sn];
    var actual = Math.min(31, Math.max(0, ivs[sn]));
    var diff;
    if (ideal === 0) {
      diff = 31 - actual; // lower is better
    } else {
      diff = actual; // higher is better, just use the value relative to ideal
      if (ideal < 31) diff = Math.min(actual, ideal); // cap at ideal
    }
    var statScore;
    if (ideal === 0) {
      statScore = actual <= 5 ? 1 : actual <= 15 ? 0.6 : 0.2;
    } else {
      statScore = actual >= ideal ? 1 : actual / ideal;
    }
    totalScore += statScore * weight;
    maxScore += weight;
  });

  // Nature bonus
  var isIdealNature = idealNatures[buildType] && idealNatures[buildType].includes(nature);
  if (isIdealNature) totalScore += 2;
  maxScore += 2;

  var pct = totalScore / maxScore;
  var verdict, emoji, color;
  if (pct >= 0.9) { verdict = currentLang==='en'?'Perfect!':'Idealny!'; emoji = '\ud83d\udfe2'; color = '#55ff55'; }
  else if (pct >= 0.7) { verdict = currentLang==='en'?'Good':'Dobry'; emoji = '\ud83d\udfe1'; color = '#f8d030'; }
  else if (pct >= 0.5) { verdict = currentLang==='en'?'Average':'\u015aredni'; emoji = '\ud83d\udfe0'; color = '#f08030'; }
  else { verdict = currentLang==='en'?'Keep looking':'Szukaj dalej'; emoji = '\ud83d\udd34'; color = '#ff5555'; }

  var idealList = idealNatures[buildType].map(function(n){ return natureName(n); }).join(' / ');
  var natureStatus = isIdealNature
    ? '<span style="color:#55ff55">\u2705 '+(currentLang==='en'?'Ideal nature!':'Idealna natura!')+'</span>'
    : '<span style="color:#f08030">\u26a0 '+(currentLang==='en'?'Non-optimal nature (recommended: ':'Nieoptymalna natura (zalecane: ')+idealList+')</span>';
  var pctStr = Math.round(pct * 100);
  var matchLabel = currentLang==='en'?'Build match:':'Zgodno\u015b\u0107 z buildem:';

  document.getElementById('calc-verdict').innerHTML =
    '<span class="verdict-emoji">'+emoji+'</span>'
    +'<div style="font-size:28px;color:'+color+';font-family:\'Press Start 2P\',monospace">'+verdict+'</div>'
    +'<div style="font-size:18px;color:#aaa;margin-top:8px">'+matchLabel+' <span style="color:'+color+'">'+pctStr+'%</span></div>'
    +'<div style="font-size:16px;margin-top:6px">'+natureStatus+'</div>';
}
