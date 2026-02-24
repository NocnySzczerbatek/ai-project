/* ================================================================
   weakness.js — Kalkulator słabości typów
   ================================================================ */
/* Weakness Checker state */
var wcType1 = '';
var wcType2 = '';

function renderWeaknessChecker(){
  var html = '<div class="wc-wrap">';
  html += '<div class="wc-intro">'+t('tc.intro')+'</div>';
  // Selector panel
  html += '<div class="wc-selector-panel">';
  html += '<div class="wc-selector-row">';
  // Type 1
  html += '<div class="wc-selector-col"><label>'+t('tc.type1')+'</label><div class="wc-type-grid" id="wc-grid1">';
  ALL_TYPES.forEach(function(tp){
    html += '<span class="wc-type-btn type-badge type-'+tp+'" data-type="'+tp+'" onclick="wcSelectType(1,\''+tp+'\')">'+typeName(tp)+'</span>';
  });
  html += '</div></div>';
  // Type 2
  html += '<div class="wc-selector-col"><label>'+t('tc.type2')+'</label><div class="wc-type-grid" id="wc-grid2">';
  html += '<span class="wc-type-btn wc-none-btn" data-type="" onclick="wcSelectType(2,\'\')">'+t('tc.none')+'</span>';
  ALL_TYPES.forEach(function(tp){
    html += '<span class="wc-type-btn type-badge type-'+tp+'" data-type="'+tp+'" onclick="wcSelectType(2,\''+tp+'\')">'+typeName(tp)+'</span>';
  });
  html += '</div></div>';
  html += '</div>'; // selector-row
  // Selected display
  html += '<div class="wc-selected-display" id="wc-display"></div>';
  html += '</div>'; // selector-panel
  // Results area
  html += '<div id="wc-results"><div class="wc-empty-state">'+t('tc.emptyState')+'</div></div>';
  html += '</div>'; // wc-wrap
  return html;
}

function wcSelectType(slot, tp){
  if(slot === 1) {
    wcType1 = tp;
    // highlight
    var g1 = document.getElementById('wc-grid1');
    if(g1){
      g1.querySelectorAll('.wc-type-btn').forEach(function(b){ b.classList.remove('wc-selected'); });
      if(tp) { var sel=g1.querySelector('[data-type="'+tp+'"]'); if(sel) sel.classList.add('wc-selected'); }
    }
  } else {
    wcType2 = tp;
    var g2 = document.getElementById('wc-grid2');
    if(g2){
      g2.querySelectorAll('.wc-type-btn').forEach(function(b){ b.classList.remove('wc-selected'); });
      var sel2=g2.querySelector('[data-type="'+tp+'"]'); if(sel2) sel2.classList.add('wc-selected');
    }
  }
  wcUpdateDisplay();
  wcCalc();
}

function wcUpdateDisplay(){
  var el = document.getElementById('wc-display');
  if(!el) return;
  if(!wcType1) { el.innerHTML = '<span style="color:#555">'+t('tc.pickType')+'</span>'; return; }
  var html = t('tc.analyzing')+' <span class="type-badge type-'+wcType1+'">'+typeName(wcType1)+'</span>';
  if(wcType2 && wcType2 !== wcType1) html += ' / <span class="type-badge type-'+wcType2+'">'+typeName(wcType2)+'</span>';
  el.innerHTML = html;
}

function wcCalc(){
  var out = document.getElementById('wc-results');
  if(!out) return;
  if(!wcType1){ out.innerHTML = '<div class="wc-empty-state">'+t('tc.emptyState')+'</div>'; return; }
  var x4=[],x2=[],half=[],quarter=[],zero=[],neutral=[];
  ALL_TYPES.forEach(function(atk){
    var m = 1;
    if(TYPE_EFF[wcType1]){
      if(TYPE_EFF[wcType1].immune.indexOf(atk)!==-1) m*=0;
      else if(TYPE_EFF[wcType1].weak.indexOf(atk)!==-1) m*=2;
      else if(TYPE_EFF[wcType1].resist.indexOf(atk)!==-1) m*=0.5;
    }
    if(wcType2 && wcType2!==wcType1 && TYPE_EFF[wcType2]){
      if(TYPE_EFF[wcType2].immune.indexOf(atk)!==-1) m*=0;
      else if(TYPE_EFF[wcType2].weak.indexOf(atk)!==-1) m*=2;
      else if(TYPE_EFF[wcType2].resist.indexOf(atk)!==-1) m*=0.5;
    }
    var badge='<span class="type-badge type-'+atk+'">'+typeName(atk)+'</span>';
    if(m===0) zero.push(badge);
    else if(m>=4) x4.push(badge);
    else if(m>=2) x2.push(badge);
    else if(m<=0.25) quarter.push(badge);
    else if(m<=0.5) half.push(badge);
    else neutral.push(badge);
  });
  var html = '';
  // Critical x4 banner
  if(x4.length){
    html += '<div class="wc-critical"><h4>'+t('tc.critical')+'</h4><div class="wc-badge-row">';
    x4.forEach(function(b){ html += b; });
    html += '</div></div>';
  }
  // Threats section (x2)
  if(x2.length){
    html += '<div class="wc-section wc-threats"><h4>'+t('tc.threats')+' <span style="font-family:VT323,monospace;font-size:14px">(\u00d72)</span></h4>';
    html += '<div class="wc-badge-row">';
    x2.forEach(function(b){ html += b; });
    html += '</div></div>';
  }
  // Resistances section
  if(half.length || quarter.length){
    html += '<div class="wc-section wc-resists"><h4>'+t('tc.resists')+'</h4>';
    if(half.length){
      html += '<div class="wc-badge-row" style="margin-bottom:8px"><span class="wc-mult-label wc-mult-half">'+t('tc.resHalf')+'</span> ';
      half.forEach(function(b){ html += b; });
      html += '</div>';
    }
    if(quarter.length){
      html += '<div class="wc-badge-row"><span class="wc-mult-label wc-mult-quarter">'+t('tc.resQuarter')+'</span> ';
      quarter.forEach(function(b){ html += b; });
      html += '</div>';
    }
    html += '</div>';
  }
  // Immunity section
  if(zero.length){
    html += '<div class="wc-section wc-immune"><h4>'+t('tc.immune')+'</h4>';
    html += '<div class="wc-badge-row">';
    zero.forEach(function(b){ html += b; });
    html += '</div></div>';
  }
  // Neutral
  if(neutral.length){
    html += '<div class="wc-section" style="border-color:#1a1a2a"><h4 style="color:#666">'+t('tc.neutral')+'</h4>';
    html += '<div class="wc-badge-row wc-neutral-row">';
    neutral.forEach(function(b){ html += b; });
    html += '</div></div>';
  }
  out.innerHTML = '<div class="wc-results">'+html+'</div>';
}
