'use strict';
/*
 * Move Sinnoh's places and routes onto the canonical coordinates.
 *
 * tools/sinnoh-coords.js reads them out of the games' own town map; this writes
 * them into regions/sinnoh.js. A route's highlight is its whole run, so its
 * path is the run thinned to a handful of points rather than a straight line
 * between two towns.
 */
const fs = require('node:fs'), path = require('node:path');
const DIR = process.argv[2], REG = path.join(__dirname, '..', 'regions', 'sinnoh.js');
const coords = JSON.parse(fs.readFileSync(path.join(DIR, 'coords.json'), 'utf8'));
const shapes = JSON.parse(fs.readFileSync(path.join(DIR, 'shapes.json'), 'utf8'));
const by = {}; coords.forEach((c) => { by[c.name] = c; });
const shapeOf = {}; shapes.forEach((s) => { shapeOf[s.name] = s.pts; });

/* Town map name -> our place id. */
const MAP = {
  'Twinleaf Town': 'twinleaf', 'Lake Verity': 'lakeverity', 'Sandgem Town': 'sandgem', 'Pal Park': 'palpark',
  'Jubilife City': 'jubilife', 'Canalave City': 'canalave', 'Iron Island': 'ironisland',
  'Fullmoon Island DP': 'fullmoon', 'Newmoon Island': 'newmoon',
  'Oreburgh Gate': 'oreburghgate', 'Oreburgh City': 'oreburgh',
  'Floaroma Town': 'floaroma', 'Valley Windworks': 'windworks', 'Fuego Ironworks': 'fuego',
  'Eterna Forest': 'eternaforest', 'Eterna City': 'eterna', 'Mt Coronet': 'coronet',
  'Hearthome City': 'hearthome', 'Solaceon Town': 'solaceon', 'Veilstone City': 'veilstone',
  'Lake Valor': 'lakevalor', 'Hotel Grand Lake': 'valorlakefront', 'Sendoff Spring': 'sendoff',
  'Turnback Cave': 'turnback', 'Pastoria City': 'pastoria', 'Sunyshore City': 'sunyshore',
  'Celestic Town': 'celestic', 'Spear Pillar Hall of Origin': 'spearpillar', 'Distortion World': 'distortion',
  'Lake Acuity': 'lakeacuity', 'Snowpoint City': 'snowpoint', 'Pokémon League': 'sinnohleague',
  'Flower Paradise': 'flowerparadise', 'Fight Area': 'fightarea', 'Survival Area': 'survivalarea',
  'Resort Area': 'resortarea', 'Stark Mountain': 'starkmountain', 'Battle Park': 'battlefrontier',
};

/* No town map of their own: placed just off the neighbour they open from. */
const DERIVED = {
  ravagedpath:     ['Route 204', 0, 6],
  waywardcave:     ['Route 206', 6, 0],
  chateau:         ['Eterna Forest', 8, -6],
  losttower:       ['Route 209', -8, -8],
  solaceonruins:   ['Solaceon Town', 10, 6],
  greatmarsh:      ['Pastoria City', 6, -12],
  snowpointtemple: ['Snowpoint City', 10, -8],
  sinnohvictory:   ['Pokémon League', -10, 10],
};

/** A route's run, thinned to a few points along whichever way it mostly goes. */
function routePath(name) {
  const pts = shapeOf[name];
  if (!pts || pts.length < 4) return null;
  const c = by[name];
  const wide = (c.wx1 - c.wx0) >= (c.wy1 - c.wy0);
  const sx = (c.wx1 - c.wx0) / Math.max(1, Math.max(...pts.map((p) => p[0])) - Math.min(...pts.map((p) => p[0])));
  const sy = (c.wy1 - c.wy0) / Math.max(1, Math.max(...pts.map((p) => p[1])) - Math.min(...pts.map((p) => p[1])));
  const px0 = Math.min(...pts.map((p) => p[0])), py0 = Math.min(...pts.map((p) => p[1]));
  const world = pts.map((p) => [Math.round(c.wx0 + (p[0] - px0) * sx), Math.round(c.wy0 + (p[1] - py0) * sy)]);
  /* Average the cross axis at each step along the main one, so the line follows the run. */
  const bucket = new Map();
  world.forEach(([x, y]) => {
    const k = wide ? x : y;
    const v = wide ? y : x;
    const e = bucket.get(k) || [0, 0];
    bucket.set(k, [e[0] + v, e[1] + 1]);
  });
  const keys = [...bucket.keys()].sort((a, b) => a - b);
  const step = Math.max(1, Math.floor(keys.length / 4));
  const out = [];
  for (let i = 0; i < keys.length; i += step) {
    const k = keys[i], [sum, n] = bucket.get(k);
    out.push(wide ? [k, Math.round(sum / n)] : [Math.round(sum / n), k]);
  }
  const lastK = keys[keys.length - 1], [ls, ln] = bucket.get(lastK);
  const last = wide ? [lastK, Math.round(ls / ln)] : [Math.round(ls / ln), lastK];
  if (out[out.length - 1][0] !== last[0] || out[out.length - 1][1] !== last[1]) out.push(last);
  return out;
}

let s = fs.readFileSync(REG, 'utf8');
let moved = 0; const missing = [];

/** Set x/y on one place entry, found by its id - no regex, nothing to escape. */
function place(id, x, y) {
  const head = s.indexOf(`{ id:'${id}',`);
  if (head < 0) { missing.push(id); return; }
  /* ", x:" - not "x:", which also matches the "x:" inside "box:" and once ate
     the box and name of all forty-six places. */
  const xi = s.indexOf(', x:', head) + 2;
  const yi = s.indexOf('y:', xi);
  const yEnd = s.indexOf(',', yi);
  if (xi < 0 || yi < 0 || yEnd < 0 || xi > head + 200) { missing.push(id + ' (no x/y)'); return; }
  s = s.slice(0, xi) + `x:${x}, y:${y}` + s.slice(yEnd);
  moved++;
}

for (const [tmName, id] of Object.entries(MAP)) {
  const c = by[tmName];
  if (!c) { missing.push(tmName + ' (no town map)'); continue; }
  place(id, c.wx, c.wy);
}
for (const [id, [from, dx, dy]] of Object.entries(DERIVED)) {
  const c = by[from];
  if (!c) { missing.push(id + ' <- ' + from); continue; }
  place(id, c.wx + dx, c.wy + dy);
}

let routes = 0;
for (let n = 201; n <= 230; n++) {
  const pts = routePath(`Route ${n}`);
  if (!pts) continue;
  const head = s.indexOf(`{n:${n},path:[`);
  if (head < 0) continue;
  const end = s.indexOf(']}', head);
  if (end < 0) continue;
  s = s.slice(0, head) + `{n:${n},path:[` + pts.map((q) => `[${q[0]},${q[1]}]`).join(',') + ']}' + s.slice(end + 2);
  routes++;
}

fs.writeFileSync(REG, s);
console.log(`${moved} places moved, ${routes} routes redrawn`);
if (missing.length) console.log('not found: ' + missing.join(' | '));
