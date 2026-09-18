'use strict';

/*
 * Real artwork for the Sinnoh places, from Bulbapedia.
 *
 * Sinnoh is canon, so its pictures have to be the real ones - see
 * art/sinnoh/README.md. Each place here names its Bulbapedia article and takes
 * that article's lead image at 640px, which is the width Kagura's art is drawn
 * at, so the two regions look like one atlas rather than two.
 *
 * Nothing is generated and nothing is invented: a place whose article has no
 * lead image is left without art, and the map shows its "artwork coming" card.
 *
 *   node tools/fetch-sinnoh-art.js            # say what it would fetch
 *   node tools/fetch-sinnoh-art.js --yes      # fetch, and print the ART map
 *
 * These are Nintendo / Game Freak's images, used the way a fan wiki uses them.
 * Fine for a private RP server; do not republish them commercially.
 */

const fs = require('node:fs');
const path = require('node:path');

const GO = process.argv.includes('--yes');
const OUT = path.join(__dirname, '..', 'art', 'sinnoh');
const API = 'https://bulbapedia.bulbagarden.net/w/api.php';
const UA = 'KaguraAtlas/1.0 (private Pokemon RP map; one request per place)';
const SIZE = 640;

/* place id in regions/sinnoh.js -> its Bulbapedia article */
const PAGES = {
  twinleaf: 'Twinleaf Town',            lakeverity: 'Lake Verity',
  sandgem: 'Sandgem Town',              palpark: 'Pal Park',
  jubilife: 'Jubilife City',            ravagedpath: 'Ravaged Path',
  canalave: 'Canalave City',            ironisland: 'Iron Island',
  fullmoon: 'Fullmoon Island',          newmoon: 'Newmoon Island',
  oreburghgate: 'Oreburgh Gate',        oreburgh: 'Oreburgh City',
  waywardcave: 'Wayward Cave',          floaroma: 'Floaroma Town',
  windworks: 'Valley Windworks',        fuego: 'Fuego Ironworks',
  eternaforest: 'Eterna Forest',        chateau: 'Old Chateau',
  eterna: 'Eterna City',                coronet: 'Mt. Coronet',
  hearthome: 'Hearthome City',          losttower: 'Lost Tower',
  solaceon: 'Solaceon Town',            solaceonruins: 'Solaceon Ruins',
  veilstone: 'Veilstone City',          lakevalor: 'Lake Valor',
  valorlakefront: 'Valor Lakefront',    sendoff: 'Sendoff Spring',
  turnback: 'Turnback Cave',            pastoria: 'Pastoria City',
  greatmarsh: 'Great Marsh',            sunyshore: 'Sunyshore City',
  celestic: 'Celestic Town',            spearpillar: 'Spear Pillar',
  distortion: 'Distortion World',       lakeacuity: 'Lake Acuity',
  snowpoint: 'Snowpoint City',          snowpointtemple: 'Snowpoint Temple',
  sinnohvictory: 'Victory Road (Sinnoh)', sinnohleague: 'Pokémon League (Sinnoh)',
  flowerparadise: 'Flower Paradise',    battlefrontier: 'Battle Frontier (Generation IV)',
  fightarea: 'Fight Area',              survivalarea: 'Survival Area',
  resortarea: 'Resort Area',            starkmountain: 'Stark Mountain',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (url) => fetch(url, { headers: { 'User-Agent': UA } });

/*
 * The right picture of a place, by era.
 *
 * A page's lead image is usually the newest one, which here means BDSP - the
 * 2021 remake, a different art style entirely from the game this region is
 * built on. So the images on each article are listed and chosen by name:
 * Platinum first, then Diamond/Pearl, which is the same era and the same look.
 * Anything BDSP is refused outright rather than used as a fallback.
 */
const BDSP = /BDSP|Brilliant|Shining/i;
const rank = (title) => {
  if (BDSP.test(title)) return -1;
  if (/Pt|Platinum/i.test(title)) return 3;
  if (/DP|DPPt/i.test(title)) return 2;
  /* Legends: Arceus is Hisui - the same land two centuries earlier, and it does
     not look like Sinnoh. Out for the same reason BDSP is. */
  if (/HGSS|ORAS|XY|SwSh|USUM|Masters|anime|TCG|Adventures|Hisui|Legends|Arceus/i.test(title)) return -1;
  return 1;
};

/** Every image on an article, best era first. */
async function bestImage(title) {
  /*
   * An article carries every image it mentions - Pokemon sprites, badges, the
   * Poketch - and without this the picture of Sandgem Town was an Arcanine.
   * A picture OF a place has the place in its filename.
   */
  const key = title.replace(/\(.*\)/, '').replace(/(Town|City|Island|Cave|Road|Route|Lake|Mt\.?|Path|Area|Gate|Forest|Spring|Ruins|Tower|Works|Ironworks|Park|Marsh|Temple|Pillar|World|Paradise|Frontier|Mountain|League|Chateau)/gi, '').trim();
  const want = key.split(/\s+/).filter((w) => w.length > 3);
  const url = `${API}?action=query&generator=images&gimlimit=200&prop=imageinfo&iiprop=url|size` +
    `&format=json&redirects=1&titles=${encodeURIComponent(title)}`;
  const res = await get(url);
  if (!res.ok) return null;
  const body = await res.json();
  const pages = (body.query && body.query.pages) || {};
  /* The canonical shot of a place is "<Place> Pt.png" or "<Place> DP.png".
     Anything else is an interior, an anime still or a card, so it ranks below. */
  const plain = title.replace(/\(.*\)/, '').trim().replace(/[^\w ]/g, '.');
  const exact = new RegExp('^File:' + plain + ' (Pt|DP|DPPt)\.(png|jpg)$', 'i');
  const cands = Object.values(pages)
    .filter((p) => p.imageinfo && p.imageinfo[0] && /\.(png|jpg|jpeg)$/i.test(p.title))
    .filter((p) => p.imageinfo[0].width >= 200)
    .filter((p) => !want.length || want.every((w) => new RegExp(w, 'i').test(p.title)))
    .map((p) => ({ title: p.title, info: p.imageinfo[0], r: rank(p.title) }))
    .filter((c) => c.r > 0)
    .map((c) => (exact.test(c.title) ? { ...c, r: c.r + 10 } : c))
    .filter((c) => !/JN|Evolutions|Series|episode/i.test(c.title))
    .sort((a, b) => b.r - a.r || b.info.width - a.info.width);
  return cands[0] || null;
}

(async () => {
  const ids = Object.keys(PAGES);
  const found = {};
  const era = {};
  for (const id of ids) {
    const pick = await bestImage(PAGES[id]);
    if (pick) {
      const thumb = pick.info.width > SIZE
        ? pick.info.url.replace('/media/upload/', '/media/upload/thumb/') + `/${SIZE}px-${pick.title.replace(/^File:/, '').replace(/ /g, '_')}`
        : pick.info.url;
      found[PAGES[id]] = thumb;
      era[id] = pick.title.replace(/^File:/, '');
    }
    await sleep(250);
  }

  const have = ids.filter((i) => found[PAGES[i]]);
  const missing = ids.filter((i) => !found[PAGES[i]]);
  console.log(`${have.length} of ${ids.length} places have a lead image at ${SIZE}px`);
  if (missing.length) console.log(`no image on their article: ${missing.join(' ')}`);
  if (!GO) {
    have.slice(0, 10).forEach((i) => console.log(`  ${i.padEnd(16)} <- ${era[i]}`));
    console.log(`\nDry run - run again with --yes to fetch ${have.length} images into art/sinnoh/`);
    return;
  }

  fs.mkdirSync(OUT, { recursive: true });
  const ART = {};
  let bytes = 0;
  for (const id of have) {
    const src = found[PAGES[id]];
    const ext = (src.match(/\.(png|jpg|jpeg|gif)$/i) || [, 'png'])[1].toLowerCase();
    const file = `${id}.${ext === 'jpeg' ? 'jpg' : ext}`;
    const res = await get(src);
    if (!res.ok) { console.log(`  ! ${id}: ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(OUT, file), buf);
    ART[id] = file;
    bytes += buf.length;
    console.log(`  ${id.padEnd(16)} ${file.padEnd(24)} ${(buf.length / 1024).toFixed(0)}kB`);
    await sleep(250);
  }

  console.log(`\n${Object.keys(ART).length} images, ${(bytes / 1048576).toFixed(1)}MB`);
  console.log('\nPaste into regions/sinnoh.js:\n');
  console.log('var ART = {\n' + Object.keys(ART).sort()
    .map((k) => `\t${k}: '${ART[k]}',`).join('\n') + '\n};');
  fs.writeFileSync(path.join(OUT, 'art-map.json'), JSON.stringify(ART, null, 2));
})().catch((e) => { console.error('failed:', e.message); process.exitCode = 1; });
