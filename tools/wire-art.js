'use strict';

/*
 * Rebuild the ART table in regions/kagura.js from what is actually in
 * art/kagura/, so a new picture shows up on the map by dropping it in the
 * folder and running this.
 *
 *   node tools/wire-art.js
 *
 * File names are the ids the map asks for: "amber.webp" for a place,
 * "g-amber.webp" for its gym interior, "route-3.webp" for Route 3 (the map
 * calls that "r3"). When a place has both a .png and a .webp, the .webp wins.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const regionFile = path.join(root, 'regions', 'kagura.js');
const dir = path.join(root, 'art', 'kagura');

const art = {};
for (const file of fs.readdirSync(dir).sort()) {
	const m = file.match(/^(.+)\.(webp|png|jpe?g)$/);
	if (!m) continue;
	const id = m[1].replace(/^route-(\d+)$/, 'r$1').replace(/-paradise$/, '');
	if (art[id] && !file.endsWith('.webp')) continue;
	art[id] = file;
}

const body = Object.keys(art)
	.map((id) => `\t${/^[a-z_]\w*$/i.test(id) ? id : `'${id}'`}: '${art[id]}'`)
	.join(',\n');
const src = fs.readFileSync(regionFile, 'utf8');
const next = src.replace(/var ART = \{[\s\S]*?\n\};/, `var ART = {\n${body}\n};`);
if (next === src) console.log('ART table already up to date');
else { fs.writeFileSync(regionFile, next); console.log(`ART table now has ${Object.keys(art).length} pictures`); }
