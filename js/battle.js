/* ================================================================
   battle.js — Symulator walki Pokémonów
   ================================================================ */

const NATURE_MODS = {
  'Hardy':{up:null,down:null},'Lonely':{up:'attack',down:'defense'},
  'Brave':{up:'attack',down:'speed'},'Adamant':{up:'attack',down:'special-attack'},
  'Naughty':{up:'attack',down:'special-defense'},'Bold':{up:'defense',down:'attack'},
  'Docile':{up:null,down:null},'Relaxed':{up:'defense',down:'speed'},
  'Impish':{up:'defense',down:'special-attack'},'Lax':{up:'defense',down:'special-defense'},
  'Timid':{up:'speed',down:'attack'},'Hasty':{up:'speed',down:'defense'},
  'Serious':{up:null,down:null},'Jolly':{up:'speed',down:'special-attack'},
  'Naive':{up:'speed',down:'special-defense'},'Modest':{up:'special-attack',down:'attack'},
  'Mild':{up:'special-attack',down:'defense'},'Quiet':{up:'special-attack',down:'speed'},
  'Bashful':{up:null,down:null},'Rash':{up:'special-attack',down:'special-defense'},
  'Calm':{up:'special-defense',down:'attack'},'Gentle':{up:'special-defense',down:'defense'},
  'Sassy':{up:'special-defense',down:'speed'},'Careful':{up:'special-defense',down:'special-attack'},
  'Quirky':{up:null,down:null}
};
const ALL_NATURES = Object.keys(NATURE_MODS);
const BATTLE_LEVEL = 50;
const BATTLE_STAT_ORDER = ['hp','attack','defense','special-attack','special-defense','speed'];
let battleState = null;
let battleSetupData = { player: null, opponent: null };
let battleSearchTimeout = null;

function battleCalcStat(baseStat, iv, ev, statName, nature) {
  if (statName === 'hp') {
    return Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * BATTLE_LEVEL / 100)) + BATTLE_LEVEL + 10;
  }
  var raw = Math.floor(((2 * baseStat + iv + Math.floor(ev / 4)) * BATTLE_LEVEL / 100)) + 5;
  var mod = NATURE_MODS[nature];
  if (mod && mod.up === statName) raw = Math.floor(raw * 1.1);
  if (mod && mod.down === statName) raw = Math.floor(raw * 0.9);
  return raw;
}

function battleGetEff(moveType, defenderTypes) {
  var mult = 1;
  defenderTypes.forEach(function(dt) {
    if (!TYPE_EFF[dt]) return;
    if (TYPE_EFF[dt].immune.indexOf(moveType) !== -1) mult *= 0;
    else if (TYPE_EFF[dt].weak.indexOf(moveType) !== -1) mult *= 2;
    else if (TYPE_EFF[dt].resist.indexOf(moveType) !== -1) mult *= 0.5;
  });
  return mult;
}

function battleCalcDamage(attacker, defender, move) {
  if (move.power === 0) return { damage: 0, effectiveness: 1 };
  var atkStat, defStat;
  if (move.category === 'P') {
    atkStat = attacker.computedStats['attack'];
    defStat = defender.computedStats['defense'];
  } else {
    atkStat = attacker.computedStats['special-attack'];
    defStat = defender.computedStats['special-defense'];
  }
  var dmg = ((2 * BATTLE_LEVEL / 5 + 2) * move.power * atkStat / defStat) / 50 + 2;
  if (attacker.types.includes(move.type)) dmg *= 1.5;
  var eff = battleGetEff(move.type, defender.types);
  dmg *= eff;
  dmg *= (0.85 + Math.random() * 0.15);
  return { damage: Math.max(1, Math.floor(dmg)), effectiveness: eff };
}

function detectRoleBattle(statMap) {
  var atk = statMap['attack'] || 0, spatk = statMap['special-attack'] || 0;
  var def = statMap['defense'] || 0, spdef = statMap['special-defense'] || 0;
  var spe = statMap['speed'] || 0;
  return {
    isPhys: atk >= spatk + 15, isSpec: spatk >= atk + 15,
    isMixed: !(atk >= spatk + 15) && !(spatk >= atk + 15),
    isTank: (def + spdef) / 2 >= 90 && spe < 80, isFast: spe >= 80
  };
}

function battleAutoEV(statMap) {
  var r = detectRoleBattle(statMap);
  var evs = { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 };
  if (r.isPhys && r.isFast) { evs.attack = 252; evs.speed = 252; evs.hp = 4; }
  else if (r.isPhys) { evs.attack = 252; evs.hp = 252; evs.defense = 4; }
  else if (r.isSpec && r.isFast) { evs['special-attack'] = 252; evs.speed = 252; evs.hp = 4; }
  else if (r.isSpec) { evs['special-attack'] = 252; evs.hp = 252; evs['special-defense'] = 4; }
  else if (r.isTank) { evs.hp = 252; evs.defense = 128; evs['special-defense'] = 128; }
  else { evs.hp = 4; evs.attack = 126; evs['special-attack'] = 126; evs.speed = 252; }
  return evs;
}

function battleSelectMoves(pokemonData, types, statMap) {
  var r = detectRoleBattle(statMap);
  var typeSet = new Set(types);
  var pool = [];
  pokemonData.moves.forEach(function(m) {
    var vgd = m.version_group_details.slice().sort(function(a, b) {
      return b.version_group.url.localeCompare(a.version_group.url, undefined, { numeric: true });
    })[0];
    if (!vgd) return;
    var method = vgd.move_learn_method.name;
    if (!['level-up', 'machine', 'egg'].includes(method)) return;
    var nm = m.move.name, md = MOVE_DATA[nm];
    if (!md || md[0] === 0) return;
    var power = md[0], mtype = md[1], cat = md[2];
    if (cat === 'Z') return;
    var score = power;
    if ((r.isPhys && cat === 'P') || (r.isSpec && cat === 'S')) score *= 1.4;
    if (typeSet.has(mtype)) score *= 1.5;
    pool.push({ name: nm, power: power, type: mtype, category: cat, score: score });
  });
  var seen = new Set();
  var unique = pool.filter(function(m) { if (seen.has(m.name)) return false; seen.add(m.name); return true; });
  unique.sort(function(a, b) { return b.score - a.score; });
  var chosen = [], typeCounts = {};
  for (var i = 0; i < unique.length && chosen.length < 4; i++) {
    var m = unique[i], tc = typeCounts[m.type] || 0;
    if (tc >= 2) continue;
    typeCounts[m.type] = (tc || 0) + 1; chosen.push(m);
  }
  for (var i = 0; i < unique.length && chosen.length < 4; i++) {
    if (!chosen.includes(unique[i])) chosen.push(unique[i]);
  }
  if (chosen.length === 0) {
    chosen.push({ name: 'tackle', power: 40, type: 'normal', category: 'P', score: 40 });
  }
  return chosen;
}

async function battleBuildPokemon(id, ivs, nature, abilitySlug) {
  var data = detailCache[id];
  if (!data) {
    var res = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    var p = await res.json();
    data = { p: p }; detailCache[id] = data;
  }
  var p = data.p;
  var types = p.types.map(function(t) { return t.type.name; });
  var statMap = {}; p.stats.forEach(function(s) { statMap[s.stat.name] = s.base_stat; });
  var evs = battleAutoEV(statMap);
  var computedStats = {};
  BATTLE_STAT_ORDER.forEach(function(sn) {
    computedStats[sn] = battleCalcStat(statMap[sn] || 50, ivs[sn] || 0, evs[sn] || 0, sn, nature);
  });
  var moves = battleSelectMoves(p, types, statMap);
  var ability = abilitySlug || (p.abilities[0] ? p.abilities[0].ability.name : 'unknown');
  return {
    id: id, name: p.name, types: types, baseStats: statMap, ivs: ivs, evs: evs,
    nature: nature, ability: ability, computedStats: computedStats, moves: moves,
    maxHp: computedStats.hp, currentHp: computedStats.hp,
    sprite: p.sprites.front_default || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png',
    artwork: (p.sprites.other && p.sprites.other['official-artwork'] ? p.sprites.other['official-artwork'].front_default : null)
      || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png'
  };
}

function battleRandomIVs() {
  var ivs = {};
  BATTLE_STAT_ORDER.forEach(function(sn) { ivs[sn] = Math.floor(Math.random() * 32); });
  return ivs;
}

async function battleRandomPokemon(side) {
  var poke = allPokemon[Math.floor(Math.random() * allPokemon.length)];
  var data = detailCache[poke.id];
  if (!data) {
    var res = await fetch('https://pokeapi.co/api/v2/pokemon/' + poke.id);
    var pData = await res.json();
    data = { p: pData }; detailCache[poke.id] = data;
  }
  var ivs = battleRandomIVs();
  var nature = ALL_NATURES[Math.floor(Math.random() * ALL_NATURES.length)];
  var abilities = data.p.abilities;
  var ability = abilities.length ? abilities[Math.floor(Math.random() * abilities.length)].ability.name : 'unknown';
  var pokemon = await battleBuildPokemon(poke.id, ivs, nature, ability);
  battleSetupData[side] = { id: poke.id, ivs: ivs, nature: nature, ability: ability, pokemon: pokemon, data: data };
  battleRenderSetupPreview(side);
}

async function battleSelectPokemon(side, id) {
  var data = detailCache[id];
  if (!data) {
    var res = await fetch('https://pokeapi.co/api/v2/pokemon/' + id);
    var pData = await res.json();
    data = { p: pData }; detailCache[id] = data;
  }
  var ivs = {}; BATTLE_STAT_ORDER.forEach(function(sn) { ivs[sn] = 31; });
  var statMap = {}; data.p.stats.forEach(function(s) { statMap[s.stat.name] = s.base_stat; });
  var r = detectRoleBattle(statMap);
  var nature;
  if (r.isPhys && r.isFast) nature = 'Jolly';
  else if (r.isPhys) nature = 'Adamant';
  else if (r.isSpec && r.isFast) nature = 'Timid';
  else if (r.isSpec) nature = 'Modest';
  else nature = 'Hardy';
  var ability = data.p.abilities[0] ? data.p.abilities[0].ability.name : 'unknown';
  var pokemon = await battleBuildPokemon(id, ivs, nature, ability);
  battleSetupData[side] = { id: id, ivs: ivs, nature: nature, ability: ability, pokemon: pokemon, data: data };
  battleRenderSetupPreview(side);
}

function battleRenderSetupPreview(side) {
  var setup = battleSetupData[side];
  if (!setup) return;
  var pokemon = setup.pokemon;
  var container = document.getElementById('battle-preview-' + side);
  if (!container) return;
  var typesHTML = pokemon.types.map(function(tp) {
    return '<span class="type-badge type-' + tp + '" style="font-size:12px;padding:1px 6px">' + typeName(tp) + '</span>';
  }).join('');
  var movesHTML = pokemon.moves.map(function(m) {
    return '<span class="battle-move-chip">' + typeIconHTML(m.type, 14) + ' ' + m.name.replace(/-/g, ' ') + ' <span style="color:#f8d030;font-size:12px">' + m.power + '</span></span>';
  }).join('');
  container.innerHTML =
    '<div class="battle-preview">' +
    '<img src="' + pokemon.artwork + '" onerror="this.src=\'' + pokemon.sprite + '\'" />' +
    '<div class="battle-preview-info"><div class="battle-preview-name">' + pokemon.name + '</div>' +
    '<div class="battle-preview-types">' + typesHTML + '</div>' +
    '<div style="font-size:14px;color:#888;margin-top:4px">HP: ' + pokemon.maxHp + ' | ' +
    t('build.nature') + ': ' + natureName(pokemon.nature) + '</div></div></div>' +
    '<div class="battle-moves-preview"><div class="battle-moves-preview-title">' + t('build.best4') + ':</div>' + movesHTML + '</div>';
  // Update IV inputs
  BATTLE_STAT_ORDER.forEach(function(sn) {
    var inp = document.getElementById('biv-' + side + '-' + sn);
    if (inp) inp.value = setup.ivs[sn];
  });
  var natSel = document.getElementById('bnat-' + side);
  if (natSel) natSel.value = setup.nature;
  var abilSel = document.getElementById('babil-' + side);
  if (abilSel) {
    abilSel.innerHTML = '';
    setup.data.p.abilities.forEach(function(a) {
      var opt = document.createElement('option');
      opt.value = a.ability.name;
      opt.textContent = a.ability.name.replace(/-/g, ' ') + (a.is_hidden ? ' [' + (currentLang === 'en' ? 'hidden' : 'ukryta') + ']' : '');
      if (a.ability.name === setup.ability) opt.selected = true;
      abilSel.appendChild(opt);
    });
  }
  var startBtn = document.getElementById('battle-start-btn');
  if (startBtn) startBtn.disabled = !(battleSetupData.player && battleSetupData.opponent);
}

async function battleUpdateFromInputs(side) {
  var setup = battleSetupData[side];
  if (!setup) return;
  var ivs = {};
  BATTLE_STAT_ORDER.forEach(function(sn) {
    var inp = document.getElementById('biv-' + side + '-' + sn);
    ivs[sn] = inp ? Math.min(31, Math.max(0, parseInt(inp.value) || 0)) : setup.ivs[sn];
  });
  var natSel = document.getElementById('bnat-' + side);
  var nature = natSel ? natSel.value : setup.nature;
  var abilSel = document.getElementById('babil-' + side);
  var ability = abilSel ? abilSel.value : setup.ability;
  setup.ivs = ivs; setup.nature = nature; setup.ability = ability;
  var pokemon = await battleBuildPokemon(setup.id, ivs, nature, ability);
  setup.pokemon = pokemon;
  battleSetupData[side] = setup;
  battleRenderSetupPreview(side);
}

function battleOnSearch(side, input) {
  clearTimeout(battleSearchTimeout);
  var q = input.value.trim().toLowerCase();
  var results = document.getElementById('battle-search-results-' + side);
  if (q.length < 2) { results.classList.remove('open'); return; }
  battleSearchTimeout = setTimeout(function() {
    var matches = allPokemon.filter(function(p) {
      return p.name.includes(q) || String(p.id).includes(q);
    }).slice(0, 8);
    if (!matches.length) {
      results.innerHTML = '<div class="team-search-item" style="color:#666">' + t('gen.noResults') + '</div>';
      results.classList.add('open'); return;
    }
    results.innerHTML = matches.map(function(p) {
      return '<div class="team-search-item" onclick="battlePickFromSearch(\'' + side + '\',' + p.id + ')">' +
        '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + p.id + '.png" style="width:32px;height:32px"/>' +
        '<span style="text-transform:capitalize">' + p.name + '</span>' +
        '<span style="color:#666;margin-left:auto">#' + String(p.id).padStart(3, '0') + '</span></div>';
    }).join('');
    results.classList.add('open');
  }, 200);
}

async function battlePickFromSearch(side, id) {
  var results = document.getElementById('battle-search-results-' + side);
  results.classList.remove('open');
  var inp = document.getElementById('battle-search-' + side);
  if (inp) inp.value = '';
  await battleSelectPokemon(side, id);
}

async function battleStart() {
  if (!battleSetupData.player || !battleSetupData.opponent) return;
  await battleUpdateFromInputs('player');
  await battleUpdateFromInputs('opponent');
  battleState = {
    player: JSON.parse(JSON.stringify(battleSetupData.player.pokemon)),
    opponent: JSON.parse(JSON.stringify(battleSetupData.opponent.pokemon)),
    log: [], turn: 0, isPlayerTurn: true, battleOver: false
  };
  if (battleState.opponent.computedStats.speed > battleState.player.computedStats.speed) {
    battleState.isPlayerTurn = false;
  }
  battleRenderArena();
  if (!battleState.isPlayerTurn) {
    battleAddLog(t('battle.fasterOpp'), 'neutral');
    battleRenderArena();
    setTimeout(function() { battleAITurn(); }, 1000);
  }
}

function battleAddLog(msg, type) {
  battleState.log.push({ msg: msg, type: type || 'neutral' });
}

function getHpColor(pct) {
  if (pct > 50) return '#55ff55';
  if (pct > 20) return '#f8d030';
  return '#ff5555';
}

function battleRenderArena() {
  if (!battleState) return;
  var main = document.getElementById('main-area');
  var p = battleState.player, o = battleState.opponent;
  var pHpPct = Math.max(0, p.currentHp / p.maxHp * 100);
  var oHpPct = Math.max(0, o.currentHp / o.maxHp * 100);

  var moveBtns = p.moves.map(function(m, i) {
    var eff = battleGetEff(m.type, o.types);
    var effClass = '', effText = '';
    if (eff >= 2) { effClass = ' super-effective'; effText = '<span class="battle-move-eff se">' + t('battle.se') + '</span>'; }
    else if (eff > 0 && eff < 1) { effClass = ' not-very-effective'; effText = '<span class="battle-move-eff nve">' + t('battle.nve') + '</span>'; }
    else if (eff === 0) { effClass = ' immune'; effText = '<span class="battle-move-eff imm">IMM</span>'; }
    var disabled = battleState.battleOver || !battleState.isPlayerTurn ? ' disabled' : '';
    var catLabel = m.category === 'P' ? t('battle.phys') : t('battle.spec');
    return '<button class="battle-move-btn' + effClass + '"' + disabled + ' onclick="battlePlayerMove(' + i + ')">' +
      effText +
      '<span class="battle-move-name">' + typeIconHTML(m.type, 16) + ' ' + m.name.replace(/-/g, ' ') + '</span>' +
      '<span class="battle-move-meta"><span>' + catLabel + '</span> | <span style="color:#f8d030">PWR: ' + m.power + '</span></span></button>';
  }).join('');

  var pStatsHTML = BATTLE_STAT_ORDER.map(function(sn) {
    return '<div class="battle-stat-item"><span class="bs-name" style="color:' + (STAT_COLORS[sn] || '#888') + '">' + (STAT_NAMES[sn] || sn) + '</span><span class="bs-val">' + p.computedStats[sn] + '</span></div>';
  }).join('');
  var oStatsHTML = BATTLE_STAT_ORDER.map(function(sn) {
    return '<div class="battle-stat-item"><span class="bs-name" style="color:' + (STAT_COLORS[sn] || '#888') + '">' + (STAT_NAMES[sn] || sn) + '</span><span class="bs-val">' + o.computedStats[sn] + '</span></div>';
  }).join('');
  var pTypesHTML = p.types.map(function(tp) { return '<span class="type-badge type-' + tp + '" style="font-size:12px;padding:1px 6px">' + typeName(tp) + '</span>'; }).join('');
  var oTypesHTML = o.types.map(function(tp) { return '<span class="type-badge type-' + tp + '" style="font-size:12px;padding:1px 6px">' + typeName(tp) + '</span>'; }).join('');
  var logHTML = battleState.log.map(function(entry) {
    return '<div class="battle-log-entry ' + entry.type + '">' + entry.msg + '</div>';
  }).join('');
  var waitingHTML = (!battleState.isPlayerTurn && !battleState.battleOver)
    ? '<div class="battle-waiting">' + t('battle.opponentThink') + '</div>' : '';
  var resultHTML = '';
  if (battleState.battleOver) {
    var isWin = o.currentHp <= 0;
    resultHTML = '<div class="battle-result ' + (isWin ? 'victory' : 'defeat') + '">' +
      '<h2>' + (isWin ? t('battle.victory') : t('battle.defeat')) + '</h2>' +
      '<div style="font-size:18px;color:#aaa">' +
      (isWin ? t('battle.yourWon').replace('%p', p.name) : t('battle.yourLost').replace('%p', p.name)) + '</div>' +
      '<div class="battle-result-buttons">' +
      '<button class="mc-btn" onclick="battleStart()" style="background:#2a5a2a;border-top-color:#5a8a5a;border-left-color:#5a8a5a">' + t('battle.rematch') + '</button>' +
      '<a class="mc-btn" href="arena.html" style="text-decoration:none">' + t('battle.newBattle') + '</a></div></div>';
  }

  main.innerHTML =
    '<div class="page-title"><span>\u2694 ' + t('nav.battle') + '</span></div>' +
    '<div class="battle-page">' +
    '<div class="battle-arena">' +
    '<div class="battle-card player-card">' +
    '<div style="font-family:\'Press Start 2P\',monospace;font-size:9px;color:var(--green);margin-bottom:8px">' + t('battle.yourPoke') + '</div>' +
    '<div class="battle-pokemon-header">' +
    '<img class="battle-pokemon-img" src="' + p.artwork + '" onerror="this.src=\'' + p.sprite + '\'" />' +
    '<div class="battle-pokemon-info"><div class="battle-pokemon-name">' + p.name + '</div>' +
    '<div class="battle-pokemon-types">' + pTypesHTML + '</div>' +
    '<div style="font-size:13px;color:#888;margin-top:2px">' + natureName(p.nature) + ' | ' + p.ability.replace(/-/g, ' ') + '</div></div></div>' +
    '<div class="battle-hp-section"><div class="battle-hp-label"><span class="hp-text">HP</span><span class="hp-val">' + Math.max(0, p.currentHp) + ' / ' + p.maxHp + '</span></div>' +
    '<div class="battle-hp-bar-bg"><div class="battle-hp-bar-fill" style="width:' + pHpPct + '%;background:' + getHpColor(pHpPct) + '"></div></div></div>' +
    '<div class="battle-stat-preview">' + pStatsHTML + '</div>' +
    '<div class="battle-moves-grid">' + moveBtns + '</div>' + waitingHTML + '</div>' +
    '<div class="battle-card opponent-card">' +
    '<div style="font-family:\'Press Start 2P\',monospace;font-size:9px;color:var(--red);margin-bottom:8px">' + t('battle.opponent') + '</div>' +
    '<div class="battle-pokemon-header">' +
    '<img class="battle-pokemon-img" src="' + o.artwork + '" onerror="this.src=\'' + o.sprite + '\'" />' +
    '<div class="battle-pokemon-info"><div class="battle-pokemon-name">' + o.name + '</div>' +
    '<div class="battle-pokemon-types">' + oTypesHTML + '</div>' +
    '<div style="font-size:13px;color:#888;margin-top:2px">' + natureName(o.nature) + ' | ' + o.ability.replace(/-/g, ' ') + '</div></div></div>' +
    '<div class="battle-hp-section"><div class="battle-hp-label"><span class="hp-text">HP</span><span class="hp-val">' + Math.max(0, o.currentHp) + ' / ' + o.maxHp + '</span></div>' +
    '<div class="battle-hp-bar-bg"><div class="battle-hp-bar-fill" style="width:' + oHpPct + '%;background:' + getHpColor(oHpPct) + '"></div></div></div>' +
    '<div class="battle-stat-preview">' + oStatsHTML + '</div>' +
    '<div style="margin-top:12px"><div style="font-size:14px;color:#666;margin-bottom:4px">' + t('battle.knownMoves') + '</div>' +
    o.moves.map(function(m) {
      return '<span class="battle-move-chip">' + typeIconHTML(m.type, 14) + ' ' + m.name.replace(/-/g, ' ') + ' <span style="color:#f8d030;font-size:12px">' + m.power + '</span></span>';
    }).join('') + '</div></div>' +
    '</div>' + resultHTML +
    '<div class="battle-log" id="battle-log">' + logHTML + '</div>' +
    '</div>';
  var logEl = document.getElementById('battle-log');
  if (logEl) logEl.scrollTop = logEl.scrollHeight;
}

function battlePlayerMove(moveIdx) {
  if (!battleState || battleState.battleOver || !battleState.isPlayerTurn) return;
  var p = battleState.player, o = battleState.opponent;
  var move = p.moves[moveIdx];
  var result = battleCalcDamage(p, o, move);
  o.currentHp -= result.damage;
  if (o.currentHp < 0) o.currentHp = 0;
  var effMsg = '', logType = 'neutral';
  if (result.effectiveness >= 2) { effMsg = ' (' + t('battle.superEff') + ')'; logType = 'se'; }
  else if (result.effectiveness > 0 && result.effectiveness < 1) { effMsg = ' (' + t('battle.notVeryEff') + ')'; logType = 'nve'; }
  else if (result.effectiveness === 0) { effMsg = ' (' + t('battle.noEffect') + ')'; logType = 'imm'; }
  var logMsg = t('battle.yourUsed').replace('%p', p.name).replace('%m', move.name.replace(/-/g, ' ')) + ' (-' + result.damage + ' HP)' + effMsg;
  battleAddLog(logMsg, logType);
  battleState.isPlayerTurn = false;
  battleState.turn++;
  if (o.currentHp <= 0) {
    battleAddLog(t('battle.fainted').replace('%p', o.name), 'faint');
    battleState.battleOver = true;
    battleRenderArena(); return;
  }
  battleRenderArena();
  setTimeout(function() { battleAITurn(); }, 1000);
}

function battleAITurn() {
  if (!battleState || battleState.battleOver) return;
  var o = battleState.opponent, p = battleState.player;
  var bestMove = null, bestDmgEst = -1;
  o.moves.forEach(function(m) {
    var eff = battleGetEff(m.type, p.types);
    var est = m.power * eff;
    if (o.types.includes(m.type)) est *= 1.5;
    if (m.category === 'P' && o.computedStats.attack > o.computedStats['special-attack']) est *= 1.1;
    if (m.category === 'S' && o.computedStats['special-attack'] > o.computedStats.attack) est *= 1.1;
    if (est > bestDmgEst) { bestDmgEst = est; bestMove = m; }
  });
  if (!bestMove) bestMove = o.moves[0];
  var result = battleCalcDamage(o, p, bestMove);
  p.currentHp -= result.damage;
  if (p.currentHp < 0) p.currentHp = 0;
  var effMsg = '', logType = 'neutral';
  if (result.effectiveness >= 2) { effMsg = ' (' + t('battle.superEff') + ')'; logType = 'se'; }
  else if (result.effectiveness > 0 && result.effectiveness < 1) { effMsg = ' (' + t('battle.notVeryEff') + ')'; logType = 'nve'; }
  else if (result.effectiveness === 0) { effMsg = ' (' + t('battle.noEffect') + ')'; logType = 'imm'; }
  var logMsg = t('battle.oppUsed').replace('%p', o.name).replace('%m', bestMove.name.replace(/-/g, ' ')) + ' (-' + result.damage + ' HP)' + effMsg;
  battleAddLog(logMsg, logType);
  battleState.isPlayerTurn = true;
  if (p.currentHp <= 0) {
    battleAddLog(t('battle.fainted').replace('%p', p.name), 'faint');
    battleState.battleOver = true;
  }
  battleRenderArena();
}

function renderBattleSetupPage() {
  var natureOpts = ALL_NATURES.map(function(n) {
    var nm = NATURE_MODS[n];
    var hint = '';
    if (nm.up && nm.down) {
      var upN = STAT_NAMES[nm.up] || nm.up, downN = STAT_NAMES[nm.down] || nm.down;
      hint = ' (+' + upN + ' / -' + downN + ')';
    }
    return '<option value="' + n + '">' + natureName(n) + ' (' + n + ')' + hint + '</option>';
  }).join('');

  function buildSetupCard(side, label, color) {
    var ivInputs = BATTLE_STAT_ORDER.map(function(sn) {
      return '<div class="battle-iv-box"><label style="color:' + (STAT_COLORS[sn] || '#888') + '">' + (STAT_NAMES[sn] || sn) + '</label>' +
        '<div class="calc-iv-hybrid"><input type="range" min="0" max="31" value="31" oninput="syncBattleIVHybrid(this,\'range\',\'' + side + '\',\'' + sn + '\')" />' +
        '<input type="number" min="0" max="31" value="31" id="biv-' + side + '-' + sn + '" oninput="syncBattleIVHybrid(this,\'number\',\'' + side + '\',\'' + sn + '\')" /></div></div>';
    }).join('');
    return '<div class="battle-setup-card ' + side + '">' +
      '<h3 style="color:' + color + '">' + label + '</h3>' +
      '<button class="battle-random-btn" onclick="battleRandomPokemon(\'' + side + '\')">' + t('battle.random') + '</button>' +
      '<div class="battle-search-wrap">' +
      '<input class="mc-input" id="battle-search-' + side + '" type="text" placeholder="' + t('battle.searchPoke') + '" oninput="battleOnSearch(\'' + side + '\',this)" autocomplete="off" />' +
      '<div class="battle-search-results" id="battle-search-results-' + side + '"></div></div>' +
      '<div id="battle-preview-' + side + '" style="min-height:60px"><div style="color:#555;text-align:center;padding:20px;font-size:18px">' + t('battle.selectFirst') + '</div></div>' +
      '<div style="margin-top:8px;font-size:14px;color:#888">' + t('battle.ivLabel') + ':</div>' +
      '<div class="battle-iv-grid">' + ivInputs + '</div>' +
      '<div class="battle-select-row"><label>' + t('build.nature') + '</label>' +
      '<select id="bnat-' + side + '" onchange="battleUpdateFromInputs(\'' + side + '\')">' + natureOpts + '</select></div>' +
      '<div class="battle-select-row"><label>' + t('build.ability') + '</label>' +
      '<select id="babil-' + side + '" onchange="battleUpdateFromInputs(\'' + side + '\')"><option>' + t('battle.selectFirst') + '</option></select></div>' +
      '</div>';
  }
  return '<div class="page-title"><span>\u2694 ' + t('nav.battle') + '</span></div>' +
    '<div class="battle-page">' +
    '<div style="text-align:center;margin-bottom:16px;font-size:16px;color:#888">' + t('battle.intro') + '</div>' +
    '<div class="battle-setup">' +
    buildSetupCard('player', t('battle.yourPoke'), 'var(--green)') +
    buildSetupCard('opponent', t('battle.opponent'), 'var(--red)') +
    '</div>' +
    '<div class="battle-start-wrap">' +
    '<button class="battle-start-btn" id="battle-start-btn" onclick="battleStart()" disabled>\u2694 ' + t('battle.startBattle') + '</button>' +
    '</div></div>';
}
