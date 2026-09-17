/*
 * What joins to what, worked out from the roads themselves.
 *
 * The region file draws roads and writes a line of prose for each route ("the
 * lowlands -> Ghost Woods"), which reads nicely and tells a player nothing they
 * can act on: it never says that Route 1 runs between Sakura Town and Kagura
 * Station, or that leaving Amber Fields means Route 2, 3 or 5. So the ends of
 * every road, track, rail line and ferry are matched to the nearest place, and
 * where a road ends on another road it becomes a junction. Everything the map
 * and the bot say about "where can I go from here" comes out of this.
 *
 * Used by atlas.js in the browser and by tools/export-links.js for the Discord
 * bot, so both describe the same world.
 */
(function (root) {
	'use strict';

	var PLACE_RADIUS = 26;      // a road end this close to a place arrives there
	var JUNCTION_RADIUS = 14;   // a road end this close to another road joins it

	function dist(a, b) {
		var dx = a[0] - b[0], dy = a[1] - b[1];
		return Math.sqrt(dx * dx + dy * dy);
	}

	/** How far a point is from a road, measured to the road itself and not just to its corners. */
	function distToPath(point, path) {
		var best = Infinity;
		for (var i = 0; i < path.length; i++) {
			var a = path[i], b = path[i + 1];
			if (!b) { best = Math.min(best, dist(point, a)); break; }
			var vx = b[0] - a[0], vy = b[1] - a[1];
			var len = vx * vx + vy * vy;
			var t = len ? ((point[0] - a[0]) * vx + (point[1] - a[1]) * vy) / len : 0;
			t = Math.max(0, Math.min(1, t));
			best = Math.min(best, dist(point, [a[0] + t * vx, a[1] + t * vy]));
		}
		return best;
	}

	function nearestPlace(point, places) {
		var best = null, bestD = PLACE_RADIUS;
		places.forEach(function (p) {
			var d = dist(point, [p.x, p.y]);
			if (d <= bestD) { bestD = d; best = p; }
		});
		return best;
	}

	/** Every road in the region as { id, label, kind, path }. */
	function roadsOf(R) {
		var roads = [];
		(R.ROUTES || []).forEach(function (r) {
			var info = (R.ROUTE_INFO || {})[r.n] || {};
			roads.push({ id: 'r' + r.n, label: info.name || ('Route ' + r.n), kind: 'route', path: r.path, walk: info.walk || '', tier: info.tier || '' });
		});
		(R.LINKS || []).forEach(function (path, i) { roads.push({ id: 'link' + i, label: 'a connecting road', kind: 'road', path: path }); });
		(R.TRAILS || []).forEach(function (path, i) { roads.push({ id: 'trail' + i, label: 'a side trail', kind: 'trail', path: path }); });
		if (R.RAIL && R.RAIL.length) roads.push({ id: 'rail', label: 'the rail line', kind: 'rail', path: R.RAIL });
		(R.FERRIES || []).forEach(function (path, i) { roads.push({ id: 'ferry' + i, label: 'a ferry', kind: 'ferry', path: path }); });
		// A bridge is written as its two banks rather than as a line of points.
		(R.BRIDGES || []).forEach(function (b, i) {
			var path = Array.isArray(b) ? b : [b.a, b.b];
			if (path && path[0] && path[1]) roads.push({ id: 'bridge' + i, label: 'a bridge', kind: 'bridge', path: path });
		});
		return roads;
	}

	/**
	 * Connections, as { byPlace, byRoad, roads }.
	 *
	 *   byPlace[placeId] -> [{ to, toName, via, kind, walk }]   where `to` is a place id
	 *   byRoad[roadId]   -> { ends: [placeId...], via: [roadId...] }
	 *
	 * A road that ends on another road passes its traffic on, so Route 7's far
	 * end is followed through the junction until it reaches somewhere with a
	 * name. That is what makes "from Ghost Woods you can reach Kitaura" true.
	 */
	function build(R) {
		var places = R.PLACES || [];
		var roads = roadsOf(R);
		var ends = {};   // roadId -> [{place|null, point}]

		roads.forEach(function (road) {
			var first = road.path[0], last = road.path[road.path.length - 1];
			ends[road.id] = [first, last].map(function (point) {
				var place = nearestPlace(point, places);
				return { point: point, place: place ? place.id : null };
			});
			/*
			 * A short trail can sit inside one place's radius at both ends, which would
			 * make it a road from somewhere to itself. The far end is then treated as
			 * unresolved, so the junction search can find the route it leaves from.
			 */
			var pair = ends[road.id];
			if (pair[0].place && pair[0].place === pair[1].place) {
				var home = null;
				places.forEach(function (p) { if (p.id === pair[0].place) home = p; });
				if (home) {
					var far = dist(pair[0].point, [home.x, home.y]) >= dist(pair[1].point, [home.x, home.y]) ? 0 : 1;
					pair[far].place = null;
				}
			}
		});

		/*
		 * Road ends that reach no place are junctions. A side trail usually leaves a
		 * route halfway along rather than at its end, so any point of another road
		 * counts - that is what puts the Day Care on Route 2 instead of nowhere.
		 */
		var junctions = {};
		roads.forEach(function (a) {
			ends[a.id].forEach(function (endA, i) {
				if (endA.place) return;
				roads.forEach(function (b) {
					if (b.id === a.id) return;
					var meets = distToPath(endA.point, b.path) <= JUNCTION_RADIUS;
					if (!meets) return;
					var key = a.id + '|' + i;
					junctions[key] = junctions[key] || [];
					if (junctions[key].indexOf(b.id) < 0) junctions[key].push(b.id);
				});
			});
		});

		/** Follow a road's end through junctions until places are found. */
		function reachedFrom(roadId, index, seen) {
			seen = seen || {};
			seen[roadId] = true;
			var end = ends[roadId][index];
			if (end.place) return [end.place];
			var out = [];
			(junctions[roadId + '|' + index] || []).forEach(function (nextId) {
				if (seen[nextId]) return;
				ends[nextId].forEach(function (e, j) {
					if (e.place) { if (out.indexOf(e.place) < 0) out.push(e.place); return; }
					reachedFrom(nextId, j, seen).forEach(function (id) { if (out.indexOf(id) < 0) out.push(id); });
				});
			});
			return out;
		}

		var nameOf = {};
		places.forEach(function (p) { nameOf[p.id] = p.name; });

		var byPlace = {}, byRoad = {};
		roads.forEach(function (road) {
			var here = ends[road.id].map(function (e, i) { return e.place ? [e.place] : reachedFrom(road.id, i); });
			byRoad[road.id] = { label: road.label, kind: road.kind, ends: here, walk: road.walk || '' };
			here.forEach(function (side, i) {
				var other = here[1 - i];
				side.forEach(function (from) {
					other.forEach(function (to) {
						if (from === to) return;
						byPlace[from] = byPlace[from] || [];
						var already = byPlace[from].some(function (c) { return c.to === to && c.via === road.label; });
						if (!already) byPlace[from].push({ to: to, toName: nameOf[to] || to, via: road.label, kind: road.kind, walk: road.walk || '' });
					});
				});
			});
		});

		/*
		 * Places no road reaches - a beach, a tarn, a hangout - are still somewhere
		 * you walk to. Each is attached to the nearest road, or failing that the
		 * nearest place, as a short walk off it, so nothing on the map is an island
		 * with no way in.
		 */
		places.forEach(function (p) {
			if (byPlace[p.id] && byPlace[p.id].length) return;
			var bestRoad = null, bestRoadD = Infinity;
			roads.forEach(function (road) {
				var d = distToPath([p.x, p.y], road.path);
				if (d < bestRoadD) { bestRoadD = d; bestRoad = road; }
			});
			var bestPlace = null, bestPlaceD = Infinity;
			places.forEach(function (other) {
				if (other.id === p.id) return;
				var d = dist([other.x, other.y], [p.x, p.y]);
				if (d < bestPlaceD) { bestPlaceD = d; bestPlace = other; }
			});
			byPlace[p.id] = byPlace[p.id] || [];
			if (bestRoad && bestRoadD <= 70) {
				// Off which road, and from which of its ends - the nearer one is the one you walk from.
				var nearby = (byRoad[bestRoad.id] || { ends: [[], []] }).ends;
				var reach = [].concat(nearby[0] || [], nearby[1] || []);
				var from = null, fromD = Infinity;
				reach.forEach(function (id) {
					if (id === p.id) return;   // a trail that starts here does not lead here
					var other = places.filter(function (x) { return x.id === id; })[0];
					if (!other) return;
					var d = dist([other.x, other.y], [p.x, p.y]);
					if (d < fromD) { fromD = d; from = other; }
				});
				var label = 'a short walk off ' + bestRoad.label;
				if (from) {
					byPlace[p.id].push({ to: from.id, toName: from.name, via: label, kind: 'walk', walk: 'a short walk' });
					byPlace[from.id] = byPlace[from.id] || [];
					if (!byPlace[from.id].some(function (c) { return c.to === p.id; })) {
						byPlace[from.id].push({ to: p.id, toName: p.name, via: label, kind: 'walk', walk: 'a short walk' });
					}
				} else if (bestPlace) {
					byPlace[p.id].push({ to: bestPlace.id, toName: bestPlace.name, via: 'a short walk from ' + bestPlace.name, kind: 'walk', walk: 'a short walk' });
				}
			} else if (bestPlace) {
				byPlace[p.id].push({ to: bestPlace.id, toName: bestPlace.name, via: 'a walk from ' + bestPlace.name, kind: 'walk', walk: 'a short walk' });
				byPlace[bestPlace.id] = byPlace[bestPlace.id] || [];
				if (!byPlace[bestPlace.id].some(function (c) { return c.to === p.id; })) {
					byPlace[bestPlace.id].push({ to: p.id, toName: p.name, via: 'a short walk', kind: 'walk', walk: 'a short walk' });
				}
			}
		});

		// Roads first, then ferries and side trails, and alphabetical inside each.
		var order = { route: 0, road: 1, bridge: 2, rail: 3, ferry: 4, trail: 5, walk: 6 };
		Object.keys(byPlace).forEach(function (id) {
			byPlace[id].sort(function (a, b) {
				return (order[a.kind] - order[b.kind]) || a.via.localeCompare(b.via, undefined, { numeric: true });
			});
		});
		return { byPlace: byPlace, byRoad: byRoad, roads: roads };
	}

	root.ATLAS_CONNECTIONS = { build: build };
	if (typeof module !== 'undefined' && module.exports) module.exports = { build: build };
})(typeof window !== 'undefined' ? window : global);
