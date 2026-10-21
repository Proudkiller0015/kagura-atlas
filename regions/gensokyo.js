/*
 * Gensokyo - region data.
 *
 * The Touhou world, arrived through the collision with Kagura: one round land
 * behind the Great Hakurei Barrier, out past the open sea west of Kagura. Same
 * shared world coordinates as regions/kagura.js (Kagura's west coast is at
 * x 8); Gensokyo's east coast is at about x -245, so there is real sea between.
 *
 * Laid out from the owner's Touhoumon town map and canon geography: Youkai
 * Mountain fills the north, Misty Lake and the Scarlet Devil Mansion sit at its
 * western foot, the Human Village is in the middle with the Forest of Magic
 * beside it, the Hakurei Shrine is on the eastern border, the Bamboo Forest of
 * the Lost and Eientei are to the south, and the Garden of the Sun lies
 * south-east toward the shrine.
 *
 * Two places are not on the ground at all, so each is drawn as its own inset
 * in the world:
 *   - The Netherworld floats above the clouds north-east of the shrine: a small
 *     island whose sea is a sea of clouds (biome `sky`), reached from the shrine
 *     by a dashed line through the clouds (trail `line: 'sky'`).
 *   - Former Hell is underground, north-west of the mountain: a cavern floor in
 *     a ring of dark rock (biome `under`), reached by a dashed line down from
 *     the Wind Cave on the mountain's flank (trail `line: 'deep'`).
 *
 * Every place id, channel and road here matches the bot (rp-bot/data
 * map-places.json and map-links.json, built by tools/gensokyo-channels.js).
 * The roads are what the bot's links are worked out from (connections.js), so
 * a trail that is not "a side trail" names itself with `via` and `kind`.
 */
(function () {
	'use strict';

	/* The land itself: round, as on the town map, a little fuller in the north
	   where the mountain is. */
	var GENSOKYO = [
		[-243,215],[-246,259],[-268,297],[-298,327],[-331,352],[-369,367],[-410,369],[-449,362],
		[-489,353],[-530,335],[-559,301],[-568,257],[-563,215],[-555,176],[-545,137],[-524,101],
		[-491,75],[-455,49],[-410,39],[-364,44],[-324,67],[-296,101],[-282,141],[-259,175]
	];
	/* The Netherworld, above the clouds. */
	var NETHERWORLD = [
		[-278,27],[-270,1],[-246,-11],[-218,-7],[-202,15],[-206,41],[-226,57],[-254,59],[-272,47]
	];
	/* Former Hell, underground. */
	var FORMER_HELL = [
		[-642,30],[-636,4],[-614,-10],[-584,-10],[-560,4],[-556,30],[-564,54],[-588,68],[-616,66],[-636,52]
	];
	var ISLANDS = [GENSOKYO, NETHERWORLD, FORMER_HELL];

	/*
	 * One palette per island. The Netherworld is pale and washed out, the way a
	 * place of the dead should be; Former Hell is dark basalt, lit from below.
	 * `sky` and `under` tell the renderer what lies around the island instead of
	 * sea, and `reach` is how far that goes.
	 */
	var BIOMES = [
		{ g0:[ 98,170, 88], g1:[146,204,112], s0:[226,206,156], s1:[240,224,182] },   /* Gensokyo     */
		{ g0:[164,178,170], g1:[206,212,200], s0:[214,210,222], s1:[236,232,240],
		  sky:true, reach:34 },                                                        /* Netherworld  */
		{ g0:[ 66, 52, 56], g1:[ 96, 76, 72], s0:[ 78, 62, 60], s1:[104, 84, 78],
		  mottle:[54,40,44], swell:[40,30,32], coast:[30,22,26], wet:[60,46,46],
		  pave:[[132, 74, 58], [168, 104, 72]],                                       /* lantern-lit stone */
		  under:true, reach:30 }                                                       /* Former Hell  */
	];

	/*
	 * High ground. Youkai Mountain is the whole north, snow on top; a ring of
	 * lower hills runs round the rim, which is the dark ring on the town map and
	 * why most of the coast is cliff rather than beach - nothing walks into
	 * Gensokyo from the sea.
	 */
	var RIDGES = [
		{ x:-400, y: 88, r:64, h:1.00 },   /* Youkai Mountain                */
		{ x:-440, y: 80, r:38, h:0.70 },   /* its western shoulder           */
		{ x:-356, y: 78, r:36, h:0.74 },   /* and its eastern one            */
		{ x:-340, y:120, r:30, h:0.52 },
		{ x:-470, y:100, r:26, h:0.50 },   /* the Wind Cave's crag           */
		/* the rim, all the way round but for the mountain */
		{ x:-277, y:258, r:21, h:0.31 }, { x:-303, y:305, r:20, h:0.30 }, { x:-344, y:339, r:21, h:0.31 },
		{ x:-395, y:360, r:24, h:0.38 }, { x:-450, y:355, r:21, h:0.31 }, { x:-490, y:340, r:18, h:0.30 },
		{ x:-531, y:285, r:21, h:0.31 }, { x:-549, y:234, r:24, h:0.38 }, { x:-546, y:181, r:21, h:0.31 },
		{ x:-540, y:116, r:22, h:0.38 }, { x:-500, y: 88, r:21, h:0.31 }, { x:-277, y:172, r:24, h:0.38 },
		{ x:-300, y:126, r:22, h:0.40 },
		{ x:-264, y:208, r:16, h:0.30 },   /* the shrine's hill              */
		{ x:-292, y:322, r:14, h:0.24 },   /* Nameless Hill                  */
		/* the Netherworld's long stair goes up a rise */
		{ x:-232, y:  8, r:16, h:0.30 }
	];

	/*
	 * Woods and fields. Kinds beyond Kagura's: `magic` (the Forest of Magic,
	 * dark and spore-thick), `bamboo`, `blossom` (cherry, for the shrine and the
	 * Netherworld) and `flowers` - a field rather than trees.
	 */
	var FORESTS = [
		{ x:-492, y:236, r:44, magic:true },   /* Forest of Magic          */
		{ x:-474, y:276, r:26, magic:true },
		{ x:-520, y:206, r:22, magic:true },
		{ x:-412, y:328, r:40, bamboo:true },  /* Bamboo Forest of the Lost*/
		{ x:-446, y:344, r:24, bamboo:true },
		{ x:-378, y:334, r:20, bamboo:true },
		{ x:-322, y:292, r:30, flowers:'sunflower' },   /* Garden of the Sun */
		{ x:-505, y:290, r:16, magic:true }, { x:-515, y:256, r:14, magic:true },
		{ x:-292, y:322, r:12, flowers:'lily' },        /* Nameless Hill     */
		{ x:-505, y:322, r:13, flowers:'higanbana' },   /* Muenzuka          */
		{ x:-270, y:192, r:10, blossom:true },          /* the shrine's trees*/
		{ x:-240, y: 24, r:34, blossom:true },          /* the Netherworld   */
		/* the mountain's lower woods, where the tengu and kappa live */
		{ x:-452, y:126, r:20 }, { x:-410, y:126, r:18 }, { x:-350, y:150, r:24 }, { x:-318, y:112, r:18 },
		/* round the rim */
		{ x:-296, y:250, r:18 }, { x:-344, y:346, r:16 }, { x:-546, y:280, r:20 },
		{ x:-546, y:150, r:16 }, { x:-516, y:96,  r:16 }, { x:-286, y:178, r:14 },
		{ x:-470, y:190, r:14 }, { x:-305, y:253, r:14 }, { x:-354, y:312, r:14 },
		{ x:-515, y:177, r:14 }, { x:-324, y:143, r:18 }, { x:-330, y:188, r:14 },
		{ x:-318, y:246, r:10 }, { x:-395, y:182, r:12 }, { x:-372, y:150, r:14 },
		{ x:-368, y:292, r:10 }, { x:-440, y:282, r:12 }
	];

	var RIVERS = [
		/* down off the mountain, through Genbu Ravine and the middle of the land */
		[[-424,66],[-436,98],[-446,128],[-452,152],[-446,182],[-440,210],[-438,240],[-440,270],[-452,300],[-462,332],[-468,366]],
		/* Misty Lake's outflow, west to the sea */
		[[-516,160],[-530,184],[-546,210],[-566,226]]
	];

	var LAKES = [
		{ x:-500, y:146, r:20 },   /* Misty Lake          */
		{ x:-374, y: 72, r: 6 }    /* the Moriya lake     */
	];

	/* Misty Lake is under a fog that never lifts. */
	var MISTS = [
		{ x:-500, y:146, r:30, a:0.42 }
	];

	/* Lava, for the Hell of Blazing Fires under the palace. */
	var LAVA = [
		{ x:-566, y:-1, r:5 }, { x:-574, y:31, r:4 }
	];

	/*
	 * Roads. Every one of them ends at a place, so the bot's links fall out of
	 * the geometry exactly as tools/gensokyo-channels.js wrote them.
	 */
	var ROUTES = [
		{ n:301, path:[[-405,228],[-378,230],[-345,224],[-312,216],[-285,212],[-264,210]] },
		{ n:302, path:[[-405,228],[-428,232],[-452,236],[-472,234],[-490,232]] },
		{ n:303, path:[[-405,228],[-418,210],[-438,192],[-460,178],[-488,162]] },
		{ n:304, path:[[-405,228],[-404,252],[-410,282],[-410,312]] },
		{ n:305, path:[[-488,162],[-472,154],[-458,147],[-445,140]] },
		{ n:306, path:[[-405,228],[-382,248],[-355,266],[-322,288]] }
	];
	var LINKS = [
		[[-405,228],[-388,214],[-370,202]],    /* the village to Myouren Temple         */
		[[-605,45],[-598,28],[-588,12]]        /* the Former Capital to the palace      */
	];
	/* The order matters where one place has two of the same kind: the bot lists
	   them in this order. */
	var TRAILS = [
		[[-490,232],[-475,246],[-455,252]],                                   /* forest  -> Kourindou    */
		[[-410,312],[-424,326],[-436,338]],                                   /* bamboo  -> Eientei      */
		[[-410,312],[-445,316],[-475,322],[-505,322]],                        /* bamboo  -> Muenzuka     */
		[[-445,140],[-436,124],[-420,108]],                                   /* Genbu   -> Tengu Village*/
		[[-420,108],[-406,92],[-392,78]],                                     /* Tengu   -> Moriya       */
		{ path:[[-445,140],[-462,122],[-470,98]], via:'the Wind Cave' },      /* Genbu   -> Wind Cave    */
		{ path:[[-264,210],[-232,170],[-222,120],[-226,80],[-250,45]],
		  via:'the gate above the clouds', line:'sky' },                     /* shrine  -> Netherworld  */
		/* Short walks: a few steps off a road, but the bot names them, so they are drawn. */
		{ path:[[-428,232],[-440,246],[-455,252]], via:'a short walk off Route 302', kind:'walk' },
		{ path:[[-488,162],[-512,162],[-533,140]], via:'a short walk off Route 303', kind:'walk' },
		{ path:[[-322,288],[-305,305],[-292,322]], via:'a short walk off Route 306', kind:'walk' },
		{ path:[[-250,45],[-242,28],[-232,10]],    via:'a short walk off a side trail', kind:'walk' },
		{ path:[[-470,98],[-505,80],[-545,62],[-580,50],[-605,45]],
		  via:'a short walk off a side trail', kind:'walk', line:'deep' }     /* Wind Cave -> underground */
	];

	var GRASS_PATCHES = [
		[-440,192,12,8],[-408,282,8,12],[-355,264,12,7],[-330,224,14,7],[-466,152,8,6],[-462,238,8,6],
		[-300,228,10,8],[-372,286,10,8],[-520,250,10,8],[-344,166,10,8],
		[-380,170,10,7],[-352,214,8,6],[-430,262,8,10],[-470,212,8,6],[-290,280,8,8],[-412,150,8,6]
	];

	var CH = function (list) { return list.map(function (c) { return '#' + c; }); };

	/* Every place, in the bot's order (rp-bot/tools/gensokyo-channels.js). */
	var PLACES = [
		{ id:'village', box:[46,36], name:'Human Village', x:-405, y:228, island:'Gensokyo', kind:'town',
		  blurb:'The one town in Gensokyo where people live in the open: markets, a book shop, a school, and a Pokémon Centre. Youkai are not welcome to hunt here, and mostly they keep to that.',
		  facts:['Pokémon Centre','Mart','Suzunaan, the book rental','The terakoya, a village school','Every road in Gensokyo starts at its gate'],
		  chans:CH(['poke-center-village','village-mart','village-square','suzunaan','village-tea-house','terakoya','village-gate']),
		  catch:['Normal','Flying','Grass','Fairy'],
		  doing:['Heal at the Centre','Stock up at the Mart','Borrow something strange from Suzunaan','Sit in on a lesson at the terakoya','Take any road out of the gate'],
		  live:[],
		  hook:'Since the collision, Suzunaan has been lending out books nobody in Gensokyo wrote. They are in Kagura\'s script.' },
		{ id:'myouren', box:[24,20], name:'Myouren Temple', x:-370, y:202, island:'Gensokyo', kind:'gym', gym:'MYOUREN GYM',
		  blurb:'A temple just outside the village that takes in humans and youkai alike, with a graveyard behind it and a gym that teaches discipline the hard way.',
		  facts:['Myouren Gym','Open to humans and youkai','A graveyard out back','A connecting road to the village'],
		  chans:CH(['myouren-gate','myouren-temple','myouren-graveyard','myouren-gym']),
		  catch:['Fighting','Ghost','Normal','Psychic'],
		  doing:['Challenge the Myouren Gym','Sit in on the morning sutras','Walk the graveyard at dusk'],
		  live:[] },
		{ id:'hakurei', box:[26,20], name:'Hakurei Shrine', x:-264, y:210, island:'Gensokyo', kind:'gym', gym:'HAKUREI GYM',
		  blurb:'A quiet shrine on a hill at the eastern edge of Gensokyo, right against the Great Barrier. The donation box is usually empty, and the shrine maiden will tell you so.',
		  facts:['Hakurei Gym','On the Great Hakurei Barrier','A hot spring behind the shrine','The way up to the Netherworld starts here'],
		  chans:CH(['hakurei-steps','hakurei-grounds','donation-box','hakurei-hot-spring','hakurei-gym']),
		  catch:['Fairy','Psychic','Flying','Normal'],
		  doing:['Challenge the Hakurei Gym','Leave something in the donation box','Soak in the hot spring','Look up: the clouds go higher than they should'],
		  live:[],
		  hook:'The Barrier is thinner since the collision. Some nights you can see Kagura\'s lights from the steps.' },
		{ id:'forestofmagic', box:[30,24], name:'Forest of Magic', x:-490, y:232, island:'Gensokyo', kind:'wild',
		  blurb:'A damp, spore-thick forest where magicians live and few others go. The mushrooms are the point and the problem: breathe enough of them and the paths start to move.',
		  facts:['Dark under the canopy all day','Magic-grade mushrooms','Two magicians live here','Kourindou is at the edge'],
		  chans:CH(['magic-forest-edge','mushroom-glade','kirisame-house','margatroid-house']),
		  catch:['Poison','Grass','Bug','Ghost'],
		  doing:['Pick mushrooms (carefully)','Knock at a magician\'s door','Stay on the path'],
		  live:[] },
		{ id:'kourindou', box:[16,14], name:'Kourindou', x:-455, y:252, island:'Gensokyo', kind:'hangout', rank:2,
		  blurb:'A curio shop at the forest edge, full of things that fell in from the outside world. The owner knows what everything is called and rarely what it is for.',
		  facts:['Things from outside, for sale','The owner names, but does not explain','A storeroom nobody has sorted'],
		  chans:CH(['kourindou','kourindou-storeroom']),
		  catch:['Steel','Electric','Normal'],
		  doing:['Browse the shelves','Ask what something is','Dig through the storeroom'],
		  live:[],
		  hook:'Lately the things in the storeroom are Kagura\'s: a bus timetable, a gym badge, a Poké Ball with someone\'s name on it.' },
		{ id:'mistylake', box:[24,18], name:'Misty Lake', x:-488, y:162, island:'Gensokyo', kind:'water',
		  blurb:'A lake under a fog that never lifts, at the western foot of Youkai Mountain. Busy with fairies by day, and colder than the weather says it should be.',
		  facts:['Fog all day, every day','Fairies, and an ice fairy among them','The Scarlet Devil Mansion is on the far shore','Route 305 climbs to Genbu Ravine'],
		  chans:CH(['misty-lake','fairy-shallows']),
		  catch:['Water','Ice','Fairy','Bug'],
		  doing:['Fish the fog','Get challenged by a fairy','Walk round to the mansion'],
		  live:[] },
		{ id:'scarletmansion', box:[30,24], name:'Scarlet Devil Mansion', x:-533, y:140, island:'Gensokyo', kind:'gym', gym:'SCARLET GYM',
		  blurb:'A red mansion on the lake shore with a gatekeeper, a vast library and a clock tower. Larger inside than out, and nobody asks why.',
		  facts:['Scarlet Gym','A gatekeeper who is usually asleep','Voile, the great library','A clock tower, and a basement nobody goes down to'],
		  chans:CH(['mansion-gate','mansion-garden','voile-library','clock-tower','mansion-basement','scarlet-gym']),
		  catch:['Dark','Ghost','Psychic','Fire'],
		  doing:['Get past the gate','Read in the library','Challenge the Scarlet Gym','Do not go down to the basement'],
		  live:[] },
		{ id:'bamboo', box:[30,24], name:'Bamboo Forest of the Lost', x:-410, y:312, island:'Gensokyo', kind:'wild',
		  blurb:'Bamboo that grows fast enough to change the paths overnight. Easy to enter, hard to leave, and full of rabbits who know the way and will not tell you.',
		  facts:['The paths move','Rabbits everywhere','Eientei is somewhere inside','A guide, if you can find her'],
		  chans:CH(['bamboo-forest','lost-paths','rabbit-warren']),
		  catch:['Grass','Normal','Bug','Fire'],
		  doing:['Get lost','Follow a rabbit','Find your way to Eientei, or out'],
		  live:[] },
		{ id:'eientei', box:[24,20], name:'Eientei', x:-436, y:338, island:'Gensokyo', kind:'gym', gym:'EIENTEI GYM',
		  blurb:'An old mansion hidden deep in the bamboo, and the best medicine in Gensokyo. Its people came from the moon, and have never quite finished arriving.',
		  facts:['Eientei Gym','The best pharmacy in Gensokyo','Hidden in the bamboo','Moon people, quietly'],
		  chans:CH(['eientei-gate','eientei-halls','eientei-pharmacy','eientei-gym']),
		  catch:['Psychic','Normal','Fairy','Grass'],
		  doing:['Challenge the Eientei Gym','Buy medicine','Ask about the moon and watch them change the subject'],
		  live:[] },
		{ id:'genbu', box:[24,18], name:'Genbu Ravine', x:-445, y:140, island:'Gensokyo', kind:'wild',
		  blurb:'The ravine at the foot of the mountain, where the river comes down hard and the kappa build and tinker along its banks.',
		  facts:['The mountain river starts its run here','Kappa workshops','Tengu Village is up the trail','The Wind Cave is on the crag above'],
		  chans:CH(['genbu-ravine','kappa-workshop','mountain-river']),
		  catch:['Water','Steel','Electric','Rock'],
		  doing:['Trade with the kappa','Fish the mountain river','Climb to the Wind Cave'],
		  live:[] },
		{ id:'tenguvillage', box:[28,22], name:'Tengu Village', x:-420, y:108, island:'Gensokyo', kind:'town',
		  blurb:'The tengu settlement on the mountain slopes, with a waterfall, a Pokémon Centre and more newspapers than readers.',
		  facts:['Pokémon Centre','Nine Heavens Falls','The Bunbunmaru press','Outsiders watched, and written about'],
		  chans:CH(['poke-center-mountain','tengu-village','nine-heavens-falls','bunbunmaru-press']),
		  catch:['Flying','Dark','Rock','Water'],
		  doing:['Heal at the Centre','Stand under the falls','End up in the paper'],
		  live:[] },
		{ id:'moriya', box:[24,20], name:'Moriya Shrine', x:-392, y:78, island:'Gensokyo', kind:'gym', gym:'MORIYA GYM',
		  blurb:'A shrine at the top of Youkai Mountain, lake and all - the whole thing moved here from the outside world, and its gods are still campaigning for faith.',
		  facts:['Moriya Gym','On the summit, above the snowline','It brought its own lake','Two gods and a shrine maiden'],
		  chans:CH(['moriya-steps','moriya-shrine','moriya-lake','moriya-gym']),
		  catch:['Flying','Water','Ground','Ice'],
		  doing:['Challenge the Moriya Gym','Climb the steps','Look out from the summit over all of Gensokyo'],
		  live:[] },
		{ id:'netherworld', box:[24,18], name:'The Netherworld', x:-250, y:45, island:'Gensokyo', kind:'landmark',
		  blurb:'Where spirits rest, above the clouds. You reach it from the Hakurei Shrine by going up, and keeping going after the sky should have stopped.',
		  facts:['Above the clouds, over the shrine','Phantoms in the fields','Cherry blossom that never quite falls','Hakugyokurou is up the stair'],
		  chans:CH(['netherworld-gate','phantom-fields']),
		  catch:['Ghost','Fairy','Psychic','Flying'],
		  doing:['Pass the gate','Walk with the phantoms','Climb to Hakugyokurou'],
		  live:[] },
		{ id:'hakugyokurou', box:[26,20], name:'Hakugyokurou', x:-232, y:10, island:'Gensokyo', kind:'gym', gym:'HAKUGYOKUROU GYM',
		  blurb:'A great estate of the Netherworld, up a very long stair, its gardens full of cherry trees and one great tree that has never bloomed.',
		  facts:['Hakugyokurou Gym','A very long stair','The Saigyou Ayakashi, never in flower','A gardener with two swords'],
		  chans:CH(['hakugyokurou-stairs','hakugyokurou-garden','saigyou-ayakashi','hakugyokurou-gym']),
		  catch:['Ghost','Grass','Fairy','Steel'],
		  doing:['Climb the stair','Challenge the Hakugyokurou Gym','Sit under the Saigyou Ayakashi'],
		  live:[] },
		{ id:'windcave', box:[18,14], name:'Wind Cave', x:-470, y:98, island:'Gensokyo', kind:'peak',
		  blurb:'A cave on the mountain\'s western crag that breathes warm air, and the way underground. At the bottom of it there is a bridge, and on the bridge there is someone waiting.',
		  facts:['The way down to Former Hell','Warm wind from below','A bridge at the bottom'],
		  chans:CH(['wind-cave','underground-bridge']),
		  catch:['Rock','Ground','Dark','Poison'],
		  doing:['Go down','Cross the underground bridge','Come back up, if you can'],
		  live:[] },
		{ id:'formercapital', box:[30,24], name:'Former Capital', x:-605, y:45, island:'Gensokyo', kind:'town',
		  blurb:'An old city of oni deep underground, loud and lantern-lit, where every argument is settled with a drink or a fight and usually both.',
		  facts:['Pokémon Centre','Underground, below the Wind Cave','Oni, and their tavern','The palace is at the far end of the street'],
		  chans:CH(['poke-center-underground','former-capital','oni-tavern']),
		  catch:['Fighting','Fire','Dark','Rock'],
		  doing:['Heal at the Centre','Drink with an oni (lose)','Walk to the palace'],
		  live:[] },
		{ id:'chireiden', box:[28,22], name:'Palace of the Earth Spirits', x:-588, y:12, island:'Gensokyo', kind:'gym', gym:'CHIREIDEN GYM',
		  blurb:'The palace at the heart of Former Hell, with the old fires still burning below it. Its mistress reads minds, so say what you mean.',
		  facts:['Chireiden Gym','Stained glass, and a great many pets','The Hell of Blazing Fires below','The mistress reads minds'],
		  chans:CH(['chireiden-halls','hell-of-blazing-fires','chireiden-gym']),
		  catch:['Fire','Psychic','Dark','Steel'],
		  doing:['Challenge the Chireiden Gym','Look down into the fires','Think quietly'],
		  live:[] },
		{ id:'gardenofsun', box:[30,24], name:'Garden of the Sun', x:-322, y:288, island:'Gensokyo', kind:'wild', gym:'SUNFLOWER GYM',
		  blurb:'A field of sunflowers taller than you, all turned the same way. The gym is out among them, and its leader does not like people who trample.',
		  facts:['Sunflower Gym','Every flower faces the same way','Mind where you step','Nameless Hill is a short walk on'],
		  chans:CH(['sunflower-fields','sunflower-gym']),
		  catch:['Grass','Bug','Fire','Fairy'],
		  doing:['Challenge the Sunflower Gym','Walk the rows without stepping on one','Find which way they are all looking'],
		  live:[] },
		{ id:'namelesshill', box:[18,14], name:'Nameless Hill', x:-292, y:322, island:'Gensokyo', kind:'wild',
		  blurb:'A hill of lily of the valley. Pretty, and poisonous, and a doll lives here who would like a word about that.',
		  facts:['Lily of the valley, all of it poisonous','A doll lives here','Quiet, too quiet'],
		  chans:CH(['nameless-hill']),
		  catch:['Poison','Fairy','Grass'],
		  doing:['Look, do not pick','Meet the doll','Leave before you feel dizzy'],
		  live:[] },
		{ id:'muenzuka', box:[18,14], name:'Muenzuka', x:-505, y:322, island:'Gensokyo', kind:'wild',
		  blurb:'A field of unmarked graves on the south-west rim, where things from outside wash up. Red spider lilies, and the Barrier at its thinnest.',
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
		       blurb:'A short road west to the forest edge, past the river and Kourindou\'s door.',
		       catch:['Grass','Bug','Poison'], doing:['Cross the river','Stop at Kourindou','Hold your breath at the treeline'] },
		303: { kind:'main', name:'Route 303', from:'Human Village', to:'Misty Lake', walk:'Foggy',
		       blurb:'North-west through farmland and long grass, into a fog that gets thicker every step until you are standing on the lake shore.',
		       catch:['Normal','Water','Fairy'], doing:['Battle the fairies','Lose the road in the fog','Walk on to the mansion'] },
		304: { kind:'main', name:'Route 304', from:'Human Village', to:'Bamboo Forest of the Lost', walk:'Easy',
		       blurb:'South out of the village, through fields to where the bamboo starts and the paths stop being reliable.',
		       catch:['Normal','Grass','Bug'], doing:['Find a guide before you go in','Mark your way'] },
		305: { kind:'main', name:'Route 305', from:'Misty Lake', to:'Genbu Ravine', walk:'Climb',
		       blurb:'Up from the lake along the river to the mountain\'s foot, where the tengu start watching.',
		       catch:['Water','Rock','Flying'], doing:['Follow the river up','Get stopped by a white wolf tengu'] },
		306: { kind:'main', name:'Route 306', from:'Human Village', to:'Garden of the Sun', walk:'Easy',
		       blurb:'South-east through meadow, and then sunflowers on either side, taller and taller.',
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

	window.ATLAS_REGIONS = window.ATLAS_REGIONS || {};
	window.ATLAS_REGIONS.gensokyo = {
		id: 'gensokyo',
		name: 'Gensokyo',
		tagline: 'Behind the Barrier: one land, eight gyms, and two places that are not on the ground.',
		art: 'art/gensokyo/',
		/* The land, the Netherworld up to the north-east and Former Hell to the
		   north-west, and the sea round them. */
		bounds: [-665, -40, -185, 400],
		ISLANDS: ISLANDS, BIOMES: BIOMES, RIDGES: RIDGES, FORESTS: FORESTS, RIVERS: RIVERS,
		LAKES: LAKES, MISTS: MISTS, LAVA: LAVA, ROUTES: ROUTES, LINKS: LINKS, TRAILS: TRAILS,
		GRASS_PATCHES: GRASS_PATCHES, PLACES: PLACES, ROUTE_INFO: ROUTE_INFO, GYMS: GYMS,
		PLANS: PLANS, ART: {},
		title: ['GENSOKYO', -410, 390],
		borderIslands: ISLANDS,
		borderOutside: [],
		/* Area names: the mountain has no marker of its own, and the two insets
		   need saying what they are. */
		isles: [['YOUKAI MOUNTAIN', -372, 46], ['THE NETHERWORLD', -240, -26], ['FORMER HELL', -600, -26]],
		seas: [['SEA OF CLOUDS', -196, 70], ['THE GREAT HAKUREI BARRIER', -214, 300], ['THE UNDERGROUND', -650, 92]],
		rivers: [['MOUNTAIN RIVER', -462, 290], ['MISTY OUTFLOW', -548, 198]],
		/* The map key, for here: Gensokyo's own ground, and the two ways that
		   are not roads. Kagura-only kinds are left off. */
		legend: {
			add: {
				GROUND: [['sw', 'Forest of Magic', '#285446'], ['sw', 'Bamboo', '#9cc060'],
				         ['sw', 'Sunflowers', '#f0c828'], ['sw', 'Lily of the valley', '#f2f2ea'],
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
