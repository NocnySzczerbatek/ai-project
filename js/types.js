/* ================================================================
   types.js — System typów i efektywności
   ================================================================ */

/* ── Tabela efektywności typów (defensywna) ── */
const TYPE_EFF = {
  normal:  {weak:['fighting'],resist:[],immune:['ghost']},
  fire:    {weak:['water','ground','rock'],resist:['fire','grass','ice','bug','steel','fairy'],immune:[]},
  water:   {weak:['electric','grass'],resist:['fire','water','ice','steel'],immune:[]},
  electric:{weak:['ground'],resist:['electric','flying','steel'],immune:[]},
  grass:   {weak:['fire','ice','poison','flying','bug'],resist:['water','electric','grass','ground'],immune:[]},
  ice:     {weak:['fire','fighting','rock','steel'],resist:['ice'],immune:[]},
  fighting:{weak:['flying','psychic','fairy'],resist:['bug','rock','dark'],immune:[]},
  poison:  {weak:['ground','psychic'],resist:['fighting','poison','bug','grass','fairy'],immune:[]},
  ground:  {weak:['water','grass','ice'],resist:['poison','rock'],immune:['electric']},
  flying:  {weak:['electric','ice','rock'],resist:['fighting','bug','grass'],immune:['ground']},
  psychic: {weak:['bug','ghost','dark'],resist:['fighting','psychic'],immune:[]},
  bug:     {weak:['fire','flying','rock'],resist:['fighting','ground','grass'],immune:[]},
  rock:    {weak:['water','grass','fighting','ground','steel'],resist:['normal','fire','poison','flying'],immune:[]},
  ghost:   {weak:['ghost','dark'],resist:['poison','bug'],immune:['normal','fighting']},
  dragon:  {weak:['ice','dragon','fairy'],resist:['fire','water','electric','grass'],immune:[]},
  dark:    {weak:['fighting','bug','fairy'],resist:['ghost','dark'],immune:['psychic']},
  steel:   {weak:['fire','fighting','ground'],resist:['normal','grass','ice','flying','psychic','bug','rock','dragon','steel','fairy'],immune:['poison']},
  fairy:   {weak:['poison','steel'],resist:['fighting','bug','dark'],immune:['dragon']}
};

const ALL_TYPES = Object.keys(TYPE_EFF);

/* ── Kolory hex typów do dynamicznego UI ── */
const TYPE_HEX = {
  normal:'#a8a878',fire:'#f08030',water:'#6890f0',electric:'#f8d030',
  grass:'#78c850',ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',
  ground:'#e0c068',flying:'#a890f0',psychic:'#f85888',bug:'#a8b820',
  rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',dark:'#705848',
  steel:'#b8b8d0',fairy:'#ee99ac'
};

/* ── Helper generujący ikonę typu ── */
function typeIconHTML(tpName, size) {
  size = size || 20;
  var colors = {
    normal:'#a8a878',fire:'#f08030',water:'#6890f0',electric:'#f8d030',grass:'#78c850',
    ice:'#98d8d8',fighting:'#c03028',poison:'#a040a0',ground:'#e0c068',flying:'#a890f0',
    psychic:'#f85888',bug:'#a8b820',rock:'#b8a038',ghost:'#705898',dragon:'#7038f8',
    dark:'#705848',steel:'#b8b8d0',fairy:'#ee99ac'
  };
  var c = colors[tpName] || '#888';
  var label = typeName(tpName).substring(0,3).toUpperCase();
  return '<span style="display:inline-block;width:'+size+'px;height:'+size+'px;border-radius:50%;background:'+c+';text-align:center;line-height:'+size+'px;font-size:'+(size*0.5)+'px;color:#fff;font-family:VT323,monospace;vertical-align:middle;margin-right:2px;border:1px solid rgba(0,0,0,0.3)" title="'+typeName(tpName)+'">'+label+'</span>';
}

/* ── Dynamiczne dobieranie kontr na podstawie słabości typów ── */
function getCountersForPokemon(pokemonId, pokemonTypes) {
  var weakMap = {};
  pokemonTypes.forEach(function(tp) {
    var eff = TYPE_EFF[tp];
    if (!eff) return;
    eff.weak.forEach(function(w) { weakMap[w] = (weakMap[w] || 0) + 1; });
    eff.resist.forEach(function(r) { weakMap[r] = (weakMap[r] || 0) - 1; });
    eff.immune.forEach(function(i) { weakMap[i] = -99; });
  });
  var weakTypes = [];
  for (var k in weakMap) { if (weakMap[k] > 0) weakTypes.push({ type: k, mult: weakMap[k] }); }
  weakTypes.sort(function(a, b) { return b.mult - a.mult; });
  var scored = [];
  COUNTER_POOL.forEach(function(c) {
    if (c.id === pokemonId) return;
    var sc = 0, seTypes = [];
    c.atk.forEach(function(at) {
      weakTypes.forEach(function(w) {
        if (at === w.type) { sc += w.mult * 3; if (seTypes.indexOf(at) < 0) seTypes.push(at); }
      });
    });
    pokemonTypes.forEach(function(pt) {
      c.types.forEach(function(ct) {
        var e = TYPE_EFF[ct];
        if (e && e.immune.indexOf(pt) >= 0) sc += 4;
        else if (e && e.resist.indexOf(pt) >= 0) sc += 1;
      });
    });
    if (sc > 0) {
      var r = seTypes.length > 0
        ? seTypes.map(function(st) { return typeName(st); }).join('/') + ' SE'
        : (currentLang === 'en' ? 'resists STAB' : 'odporny na STAB');
      scored.push({ id: c.id, name: c.name, score: sc, reason: r });
    }
  });
  scored.sort(function(a, b) { return b.score - a.score; });
  return scored.slice(0, 3);
}
