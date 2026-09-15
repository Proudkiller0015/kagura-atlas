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

	function render() {
		var vp = viewport();
		var cw = Math.max(1, Math.round(vp.w / quality));
		var ch = Math.max(1, Math.round(vp.h / quality));
		if (canvas.width !== cw || canvas.height !== ch) {
			canvas.width = cw; canvas.height = ch;
		}
		/* drawWorld works in "one canvas pixel = 1/scale world units", so the
		   effective scale has to account for the upscale factor. */
		drawWorld(canvas, { scale: view.scale / quality, ox: view.ox, oy: view.oy });
		placeMarkers();
	}

	function requestDraw() {
		if (needsDraw) return;
		needsDraw = true;
		requestAnimationFrame(function () { needsDraw = false; render(); });
	}

	/* Coarse while moving, sharp once still. */
	function moving() {
		if (quality !== 5) { quality = 5; }
		requestDraw();
		clearTimeout(sharpTimer);
		sharpTimer = setTimeout(function () { quality = 2; render(); }, 140);
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
		var pad = 120;
		var visW = vp.w / view.scale, visH = vp.h / view.scale;
		view.ox = Math.min(Math.max(view.ox, -pad), W + pad - visW);
		view.oy = Math.min(Math.max(view.oy, -pad), H + pad - visH);
		if (visW > W + pad * 2) view.ox = (W - visW) / 2;
		if (visH > H + pad * 2) view.oy = (H - visH) / 2;
	}

	function zoomAt(sx, sy, factor) {
		var before = toWorld(sx, sy);
		view.scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
		var after = toWorld(sx, sy);
		view.ox += before.x - after.x;          /* keep the point under the cursor */
		view.oy += before.y - after.y;
		clampView();
		moving();
	}

	function fitRegion() {
		var vp = viewport();
		view.scale = Math.max(vp.w / W, vp.h / H);
		view.ox = (W - vp.w / view.scale) / 2;
		view.oy = (H - vp.h / view.scale) / 2;
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

	function buildMarkers() {
		markers.innerHTML = '';
		markerEls = [];
		PLACES.forEach(function (p) {
			var b = document.createElement('button');
			b.className = 'mk' + (p.gym ? ' gym' : '') + (GYMS[p.id] ? '' : '');
			b.dataset.id = p.id;
			b.innerHTML = '<i></i><span>' + p.name + '</span>';
			b.title = p.name;
			b.addEventListener('click', function (e) { e.stopPropagation(); go(p.id); });
			b.addEventListener('mouseenter', function () { setTag(p.name, p.tier); });
			markers.appendChild(b);
			markerEls.push({ el: b, x: p.x, y: p.y, kind: 'place' });
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
			b.addEventListener('mouseenter', function () { setTag(info.name || ('Route ' + r.n), info.tier || ''); });
			markers.appendChild(b);
			markerEls.push({ el: b, x: mid[0], y: mid[1], kind: 'route' });
		});
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
	}

	function placeMarkers() {
		var vp = viewport();
		var showNames = view.scale > 1.9;
		markerEls.forEach(function (m) {
			var s = toScreen(m.x, m.y);
			var off = s.x < -80 || s.y < -60 || s.x > vp.w + 80 || s.y > vp.h + 60;
			m.el.style.display = off ? 'none' : '';
			if (off) return;
			m.el.style.transform = 'translate(' + Math.round(s.x) + 'px,' + Math.round(s.y) + 'px)';
			if (m.kind === 'place' || m.kind === 'route')
				m.el.classList.toggle('named', showNames);
			if (m.kind === 'isle') m.el.style.opacity = view.scale > 6 ? 0 : 1;
			if (m.kind === 'sea') m.el.style.opacity = view.scale > 5 ? 0 : 1;
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
	function primaryChan(chans) {
		if (!chans || !chans.length) return '';
		return '<button class="gochan" data-c="' + chans[0] + '">' +
		       '<i>POST IN</i><b>' + chans[0] + '</b><u>copy</u></button>';
	}

	document.addEventListener('click', function (e) {
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
	function focusOn(wx, wy) {
		var vp = viewport();
		var s = toScreen(wx, wy);
		var margin = 90;
		var inside = s.x > margin && s.y > margin &&
		             s.x < vp.w - 380 && s.y < vp.h - margin;
		if (inside && view.scale > 2.6) { requestDraw(); return; }
		if (view.scale < 4.5) view.scale = 4.5;
		view.ox = wx - (vp.w - 360) / 2 / view.scale;
		view.oy = wy - vp.h / 2 / view.scale;
		clampView();
		quality = 2;
		requestDraw();
	}

	function show(place) {
		current = place;
		markActive(place.id);
		setTag(place.name, place.tier);
		showArt(place.id, place.name);
		focusOn(place.x, place.y);
		var live = place.live || [];
		detail.innerHTML =
			'<div class="dhead"><h3>' + place.name + '</h3>' +
			'<span class="tag tier">' + place.tier + '</span>' +
			(place.gym ? '<span class="tag gym">' + place.gym + '</span>' : '') +
			(place.gate ? '<span class="tag gate">' + place.gate + '</span>' : '') +
			'</div>' +
			'<p class="dsub">' + place.island + '</p>' +
			primaryChan(place.chans) +
			'<p class="dblurb">' + place.blurb + '</p>' +
			'<p class="dlabel">YOU MAY MEET</p>' + chips(place.catch, 'ty') +
			'<p class="dlabel">THINGS TO DO</p>' +
			'<ul class="todo">' + (place.doing || []).map(function (d) {
				return '<li>' + d + '</li>'; }).join('') + '</ul>' +
			'<p class="dlabel">WORTH KNOWING</p>' +
			'<ul class="facts">' + (place.facts || []).map(function (f) {
				return '<li>' + f + '</li>'; }).join('') + '</ul>' +
			(place.hook ? '<p class="dlabel">PLOT HOOK</p><p class="hook">' + place.hook + '</p>' : '') +
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
			'<span class="tag gym">GYM ' + g.no + '</span>' +
			'<span class="tag tier">' + g.badge.toUpperCase() + '</span></div>' +
			'<p class="dsub">' + place.name + '</p>' +
			'<p class="dblurb">' + g.puzzle + '</p>' +
			'<p class="dlabel">LEADER</p><p class="dblurb">' +
			(g.leader || '<i>Not yet cast &mdash; yours to write.</i>') + '</p>' +
			'<p class="dlabel">ON THE LINE</p>' +
			'<ul class="todo"><li>' + g.badge + '</li><li>Badge ' + g.no + ' of 8</li>' +
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
		setTag(r.name, r.tier);
		showArt('r' + n, r.name);
		if (mid) focusOn(mid[0], mid[1]);
		detail.innerHTML =
			'<div class="dhead"><h3>' + r.name + '</h3>' +
			'<span class="tag tier">' + r.tier + '</span>' +
			'<span class="tag gate">' + r.walk.toUpperCase() + '</span></div>' +
			'<p class="dsub">' + r.from + ' &rarr; ' + r.to + '</p>' +
			primaryChan(['#route-' + n]) +
			'<p class="dblurb">' + r.blurb + '</p>' +
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
		fitRegion();
		buildMarkers();
		quality = 2;
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
		if (e.target.closest('.mk, #panel, .ctl, #regionList')) return;
		pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
		if (Object.keys(pointers).length === 1) {
			drag = { x: e.clientX, y: e.clientY, ox: view.ox, oy: view.oy };
			moved = 0;
			stage.setPointerCapture(e.pointerId);
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
		delete pointers[e.pointerId];
		if (Object.keys(pointers).length < 2) pinchDist = 0;
		if (Object.keys(pointers).length === 0) {
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
		if (e.target.closest('.mk, #panel, .ctl, #regionList')) return;
		if (moved > 6) return;
		closePanel();
		history.replaceState(null, '', '#' + REGION.id);
	});

	window.addEventListener('resize', function () { clampView(); quality = 2; requestDraw(); });

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
		fitRegion(); quality = 2; requestDraw();
	});

	var list = document.getElementById('regionList');
	Object.keys(window.ATLAS_REGIONS || {}).forEach(function (rid) {
		var b = document.createElement('button');
		b.textContent = window.ATLAS_REGIONS[rid].name;
		b.dataset.rid = rid;
		b.addEventListener('click', function () {
			history.pushState(null, '', '#' + rid);
			loadRegion(rid, null, true);
		});
		list.appendChild(b);
	});

	window.addEventListener('keydown', function (e) {
		if (e.key === 'Escape') { closePanel(); history.replaceState(null, '', '#' + REGION.id); }
		if (e.key === '+' || e.key === '=') { var v = viewport(); zoomAt(v.w / 2, v.h / 2, 1.4); }
		if (e.key === '-') { var v2 = viewport(); zoomAt(v2.w / 2, v2.h / 2, 1 / 1.4); }
	});

	function fromHash(quiet) {
		var m = /^#([a-z0-9_-]+)(?:\/([a-z0-9_-]+))?$/i.exec(location.hash || '');
		var rid = m && window.ATLAS_REGIONS[m[1]] ? m[1] : Object.keys(window.ATLAS_REGIONS)[0];
		loadRegion(rid, m && m[2], quiet);
	}
	window.addEventListener('popstate', function () { fromHash(true); });
	fromHash(true);
})();
