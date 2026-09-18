'use strict';
/* Cut a reference map into readable tiles, so positions can be read off it.
   node tools/crop.js <in.png> <outdir> [--cols=3] [--rows=2] [--zoom=2] */
const fs = require('node:fs'), path = require('node:path'), { PNG } = require('pngjs');
const a = process.argv.slice(2), files = a.filter(x => !x.startsWith('--'));
const arg = (k, d) => { const v = a.find(x => x.startsWith(`--${k}=`)); return v ? Number(v.split('=')[1]) : d; };
const [IN, DIR] = files, COLS = arg('cols', 3), ROWS = arg('rows', 2), Z = arg('zoom', 2);
const src = PNG.sync.read(fs.readFileSync(IN));
fs.mkdirSync(DIR, { recursive: true });
const tw = Math.ceil(src.width / COLS), th = Math.ceil(src.height / ROWS);
for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
  const w = Math.min(tw, src.width - c * tw), h = Math.min(th, src.height - r * th);
  const out = new PNG({ width: w * Z, height: h * Z });
  for (let y = 0; y < h * Z; y++) for (let x = 0; x < w * Z; x++) {
    const si = ((r * th + (y / Z | 0)) * src.width + (c * tw + (x / Z | 0))) * 4, di = (y * w * Z + x) * 4;
    for (let k = 0; k < 4; k++) out.data[di + k] = src.data[si + k];
  }
  const f = path.join(DIR, `tile-r${r}c${c}.png`);
  fs.writeFileSync(f, PNG.sync.write(out));
  console.log(`${f}  image px x ${c * tw}..${c * tw + w}, y ${r * th}..${r * th + h}  (zoom ${Z}x)`);
}
