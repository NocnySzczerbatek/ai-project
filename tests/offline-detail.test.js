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
console.log('offline fallback test passed');
