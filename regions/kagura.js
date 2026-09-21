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
/* Tokoyo, the far isle: alone in the southwest corner, as far from every coast as
   the map allows. A real island rather than an islet - hill, trees, shore. */
var TOKOYO = [[8,337],[17,324],[31,320],[44,329],[49,343],[46,360],[34,371],[18,369],[7,358]];
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

/* Tracks out to the optional places. Drawn as side trails, because that is
   exactly what they are - nothing here is on the way to anywhere else. */
var TRAILS = [
	[[176,248],[186,260],[190,274]],              /* Minato   -> Stables        */
	[[122,252],[126,236]],                        /* Route 2  -> Day Care       */
	{ path:[[98,122],[80,128],[64,132]], from:'r9' },  /* Route 9 -> Old Mine        */
	{ path:[[96,96],[120,94],[142,92]], from:'r9' },  /* Route 9 -> Standing Stones */
	[[142,92],[170,70]],                          /* stones   -> N's Castle     */
	[[360,134],[350,118],[344,104]],              /* Cinder   -> Ashen Onsen    */
	[[344,104],[346,80],[356,54]],                /* Onsen    -> Midori Jungle  */
	[[356,54],[368,62],[378,74]],                 /* Midori   -> Hinomiya Shrine*/
	[[444,146],[430,152],[420,158]],              /* Shelf    -> Observatory    */
	[[350,304],[352,326],[358,342]],              /* Tidecall -> Trainers' Hall */
	[[430,248],[440,256],[446,262]]               /* Kakehashi-> Driftwood Cove */
];
var ISLANDS = [KOGARASHI, HINODE, SHIOMI, TSUKI, TOKOYO];

var RIDGES = [
	{x:84,y:72,r:44,h:1.00}, {x:112,y:52,r:32,h:0.72}, {x:70,y:112,r:30,h:0.66}, {x:132,y:40,r:24,h:0.52},
	{x:402,y:80,r:46,h:0.92,crater:true}, {x:456,y:162,r:24,h:0.70,shelf:true},
	{x:348,y:306,r:22,h:0.54}, {x:120,y:300,r:20,h:0.40},
	{x:27,y:342,r:15,h:0.45}   /* Tokoyo's hill, the gate on top */
];
/* Woodland. The first pass left large areas of plain green with nothing in
 * them, which reads as unfinished rather than as open country - real maps have
 * something everywhere. */
var FORESTS = [
	{x:108,y:152,r:34,haunted:true}, {x:162,y:72,r:22}, {x:96,y:252,r:30},
	{x:156,y:272,r:26}, {x:366,y:124,r:22}, {x:402,y:272,r:20}, {x:446,y:320,r:18},
	{x:150,y:300,r:26}, {x:112,y:300,r:22}, {x:186,y:264,r:18},
	{x:78,y:236,r:16},  {x:150,y:120,r:20}, {x:80,y:110,r:18},
	{x:352,y:160,r:18}, {x:420,y:132,r:16}, {x:452,y:100,r:14}, {x:164,y:98,r:15},  /* the Pinewood itself */ {x:17,y:352,r:9}, {x:38,y:352,r:7},
	/* The lee side of the caldera: ash-rich soil and all the rain that
	   misses the rest of Shiomi, which makes a pocket of rainforest on an
	   island that is otherwise grey. */
	{x:356,y:54,r:26,jungle:true},
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
		{n:7,path:[[112,150],[130,136],[146,120],[170,70],[178,78],[184,84]]},
		{n:8,path:[[112,150],[102,130],[96,114],[84,72]]},
		{n:9,path:[[112,150],[98,122],[96,96],[108,66],[122,46]]},
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
	  facts:['Pokemon Centre','Professor\'s lab','Mart','No gym','Rail south terminus','An old ferry out to Tokoyo'],
	  chans:['#poke-center','#sakura-lab','#sakura-square','#shrine-steps','#sakura-mart','#blossom-road','#the-old-well','#sakura-houses','#sakura-beach','#sakura-ferry','#cynthias-house'],
	  catch:['Normal','Bug','Flying','Grass'],
	  doing:['Pick a starter at the lab','Heal at the Centre','Buy your first balls','Take the rail north','Leave an offering at the shrine'],
	  live:['#poke-center','#sakura-lab','#shrine-steps'] },
	{ id:'station', box:[30,22], name:'Kagura Station', x:98, y:266, island:'Hinode', tier:'ZU-PU', kind:'town',
	  blurb:'The hub the island hangs off. The line runs the width of Hinode - Sakura in the south-west, Amber Fields and Minato Harbour in the east - and the roads go north to the coast.',
	  facts:['Every train on Hinode calls here','Through service to Minato Harbour','Pokémon Centre','Station market','Freight yard','No gym'],
	  chans:['#train-station','#platform-two','#ticket-hall','#poke-center-station','#station-market','#freight-yard','#lost-property'],
	  catch:['Normal','Flying','Steel','Electric'],
	  doing:['Take the rail south to Sakura or east to the harbour','Heal at the Centre','Trade at the station market','Buy supplies','Look at the freight yard and mind your business'],
	  live:['#train-station','#platform-two'],
	  hook:'The freight yard takes containers nobody at the station has paperwork for. They go out by sea.' },
	{ id:'amber', box:[34,24], name:'Amber Fields', x:148, y:262, island:'Hinode', tier:'PU', kind:'gym', gym:'GRASS GYM',
	  blurb:'Farm country - hedgerows, barley, ploughed rows. The gym is a glasshouse and the leader is whoever is winning the harvest.',
	  facts:['Grass Gym','Farm shop','Mill pond','Barns'],
	  chans:['#the-fields','#glasshouse-gym','#farm-shop','#mill-pond','#the-barns','#scarecrow-lane'],
	  catch:['Grass','Bug','Ground','Normal'],
	  doing:['Challenge the Grass gym','Buy produce at the farm shop','Fish the mill pond','Help with the harvest'],
	  live:[] },
	{ id:'minato', box:[36,26], name:'Minato Harbour', x:176, y:248, island:'Hinode', tier:'PU', kind:'gym', gym:'WATER GYM',
	  blurb:'Ferries, fish, and a gym built into the sea wall. Everything that leaves the island leaves from here.',
	  facts:['Water Gym','Pokemon Centre','Mart','Ferry terminal: Aether, and straight to Tidecall','Breakwater','Warehouse row'],
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

	{ id:'hinomiya', box:[20,16], name:'Hinomiya Shrine', x:378, y:74, island:'Shiomi', tier:'UBER',
	  kind:'legend', gate:'CLIMB', rank:1,
	  blurb:'A fire shrine on the western rim of the caldera, reached by a stair nobody maintains and everybody uses. Kagura is danced here - the region is named for it - and the dancing is not for the crowd, because there is never a crowd.',
	  facts:['Climb to reach it','Kagura is danced at the rim','Something answers, occasionally','One of several such sites in Kagura','The others are not on this map'],
	  catch:['Fire','Psychic','Ghost','Dragon'],
	  doing:['Climb the shrine stair','Make an offering','Dance it properly, or not at all','Wait, and keep waiting'],
	  chans:['#hinomiya-shrine','#the-shrine-stair','#the-rim-platform'], live:[],
	  hook:'It answers to the dance, not to the dancer. Team Abyssal have worked that out.' },

	{ id:'midori', box:[26,20], name:'Midori Jungle', x:356, y:54, island:'Shiomi', tier:'UU', kind:'wild',
	  blurb:'The far side of the caldera, where the ash makes the soil absurdly rich and every cloud that clears the crater drops its rain. A pocket of proper jungle on an island that is otherwise grey.',
	  facts:['In the lee of the volcano','Rains almost daily','Soil is volcanic and very rich','Nothing else on Shiomi looks like this'],
	  catch:['Grass','Bug','Poison','Water'],
	  doing:['Cut in from the onsen road','Shelter from the daily rain','Find what only grows here',
	         'Look back at the caldera from the green side'],
	  chans:['#midori-jungle','#the-green-side','#the-rain-shadow'], live:[],
	  hook:'Plants grow here that are not on any Shiomi list, and somebody has been taking cuttings.' },

	{ id:'longsands', box:[30,14], name:'Long Sands', x:134, y:354, island:'Hinode', tier:'PU', kind:'wild',
	  blurb:'The whole southern shore of Hinode in one unbroken run of pale sand, shallow enough to wade a long way out and empty enough that you will hear anyone else arriving.',
	  facts:['Widest beach in the region','Shallow a long way out','Safe swimming','Busy for about two weeks a year'],
	  catch:['Water','Normal','Flying','Ground'],
	  doing:['Swim','Surf south from here','Race along the hard sand','Do nothing, deliberately'],
	  chans:['#long-sands','#the-shallows-south'], live:[] },

	{ id:'kuroihama', box:[26,14], name:'Kuroihama', x:422, y:32, island:'Shiomi', tier:'RU', kind:'wild',
	  blurb:'Black sand on the north shore, ground down from old lava and hot enough by afternoon to cross at a run. The sea is the only cold thing here.',
	  facts:['Volcanic black sand','Too hot to stand on by midday','Steep shelf - it drops fast','Glass in the sand, sometimes'],
	  catch:['Fire','Water','Rock','Dark'],
	  doing:['Swim off the steep shelf','Cross it quickly at noon','Sift for obsidian','Watch the sun off black sand'],
	  chans:['#kuroihama','#the-black-sand'], live:[] },

	{ id:'shellstrand', box:[28,14], name:'Shell Strand', x:406, y:356, island:'Tsuki', tier:'UU', kind:'wild',
	  blurb:'Tsuki\'s southern beach, made mostly of what the reef throws up - shell, coral grit and bleached fragments, pale enough to be hard on the eyes at noon.',
	  facts:['Sand is mostly shell and coral','Very bright at midday','Reef offshore','Turtles, in season'],
	  catch:['Water','Rock','Fairy','Flying'],
	  doing:['Beachcomb the shell line','Snorkel out to the reef','Sit out the midday glare','Watch for what nests here'],
	  chans:['#shell-strand','#the-shell-line'], live:[] },

	{ id:'mirrortarn', box:[18,14], name:'Mirror Tarn', x:120, y:96, island:'Kogarashi', tier:'RU', kind:'water',
	  blurb:'A high cold lake in a bowl of rock below the snowline, so still on a windless day that the mountain appears twice. Deep, far colder than it looks, and clear enough to see how far down that goes.',
	  facts:['Meltwater, and it shows','Still enough to mirror the peak','Deeper than the bowl suggests','Frozen at the edges most of the year'],
	  catch:['Water','Ice','Rock','Fairy'],
	  doing:['Fish the cold water','Camp on the shingle','Look down and regret it','Wait for the mountain to appear twice'],
	  chans:['#mirror-tarn','#the-shingle-shore'], live:[] },

	{ id:'millpond', box:[16,12], name:'The Mill Pond', x:150, y:252, island:'Hinode', tier:'ZU', kind:'water',
	  blurb:'Dammed to turn a wheel two centuries ago and kept because it turned out to be pleasant. Willows, a jetty, and the slowest water in Kagura.',
	  facts:['Man-made, long ago','The wheel still turns','Willows and a jetty','Nothing in it is dangerous'],
	  catch:['Water','Bug','Grass','Normal'],
	  doing:['Fish from the jetty','Watch the wheel','Swim, if the farmer is out','Teach someone to fish'],
	  chans:['#the-mill-pond','#the-jetty'], live:[] },

	{ id:'reservoir', box:[16,12], name:'Kagura Reservoir', x:96, y:274, island:'Hinode', tier:'PU', kind:'water',
	  blurb:'What the station and the town drink. Fenced, signposted, and fished anyway by everyone who has ever lived nearby.',
	  facts:['Drinking water for the station','Fenced, and the fence has gaps','Fishing is not allowed','Everyone fishes it'],
	  catch:['Water','Normal','Flying'],
	  doing:['Fish it and pretend otherwise','Walk the dam wall','Read the very stern signs'],
	  chans:['#kagura-reservoir','#the-dam-wall'], live:[] },

	{ id:'craterpool', box:[14,12], name:'The Crater Pool', x:404, y:62, island:'Shiomi', tier:'UU', kind:'water',
	  gate:'CLIMB',
	  blurb:'Rainwater caught in a vent above Ember Hollow, sitting on hot rock and steaming most mornings. A strange, bright green, and not water anyone drinks.',
	  facts:['Warm all year','Bright green, and not with weed','Steams at dawn','Do not drink it'],
	  catch:['Fire','Water','Poison'],
	  doing:['Climb up at dawn for the steam','Sample it, carefully','Look down into Ember Hollow'],
	  chans:['#the-crater-pool'], live:[] },

	{ id:'moonpool', box:[16,12], name:'Moon Pool', x:432, y:296, island:'Tsuki', tier:'UU', kind:'water',
	  blurb:'A lagoon behind the reef that the sea only reaches at the top of the tide, which leaves it glass-flat and lit from below whenever the sand is bright. Tsuki is named for nights like that.',
	  facts:['Cut off except at high tide','Glass-flat almost always','Pale sand, so it glows at night','The island is named for it'],
	  catch:['Water','Fairy','Psychic','Ice'],
	  doing:['Swim at night','Wait out the tide','See why the island is called Tsuki'],
	  chans:['#moon-pool','#the-night-water'], live:[] },

	{ id:'stables', box:[22,16], name:'Kagura Stables', x:190, y:274, island:'Hinode', tier:'PU', kind:'town',
	  blurb:'Paddocks, a long barn and a yard that always smells of hay and leather. If you are travelling on something, this is where it gets shod, fed, swapped or bought.',
	  facts:['Mounts bought, sold and stabled','Board by the week','They will not sell you something you cannot handle','Ask about the back paddock'],
	  catch:['Normal','Grass','Ground'],
	  doing:['Hire or buy a mount','Stable yours while you sail','Muck out for coin','Watch the breaking-in'],
	  chans:['#the-stables','#the-paddocks','#tack-room'], live:[],
	  hook:'The back paddock holds something nobody will name a price for.' },

	{ id:'daycare', box:[18,14], name:'The Day Care', x:126, y:236, island:'Hinode', tier:'ZU', kind:'town',
	  blurb:'An old couple, a walled garden and more patience than anyone reasonable has. Leave something with them and it comes back changed, usually for the better.',
	  facts:['They will mind anything','Walled garden, high walls','Eggs happen','No, they will not explain how'],
	  catch:['Normal','Fairy','Grass'],
	  doing:['Leave one in their care','Collect what was left','Listen to the old man talk'],
	  chans:['#the-day-care','#the-walled-garden'], live:[] },

	{ id:'mine', box:[20,16], name:'The Old Mine', x:64, y:132, island:'Kogarashi', tier:'NU', kind:'peak',
	  gate:'FLASH',
	  blurb:'Iron came out of this hill for two hundred years and then stopped. The head gear is still standing, the lower levels are flooded, and the upper galleries are somebody else\'s now.',
	  facts:['Worked out, not closed','Lower levels flooded','Bring a light','Something moved in'],
	  catch:['Rock','Steel','Ground','Dark'],
	  doing:['Work the upper galleries','Find what is worth digging for','Do not go below the water line'],
	  chans:['#the-old-mine','#upper-galleries','#the-water-line'], live:[],
	  hook:'The flooded levels connect to something that is not the mine.' },

	{ id:'ruins', box:[22,16], name:'The Standing Stones', x:142, y:92, island:'Kogarashi', tier:'RU', kind:'gym', gym:'PSYCHIC GYM',
	  blurb:'Nine stones in a ring on the heath, older than the castle and a good deal older than anyone\'s explanation of them. They are aligned on something, and nobody agrees on what - except the Psychic gym, dug into the hill beneath the ring, which seems to know.',
	  facts:['Psychic Gym, underground beneath the ring','Nine stones, one fallen','Older than the castle','Aligned on something'],
	  catch:['Psychic','Rock','Ghost','Fairy'],
	  doing:['Take the stair under the fallen ninth down to the Psychic gym','Count them twice','Stand in the middle at dusk','Compare notes with the castle library'],
	  chans:['#the-standing-stones','#stones-gym','#the-fallen-ninth'], live:[],
	  hook:'The carvings match something in the castle library, which is awkward for the dating.' },

	{ id:'onsen', box:[20,14], name:'Ashen Onsen', x:344, y:104, island:'Shiomi', tier:'RU', kind:'town',
	  blurb:'Volcanic water, wooden decking and a view of the sea over a field of black rock. The one place on Shiomi where the heat underfoot is a selling point.',
	  facts:['Open air, all year','Volcanic water, genuinely hot','Rooms if you want them','Leave your boots outside'],
	  catch:['Water','Fire','Fairy'],
	  doing:['Soak','Recover properly','Overhear things','Stay the night'],
	  chans:['#ashen-onsen','#the-outdoor-bath','#the-guest-rooms'], live:[] },

	{ id:'observatory', box:[20,16], name:'Storm Observatory', x:420, y:158, island:'Shiomi', tier:'UU', kind:'landmark',
	  gate:'CLIMB',
	  blurb:'A weather station on the ridge above the strait, staffed by people who chose this. They track every front that crosses Kagura and will tell you, at length, what is coming.',
	  facts:['Weather for the whole region','Staffed year round','They log what crosses the strait','Best view of both islands'],
	  catch:['Flying','Electric','Ice'],
	  doing:['Ask what the weather will do','Read the logs','Watch a front come in','Report what you saw at sea'],
	  chans:['#storm-observatory','#the-weather-logs'], live:[],
	  hook:'Their logs record ships crossing at night that no harbour has a record of.' },

	{ id:'hall', box:[24,18], name:"The Trainers' Hall", x:358, y:342, island:'Tsuki', tier:'OU', kind:'town',
	  blurb:'A tiered hall on the southern shore where people who have already won things come to keep winning them. Open ladder, no badges required, and a very long list of names on the wall.',
	  facts:['Open ladder, all comers','No badge requirement','Names on the wall go back decades','Where the strong go after the League'],
	  catch:['Fighting','Steel','Dark'],
	  doing:['Enter the ladder','Read the wall','Find out where you really stand','Lose to someone better'],
	  chans:['#trainers-hall','#the-open-ladder','#the-wall-of-names'], live:[] },

	{ id:'driftwood', box:[22,16], name:'Driftwood Cove', x:446, y:262, island:'Tsuki', tier:'UU', kind:'wild',
	  blurb:'A sheltered notch in the north coast where everything the strait loses eventually washes up. Half the cove is bleached timber and the other half is whatever came off the boats.',
	  facts:['Everything lost in the strait arrives here','Good fishing off the point','Sheltered in any weather','People come looking for things'],
	  catch:['Water','Ground','Dark','Flying'],
	  doing:['Comb the tideline','Fish the point','Find who lost it','Camp, safely for once'],
	  chans:['#driftwood-cove','#the-tideline'], live:[],
	  hook:'Crates keep washing up here with no maker marks and no manifest.' },

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

	{ id:'pinewood', box:[30,26], name:'The Pinewood', x:166, y:94, island:'Kogarashi', tier:'NU', kind:'wild',
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

	{ id:'ashfields', box:[32,22], name:'The Ashfields', x:394, y:136, island:'Shiomi', tier:'RU', kind:'wild',
	  blurb:'Everything the volcano has thrown downwind, gone soft over the years and grown over in patches. Grey underfoot, startlingly green wherever anything took root.',
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
	  facts:['Only land route between Hinode and Kogarashi','Toll house, unstaffed','Fishing off the deck','Ferry stage for the Aether boat','Nothing crosses at night if it can help it'],
	  catch:['Water','Flying','Ghost'],
	  doing:['Cross north to Kogarashi','Fish from the span','Read the notices nailed to the toll house',
	         'Wait for someone braver'],
	  chans:['#watari-bridge','#the-toll-house','#under-the-span','#watari-ferry'],
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

	{ id:'ghost', box:[44,34], name:'Ghost Woods', x:112, y:150, island:'Kogarashi', tier:'NU', kind:'gym', gym:'GHOST GYM',
	  blurb:'A forest that grew over something. The paths move, the light is wrong, and the gym is not a building - it is a clearing that keeps being found.',
	  facts:['Ghost Gym','Lanterns nobody admits to lighting','Paths that do not stay put'],
	  chans:['#the-treeline','#deep-woods','#lantern-clearing','#woods-gym','#the-shrine-ruin','#where-the-paths-move'],
	  catch:['Ghost','Dark','Poison','Grass'],
	  doing:['Challenge the Ghost gym, if you can find it','Light a lantern','Get lost on purpose','Do not go in alone'],
	  live:[],
	  hook:'Something under the woods is older than the woods.' },
	{ id:'castle', box:[28,24], name:'N\'s Castle', x:170, y:70, island:'Kogarashi', tier:'RU', kind:'landmark',
	  blurb:'Sunk to its second floor in the hillside, doors open, nobody in charge. Whatever the last arc left in it is still in it.',
	  facts:['Library','Undercroft','Throne room, empty','Nobody owns it','Kitaura, the ferry harbour, is down the hill'],
	  chans:['#castle-gate','#throne-room','#library','#undercroft','#the-battlements','#kings-quarters'],
	  catch:['Psychic','Dark','Steel','Ghost'],
	  doing:['Read in the library','Explore the undercroft','Sit on the throne, briefly','Take something you should not'],
	  live:[],
	  hook:'An empty castle with working doors is an invitation.' },
	{ id:'silver', box:[40,34], name:'Mt. Silver', rank:1, x:84, y:72, island:'Kogarashi', tier:'OU-UBER', kind:'peak', gate:'CLIMB / FLASH',
	  blurb:'The foothills are a walk. Above the tree line is a climb, and the cave inside is dark enough that people have been lost in it.',
	  facts:['Climb above the tree line','Flash inside the cave','Highest tier in the region','A climbers\' hut, sometimes occupied'],
	  chans:['#foothills','#peak','#silver-cave','#the-ice-shelf','#climbers-hut'],
	  catch:['Ice','Rock','Fighting','Dragon'],
	  doing:['Climb above the tree line','Bring Flash for the cave','Shelter in the climbers hut','Find whoever trains at the peak'],
	  live:['#peak'] },
	{ id:'ember', box:[36,26], name:'Ember Hollow', x:398, y:96, island:'Shiomi', tier:'UU', kind:'gym', gym:'FIRE GYM',
	  blurb:'A town inside a dead caldera, built on the warm side of the rock. The ash makes the soil good and the weather strange.',
	  facts:['Fire Gym','Pokemon Centre','Mart','Hot springs','Obsidian works'],
	  chans:['#caldera-town','#ash-flats','#ember-gym','#poke-center-ember','#ember-mart','#hot-springs','#the-vents','#obsidian-works'],
	  catch:['Fire','Ground','Rock','Poison'],
	  doing:['Challenge the Fire gym','Soak in the hot springs','Heal at the Centre','Ask why the works runs at night'],
	  live:[],
	  hook:'The obsidian works runs a night shift and sells to nobody local - the lorries go to the harbour.' },
	{ id:'shelf', box:[24,20], name:'Thunder Shelf', x:456, y:154, island:'Shiomi', tier:'UU', kind:'gym', gym:'ELECTRIC GYM', gate:'CLIMB',
	  blurb:'A cliff terrace that catches every storm crossing the strait. The gym is up there because the weather is up there.',
	  facts:['Electric Gym','Climb for the last stretch','Pylons that hum'],
	  chans:['#storm-watch','#shelf-gym','#cliff-stairs','#the-pylons'],
	  catch:['Electric','Flying','Steel','Rock'],
	  doing:['Challenge the Electric gym','Climb the cliff stairs','Watch a storm come in','Do not touch the pylons'],
	  live:[] },
	/*
	 * Hangouts: places to meet, eat and talk rather than battle - no wild
	 * Pokemon and no trainers. Each has one channel, filed beside the town it
	 * is near (`near`) or in its island's category.
	 */
	{ id:'hanami', box:[22,16], name:'Hanami Park', rank:2, x:92, y:320, island:'Hinode', tier:'-', kind:'hangout', near:'sakura',
	  blurb:'A park of old cherry trees south-east of Sakura, with lawns for picnics, a pond pavilion and paper lanterns strung between the branches. Where Sakura spends its evenings.',
	  facts:['Cherry trees, lawns and a pond pavilion','Picnics, dates, and Pokémon napping in the sun','Lanterns lit at dusk','No wild Pokémon, no battles'],
	  chans:['#hanami-park'],
	  catch:[],
	  doing:['Have a picnic','Meet up before an adventure','Watch the lanterns come on','Let your Pokémon out to play'],
	  live:[] },
	{ id:'nightmarket', box:[22,16], name:'Harbour Night Market', rank:2, x:160, y:212, island:'Hinode', tier:'-', kind:'hangout', near:'minato',
	  blurb:'Once the fish market closes, the stalls come out on the hill above Minato: grilled skewers, games, trinkets from the ferries, and music until late.',
	  facts:['Opens at dusk','Street food and stall games','Trinkets off every ferry','No wild Pokémon, no battles'],
	  chans:['#night-market'],
	  catch:[],
	  doing:['Eat something grilled on a stick','Win a prize at the stall games','Haggle over ferry trinkets','Stay out too late'],
	  live:[] },
	{ id:'crossroads', box:[22,16], name:'The Crossroads Tavern', rank:2, x:134, y:174, island:'Kogarashi', tier:'-', kind:'hangout',
	  blurb:'A timber tavern where the road from Watari Bridge meets the Ghost Woods trail. Travellers, gym challengers and people who should be somewhere else all end up here.',
	  facts:['Hot food and a fire','A noticeboard of rumours and requests','Rooms upstairs','No wild Pokémon, no battles'],
	  chans:['#crossroads-tavern'],
	  catch:[],
	  doing:['Swap stories by the fire','Read the rumour board','Find a travelling partner','Rest before the woods'],
	  live:[] },
	{ id:'laststop', box:[22,16], name:'Last Stop Café', rank:2, x:92, y:44, island:'Kogarashi', tier:'-', kind:'hangout', near:'victory',
	  blurb:'A warm café on the cold slope below Victory Road, and the last cup of anything before the climb. The walls are covered in signatures of people who made it to the League.',
	  facts:['Hot drinks and big breakfasts','A wall of challengers\' signatures','The last warm room before the climb','No wild Pokémon, no battles'],
	  chans:['#last-stop-cafe'],
	  catch:[],
	  doing:['Sign the wall','Talk tactics with other challengers','Warm up before Victory Road','Celebrate on the way back down'],
	  live:[] },
	{ id:'windchime', box:[22,16], name:'Windchime Terrace', rank:2, x:452, y:58, island:'Shiomi', tier:'-', kind:'hangout',
	  blurb:'A tea house on a terrace above the north-east coast of Shiomi, hung with hundreds of glass wind chimes. On a calm day you can hear it from the road.',
	  facts:['Tea house with a sea view','Hundreds of glass wind chimes','Quiet, most of the time','No wild Pokémon, no battles'],
	  chans:['#windchime-terrace'],
	  catch:[],
	  doing:['Drink tea and watch the sea','Hang a wind chime with a wish','Have a quiet conversation','Sketch the view'],
	  live:[] },
	{ id:'bonfire', box:[22,16], name:'Bonfire Beach', rank:2, x:390, y:251, island:'Tsuki', tier:'-', kind:'hangout',
	  blurb:'A sheltered sandy cove on Tsuki\'s north shore where someone always has a fire going after dark. Music, marshmallows, and Pokémon asleep in the warm sand.',
	  facts:['A fire most nights','Music and marshmallows','Calm swimming by day','No wild Pokémon, no battles'],
	  chans:['#bonfire-beach'],
	  catch:[],
	  doing:['Sit around the bonfire','Swim in the cove','Tell ghost stories','Watch the sun come up'],
	  live:[] },
	{ id:'festival', box:[22,16], name:'Moonrise Festival Grounds', rank:2, x:420, y:270, island:'Tsuki', tier:'-', kind:'hangout',
	  blurb:'An open field of lanterns and stalls where Tsuki holds its moon festivals. Between festivals it is where everyone meets, practises dances and plans the next one.',
	  facts:['Moon festivals through the year','Stalls, games and a dance stage','Meeting place for the whole island','No wild Pokémon, no battles'],
	  chans:['#festival-grounds'],
	  catch:[],
	  doing:['Dance on the festival stage','Win a game at the stalls','Help set up the next festival','Watch the moon rise'],
	  live:[] },
	/*
	 * Kitaura: the north ferry needed a harbour on Kogarashi, and the only calm
	 * water on that cold east coast is the inlet below N's Castle.
	 */
	{ id:'kitaura', box:[26,18], name:'Kitaura', x:184, y:84, island:'Kogarashi', tier:'RU', kind:'town',
	  blurb:'A cold little harbour below N\'s Castle, where the north ferry to Shiomi ties up. Nets dry on every wall, and everyone looks up at the castle more often than they admit.',
	  facts:['Ferry to Cinder Row, stopping at Beacon Rock','Net sheds and a smokehouse','An inn for ferry passengers','No gym, no Centre','N\'s Castle is ten minutes up the hill'],
	  chans:['#kitaura-harbour','#kitaura-ferry','#net-sheds','#kitaura-inn'],
	  catch:['Water','Ice','Flying','Normal'],
	  doing:['Catch the north ferry to Shiomi','Walk up to N\'s Castle','Buy smoked fish at the net sheds','Ask the innkeeper about the lights in the castle'],
	  live:[],
	  hook:'The ferry crew will not sail after dark, and will not say what the castle windows have to do with it.' },
	{ id:'cinder', box:[26,16], name:'Cinder Row', x:360, y:134, island:'Shiomi', tier:'RU', kind:'town',
	  blurb:'Twelve houses, one shop, downwind of the caldera. Everyone knows the ferry timetable by heart.',
	  facts:['A shop','A jetty','Ferry to Kitaura on Kogarashi via Beacon Rock, and to Aether','No gym','Ash on everything'],
	  chans:['#cinder-row','#row-shop','#the-jetty','#cinder-ferry'],
	  catch:['Fire','Water','Rock','Normal'],
	  doing:['Buy from the one shop','Fish off the jetty','Catch the ferry','Listen to what the locals will not say'],
	  live:[] },
	{ id:'tidecall', box:[30,24], name:'Tidecall Town', x:350, y:304, island:'Tsuki', tier:'UU', kind:'gym', gym:'ROCK GYM',
	  blurb:'Built among sea stacks the tide runs through twice a day. The gym is cut into one of them.',
	  facts:['Rock Gym','Pokemon Centre','Mart','Causeway, twice a day','Ferry straight to Minato, and to Aether'],
	  chans:['#the-stacks','#tidecall-gym','#poke-center-tsuki','#tidecall-mart','#the-causeway','#stilt-houses','#tidecall-ferry'],
	  catch:['Rock','Water','Ground','Flying'],
	  doing:['Challenge the Rock gym','Cross the causeway at low tide','Heal at the Centre','Get caught out by the tide'],
	  live:[] },
	{ id:'grotto', box:[26,22], name:'Moonlit Grotto', x:432, y:332, island:'Tsuki', tier:'OU', kind:'gym', gym:'DARK GYM', gate:'FLASH',
	  blurb:'A sea cave the tide empties twice a day. The mouth is a walk; the gym is further in than most people go.',
	  facts:['Dark Gym','Flash for the deep part','One of the eight badges','Floods on schedule'],
	  chans:['#grotto-mouth','#deep-grotto','#grotto-gym','#the-tide-gate'],
	  catch:['Dark','Water','Ghost','Poison'],
	  doing:['Challenge the Dark gym for a badge','Bring Flash','Time it against the tide','Find the tide gate controls'],
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
	  facts:['Pokemon Centre','A stop on the north ferry, or Surf','Fly anchor','Sees every ship that passes'],
	  chans:['#beacon-rock','#beacon-ferry','#the-light','#keepers-room'],
	  catch:['Water','Flying','Ice'],
	  doing:['Heal in the middle of the sea','Set a Fly anchor','Talk to the keeper','Surf on from here'],
	  live:[],
	  hook:'Whoever keeps the light knows which boats cross at night, and has stopped writing them down.' },
	{ id:'aether', box:[26,20], name:'Aether Paradise', rank:1, x:246, y:176, island:'Open sea', tier:'-', kind:'station',
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
	  hook:'Team Abyssal. Everything that has been slightly wrong on this map runs back to here.' },

	/*
	 * Tokoyo, for crossovers. The far land across the sea in the old stories,
	 * put in the one corner of the map no ferry reaches. The gate on it is how
	 * anyone - or anything - from another world arrives in Kagura, which gives
	 * crossover characters (the C tag) a place on the map to have come from.
	 */
	{ id:'tokoyo', box:[22,22], name:'The Tokoyo Gate', rank:1, x:26, y:348, island:'Tokoyo', tier:'-', kind:'legend',
	  blurb:'A lone island past the edge of the charts, and on it a gate that stands open onto somewhere that is not Kagura. Fishermen call the island Tokoyo, the far shore from the old stories. One old ferry from Sakura still makes the crossing.',
	  facts:['One ferry, from Sakura, and it does not wait','No chart, no Centre','The gate is always open','What comes through is not from here','Crossovers arrive here'],
	  chans:['#tokoyo-shore','#tokoyo-ferry','#the-far-gate','#the-other-side'],
	  catch:['Psychic','Ghost','Dragon','Fairy'],
	  doing:['Take the Sakura ferry, if the ferryman agrees','Walk through the gate, or wait for what walks out','Meet someone from another world','Find out who else knows it is there'],
	  live:[],
	  hook:'Whatever opened the gate did it on purpose, and it is still open.' }
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
	1:  { kind:'main', name:'Route 1',  from:'Sakura Town', to:'Kagura Station', tier:'ZU', walk:'Easy',
	      blurb:'Coastal meadow, hedges, a plank bridge. The first road anyone walks.',
	      catch:['Normal','Bug','Flying'], doing:['Catch your first','Cross the plank bridge','Read the signpost'] },
	2:  { kind:'main', name:'Route 2',  from:'Kagura Station', to:'Amber Fields', tier:'ZU-PU', walk:'Easy',
	      blurb:'A cart track between hedgerows and barley, telegraph poles all the way.',
	      catch:['Normal','Bug','Grass'], doing:['Battle the farmhands','Search the verges'] },
	3:  { kind:'main', name:'Route 3',  from:'Amber Fields', to:'Minato Harbour', tier:'PU', walk:'Easy',
	      blurb:'The land drops to the sea and the track turns to cobbles.',
	      catch:['Flying','Normal','Water'], doing:['Take the cliff steps','First sight of the harbour'] },
	4:  { kind:'main', name:'Route 4',  from:'Kagura Station', to:'the north shore', tier:'PU', walk:'Dead end',
	      blurb:'Dunes and scrub to a shingle beach with a wrecked boat on it.',
	      catch:['Ground','Flying','Water'], doing:['Search the wreck','Nothing else - it is a dead end'] },
	5:  { kind:'side', name:'Route 5',  from:'Amber Fields', to:'the south beach', tier:'PU', walk:'Easy',
	      blurb:'Orchard, then meadow, then dunes and a long beach.',
	      catch:['Bug','Grass','Water'], doing:['Mind the bees','Swim','Beachcomb'] },
	6:  { kind:'main', name:'Route 6',  from:'the lowlands', to:'Ghost Woods', tier:'NU', walk:'Getting dark',
	      blurb:'Ordinary woodland that stops being ordinary about halfway along.',
	      catch:['Bug','Grass','Ghost'], doing:['Turn back while you can','Note where the mist starts'] },
	7:  { kind:'side', name:'Route 7',  from:'Ghost Woods', to:"N's Castle and Kitaura", tier:'RU', walk:'Exposed',
	      blurb:'A ridge path out of the trees, standing stones, heather, towers ahead.',
	      catch:['Rock','Psychic','Flying'], doing:['Stop at the standing stones for the Psychic gym','Battle on the ridge'] },
	8:  { kind:'side', name:'Route 8',  from:'Ghost Woods', to:'Mt. Silver foothills', tier:'RU', walk:'Side trail',
	      blurb:'Pine forest rising, with a cold stream and stepping stones across it.',
	      catch:['Bug','Grass','Water'], doing:['Cross the stepping stones','Fish the stream'] },
	9:  { kind:'main', name:'Route 9',  from:"N's Castle", to:'the high pass', tier:'OU', walk:'CLIMB',
	      blurb:'Scree, old snow, a ledge trail with a rope line and a long way down.',
	      catch:['Ice','Rock','Flying'], doing:['Use the handline','Do not stop on the ledge'] },
	10: { kind:'main', name:'Route 10', from:'Cinder Row', to:'Ember Hollow', tier:'RU', walk:'Boardwalk',
	      blurb:'Ash flats and lava rock, crossed on a boardwalk that has seen better days.',
	      catch:['Fire','Ground','Rock'], doing:['Stay on the planks','Watch the vents'] },
	11: { kind:'main', name:'Route 11', from:'Ember Hollow', to:'Thunder Shelf', tier:'UU', walk:'CLIMB',
	      blurb:'Basalt terraces like stairs, with the first pylon at the top.',
	      catch:['Rock','Electric','Fire'], doing:['Climb the terraces','Shelter before the storm'] },
	12: { kind:'side', name:'Route 12', from:'the north coast', to:'Cinder Row', tier:'RU', walk:'Easy',
	      blurb:'Black sand, sea stacks, driftwood, ash drifting over everything.',
	      catch:['Water','Rock','Flying'], doing:['Beachcomb','Fish the stacks'] },
	13: { kind:'main', name:'Route 13', from:'Tidecall Town', to:'Moonlit Grotto', tier:'UU', walk:'Tidal',
	      blurb:'Rock shelves and tide pools, part-bridged by a walkway missing sections.',
	      catch:['Water','Rock','Poison'], doing:['Cross before the tide turns','Search the pools'] },
	14: { kind:'side', name:'Route 14', from:'Tidecall Town', to:'the northern headland', tier:'UU', walk:'Exposed',
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
/*
 * The rail line, and why it goes further than it used to.
 *
 * It ran Sakura Town to Kagura Station and stopped - along the exact points of
 * Route 1, which is a twenty minute walk. A station whose train takes you where
 * the road beside it already goes is scenery, and the freight yard's containers
 * "going out by sea" had no way of reaching the sea. So the line now crosses
 * Hinode end to end and finishes at the harbour: Sakura, the Station, Amber
 * Fields, Minato Harbour. It follows the trunk routes a little to the north of
 * them, because rails are laid where roads already found the flat ground.
 */
var RAIL = [[62,286],[74,276],[86,270],[98,264],[116,261],[134,261],[148,259],[160,251],[176,245]];
var FERRIES = [
	[[190,256],[216,224],[236,196]],
	[[128,186],[176,182],[214,178]],
	[[336,110],[300,140],[268,166]],
	[[334,300],[300,244],[270,200]],
	/* Two straight west-to-east crossings that skip Aether, so the islands connect
	   to each other and not only through the hub: north, Kogarashi's landing below
	   N's Castle to Cinder Row's jetty, past Beacon Rock; south, Minato Harbour to
	   Tidecall Town across Hinode Bay. */
	[[192,86],[220,86],[246,82],[276,90],[312,104],[344,124]],
	[[190,256],[228,270],[270,282],[306,292],[334,302]],
	/* The Tokoyo boat: Sakura's pier to the far isle, the one crossing no chart shows. */
	[[50,300],[42,312],[34,322]]
];

var ART = {
	abyss: 'abyss.webp',
	aether: 'aether-paradise.png',
	amber: 'amber.webp',
	ashfields: 'ashfields.webp',
	barrens: 'barrens.webp',
	beacon: 'beacon.webp',
	bell: 'bell.webp',
	bonfire: 'bonfire.webp',
	castle: 'castle.webp',
	cinder: 'cinder.webp',
	craterpool: 'craterpool.webp',
	crossroads: 'crossroads.webp',
	daycare: 'daycare.webp',
	driftwood: 'driftwood.webp',
	dunes: 'dunes.webp',
	ember: 'ember.webp',
	festival: 'festival.webp',
	'g-amber': 'g-amber.webp',
	'g-ember': 'g-ember.webp',
	'g-ghost': 'g-ghost.webp',
	'g-grotto': 'g-grotto.webp',
	'g-minato': 'g-minato.webp',
	'g-ruins': 'g-ruins.webp',
	'g-shelf': 'g-shelf.webp',
	'g-tidecall': 'g-tidecall.webp',
	ghost: 'ghost.webp',
	grotto: 'grotto.webp',
	hall: 'hall.webp',
	hanami: 'hanami.webp',
	harefield: 'harefield.webp',
	heath: 'heath.webp',
	hinomiya: 'hinomiya.webp',
	kakehashi: 'kakehashi.webp',
	kitaura: 'kitaura.webp',
	kuroihama: 'kuroihama.webp',
	laststop: 'laststop.webp',
	league: 'league.webp',
	longsands: 'longsands.webp',
	midori: 'midori.webp',
	millpond: 'millpond.webp',
	minato: 'minato.webp',
	mine: 'mine.webp',
	mirrortarn: 'mirrortarn.webp',
	moonpool: 'moonpool.webp',
	nightmarket: 'nightmarket.webp',
	observatory: 'observatory.webp',
	onsen: 'onsen.webp',
	palmlands: 'palmlands.webp',
	pinewood: 'pinewood.webp',
	reservoir: 'reservoir.webp',
	r1: 'route-1.webp',
	r10: 'route-10.webp',
	r11: 'route-11.webp',
	r12: 'route-12.webp',
	r13: 'route-13.webp',
	r14: 'route-14.webp',
	r2: 'route-2.webp',
	r3: 'route-3.webp',
	r4: 'route-4.webp',
	r5: 'route-5.webp',
	r6: 'route-6.webp',
	r7: 'route-7.webp',
	r8: 'route-8.webp',
	r9: 'route-9.webp',
	ruins: 'ruins.webp',
	sakura: 'sakura.webp',
	saltmarsh: 'saltmarsh.webp',
	shelf: 'shelf.webp',
	shellstrand: 'shellstrand.webp',
	shoal: 'shoal.webp',
	silver: 'silver.webp',
	stables: 'stables.webp',
	station: 'station.webp',
	tidecall: 'tidecall.webp',
	tokoyo: 'tokoyo.webp',
	victory: 'victory.webp',
	watari: 'watari.webp',
	windbreaks: 'windbreaks.webp',
	windchime: 'windchime.webp'
};


var PLANS = {
	sakura: { streets: [[[-16,4],[15,4]], [[-2,4],[-2,-11]]],
		b: [['centre',-15,-8],['lab',1,-10],['mart',9,6],['house',-14,7],['house',-4,7],['house',8,-7],['house',-16,12]] },
	station: { streets: [[[-14,2],[14,2]], [[0,2],[0,-9]]],
		b: [['station',-13,-7],['house',6,4],['house',-12,6],['house',-2,6],['house',9,-8]] },
	amber: { streets: [[[-16,2],[15,2]]],
		b: [['gym',-9,-9],['house',-15,5],['house',-5,5],['house',6,5],['house',9,-8],['crop',-14,9,28,7]] },
	minato: { streets: [[[-17,0],[16,0]], [[4,0],[4,11]]],
		b: [['gym',-16,-10],['centre',3,-10],['mart',-13,3],['house',-2,3],['house',8,3],['pier',10,9],['pier',10,13]] },
	ghost: { streets: [],
		b: [['torii',-2,-2],['house',-14,6],['house',10,8],['lantern',-12,-8],['lantern',8,-6],['lantern',0,10]] },
	castle: { streets: [[[-6,12],[-6,2]]],
		b: [['castle',-12,-9],['house',8,6],['house',-14,8]] },
	/* The Psychic gym meets inside the ring; the hall is its lodge beside the stones. */
	ruins: { streets: [[[-9,4],[9,4]]], b: [['gym',-9,-7],['house',5,6]] },
	silver: { streets: [], b: [['cave',0,0],['house',12,10]] },
	ember: { streets: [[[-15,3],[15,3]]],
		b: [['gym',-15,-8],['centre',2,-8],['mart',-10,6],['house',2,6],['house',11,6]] },
	shelf: { streets: [[[-9,4],[9,4]]], b: [['gym',-9,-7],['house',3,6]] },
	cinder: { streets: [[[-12,3],[12,3]]],
		b: [['house',-12,-5],['house',-3,-5],['house',6,-5],['house',-3,6]] },
	tidecall: { streets: [[[-13,2],[13,2]]],
		b: [['gym',-13,-9],['centre',2,-9],['mart',-9,5],['house',4,5]] },
	grotto: { streets: [], b: [['cave',2,-2],['house',-10,5],['house',9,7]] },
	shoal: { streets: [], b: [['reef',0,0]] },
	beacon: { streets: [], b: [['lighthouse',-3,4],['centre',-12,-2]] },
	tokoyo: { streets: [], b: [['torii',-2,-4],['lantern',-8,4],['lantern',6,4]] },
	kitaura: { streets: [[[-10,3],[8,3]]], b: [['house',-12,-5],['house',-2,-6],['house',6,-4],['pier',2,7]] },
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
	 *
	 * They are not numbered. Kagura is open world and the eight gyms can be taken
	 * in any order, so a "Gym 3" would be telling people a route that isn't one.
	 */
	var GYMS = {
		minato:   { type:'Water',    badge:'Tide Badge',     leader:'',
		            puzzle:'Sluice gates and floating platforms. Open the right channels and the route across appears.' },
		amber:    { type:'Grass',    badge:'Harvest Badge',  leader:'',
		            puzzle:'A hedge maze under glass. Simple to see from above, less so from inside it.' },
		ghost:    { type:'Ghost',    badge:'Lantern Badge',  leader:'',
		            puzzle:'The lit lanterns mark the only path that stays where you left it.' },
		ruins:    { type:'Psychic',  badge:'Crown Badge',    leader:'',
		            puzzle:'An underground hall directly beneath the ring, reached by a stair under the fallen ninth stone. Nine teleport pads mirror the stones above; step onto the wrong one and you are sent back to the foot of the stair.' },
		ember:    { type:'Fire',     badge:'Caldera Badge',  leader:'',
		            puzzle:'Retractable bridges over live lava, each on its own switch. Plan the whole crossing first.' },
		shelf:    { type:'Electric', badge:'Storm Badge',    leader:'',
		            puzzle:'Electric barriers and lever switches. Every lever you throw closes something else.' },
		tidecall: { type:'Rock',     badge:'Stack Badge',    leader:'',
		            puzzle:'Boulders in grooved tracks. Push them the wrong way and they do not come back.' },
		grotto:   { type:'Dark',     badge:'Moonless Badge', leader:'',
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
		{ x:246, y:176, r:22, lift: 14, kind:'bank'  },   /* Aether's footings  */
		{ x:26,  y:348, r:32, lift: 16, kind:'bank'  }    /* Tokoyo's shelf     */
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
		PLANS: PLANS, ART: ART, GYMS: GYMS, BRIDGES: BRIDGES, RAIL: RAIL, FERRIES: FERRIES, TRAILS: TRAILS, LAKES: LAKES, BIOMES: BIOMES, SEABED: SEABED, OVERLAYS: OVERLAYS,
		/* The region's own name, in the open sea along the bottom between Hinode and Tsuki, bigger than any island's. */
		title: ['KAGURA REGION', 264, 372],
		/* What counts as Kagura when the border is shown: all five islands, Tokoyo
		   included, and the places out at sea between them. */
		borderIslands: [KOGARASHI, HINODE, SHIOMI, TSUKI, TOKOYO],
		borderOutside: [],
		isles: [['KOGARASHI',128,8],['SHIOMI',402,6],['HINODE',96,366],['TSUKI',470,240],['TOKOYO',28,316]],
		seas:  [
			['KAGURA STRAIT', 250, 108], ['THE OPEN SEA', 54, 176],
			['SHIOMI SOUND', 306, 34],   ['THE TSUKI SHALLOWS', 470, 350],
			['THE ABYSSAL DEEP', 268, 250], ['HINODE BAY', 232, 334]
		],
		/* Rivers are labelled where they run, not marked as destinations - you
		   follow a river, you do not visit one. */
		rivers: [
			['R. KOGARASHI', 120, 138], ['R. AMBER', 128, 268], ['ASH BROOK', 374, 128]
		]
	};
})();
