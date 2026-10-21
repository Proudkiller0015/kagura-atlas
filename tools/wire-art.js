'use strict';

/*
 * Rebuild the ART table in each region file from what is actually in its art
 * folder, so a new picture shows up on the map by dropping it in the folder and
 * running this.
 *
 *   node tools/wire-art.js              # every region
 *   node tools/wire-art.js gensokyo     # just one
 *
 * A region is regions/<name>.js with a `var ART = { ... };` table, and its
 * pictures are in art/<name>/. File names are the ids the map asks for:
 * "amber.webp" for a place, "g-amber.webp" for its gym interior,
 * "route-3.webp" for Route 3 (the map calls that "r3"). When a place has both
 * a .png and a .webp, the .webp wins.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const only = process.argv[2];

function wire(name) {
	const regionFile = path.join(root, 'regions', `${name}.js`);
	const dir = path.join(root, 'art', name);
	const src = fs.readFileSync(regionFile, 'utf8');
	if (!/var ART = \{[\s\S]*?\n\t*\};/.test(src)) { console.log(`${name}: no "var ART = {" table, skipped`); return; }
	if (!fs.existsSync(dir)) { console.log(`${name}: no art/${name}/ folder, skipped`); return; }

	const art = {};
	for (const file of fs.readdirSync(dir).sort()) {
		const m = file.match(/^(.+)\.(webp|png|jpe?g)$/);
		if (!m) continue;
		const id = m[1].replace(/^route-(\d+)$/, 'r$1').replace(/-paradise$/, '');
		if (art[id] && !file.endsWith('.webp')) continue;
		art[id] = file;
	}

	/* Keep the table at the indent it already has. */
	const indent = src.match(/(\t*)var ART = \{/)[1];
	const body = Object.keys(art)
		.map((id) => `${indent}\t${/^[a-z_]\w*$/i.test(id) ? id : `'${id}'`}: '${art[id]}'`)
		.join(',\n');
	const next = src.replace(/var ART = \{[\s\S]*?\n\t*\};/, `var ART = {\n${body}\n${indent}};`);
	if (next === src) console.log(`${name}: ART table already up to date`);
	else { fs.writeFileSync(regionFile, next); console.log(`${name}: ART table now has ${Object.keys(art).length} pictures`); }
}

const names = only ? [only] : fs.readdirSync(path.join(root, 'regions'))
	.filter((f) => f.endsWith('.js')).map((f) => f.replace(/\.js$/, ''));
names.forEach(wire);
