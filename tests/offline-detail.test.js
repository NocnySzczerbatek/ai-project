const assert = require('assert');

function loadBuildOfflinePokemonData() {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'detail.js'), 'utf8');
  const match = source.match(/function buildOfflinePokemonData\([\s\S]*?\n}/);
  if (!match) return null;
  return match[0];
}

const fnText = loadBuildOfflinePokemonData();
assert.ok(fnText, 'buildOfflinePokemonData should exist in detail.js');

const sandbox = { console };
const script = new Function('globalThis', `with (globalThis) { ${fnText}; return buildOfflinePokemonData; }`);
const buildOfflinePokemonData = script(sandbox);

const data = buildOfflinePokemonData(25, 'pikachu');
assert.ok(data && data.p && data.s, 'fallback detail should return pokemon + species payload');
assert.strictEqual(data.p.id, 25);
assert.strictEqual(data.p.name, 'pikachu');
assert.ok(Array.isArray(data.p.stats));
assert.ok(Array.isArray(data.p.moves));
assert.ok(Array.isArray(data.p.types));

const fs = require('fs');
const path = require('path');
const dataSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'data.js'), 'utf8');
const pagesSource = fs.readFileSync(path.join(__dirname, '..', 'js', 'pages.js'), 'utf8');
assert.ok(pagesSource.includes('getPokemonDetailTarget'), 'route helper should exist');
assert.ok(dataSource.includes('fid:10033') && dataSource.includes("megaName:'Mega Venusaur'"), 'mega form data should include the correct Venusaur form ID and display name');
assert.ok(dataSource.includes('fid:10087') && dataSource.includes("megaName:'Ash-Greninja'"), 'ash greninja data should use the unique form ID');
assert.ok(pagesSource.includes('JSON.stringify(ashRoute.id)') && pagesSource.includes('JSON.stringify(formRoute.id)'), 'page cards should pass the resolved route ID instead of a default value');

console.log('offline fallback test passed');
