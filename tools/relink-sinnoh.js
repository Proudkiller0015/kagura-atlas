'use strict';
/*
 * Redraw Sinnoh's trails, links, ferries and bridges against the real coordinates.
 *
 * Places and routes moved onto the canonical town-map positions; these did not,
 * so every side trail and ferry still ran between the invented ones and ended
 * in open water. Each is written here as what it joins, and the geometry is
 * worked out from wherever those things now are.
 */
const fs = require('node:fs'), path = require('node:path');
const REG = path.join(__dirname, '..', 'regions', 'sinnoh.js');
global.window = { ATLAS_REGIONS: {}, ATLAS_SPOTS: {} };
eval(fs.readFileSync(REG, 'utf8'));
const R = global.window.ATLAS_REGIONS.sinnoh;
const P = {}; R.PLACES.forEach((p) => { P[p.id] = [p.x, p.y]; });
const ROUTE = {}; R.ROUTES.forEach((r) => { ROUTE['r' + r.n] = r.path; });

/** The point on a road nearest somewhere, so a trail leaves it where it should. */
const nearestOn = (road, to) => road.reduce((best, p) =>
  Math.hypot(p[0] - to[0], p[1] - to[1]) < Math.hypot(best[0] - to[0], best[1] - to[1]) ? p : best, road[0]);

/* A side trail: from a road (declared) or a place, out to somewhere off it. */
const TRAILS = [
  ['r204', 'ravagedpath'], ['floaroma', 'windworks'], ['r205', 'fuego'], ['r205', 'eternaforest'],
  ['eternaforest', 'chateau'], ['r206', 'waywardcave'], ['r209', 'losttower'],
  ['solaceon', 'solaceonruins'], ['r213', 'greatmarsh'], ['r214', 'lakevalor'], ['r214', 'sendoff'],
  ['sendoff', 'turnback'], ['twinleaf', 'lakeverity'], ['r217', 'lakeacuity'],
  ['snowpoint', 'snowpointtemple'], ['coronet', 'spearpillar'], ['spearpillar', 'distortion'],
  ['r224', 'flowerparadise'], ['fightarea', 'battlefrontier'], ['r223', 'sinnohvictory'],
];
const LINKS = [['sinnohvictory', 'sinnohleague'], ['oreburghgate', 'oreburgh'], ['pastoria', 'greatmarsh']];
const FERRIES = [['canalave', 'ironisland'], ['canalave', 'fullmoon'], ['fullmoon', 'newmoon'],
                 ['snowpoint', 'fightarea'], ['sunyshore', 'fightarea']];
const BRIDGES = [['jubilife', 'canalave'], ['valorlakefront', 'lakevalor']];

const mid = (a, b, t) => [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t)];
const pt = (v) => `[${v[0]},${v[1]}]`;

const trails = TRAILS.map(([from, to]) => {
  const dst = P[to];
  if (!dst) return null;
  if (ROUTE[from]) {
    const start = nearestOn(ROUTE[from], dst);
    return `\t{ path:[${pt(start)},${pt(mid(start, dst, 0.6))},${pt(dst)}], from:'${from}' },`;
  }
  const src = P[from];
  if (!src) return null;
  return `\t[${pt(src)},${pt(mid(src, dst, 0.55))},${pt(dst)}],`;
}).filter(Boolean);

const links = LINKS.map(([a, b]) => P[a] && P[b] ? `\t[${pt(P[a])},${pt(mid(P[a], P[b], 0.5))},${pt(P[b])}],` : null).filter(Boolean);
const ferries = FERRIES.map(([a, b]) => {
  if (!P[a] || !P[b]) return null;
  const c = mid(P[a], P[b], 0.5);
  return `\t[${pt(P[a])},${pt([c[0], c[1] - 6])},${pt(P[b])}],`;
}).filter(Boolean);
const bridges = BRIDGES.map(([a, b]) => {
  if (!P[a] || !P[b]) return null;
  return `\t{ a:${pt(mid(P[a], P[b], 0.38))}, b:${pt(mid(P[a], P[b], 0.62))} },`;
}).filter(Boolean);

let s = fs.readFileSync(REG, 'utf8');
const swap = (name, body, note) => {
  const head = s.indexOf(`var ${name} = [`);
  if (head < 0) { console.log('no ' + name); return; }
  const end = s.indexOf('\n];', head);
  s = s.slice(0, head) + `/* ${note} */\nvar ${name} = [\n` + body.join('\n') + s.slice(end);
};
swap('TRAILS', trails, 'Side tracks, redrawn from where the places actually are');
swap('LINKS', links, 'The short joins: onto the League plateau, through the gate, into the marsh');
swap('FERRIES', ferries, 'Boats: the Canalave sailor, and the crossing to the Battle Zone');
swap('BRIDGES', bridges, 'Canalave\'s drawbridge and the Valor causeway');
fs.writeFileSync(REG, s);
console.log(`${trails.length} trails, ${links.length} links, ${ferries.length} ferries, ${bridges.length} bridges`);
