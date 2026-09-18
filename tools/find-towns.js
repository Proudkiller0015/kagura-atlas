'use strict';
/*
 * Find the built-up places on a painted region map.
 *
 * Reading forty-six town positions off a picture by eye is slow and gets a
 * handful of them wrong. Towns are the only thing on this map painted in
 * saturated roof colours - reds, oranges and blues against green and rock - so
 * they can be found instead of guessed: colour the roof pixels, cluster them,
 * and print each cluster's centre in image pixels and in world coordinates.
 *
 *   node tools/find-towns.js <map.png> [--min=90] [--gap=14]
 */
const fs = require('node:fs'), { PNG } = require('pngjs');
const a = process.argv.slice(2), IN = a.find(x => !x.startsWith('--'));
const arg = (k, d) => { const v = a.find(x => x.startsWith(`--${k}=`)); return v ? Number(v.split('=')[1]) : d; };
const MIN = arg('min', 90), GAP = arg('gap', 14);
const OX = arg('ox', 51.02), OY = arg('oy', -406), SC = arg('scale', 0.4296);

const png = PNG.sync.read(fs.readFileSync(IN));
const { width: W, height: H, data } = png;
/*
 * A roof, and not a sunlit hillside. Rock on this map is r>g>b with a gentle
 * fall between them; a painted roof is a strong red, orange or blue that the
 * ground never reaches. Requiring a wide spread between the channels is what
 * separates them - at a gentler threshold the whole mountain range came back
 * as one enormous town.
 */
const roof = (i) => {
  const r = data[i*4], g = data[i*4+1], b = data[i*4+2];
  const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
  if (mx < 100 || mx - mn < 80) return false;
  if (g >= r && g >= b) return false;                  // vegetation
  const red  = r > g + 75 && r > 130 && b < r - 40;    // red and orange tiles
  const blue = b > r + 55 && b > 120 && g < b - 55;    // blue tiles
  return red || blue;
};
const mask = new Uint8Array(W*H);
for (let i = 0; i < W*H; i++) mask[i] = roof(i) ? 1 : 0;

/* Cluster by proximity, not just adjacency: a town is roofs with gaps between. */
const seen = new Uint8Array(W*H), out = [];
for (let s = 0; s < W*H; s++) {
  if (!mask[s] || seen[s]) continue;
  const stack = [s]; seen[s] = 1;
  let n = 0, sx = 0, sy = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    n++; sx += x; sy += y;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (let dy = -GAP; dy <= GAP; dy++) for (let dx = -GAP; dx <= GAP; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny*W + nx;
      if (mask[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
  }
  if (n >= MIN) out.push({ n, px: Math.round(sx/n), py: Math.round(sy/n), w: x1-x0, h: y1-y0 });
}
out.sort((p, q) => p.py - q.py || p.px - q.px);
console.log(`${out.length} built-up clusters (min ${MIN}px, gap ${GAP})\n`);
console.log('   px   py   size   ->  world x, y');
out.forEach((t) => {
  const wx = (OX + t.px * SC).toFixed(0), wy = (OY + t.py * SC).toFixed(0);
  console.log(`  ${String(t.px).padStart(4)} ${String(t.py).padStart(4)}  ${String(t.n).padStart(5)}   ->  ${String(wx).padStart(4)}, ${String(wy).padStart(5)}   (${t.w}x${t.h})`);
});
