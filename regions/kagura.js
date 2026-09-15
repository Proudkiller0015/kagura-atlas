/*
 * Kagura - region data.
 *
 * Everything here describes one region and nothing here knows how to draw. To
 * add a region, copy this file, change the contents, and add its id to the list
 * in index.html. The renderer needs no edit.
 *
 * Coordinates are in region units on a 512x384 field; the renderer scales them.
 */
(function () {
	'use strict';

var KOGARASHI = [[58,74],[70,48],[96,30],[128,22],[162,28],[188,46],[198,72],[190,96],[166,108],[142,104],
                 [128,120],[138,142],[152,158],[146,180],[122,192],[94,184],[74,164],[62,136],[52,106]];
var HINODE = [[44,236],[62,214],[92,200],[128,196],[164,204],[192,224],[204,250],[198,278],[176,298],[150,302],
              [136,316],[146,338],[136,360],[112,368],[92,354],[86,330],[66,312],[48,288],[38,262]];
var SHIOMI = [[326,86],[340,56],[366,34],[400,24],[436,28],[462,48],[474,78],[468,108],[448,128],[458,146],
              [476,158],[472,180],[446,190],[418,178],[404,152],[376,146],[348,126],[330,106]];
var TSUKI = [[328,296],[344,268],[372,250],[408,244],[444,254],[468,276],[476,306],[468,336],[444,356],
             [410,364],[374,356],[346,336],[330,318]];
var LAGOON = [[374,300],[392,286],[418,288],[434,304],[430,326],[408,338],[382,332],[370,316]];
var ISLETS = [{ x:250, y:68, r:14 }];
/* Roads that are not numbered routes: the walk out of Victory Road onto
   the plateau, which nobody would call a route because there is no choice
   involved in taking it. */
/*
 * Connector roads: the short bits that are not routes in their own right but
 * without which the network has holes. Both bridges previously began and ended
 * in open country - land, gap, bridge, gap - which is why they read as floating.
 */
var LINKS = [
	[[122,46],[154,34]],                          /* Victory Road up to the League */
	[[118,178],[120,190]],                        /* Kogarashi down to Watari       */
	[[116,202],[104,208],[86,214]],               /* Watari down to the north track */
	[[438,188],[448,172],[456,154]],              /* Kakehashi up to Thunder Shelf  */
	[[430,248],[404,268],[372,288],[350,304]]     /* Kakehashi down to Tidecall     */
];
var ISLANDS = [KOGARASHI, HINODE, SHIOMI, TSUKI];

var RIDGES = [
	{x:84,y:72,r:44,h:1.00}, {x:112,y:52,r:32,h:0.72}, {x:70,y:112,r:30,h:0.66}, {x:132,y:40,r:24,h:0.52},
	{x:402,y:80,r:46,h:0.92,crater:true}, {x:456,y:162,r:24,h:0.70,shelf:true},
	{x:348,y:306,r:22,h:0.54}, {x:120,y:300,r:20,h:0.40}
];
/* Woodland. The first pass left large areas of plain green with nothing in
 * them, which reads as unfinished rather than as open country - real maps have
 * something everywhere. */
var FORESTS = [
	{x:108,y:152,r:34,haunted:true}, {x:162,y:72,r:22}, {x:96,y:252,r:30},
	{x:156,y:272,r:26}, {x:366,y:124,r:22}, {x:402,y:272,r:20}, {x:446,y:320,r:18},
	{x:150,y:300,r:26}, {x:112,y:300,r:22}, {x:186,y:264,r:18},
	{x:78,y:236,r:16},  {x:150,y:120,r:20}, {x:80,y:110,r:18},
	{x:352,y:160,r:18}, {x:420,y:132,r:16}, {x:452,y:100,r:14},
	{x:380,y:330,r:20}, {x:344,y:330,r:16}, {x:466,y:288,r:14}
];
var RIVERS = [
	[[96,96],[110,116],[118,136],[130,150],[136,164],[142,178]],
	[[120,222],[126,246],[120,268],[128,288],[134,306]],
	[[386,108],[372,128],[364,146]]
];
var ROUTES = [
		{n:1,path:[[62,290],[74,278],[86,272],[98,266]]},
		{n:2,path:[[98,266],[116,264],[134,264],[148,262]]},
		{n:3,path:[[148,262],[160,254],[176,248]]},
		{n:4,path:[[98,266],[92,248],[88,230],[86,214]]},
		{n:5,path:[[148,262],[152,286],[146,304],[140,318]]},
		{n:6,path:[[118,178],[116,166],[112,150]]},
		{n:7,path:[[112,150],[130,136],[146,120],[170,70]]},
		{n:8,path:[[112,150],[102,130],[96,114],[84,72]]},
		{n:9,path:[[170,70],[156,62],[142,52],[122,46]]},
		{n:10,path:[[360,134],[374,110],[398,96]]},
		{n:11,path:[[398,96],[416,114],[432,132],[456,154]]},
		{n:12,path:[[398,96],[422,56],[440,54]]},
		{n:13,path:[[350,304],[372,318],[394,330],[432,332]]},
		{n:14,path:[[350,304],[352,276],[366,264]]}
	];
var GRASS_PATCHES = [
	[86,270,16,7],[120,262,20,8],[160,252,12,7],[90,238,9,12],[150,296,10,12],[116,168,9,10],[134,132,16,9],
	[100,120,10,12],[150,58,16,8],[372,112,14,8],[420,122,12,14],[424,60,16,7],[378,322,18,9],[356,278,11,12],
	[64,300,12,8],[176,282,12,8],[196,120,10,9],[360,150,12,8]
];

/* Every place, once: the map draws from this and so does the panel.
 *
 * `hook` is deliberate empty space. An evil team is coming later, and a team
 * needs somewhere to be - a warehouse nobody checks, a works that runs at
 * night, a lighthouse with a good view of the shipping. These are written as
 * places that are already slightly wrong, so when the team arrives it looks
 * like it was always there rather than dropped in.
 */
var PLACES = [
	{ id:'sakura', box:[34,26], name:'Sakura Town', x:62, y:290, island:'Hinode', tier:'ZU', kind:'town',
	  blurb:'A shrine, a slope of blossom, the lab, and the last quiet place before the road. Where every trainer starts.',
	  facts:['Pokemon Centre','Professor\'s lab','Mart','No gym','Rail south terminus'],
	  chans:['#poke-center','#sakura-lab','#sakura-square','#shrine-steps','#sakura-mart','#blossom-road','#the-old-well','#sakura-houses'],
	  catch:['Normal','Bug','Flying','Grass'],
	  doing:['Pick a starter at the lab','Heal at the Centre','Buy your first balls','Take the rail north','Leave an offering at the shrine'],
	  live:['#poke-center','#sakura-lab','#shrine-steps'] },
	{ id:'station', box:[30,22], name:'Kagura Station', x:98, y:266, island:'Hinode', tier:'ZU-PU', kind:'town',
	  blurb:'The hub the island hangs off. Rail south to Sakura, roads east to the harbour and north to the coast.',
	  facts:['Rail hub','Station market','Freight yard','No gym'],
	  chans:['#train-station','#platform-two','#ticket-hall','#station-market','#freight-yard','#lost-property'],
	  catch:['Normal','Flying','Steel','Electric'],
	  doing:['Take the rail south','Trade at the station market','Buy supplies','Look at the freight yard and mind your business'],
	  live:['#train-station','#platform-two'],
	  hook:'The freight yard takes containers nobody at the station has paperwork for. They go out by sea.' },
	{ id:'amber', box:[34,24], name:'Amber Fields', x:148, y:262, island:'Hinode', tier:'PU', kind:'gym', gym:'GYM 2 - GRASS',
	  blurb:'Farm country - hedgerows, barley, ploughed rows. The gym is a glasshouse and the leader is whoever is winning the harvest.',
	  facts:['Gym 2 - Grass','Farm shop','Mill pond','Barns'],
	  chans:['#the-fields','#glasshouse-gym','#farm-shop','#mill-pond','#the-barns','#scarecrow-lane'],
	  catch:['Grass','Bug','Ground','Normal'],
	  doing:['Challenge the Grass gym','Buy produce at the farm shop','Fish the mill pond','Help with the harvest'],
	  live:[] },
	{ id:'minato', box:[36,26], name:'Minato Harbour', x:176, y:248, island:'Hinode', tier:'PU', kind:'gym', gym:'GYM 1 - WATER',
	  blurb:'Ferries, fish, and a gym built into the sea wall. Everything that leaves the island leaves from here.',
	  facts:['Gym 1 - Water','Pokemon Centre','Mart','Ferry terminal','Breakwater','Warehouse row'],
	  chans:['#docks','#ferry-terminal','#fish-market','#harbour-mart','#harbour-gym','#poke-center-minato','#the-breakwater','#warehouse-row','#harbour-inn'],
	  catch:['Water','Flying','Poison','Normal'],
	  doing:['Challenge the Water gym','Take a ferry anywhere','Buy at the fish market','Heal at the Centre','Fish off the breakwater'],
	  live:[],
	  hook:'Warehouse row: five sheds, four tenants, and one that pays in cash and ships at night.' },
	{ id:'victory', box:[26,20], name:'Victory Road', x:122, y:46, island:'Kogarashi', tier:'UBER',
	  kind:'peak', gate:'8 BADGES / FLASH',
	  blurb:'Not one road and not one cave. A whole mountain you climb: a badge gate at the foot of it, then open cliff paths, rope bridges and a chain of caves that keep putting you back outside a little higher up. The League sits at the top, in sight for most of the way, which is the cruelty of the thing.',
	  facts:['Badge gate at the foot - eight or turn around','Half outdoors, half cave','Flash, and bring a spare','The League is in sight for most of the climb','One way out, and it is forward'],
	  catch:['Rock','Ground','Dragon','Fighting'],
	  doing:['Show the warden eight badges at the gatehouse','Take the cliff paths between caves',
	         'Cross the rope bridges','Fight everyone who waited up here for you'],
	  chans:['#victory-gatehouse','#the-lower-slopes','#first-cave','#the-cliff-path','#rope-bridges','#second-cave','#final-climb'],
	  live:[],
	  hook:'The warden checks badges. He does not check what you are carrying.' },

	{ id:'league', box:[24,18], name:'Kagura League', x:154, y:34, island:'Kogarashi', tier:'UBER',
	  kind:'town', gym:'ELITE FOUR',
	  blurb:'A plateau above the cloud line, reached through Victory Road or not at all. Four halls in a row and a fifth door at the end of them, and you may not go back through a door once it closes.',
	  facts:['Four halls, then the Champion','No backing out once you start',
	         'Centre and Mart at the lobby','Hall of Fame records everything'],
	  catch:['Psychic','Dragon','Steel','Ice'],
	  doing:['Heal and stock up, seriously','Take the four halls in order',
	         'Challenge the Champion','Get recorded in the Hall of Fame'],
	  chans:['#league-lobby','#league-centre','#league-mart','#hall-the-first','#hall-the-second',
	         '#hall-the-third','#hall-the-fourth','#champions-chamber','#hall-of-fame'],
	  live:[],
	  hook:'Team Abyssal have never once been seen here. That is itself strange.' },

	{ id:'harefield', box:[30,22], name:"Hare's Meadow", x:168, y:286, island:'Hinode', tier:'ZU', kind:'wild',
	  blurb:'Open hay meadow south of the farms, cut once a year and left alone the rest of it. Waist-high by midsummer and full of things that would rather you did not notice them.',
	  facts:['Tall grass everywhere','Cut in late summer','Nothing dangerous lives here','Good first catching ground'],
	  catch:['Normal','Bug','Grass','Flying'],
	  doing:['Catch your first properly','Practise in low stakes','Lose a whole afternoon'],
	  chans:['#hares-meadow','#the-long-grass'], live:[] },

	{ id:'windbreaks', box:[26,24], name:'The Windbreaks', x:70, y:238, island:'Hinode', tier:'ZU', kind:'wild',
	  blurb:'Lines of old trees planted to stop the sea wind taking the topsoil, with sheltered strips of scrub between them. Everything on this coast lives in the lee of something.',
	  facts:['Shelter belts and hedgerow','Windy on the seaward side','Quiet, and stays quiet'],
	  catch:['Normal','Flying','Bug'],
	  doing:['Walk the shelter belts','Watch the coast from cover','Forage the hedgerows'],
	  chans:['#the-windbreaks','#hedgerow-walk'], live:[] },

	{ id:'saltmarsh', box:[30,20], name:'Saltmarsh Flats', x:132, y:320, island:'Hinode', tier:'PU', kind:'wild',
	  blurb:'Where the southern rivers give up and spread out. Half land and half water depending on the hour, cut through with creeks that are deeper than they look.',
	  facts:['Floods with the tide','Creeks are deeper than they look','Boots, not shoes','Birds everywhere at dusk'],
	  catch:['Water','Ground','Poison','Flying'],
	  doing:['Wade the creeks','Watch the evening flights','Get stuck and learn from it'],
	  chans:['#saltmarsh-flats','#the-creeks'], live:[] },

	{ id:'pinewood', box:[30,26], name:'The Pinewood', x:168, y:118, island:'Kogarashi', tier:'NU', kind:'wild',
	  blurb:'Working forest on the eastern slope, planted in rows a long time ago and gone its own way since. Dark at ground level, quiet, and easy to lose your bearings in.',
	  facts:['Planted, then abandoned','Dark underneath','Sound does not carry','Not the haunted one'],
	  catch:['Bug','Grass','Flying','Fighting'],
	  doing:['Follow the old planting rows','Train where nobody is watching','Keep track of which way is down'],
	  chans:['#the-pinewood','#planting-rows'], live:[] },

	{ id:'heath', box:[32,24], name:'Kogarashi Heath', x:96, y:110, island:'Kogarashi', tier:'RU', kind:'wild',
	  blurb:'Above the tree line and below the snow: heather, bare rock and wind with nothing to stop it. The ground between the woods and the mountain, and harder than either looks.',
	  facts:['Exposed in every weather','Heather and bare rock','Between the woods and the climb','Colder than it looks'],
	  catch:['Rock','Flying','Ice','Ground'],
	  doing:['Cross toward the mountain','Shelter behind the tors','Train in bad weather on purpose'],
	  chans:['#kogarashi-heath','#the-tors'], live:[] },

	{ id:'ashfields', box:[32,22], name:'The Ashfields', x:362, y:170, island:'Shiomi', tier:'RU', kind:'wild',
	  blurb:'Everything the volcano has thrown west, gone soft over the years and grown over in patches. Grey underfoot, startlingly green wherever anything took root.',
	  facts:['Ash over old lava','Green in patches, bare in others','Warm ground in places','Nothing drains here'],
	  catch:['Fire','Ground','Rock','Poison'],
	  doing:['Cross the flats','Find the warm ground','Dig where the ash is deep'],
	  chans:['#the-ashfields','#warm-ground'], live:[] },

	{ id:'barrens', box:[28,22], name:'Sulphur Barrens', x:440, y:96, island:'Shiomi', tier:'UU', kind:'wild',
	  blurb:'Yellow ground, standing steam and water you would not drink. The north-east corner of Shiomi, which nobody farms and nobody settles, for reasons that announce themselves.',
	  facts:['Steam vents and sulphur','Water is not drinkable','Smells exactly as expected','Nobody lives here'],
	  catch:['Poison','Fire','Ground','Steel'],
	  doing:['Pick your way between the vents','Collect what grows here','Do not camp'],
	  chans:['#sulphur-barrens','#the-vents-north'], live:[] },

	{ id:'palmlands', box:[34,24], name:'The Palmlands', x:396, y:284, island:'Tsuki', tier:'UU', kind:'wild',
	  blurb:'The green middle of Tsuki: palm and broadleaf over soft ground, hot and loud and thick enough that the paths are the only sensible way through.',
	  facts:['Thick growth, few paths','Hot and loud','Rains most afternoons','Everything is bigger here'],
	  catch:['Grass','Bug','Water','Flying'],
	  doing:['Stay on the paths','Listen before you walk','Shelter from the afternoon rain'],
	  chans:['#the-palmlands','#the-green-middle'], live:[] },

	{ id:'dunes', box:[28,20], name:'Windward Dunes', x:458, y:300, island:'Tsuki', tier:'OU', kind:'wild',
	  blurb:'The exposed eastern shore, where the dunes move a little every year and the sea arrives with nothing in its way. The last easy ground before the grotto.',
	  facts:['The dunes move','Full force of the eastern sea','Last open ground before the grotto','Strong trainers come here'],
	  catch:['Water','Ground','Flying','Dark'],
	  doing:['Walk the dune line','Train against the wind','Watch the grotto tide from above'],
	  chans:['#windward-dunes','#the-dune-line'], live:[] },

	{ id:'watari', box:[10,16], name:'Watari Bridge', x:118, y:196, island:'Kagura Strait', tier:'PU',
	  kind:'landmark',
	  blurb:'The only way north on foot. A long timber span on stone piers, with a toll house at the southern end that has not collected a toll in years. Everyone crossing to the woods crosses here, and most of them come back.',
	  facts:['Only land route between Hinode and Kogarashi','Toll house, unstaffed','Fishing off the deck','Nothing crosses at night if it can help it'],
	  catch:['Water','Flying','Ghost'],
	  doing:['Cross north to Kogarashi','Fish from the span','Read the notices nailed to the toll house',
	         'Wait for someone braver'],
	  chans:['#watari-bridge','#the-toll-house','#under-the-span'],
	  live:[],
	  hook:'The toll house keeps a ledger. Somebody is still writing in it.' },

	{ id:'kakehashi', box:[10,20], name:'Kakehashi Bridge', x:434, y:216, island:'Kagura Strait', tier:'UU',
	  kind:'landmark',
	  blurb:'A single enormous span across the eastern strait, high enough for ships and exposed enough that it closes in weather. Two miles of deck with nothing either side but wind and a long drop.',
	  facts:['Shiomi to Tsuki, the long way over','Closes in a storm','No shelter anywhere on it','Watch the cables'],
	  catch:['Flying','Steel','Water'],
	  doing:['Cross to Tsuki','Turn back if the wind gets up','Look down, briefly'],
	  chans:['#kakehashi-bridge','#the-north-tower','#the-south-tower'],
	  live:[],
	  hook:'The maintenance crews stopped coming out and nobody replaced them.' },

	{ id:'ghost', box:[44,34], name:'Ghost Woods', x:112, y:150, island:'Kogarashi', tier:'NU', kind:'gym', gym:'GYM 3 - GHOST',
	  blurb:'A forest that grew over something. The paths move, the light is wrong, and the gym is not a building - it is a clearing that keeps being found.',
	  facts:['Gym 3 - Ghost','Lanterns nobody admits to lighting','Paths that do not stay put'],
	  chans:['#the-treeline','#deep-woods','#lantern-clearing','#woods-gym','#the-shrine-ruin','#where-the-paths-move'],
	  catch:['Ghost','Dark','Poison','Grass'],
	  doing:['Challenge the Ghost gym, if you can find it','Light a lantern','Get lost on purpose','Do not go in alone'],
	  live:[],
	  hook:'Something under the woods is older than the woods.' },
	{ id:'castle', box:[28,24], name:'N\'s Castle', x:170, y:70, island:'Kogarashi', tier:'RU', kind:'gym', gym:'GYM 4 - PSYCHIC',
	  blurb:'Sunk to its second floor in the hillside, doors open, nobody in charge. Whatever the last arc left in it is still in it.',
	  facts:['Gym 4 - Psychic','Library','Undercroft','Nobody owns it'],
	  chans:['#castle-gate','#throne-room','#library','#undercroft','#the-battlements','#kings-quarters'],
	  catch:['Psychic','Dark','Steel','Ghost'],
	  doing:['Challenge the Psychic gym','Read in the library','Explore the undercroft','Take something you should not'],
	  live:[],
	  hook:'An empty castle with working doors is an invitation.' },
	{ id:'silver', box:[40,34], name:'Mt. Silver', x:84, y:72, island:'Kogarashi', tier:'OU-UBER', kind:'peak', gate:'CLIMB / FLASH',
	  blurb:'The foothills are a walk. Above the tree line is a climb, and the cave inside is dark enough that people have been lost in it.',
	  facts:['Climb above the tree line','Flash inside the cave','Highest tier in the region','A climbers\' hut, sometimes occupied'],
	  chans:['#foothills','#peak','#silver-cave','#the-ice-shelf','#climbers-hut'],
	  catch:['Ice','Rock','Fighting','Dragon'],
	  doing:['Climb above the tree line','Bring Flash for the cave','Shelter in the climbers hut','Find whoever trains at the peak'],
	  live:['#peak'] },
	{ id:'ember', box:[36,26], name:'Ember Hollow', x:398, y:96, island:'Shiomi', tier:'UU', kind:'gym', gym:'GYM 5 - FIRE',
	  blurb:'A town inside a dead caldera, built on the warm side of the rock. The ash makes the soil good and the weather strange.',
	  facts:['Gym 5 - Fire','Pokemon Centre','Mart','Hot springs','Obsidian works'],
	  chans:['#caldera-town','#ash-flats','#ember-gym','#poke-center-ember','#ember-mart','#hot-springs','#the-vents','#obsidian-works'],
	  catch:['Fire','Ground','Rock','Poison'],
	  doing:['Challenge the Fire gym','Soak in the hot springs','Heal at the Centre','Ask why the works runs at night'],
	  live:[],
	  hook:'The obsidian works runs a night shift and sells to nobody local - the lorries go to the harbour.' },
	{ id:'shelf', box:[24,20], name:'Thunder Shelf', x:456, y:154, island:'Shiomi', tier:'UU', kind:'gym', gym:'GYM 6 - ELECTRIC', gate:'CLIMB',
	  blurb:'A cliff terrace that catches every storm crossing the strait. The gym is up there because the weather is up there.',
	  facts:['Gym 6 - Electric','Climb for the last stretch','Pylons that hum'],
	  chans:['#storm-watch','#shelf-gym','#cliff-stairs','#the-pylons'],
	  catch:['Electric','Flying','Steel','Rock'],
	  doing:['Challenge the Electric gym','Climb the cliff stairs','Watch a storm come in','Do not touch the pylons'],
	  live:[] },
	{ id:'cinder', box:[26,16], name:'Cinder Row', x:360, y:134, island:'Shiomi', tier:'RU', kind:'town',
	  blurb:'Twelve houses, one shop, downwind of the caldera. Everyone knows the ferry timetable by heart.',
	  facts:['A shop','A jetty','No gym','Ash on everything'],
	  chans:['#cinder-row','#row-shop','#the-jetty'],
	  catch:['Fire','Water','Rock','Normal'],
	  doing:['Buy from the one shop','Fish off the jetty','Catch the ferry','Listen to what the locals will not say'],
	  live:[] },
	{ id:'tidecall', box:[30,24], name:'Tidecall Town', x:350, y:304, island:'Tsuki', tier:'UU', kind:'gym', gym:'GYM 7 - ROCK',
	  blurb:'Built among sea stacks the tide runs through twice a day. The gym is cut into one of them.',
	  facts:['Gym 7 - Rock','Pokemon Centre','Mart','Causeway, twice a day'],
	  chans:['#the-stacks','#tidecall-gym','#poke-center-tsuki','#tidecall-mart','#the-causeway','#stilt-houses'],
	  catch:['Rock','Water','Ground','Flying'],
	  doing:['Challenge the Rock gym','Cross the causeway at low tide','Heal at the Centre','Get caught out by the tide'],
	  live:[] },
	{ id:'grotto', box:[26,22], name:'Moonlit Grotto', x:432, y:332, island:'Tsuki', tier:'OU', kind:'gym', gym:'GYM 8 - DARK', gate:'FLASH',
	  blurb:'A sea cave the tide empties twice a day. The mouth is a walk; the gym is further in than most people go.',
	  facts:['Gym 8 - Dark','Flash for the deep part','The last badge','Floods on schedule'],
	  chans:['#grotto-mouth','#deep-grotto','#grotto-gym','#the-tide-gate'],
	  catch:['Dark','Water','Ghost','Poison'],
	  doing:['Challenge the Dark gym for the eighth badge','Bring Flash','Time it against the tide','Find the tide gate controls'],
	  live:[] },
	{ id:'shoal', box:[34,22], name:'Coral Shoal', x:402, y:312, island:'Tsuki', tier:'UU-OU', kind:'water', gate:'DIVE',
	  blurb:'Warm water over a reef, and a drop-off at the edge of it that goes down further than the map bothers to say.',
	  facts:['Dive at the drop-off','Tide pools','No gym'],
	  chans:['#the-reef','#drop-off','#tide-pools','#the-shallows'],
	  catch:['Water','Ice','Psychic','Fairy'],
	  doing:['Dive at the drop-off','Search the tide pools','Swim the lagoon','See how deep it really goes'],
	  live:[] },
	{ id:'beacon', box:[20,20], name:'Beacon Rock', x:250, y:66, island:'Open sea', tier:'-', kind:'landmark', gate:'SURF',
	  blurb:'A lighthouse on a rock, and the only Pokemon Centre that is not in a town - so Surf buys you a Fly anchor in the middle of the sea.',
	  facts:['Pokemon Centre','Surf to reach','Fly anchor','Sees every ship that passes'],
	  chans:['#beacon-rock','#the-light','#keepers-room'],
	  catch:['Water','Flying','Ice'],
	  doing:['Heal in the middle of the sea','Set a Fly anchor','Talk to the keeper','Surf on from here'],
	  live:[],
	  hook:'Whoever keeps the light knows which boats cross at night, and has stopped writing them down.' },
	{ id:'aether', box:[26,20], name:'Aether Paradise', x:246, y:176, island:'Open sea', tier:'-', kind:'station',
	  blurb:'An artificial island in the middle of the archipelago that answers to nobody on the map. Every ferry calls there, which is either convenient or deliberate.',
	  facts:['Every ferry stops here','Outside the region','Not yours','Labs you are not shown'],
	  chans:['#aether-dock','#conservation-wing','#labs','#observation-deck'],
	  catch:['Psychic','Steel','Fairy'],
	  doing:['Change ferries','Tour the conservation wing','See how far in they let you','Notice which doors do not open'],
	  live:[],
	  hook:'A private island in the middle of everyone\'s route is a plot waiting to be used.' },
	{ id:'bell', box:[20,16], name:'The Sunken Bell', x:286, y:214, island:'Open sea', tier:'UBER', kind:'water', gate:'DIVE',
	  blurb:'Whatever is under the shoal. Nothing on the surface marks it, which is the point of putting it on a map.',
	  facts:['Dive only','Nothing marks it','Uber'],
	  chans:['#sunken-bell','#the-bell-chamber'],
	  catch:['Water','Steel','Ghost','Dragon'],
	  doing:['Dive to reach it','Read the carvings','Ring it and find out','Nothing good'],
	  live:[],
	  hook:'Team Abyssal did not sink the bell, but they know who did.' },

	/*
	 * The base has no name on the map because nobody who draws maps has been
	 * inside it. It sits off the coast rather than under a town: far enough
	 * out that getting there is already a decision, close enough that what
	 * happens in it reaches the harbour.
	 */
	{ id:'abyss', box:[22,16], name:'Abyss Headquarters', x:236, y:296, island:'Open sea',
	  tier:'UBER', kind:'water', gate:'DIVE',
	  blurb:'Charted as a depth anomaly and nothing else. Dive on it and there is a structure down there - lit, powered, and not on anyone\'s register.',
	  facts:['Dive only','Not named on any chart','Lights are on','Team Abyssal command'],
	  chans:['#the-anomaly','#pressure-lock','#abyssal-base','#the-hatch','#cold-corridor'],
	  catch:['Water','Dark','Steel','Poison'],
	  doing:['Dive to reach it','Get through the pressure lock','Find out what Team Abyssal is doing','Leave before they notice'],
	  live:[],
	  hook:'Team Abyssal. Everything that has been slightly wrong on this map runs back to here.' }
];


/*
 * Routes, as places rather than as lines.
 *
 * A numbered dot on a map tells you a road exists. It does not tell you what
 * is on it, which is the only thing a player actually wants to know before
 * walking down it. So every route carries the same payload a town does -
 * what you meet, what there is to do, which channel it is - and clicking one
 * opens the same panel.
 */
var ROUTE_INFO = {
	1:  { name:'Route 1',  from:'Sakura Town', to:'Kagura Station', tier:'ZU', walk:'Easy',
	      blurb:'Coastal meadow, hedges, a plank bridge. The first road anyone walks.',
	      catch:['Normal','Bug','Flying'], doing:['Catch your first','Cross the plank bridge','Read the signpost'] },
	2:  { name:'Route 2',  from:'Kagura Station', to:'Amber Fields', tier:'ZU-PU', walk:'Easy',
	      blurb:'A cart track between hedgerows and barley, telegraph poles all the way.',
	      catch:['Normal','Bug','Grass'], doing:['Battle the farmhands','Search the verges'] },
	3:  { name:'Route 3',  from:'Amber Fields', to:'Minato Harbour', tier:'PU', walk:'Easy',
	      blurb:'The land drops to the sea and the track turns to cobbles.',
	      catch:['Flying','Normal','Water'], doing:['Take the cliff steps','First sight of the harbour'] },
	4:  { name:'Route 4',  from:'Kagura Station', to:'the north shore', tier:'PU', walk:'Dead end',
	      blurb:'Dunes and scrub to a shingle beach with a wrecked boat on it.',
	      catch:['Ground','Flying','Water'], doing:['Search the wreck','Nothing else - it is a dead end'] },
	5:  { name:'Route 5',  from:'Amber Fields', to:'the south beach', tier:'PU', walk:'Easy',
	      blurb:'Orchard, then meadow, then dunes and a long beach.',
	      catch:['Bug','Grass','Water'], doing:['Mind the bees','Swim','Beachcomb'] },
	6:  { name:'Route 6',  from:'the lowlands', to:'Ghost Woods', tier:'NU', walk:'Getting dark',
	      blurb:'Ordinary woodland that stops being ordinary about halfway along.',
	      catch:['Bug','Grass','Ghost'], doing:['Turn back while you can','Note where the mist starts'] },
	7:  { name:'Route 7',  from:'Ghost Woods', to:"N's Castle", tier:'RU', walk:'Exposed',
	      blurb:'A ridge path out of the trees, standing stones, heather, towers ahead.',
	      catch:['Rock','Psychic','Flying'], doing:['Count the standing stones','Battle on the ridge'] },
	8:  { name:'Route 8',  from:'Ghost Woods', to:'Mt. Silver foothills', tier:'RU', walk:'Climbing',
	      blurb:'Pine forest rising, with a cold stream and stepping stones across it.',
	      catch:['Bug','Grass','Water'], doing:['Cross the stepping stones','Fish the stream'] },
	9:  { name:'Route 9',  from:"N's Castle", to:'the high pass', tier:'OU', walk:'CLIMB',
	      blurb:'Scree, old snow, a ledge trail with a rope line and a long way down.',
	      catch:['Ice','Rock','Flying'], doing:['Use the handline','Do not stop on the ledge'] },
	10: { name:'Route 10', from:'Cinder Row', to:'Ember Hollow', tier:'RU', walk:'Boardwalk',
	      blurb:'Ash flats and lava rock, crossed on a boardwalk that has seen better days.',
	      catch:['Fire','Ground','Rock'], doing:['Stay on the planks','Watch the vents'] },
	11: { name:'Route 11', from:'Ember Hollow', to:'Thunder Shelf', tier:'UU', walk:'CLIMB',
	      blurb:'Basalt terraces like stairs, with the first pylon at the top.',
	      catch:['Rock','Electric','Fire'], doing:['Climb the terraces','Shelter before the storm'] },
	12: { name:'Route 12', from:'the north coast', to:'Cinder Row', tier:'RU', walk:'Easy',
	      blurb:'Black sand, sea stacks, driftwood, ash drifting over everything.',
	      catch:['Water','Rock','Flying'], doing:['Beachcomb','Fish the stacks'] },
	13: { name:'Route 13', from:'Tidecall Town', to:'Moonlit Grotto', tier:'UU', walk:'Tidal',
	      blurb:'Rock shelves and tide pools, part-bridged by a walkway missing sections.',
	      catch:['Water','Rock','Poison'], doing:['Cross before the tide turns','Search the pools'] },
	14: { name:'Route 14', from:'Tidecall Town', to:'the northern headland', tier:'UU', walk:'Exposed',
	      blurb:'A headland with sea on both sides and a land bridge at its narrowest.',
	      catch:['Flying','Water','Rock'], doing:['Cross the land bridge','Watch the nesting cliffs'] }
};


/*
 * The picture shown in the side panel for a location. Separate from OVERLAYS,
 * which paints art onto the map itself - a location can have either, both or
 * neither, and anything without one falls back to a placeholder rather than a
 * broken frame.
 */

/*
 * Built structures that span open ground: bridges, the rail line, ferry lanes.
 *
 * These were hardcoded in the renderer, which meant the map drew two large
 * bridges that no one could click and nothing named - a structure on a map that
 * cannot be asked about is just decoration. They live here now, and the ones
 * worth visiting are places in PLACES as well.
 */
var BRIDGES = [
	{ a:[120,190], b:[116,202] },   /* Watari: Hinode to Kogarashi   */
	{ a:[438,188], b:[430,248] }    /* Kakehashi: Shiomi to Tsuki    */
];
var RAIL = [[62,286],[74,278],[86,272],[98,266]];
var FERRIES = [
	[[190,256],[216,224],[236,196]],
	[[128,186],[176,182],[214,178]],
	[[336,110],[300,140],[268,166]],
	[[334,300],[300,244],[270,200]]
];

var ART = {
	aether: 'aether-paradise.png'
};


var PLANS = {
	sakura: { streets: [[[-16,4],[15,4]], [[-2,4],[-2,-11]]],
		b: [['centre',-15,-8],['lab',1,-10],['mart',9,6],['house',-14,7],['house',-4,7],['house',8,-7]] },
	station: { streets: [[[-14,2],[14,2]], [[0,2],[0,-9]]],
		b: [['station',-13,-7],['mart',6,4],['house',-12,6],['house',-2,6],['house',9,-8]] },
	amber: { streets: [[[-16,2],[15,2]]],
		b: [['gym',-9,-9],['house',-15,5],['house',-5,5],['house',6,5],['mart',9,-8],['crop',-14,9,28,7]] },
	minato: { streets: [[[-17,0],[16,0]], [[4,0],[4,11]]],
		b: [['gym',-16,-10],['centre',3,-10],['mart',-13,3],['house',-2,3],['house',8,3],['pier',10,9],['pier',10,13]] },
	ghost: { streets: [],
		b: [['torii',-2,-2],['house',-14,6],['house',10,8],['lantern',-12,-8],['lantern',8,-6],['lantern',0,10]] },
	castle: { streets: [[[-6,12],[-6,2]]],
		b: [['castle',-12,-9],['house',8,6],['house',-14,8]] },
	silver: { streets: [], b: [['cave',0,0],['house',12,10]] },
	ember: { streets: [[[-15,3],[15,3]]],
		b: [['gym',-15,-8],['centre',2,-8],['mart',-10,6],['house',2,6],['house',11,6]] },
	shelf: { streets: [[[-9,4],[9,4]]], b: [['gym',-9,-7],['house',3,6]] },
	cinder: { streets: [[[-12,3],[12,3]]],
		b: [['house',-12,-5],['house',-3,-5],['house',6,-5],['mart',-3,6]] },
	tidecall: { streets: [[[-13,2],[13,2]]],
		b: [['gym',-13,-9],['centre',2,-9],['mart',-9,5],['house',4,5]] },
	grotto: { streets: [], b: [['cave',2,-2],['house',-10,5],['house',9,7]] },
	shoal: { streets: [], b: [['reef',0,0]] },
	beacon: { streets: [], b: [['lighthouse',-3,4],['centre',-12,-2]] },
	aether: { streets: [], b: [['aether',0,0]] },
	bell: { streets: [], b: [['dive',0,0]] },
	abyss: { streets: [], b: [['dive',0,0]] },
	victory: { streets: [], b: [['cave',0,0]] },
	league: { streets: [[[-9,4],[9,4]]], b: [['gym',-9,-7],['centre',3,-8]] }
};



	/*
	 * The gyms, as their own rooms.
	 *
	 * A town page tells you a gym is there; it does not let you look inside,
	 * which is the bit anyone actually wants. Each entry is the indoor view: the
	 * badge on the line, the puzzle standing between you and the leader, and the
	 * art id for the interior. Leaders are deliberately blank - casting them is
	 * not the map's job.
	 */
	var GYMS = {
		minato:   { no:1, type:'Water',    badge:'Tide Badge',     leader:'',
		            puzzle:'Sluice gates and floating platforms. Open the right channels and the route across appears.' },
		amber:    { no:2, type:'Grass',    badge:'Harvest Badge',  leader:'',
		            puzzle:'A hedge maze under glass. Simple to see from above, less so from inside it.' },
		ghost:    { no:3, type:'Ghost',    badge:'Lantern Badge',  leader:'',
		            puzzle:'The lit lanterns mark the only path that stays where you left it.' },
		castle:   { no:4, type:'Psychic',  badge:'Crown Badge',    leader:'',
		            puzzle:'Teleport pads in a stone hall. Step wrong and you begin again at the door.' },
		ember:    { no:5, type:'Fire',     badge:'Caldera Badge',  leader:'',
		            puzzle:'Retractable bridges over live lava, each on its own switch. Plan the whole crossing first.' },
		shelf:    { no:6, type:'Electric', badge:'Storm Badge',    leader:'',
		            puzzle:'Electric barriers and lever switches. Every lever you throw closes something else.' },
		tidecall: { no:7, type:'Rock',     badge:'Stack Badge',    leader:'',
		            puzzle:'Boulders in grooved tracks. Push them the wrong way and they do not come back.' },
		grotto:   { no:8, type:'Dark',     badge:'Moonless Badge', leader:'',
		            puzzle:'You can only see where the light falls, and the light does not fall on the whole route.' }
	};


	/*
	 * A palette per island, so the four landmasses do not read as one shape
	 * stamped out four times: Kogarashi is cool and forested, Hinode is warm
	 * farmland, Shiomi is dulled by volcanic ash, Tsuki is bright and tropical
	 * with paler sand.
	 */
	var BIOMES = [
		{ g0:[ 84,150, 86], g1:[122,186,110], s0:[214,196,150], s1:[232,216,176] },  /* Kogarashi */
		{ g0:[112,184, 82], g1:[164,214,106], s0:[230,208,148], s1:[244,228,178] },  /* Hinode    */
		{ g0:[104,150, 74], g1:[146,180, 96], s0:[188,176,156], s1:[212,200,178] },  /* Shiomi    */
		{ g0:[ 96,190,104], g1:[152,222,132], s0:[240,224,180], s1:[250,240,208] }   /* Tsuki     */
	];

	/* Inland water. Carved after the coastline so the shore noise cannot fill
	   them in, which is what happened the first time. */
	var LAKES = [
		{ x:120, y: 96, r: 9 },    /* tarn below the Mt. Silver snowline */
		{ x:150, y:252, r: 7 },    /* the mill pond at Amber Fields      */
		{ x: 96, y:274, r: 6 },    /* reservoir west of the station      */
		{ x:404, y: 62, r: 5 },    /* crater pool above Ember Hollow     */
		{ x:432, y:296, r: 6 }     /* still water behind the Tsuki reef  */
	];


	/*
	 * The sea floor.
	 *
	 * Three of this region's locations are underwater and until now the map drew
	 * them as markers on flat blue, which tells a reader nothing. If a place
	 * exists, the map should show the ground it sits on - so the shelf, the
	 * reef, the drop-off and the trench are all real features here, and the
	 * water is coloured by what is under it rather than by distance from shore
	 * alone.
	 *
	 * lift raises the sea bed towards the surface (paler water); a negative lift
	 * is a trench. Radius is where the effect fades out entirely.
	 */
	var SEABED = [
		{ x:402, y:312, r:46, lift: 30, kind:'reef'  },   /* Coral Shoal        */
		{ x:436, y:316, r:26, lift:-46, kind:'drop'  },   /* the drop-off       */
		{ x:286, y:214, r:34, lift: 16, kind:'bank'  },   /* bank round the bell*/
		{ x:286, y:214, r:12, lift:-30, kind:'bell'  },   /* the bell pit       */
		{ x:236, y:296, r:40, lift: 12, kind:'shelf' },   /* the base sits on it*/
		{ x:236, y:296, r:15, lift:-20, kind:'base'  },   /* cut into the shelf */
		{ x:262, y:252, r:60, lift:-52, kind:'trench'},   /* the deep between   */
		{ x:250, y:68,  r:26, lift: 22, kind:'bank'  },   /* around Beacon Rock */
		{ x:246, y:176, r:22, lift: 14, kind:'bank'  }    /* Aether's footings  */
	];


	/*
	 * Art painted onto the map at world coordinates. Aether Paradise is built,
	 * not grown - no terrain generator produces a symmetrical steel platform -
	 * so it is drawn rather than generated.
	 */
	var OVERLAYS = [
		{ src:'aether-paradise.png', x:246, y:176, w:33, h:36 }
	];

	window.ATLAS_REGIONS = window.ATLAS_REGIONS || {};
	window.ATLAS_REGIONS.kagura = {
		id: 'kagura',
		name: 'Kagura',
		tagline: 'Four islands, eight badges, one road out.',
		art: 'art/kagura/',
		W: 512, H: 384,
		/* Where this region sits in the shared world. A second continent is
		   authored further east and the sea between is simply sea. */
		bounds: [0, 0, 512, 384],
		ISLANDS: ISLANDS, LAGOON: LAGOON, ISLETS: ISLETS, RIDGES: RIDGES,
		FORESTS: FORESTS, RIVERS: RIVERS, ROUTES: ROUTES, LINKS: LINKS,
		GRASS_PATCHES: GRASS_PATCHES, PLACES: PLACES, ROUTE_INFO: ROUTE_INFO,
		PLANS: PLANS, ART: ART, GYMS: GYMS, BRIDGES: BRIDGES, RAIL: RAIL, FERRIES: FERRIES, LAKES: LAKES, BIOMES: BIOMES, SEABED: SEABED, OVERLAYS: OVERLAYS,
		isles: [['KOGARASHI',128,8],['SHIOMI',402,6],['HINODE',96,366],['TSUKI',470,240]],
		seas:  [['KAGURA STRAIT',250,108],['THE OPEN SEA',60,176]]
	};
})();
