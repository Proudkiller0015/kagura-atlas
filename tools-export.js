/*
 * Export a region to JSON for the Discord bot.
 *
 * The map and the server should describe the same world, and the map is where
 * the world is actually written down. So the bot builds Discord from this
 * rather than from a list someone maintains by hand - a location added to the
 * region file appears in the server the next time the sync runs.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const id = process.argv[2] || 'kagura';
global.window = { ATLAS_REGIONS: {}, ATLAS_SPOTS: {} };
eval(fs.readFileSync(path.join(__dirname, 'regions', id + '.js'), 'utf8'));
// Per-channel writing, where the region has it: a channel topic should say what
// THAT room is, not repeat the town's blurb in all eight of them.
const spotsFile = path.join(__dirname, 'regions', id + '-spots.js');
if (fs.existsSync(spotsFile)) eval(fs.readFileSync(spotsFile, 'utf8'));
const R = global.window.ATLAS_REGIONS[id];
const SPOTS = global.window.ATLAS_SPOTS[id] || {};
const spotTopic = (placeId, chan) => {
  const here = SPOTS[placeId];
  const spot = here && (here.spots || []).find(s => s.c === chan);
  if (!spot) return null;
  const exits = (spot.to || []).join(', ');
  return (spot.d + (exits ? '  → ' + exits : '')).slice(0, 1024);
};

/* Major settlements get their own category; everything else shares one per
   island, so the sidebar stays navigable at forty-odd locations. */
const OWN = ['sakura','station','amber','minato','ghost','castle','ruins','silver','victory',
             'league','ember','cinder','shelf','tidecall','grotto','aether','abyss'];
const ISLAND_CAT = {
  'Hinode': 'Hinode — Wilds & Ways',
  'Kogarashi': 'Kogarashi — Wilds & Ways',
  'Shiomi': 'Shiomi — Wilds & Ways',
  'Tsuki': 'Tsuki — Wilds & Ways',
  'Open sea': 'The Open Sea',
  'Kagura Strait': 'The Open Sea'
};
const NAME = { abyss: 'Team Abyssal' };

const cats = new Map();
const add = (cat, ch, topic) => {
  if (!cats.has(cat)) cats.set(cat, []);
  const list = cats.get(cat);
  if (!list.some(c => c.name === ch)) list.push({ name: ch, topic });
};

R.PLACES.forEach(p => {
  const tags = [p.tier, p.gym, p.gate].filter(Boolean).join(' · ');
  const topic = (p.blurb || '').slice(0, 900) + (tags ? '  [' + tags + ']' : '');
  if (OWN.includes(p.id)) {
    const cat = NAME[p.id] || p.name;
    (p.chans || []).forEach(c => add(cat, c.replace(/^#/, ''), spotTopic(p.id, c) || topic));
  } else {
    const cat = ISLAND_CAT[p.island] || 'The Open Sea';
    /* One channel for a minor place, named for the place itself. */
    const first = (p.chans && p.chans[0]) || ('#' + p.id);
    add(cat, first.replace(/^#/, ''), spotTopic(p.id, first) || topic);
  }
});

Object.keys(R.ROUTE_INFO).forEach(n => {
  const r = R.ROUTE_INFO[n];
  add('The Routes', 'route-' + n,
      r.blurb + '  [' + r.from + ' → ' + r.to + ' · ' + r.tier + ' · ' + r.walk + ']');
});

const out = {
  region: R.name,
  generated: new Date().toISOString().slice(0, 10),
  categories: [...cats].map(([name, channels]) => ({ name, channels }))
};
fs.writeFileSync(path.join(__dirname, 'regions', id + '.discord.json'),
                 JSON.stringify(out, null, '\t') + '\n');
console.log(out.categories.length, 'categories,',
            out.categories.reduce((n, c) => n + c.channels.length, 0), 'channels');
