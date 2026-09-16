/*
 * Kagura - what each channel IS, and how the places inside a location connect.
 *
 * The map could tell you a town existed and which channels belonged to it, but
 * not what any of those channels was, nor how you would walk between them in
 * character. That is what this file is: one line per channel, and the doors out
 * of it.
 *
 * Shape, per place id:
 *   hub    the channel everything else hangs off ("you arrive here")
 *   spots  [{ c: channel, d: what it is, to: [channels or route/place names] }]
 *
 * `to` is written the way a person would say it: other channels in the same
 * place, "Route 3", or another place's name. The panel turns channel names into
 * links and leaves the rest as words.
 *
 * Kept apart from kagura.js because that file is the map - shapes, colours,
 * coordinates - and this is the writing.
 */
(function () {
	'use strict';

	var SPOTS = {
		sakura: {
			hub: '#sakura-square',
			spots: [
				{ c: '#sakura-square', d: 'The middle of town: a paved square with the old well at its centre, benches, and a noticeboard nobody has cleared since spring. Everything in Sakura is a minute from here.', to: ['#the-old-well', '#sakura-lab', '#poke-center', '#sakura-mart', '#shrine-steps', '#blossom-road', '#sakura-houses'] },
				{ c: '#the-old-well', d: 'The well in the middle of the square. Sweet water, a bucket on a rope, and a coin tradition nobody can explain any more.', to: ['#sakura-square'] },
				{ c: '#sakura-lab', d: "The Professor's lab on the square's north side: starters, the regional dex, and a garden out back that is mostly Oddish.", to: ['#sakura-square'] },
				{ c: '#poke-center', d: 'The Pokémon Centre, east side of the square. Healing, the PC, and the first bed most trainers sleep in away from home.', to: ['#sakura-square'] },
				{ c: '#sakura-mart', d: 'The Mart, west side. Balls, potions and the Candy Shop counter at the back. List prices here - anywhere else the Rotom Drone charges to deliver.', to: ['#sakura-square'] },
				{ c: '#shrine-steps', d: 'Stone steps climbing the blossom slope behind the town to a small shrine. Best view of the bay, and the quietest place to think.', to: ['#sakura-square'] },
				{ c: '#sakura-houses', d: 'The lanes of houses below the square, washing lines and low walls, sloping down towards the sand.', to: ['#sakura-square', '#sakura-beach'] },
				{ c: '#sakura-beach', d: 'The town beach at the bottom of the lanes: grey sand, a boat pulled up past the tideline, and the bay going quiet in the evening. Shellder and Wingull, and the water is calm enough to swim.', to: ['#sakura-houses', '#cynthias-house'] },
				{ c: '#cynthias-house', d: 'The house at the far end of the beach: driftwood porch, a garden of sea grass, and the shutters open whether or not anyone is in. Cynthia keeps it.', to: ['#sakura-beach'] },
				{ c: '#blossom-road', d: 'The road out of town, north past the last houses, where the blossom ends and Route 1 begins.', to: ['#sakura-square', 'Route 1'] },
			],
		},
		station: {
			hub: '#train-station',
			spots: [
				{ c: '#train-station', d: 'The station hall and the island hub: departure boards, the rail south to Sakura, and roads east and north from the doors.', to: ['#ticket-hall', '#platform-two', '#station-market', '#freight-yard', '#lost-property', 'Route 1', 'Route 2', 'Route 4'] },
				{ c: '#ticket-hall', d: 'Ticket windows, a tea stall and the queue. Where you find out the next train is in forty minutes.', to: ['#train-station'] },
				{ c: '#platform-two', d: 'The southbound platform, open to the weather. The Sakura train leaves from here.', to: ['#train-station', 'Sakura Town'] },
				{ c: '#station-market', d: 'Stalls along the station wall: hot food, second-hand gear, and trainers trading in the gaps between trains.', to: ['#train-station'] },
				{ c: '#freight-yard', d: 'Containers, a crane and a gate that is meant to be locked. Paperwork here does not always match what is in the boxes.', to: ['#train-station'] },
				{ c: '#lost-property', d: 'A counter behind the ticket hall, shelves of umbrellas and one very patient clerk.', to: ['#train-station'] },
			],
		},
		amber: {
			hub: '#the-fields',
			spots: [
				{ c: '#the-fields', d: 'Barley, hedgerows and ploughed rows: the open farmland that is the middle of Amber Fields. Paths run off it in every direction.', to: ['#glasshouse-gym', '#farm-shop', '#mill-pond', '#the-barns', '#scarecrow-lane', 'Route 2', 'Route 3', 'Route 5'] },
				{ c: '#glasshouse-gym', d: 'The Grass gym: a working glasshouse, warm and wet, where the leader is whoever is winning the harvest this year.', to: ['#the-fields'] },
				{ c: '#farm-shop', d: 'A farm shop by the lane - eggs, berries, cold drinks. Not a Poké Mart, so the drone still charges to bring your shopping.', to: ['#the-fields'] },
				{ c: '#mill-pond', d: 'The pond beside the old mill, still and green at the edges. Water Pokémon, and a jetty to fish from.', to: ['#the-fields', '#the-jetty'] },
				{ c: '#the-barns', d: 'Hay, cats, machinery and shade. Trainers sleep here when the inn is full and the farmer pretends not to notice.', to: ['#the-fields'] },
				{ c: '#scarecrow-lane', d: 'A sunken lane of scarecrows, each dressed by a different family. The oldest is a hundred years old and nobody will say which.', to: ['#the-fields'] },
			],
		},
		minato: {
			hub: '#docks',
			spots: [
				{ c: '#docks', d: 'The working waterfront: cranes, nets, crates and shouting. Everything in Minato leads back here.', to: ['#ferry-terminal', '#fish-market', '#harbour-mart', '#harbour-gym', '#poke-center-minato', '#the-breakwater', '#warehouse-row', '#harbour-inn', 'Route 3'] },
				{ c: '#ferry-terminal', d: 'The ferry building. Timetables, a waiting room and the boats that leave the island.', to: ['#docks'] },
				{ c: '#fish-market', d: 'Early, loud, and over by nine. Ice, crates and the best food on the island if you know which stall.', to: ['#docks'] },
				{ c: '#harbour-mart', d: 'The Poké Mart on the quay, chandlery on one side, balls and medicine on the other. List prices here.', to: ['#docks'] },
				{ c: '#harbour-gym', d: 'The Water gym, built into the sea wall itself: the floor floods to the tide and the leader knows the timetable.', to: ['#docks'] },
				{ c: '#poke-center-minato', d: 'The Pokémon Centre above the harbour, windows on the water.', to: ['#docks'] },
				{ c: '#the-breakwater', d: 'The long arm of stone out into the bay. Waves one side, boats the other, and fishing at the end of it.', to: ['#docks'] },
				{ c: '#warehouse-row', d: 'Sheds along the back of the quay. One of them is rented by people nobody at the harbour office can describe.', to: ['#docks'] },
				{ c: '#harbour-inn', d: 'Beds, a fire and a bar that argues about football. The cheapest room on the coast.', to: ['#docks'] },
			],
		},
		ember: {
			hub: '#caldera-town',
			spots: [
				{ c: '#caldera-town', d: 'The town inside the old caldera: black stone streets, steam from the gratings, and the rim standing over everything.', to: ['#ember-gym', '#poke-center-ember', '#ember-mart', '#hot-springs', '#ash-flats', '#the-vents', '#obsidian-works', 'Route 11'] },
				{ c: '#ember-gym', d: 'The Fire gym, cut into the caldera wall. Hot enough that the queue waits outside.', to: ['#caldera-town'] },
				{ c: '#poke-center-ember', d: 'The Pokémon Centre, cool inside for once, with the shutters down against the ash.', to: ['#caldera-town'] },
				{ c: '#ember-mart', d: 'The Mart on the main street. List prices, and a shelf of dust masks nobody buys until the first fall.', to: ['#caldera-town'] },
				{ c: '#hot-springs', d: 'Public baths fed straight from the ground: three pools, hottest at the top, and a rule about washing first that everybody follows.', to: ['#caldera-town'] },
				{ c: '#ash-flats', d: 'The grey plain outside the town where ash settles deep enough to walk in. Things live in it.', to: ['#caldera-town', '#warm-ground'] },
				{ c: '#the-vents', d: 'Fissures on the slope, sulphur and heat haze, roped off in the places that have killed someone.', to: ['#caldera-town'] },
				{ c: '#obsidian-works', d: 'A glassworks running on volcanic heat. The night shift is larger than the work needs.', to: ['#caldera-town'] },
			],
		},
		tidecall: {
			hub: '#the-stacks',
			spots: [
				{ c: '#the-stacks', d: 'Sea stacks standing out of the shallows, the town built along and between them on boardwalks.', to: ['#tidecall-gym', '#poke-center-tsuki', '#tidecall-mart', '#the-causeway', '#stilt-houses', 'Route 13'] },
				{ c: '#tidecall-gym', d: 'The gym on the furthest stack, reached at low tide or not at all. Time your challenge.', to: ['#the-stacks', '#the-causeway'] },
				{ c: '#poke-center-tsuki', d: 'The Pokémon Centre on the main stack, lamp lit all night for boats.', to: ['#the-stacks'] },
				{ c: '#tidecall-mart', d: 'The Mart on the boardwalk, everything stocked in crates against the damp. List prices here.', to: ['#the-stacks'] },
				{ c: '#the-causeway', d: 'The stone path to the gym stack, underwater twice a day. The tide table is painted on the wall at both ends.', to: ['#the-stacks', '#tidecall-gym'] },
				{ c: '#stilt-houses', d: 'Homes on piles over the water, joined by walkways, with boats tied under the floors.', to: ['#the-stacks'] },
			],
		},
		league: {
			hub: '#league-lobby',
			spots: [
				{ c: '#league-lobby', d: 'The top of Victory Road: badge check, a desk, and four doors in a row. Nobody goes through without eight badges.', to: ['#league-centre', '#league-mart', '#hall-the-first', 'Victory Road'] },
				{ c: '#league-centre', d: 'The last Pokémon Centre. Heal here; there is no healing past the first door.', to: ['#league-lobby'] },
				{ c: '#league-mart', d: 'The last Mart, priced for people who are about to need everything.', to: ['#league-lobby'] },
				{ c: '#hall-the-first', d: 'The first hall of the Elite Four. The door behind you closes when you enter.', to: ['#hall-the-second'] },
				{ c: '#hall-the-second', d: 'The second hall. No way back, and the floor plan tells you nothing about who is waiting.', to: ['#hall-the-third'] },
				{ c: '#hall-the-third', d: 'The third hall, colder than the others, and the light comes from below.', to: ['#hall-the-fourth'] },
				{ c: '#hall-the-fourth', d: 'The fourth hall, and the longest walk of the four.', to: ['#champions-chamber'] },
				{ c: '#champions-chamber', d: 'The Champion waits here, and the room is built so you can hear yourself breathe.', to: ['#hall-of-fame'] },
				{ c: '#hall-of-fame', d: 'Where a winning team is recorded, permanently, with the trainer who brought it.', to: ['#league-lobby'] },
			],
		},
		victory: {
			hub: '#victory-gatehouse',
			spots: [
				{ c: '#victory-gatehouse', d: 'The gate at the foot of the mountain: eight badges checked, water sold, and the only place to turn back without losing face.', to: ['#the-lower-slopes', 'Route 10'] },
				{ c: '#the-lower-slopes', d: 'Open switchbacks above the gate, gorse and scree, the League already in sight far above.', to: ['#victory-gatehouse', '#first-cave'] },
				{ c: '#first-cave', d: 'The first cave: short, wet, and it puts you back outside a hundred metres higher.', to: ['#the-lower-slopes', '#the-cliff-path'] },
				{ c: '#the-cliff-path', d: 'A ledge with a drop on one side and a handrail that stops halfway along.', to: ['#first-cave', '#rope-bridges'] },
				{ c: '#rope-bridges', d: 'Three spans over the gorges, crossed one person at a time, in the wind.', to: ['#the-cliff-path', '#second-cave'] },
				{ c: '#second-cave', d: 'The long cave. Dark, branching, and the way through is not the way that feels right.', to: ['#rope-bridges', '#final-climb'] },
				{ c: '#final-climb', d: 'Stairs cut into the last of the rock, straight up to the plateau and the League doors.', to: ['#second-cave', 'Kagura League'] },
			],
		},
		stables: {
			hub: '#the-stables',
			spots: [
				{ c: '#the-stables', d: 'Long timber stalls and a yard of raked sand. Rideable Pokémon are kept, trained and hired out from here.', to: ['#the-paddocks', '#tack-room', 'Route 6'] },
				{ c: '#the-paddocks', d: 'Fenced fields behind the stalls where the young stock is worked. Lean on the rail and watch, nobody minds.', to: ['#the-stables'] },
				{ c: '#tack-room', d: 'Saddles, bridles and the smell of leather and oil. Hire is arranged here, and the ledger is very exact.', to: ['#the-stables'] },
			],
		},
		daycare: {
			hub: '#the-day-care',
			spots: [
				{ c: '#the-day-care', d: 'The Day Care house: leave a Pokémon and it comes back stronger. `!daycare` on the bot does the paperwork.', to: ['#the-walled-garden', 'Route 6'] },
				{ c: '#the-walled-garden', d: 'The garden behind the house where the boarders spend their days. Sun, long grass, and someone always asleep in it.', to: ['#the-day-care'] },
			],
		},
		hall: {
			hub: '#trainers-hall',
			spots: [
				{ c: '#trainers-hall', d: 'A hall built for battling: rings, benches, a board of challenges and someone always up for one.', to: ['#the-open-ladder', '#the-wall-of-names', 'Route 12'] },
				{ c: '#the-open-ladder', d: 'The ladder board: names, wins, and challenges you can accept on the spot.', to: ['#trainers-hall'] },
				{ c: '#the-wall-of-names', d: 'Every trainer who ever took the hall\'s ladder, carved in. The top of it is old.', to: ['#trainers-hall'] },
			],
		},
		onsen: {
			hub: '#ashen-onsen',
			spots: [
				{ c: '#ashen-onsen', d: 'A hot-spring inn on the volcanic slope: tatami, screens, and steam coming through the floor.', to: ['#the-outdoor-bath', '#the-guest-rooms', 'Route 11'] },
				{ c: '#the-outdoor-bath', d: 'The open-air bath, walled in black stone, with ash falling into the water when the mountain is busy.', to: ['#ashen-onsen'] },
				{ c: '#the-guest-rooms', d: 'Rooms along a wooden gallery. Thin walls, good bedding, and the mountain audible all night.', to: ['#ashen-onsen'] },
			],
		},
		cinder: {
			hub: '#cinder-row',
			spots: [
				{ c: '#cinder-row', d: 'A single row of houses on the black shore, built for the works and outlasting it.', to: ['#row-shop', '#the-jetty', 'Route 12'] },
				{ c: '#row-shop', d: 'One shop for the whole row: post, groceries, fishing line, gossip. Not a Poké Mart.', to: ['#cinder-row'] },
				{ c: '#the-jetty', d: 'A short wooden jetty into deep cold water. The fishing is better than the village admits.', to: ['#cinder-row'] },
			],
		},
		ruins: {
			hub: '#the-standing-stones',
			spots: [
				{ c: '#the-standing-stones', d: 'A ring of nine stones on open heath, eight standing. People feel watched here and are not entirely wrong.', to: ['#stones-gym', '#the-fallen-ninth', 'Route 8'] },
				{ c: '#stones-gym', d: 'The Psychic gym, underground beneath the ring: a stair between two stones, and a chamber lit by what the leader is doing.', to: ['#the-standing-stones'] },
				{ c: '#the-fallen-ninth', d: 'The ninth stone, down and half buried. The carvings on the underside are the only ones nobody has copied.', to: ['#the-standing-stones'] },
			],
		},
		mine: {
			hub: '#the-old-mine',
			spots: [
				{ c: '#the-old-mine', d: 'The mine mouth and the yard outside it: rails, a tipped truck, and a gate that has been open for years.', to: ['#upper-galleries', '#the-water-line', 'Route 7'] },
				{ c: '#upper-galleries', d: 'Dry tunnels near the surface, timbered and walkable, with old tool marks and newer footprints.', to: ['#the-old-mine', '#the-water-line'] },
				{ c: '#the-water-line', d: 'Where the workings flooded. Black water, no floor beyond it, and the sound carries a long way.', to: ['#upper-galleries'] },
			],
		},
		observatory: {
			hub: '#storm-observatory',
			spots: [
				{ c: '#storm-observatory', d: 'A weather station on the high ridge: instruments, aerials, and the best view of anything coming.', to: ['#the-weather-logs', 'Route 9'] },
				{ c: '#the-weather-logs', d: 'A room of ledgers going back decades. Somebody has been marking the same date every year in red.', to: ['#storm-observatory'] },
			],
		},
		shelf: {
			hub: '#storm-watch',
			spots: [
				{ c: '#storm-watch', d: 'The cliff-top village on the shelf, roofs weighted with stone against the wind.', to: ['#shelf-gym', '#cliff-stairs', '#the-pylons', 'Route 9'] },
				{ c: '#shelf-gym', d: 'The Electric gym on the cliff edge, wired into the pylons and loudest during a storm.', to: ['#storm-watch'] },
				{ c: '#cliff-stairs', d: 'Cut steps down the cliff face to the water, wet the whole way.', to: ['#storm-watch'] },
				{ c: '#the-pylons', d: 'The line of pylons marching inland. They hum, and in the right weather they sing.', to: ['#storm-watch'] },
			],
		},
		ghost: {
			hub: '#the-treeline',
			spots: [
				{ c: '#the-treeline', d: 'The edge of the wood, where the light stops. Everyone starts here and most people stop here.', to: ['#deep-woods', 'Route 7'] },
				{ c: '#deep-woods', d: 'Close trunks, no birds, and the path underfoot is not always the one you were on.', to: ['#the-treeline', '#lantern-clearing', '#where-the-paths-move'] },
				{ c: '#lantern-clearing', d: 'A clearing hung with paper lanterns that are lit every evening by nobody anyone has met.', to: ['#deep-woods', '#woods-gym', '#the-shrine-ruin'] },
				{ c: '#woods-gym', d: 'The Ghost gym off the lantern clearing: a house that is the wrong size inside.', to: ['#lantern-clearing'] },
				{ c: '#the-shrine-ruin', d: 'A collapsed shrine, its offerings fresh. Somebody keeps up a place that has no roof.', to: ['#lantern-clearing'] },
				{ c: '#where-the-paths-move', d: 'The part of the wood that does not hold still. Go in with a plan; you will leave by a different way.', to: ['#deep-woods'] },
			],
		},
		grotto: {
			hub: '#grotto-mouth',
			spots: [
				{ c: '#grotto-mouth', d: 'The sea cave entrance, wide at low tide and gone at high. Moonlight reaches the first chamber and no further.', to: ['#deep-grotto', '#the-tide-gate', 'Route 14'] },
				{ c: '#deep-grotto', d: 'Deeper chambers of still water and pale stone, quiet enough to hear your own pulse.', to: ['#grotto-mouth', '#grotto-gym'] },
				{ c: '#grotto-gym', d: 'The Dark gym in the inner chamber, lit only where the leader wants you to look.', to: ['#deep-grotto'] },
				{ c: '#the-tide-gate', d: 'The iron gate across the inner passage, closed by the tide twice a day whether or not you are through it.', to: ['#grotto-mouth'] },
			],
		},
		castle: {
			hub: '#castle-gate',
			spots: [
				{ c: '#castle-gate', d: 'The gate of a castle that should not be here: open, unguarded, and swept.', to: ['#throne-room', '#library', '#undercroft', '#the-battlements', 'Route 8'] },
				{ c: '#throne-room', d: 'A long hall with one chair at the end of it, and dust that avoids the chair.', to: ['#castle-gate', '#kings-quarters'] },
				{ c: '#library', d: 'Shelves to the ceiling. The books are about Pokémon, and the margins argue with the text.', to: ['#castle-gate'] },
				{ c: '#undercroft', d: 'Cellars below the hall, cold, and larger than the castle above them.', to: ['#castle-gate'] },
				{ c: '#the-battlements', d: 'The wall walk, with the whole heath below and the weather coming from the north.', to: ['#castle-gate'] },
				{ c: '#kings-quarters', d: 'Private rooms behind the throne, lived in recently by somebody tidy.', to: ['#throne-room'] },
			],
		},
		silver: {
			hub: '#foothills',
			spots: [
				{ c: '#foothills', d: 'The approach: scree, thin air, and the last grass on the mountain.', to: ['#climbers-hut', '#silver-cave', 'Route 10'] },
				{ c: '#climbers-hut', d: 'A stone hut with a stove and a visitors\' book. Sign it; people check.', to: ['#foothills'] },
				{ c: '#silver-cave', d: 'The cave through the mountain\'s heart. Cold, unlit, and the strongest things on the island live in it.', to: ['#foothills', '#the-ice-shelf'] },
				{ c: '#the-ice-shelf', d: 'A shelf of old ice above the cave, wind-scoured and blue where it breaks.', to: ['#silver-cave', '#peak'] },
				{ c: '#peak', d: 'The summit. Nothing up here but weather, and whoever else was mad enough.', to: ['#the-ice-shelf'] },
			],
		},
		hinomiya: {
			hub: '#hinomiya-shrine',
			spots: [
				{ c: '#hinomiya-shrine', d: 'The fire shrine on the caldera rim. Kagura is danced here, and the region took its name from it.', to: ['#the-shrine-stair', '#the-rim-platform'] },
				{ c: '#the-shrine-stair', d: 'The long stair up from the ash road, worn hollow in the middle of every step.', to: ['#hinomiya-shrine', 'Route 11'] },
				{ c: '#the-rim-platform', d: 'A platform out over the caldera where the dance is performed, to nobody, at dawn.', to: ['#hinomiya-shrine'] },
			],
		},
		watari: {
			hub: '#watari-bridge',
			spots: [
				{ c: '#watari-bridge', d: 'The old bridge between islands: timber, stone piers, and a plank that everybody knows about.', to: ['#the-toll-house', '#under-the-span', 'Route 6', 'Route 7'] },
				{ c: '#the-toll-house', d: 'A toll house that stopped taking tolls a generation ago and never took its sign down.', to: ['#watari-bridge'] },
				{ c: '#under-the-span', d: 'The shingle under the bridge, out of the wind. Fires get lit here.', to: ['#watari-bridge'] },
			],
		},
		kakehashi: {
			hub: '#kakehashi-bridge',
			spots: [
				{ c: '#kakehashi-bridge', d: 'The new bridge: steel, long, and singing in a crosswind.', to: ['#the-north-tower', '#the-south-tower', 'Route 12', 'Route 13'] },
				{ c: '#the-north-tower', d: 'The northern tower, with a maintenance stair the engineers do not lock.', to: ['#kakehashi-bridge'] },
				{ c: '#the-south-tower', d: 'The southern tower, and the better view of the strait.', to: ['#kakehashi-bridge'] },
			],
		},
		beacon: {
			hub: '#beacon-rock',
			spots: [
				{ c: '#beacon-rock', d: 'A rock island with a lighthouse on it, reached by boat or by wading at the lowest tides.', to: ['#the-light', '#keepers-room', 'Route 13'] },
				{ c: '#the-light', d: 'The lamp room. The lens is worth more than the island and everyone leaves it alone.', to: ['#beacon-rock'] },
				{ c: '#keepers-room', d: 'The keeper\'s room below: a bunk, a log book, and binoculars pointed at the shipping.', to: ['#beacon-rock'] },
			],
		},
		aether: {
			hub: '#aether-dock',
			spots: [
				{ c: '#aether-dock', d: 'The receiving dock of the floating station. Clean, bright, and everything is labelled.', to: ['#conservation-wing', '#labs', '#observation-deck'] },
				{ c: '#conservation-wing', d: 'Enclosures for Pokémon that were found somewhere they should not have been.', to: ['#aether-dock'] },
				{ c: '#labs', d: 'Laboratories behind glass. Politely, you may look; you may not open anything.', to: ['#aether-dock'] },
				{ c: '#observation-deck', d: 'A deck over the sea, with the best view of the strait and nobody else on it.', to: ['#aether-dock'] },
			],
		},
		bell: {
			hub: '#sunken-bell',
			spots: [
				{ c: '#sunken-bell', d: 'A temple bell on the seabed, upright, too big to have been dropped by accident.', to: ['#the-bell-chamber'] },
				{ c: '#the-bell-chamber', d: 'The space underneath it: dry, somehow, and it rings when nothing has touched it.', to: ['#sunken-bell'] },
			],
		},
		abyss: {
			hub: '#the-anomaly',
			spots: [
				{ c: '#the-anomaly', d: 'A depth reading that is wrong on every chart. Dive it and there is structure below.', to: ['#pressure-lock'] },
				{ c: '#pressure-lock', d: 'An airlock in the seabed, powered, and cycling for anyone who knocks.', to: ['#the-anomaly', '#abyssal-base'] },
				{ c: '#abyssal-base', d: 'Lit corridors and working machinery, on nobody\'s register.', to: ['#pressure-lock', '#cold-corridor', '#the-hatch'] },
				{ c: '#cold-corridor', d: 'A corridor kept near freezing, with doors on one side only.', to: ['#abyssal-base'] },
				{ c: '#the-hatch', d: 'A hatch in the floor of the deepest room. It opens downwards, into more water.', to: ['#abyssal-base'] },
			],
		},
		// --- wild ground: two ways in, and what the second one is
		midori: { hub: '#midori-jungle', spots: [
			{ c: '#midori-jungle', d: 'Hot, close jungle under a closed canopy: vines, standing water, and things moving above you.', to: ['#the-green-side', '#the-rain-shadow', 'Route 13'] },
			{ c: '#the-green-side', d: 'The wet side of the ridge, where it rains most afternoons and everything grows over the path.', to: ['#midori-jungle'] },
			{ c: '#the-rain-shadow', d: 'The dry side: thinner trees, hard ground, and a different set of Pokémon entirely.', to: ['#midori-jungle'] } ] },
		longsands: { hub: '#long-sands', spots: [
			{ c: '#long-sands', d: 'Miles of pale beach with nothing built on it. Good for walking, better for catching.', to: ['#the-shallows-south', 'Route 5'] },
			{ c: '#the-shallows-south', d: 'Warm water out to the sandbar, waist deep for a long way.', to: ['#long-sands'] } ] },
		kuroihama: { hub: '#kuroihama', spots: [
			{ c: '#kuroihama', d: 'Black volcanic sand, hot underfoot by afternoon, steam where the streams reach the sea.', to: ['#the-black-sand', 'Route 11'] },
			{ c: '#the-black-sand', d: 'The upper beach where the sand is coarsest and things bury themselves in it.', to: ['#kuroihama'] } ] },
		shellstrand: { hub: '#shell-strand', spots: [
			{ c: '#shell-strand', d: 'A beach made of shells rather than sand, loud to walk on and impossible to sneak along.', to: ['#the-shell-line', 'Route 14'] },
			{ c: '#the-shell-line', d: 'The tide line itself, drifts of shell and driftwood, and whatever the sea brought in last night.', to: ['#shell-strand'] } ] },
		mirrortarn: { hub: '#mirror-tarn', spots: [
			{ c: '#mirror-tarn', d: 'A still mountain lake that takes the sky exactly. Cold, deep, and worth the walk.', to: ['#the-shingle-shore', 'Route 9'] },
			{ c: '#the-shingle-shore', d: 'The stone beach at the near end, where you can get to the water without going in.', to: ['#mirror-tarn'] } ] },
		millpond: { hub: '#the-mill-pond', spots: [
			{ c: '#the-mill-pond', d: 'The pond behind the mill, weed-green at the edges and deeper than it looks.', to: ['#the-jetty', 'Amber Fields'] },
			{ c: '#the-jetty', d: 'A short jetty for the mill boat. The fishing is good at the end of it.', to: ['#the-mill-pond'] } ] },
		reservoir: { hub: '#kagura-reservoir', spots: [
			{ c: '#kagura-reservoir', d: 'The island\'s water: a wide reservoir behind a concrete dam, fenced but not well.', to: ['#the-dam-wall', 'Route 8'] },
			{ c: '#the-dam-wall', d: 'The dam itself, a walkway along the top and a long drop on the dry side.', to: ['#kagura-reservoir'] } ] },
		craterpool: { hub: '#the-crater-pool', spots: [
			{ c: '#the-crater-pool', d: 'A hot pool in an old crater, turquoise and dangerous to swim in. Fire and Water both live here.', to: ['Route 11'] } ] },
		moonpool: { hub: '#moon-pool', spots: [
			{ c: '#moon-pool', d: 'A pool that only fills on the high tides. Bright water, pale stone, and it is worth coming at night.', to: ['#the-night-water', 'Route 14'] },
			{ c: '#the-night-water', d: 'The pool after dark, when the things that avoid daylight come up to it.', to: ['#moon-pool'] } ] },
		driftwood: { hub: '#driftwood-cove', spots: [
			{ c: '#driftwood-cove', d: 'A cove of bleached driftwood stacked by storms into shapes people keep adding to.', to: ['#the-tideline', 'Route 12'] },
			{ c: '#the-tideline', d: 'The wet line of weed and wood where everything the sea drops ends up.', to: ['#driftwood-cove'] } ] },
		harefield: { hub: '#hares-meadow', spots: [
			{ c: '#hares-meadow', d: 'Rough meadow of long grass and thistle, more alive at dusk than at noon.', to: ['#the-long-grass', 'Route 2'] },
			{ c: '#the-long-grass', d: 'The deep grass in the middle, over your knees, where the meadow hides what it has.', to: ['#hares-meadow'] } ] },
		windbreaks: { hub: '#the-windbreaks', spots: [
			{ c: '#the-windbreaks', d: 'Planted lines of trees holding the wind off the fields. Shelter on one side, gale on the other.', to: ['#hedgerow-walk', 'Route 4'] },
			{ c: '#hedgerow-walk', d: 'A green lane between two old hedges, full of nesting birds.', to: ['#the-windbreaks'] } ] },
		saltmarsh: { hub: '#saltmarsh-flats', spots: [
			{ c: '#saltmarsh-flats', d: 'Salt marsh cut by creeks, half land and half sea depending on the hour.', to: ['#the-creeks', 'Route 5'] },
			{ c: '#the-creeks', d: 'The channels themselves, soft-bottomed and easy to lose your boots in.', to: ['#saltmarsh-flats'] } ] },
		pinewood: { hub: '#the-pinewood', spots: [
			{ c: '#the-pinewood', d: 'Planted pine, needle floor, and quiet of the kind that makes people talk quietly.', to: ['#planting-rows', 'Route 7'] },
			{ c: '#planting-rows', d: 'The newer blocks, trees in ranks, with sightlines straight down every row.', to: ['#the-pinewood'] } ] },
		heath: { hub: '#kogarashi-heath', spots: [
			{ c: '#kogarashi-heath', d: 'Open heather and wind with nothing to stop it. The north island in one word.', to: ['#the-tors', 'Route 8'] },
			{ c: '#the-tors', d: 'Granite stacks standing out of the heath, climbable, and a landmark from everywhere.', to: ['#kogarashi-heath'] } ] },
		ashfields: { hub: '#the-ashfields', spots: [
			{ c: '#the-ashfields', d: 'Ash plains south of the caldera, grey to the horizon, with green coming back in patches.', to: ['#warm-ground', 'Route 11'] },
			{ c: '#warm-ground', d: 'Ground that stays warm all year. Eggs hatch here, and people know it.', to: ['#the-ashfields'] } ] },
		barrens: { hub: '#sulphur-barrens', spots: [
			{ c: '#sulphur-barrens', d: 'Yellow crust, bad air and nothing growing. Wear the mask they sell in Ember.', to: ['#the-vents-north', 'Route 12'] },
			{ c: '#the-vents-north', d: 'The northern vent field, where the ground breathes and the pools are the wrong colours.', to: ['#sulphur-barrens'] } ] },
		palmlands: { hub: '#the-palmlands', spots: [
			{ c: '#the-palmlands', d: 'Palm scrub behind the dunes, shade and sand together, warm all year.', to: ['#the-green-middle', 'Route 13'] },
			{ c: '#the-green-middle', d: 'The wetter middle where the water sits, and everything for miles comes to drink.', to: ['#the-palmlands'] } ] },
		dunes: { hub: '#windward-dunes', spots: [
			{ c: '#windward-dunes', d: 'High dunes on the weather side, marram grass, and a ridge that moves every winter.', to: ['#the-dune-line', 'Route 14'] },
			{ c: '#the-dune-line', d: 'The crest itself: hard walking, and the whole lagoon laid out once you are up.', to: ['#windward-dunes'] } ] },
		shoal: { hub: '#the-reef', spots: [
			{ c: '#the-reef', d: 'Living coral in clear shallow water, the whole lagoon floor visible from a boat.', to: ['#tide-pools', '#the-shallows', '#drop-off', 'Route 14'] },
			{ c: '#tide-pools', d: 'Pools left on the reef flat at low tide, each one a small trapped world.', to: ['#the-reef'] },
			{ c: '#the-shallows', d: 'Waist-deep water over sand between the coral heads. Easy swimming, easy catching.', to: ['#the-reef'] },
			{ c: '#drop-off', d: 'The edge where the reef ends and the floor falls away into blue. Deep things come up it.', to: ['#the-reef'] } ] },
	};

	window.ATLAS_SPOTS = window.ATLAS_SPOTS || {};
	window.ATLAS_SPOTS.kagura = SPOTS;
})();
