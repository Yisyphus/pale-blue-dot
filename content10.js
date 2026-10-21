// Genre runs: pick one and the next 20 to 40 songs come from it, then the radio returns to the normal mix.
// Each entry is "Artist|Song title". The radio finds the recording on YouTube when the song is about to play.
(function () {
  const R = window.RADIO;
  const P = (id, label, short, genre, tags, genres, list, langs) => ({ id, label, short, genre, tags, genres: genres || [], langs: langs || [], songs: list.map(x => x.split('|')) });

  R.genrePacks = [
    P('prog', 'Existential prog rock classics', 'Prog rock classics', 'prog', ['time', 'absurd', 'alienation', 'death'], ['prog'], [
      "Pink Floyd|Wish You Were Here", "Pink Floyd|Comfortably Numb", "Pink Floyd|Us and Them", "Pink Floyd|Shine On You Crazy Diamond (Parts I-V)", "Pink Floyd|Breathe", "Pink Floyd|Brain Damage", "Pink Floyd|Hey You",
      "King Crimson|21st Century Schizoid Man", "King Crimson|Epitaph", "King Crimson|The Court of the Crimson King", "King Crimson|Moonchild", "Genesis|Firth of Fifth", "Genesis|Supper's Ready", "Genesis|The Carpet Crawlers",
      "Yes|Heart of the Sunrise", "Yes|And You and I", "Yes|Close to the Edge", "Rush|Tom Sawyer", "Rush|The Pass", "Rush|Closer to the Heart", "Camel|Ice", "Camel|Lunar Sea", "Jethro Tull|Aqualung",
      "Van der Graaf Generator|Still Life", "Porcupine Tree|Trains", "Porcupine Tree|Arriving Somewhere But Not Here", "Steven Wilson|Drive Home", "Radiohead|Pyramid Song", "Radiohead|Paranoid Android",
      "Emerson, Lake & Palmer|Lucky Man", "The Moody Blues|Nights in White Satin", "Procol Harum|A Whiter Shade of Pale", "Kansas|Dust in the Wind", "The Alan Parsons Project|Eye in the Sky", "Opeth|Windowpane", "Gentle Giant|Think of Me with Kindness", "Barclay James Harvest|Hymn",
    ]),
    P('psych', 'Existential psychedelic and neo-psychedelic', 'Psychedelic & neo-psych', 'psych', ['letting-go', 'alienation', 'time', 'absurd'], ['psych', 'neo-psych'], [
      "The Doors|Riders on the Storm", "The Doors|People Are Strange", "Jefferson Airplane|White Rabbit", "The Beatles|A Day in the Life", "The Beatles|Tomorrow Never Knows", "The Beatles|I Am the Walrus", "Pink Floyd|Astronomy Domine", "Syd Barrett|Dominoes",
      "Love|Alone Again Or", "The Zombies|Time of the Season", "The 13th Floor Elevators|You're Gonna Miss Me", "Tame Impala|The Less I Know the Better", "Tame Impala|Eventually", "Tame Impala|Feels Like We Only Go Backwards", "Tame Impala|New Person, Same Old Mistakes",
      "MGMT|Kids", "MGMT|Little Dark Age", "MGMT|Congratulations", "Temples|Shelter Song", "Allah-Las|Catamaran", "Beach House|Space Song", "Beach House|Myth", "Beach House|Walk in the Park",
      "Unknown Mortal Orchestra|Multi-Love", "Unknown Mortal Orchestra|So Good at Being in Trouble", "Slowdive|When the Sun Hits", "Slowdive|Sugar for the Pill", "Cocteau Twins|Heaven or Las Vegas", "My Bloody Valentine|Only Shallow", "Ride|Vapour Trail",
      "The Flaming Lips|Do You Realize??", "The Flaming Lips|Waitin' for a Superman", "Spiritualized|Ladies and Gentlemen We Are Floating in Space", "Mild High Club|Homage", "TOY|Dead & Gone",
    ]),
    P('acoustic', 'Existential acoustic and easy', 'Acoustic & easy', 'folk', ['peace', 'love', 'death', 'hope'], ['folk', 'soft-rock'], [
      "Nick Drake|Pink Moon", "Nick Drake|River Man", "Nick Drake|Place to Be", "Elliott Smith|Between the Bars", "Elliott Smith|Say Yes", "Elliott Smith|Waltz #2 (XO)", "Bon Iver|Skinny Love", "Bon Iver|Holocene",
      "José González|Heartbeats", "José González|Crosses", "Iron & Wine|Naked as We Came", "Sufjan Stevens|Should Have Known Better", "Sufjan Stevens|Mystery of Love", "Cat Stevens|Father and Son", "Cat Stevens|Trouble",
      "Simon & Garfunkel|The Sound of Silence", "Simon & Garfunkel|Bridge over Troubled Water", "Leonard Cohen|Hallelujah", "Leonard Cohen|Famous Blue Raincoat", "Leonard Cohen|Suzanne", "Leonard Cohen|Dance Me to the End of Love",
      "Bob Dylan|Not Dark Yet", "Bob Dylan|Blowin' in the Wind", "Townes Van Zandt|Waiting Around to Die", "Townes Van Zandt|Pancho and Lefty", "Joni Mitchell|A Case of You", "Joni Mitchell|Both Sides Now",
      "Jeff Buckley|Lover, You Should've Come Over", "Damien Rice|The Blower's Daughter", "Gregory Alan Isakov|Big Black Car", "Fleet Foxes|White Winter Hymnal", "Fleet Foxes|Mykonos", "Mazzy Star|Fade Into You", "Cat Power|The Greatest", "Phoebe Bridgers|Funeral",
    ]),
    P('electronic', 'Existential EDM, dub, ambient and electronic', 'EDM, dub, ambient', 'ambient', ['peace', 'letting-go', 'time', 'alienation'], ['ambient', 'vapor'], [
      "Brian Eno|An Ending (Ascent)", "Brian Eno|1/1", "Aphex Twin|Avril 14th", "Aphex Twin|Rhubarb", "Boards of Canada|Roygbiv", "Boards of Canada|Dayvan Cowboy", "Boards of Canada|Olson",
      "Burial|Archangel", "Burial|Etched Headplate", "Massive Attack|Teardrop", "Massive Attack|Angel", "Portishead|Roads", "Portishead|Glory Box", "Portishead|Wandering Star",
      "Radiohead|Everything in Its Right Place", "Radiohead|Idioteque", "Moby|Porcelain", "Moby|Why Does My Heart Feel So Bad?", "Tycho|A Walk", "Tycho|Awake", "Bonobo|Kiara", "Bonobo|Cirrus",
      "Four Tet|Two Thousand and Seventeen", "Jon Hopkins|Open Eye Signal", "Jon Hopkins|Abandon Window", "RÜFÜS DU SOL|Innerbloom", "RÜFÜS DU SOL|Underwater", "Augustus Pablo|King Tubby Meets Rockers Uptown",
      "Lee \"Scratch\" Perry|Chase the Devil", "The Orb|Little Fluffy Clouds", "Röyksopp|Remind Me", "Röyksopp|What Else Is There?", "Daft Punk|Veridis Quo", "deadmau5|Strobe", "Nils Frahm|Says", "Max Richter|On the Nature of Daylight", "Ólafur Arnalds|Near Light",
    ]),
    P('pop', 'Existential pop and anti-pop', 'Pop & anti-pop', 'anti-pop', ['desire', 'absurd', 'love', 'alienation'], ['anti-pop', 'glam'], [
      "Lorde|Ribs", "Lorde|Liability", "Lana Del Rey|Video Games", "Lana Del Rey|Summertime Sadness", "Billie Eilish|when the party's over", "Billie Eilish|bury a friend", "Frank Ocean|Self Control", "Frank Ocean|Nights", "Frank Ocean|Pink + White",
      "The 1975|Somebody Else", "The 1975|I Always Wanna Die (Sometimes)", "Weyes Blood|Andromeda", "Weyes Blood|Everyday", "Father John Misty|Pure Comedy", "Father John Misty|I Love You, Honeybear",
      "The Smiths|How Soon Is Now?", "The Smiths|There Is a Light That Never Goes Out", "Morrissey|Everyday Is Like Sunday", "Pet Shop Boys|Being Boring", "Depeche Mode|Enjoy the Silence", "Talking Heads|Once in a Lifetime",
      "Tears for Fears|Mad World", "Tears for Fears|Everybody Wants to Rule the World", "Gary Jules|Mad World", "Radiohead|Creep", "Eurythmics|Sweet Dreams (Are Made of This)", "Roxy Music|More Than This",
      "David Bowie|Heroes", "David Bowie|Space Oddity", "David Bowie|Life on Mars?", "David Bowie|Lazarus", "Kate Bush|Running Up That Hill", "Kate Bush|Wuthering Heights", "ABBA|The Winner Takes It All", "Stromae|Papaoutai", "Stromae|Formidable", "Christine and the Queens|Saint Claude",
    ]),
    P('rock', 'Existential rock', 'Rock', 'rock', ['death', 'alienation', 'desire', 'time'], ['indie'], [
      "Nirvana|Something in the Way", "Nirvana|All Apologies", "Nirvana|Heart-Shaped Box", "Pearl Jam|Black", "Pearl Jam|Alive", "Soundgarden|Black Hole Sun", "Alice in Chains|Nutshell",
      "Radiohead|Karma Police", "Radiohead|No Surprises", "Radiohead|Fake Plastic Trees", "The Cure|Pictures of You", "The Cure|Disintegration", "The Cure|A Forest", "Joy Division|Love Will Tear Us Apart", "Joy Division|Atmosphere", "Joy Division|Disorder",
      "The Smashing Pumpkins|Today", "The Smashing Pumpkins|1979", "Led Zeppelin|Stairway to Heaven", "Led Zeppelin|Kashmir", "Led Zeppelin|No Quarter", "Black Sabbath|Planet Caravan", "Queen|Bohemian Rhapsody", "Queen|The Show Must Go On",
      "Guns N' Roses|November Rain", "Metallica|Fade to Black", "Metallica|One", "Bruce Springsteen|Thunder Road", "Bruce Springsteen|Born to Run", "Neil Young|Hey Hey, My My (Into the Black)", "Neil Young|Heart of Gold",
      "The Velvet Underground|Pale Blue Eyes", "The Velvet Underground|Sunday Morning", "Lou Reed|Perfect Day", "Lou Reed|Walk on the Wild Side", "Arcade Fire|Wake Up", "Arcade Fire|The Suburbs", "The National|Fake Empire", "The National|I Need My Girl",
      "Pixies|Where Is My Mind?", "R.E.M.|Everybody Hurts", "R.E.M.|Nightswimming", "R.E.M.|Losing My Religion",
    ]),
    P('lofi', 'Existential lo-fi', 'Lo-fi', 'lo-fi', ['peace', 'alienation', 'routine', 'love'], ['lo-fi'], [
      "Mac DeMarco|Salad Days", "Mac DeMarco|My Kind of Woman", "Mac DeMarco|Passing Out Pieces", "Daniel Johnston|True Love Will Find You in the End", "Daniel Johnston|Speeding Motorcycle", "Mount Eerie|Real Death", "Mount Eerie|Ravens",
      "The Microphones|The Glow Pt. 2", "Sparklehorse|Sick of Goodbyes", "Wavves|King of the Beach", "Alex G|Sarah", "Alex G|Mary", "Car Seat Headrest|Fill in the Blank", "Car Seat Headrest|Beach Life-in-Death", "Car Seat Headrest|Drunk Drivers/Killer Whales",
      "Pavement|Range Life", "Pavement|Gold Soundz", "Yo La Tengo|Autumn Sweater", "Smog|Dress Sexy at My Funeral", "Bill Callahan|Drover", "The Radio Dept.|Heaven's on Fire", "Wild Nothing|Paradise", "Clairo|Bags",
      "Men I Trust|Show Me How", "Men I Trust|Lauren", "Jinsang|Affection", "Nujabes|Feather", "Nujabes|Aruarian Dance", "J Dilla|Time: The Donut of the Heart", "J Dilla|Don't Cry", "Tomppabeats|Monday Loop", "Beach Fossils|Sleep Apnea",
    ]),
    P('jazz', 'Existential jazz and cool', 'Jazz & cool', 'jazz', ['time', 'peace', 'alienation', 'love'], ['jazz', 'score'], [
      "Miles Davis|Blue in Green", "Miles Davis|So What", "John Coltrane|A Love Supreme, Pt. I - Acknowledgement", "John Coltrane|Naima", "Bill Evans|Peace Piece", "Bill Evans|Waltz for Debby",
      "Chet Baker|I Fall in Love Too Easily", "Chet Baker|Almost Blue", "Nina Simone|Feeling Good", "Nina Simone|Sinnerman", "Billie Holiday|Strange Fruit", "Billie Holiday|God Bless the Child", "Dave Brubeck|Take Five",
      "Thelonious Monk|'Round Midnight", "Pharoah Sanders|The Creator Has a Master Plan", "Alice Coltrane|Journey in Satchidananda", "Ahmad Jamal|Poinciana", "Keith Jarrett|The Köln Concert, Part I",
      "Esbjörn Svensson Trio|Seven Days of Falling", "BADBADNOTGOOD|Speaking Gently", "Kamasi Washington|Truth", "Khruangbin|Maria También", "Khruangbin|Evan Finds the Third Room", "GoGo Penguin|Hopopono",
      "Cannonball Adderley|Autumn Leaves", "Stan Getz|The Girl from Ipanema", "Charles Mingus|Goodbye Pork Pie Hat", "Duke Ellington|In a Sentimental Mood", "Louis Armstrong|What a Wonderful World",
    ]),
    P('soul', 'Existential soul and blues', 'Soul & blues', 'soul', ['hope', 'death', 'faith', 'love'], ['soul'], [
      "Gil Scott-Heron|The Bottle", "Gil Scott-Heron|Lady Day and John Coltrane", "Marvin Gaye|What's Going On", "Marvin Gaye|Inner City Blues (Make Me Wanna Holler)", "Bill Withers|Ain't No Sunshine", "Bill Withers|Lean on Me",
      "Otis Redding|(Sittin' On) The Dock of the Bay", "Amy Winehouse|Back to Black", "Amy Winehouse|Love Is a Losing Game", "Donny Hathaway|Someday We'll All Be Free", "Etta James|I'd Rather Go Blind", "Nina Simone|I Put a Spell on You",
      "Sam Cooke|Bring It On Home to Me", "Aretha Franklin|Ain't No Way", "Aretha Franklin|Do Right Woman, Do Right Man", "Curtis Mayfield|Pusherman", "Curtis Mayfield|Freddie's Dead", "Stevie Wonder|Visions",
      "Muddy Waters|Hoochie Coochie Man", "Howlin' Wolf|Smokestack Lightning", "B.B. King|The Thrill Is Gone", "Robert Johnson|Cross Road Blues", "Robert Johnson|Hellhound on My Trail", "Lead Belly|Where Did You Sleep Last Night",
      "Son House|Death Letter", "Skip James|Hard Time Killing Floor Blues", "Al Green|Love and Happiness", "Leon Bridges|River",
    ]),
    P('frar', 'Existential French and Arabic', 'French & Arabic', 'chanson', ['love', 'time', 'death', 'alienation'], ['chanson'], [
      "Fairuz|Li Beirut", "Fairuz|Kifak Inta", "Umm Kulthum|Alf Leila wa Leila", "Umm Kulthum|Enta Omri", "Umm Kulthum|Al Atlal", "Abdel Halim Hafez|Ahwak", "Nass El Ghiwane|Essiniya", "Nass El Ghiwane|Allah Ya Moulana",
      "Souad Massi|Raoui", "Souad Massi|Ghaib", "Asmahan|Ya Habibi Ta'ala", "Farid El Atrache|Awal Hamsa", "Warda|Batwanes Beek", "Cheikha Rimitti|Charrak Gataa",
      "Jacques Brel|Ne me quitte pas", "Jacques Brel|Amsterdam", "Jacques Brel|La chanson des vieux amants", "Édith Piaf|Non, je ne regrette rien", "Édith Piaf|La vie en rose", "Georges Brassens|Les Passantes",
      "Léo Ferré|Avec le temps", "Serge Gainsbourg|Je suis venu te dire que je m'en vais", "Serge Gainsbourg|La Javanaise", "Barbara|L'aigle noir", "Barbara|Göttingen", "Charles Aznavour|La Bohème", "Charles Aznavour|Emmenez-moi",
      "Françoise Hardy|Tous les garçons et les filles", "Françoise Hardy|Comment te dire adieu", "Yves Montand|Les feuilles mortes", "Stromae|Tous les mêmes",
    ], ['ar', 'fr']),
    P('postrock', 'Existential post-rock and cinematic', 'Post-rock & cinematic', 'post-rock', ['peace', 'time', 'hope', 'letting-go'], [], [
      "Sigur Rós|Hoppípolla", "Sigur Rós|Svefn-g-englar", "Sigur Rós|Starálfur", "Explosions in the Sky|Your Hand in Mine", "Explosions in the Sky|The Only Moment We Were Alone", "Godspeed You! Black Emperor|Storm",
      "Mogwai|Take Me Somewhere Nice", "Mogwai|Mogwai Fear Satan", "This Will Destroy You|The Mighty Rio Grande", "Slint|Washer", "Mono|Ashes in the Snow", "Tortoise|Djed", "Russian Circles|Station",
      "Ennio Morricone|Once Upon a Time in the West", "Ennio Morricone|Gabriel's Oboe", "Hans Zimmer|Time", "Hans Zimmer|Cornfield Chase", "Vangelis|Tears in Rain", "Vangelis|Chariots of Fire", "Clint Mansell|Lux Aeterna",
      "Jóhann Jóhannsson|Flight from the City", "Max Richter|Vladimir's Blues", "Philip Glass|Opening", "Arvo Pärt|Spiegel im Spiegel", "Erik Satie|Gymnopédie No. 1", "Claude Debussy|Clair de Lune",
    ]),
    P('hiphop', 'Existential introspective hip hop', 'Introspective hip hop', 'hiphop', ['alienation', 'desire', 'hope', 'death'], ['hiphop'], [
      "Kendrick Lamar|Alright", "Kendrick Lamar|Sing About Me, I'm Dying of Thirst", "Kendrick Lamar|u", "Kendrick Lamar|Mother I Sober", "Kid Cudi|Pursuit of Happiness", "Kid Cudi|Day 'n' Nite", "Kid Cudi|Soundtrack 2 My Life",
      "Kanye West|Runaway", "Kanye West|Street Lights", "Kanye West|Ultralight Beam", "Mac Miller|Self Care", "Mac Miller|Small Worlds", "Mac Miller|Good News", "Mac Miller|Circles", "2Pac|Changes", "2Pac|Dear Mama",
      "The Notorious B.I.G.|Everyday Struggle", "Earl Sweatshirt|Chum", "J. Cole|Love Yourz", "Lupe Fiasco|Kick, Push", "Common|The Light", "Nas|One Mic", "Nas|Life's a Bitch", "Wu-Tang Clan|C.R.E.A.M.", "Eminem|Mockingbird",
    ]),
  ];

  R.runStarts = [
    'For the next stretch, I would like to stay in one place: {label}. Roughly twenty or thirty songs, and then we will wander back to the wider mix.',
    'A little change of direction. For a while now, the songs will come from one corner: {label}. Settle in.',
    'The next run is yours: {label}. We will stay with it for a good while, and then return to the usual mix.',
    'Let us go somewhere specific for a few songs. Tonight\'s theme: {label}. I will keep you company.',
    'You asked for a particular color of the night. So, for the next stretch: {label}.',
    'For the next little while, we are in a single room: {label}. The usual mix will be waiting outside.',
  ];
  R.runEnds = [
    'That was our run of {label}. Now, back to the wider mix.',
    'And that closes our stretch of {label}. From here, the songs wander freely again.',
    'We have been with {label} for a good while. Time to open the windows, and let the mix back in.',
    'That is the end of the run. {label}, done. Back to the usual company of songs.',
    'We have come to the end of {label}. The radio returns to its normal wandering.',
    'That was a long walk through {label}. Now, a change of scenery.',
  ];

  R.genreMore = R.genreMore || {};
  R.genreMore.rock = [
    'Rock and roll began as a shout of joy, and somewhere along the way learned to ask difficult questions. The best rock songs are not about being cool. They are about being alive and slightly terrified.',
    'There is a long tradition of rock as confession: a voice, a loud guitar, and something it could not say any other way.',
    'Rock music is where many people first heard their own loneliness reflected back, at a volume that made it feel shareable.',
  ];
  R.genreMore['post-rock'] = [
    'Post-rock took the instruments of rock, and left out the singer. What remains is a slow build, a long breath, and a feeling that words would only get in the way.',
    'The shape of a post-rock song is the shape of a thought: it begins small, circles, and gradually, without announcing it, becomes huge.',
    'Instrumental music is a language for what cannot be argued. It does not tell you what to feel. It just opens a very large window.',
  ];
  R.genreMore.world = ['Music in a language you do not fully speak teaches you to listen differently. You hear the shape of the feeling before the sentence.'];
  R.genreMore.blues = ['The blues is the oldest method we have for turning hardship into something you can sing on a Tuesday. It does not ask for a solution. It asks for a witness.'];
})();
