'use strict';

/*
 * Real artwork for the Gensokyo places.
 *
 * Gensokyo is canon, so every picture here is official: art from Touhou
 * LostWord (the officially licensed game, whose location and "Report" story
 * cards are full-screen paintings of real places), stage backgrounds from the
 * Team Shanghai Alice / Twilight Frontier fighting games, and nothing else.
 * No fan art, nothing generated, nothing painted later. A place with no good
 * canon picture is left without one, and the map shows its "artwork coming"
 * card.
 *
 * Every pick below was chosen by hand and looked at - an article's images are
 * mostly character portraits and spell cards, so nothing is chosen by rule.
 * Modern, colour and large wins: LostWord's 2048x1024 scenery first, then the
 * 1280x720 backgrounds of Hopeless Masquerade / Urban Legend in Limbo /
 * Antinomy of Common Flowers, and the older games only where nothing newer
 * shows the place.
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
 * Three wikis, all MediaWiki: the Touhou LostWord wiki (wiki.gg), the Touhou
 * Wiki (en.touhouwiki.net - it only speaks HTTP/2, which fetch() does not, so
 * it goes through node:http2) and THBWiki (thwiki.cc, which keeps the
 * Antinomy of Common Flowers stage backgrounds).
 *
 * These are ZUN / Team Shanghai Alice's, Twilight Frontier's and GOOD SMILE
 * COMPANY / NextNinja's images, used the way a fan wiki uses them. Fine for a
 * private RP server; do not republish them commercially.
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
const UA = 'KaguraAtlas/1.0 (private Touhou/Pokemon RP map; one request per picture)';
const W = 1024;
const H = 683;
const QUALITY = 88;
const MIN_WIDTH = 600;

const WIKIS = {
	lw: { name: 'Touhou LostWord Wiki', base: 'https://touhoulostword.wiki.gg', h2: false },
	thw: { name: 'Touhou Wiki', base: 'https://en.touhouwiki.net', h2: true },
	thb: { name: 'THBWiki', base: 'https://thwiki.cc', h2: false },
};

/* LostWord's own picks carry the card's name; the game is the same for all. */
const LW = 'Touhou LostWord';

/*
 * map id -> the picture. `wiki` is where the file lives, `from` says what it
 * is, for the README. `anchor` is where the 3:2 crop sits (0 top / left, 0.5
 * middle, 1 bottom / right); the middle unless said.
 *
 * Places use their id, gym interiors g-<id>, routes route-<n> (the map asks
 * for "r301"; tools/wire-art.js maps one to the other).
 */
const PICKS = {
	/* places */
	village:        { wiki: 'lw', file: '3_Story_Card_Human_Village.png',         from: `${LW}, story card "Human Village"` },
	myouren:        { wiki: 'thw', file: 'Th135 Myouren Temple.png',              from: 'Hopeless Masquerade stage background' },
	hakurei:        { wiki: 'lw', file: '3_Story_Card_Hakurei_Shrine.png',        from: `${LW}, story card "Hakurei Shrine"` },
	forestofmagic:  { wiki: 'lw', file: '1_Story_Card_Report_＃9.png',             from: `${LW}, "Report #9": the Kirisame Magic Shop in the Forest of Magic` },
	kourindou:      { wiki: 'thw', file: 'Th145 Kourindou.png',                   from: 'Urban Legend in Limbo stage background' },
	mistylake:      { wiki: 'lw', file: '3_Story_Card_Misty_Lake.png',            from: `${LW}, story card "Misty Lake" (the mansion in the fog across the water)` },
	scarletmansion: { wiki: 'lw', file: '3_Story_Card_Scarlet_Devil_Mansion.png', from: `${LW}, story card "Scarlet Devil Mansion"` },
	bamboo:         { wiki: 'thw', file: 'Th145 Bamboo Forest.png',               from: 'Urban Legend in Limbo stage background' },
	eientei:        { wiki: 'lw', file: '3_Story_Card_Eientei.png',               from: `${LW}, story card "Eientei"` },
	genbu:          { wiki: 'thw', file: 'Th135 Genbu Ravine.png',                from: 'Hopeless Masquerade stage background' },
	tenguvillage:   { wiki: 'lw', file: '3_Story_Card_Mountains_Painted_Red.png', from: `${LW}, story card "Mountains Painted Red" (Youkai Mountain in autumn)` },
	moriya:         { wiki: 'lw', file: '1_Story_Card_Report_＃79.png',            from: `${LW}, "Report #79": the Moriya Shrine grounds` },
	netherworld:    { wiki: 'lw', file: '3_Story_Card_Netherworld.png',           from: `${LW}, story card "Netherworld"` },
	hakugyokurou:   { wiki: 'lw', file: '1_Story_Card_Report_＃52.png',            from: `${LW}, "Report #52": the garden of the Netherworld mansion` },
	windcave:       { wiki: 'lw', file: '4_Story_Card_Dark_Cave,_Bright_Webs.png', from: `${LW}, story card "Dark Cave, Bright Webs": Yamame in the cave on the way down (no scenery-only picture of the Wind Cave exists)` },
	formercapital:  { wiki: 'lw', file: '1_Story_Card_Report_＃69.png',            from: `${LW}, "Report #69": the old city streets of Former Hell` },
	chireiden:      { wiki: 'lw', file: '1_Story_Card_Report_＃70.png',            from: `${LW}, "Report #70": the Palace of the Earth Spirits` },
	gardenofsun:    { wiki: 'lw', file: '3_Story_Card_Garden_of_the_Sun.png',     from: `${LW}, story card "Garden of the Sun"` },
	namelesshill:   { wiki: 'lw', file: '3_Story_Card_Nameless_Hill.png',         from: `${LW}, story card "Nameless Hill" (the lily-of-the-valley field)` },
	muenzuka:       { wiki: 'lw', file: '3_Story_Card_Sanzu_River.png',           from: `${LW}, story card "Sanzu River": the river by the graveyard, Komachi's boat (no picture of Muenzuka itself at size)` },

	/* gym interiors */
	'g-hakurei':        { wiki: 'lw', file: '4_Story_Card_Waiting_in_Comfort.png',        from: `${LW}, story card "Waiting in Comfort": inside the shrine, at the kotatsu` },
	'g-scarletmansion': { wiki: 'lw', file: '1_Story_Card_Report_＃8.png',                 from: `${LW}, "Report #8": the mansion's great hall` },
	'g-moriya':         { wiki: 'lw', file: '5_Story_Card_Moriya_Anniversary.png',        from: `${LW}, story card "Moriya Anniversary": inside the shrine` },
	'g-eientei':        { wiki: 'thw', file: 'Th145Eientei.png',                          from: 'Urban Legend in Limbo stage background (the corridors)' },
	'g-hakugyokurou':   { wiki: 'thw', file: 'YuyukoStage.jpg',                           from: 'Immaterial and Missing Power stage background (inside, onto the garden)' },
	'g-chireiden':      { wiki: 'lw', file: '1_Story_Card_Report_＃71.png',                from: `${LW}, "Report #71": inside the Palace of the Earth Spirits` },
	'g-myouren':        { wiki: 'lw', file: '5_Story_Card_Myouren_Temple_Anniversary.png', from: `${LW}, story card "Myouren Temple Anniversary": inside the temple` },
	'g-gardenofsun':    { wiki: 'thb', file: '太阳花田的演奏舞台（凭依华）休息.png',             from: 'Antinomy of Common Flowers stage background: the concert stage in the Garden of the Sun' },

	/* routes: canon scenery of the road each one walks */
	'route-301': { wiki: 'thw', file: 'Th135 Hakurei Shrine.png',            from: 'Hopeless Masquerade stage background: the flagstone approach to the shrine' },
	'route-302': { wiki: 'lw', file: '4_Story_Card_Silent_Magic_Forest.png', from: `${LW}, story card "Silent Magic Forest": in the Forest of Magic` },
	'route-303': { wiki: 'lw', file: '3_Story_Card_Icy_Cool_Home.png',       from: `${LW}, story card "Icy Cool Home": Cirno's igloo near Misty Lake` },
	'route-304': { wiki: 'thw', file: 'Th105BambooForest.jpg',               from: 'Scarlet Weather Rhapsody stage background: the edge of the bamboo' },
	'route-305': { wiki: 'lw', file: '1_Story_Card_Report_＃29.png',          from: `${LW}, "Report #29": the stream upriver of Genbu Ravine` },
	'route-306': { wiki: 'lw', file: '5_Story_Card_Infinity_Garden.png',     from: `${LW}, story card "Infinity Garden": Yuuka in the sunflowers` },
};

/* Looked for and not found at a usable size in any official source. */
const NONE = {};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET: { status, body }. HTTP/2 for the wikis that need it. */
function get(url, h2) {
	if (!h2) {
		return fetch(url, { headers: { 'User-Agent': UA } })
			.then(async (r) => ({ status: r.status, body: Buffer.from(await r.arrayBuffer()) }));
	}
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

/** url, size and type of each file on one wiki, by title. */
async function info(wiki, files) {
	const w = WIKIS[wiki];
	const out = {};
	for (let i = 0; i < files.length; i += 40) {
		const titles = files.slice(i, i + 40).map((f) => 'File:' + f).join('|');
		const res = await get(`${w.base}/api.php?action=query&prop=imageinfo&iiprop=url|size|mime&format=json&titles=${encodeURIComponent(titles)}`, w.h2);
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

const credit = (p) => `${WIKIS[p.wiki].base}/index.php?title=${encodeURIComponent('File:' + p.file.replace(/ /g, '_'))}`;

function readme(done) {
	const rows = Object.keys(done).map((id) => {
		const p = PICKS[id];
		return `| \`${id}\` | [${p.file}](${credit(p)}) (${WIKIS[p.wiki].name}) | ${p.from} | ${done[id]} |`;
	});
	const gaps = Object.keys(NONE).map((id) => `- \`${id}\` - ${NONE[id]}`);
	return `# Gensokyo artwork

**Canon artwork only. Nothing generated, no fan art, nothing painted later.**

Gensokyo is Touhou's world, and its places have real, published pictures. Most
here are from **Touhou LostWord**, the officially licensed game: its location
story cards and its "Report" cards are full-screen paintings of real places. The
rest are stage backgrounds from the official fighting games. Where no picture of
a place exists, the closest canon scene stands in (the note says so).

Taken from the [Touhou LostWord Wiki](${WIKIS.lw.base}), the
[Touhou Wiki](${WIKIS.thw.base}) and [THBWiki](${WIKIS.thb.base}). They are
ZUN / Team Shanghai Alice's, Twilight Frontier's and GOOD SMILE COMPANY /
NextNinja's images, used the way a fan wiki uses them - fine for a private RP
server, not for anything commercial.

Fetched and converted by \`tools/fetch-gensokyo-art.js\`, then put on the map by
\`node tools/wire-art.js\`. Each is cut to 3:2 and saved as 1024x683 WebP at
quality ${QUALITY}, like Kagura's art. Routes have no canon pictures of their own,
so a route shows canon scenery of the road it walks.

## Pictures

| id | file | what it is | original size |
| --- | --- | --- | --- |
${rows.join('\n')}
${gaps.length ? `
## Still without a picture

These show the "artwork coming" card.

${gaps.join('\n')}
` : ''}`;
}

(async () => {
	const ids = Object.keys(PICKS);
	const meta = {};
	for (const wiki of Object.keys(WIKIS)) {
		const files = ids.filter((id) => PICKS[id].wiki === wiki).map((id) => PICKS[id].file);
		if (files.length) meta[wiki] = await info(wiki, files);
	}
	const ok = [];
	for (const id of ids) {
		const p = PICKS[id];
		const m = meta[p.wiki][p.file];
		let why = '';
		if (!m) why = 'not on the wiki';
		else if (!/^image\/(png|jpeg)$/.test(m.mime)) why = `not a picture (${m.mime})`;
		else if (m.width < MIN_WIDTH) why = `too small (${m.width}px)`;
		console.log(`  ${id.padEnd(17)} ${p.wiki.padEnd(4)}${(m ? `${m.width}x${m.height}` : '-').padEnd(10)} ${p.file}${why ? `   SKIP: ${why}` : ''}`);
		if (!why) ok.push(id);
	}
	console.log(`\n${ok.length} of ${ids.length} picks usable${Object.keys(NONE).length ? `; no canon picture: ${Object.keys(NONE).join(' ')}` : ''}`);
	if (!GO) {
		console.log(`\nDry run - run again with --yes to fetch into ${RAW} and convert into art/gensokyo/`);
		return;
	}

	fs.mkdirSync(RAW, { recursive: true });
	fs.mkdirSync(OUT, { recursive: true });
	const done = {};
	for (const id of ok) {
		const p = PICKS[id];
		const m = meta[p.wiki][p.file];
		const ext = m.mime === 'image/png' ? 'png' : 'jpg';
		const raw = path.join(RAW, `${id}.${ext}`);
		const res = await get(m.url, WIKIS[p.wiki].h2);
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
