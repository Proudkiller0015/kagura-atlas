/*
 * Gensokyo - something off the western edge of the chart.
 *
 * Not a region you can pick. It has no places, no routes and no panel: it is
 * only a little ground under a lot of mist, far enough west of Kagura that
 * nobody sees it unless they go looking. `secret: true` is what keeps it out of
 * the region picker, the search and the address bar; the terrain and its one
 * label are drawn like everything else in the shared world.
 *
 * Same coordinate space as regions/kagura.js. Kagura's west coast is at x 8;
 * this sits around x -320, out past the open sea.
 */
(function () {
	'use strict';

	var ISLE = [
		[-352,176],[-346,160],[-328,151],[-308,154],[-293,166],[-287,186],
		[-292,205],[-307,218],[-328,222],[-345,213],[-355,195]
	];

	window.ATLAS_REGIONS = window.ATLAS_REGIONS || {};
	window.ATLAS_REGIONS.gensokyo = {
		id: 'gensokyo',
		name: 'Gensokyo',
		secret: true,
		bounds: [-370, 140, -270, 236],
		ISLANDS: [ISLE],
		/* Pale, washed-out ground: whatever colour it has, the mist takes most of it. */
		BIOMES: [
			{ g0:[118,150,128], g1:[150,178,156], s0:[204,200,186], s1:[222,220,208] }
		],
		RIDGES: [
			{ x:-322, y:170, r:24, h:0.62 },
			{ x:-304, y:178, r:14, h:0.40 }
		],
		LAKES: [
			{ x:-334, y:204, r:6 }
		],
		/* The veil. Strength is how much of the ground it hides at the centre. */
		MISTS: [
			{ x:-320, y:187, r:78, a:0.62 }
		],
		/* The only words on it. */
		whisper: ['GENSOKYO', -320, 232, 'A land that isn’t on any chart…']
	};
})();
