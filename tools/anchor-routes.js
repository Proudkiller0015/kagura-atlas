'use strict';
/*
 * Make each route actually touch the places it runs between.
 *
 * The route shapes come from the town map, where a highlight is a fat blob, so
 * thinning it leaves ends that stop short of the towns - and a route that stops
 * short joins nothing, which left forty-one of forty-six places unreachable.
 * Every route already says where it runs from and to in ROUTE_INFO, so the ends
 * are simply pinned there and the traced shape kept in between.
 */
const fs = require('node:fs'), path = require('node:path');
const REG = path.join(__dirname, '..', 'regions', 'sinnoh.js');
global.window = { ATLAS_REGIONS: {}, ATLAS_SPOTS: {} };
eval(fs.readFileSync(REG, 'utf8'));
const R = global.window.ATLAS_REGIONS.sinnoh;

const byName = {};
R.PLACES.forEach((p) => { byName[p.name.toLowerCase()] = [p.x, p.y]; });
const alias = { 'the sand': null, 'the seabreak path': 'flower paradise', 'the league plateau': 'sinnoh league' };
const find = (label) => {
  if (!label) return null;
  let k = String(label).toLowerCase().trim();
  if (k in alias) k = alias[k];
  if (!k) return null;
  if (byName[k]) return byName[k];
  const hit = Object.keys(byName).find((n) => n.startsWith(k) || k.startsWith(n));
  return hit ? byName[hit] : null;
};

let s = fs.readFileSync(REG, 'utf8');
let done = 0, skipped = [];
for (const r of R.ROUTES) {
  const info = R.ROUTE_INFO[r.n] || {};
  const a = find(info.from), b = find(info.to);
  if (!a && !b) { skipped.push(`${r.n} (${info.from} / ${info.to})`); continue; }
  let pts = r.path.slice();
  /* Keep the traced middle, pin whichever ends are known. Order the shape so
     its first point is the one nearer the `from` end. */
  if (a && b) {
    const d = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
    if (d(pts[0], a) > d(pts[pts.length - 1], a)) pts.reverse();
  }
  const middle = pts.slice(1, -1);
  const out = [a || pts[0], ...middle, b || pts[pts.length - 1]];
  const head = s.indexOf(`{n:${r.n},path:[`);
  const end = s.indexOf(']}', head);
  s = s.slice(0, head) + `{n:${r.n},path:[` + out.map((p) => `[${p[0]},${p[1]}]`).join(',') + ']}' + s.slice(end + 2);
  done++;
}
fs.writeFileSync(REG, s);
console.log(`${done} routes pinned to their towns`);
if (skipped.length) console.log('left alone: ' + skipped.join(' | '));
