// More hand-written introductions and outros for every song, so each one has many ways in and out.
(function () {
  const R = window.RADIO;
  const more = {
    'time': {
      i: [
        'Here is a song that ends by coming back to where it began, like a clock face. Pink Floyd, Time. Pay attention to the guitar, and what it does with the pauses.',
        'If you have ever looked at your watch and felt a small chill, this song is for you. Pink Floyd, Time, from The Dark Side of the Moon.',
        'The closing section of this song returns to a tune from earlier in the album, which is a very clever way of saying that life is a circle that does not close. Pink Floyd, Time.',
        'A song that tells you, in its first minute, that the clocks are in the room with you. Pink Floyd, Time. Let us listen together.',
      ],
      b: ['Pink Floyd, Time. Somewhere in there is a sentence about the sun being the same in a relative way, and it is the loneliest thing ever sung about daylight.', 'That was Time. They wrote it a very long time ago, and it has aged better than any of us.'],
    },
    'echoes': {
      i: [
        'Some songs are visited, and some are lived in. This is one to live in for a while. Pink Floyd, Echoes. Turn the lights down.',
        'It begins like a signal from the bottom of the ocean and ends like a sunrise. Pink Floyd, Echoes. Twenty-something minutes of patience, and then something else.',
        'The progressive rock idea is that a song can be a place. This one is a place. Pink Floyd, Echoes, from the album Meddle.',
        'If you have the time, give this song your full attention. If you do not, give it anyway. Pink Floyd, Echoes.',
      ],
      b: ['Pink Floyd, with Echoes. It is the kind of song that makes the radio feel like a very small, very warm room.', 'That was Echoes. I told you it was worth the wait.'],
    },
    'five years': {
      i: [
        'A song that begins at the end of the world, with a single drum and a worried voice, and gets more tender as it goes. David Bowie, Five Years.',
        'It is early in the album, and Bowie has already told you the planet is finished. David Bowie, Five Years. Notice how calm the panic sounds.',
        'The end of the world, as seen through a window. People weep, people stare, and a few people keep working. David Bowie, Five Years.',
        'Rock and roll, in its youth, loved to imagine the apocalypse. This might be the most humane version of it. David Bowie, Five Years.',
      ],
      b: ['David Bowie, Five Years. The ending of that song, with the whole choir of strings, always sounds to me like someone saying: look at all of you, still here.', 'That was Five Years. Whatever you would do with five years, maybe you could start with five minutes.'],
    },
    'my way': {
      i: [
        'A song for the person who has made their peace with the way they lived. Frank Sinatra, My Way. Hear how the orchestra swells, as if it were also getting older.',
        'Every proud person has a moment of vulnerability, and this song captures both. Frank Sinatra, My Way.',
        'Here is a song that has been sung at more funerals than almost any other, and I understand why. Frank Sinatra, My Way.',
        'Sinatra gave it a swagger, but under the swagger, there is a person taking inventory. Frank Sinatra, My Way.',
      ],
      b: ['Frank Sinatra, My Way. The tenderness is in how quietly he starts, and how loudly he finishes.', 'That was My Way. Whatever your way is, I hope it is a kind one.'],
    },
    'time moves slow': {
      i: [
        'A slow groove for a slow hour. BADBADNOTGOOD, Time Moves Slow. The saxophone does half the talking.',
        'Not everything in life is meant to be rushed, and this song is a polite reminder. BADBADNOTGOOD.',
        'When the world speeds up, jazz-minded people tend to slow down. BADBADNOTGOOD, Time Moves Slow.',
        'A song that makes a minute feel like an afternoon, in the best way. BADBADNOTGOOD, with Samuel T. Herring.',
      ],
      b: ['BADBADNOTGOOD, Time Moves Slow. I hope your own clock has softened a bit.', 'That was Time Moves Slow. It does, if you let it.'],
    },
    'let it happen': {
      i: [
        'There is a strange comfort in a song that tells you to stop fighting. Tame Impala, Let It Happen.',
        'It starts like a thought, and grows like a wave. Tame Impala, Let It Happen. Let it carry you for eight minutes.',
        'Kevin Parker said a lot of his music is about being afraid of change. This song is the moment of giving in. Tame Impala.',
        'A good song for anyone who has been white-knuckling their life lately. Tame Impala, Let It Happen.',
      ],
      b: ['Tame Impala, Let It Happen. Sometimes surrender feels exactly like that: a long, glittering fall.', 'That was Let It Happen. If you needed permission to let go of something tonight, there it was.'],
    },
    'forget about life': {
      i: [
        'A pop song with a heavy heart and a light touch. Alvvays, Forget About Life.',
        'The guitar sounds like sunshine and the words sound like a sigh. Alvvays, Forget About Life.',
        'When all else fails, a little jangly guitar. Alvvays, Forget About Life.',
        'There is a kind of philosophy that only fits inside three minutes of dream pop. Alvvays.',
      ],
      b: ['Alvvays, Forget About Life. The trick of it is that you remember it perfectly.', 'That was Forget About Life. If you managed to, for a moment, good.'],
    },
    'subterranean homesick alien': {
      i: [
        'A song for looking out at the stars from a very dull street. Radiohead, Subterranean Homesick Alien.',
        'Thom Yorke has a talent for making loneliness sound like a place you can visit. Radiohead, Subterranean Homesick Alien.',
        'In this song, the aliens are kinder than the neighbors. Radiohead.',
        'Let us float for a few minutes, above the cul-de-sacs and the hum of the highway. Radiohead, Subterranean Homesick Alien.',
      ],
      b: ['Radiohead, Subterranean Homesick Alien. A very polite way to want to be anywhere else.', 'That was Subterranean Homesick Alien. They came, they listened, and they flew away.'],
    },
    'hier encore': {
      i: [
        'This one is for the day you realize you are no longer the youngest person in the room. Charles Aznavour, Hier encore.',
        'A French songwriter, in his forties, remembering his twenties, as if from the end of a long, long life. Charles Aznavour, Hier encore.',
        'Youth is wasted on the young, as the old line goes, and Aznavour sings it with tenderness. Hier encore.',
        'Hier encore, only yesterday. A song about the speed of the years. Charles Aznavour.',
      ],
      b: ['Charles Aznavour, Hier encore. A small masterpiece of regret that somehow does not feel bitter.', 'That was Hier encore. A beautiful sadness, in a language made for it.'],
    },
    'taxi driver main title': {
      i: [
        'A saxophone for a city that never sleeps and never forgives. Bernard Herrmann, from Taxi Driver.',
        'Think of rain on a windshield, and neon in the puddles. Bernard Herrmann, the main title of Taxi Driver.',
        'The loneliness of a big city is its own kind of weather. This is the theme tune. Bernard Herrmann.',
        'Cinema music rarely sounds as honest as this. Bernard Herrmann, Taxi Driver.',
      ],
      b: ['Bernard Herrmann, from Taxi Driver. Some music is like a lit window, seen from the street.', 'That was the theme from Taxi Driver. A saxophone is the closest thing to a human voice that never learned to speak.'],
    },
    'hurt': {
      i: [
        'The most honest cover version ever recorded, maybe. Johnny Cash, Hurt.',
        'You do not need to know the song to feel it. Just listen to the voice. Johnny Cash, Hurt.',
        'There is a moment in the video where the camera moves slowly across a house full of memories. The song is the same. Johnny Cash, Hurt.',
        'A man at the end of a long life, looking back at the mess, and the grace. Johnny Cash.',
      ],
      b: ['Johnny Cash, Hurt. I need a moment after that one.', 'That was Hurt. A reminder that some songs find their true voice only when the right person sings them.'],
    },
    'the end': {
      i: [
        'Here is a long, slow descent into the dark. The Doors, The End. Hold on.',
        'Every great band has a song that stands at the edge of a cliff, and this is theirs. The Doors, The End.',
        'The Doors made music for the night, and this is the deepest part of it. The End.',
        'Take a breath. This is eleven minutes of beautiful dread. The Doors, The End.',
      ],
      b: ['The Doors, The End. That was a lot. Let us come up for air.', 'That was The End. Strangely, I feel more awake.'],
    },
    'feels like the end': {
      i: [
        'A song for the moment you sit on the edge of the bed, with your shoes still on. Shane Alexander, Feels Like the End.',
        'Gentle, tired, and honest. Shane Alexander, Feels Like the End.',
        'Some nights are heavy, and a quiet song is a hand on the shoulder. Shane Alexander.',
        'Sit with this for a few minutes. Shane Alexander, Feels Like the End.',
      ],
      b: ['Shane Alexander, Feels Like the End. And yet, here we are, still on the air.', 'That was Feels Like the End. Not an ending, I promise. Only a very long exhale.'],
    },
    'kimochi warui': {
      i: [
        'A song with a strange title and a very familiar mood. Car Seat Headrest, Kimochi Warui.',
        'Will Toledo writes like he has too many thoughts and not enough exits. Car Seat Headrest, Kimochi Warui.',
        'Indie rock, in its most honest and disheveled form. Car Seat Headrest.',
        'You may relate to this more than you would like to. Car Seat Headrest, Kimochi Warui.',
      ],
      b: ['Car Seat Headrest, Kimochi Warui. Oddly cathartic, isn\'t it?', 'That was Kimochi Warui. A beautiful mess, sung as if nobody were listening.'],
    },
    'times to die': {
      i: [
        'A slow burn of a song, about the quiet question underneath everything. Car Seat Headrest, Times to Die.',
        'Dark in subject, and tender in sound. Car Seat Headrest.',
        'If you have ever thought about the end, this song is a kind companion. Car Seat Headrest, Times to Die.',
        'Let us hear what a young songwriter makes of the oldest question. Car Seat Headrest.',
      ],
      b: ['Car Seat Headrest, Times to Die. A strange and gentle ride.', 'That was Times to Die. Somehow, it makes me want to stay.'],
    },
    'in the aeroplane over the sea': {
      i: [
        'It sounds like a carnival in a dream, and a funeral in a garden. Neutral Milk Hotel, In the Aeroplane Over the Sea.',
        'There is a line in this song about how strange it is to be anything at all. Neutral Milk Hotel.',
        'A song that sings about love and death in the same breath, and never makes it sound sad exactly. Neutral Milk Hotel.',
        'Let this one wash over you. The voice is cracked, and the heart is open. Neutral Milk Hotel, In the Aeroplane Over the Sea.',
      ],
      b: ['Neutral Milk Hotel, In the Aeroplane Over the Sea. What a gorgeous, ragged thing.', 'That was In the Aeroplane Over the Sea. It sounds like a hymn from a place that does not exist.'],
    },
    'starless': {
      i: [
        'A great black cloud of a song, with a light in the middle. King Crimson, Starless.',
        'It starts in sorrow and builds into something enormous and almost unbearable. King Crimson, Starless.',
        'Progressive rock at its most serious, and most beautiful. King Crimson.',
        'Twelve minutes, and every one of them is necessary. King Crimson, Starless.',
      ],
      b: ['King Crimson, Starless. What an ending. What an architecture.', 'That was Starless. It is rare for music to look into the dark that steadily.'],
    },
    'i talk to the wind': {
      i: [
        'The soft, folk side of progressive rock. King Crimson, I Talk to the Wind.',
        'A flute and a little guitar. That is all it takes. King Crimson.',
        'There is a certain loneliness in being a thinker among people who are busy. King Crimson, I Talk to the Wind.',
        'Gentle and wistful, from a band that later became very loud. King Crimson.',
      ],
      b: ['King Crimson, I Talk to the Wind. A small lullaby to the unheard.', 'That was I Talk to the Wind. I wonder what it said back.'],
    },
    'al abd wal waili': {
      i: [
        'Rap, in Arabic, with a thoughtful pulse. El Waili and Yucifer.',
        'The beat is simple, and the words are heavy. El Waili, featuring Yucifer.',
        'A change of language, but not of subject. The big questions, from a different corner. El Waili.',
        'Street philosophy, delivered with a flow. El Waili and Yucifer.',
      ],
      b: ['El Waili and Yucifer. Honest, loud, and alive.', 'That was El Waili, featuring Yucifer. A voice that says what it means.'],
    },
    'ブート': {
      i: [
        'A ghost in a shopping mall, humming a half-remembered song. Macintosh Plus.',
        'It is like a memory of a memory, played at the wrong speed. Macintosh Plus.',
        'A strangely peaceful track, from a strangely haunted genre. Macintosh Plus, vaporwave.',
        'The aesthetic of loss, in pastel colors. Macintosh Plus.',
      ],
      b: ['Macintosh Plus, vaporwave. If it felt like an old commercial dissolving, it did what it was supposed to.', 'That was Macintosh Plus. A lullaby for a mall that closed.'],
    },
    'i\'m not in love': {
      i: [
        'A very calm way to be in a very big feeling. 10cc, I\'m Not In Love.',
        'The sound of the song is like a lid on a boiling pot. 10cc.',
        'Denial has rarely sounded so gorgeous. 10cc, I\'m Not In Love.',
        'Listen for the choir, which is actually just four men and a lot of tape. 10cc, I\'m Not In Love.',
      ],
      b: ['10cc, I\'m Not In Love. Possibly the most elaborate lie in pop music, and I believe none of it.', 'That was I\'m Not In Love. Sure.'],
    },
    'chamber of reflection': {
      i: [
        'A dark room, a slow synth, and a very honest thought. Mac DeMarco, Chamber of Reflection.',
        'Sometimes you need a song that sounds like a lamp left on. Mac DeMarco.',
        'Lazy, warped, and surprisingly deep. Mac DeMarco, Chamber of Reflection.',
        'Take a seat, and let the night be a little slower. Mac DeMarco.',
      ],
      b: ['Mac DeMarco, Chamber of Reflection. A lazy-eyed meditation on being alone.', 'That was Chamber of Reflection. I reflected. It was fine.'],
    },
    'in my dreams (cudder anthem)': {
      i: [
        'A lonely hum, a steady beat, and a dream. Kid Cudi, In My Dreams.',
        'Some people hum to stay calm. This is that, made into a song. Kid Cudi.',
        'The reflective side of hip hop, in its softest form. Kid Cudi, In My Dreams.',
        'An anthem for people who stay up too late, thinking. Kid Cudi.',
      ],
      b: ['Kid Cudi, In My Dreams. An honest hum for dark hours.', 'That was the Cudder Anthem. May your dreams be kind tonight.'],
    },
    'within': {
      i: [
        'A song about the question of identity, sung by a machine. Daft Punk, Within.',
        'Three minutes of gentle piano, and a robot admitting it is lost. Daft Punk.',
        'Sometimes the most human thing is to say you do not know. Daft Punk, Within.',
        'From the album Random Access Memories, a very quiet song in a loud record. Daft Punk, Within.',
      ],
      b: ['Daft Punk, Within. I do not know who I am either. It is all right.', 'That was Within. A tender little crisis, in four minutes.'],
    },
    'imagine': {
      i: [
        'A piano, a voice, and a request to picture something better. John Lennon, Imagine.',
        'The simplest song can sometimes be the most difficult to live up to. John Lennon, Imagine.',
        'I like to think of this song as a very soft protest. John Lennon.',
        'Close your eyes, if you can. John Lennon, Imagine.',
      ],
      b: ['John Lennon, Imagine. It asks for so little, and so much.', 'That was Imagine. I hope you did.'],
    },
    'the lunar tune': {
      i: [
        'Something small and silvery, for the night sky. Skywatchers, The Lunar Tune.',
        'Let us look up for a few minutes. Skywatchers.',
        'A mellow little track for a window and a moon. Skywatchers, The Lunar Tune.',
        'Nothing to analyze here. Just float. Skywatchers.',
      ],
      b: ['Skywatchers, The Lunar Tune. Moonlight, in a three-minute bottle.', 'That was The Lunar Tune. Goodnight, moon.'],
    },
    'blue spotted tail': {
      i: [
        'The sound of an old campfire in a modern city. Fleet Foxes, Blue Spotted Tail.',
        'Robin Pecknold writes about being small in a big world, and does it beautifully. Fleet Foxes.',
        'Fleet Foxes make music for people who miss a place they have never been. Blue Spotted Tail.',
        'A quiet folk song, with a heavy shadow. Fleet Foxes.',
      ],
      b: ['Fleet Foxes, Blue Spotted Tail. A song that feels like wood smoke.', 'That was Blue Spotted Tail. Plain words, and a long echo.'],
    },
    'time to pretend': {
      i: [
        'A pop song that is quietly laughing at pop songs. MGMT, Time to Pretend.',
        'Everything about this song sounds like a party, and everything in it is a warning. MGMT.',
        'It is exuberant and doomed, which is a very good combination. MGMT, Time to Pretend.',
        'Dance, if you wish, but listen to the words. MGMT, Time to Pretend.',
      ],
      b: ['MGMT, Time to Pretend. A celebration that knows it will not last.', 'That was Time to Pretend. The best parties are the ones that know they are parties.'],
    },
    'a change is gonna come': {
      i: [
        'One of the great voices of the twentieth century, in one of its greatest songs. Sam Cooke, A Change Is Gonna Come.',
        'The strings rise slowly, and the voice carries a long weight. Sam Cooke.',
        'A song about hope, sung by someone who knew exactly how hard hope can be. Sam Cooke, A Change Is Gonna Come.',
        'If you need to be reminded that waiting is a form of strength, this is for you. Sam Cooke.',
      ],
      b: ['Sam Cooke, A Change Is Gonna Come. The most patient hope I know.', 'That was A Change Is Gonna Come. We are still waiting, and still believing.'],
    },
    'namla': {
      i: [
        'A tiny song about a tiny creature, with a very big shadow. Tamer Abu Ghazaleh, Namla.',
        'It is like a fable, with a modern ache. Tamer Abu Ghazaleh.',
        'The ant carries, the ant walks, the ant does not complain. Tamer Abu Ghazaleh, Namla.',
        'A gentle Arabic song for the stubborn and the tired. Tamer Abu Ghazaleh.',
      ],
      b: ['Tamer Abu Ghazaleh, Namla. A small creature, a huge meaning.', 'That was Namla. Be kind to the ants.'],
    },
    'walking the cow': {
      i: [
        'The sound of a fragile voice, singing with all its heart. Daniel Johnston, Walking the Cow.',
        'It has the tone of a child, and the sadness of an adult. Daniel Johnston.',
        'A treasure from the world of outsider music. Daniel Johnston, Walking the Cow.',
        'Wobbly and wonderful. Daniel Johnston.',
      ],
      b: ['Daniel Johnston, Walking the Cow. A voice you do not forget.', 'That was Walking the Cow. Honesty is rarely this charming.'],
    },
    'wait': {
      i: [
        'A song that keeps building, and never rushes. M83, Wait.',
        'The kind of music you hear while looking at the horizon. M83.',
        'A slow, shimmering end to a long dream of an album. M83, Wait.',
        'Close your eyes and let the synthesizers become a sunrise. M83.',
      ],
      b: ['M83, Wait. The waiting, it turns out, was the beautiful part.', 'That was Wait. I could have listened for another hour.'],
    },
    'je cours': {
      i: [
        'A running beat, and a running mind. Stromae, Je cours.',
        'This is anxiety, set to dance music, and somehow it works. Stromae.',
        'A song about not being able to stop moving. Stromae, Je cours.',
        'Stromae writes pop with a therapist\'s honesty. Je cours.',
      ],
      b: ['Stromae, Je cours. I am slightly out of breath, and I did not move.', 'That was Je cours. Perhaps, tomorrow, walk.'],
    },
    'sommeil': {
      i: [
        'A song about the thing we all need, and cannot always get. Stromae, Sommeil.',
        'If you are listening to this in bed, I hope you fall asleep soon. Stromae.',
        'Sleep is a country that does not accept bribes. Stromae, Sommeil.',
        'A sleepy song for an unsleepy mind. Stromae.',
      ],
      b: ['Stromae, Sommeil. Somewhere, a pillow is waiting.', 'That was Sommeil. Rest well, when it comes.'],
    },
  };
  Object.keys(more).forEach(k => {
    const s = R.songScripts[k]; if (!s) return;
    s.intros = s.intros.concat(more[k].i); s.backs = s.backs.concat(more[k].b);
  });
})();
