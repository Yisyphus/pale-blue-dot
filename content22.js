// What the host knows about the songs: short, spoken notes on what a song is about or the story behind it (R.songNotes,
// by "artist|title" as in the library), and on the artists themselves (R.artistNotes, by artist name; these also cover
// songs you add later by the same artist). Only well-known facts; interpretations are said as interpretations.
(function () {
  const R = window.RADIO;
  const S = R.songNotes = R.songNotes || {}, A = R.artistNotes = R.artistNotes || {};
  const N = (a, t, notes) => { S[(a + '|' + t).toLowerCase()] = notes; };

  // ---------- progressive rock ----------
  N('Pink Floyd', 'Wish You Were Here', ['It came out in 1975, and much of it was written with Syd Barrett in mind, the founding member the band lost to illness. It is a song about absence: someone who is still alive, and still gone.', 'It opens like a radio being tuned, and then a lonely acoustic guitar plays along with it. A song that sounds like it was found, not made.']);
  N('Pink Floyd', 'Comfortably Numb', ['From The Wall, in 1979. Roger Waters wrote the words, partly from a night he was given a sedative so he could go on stage. David Gilmour wrote the music, and the solo at the end is one of the most loved in rock.', 'It is about the numbness that arrives when feeling becomes too much. The verses are a doctor talking; the chorus is someone already drifting away.']);
  N('Pink Floyd', 'Us and Them', ['From The Dark Side of the Moon, 1973. Richard Wright first wrote the music for a film, and the director turned it down. Pink Floyd turned it into a slow song about war, and about how easily we divide people into us, and them.']);
  N('Pink Floyd', 'Shine On You Crazy Diamond (Parts I-V)', ['A tribute to Syd Barrett. While the band was recording it in 1975, Syd himself walked into the studio, so changed that at first nobody recognised him.', 'Those four long guitar notes at the start are sometimes called Syd\'s theme. The whole song takes its time, the way grief does.']);
  N('Pink Floyd', 'Breathe', ['The first real song on The Dark Side of the Moon. It sounds like advice to someone just starting life: run, work, dig, and do not forget to breathe while you are at it.']);
  N('Pink Floyd', 'Brain Damage', ['From The Dark Side of the Moon. Roger Waters wrote it about madness, with Syd Barrett, once again, somewhere in the background.']);
  N('Pink Floyd', 'Eclipse', ['The last song on The Dark Side of the Moon. It lists everything we touch, see, love and hate, everything under the sun, and then the moon covers it all. Then a heartbeat, and silence.']);
  N('Pink Floyd', 'Hey You', ['From The Wall. The main character has finished building his wall, and now he is calling out from behind it, hoping someone is still there to hear.']);
  N('Pink Floyd', 'High Hopes', ['The last song on The Division Bell, from 1994. David Gilmour looks back at his childhood in Cambridge, at the hopes he had then, with a slow bell tolling under everything.']);
  N('Pink Floyd', 'Astronomy Domine', ['The opening song of their first album, in 1967, written by Syd Barrett. Space rock, before anyone had named it.']);
  N('Pink Floyd', 'See Emily Play', ['A 1967 single by Syd Barrett, from the early, psychedelic Pink Floyd. Bright and strange at the same time, like Syd himself.']);
  N('King Crimson', 'Epitaph', ['From their first album, In the Court of the Crimson King, in 1969. Peter Sinfield\'s words fear a world where knowledge runs ahead of wisdom. Greg Lake sings it, under a wall of Mellotron.']);
  N('King Crimson', 'The Court of the Crimson King', ['The title song of their 1969 debut, one of the albums that started progressive rock. Grand, theatrical, and full of Mellotron.']);
  N('King Crimson', 'Moonchild', ['From their 1969 debut. A short, delicate song that dissolves into a long, quiet improvisation. Patience, as a piece of music.']);
  N('Genesis', 'Firth of Fifth', ['From Selling England by the Pound, 1973. It opens with Tony Banks\' piano and is remembered for Steve Hackett\'s guitar solo, one of the most lyrical in progressive rock.']);
  N('Genesis', "Supper's Ready", ['From Foxtrot, in 1972. Twenty-three minutes, seven parts, and Peter Gabriel telling a story that starts in a living room and ends at the end of the world.']);
  N('Genesis', 'The Carpet Crawlers', ['From The Lamb Lies Down on Broadway, 1974, Peter Gabriel\'s last album with Genesis. People crawling slowly up a corridor towards a door: a picture of how we all move towards something we cannot see.']);
  N('Genesis', 'The Cinema Show', ['From Selling England by the Pound. A modern Romeo and Juliet, getting ready for a date, with a long instrumental ending that just keeps rising.']);
  N('Yes', 'Close to the Edge', ['The title song of their 1972 album, almost nineteen minutes long. Jon Anderson was inspired by Hermann Hesse\'s Siddhartha: a journey towards understanding, by a river.']);
  N('Yes', 'And You and I', ['From Close to the Edge, 1972. One of their gentlest long songs, built like a hymn, with Jon Anderson\'s high voice at the centre.']);
  N('Yes', 'Heart of the Sunrise', ['The closing song of Fragile, from 1971. It moves between a nervous, driving riff and very quiet singing about being lost in a big city.']);
  N('Rush', 'Subdivisions', ['From Signals, 1982. Neil Peart wrote it about growing up in the suburbs, where you either conform or you are cast out. Many listeners say it described their teenage years exactly.']);
  N('Rush', 'The Pass', ['From Presto, 1989. Neil Peart wrote it for teenagers thinking about suicide: it does not romanticise the act, and it asks them to stay.']);
  N('Rush', 'Closer to the Heart', ['From A Farewell to Kings, 1977. A short song with a big idea: the world gets better when each of us, in our own work, aims a little closer to the heart.']);
  N('Camel', 'Ice', ['A long guitar instrumental by Andy Latimer, from 1979. Cold on the surface, and very warm underneath.']);
  N('Camel', 'Lunar Sea', ['From Moonmadness, 1976. An instrumental that sounds like a night drive over the surface of the moon.']);
  N('Jethro Tull', 'Aqualung', ['The title song of their 1971 album. It is a portrait of a homeless man, the kind of person most people walk past without looking. Ian Anderson\'s wife, Jennie, wrote some of the words after photographing people living on the street.']);
  N('Van der Graaf Generator', 'Still Life', ['The title song of their 1976 album. Peter Hammill asks what living forever would really mean, and suggests it might be the saddest thing of all.']);
  N('Emerson, Lake & Palmer', 'Lucky Man', ['Greg Lake wrote this song when he was about twelve, on his first guitar. Years later it closed their first album, with Keith Emerson\'s Moog solo at the end.', 'A man has everything, white lace and feathers, and then a bullet. A short song about how luck runs out.']);
  N('The Moody Blues', 'Nights in White Satin', ['Justin Hayward wrote it when he was nineteen. It came out in 1967 on Days of Future Passed, and took years to become the classic it is now.']);

  // ---------- modern progressive ----------
  N('Porcupine Tree', 'Trains', ['From In Absentia, 2002. Steven Wilson\'s song about longing for someone, with the sound of trains as the thread through it.']);
  N('Porcupine Tree', 'The Sound of Muzak', ['From In Absentia. A song about music being turned into background noise, sold by the yard, and about how much that can hurt someone who loves it.']);
  N('Porcupine Tree', 'Lazarus', ['From Deadwing, 2005. A gentle piano song, a voice calling someone home from the other side.']);
  N('Steven Wilson', 'Routine', ['From Hand. Cannot. Erase., 2015. A woman keeps up her daily routine after losing her husband and children, because the routine is the only thing still holding her together.', 'The album was inspired by Joyce Vincent, a young woman in London who died alone in her flat, and nobody noticed for years. A whole record about how lonely a city can be.']);
  N('Steven Wilson', 'The Raven That Refused to Sing', ['The title song of his 2013 album. An old man believes a raven is his late sister, come back to sing to him the way she did when they were children.']);
  N('Steven Wilson', 'Drive Home', ['From The Raven That Refused to Sing. A ghost story: a man whose partner disappeared during a drive at night, and who cannot remember what happened.']);
  N('Opeth', 'Windowpane', ['From Damnation, 2003, the quiet album by a band better known for heavy metal. It shows that their darkness was always there, even without the noise.']);

  // ---------- art rock ----------
  N('Radiohead', 'Paranoid Android', ['From OK Computer, 1997. Its name comes from Marvin, the depressed robot in The Hitchhiker\'s Guide to the Galaxy. It changes shape several times in six minutes, which is why people compared it to Bohemian Rhapsody.']);
  N('Radiohead', 'Pyramid Song', ['From Amnesiac, 2001. Thom Yorke said he was inspired by an exhibition of Egyptian art, and by the idea that time is not a line. The rhythm floats so freely that it is hard to count.']);
  N('Radiohead', 'Karma Police', ['From OK Computer. It started as a joke inside the band: calling the karma police on someone annoying. It ends with a man who, for a minute there, lost himself.']);
  N('Radiohead', 'No Surprises', ['From OK Computer. It sounds like a lullaby, with a little glockenspiel, but it is about a quiet life that is slowly suffocating you. The gentlest song about despair you will hear today.']);
  N('Radiohead', 'Fake Plastic Trees', ['From The Bends, 1995. Thom Yorke recorded his vocal in a few takes after watching Jeff Buckley perform. It is about a world made of plastic, and the wish to feel something real in it.']);
  N('Radiohead', 'Street Spirit (Fade Out)', ['The last song on The Bends. Thom Yorke said it was inspired by Ben Okri\'s novel The Famished Road, and called it one of their darkest songs. The ending asks you to let your soul be made of love.']);
  N('Radiohead', 'How to Disappear Completely', ['From Kid A, 2000. Michael Stipe of R.E.M. once gave Thom Yorke a piece of advice for when it all gets too much: tell yourself, I am not here, this is not happening. This song is built on that.']);
  N('Radiohead', 'Exit Music (For a Film)', ['Written for the end credits of Baz Luhrmann\'s Romeo + Juliet, in 1996. It starts as a whisper and ends in a storm.']);
  N('Radiohead', 'Videotape', ['The last song on In Rainbows, 2007. Someone records a message to be watched after they are gone. It is about the moments we would want to keep.']);
  N('Radiohead', 'Everything in Its Right Place', ['The first song on Kid A. After the long tour for OK Computer, Thom Yorke found it hard to write or even speak. This was the song where things began to make sense again.']);
  N('David Bowie', 'Space Oddity', ['Released in 1969, days before the Apollo 11 moon landing. Major Tom floats away from Earth, and the line to ground control goes quiet.']);
  N('David Bowie', 'Life on Mars?', ['From Hunky Dory, 1971, with Rick Wakeman on piano. Bowie wrote it partly as a reply to My Way: he had written English words to the same French song, and lost the job to Paul Anka.', 'A girl sits alone in a cinema, bored by the film of her own life, and asks if there is life on Mars.']);
  N('David Bowie', 'Heroes', ['Recorded in Berlin in 1977, near the Wall. Two lovers meet by the Wall, and for one day they can be heroes. Robert Fripp plays the long, singing guitar.']);
  N('David Bowie', 'Lazarus', ['From Blackstar, released two days before Bowie died in January 2016. He knew he was dying, and he made his farewell into a piece of art.']);
  N('David Bowie', "Rock 'n' Roll Suicide", ['The last song on Ziggy Stardust, 1972. Ziggy is falling apart, and at the very end Bowie turns to the listener and says: you are not alone.']);
  N('David Bowie', 'Ashes to Ashes', ['From 1980. Bowie brings back Major Tom, the astronaut from Space Oddity, eleven years later, and he is not doing well.']);
  N('David Bowie', 'Quicksand', ['From Hunky Dory. Bowie lists the thinkers and the faiths he was reading, and admits he is sinking in all of it. A song about not knowing, sung by someone very honest.']);
  N('Talking Heads', 'Once in a Lifetime', ['From Remain in Light, 1980, produced with Brian Eno. David Byrne sings like a preacher, asking a question many of us ask one day: how did I get here?']);
  N('Talking Heads', 'This Must Be the Place (Naive Melody)', ['From 1983. David Byrne called it one of his rare straight love songs, and the band played it on swapped instruments, which gives it its simple, naive sound.', 'Home, it says, is not a place, but a person.']);
  N('Talking Heads', 'Heaven', ['From Fear of Music, 1979. Heaven is a bar where nothing ever happens, and where the band plays your favourite song all night long.']);
  N('The Velvet Underground', 'Pale Blue Eyes', ['From their third album, 1969. Lou Reed\'s quietest love song, about someone he could not have.']);
  N('The Velvet Underground', 'Sunday Morning', ['The first song on their first album, in 1967. The bright, tired light of a Sunday morning, and the feeling that everything you did last week is waiting for you.']);
  N('Lou Reed', 'Perfect Day', ['From Transformer, 1972. A perfect day in the park with someone, sangria, a film, and a last line that makes you wonder what it cost.']);

  // ---------- psychedelia ----------
  N('The Doors', 'Riders on the Storm', ['The last song the Doors recorded with Jim Morrison, in 1971. Real rain and thunder, a Fender Rhodes, and a very dark story told very calmly.']);
  N('The Doors', 'People Are Strange', ['From Strange Days, 1967. Robby Krieger said it came from a walk with Jim Morrison when he was feeling low. When you are a stranger, faces look ugly. When you are alone, everything looks strange.']);
  N('Jefferson Airplane', 'White Rabbit', ['Grace Slick wrote it using Alice in Wonderland. It is built like Ravel\'s Bolero: it grows and grows, and stops at its peak.']);
  N('The Beatles', 'A Day in the Life', ['The last song on Sgt. Pepper, 1967. Lennon reads the news, McCartney rushes to catch a bus, and between them an orchestra climbs to a huge chord that rings for about forty seconds.']);
  N('The Beatles', 'Tomorrow Never Knows', ['The last song on Revolver, 1966. Lennon took his words from a book based on the Tibetan Book of the Dead. Tape loops, one chord, and a voice he wanted to sound like a monk on a mountain.']);
  N('The Beatles', 'Strawberry Fields Forever', ['Strawberry Field was a Salvation Army children\'s home near John Lennon\'s childhood house in Liverpool, where he used to play. A song about a private world where nothing is real.']);
  N('The Beatles', 'Across the Universe', ['John Lennon said the words came to him almost on their own. In 2008, NASA beamed the song into deep space, towards the North Star.']);
  N('The Beatles', 'I Am the Walrus', ['John Lennon heard that a teacher was asking students to analyse Beatles lyrics. So he wrote the most nonsensical song he could, to give them something to work on.']);
  N('Love', 'Alone Again Or', ['The first song on Forever Changes, 1967, written by Bryan MacLean. Spanish guitar, a mariachi trumpet, and a lover who keeps saying they will be alone again.']);
  N('The Zombies', 'Time of the Season', ['From Odessey and Oracle, 1968, its title misspelled by the cover artist. The band had already split up by the time it became a hit.']);
  N('Jimi Hendrix', 'Little Wing', ['From Axis: Bold as Love, 1967. Barely two and a half minutes, and one of the most beautiful things Hendrix recorded: a gentle spirit who comes to cheer you up.']);
  N('The Byrds', 'Eight Miles High', ['From 1966. The twelve-string guitar was inspired by John Coltrane and Ravi Shankar. The words are about the band\'s flight to London.']);
  N('Cream', 'White Room', ['From Wheels of Fire, 1968. Eric Clapton\'s wah-wah guitar, Jack Bruce singing, and words by the poet Pete Brown.']);

  // ---------- neo-psychedelia ----------
  N('Tame Impala', 'Eventually', ['From Currents, 2015. Kevin Parker sings to someone he is about to leave: it will hurt now, and eventually you will be happier. Breaking up, seen from the side of the one who goes.']);
  N('Tame Impala', 'New Person, Same Old Mistakes', ['The last song on Currents. Rihanna liked it so much she recorded her own version a year later.', 'It is about changing who you are, and the voice that tells you that you are only making the same mistakes in new clothes.']);
  N('Tame Impala', 'Feels Like We Only Go Backwards', ['From Lonerism, 2012. Kevin Parker records almost everything alone, in his home studio in Perth.']);
  N('MGMT', 'Kids', ['From Oracular Spectacular, 2007. A song about growing up, written by two college friends who did not expect anyone to hear it.']);
  N('MGMT', 'Little Dark Age', ['The title song of their 2018 album. A gothic synth song about living through gloomy times, with a strange, dark sense of humour.']);
  N('Unknown Mortal Orchestra', 'Multi-Love', ['The title song of their 2015 album. Ruban Nielson wrote it about a three-person relationship he was living in at the time, and how complicated love can become.']);
  N('The Flaming Lips', 'Do You Realize??', ['From Yoshimi Battles the Pink Robots, 2002. It asks if you realise that everyone you know will one day die, and then asks you to tell them you love them. In 2009 it became the official rock song of Oklahoma.']);
  N('The Flaming Lips', "Waitin' for a Superman", ['From The Soft Bulletin, 1999. Wayne Coyne wrote it while his father was dying of cancer. Even Superman, it says, cannot lift this.']);
  N('Spiritualized', 'Ladies and Gentlemen We Are Floating in Space', ['The title song of their 1997 album, which came packaged like a box of prescription medicine. Jason Pierce wrote much of it after a painful breakup.']);
  N('Melody\'s Echo Chamber', 'I Follow You', ['From her 2012 debut, made by the French singer Melody Prochet with Kevin Parker of Tame Impala.']);
  N('Khruangbin', 'Maria También', ['From Con Todo El Mundo, 2018. The band dedicated it to the women of Iran before the 1979 revolution, and the video is made of old footage of them.']);
  N('Animal Collective', 'My Girls', ['From Merriweather Post Pavilion, 2009. Panda Bear sings that he does not care for fancy things: he only wants four walls and a solid home for his family.']);

  // ---------- dream pop and shoegaze ----------
  N('Beach House', 'Space Song', ['From Depression Cherry, 2015. Years after it came out, it found a whole new life online, and became their most played song.']);
  N('Cocteau Twins', 'Heaven or Las Vegas', ['The title song of their 1990 album. Elizabeth Fraser often sang in words of her own invention; this time she sings more clearly than usual, after the birth of her daughter.']);
  N('Mazzy Star', 'Fade Into You', ['From 1993. Hope Sandoval sings to someone who is out of reach, over David Roback\'s slow slide guitar.']);
  N('Cigarettes After Sex', 'Apocalypse', ['From their first album, 2017. Greg Gonzalez sings very quietly, as if not to wake anyone.']);
  N('The Radio Dept.', "Heaven's on Fire", ['From Clinging to a Scheme, 2010. It opens with Thurston Moore of Sonic Youth talking about youth culture being sold back to young people.']);
  N('M83', 'Midnight City', ['From Hurry Up, We\'re Dreaming, 2011. Anthony Gonzalez wrote it about Los Angeles at night. And yes, that saxophone solo at the end.']);
  N('Slowdive', 'When the Sun Hits', ['From Souvlaki, 1993. Ignored by the press at the time, and now one of the best-loved shoegaze songs ever made.']);
  N('Slowdive', 'Alison', ['The first song on Souvlaki, 1993. Neil Halstead sings to someone lost in their own fog.']);
  N('Slowdive', 'Sugar for the Pill', ['From their 2017 comeback album, twenty-two years after the last one.']);
  N('My Bloody Valentine', 'Only Shallow', ['The first song on Loveless, 1991. Kevin Shields bent his guitar notes with the tremolo arm all the way through; it sounds like a wall of sound that is melting.']);
  N('Ride', 'Vapour Trail', ['From Nowhere, 1990. It ends with a string section, which turned a noisy guitar band into something tender.']);

  // ---------- post-rock ----------
  N('Sigur Rós', 'Hoppípolla', ['From Takk, 2005. The title means jumping into puddles. It became famous through the trailer for the BBC series Planet Earth.']);
  N('Sigur Rós', 'Svefn-g-englar', ['From Ágætis byrjun, 1999. The title means sleepwalkers. It begins with a sound like sonar, and Jónsi plays his guitar with a cello bow.']);
  N('Sigur Rós', 'Starálfur', ['From Ágætis byrjun. Wes Anderson used it in The Life Aquatic, in one of its saddest scenes.']);
  N('Explosions in the Sky', 'Your Hand in Mine', ['From The Earth Is Not a Cold Dead Place, 2003. The band went on to score the film Friday Night Lights, and this song is the heart of its sound.']);
  N('Explosions in the Sky', 'First Breath After Coma', ['The first song on The Earth Is Not a Cold Dead Place. It starts with a heartbeat-like pulse, and slowly comes back to life.']);
  N('Godspeed You! Black Emperor', 'Storm', ['The first side of Lift Your Skinny Fists Like Antennas to Heaven, 2000. A band from Montreal, playing music the length of a film, with no singer.']);
  N('Mogwai', 'Take Me Somewhere Nice', ['From Rock Action, 2001. One of the few Mogwai songs with singing, and a simple wish: take me somewhere nice.']);
  N('Tortoise', 'Djed', ['From Millions Now Living Will Never Die, 1996. More than twenty minutes long, cut and pasted together from many pieces. It helped give post-rock its name.']);
  N('Slint', 'Washer', ['From Spiderland, 1991, made by a group of young musicians from Louisville. Hardly anyone heard it at the time; later, it inspired a whole genre.']);

  // ---------- modern classical, scores, ambient ----------
  N('Max Richter', 'On the Nature of Daylight', ['From The Blue Notebooks, 2004. Richter made the album as a quiet protest against the Iraq war. The piece has been used in many films, including Arrival.']);
  N('Max Richter', "Vladimir's Blues", ['A short piano piece from The Blue Notebooks, named after the writer Vladimir Nabokov.']);
  N('Ólafur Arnalds', 'Near Light', ['From Living Room Songs, 2011. Arnalds recorded one piece a day for a week, in his living room in Reykjavík, and shared each one the same day.']);
  N('Arvo Pärt', 'Spiegel im Spiegel', ['From 1978. The title means mirror in the mirror. Pärt calls his style tintinnabuli, from the Latin for little bells: very few notes, and a lot of silence between them.']);
  N('Erik Satie', 'Gymnopédie No. 1', ['Composed in Paris in 1888. Satie was an eccentric who owned seven identical grey suits. This slow piece, written over a hundred and thirty years ago, still sounds modern.']);
  N('Claude Debussy', 'Clair de Lune', ['Part of Debussy\'s Suite bergamasque, and named after a poem by Paul Verlaine. Moonlight, written for piano.']);
  N('Philip Glass', 'Opening', ['From Glassworks, 1982, which Glass wrote to be listened to on the new Walkman. Repetition that does not feel repetitive.']);
  N('Ryuichi Sakamoto', 'Merry Christmas Mr. Lawrence', ['The theme from the 1983 film. Sakamoto wrote the music and also acted in it, opposite David Bowie.']);
  N('Hans Zimmer', 'Time', ['From the Inception score, 2010. Zimmer built much of the score by slowing down Edith Piaf\'s Non, je ne regrette rien, the song the characters use to wake from a dream.']);
  N('Hans Zimmer', 'Cornfield Chase', ['From Interstellar, 2014. Zimmer recorded the church organ at the Temple Church in London. An organ, because the film is about something bigger than us.']);
  N('Vangelis', 'Tears in Rain', ['From Blade Runner, 1982. It plays under the replicant Roy Batty\'s last words. Rutger Hauer cut and rewrote that speech himself, the night before filming.']);
  N('Clint Mansell', 'Lux Aeterna', ['From Requiem for a Dream, 2000, played by the Kronos Quartet. It has since been used in so many trailers that it became the sound of epic.']);
  N('Ennio Morricone', "Gabriel's Oboe", ['From the film The Mission, 1986. A missionary plays his oboe in the jungle, to make peace with people who do not share his language.']);
  N('Ennio Morricone', 'Once Upon a Time in the West', ['From Sergio Leone\'s 1968 film. Morricone wrote the music before shooting, and Leone played it on set so the actors could move with it. The wordless voice is Edda Dell\'Orso.']);
  N('Brian Eno', 'An Ending (Ascent)', ['From Apollo, 1983, music Eno made for a documentary about the moon landings. He wanted the weightlessness, not the rockets.']);
  N('Brian Eno', '1/1', ['From Music for Airports, 1978. Eno had a long wait in Cologne airport and hated the music playing there, so he wrote music to make waiting calmer. That album gave ambient music its name.']);
  N('Aphex Twin', 'Avril 14th', ['From Drukqs, 2001. Richard D. James played it on a piano that can play itself. Less than two minutes, and one of the gentlest things in electronic music. Kanye West later sampled it.']);
  N('Aphex Twin', 'Rhubarb', ['From Selected Ambient Works Volume II, 1994. A slow, warm drone, said to have been inspired partly by lucid dreams.']);

  // ---------- electronic and trip-hop ----------
  N('Boards of Canada', 'Roygbiv', ['From Music Has the Right to Children, 1998. Two Scottish brothers who make electronic music that sounds like old educational films and half-remembered childhoods. The title spells the colours of the rainbow.']);
  N('Boards of Canada', 'Dayvan Cowboy', ['From 2006. The video uses footage of Joseph Kittinger, who jumped from a balloon at the edge of space in 1960.']);
  N('Burial', 'Archangel', ['From Untrue, 2007. Burial made it alone, in south London, built from cut-up vocal samples. It sounds like the bus home at four in the morning.']);
  N('Massive Attack', 'Teardrop', ['From Mezzanine, 1998, with Elizabeth Fraser of the Cocteau Twins singing. Many people know it as the theme of the series House.']);
  N('Massive Attack', 'Angel', ['From Mezzanine, sung by the reggae singer Horace Andy. It starts almost silently and slowly builds into something enormous.']);
  N('Massive Attack', 'Unfinished Sympathy', ['From Blue Lines, 1991, sung by Shara Nelson. The video is a single continuous shot of her walking down a street in Los Angeles.']);
  N('Portishead', 'Glory Box', ['From Dummy, 1994. It samples Isaac Hayes. Beth Gibbons sings that she is tired of playing the woman she is expected to be.']);
  N('Portishead', 'Roads', ['From Dummy, 1994. Beth Gibbons\' voice, a slow beat, and strings: the sound of Bristol in the nineties, at its saddest.']);
  N('Moby', 'Porcelain', ['From Play, 1999. Moby wrote it about the end of a relationship; he later said it was one of the most personal songs he ever made.']);
  N('Moby', 'Why Does My Heart Feel So Bad?', ['From Play, 1999. It is built on an old gospel recording, which Moby cut into pieces and turned into a question.']);
  N('Röyksopp', 'Remind Me', ['From Melody A.M., 2001, sung by Erlend Øye. The video tells a woman\'s ordinary day entirely through diagrams.']);
  N('Röyksopp', 'What Else Is There?', ['From The Understanding, 2005, sung by Karin Dreijer of The Knife.']);
  N('Daft Punk', 'Veridis Quo', ['From Discovery, 2001. The title is a wordplay: it sounds like very disco, and also like Latin.']);
  N('deadmau5', 'Strobe', ['From 2009. More than ten minutes long, and it takes its time: several minutes of build before the beat even arrives.']);
  N('The Orb', 'Little Fluffy Clouds', ['From 1990. The voice is the singer Rickie Lee Jones, describing the skies of her childhood in Arizona, taken from an interview.']);
  N('Air', 'La femme d\'argent', ['The first song on Moon Safari, 1998, by two musicians from Versailles. Seven minutes of slow, sunny, analogue groove.']);
  N('Air', 'All I Need', ['From Moon Safari, sung by Beth Hirsch. A simple song about being content with what you already have.']);
  N('Bonobo', 'Kiara', ['From Black Sands, 2010. Simon Green, from England, built it from a short vocal loop and strings.']);
  N('Jon Hopkins', 'Open Eye Signal', ['From Immunity, 2013. Jon Hopkins began as Brian Eno\'s collaborator, and here he makes electronic music that feels physical, almost like breathing.']);
  N('RÜFÜS DU SOL', 'Innerbloom', ['From Bloom, 2016. Nine minutes that grow very slowly, by three friends from Sydney.']);

  // ---------- dub ----------
  N('Augustus Pablo', 'King Tubby Meets Rockers Uptown', ['From 1976. Augustus Pablo plays the melodica, and King Tubby takes the song apart at his mixing desk. It is one of the most famous dub records ever made.']);
  N('The Congos', 'Fisherman', ['From Heart of the Congos, 1977, recorded at Lee Perry\'s Black Ark studio in Kingston. Some say the finest roots reggae album of all.']);

  // ---------- indie ----------
  N('Modest Mouse', 'Float On', ['From 2004, the song that made Modest Mouse famous. Isaac Brock wrote it as an answer to a terrible year: bad things happen, and we all float on anyway.']);
  N('The National', 'Fake Empire', ['The first song on Boxer, 2007. Matt Berninger sings about building a happy little world to escape the news. It was later used in Barack Obama\'s 2008 campaign.']);
  N('The National', 'Bloodbuzz Ohio', ['From High Violet, 2010. Matt Berninger grew up in Cincinnati: a song about the place you come from, and the debts you still owe it.']);
  N('Arcade Fire', 'Wake Up', ['From Funeral, 2004, an album made after the band lost several family members. A song about childhood, and about refusing to let your heart grow cold.']);
  N('Arcade Fire', 'The Suburbs', ['The title song of their 2010 album, which won the Grammy for album of the year. Win and Will Butler grew up in the suburbs of Houston.']);
  N('Death Cab for Cutie', 'I Will Follow You into the Dark', ['From Plans, 2005. Ben Gibbard alone with an acoustic guitar, promising to follow someone into the dark.']);
  N('Death Cab for Cutie', 'Transatlanticism', ['The title song of their 2003 album. A love across an ocean, and a repeated plea: I need you so much closer.']);
  N('The Shins', 'New Slang', ['From Oh, Inverted World, 2001. It became famous through the film Garden State, where it is said to change your life.']);
  N('Interpol', 'NYC', ['From Turn On the Bright Lights, 2002. New York after September 11, and a city that will not, for now, cheer you up.']);
  N('The xx', 'Intro', ['From their first album, 2009, made by school friends from London. It became one of the most used songs on television and in adverts.']);
  N('Daniel Johnston', 'True Love Will Find You in the End', ['Daniel Johnston recorded his songs on cassettes and handed them out in Austin, Texas. This one is a promise, and also a doubt.']);
  N('The Microphones', 'The Glow Pt. 2', ['The title song of the 2001 album by Phil Elverum. Made by one person, recorded on tape, about wanting to dissolve into everything.']);
  N('Mount Eerie', 'Real Death', ['From A Crow Looked at Me, 2017. Phil Elverum wrote it after his wife, Geneviève, died. He said that death is real, and not something to make art out of. And then he made this.']);
  N('Mac DeMarco', 'Salad Days', ['The title song of his 2014 album. Mac DeMarco was twenty-three, already feeling old.']);
  N('Yo La Tengo', 'Autumn Sweater', ['From 1997. A song about leaving a party with someone, and not knowing what to say.']);
  N('Bill Callahan', 'Drover', ['From Apocalypse, 2011. Bill Callahan, who once recorded as Smog, sings about a cattle drover and the wildness inside a quiet man.']);
  N('Neutral Milk Hotel', 'Holland, 1945', ['From In the Aeroplane Over the Sea, 1998. Jeff Mangum was deeply moved by The Diary of Anne Frank, and this whole album speaks to her across time.']);
  N('Neutral Milk Hotel', 'Two-Headed Boy', ['From In the Aeroplane Over the Sea. Jeff Mangum, alone with an acoustic guitar, singing as if his life depended on it.']);

  // ---------- folk ----------
  N('Nick Drake', 'Pink Moon', ['The title song of his last album, 1972, recorded in two night sessions with just his voice, his guitar and a little piano. Almost nobody heard it in his lifetime.']);
  N('Nick Drake', 'River Man', ['From Five Leaves Left, 1969, with strings arranged by Harry Robinson. A song in an unusual five-beat rhythm, flowing like a river.']);
  N('Nick Drake', 'Day Is Done', ['From Five Leaves Left. When the day is done, it asks, was it worth it?']);
  N('Elliott Smith', 'Between the Bars', ['From Either/Or, 1997. A gentle song about drinking, sung so softly it sounds like comfort, and it is not.']);
  N('Elliott Smith', 'Miss Misery', ['Written for the film Good Will Hunting. It was nominated for an Oscar, and Elliott Smith played it at the ceremony in a white suit.']);
  N('Elliott Smith', 'Waltz #2 (XO)', ['From XO, 1998. A mother singing karaoke at a bar, and a son watching. Many hear it as a song about his own family.']);
  N('Bon Iver', 'Skinny Love', ['From For Emma, Forever Ago, 2007. Justin Vernon recorded the album alone in his father\'s hunting cabin in Wisconsin, during a long winter, after a breakup.']);
  N('Bon Iver', 'Holocene', ['From the second Bon Iver album, 2011. Standing before something enormous, and realising you are not magnificent. Which is a relief.']);
  N('Bon Iver', 'Re: Stacks', ['The last song on For Emma, Forever Ago. Justin Vernon sings about letting go, about the stacks of debts and regrets, and about finding a way back.']);
  N('José González', 'Heartbeats', ['A cover of a song by The Knife, made famous in 2005 by an advert with thousands of coloured balls bouncing down a street in San Francisco.']);
  N('Iron & Wine', 'Flightless Bird, American Mouth', ['From 2007. It became famous as the prom song in the film Twilight.']);
  N('Sufjan Stevens', 'Mystery of Love', ['Written for Call Me by Your Name, 2017. It was nominated for an Oscar.']);
  N('Sufjan Stevens', 'Fourth of July', ['From Carrie & Lowell, 2015, an album about his mother, who left him as a child, and who died in 2012. He sings to her at her deathbed: we are all going to die.']);
  N('Sufjan Stevens', 'Should Have Known Better', ['From Carrie & Lowell, 2015. About his mother leaving him at a video store when he was three or four, and about finding light in his brother\'s new baby.']);
  N('Sufjan Stevens', 'Casimir Pulaski Day', ['From Illinois, 2005. A teenager loses a friend to cancer, and his faith does not save her.']);
  N('Cat Stevens', 'Father and Son', ['From Tea for the Tillerman, 1970. A conversation between a father who wants his son to settle down, and a son who has to go. Cat Stevens sings both voices.']);
  N('Cat Stevens', 'Where Do the Children Play?', ['The first song on Tea for the Tillerman, 1970. It asks what all our progress, roads and towers leave for the children.']);
  N('Simon & Garfunkel', 'The Sound of Silence', ['Paul Simon wrote it in 1964, aged twenty-two. It first failed, then a producer added electric instruments without asking them, and it became a number one hit.', 'It is about people talking without speaking, and hearing without listening.']);
  N('Simon & Garfunkel', 'Bridge over Troubled Water', ['From 1970. Paul Simon wrote it, and gave it to Art Garfunkel to sing. A promise to be there when things are hard.']);
  N('Simon & Garfunkel', 'The Boxer', ['From 1969. A poor young man in New York, beaten down, and still standing. That huge drum is said to have been recorded next to an elevator shaft.']);
  N('Simon & Garfunkel', 'America', ['From Bookends, 1968. Two young lovers on a Greyhound bus, looking for America, and for something they cannot name.']);
  N('Leonard Cohen', 'Hallelujah', ['From 1984. Cohen said he wrote around eighty verses for it. His record label at first refused to release the album; now it is one of the most covered songs ever.']);
  N('Leonard Cohen', 'Famous Blue Raincoat', ['From 1971. A letter written at four in the morning to a man who had an affair with the singer\'s partner. It ends: sincerely, L. Cohen.']);
  N('Leonard Cohen', 'Suzanne', ['From his first album, 1967. About Suzanne Verdal, a friend in Montreal who served him tea and oranges near the river.']);
  N('Leonard Cohen', 'Dance Me to the End of Love', ['From 1984. Cohen said it was inspired by the string quartets that were made to play in the death camps during the Holocaust. It sounds like a wedding song.']);
  N('Leonard Cohen', 'Anthem', ['From The Future, 1992. It holds one of his most quoted ideas: there is a crack in everything, and that is how the light gets in.']);
  N('Leonard Cohen', 'You Want It Darker', ['The title song of his last album, released in October 2016, weeks before he died. A cantor and a synagogue choir from Montreal sing behind him. He says: here I am, my Lord, I am ready.']);
  N('Bob Dylan', 'Blowin\' in the Wind', ['From 1963. A row of questions about war, freedom and peace, and no answer but the wind.']);
  N('Bob Dylan', 'Knockin\' on Heaven\'s Door', ['Written in 1973 for the western Pat Garrett and Billy the Kid, for the scene of a dying sheriff.']);
  N('Bob Dylan', 'Not Dark Yet', ['From Time Out of Mind, 1997. Dylan in his fifties, feeling time pass: it is not dark yet, but it is getting there.']);
  N('Bob Dylan', 'Like a Rolling Stone', ['From 1965. Six minutes long, when radio songs were meant to last three. It asks someone who used to look down on others: how does it feel, to be on your own?']);
  N('Bob Dylan', 'It\'s Alright, Ma (I\'m Only Bleeding)', ['From 1965. A long, furious list of everything wrong with society, sung almost calmly.']);
  N('Townes Van Zandt', 'Pancho and Lefty', ['From 1972. A Mexican bandit and the friend who betrayed him. Willie Nelson and Merle Haggard made it a hit ten years later.']);
  N('Townes Van Zandt', 'Waiting Around to Die', ['One of his first songs. Townes said it was the first serious song he ever wrote. A life of bad luck, told without self-pity.']);
  N('Joni Mitchell', 'A Case of You', ['From Blue, 1971, one of the most personal albums ever made. Love as something you could drink, a case of it, and still be on your feet.']);
  N('Joni Mitchell', 'Both Sides Now', ['Joni wrote it in her early twenties while reading a novel on a plane, looking at the clouds. In 2000 she recorded it again, older, and the song meant something completely new.']);
  N('Joni Mitchell', 'River', ['From Blue, 1971. It is almost Christmas, everyone is cheerful, and she wishes she had a river she could skate away on.']);
  N('Jeff Buckley', 'Hallelujah', ['From Grace, 1994. Jeff Buckley learned the song from John Cale\'s version of Leonard Cohen\'s original. His became the version most people know.']);
  N('Jeff Buckley', 'Lover, You Should\'ve Come Over', ['From Grace, 1994, his only finished album. A man who wants someone back, and knows it is too late.']);
  N('Jeff Buckley', 'Grace', ['The title song of his only album, 1994. He said it was about not fearing death, because love waits on the other side.']);
  N('Damien Rice', 'The Blower\'s Daughter', ['From O, 2002. It became famous as the opening song of the film Closer. A man who cannot take his eyes off someone.']);
  N('Damien Rice', 'Cannonball', ['From O, 2002. Stillness in the time of war, and learning to love after loss.']);
  N('Fleet Foxes', 'White Winter Hymnal', ['From their first album, 2008. A round: the same few lines, sung again and again by voices piling on top of each other.']);
  N('Fleet Foxes', 'Helplessness Blues', ['The title song of their 2011 album. Robin Pecknold sings that he was raised to believe he was unique, and would rather be a functioning part of something bigger.']);
  N('Phoebe Bridgers', 'Funeral', ['From Stranger in the Alps, 2017. She is singing at the funeral of a boy her age, and feeling guilty that she is so sad about her own life on the same day.']);
  N('Phoebe Bridgers', 'Motion Sickness', ['From Stranger in the Alps, 2017. A song about a past relationship, written with a lot of anger and even more humour.']);
  N('Phoebe Bridgers', 'Garden Song', ['From Punisher, 2020. A dream about growing up, burying the past in the garden, and watching something grow from it.']);
  N('Bright Eyes', 'First Day of My Life', ['From 2005. Conor Oberst\'s simplest love song: meeting someone and feeling that life has only just started.']);
  N('Neil Young', 'Old Man', ['From Harvest, 1972. Neil Young wrote it for the old man who looked after his ranch in California: a young man telling an old one, I am a lot like you.']);
  N('Neil Young', 'The Needle and the Damage Done', ['From Harvest, 1972. Neil Young wrote it after watching friends, including his guitarist Danny Whitten, lose themselves to heroin.']);
  N('Neil Young', 'Heart of Gold', ['From Harvest, 1972, his only number one in the United States. A man searching for a heart of gold, and getting old doing it.']);
  N('John Prine', 'Hello in There', ['John Prine wrote this when he was a mailman in his twenties, about old people that nobody visits. If you see them, he says, say hello in there.']);
  N('John Prine', 'Angel from Montgomery', ['From his first album, 1971. A young man writing in the voice of a tired, middle-aged woman, wishing for an angel to take her away.']);
  N('Rodriguez', 'Sugar Man', ['From Cold Fact, 1970. Rodriguez sold almost no records in America and went back to work on building sites in Detroit. Meanwhile, in South Africa, he was as famous as the Rolling Stones, and he had no idea. The film Searching for Sugar Man tells that story.']);
  N('Rodriguez', 'Cause', ['From Coming from Reality, 1971. Rodriguez was dropped by his record label shortly after, and the song became a strange prophecy.']);
  N('Glen Hansard', 'Falling Slowly', ['From the film Once, 2007, sung with Markéta Irglová. It won the Oscar for best song.']);
  N('Johnny Cash', 'The Man Comes Around', ['From his 2002 album, one of the last he made. Cash wrote it after a dream about the Book of Revelation.']);
  N('Johnny Cash', 'Ain\'t No Grave', ['Recorded in his last months, and released after his death, in 2010. An old spiritual: no grave can hold my body down.']);
  N('Cat Power', 'Sea of Love', ['Chan Marshall\'s cover of a 1959 song, made famous later by the film Juno.']);
  N('Big Thief', 'Not', ['From Two Hands, 2019. Adrianne Lenker defines something only by what it is not, for more than five minutes, and the band plays as if the room were on fire.']);
  N('Agnes Obel', 'Riverside', ['From Philharmonics, 2010, by the Danish pianist Agnes Obel. A river that you can drown in, or be carried by.']);
  N('Kris Kristofferson', 'Sunday Mornin\' Comin\' Down', ['Kris Kristofferson wrote it while working odd jobs in Nashville. Johnny Cash made it a hit in 1970: the loneliest hangover in country music.']);
  N('Gary Jules', 'Mad World', ['A slow piano cover of the Tears for Fears song, made for the film Donnie Darko. It became a Christmas number one in Britain in 2003.']);

  // ---------- grunge and alternative ----------
  N('Nirvana', 'Something in the Way', ['The last listed song on Nevermind, 1991. Kurt Cobain sang it lying on a couch in the studio, very quietly. He said it was about sleeping under a bridge, though friends doubt it really happened.']);
  N('Nirvana', 'All Apologies', ['From In Utero, 1993. Kurt Cobain said it was about his wife and daughter. A peaceful, sad song from a man apologising for everything.']);
  N('Nirvana', 'Heart-Shaped Box', ['From In Utero, 1993. Dark, heavy, and about a relationship that pulls you in like a trap.']);
  N('Pearl Jam', 'Black', ['From Ten, 1991. Eddie Vedder\'s song about a first love that ended. The band refused to release it as a single, saying it was too personal.']);
  N('Soundgarden', 'Black Hole Sun', ['From Superunknown, 1994. Chris Cornell said the title came from a phrase he misheard on the news, and the song from there.']);
  N('Soundgarden', 'Fell on Black Days', ['From Superunknown, 1994. Chris Cornell said it was about waking up one day and realising you are unhappy, without any obvious reason.']);
  N('Alice in Chains', 'Nutshell', ['From their acoustic EP Jar of Flies, 1994. Layne Staley sings about loneliness and addiction with a quiet guitar behind him.']);
  N('The Smashing Pumpkins', '1979', ['From Mellon Collie and the Infinite Sadness, 1995. Billy Corgan wrote it about being a teenager in the suburbs of Chicago: no future yet, only nights.']);
  N('The Smashing Pumpkins', 'Disarm', ['From Siamese Dream, 1993. Billy Corgan wrote it about his difficult childhood, with strings and bells instead of guitars.']);
  N('The Smashing Pumpkins', 'Today', ['From Siamese Dream, 1993. It sounds bright and happy. Billy Corgan said he wrote it when he was suicidal: today is the greatest day, because it cannot get worse.']);
  N('The Smashing Pumpkins', 'Tonight, Tonight', ['From Mellon Collie and the Infinite Sadness, 1995, recorded with a thirty-piece orchestra. Believe in me, it says, as I believe in you.']);
  N('R.E.M.', 'Everybody Hurts', ['From Automatic for the People, 1992. Written to reach teenagers who felt alone, in the simplest words possible: hold on.']);
  N('R.E.M.', 'Nightswimming', ['From Automatic for the People. Michael Stipe remembers swimming at night with friends in Athens, Georgia, and how those nights never come back.']);
  N('R.E.M.', 'Losing My Religion', ['From 1991. In the American South, losing my religion means losing your temper, or being at the end of your rope. Built around a mandolin.']);
  N('Pixies', 'Where Is My Mind?', ['From Surfer Rosa, 1988. Black Francis said it came from snorkelling in the Caribbean, with a little fish chasing him. It became famous again at the end of Fight Club.']);
  N('The Verve', 'Bitter Sweet Symphony', ['From 1997. It is built on an orchestral sample of a Rolling Stones song, and the band lost the rights to their own hit. Richard Ashcroft only got them back in 2019.']);
  N('Blur', 'The Universal', ['From 1995. Under its sunny strings, a satire: a future where everyone is kept happy, and nobody is free.']);
  N('Joy Division', 'Love Will Tear Us Apart', ['Ian Curtis wrote it about his failing marriage. He died in May 1980, aged twenty-three, and the song became their best known.']);
  N('Joy Division', 'Atmosphere', ['One of their most solemn songs, and for many people a song of farewell: walk in silence, do not walk away.']);
  N('Joy Division', 'Disorder', ['The first song on Unknown Pleasures, 1979, produced by Martin Hannett in Manchester. Ian Curtis is waiting for a guide to take him by the hand.']);
  N('The Cure', 'Pictures of You', ['From Disintegration, 1989. Robert Smith said it came after a fire in his house, when he found old photographs of his wife Mary.']);
  N('The Cure', 'Plainsong', ['The first song on Disintegration, 1989. Robert Smith was turning thirty and dreaded it. It opens like the end of the world, very slowly.']);
  N('The Cure', 'A Forest', ['From 1980. A man following a voice into a forest at night, and finding nothing there. The Cure play it live for ten minutes or more.']);
  N('The Smiths', 'There Is a Light That Never Goes Out', ['From The Queen Is Dead, 1986. Two young people in a car, one of them with nowhere else to go, and a strange idea of what a romantic death would be.']);
  N('The Smiths', 'How Soon Is Now?', ['From 1985. Johnny Marr\'s shimmering guitar, and Morrissey singing about going to a club alone, and leaving alone.']);
  N('The Smiths', 'Asleep', ['A B-side from 1985. Morrissey sings softly over piano about wanting to sleep and not wake up; the song ends with a few bars of Auld Lang Syne.']);

  // ---------- classic rock ----------
  N('Led Zeppelin', 'Stairway to Heaven', ['From their fourth album, 1971. Eight minutes that move from a quiet recorder melody to one of rock\'s most famous guitar solos, by Jimmy Page.']);
  N('Led Zeppelin', 'Kashmir', ['From Physical Graffiti, 1975. Robert Plant wrote it while driving through the desert in southern Morocco. He had never been to Kashmir.']);
  N('Led Zeppelin', 'Going to California', ['From their fourth album. Acoustic guitar and mandolin, about leaving everything behind for the West Coast. Robert Plant said it was inspired by Joni Mitchell.']);
  N('Black Sabbath', 'Planet Caravan', ['From Paranoid, 1970. The heaviest band in the world, playing something soft and spacey, with Ozzy\'s voice through a rotating speaker.']);
  N('Black Sabbath', 'Changes', ['From Vol. 4, 1972. A piano ballad by a heavy metal band: Ozzy sings about a breakup, inspired by drummer Bill Ward\'s divorce.']);
  N('Queen', 'Bohemian Rhapsody', ['From 1975. Six minutes, no chorus, an opera section in the middle. The record company said it was too long for radio; a DJ played it anyway, over and over.']);
  N('Queen', 'The Show Must Go On', ['From Innuendo, 1991. Freddie Mercury was very ill when he recorded it. He drank vodka, said, I will do it, and sang it in one take.']);
  N('Queen', 'Who Wants to Live Forever', ['Written by Brian May for the film Highlander, 1986, about an immortal man watching the woman he loves grow old.']);
  N('Guns N\' Roses', 'November Rain', ['From 1991. Axl Rose worked on it for years. Nine minutes, a piano and an orchestra, about the fact that nothing lasts forever, not even cold November rain.']);
  N('Metallica', 'Fade to Black', ['From Ride the Lightning, 1984. Their first ballad, written after their equipment was stolen, about a man who has lost the will to live.']);
  N('Metallica', 'One', ['From 1988. Inspired by the novel Johnny Got His Gun: a soldier who has lost his arms, legs, sight and voice, trapped alone in his own body.']);
  N('Metallica', 'Nothing Else Matters', ['From 1991. James Hetfield wrote it while missing his girlfriend on tour, and almost did not show it to the band because it felt too soft.']);
  N('Bruce Springsteen', 'Thunder Road', ['The first song on Born to Run, 1975. A young man at a screen door, asking Mary to get in the car and leave this town of losers with him.']);
  N('Neil Young', 'Hey Hey, My My (Into the Black)', ['From Rust Never Sleeps, 1979. It is better to burn out than to fade away. Kurt Cobain quoted it in his last letter, and Neil Young was shaken by that.']);

  // ---------- art pop, synth pop, soft rock ----------
  N('Kate Bush', 'Running Up That Hill (A Deal with God)', ['From Hounds of Love, 1985. If a man and a woman could swap places, she says, they would understand each other. In 2022, the series Stranger Things made it a hit again, thirty-seven years later.']);
  N('Kate Bush', 'This Woman\'s Work', ['From 1989, written for a film about a couple whose birth goes wrong. A man in a hospital waiting room, thinking of everything he should have said.']);
  N('Kate Bush', 'Wuthering Heights', ['Kate Bush wrote it at eighteen after seeing a television version of Emily Brontë\'s novel. It went to number one in 1978, sung by Cathy\'s ghost.']);
  N('Kate Bush', 'Cloudbusting', ['From Hounds of Love. Inspired by the memoir of Peter Reich, whose father built a machine he believed could make rain.']);
  N('Björk', 'Jóga', ['From Homogenic, 1997, named after her best friend. Strings and electronic beats, made to sound like the volcanic landscape of Iceland.']);
  N('Björk', 'Hyperballad', ['From Post, 1995. A woman living on a mountain throws small things off a cliff every morning, and imagines her own fall, so she can be calm when her lover wakes up.']);
  N('Weyes Blood', 'Andromeda', ['From Titanic Rising, 2019. Natalie Mering sings about love feeling like a distant galaxy.']);
  N('Father John Misty', 'Pure Comedy', ['The title song of his 2017 album. Joshua Tillman describes the whole human race as a strange comedy, and ends, surprisingly, with tenderness.']);
  N('Father John Misty', 'I Love You, Honeybear', ['The title song of his 2015 album, a love album written for his wife, Emma. The world is ending; they are in love anyway.']);
  N('Lorde', 'Ribs', ['From Pure Heroine, 2013, written when she was sixteen. About the fear of getting old, and about the parties that already feel like memories.']);
  N('Lorde', 'Liability', ['From Melodrama, 2017. Just a piano and her voice: a song about feeling that you are too much for the people you love.']);
  N('Lana Del Rey', 'Video Games', ['From 2011. Lana Del Rey made the video herself from old film clips, and it made her famous almost overnight.']);
  N('Lana Del Rey', 'Young and Beautiful', ['Written for Baz Luhrmann\'s The Great Gatsby, 2013. Will you still love me when I am no longer young and beautiful?']);
  N('Billie Eilish', 'when the party\'s over', ['From her 2019 debut, made with her brother Finneas in his bedroom. A quiet song about letting someone go to save both of you.']);
  N('Billie Eilish', 'What Was I Made For?', ['Written for the Barbie film, 2023. A doll asks what she was made for. It won the Oscar for best song.']);
  N('Frank Ocean', 'Self Control', ['From Blonde, 2016. A song about a summer love that he knows will not last, ending with a chorus of voices.']);
  N('Frank Ocean', 'Nights', ['From Blonde. Exactly in the middle of the album, the beat switches and the song turns into a different song, like the album folding in half.']);
  N('Frank Ocean', 'Pink + White', ['From Blonde, with Beyoncé singing in the background. A song about lessons learned, and about time passing.']);
  N('Frank Ocean', 'Seigfried', ['From Blonde. A man looking at the ordinary life he could have had, and not sure he wants it.']);
  N('Frank Ocean', 'Ivy', ['From Blonde. A song about first love and how it ends: I thought I was dreaming.']);
  N('The 1975', 'Somebody Else', ['From 2016. Matty Healy does not want you, but he does not want you with somebody else either. The honest jealousy of a breakup.']);
  N('Tears for Fears', 'Mad World', ['Roland Orzabal wrote it at nineteen, looking out of his flat in Bath. The idea that the dreams in which you are dying are the best you ever had came from the psychologist Arthur Janov.']);
  N('Tears for Fears', 'Everybody Wants to Rule the World', ['From 1985. A light, rolling song about power, control and Cold War fear. It was one of the last songs written for the album.']);
  N('Tears for Fears', 'Head Over Heels', ['From Songs from the Big Chair, 1985. A love song that is also about being afraid of your own feelings.']);
  N('Depeche Mode', 'Enjoy the Silence', ['From Violator, 1990. Martin Gore first wrote it as a slow ballad; producer Flood and Alan Wilder turned it into the song we know. Words are very unnecessary, they can only do harm.']);
  N('Pet Shop Boys', 'Being Boring', ['From 1990. Neil Tennant wrote it about a childhood friend who died of AIDS, and about the friends of his youth, who never wanted to be boring.']);
  N('Eurythmics', 'Sweet Dreams (Are Made of This)', ['From 1983, recorded in a small attic studio in London. Dave Stewart found the riff by accident, and Annie Lennox wrote the words in a bad mood.']);
  N('Roxy Music', 'More Than This', ['From Avalon, 1982. Bryan Ferry sings that there is nothing more than this, and it is unclear if he means it as despair or as peace.']);
  N('ABBA', 'The Winner Takes It All', ['From 1980. Written as Björn and Agnetha\'s marriage ended, and sung by Agnetha. Björn has said it is not exactly about them. Many still hear it that way.']);
  N('Florence + the Machine', 'Cosmic Love', ['From Lungs, 2009. Florence Welch, with a harp, singing about a love so blinding it puts out the stars.']);
  N('The Alan Parsons Project', 'Eye in the Sky', ['From 1982. Inspired by security cameras in Las Vegas casinos: someone is always watching.']);
  N('Kansas', 'Dust in the Wind', ['From 1977. Kerry Livgren found the words in a book of Native American poetry: all we are is dust in the wind.']);
  N('Procol Harum', 'A Whiter Shade of Pale', ['From 1967. An organ line inspired by Bach, and words nobody fully understands. One of the most played songs in British radio history.']);
  N('Fleetwood Mac', 'Landslide', ['Stevie Nicks wrote it in 1973 at a low point, wondering whether to keep going with music. She was standing in the snow, in Aspen, looking at the mountains.']);
  N('John Lennon', 'Imagine', ['From 1971. Lennon later said the idea came largely from Yoko Ono\'s poems. A simple piano, and a world with nothing to kill or die for.']);
  N('10cc', "I'm Not In Love", ['From 1975. Those floating voices are the band singing one note, recorded over and over, hundreds of times, then mixed into a choir.']);
  N('Frank Sinatra', 'My Way', ['The music is a French song, Comme d\'habitude, and Paul Anka wrote the English words for Sinatra in 1969. A man at the end, looking back, without apology.']);
  N('Stromae', 'Formidable', ['From Racine carrée, 2013. Stromae pretended to be drunk at a tram stop in Brussels and filmed people\'s reactions for the video.']);
  N('Stromae', 'Papaoutai', ['From 2013. The title sounds like Papa, où t\'es? Dad, where are you? Stromae\'s own father was killed in the Rwandan genocide.']);
  N('Stromae', 'L\'enfer', ['From Multitude, 2022. Stromae speaks about having suicidal thoughts, and about how many others feel the same. He performed it during a TV interview, which became famous.']);
  N('Stromae', 'Tous les mêmes', ['From Racine carrée. Stromae plays both a man and a woman in the video, half and half, mocking the clichés each side says about the other.']);
  N('Christine and the Queens', 'Saint Claude', ['From the first Christine and the Queens album, 2014: a song about feeling watched, and out of place, and dancing anyway.']);

  // ---------- jazz ----------
  N('Miles Davis', 'So What', ['The first track on Kind of Blue, 1959, the best-selling jazz album of all time. Built on just two scales, it gave the players room instead of rules.']);
  N('Miles Davis', 'Blue in Green', ['From Kind of Blue, 1959. Credited to Miles Davis, though Bill Evans said he wrote it. Five and a half minutes of very soft, very sad beauty.']);
  N('John Coltrane', 'Naima', ['From Giant Steps, 1960, named after his first wife, Naima. One of his most tender ballads.']);
  N('John Coltrane', 'Alabama', ['Recorded in 1963 after the bombing of a church in Birmingham, Alabama, which killed four girls. Coltrane is said to have shaped his melody on the rhythm of Martin Luther King\'s eulogy.']);
  N('Duke Ellington & John Coltrane', 'In a Sentimental Mood', ['From 1963: Duke Ellington and John Coltrane, two generations of jazz, on one record.']);
  N('John Coltrane', 'A Love Supreme, Pt. I - Acknowledgement', ['From A Love Supreme, 1965. Coltrane made it as a prayer, after overcoming addiction. The band chants the title, and he plays the four notes in every key.']);
  N('Bill Evans', 'Peace Piece', ['From 1958. Bill Evans improvised it on the spot over two repeating chords. Six minutes of peace, almost by accident.']);
  N('Bill Evans', 'Waltz for Debby', ['Written for his niece, Debby. The famous live version was recorded at the Village Vanguard in 1961, with the bassist Scott LaFaro, who died less than two weeks later.']);
  N('Chet Baker', 'Almost Blue', ['An Elvis Costello song that Chet Baker made his own, in his last years. A voice that sounds as if it is about to break.']);
  N('Chet Baker', 'My Funny Valentine', ['A song from 1937 that Chet Baker made famous, playing the trumpet and singing in his soft, almost fragile voice.']);
  N('Nina Simone', 'Feeling Good', ['From I Put a Spell on You, 1965. A song from a musical, which Nina Simone turned into a declaration of freedom: a new dawn, a new day.']);
  N('Nina Simone', 'Sinnerman', ['A traditional spiritual that Nina Simone stretched to ten minutes on Pastel Blues, 1965. A man running from judgement, with nowhere to hide.']);
  N('Nina Simone', 'I Wish I Knew How It Would Feel to Be Free', ['A song by Billy Taylor that Nina Simone made an anthem of the civil rights movement. She once said freedom, to her, meant no fear.']);
  N('Nina Simone', 'Ain\'t Got No, I Got Life', ['From 1968, from the musical Hair. She lists everything she does not have, and then everything she does: her hair, her head, her heart, her life.']);
  N('Billie Holiday', 'Strange Fruit', ['Recorded in 1939. A poem by Abel Meeropol about lynchings in the American South. Billie Holiday sang it at the end of her shows, with the lights turned off.']);
  N('Billie Holiday', 'Gloomy Sunday', ['A Hungarian song from the 1930s that became known as the Hungarian suicide song. Billie Holiday\'s version, from 1941, is the most famous.']);
  N('Thelonious Monk', '\'Round Midnight', ['Monk wrote it as a young man in the early 1940s. It became one of the most recorded jazz standards ever.']);
  N('Pharoah Sanders', 'The Creator Has a Master Plan', ['From Karma, 1969. More than thirty minutes long, a spiritual journey from peace to chaos and back, with Leon Thomas yodelling.']);
  N('Alice Coltrane', 'Journey in Satchidananda', ['From 1971. Alice Coltrane on harp, after the death of her husband John, and after meeting the Indian teacher Swami Satchidananda.']);
  N('Charles Mingus', 'Goodbye Pork Pie Hat', ['From Mingus Ah Um, 1959. An elegy for the saxophonist Lester Young, who had just died, and who always wore a pork pie hat.']);
  N('Ahmad Jamal', 'Poinciana', ['The live recording from 1958, at the Pershing Lounge in Chicago, became one of the best-selling jazz records of its time. Miles Davis loved Ahmad Jamal\'s sense of space.']);
  N('Keith Jarrett', 'The Köln Concert, Part I', ['Improvised live in Cologne in January 1975, on a small, badly tuned piano, by a man who had not slept. It became the best-selling solo piano album in history.']);
  N('Kamasi Washington', 'Truth', ['From Harmony of Difference, 2017. Five different melodies, played at the same time, to show that they can live together.']);
  N('Duke Ellington', 'Mood Indigo', ['From 1930. Ellington said he wrote it in fifteen minutes while waiting for his mother to finish cooking dinner.']);
  N('Anouar Brahem', 'Astrakan Café', ['From the album of the same name, 2000. Anouar Brahem, from Tunisia, plays the oud like a jazz musician, slow and spacious.']);

  // ---------- soul and blues ----------
  N('Bill Withers', 'Ain\'t No Sunshine', ['From 1971. Bill Withers was still working in an aeroplane factory when he recorded it. He repeats I know twenty-six times, because he could not find the words for that part.']);
  N('Bill Withers', 'Lean on Me', ['From 1972. Bill Withers remembered the mining town where he grew up in West Virginia, where people helped each other because they had to.']);
  N('Marvin Gaye', 'What\'s Going On', ['From 1971. Marvin Gaye sang it from the point of view of a brother coming back from Vietnam. Motown did not want to release it; it became one of their biggest songs.']);
  N('Marvin Gaye', 'Inner City Blues (Make Me Wanna Holler)', ['The last song on What\'s Going On, 1971. Taxes, poverty, and the anger of the inner city, in a soft, beautiful groove.']);
  N('Gil Scott-Heron', 'The Bottle', ['From 1974. A song about alcoholism on the street corners of Washington, played as one of the happiest grooves you will hear. Gil Scott-Heron himself later struggled with addiction.']);
  N('Gil Scott-Heron', 'I\'m New Here', ['From I\'m New Here, 2010, his last album. An old man, after prison and illness, saying: no matter how far wrong you have gone, you can always turn around.']);
  N('Curtis Mayfield', 'Move On Up', ['From his 1970 solo debut. Almost nine minutes of horns and percussion telling you to keep going, to keep pushing.']);
  N('Otis Redding', '(Sittin\' On) The Dock of the Bay', ['Otis Redding recorded it in late 1967, three days before he died in a plane crash. He planned to replace the whistling at the end with words, and never had the chance.']);
  N('Otis Redding', 'I\'ve Been Loving You Too Long', ['From 1965. Otis Redding begging, slowly, until his voice almost breaks.']);
  N('Sam Cooke', 'A Change Is Gonna Come', ['From 1964. Sam Cooke wrote it after being turned away from a whites-only motel, and after hearing Bob Dylan\'s Blowin\' in the Wind. It became an anthem of the civil rights movement.']);
  N('Donny Hathaway', 'A Song for You', ['A Leon Russell song that Donny Hathaway recorded in 1971. Many singers consider his version the definitive one.']);
  N('Donny Hathaway', 'Someday We\'ll All Be Free', ['From 1973. Donny Hathaway struggled with severe depression, and this song sounds like a promise he made to himself.']);
  N('Etta James', 'I\'d Rather Go Blind', ['From 1967. Etta James would rather go blind than see her man walk away with someone else.']);
  N('Amy Winehouse', 'Back to Black', ['The title song of her 2006 album, produced by Mark Ronson. Written after a breakup, in the style of the girl groups of the sixties.']);
  N('Amy Winehouse', 'Love Is a Losing Game', ['From Back to Black, 2006. One of her quietest songs: love as a game she already knows she will lose.']);
  N('Al Green', 'How Can You Mend a Broken Heart', ['A Bee Gees song from 1971, which Al Green slowed down into a long, soulful prayer the next year.']);
  N('Leon Bridges', 'River', ['From Coming Home, 2015. A song about baptism, and wanting to be washed clean of the past.']);
  N('Michael Kiwanuka', 'Cold Little Heart', ['From Love & Hate, 2016. Nearly ten minutes, with a long instrumental opening. It became known as the theme of the series Big Little Lies.']);
  N('Charles Bradley', 'Changes', ['A Black Sabbath ballad, sung by Charles Bradley, who spent decades working odd jobs and was only discovered in his sixties. He sang it after losing his mother.']);
  N('B.B. King', 'The Thrill Is Gone', ['From 1969, his biggest hit, with strings. B.B. King named his guitars Lucille, after a woman two men fought over during a fire at a dance hall.']);
  N('Robert Johnson', 'Cross Road Blues', ['Recorded in 1936. The legend says Robert Johnson sold his soul to the devil at a crossroads, in exchange for his guitar playing. He died at twenty-seven.']);
  N('Robert Johnson', 'Hellhound on My Trail', ['Recorded in 1937. A man running, with a hellhound always behind him. Robert Johnson died the next year, aged twenty-seven.']);
  N('Skip James', 'Hard Time Killing Floor Blues', ['Recorded in 1931 during the Great Depression. Skip James was rediscovered in a hospital in the sixties and played again before he died.']);
  N('Lead Belly', 'Where Did You Sleep Last Night', ['An old folk song that Lead Belly recorded in the 1940s. Kurt Cobain sang it at the end of Nirvana\'s MTV Unplugged, 1993.']);
  N('John Lee Hooker', 'Tupelo', ['John Lee Hooker tells the story of the great flood in Tupelo, Mississippi, slowly, with almost nothing but his voice and his guitar.']);

  // ---------- chanson ----------
  N('Jacques Brel', 'Ne me quitte pas', ['From 1959. Brel wrote it after a breakup, and later said it was not a love song, but a song about how cowardly men can be. He offers to become the shadow of her dog.']);
  N('Jacques Brel', 'Amsterdam', ['Brel never recorded it in a studio; the famous version is live at the Olympia, 1964. Sailors in the port of Amsterdam, drinking, dancing, and crying.']);
  N('Jacques Brel', 'La chanson des vieux amants', ['From 1967. An old couple, twenty years of storms and fights, and still: I love you.']);
  N('Jacques Brel', 'Les vieux', ['From 1963. The old people, in their house, with a clock in the living room that says: I wait for you.']);
  N('Léo Ferré', 'Avec le temps', ['From 1970. With time, everything goes away, even love, even the face you could not live without.']);
  N('Barbara', 'Göttingen', ['Barbara wrote it in 1964 after singing in Göttingen, in Germany, less than twenty years after the war. A song of reconciliation between France and Germany.']);
  N('Barbara', 'Nantes', ['Barbara wrote it about her father, who had left the family. She arrived in Nantes too late to see him before he died.']);
  N('Barbara', 'Dis, quand reviendras-tu ?', ['From 1962. Barbara asks a lover who is always leaving: tell me, when will you come back? And warns him: time does not wait.']);
  N('Georges Brassens', 'Les passantes', ['A poem by Antoine Pol, put to music by Brassens in 1972: all the women we passed once, and never saw again.']);
  N('Georges Brassens', 'Supplique pour être enterré à la plage de Sète', ['From 1966. Brassens asks to be buried on the beach of Sète, his home town. He was buried in Sète, though not on the beach.']);
  N('Serge Gainsbourg', 'La Javanaise', ['From 1963, first written for Juliette Gréco. The song plays with the sound av inside every word.']);
  N('Serge Gainsbourg', 'Je suis venu te dire que je m\'en vais', ['From 1973. Gainsbourg says goodbye, calmly, while someone cries in the background, and quotes the poet Verlaine.']);
  N('Charles Aznavour', 'La Bohème', ['From 1965. An old painter returns to Montmartre, to the place where he was young, poor and happy, and finds it gone.']);
  N('Charles Aznavour', 'Comme ils disent', ['From 1972. A gay man who lives with his mother and works as a drag artist at night. One of the first French songs to speak about homosexuality with tenderness.']);
  N('Édith Piaf', 'Non, je ne regrette rien', ['From 1960. Piaf dedicated it to the French Foreign Legion. Christopher Nolan later used it in Inception, as the song that wakes the dreamers.']);
  N('Édith Piaf', 'La vie en rose', ['Piaf wrote the words in 1945, after the war. Life seen in pink, through the eyes of someone in love.']);
  N('Édith Piaf', 'Hymne à l\'amour', ['From 1950. Piaf wrote it for the boxer Marcel Cerdan, who died in a plane crash the year before it was released. I do not care about the world, as long as you love me.']);
  N('Françoise Hardy', 'Tous les garçons et les filles', ['Her first hit, in 1962, when she was eighteen. Everyone her age walks two by two, and she walks alone.']);
  N('Françoise Hardy', 'Comment te dire adieu', ['From 1968, with words by Serge Gainsbourg. A goodbye built on rhymes ending in ex.']);
  N('Christophe', 'Les mots bleus', ['From 1974, with words by Jean-Michel Jarre. The blue words are the ones we say with our eyes when we cannot find the right words.']);
  N('Alain Bashung', 'La nuit je mens', ['From Fantaisie militaire, 1998. At night, I lie. A man inventing a legendary past for himself.']);
  N('Yves Montand', 'Les feuilles mortes', ['A poem by Jacques Prévert, music by Joseph Kosma, from 1945. Known in English as Autumn Leaves, it became a jazz standard.']);
  N('Dalida', 'Il venait d\'avoir 18 ans', ['From 1973. An older woman remembers a love with a young man of eighteen.']);
  N('Noir Désir', 'Le vent nous portera', ['From 2001, with Manu Chao on guitar. Whatever happens, the wind will carry us.']);

  // ---------- Arabic and Maghreb ----------
  N('Fairuz', 'Li Beirut', ['Fairuz sings to Beirut, on the music of Joaquín Rodrigo\'s Concierto de Aranjuez. Recorded during the Lebanese civil war: a love song to a wounded city.']);
  N('Fairuz', 'Kifak Inta', ['From 1991, written and composed by her son, Ziad Rahbani. A woman meets a former love after many years, and asks him simply: how are you?']);
  N('Fairuz', 'Zahrat El Mada\'en', ['A song for Jerusalem, the flower of cities, written by the Rahbani brothers after 1967.']);
  N('Umm Kulthum', 'Enta Omri', ['From 1964, composed by Mohammed Abdel Wahab, the first time the two greatest names of Egyptian music worked together. You are my life.']);
  N('Umm Kulthum', 'Al Atlal', ['From 1966, based on poems by Ibrahim Nagi. The ruins: a love that has collapsed, and a woman standing among what remains. Often called the greatest Arabic song of the twentieth century.']);
  N('Umm Kulthum', 'Alf Leila wa Leila', ['From 1969, composed by Baligh Hamdi. A thousand and one nights of love, in a song that can last more than an hour live.']);
  N('Abdel Halim Hafez', 'Qariat Al Finjan', ['On a poem by Nizar Qabbani, composed by Mohamed El Mougy. A fortune teller reads the coffee cup of a man, and sees a love he will never reach. It was one of the last songs Abdel Halim sang.']);
  N('Marcel Khalife', 'Ummi', ['On a poem by Mahmoud Darwish, written in an Israeli prison: I long for my mother\'s bread, my mother\'s coffee, my mother\'s touch.']);
  N('Mashrou\' Leila', 'Shim el Yasmine', ['From their first album, 2009. Hamed Sinno sings to a former lover, a man, with a tenderness rare in Arabic pop.']);
  N('Nass El Ghiwane', 'Mahmouma', ['One of their best known songs. In the 1970s, Nass El Ghiwane took the old rhythms of Gnawa and Malhoun and made them speak for a whole generation in Morocco.']);
  N('Dahmane El Harrachi', 'Ya Rayah', ['Written in the 1970s by the Algerian chaabi singer Dahmane El Harrachi: a song to the one who leaves, about exile, and about never quite arriving.']);
  N('Rachid Taha', 'Ya Rayah', ['Rachid Taha\'s version, from 1997, took Dahmane El Harrachi\'s song about exile around the world.']);
  N('Souad Massi', 'Raoui', ['From her first album, 2001. Raoui means storyteller: Souad Massi asks for the old tales of her Algerian childhood.']);

  // ---------- hip-hop ----------
  N('Kendrick Lamar', 'Alright', ['From To Pimp a Butterfly, 2015. Its chorus, we gon\' be alright, was chanted at protests across the United States.']);
  N('Kendrick Lamar', 'u', ['From To Pimp a Butterfly. Kendrick in a hotel room, crying and drinking, attacking himself for not being there for his family and friends. The other side of i.']);
  N('Kendrick Lamar', 'Sing About Me, I\'m Dying of Thirst', ['From good kid, m.A.A.d city, 2012. Twelve minutes: the voices of people from his neighbourhood, asking him to remember them.']);
  N('Kendrick Lamar', 'FEAR.', ['From DAMN., 2017. Fear at seven, at seventeen and at twenty-seven: the fears of a child, a teenager, and a man who became famous.']);
  N('Kendrick Lamar', 'Mother I Sober', ['From Mr. Morale & the Big Steppers, 2022. Kendrick speaks about family trauma, abuse, and breaking a cycle that went back generations.']);
  N('Kid Cudi', 'Pursuit of Happiness', ['From Man on the Moon, 2009, with MGMT and Ratatat. A party song that is really about not being happy at the party.']);
  N('Kid Cudi', 'Day \'n\' Nite', ['His first single, from 2008. The lonely stoner, walking at night, and many young people who felt seen.']);
  N('Kanye West', 'Runaway', ['From My Beautiful Dark Twisted Fantasy, 2010. A toast to all the people who mess things up, and a single piano note to start it all.']);
  N('Kanye West', 'Ultralight Beam', ['From The Life of Pablo, 2016. A gospel song, with a little girl\'s prayer at the start, Chance the Rapper\'s joyful verse, and a choir.']);
  N('Kanye West', 'Street Lights', ['From 808s & Heartbreak, 2008, made after his mother\'s death and a broken engagement. Auto-tune, used to sound lonely.']);
  N('Mac Miller', 'Self Care', ['From Swimming, 2018. Mac sings about taking care of himself. He died a month after the album came out, aged twenty-six.']);
  N('Mac Miller', 'Good News', ['From Circles, finished after his death by the producer Jon Brion and released in 2020. Good news is all they want to hear.']);
  N('Mac Miller', 'Circles', ['The title song of the album released after his death, in 2020. Drawing circles: going around and around the same feelings.']);
  N('Mac Miller', '2009', ['From Swimming, 2018. A song about looking back and realising you have made peace with who you are.']);
  N('2Pac', 'Changes', ['Recorded in 1992, released after his death in 1998. It samples Bruce Hornsby\'s The Way It Is. Things never change, he says, and asks why.']);
  N('2Pac', 'So Many Tears', ['From Me Against the World, 1995. A man who knows he may not live long, and is already writing his own eulogy.']);
  N('Nas', 'One Mic', ['From Stillmatic, 2001. All he needs is one microphone. It goes from a whisper to a scream and back again.']);
  N('Nas', 'Life\'s a Bitch', ['From Illmatic, 1994, with AZ, and Nas\'s father, Olu Dara, playing the cornet at the end.']);
  N('J. Cole', 'Love Yourz', ['From 2014 Forest Hills Drive. No such thing as a life that is better than yours: love yours.']);
  N('Lupe Fiasco', 'Kick, Push', ['From 2006. A love story told through skateboarding.']);
  N('Common', 'The Light', ['From 2000, built on a Bobby Caldwell sample. Common\'s love letter to Erykah Badu.']);
  N('Mos Def', 'Umi Says', ['From Black on Both Sides, 1999. Umi means my mother. She says: shine your light on the world.']);
  N('Little Simz', 'Introvert', ['The first song on Sometimes I Might Be Introvert, 2021. Strings, choir and drums, and a voice speaking to herself.']);
  N('Nujabes', 'Aruarian Dance', ['From the soundtrack of the anime Samurai Champloo. Nujabes, from Tokyo, helped create what people now call lo-fi hip-hop. He died in a car accident in 2010, aged thirty-six.']);
  N('Nujabes', 'Feather', ['From Modal Soul, 2005, with Cise Starr and Akin. A gentle piano and a verse about the weight of life, and how light it can be.']);
  N('J Dilla', 'Time: The Donut of the Heart', ['From Donuts, released in February 2006, three days before J Dilla died. He made most of it in a hospital bed, with a sampler and a small record player.']);
  N('J Dilla', 'Don\'t Cry', ['From Donuts, made in hospital in his last months. A sample, cut and looped, saying don\'t cry. Many hear it as a message to his mother.']);


  // ---------- lines that follow the song's mood label, and a word when the energy changes a lot ----------
  R.moodBy = {
    calm: ['Something calm now. Nothing to solve, nothing to win.', 'A quiet one. Let the room settle around it.', 'Soft, and unhurried. Breathe with it.', 'This one asks very little of you. Just stay.'],
    warm: ['A warm one, like a lamp left on for you.', 'Something warm for the next few minutes.', 'This song feels like someone you trust, sitting nearby.', 'Warmth, in about four minutes.'],
    dreamy: ['A dreamy one. Edges blurred on purpose.', 'This one floats. Let it.', 'Half awake, half somewhere else: that is the right way to hear this.', 'A song made of haze and light.'],
    melancholic: ['A sad song, but the good kind of sad, the kind that keeps you company.', 'Melancholy, the sweet one. You do not have to fix anything while it plays.', 'A little heavy-hearted, this one. That is allowed.', 'For the part of you that misses something.'],
    dark: ['A darker one now. We do not look away from the shadows here.', 'This song lives at night. Turn the lights down if you like.', 'Something dark, and honest about it.', 'Not every song has to comfort you. This one tells the truth instead.'],
    tense: ['A tense one. Feel it tighten, and wait for the release.', 'Something restless now, something on edge.', 'This song does not sit still. Neither do we, some nights.', 'Nerves and electricity, for a few minutes.'],
    epic: ['A big one. Give it some volume, and some room.', 'Something wide and grand. Let it fill the space.', 'This song is built like a mountain. Take the long way up.', 'An epic one, the kind that makes ordinary things feel important.'],
    hopeful: ['A hopeful one. Small light, but light.', 'Something that leans towards tomorrow.', 'This song believes things can get better. Let it believe for you, for a while.', 'Hope, in a few minutes of music.'],
  };
  R.energyDown = ['Let us slow down now.', 'We bring the pace down a little.', 'Time to breathe out. Something slower.', 'A gentler pace for the next one.'];
  R.energyUp = ['Let us pick up the pace.', 'A little more energy now.', 'Time to wake the room up a bit.', 'We lift things up for this one.'];

  // ---------- artists: a word about who they are, for any of their songs (including songs you add later) ----------
  Object.assign(A, {
    'Pink Floyd': ['Pink Floyd started in London in 1965 as a psychedelic band around Syd Barrett, and became one of the best-selling bands in history after he left.'],
    'King Crimson': ['King Crimson is Robert Fripp\'s band, ever-changing, since 1969. Their first album helped invent progressive rock.'],
    'Radiohead': ['Radiohead, from Oxford, met at school. Every album, they change direction, and they have never stopped asking what a rock band can be.'],
    'David Bowie': ['David Bowie changed his sound and his character so often that he became a kind of genre himself.'],
    'Car Seat Headrest': ['Car Seat Headrest began as Will Toledo alone, recording albums in the back seat of his family\'s car for privacy, and sharing them online.'],
    'Nick Drake': ['Nick Drake made three albums and sold almost nothing in his lifetime. He died in 1974, aged twenty-six. Today he is one of the most loved songwriters in English.'],
    'Elliott Smith': ['Elliott Smith wrote whispered, beautiful songs about addiction, depression and tenderness. He died in 2003, aged thirty-four.'],
    'Leonard Cohen': ['Leonard Cohen was a poet and a novelist before he became a singer, in his thirties. His voice got deeper and his songs got darker, until his last album, at eighty-two.'],
    'Bob Dylan': ['Bob Dylan received the Nobel Prize in Literature in 2016, for creating new poetic expressions within the great American song tradition.'],
    'Joni Mitchell': ['Joni Mitchell, from the Canadian prairies, invented many of her own guitar tunings. She learned to play after polio as a child left her hand weak.'],
    'Jacques Brel': ['Jacques Brel was Belgian, and sang as if every song were his last. He stopped performing at the height of his fame, and sailed away to the Marquesas Islands.'],
    'Barbara': ['Barbara, the woman in black, sang mostly her own songs at her piano. As a Jewish child, she spent the war in hiding in France.'],
    'Georges Brassens': ['Georges Brassens, with his pipe and his guitar, wrote some of the most loved poetry in the French language, and made it sound like conversation.'],
    'Fairuz': ['Fairuz, from Lebanon, is often called the soul of the Arab world. Many people in the Middle East start their mornings with her voice.'],
    'Umm Kulthum': ['Umm Kulthum, the star of the East, sang concerts that lasted for hours. Her monthly radio concerts used to empty the streets across the Arab world.'],
    'Nass El Ghiwane': ['Nass El Ghiwane formed in the 1970s in Hay Mohammadi, a working-class neighbourhood of Casablanca. Martin Scorsese called them the Rolling Stones of Africa.'],
    'Kendrick Lamar': ['Kendrick Lamar, from Compton, became in 2018 the first rapper to win the Pulitzer Prize for Music.'],
    'Kid Cudi': ['Kid Cudi, from Cleveland, made songs about loneliness and depression at a time when rappers rarely did. Many listeners say his music helped them through hard nights.'],
    'Mac Miller': ['Mac Miller, from Pittsburgh, grew from a party rapper into a gentle, searching songwriter. He died in 2018, aged twenty-six.'],
    'Frank Ocean': ['Frank Ocean, from New Orleans, releases very little and very rarely. Every record becomes an event.'],
    'Stromae': ['Stromae, from Brussels, writes dance songs with sad words, and has spoken openly about burnout and depression.'],
    'Pachyman': ['Pachyman is Pachy García, a Puerto Rican musician based in Los Angeles. He plays all the instruments himself and records on tape, the old way.'],
    'King Tubby': ['King Tubby was a Jamaican sound engineer who started by repairing radios. In his small studio in Kingston, he turned the mixing desk into an instrument and invented dub.'],
    'Scientist': ['Scientist, Hopeton Brown, learned at King Tubby\'s studio as a teenager. His albums of the early eighties had titles borrowed from horror films.'],
    'Lee "Scratch" Perry': ['Lee Scratch Perry built the Black Ark studio in his back yard in Kingston, and made some of the strangest and most beautiful reggae ever recorded there.'],
    'The Upsetters': ['The Upsetters were Lee Scratch Perry\'s studio band at the Black Ark, in Kingston.'],
    'Augustus Pablo': ['Augustus Pablo made the melodica, a toy-like keyboard you blow into, into a serious instrument of dub.'],
    'Mad Professor': ['Mad Professor, born in Guyana, built his own studio in London and became one of the masters of British dub.'],
    'Yabby You': ['Yabby You, Vivian Jackson, was a deeply religious Jamaican singer and producer: his dubs sound like prayers.'],
    'Prince Jammy': ['Prince Jammy, later King Jammy, learned from King Tubby, and went on to help create digital reggae in the eighties.'],
    'Burning Spear': ['Burning Spear, Winston Rodney, took his name from the nickname of Jomo Kenyatta, Kenya\'s first president. His songs are about history, memory and Marcus Garvey.'],
    'The Congos': ['The Congos were a vocal group whose one album with Lee Perry is considered a masterpiece of roots reggae.'],
    'Brian Eno': ['Brian Eno started as the synthesizer player of Roxy Music, then invented ambient music, and produced albums for Talking Heads, U2 and Coldplay.'],
    'Aphex Twin': ['Aphex Twin is Richard D. James, from Cornwall. He makes some of the most aggressive and some of the gentlest electronic music, sometimes on the same album.'],
    'Max Richter': ['Max Richter, German-born and raised in England, mixes classical music with electronics. He once wrote an eight-hour piece, called Sleep, to be listened to through the night.'],
    'Sigur Rós': ['Sigur Rós come from Iceland. Jónsi often sings in Hopelandic, a language of sounds with no meaning, so the voice becomes another instrument.'],
    'Tame Impala': ['Tame Impala is Kevin Parker, from Perth, in Australia. In the studio, he plays almost everything himself.'],
    'Khruangbin': ['Khruangbin is a trio from Texas. They started out loving old Thai funk tapes, and their name means aeroplane in Thai.'],
    'Bon Iver': ['Bon Iver is Justin Vernon, from Wisconsin. The name comes from bon hiver, French for good winter.'],
    'Sufjan Stevens': ['Sufjan Stevens, from Michigan, once announced he would make an album for each of the fifty American states. He made two.'],
    'Big Thief': ['Big Thief are a band from Brooklyn, around the songwriter Adrianne Lenker. They often record live, all together in one room.'],
    'Phoebe Bridgers': ['Phoebe Bridgers, from Los Angeles, writes sad songs with a very dry sense of humour.'],
    'Portishead': ['Portishead are from Bristol, named after a small town nearby. They have released only three studio albums.'],
    'Massive Attack': ['Massive Attack came out of the Bristol sound system scene, and practically invented trip-hop with their first album in 1991.'],
    'Boards of Canada': ['Boards of Canada are two brothers from Scotland who rarely give interviews. Their name comes from the National Film Board of Canada, whose documentaries they watched as children.'],
    'Beach House': ['Beach House are a duo from Baltimore: Victoria Legrand, who sings and plays keyboards, and Alex Scally, on guitar.'],
    'Slowdive': ['Slowdive, from Reading in England, were mocked by the press in the nineties, split up, and came back twenty years later to find a whole new generation waiting for them.'],
    'The Cure': ['The Cure, led by Robert Smith since 1978, have swung between the darkest gothic rock and bright pop songs for almost half a century.'],
    'Joy Division': ['Joy Division, from Manchester, recorded only two albums before their singer Ian Curtis died in 1980. The others went on as New Order.'],
    'Miles Davis': ['Miles Davis changed jazz several times: cool jazz, modal jazz, jazz fusion. Each time, many people said he had gone too far.'],
    'John Coltrane': ['John Coltrane lived only forty years, and spent the last ten of them looking for God through the saxophone.'],
    'Nina Simone': ['Nina Simone wanted to be a classical pianist. When a music school turned her down, she became one of the greatest voices of jazz, soul and civil rights.'],
    'Bill Withers': ['Bill Withers worked in the navy and in a factory before he became a singer in his thirties, and he walked away from the music business in the mid-eighties.'],
    'Amy Winehouse': ['Amy Winehouse, from north London, had a jazz singer\'s voice and a songwriter\'s honesty. She died in 2011, aged twenty-seven.'],
    'Édith Piaf': ['Édith Piaf, the little sparrow, grew up partly in her grandmother\'s brothel in Normandy and sang in the streets of Paris before she became the voice of France.'],
    'Charles Aznavour': ['Charles Aznavour, son of Armenian immigrants in Paris, wrote more than a thousand songs, and was still touring in his nineties.'],
    'Serge Gainsbourg': ['Serge Gainsbourg was a provocateur and a poet, who wrote some of the most elegant songs in French between scandals.'],
    'Françoise Hardy': ['Françoise Hardy became the face of French pop in the sixties, while always describing herself as shy and melancholic.'],
    'Jeff Buckley': ['Jeff Buckley made one album, Grace, and drowned while swimming in Memphis in 1997, aged thirty.'],
    'Simon & Garfunkel': ['Paul Simon and Art Garfunkel met at school in New York, aged eleven. They argued for decades, and their voices still fit together like nobody else\'s.'],
    'Cat Stevens': ['Cat Stevens became Yusuf Islam in 1977 and left music for almost thirty years, before coming back to it.'],
    'Johnny Cash': ['Johnny Cash, the man in black, said he wore black for the poor, the prisoners and the forgotten.'],
    'Townes Van Zandt': ['Townes Van Zandt was a Texas songwriter that other songwriters worshipped, and who lived most of his life poor, on the road, and in trouble.'],
    'Neil Young': ['Neil Young, from Canada, has switched between gentle folk and loud, distorted rock for more than fifty years.'],
    'Fleet Foxes': ['Fleet Foxes, from Seattle, are known for their harmonies, inspired by old folk and church music.'],
    'Queen': ['Queen were four very different musicians from London, and Freddie Mercury, born in Zanzibar, became one of the greatest performers in rock.'],
    'Led Zeppelin': ['Led Zeppelin were one of the biggest rock bands of the seventies, with a deep love for the blues and for the music of North Africa and India.'],
    'Metallica': ['Metallica, from California, started in the thrash metal underground and became one of the biggest bands in the world.'],
    'Kate Bush': ['Kate Bush was discovered as a teenager by David Gilmour of Pink Floyd. She writes, produces and choreographs everything herself.'],
    'Björk': ['Björk, from Iceland, released her first album at eleven. Every record since has been a new world, with its own sounds and instruments.'],
    'Lana Del Rey': ['Lana Del Rey sings about an old, cinematic America, glamorous and sad at the same time.'],
    'Lorde': ['Lorde, from New Zealand, wrote her first album as a teenager in Auckland, and it made her famous across the world.'],
    'Sam Cooke': ['Sam Cooke started as a gospel singer and became one of the inventors of soul music. He was shot dead in 1964, aged thirty-three.'],
    'Marvin Gaye': ['Marvin Gaye was the prince of Motown, who fought his own record label to make the music he believed in.'],
    'Otis Redding': ['Otis Redding, from Georgia, died in a plane crash in 1967, aged twenty-six, just as the world was discovering him.'],
    'Mazzy Star': ['Mazzy Star are Hope Sandoval and the late David Roback, from California. They released a few albums, very slowly, over thirty years.'],
    'Cocteau Twins': ['Cocteau Twins, from Scotland, made music that seemed to come from another planet. Elizabeth Fraser often sang words that existed only in her own language.'],
    'Nujabes': ['Nujabes, Jun Seba, from Tokyo, mixed jazz and hip-hop so gently that he helped create what people now call lo-fi.'],
    'J Dilla': ['J Dilla, from Detroit, changed the way hip-hop drums feel: a little late, a little loose, very human. He died in 2006, aged thirty-two.'],
    'Mount Eerie': ['Mount Eerie is Phil Elverum, who also recorded as The Microphones, in the small town of Anacortes, in Washington State.'],
    'Daniel Johnston': ['Daniel Johnston lived with bipolar disorder and recorded his songs on cheap cassettes. Kurt Cobain often wore his T-shirt.'],
    'Hans Zimmer': ['Hans Zimmer, from Germany, has scored more than a hundred and fifty films, from The Lion King to Interstellar.'],
    'Ennio Morricone': ['Ennio Morricone wrote the music for more than four hundred films and won an Oscar at eighty-seven.'],
    'Vangelis': ['Vangelis, from Greece, was a self-taught musician who never learned to read music. He won an Oscar for Chariots of Fire.'],
    'Tycho': ['Tycho is Scott Hansen, from San Francisco, a designer as well as a musician: his albums sound like the colours of his posters.'],
    'Bonobo': ['Bonobo is Simon Green, from England, who builds warm electronic music from samples and live instruments.'],
    'Air': ['Air are two musicians from Versailles, Nicolas Godin and Jean-Benoît Dunckel, who made French electronic music feel slow and dreamy.'],
    'Röyksopp': ['Röyksopp are a duo from Tromsø, in northern Norway, above the Arctic Circle.'],
    'Burial': ['Burial is William Bevan, from south London. For years nobody knew who he was. He still gives very few interviews.'],
  });
})();
