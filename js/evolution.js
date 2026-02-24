/* ================================================================
   evolution.js — Renderowanie łańcucha ewolucji
   ================================================================ */

function renderEvoChain(chain) {
  var html = '';
  function buildTriggerText(det, fromName, toName) {
    var parts = [];
    // Check Cobblemon override first
    var key = fromName.toLowerCase() + '>' + toName.toLowerCase();
    var cob = COBBLEMON_EVO_EXTRA[key];
    if (cob) {
      return '<span class="evo-cond-cobblemon">' + cob[currentLang] + '</span>';
    }
    if (!det) return '';
    // Level
    if (det.min_level) {
      parts.push(t('evo.level') + ' ' + det.min_level);
    }
    // Friendship
    if (det.min_happiness) {
      parts.push('\u2665 ' + t('evo.friendship'));
    }
    // Trigger type
    if (det.trigger) {
      if (det.trigger.name === 'trade') {
        parts.push(t('evo.trade'));
      } else if (det.trigger.name === 'use-item' && det.item) {
        var stoneEN = det.item.name.replace(/-/g, ' ');
        var stonePL = itemName(stoneEN.split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' '));
        parts.push(t('evo.stone') + ' ' + (currentLang==='pl' ? stonePL : stoneEN));
      }
    }
    // Held item
    if (det.held_item) {
      var heldEN = det.held_item.name.replace(/-/g, ' ');
      var heldPL = itemName(heldEN.split(' ').map(function(w){return w.charAt(0).toUpperCase()+w.slice(1);}).join(' '));
      parts.push(t('evo.held') + ' ' + (currentLang==='pl' ? heldPL : heldEN));
    }
    // Time of day
    if (det.time_of_day === 'day') {
      parts.push('+ ' + t('evo.day'));
    } else if (det.time_of_day === 'night') {
      parts.push('+ ' + t('evo.night'));
    }
    // Rain
    if (det.needs_overworld_rain) {
      parts.push('+ ' + t('evo.rain'));
    }
    // Gender
    if (det.gender === 1) {
      parts.push(t('evo.female'));
    } else if (det.gender === 2) {
      parts.push(t('evo.male'));
    }
    // Known move
    if (det.known_move) {
      parts.push(t('evo.move') + ' ' + det.known_move.name.replace(/-/g,' '));
    }
    // Known move type
    if (det.known_move_type) {
      parts.push(t('evo.moveType') + ' ' + typeName(det.known_move_type.name));
    }
    // Relative physical stats (Tyrogue)
    if (det.relative_physical_stats === 1) parts.push(t('evo.atkGtDef'));
    else if (det.relative_physical_stats === -1) parts.push(t('evo.defGtAtk'));
    else if (det.relative_physical_stats === 0) parts.push(t('evo.atkEqDef'));
    // Beauty (Feebas)
    if (det.min_beauty) {
      parts.push('Beauty \u2265 ' + det.min_beauty);
    }
    if (parts.length === 0 && det.trigger) {
      // Fallback
      if (det.trigger.name === 'level-up') parts.push(t('evo.level') + ' ?');
      else parts.push(det.trigger.name.replace(/-/g,' '));
    }
    return parts.map(function(p, i){
      return '<span class="' + (i===0?'evo-cond':'evo-cond-special') + '">' + p + '</span>';
    }).join('');
  }
  function walk(node, incomingTrigger) {
    var name = node.species.name;
    var id = node.species.url.split('/').filter(Boolean).pop();
    var condHTML = incomingTrigger ? '<div class="evo-condition">'+incomingTrigger+'</div>' : '';
    html += '<div class="evo-item" data-evo-name="'+name+'" title="'+(currentLang==='en'?'Click to view details':'Kliknij aby zobaczy\u0107 szczeg\u00f3\u0142y')+'">' +'<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/'+id+'.png" alt="'+name+'"/>' +'<span>'+name+'</span>'+condHTML+'</div>';
    if (node.evolves_to && node.evolves_to.length > 0) {
      node.evolves_to.forEach(function(next) {
        var det = next.evolution_details && next.evolution_details[0];
        var toName = next.species.name;
        var triggerHtml = buildTriggerText(det, name, toName);
        html += '<span class="evo-arrow">\u2192</span>';
        walk(next, triggerHtml);
      });
    }
  }
  walk(chain, '');
  return html;
}
