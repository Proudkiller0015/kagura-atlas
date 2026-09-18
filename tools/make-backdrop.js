'use strict';
/*
 * Turn a real region map into a backdrop the atlas can draw.
 *
 * Generating Sinnoh's terrain from outlines produced something less legible
 * than the 2006 map it was copying, which is a bad trade. So the real artwork
 * is used as the ground: the sea is cut out of it - feathered, so it does not
 * end on a hard rectangle - and what is left is drawn over the atlas's own
 * ocean. Our markers, labels and route ribbons go on top as usual.
 *
 * Prints the `backdrop` line to paste into the region file, worked out with the
 * same fit as tools/trace-coast.js so art and coastline land in the same place.
 *
 *   node tools/make-backdrop.js <in.png> <out.png> [--out=x0,y0,x1,y1] [--feather=6]
 */

const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
const arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const [IN, OUTFILE] = files;
const BOX = String(arg('out', '40,-406,480,-95')).split(',').map(Number);
const FEATHER = Number(arg('feather', 6));
const SMOOTH = Number(arg('smooth', 2));
/*
 * Nearest-neighbour upscale, for a map that is pixel art.
 *
 * The in-game town map is 216 pixels across because it was drawn for a DS, and
 * blurring it up would be the one way to make it look worse. Doubling each pixel
 * into a square keeps every edge exactly where it was: it reads as pixel art on
 * purpose, which is what it is, rather than as a small picture stretched.
 */
const UP = Math.max(1, Number(arg('upscale', 1)));

const png = PNG.sync.read(fs.readFileSync(IN));
const { width: W, height: H, data } = png;

/*
 * Sea, on a painted map, runs from bright blue to a dark purple vignette at the
 * corners - so "blue beats red" called the corners land and the crop swallowed
 * the whole image. Blue clearly ahead of GREEN holds for both, and fails for
 * grass, rock and snow, which is what actually has to be told apart.
 */
const isSea = (i) => {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
  return (b - r) > 60;
};
let land = new Uint8Array(W * H);
for (let i = 0; i < W * H; i++) land[i] = isSea(i) ? 0 : 1;

/* Same majority filter as the tracer, so the cut-out matches the coastline. */
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

/* Drop specks so a few stray pixels of surf do not become islands. */
const label = new Int32Array(W * H).fill(-1);
const sizes = [];
for (let s = 0; s < W * H; s++) {
  if (!land[s] || label[s] >= 0) continue;
  const id = sizes.length;
  const stack = [s];
  let n = 0;
  label[s] = id;
  while (stack.length) {
    const p = stack.pop();
    n++;
    const x = p % W, y = (p / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (land[q] && label[q] < 0) { label[q] = id; stack.push(q); }
    }
  }
  sizes.push(n);
}
for (let i = 0; i < W * H; i++) if (land[i] && sizes[label[i]] < 600) land[i] = 0;

/* Distance from the sea, a few pixels deep, for a soft edge. */
const alpha = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) alpha[i] = land[i] ? FEATHER : 0;
for (let pass = 0; pass < FEATHER; pass++) {
  const next = Float32Array.from(alpha);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!land[y * W + x]) continue;
    let lo = alpha[y * W + x];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      lo = Math.min(lo, alpha[ny * W + nx] + 1);
    }
    next[y * W + x] = lo;
  }
  alpha.set(next);
}

/* Crop to the land, so the image carries no dead margin. */
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (land[y * W + x]) {
  if (x < x0) x0 = x; if (x > x1) x1 = x;
  if (y < y0) y0 = y; if (y > y1) y1 = y;
}
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

const out = new PNG({ width: cw * UP, height: ch * UP });
for (let y = 0; y < ch * UP; y++) for (let x = 0; x < cw * UP; x++) {
  const sxp = (x / UP) | 0, syp = (y / UP) | 0;
  const si = (syp + y0) * W + (sxp + x0), di = (y * cw * UP + x) * 4;
  out.data[di] = data[si * 4];
  out.data[di + 1] = data[si * 4 + 1];
  out.data[di + 2] = data[si * 4 + 2];
  out.data[di + 3] = Math.round(255 * Math.min(1, alpha[si] / FEATHER));
}
fs.mkdirSync(path.dirname(OUTFILE), { recursive: true });
fs.writeFileSync(OUTFILE, PNG.sync.write(out));

/* The same fit the tracer uses, so coastline and art agree. */
const scale = Math.min((BOX[2] - BOX[0]) / cw, (BOX[3] - BOX[1]) / ch);
const wWorld = cw * scale, hWorld = ch * scale;
const cx = BOX[0] + ((BOX[2] - BOX[0]) - wWorld) / 2 + wWorld / 2;
const cy = BOX[1] + ((BOX[3] - BOX[1]) - hWorld) / 2 + hWorld / 2;

console.log(`${W}x${H} -> cropped ${cw}x${ch}, land ${x0},${y0}..${x1},${y1}`);
console.log(`${OUTFILE} written\n`);
console.log('Paste into the region file:\n');
console.log(`\tbackdrop: { src: '${path.basename(OUTFILE)}', x: ${cx.toFixed(1)}, y: ${cy.toFixed(1)}, w: ${wWorld.toFixed(1)}, h: ${hWorld.toFixed(1)} },`);
console.log(`\n/* image pixel -> world:  wx = ${(BOX[0] + ((BOX[2] - BOX[0]) - wWorld) / 2).toFixed(2)} + (px - ${x0}) * ${scale.toFixed(4)}`);
console.log(`                         wy = ${(BOX[1] + ((BOX[3] - BOX[1]) - hWorld) / 2).toFixed(2)} + (py - ${y0}) * ${scale.toFixed(4)} */`);
