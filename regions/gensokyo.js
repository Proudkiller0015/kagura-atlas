/*
 * Gensokyo - region data.
 *
 * The Touhou world, arrived through the collision with Kagura: one land behind
 * the Great Hakurei Barrier, out past the open sea west of Kagura. Same shared
 * world coordinates as regions/kagura.js (Kagura's west coast is at x 8);
 * Gensokyo's east coast is at about x -220, so there is real sea between.
 *
 * Laid out from the owner's reference map of Gensokyo (21 Oct 2026): a rounded
 * square ringed by mountain, the Sanzu River and the Garden of the Sun along the
 * north, the Bamboo Forest of the Lost and Eientei in the north-east, Yokai
 * Mountain and the Geyser Fields in the west, Misty Lake in the middle with the
 * Scarlet Devil Mansion on its west shore and Genbu Ravine below it, the Human
 * Village east of centre with the road on to the Hakurei Shrine on the east
 * edge, the Forest of Magic filling the south-east, Spring Lane's blossom down
 * its west side, and Muenzuka and the Road of Reconsideration in the south-west.
 * Named ground that is not a bot place is in `areas`, small words on the land.
 *
 * Two places are not on the ground at all, so each is drawn as its own inset:
 *   - The Netherworld floats above the clouds off the north-east: a small
 *     island in a sea of cloud (biome `sky`), reached from the shrine by a
 *     dashed line through the clouds (trail `line: 'sky'`).
 *   - Former Hell is underground, off the west coast: a cavern floor in a ring
 *     of dark rock (biome `under`), reached by a dashed line down from the Wind
 *     Cave in the Geyser Fields (trail `line: 'deep'`).
 *
 * Every place id, channel and road here matches the bot (rp-bot/data
 * map-places.json and map-links.json, built by tools/gensokyo-channels.js).
 * The roads are what the bot's links are worked out from (connections.js), so
 * a trail that is not "a side trail" names itself with `via` and `kind`.
 */
(function () {
	'use strict';

	/*
	 * The land: a rounded square ringed by mountain and cliff, traced from the
	 * owner's reference map. Reference pixels (on its 1932 px display) map to
	 * the world as x = -600 + 0.2 px, y = -10 + 0.2 py.
	 */
	var GENSOKYO = [
		[-578,50],[-568,24],[-548,8],[-520,-2],[-488,-6],[-448,-7],[-420,-4],[-390,-2],[-370,2],
		[-354,24],[-310,28],[-260,28],[-240,54],[-226,102],[-220,150],[-218,200],[-220,250],
		[-224,300],[-240,334],[-270,354],[-320,366],[-370,370],[-430,366],[-488,358],[-534,334],
		[-562,302],[-574,260],[-583,210],[-584,160],[-580,110],[-579,74]
	];
	/* The Netherworld, above the clouds off the north-east, past the Sanzu. */
	var NETHERWORLD = [
		[-332,-60],[-326,-85],[-302,-97],[-276,-93],[-262,-71],[-266,-45],[-286,-31],[-312,-31],[-328,-43]
	];
	/* Former Hell, underground: drawn off the west coast, below the Geyser Fields. */
	var FORMER_HELL = [
		[-722,160],[-716,134],[-694,120],[-664,120],[-640,134],[-636,160],[-644,184],[-668,198],[-696,196],[-716,182]
	];
	var ISLANDS = [GENSOKYO, NETHERWORLD, FORMER_HELL];

	/*
	 * One palette per island. The Netherworld is pale and washed out, the way a
	 * place of the dead should be; Former Hell is dark basalt, lit from below.
	 * `sky` and `under` tell the renderer what lies around the island instead of
	 * sea, and `reach` is how far that goes.
	 */
	var BIOMES = [
		{ g0:[ 98,182, 70], g1:[146,212, 96], s0:[214,190,140], s1:[232,212,166] },   /* Gensokyo     */
		{ g0:[164,178,170], g1:[206,212,200], s0:[214,210,222], s1:[236,232,240],
		  sky:true, reach:34 },                                                        /* Netherworld  */
		{ g0:[ 66, 52, 56], g1:[ 96, 76, 72], s0:[ 78, 62, 60], s1:[104, 84, 78],
		  mottle:[54,40,44], swell:[40,30,32], coast:[30,22,26], wet:[60,46,46],
		  pave:[[132, 74, 58], [168, 104, 72]],                                       /* lantern-lit stone */
		  under:true, reach:30 }                                                       /* Former Hell  */
	];

	/*
	 * High ground: the brown ring of mountain and cliff that goes right round,
	 * as on the reference, and Yokai Mountain on the west side with snow on top.
	 */
	var RIDGES = [
		{ x:-487, y:138, r:46, h:1.00 },   /* Yokai Mountain                 */
		{ x:-508, y:116, r:30, h:0.72 },   /* its northern shoulder          */
		{ x:-462, y:172, r:28, h:0.50 },   /* the slope down to the lake     */
		{ x:-445, y:100, r:22, h:0.42 },   /* above the Untrodden Valley     */
		/* the rim, all the way round: a ridge every few miles along the coast */
		{ x:-564, y:61, r:18, h:0.34 }, { x:-555, y:37, r:20, h:0.40 }, { x:-536, y:22, r:18, h:0.34 }, { x:-391, y:13, r:20, h:0.40 }, { x:-372, y:17, r:18, h:0.34 }, { x:-358, y:37, r:20, h:0.40 }, { x:-337, y:39, r:18, h:0.34 }, { x:-317, y:41, r:20, h:0.40 }, { x:-294, y:41, r:18, h:0.34 }, { x:-271, y:41, r:20, h:0.40 }, { x:-253, y:64, r:18, h:0.34 }, { x:-246, y:87, r:20, h:0.40 }, { x:-240, y:109, r:18, h:0.34 }, { x:-237, y:131, r:20, h:0.40 }, { x:-234, y:153, r:18, h:0.34 }, { x:-233, y:222, r:20, h:0.40 }, { x:-234, y:245, r:18, h:0.34 }, { x:-236, y:268, r:20, h:0.40 }, { x:-238, y:291, r:18, h:0.34 }, { x:-245, y:306, r:20, h:0.40 }, { x:-253, y:322, r:18, h:0.34 }, { x:-267, y:331, r:20, h:0.40 }, { x:-280, y:340, r:18, h:0.34 }, { x:-303, y:346, r:20, h:0.40 }, { x:-326, y:352, r:18, h:0.34 }, { x:-349, y:353, r:20, h:0.40 }, { x:-372, y:355, r:18, h:0.34 }, { x:-391, y:354, r:20, h:0.40 }, { x:-409, y:353, r:18, h:0.34 }, { x:-428, y:352, r:20, h:0.40 }, { x:-445, y:349, r:18, h:0.34 }, { x:-463, y:347, r:20, h:0.40 }, { x:-481, y:344, r:18, h:0.34 }, { x:-502, y:333, r:20, h:0.40 }, { x:-523, y:322, r:18, h:0.34 }, { x:-536, y:307, r:20, h:0.40 }, { x:-549, y:293, r:18, h:0.34 }, { x:-555, y:273, r:20, h:0.40 }, { x:-560, y:254, r:18, h:0.34 }, { x:-564, y:231, r:20, h:0.40 }, { x:-568, y:208, r:18, h:0.34 }, { x:-569, y:185, r:20, h:0.40 }, { x:-569, y:162, r:18, h:0.34 }, { x:-567, y:139, r:20, h:0.40 }, { x:-566, y:116, r:18, h:0.34 }, { x:-565, y:99, r:20, h:0.40 }, { x:-565, y:83, r:18, h:0.34 },
		{ x:-562, y: 60, r:24, h:0.46 }, { x:-536, y: 26, r:22, h:0.42 }, { x:-404, y: 14, r:18, h:0.36 },
		{ x:-378, y: 20, r:16, h:0.34 }, { x:-566, y:110, r:22, h:0.40 }, { x:-568, y:160, r:22, h:0.44 },
		{ x:-566, y:210, r:22, h:0.40 }, { x:-558, y:258, r:22, h:0.42 }, { x:-546, y:300, r:20, h:0.36 },
		{ x:-514, y:336, r:20, h:0.36 }, { x:-470, y:352, r:20, h:0.36 }, { x:-420, y:356, r:20, h:0.34 },
		{ x:-330, y:354, r:22, h:0.40 }, { x:-284, y:340, r:20, h:0.40 }, { x:-246, y:316, r:20, h:0.40 },
		{ x:-234, y:270, r:16, h:0.32 }, { x:-234, y: 70, r:16, h:0.34 }, { x:-276, y: 40, r:16, h:0.32 },
		{ x:-236, y:190, r:12, h:0.26 },   /* the shrine's hill              */
		{ x:-513, y: 38, r:14, h:0.24 },   /* Nameless Hill                  */
		/* the Netherworld's long stair goes up a rise */
		{ x:-288, y:-80, r:16, h:0.30 }
	];

	/*
	 * Woods and fields. Kinds beyond Kagura's: `magic` (the Forest of Magic),
	 * `bamboo`, `blossom` (cherry: Spring Lane, the shrine, the Netherworld),
	 * `wood` ('dark' for the Yokai Forest, 'tanuki', 'farm' for the Human
	 * Fields) and `flowers` - a field rather than trees.
	 */
	var FORESTS = [
		/* Forest of Magic: the whole south-east quarter */
		{ x:-310, y:244, r:52, magic:true, dense:true }, { x:-398, y:296, r:40, magic:true, dense:true },
		{ x:-280, y:294, r:40, magic:true, dense:true }, { x:-350, y:322, r:30, magic:true, dense:true },
		{ x:-252, y:250, r:22, magic:true, dense:true }, { x:-356, y:268, r:30, magic:true, dense:true },
		/* Bamboo Forest of the Lost: the north-east */
		{ x:-298, y: 82, r:50, bamboo:true, dense:true }, { x:-330, y:112, r:22, bamboo:true, dense:true },
		{ x:-260, y:120, r:28, bamboo:true, dense:true }, { x:-262, y: 58, r:22, bamboo:true, dense:true },
		/* Garden of the Sun, below the Sanzu */
		{ x:-410, y: 52, r:40, flowers:'sunflower', dense:true }, { x:-372, y: 42, r:24, flowers:'sunflower', dense:true },
		{ x:-513, y: 38, r:14, flowers:'lily', dense:true },        /* Nameless Hill      */
		{ x:-528, y:280, r:30, flowers:'higanbana', dense:true },   /* Muenzuka           */
		{ x:-496, y:306, r:10, flowers:'higanbana', dense:true },   /* Road of Reconsideration */
		{ x:-476, y:322, r:12, flowers:'higanbana', dense:true }, { x:-452, y:336, r:10, flowers:'higanbana', dense:true },
		{ x:-458, y:290, r:32, flowers:'phantom' },     /* Phantom Meadows    */
		{ x:-527, y:156, r:20, flowers:'geyser', dense:true },      /* Geyser Fields      */
		{ x:-492, y:168, r:6,  flowers:'peony' },       /* Peony Field        */
		{ x:-462, y:256, r:18, wood:'tanuki', dense:true },         /* Tanuki Forest      */
		{ x:-368, y:118, r:38, wood:'farm', dense:true },           /* Human Fields       */
		{ x:-338, y:146, r:20, wood:'farm', dense:true },
		/* Yokai Forest, round the north of the lake */
		{ x:-424, y:136, r:30, wood:'dark', dense:true }, { x:-462, y: 96, r:22, wood:'dark', dense:true },
		{ x:-404, y:160, r:16, wood:'dark', dense:true }, { x:-520, y:220, r:26, wood:'dark', dense:true },
		{ x:-546, y:226, r:18, wood:'dark', dense:true }, { x:-540, y:130, r:14, wood:'dark', dense:true },
		{ x:-532, y:262, r:14, wood:'dark', dense:true },
		/* Spring Lane, down the west edge of the Forest of Magic; and the shrine's */
		{ x:-398, y:232, r:14, blossom:true }, { x:-382, y:212, r:12, blossom:true },
		{ x:-402, y:262, r:14, blossom:true }, { x:-392, y:284, r:10, blossom:true },
		{ x:-362, y:194, r:9,  blossom:true }, { x:-258, y:178, r:12, blossom:true },
		{ x:-226, y:206, r:8,  blossom:true },          /* Fairy's Tree       */
		{ x:-300, y:-64, r:34, blossom:true },          /* the Netherworld    */
		/* plain woods */
		{ x:-470, y:196, r:16 }, { x:-504, y:104, r:14 }, { x:-268, y:160, r:16 },
		{ x:-470, y: 50, r:14 }, { x:-552, y: 84, r:12 }, { x:-434, y:226, r:10 }
	];

	var RIVERS = [
		/* the Canal of Willows: from the pond in the Human Fields through the village */
		[[-350,102],[-348,130],[-346,155],[-342,175],[-346,196],[-360,214],[-374,226],[-392,236]],
		/* out of the Untrodden Valley into the lake */
		[[-460,118],[-440,122],[-424,132],[-414,150],[-412,170]],
		/* from the Sanzu down the west side to the sea */
		[[-500,22],[-506,60],[-524,96],[-548,128],[-566,150],[-584,164]],
		/* the lake's outflow past Genbu Ravine */
		[[-428,226],[-436,240],[-434,262],[-430,290]],
		/* the bamboo's stream */
		[[-312,58],[-322,78],[-334,96],[-346,104]]
	];

	var LAKES = [
		{ x:-424, y:196, r:30 },   /* Misty Lake          */
		{ x:-462, y:150, r: 4 },   /* the Moriya lake     */
		{ x:-489, y:204, r: 6 },   /* Giant Toad Pond     */
		{ x:-350, y:100, r: 7 },   /* the Human Fields' pond */
		/* the Sanzu River, along the north edge */
		{ x:-505, y: 14, r:12 }, { x:-478, y: 10, r:14 }, { x:-450, y: 12, r:13 }, { x:-426, y: 16, r:10 }
	];

	/* Misty Lake is under a fog that never lifts, and the Sanzu under cloud. */
	var MISTS = [
		{ x:-424, y:196, r:34, a:0.40 },
		{ x:-470, y:  4, r:44, a:0.55 }
	];

	/* Lava, for the Hell of Blazing Fires under the palace. */
	var LAVA = [
		{ x:-648, y:128, r:4 }, { x:-652, y:178, r:4 }
	];

	/*
	 * Roads, along the reference's own: the village is the hub, the road east to
	 * the shrine, round by the lake, north through the fields, along the west
	 * under the mountains. Every one ends at a place, so the bot's links fall out
	 * of the geometry exactly as tools/gensokyo-channels.js wrote them.
	 */
	var ROUTES = [
		{ n:301, path:[[-338,174],[-318,182],[-300,190],[-282,197],[-260,196],[-236,190]] },
		{ n:302, path:[[-338,174],[-332,192],[-320,206],[-310,222],[-300,236]] },
		{ n:303, path:[[-338,174],[-355,183],[-372,190],[-394,204]] },
		{ n:304, path:[[-338,174],[-322,160],[-310,140],[-305,118]] },
		{ n:305, path:[[-394,204],[-400,222],[-418,236],[-440,237]] },
		{ n:306, path:[[-338,174],[-352,150],[-372,118],[-392,86],[-410,58]] }
	];
	var LINKS = [
		[[-338,174],[-315,170],[-292,173]],    /* the village to Myouren Temple         */
		[[-686,175],[-680,158],[-670,140]]     /* the Former Capital to the palace      */
	];
	/* The order matters where one place has two of the same kind: the bot lists
	   them in this order. */
	var TRAILS = [
		[[-300,236],[-279,228],[-277,210],[-280,194]],                        /* forest  -> Kourindou    */
		[[-305,118],[-285,108],[-263,96]],                                    /* bamboo  -> Eientei      */
		/* bamboo -> Muenzuka: the Road of Luminality and the west road under the mountains */
		[[-305,118],[-345,100],[-400,90],[-450,78],[-500,80],[-540,100],[-556,150],[-552,200],[-545,245],[-530,278]],
		[[-440,237],[-446,205],[-455,172],[-462,138],[-482,110]],             /* Genbu   -> Tengu Village*/
		[[-482,110],[-490,128],[-475,146]],                                   /* Tengu   -> Moriya       */
		{ path:[[-440,237],[-470,228],[-495,200],[-512,170],[-520,138]], via:'the Wind Cave' },   /* Genbu -> Wind Cave */
		{ path:[[-236,190],[-205,150],[-200,80],[-220,10],[-260,-26],[-305,-40]],
		  via:'the gate above the clouds', line:'sky' },                     /* shrine  -> Netherworld  */
		/* Short walks: a few steps off a road, but the bot names them, so they are drawn. */
		{ path:[[-332,192],[-305,200],[-280,194]], via:'a short walk off Route 302', kind:'walk' },
		{ path:[[-394,204],[-398,180],[-425,166],[-452,176],[-462,196]], via:'a short walk off Route 303', kind:'walk' },
		{ path:[[-410,58],[-440,66],[-480,58],[-513,38]], via:'a short walk off Route 306', kind:'walk' },
		{ path:[[-305,-40],[-296,-60],[-288,-80]], via:'a short walk off a side trail', kind:'walk' },
		{ path:[[-520,138],[-560,128],[-600,132],[-640,150],[-686,175]],
		  via:'a short walk off a side trail', kind:'walk', line:'deep' }     /* Wind Cave -> underground */
	];

	/* Lines that are not ways: the Moriya Rope Way, and the Barrier of Life and Death. */
	var DECOR_LINES = [
		{ path:[[-464,148],[-414,166]], rgb:[220,52,52], w:1.2 },
		{ path:[[-374,341],[-365,348],[-368,358],[-380,358],[-383,348],[-374,341]], rgb:[246,182,214], w:0.8 }
	];
	/* Buildings that are not bot places, drawn when you lean in. */
	var DECOR = [
		['house', -251, 223],   /* Marisa's house       */
		['house', -321, 269],   /* Alice's house        */
		['house', -298, 315],   /* Mayohiga             */
		['hall',  -312, 158],   /* the Hall of Dreams   */
		['castle', -554, 104],  /* Needle Castle        */
		['cave',  -230, 262],   /* by the Eastern Hot Springs */
		['cave',  -274, 304],   /* the south-east rim   */
		['lantern', -230, 250], ['lantern', -244, 282]
	];

	var GRASS_PATCHES = [
		[-460,280,14,10],[-440,300,12,8],[-480,270,10,8],[-372,150,10,6],[-320,178,8,6],[-410,230,8,6],
		[-430,80,12,6],[-546,186,6,10],[-480,240,10,6],[-292,206,8,5]
	];

	var CH = function (list) { return list.map(function (c) { return '#' + c; }); };

	/* Every place, in the bot's order (rp-bot/tools/gensokyo-channels.js). */
	var PLACES = [
		{ id:'village', box:[46,36], name:'Human Village', x:-338, y:174, island:'Gensokyo', kind:'town',
		  blurb:'The one town in Gensokyo where people live in the open: markets, a book shop, a school, and a Pokémon Centre. Youkai are not welcome to hunt here, and mostly they keep to that.',
		  facts:['Pokémon Centre','Mart','Suzunaan, the book rental','The terakoya, a village school','Every road in Gensokyo starts at its gate'],
		  chans:CH(['poke-center-village','village-mart','village-square','suzunaan','village-tea-house','terakoya','village-gate']),
		  catch:['Normal','Flying','Grass','Fairy'],
		  doing:['Heal at the Centre','Stock up at the Mart','Borrow something strange from Suzunaan','Sit in on a lesson at the terakoya','Take any road out of the gate'],
		  live:[],
		  hook:'Since the collision, Suzunaan has been lending out books nobody in Gensokyo wrote. They are in Kagura\'s script.' },
		{ id:'myouren', box:[24,20], name:'Myouren Temple', x:-292, y:173, island:'Gensokyo', kind:'gym', gym:'MYOUREN GYM',
		  blurb:'A temple just outside the village that takes in humans and youkai alike, with a graveyard behind it and a gym that teaches discipline the hard way.',
		  facts:['Myouren Gym','Open to humans and youkai','A graveyard out back','A connecting road to the village'],
		  chans:CH(['myouren-gate','myouren-temple','myouren-graveyard','myouren-gym']),
		  catch:['Fighting','Ghost','Normal','Psychic'],
		  doing:['Challenge the Myouren Gym','Sit in on the morning sutras','Walk the graveyard at dusk'],
		  live:[] },
		{ id:'hakurei', box:[26,20], name:'Hakurei Shrine', x:-236, y:190, island:'Gensokyo', kind:'gym', gym:'HAKUREI GYM',
		  blurb:'A quiet shrine on a hill at the eastern edge of Gensokyo, right against the Great Barrier. The donation box is usually empty, and the shrine maiden will tell you so.',
		  facts:['Hakurei Gym','On the Great Hakurei Barrier','A hot spring behind the shrine','The way up to the Netherworld starts here'],
		  chans:CH(['hakurei-steps','hakurei-grounds','donation-box','hakurei-hot-spring','hakurei-gym']),
		  catch:['Fairy','Psychic','Flying','Normal'],
		  doing:['Challenge the Hakurei Gym','Leave something in the donation box','Soak in the hot spring','Look up: the clouds go higher than they should'],
		  live:[],
		  hook:'The Barrier is thinner since the collision. Some nights you can see Kagura\'s lights from the steps.' },
		{ id:'forestofmagic', box:[30,24], name:'Forest of Magic', x:-300, y:236, island:'Gensokyo', kind:'wild',
		  blurb:'A damp, spore-thick forest where magicians live and few others go. The mushrooms are the point and the problem: breathe enough of them and the paths start to move.',
		  facts:['Dark under the canopy all day','Magic-grade mushrooms','Two magicians live here','Kourindou is at the edge'],
		  chans:CH(['magic-forest-edge','mushroom-glade','kirisame-house','margatroid-house']),
		  catch:['Poison','Grass','Bug','Ghost'],
		  doing:['Pick mushrooms (carefully)','Knock at a magician\'s door','Stay on the path'],
		  live:[] },
		{ id:'kourindou', box:[16,14], name:'Kourindou', x:-280, y:194, island:'Gensokyo', kind:'hangout', rank:2,
		  blurb:'A curio shop on the shrine road, just east of the village at the Forest of Magic\'s edge, full of things that fell in from the outside world. The owner knows what everything is called and rarely what it is for.',
		  facts:['Things from outside, for sale','The owner names, but does not explain','A storeroom nobody has sorted'],
		  chans:CH(['kourindou','kourindou-storeroom']),
		  catch:['Steel','Electric','Normal'],
		  doing:['Browse the shelves','Ask what something is','Dig through the storeroom'],
		  live:[],
		  hook:'Lately the things in the storeroom are Kagura\'s: a bus timetable, a gym badge, a Poké Ball with someone\'s name on it.' },
		{ id:'mistylake', box:[24,18], name:'Misty Lake', x:-394, y:204, island:'Gensokyo', kind:'water',
		  blurb:'A lake under a fog that never lifts, in the middle of Gensokyo below Yokai Mountain. Busy with fairies by day, and colder than the weather says it should be.',
		  facts:['Fog all day, every day','Fairies, and an ice fairy among them','The Scarlet Devil Mansion is on the west shore','Route 305 runs down to Genbu Ravine'],
		  chans:CH(['misty-lake','fairy-shallows']),
		  catch:['Water','Ice','Fairy','Bug'],
		  doing:['Fish the fog','Get challenged by a fairy','Walk round to the mansion'],
		  live:[] },
		{ id:'scarletmansion', box:[30,24], name:'Scarlet Devil Mansion', x:-462, y:196, island:'Gensokyo', kind:'gym', gym:'SCARLET GYM',
		  blurb:'A red mansion on the lake shore with a gatekeeper, a vast library and a clock tower. Larger inside than out, and nobody asks why.',
		  facts:['Scarlet Gym','A gatekeeper who is usually asleep','Voile, the great library','A clock tower, and a basement nobody goes down to'],
		  chans:CH(['mansion-gate','mansion-garden','voile-library','clock-tower','mansion-basement','scarlet-gym']),
		  catch:['Dark','Ghost','Psychic','Fire'],
		  doing:['Get past the gate','Read in the library','Challenge the Scarlet Gym','Do not go down to the basement'],
		  live:[] },
		{ id:'bamboo', box:[30,24], name:'Bamboo Forest of the Lost', x:-305, y:118, island:'Gensokyo', kind:'wild',
		  blurb:'Bamboo that grows fast enough to change the paths overnight. Easy to enter, hard to leave, and full of rabbits who know the way and will not tell you.',
		  facts:['The paths move','Rabbits everywhere','Eientei is somewhere inside','A guide, if you can find her'],
		  chans:CH(['bamboo-forest','lost-paths','rabbit-warren']),
		  catch:['Grass','Normal','Bug','Fire'],
		  doing:['Get lost','Follow a rabbit','Find your way to Eientei, or out'],
		  live:[] },
		{ id:'eientei', box:[24,20], name:'Eientei', x:-263, y:96, island:'Gensokyo', kind:'gym', gym:'EIENTEI GYM',
		  blurb:'An old mansion hidden deep in the bamboo, and the best medicine in Gensokyo. Its people came from the moon, and have never quite finished arriving.',
		  facts:['Eientei Gym','The best pharmacy in Gensokyo','Hidden in the bamboo','Moon people, quietly'],
		  chans:CH(['eientei-gate','eientei-halls','eientei-pharmacy','eientei-gym']),
		  catch:['Psychic','Normal','Fairy','Grass'],
		  doing:['Challenge the Eientei Gym','Buy medicine','Ask about the moon and watch them change the subject'],
		  live:[] },
		{ id:'genbu', box:[24,18], name:'Genbu Ravine', x:-440, y:237, island:'Gensokyo', kind:'wild',
		  blurb:'The ravine below Misty Lake, where the lake water runs out hard and the kappa build and tinker along its banks.',
		  facts:['The lake runs out through here','Kappa workshops','Tengu Village is up the trail to the mountain','The Wind Cave is out in the Geyser Fields'],
		  chans:CH(['genbu-ravine','kappa-workshop','mountain-river']),
		  catch:['Water','Steel','Electric','Rock'],
		  doing:['Trade with the kappa','Fish the mountain river','Climb to the Wind Cave'],
		  live:[] },
		{ id:'tenguvillage', box:[28,22], name:'Tengu Village', x:-482, y:110, island:'Gensokyo', kind:'town',
		  blurb:'The tengu settlement on the mountain slopes, with a waterfall, a Pokémon Centre and more newspapers than readers.',
		  facts:['Pokémon Centre','Nine Heavens Falls','The Bunbunmaru press','Outsiders watched, and written about'],
		  chans:CH(['poke-center-mountain','tengu-village','nine-heavens-falls','bunbunmaru-press']),
		  catch:['Flying','Dark','Rock','Water'],
		  doing:['Heal at the Centre','Stand under the falls','End up in the paper'],
		  live:[] },
		{ id:'moriya', box:[24,20], name:'Moriya Shrine', x:-475, y:146, island:'Gensokyo', kind:'gym', gym:'MORIYA GYM',
		  blurb:'A shrine high on the east face of Yokai Mountain, lake and all - the whole thing moved here from the outside world, and its gods are still campaigning for faith. The Moriya Rope Way runs down from it toward the lake.',
		  facts:['Moriya Gym','High on the mountain, by the snowline','It brought its own lake','The Moriya Rope Way, down toward Misty Lake'],
		  chans:CH(['moriya-steps','moriya-shrine','moriya-lake','moriya-gym']),
		  catch:['Flying','Water','Ground','Ice'],
		  doing:['Challenge the Moriya Gym','Climb the steps','Look out from the summit over all of Gensokyo'],
		  live:[] },
		{ id:'netherworld', box:[24,18], name:'The Netherworld', x:-305, y:-40, island:'Gensokyo', kind:'landmark',
		  blurb:'Where spirits rest, above the clouds. You reach it from the Hakurei Shrine by going up, and keeping going after the sky should have stopped.',
		  facts:['Above the clouds, over the shrine','Phantoms in the fields','Cherry blossom that never quite falls','Hakugyokurou is up the stair'],
		  chans:CH(['netherworld-gate','phantom-fields']),
		  catch:['Ghost','Fairy','Psychic','Flying'],
		  doing:['Pass the gate','Walk with the phantoms','Climb to Hakugyokurou'],
		  live:[] },
		{ id:'hakugyokurou', box:[26,20], name:'Hakugyokurou', x:-288, y:-80, island:'Gensokyo', kind:'gym', gym:'HAKUGYOKUROU GYM',
		  blurb:'A great estate of the Netherworld, up a very long stair, its gardens full of cherry trees and one great tree that has never bloomed.',
		  facts:['Hakugyokurou Gym','A very long stair','The Saigyou Ayakashi, never in flower','A gardener with two swords'],
		  chans:CH(['hakugyokurou-stairs','hakugyokurou-garden','saigyou-ayakashi','hakugyokurou-gym']),
		  catch:['Ghost','Grass','Fairy','Steel'],
		  doing:['Climb the stair','Challenge the Hakugyokurou Gym','Sit under the Saigyou Ayakashi'],
		  live:[] },
		{ id:'windcave', box:[18,14], name:'Wind Cave', x:-520, y:138, island:'Gensokyo', kind:'peak',
		  blurb:'A cave in the Geyser Fields at the mountain\'s western foot that breathes warm air, and the way underground. At the bottom of it there is a bridge, and on the bridge there is someone waiting.',
		  facts:['The way down to Former Hell','Warm wind from below','A bridge at the bottom'],
		  chans:CH(['wind-cave','underground-bridge']),
		  catch:['Rock','Ground','Dark','Poison'],
		  doing:['Go down','Cross the underground bridge','Come back up, if you can'],
		  live:[] },
		{ id:'formercapital', box:[30,24], name:'Former Capital', x:-686, y:175, island:'Gensokyo', kind:'town',
		  blurb:'An old city of oni deep underground, loud and lantern-lit, where every argument is settled with a drink or a fight and usually both.',
		  facts:['Pokémon Centre','Underground, below the Wind Cave','Oni, and their tavern','The palace is at the far end of the street'],
		  chans:CH(['poke-center-underground','former-capital','oni-tavern']),
		  catch:['Fighting','Fire','Dark','Rock'],
		  doing:['Heal at the Centre','Drink with an oni (lose)','Walk to the palace'],
		  live:[] },
		{ id:'chireiden', box:[28,22], name:'Palace of the Earth Spirits', x:-670, y:140, island:'Gensokyo', kind:'gym', gym:'CHIREIDEN GYM',
		  blurb:'The palace at the heart of Former Hell, with the old fires still burning below it. Its mistress reads minds, so say what you mean.',
		  facts:['Chireiden Gym','Stained glass, and a great many pets','The Hell of Blazing Fires below','The mistress reads minds'],
		  chans:CH(['chireiden-halls','hell-of-blazing-fires','chireiden-gym']),
		  catch:['Fire','Psychic','Dark','Steel'],
		  doing:['Challenge the Chireiden Gym','Look down into the fires','Think quietly'],
		  live:[] },
		{ id:'gardenofsun', box:[30,24], name:'Garden of the Sun', x:-410, y:58, island:'Gensokyo', kind:'wild', gym:'SUNFLOWER GYM',
		  blurb:'A field of sunflowers taller than you, all turned the same way. The gym is out among them, and its leader does not like people who trample.',
		  facts:['Sunflower Gym','Every flower faces the same way','Mind where you step','Nameless Hill is a short walk on'],
		  chans:CH(['sunflower-fields','sunflower-gym']),
		  catch:['Grass','Bug','Fire','Fairy'],
		  doing:['Challenge the Sunflower Gym','Walk the rows without stepping on one','Find which way they are all looking'],
		  live:[] },
		{ id:'namelesshill', box:[18,14], name:'Nameless Hill', x:-513, y:38, island:'Gensokyo', kind:'wild',
		  blurb:'A hill of lily of the valley. Pretty, and poisonous, and a doll lives here who would like a word about that.',
		  facts:['Lily of the valley, all of it poisonous','A doll lives here','Quiet, too quiet'],
		  chans:CH(['nameless-hill']),
		  catch:['Poison','Fairy','Grass'],
		  doing:['Look, do not pick','Meet the doll','Leave before you feel dizzy'],
		  live:[] },
		{ id:'muenzuka', box:[18,14], name:'Muenzuka', x:-530, y:278, island:'Gensokyo', kind:'wild',
		  blurb:'A field of unmarked graves in the far south-west, where things from outside wash up. Red spider lilies, and the Road of Reconsideration running on from it to the Barrier of Life and Death.',
		  facts:['Unmarked graves','Where outside things wash up','Spider lilies, every autumn','The Barrier is thin here'],
		  chans:CH(['muenzuka']),
		  catch:['Ghost','Dark','Steel','Poison'],
		  doing:['See what has washed up','Pay respects','Do not stay after dark'],
		  live:[],
		  hook:'Most of what washes up now is from Kagura, not the outside world. Someone is collecting it before the shop does.' }
	];

	var ROUTE_INFO = {
		301: { kind:'main', name:'Route 301', from:'Human Village', to:'Hakurei Shrine', walk:'Long',
		       blurb:'The long road east across open country to the shrine on the border. Nobody walks it at night: it is a famously good place to be eaten.',
		       catch:['Normal','Flying','Fairy'], doing:['Walk it by day','Watch for youkai at the treeline','Climb the shrine steps at the end'] },
		302: { kind:'main', name:'Route 302', from:'Human Village', to:'Forest of Magic', walk:'Easy',
		       blurb:'A short road south-east out of the village and into the Forest of Magic.',
		       catch:['Grass','Bug','Poison'], doing:['Cross the river','Stop at Kourindou','Hold your breath at the treeline'] },
		303: { kind:'main', name:'Route 303', from:'Human Village', to:'Misty Lake', walk:'Foggy',
		       blurb:'West out of the village through Spring Lane\'s blossom, into a fog that gets thicker every step until you are standing on the lake shore.',
		       catch:['Normal','Water','Fairy'], doing:['Battle the fairies','Lose the road in the fog','Walk on to the mansion'] },
		304: { kind:'main', name:'Route 304', from:'Human Village', to:'Bamboo Forest of the Lost', walk:'Easy',
		       blurb:'North-east out of the village along the Yokai Trail, to where the bamboo starts and the paths stop being reliable.',
		       catch:['Normal','Grass','Bug'], doing:['Find a guide before you go in','Mark your way'] },
		305: { kind:'main', name:'Route 305', from:'Misty Lake', to:'Genbu Ravine', walk:'Easy',
		       blurb:'Round the lake\'s south shore and down along its outflow to Genbu Ravine.',
		       catch:['Water','Rock','Flying'], doing:['Follow the outflow down','Trade with a kappa on the way'] },
		306: { kind:'main', name:'Route 306', from:'Human Village', to:'Garden of the Sun', walk:'Easy',
		       blurb:'North out of the village through the Human Fields, and then sunflowers on either side, taller and taller.',
		       catch:['Grass','Bug','Flying'], doing:['Stay on the road','Look back and see every flower turn'] }
	};

	/*
	 * The gyms, as rooms. Types and badges are a first draft for the owner to
	 * change; leaders are left blank, as on Kagura.
	 */
	var GYMS = {
		hakurei:      { type:'Fairy',    badge:'Barrier Badge',   leader:'',
		                puzzle:'Paper charms float over the floor. Step only where the barrier lets you, and it moves when you do.' },
		scarletmansion:{ type:'Dark',    badge:'Scarlet Badge',   leader:'',
		                puzzle:'Corridors that are longer than the mansion. The clocks show which way time is running in each one.' },
		moriya:       { type:'Flying',   badge:'Wind Badge',      leader:'',
		                puzzle:'Onbashira pillars and gusts on a timer. Cross the summit platforms between the winds.' },
		eientei:      { type:'Psychic',  badge:'Lunar Badge',     leader:'',
		                puzzle:'Endless halls that loop. Only the moonlit doors lead anywhere.' },
		hakugyokurou: { type:'Ghost',    badge:'Phantom Badge',   leader:'',
		                puzzle:'A garden of phantoms. They show you the path, if you can keep up with them.' },
		chireiden:    { type:'Fire',     badge:'Inferno Badge',   leader:'',
		                puzzle:'Vents that flare in turn under stained-glass floors. Read the pattern before it reads you.' },
		myouren:      { type:'Fighting', badge:'Lotus Badge',     leader:'',
		                puzzle:'A training hall of bells. Ring them in the order of the sutra posted at the gate.' },
		gardenofsun:  { type:'Grass',    badge:'Sunflower Badge', leader:'',
		                puzzle:'A maze of sunflowers that turn to face you. Walk where they are not looking.' }
	};

	/* Towns up close (offsets from each place's own centre, as on Kagura). */
	var PLANS = {
		village: { streets: [[[-17,3],[17,3]], [[0,3],[0,-11]], [[-10,3],[-10,12]]],
			b: [['centre',-16,-9],['mart',3,-10],['house',-14,6],['house',-3,6],['house',8,6],['house',10,-8],['house',-18,13],['house',2,14]] },
		myouren: { streets: [[[0,10],[0,2]]], b: [['hall',-7,-7],['lantern',-9,4],['lantern',9,4],['house',9,-6]] },
		hakurei: { streets: [], b: [['torii',-8,4],['hall',0,-9],['lantern',-12,-4],['lantern',12,-2]] },
		kourindou: { streets: [], b: [['house',-4,-4]] },
		scarletmansion: { streets: [[[0,14],[0,6]]], b: [['mansion',-11,-8]] },
		eientei: { streets: [], b: [['hall',-7,-6],['house',8,4]] },
		genbu: { streets: [], b: [['house',-12,-2],['house',4,6]] },
		tenguvillage: { streets: [[[-12,3],[12,3]]], b: [['centre',-14,-8],['house',2,-8],['house',-10,6],['house',4,6]] },
		moriya: { streets: [], b: [['torii',-8,6],['hall',-2,-8],['lantern',-12,0]] },
		netherworld: { streets: [], b: [['torii',0,2],['lantern',-8,6],['lantern',8,6]] },
		hakugyokurou: { streets: [], b: [['hall',-7,-6],['lantern',-10,6],['lantern',10,6]] },
		windcave: { streets: [], b: [['cave',0,0]] },
		formercapital: { streets: [[[-14,3],[14,3]]], b: [['centre',-15,-9],['house',2,-8],['house',-12,6],['house',0,6],['house',10,6],['lantern',-19,3],['lantern',15,3]] },
		chireiden: { streets: [], b: [['mansion',-11,-8]] }
	};

	/* Pictures in art/gensokyo/, by map id. Built by tools/wire-art.js. */
	var ART = {
		bamboo: 'bamboo.webp',
		chireiden: 'chireiden.webp',
		eientei: 'eientei.webp',
		forestofmagic: 'forestofmagic.webp',
		'g-chireiden': 'g-chireiden.webp',
		'g-eientei': 'g-eientei.webp',
		'g-hakugyokurou': 'g-hakugyokurou.webp',
		'g-hakurei': 'g-hakurei.webp',
		'g-scarletmansion': 'g-scarletmansion.webp',
		genbu: 'genbu.webp',
		hakugyokurou: 'hakugyokurou.webp',
		hakurei: 'hakurei.webp',
		kourindou: 'kourindou.webp',
		mistylake: 'mistylake.webp',
		moriya: 'moriya.webp',
		myouren: 'myouren.webp',
		netherworld: 'netherworld.webp',
		r301: 'route-301.webp',
		r302: 'route-302.webp',
		r304: 'route-304.webp',
		r305: 'route-305.webp',
		scarletmansion: 'scarletmansion.webp',
		tenguvillage: 'tenguvillage.webp',
		village: 'village.webp'
	};

	window.ATLAS_REGIONS = window.ATLAS_REGIONS || {};
	window.ATLAS_REGIONS.gensokyo = {
		id: 'gensokyo',
		name: 'Gensokyo',
		tagline: 'Behind the Barrier: one land, eight gyms, and two places that are not on the ground.',
		art: 'art/gensokyo/',
		/* The land, the Netherworld off the north-east and Former Hell off the
		   west coast, and the sea round them. */
		bounds: [-740, -110, -185, 390],
		ISLANDS: ISLANDS, BIOMES: BIOMES, RIDGES: RIDGES, FORESTS: FORESTS, RIVERS: RIVERS,
		LAKES: LAKES, MISTS: MISTS, LAVA: LAVA, ROUTES: ROUTES, LINKS: LINKS, TRAILS: TRAILS,
		DECOR: DECOR, DECOR_LINES: DECOR_LINES,
		GRASS_PATCHES: GRASS_PATCHES, PLACES: PLACES, ROUTE_INFO: ROUTE_INFO, GYMS: GYMS,
		PLANS: PLANS, ART: ART,
		title: ['GENSOKYO', -400, 384],
		borderIslands: ISLANDS,
		borderOutside: [],
		/* The mountain has no marker of its own, and the two insets need saying what they are. */
		isles: [['YOKAI MOUNTAIN', -487, 124], ['THE NETHERWORLD', -298, -112], ['FORMER HELL', -680, 106]],
		seas: [['SEA OF CLOUDS', -232, -16], ['THE GREAT HAKUREI BARRIER', -196, 300], ['THE UNDERGROUND', -680, 216]],
		rivers: [['SANZU RIVER', -468, 26], ['CANAL OF WILLOWS', -330, 138]],
		/* Everything else the reference names: ground, houses, trails - not destinations of their own. */
		areas: [
			['HUMAN FIELDS', -370, 112], ['YOKAI FOREST', -420, 142], ['UNTRODDEN VALLEY', -446, 118],
			['GEYSER FIELDS', -530, 166], ['NEEDLE CASTLE', -543, 112], ['SECRET HEAVEN SHELF', -521, 122],
			['FALSE HEAVEN SHELF', -534, 178], ['ROAD OF LINGERING SNOW', -548, 194], ['GIANT TOAD POND', -489, 214],
			['PEONY FIELD', -494, 176], ['MORIYA ROPE WAY', -432, 166], ['HALL OF DREAMS', -306, 156],
			['YOKAI TRAIL', -298, 142], ['FAIRY\'S TREE', -226, 214], ['SPRING LANE', -404, 250],
			['TANUKI FOREST', -462, 262], ['PHANTOM MEADOWS', -460, 292], ['ROAD OF RECONSIDERATION', -470, 338],
			['BARRIER OF LIFE AND DEATH', -374, 366], ['MAYOHIGA', -294, 324], ['MARISA\'S HOUSE', -247, 232],
			['ALICE\'S HOUSE', -317, 280], ['EASTERN HOT SPRINGS', -232, 256], ['HYPER VESSEL RUINS', -242, 288],
			['ROAD OF LUMINALITY', -486, 72]
		],
		/* The map key, for here: Gensokyo's own ground, and the two ways that
		   are not roads. Kagura-only kinds are left off. */
		legend: {
			add: {
				GROUND: [['sw', 'Forest of Magic', '#285446'], ['sw', 'Bamboo', '#9cc060'],
				         ['sw', 'Sunflowers', '#f0c828'], ['sw', 'Lily of the valley', '#b04ace'],
				         ['sw', 'Yokai Forest', '#26443a'], ['sw', 'Human Fields', '#aadc92'],
				         ['sw', 'Geyser Fields', '#dc963c'], ['sw', 'Tanuki Forest', '#b2c832'],
				         ['sw', 'Spider lilies', '#d62a30'], ['sw', 'Cherry blossom', '#eeaac6'],
				         ['sw', 'Fog', '#d6dee6'], ['sw', 'Underground', '#3a2c2e'], ['sw', 'Hellfire', '#de682c']],
				WATER: [['sw', 'Sea of clouds', '#eef0f8']],
				WAYS: [['ln sky', 'Up through the clouds'], ['ln deep', 'Down underground']]
			},
			hide: ['Jungle', 'Ghost Woods', 'Volcanic ash', 'Reef', 'Bridge', 'Ferry lane', 'Railway',
			       'Needs Flash, Climb, Dive or badges', 'Legendary site']
		}
	};
})();
