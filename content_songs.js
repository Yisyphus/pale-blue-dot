// Hand-written introductions and back-announcements for each song. Keyed by lowercase song title.
// Each song has several intros and several outros; the radio never repeats one until all are used.
(function () {
  const R = window.RADIO;
  R.songScripts = {

    'time': {
      intros: [
        'Next, Time, by Pink Floyd. It opens with a wall of clocks that engineer Alan Parsons recorded one by one in an antique shop, and then stitched together. Listen for the moment all the alarms go off at once.',
        'Here is a song that stayed on the American album chart for well over seven hundred weeks, and it is about wasting your youth. Pink Floyd, Time.',
        'Roger Waters wrote the words of this one when he realized that he had been waiting for his life to start, not living it. The song is Time, by Pink Floyd. Let it nudge you.',
        'Some songs are clocks with a melody. This is the most famous one. Pink Floyd, Time, from The Dark Side of the Moon.',
      ],
      backs: ['That was Time, by Pink Floyd. Ticking away the moments, and the moments do not come back. Fortunately, there are more of them.', 'Pink Floyd, with Time. If it made you want to do one thing today that matters, do that.'],
    },
    'echoes': {
      intros: [
        'This next one is long, and it is on purpose. Pink Floyd, Echoes, over twenty minutes, from the album Meddle. It begins with a single piano note sent through a rotating speaker, like a sonar ping from deep water.',
        'There is a famous sound in this song that sounds like a seagull crying in the dark. It was reportedly made by a guitar pedal plugged in backwards. Pink Floyd, Echoes. Settle in.',
        'Echoes is about two strangers who meet each other\'s eyes across a gap, and realize they are the same. It lasts about as long as a quiet walk. Pink Floyd.',
        'I will not talk over this one, because it asks for your full attention. Pink Floyd, Echoes. It is a whole side of a record, and a whole mood.',
      ],
      backs: ['That was Echoes, by Pink Floyd. You may notice the room feels a little wider now.', 'Pink Floyd, with Echoes. Twenty minutes of one idea, and still it ended too soon.'],
    },
    'five years': {
      intros: [
        'David Bowie, Five Years. The opening track of Ziggy Stardust. It begins with a drum that sounds like a slow heartbeat, and then the news arrives: the earth has only five years left.',
        'What would you do if the news said you had five years? Bowie did not give an answer. He just watched people react, which is more honest. David Bowie, Five Years.',
        'Some songs predict the end of the world. This one watches people shopping while it happens. David Bowie, Five Years.',
        'Here is how an album about a rock star from space begins: with the end of the world, told calmly. Bowie, Five Years.',
      ],
      backs: ['That was Five Years, by David Bowie. The strangest thing about the end of the world is that it feels so ordinary.', 'David Bowie, Five Years. Look around you. We have used some of those years already.'],
    },
    'my way': {
      intros: [
        'The English words of this song were written by Paul Anka, over a French song about a marriage going cold. Frank Sinatra recorded it in 1969. My Way.',
        'Sinatra reportedly grew tired of this song. Everyone else never did. It is the anthem of anyone who wants to stand at the end and say: I owned my choices. Frank Sinatra, My Way.',
        'A song for looking back from the end of the road. It is proud and a little bit defiant, and underneath it, quietly tender. Frank Sinatra, My Way.',
        'It started in France as Comme d\'habitude, a song of tired routine. Somewhere on the way to English, it turned into a monument. Sinatra, My Way.',
      ],
      backs: ['That was My Way, by Frank Sinatra. Regrets, he said, a few. Mine too. Fine.', 'Frank Sinatra, with My Way. The question is never whether you did it right. It is whether you did it yourself.'],
    },
    'time moves slow': {
      intros: [
        'BADBADNOTGOOD started as jazz students in Toronto, and you can still hear the training in how they let a groove breathe. Time Moves Slow, with Samuel T. Herring on vocals.',
        'The title says it all. This is a song for the hour when the clock refuses to hurry. BADBADNOTGOOD, Time Moves Slow.',
        'Jazz is the sound of improvising without a script, which is the human condition with a saxophone. Here is a modern cousin of it. BADBADNOTGOOD, Time Moves Slow.',
        'Let this one stretch the next few minutes. BADBADNOTGOOD, with the voice of Samuel T. Herring, and Time Moves Slow.',
      ],
      backs: ['That was Time Moves Slow, by BADBADNOTGOOD. It is amazing how a few chords can slow a whole room.', 'BADBADNOTGOOD, Time Moves Slow. If your pulse has dropped a few beats, the song did its job.'],
    },
    'let it happen': {
      intros: [
        'Kevin Parker recorded almost everything on this album by himself, and halfway through this song there is a deliberate glitch, as if the track were skipping. Tame Impala, Let It Happen.',
        'A song about the fear of change, and the strange relief of surrender. Tame Impala, Let It Happen. It runs close to eight minutes, so get comfortable.',
        'Let it happen. Three words, and perhaps the whole philosophy of loosening your grip. Tame Impala.',
        'When the song stutters in the middle, that is not a broken file. It is part of the point. Tame Impala, Let It Happen.',
      ],
      backs: ['That was Let It Happen, by Tame Impala. Resistance is just a very tiring form of hope.', 'Tame Impala, Let It Happen. The skip in the middle is my favorite moment of any song about surrender.'],
    },
    'forget about life': {
      intros: [
        'Alvvays, a band from Toronto, with a bright jangle over a quietly fatalistic idea: when the weight gets too much, step out of it for one evening. Forget About Life.',
        'Dream pop is usually the genre of escape, and this is a perfect specimen. Alvvays, Forget About Life.',
        'Sometimes the most honest advice is also the lightest. Alvvays, Forget About Life.',
        'A sweet tune with a sour little thought inside. That is the oldest trick in anti-pop. Alvvays, Forget About Life.',
      ],
      backs: ['That was Forget About Life, by Alvvays. A good song can be a holiday of three minutes.', 'Alvvays, Forget About Life. We did, for a moment. That was the point.'],
    },
    'subterranean homesick alien': {
      intros: [
        'On OK Computer, Thom Yorke imagines being taken up by aliens who would be the only ones who would listen to him. The title is a wink to a Bob Dylan song, but the loneliness is entirely his own. Radiohead, Subterranean Homesick Alien.',
        'What if the visitors from another world were just the only ones who really paid attention? Radiohead, Subterranean Homesick Alien.',
        'A dreamy electric piano, and a very down-to-earth sadness, looking up. Radiohead, Subterranean Homesick Alien.',
        'For anyone who has ever felt like a visitor in their own life, this one is a window seat. Radiohead.',
      ],
      backs: ['That was Subterranean Homesick Alien, by Radiohead. They float above, and see how strange we look from there.', 'Radiohead, with Subterranean Homesick Alien. Being alien is sometimes the best way of seeing.'],
    },
    'hier encore': {
      intros: [
        'Charles Aznavour wrote this when he was around forty, and already looking back on his youth as if it had just left the room. Hier encore. In English it became Yesterday When I Was Young.',
        'The French chanson tradition treats a song like a small novel. This one is about the speed of time. Charles Aznavour, Hier encore.',
        'Aznavour was born Shahnour Aznavourian, in Paris, to Armenian parents. You can hear that old-world melancholy here. Hier encore.',
        'Hier encore, I was twenty years old. Yesterday, still. Charles Aznavour, with a song that never pretended life was simple.',
      ],
      backs: ['That was Hier encore, by Charles Aznavour. The French original is gentler, and a little crueler.', 'Charles Aznavour, with Hier encore. Youth is a country you only see clearly once you have left it.'],
    },
    'taxi driver main title': {
      intros: [
        'This is the last score Bernard Herrmann ever wrote. He died on the night he finished recording it. The theme from Taxi Driver.',
        'Over a steaming New York street, a lonely saxophone, played by Tom Scott, makes isolation sound sweet and dangerous at once. Bernard Herrmann, from Taxi Driver.',
        'Film scores are existential in a quiet way: music that says what a face cannot. It is a few minutes of a man alone in a big city, and it says it all. Bernard Herrmann.',
        'Herrmann also scored Psycho and Vertigo. This one is slower, and sadder, and stranger. The main title of Taxi Driver.',
      ],
      backs: ['That was the Taxi Driver theme, by Bernard Herrmann. A saxophone that sounds like a lit window in the rain.', 'Bernard Herrmann, from Taxi Driver. Lonely is not the same as empty. It just has better lighting.'],
    },
    'hurt': {
      intros: [
        'It began as a Nine Inch Nails song by Trent Reznor. Johnny Cash recorded it near the end of his life, with a trembling voice and a worn guitar, and Reznor himself said it was no longer his song. Hurt.',
        'In this version, one lyric changes: the crown of something harsh becomes a crown of thorns. A small edit that turns a confession into a prayer. Johnny Cash, Hurt.',
        'Johnny Cash died a few months after his wife, June Carter, and not long after recording this. You can hear the long road in every syllable. Hurt.',
        'Some songs cannot be sung by the young. They need the voice that has lost things. Johnny Cash, Hurt.',
      ],
      backs: ['That was Hurt, by Johnny Cash. A whole life, folded into three and a half minutes.', 'Johnny Cash, Hurt. Sometimes honesty is the only music that works.'],
    },
    'the end': {
      intros: [
        'The Doors, The End. It started as a simple goodbye song and grew into an eleven-minute descent. The band was reportedly fired from a club after performing it one night.',
        'Years later, it became the opening of Apocalypse Now. It is the sound of a door closing, slowly, on an old world. The Doors, The End.',
        'Jim Morrison improvised some of the darkest passages right there in the studio. This is psychedelia looking into the abyss and not blinking. The Doors.',
        'This is not a song for background. It is a long, slow walk. The Doors, The End.',
      ],
      backs: ['That was The End, by The Doors. Endings, it turns out, take a lot of time.', 'The Doors, with The End. Please breathe again. I will wait.'],
    },
    'feels like the end': {
      intros: [
        'A quiet, modern confession for the end of a long day. Shane Alexander, Feels Like the End.',
        'Not a dramatic ending. Just the feeling that something is closing, and the courage to say so out loud. Shane Alexander, Feels Like the End.',
        'If today felt heavy, this one will not lighten it, but it will sit with you. Shane Alexander.',
        'Some songs do not try to cheer you up. They just stay in the room. Shane Alexander, Feels Like the End.',
      ],
      backs: ['That was Feels Like the End, by Shane Alexander. It rarely is, though. Endings and beginnings share a border.', 'Shane Alexander, Feels Like the End. A gentle song, for a long evening.'],
    },
    'kimochi warui': {
      intros: [
        'Will Toledo, who is Car Seat Headrest, made his first records alone, reportedly in the back seat of a car, because that was where he could record without being heard. Kimochi Warui.',
        'Kimochi warui is a Japanese phrase for a sick, uneasy feeling, and the song is full of exactly that. Car Seat Headrest.',
        'A lo-fi song with a very hi-fi anxiety. Car Seat Headrest, Kimochi Warui, with a very long question in the title.',
        'This is the sound of someone thinking out loud at three in the morning, and somehow you are in the room. Car Seat Headrest.',
      ],
      backs: ['That was Kimochi Warui, by Car Seat Headrest. A queasy kind of beauty.', 'Car Seat Headrest, with Kimochi Warui. When? When? When? Honestly, I wonder too.'],
    },
    'times to die': {
      intros: [
        'A song that wanders through the question of when, or whether, it is time to die, and ends up somewhere warmer than it began. Car Seat Headrest, Times to Die.',
        'Will Toledo writes like someone talking to himself in the dark, and somehow it sounds like a friend. Car Seat Headrest, Times to Die.',
        'Dark subject, strangely tender song. Car Seat Headrest, Times to Die.',
        'Indie rock at its most confessional. Car Seat Headrest, Times to Die. A song that does not look away.',
      ],
      backs: ['That was Times to Die, by Car Seat Headrest. It is amazing how gently a song can hold a heavy thought.', 'Car Seat Headrest, Times to Die. If it was heavy, drink some water. I mean it.'],
    },
    'in the aeroplane over the sea': {
      intros: [
        'Jeff Mangum wrote this album after being moved by the diary of Anne Frank, and the grief and the tenderness bleed into everything. Neutral Milk Hotel, In the Aeroplane Over the Sea.',
        'After this album came out, Mangum largely withdrew from music, and the record became a quiet legend. Neutral Milk Hotel, the title track.',
        'A fuzzy, strange, tender song, sung as if the singer were trying not to wake the dead. Neutral Milk Hotel.',
        'What a strange and lovely thing, to write about love and mortality with a singing saw. Neutral Milk Hotel, In the Aeroplane Over the Sea.',
      ],
      backs: ['That was In the Aeroplane Over the Sea, by Neutral Milk Hotel. How lovely that something so fragile has lasted.', 'Neutral Milk Hotel, In the Aeroplane Over the Sea. How strange and splendid, to be alive at all.'],
    },
    'starless': {
      intros: [
        'The closing of the album Red begins as a sorrowful ballad and slowly grows into a great, tense, grinding climb, before dissolving back into the first melody. King Crimson, Starless.',
        'The title comes from a line in Dylan Thomas: starless and bible-black. It is the dark, and the song does not look away from it. King Crimson.',
        'Twelve minutes of someone looking at the dark and deciding not to blink. King Crimson, Starless. Progressive rock, and you can feel why.',
        'A saxophone arrives, and the night breaks open. King Crimson, Starless.',
      ],
      backs: ['That was Starless, by King Crimson. A song that turns darkness into architecture.', 'King Crimson, Starless. Long music is a way of saying some things cannot be hurried.'],
    },
    'i talk to the wind': {
      intros: [
        'A flute drifting over soft guitar, from the 1969 debut of King Crimson. The words, by Peter Sinfield, are about speaking and not being heard. I Talk to the Wind.',
        'Some music works best as a conversation with nobody. King Crimson, I Talk to the Wind.',
        'Before the heavy and complicated side of King Crimson, there was this, gentle and wistful, with a flute. I Talk to the Wind.',
        'Have you ever spoken, and felt only the wind answer? This song has been there. King Crimson.',
      ],
      backs: ['That was I Talk to the Wind, by King Crimson. A very polite kind of loneliness.', 'King Crimson, with I Talk to the Wind. The wind, I suspect, was listening.'],
    },
    'al abd wal waili': {
      intros: [
        'A voice from the Arabic underground, with a beat and a bite. El Waili and Yucifer. It is street-level existential thought: not philosophy in a book, but philosophy in a mouth that has had enough.',
        'Hip hop and existential thought have always been close. It is a genre built on speaking from the edge. El Waili, featuring Yucifer.',
        'Here is a different accent of the same questions. El Waili and Yucifer, in Arabic.',
        'You do not need to understand every word to feel the weight in this. El Waili, featuring Yucifer.',
      ],
      backs: ['That was El Waili, featuring Yucifer. Raw, direct, and unwilling to pretend.', 'El Waili and Yucifer. Some truths are better spat than whispered.'],
    },
    'ブート': {
      intros: [
        'Macintosh Plus is the most famous name in vaporwave: slowed-down samples of decades-old pop, echoing through empty digital malls. Here is the track called Boot.',
        'Vaporwave is nostalgia for a future that never arrived. Macintosh Plus, with a track written in Japanese letters.',
        'A strange genre, and an honest one about consumer dreams and how quickly they fade. Macintosh Plus.',
        'It is the sound of an elevator going nowhere, in a mall that closed years ago. Macintosh Plus.',
      ],
      backs: ['That was Macintosh Plus. Nostalgia for something that was never really yours.', 'Macintosh Plus, vaporwave. The future we were promised, played slowly, in a very empty hall.'],
    },
    'i\'m not in love': {
      intros: [
        'The wall of ghostly voices in this song is not a synthesizer. The band recorded their own voices singing single notes, over and over, and layered hundreds of tracks into a choir. 10cc, I\'m Not In Love.',
        'The whispered line in the middle was reportedly spoken by a studio secretary, asked to say it softly. 10cc, I\'m Not In Love.',
        'The most elaborate denial in pop music. Nobody protests that much without meaning the opposite. 10cc.',
        'Sometimes love says no, with a very soft voice. 10cc, I\'m Not In Love.',
      ],
      backs: ['That was I\'m Not In Love, by 10cc. We all know what that means.', '10cc, I\'m Not In Love. Big boys do cry, by the way. I checked.'],
    },
    'chamber of reflection': {
      intros: [
        'A woozy synth over a slow beat. The phrase chamber of reflection also names a dark little room, in some initiation rituals, where a person sits alone with symbols of mortality, and thinks. Mac DeMarco, with a couch version of that.',
        'Mac DeMarco is a Canadian with a lopsided smile and a sound like a warped cassette. Chamber of Reflection.',
        'It sounds like thinking, slowed down, in a room with the curtains drawn. Mac DeMarco, Chamber of Reflection.',
        'Sometimes the best place to meet yourself is a very small room and a very slow song. Mac DeMarco.',
      ],
      backs: ['That was Chamber of Reflection, by Mac DeMarco. A very comfortable way to be alone.', 'Mac DeMarco, Chamber of Reflection. Reflect on that for as long as you like.'],
    },
    'in my dreams (cudder anthem)': {
      intros: [
        'Kid Cudi was one of the first big rappers to speak openly about depression and loneliness, back when that was rarely said in the genre. In My Dreams, the Cudder Anthem.',
        'A hummed dream from a lonely room. Kid Cudi, In My Dreams.',
        'Hip hop, but on the quietest end of it: a person looking at the ceiling, and making a song about it. Kid Cudi.',
        'The Cudder Anthem is a small ritual for the lonely, and a reminder that dreaming is allowed. Kid Cudi.',
      ],
      backs: ['That was In My Dreams, by Kid Cudi. Humming, as it turns out, can be a form of survival.', 'Kid Cudi, the Cudder Anthem. Thank you for saying the quiet part.'],
    },
    'within': {
      intros: [
        'Two robots, a piano by Chilly Gonzales, and a voice that admits it does not know who it is. Daft Punk, Within.',
        'The most human moment on an album about machines. Daft Punk, Within.',
        'A synthesized voice, a gentle piano, and a very honest confusion. Daft Punk, from Random Access Memories.',
        'Even the robots, it seems, have an identity crisis. Daft Punk, Within.',
      ],
      backs: ['That was Within, by Daft Punk. Strangely, a robot can say it better than most of us.', 'Daft Punk, Within. I do not know who I am either. Let us find out slowly.'],
    },
    'imagine': {
      intros: [
        'It is simple enough for a child to play and radical enough to scare governments. No heaven, no countries, no possessions. A thought experiment disguised as a lullaby. John Lennon, Imagine.',
        'The song was inspired in part by the instruction poems of Yoko Ono, and in 2017 she was officially credited as a co-writer. John Lennon, Imagine.',
        'Whatever you believe, it is hard not to be moved by a man asking you to picture a kinder world. John Lennon.',
        'Imagine is a dream that has had fifty years to come true, and is still politely waiting. John Lennon.',
      ],
      backs: ['That was Imagine, by John Lennon. You may say it is a dream. It is, and so is everything we build.', 'John Lennon, Imagine. A small piano, and a very big idea.'],
    },
    'the lunar tune': {
      intros: [
        'A drifting little piece that feels like watching the moon from an open window. Skywatchers, The Lunar Tune.',
        'Not every song needs a message. Some are just somewhere to be. Skywatchers, The Lunar Tune.',
        'Look up. Even if you are indoors. Skywatchers, with The Lunar Tune.',
        'A gentle tune for the moon, and for those of us who talk to it. Skywatchers.',
      ],
      backs: ['That was The Lunar Tune, by Skywatchers. A quiet little visit to the sky.', 'Skywatchers, The Lunar Tune. The moon, I am told, enjoyed it too.'],
    },
    'blue spotted tail': {
      intros: [
        'From Helplessness Blues, an album that asks what it means to be one person among billions. Fleet Foxes, Blue Spotted Tail.',
        'Robin Pecknold sings this close to the bone, like a thought said out loud by a campfire. Fleet Foxes.',
        'Folk music is philosophy for people who do not have time for philosophy. A voice, a guitar, and plain words. Fleet Foxes, Blue Spotted Tail.',
        'A little song about the weight of being yourself. Fleet Foxes, from Seattle, with Blue Spotted Tail.',
      ],
      backs: ['That was Blue Spotted Tail, by Fleet Foxes. Quiet and plain, and somehow enormous.', 'Fleet Foxes, Blue Spotted Tail. Bring a blanket next time.'],
    },
    'time to pretend': {
      intros: [
        'MGMT, two college friends from Connecticut, made this glittery anthem about becoming a rock star, and filled it with a joke about how empty the dream is. Time to Pretend.',
        'Anti-pop at its brightest. You dance, and then the lyrics catch up with you. MGMT, Time to Pretend.',
        'Everyone wants to live fast and be remembered. This song watches the party, and takes a quiet look at the morning after. MGMT.',
        'It sounds like a celebration, and reads like a warning. MGMT, Time to Pretend.',
      ],
      backs: ['That was Time to Pretend, by MGMT. A very shiny way to say that nothing lasts.', 'MGMT, Time to Pretend. The party is brief. Pick your company wisely.'],
    },
    'a change is gonna come': {
      intros: [
        'Written in 1964, the year Sam Cooke lost his young son, and the year he was turned away from a motel. He wrote it in sorrow and defiance, and it was released after his death. A Change Is Gonna Come.',
        'It carries the whole weight of waiting for justice, and never quite stops believing. Sam Cooke.',
        'Soul music is what happens when suffering has to be sung. Sam Cooke, A Change Is Gonna Come.',
        'It has been a long, long time coming. And yet. Sam Cooke.',
      ],
      backs: ['That was A Change Is Gonna Come, by Sam Cooke. One of the greatest songs ever sung, and one of the saddest.', 'Sam Cooke. A voice that did not stop believing, even in the dark.'],
    },
    'namla': {
      intros: [
        'Namla means ant. A tiny creature carrying a load far bigger than itself, day after day, without asking why. Camus imagined Sisyphus happy. Here, it is the ant. Tamer Abu Ghazaleh.',
        'A song in Arabic about the smallest worker in the world, and the biggest question. Tamer Abu Ghazaleh, Namla.',
        'There is a quiet dignity in carrying on, even when the load is absurd. Tamer Abu Ghazaleh, Namla.',
        'The ant does not ask why it works. It just walks. Tamer Abu Ghazaleh.',
      ],
      backs: ['That was Namla, by Tamer Abu Ghazaleh. The little ant, and the big mystery.', 'Tamer Abu Ghazaleh, with Namla. We are all the ant, some days.'],
    },
    'walking the cow': {
      intros: [
        'Daniel Johnston recorded his songs on cheap cassettes in his parents\' home in Texas, and fought a lifelong struggle with mental illness. His voice cracks, and that is the point. Walking the Cow.',
        'Kurt Cobain once wore Daniel Johnston\'s artwork on a T-shirt, on television. Here is the song. Walking the Cow.',
        'A lo-fi song with a fragile heart. Daniel Johnston, Walking the Cow.',
        'You do not need a perfect studio to say a true thing. Daniel Johnston.',
      ],
      backs: ['That was Walking the Cow, by Daniel Johnston. Fragile, and honest, and ours.', 'Daniel Johnston. The cracks in a voice are sometimes the best part.'],
    },
    'wait': {
      intros: [
        'The closer of Hurry Up, We\'re Dreaming. Anthony Gonzalez, of M83, builds a quiet cathedral of synthesizers, and then the whole thing swells like a long breath. Wait.',
        'M83 is a French project, from Antibes, that sounds like a memory of a summer you never had. Wait.',
        'A song about waiting, and what it means to arrive. M83.',
        'Wait. One word, and the whole song is that. M83.',
      ],
      backs: ['That was Wait, by M83. A cathedral of synthesizers, and a very soft goodbye.', 'M83, with Wait. If you are still waiting, you are in good company.'],
    },
    'je cours': {
      intros: [
        'A song about running: from stress, from stillness, from yourself. Stromae is Belgian, with Rwandan roots, and he makes dance music that carries therapy-level honesty. Je cours.',
        'It is the soundtrack to every busy day that is secretly a flight. Stromae, Je cours.',
        'Dance music, with a heavy thought in its pocket. Stromae, from the album Multitude. Je cours.',
        'I run, he sings. And you may recognize yourself in it. Stromae.',
      ],
      backs: ['That was Je cours, by Stromae. We run so we do not have to listen to the quiet.', 'Stromae, Je cours. Maybe sit down for the next one.'],
    },
    'sommeil': {
      intros: [
        'Sommeil means sleep, the great daily rehearsal for death, and the one thing we cannot force. Stromae, Sommeil.',
        'A song about how badly the modern mind wants to rest, and how bad it is at doing so. Stromae, from the album Multitude.',
        'If you cannot sleep tonight, you are in excellent company. Stromae, Sommeil.',
        'Sleep: a country we visit every night, and have never learned to explain. Stromae.',
      ],
      backs: ['That was Sommeil, by Stromae. I hope you sleep tonight. Truly.', 'Stromae, Sommeil. Rest is a skill, and we are all beginners.'],
    },
  };
})();
