// Focus mode, dedications, and the two Arabic shows in the podcast slot.
// Focus tracks are kept apart from everything else: they are never in the catalog, the library, Suggest, the lists,
// the history or the favorites. Every one is instrumental (no singing), checked by hand.
// Focus > Instrumental is split into stations: you pick one and it stays in that sound until you change it. Each
// station is chosen to keep an even energy, so nothing loud follows something quiet. Nothing cinematic (film scores,
// big orchestral builds). Format: "Artist|Title"
(function () {
  const R = window.RADIO;

  R.focusStations = [
    { id: 'piano', label: 'Piano & Strings', note: 'calm modern piano, a few strings', tracks: [
      'Nils Frahm|Ambre', 'Nils Frahm|Familiar', 'Nils Frahm|Re', 'Nils Frahm|Went Missing', 'Nils Frahm|Me', 'Nils Frahm|Unter',
      'Nils Frahm|Less', 'Nils Frahm|More',
      'Ólafur Arnalds|Saman', 'Ólafur Arnalds|Ljósið', "Ólafur Arnalds|Tomorrow's Song", 'Ólafur Arnalds|Lag fyrir ömmu',
      'Ólafur Arnalds|Fyrsta', 'Ólafur Arnalds|Happiness Does Not Wait', 'Ólafur Arnalds|0952',
      "Max Richter|Vladimir's Blues", 'Max Richter|Dream 3 (in the midst of my life)', 'Max Richter|Written on the Sky',
      'Ludovico Einaudi|Nuvole Bianche', 'Ludovico Einaudi|I Giorni', 'Ludovico Einaudi|Una Mattina', 'Ludovico Einaudi|Le Onde',
      'Erik Satie|Gymnopédie No. 1', 'Erik Satie|Gnossienne No. 1', 'Erik Satie|Gymnopédie No. 3',
      'Claude Debussy|Clair de Lune', 'Claude Debussy|Rêverie', 'Claude Debussy|Arabesque No. 1',
      'Frédéric Chopin|Nocturne Op. 9 No. 2', 'Frédéric Chopin|Nocturne in C-sharp minor (Posthumous)',
      'Ryuichi Sakamoto|Merry Christmas Mr. Lawrence', 'Ryuichi Sakamoto|Energy Flow', 'Ryuichi Sakamoto|Aqua',
      'Joep Beving|Sleeping Lotus', 'Joep Beving|Hanging D', 'Hania Rani|Eden', 'Hania Rani|Glass',
      "Dustin O'Halloran|Opus 23", "Yann Tiersen|Comptine d'un autre été, l'après-midi", 'Yann Tiersen|Porz Goret',
      'Philip Glass|Metamorphosis One', 'Philip Glass|Opening', 'Agnes Obel|Wallflower', 'Jóhann Jóhannsson|Flight from the City',
      'Peter Broderick|Eyes Closed and Traveling', 'Goldmund|Threnody', 'Eluvium|Radio Ballet', 'Aphex Twin|Avril 14th',
    ] },
    { id: 'ambient', label: 'Deep Ambient', note: 'no beat, just space', tracks: [
      'Brian Eno|An Ending (Ascent)', 'Brian Eno|1/1', 'Brian Eno|2/2', 'Brian Eno|Deep Blue Day', 'Brian Eno|Lantern Marsh',
      'Brian Eno & Harold Budd|First Light',
      'Stars of the Lid|Dungtitled (In A Major)', 'Stars of the Lid|Requiem for Dying Mothers, Part 1',
      "Stars of the Lid|Don't Bother They're Here", 'Stars of the Lid|Articulate Silences, Part 1',
      'Marconi Union|Weightless', 'Carbon Based Lifeforms|Photosynthesis', 'Carbon Based Lifeforms|Somewhere in Russia',
      'Hammock|Then the Quiet Explosion', 'Hammock|Mono No Aware', 'William Basinski|dlp 1.1',
      'Biosphere|Chukhung', 'Biosphere|Kobresia', 'Biosphere|As the Sun Kissed the Horizon',
      'Steve Roach|Structures from Silence', 'Loscil|Endless Falls', 'Helios|Halving the Compass', 'Helios|Bless This Morning Year',
      'A Winged Victory for the Sullen|Steep Hills of Vicodin Tears', 'A Winged Victory for the Sullen|Requiem for the Static King Part One',
      'Aphex Twin|#3 (Rhubarb)', 'Jon Hopkins|Abandon Window', 'Jon Hopkins|Sun Harmonics',
      'Hiroshi Yoshimura|Water Copy', 'Hiroshi Yoshimura|Blink', 'Ryuichi Sakamoto|Andata',
      'Moby|God Moving Over the Face of the Waters', 'Global Communication|14:31',
    ] },
    { id: 'lofi', label: 'Lofi & Chill Beats', note: 'soft hip-hop drums, warm samples', tracks: [
      'Nujabes|Aruarian Dance', 'Nujabes|Reflection Eternal', 'Nujabes|Kumomi', 'Nujabes|Spiral', 'Nujabes|Flowers',
      'Nujabes|Latitude', 'Nujabes|Imaginary Folklore', 'Nujabes|After Hanabi -listen to my beats-', 'Nujabes|Next View',
      'Uyama Hiroto|Waltz for Life Will Born', 'Uyama Hiroto|One Dream', 'Nujabes & Uyama Hiroto|Waltz of Reincarnation',
      'Fat Jon|Your Purpose', 'DJ Okawari|Flower Dance', 'DJ Okawari|Luv Letter', 'Kupla|Owls of the Night',
      'Tomppabeats|Monday Loop', 'Jinsang|Affection', "Kudasai|the girl i haven't met", "potsu|i'm closing my eyes",
      'Joakim Karud|Canals', "L'indécis|Soulful", "L'indécis|Playa Del Ingles", 'The Deli|5:32pm', 'Saib|Sakura Trees',
      'idealism|controlla', 'Lakey Inspired|Better Days', 'Lakey Inspired|Chill Day',
    ] },
    { id: 'downtempo', label: 'Downtempo', note: 'mellow electronic, a gentle pulse', tracks: [
      'Tycho|Awake', 'Tycho|Dive', 'Tycho|A Walk', 'Tycho|Montana', 'Tycho|Coastal Brake', 'Tycho|Epoch', 'Tycho|Hours',
      'Tycho|Division', 'Tycho|Adrift', 'Tycho|Glider',
      'Bonobo|Cirrus', 'Bonobo|Ketto', 'Bonobo|Black Sands', 'Bonobo|Kiara',
      'Emancipator|Soon It Will Be Cold Enough to Build Fires', 'Emancipator|Anthem', 'Emancipator|Dusk to Dawn',
      'Boards of Canada|Roygbiv', 'Boards of Canada|Dayvan Cowboy', 'Boards of Canada|Olson', 'Boards of Canada|Chromakey Dreamcoat',
      'Air|Alone in Kyoto', "Air|La Femme d'Argent", 'Nightmares on Wax|You Wish', 'Nightmares on Wax|Les Nuits',
      'Khruangbin|August 10', 'Khruangbin|Two Fish and an Elephant', 'Khruangbin|A Calf Born in Winter',
      'Kiasmos|Blurred', 'Kiasmos|Looped', 'Kiasmos|Swept', 'FKJ|Ylang Ylang', 'Four Tet|Two Thousand and Seventeen',
      'Jon Hopkins|Light Through the Veins', 'ODESZA|Kusanagi', 'Nils Frahm|Says', 'Moby|Everloving',
      'Carbon Based Lifeforms|Abiogenesis',
    ] },
    { id: 'synth', label: 'Synth & Retro', note: 'analog synths, night drive', tracks: [
      'HOME|Resonance', 'HOME|Tides', 'HOME|Decay', 'HOME|New Machines', "HOME|We're Finally Landing", 'HOME|Half Moon Bay',
      'Com Truise|Brokendate', 'Com Truise|Propagation', 'Com Truise|Cathode Girls', 'Com Truise|Ether Drift',
      'Kavinsky|Roadgame', 'Kavinsky|Protovision', 'Lazerhawk|Visitors', 'FM-84|Arcade Summer',
      'Jean-Michel Jarre|Oxygène, Pt. 2', 'Jean-Michel Jarre|Oxygène, Pt. 4', 'Jean-Michel Jarre|Oxygène, Pt. 6',
      'Jean-Michel Jarre|Equinoxe, Pt. 4', 'Jean-Michel Jarre|Equinoxe, Pt. 5',
      'Vangelis|Alpha', 'Vangelis|Memories of Green', 'Vangelis|Blade Runner Blues',
      'Tangerine Dream|Love on a Real Train', 'Tangerine Dream|Stratosfear', 'Mitch Murder|After Hours',
      'Chromatics|Tick of the Clock', 'Isao Tomita|Clair de Lune', "Jan Hammer|Crockett's Theme", 'Daft Punk|Veridis Quo',
    ] },
    { id: 'postrock', label: 'Post-rock', note: 'guitars that build slowly, for deep work', tracks: [
      'Explosions in the Sky|Your Hand in Mine', 'Explosions in the Sky|First Breath After Coma',
      'Explosions in the Sky|The Only Moment We Were Alone', 'Explosions in the Sky|Memorial',
      'Explosions in the Sky|Six Days at the Bottom of the Ocean', 'Explosions in the Sky|So Long, Lonesome',
      'Explosions in the Sky|Remember Me as a Time of Day', 'Explosions in the Sky|Postcard from 1952',
      'God Is an Astronaut|All Is Violent, All Is Bright', 'God Is an Astronaut|Fragile', 'God Is an Astronaut|From Dust to the Beyond',
      'God Is an Astronaut|Suicide by Star',
      'This Will Destroy You|The Mighty Rio Grande', 'This Will Destroy You|Quiet',
      'This Will Destroy You|They Move on Tracks of Never-Ending Light',
      'Mono|Ashes in the Snow', 'Mono|Halcyon (Beautiful Days)', 'Mono|Pure as Snow (Trails of the Winter Storm)',
      'Mogwai|Auto Rock', 'Mogwai|Friend of the Night', 'Mogwai|Kids Will Be Skeletons', "Mogwai|I'm Jim Morrison, I'm Dead",
      'Caspian|Sycamore', '65daysofstatic|Radio Protector', 'Tortoise|TNT', 'The American Dollar|Anything You Synthesize',
      'Pink Floyd|Marooned', 'Pink Floyd|Any Colour You Like',
    ] },
    { id: 'jazz', label: 'Late-night Jazz', note: 'slow, smoky, brushed drums', tracks: [
      'Miles Davis|Blue in Green', 'Miles Davis|Flamenco Sketches', 'Miles Davis|So What', 'Miles Davis|It Never Entered My Mind',
      "Miles Davis|'Round Midnight",
      'Bill Evans|Peace Piece', 'Bill Evans Trio|Waltz for Debby', 'Bill Evans Trio|My Foolish Heart', 'Bill Evans|Some Other Time',
      'Bill Evans Trio|Detour Ahead',
      'John Coltrane|Naima', 'John Coltrane|Say It (Over and Over Again)', 'Duke Ellington & John Coltrane|In a Sentimental Mood',
      "Thelonious Monk|'Round Midnight", 'Ahmad Jamal|Poinciana', 'Herbie Hancock|Maiden Voyage', 'Dexter Gordon|Darn That Dream',
      'Ben Webster|Soulville', 'Coleman Hawkins|Body and Soul', 'Kenny Burrell|Midnight Blue', "Wes Montgomery|Bumpin' on Sunset",
      'Keith Jarrett|My Song', 'Brad Mehldau|Exit Music (For a Film)', 'GoGo Penguin|Hopopono',
      'Esbjörn Svensson Trio|Seven Days of Falling', 'Charles Mingus|Goodbye Pork Pie Hat', 'Oscar Peterson|Hymn to Freedom',
      'Cannonball Adderley|Autumn Leaves', 'Dave Brubeck|Take Five', 'Vince Guaraldi Trio|Cast Your Fate to the Wind',
      'Yusef Lateef|Love Theme from Spartacus', 'Bob James|Nautilus', 'Lee Morgan|Ceora', 'Horace Silver|Peace',
    ] },
    { id: 'noir', label: 'Jazz Noir', note: 'dark, slow, rain on the city at 3 a.m.', tracks: [
      'Bohren & der Club of Gore|Prowler', 'Bohren & der Club of Gore|Midnight Walker', 'Bohren & der Club of Gore|Sunset Mission',
      'Bohren & der Club of Gore|Painless Love', 'Bohren & der Club of Gore|On Demon Wings',
      'Bohren & der Club of Gore|Midnight Black Earth', 'Bohren & der Club of Gore|Crimson Ways',
      'Bohren & der Club of Gore|Constant Fear', 'Bohren & der Club of Gore|Grave Wisdom', 'Bohren & der Club of Gore|Piano Nights',
      'The Kilimanjaro Darkjazz Ensemble|Vegas', 'The Kilimanjaro Darkjazz Ensemble|Guernica',
      'Angelo Badalamenti|Twin Peaks Theme', "Angelo Badalamenti|Laura Palmer's Theme", "Angelo Badalamenti|Audrey's Dance",
      'Angelo Badalamenti|Dance of the Dream Man', 'Angelo Badalamenti|Night Life in Twin Peaks',
      'Miles Davis|Générique', 'Miles Davis|Florence sur les Champs-Élysées', 'Bernard Herrmann|Taxi Driver (Main Title)',
      'Mal Waldron|Soul Eyes', 'Gerry Mulligan|Night Lights', 'Duke Ellington|Flirtibird',
    ] },
    { id: 'oud', label: 'Oud & the East', note: 'Arabic and Mediterranean instrumentals', tracks: [
      'Anouar Brahem|Le Pas du Chat Noir', 'Anouar Brahem|Halfaouine', 'Anouar Brahem|Astrakan Café', 'Anouar Brahem|Blue Maqams',
      'Anouar Brahem|Barzakh', 'Anouar Brahem|Leila au pays du carrousel', 'Anouar Brahem|The Astounding Eyes of Rita',
      'Anouar Brahem|Dance with Waves', 'Anouar Brahem|Souvenance', 'Anouar Brahem|Aube rouge à Grozny',
      'Rabih Abou-Khalil|Blue Camel', 'Rabih Abou-Khalil|Sahara', 'Le Trio Joubran|Masar', 'Le Trio Joubran|Shajan',
      'Le Trio Joubran|Asfar', 'Naseer Shamma|Ishraq', 'Munir Bashir|Maqam Hijaz', 'Marcel Khalife|Jadal',
      'Hamza El Din|Escalay (The Water Wheel)', 'Simon Shaheen|Dance Mediterranea', 'Ibrahim Maalouf|True Sorry',
      'Kudsi Erguner|Ney Taksim',
    ] },
    { id: 'dub', label: 'Dub', note: 'echo, bass, slow and hypnotic', tracks: [
      'Augustus Pablo|King Tubby Meets Rockers Uptown', 'Augustus Pablo|Java', 'Augustus Pablo|East of the River Nile',
      'Augustus Pablo|Cassava Piece', 'Augustus Pablo|Meditation Dub',
      'King Tubby|King Tubby\'s Special', 'King Tubby|Mystical Dub', 'The Revolutionaries|Kunta Kinte',
      'Scientist|Dance of the Vampires', 'Scientist|Your Teeth in My Neck', 'Scientist|The Voodoo Curse', "Scientist|The Mummy's Shroud",
      'The Upsetters|Black Vest', 'The Upsetters|Underground', 'Lee "Scratch" Perry|Black Ark International',
      'Mad Professor|Sahara Dub', 'Mad Professor|Kathmandu Dub', 'Creation Rebel|Dub from Creation', 'Keith Hudson|Pick a Dub',
      'Yabby You|Chanting Dub', 'Prince Jammy|Conspiracy on Neptune',
      'Pachyman|Destroy the Empire', 'Pachyman|All Night Long', 'Pachyman|Sunset Sound', 'Pachyman|Dub Fellowship',
      'Pachyman|Strictly Vibes', 'Pachyman|Sensi',
    ] },
  ];

  // Focus mode > Ambient sounds: one long recording at a time, found on YouTube by the PC
  R.focusSounds = [
    { label: 'Rain on a window', q: 'rain on window sounds 3 hours' },
    { label: 'Night rain', q: 'gentle night rain ambience 3 hours no music' },
    { label: 'Deep space', q: 'deep space ambient sound spaceship hum 3 hours' },
    { label: 'Ocean waves', q: 'ocean waves sounds 3 hours no music' },
    { label: 'Forest and stream', q: 'forest stream birds sounds 3 hours no music' },
    { label: 'A quiet café', q: 'quiet cafe ambience sounds 2 hours no music' },
    { label: 'Fireplace', q: 'fireplace crackling sounds 3 hours no music' },
    { label: 'Distant thunder', q: 'distant thunderstorm rain sounds 3 hours' },
    { label: 'Desert wind', q: 'desert wind ambience sounds 2 hours' },
  ];

  // Dedications (Suggest > One song): Astro says a few words, then your words exactly ({d}), then the song.
  // What you wrote is never saved anywhere; it is said once and forgotten.
  R.dedicationLines = [
    'A dedication now, in your own words. {d}. Here is {a}, {t}.',
    'Before this one, a few words you wanted said. {d}. {a}, {t}.',
    'This next song comes with a dedication. {d}. Here it is: {t}, by {a}.',
    'You asked me to say this before the song. {d}. {a}, with {t}.',
    'Some songs are sent, not just played. This one is yours. {d}. {t}, by {a}.',
    'A few words from you, and then the music. {d}. Here is {a}.',
  ];

  // The podcast slot (song 64): one regular episode, then في الحضارة, then a regular one, then الدحيح, and again.
  // Only from these channels; if nothing is found, a regular episode plays instead.
  R.podShows = {
    hadara: {
      name: 'في الحضارة',
      queries: ['في الحضارة', 'برنامج في الحضارة', 'في الحضارة العربي تيوب', 'في الحضارة حلقة'],
      channel: /العربي تيوب|alaraby ?tube/i, title: /في الحضارة/,
      intros: [
        'Something different now, and in Arabic: an episode of Fi Al Hadara, from AlarabyTube. It is called {t}, and runs about {min} minutes. The songs will wait for us.',
        'Time for Fi Al Hadara, a journey through the history of civilisations, in Arabic. Today: {t}. About {min} minutes.',
        'Let us travel back a few centuries. Here is Fi Al Hadara, from AlarabyTube: {t}. Around {min} minutes.',
        'The music steps aside for a story about where we come from. Fi Al Hadara, in Arabic: {t}.',
      ],
      outros: [
        'That was Fi Al Hadara. From the old civilisations, back to the music.',
        'Fi Al Hadara, from AlarabyTube. History has a way of making the present feel smaller, and kinder. Here is a song.',
        'That was an episode of Fi Al Hadara. Let the music take it from here.',
      ],
    },
    dahih: {
      name: 'الدحيح',   // channels: AJ+ كبريت, New Media Academy Life, Da7ee7 - الدحيح, Museum of The Future متحف المستقبل
      queries: ['الدحيح', 'الدحيح حلقة', 'Da7ee7', 'الدحيح كبريت', 'الدحيح نيو ميديا أكاديمي', 'الدحيح متحف المستقبل'],
      channel: /كبريت|aj\s?\+|new media academy|الدحيح|da7ee7|museum of the future|متحف المستقبل/i, title: /الدحيح|da7ee7/i,
      intros: [
        'And now, El Daheeh, in Arabic: science, history and the absurdity of it all, explained very fast. Today: {t}. About {min} minutes.',
        'Time for El Daheeh. Ahmed El Ghandour talks, quickly, about {t}. Around {min} minutes. Hold on.',
        'A lighter kind of podcast now, in Arabic. El Daheeh: {t}.',
        'Here is El Daheeh, the curious one, with {t}. About {min} minutes, and a lot of words.',
      ],
      outros: [
        'That was El Daheeh. Breathe. Back to the music.',
        'El Daheeh, as fast as ever. Now, something slower.',
        'That was El Daheeh. Let a song settle what we just learned.',
      ],
    },
  };

  // How the host says names that are written for the eye: "Da7ee7" uses 7 for ح, and the voice read it as "seven".
  // Applied to everything Astro and Luna say, episode titles included.
  R.sayAs = [[/\bel[\s-]*da7ee7\b/gi, 'El Daheeh'], [/\bda7ee7\b/gi, 'Daheeh']];
})();
