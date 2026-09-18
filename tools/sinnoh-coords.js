'use strict';
/*
 * Canonical coordinates for every place and route in Sinnoh.
 *
 * Reading positions off a painted map by eye put towns in the sea. The games
 * ship a town map, and Bulbapedia has one copy of it per location with that
 * location highlighted - so the position of anything is the difference between
 * its copy and the plain one. That is exact, and it covers the routes too:
 * a route's highlight is its whole run, not a dot.
 *
 *   node tools/sinnoh-coords.js <cachedir>
 */
const fs = require('node:fs'), path = require('node:path'), { PNG } = require('pngjs');
const DIR = process.argv.find((x) => !x.startsWith('--') && x.indexOf('node') < 0 && x.indexOf('sinnoh-coords') < 0);
const arg = (k, d) => { const v = process.argv.find((x) => x.startsWith(`--${k}=`)); return v ? Number(v.split('=')[1]) : d; };
const UA = 'KaguraAtlas/1.0 (private Pokemon RP map)';
const API = 'https://archives.bulbagarden.net/w/api.php';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const res = await fetch(`${API}?action=query&list=allimages&aiprefix=Sinnoh&ailimit=500&format=json&aiprop=url|dimensions`, { headers: { 'User-Agent': UA } });
  const all = (await res.json()).query.allimages.filter((x) => / Map\.png$/.test(x.title) && x.width === 216 && x.height === 168);

  const grab = async (title, url) => {
    const f = path.join(DIR, title.replace(/^File:/, '').replace(/[^\w.]/g, '_'));
    if (!fs.existsSync(f)) {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) return null;
      fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
      await sleep(120);
    }
    return PNG.sync.read(fs.readFileSync(f));
  };

  const base = await grab('File:Sinnoh.png', 'https://archives.bulbagarden.net/media/upload/a/ac/Sinnoh.png');
  const W = base.width, H = base.height;

  /* The town map's own land, so its extent can be matched to the painted one. */
  /* Sea against red, not against green: the town map's shallows are a pale cyan
     whose green almost matches its blue, and testing green called them land -
     which stretched the whole sheet, margins and all, onto the coastline. */
  const sea = (d, i) => (d[i * 4 + 2] - d[i * 4]) > 60;
  let lx0 = W, ly0 = H, lx1 = 0, ly1 = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (sea(base.data, y * W + x)) continue;
    if (x < lx0) lx0 = x; if (x > lx1) lx1 = x;
    if (y < ly0) ly0 = y; if (y > ly1) ly1 = y;
  }

  /* The painted map's land, in world units - the backdrop rect. */
  const BX0 = 51.0, BY0 = -406.0, BX1 = 469.0, BY1 = -95.0;
  /*
   * When the backdrop is this very map, take its transform rather than fitting
   * again: tools/make-backdrop.js prints one, it preserves aspect and centres,
   * and any second guess at the same fit drifts by a few units across the sheet
   * - which is a town standing next to its own square instead of on it.
   */
  const FIXED = arg('scale', 0);
  const sx = FIXED || (BX1 - BX0) / (lx1 - lx0), sy = FIXED || (BY1 - BY0) / (ly1 - ly0);
  const ox = FIXED ? arg('ox', BX0) : BX0 - lx0 * sx;
  const oy = FIXED ? arg('oy', BY0) : BY0 - ly0 * sy;
  const toWorld = (px, py) => [Math.round(ox + px * sx), Math.round(oy + py * sy)];
  console.log(`town map land ${lx0},${ly0}..${lx1},${ly1} -> world ${BX0},${BY0}..${BX1},${BY1}`);
  console.log(`scale ${sx.toFixed(3)} x ${sy.toFixed(3)} world units per town-map pixel\n`);

  const rows = [];
  for (const im of all) {
    const png = await grab(im.title, im.url);
    if (!png) continue;
    let n = 0, ax = 0, ay = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
    const pts = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let diff = 0;
      for (let k = 0; k < 3; k++) diff += Math.abs(png.data[i + k] - base.data[i + k]);
      if (diff <= 60) continue;
      n++; ax += x; ay += y; pts.push([x, y]);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (!n) continue;
    const name = im.title.replace(/^File:Sinnoh /, '').replace(/ Map\.png$/, '');
    const [wx, wy] = toWorld(ax / n, ay / n);
    const [ wx0, wy0 ] = toWorld(x0, y0), [ wx1, wy1 ] = toWorld(x1, y1);
    rows.push({ name, n, wx, wy, wx0, wy0, wx1, wy1, pts });
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));
  console.log('name                          px    world x,y      world box');
  rows.forEach((r) => console.log(
    `${r.name.padEnd(28)} ${String(r.n).padStart(4)}  ${String(r.wx).padStart(4)},${String(r.wy).padStart(5)}   ${r.wx0},${r.wy0}..${r.wx1},${r.wy1}`));
  fs.writeFileSync(path.join(DIR, 'coords.json'), JSON.stringify(rows.map(({ pts, ...r }) => r), null, 1));
  fs.writeFileSync(path.join(DIR, 'shapes.json'), JSON.stringify(rows.map((r) => ({ name: r.name, pts: r.pts })), null, 0));
  console.log(`\n${rows.length} locations -> ${path.join(DIR, 'coords.json')}`);
})().catch((e) => { console.error('failed:', e.message); process.exitCode = 1; });
