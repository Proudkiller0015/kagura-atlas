/*
 * Sinnoh - region data.
 *
 * The canon region, north of Kagura in the shared world: on the assembled
 * Pokemon world map Sinnoh sits at the southern end of everything, so Kagura
 * lies south of it again and Sinnoh is drawn above. Same coordinate space as
 * regions/kagura.js, a different part of it - the sea between the two is real
 * sea you can drag across.
 *
 * Coordinates run from y -456 (the Battle Zone, far north) to y -40 (the south
 * coast, forty units of open water above Kagura's northern shore).
 *
 * Kagura is ours and invented. This is not: the towns, gyms, badges, routes and
 * landmarks are the canon ones, laid out as the games lay them out - the
 * south-western start, Mt. Coronet down the spine, the Battle Zone off on its
 * own island in the north. Only the prose is written here.
 */
(function () {
	'use strict';

/*
 * The mainland. Sinnoh is Hokkaido: a wide south-western lowland where the
 * story starts, a mountain spine up the middle, a cold north, and an arm out to
 * the east that ends at the League.
 */
/*
 * Sinnoh's coastline, traced from the Platinum region map rather than drawn by
 * hand - the hand-drawn one was a potato. tools/trace-coast.js tells land from
 * sea by colour and simplifies the outline, and tools/make-backdrop.js cuts the
 * same sea out of the artwork, so these polygons and the picture agree.
 */
var SINNOH = [
	[229,-403],[232,-402],[231,-395],[236,-391],[234,-387],[237,-385],[220,-375],[208,-351],
	[211,-350],[213,-355],[222,-356],[225,-361],[227,-359],[227,-354],[223,-354],[221,-350],
	[220,-335],[226,-333],[219,-329],[225,-320],[230,-324],[227,-327],[230,-329],[233,-343],
	[229,-363],[235,-367],[240,-363],[246,-368],[242,-369],[246,-375],[252,-375],[256,-370],
	[252,-366],[255,-364],[254,-359],[257,-358],[260,-363],[257,-356],[271,-347],[284,-330],
	[282,-327],[289,-324],[301,-306],[299,-296],[303,-299],[315,-285],[329,-279],[326,-276],
	[334,-278],[350,-274],[356,-268],[359,-269],[365,-257],[378,-253],[379,-259],[392,-258],
	[407,-271],[409,-261],[403,-247],[407,-241],[402,-235],[406,-226],[403,-221],[408,-221],
	[418,-212],[421,-198],[436,-200],[447,-192],[448,-198],[458,-198],[455,-190],[461,-185],
	[461,-172],[443,-173],[439,-168],[419,-174],[395,-171],[386,-158],[357,-151],[357,-145],
	[348,-136],[332,-136],[328,-128],[317,-135],[323,-126],[320,-118],[306,-131],[310,-116],
	[298,-132],[299,-143],[303,-132],[305,-133],[301,-148],[292,-145],[291,-151],[288,-151],
	[288,-144],[293,-143],[294,-138],[288,-142],[282,-140],[274,-142],[271,-145],[278,-146],
	[282,-157],[275,-159],[269,-150],[264,-164],[252,-172],[249,-168],[256,-162],[252,-161],
	[253,-158],[262,-152],[256,-155],[254,-153],[263,-145],[266,-126],[255,-120],[254,-114],
	[243,-105],[248,-101],[262,-113],[265,-107],[263,-99],[257,-95],[238,-95],[240,-102],
	[238,-103],[233,-95],[223,-95],[222,-103],[217,-106],[218,-110],[213,-111],[211,-107],
	[203,-109],[191,-116],[180,-129],[161,-138],[153,-137],[143,-124],[119,-115],[109,-104],
	[104,-105],[101,-119],[97,-124],[95,-137],[97,-143],[51,-134],[51,-204],[81,-212],
	[90,-222],[95,-223],[104,-220],[110,-213],[109,-210],[114,-215],[115,-206],[120,-214],
	[131,-204],[132,-209],[144,-219],[146,-227],[141,-234],[144,-244],[153,-247],[146,-252],
	[147,-258],[162,-264],[179,-285],[182,-300],[192,-315],[195,-334],[202,-334],[199,-329],
	[208,-331],[197,-321],[202,-317],[198,-315],[204,-311],[202,-307],[211,-302],[213,-297],
	[213,-307],[217,-300],[223,-297],[232,-300],[234,-295],[236,-303],[240,-300],[236,-299],
	[238,-297],[243,-296],[242,-289],[246,-288],[245,-293],[250,-295],[245,-298],[251,-303],
	[250,-309],[233,-313],[223,-308],[219,-317],[221,-322],[211,-329],[216,-334],[218,-347],
	[215,-350],[205,-345],[203,-348],[200,-343],[202,-340],[196,-337],[201,-353],[197,-368],
	[198,-378],[229,-403]
];
var BATTLEZONE = [
	[328,-406],[367,-406],[370,-388],[386,-367],[390,-361],[386,-361],[394,-359],[400,-348],
	[408,-321],[406,-312],[416,-303],[417,-295],[425,-290],[422,-283],[413,-276],[408,-276],
	[403,-272],[398,-274],[395,-283],[401,-289],[383,-314],[385,-329],[379,-332],[376,-329],
	[374,-333],[364,-328],[363,-319],[354,-313],[363,-305],[357,-289],[345,-284],[332,-293],
	[334,-299],[326,-304],[326,-310],[322,-316],[333,-359],[328,-406]
];
var EAST_ISLES = [
	[456,-297],[469,-295],[466,-288],[460,-286],[460,-276],[453,-271],[449,-257],[439,-253],
	[436,-245],[429,-249],[423,-243],[416,-246],[414,-257],[431,-283],[436,-277],[445,-279],
	[446,-288],[455,-297]
];
var SOUTH_ISLE = [
	[292,-136],[297,-123],[294,-122],[298,-119],[301,-121],[313,-109],[312,-99],[307,-98],
	[306,-95],[268,-95],[267,-110],[275,-110],[274,-123],[280,-123],[284,-119],[276,-113],
	[280,-108],[297,-110],[287,-119],[291,-126],[282,-126],[287,-135],[290,-133],[292,-135]
];
var IRON_ISLE = [
	[158,-292],[168,-291],[169,-287],[158,-278],[144,-274],[142,-280],[151,-289],[158,-291]
];

/*
 * Two islands the region map does not draw.
 *
 * Fullmoon and Newmoon are reached only by asking the Canalave sailor twice,
 * and the games leave them off the printed map - so there is nothing to trace
 * and they get ground of their own, at the positions the town map gives them.
 */
var ISLETS = [
	{ x:73, y:-368, r:11 },   /* Fullmoon Island */
	{ x:114, y:-368, r:10 }   /* Newmoon Island  */
];

var ISLANDS = [SINNOH, BATTLEZONE, EAST_ISLES, SOUTH_ISLE, IRON_ISLE];

/*
 * Mt. Coronet, and the rest.
 *
 * Coronet is not a mountain but a range, and it cuts the region in two from the
 * south coast to the northern snow: every crossing in Sinnoh is a crossing of
 * it. Drawn as a chain of ridges so it reads as a spine rather than a lump.
 */
/* The artwork already has these; ours would only sit on top of them. */
var RIDGES = [];

/* The artwork already has these; ours would only sit on top of them. */
var FORESTS = [];

var RIVERS = [
	[[238,-250],[228,-226],[220,-200],[208,-178],[196,-162],[180,-150],[160,-134],[144,-118]],  /* off Coronet to the south coast */
	[[246,-300],[262,-286],[280,-272],[298,-256],[308,-240]],                                    /* the Solaceon water             */
	[[134,-240],[120,-252],[108,-266],[100,-280]]                                                /* Floaroma to the ironworks      */
];

var LAKES = [
	{ x: 72, y:-148, r: 9 },   /* Verity */
	{ x:332, y:-162, r: 9 },   /* Valor  */
	{ x:286, y:-378, r: 8 },   /* Acuity */
	{ x:346, y:-184, r: 6 }    /* Sendoff Spring */
];

/*
 * Routes 201-230, as the games run them. A number is a promise in Sinnoh: 201
 * is the first field outside Twinleaf and 230 is open ocean, and everything in
 * between climbs.
 */
var ROUTES = [
	{n:201,path:[[107,-122],[107,-134],[112,-134],[118,-134],[123,-134],[133,-135]]},
	{n:202,path:[[133,-135],[129,-147],[133,-147],[136,-147],[140,-147],[127,-167]]},
	{n:203,path:[[127,-167],[148,-173],[153,-173],[159,-173],[157,-174]]},
	{n:204,path:[[127,-167],[134,-184],[134,-189],[134,-195],[134,-200],[133,-219]]},
	{n:205,path:[[133,-219],[146,-219],[146,-234],[172,-258],[189,-260]]},
	{n:206,path:[[181,-169],[185,-230],[185,-217],[185,-204],[185,-193]]},                       /* Cycling Road   */
	{n:207,path:[[179,-186],[184,-186],[190,-186],[195,-186],[200,-186],[220,-249]]},
	{n:208,path:[[220,-249],[223,-186],[228,-186],[234,-186],[239,-186],[256,-193]]},
	{n:209,path:[[256,-193],[277,-186],[282,-191],[288,-191],[293,-192],[295,-213]]},
	{n:210,path:[[295,-213],[289,-234],[289,-247],[279,-260],[252,-264]]},
	{n:211,path:[[189,-260],[212,-264],[217,-264],[234,-264],[239,-264],[252,-264]]},
	{n:212,path:[[256,-193],[254,-152],[267,-134],[280,-134],[308,-141]]},
	{n:213,path:[[308,-141],[332,-140],[342,-140],[351,-140],[347,-154]]},
	{n:214,path:[[347,-154],[354,-189],[354,-198],[354,-208],[347,-232]]},
	{n:215,path:[[347,-232],[323,-238],[314,-238],[304,-238],[295,-213]]},
	{n:216,path:[[220,-249],[188,-316],[197,-316],[206,-316],[215,-316],[217,-316]]},
	{n:217,path:[[185,-373],[185,-360],[185,-347],[185,-334],[211,-387]]},
	{n:218,path:[[81,-180],[96,-173],[101,-173],[107,-173],[127,-167]]},
	{n:219,path:[[133,-135],[129,-120],[133,-120],[136,-120],[140,-120],[142,-120]]},
	{n:220,path:[[127,-109],[133,-109],[138,-109],[144,-109],[149,-109],[153,-109]]},
	{n:221,path:[[156,-109],[162,-109],[168,-109],[173,-109],[185,-109]]},
	{n:222,path:[[412,-167],[388,-160],[379,-160],[369,-160],[347,-154]]},
	{n:223,path:[[412,-167],[406,-193],[406,-206],[406,-219],[395,-236]]},
	{n:224,path:[[405,-246],[419,-252],[425,-264],[432,-275],[431,-396]]},
	{n:225,path:[[321,-303],[315,-312],[315,-321],[315,-330],[315,-340],[328,-342]]},
	{n:226,path:[[328,-342],[345,-342],[355,-342],[364,-342],[392,-290]]},
	{n:227,path:[[328,-342],[366,-349],[366,-354],[366,-360],[366,-365],[366,-381]]},
	{n:228,path:[[392,-290],[380,-339],[380,-328],[380,-317],[380,-306]]},
	{n:229,path:[[392,-290],[395,-303],[390,-303],[384,-303],[379,-303],[321,-303]]},
	{n:230,path:[[321,-303],[343,-303],[353,-303],[362,-303],[371,-303],[412,-167]]}
];

/*
 * The short bits that are not routes: the walk out of Victory Road onto the
 * League's plateau, and the causeway Canalave is built across.
 */
/* The short joins: onto the League plateau, through the gate, into the marsh */
/* The short joins: onto the League plateau, through the gate, into the marsh */
var LINKS = [
	[[395,-236],[400,-241],[405,-246]],
	[[157,-174],[169,-171],[181,-169]],
	[[308,-141],[311,-147],[314,-153]],
];

/*
 * Tracks out to the places that are not on the way to anywhere. Where one
 * leaves a route inside another place's radius it says which route, because
 * geometry cannot tell "branches off Route 209" from "arrives at Solaceon".
 */
/* Side tracks, redrawn from where the places actually are */
/* Side tracks, redrawn from where the places actually are */
var TRAILS = [
	{ path:[[134,-189],[133,-188],[133,-187]], from:'r204' },
	[[133,-219],[146,-216],[157,-213]],
	{ path:[[146,-234],[139,-236],[134,-238]], from:'r205' },
	{ path:[[172,-258],[161,-258],[153,-258]], from:'r205' },
	[[153,-258],[157,-261],[161,-264]],
	{ path:[[185,-217],[189,-218],[191,-218]], from:'r206' },
	{ path:[[282,-191],[279,-195],[277,-198]], from:'r209' },
	[[295,-213],[301,-210],[305,-207]],
	{ path:[[308,-141],[312,-148],[314,-153]], from:'r213' },
	{ path:[[347,-154],[347,-162],[347,-167]], from:'r214' },
	{ path:[[354,-189],[365,-191],[373,-193]], from:'r214' },
	[[373,-193],[376,-197],[379,-201]],
	[[107,-122],[97,-132],[88,-141]],
	{ path:[[185,-373],[189,-381],[192,-387]], from:'r217' },
	[[211,-387],[217,-391],[221,-395]],
	[[220,-249],[222,-236],[224,-226]],
	[[224,-226],[267,-219],[302,-213]],
	{ path:[[431,-396],[431,-396],[431,-396]], from:'r224' },
	[[321,-303],[325,-310],[328,-316]],
	{ path:[[395,-236],[395,-236],[395,-236]], from:'r223' },
];

/* The artwork already has these; ours would only sit on top of them. */
var GRASS_PATCHES = [];

var PLACES = [
	/* ---------------------------------------------------------------- the south-west */
	{ id:'twinleaf', box:[30,22], name:'Twinleaf Town', x:107, y:-122, island:'Sinnoh', tier:'ZU', kind:'town',
	  blurb:'Two houses, a lot of grass and a view of the lake. Nothing happens here, which is the point: it is the last place you leave.',
	  facts:['Two families and no shop','No Pokemon Centre','Lake Verity is a walk west','Route 201 east to Sandgem'],
	  chans:['#twinleaf-town','#your-house','#rivals-house','#twinleaf-path'],
	  catch:['Normal','Bug','Flying'],
	  doing:['Leave home','Meet your rival','Walk to Lake Verity','Take Route 201 to the lab'],
	  live:['#twinleaf-town','#your-house'] },
	{ id:'lakeverity', box:[22,16], name:'Lake Verity', x:88, y:-141, island:'Sinnoh', tier:'ZU-PU', kind:'water',
	  blurb:'A ring of trees round still water, five minutes from home and the first place anyone tells you not to go alone. Something lives under it.',
	  facts:['Ringed by trees','Mesprit\'s lake','Fog off the water most mornings','A rowing boat nobody owns'],
	  chans:['#lake-verity','#verity-cavern'],
	  catch:['Water','Bug','Normal'],
	  doing:['Look at the water','Fish from the shore','Find the cavern mouth'],
	  live:['#lake-verity'],
	  hook:'People who stare too long at the lake come away certain of something, and cannot say what.' },
	{ id:'sandgem', box:[32,22], name:'Sandgem Town', x:133, y:-135, island:'Sinnoh', tier:'ZU', kind:'town',
	  blurb:'A beach, a Centre, and the lab where the region\'s Pokemon are counted. Everyone\'s first stamp in the Pokedex is issued here.',
	  facts:['Professor Rowan\'s laboratory','Pokemon Centre','Mart','No gym','The beach runs the whole south coast'],
	  chans:['#sandgem-town','#rowans-lab','#sandgem-beach','#sandgem-mart','#sandgem-centre'],
	  catch:['Normal','Water','Flying','Bug'],
	  doing:['Register your Pokedex','Heal and stock up','Walk the beach','Head north on Route 202'],
	  live:['#sandgem-town','#rowans-lab'] },
	{ id:'palpark', box:[26,18], name:'Pal Park', x:185, y:-109, island:'Sinnoh', tier:'PU', kind:'wild',
	  blurb:'A fenced reserve on the south-western cape where Pokemon from elsewhere are released and caught again. Half sanctuary, half paperwork.',
	  facts:['Six catches a visit','Fields, forest, pond and mountain in one fence','Reached only by water'],
	  chans:['#pal-park','#the-enclosures'],
	  catch:['Normal','Grass','Water','Bug'],
	  doing:['Run a catching contest','Walk the enclosures'],
	  live:['#pal-park'] },
	/* ---------------------------------------------------------------- the west */
	{ id:'jubilife', box:[40,30], name:'Jubilife City', x:127, y:-167, island:'Sinnoh', tier:'ZU-PU', kind:'town',
	  blurb:'The biggest city in Sinnoh and the first one anybody sees: television, trade, and four roads out. No gym, which surprises everyone.',
	  facts:['The Global Trade Station','Jubilife TV','Pokétch Company','Trainers\' School','No gym','Four roads out'],
	  chans:['#jubilife-city','#jubilife-tv','#global-trade','#poketch-co','#trainers-school','#jubilife-centre','#jubilife-mart'],
	  catch:['Normal','Flying','Electric'],
	  doing:['Collect the Pokétch','Trade at the GTS','Sit an exam at the school','Pick a road'],
	  live:['#jubilife-city','#jubilife-tv','#global-trade'] },
	{ id:'ravagedpath', box:[20,14], name:'Ravaged Path', x:133, y:-187, island:'Sinnoh', tier:'ZU-PU', kind:'cave',
	  blurb:'A short cave with a stream through it and a rockfall halfway. Everyone comes through twice: once blocked, once not.',
	  facts:['Water runs through it','A rockfall bars the far end','Short enough to hear both ends'],
	  chans:['#ravaged-path'],
	  catch:['Water','Rock','Normal'],
	  doing:['Wade through','Break the fall when you can'],
	  live:['#ravaged-path'] },
	{ id:'canalave', box:[36,26], name:'Canalave City', x:81, y:-180, island:'Sinnoh', tier:'RU', kind:'gym', gym:'STEEL GYM',
	  blurb:'A working port split by a canal, with a drawbridge in the middle and a library nobody visits for fun. Iron goes out, ore comes in.',
	  facts:['Steel gym - Byron','Canalave Library','The drawbridge','Ferry to Iron Island','Shipyards'],
	  chans:['#canalave-city','#canalave-gym','#canalave-library','#the-drawbridge','#canalave-docks','#canalave-centre','#sailors-berth'],
	  catch:['Steel','Water','Flying'],
	  doing:['Challenge Byron','Read the three books','Take the ferry','Ask the sailor about the islands'],
	  live:['#canalave-city','#canalave-gym','#canalave-library'],
	  hook:'The sailor at the berth has a sick child and will not take you anywhere until that is dealt with.' },
	{ id:'ironisland', box:[26,18], name:'Iron Island', x:107, y:-277, island:'Sinnoh', tier:'NU', kind:'wild',
	  blurb:'A worked-out mine on a rock in the sea. The shafts still go down further than the lights do.',
	  facts:['A disused iron mine','Three levels and a shore','Ferry from Canalave only'],
	  chans:['#iron-island','#the-shafts','#lower-levels'],
	  catch:['Steel','Rock','Ground','Fighting'],
	  doing:['Work down through the shafts','Train with whoever is already here'],
	  live:['#iron-island','#the-shafts'] },
	{ id:'fullmoon', box:[22,16], name:'Fullmoon Island', x:81, y:-368, island:'Sinnoh', tier:'OU-UBER', kind:'legend', rank:1,
	  blurb:'A wooded islet with a clearing in the middle, and in the clearing something that is always asleep and always watching.',
	  facts:['Cresselia\'s clearing','No landing stage - you wade','Only the Canalave sailor comes here'],
	  chans:['#fullmoon-island','#the-clearing'],
	  catch:['Psychic','Fairy','Flying'],
	  doing:['Reach the clearing','Take what is left behind'],
	  live:['#fullmoon-island'] },
	{ id:'newmoon', box:[22,16], name:'Newmoon Island', x:120, y:-368, island:'Sinnoh', tier:'OU-UBER', kind:'legend', rank:1, gate:'INVITATION',
	  blurb:'Black rock, dead trees, and no charts that admit it exists. Whatever the sailor is frightened of, it is here.',
	  facts:['Not on any chart','Nothing grows','Darkrai\'s island'],
	  chans:['#newmoon-island','#the-dead-grove'],
	  catch:['Dark','Ghost'],
	  doing:['Get here at all','Leave before dark'],
	  live:['#newmoon-island'] },
	/* ---------------------------------------------------------------- the first badges */
	{ id:'oreburghgate', box:[22,16], name:'Oreburgh Gate', x:157, y:-174, island:'Sinnoh', tier:'PU', kind:'cave',
	  blurb:'The tunnel under the first shoulder of Coronet. Two levels, water on the lower one, and the only way east until you can climb.',
	  facts:['Two levels','Underground water','Links Jubilife to Oreburgh'],
	  chans:['#oreburgh-gate','#gate-lower-level'],
	  catch:['Rock','Ground','Zubat','Water'],
	  doing:['Cross to Oreburgh','Come back for the lower level'],
	  live:['#oreburgh-gate'] },
	{ id:'oreburgh', box:[36,26], name:'Oreburgh City', x:181, y:-169, island:'Sinnoh', tier:'PU', kind:'gym', gym:'ROCK GYM',
	  blurb:'A coal and ore town built into the side of the mountain, working round the clock. The gym leader is usually down the mine.',
	  facts:['Rock gym - Roark','The Oreburgh Mine','Mining Museum','Cycling Road north','Pokemon Centre'],
	  chans:['#oreburgh-city','#oreburgh-gym','#oreburgh-mine','#mining-museum','#oreburgh-centre','#oreburgh-mart'],
	  catch:['Rock','Ground','Steel','Fire'],
	  doing:['Fetch Roark out of the mine','Take the Coal Badge','Dig for a fossil','Ride the Cycling Road'],
	  live:['#oreburgh-city','#oreburgh-gym','#oreburgh-mine'] },
	{ id:'waywardcave', box:[22,16], name:'Wayward Cave', x:191, y:-218, island:'Sinnoh', tier:'NU', kind:'cave',
	  blurb:'Under the Cycling Road, and larger underneath than the hill above it looks. The lower half is unlit and easy to lose yourself in.',
	  facts:['Beneath the Cycling Road','A hidden lower entrance','No light below'],
	  chans:['#wayward-cave','#wayward-lower'],
	  catch:['Ground','Rock','Steel'],
	  doing:['Find the second entrance','Get out again'],
	  live:['#wayward-cave'] },
	{ id:'floaroma', box:[32,22], name:'Floaroma Town', x:133, y:-219, island:'Sinnoh', tier:'PU', kind:'town',
	  blurb:'A town of flower meadows on ground that was bare a generation ago. People come for the honey and the smell, and stay for neither.',
	  facts:['Flower Shop','Floaroma Meadow','Honey sellers','No gym','Windworks to the east'],
	  chans:['#floaroma-town','#floaroma-meadow','#flower-shop','#honey-stalls'],
	  catch:['Grass','Bug','Fairy','Flying'],
	  doing:['Buy honey','Walk the meadow','Ask why the Windworks is shut'],
	  live:['#floaroma-town','#floaroma-meadow'] },
	{ id:'windworks', box:[26,18], name:'Valley Windworks', x:157, y:-213, island:'Sinnoh', tier:'PU', kind:'wild',
	  blurb:'The power station for half of western Sinnoh, turbines turning in a valley that always has wind. Currently occupied by people with no business in it.',
	  facts:['Powers the west','Wind turbines','Occupied by Team Galactic','A staff door round the back'],
	  chans:['#valley-windworks','#the-turbine-hall'],
	  catch:['Electric','Normal','Flying'],
	  doing:['Get inside','Find out who is running it','Put the power back on'],
	  live:['#valley-windworks','#the-turbine-hall'],
	  hook:'The manager is locked in his own office and his daughter has the key.' },
	{ id:'fuego', box:[24,18], name:'Fuego Ironworks', x:134, y:-238, island:'Sinnoh', tier:'NU', kind:'wild',
	  blurb:'A working foundry out on its own by the water, hot enough at the door to feel from the path. They will sell you what comes off the floor.',
	  facts:['A working foundry','Reached across water','Shards and slag worth taking'],
	  chans:['#fuego-ironworks','#the-furnace-floor'],
	  catch:['Fire','Steel','Bug'],
	  doing:['Cross to the door','Trade for shards'],
	  live:['#fuego-ironworks'] },
	{ id:'eternaforest', box:[30,22], name:'Eterna Forest', x:153, y:-258, island:'Sinnoh', tier:'PU-NU', kind:'wild',
	  blurb:'Old woodland with a path through it that takes longer than the map says. It is not far. It only feels far.',
	  facts:['Between Floaroma and Eterna','Old growth, no light at the floor','The Chateau stands inside it'],
	  chans:['#eterna-forest','#forest-path'],
	  catch:['Bug','Grass','Poison','Psychic'],
	  doing:['Walk through with a companion','Find the Chateau','Collect from the honey trees'],
	  live:['#eterna-forest','#forest-path'] },
	{ id:'chateau', box:[24,18], name:'The Old Chateau', x:161, y:-264, island:'Sinnoh', tier:'RU', kind:'wild',
	  blurb:'A great empty house in the middle of the forest, fully furnished and perfectly clean. Nobody has lived here in a very long time.',
	  facts:['Furnished and abandoned','The dining room lights itself','Things move between rooms'],
	  chans:['#the-old-chateau','#chateau-hall','#the-far-bedroom'],
	  catch:['Ghost','Poison','Normal'],
	  doing:['Go in after dark','Look at the television','Reach the far bedroom'],
	  live:['#the-old-chateau','#chateau-hall'],
	  hook:'Everything in the house is dusted. Nobody will say by whom.' },
	{ id:'eterna', box:[38,28], name:'Eterna City', x:189, y:-260, island:'Sinnoh', tier:'NU', kind:'gym', gym:'GRASS GYM',
	  blurb:'The oldest city in Sinnoh, built round a statue of something nobody can name. Ivy on everything, and a bicycle shop.',
	  facts:['Grass gym - Gardenia','The statue in the square','Cycle Shop','Galactic Eterna Building','Underground Man\'s house'],
	  chans:['#eterna-city','#eterna-gym','#the-statue','#cycle-shop','#galactic-eterna','#eterna-centre','#eterna-mart'],
	  catch:['Grass','Bug','Poison','Psychic'],
	  doing:['Challenge Gardenia','Buy a bicycle','Look into the Galactic building','Read the statue\'s plaque'],
	  live:['#eterna-city','#eterna-gym','#the-statue'],
	  hook:'The statue has two heads and the plaque has been re-cut at least once.' },
	/* ---------------------------------------------------------------- the middle */
	{ id:'coronet', box:[40,34], name:'Mt. Coronet', x:220, y:-249, island:'Sinnoh', tier:'UU', kind:'peak', gate:'STRENGTH / ROCK CLIMB',
	  blurb:'Not a mountain but the mountain: the range that splits Sinnoh top to bottom. Every road east crosses it somewhere, and none of them crosses it easily.',
	  facts:['Splits the region in two','Four ways in, at four heights','Snow above the waist of it','Spear Pillar at the top'],
	  chans:['#mt-coronet','#coronet-lower','#the-summit-path'],
	  catch:['Rock','Ground','Steel','Ice','Psychic'],
	  doing:['Cross from one side to the other','Climb for the summit','Find the waterfall room'],
	  live:['#mt-coronet','#coronet-lower'] },
	{ id:'hearthome', box:[42,30], name:'Hearthome City', x:256, y:-193, island:'Sinnoh', tier:'NU', kind:'gym', gym:'GHOST GYM',
	  blurb:'The friendliest city in the region and the one built round a cathedral. Contests here matter more to some people than badges.',
	  facts:['Ghost gym - Fantina','Contest Hall','Amity Square','Foreign Building','Pokemon Centre','The crossroads of Sinnoh'],
	  chans:['#hearthome-city','#hearthome-gym','#contest-hall','#amity-square','#the-foreign-building','#hearthome-centre','#hearthome-mart'],
	  catch:['Ghost','Normal','Psychic','Fairy'],
	  doing:['Challenge Fantina','Enter a contest','Walk a Pokemon round Amity Square','Take one of the five roads'],
	  live:['#hearthome-city','#hearthome-gym','#contest-hall'] },
	{ id:'losttower', box:[24,18], name:'Lost Tower', x:277, y:-198, island:'Sinnoh', tier:'NU', kind:'wild',
	  blurb:'Five floors of graves for Pokemon, kept by two old women who have been there longer than anyone can account for.',
	  facts:['Five floors of memorials','Two keepers','Flowers left at every landing'],
	  chans:['#lost-tower','#the-top-floor'],
	  catch:['Ghost','Normal','Flying'],
	  doing:['Climb to the top','Leave something','Listen to the keepers'],
	  live:['#lost-tower'] },
	{ id:'solaceon', box:[32,22], name:'Solaceon Town', x:295, y:-213, island:'Sinnoh', tier:'NU', kind:'town',
	  blurb:'A quiet farming town with a day care and a hole in the ground full of writing older than the region.',
	  facts:['Pokemon Day Care','The Solaceon Ruins','News Press','No gym'],
	  chans:['#solaceon-town','#solaceon-day-care','#news-press','#solaceon-centre'],
	  catch:['Normal','Ground','Psychic'],
	  doing:['Leave a pair at the Day Care','Go down into the ruins','Sell a story to the Press'],
	  live:['#solaceon-town','#solaceon-day-care'] },
	{ id:'solaceonruins', box:[26,18], name:'Solaceon Ruins', x:305, y:-207, island:'Sinnoh', tier:'RU', kind:'wild',
	  blurb:'A maze of chambers under the fields, walls covered in a script that is only an alphabet if you already know it is one.',
	  facts:['Chambers on three levels','Written walls','The Unown live in it'],
	  chans:['#solaceon-ruins','#the-written-chambers'],
	  catch:['Psychic'],
	  doing:['Map the chambers','Collect the alphabet','Read the far wall'],
	  live:['#solaceon-ruins'],
	  hook:'The far wall is a sentence. It is not finished.' },
	{ id:'veilstone', box:[40,30], name:'Veilstone City', x:347, y:-232, island:'Sinnoh', tier:'RU', kind:'gym', gym:'FIGHTING GYM',
	  blurb:'Built in a bowl of enormous standing stones on the eastern coast. Department store, game corner, and the headquarters of something worse.',
	  facts:['Fighting gym - Maylene','Veilstone Department Store','Game Corner','Galactic Veilstone Building','The meteorites'],
	  chans:['#veilstone-city','#veilstone-gym','#department-store','#game-corner','#galactic-hq','#the-meteorites','#veilstone-centre'],
	  catch:['Fighting','Rock','Steel','Normal'],
	  doing:['Challenge Maylene','Shop the department store','Look at the meteorites','Get into the Galactic building'],
	  live:['#veilstone-city','#veilstone-gym','#galactic-hq'],
	  hook:'The meteorites in the square are missing two, and the holes are recent.' },
	/* ---------------------------------------------------------------- the south-east */
	{ id:'pastoria', box:[36,26], name:'Pastoria City', x:308, y:-141, island:'Sinnoh', tier:'RU', kind:'gym', gym:'WATER GYM',
	  blurb:'A town on stilts at the edge of the marsh, wet underfoot most of the year. The gym is half aquarium.',
	  facts:['Water gym - Crasher Wake','The Great Marsh','Croagunk Festival','Built on stilts'],
	  chans:['#pastoria-city','#pastoria-gym','#croagunk-festival','#pastoria-centre','#pastoria-mart'],
	  catch:['Water','Poison','Bug','Ground'],
	  doing:['Challenge Crasher Wake','Ride the marsh tram','Watch the festival'],
	  live:['#pastoria-city','#pastoria-gym'] },
	{ id:'greatmarsh', box:[34,24], name:'The Great Marsh', x:314, y:-153, island:'Sinnoh', tier:'RU', kind:'wild',
	  blurb:'A protected wetland crossed by a tram and a set of duckboards. Thirty minutes, a handful of bait balls, and whatever you can reach.',
	  facts:['Safari rules - bait and mud, not battles','Six areas, reached by tram','The residents change daily','Binocular towers'],
	  chans:['#the-great-marsh','#marsh-tram','#observation-tower'],
	  catch:['Water','Bug','Poison','Ground','Flying'],
	  doing:['Take the tram out','Throw mud, throw bait','Spot from the tower'],
	  live:['#the-great-marsh'] },
	{ id:'valorlakefront', box:[30,20], name:'Valor Lakefront', x:347, y:-154, island:'Sinnoh', tier:'RU', kind:'town',
	  blurb:'A hotel, a restaurant and a car park on the shore of the biggest lake in Sinnoh. The season is short and everyone here is passing through.',
	  facts:['Hotel Grand Lake','Seven Stars Restaurant','The gate to Lake Valor','Four roads meet here'],
	  chans:['#valor-lakefront','#hotel-grand-lake','#seven-stars','#lakefront-road'],
	  catch:['Water','Normal','Flying'],
	  doing:['Take a room','Eat at the Seven Stars','Walk down to the lake'],
	  live:['#valor-lakefront','#hotel-grand-lake'] },
	{ id:'lakevalor', box:[26,18], name:'Lake Valor', x:347, y:-167, island:'Sinnoh', tier:'RU', kind:'water',
	  blurb:'The largest of the three lakes, with an island in the middle of it and a cavern under the island.',
	  facts:['An island at its centre','Azelf\'s cavern','Deepest of the three lakes'],
	  chans:['#lake-valor','#valor-cavern'],
	  catch:['Water','Psychic','Normal'],
	  doing:['Cross to the island','Go down into the cavern'],
	  live:['#lake-valor'] },
	{ id:'sendoff', box:[24,18], name:'Sendoff Spring', x:373, y:-193, island:'Sinnoh', tier:'OU', kind:'water', gate:'NATIONAL DEX',
	  blurb:'A still pool behind the mountain that no road reaches and no sign mentions. Things that are finished come here.',
	  facts:['No marked road in','Water that never moves','Turnback Cave opens off it'],
	  chans:['#sendoff-spring','#the-still-pool'],
	  catch:['Water','Ghost','Dark'],
	  doing:['Find the way in','Stand at the pool','Go on to Turnback'],
	  live:['#sendoff-spring'] },
	{ id:'turnback', box:[26,18], name:'Turnback Cave', x:379, y:-201, island:'Sinnoh', tier:'OU-UBER', kind:'wild', rank:1, gate:'NATIONAL DEX',
	  blurb:'Rooms that are not in the same order twice and three pillars that have to be found before the way on opens. Named for the sensible thing to do.',
	  facts:['The rooms rearrange','Three pillars','Giratina is behind it'],
	  chans:['#turnback-cave','#the-three-pillars'],
	  catch:['Ghost','Dark','Dragon'],
	  doing:['Find all three pillars','Keep count of the rooms','Turn back'],
	  live:['#turnback-cave'] },
	{ id:'sunyshore', box:[40,28], name:'Sunyshore City', x:412, y:-167, island:'Sinnoh', tier:'UU', kind:'gym', gym:'ELECTRIC GYM',
	  blurb:'The far south-east: a city of raised solar walkways over the sea, a lighthouse at the end, and the last badge in Sinnoh.',
	  facts:['Electric gym - Volkner','Vista Lighthouse','Solar walkways above the streets','Market','The last badge'],
	  chans:['#sunyshore-city','#sunyshore-gym','#vista-lighthouse','#the-walkways','#sunyshore-market','#sunyshore-centre'],
	  catch:['Electric','Water','Flying','Steel'],
	  doing:['Challenge Volkner','Climb the lighthouse','Walk the solar paths','Take Route 223 north'],
	  live:['#sunyshore-city','#sunyshore-gym','#vista-lighthouse'],
	  hook:'Volkner has not had a real battle in a year and has stopped pretending to care.' },
	/* ---------------------------------------------------------------- the north */
	{ id:'celestic', box:[32,22], name:'Celestic Town', x:252, y:-264, island:'Sinnoh', tier:'UU', kind:'town',
	  blurb:'A small town in a hollow round a shrine, where the region\'s oldest story is painted on a cave wall and still believed.',
	  facts:['The Celestic ruins and their painting','Cynthia\'s grandmother lives here','Shrine in the centre','No gym'],
	  chans:['#celestic-town','#celestic-ruins','#the-shrine','#grandmothers-house'],
	  catch:['Rock','Ground','Psychic','Flying'],
	  doing:['See the painting','Hear the story properly','Take Route 210 or 211'],
	  live:['#celestic-town','#celestic-ruins'],
	  hook:'The painting shows three creatures and one more behind them, painted over at least once.' },
	{ id:'spearpillar', box:[30,22], name:'Spear Pillar', x:224, y:-226, island:'Sinnoh', tier:'OU-UBER', kind:'peak', rank:1, gate:'8 BADGES / CLIMB',
	  blurb:'Pillars and a flat stone floor at the top of Mt. Coronet, above the weather. The oldest place in Sinnoh and the thinnest.',
	  facts:['At the summit of Mt. Coronet','Older than any building in the region','Where the world can be taken apart'],
	  chans:['#spear-pillar','#the-pillars'],
	  catch:['Dragon','Steel','Psychic','Ice'],
	  doing:['Climb the last stair','Stand between the pillars','Stop what is being done here'],
	  live:['#spear-pillar','#the-pillars'] },
	{ id:'distortion', box:[30,22], name:'The Distortion World', x:302, y:-213, island:'Sinnoh', tier:'UBER', kind:'legend', rank:1, gate:'STORY',
	  blurb:'Not a place in Sinnoh so much as the other side of it: gravity by the piece, no sky, and the region visible a long way off and wrong.',
	  facts:['Reached only from Spear Pillar','Gravity is local','Nothing grows and nothing ends'],
	  chans:['#the-distortion-world','#broken-ground'],
	  catch:['Ghost','Dragon','Dark'],
	  doing:['Get in','Find your footing','Get out'],
	  live:['#the-distortion-world'] },
	{ id:'lakeacuity', box:[26,18], name:'Lake Acuity', x:192, y:-387, island:'Sinnoh', tier:'UU', kind:'water',
	  blurb:'The northern lake, frozen at the edges most of the year, in snow too thick to see the far shore through.',
	  facts:['Frozen margins','Uxie\'s cavern','Snow year-round'],
	  chans:['#lake-acuity','#acuity-cavern'],
	  catch:['Ice','Water','Psychic'],
	  doing:['Reach the shore in the blizzard','Go down into the cavern'],
	  live:['#lake-acuity'] },
	{ id:'snowpoint', box:[38,26], name:'Snowpoint City', x:211, y:-387, island:'Sinnoh', tier:'UU', kind:'gym', gym:'ICE GYM',
	  blurb:'The far north, snowbound, reached by one road and one boat. A temple stands behind the town that the town does not talk about.',
	  facts:['Ice gym - Candice','Snowpoint Temple','The harbour for the Battle Zone','Snow every day of the year'],
	  chans:['#snowpoint-city','#snowpoint-gym','#snowpoint-harbour','#snowpoint-centre','#snowpoint-mart'],
	  catch:['Ice','Steel','Normal','Flying'],
	  doing:['Challenge Candice','Ask about the temple','Take the boat north'],
	  live:['#snowpoint-city','#snowpoint-gym'] },
	{ id:'snowpointtemple', box:[26,18], name:'Snowpoint Temple', x:221, y:-395, island:'Sinnoh', tier:'OU', kind:'wild', gate:'8 BADGES',
	  blurb:'Five floors down into the ice behind the town, built to hold something in rather than keep anyone out.',
	  facts:['Five floors below ground','Ice underfoot on every one','Regigigas is at the bottom'],
	  chans:['#snowpoint-temple','#the-bottom-floor'],
	  catch:['Ice','Rock','Steel'],
	  doing:['Get the doors opened','Work down the floors','Read what is cut into the walls'],
	  live:['#snowpoint-temple'] },
	/* ---------------------------------------------------------------- the League */
	{ id:'sinnohvictory', box:[34,26], name:'Victory Road', x:395, y:-236, island:'Sinnoh', tier:'OU', kind:'peak', gate:'8 BADGES',
	  blurb:'The last climb: a cave through the eastern shoulder with everybody in it having the same idea as you.',
	  facts:['Eight badges to enter','Boulders, waterfalls and dark','The only way to the League'],
	  chans:['#victory-road-sinnoh','#the-waterfall-level','#the-last-climb'],
	  catch:['Rock','Ground','Fighting','Dragon','Steel'],
	  doing:['Climb it','Beat whoever is waiting','Come out on the plateau'],
	  live:['#victory-road-sinnoh'] },
	{ id:'sinnohleague', box:[40,28], name:'Sinnoh League', x:405, y:-246, island:'Sinnoh', tier:'ELITE FOUR', kind:'town', gym:'ELITE FOUR',
	  blurb:'A hall on the plateau above Victory Road: four rooms in a row and one at the end, and no way back through once a door shuts.',
	  facts:['Aaron, Bertha, Flint, Lucian','Cynthia is Champion','Centre and Mart at the gate','One attempt at a time'],
	  chans:['#league-gate','#sinnoh-league-centre','#sinnoh-league-mart','#hall-of-aaron','#hall-of-bertha','#hall-of-flint','#hall-of-lucian','#champions-room','#sinnoh-hall-of-fame'],
	  catch:[],
	  doing:['Heal before the door','Take the four in order','Face Cynthia'],
	  live:['#league-gate','#champions-room'] },
	{ id:'flowerparadise', box:[26,18], name:'Flower Paradise', x:431, y:-396, island:'Sinnoh', tier:'UBER', kind:'legend', rank:1, gate:'STORY',
	  blurb:'An island of flowers at the end of a path across the sea that is only there when it is. Shaymin sleeps in it.',
	  facts:['Reached by the Seabreak Path','Flowers out of season, always','Shaymin\'s meadow'],
	  chans:['#flower-paradise','#seabreak-path'],
	  catch:['Grass','Fairy','Flying'],
	  doing:['Walk the Seabreak Path','Find the meadow'],
	  live:['#flower-paradise'] },
	/* ---------------------------------------------------------------- the Battle Zone */
	{ id:'battlefrontier', box:[32,22], name:'Battle Frontier', x:328, y:-316, island:'Battle Zone', tier:'OU', kind:'town', gate:'LEAGUE BEATEN',
	  blurb:'Five facilities on their own island, each with its own rules and none of them yours. Badges count for nothing here.',
	  facts:['Tower, Factory, Hall, Castle, Arcade','Frontier Brains','Print points, not badges'],
	  chans:['#battle-frontier','#battle-tower','#battle-factory','#battle-hall','#battle-castle','#battle-arcade'],
	  catch:[],
	  doing:['Pick a facility','Take a streak as far as it goes','Beat a Brain'],
	  live:['#battle-frontier','#battle-tower'] },
	{ id:'fightarea', box:[32,22], name:'Fight Area', x:321, y:-303, island:'Battle Zone', tier:'OU', kind:'town', gate:'LEAGUE BEATEN',
	  blurb:'Where the boat from Snowpoint puts you down. A Centre, a Mart, and people who came here because home stopped being difficult.',
	  facts:['The landing from Snowpoint','Pokemon Centre and Mart','Nobody here is new'],
	  chans:['#fight-area','#the-landing','#fight-area-centre','#fight-area-mart'],
	  catch:['Fighting','Normal','Flying','Fire'],
	  doing:['Get off the boat','Find out who is worth battling','Head for the Frontier or the north'],
	  live:['#fight-area','#the-landing'] },
	{ id:'survivalarea', box:[32,22], name:'Survival Area', x:328, y:-342, island:'Battle Zone', tier:'OU', kind:'town', gate:'LEAGUE BEATEN',
	  blurb:'Further in and higher up, at the foot of the road to Stark Mountain. The name is not a joke anybody here makes.',
	  facts:['At the foot of Route 227','Centre and Mart','The way to Stark Mountain'],
	  chans:['#survival-area','#survival-centre','#the-227-road'],
	  catch:['Fighting','Ground','Fire','Rock'],
	  doing:['Stock up properly','Take Route 227','Come back down'],
	  live:['#survival-area'] },
	{ id:'resortarea', box:[32,22], name:'Resort Area', x:392, y:-290, island:'Battle Zone', tier:'OU', kind:'town', gate:'LEAGUE BEATEN',
	  blurb:'The comfortable corner of an uncomfortable island: a hot spring, a large villa and a beach, with the desert road starting behind it.',
	  facts:['The Ribbon Syndicate','The Villa','Hot spring','Route 228 runs into the sand'],
	  chans:['#resort-area','#the-villa','#the-hot-spring','#ribbon-syndicate'],
	  catch:['Water','Normal','Flying'],
	  doing:['Take the spring','Furnish the Villa','Get into the Syndicate'],
	  live:['#resort-area','#the-villa'] },
	{ id:'starkmountain', box:[32,24], name:'Stark Mountain', x:366, y:-381, island:'Battle Zone', tier:'UBER', kind:'peak', rank:1, gate:'LEAGUE BEATEN',
	  blurb:'A live volcano at the top of the island, hot enough inside that the rock is soft in places. Heatran is in the chamber at the heart of it.',
	  facts:['Live volcano','The inner chamber is sealed','Heatran','Nobody goes in alone'],
	  chans:['#stark-mountain','#the-inner-chamber'],
	  catch:['Fire','Rock','Ground','Steel'],
	  doing:['Work in through the outer caves','Get the chamber open','Deal with what is in it'],
	  live:['#stark-mountain','#the-inner-chamber'] }
];

var ROUTE_INFO = {
	201:{ kind:'main', name:'Route 201', from:'Twinleaf Town', to:'Sandgem Town', tier:'ZU', walk:'Easy',
	      blurb:'Grass, a fence and the lake path turning off west. Nobody\'s first road is longer than this one feels.',
	      catch:['Normal','Bug','Flying'], doing:['Catch your first','Turn off for Lake Verity'] },
	202:{ kind:'main', name:'Route 202', from:'Sandgem Town', to:'Jubilife City', tier:'ZU', walk:'Easy',
	      blurb:'Long grass either side of a made road, and the first trainers who will not let you past.',
	      catch:['Normal','Bug','Flying','Electric'], doing:['Learn to catch properly','Battle the youngsters'] },
	203:{ kind:'main', name:'Route 203', from:'Jubilife City', to:'Oreburgh Gate', tier:'ZU-PU', walk:'Easy',
	      blurb:'East out of the city until the ground lifts and the gate is the only way on.',
	      catch:['Normal','Flying','Fighting'], doing:['Battle your rival','Reach the gate'] },
	204:{ kind:'main', name:'Route 204', from:'Jubilife City', to:'Floaroma Town', tier:'ZU-PU', walk:'Easy',
	      blurb:'North through the Ravaged Path and out into flowers on the far side.',
	      catch:['Normal','Bug','Grass','Water'], doing:['Cut through the Ravaged Path','Come out in the meadow'] },
	205:{ kind:'main', name:'Route 205', from:'Floaroma Town', to:'Eterna City', tier:'PU-NU', walk:'Long',
	      blurb:'Past the Windworks, over the water by the ironworks, and then the forest, which takes as long again.',
	      catch:['Bug','Grass','Water','Fire'], doing:['Pass the Windworks','Cross to Fuego','Walk the forest'] },
	206:{ kind:'main', name:'Cycling Road', from:'Oreburgh City', to:'Route 207', tier:'PU-NU', walk:'Bicycle only',
	      blurb:'A raised road for bicycles with the whole valley under it, and a cave underneath that is not on the sign.',
	      catch:['Normal','Flying','Ground'], doing:['Ride it downhill','Find the way into Wayward Cave'] },
	207:{ kind:'main', name:'Route 207', from:'Cycling Road', to:'Mt. Coronet', tier:'NU', walk:'Rough',
	      blurb:'Loose scree on the shoulder of the mountain. The first honest climb in Sinnoh.',
	      catch:['Ground','Rock','Normal'], doing:['Pick a line up the scree','Reach the Coronet door'] },
	208:{ kind:'main', name:'Route 208', from:'Mt. Coronet', to:'Hearthome City', tier:'NU', walk:'Easy',
	      blurb:'Down off the mountain along a river, orchards and a berry-grower\'s house, and then the city.',
	      catch:['Normal','Water','Bug'], doing:['Follow the river down','Buy berries'] },
	209:{ kind:'main', name:'Route 209', from:'Hearthome City', to:'Solaceon Town', tier:'NU', walk:'Easy',
	      blurb:'Open country with a bell tower in the middle of it and a graveyard tower further on.',
	      catch:['Normal','Flying','Ghost','Water'], doing:['Ring the bell','Climb the Lost Tower'] },
	210:{ kind:'main', name:'Route 210', from:'Solaceon Town', to:'Celestic Town', tier:'UU', walk:'Fog',
	      blurb:'The fog on the northern half does not lift, and the herd in the road will not move for you.',
	      catch:['Normal','Grass','Flying','Ground'], doing:['Get past the herd','Walk the fog on a bearing'] },
	211:{ kind:'main', name:'Route 211', from:'Eterna City', to:'Celestic Town', tier:'NU-RU', walk:'Crosses Coronet',
	      blurb:'East out of Eterna and straight through the mountain, in one side and out the other.',
	      catch:['Normal','Flying','Rock','Fighting'], doing:['Cross Mt. Coronet','Come down into Celestic'] },
	212:{ kind:'main', name:'Route 212', from:'Hearthome City', to:'Pastoria City', tier:'RU', walk:'Rain',
	      blurb:'South into weather that gets wetter the further you go, until the road is mud and then marsh.',
	      catch:['Water','Bug','Normal','Poison'], doing:['Walk it in the rain','Reach the mansion','Come out at the marsh'] },
	213:{ kind:'main', name:'Route 213', from:'Pastoria City', to:'Valor Lakefront', tier:'RU', walk:'Easy',
	      blurb:'A beach road along the south coast, holiday houses and a lot of people fishing badly.',
	      catch:['Water','Normal','Flying'], doing:['Walk the beach','Turn off for the Marsh'] },
	214:{ kind:'main', name:'Route 214', from:'Valor Lakefront', to:'Veilstone City', tier:'RU', walk:'Rough',
	      blurb:'Up off the lakefront onto broken ground, with a hole in the hillside that goes somewhere nobody signposts.',
	      catch:['Ground','Rock','Normal','Dark'], doing:['Climb to Veilstone','Find the way to Sendoff Spring'] },
	215:{ kind:'main', name:'Route 215', from:'Veilstone City', to:'Solaceon Town', tier:'RU', walk:'Rain',
	      blurb:'Permanent drizzle and a line of trainers who all fight the same way and all mean it.',
	      catch:['Fighting','Normal','Water'], doing:['Fight the line','Get out of the rain'] },
	216:{ kind:'main', name:'Route 216', from:'Mt. Coronet', to:'Route 217', tier:'UU', walk:'Snow',
	      blurb:'Out of the north face into snow, and the snow does not stop again until Snowpoint.',
	      catch:['Ice','Normal','Steel'], doing:['Get clear of the mountain','Keep moving'] },
	217:{ kind:'main', name:'Route 217', from:'Route 216', to:'Snowpoint City', tier:'UU', walk:'Blizzard',
	      blurb:'Blizzard the whole way, drifts to the waist, and a lake somewhere off to the right that you will not see.',
	      catch:['Ice','Steel','Normal','Ghost'], doing:['Follow the posts','Turn off for Lake Acuity','Reach Snowpoint'] },
	218:{ kind:'main', name:'Route 218', from:'Canalave City', to:'Jubilife City', tier:'PU-NU', walk:'Water crossing',
	      blurb:'A causeway and a stretch of open water between the port and the city. Surf or wait for the tide.',
	      catch:['Water','Flying','Steel'], doing:['Cross the water','Reach the drawbridge'] },
	219:{ kind:'side', name:'Route 219', from:'Sandgem Town', to:'Route 220', tier:'PU', walk:'Surf',
	      blurb:'South off the Sandgem beach into open water with nothing in it but fishermen.',
	      catch:['Water','Flying'], doing:['Surf south','Fish the deep water'] },
	220:{ kind:'side', name:'Route 220', from:'Route 219', to:'Route 221', tier:'PU-NU', walk:'Surf',
	      blurb:'Deep water off the southern cape, out of sight of both shores for a while.',
	      catch:['Water','Flying'], doing:['Keep west','Fish'] },
	221:{ kind:'side', name:'Route 221', from:'Route 220', to:'Pal Park', tier:'NU', walk:'Easy',
	      blurb:'Back on land on the south-western cape, a lane of small fields up to the park gates.',
	      catch:['Normal','Grass','Flying'], doing:['Walk up to the gates'] },
	222:{ kind:'main', name:'Route 222', from:'Sunyshore City', to:'Valor Lakefront', tier:'UU', walk:'Easy',
	      blurb:'The coast road west of Sunyshore, power lines overhead the whole way.',
	      catch:['Electric','Water','Normal'], doing:['Follow the lines','Fish off the rocks'] },
	223:{ kind:'main', name:'Route 223', from:'Sunyshore City', to:'Victory Road', tier:'OU', walk:'Surf',
	      blurb:'Open sea north from Sunyshore with nothing to steer by, until the plateau comes up out of the water ahead.',
	      catch:['Water','Flying'], doing:['Surf north','Reach the gate of Victory Road'] },
	224:{ kind:'side', name:'Route 224', from:'the League plateau', to:'the Seabreak Path', tier:'UBER', walk:'Story',
	      blurb:'A path off the back of the plateau that only opens once the League is done with you.',
	      catch:['Water','Grass','Flying'], doing:['Take the path east','Follow it out to sea'] },
	225:{ kind:'main', name:'Route 225', from:'Fight Area', to:'Survival Area', tier:'OU', walk:'Rough',
	      blurb:'Inland and uphill off the landing, and the first people you meet here are better than the last people you met anywhere.',
	      catch:['Fighting','Ground','Normal','Fire'], doing:['Climb inland','Take the battles as they come'] },
	226:{ kind:'side', name:'Route 226', from:'Survival Area', to:'Resort Area', tier:'OU', walk:'Cliff path',
	      blurb:'A cliff path round the north-east of the island with a long drop on one side.',
	      catch:['Flying','Rock','Water'], doing:['Keep to the inside','Reach the villa'] },
	227:{ kind:'main', name:'Route 227', from:'Survival Area', to:'Stark Mountain', tier:'UBER', walk:'Ash',
	      blurb:'Ash underfoot and ash in the air, up the flank of the volcano. Nothing green from here on.',
	      catch:['Fire','Rock','Ground'], doing:['Climb through the ash','Reach the outer caves'] },
	228:{ kind:'side', name:'Route 228', from:'Resort Area', to:'the sand', tier:'OU', walk:'Dead end - sandstorm',
	      blurb:'Desert on the eastern corner of the island, sandstorm most days, and a house in the middle of it.',
	      catch:['Ground','Rock','Steel'], doing:['Cross the sand','Find the house'] },
	229:{ kind:'side', name:'Route 229', from:'Resort Area', to:'Fight Area', tier:'OU', walk:'Easy',
	      blurb:'The soft way back along the south of the island, trees and a made path.',
	      catch:['Grass','Normal','Flying'], doing:['Walk back to the landing'] },
	230:{ kind:'main', name:'Route 230', from:'Fight Area', to:'Sunyshore City', tier:'OU', walk:'Surf',
	      blurb:'The long water back to Sinnoh proper, east of everything, out of sight of land for most of it.',
	      catch:['Water','Flying','Dragon'], doing:['Surf south','Come in at Sunyshore'] }
};

/* Canalave's drawbridge, and the causeway at the Lakefront. */
/* Canalave's drawbridge and the Valor causeway */
/* Canalave's drawbridge and the Valor causeway */
var BRIDGES = [
	{ a:[110,-172], b:[98,-175] },
	{ a:[347,-159], b:[347,-162] },
];

/* No railway in Sinnoh: the region moves by bicycle and by boat. */
var RAIL = [];

/* Boats: the Canalave sailor, and the crossing to the Battle Zone */
/* Boats: the Canalave sailor, and the crossing to the Battle Zone */
var FERRIES = [
	[[81,-180],[94,-234],[107,-277]],
	[[81,-180],[81,-280],[81,-368]],
	[[81,-368],[101,-374],[120,-368]],
	[[211,-387],[266,-351],[321,-303]],
	[[412,-167],[367,-241],[321,-303]],
];

/*
 * Real artwork only - see art/sinnoh/README.md.
 *
 * Kagura is invented and generated art filled it honestly enough. Sinnoh is
 * canon: these places have published artwork, and an imagined Hearthome is just
 * a wrong picture of somewhere with a right one. Empty until real images are
 * dropped in; a place with no entry shows an "artwork coming" card, which is
 * the correct answer rather than a placeholder for one.
 */
var ART = {
	battlefrontier: 'battlefrontier.png',
	canalave: 'canalave.png',
	celestic: 'celestic.png',
	chateau: 'chateau.png',
	coronet: 'coronet.png',
	distortion: 'distortion.png',
	eterna: 'eterna.png',
	eternaforest: 'eternaforest.png',
	fightarea: 'fightarea.png',
	floaroma: 'floaroma.png',
	flowerparadise: 'flowerparadise.jpg',
	fuego: 'fuego.png',
	fullmoon: 'fullmoon.png',
	greatmarsh: 'greatmarsh.png',
	hearthome: 'hearthome.png',
	ironisland: 'ironisland.png',
	jubilife: 'jubilife.png',
	lakeacuity: 'lakeacuity.png',
	lakevalor: 'lakevalor.png',
	lakeverity: 'lakeverity.png',
	losttower: 'losttower.png',
	newmoon: 'newmoon.png',
	oreburgh: 'oreburgh.png',
	oreburghgate: 'oreburghgate.png',
	palpark: 'palpark.png',
	pastoria: 'pastoria.png',
	ravagedpath: 'ravagedpath.png',
	resortarea: 'resortarea.png',
	sandgem: 'sandgem.png',
	sendoff: 'sendoff.png',
	snowpoint: 'snowpoint.png',
	snowpointtemple: 'snowpointtemple.png',
	solaceon: 'solaceon.png',
	solaceonruins: 'solaceonruins.png',
	spearpillar: 'spearpillar.png',
	starkmountain: 'starkmountain.png',
	sunyshore: 'sunyshore.png',
	survivalarea: 'survivalarea.png',
	turnback: 'turnback.png',
	twinleaf: 'twinleaf.png',
	valorlakefront: 'valorlakefront.png',
	veilstone: 'veilstone.png',
	waywardcave: 'waywardcave.png',
	windworks: 'windworks.png',
};

/*
 * Street plans for the places that are more than a marker. Streets are drawn
 * relative to the place's own centre, buildings placed on them.
 */
var PLANS = {
	twinleaf:  { streets: [[[-12,3],[12,3]]],
		b: [['house',-10,-5],['house',4,-5],['house',-2,6]] },
	sandgem:   { streets: [[[-14,3],[14,3]], [[0,3],[0,-8]]],
		b: [['lab',-13,-8],['centre',3,-8],['mart',9,5],['house',-12,6],['house',-2,6]] },
	jubilife:  { streets: [[[-18,0],[18,0]], [[-6,0],[-6,-12]], [[8,0],[8,12]]],
		b: [['tv',-17,-11],['gts',2,-11],['centre',-16,4],['mart',11,4],['house',-6,5],['house',4,5],['house',14,-10]] },
	canalave:  { streets: [[[-16,2],[16,2]], [[0,2],[0,-10]]],
		b: [['gym',-14,-9],['library',4,-10],['centre',-15,5],['mart',8,5],['house',-4,5],['house',12,-8]] },
	oreburgh:  { streets: [[[-15,2],[15,2]], [[-4,2],[-4,-9]]],
		b: [['gym',-13,-8],['mine',5,-9],['centre',-14,5],['mart',7,5],['house',-2,5]] },
	floaroma:  { streets: [[[-13,3],[13,3]]],
		b: [['shop',-11,-6],['house',3,-6],['crop',-12,6,24,6]] },
	eterna:    { streets: [[[-16,1],[16,1]], [[2,1],[2,-11]]],
		b: [['gym',-14,-9],['statue',4,-10],['centre',-15,5],['mart',8,5],['house',-4,5],['house',12,-9]] },
	hearthome: { streets: [[[-18,1],[18,1]], [[-8,1],[-8,-11]], [[7,1],[7,11]]],
		b: [['gym',-16,-10],['contest',0,-11],['centre',-17,5],['mart',10,5],['park',3,4,12,8],['house',-6,5]] },
	solaceon:  { streets: [[[-13,2],[13,2]]],
		b: [['daycare',-11,-6],['centre',3,-6],['house',-10,5],['house',2,5]] },
	veilstone: { streets: [[[-17,1],[17,1]], [[-5,1],[-5,-11]], [[9,1],[9,10]]],
		b: [['gym',-15,-9],['store',1,-11],['centre',-16,5],['house',4,5],['house',13,-9]] },
	pastoria:  { streets: [[[-15,2],[15,2]]],
		b: [['gym',-13,-7],['centre',3,-7],['mart',9,5],['house',-12,5]] },
	sunyshore: { streets: [[[-17,2],[17,2]], [[4,2],[4,-10]]],
		b: [['gym',-15,-8],['lighthouse',12,-10],['centre',-16,5],['mart',-4,5],['house',6,5]] },
	celestic:  { streets: [[[-12,3],[12,3]]],
		b: [['shrine',-3,-7],['house',-11,5],['house',6,5]] },
	snowpoint: { streets: [[[-15,2],[15,2]]],
		b: [['gym',-13,-8],['centre',3,-8],['mart',9,5],['house',-12,5]] },
	sinnohleague: { streets: [[[-16,4],[16,4]]],
		b: [['hall',-6,-11,12,14],['centre',-15,-2],['mart',9,-2]] },
	fightarea:    { streets: [[[-13,3],[13,3]]],
		b: [['centre',-11,-6],['mart',3,-6],['house',-10,5]] },
	survivalarea: { streets: [[[-13,3],[13,3]]],
		b: [['centre',-11,-6],['mart',3,-6],['house',-10,5]] },
	resortarea:   { streets: [[[-13,3],[13,3]]],
		b: [['villa',-11,-7],['centre',4,-6],['house',-8,5]] }
};

var GYMS = {
	oreburgh:  { type:'Rock',     badge:'Coal Badge',    leader:'Roark',
	             puzzle:'Mine carts on rails, moved by pushing the boulders that block them. The gym is the pit head with the roof on.' },
	eterna:    { type:'Grass',    badge:'Forest Badge',  leader:'Gardenia',
	             puzzle:'Three trainers hidden behind panels of growth. Answer the riddle on each panel or take the long way round it.' },
	hearthome: { type:'Ghost',    badge:'Relic Badge',   leader:'Fantina',
	             puzzle:'A stair of floating plates, each marked with a sum. Step only on the right answers or the plate is not there.' },
	veilstone: { type:'Fighting', badge:'Cobble Badge',  leader:'Maylene',
	             puzzle:'Sliding blocks on a polished floor. They do not stop until they hit something, and neither do you.' },
	pastoria:  { type:'Water',    badge:'Fen Badge',     leader:'Crasher Wake',
	             puzzle:'Water levels set by valve wheels. Raise one tank and you drain another, and the way through is at the bottom.' },
	canalave:  { type:'Steel',    badge:'Mine Badge',    leader:'Byron',
	             puzzle:'Steel lifts between floors, each called by a switch on a different floor from the one it serves.' },
	snowpoint: { type:'Ice',      badge:'Icicle Badge',  leader:'Candice',
	             puzzle:'Snowball walls and sheet ice. You slide until something stops you, so the walls you break decide where you end up.' },
	sunyshore: { type:'Electric', badge:'Beacon Badge',  leader:'Volkner',
	             puzzle:'Lit floor panels wired in sequence. Cross the gears in the right order and the path completes itself.' },
	sinnohleague: { type:'Elite Four', badge:'Champion', leader:'Cynthia',
	             puzzle:'Aaron, Bertha, Flint and Lucian in that order, then Cynthia, with no way back through a door once it shuts.' }
};

/*
 * Two palettes: the mainland is cool and northern - conifer green, grey sand -
 * and it pales towards the snow line. The Battle Zone is volcanic, darker
 * ground and ash-grey shore.
 */
var BIOMES = [
	{ g0:[ 78,138, 92], g1:[118,176,116], s0:[206,196,170], s1:[228,218,196] },   /* Sinnoh      */
	{ g0:[ 92,128, 78], g1:[132,164, 98], s0:[180,168,156], s1:[204,192,180] }    /* Battle Zone */
];

var SEABED = [
	{ x: 42, y:-206, r:30, lift: 18, kind:'bank'  },   /* round Iron Island        */
	{ x: 32, y:-148, r:34, lift: 14, kind:'bank'  },   /* the two islands          */
	{ x:118, y:-90,  r:44, lift: 16, kind:'shelf' },   /* the southern cape        */
	{ x:140, y:-70,  r:40, lift:-34, kind:'trench'},   /* the deep off Route 220   */
	{ x:410, y:-200, r:52, lift:-30, kind:'trench'},   /* the eastern deep         */
	{ x:404, y:-352, r:34, lift: 16, kind:'bank'  },   /* under the plateau        */
	{ x:434, y:-348, r:22, lift: 24, kind:'reef'  },   /* the Seabreak Path        */
	{ x:346, y:-388, r:44, lift: 12, kind:'bank'  },   /* the Snowpoint crossing   */
	{ x:368, y:-358, r:24, lift: 20, kind:'bank'  }    /* the Frontier's island    */
];

var OVERLAYS = [];

window.ATLAS_REGIONS = window.ATLAS_REGIONS || {};
window.ATLAS_REGIONS.sinnoh = {
	id: 'sinnoh',
	name: 'Sinnoh',
	tagline: 'Eight badges, one mountain, and the place the world was made.',
	/*
	 * Canon regions are seasonal: one rotating slot beside Kagura, swapped at the
	 * end of each season. 'in' while the season runs, 'out' when it has passed -
	 * the map keeps drawing the region either way, because the ground does not
	 * stop existing, it is only marked resting and nobody is running RP in it.
	 * The Discord side comes down with tools/sinnoh-channels.js --remove, which
	 * is also what keeps the server inside Discord's 500 channels.
	 */
	rotation: 'in',
	restingNote: '',
	art: 'art/sinnoh/',
	W: 512, H: 416,
	/* The published Platinum map, sea cut out, drawn as this region's ground. */
	/*
	 * The in-game town map, upscaled five times with no smoothing and its sea cut
	 * out. It is 216 pixels wide because it was drawn for a DS, and it is the map
	 * that has the routes on it - the Platinum painting is prettier and shows no
	 * roads at all. `roads: true` says so, and the atlas leaves its own ribbons off.
	 * art/sinnoh/sinnoh-map.png is that painting, still here if you prefer it.
	 */
	backdrop: { src: 'sinnoh-townmap.png', x: 260.0, y: -250.5, w: 399.9, h: 311.0, roads: true },
	/* North of Kagura, with forty units of open sea between the two coasts. */
	bounds: [0, -456, 512, -40],
	ISLANDS: ISLANDS, LAGOON: null, ISLETS: ISLETS, RIDGES: RIDGES,
	FORESTS: FORESTS, RIVERS: RIVERS, ROUTES: ROUTES, LINKS: LINKS,
	GRASS_PATCHES: GRASS_PATCHES, PLACES: PLACES, ROUTE_INFO: ROUTE_INFO,
	PLANS: PLANS, ART: ART, GYMS: GYMS, BRIDGES: BRIDGES, RAIL: RAIL, FERRIES: FERRIES, TRAILS: TRAILS,
	LAKES: LAKES, BIOMES: BIOMES, SEABED: SEABED, OVERLAYS: OVERLAYS,
	title: ['SINNOH REGION', 250, -76],
	borderIslands: [SINNOH, BATTLEZONE, EAST_ISLES, SOUTH_ISLE, IRON_ISLE],
	borderOutside: [],
	isles: [['SINNOH', 200, -340], ['BATTLE ZONE', 420, -448]],
	seas: [
		['THE SOUTHERN WATER', 210, -68], ['THE CANALAVE ROADS', 40, -240],
		['THE EASTERN DEEP', 446, -200], ['THE SNOWPOINT CROSSING', 348, -386],
		['THE SEABREAK PATH', 452, -324]
	],
	rivers: [
		['R. CORONET', 206, -180], ['THE SOLACEON WATER', 288, -262]
	]
};
})();
