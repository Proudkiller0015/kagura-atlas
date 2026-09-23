'use strict';
/*
 * Halve a PNG's size, for art that only ever appears small.
 *
 *   node tools/shrink.js art/banners/coin-banner.png [width]
 *
 * A generated banner comes out around 1,700px and two megabytes, which is a lot
 * to send to everybody who opens `!gacha` for something Discord draws about 600
 * wide. Box-filtered down to the width asked for (default 1,000) and written
 * back over itself.
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const file = process.argv[2];
const want = Number(process.argv[3]) || 1000;
if (!file) { console.error('usage: node tools/shrink.js <file.png> [width]'); process.exit(1); }

const full = path.isAbsolute(file) ? file : path.join(__dirname, '..', file);
const src = PNG.sync.read(fs.readFileSync(full));
if (src.width <= want) { console.log(`${src.width}px already, left alone`); process.exit(0); }

const scale = src.width / want;
const out = new PNG({ width: want, height: Math.round(src.height / scale) });
for (let y = 0; y < out.height; y++) {
  for (let x = 0; x < out.width; x++) {
    // The block of source pixels this one stands for, averaged.
    const x0 = Math.floor(x * scale);
    const y0 = Math.floor(y * scale);
    const x1 = Math.min(src.width, Math.floor((x + 1) * scale));
    const y1 = Math.min(src.height, Math.floor((y + 1) * scale));
    let r = 0; let g = 0; let b = 0; let a = 0; let n = 0;
    for (let sy = y0; sy < y1; sy++) {
      for (let sx = x0; sx < x1; sx++) {
        const i = (src.width * sy + sx) << 2;
        r += src.data[i]; g += src.data[i + 1]; b += src.data[i + 2]; a += src.data[i + 3];
        n++;
      }
    }
    const o = (out.width * y + x) << 2;
    out.data[o] = Math.round(r / n);
    out.data[o + 1] = Math.round(g / n);
    out.data[o + 2] = Math.round(b / n);
    out.data[o + 3] = Math.round(a / n);
  }
}
const before = fs.statSync(full).size;
fs.writeFileSync(full, PNG.sync.write(out, { deflateLevel: 9 }));
const after = fs.statSync(full).size;
console.log(`${src.width}x${src.height} -> ${out.width}x${out.height}, ${Math.round(before / 1024)}kB -> ${Math.round(after / 1024)}kB`);
