// Focus mode, dedications, and the two Arabic shows in the podcast slot.
// Focus tracks are kept apart from everything else: they are never in the catalog, the library, Suggest, the lists,
// the history or the favorites. Every one is instrumental (no singing), checked by hand.
// Format: "Artist|Title|style"
(function () {
  const R = window.RADIO;

  R.focusTracks = [
    // calm space rock and post-rock
    'Explosions in the Sky|Your Hand in Mine|space rock', 'Explosions in the Sky|First Breath After Coma|space rock',
    'Explosions in the Sky|The Only Moment We Were Alone|space rock', 'Explosions in the Sky|Memorial|space rock',
    'Explosions in the Sky|Six Days at the Bottom of the Ocean|space rock', 'God Is an Astronaut|All Is Violent, All Is Bright|space rock',
    'God Is an Astronaut|Fragile|space rock', 'God Is an Astronaut|From Dust to the Beyond|space rock',
    'This Will Destroy You|The Mighty Rio Grande|space rock', 'This Will Destroy You|Quiet|space rock',
    'Mono|Ashes in the Snow|space rock', 'Mono|Halcyon (Beautiful Days)|space rock',
    'Mogwai|Auto Rock|space rock', 'Mogwai|Friend of the Night|space rock', 'Mogwai|Kids Will Be Skeletons|space rock',
    'Pink Floyd|Marooned|space rock', 'Pink Floyd|Any Colour You Like|space rock',
    'Tangerine Dream|Love on a Real Train|space rock', 'Jean-Michel Jarre|Oxygène, Pt. 4|space rock',
    'Jean-Michel Jarre|Oxygène, Pt. 2|space rock', 'Jean-Michel Jarre|Equinoxe, Pt. 5|space rock',
    'Vangelis|Blade Runner Blues|space rock', 'Vangelis|Memories of Green|space rock', 'Vangelis|Alpha|space rock',
    'Hans Zimmer|Time|space rock', 'Hans Zimmer|Cornfield Chase|space rock',
    // ambient
    'Brian Eno|An Ending (Ascent)|ambient', 'Brian Eno|1/1|ambient', 'Brian Eno|Deep Blue Day|ambient',
    'Brian Eno & Harold Budd|First Light|ambient', 'Stars of the Lid|Dungtitled (In A Major)|ambient',
    'Marconi Union|Weightless|ambient', 'Carbon Based Lifeforms|Photosynthesis|ambient', 'Carbon Based Lifeforms|Abiogenesis|ambient',
    'Aphex Twin|Avril 14th|ambient', 'Aphex Twin|#3 (Rhubarb)|ambient',
    'Boards of Canada|Roygbiv|ambient', 'Boards of Canada|Dayvan Cowboy|ambient', 'Boards of Canada|Olson|ambient',
    'Max Richter|On the Nature of Daylight|ambient', 'Max Richter|Spring 1|ambient', "Max Richter|Vladimir's Blues|ambient",
    'Max Richter|Dream 3 (in the midst of my life)|ambient', 'Nils Frahm|Says|ambient', 'Nils Frahm|Ambre|ambient',
    'Nils Frahm|Familiar|ambient', 'Nils Frahm|Re|ambient', 'Ólafur Arnalds|Saman|ambient', 'Ólafur Arnalds|Near Light|ambient',
    'Ólafur Arnalds|Ljósið|ambient', 'Ólafur Arnalds|re:member|ambient', 'Jon Hopkins|Abandon Window|ambient',
    'Jon Hopkins|Light Through the Veins|ambient', 'Helios|Halving the Compass|ambient', 'Eluvium|Radio Ballet|ambient',
    'Ludovico Einaudi|Nuvole Bianche|ambient', 'Ludovico Einaudi|Experience|ambient', 'Ludovico Einaudi|I Giorni|ambient',
    'Ryuichi Sakamoto|Merry Christmas Mr. Lawrence|ambient', 'Ryuichi Sakamoto|Energy Flow|ambient',
    'Erik Satie|Gymnopédie No. 1|ambient', 'Claude Debussy|Clair de Lune|ambient',
    'Moby|Everloving|ambient', 'Moby|God Moving Over the Face of the Waters|ambient',
    // synthwave study session
    'HOME|Resonance|synthwave', 'HOME|Tides|synthwave', 'HOME|Decay|synthwave', 'HOME|New Machines|synthwave',
    'Com Truise|Brokendate|synthwave', 'Com Truise|Propagation|synthwave', 'Com Truise|Cathode Girls|synthwave',
    'Kavinsky|Roadgame|synthwave', 'Kavinsky|Testarossa Autodrive|synthwave', 'Lazerhawk|Visitors|synthwave',
    'FM-84|Arcade Summer|synthwave',
    // chillwave and study core
    'Tycho|Awake|chillwave', 'Tycho|Dive|chillwave', 'Tycho|A Walk|chillwave', 'Tycho|Montana|chillwave',
    'Tycho|Coastal Brake|chillwave', 'Tycho|Epoch|chillwave', 'Tycho|Hours|chillwave', 'Tycho|Division|chillwave',
    'Nujabes|Aruarian Dance|study', 'Nujabes|Reflection Eternal|study', 'Nujabes|Kumomi|study',
    'Nujabes & Uyama Hiroto|Waltz of Reincarnation|study', 'Bonobo|Cirrus|study', 'Bonobo|Ketto|study', 'Bonobo|Black Sands|study',
    'Emancipator|Soon It Will Be Cold Enough to Build Fires|study', 'Emancipator|Anthem|study', 'Nightmares on Wax|You Wish|study',
    'Ratatat|Loud Pipes|chillwave', 'Ratatat|Wildcat|chillwave', 'Ratatat|Seventeen Years|chillwave',
    'Khruangbin|August 10|chillwave', 'Khruangbin|Two Fish and an Elephant|chillwave',
    'Air|Alone in Kyoto|chillwave', "Air|La Femme d'Argent|chillwave",
    // jazz
    'Miles Davis|So What|jazz', 'Miles Davis|Blue in Green|jazz', 'Miles Davis|Flamenco Sketches|jazz',
    'Bill Evans|Peace Piece|jazz', 'Bill Evans Trio|Waltz for Debby|jazz', 'Bill Evans Trio|My Foolish Heart|jazz',
    'John Coltrane|Naima|jazz', 'John Coltrane|Equinox|jazz', 'Duke Ellington & John Coltrane|In a Sentimental Mood|jazz',
    'Dave Brubeck|Take Five|jazz', 'Dave Brubeck|Blue Rondo à la Turk|jazz', 'Herbie Hancock|Maiden Voyage|jazz',
    'Herbie Hancock|Cantaloupe Island|jazz', "Thelonious Monk|'Round Midnight|jazz", 'Cannonball Adderley|Autumn Leaves|jazz',
    'Ahmad Jamal|Poinciana|jazz', "Wes Montgomery|Bumpin' on Sunset|jazz", 'Charles Mingus|Goodbye Pork Pie Hat|jazz',
    'Vince Guaraldi Trio|Linus and Lucy|jazz', 'Vince Guaraldi Trio|Cast Your Fate to the Wind|jazz',
    'Yusef Lateef|Love Theme from Spartacus|jazz', 'GoGo Penguin|Hopopono|jazz', 'Bob James|Nautilus|jazz',
    'Esbjörn Svensson Trio|Seven Days of Falling|jazz',
    // dub
    'Augustus Pablo|King Tubby Meets Rockers Uptown|dub', 'Augustus Pablo|Java|dub', 'Augustus Pablo|East of the River Nile|dub',
    'The Upsetters|Return of Django|dub', 'Scientist|Dance of the Vampires|dub',
    'Pachyman|Destroy the Empire|dub', 'Pachyman|All Night Long|dub', 'Pachyman|Sunset Sound|dub', 'Pachyman|Dub Fellowship|dub',
    'Pachyman|Strictly Vibes|dub',
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
