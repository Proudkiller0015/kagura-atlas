'use strict';
/*
 * Trace a region's coastline out of a reference map.
 *
 * The first Sinnoh coastline here was drawn freehand and looked like a potato.
 * Sinnoh is a real shape - Hokkaido, with a snowed-in cape at the top, a spine
 * down the middle and the Battle Zone off on its own to the north-east - so it
 * is traced rather than guessed: land and sea are told apart by colour, the
 * outline is walked with marching squares, and the result is simplified to the
 * handful of points a polygon in a region file actually wants.
 *
 *   node tools/trace-coast.js <image.png> [--out=x0,y0,x1,y1] [--tol=2] [--min=400]
 */

const fs = require('node:fs');
const { PNG } = require('pngjs');

const args = process.argv.slice(2);
const FILE = args.find((a) => !a.startsWith('--'));
const arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const OUT = String(arg('out', '40,-406,480,-95')).split(',').map(Number);
const TOL = Number(arg('tol', 2));
const MIN_AREA = Number(arg('min', 400));

const png = PNG.sync.read(fs.readFileSync(FILE));
const { width: W, height: H, data } = png;

/* Sea is blue: blue clearly ahead of red and green. Snow is bright in all three,
   so brightness alone would have called the north pole ocean. */
/*
 * Sea, on a painted map, runs from bright blue to a dark purple vignette at the
 * corners - so "blue beats red" called the corners land and the crop swallowed
 * the whole image. Blue clearly ahead of GREEN holds for both, and fails for
 * grass, rock and snow, which is what actually has to be told apart.
 */
const isSea = (i) => {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  return (b - g) > 20 && b > 60 && g < 200;
};
let land = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) land[i] = isSea(i) ? 0 : 1;

/*
 * A painted coastline is textured - surf, shingle, a line of trees - so the raw
 * mask comes out as lace and traces into hundreds of one-pixel steps. A few
 * passes of "become whatever most of your neighbours are" closes the lace and
 * leaves the shape, which is the only thing being traced.
 */
const SMOOTH = Number(arg('smooth', 3));
for (let pass = 0; pass < SMOOTH; pass++) {
  const next = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let n = 0, t = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      t++; n += land[ny * W + nx];
    }
    next[y * W + x] = n * 2 > t ? 1 : 0;
  }
  land = next;
}


/* An inland lake is sea by colour but is part of the land as far as the map is
   concerned, so only water that reaches the edge of the picture is really sea. */
const openSea = new Uint8Array(W * H);
const q = [];
for (let x = 0; x < W; x++) { q.push(x); q.push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { q.push(y * W); q.push(y * W + W - 1); }
q.forEach((p) => { if (!land[p]) openSea[p] = 1; });
for (let h = 0; h < q.length; h++) {
  const p = q[h];
  if (!openSea[p]) continue;
  const x = p % W, y = (p / W) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const n = ny * W + nx;
    if (!land[n] && !openSea[n]) { openSea[n] = 1; q.push(n); }
  }
}
for (let i = 0; i < W * H; i++) if (!land[i] && !openSea[i]) land[i] = 1;

/* Flood fill each landmass so islands can be told apart and the small ones dropped. */
const label = new Int32Array(W * H).fill(-1);
const blobs = [];
for (let s = 0; s < W * H; s++) {
  if (!land[s] || label[s] >= 0) continue;
  const id = blobs.length;
  const stack = [s];
  const px = [];
  label[s] = id;
  while (stack.length) {
    const p = stack.pop();
    px.push(p);
    const x = p % W, y = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (land[q] && label[q] < 0) { label[q] = id; stack.push(q); }
    }
  }
  blobs.push({ id, px });
}
blobs.sort((a, b) => b.px.length - a.px.length);
const keep = blobs.filter((b) => b.px.length >= MIN_AREA);

/** Walk one blob's boundary, keeping land on the right (Moore neighbourhood). */
function outline(blob) {
  const set = new Set(blob.px);
  let start = blob.px[0];
  for (const p of blob.px) if (p < start) start = p;
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const at = (x, y) => set.has(y * W + x);
  const pts = [];
  let cx = start % W, cy = (start / W) | 0, dir = 0;
  const sx = cx, sy = cy;
  let guard = 0;
  do {
    pts.push([cx, cy]);
    let moved = false;
    for (let k = 0; k < 8; k++) {
      const d = (dir + 6 + k) % 8;
      const nx = cx + dirs[d][0], ny = cy + dirs[d][1];
      if (at(nx, ny)) { cx = nx; cy = ny; dir = d; moved = true; break; }
    }
    if (!moved) break;
  } while ((cx !== sx || cy !== sy) && ++guard < W * H * 4);
  return pts;
}

/** Douglas-Peucker: keep the corners that matter, drop the rest. */
function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keepIt = new Uint8Array(pts.length);
  keepIt[0] = keepIt[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let worst = -1, wi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
      if (d > worst) { worst = d; wi = i; }
    }
    if (worst > tol) { keepIt[wi] = 1; stack.push([a, wi], [wi, b]); }
  }
  return pts.filter((_, i) => keepIt[i]);
}

/* Fit every landmass into the target box together, so they keep their true
   positions relative to one another - the Battle Zone has to stay north-east. */
let x0 = W, y0 = H, x1 = 0, y1 = 0;
keep.forEach((b) => b.px.forEach((p) => {
  const x = p % W, y = (p / W) | 0;
  if (x < x0) x0 = x; if (x > x1) x1 = x;
  if (y < y0) y0 = y; if (y > y1) y1 = y;
}));
const scale = Math.min((OUT[2] - OUT[0]) / (x1 - x0), (OUT[3] - OUT[1]) / (y1 - y0));
const padX = ((OUT[2] - OUT[0]) - (x1 - x0) * scale) / 2;
const padY = ((OUT[3] - OUT[1]) - (y1 - y0) * scale) / 2;
const toRegion = ([x, y]) => [
  Math.round(OUT[0] + padX + (x - x0) * scale),
  Math.round(OUT[1] + padY + (y - y0) * scale),
];

console.log(`${W}x${H}, land bbox ${x0},${y0}..${x1},${y1}, scale ${scale.toFixed(3)}`);
console.log(`${blobs.length} landmasses, ${keep.length} above ${MIN_AREA}px\n`);

keep.slice(0, 8).forEach((b, n) => {
  const ring = simplify(outline(b), TOL).map(toRegion);
  const dedup = ring.filter((p, i) => i === 0 || p[0] !== ring[i - 1][0] || p[1] !== ring[i - 1][1]);
  let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9;
  dedup.forEach((p) => { bx0 = Math.min(bx0, p[0]); by0 = Math.min(by0, p[1]); bx1 = Math.max(bx1, p[0]); by1 = Math.max(by1, p[1]); });
  console.log(`/* landmass ${n}: ${b.px.length}px -> ${dedup.length} points, spans x ${bx0}..${bx1}, y ${by0}..${by1} */`);
  const rows = [];
  for (let i = 0; i < dedup.length; i += 8) rows.push('  ' + dedup.slice(i, i + 8).map((p) => `[${p[0]},${p[1]}]`).join(','));
  console.log('[\n' + rows.join(',\n') + '\n],\n');
});
