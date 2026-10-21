'use strict';

/*
 * Real artwork for the Gensokyo places, from the Touhou Wiki.
 *
 * Gensokyo is canon, so like Sinnoh before it its pictures have to be the real
 * ones: the official game backgrounds (the fighting games draw every stage as a
 * full-screen scene of a real place) and the official manga's scenery panels.
 * No fan art, nothing generated. A place with no good canon picture is left
 * without one, and the map shows its "artwork coming" card.
 *
 * Every pick below was chosen by hand and looked at: an article's images are
 * mostly character portraits and spell cards, so nothing is chosen by rule.
 *
 *   node tools/fetch-gensokyo-art.js            # say what it would fetch
 *   node tools/fetch-gensokyo-art.js --yes      # fetch, convert, write README
 *   node tools/fetch-gensokyo-art.js --yes --raw <dir>   # where downloads go
 *
 * Downloads land in a scratch folder outside the repo (default: the system temp
 * folder), and are then cut to 3:2 and written to art/gensokyo/ as 1024x683
 * WebP at quality 88 - the size and quality of Kagura's art - with ffmpeg.
 * Then run `node tools/wire-art.js` to put them on the map.
 *
 * The touhouwiki.net server only speaks HTTP/2, which fetch() does not, so
 * this talks to it through node:http2.
 *
 * These are ZUN / Team Shanghai Alice's images (and the manga artists'), used
 * the way a fan wiki uses them. Fine for a private RP server; do not republish
 * them commercially.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http2 = require('node:http2');
const { execFileSync } = require('node:child_process');

const GO = process.argv.includes('--yes');
const rawAt = process.argv.indexOf('--raw');
const RAW = rawAt > 0 ? path.resolve(process.argv[rawAt + 1]) : path.join(os.tmpdir(), 'gensokyo-art-raw');
const OUT = path.join(__dirname, '..', 'art', 'gensokyo');
const WIKI = 'https://en.touhouwiki.net';
const UA = 'KaguraAtlas/1.0 (private Touhou/Pokemon RP map; one request per picture)';
const W = 1024;
const H = 683;
const QUALITY = 88;
const MIN_WIDTH = 600;

/*
 * map id -> the picture. `page` is the wiki article the file is shown on,
 * `from` says what it is, for the README. `anchor` is where the 3:2 crop sits
 * (0 top / left, 0.5 middle, 1 bottom / right); the middle unless said.
 *
 * Places use their id, gym interiors g-<id>, routes route-<n> (the map asks
 * for "r301"; tools/wire-art.js maps one to the other).
 */
const PICKS = {
	/* places */
	village:        { file: 'Th135 Human Village.png',             page: 'Human Village',               from: 'Hopeless Masquerade stage background' },
	myouren:        { file: 'Th135 Myouren Temple.png',            page: 'Myouren Temple',              from: 'Hopeless Masquerade stage background' },
	hakurei:        { file: 'Th135 Hakurei Shrine.png',            page: 'Hakurei Shrine',              from: 'Hopeless Masquerade stage background' },
	forestofmagic:  { file: 'SWR MarisaStage.jpg',                 page: 'Forest of Magic',             from: 'Scarlet Weather Rhapsody stage background' },
	kourindou:      { file: 'Th145 Kourindou.png',                 page: 'Kourindou',                   from: 'Urban Legend in Limbo stage background' },
	mistylake:      { file: 'Th123MistyLake.png',                  page: 'Misty Lake',                  from: 'Touhou Hisoutensoku stage background' },
	scarletmansion: { file: 'CDS SDM.png',                         page: 'Scarlet Devil Mansion',       from: 'Foul Detective Satori (official manga), colour page' },
	bamboo:         { file: 'Th145 Bamboo Forest.png',             page: 'Bamboo Forest of the Lost',   from: 'Urban Legend in Limbo stage background' },
	eientei:        { file: 'FDS Eientei.png',                     page: 'Eientei',                     from: 'Foul Detective Satori (official manga) scenery panel' },
	genbu:          { file: 'Th135 Genbu Ravine.png',              page: 'Genbu Ravine',                from: 'Hopeless Masquerade stage background' },
	tenguvillage:   { file: 'SWR AyaStage.jpg',                    page: 'Youkai Mountain',             from: 'Scarlet Weather Rhapsody stage background (Youkai Mountain)' },
	moriya:         { file: 'Th123MoriyaShrine.jpg',               page: 'Moriya Shrine',               from: 'Touhou Hisoutensoku stage background' },
	netherworld:    { file: 'Th75NetherworldNight.jpg',            page: 'Netherworld',                 from: 'Immaterial and Missing Power stage background' },
	hakugyokurou:   { file: 'Th105Hakugyokurou.jpg',               page: 'Hakugyokurou',                from: 'Scarlet Weather Rhapsody stage background' },
	chireiden:      { file: 'Th135 Palace of the Earth Spirits.png', page: 'Palace of the Earth Spirits', from: 'Hopeless Masquerade stage background' },

	/* gym interiors */
	'g-hakurei':        { file: 'SSIBCH7HakureiShrine Interior.jpg', page: 'Hakurei Shrine',      from: 'Silent Sinner in Blue (official manga), inside the shrine', anchor: 0.35 },
	'g-scarletmansion': { file: 'Th75SDMLibraryDay.jpg',             page: 'Scarlet Devil Mansion', from: 'Immaterial and Missing Power stage background (the library)' },
	'g-eientei':        { file: 'Th145Eientei.png',                  page: 'Eientei',             from: 'Urban Legend in Limbo stage background (the corridors)' },
	'g-hakugyokurou':   { file: 'YuyukoStage.jpg',                   page: 'Hakugyokurou',        from: 'Immaterial and Missing Power stage background (inside, onto the garden)' },
	'g-chireiden':      { file: 'FileTh145Palaceof theEarthSpiritsNight.png', page: 'Palace of the Earth Spirits', from: 'Urban Legend in Limbo stage background (the hall by night)' },

	/* routes: canon scenery of the road each one walks */
	'route-301': { file: 'Th75HakureiShrineafternoon.jpg', page: 'Hakurei Shrine',            from: 'Immaterial and Missing Power stage background: the flagstone approach to the shrine' },
	'route-302': { file: 'Th75MarisaHouseNight.jpg',       page: 'Forest of Magic',           from: 'Immaterial and Missing Power stage background: the path into the Forest of Magic' },
	'route-304': { file: 'Th105BambooForest.jpg',          page: 'Bamboo Forest of the Lost', from: 'Scarlet Weather Rhapsody stage background: the edge of the bamboo' },
	'route-305': { file: 'Youkaimountain.jpg',             page: 'Youkai Mountain',           from: 'Scarlet Weather Rhapsody stage background: the rocky ground at the mountain's foot, toward the ravine' },
};

/* Looked for and not found: no canon picture good enough (the only ones are
   ~384px stage strips or small square book plates, which would be a blur at
   this size), so these keep the "artwork coming" card. */
const NONE = {
	windcave: 'only Subterranean Animism\'s abstract 384px stage strip',
	formercapital: 'only Subterranean Animism\'s abstract 384px stage strip',
	gardenofsun: 'only a 382px black-and-white plate in Perfect Memento in Strict Sense',
	namelesshill: 'only a 383px book plate and a 384px stage strip',
	muenzuka: 'only a 384px book plate; the manga panel has speech bubbles over it',
	'route-303': 'the one good Misty Lake shot is used by Misty Lake itself',
	'route-306': 'no canon sunflower scenery at size',
	'g-moriya': 'only a 384px Mountain of Faith stage strip',
	'g-myouren': 'no canon interior',
	'g-gardenofsun': 'no canon interior',
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET over HTTP/2: { status, body }. */
function get(url) {
	return new Promise((resolve, reject) => {
		const u = new URL(url);
		const client = http2.connect(u.origin);
		client.on('error', reject);
		const req = client.request({ ':path': u.pathname + u.search, 'user-agent': UA });
		const chunks = [];
		let status = 0;
		req.on('response', (h) => { status = h[':status']; });
		req.on('data', (d) => chunks.push(d));
		req.on('end', () => { client.close(); resolve({ status, body: Buffer.concat(chunks) }); });
		req.on('error', (e) => { client.close(); reject(e); });
		req.end();
	});
}

/** url, size and type of each file, by title. */
async function info(files) {
	const out = {};
	for (let i = 0; i < files.length; i += 40) {
		const titles = files.slice(i, i + 40).map((f) => 'File:' + f).join('|');
		const res = await get(`${WIKI}/api.php?action=query&prop=imageinfo&iiprop=url|size|mime&format=json&titles=${encodeURIComponent(titles)}`);
		const body = JSON.parse(res.body);
		const norm = {};
		for (const n of (body.query.normalized || [])) norm[n.to] = n.from;
		for (const p of Object.values(body.query.pages)) {
			const asked = (norm[p.title] || p.title).replace(/^File:/, '');
			out[asked] = p.imageinfo ? p.imageinfo[0] : null;
		}
	}
	return out;
}

const credit = (f) => `${WIKI}/index.php?title=${encodeURIComponent('File:' + f.replace(/ /g, '_'))}`;

function readme(done) {
	const rows = Object.keys(done).map((id) => {
		const p = PICKS[id];
		return `| \`${id}\` | [${p.file}](${credit(p.file)}) | ${p.from} | ${done[id]} |`;
	});
	const gaps = Object.keys(NONE).map((id) => `- \`${id}\` - ${NONE[id]}`);
	return `# Gensokyo artwork

**Canon artwork only. Nothing generated, no fan art.**

Gensokyo is Touhou's world, and its places have real, published pictures: the
fighting games draw each stage as a full-screen scene of a real place, and the
official manga has scenery panels. Those are used here, taken from the
[Touhou Wiki](${WIKI}) (the file pages say which game or book each is from).
They are ZUN / Team Shanghai Alice's images and the manga artists', used the way
a fan wiki uses them - fine for a private RP server, not for anything commercial.

Fetched and converted by \`tools/fetch-gensokyo-art.js\`, then put on the map by
\`node tools/wire-art.js\`. Each is cut to 3:2 and saved as 1024x683 WebP at
quality ${QUALITY}, like Kagura's art. Routes have no canon pictures of their own,
so a route shows canon scenery of the road it walks.

## Pictures

| id | file (Touhou Wiki) | what it is | original size |
| --- | --- | --- | --- |
${rows.join('\n')}

## Still without a picture

These show the "artwork coming" card. A good one can be dropped in as
\`<id>.webp\` (gym interiors \`g-<id>.webp\`, routes \`route-<n>.webp\`) and wired
with \`node tools/wire-art.js\`.

${gaps.join('\n')}
`;
}

(async () => {
	const ids = Object.keys(PICKS);
	const meta = await info(ids.map((id) => PICKS[id].file));
	const ok = [];
	for (const id of ids) {
		const p = PICKS[id];
		const m = meta[p.file];
		let why = '';
		if (!m) why = 'not on the wiki';
		else if (!/^image\/(png|jpeg)$/.test(m.mime)) why = `not a picture (${m.mime})`;
		else if (m.width < MIN_WIDTH) why = `too small (${m.width}px)`;
		console.log(`  ${id.padEnd(17)} ${(m ? `${m.width}x${m.height}` : '-').padEnd(10)} ${p.file}${why ? `   SKIP: ${why}` : ''}`);
		if (!why) ok.push(id);
	}
	console.log(`\n${ok.length} of ${ids.length} picks usable; ${Object.keys(NONE).length} ids have no canon picture: ${Object.keys(NONE).join(' ')}`);
	if (!GO) {
		console.log(`\nDry run - run again with --yes to fetch into ${RAW} and convert into art/gensokyo/`);
		return;
	}

	fs.mkdirSync(RAW, { recursive: true });
	fs.mkdirSync(OUT, { recursive: true });
	const done = {};
	for (const id of ok) {
		const p = PICKS[id];
		const m = meta[p.file];
		const ext = m.mime === 'image/png' ? 'png' : 'jpg';
		const raw = path.join(RAW, `${id}.${ext}`);
		const res = await get(m.url);
		if (res.status !== 200) { console.log(`  ! ${id}: HTTP ${res.status}`); continue; }
		fs.writeFileSync(raw, res.body);
		/* Cut the widest 3:2 window the picture has, at `anchor`, then scale. */
		const a = p.anchor === undefined ? 0.5 : p.anchor;
		const vf = `crop='min(iw,ih*3/2)':'min(ih,iw*2/3)':'(iw-ow)*${a}':'(ih-oh)*${a}',scale=${W}:${H}:flags=lanczos`;
		const out = path.join(OUT, `${id}.webp`);
		execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', vf, '-frames:v', '1',
			'-c:v', 'libwebp', '-quality', String(QUALITY), '-compression_level', '6', out]);
		done[id] = `${m.width}x${m.height}`;
		console.log(`  ${id.padEnd(17)} ${(fs.statSync(out).size / 1024).toFixed(0)}kB`);
		await sleep(250);
	}
	fs.writeFileSync(path.join(OUT, 'README.md'), readme(done));
	console.log(`\n${Object.keys(done).length} pictures in art/gensokyo/. Now: node tools/wire-art.js`);
})().catch((e) => { console.error('failed:', e.message); process.exitCode = 1; });
