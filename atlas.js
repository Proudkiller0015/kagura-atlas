/*
 * The atlas engine.
 *
 * This file knows how to draw a region. It does not know anything about any
 * particular region - the islands, routes, places and artwork all arrive from
 * regions/<id>.js. Adding a region is adding a data file and one line in
 * index.html; nothing in here changes.
 *
 * The region fields are bound to local names on load so the drawing code below
 * can stay written the way it reads best, and switching regions is a rebind
 * plus a redraw rather than a reload.
 */
(function () {
	'use strict';

	var KOGARASHI, HINODE, SHIOMI, TSUKI, LAGOON, ISLETS, LINKS, ISLANDS, RIDGES,
	    FORESTS, RIVERS, ROUTES, GRASS_PATCHES, PLACES, ROUTE_INFO, PLANS, ART, GYMS, LAKES, BIOMES, SEABED, OVERLAYS,
	    BRIDGES, RAIL, FERRIES, TRAILS, BACKDROPS = [];
	var REGION = null, ARTDIR = '', CONN = { byPlace: {}, byRoad: {} };

	/*
	 * One ocean, many regions.
	 *
	 * Regions used to be separate maps, each with its own 512x384 sheet, which
	 * meant there was nowhere for a second continent to *be*. Now every region
	 * is authored in the same world coordinate space and simply occupies a
	 * different part of it - so the sea between Kagura and whatever comes next
	 * is real sea you can drag across, not a page break.
	 *
	 * The terrain is generated from outlines rather than stored as an image,
	 * which is what makes that affordable: adding a continent adds polygons, not
	 * pixels, and nothing already drawn has to be redrawn.
	 */
	var WORLD = { x0: 0, y0: 0, x1: 512, y1: 384 };

	function buildWorld() {
		ISLANDS = []; LAGOON = null; ISLETS = []; LINKS = [];
		RIDGES = []; FORESTS = []; RIVERS = []; ROUTES = [];
		GRASS_PATCHES = []; PLACES = []; ROUTE_INFO = {}; PLANS = {};
		LAKES = []; BIOMES = []; SEABED = []; OVERLAYS = [];
		BRIDGES = []; RAIL = []; FERRIES = []; TRAILS = [];
		BACKDROPS = [];
		var first = true;
		Object.keys(window.ATLAS_REGIONS).forEach(function (rid) {
			var r = window.ATLAS_REGIONS[rid];
			var b = r.bounds || [0, 0, r.W || 512, r.H || 384];
			if (first) { WORLD = { x0: b[0], y0: b[1], x1: b[2], y1: b[3] }; first = false; }
			else {
				WORLD.x0 = Math.min(WORLD.x0, b[0]); WORLD.y0 = Math.min(WORLD.y0, b[1]);
				WORLD.x1 = Math.max(WORLD.x1, b[2]); WORLD.y1 = Math.max(WORLD.y1, b[3]);
			}
			ISLANDS = ISLANDS.concat(r.ISLANDS || []);
			ISLETS = ISLETS.concat(r.ISLETS || []);
			LINKS = LINKS.concat(r.LINKS || []);
			RIDGES = RIDGES.concat(r.RIDGES || []);
			FORESTS = FORESTS.concat(r.FORESTS || []);
			RIVERS = RIVERS.concat(r.RIVERS || []);
			ROUTES = ROUTES.concat(r.ROUTES || []);
			GRASS_PATCHES = GRASS_PATCHES.concat(r.GRASS_PATCHES || []);
			LAKES = LAKES.concat(r.LAKES || []);
			BIOMES = BIOMES.concat(r.BIOMES || []);
			SEABED = SEABED.concat(r.SEABED || []);
			BRIDGES = BRIDGES.concat(r.BRIDGES || []);
			TRAILS = TRAILS.concat(r.TRAILS || []);
			FERRIES = FERRIES.concat(r.FERRIES || []);
			if (r.RAIL) RAIL = r.RAIL;
			if (r.backdrop) BACKDROPS.push({ src: (r.art || '') + r.backdrop.src, x: r.backdrop.x, y: r.backdrop.y, w: r.backdrop.w, h: r.backdrop.h, roads: !!r.backdrop.roads });
			(r.OVERLAYS || []).forEach(function (o) {
				OVERLAYS.push({ src: (r.art || '') + o.src, x:o.x, y:o.y, w:o.w, h:o.h });
			});
			PLACES = PLACES.concat(r.PLACES || []);
			if (r.LAGOON) LAGOON = r.LAGOON;
			var ri = r.ROUTE_INFO || {}, pl = r.PLANS || {};
			Object.keys(ri).forEach(function (k) { ROUTE_INFO[k] = ri[k]; });
			Object.keys(pl).forEach(function (k) { PLANS[k] = pl[k]; });
		});
		/* Ocean margin, so the coasts are not flush with the edge of the world. */
		WORLD.x0 -= 90; WORLD.y0 -= 70; WORLD.x1 += 90; WORLD.y1 += 70;
		W = WORLD.x1; H = WORLD.y1;
	}

	/* Switching region no longer swaps the world - it only changes which part of
	   it you are looking at, and which artwork folder is current. */
	function bind(r) {
		REGION = r;
		if (typeof showRotation === 'function') showRotation(r);
		ART = r.ART || {}; GYMS = r.GYMS || {}; ARTDIR = r.art || '';
		/* Where everything joins, worked out from the roads themselves (connections.js). */
		CONN = (window.ATLAS_CONNECTIONS && window.ATLAS_CONNECTIONS.build(r)) || { byPlace: {}, byRoad: {} };
	}

	/*
	 * "Where can I go from here", on every panel.
	 *
	 * A player reading a town's page could see what is in the town and nothing
	 * about how the town joins the rest of the island: Route 1 was drawn on the
	 * map and named nowhere else. Each row is the road and where it comes out,
	 * and pressing it walks the map there.
	 */
	function waysOut(placeId) {
		var list = (CONN.byPlace && CONN.byPlace[placeId]) || [];
		if (!list.length) return '';
		/*
		 * One row per destination, however many ways there are of getting there.
		 *
		 * Kagura Station reached Watari Bridge by a route, a connecting road and a
		 * bridge, and Sakura Town by Route 1 and by the railway, so the list read
		 * as ten ways out of a place with six neighbours. The ways are already
		 * sorted best-first, so the first one names the row and the rest are named
		 * after it.
		 */
		var order = [];
		var byTo = {};
		list.forEach(function (c) {
			var key = c.to || c.toName;
			if (!byTo[key]) { byTo[key] = [c]; order.push(key); }
			else byTo[key].push(c);
		});
		var rows = order.map(function (key) {
			var ways = byTo[key];
			var c = ways[0];
			var arrive = c.toName || c.to;
			var note = c.walk && c.kind === 'route' ? ' &middot; ' + c.walk : '';
			var also = ways.slice(1).map(function (w) { return w.via; });
			if (also.length) note += ' &middot; or ' + also.join(', ');
			return '<li><button class="wayto" data-go="' + (c.to || '') + '">' +
				'<span>' + arrive + '</span><span class="wayvia">' + c.via + note + '</span></button></li>';
		}).join('');
		return '<p class="dlabel">WHERE YOU CAN GO</p><ul class="ways">' + rows + '</ul>';
	}

	/** The places a road runs between, as buttons. */
	function roadEnds(roadId) {
		var road = CONN.byRoad && CONN.byRoad[roadId];
		if (!road) return '';
		var ids = [].concat(road.ends[0] || [], road.ends[1] || []);
		var seen = {};
		var rows = ids.filter(function (id) { if (seen[id]) return false; seen[id] = true; return true; })
			.map(function (id) {
				var name = id;
				for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) name = PLACES[i].name;
				return '<li><button class="wayto" data-go="' + id + '"><span>' + name + '</span>' +
					'<span class="wayvia">one end of this road</span></button></li>';
			}).join('');
		return rows ? '<p class="dlabel">RUNS BETWEEN</p><ul class="ways">' + rows + '</ul>' : '';
	}

	/*
	 * One world, drawn twice.
	 *
	 * Everything below draws through fill(), which applies the current view - an
	 * origin and a zoom - before it touches the canvas. So the region map and a
	 * town's own map are the same code with a different view, and a town is not
	 * an upscaled crop of the region picture: it is the same ground rendered
	 * again at four times the detail, because the terrain is procedural and can
	 * be asked for at any resolution.
	 *
	 * That is the difference between zooming a photograph and walking closer.
	 */
	var W = 512, H = 384;   /* replaced per region by bind() */
	var V = { scale: 1, ox: 0, oy: 0 };

	var C = {
		deep:[38,72,148], ocean:[52,94,178], mid:[66,128,196], shallow:[92,198,208], foam:[166,232,236],
		sand:[234,214,154], sandDark:[198,174,118], grass:[122,198,96], grassLo:[100,178,80], grassHi:[148,214,116],
		tree:[42,126,64], treeHi:[66,158,82], treeDk:[26,92,50],
		haunt:[116,96,164], hauntHi:[146,124,190], hauntDk:[72,56,112],
		rock:[186,150,98], rockLo:[150,114,70], rockDk:[112,80,48], rockHi:[214,186,134],
		snow:[242,246,250], snowDk:[206,218,232], lava:[222,104,44], lavaHi:[248,176,72],
		river:[96,186,216], route:[232,210,158], routeDk:[196,168,116], rail:[96,104,114],
		wall:[246,244,236], wallDk:[206,200,186], roof:[198,56,52], roofDk:[150,34,34],
		gym:[232,180,60], gymDk:[176,128,28], outline:[26,38,48],
		steel:[216,228,236], steelDk:[150,176,194], bridge:[176,142,96],
		grassTall:[46,138,62], grassTall2:[34,116,52], crop:[168,196,92], cropDk:[122,150,66],
		coast:[30,52,96], shelf:[74,152,206], sandHi:[244,228,176], shadow:[40,70,60]
	};

	function hash(x, y) {
		var h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
		h = Math.imul(h ^ (h >>> 13), 1274126177);
		return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
	}
	function vnoise(x, y) {
		var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
		var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
		return hash(xi,yi)*(1-u)*(1-v) + hash(xi+1,yi)*u*(1-v) + hash(xi,yi+1)*(1-u)*v + hash(xi+1,yi+1)*u*v;
	}
	function fbm(x, y, oct) {
		var s = 0, amp = 1, f = 1, norm = 0;
		for (var i = 0; i < oct; i++) { s += amp * vnoise(x*f, y*f); norm += amp; amp *= 0.5; f *= 2; }
		return s / norm;
	}

	/* ---------------------------------------------------------- geometry ---- */
	function inside(poly, x, y) {
		var hit = false;
		for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
			if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
		}
		return hit;
	}
	/* Math.hypot is several times slower than a square root in V8, and the
	   terrain asks for a length millions of times a frame. */
	function len(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }
	function distToSeg(px, py, x1, y1, x2, y2) {
		var dx = x2 - x1, dy = y2 - y1;
		var t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy || 1);
		t = t < 0 ? 0 : t > 1 ? 1 : t;
		return len(px - (x1 + t * dx), py - (y1 + t * dy));
	}
	function distToPoly(poly, x, y) {
		var best = 1e9;
		for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			var d = distToSeg(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
			if (d < best) best = d;
		}
		return best;
	}
	/*
	 * How far inside the land you are, and which island you are on.
	 *
	 * The island index rides along in a module variable rather than being
	 * returned: this runs once per pixel and allocating a result object for
	 * every one of them is the difference between a map that drags and one that
	 * stutters. Read FIELD_ISLAND immediately after calling.
	 *
	 * Three octaves of displacement instead of one. A single wide wobble gives
	 * smooth potato-shaped islands; adding a medium and a fine pass is what
	 * produces bays, headlands and the small ragged detail that makes a
	 * coastline look like a coastline.
	 */
	var FIELD_ISLAND = -1;

	/*
	 * Each island's bounding box. A point outside a box is at least that far
	 * from the island's coast, so once a nearer (or containing) island has been
	 * found, islands whose box is further away can be skipped without changing
	 * the answer - which out at sea is nearly all of them.
	 */
	var BOXES = null, BOXES_FOR = null;
	function islandBoxes() {
		if (BOXES_FOR === ISLANDS) return BOXES;
		BOXES = ISLANDS.map(function (poly) {
			var b = [1e9, 1e9, -1e9, -1e9];
			poly.forEach(function (q) { b[0] = Math.min(b[0], q[0]); b[1] = Math.min(b[1], q[1]); b[2] = Math.max(b[2], q[0]); b[3] = Math.max(b[3], q[1]); });
			return b;
		});
		BOXES_FOR = ISLANDS;
		return BOXES;
	}

	function landField(x, y) {
		var best = -1e9, which = -1;
		var boxes = islandBoxes();
		for (var k = 0; k < ISLANDS.length; k++) {
			var bb = boxes[k];
			var bx = x < bb[0] ? bb[0] - x : x > bb[2] ? x - bb[2] : 0;
			var by = y < bb[1] ? bb[1] - y : y > bb[3] ? y - bb[3] : 0;
			if ((bx || by) && -len(bx, by) <= best) continue;
			var d = distToPoly(ISLANDS[k], x, y);
			var s = inside(ISLANDS[k], x, y) ? d : -d;
			if (s > best) { best = s; which = k; }
		}
		for (var i = 0; i < ISLETS.length; i++) {
			var s2 = ISLETS[i].r - len(x - ISLETS[i].x, y - ISLETS[i].y);
			if (s2 > best) { best = s2; which = ISLETS[i].biome === undefined ? which : ISLETS[i].biome; }
		}
		FIELD_ISLAND = which;
		if (LAGOON && inside(LAGOON, x, y)) best = Math.min(best, -distToPoly(LAGOON, x, y));
		best += (fbm(x * 0.045, y * 0.045, 4) - 0.5) * 15
		      + (fbm(x * 0.13,  y * 0.13,  3) - 0.5) * 6
		      + (fbm(x * 0.35,  y * 0.35,  2) - 0.5) * 2.4;
		/* Inland water is carved after the coast, so a lake stays a lake even
		   where the coastline noise would otherwise have filled it in. */
		for (var L = 0; L < LAKES.length; L++) {
			var lk = LAKES[L];
			var dd = len(x - lk.x, y - lk.y) - lk.r
			       + (fbm(x * 0.18 + L * 7, y * 0.18, 2) - 0.5) * lk.r * 0.5;
			if (dd < 0 && dd < best) best = dd;
		}
		return best;
	}
	function heightAt(x, y) {
		var h = 0;
		for (var i = 0; i < RIDGES.length; i++) {
			var R = RIDGES[i], d = len(x - R.x, y - R.y) / R.r;
			if (d >= 1) continue;
			var v = (1 - d * d) * R.h;
			if (R.crater && d < 0.34) v *= 0.42 + d;
			if (R.shelf) v = R.h * (d < 0.8 ? 1 : 0) * 0.9;
			if (v > h) h = v;
		}
		if (h === 0) return 0;
		return h * (0.86 + fbm(x * 0.09, y * 0.09, 3) * 0.28);
	}
	/* How much the sea bed rises towards the surface here, in the same units the
	   water depth uses. Features fall off smoothly so nothing has a hard rim. */
	function seabedAt(x, y) {
		var lift = 0;
		for (var i = 0; i < SEABED.length; i++) {
			var S = SEABED[i];
			var d = len(x - S.x, y - S.y) / S.r;
			if (d >= 1) continue;
			var fall = 1 - d * d;
			lift += S.lift * fall * fall;
		}
		return lift;
	}

	/*
	 * How built-up the ground is here, 0 to 1.
	 *
	 * Towns need to show their size. A hard box does that but sits on top of the
	 * map like a UI element, which is why it went. Instead the ground itself
	 * changes inside the settlement - packed earth and paving instead of grass -
	 * with an edge broken up by noise so it looks like a place that grew rather
	 * than a rectangle that was placed. Big towns cover more ground than hamlets
	 * because each one carries its own extent.
	 */
	function townAt(x, y) {
		var best = 0;
		for (var i = 0; i < PLACES.length; i++) {
			var p = PLACES[i];
			if (!p.box) continue;
			if (p.kind === 'water' || p.kind === 'peak' || p.kind === 'wild') continue;
			var hw = p.box[0] * 0.62, hh = p.box[1] * 0.62;
			var dx = (x - p.x) / hw, dy = (y - p.y) / hh;
			var d = Math.sqrt(dx * dx + dy * dy);
			if (d >= 1.25) continue;
			/* Wobble the boundary so the edge of town is ragged, not elliptical. */
			d += (fbm(x * 0.16 + i * 13, y * 0.16, 2) - 0.5) * 0.42;
			var v = 1 - smooth(0.55, 1.05, d);
			if (v > best) best = v;
		}
		return best;
	}

	function forestAt(x, y) {
		for (var i = 0; i < FORESTS.length; i++) {
			var F = FORESTS[i], d = len(x - F.x, y - F.y) / F.r;
			if (d < 1 && fbm(x * 0.05 + i * 10, y * 0.05, 3) > 0.34 + d * 0.3) return F;
		}
		return null;
	}

	/* ------------------------------------------------------- the draw pass -- */
	var ctx = null;
	function fill(x, y, w, h, rgb) {
		ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
		ctx.fillRect(Math.round((x - V.ox) * V.scale), Math.round((y - V.oy) * V.scale),
		             Math.max(1, Math.round(w * V.scale)), Math.max(1, Math.round(h * V.scale)));
	}
	/*
	 * Hand-drawn art placed on the map itself.
	 *
	 * Some places are better drawn than generated - Aether Paradise is a
	 * man-made platform with a shape nothing in the terrain generator would ever
	 * produce. So a location can carry a sprite that is painted straight onto
	 * the world at its own coordinates and scales with the zoom like the ground
	 * does.
	 *
	 * Images load asynchronously and the map is drawn on demand, so each one
	 * asks for a redraw when it arrives rather than blocking the first frame.
	 */
	var overlayCache = {};
	function overlayImage(src) {
		var e = overlayCache[src];
		if (e) return e.ok ? e.img : null;
		var img = new Image();
		e = overlayCache[src] = { img: img, ok: false };
		img.onload = function () {
			e.ok = true;
			/*
			 * A backdrop arrives after the first frame is already on screen, and
			 * asking for a redraw then is not enough on its own: lastFrame still
			 * matches, so the renderer decides there is nothing new and keeps the
			 * frame that was drawn before the image existed. Dropping lastFrame
			 * makes the next pass a real one - without it the region drew as bare
			 * land until you happened to pan or zoom.
			 */
			lastFrame = null;
			if (window.__atlasRedraw) window.__atlasRedraw();
		};
		img.onerror = function () { e.ok = 'bad'; };
		img.src = src;
		return null;
	}
	function drawOverlays() {
		for (var i = 0; i < OVERLAYS.length; i++) {
			var o = OVERLAYS[i];
			var img = overlayImage(o.src);
			if (!img) continue;
			var x = (o.x - o.w / 2 - V.ox) * V.scale;
			var y = (o.y - o.h / 2 - V.oy) * V.scale;
			var w = o.w * V.scale, h = o.h * V.scale;
			/* Keep it crisp when zoomed in; it is pixel art, like the buildings. */
			ctx.imageSmoothingEnabled = V.scale < 1.2;
			ctx.drawImage(img, x, y, w, h);
			ctx.imageSmoothingEnabled = true;
		}
	}

	function stroke(pts, rgb, width, dash) {
		for (var i = 1; i < pts.length; i++) {
			var x1 = pts[i-1][0], y1 = pts[i-1][1], x2 = pts[i][0], y2 = pts[i][1];
			var steps = Math.ceil(Math.hypot(x2-x1, y2-y1) * Math.max(1, V.scale));
			for (var s = 0; s <= steps; s++) {
				if (dash && (s % dash[0]) >= dash[1]) continue;
				var px = x1 + (x2-x1) * s/steps, py = y1 + (y2-y1) * s/steps;
				fill(px - width/2, py - width/2, width, width, rgb);
			}
		}
	}
	/*
	 * A railway, drawn as one.
	 *
	 * It used to be a single grey dashed pixel laid along the routes, which at
	 * map zoom was indistinguishable from nothing: the line crossed the whole of
	 * Hinode and there was no way to see that it did. A bed, a steel rail on it
	 * and sleepers across - the sleepers are what make a line read as rail rather
	 * than as one more road running beside the road.
	 */
	function railway(pts) {
		var bed = [54, 60, 68], steel = [182, 192, 202];
		stroke(pts, bed, 2.4);
		stroke(pts, steel, 0.9);
		var travelled = 0;
		for (var i = 1; i < pts.length; i++) {
			var x1 = pts[i-1][0], y1 = pts[i-1][1], x2 = pts[i][0], y2 = pts[i][1];
			var len = Math.hypot(x2 - x1, y2 - y1);
			if (!len) continue;
			var ux = (x2 - x1) / len, uy = (y2 - y1) / len;   // along the track
			var nx = -uy, ny = ux;                            // across it
			for (var d = (3 - (travelled % 3)) % 3; d < len; d += 3) {
				var cx = x1 + ux * d, cy = y1 + uy * d;
				stroke([[cx - nx * 1.6, cy - ny * 1.6], [cx + nx * 1.6, cy + ny * 1.6]], bed, 0.9);
			}
			travelled += len;
		}
	}

	/* Three passes: a dark casing so the road separates from grass at any zoom,
	   the road itself, and a pale centre that catches the eye when zoomed out.
	   A single thin line vanishes against the terrain, which is exactly what was
	   happening to every route on the map. */
	/*
	 * Roads as curves, not as a trail of squares.
	 *
	 * The old version stepped along each straight segment stamping little
	 * rectangles, which gives hard corners at every waypoint and a chewed edge
	 * everywhere else. Real paths bend. So the waypoints are treated as control
	 * points for a Catmull-Rom spline - a curve that actually passes through the
	 * points it is given, which matters when a waypoint is a town - and the
	 * result is stroked as a single canvas path with round joins and caps.
	 *
	 * Three passes give the road an edge: a dark casing so it separates from
	 * grass, the surface, and a pale centre worn by use.
	 */
	function spline(pts, perSeg) {
		if (pts.length < 3) return pts;
		var out = [], n = pts.length;
		for (var i = 0; i < n - 1; i++) {
			var p0 = pts[i > 0 ? i - 1 : 0];
			var p1 = pts[i], p2 = pts[i + 1];
			var p3 = pts[i + 2 < n ? i + 2 : n - 1];
			for (var s = 0; s < perSeg; s++) {
				var u = s / perSeg, u2 = u * u, u3 = u2 * u;
				out.push([
					0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u +
					       (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0]) * u2 +
					       (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0]) * u3),
					0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u +
					       (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1]) * u2 +
					       (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1]) * u3)
				]);
			}
		}
		out.push(pts[n - 1]);
		return out;
	}

	function ribbon(pts, rgb, width) {
		if (pts.length < 2) return;
		ctx.beginPath();
		ctx.moveTo((pts[0][0] - V.ox) * V.scale, (pts[0][1] - V.oy) * V.scale);
		for (var i = 1; i < pts.length; i++)
			ctx.lineTo((pts[i][0] - V.ox) * V.scale, (pts[i][1] - V.oy) * V.scale);
		ctx.strokeStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
		ctx.lineWidth = Math.max(1, width * V.scale);
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';
		ctx.stroke();
	}

	/*
	 * Roads, drawn in layers rather than one road at a time.
	 *
	 * Each road is five strokes stacked: cleared ground, verge, dark casing,
	 * surface, worn centre. Finishing one whole road before starting the next
	 * means the second road's casing paints over the first road's surface, so
	 * every junction picks up dark seams and the network reads as a pile of
	 * overlapping strips rather than as joined-up roads.
	 *
	 * Map renderers solve this with layer order: every corridor first, then
	 * every casing, then every surface, then every centre line. A casing can
	 * then never cut across a surface, and two roads that meet simply merge -
	 * which is what a junction actually looks like.
	 *
	 * Trunk roads and tracks stay told apart by weight, and within each layer
	 * the tracks go down first so a trail joins the main road rather than
	 * crossing it.
	 */
	var LAYERS = [
		{ a: 0.55, side: [168, 152, 118], main: [176, 158, 120], sw: 6,   mw: 12.5 },
		{ a: 0.85, side: null,            main: [156, 136,  98], sw: 0,   mw: 8.5  },
		{ a: 1,    side: [40, 54, 64],    main: [26, 38, 48],    sw: 3.6, mw: 7.5  },
		{ a: 1,    side: [206, 184, 142], main: [232, 210, 158], sw: 2,   mw: 5    },
		{ a: 1,    side: null,            main: [244, 228, 176], sw: 0,   mw: 1.8  }
	];

	function drawRoads(roads) {
		/* Smooth once and reuse; splining five times per road is wasted work. */
		var prepared = roads.map(function (r) {
			return { pts: spline(r.pts, 10), side: r.kind === 'side' };
		});
		LAYERS.forEach(function (L) {
			ctx.globalAlpha = L.a;
			prepared.forEach(function (r) {
				if (r.side && L.side && L.sw) ribbon(r.pts, L.side, L.sw);
			});
			prepared.forEach(function (r) {
				if (!r.side && L.main && L.mw) ribbon(r.pts, L.main, L.mw);
			});
		});
		ctx.globalAlpha = 1;
	}

	/*
	 * Terrain.
	 *
	 * The first version quantised everything into a handful of flat colours and
	 * dithered between them, which is why the map read as cheap: hard bands in
	 * the sea, flat green on land, and an ordered-dither checkerboard over the
	 * lot. Pixel art belongs in the sprites and the buildings, not in the ground
	 * they sit on - the reference this is chasing pairs soft painted land with
	 * crisp pixel objects, and that contrast is most of the effect.
	 *
	 * So the ground is now continuous. Colours are interpolated along ramps
	 * rather than stepped, and the whole landmass is shaded by its own slope
	 * with the light coming from the upper left. Relief is what makes a map look
	 * like somewhere rather than like a chart - once hills actually catch light
	 * on one side, everything else stops looking flat.
	 */
	function mix(a, b, t) {
		if (t < 0) t = 0; else if (t > 1) t = 1;
		return [a[0] + (b[0] - a[0]) * t,
		        a[1] + (b[1] - a[1]) * t,
		        a[2] + (b[2] - a[2]) * t];
	}
	function smooth(e0, e1, x) {
		var t = (x - e0) / (e1 - e0);
		if (t < 0) t = 0; else if (t > 1) t = 1;
		return t * t * (3 - 2 * t);
	}
	/* Walk a list of [stop, colour] and blend between the two that bracket v. */
	function ramp(stops, v) {
		if (v <= stops[0][0]) return stops[0][1];
		for (var i = 1; i < stops.length; i++) {
			if (v <= stops[i][0]) {
				var a = stops[i - 1], b = stops[i];
				return mix(a[1], b[1], smooth(a[0], b[0], v));
			}
		}
		return stops[stops.length - 1][1];
	}

	var SEA = [
		[0.0,  [126, 214, 214]],   /* the wet edge */
		[1.6,  [150, 226, 226]],   /* foam */
		[4.0,  [ 96, 206, 214]],
		[10.0, [ 74, 166, 206]],
		[20.0, [ 56, 120, 190]],
		[34.0, [ 44,  88, 168]],
		[60.0, [ 32,  62, 132]],
		[95.0, [ 22,  44, 100]]
	];

	/*
	 * Draw the world into a canvas: the whole of it, or only some rectangles of
	 * it (the strip a drag has just uncovered). The terrain is worked out only
	 * inside those rectangles, and the roads, trees and buildings on top are
	 * clipped to them, so a pan costs a sliver instead of a whole screen.
	 */
	function drawWorld(canvas, view, rects) {
		V = view;
		ctx = canvas.getContext('2d');
		(rects || [[0, 0, canvas.width, canvas.height]]).forEach(function (r) { drawTerrain(r[0], r[1], r[2], r[3]); });
		ctx.save();
		if (rects) {
			ctx.beginPath();
			rects.forEach(function (r) { ctx.rect(r[0], r[1], r[2], r[3]); });
			ctx.clip();
		}
		drawLayers(canvas.width, canvas.height);
		ctx.restore();
	}

	/* The per-pixel ground for one rectangle of the canvas, in the current view. */
	function drawTerrain(rx, ry, rw, rh) {
		if (rw <= 0 || rh <= 0) return;
		var img = ctx.createImageData(rw, rh), data = img.data;
		var inv = 1 / V.scale;
		/* Sample the slope a constant distance in world units, so relief looks
		   the same however far you are zoomed in. */
		var e = 1.6;

		for (var sy = ry; sy < ry + rh; sy++) {
			var wy = V.oy + sy * inv;
			for (var sx = rx; sx < rx + rw; sx++) {
				var wx = V.ox + sx * inv;
				var f = landField(wx, wy);
				var rgb;

				if (f < 0) {
					/* Depth is distance from shore minus whatever the sea bed is
					   doing underneath - so a reef shows as pale water and a
					   trench as a dark scar, both visible from the surface. */
					var d = -f - seabedAt(wx, wy);
					if (d < 0.2) d = 0.2;
					rgb = ramp(SEA, d);
					/* Coral picks up warmth that plain water never has. */
					var reef = smooth(16, 3, d) * smooth(0, 12, -f);
					if (reef > 0) {
						var cn = fbm(wx * 0.4, wy * 0.4, 2);
						rgb = mix(rgb, mix([224, 150, 148], [150, 216, 196], cn), reef * 0.5);
					}
					/* A soft bright collar just off the sand, and a darker line
					   right at the waterline so the coast stays drawn. */
					rgb = mix(rgb, [196, 240, 238], smooth(2.6, 0.2, d) * 0.55);
					rgb = mix(rgb, [ 26,  58,  92], smooth(0.9, 0.0, d) * 0.45);
				} else {
					var hgt = heightAt(wx, wy);

					/*
					 * Each island gets its own palette. Four landmasses in the
					 * same green is what made this look like one shape repeated;
					 * a cool forested north, warm farmland, ash-dulled volcanic
					 * ground and bright tropical growth read as four places.
					 */
					var B = BIOMES[FIELD_ISLAND] || BIOMES[0] || {
						g0: [104, 176, 84], g1: [142, 208, 112],
						s0: [228, 206, 150], s1: [242, 226, 178]
					};
					var sandN = fbm(wx * 0.22, wy * 0.22, 2);
					var sand = mix(B.s0, B.s1, sandN);
					var gN = fbm(wx * 0.045, wy * 0.045, 3);
					var grass = mix(B.g0, B.g1, gN);

					/*
					 * Beaches.
					 *
					 * The sand used to be a two-unit trim that turned to grass
					 * almost immediately, so an archipelago somehow had no
					 * beaches on it. Real coasts vary: sheltered bays silt up
					 * into wide strands, exposed headlands get none at all. A
					 * slow noise along the shore sets the width, so the same
					 * island has broad sand in its bays and bare rock on its
					 * points - and cliffs already take over wherever high ground
					 * meets the water.
					 */
					var shore = fbm(wx * 0.022 + 11, wy * 0.022, 2);
					var beachW = 2.5 + shore * shore * 26;
					/* A second, much larger wave of colour so big fields are not
					   one flat green. */
					var broad = fbm(wx * 0.013, wy * 0.013, 2);
					grass = mix(grass, B.g1, broad * 0.4);

					rgb = mix(sand, grass, smooth(beachW * 0.55, beachW, f));
					/* Wet sand at the waterline, and a paler dune line behind the
					   widest beaches where the sand has dried and blown back. */
					rgb = mix([206, 184, 132], rgb, smooth(0.0, 2.2, f));
					if (beachW > 12)
						rgb = mix(rgb, mix(B.s1, [252, 244, 214], 0.5),
						          smooth(beachW * 0.55, beachW * 0.8, f) * smooth(beachW, beachW * 0.75, f) * 0.5);

					/* Woodland darkens the ground beneath it before any tree is
					   drawn, so forests read as mass rather than as scattered
					   sprites. */
					var F = forestAt(wx, wy);
					if (F) {
						var edge = smooth(0, 0.35, F.t !== undefined ? F.t : 1);
						var floor = F.haunted ? [86, 74, 128]
						          : F.jungle ? [38, 104, 58]     /* darker, wetter */
						          : [58, 122, 68];
						rgb = mix(rgb, floor, (F.jungle ? 0.72 : 0.55) * edge);
					}

					/* Rock, then snow, both faded in rather than switched on. */
					var rockT = smooth(0.10, 0.30, hgt) * smooth(2.0, 5.0, f);
					if (rockT > 0) {
						var rockN = fbm(wx * 0.12, wy * 0.12, 3);
						var rock = mix([158, 122, 78], [196, 164, 112], rockN);
						rgb = mix(rgb, rock, rockT);
					}
					var snowLine = 0.80 + (fbm(wx * 0.11, wy * 0.11, 3) - 0.5) * 0.16;
					var snowT = smooth(snowLine - 0.06, snowLine + 0.05, hgt);
					if (snowT > 0) rgb = mix(rgb, [240, 246, 252], snowT);

					/* Hillshade. The slope of the height field lit from the upper
					   left - this is the single thing that stops the land looking
					   like a flat green shape. */
					var hx = heightAt(wx + e, wy) - heightAt(wx - e, wy);
					var hy = heightAt(wx, wy + e) - heightAt(wx, wy - e);
					var lit = -(hx * 0.78 + hy * 0.78) * 9;
					if (lit > 1) lit = 1; else if (lit < -1) lit = -1;
					var k = 1 + lit * (0.16 + 0.34 * smooth(0.05, 0.5, hgt));
					rgb = [rgb[0] * k, rgb[1] * k, rgb[2] * k];

					/*
					 * Open country, broken up.
					 *
					 * Large areas of one green read as unfinished - a real map has
					 * something happening everywhere. Two cheap textures fix it
					 * without another pass of sprites: a fine mottle that suggests
					 * scrub and hedgerow, and a coarser one that reads as the
					 * shadow of rolling ground.
					 */
					var mottle = fbm(wx * 0.9, wy * 0.9, 2);
					rgb = mix(rgb, [86, 138, 74], (mottle - 0.5) * 0.22 + 0.11);
					var swell = fbm(wx * 0.06 + 40, wy * 0.06, 2);
					rgb = mix(rgb, [70, 118, 66], Math.max(0, swell - 0.58) * 0.5);

					/* The settlement itself: ground worn down to earth and
					   paving, brightest at the centre where the streets are. */
					var town = townAt(wx, wy);
					if (town > 0) {
						var paveN = fbm(wx * 0.5, wy * 0.5, 2);
						var pave = mix([198, 178, 146], [222, 206, 178], paveN);
						rgb = mix(rgb, pave, town * 0.82);
					}

					/* Where high ground runs to the sea you get cliffs, not
					   beach - a sand ring round a mountain looks wrong. */
					var cliff = smooth(0.12, 0.26, hgt) * smooth(7.0, 1.0, f);
					if (cliff > 0) rgb = mix(rgb, [116, 104, 92], cliff * 0.85);

					/* Coastal shading: a little depth where the land meets water. */
					rgb = mix(rgb, [70, 96, 74], smooth(3.2, 0.0, f) * 0.18);
				}

				var i4 = ((sy - ry) * rw + (sx - rx)) * 4;
				data[i4]     = rgb[0] < 0 ? 0 : rgb[0] > 255 ? 255 : rgb[0];
				data[i4 + 1] = rgb[1] < 0 ? 0 : rgb[1] > 255 ? 255 : rgb[1];
				data[i4 + 2] = rgb[2] < 0 ? 0 : rgb[2] > 255 ? 255 : rgb[2];
				data[i4 + 3] = 255;
			}
		}
		ctx.putImageData(img, rx, ry);
	}

	/*
	 * Tall grass and trees only depend on the world, never on the view, so where
	 * they stand is worked out once and kept. Before, every frame asked the
	 * terrain about twelve thousand tree spots and every grass tuft again.
	 */
	var GRASS_CACHE = null, TREE_CACHE = {}, LAYER_WORLD = null;
	function layerCaches() {
		if (LAYER_WORLD === ISLANDS) return;
		LAYER_WORLD = ISLANDS; GRASS_CACHE = null; TREE_CACHE = {};
	}
	function grassTufts() {
		layerCaches();
		if (GRASS_CACHE) return GRASS_CACHE;
		GRASS_CACHE = [];
		GRASS_PATCHES.forEach(function (g) {
			for (var y = g[1] - g[3]; y <= g[1] + g[3]; y++) for (var x = g[0] - g[2]; x <= g[0] + g[2]; x++) {
				var dd = ((x-g[0])*(x-g[0]))/(g[2]*g[2]) + ((y-g[1])*(y-g[1]))/(g[3]*g[3]);
				if (dd > 1 || underBackdrop(x, y) || landField(x, y) < 5 || heightAt(x, y) > 0.3) continue;
				if (hash(x*3, y*5) > 0.82) continue;
				GRASS_CACHE.push([x, y, ((x + (y & 1) * 2) % 4 < 2) ? C.grassTall : C.grassTall2]);
			}
		});
		return GRASS_CACHE;
	}
	function treeSpots(step) {
		layerCaches();
		if (TREE_CACHE[step]) return TREE_CACHE[step];
		var list = [];
		for (var ty = 4 + WORLD.y0; ty < WORLD.y1; ty += step) for (var tx = 4 + WORLD.x0; tx < WORLD.x1; tx += step) {
			var jx = tx + Math.round(hash(tx, ty) * 5 - 2), jy = ty + Math.round(hash(ty, tx) * 5 - 2);
			if (underBackdrop(jx, jy) || landField(jx, jy) < 5 || heightAt(jx, jy) > 0.34) continue;
			var F = forestAt(jx, jy);
			if (F) list.push([jx, jy, F]);
		}
		return (TREE_CACHE[step] = list);
	}

	/*
	 * A region may bring its own ground.
	 *
	 * Kagura is invented, so its terrain is generated from outlines. A real
	 * region already has a map, and a generated impression of it reads worse than
	 * the original - so Sinnoh draws the published artwork instead, with the sea
	 * cut out of it (tools/make-backdrop.js) so it sits on our own ocean. Routes,
	 * markers and labels go on top exactly as they do anywhere else.
	 */
	function drawBackdrops() {
		for (var i = 0; i < BACKDROPS.length; i++) {
			var b = BACKDROPS[i];
			var img = overlayImage(b.src);
			if (!img) continue;
			ctx.imageSmoothingEnabled = true;
			ctx.drawImage(img, (b.x - b.w / 2 - V.ox) * V.scale, (b.y - b.h / 2 - V.oy) * V.scale, b.w * V.scale, b.h * V.scale);
		}
	}

	/*
	 * Is this point under a region's own artwork?
	 *
	 * With `roadsOnly`, only artwork that says it draws its own roads counts -
	 * scenery is suppressed under any backdrop, because a painting always has
	 * its own trees, but roads are only suppressed under a map that has roads.
	 */
	function underBackdrop(x, y, roadsOnly) {
		for (var i = 0; i < BACKDROPS.length; i++) {
			var b = BACKDROPS[i];
			if (roadsOnly && !b.roads) continue;
			if (x >= b.x - b.w / 2 && x <= b.x + b.w / 2 && y >= b.y - b.h / 2 && y <= b.y + b.h / 2) return true;
		}
		return false;
	}

	/* Everything drawn on top of the ground, for a canvas of this size. */
	function drawLayers(cw, ch) {
		drawBackdrops();
		// caldera floor
		for (var cy2 = 60; cy2 < 102; cy2++) for (var cx2 = 380; cx2 < 424; cx2++) {
			var cd = Math.hypot(cx2 - 402, cy2 - 80);
			if (cd < 15) fill(cx2, cy2, 1, 1, cd < 9 ? ((cx2 + cy2) % 3 ? C.lava : C.lavaHi) : C.rockDk);
		}

		/*
		 * The two made things on the sea floor, drawn faintly as if seen through
		 * water. They are locations on this map; a reader should be able to spot
		 * them without being told where to click.
		 */
		ctx.globalAlpha = 0.5;
		(function () {
			var b = null, a = null;
			for (var i = 0; i < SEABED.length; i++) {
				if (SEABED[i].kind === 'bell') b = SEABED[i];
				if (SEABED[i].kind === 'base') a = SEABED[i];
			}
			if (b) {   /* the bell: a dome and a flared rim, tilted in the silt */
				fill(b.x - 5, b.y - 6, 10, 9, [86, 150, 132]);
				fill(b.x - 7, b.y + 2, 14, 3, [104, 172, 150]);
				fill(b.x - 3, b.y - 8, 6, 3, [104, 172, 150]);
				fill(b.x - 7, b.y + 5, 14, 2, [58, 104, 96]);
			}
			if (a) {   /* the base: one long hull, two wings, a lit lock */
				fill(a.x - 11, a.y - 4, 22, 8, [44, 60, 66]);
				fill(a.x - 15, a.y - 1, 8, 5, [38, 52, 58]);
				fill(a.x + 7, a.y - 1, 8, 5, [38, 52, 58]);
				fill(a.x - 11, a.y - 4, 22, 2, [70, 92, 98]);
				fill(a.x - 1, a.y + 3, 3, 3, [214, 72, 62]);
			}
		})();
		ctx.globalAlpha = 1;

		RIVERS.forEach(function (r) {
			var s = spline(r, 10);
			ribbon(s, [70, 130, 170], 3.2);
			ribbon(s, C.river, 2);
		});

		// tall grass, then the roads cut over it
		var visX0 = V.ox - 8, visY0 = V.oy - 8, visX1 = V.ox + cw / V.scale + 8, visY1 = V.oy + ch / V.scale + 8;
		grassTufts().forEach(function (t) {
			if (t[0] < visX0 || t[1] < visY0 || t[0] > visX1 || t[1] > visY1) return;
			fill(t[0], t[1], 1, 1, t[2]);
		});

		/*
		 * One list, drawn in layers, so junctions merge instead of overlapping.
		 *
		 * Artwork does not necessarily carry roads. The Platinum map of Sinnoh is a
		 * landscape painting - mountains, rivers, towns, and not one route on it -
		 * so leaving ours off there left the region with no roads at all. A
		 * backdrop has to say `roads: true` before we stand aside, which is for a
		 * town map or a printed route map, not a painting.
		 */
		var roads = [];
		var onArt = function (pts) { return pts && pts.length && underBackdrop(pts[0][0], pts[0][1], true); };
		/* A trail is a path, or { path, from } when it has to name the road it leaves. */
		TRAILS.forEach(function (t) {
			var pts = Array.isArray(t) ? t : t.path;
			if (!onArt(pts)) roads.push({ pts: pts, kind: 'side' });
		});
		ROUTES.forEach(function (r) {
			if (onArt(r.path)) return;
			var info = ROUTE_INFO[r.n];
			roads.push({ pts: r.path, kind: info && info.kind === 'side' ? 'side' : 'main' });
		});
		LINKS.forEach(function (p) { if (!onArt(p)) roads.push({ pts: p, kind: 'main' }); });
		drawRoads(roads);
		if (RAIL.length) railway(RAIL);

		// ferries + bridges
		/* Ferry lanes: dashed, and curved like a boat would actually run. */
		ctx.save();
		ctx.setLineDash([5 * V.scale, 4 * V.scale]);
		FERRIES.forEach(function (f) { ribbon(spline(f, 12), [232, 244, 252], 1.6); });
		ctx.restore();
		BRIDGES.forEach(function (b) {
			if (underBackdrop(b.a[0], b.a[1], true)) return;
			var seg = [b.a, b.b];
			ribbon(seg, C.outline, 9.5);
			ribbon(seg, C.bridge, 7);
			ribbon(seg, C.route, 3);
			/* Deck planking, so a bridge reads as built rather than as a stripe. */
			var n = Math.max(2, Math.round(Math.hypot(b.b[0]-b.a[0], b.b[1]-b.a[1]) / 3));
			for (var k = 0; k <= n; k++) {
				var u = k / n;
				var px = b.a[0] + (b.b[0]-b.a[0]) * u, py = b.a[1] + (b.b[1]-b.a[1]) * u;
				fill(px - 3.4, py - 0.5, 6.8, 0.9, C.routeDk);
			}
		});

		// trees
		var step = V.scale > 1 ? 4 : 7;
		var spots = treeSpots(step);
		for (var si = 0; si < spots.length; si++) {
			var jx = spots[si][0], jy = spots[si][1], F = spots[si][2];
			if (jx < visX0 || jy < visY0 || jx > visX1 || jy > visY1) continue;
			var mid = F.haunted ? C.haunt : F.jungle ? [34, 118, 62] : C.tree;
			var hi  = F.haunted ? C.hauntHi : F.jungle ? [72, 168, 88] : C.treeHi;
			var dk  = F.haunted ? C.hauntDk : F.jungle ? [20, 78, 46] : C.treeDk;
			ctx.globalAlpha = 0.18; fill(jx - 1.5, jy + 4.6, 6.5, 2, [0,0,0]); ctx.globalAlpha = 1;
			// Trunk, then a canopy built from overlapping clumps rather than one
			// rectangle - the same trick as the buildings, at sub-unit size.
			fill(jx - 0.4, jy + 3, 1.6, 2.6, dk);
			fill(jx - 2.4, jy + 0.6, 6.4, 3.4, mid);
			fill(jx - 1.4, jy - 1.8, 4.6, 3.4, mid);
			fill(jx - 0.4, jy - 2.8, 2.6, 2, mid);
			fill(jx - 1.6, jy - 0.6, 2.4, 1.8, hi);
			fill(jx + 1.4, jy + 1.6, 1.8, 1.4, dk);
		}

		// Zoomed in you get the buildings. Zoomed out you get a box round the
		// ground the place covers, which is what a world map is for: the terrain
		// carries the picture and the box says "something is here, look closer".
		// Drawing every roof at region scale was just clutter at 1px a wall.
		/* Footprint boxes used to mark where a town was at region scale. The
		   markers do that job now, and they are the thing you actually click -
		   so the boxes were decoration sitting on top of the terrain. */
		drawOverlays();

		if (V.scale >= 4) drawBuildings();
	}

	function drawFootprints() {
		PLACES.forEach(function (p) {
			var bw = (p.box ? p.box[0] : 28), bh = (p.box ? p.box[1] : 22);
			var x = p.x - bw / 2, y = p.y - bh / 2;
			ctx.globalAlpha = 0.16;
			fill(x, y, bw, bh, p.gym ? [255, 214, 120] : [255, 255, 255]);
			ctx.globalAlpha = 1;
			var edge = p.gym ? C.gym : (p.kind === 'water' ? [150, 226, 240] : [20, 30, 40]);
			fill(x, y, bw, 1.5, edge);
			fill(x, y + bh - 1.5, bw, 1.5, edge);
			fill(x, y, 1.5, bh, edge);
			fill(x + bw - 1.5, y, 1.5, bh, edge);
			// corner ticks, so the box reads as a frame rather than a building
			[[x,y],[x+bw-4,y],[x,y+bh-1.5],[x+bw-4,y+bh-1.5]].forEach(function (c) {
				fill(c[0], c[1], 4, 1.5, [20, 30, 40]);
			});
		});
	}

	/* ------------------------------------------------------------ buildings - */
	/*
	 * Buildings, drawn in fractions of a world unit.
	 *
	 * The first version drew a house as a 9x8 block of whole units. At region
	 * scale that is nine pixels and fine; at 8x it is a seventy-two pixel slab
	 * with a door painted on, which is exactly as crude as it sounds. fill()
	 * multiplies by the view scale, so anything smaller than a unit simply
	 * disappears when zoomed out and sharpens when zoomed in - which means the
	 * detail below costs nothing on the region map and is the whole difference
	 * up close.
	 *
	 * So: shingles at 0.7 of a unit, window frames at 0.25, a doorstep, eaves
	 * that overhang, and siding on the walls.
	 */
	function shadow(x, y, w, h) {
		ctx.globalAlpha = 0.20;
		fill(x + 0.8, y + 1.2, w + 1, h + 1, [0, 0, 0]);
		ctx.globalAlpha = 1;
	}
	function window2(x, y, w, h) {
		fill(x - 0.25, y - 0.25, w + 0.5, h + 0.5, [64, 52, 44]);
		fill(x, y, w, h, [128, 198, 228]);
		fill(x, y, w, h * 0.45, [168, 222, 242]);            // glass catches the sky
		fill(x + w / 2 - 0.12, y, 0.25, h, [64, 52, 44]);    // mullion
		fill(x, y + h / 2 - 0.12, w, 0.25, [64, 52, 44]);    // transom
		fill(x - 0.4, y + h, w + 0.8, 0.35, [206, 200, 186]); // sill
	}
	function door(x, y, w, h, tone) {
		fill(x - 0.25, y - 0.25, w + 0.5, h + 0.5, [56, 40, 28]);
		fill(x, y, w, h, tone || [122, 84, 54]);
		fill(x, y, w, 0.4, [92, 62, 40]);
		fill(x + w - 0.8, y + h / 2, 0.4, 0.4, [232, 206, 120]);  // handle
		fill(x - 0.6, y + h, w + 1.2, 0.5, [176, 170, 158]);      // step
	}
	function roofOf(x, y, w, depth, roof, roofDk) {
		fill(x - 0.7, y - 0.4, w + 1.4, depth + 0.4, roofDk);     // eaves
		fill(x - 0.4, y, w + 0.8, depth, roof);
		for (var r = 0.5; r < depth; r += 0.7) fill(x - 0.4, y + r, w + 0.8, 0.22, roofDk);
		fill(x - 0.4, y, w + 0.8, 0.3, [255, 255, 255]);          // ridge highlight
		ctx.globalAlpha = 0.25; fill(x - 0.4, y + depth - 0.5, w + 0.8, 0.5, [0, 0, 0]); ctx.globalAlpha = 1;
	}
	function building(x, y, w, h, roof, roofDk, opts) {
		opts = opts || {};
		shadow(x, y, w, h);
		fill(x - 0.3, y - 0.3, w + 0.6, h + 0.6, C.outline);
		fill(x, y, w, h, opts.wall || C.wall);
		for (var s = 1.4; s < h; s += 1.4) fill(x, y + s, w, 0.18, C.wallDk);   // siding
		roofOf(x, y, w, opts.roofDepth || 3, roof, roofDk);
		var dw = opts.doorW || 2.2, dh = opts.doorH || 3.2;
		door(x + w / 2 - dw / 2, y + h - dh, dw, dh, opts.doorTone);
		if (w >= 10) {
			window2(x + 1.2, y + h - 5.6, 2, 1.7);
			window2(x + w - 3.2, y + h - 5.6, 2, 1.7);
		} else if (w >= 7) {
			window2(x + 1, y + h - 5.4, 1.8, 1.5);
		}
		if (opts.chimney) {
			fill(x + w - 2.6, y - 2.2, 1.4, 2.4, [136, 96, 72]);
			fill(x + w - 2.8, y - 2.5, 1.8, 0.5, [104, 72, 54]);
		}
	}
	function box(x, y, w, h, roof, roofDk) { building(x, y, w, h, roof, roofDk, {}); }

	var house = function (x, y) { building(x, y, 9, 8, [168, 128, 96], [122, 88, 64], { chimney: true }); };
	function centre(x, y) {
		building(x, y, 13, 10, C.roof, C.roofDk, { roofDepth: 3.4 });
		// The cross, which is how you find one at a glance.
		fill(x + 5.6, y - 3.4, 1.8, 3.4, C.roof);
		fill(x + 4.8, y - 3.8, 3.4, 0.5, C.roofDk);
		fill(x + 6.1, y + 4.4, 0.8, 2.6, [246, 244, 236]);
		fill(x + 5.2, y + 5.3, 2.6, 0.8, [246, 244, 236]);
	}
	function mart(x, y) {
		building(x, y, 11, 9, [62, 116, 196], [40, 84, 150], {});
		fill(x + 1, y + 4.6, 9, 1.4, [232, 240, 248]);        // the shop sign
		fill(x + 2, y + 5, 1.2, 0.7, [62, 116, 196]);
		fill(x + 4, y + 5, 1.2, 0.7, [62, 116, 196]);
		fill(x + 6, y + 5, 1.2, 0.7, [62, 116, 196]);
	}
	function lab(x, y) {
		building(x, y, 15, 11, [64, 166, 156], [40, 122, 116], { roofDepth: 3.4 });
		fill(x + 4, y - 3.4, 7, 3.4, [64, 166, 156]);         // the dome housing
		fill(x + 5, y - 4.4, 5, 1.2, [92, 198, 188]);
		window2(x + 5.6, y + 6, 3.6, 2);                      // one big lab window
	}
	function gymHall(x, y) {
		building(x, y, 17, 13, C.gym, C.gymDk, { roofDepth: 3.6, doorW: 3.4, doorH: 4.2, doorTone: [120, 84, 28] });
		fill(x + 3.2, y + 5, 3, 2, [250, 232, 170]);          // lit panels either side
		fill(x + 11, y + 5, 3, 2, [250, 232, 170]);
		fill(x + 17.4, y - 13, 0.9, 14, [78, 70, 58]);        // flagpole
		fill(x + 18.3, y - 13, 7, 4.4, C.gym);
		fill(x + 18.3, y - 13, 7, 0.5, [255, 255, 255]);
	}
	function castle(x, y) {
		shadow(x, y, 22, 18);
		fill(x - 0.4, y - 0.4, 22.8, 18.8, C.outline);
		fill(x, y, 22, 18, [178, 172, 186]);
		for (var b = 1.6; b < 18; b += 2.4) fill(x, y + b, 22, 0.25, [150, 144, 162]);  // courses
		fill(x, y + 12, 22, 6, [150, 144, 162]);
		[-3, 18].forEach(function (tx) {
			fill(x + tx - 0.4, y - 6.4, 7.8, 12.8, C.outline);
			fill(x + tx, y - 6, 7, 12, [198, 192, 206]);
			for (var c = 0; c < 7; c += 2.4) fill(x + tx + c, y - 6.6, 1.4, 1.2, [198, 192, 206]);  // crenellations
			window2(x + tx + 2.4, y - 2.4, 1.6, 2.4);
		});
		door(x + 8, y + 9, 6, 9, [72, 60, 96]);
		fill(x + 8, y + 8.4, 6, 0.8, [120, 110, 140]);        // arch
	}
	function torii(x, y) {
		shadow(x - 9, y - 10, 19, 17);
		fill(x - 10, y - 11.4, 21, 2, C.outline);
		fill(x - 9.4, y - 10.6, 19.6, 2.6, [198, 62, 66]);
		fill(x - 9.4, y - 10.6, 19.6, 0.6, [232, 110, 110]);
		fill(x - 7.4, y - 6.6, 15.4, 2, [188, 58, 62]);
		[-6.4, 4.4].forEach(function (px) {
			fill(px + x, y - 7.4, 3, 14.4, [188, 58, 62]);
			fill(px + x, y - 7.4, 0.8, 14.4, [226, 102, 102]);
			fill(px + x - 0.6, y + 6.4, 4.2, 0.9, [118, 36, 40]);
		});
	}
	function lighthouse(x, y) {
		shadow(x, y - 19, 7, 21);
		fill(x - 0.4, y - 19.4, 7.8, 21.8, C.outline);
		fill(x, y - 19, 7, 21, C.wall);
		[-13, -6, 1].forEach(function (band) { fill(x, y + band, 7, 3, C.roof); });
		fill(x - 0.8, y - 22.4, 8.6, 3.4, [60, 52, 48]);
		fill(x, y - 22, 7, 2.6, [250, 226, 130]);
		fill(x, y - 21.4, 7, 0.8, [255, 250, 210]);
		door(x + 2.4, y - 3.4, 2.2, 3.4);
	}
	function caveMouth(x, y) {
		shadow(x - 6, y - 6, 13, 13);
		fill(x - 6.4, y - 6.4, 13.8, 13.8, [96, 80, 64]);
		fill(x - 5.4, y - 5, 12, 11.4, [58, 46, 38]);
		fill(x - 3.4, y - 1, 7.8, 6, [16, 12, 12]);
		fill(x - 5.4, y - 5, 12, 0.6, [128, 108, 86]);       // lintel catches light
		fill(x - 2, y + 4.4, 5, 0.8, [120, 104, 86]);        // worn threshold
	}
	function reefRing(x, y) {
		for (var a = 0; a < 360; a += 4) {
			var rr = 24 + Math.sin(a * 0.11) * 1.6;
			fill(Math.round(x + Math.cos(a * Math.PI / 180) * rr),
			     Math.round(y + Math.sin(a * Math.PI / 180) * (rr * 0.58)), 2.4, 1.6, C.foam);
		}
	}
	function diveSite(x, y) {
		for (var r = 5; r <= 13; r += 4) for (var a = 0; a < 360; a += 18)
			fill(x + Math.cos(a * Math.PI / 180) * r, y + Math.sin(a * Math.PI / 180) * r * 0.6, 1.6, 1.2, [180, 236, 244]);
		fill(x - 2, y - 2, 4.4, 4.4, [14, 46, 74]);
	}

	/*
	 * Hand-made art, where we have it.
	 *
	 * The procedural town below is a fallback, not the goal. Anything with an
	 * entry here shows a real drawing instead, and everything else keeps drawing
	 * itself - so the atlas is complete on day one and gets better one town at a
	 * time, with no flag day and nothing to re-wire when a new image lands.
	 *
	 * A value is any URL the page may load: an artifact asset is the sane one,
	 * since the CSP blocks image hosts we do not control. Add a line, reload.
	 */
	/*
	 * Towns, laid out properly - because nothing here has to fit on the region
	 * map any more.
	 *
	 * Once the world map shows a box instead of roofs, the town inside the box
	 * is free to be a town: a street, a row of houses along it, the Centre where
	 * you would put a Centre. Every plan below is offsets from the place's own
	 * centre, so a town can grow by adding a line rather than by being squeezed
	 * into six pixels.
	 */

	function lantern(x, y) {
		fill(x, y - 5, 1, 6, [72,56,42]);
		fill(x - 2, y - 9, 5, 5, [30,24,20]);
		fill(x - 1, y - 8, 3, 3, [250,222,140]);
	}
	function aetherPad(x, y) {
		fill(x - 21, y - 15, 42, 30, C.outline); fill(x - 19, y - 13, 38, 26, C.steel);
		fill(x - 13, y - 8, 26, 16, C.steelDk); fill(x - 7, y - 4, 14, 8, C.steel);
	}

	function drawBuildings() {
		PLACES.forEach(function (p) {
			var plan = PLANS[p.id];
			if (!plan) return;
			(plan.streets || []).forEach(function (s) {
				road([[p.x + s[0][0], p.y + s[0][1]], [p.x + s[1][0], p.y + s[1][1]]]);
			});
			(plan.b || []).forEach(function (item) {
				var kind = item[0], x = p.x + item[1], y = p.y + item[2];
				if (kind === 'house') house(x, y);
				else if (kind === 'centre') centre(x, y);
				else if (kind === 'mart') mart(x, y);
				else if (kind === 'lab') lab(x, y);
				else if (kind === 'gym') gymHall(x, y);
				else if (kind === 'castle') castle(x, y);
				else if (kind === 'torii') torii(x, y);
				else if (kind === 'cave') caveMouth(x, y);
				else if (kind === 'lighthouse') lighthouse(x, y);
				else if (kind === 'reef') reefRing(x, y);
				else if (kind === 'dive') diveSite(x, y);
				else if (kind === 'aether') aetherPad(x, y);
				else if (kind === 'lantern') lantern(x, y);
				else if (kind === 'station') { box(x, y, 26, 11, C.rail, [66,74,84]); }
				else if (kind === 'pier') { fill(x, y, 18, 3, C.outline); fill(x, y + 1, 18, 2, C.bridge); }
				else if (kind === 'crop') {
					for (var r = 0; r < item[4]; r += 3) {
						fill(x, y + r, item[3], 2, C.crop);
						fill(x, y + r + 2, item[3], 1, C.cropDk);
					}
				}
			});
		});
	}

	/* ================================================================ VIEWER ==
	 *
	 * The map is the page.
	 *
	 * The previous version was a document with a picture in it: fixed size,
	 * fixed zoom, labels stamped on top. That is a diagram. A map is something
	 * you move around in - you drag it, you lean in, and it tells you where you
	 * are as you go. So the canvas fills the window, four small floating
	 * controls sit over it, and everything else appears only when asked for.
	 *
	 * The one hard problem is cost. Terrain here is computed per pixel rather
	 * than sampled from an image, so a full 1080p frame is two million
	 * evaluations and nowhere near interactive. The answer is to render small
	 * and upscale with pixelated smoothing: the internal buffer is a fraction of
	 * the window, which is both fast and honestly the right look for pixel art.
	 * While a drag is in flight it drops smaller still, and sharpens the moment
	 * you let go - so motion stays smooth and the resting frame is the crisp one
	 * you actually look at.
	 */

	var stage = document.getElementById('stage');
	var canvas = document.getElementById('map');
	var markers = document.getElementById('markers');
	var nameTag = document.getElementById('nametag');
	var panel = document.getElementById('panel');
	var detail = document.getElementById('detail');
	var current = null;

	/* View: world units per screen pixel, and the world point at the top-left. */
	var view = { scale: 2, ox: 0, oy: 0 };
	var MIN_SCALE = 1.2, MAX_SCALE = 26;
	var quality = 3;              /* screen pixels per rendered pixel */
	var needsDraw = false, sharpTimer = null;

	function viewport() {
		return { w: stage.clientWidth, h: stage.clientHeight };
	}

	/*
	 * Drawing, cheaply.
	 *
	 * The ground is worked out pixel by pixel, which is the whole cost of the
	 * map: a full screen took most of half a second. So a frame is only redrawn
	 * in full when it has to be (a zoom, a resize, a new region). A pan slides
	 * the picture already on screen and draws just the strip it uncovered.
	 *
	 * For that to line up, the picture is drawn at an origin snapped to whole
	 * canvas pixels, and the canvas element is nudged by the part that was
	 * snapped off - so the map still follows the pointer exactly.
	 */
	var lastFrame = null, frameDirty = true, slideBuffer = document.createElement('canvas');

	function snappedView(q) {
		var eff = view.scale / q;
		return { scale: eff, ox: Math.round(view.ox * eff) / eff, oy: Math.round(view.oy * eff) / eff };
	}
	/*
	 * While a zoom is in progress the picture on screen is simply stretched
	 * (a CSS transform, free) so the wheel and pinch stay smooth; the real
	 * redraw waits until the zooming stops.
	 */
	function previewCanvas() {
		if (!lastFrame) return;
		var q = canvas.clientWidth / canvas.width || 1;
		var drawnAt = lastFrame.scale * q;
		var k = view.scale / drawnAt;
		var tx = (lastFrame.ox - view.ox) * view.scale, ty = (lastFrame.oy - view.oy) * view.scale;
		canvas.style.transformOrigin = '0 0';
		canvas.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + k.toFixed(4) + ')';
	}

	function settleCanvas(rv) {
		/* Whole screen pixels only: a fractional offset makes the browser resample
		   the canvas and the pixel art goes soft. The error is under half a pixel. */
		var tx = Math.round((rv.ox - view.ox) * view.scale), ty = Math.round((rv.oy - view.oy) * view.scale);
		canvas.style.transform = tx || ty ? 'translate(' + tx + 'px,' + ty + 'px)' : '';
	}

	function render() {
		var vp = viewport();
		var cw = Math.max(1, Math.round(vp.w / quality));
		var ch = Math.max(1, Math.round(vp.h / quality));
		var resized = canvas.width !== cw || canvas.height !== ch;
		if (resized) { canvas.width = cw; canvas.height = ch; }
		/* drawWorld works in "one canvas pixel = 1/scale world units", so the
		   effective scale has to account for the upscale factor. */
		var rv = snappedView(quality);
		var same = !resized && !frameDirty && lastFrame && lastFrame.scale === rv.scale;
		var dx = same ? Math.round((lastFrame.ox - rv.ox) * rv.scale) : 0;
		var dy = same ? Math.round((lastFrame.oy - rv.oy) * rv.scale) : 0;
		if (same && !dx && !dy) {
			/* nothing new to draw */
		} else if (same && Math.abs(dx) < cw * 0.6 && Math.abs(dy) < ch * 0.6) {
			slideBuffer.width = cw; slideBuffer.height = ch;
			slideBuffer.getContext('2d').drawImage(canvas, 0, 0);
			var c2 = canvas.getContext('2d');
			c2.clearRect(0, 0, cw, ch);
			c2.drawImage(slideBuffer, dx, dy);
			var rects = [];
			if (dx > 0) rects.push([0, 0, dx, ch]); else if (dx < 0) rects.push([cw + dx, 0, -dx, ch]);
			if (dy > 0) rects.push([0, 0, cw, dy]); else if (dy < 0) rects.push([0, ch + dy, cw, -dy]);
			drawWorld(canvas, rv, rects);
		} else {
			drawWorld(canvas, rv);
		}
		lastFrame = rv;
		frameDirty = false;
		settleCanvas(rv);
		placeMarkers();
	}

	/*
	 * The sharp picture, in pieces. A full screen at full detail is too much
	 * work for one frame (it froze the page for about a second after every
	 * zoom), so it is drawn a band at a time into a spare canvas across several
	 * frames and swapped in when finished. Any movement abandons it.
	 */
	var sharpJob = 0;
	/* Yield to the browser without setTimeout's 4 ms minimum, so input and
	   painting get a turn between bands and the bands themselves don't wait. */
	var yieldChannel = new MessageChannel(), yieldQueue = [];
	yieldChannel.port1.onmessage = function () { var f = yieldQueue.shift(); if (f) f(); };
	function yieldThen(f) { yieldQueue.push(f); yieldChannel.port2.postMessage(0); }
	function sharpen() {
		var job = ++sharpJob;
		var vp = viewport();
		var cw = Math.max(1, Math.round(vp.w / 1.4)), ch = Math.max(1, Math.round(vp.h / 1.4));
		var rv = snappedView(1.4);
		var off = document.createElement('canvas');
		off.width = cw; off.height = ch;
		var y = 0;
		(function band() {
			if (job !== sharpJob) return;
			var t0 = performance.now();
			V = rv; ctx = off.getContext('2d');
			while (y < ch && performance.now() - t0 < 10) {
				var h = Math.min(6, ch - y);
				drawTerrain(0, y, cw, h);
				y += h;
			}
			if (y < ch) { yieldThen(band); return; }   /* yield, so input keeps flowing */
			V = rv; ctx = off.getContext('2d');
			drawLayers(cw, ch);
			if (job !== sharpJob) return;
			quality = 1.4;
			canvas.width = cw; canvas.height = ch;
			canvas.getContext('2d').drawImage(off, 0, 0);
			lastFrame = rv;
			frameDirty = false;
			settleCanvas(rv);
			placeMarkers();
		})();
	}

	window.__atlasRedraw = function () { frameDirty = true; requestDraw(); };

	function requestDraw() {
		if (needsDraw) return;
		needsDraw = true;
		requestAnimationFrame(function () { needsDraw = false; render(); });
	}

	/* A pan keeps its detail and slides. A zoom can't slide, so it goes coarse
	   while it is happening and sharpens in the background once it stops. */
	function moving(zooming) {
		sharpJob++;
		/* A pan straight after a zoom can't slide a picture drawn at another
		   scale: draw it coarse first, the sharp one follows. */
		if (zooming || (lastFrame && Math.abs(lastFrame.scale - view.scale / quality) > 1e-9)) { quality = 4; frameDirty = true; }
		requestDraw();
		clearTimeout(sharpTimer);
		if (quality !== 1.4) sharpTimer = setTimeout(sharpen, 150);
	}

	function toScreen(wx, wy) {
		return { x: (wx - view.ox) * view.scale, y: (wy - view.oy) * view.scale };
	}
	function toWorld(sx, sy) {
		return { x: view.ox + sx / view.scale, y: view.oy + sy / view.scale };
	}

	/* Keep the region roughly on screen - you can wander off the coast a little,
	   but not lose the map entirely and have no way back. */
	function clampView() {
		var vp = viewport();
		var visW = vp.w / view.scale, visH = vp.h / view.scale;
		var w = WORLD.x1 - WORLD.x0, h = WORLD.y1 - WORLD.y0;
		view.ox = Math.min(Math.max(view.ox, WORLD.x0), WORLD.x1 - visW);
		view.oy = Math.min(Math.max(view.oy, WORLD.y0), WORLD.y1 - visH);
		if (visW > w) view.ox = WORLD.x0 + (w - visW) / 2;
		if (visH > h) view.oy = WORLD.y0 + (h - visH) / 2;
	}

	function zoomAt(sx, sy, factor) {
		var before = toWorld(sx, sy);
		view.scale = Math.min(MAX_SCALE, Math.max(minScale(), view.scale * factor));
		var after = toWorld(sx, sy);
		view.ox += before.x - after.x;          /* keep the point under the cursor */
		view.oy += before.y - after.y;
		clampView();
		zooming();
	}

	var zoomTimer = null;
	function zooming() {
		sharpJob++;
		clearTimeout(sharpTimer);
		previewCanvas();
		placeMarkers();
		clearTimeout(zoomTimer);
		zoomTimer = setTimeout(function () {
			quality = 4;
			frameDirty = true;
			render();
			sharpTimer = setTimeout(sharpen, 120);
		}, 140);
	}

	/* How far out the whole region fits. On a phone that is well under
	   MIN_SCALE, and a fixed floor made the first zoom-out jump inwards. */
	function fitScale(r) {
		var b = (r && r.bounds) || (REGION && REGION.bounds) || [0, 0, 512, 384];
		var vp = viewport();
		return Math.min(vp.w / (b[2] - b[0]), vp.h / (b[3] - b[1])) * 0.96;
	}
	function minScale() { return Math.min(MIN_SCALE, fitScale()); }

	/* Frame one region's bounds, whatever else exists in the world around it. */
	function fitRegion(r) {
		var b = (r && r.bounds) || (REGION && REGION.bounds) || [0, 0, 512, 384];
		var vp = viewport();
		var w = b[2] - b[0], h = b[3] - b[1];
		view.scale = fitScale(r);
		view.ox = b[0] + w / 2 - vp.w / 2 / view.scale;
		view.oy = b[1] + h / 2 - vp.h / 2 / view.scale;
		clampView();
	}

	/* ------------------------------------------------------------- markers -- */
	/*
	 * Markers are DOM, not painted into the canvas: they need to stay the same
	 * size however far you zoom, and they need to be clickable and reachable by
	 * keyboard. Names stay hidden until you are close enough for them to mean
	 * something, which is what keeps the map readable when it is zoomed out.
	 */
	var markerEls = [];

	/*
	 * How important is a place?
	 *
	 * Forty-seven markers drawn identically is a field of boxes, and the towns -
	 * the things you actually navigate by - disappear into it. So places get a
	 * rank, and the map reveals them progressively: the settlements on the trunk
	 * road are always named, everything optional appears as you lean in, and the
	 * wild ground only labels itself once you are close enough to walk it.
	 *
	 * The ranking is derived, not hand-written. A place that a main route ends
	 * at is a main settlement by definition - which means it stays correct when
	 * the road network changes, and a second region gets it for free.
	 */
	function rankOf(p, mainEnds) {
		if (p.rank) return p.rank;          /* an explicit rank always wins */
		if (p.gym || p.id === 'league' || p.id === 'victory') return 1;
		if (p.kind === 'legend') return 1;
		if (mainEnds[p.id]) return 1;
		if (p.kind === 'wild' || p.kind === 'water') return 3;
		return 2;
	}

	function mainEndpoints() {
		var ends = {};
		var mark = function (pt) {
			var best = null, bd = 1e9;
			PLACES.forEach(function (p) {
				var d = Math.hypot(p.x - pt[0], p.y - pt[1]);
				if (d < bd) { bd = d; best = p; }
			});
			if (best && bd < 6) ends[best.id] = true;
		};
		ROUTES.forEach(function (r) {
			var info = ROUTE_INFO[r.n];
			if (info && info.kind === 'side') return;
			mark(r.path[0]);
			mark(r.path[r.path.length - 1]);
		});
		return ends;
	}

	function buildMarkers() {
		markers.innerHTML = '';
		markerEls = [];
		var mainEnds = mainEndpoints();
		PLACES.forEach(function (p) {
			var b = document.createElement('button');
			var rank = rankOf(p, mainEnds);
			/* Type the marker by what the place is, so a lake, a ruin and a gym
			   town do not all read as the same dark box. */
			b.className = 'mk r' + rank + ' k-' + (p.kind || 'town') +
			              (p.gym ? ' gym' : '') + (p.gate ? ' gated' : '');
			b.dataset.id = p.id;
			b.innerHTML = '<i></i><span>' + p.name + '</span>';
			b.title = p.name;
			b.addEventListener('click', function (e) { e.stopPropagation(); go(p.id); });
			b.addEventListener('mouseenter', function () { setTag(p.name); });
			markers.appendChild(b);
			markerEls.push({ el: b, x: p.x, y: p.y, kind: 'place', rank: rank });
		});
		ROUTES.forEach(function (r) {
			var mid = r.path[Math.floor(r.path.length / 2)];
			var info = ROUTE_INFO[r.n] || {};
			var b = document.createElement('button');
			b.className = 'mk rte';
			b.dataset.id = 'r' + r.n;
			b.innerHTML = '<i>' + r.n + '</i><span>' + (info.name || ('Route ' + r.n)) + '</span>';
			b.title = info.name || ('Route ' + r.n);
			b.addEventListener('click', function (e) { e.stopPropagation(); go('r' + r.n); });
			b.addEventListener('mouseenter', function () { setTag(info.name || ('Route ' + r.n)); });
			markers.appendChild(b);
			markerEls.push({ el: b, x: mid[0], y: mid[1], kind: 'route' });
		});
		if (REGION.title) {
			var t = document.createElement('button');
			t.className = 'regiontitle' + (showBorder ? ' on' : '');
			t.textContent = REGION.title[0];
			t.title = 'Show the region\'s borders';
			t.addEventListener('click', function (e) { e.stopPropagation(); toggleBorder(); });
			markers.appendChild(t);
			markerEls.push({ el: t, x: REGION.title[1], y: REGION.title[2], kind: 'title' });
		}
		(REGION.isles || []).forEach(function (c) {
			var s = document.createElement('b');
			s.className = 'isle';
			s.textContent = c[0];
			markers.appendChild(s);
			markerEls.push({ el: s, x: c[1], y: c[2], kind: 'isle' });
		});
		(REGION.seas || []).forEach(function (c) {
			var s = document.createElement('b');
			s.className = 'sea';
			s.textContent = c[0];
			markers.appendChild(s);
			markerEls.push({ el: s, x: c[1], y: c[2], kind: 'sea' });
		});
		/* River names sit along the river rather than on it, and fade out at
		   the zoom where the river itself is no longer a visible line. */
		(REGION.rivers || []).forEach(function (c) {
			var s = document.createElement('b');
			s.className = 'sea river';
			s.textContent = c[0];
			markers.appendChild(s);
			markerEls.push({ el: s, x: c[1], y: c[2], kind: 'river' });
		});
	}

	function placeMarkers() {
		var vp = viewport();
		/* Towns are named at every zoom - they are what you navigate by. Route
		   names wait until you are close, because the number in the marker is
		   already enough to find one, and fourteen of them at region scale is
		   just noise over the sea. */
		var showRouteNames = view.scale > 3.2;
		markerEls.forEach(function (m) {
			var s = toScreen(m.x, m.y);
			var off = s.x < -80 || s.y < -60 || s.x > vp.w + 80 || s.y > vp.h + 60;
			m.el.style.display = off ? 'none' : '';
			if (off) return;
			m.el.style.transform = 'translate(' + Math.round(s.x) + 'px,' + Math.round(s.y) + 'px)';
			/* Progressive disclosure: main settlements always, optional places
			   when you lean in, wild ground only when you are close. */
			if (m.kind === 'place')
				m.el.classList.toggle('named',
					m.rank === 1 || (m.rank === 2 && view.scale > 2.5) ||
					(m.rank === 3 && view.scale > 4.2));
			if (m.kind === 'route') m.el.classList.toggle('named', showRouteNames);
			if (m.kind === 'isle') m.el.style.opacity = view.scale > 6 ? 0 : 1;
			if (m.kind === 'title') {
				m.el.style.opacity = view.scale > 3.5 ? 0 : 1;
				m.el.style.pointerEvents = view.scale > 3.5 ? 'none' : '';
			}
			if (m.kind === 'sea') m.el.style.opacity = view.scale > 5 ? 0 : 1;
			if (m.kind === 'river') m.el.style.opacity = view.scale < 2.4 ? 0 : 1;
			m.sx = s.x; m.sy = s.y; m.hidden = off;
		});
		declutter();
		drawBorder();
	}

	/*
	 * The region's border, in gold dashes, when its title is clicked.
	 *
	 * Worked out rather than drawn by hand: the convex hull of the region's own
	 * islands and every place out at sea that belongs to it, pushed out from the
	 * middle so the line runs through open water instead of along the beaches.
	 * An SVG over the canvas, so the dashes stay the same size at any zoom.
	 */
	var showBorder = false, borderHull = null;
	var SVGNS = 'http://www.w3.org/2000/svg';
	var borderSvg = document.createElementNS(SVGNS, 'svg');
	borderSvg.setAttribute('class', 'regionborder');
	var borderPath = document.createElementNS(SVGNS, 'path');
	borderSvg.appendChild(borderPath);
	stage.insertBefore(borderSvg, markers);

	function hullOf(points) {
		var p = points.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
		var cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); };
		var lower = [], upper = [];
		p.forEach(function (q) {
			while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
			lower.push(q);
		});
		p.slice().reverse().forEach(function (q) {
			while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
			upper.push(q);
		});
		return lower.slice(0, -1).concat(upper.slice(0, -1));
	}

	function regionHull() {
		var pts = [];
		(REGION.borderIslands || REGION.ISLANDS || []).forEach(function (poly) { pts = pts.concat(poly); });
		var outside = REGION.borderOutside || [];
		(REGION.PLACES || []).forEach(function (p) { if (outside.indexOf(p.island) < 0) pts.push([p.x, p.y]); });
		var hull = hullOf(pts);
		var cx = 0, cy = 0;
		hull.forEach(function (q) { cx += q[0]; cy += q[1]; });
		cx /= hull.length; cy /= hull.length;
		var PAD = 16;
		return hull.map(function (q) {
			var dx = q[0] - cx, dy = q[1] - cy, d = Math.hypot(dx, dy) || 1;
			return [q[0] + dx / d * PAD, q[1] + dy / d * PAD];
		});
	}

	function drawBorder() {
		borderSvg.style.display = showBorder ? '' : 'none';
		if (!showBorder) return;
		if (!borderHull) borderHull = regionHull();
		borderPath.setAttribute('d', borderHull.map(function (q, i) {
			var s = toScreen(q[0], q[1]);
			return (i ? 'L' : 'M') + s.x.toFixed(1) + ' ' + s.y.toFixed(1);
		}).join(' ') + ' Z');
	}

	function toggleBorder() {
		showBorder = !showBorder;
		[].forEach.call(markers.querySelectorAll('.regiontitle'), function (b) { b.classList.toggle('on', showBorder); });
		drawBorder();
	}

	/*
	 * Stop the names sitting on top of each other.
	 *
	 * Towns that are close together - the station and the fields are a few units
	 * apart - end up with one label covering the other, and a name you cannot
	 * read is worse than no name. So labels are placed in order down the screen
	 * and any that collides with one already placed is nudged, alternating above
	 * and below its marker before giving up and hiding.
	 *
	 * The marker dot never moves. Only the name shifts, so what you click and
	 * what you read stay in the same place.
	 */
	function declutter() {
		/* The main places' dots are obstacles from the start, so a name never
		   covers a town you might want to tap. (Every small dot as well left a
		   phone's whole-region view with a single name on it.) */
		var placed = markerEls.filter(function (m) {
			return !m.hidden && m.kind === 'place' && m.rank === 1;
		}).map(function (m) {
			return { x: m.sx - 8, y: m.sy - 8, w: 16, h: 16, dot: m };
		});
		var sea = markerEls.filter(function (m) {
			return !m.hidden && (m.kind === 'isle' || m.kind === 'sea' || m.kind === 'river');
		});
		var named = markerEls.filter(function (m) {
			if (m.hidden) return false;
			if (m.kind === 'route') return view.scale > 3.2;
			if (m.kind !== 'place') return false;
			return m.el.classList.contains('named');
		}).sort(function (a, b) {
			/* Important names claim their space first, so a wild area gives way
			   to a town rather than the other way round. */
			if (a.rank !== b.rank) return a.rank - b.rank;
			return a.sy - b.sy;
		});

		var hits = function (a, b, gap) {
			return a.x < b.x + b.w + gap && a.x + a.w + gap > b.x &&
			       a.y < b.y + b.h + 2 && a.y + a.h + 2 > b.y;
		};
		named.forEach(function (m) {
			var span = m.el.querySelector('span');
			if (!span) return;
			/* Measure the real label: the padded ones are 25px tall, and guessing
			   15 is what let neighbouring names stack on top of each other. */
			var w = span.offsetWidth || 70, h = span.offsetHeight || 20;
			var dx = (m.el.querySelector('i') || span).offsetWidth / 2 + 8;
			var step = h + 2;
			var offsets = [0, -step, step];
			var chosen = null;
			for (var i = 0; i < offsets.length && chosen === null; i++) {
				var box = { x: m.sx + dx - 4, y: m.sy - h / 2 + offsets[i], w: w, h: h };
				var clash = placed.some(function (p) {
					return p.dot !== m && hits(box, p, 4);
				});
				if (!clash && box.x + w > viewport().w - 4) clash = true;   /* never run off the screen edge */
				if (!clash) { chosen = offsets[i]; placed.push(box); }
			}
			if (chosen === null) { span.style.opacity = '0'; return; }
			span.style.opacity = '';
			span.style.transform = 'translateY(' + chosen + 'px)';
		});

		/* Sea and island names are decoration: they give way to a place name. */
		sea.forEach(function (m) {
			if (m.el.style.opacity === '0') return;
			var r = m.el.getBoundingClientRect(), s = stage.getBoundingClientRect();
			var box = { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
			var clash = placed.some(function (p) { return !p.dot && hits(box, p, 2); });
			if (clash) m.el.style.opacity = 0;
		});
	}

	/* ------------------------------------------------------------- the tag -- */
	var tagTimer = null;
	function setTag(name, tier) {
		nameTag.innerHTML = '<i></i><b>' + name + '</b>' + (tier ? '<u>' + tier + '</u>' : '');
		nameTag.classList.add('on');
		clearTimeout(tagTimer);
		tagTimer = setTimeout(function () {
			if (!current) nameTag.classList.remove('on');
		}, 2600);
	}

	/* --------------------------------------------------------------- panel -- */
	function closePanel() {
		panel.classList.remove('open');
		current = null;
		[].forEach.call(markers.querySelectorAll('.mk'), function (b) { b.classList.remove('on'); });
	}

	function openPanel() { panel.classList.add('open'); }

	function chips(list, cls) {
		return '<div class="chips">' + (list || []).map(function (x) {
			return '<span class="' + cls + '">' + x + '</span>';
		}).join('') + '</div>';
	}

	/*
	 * The channel, front and centre.
	 *
	 * This map exists so somebody can look at where they are and then go and
	 * roleplay it. That means the single most useful thing on a location page is
	 * the channel it corresponds to - so it goes at the top, at a size you can
	 * read across a room, and clicking it copies it ready to paste.
	 */
	/*
	 * GETTING AROUND: what each channel of a place actually is, and which
	 * channels you can walk to from it.
	 *
	 * The map could say a town had eight channels and not one word about what
	 * any of them was, which made a town impossible to move around in
	 * character. The writing lives in regions/<region>-spots.js; this only
	 * lays it out, so a region without that file simply shows nothing here.
	 */
	function gettingAround(place, live) {
		var all = window.ATLAS_SPOTS && window.ATLAS_SPOTS[REGION.id];
		var here = all && all[place.id];
		if (!here || !here.spots || !here.spots.length) return '';
		var known = {};
		here.spots.forEach(function (s) { known[s.c] = true; });
		var rows = here.spots.map(function (s) {
			var hub = s.c === here.hub ? ' <b class="hubtag">you arrive here</b>' : '';
			var isNew = live && live.indexOf(s.c) < 0 ? ' new' : '';
			var exits = (s.to || []).map(function (t) {
				// A channel of this place is a chip; anything else (a route, another town) is words.
				return known[t] ? '<span class="chan' + (live && live.indexOf(t) < 0 ? ' new' : '') + '">' + t + '</span>'
					: '<span class="exit">' + t + '</span>';
			}).join('');
			return '<li><span class="chan' + isNew + '">' + s.c + '</span>' + hub +
				'<p class="spotd">' + s.d + '</p>' +
				(exits ? '<p class="spotto"><i>from here:</i> ' + exits + '</p>' : '') + '</li>';
		}).join('');
		return '<p class="dlabel">GETTING AROUND</p><ul class="spots">' + rows + '</ul>';
	}

	function primaryChan(chans) {
		if (!chans || !chans.length) return '';
		return '<button class="gochan" data-c="' + chans[0] + '">' +
		       '<i>POST IN</i><b>' + chans[0] + '</b><u>copy</u></button>';
	}

	document.addEventListener('click', function (e) {
		var way = e.target.closest('.wayto');
		if (way && way.dataset.go) { go(way.dataset.go); return; }
		var b = e.target.closest('.gochan');
		if (!b) return;
		var txt = b.dataset.c;
		var mark = function (ok) {
			var u = b.querySelector('u');
			u.textContent = ok ? 'copied' : txt;
			setTimeout(function () { u.textContent = 'copy'; }, 1400);
		};
		if (navigator.clipboard && navigator.clipboard.writeText)
			navigator.clipboard.writeText(txt).then(function () { mark(true); }, function () { mark(false); });
		else mark(false);
	});

	var artBox = document.getElementById('art');
	function showArt(id, name) {
		var src = ART[id] ? ARTDIR + ART[id] : null;
		artBox.innerHTML = src
			? '<img alt="' + name + '" src="' + src + '">'
			: '<div class="noart"><b>' + name + '</b><span>artwork coming</span></div>';
	}

	function markActive(id) {
		[].forEach.call(markers.querySelectorAll('.mk'), function (b) {
			b.classList.toggle('on', b.dataset.id === id);
		});
	}

	/* Centre the view on a place without yanking it - if it is already on screen
	   and reasonably zoomed, leave the view where the reader put it. */
	/* The part of the map the open panel leaves visible: the left side beside
	   the side panel, or the strip above the bottom sheet on a phone. */
	function openArea() {
		var vp = viewport();
		if (sheetLayout()) return { x: 0, y: 0, w: vp.w, h: Math.max(120, vp.h - panel.offsetHeight) };
		return { x: 0, y: 0, w: Math.max(120, vp.w - panel.offsetWidth), h: vp.h };
	}
	function sheetLayout() { return window.matchMedia('(max-width: 640px)').matches; }

	/* `force` is for the search: asking to be taken somewhere and being left
	   where you were, because the place happened to be on screen already, reads
	   as the search having done nothing at all. */
	function focusOn(wx, wy, force) {
		var a = openArea();
		var s = toScreen(wx, wy);
		var margin = Math.min(90, a.w / 5, a.h / 5);
		var inside = s.x > a.x + margin && s.y > a.y + margin &&
		             s.x < a.x + a.w - margin && s.y < a.y + a.h - margin;
		if (!force && inside && view.scale > 2.6) { requestDraw(); return; }
		if (view.scale < 4.5) view.scale = 4.5;
		view.ox = wx - (a.x + a.w / 2) / view.scale;
		view.oy = wy - (a.y + a.h / 2) / view.scale;
		clampView();
		frameDirty = true;
		quality = 4;
		requestDraw();
		clearTimeout(sharpTimer);
		sharpTimer = setTimeout(sharpen, 150);
	}

	function show(place) {
		current = place;
		markActive(place.id);
		setTag(place.name);
		showArt(place.id, place.name);
		focusOn(place.x, place.y);
		var live = place.live || [];
		detail.innerHTML =
			'<div class="dhead"><h3>' + place.name + '</h3>' +
			(place.gym ? '<span class="tag gym">' + place.gym + '</span>' : '') +
			(place.gate ? '<span class="tag gate">' + place.gate + '</span>' : '') +
			'</div>' +
			'<p class="dsub">' + place.island + '</p>' +
			primaryChan(place.chans) +
			'<p class="dblurb">' + place.blurb + '</p>' +
			((place.catch || []).length ? '<p class="dlabel">YOU MAY MEET</p>' + chips(place.catch, 'ty') : '') +
			'<p class="dlabel">THINGS TO DO</p>' +
			'<ul class="todo">' + (place.doing || []).map(function (d) {
				return '<li>' + d + '</li>'; }).join('') + '</ul>' +
			'<p class="dlabel">WORTH KNOWING</p>' +
			'<ul class="facts">' + (place.facts || []).map(function (f) {
				return '<li>' + f + '</li>'; }).join('') + '</ul>' +
			(place.hook ? '<p class="dlabel">PLOT HOOK</p><p class="hook">' + place.hook + '</p>' : '') +
			// A Poké Mart channel is where the bot sells at list price; anywhere else a Rotom Drone
			// delivers for a fee on each item (RP bot Patch 1.3), which players should see coming.
			(place.chans || []).filter(function (c) { return /-mart$/.test(c); }).map(function (c) {
				return '<p class="dlabel">POKÉ MART</p><p class="hook">Shop in <b>' + c + '</b> for list prices ' +
					'(<code>!shop</code>, <code>!candyshop</code>, <code>!buy</code>). Anywhere else a Rotom Drone delivers, for an extra fee on every item.</p>';
			}).join('') +
			waysOut(place.id) +
			gettingAround(place, live) +
			'<p class="dlabel">CHANNELS</p>' +
			'<div class="chans">' + (place.chans || []).map(function (c) {
				return '<span class="chan' + (live.indexOf(c) < 0 ? ' new' : '') + '">' + c + '</span>';
			}).join('') + '</div>';
		if (GYMS[place.id]) {
			var door = document.createElement('button');
			door.className = 'gymdoor';
			door.textContent = 'STEP INSIDE THE GYM';
			door.addEventListener('click', function () { showGym(place); });
			detail.insertBefore(door, detail.children[3] || null);
		}
		detail.scrollTop = 0;
		openPanel();
	}

	function showGym(place) {
		var g = GYMS[place.id];
		if (!g) return;
		showArt('g-' + place.id, g.type + ' Gym');
		detail.innerHTML =
			'<div class="dhead"><h3>' + g.type + ' Gym</h3>' +
			'<span class="tag gym">GYM</span>' +
			'<span class="tag tier">' + g.badge.toUpperCase() + '</span></div>' +
			'<p class="dsub">' + place.name + '</p>' +
			'<p class="dblurb">' + g.puzzle + '</p>' +
			'<p class="dlabel">LEADER</p><p class="dblurb">' +
			(g.leader || '<i>Not yet cast &mdash; yours to write.</i>') + '</p>' +
			'<p class="dlabel">ON THE LINE</p>' +
			'<ul class="todo"><li>' + g.badge + '</li><li>One of 8 badges, in any order</li>' +
			'<li>' + g.type + '-type leader</li></ul>';
		var back = document.createElement('button');
		back.className = 'gymdoor back';
		back.textContent = 'BACK TO ' + place.name.toUpperCase();
		back.addEventListener('click', function () { show(place); });
		detail.appendChild(back);
		detail.scrollTop = 0;
		openPanel();
	}

	function showRoute(n) {
		var r = ROUTE_INFO[n];
		if (!r) return;
		var seg = null;
		ROUTES.forEach(function (x) { if (x.n === n) seg = x; });
		var mid = seg ? seg.path[Math.floor(seg.path.length / 2)] : null;
		current = { id: 'r' + n };
		markActive('r' + n);
		setTag(r.name);
		showArt('r' + n, r.name);
		if (mid) focusOn(mid[0], mid[1]);
		detail.innerHTML =
			'<div class="dhead"><h3>' + r.name + '</h3>' +
			'<span class="tag gate">' + r.walk.toUpperCase() + '</span></div>' +
			'<p class="dsub">' + r.from + ' &rarr; ' + r.to + '</p>' +
			primaryChan(['#route-' + n]) +
			'<p class="dblurb">' + r.blurb + '</p>' +
			roadEnds('r' + n) +
			'<p class="dlabel">YOU MAY MEET</p>' + chips(r.catch, 'ty') +
			'<p class="dlabel">THINGS TO DO</p>' +
			'<ul class="todo">' + r.doing.map(function (d) {
				return '<li>' + d + '</li>'; }).join('') + '</ul>' +
			'<p class="dlabel">CHANNELS</p>' +
			'<div class="chans"><span class="chan new">#route-' + n + '</span></div>';
		detail.scrollTop = 0;
		openPanel();
	}

	/* ---------------------------------------------------------- navigation -- */
	function go(id, quiet) {
		var p = null;
		for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) p = PLACES[i];
		if (p) show(p);
		else if (/^r\d+$/.test(id) && ROUTE_INFO[id.slice(1)]) showRoute(+id.slice(1));
		else return false;
		if (!quiet) {
			var want = '#' + REGION.id + '/' + id;
			if (location.hash !== want) history.pushState(null, '', want);
		}
		return true;
	}

	function findable(id) {
		for (var i = 0; i < PLACES.length; i++) if (PLACES[i].id === id) return true;
		return /^r\d+$/.test(id) && !!ROUTE_INFO[id.slice(1)];
	}

	function loadRegion(rid, placeId, quiet) {
		var r = window.ATLAS_REGIONS[rid];
		if (!r) return false;
		bind(r);
		borderHull = null;
		fitRegion(r);
		buildMarkers();
		frameDirty = true;
		quality = 1.4;
		render();
		document.getElementById('regionName').textContent = r.name;
		[].forEach.call(document.querySelectorAll('#regionList button'), function (b) {
			b.classList.toggle('on', b.dataset.rid === rid);
		});
		if (placeId && findable(placeId)) go(placeId, quiet);
		else { closePanel(); if (!quiet) history.replaceState(null, '', '#' + rid); }
		return true;
	}

	/* ------------------------------------------------------------- gestures -- */
	/*
	 * One pointer drags, the wheel zooms at the cursor, two fingers pinch. Using
	 * pointer events rather than mouse and touch separately means a trackpad, a
	 * mouse and a phone all take the same path through this code.
	 */
	var drag = null, pointers = {}, pinchDist = 0, moved = 0;

	stage.addEventListener('pointerdown', function (e) {
		/* A finger that lands on a marker still counts toward a pinch - only a
		   single tap on one is left to the marker's own click. */
		var onMarker = !!e.target.closest('.mk, .regiontitle');
		if (onMarker && !Object.keys(pointers).length) return;
		pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
		try { stage.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
		if (Object.keys(pointers).length === 1) {
			drag = { x: e.clientX, y: e.clientY, ox: view.ox, oy: view.oy };
			moved = 0;
			stage.classList.add('grabbing');
		}
	});

	stage.addEventListener('pointermove', function (e) {
		if (!pointers[e.pointerId]) return;
		pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
		var ids = Object.keys(pointers);

		if (ids.length >= 2) {
			var a = pointers[ids[0]], b = pointers[ids[1]];
			var d = Math.hypot(a.x - b.x, a.y - b.y);
			moved = 99;                     /* a pinch is never a tap */
			if (pinchDist) {
				var mx = (a.x + b.x) / 2 - stage.getBoundingClientRect().left;
				var my = (a.y + b.y) / 2 - stage.getBoundingClientRect().top;
				zoomAt(mx, my, d / pinchDist);
			}
			pinchDist = d;
			return;
		}
		if (!drag) return;
		var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
		moved += Math.abs(dx) + Math.abs(dy);
		view.ox = drag.ox - dx / view.scale;
		view.oy = drag.oy - dy / view.scale;
		clampView();
		moving();
	});

	function endPointer(e) {
		if (!pointers[e.pointerId]) return;
		delete pointers[e.pointerId];
		var left = Object.keys(pointers);
		if (left.length < 2) pinchDist = 0;
		/* Lifting one finger of a pinch: carry on dragging from where the other
		   finger is now, not from where the drag first began (the map jumped). */
		if (left.length === 1) {
			var p = pointers[left[0]];
			drag = { x: p.x, y: p.y, ox: view.ox, oy: view.oy };
		}
		if (left.length === 0) {
			drag = null;
			stage.classList.remove('grabbing');
		}
	}
	stage.addEventListener('pointerup', endPointer);
	stage.addEventListener('pointercancel', endPointer);

	stage.addEventListener('wheel', function (e) {
		e.preventDefault();
		var r = stage.getBoundingClientRect();
		zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.16 : 1 / 1.16);
	}, { passive: false });

	/* Click empty water to close the panel, but only if it was a click and not
	   the end of a drag. */
	stage.addEventListener('click', function (e) {
		if (e.target.closest('.mk, .regiontitle, #panel, .ctl, #regionList')) return;
		if (moved > 6) return;
		closePanel();
		history.replaceState(null, '', '#' + REGION.id);
	});

	window.addEventListener('resize', function () { clampView(); frameDirty = true; quality = 4; requestDraw(); clearTimeout(sharpTimer); sharpTimer = setTimeout(sharpen, 150); });

	/* --------------------------------------------------------------- chrome -- */
	document.getElementById('close').addEventListener('click', function () {
		closePanel();
		history.replaceState(null, '', '#' + REGION.id);
	});
	document.getElementById('zin').addEventListener('click', function () {
		var vp = viewport(); zoomAt(vp.w / 2, vp.h / 2, 1.4);
	});
	document.getElementById('zout').addEventListener('click', function () {
		var vp = viewport(); zoomAt(vp.w / 2, vp.h / 2, 1 / 1.4);
	});
	document.getElementById('zfit').addEventListener('click', function () {
		fitRegion(); frameDirty = true; quality = 4; requestDraw(); clearTimeout(sharpTimer); sharpTimer = setTimeout(sharpen, 150);
	});

	/*
	 * The legend.
	 *
	 * A map with thirteen kinds of ground, six kinds of road and eight kinds of
	 * marker needs to say what they mean. It is a panel rather than a permanent
	 * strip because it is read once and then never again - it should be
	 * available, not present.
	 */
	var legendPanel = document.getElementById('legend');
	var LEGEND = [
		['PLACES', [
			['mk gym', 'Gym town'], ['mk k-town', 'Town'], ['mk k-landmark', 'Landmark'],
			['mk k-peak', 'Peak or cave'], ['mk k-water', 'Water'], ['mk k-wild', 'Wild area'],
			['mk k-legend', 'Legendary site'], ['mk k-hangout', 'Hangout'], ['mk rte', 'Route']
		]],
		['GROUND', [
			['sw', 'Grass', '#7ac660'], ['sw', 'Woodland', '#3a7a44'],
			['sw', 'Jungle', '#26764a'], ['sw', 'Ghost Woods', '#6a5a9c'],
			['sw', 'Heath and rock', '#ba9662'], ['sw', 'Snow', '#f2f6fa'],
			['sw', 'Volcanic ash', '#8e9478'], ['sw', 'Beach', '#ead69a'],
			['sw', 'Town ground', '#c6b292']
		]],
		['WATER', [
			['sw', 'Shallows', '#5cc6d0'], ['sw', 'Reef', '#e09694'],
			['sw', 'Open sea', '#345eb2'], ['sw', 'Deep and trench', '#1a2c64']
		]],
		['WAYS', [
			['ln main', 'Main road'], ['ln side', 'Track'],
			['ln bridge', 'Bridge'], ['ln ferry', 'Ferry lane'], ['ln rail', 'Railway']
		]],
		['ALSO', [
			['pip', 'Needs Flash, Climb, Dive or badges']
		]]
	];

	function buildLegend() {
		var html = '';
		LEGEND.forEach(function (group) {
			html += '<h4>' + group[0] + '</h4><ul>';
			group[1].forEach(function (row) {
				var cls = row[0], label = row[1], colour = row[2];
				var key;
				if (cls === 'sw') key = '<i class="sw" style="background:' + colour + '"></i>';
				else if (cls === 'pip') key = '<i class="pip"></i>';
				else if (cls.indexOf('ln') === 0) key = '<i class="' + cls + '"></i>';
				else key = '<span class="' + cls + ' key"><i></i></span>';
				html += '<li>' + key + label + '</li>';
			});
			html += '</ul>';
		});
		legendPanel.querySelector('.legendbody').innerHTML = html;
	}
	buildLegend();

	/* The key is shown by default - it is what makes the map legible to someone
	   arriving cold - but on a small screen it would cover the thing it explains,
	   so there it waits behind the button instead. */
	document.getElementById('legendbtn').addEventListener('click', function () {
		var small = window.matchMedia('(max-width: 820px), (max-height: 620px)').matches;
		if (small) legendPanel.classList.toggle('forced');
		else legendPanel.classList.toggle('open');
	});
	document.getElementById('legendclose').addEventListener('click', function () {
		legendPanel.classList.remove('open');
		legendPanel.classList.remove('forced');
	});

	/*
	 * Canon regions are seasonal: one rotating slot beside Kagura, swapped at the
	 * end of a season. A region that has rotated out is not deleted - the ground
	 * is still there and the map still draws it - it is marked resting, so a
	 * player who wanders north knows why nobody is there.
	 */
	var restNote = document.getElementById('restnote');
	function showRotation(r) {
		if (!restNote) return;
		var resting = r && r.rotation === 'out';
		restNote.style.display = resting ? 'block' : 'none';
		if (resting) {
			restNote.innerHTML = '<b>' + r.name + '</b> is out of rotation' +
				(r.restingNote ? ' &middot; ' + r.restingNote : ' &middot; no RP is running here this season');
		}
	}

	var list = document.getElementById('regionList');
	Object.keys(window.ATLAS_REGIONS || {}).forEach(function (rid) {
		var b = document.createElement('button');
		b.textContent = window.ATLAS_REGIONS[rid].name;
		if (window.ATLAS_REGIONS[rid].rotation === 'out') b.classList.add('resting');
		b.dataset.rid = rid;
		b.addEventListener('click', function () {
			history.pushState(null, '', '#' + rid);
			loadRegion(rid, null, true);
		});
		list.appendChild(b);
	});

	/* -------------------------------------------------------------- search --
	 * Everything on the map is clickable at every zoom, but only the trunk-road
	 * places are labelled until you are close in - so the small ones were
	 * effectively unfindable unless you already knew where to look. This finds
	 * anything by name, by island, by route number, by the kind of place it is
	 * or by the channel it owns, and puts you on it.
	 *
	 * The index is rebuilt on every keystroke on purpose: it is under a hundred
	 * entries, and a cached one goes stale the moment a region is loaded.
	 */
	var findBox = document.getElementById('find');
	var findInput = document.getElementById('findinput');
	var findList = document.getElementById('findlist');
	var findClear = document.getElementById('findclear');
	var findHits = [];
	var findSel = -1;

	/* Lower case, accents off, punctuation to spaces - so "R. Amber" is found by
	   "amber" and "Poké Center" by "poke center". */
	function norm(s) {
		return String(s || '').toLowerCase().normalize('NFD')
			.replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function searchIndex() {
		var out = [];
		PLACES.forEach(function (p) {
			var kind = p.gym ? 'gym' : (p.kind || 'place');
			out.push({
				id: p.id, name: p.name, x: p.x, y: p.y, go: true,
				tag: kind.toUpperCase(),
				sub: [p.island, p.gym ? p.gym.toLowerCase() : kind].filter(Boolean).join(' · '),
				/* Everything worth matching on, in one string: the island it is on,
				   what it is, the channels it owns and the first line of its blurb. */
				hay: [p.name, p.id, p.island, kind, p.gym, p.gate, (p.chans || []).join(' '), p.blurb].join(' '),
				rank: (p.gym || p.kind === 'legend') ? 0 : (p.kind === 'wild' || p.kind === 'water') ? 2 : 1
			});
		});
		Object.keys(ROUTE_INFO).forEach(function (n) {
			var r = ROUTE_INFO[n];
			var seg = null;
			ROUTES.forEach(function (x) { if (x.n === +n) seg = x; });
			var mid = seg ? seg.path[Math.floor(seg.path.length / 2)] : null;
			if (!mid) return;
			out.push({
				id: 'r' + n, name: r.name, x: mid[0], y: mid[1], go: true, tag: 'ROUTE',
				sub: [r.from, r.to].filter(Boolean).join(' → '),
				hay: [r.name, 'route ' + n, r.from, r.to, r.kind, r.walk, r.blurb].join(' '),
				rank: r.kind === 'main' ? 1 : 2
			});
		});
		// Islands and seas have no panel - they are places on the map all the
		// same, and "where is Tokoyo" is a fair thing to ask a map.
		(REGION.isles || []).forEach(function (i) {
			out.push({ id: null, name: i[0], x: i[1], y: i[2], go: false, tag: 'ISLAND', sub: 'island', hay: i[0] + ' island', rank: 1 });
		});
		(REGION.seas || []).concat(REGION.rivers || []).forEach(function (s) {
			out.push({ id: null, name: s[0], x: s[1], y: s[2], go: false, tag: 'WATER', sub: 'water', hay: s[0] + ' sea water', rank: 2 });
		});
		return out;
	}

	function scoreHit(entry, q) {
		var name = norm(entry.name);
		if (name === q) return 120;
		if (name.indexOf(q) === 0) return 100;
		// A word of the name starting with what was typed: "bell" finds "Sunken Bell".
		var words = name.split(' ');
		for (var i = 0; i < words.length; i++) if (words[i].indexOf(q) === 0) return 85;
		if (name.indexOf(q) >= 0) return 65;
		var hay = norm(entry.hay);
		if (hay.indexOf(' ' + q) >= 0 || hay.indexOf(q) === 0) return 45;
		if (hay.indexOf(q) >= 0) return 30;
		return 0;
	}

	function findMatches(raw) {
		var q = norm(raw);
		var list = searchIndex();
		if (!q) {
			// Nothing typed: offer the places most people are looking for.
			return list.filter(function (e) { return e.tag === 'GYM' || e.tag === 'TOWN'; })
				.sort(function (a, b) { return a.name.localeCompare(b.name); }).slice(0, 8);
		}
		var hits = [];
		list.forEach(function (e) {
			var s = scoreHit(e, q);
			if (s > 0) hits.push({ e: e, s: s - e.rank * 3 - Math.min(10, e.name.length / 4) });
		});
		hits.sort(function (a, b) { return b.s - a.s || a.e.name.localeCompare(b.e.name); });
		return hits.slice(0, 12).map(function (h) { return h.e; });
	}

	function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
	/** The typed part, marked, so it is obvious why a row matched. */
	function markHit(name, raw) {
		var q = norm(raw);
		if (!q) return esc(name);
		var at = norm(name).indexOf(q);
		if (at < 0) return esc(name);
		return esc(name.slice(0, at)) + '<em>' + esc(name.slice(at, at + q.length)) + '</em>' + esc(name.slice(at + q.length));
	}

	function drawFindList(raw) {
		findHits = findMatches(raw);
		findSel = findHits.length ? 0 : -1;
		if (!findHits.length) {
			findList.innerHTML = '<div class="findnone">Nothing by that name.</div>';
			findList.classList.add('on');
			return;
		}
		var html = '';
		for (var i = 0; i < findHits.length; i++) {
			var e = findHits[i];
			html += '<button class="findrow' + (i === 0 ? ' sel' : '') + '" data-i="' + i + '" type="button">' +
				'<b>' + markHit(e.name, raw) + '</b>' +
				'<span style="color:var(--soft);font-size:12px">' + esc(e.sub || '') + '</span>' +
				'<u>' + esc(e.tag) + '</u></button>';
		}
		findList.innerHTML = html;
		findList.classList.add('on');
	}

	function closeFind() { findList.classList.remove('on'); findBox.classList.remove('on'); findSel = -1; }

	function takeHit(i) {
		var e = findHits[i];
		if (!e) return;
		// go() centres too, but politely - it leaves the view alone when the place
		// is already on screen, which from a search looks like nothing happened.
		if (e.go) { go(e.id); focusOn(e.x, e.y, true); }
		else { setTag(e.name); focusOn(e.x, e.y, true); }
		closeFind();
		findInput.blur();       // on a phone, put the keyboard away
	}

	function moveSel(by) {
		if (!findHits.length) return;
		findSel = (findSel + by + findHits.length) % findHits.length;
		var rows = findList.querySelectorAll('.findrow');
		for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('sel', i === findSel);
		if (rows[findSel]) rows[findSel].scrollIntoView({ block: 'nearest' });
	}

	if (findInput) {
		findInput.addEventListener('input', function () {
			findBox.classList.toggle('filled', !!findInput.value);
			drawFindList(findInput.value);
		});
		findInput.addEventListener('focus', function () {
			findBox.classList.add('on');
			drawFindList(findInput.value);
		});
		/*
		 * The window key handler zooms on "-" and "=" and closes the panel on
		 * Escape, which is exactly what typing in a search box does. Nothing that
		 * happens in here is allowed to reach it.
		 */
		findInput.addEventListener('keydown', function (e) {
			e.stopPropagation();
			if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
			else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
			else if (e.key === 'Enter') { e.preventDefault(); takeHit(findSel < 0 ? 0 : findSel); }
			else if (e.key === 'Escape') {
				if (findList.classList.contains('on')) closeFind();
				else { findInput.value = ''; findBox.classList.remove('filled'); findInput.blur(); }
			}
		});
		findList.addEventListener('click', function (e) {
			var row = e.target.closest ? e.target.closest('.findrow') : null;
			if (row) takeHit(+row.getAttribute('data-i'));
		});
		findClear.addEventListener('click', function () {
			findInput.value = '';
			findBox.classList.remove('filled');
			findInput.focus();
			drawFindList('');
		});
		document.addEventListener('click', function (e) {
			if (!findBox.contains(e.target)) closeFind();
		});
		// "/" is the search key everywhere else on the web; make it one here too.
		window.addEventListener('keydown', function (e) {
			var t = e.target || {};
			if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') return;
			if (e.key === '/') { e.preventDefault(); findInput.focus(); findInput.select(); }
		});
	}

	window.addEventListener('keydown', function (e) {
		var el = e.target || {};
		// Typing in the search box is not a map shortcut.
		if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
		if (e.key === 'Escape') { closePanel(); history.replaceState(null, '', '#' + REGION.id); }
		if (e.key === '+' || e.key === '=') { var v = viewport(); zoomAt(v.w / 2, v.h / 2, 1.4); }
		if (e.key === '-') { var v2 = viewport(); zoomAt(v2.w / 2, v2.h / 2, 1 / 1.4); }
	});

	buildWorld();

	function fromHash(quiet) {
		var m = /^#([a-z0-9_-]+)(?:\/([a-z0-9_-]+))?$/i.exec(location.hash || '');
		var rid = m && window.ATLAS_REGIONS[m[1]] ? m[1] : Object.keys(window.ATLAS_REGIONS)[0];
		loadRegion(rid, m && m[2], quiet);
	}
	window.addEventListener('popstate', function () { fromHash(true); });
	fromHash(true);
})();
