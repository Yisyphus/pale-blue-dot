// Third batch: readings, commercials, shows, guests, and more connective lines.
(function () {
  const R = window.RADIO;

  R.readings.push(
    { title: 'A Noiseless Patient Spider', by: 'Walt Whitman', intro: 'A poem about loneliness, and the small, stubborn act of reaching.', t: 'A noiseless patient spider, I mark\'d where on a little promontory it stood isolated. Mark\'d how to explore the vacant vast surrounding, it launch\'d forth filament, filament, filament, out of itself, ever unreeling them, ever tirelessly speeding them. And you, O my soul, where you stand, surrounded, detached, in measureless oceans of space, ceaselessly musing, venturing, throwing, seeking the spheres to connect them, till the bridge you will need be form\'d, till the ductile anchor hold, till the gossamer thread you fling catch somewhere, O my soul.' },
    { title: 'There\'s a certain Slant of light', by: 'Emily Dickinson', intro: 'The kind of light that arrives on winter afternoons, and what it does to the mind.', t: 'There\'s a certain Slant of light, winter afternoons, that oppresses, like the Heft of Cathedral Tunes.' },
    { title: 'Ode to the West Wind, the last line', by: 'Percy Bysshe Shelley', intro: 'A last line that has comforted people for two hundred years.', t: 'O Wind, if Winter comes, can Spring be far behind?' },
    { title: 'The world is too much with us', by: 'William Wordsworth', intro: 'A sonnet from 1807, which could have been written about our phones.', t: 'The world is too much with us; late and soon, getting and spending, we lay waste our powers. Little we see in Nature that is ours; we have given our hearts away, a sordid boon!' },
    { title: 'So, we\'ll go no more a roving', by: 'Lord Byron', intro: 'A note of gentle farewell to the wild nights, written in a mood of tired grace.', t: 'So, we\'ll go no more a roving so late into the night, though the heart be still as loving, and the moon be still as bright. For the sword outwears its sheath, and the soul wears out the breast, and the heart must pause to breathe, and love itself have rest.' },
    { title: 'Fire and Ice', by: 'Robert Frost', intro: 'Eight lines on how the world might end, and which kind of ending we prefer.', t: 'Some say the world will end in fire, some say in ice. From what I\'ve tasted of desire, I hold with those who favor fire. But if it had to perish twice, I think I know enough of hate to say that for destruction ice is also great, and would suffice.' },
    { title: 'The Road Not Taken, the last stanza', by: 'Robert Frost', intro: 'The most misunderstood poem in English, and still worth hearing.', t: 'I shall be telling this with a sigh somewhere ages and ages hence: two roads diverged in a wood, and I, I took the one less traveled by, and that has made all the difference.' },
    { title: 'A Psalm of Life', by: 'Henry Wadsworth Longfellow', intro: 'A Victorian pep talk for the sleepy soul, and it is more cheerful than we expect.', t: 'Tell me not, in mournful numbers, life is but an empty dream! For the soul is dead that slumbers, and things are not what they seem.' },
    { title: 'Dover Beach, the last stanza', by: 'Matthew Arnold', intro: 'A poem about losing faith, standing at the sea, and turning to the person beside you.', t: 'Ah, love, let us be true to one another! For the world, which seems to lie before us like a land of dreams, so various, so beautiful, so new, hath really neither joy, nor love, nor light, nor certitude, nor peace, nor help for pain. And we are here as on a darkling plain, swept with confused alarms of struggle and flight, where ignorant armies clash by night.' },
    { title: 'Sonnet 116', by: 'William Shakespeare', intro: 'On love that does not bend with the weather.', t: 'Love is not love which alters when it alteration finds, or bends with the remover to remove. O no, it is an ever-fixed mark, that looks on tempests and is never shaken.' },
    { title: 'Such stuff as dreams are made on', by: 'William Shakespeare, The Tempest', intro: 'Prospero, near the end of the play, on the nature of everything.', t: 'We are such stuff as dreams are made on, and our little life is rounded with a sleep.' },
    { title: 'The Worldly Hope', by: 'Omar Khayyam, in Edward FitzGerald\'s version', intro: 'Khayyam on how quickly our biggest plans dissolve.', t: 'The Worldly Hope men set their Hearts upon turns Ashes, or it prospers; and anon, like Snow upon the Desert\'s dusty Face, lighting a little hour or two, is gone.' },
    { title: 'Vanity of vanities', by: 'Ecclesiastes, King James Version', intro: 'The oldest existential essay I know, and the first lines are famous.', t: 'Vanity of vanities, saith the Preacher, vanity of vanities; all is vanity. What profit hath a man of all his labour which he taketh under the sun? One generation passeth away, and another generation cometh: but the earth abideth for ever.' },
    { title: 'The Tao that can be told', by: 'Lao Tzu, in James Legge\'s translation', intro: 'The opening of the Tao Te Ching, which begins by admitting that it cannot say what it means.', t: 'The Tao that can be trodden is not the enduring and unchanging Tao. The name that can be named is not the enduring and unchanging name.' },
    { title: 'The Butterfly Dream', by: 'Zhuangzi, paraphrased', intro: 'A very old story about not knowing who is dreaming whom.', t: 'Once, Zhuangzi dreamed he was a butterfly, fluttering happily, quite unaware that he was a man. Suddenly he woke, and was Zhuangzi again. And now he did not know whether he was a man who had dreamed of being a butterfly, or a butterfly dreaming of being a man.' },
  );

  R.ads.push(
    'Brought to you by the Department of Almost. Almost finished. Almost there. Almost ready to begin. The Department of Almost, helping you hover since forever.',
    'The Opinion Exchange is open. Today, trading at a loss: strong opinions about things you only learned this morning. Trading at a gain: saying I do not know.',
    'This hour of radio is sponsored by the Void, now available in a handy, snack-sized portion. Stare into it for no more than a minute, and then have a biscuit.',
    'Attention, overthinkers. The Committee for Putting Things Down has a new motion. Place one thought on a shelf. We will sit with it tomorrow. All in favor, say nothing. Motion carried.',
    'Have you tried the Sunday Feeling in a bottle? It is a mix of mild dread, laundry, and an odd, tender hope. Shake gently and enjoy.',
    'Mismatched Socks, a brand for people who have accepted that nothing in life will pair perfectly. Mismatched Socks. Comfortable in its contradictions.',
    'Sponsored by Eventually, a new offering from the House of Maybe. Eventually: it is not tomorrow, it is not never. It is, how shall we say, in the neighborhood.',
    'Are you running low on small talk? The Weather Bureau of the Soul can supply you with a few reliable opening lines. Today: it is chilly in here, is it not?',
    'A word from our friends at Window Seat, the airline of the mind. Fly nowhere, arrive refreshed. Peanuts not included, but thoughts are, in abundance.',
    'Looking for meaning? Try the lost and found at your local bus station. Most items are umbrellas, but occasionally, a purpose turns up.',
    'The Guild of Slow Readers wishes to remind you that you do not have to finish the book. Or the day. Or the conversation. Some things are best left to simmer.',
    'Tonight\'s broadcast is brought to you by the Ministry of Rain. Because someone should speak up for the weather that makes the best songs.',
    'Complimentary Compliments: a little booth, on a street corner, where a stranger tells you that you are doing fine. Free of charge. No strings, and no catch.',
    'Do you have a nagging sense that you are forgetting something? You are. It is probably a glass of water. Drink it. That has been this announcement.',
    'The Lighthouse Keepers\' Union reminds you that the light does not have to be bright. It only has to be on.',
    'Introducing Pause, the new app that does not do anything. Open it, and it simply holds your place in the world for a minute. Rated five stars, by a cat.',
    'Existential Foods: our soup is just soup. It will not give you meaning, but it will be hot. Existential Foods. Honest, and warm.',
    'The National Association of Daydreamers has its annual convention every afternoon at three. Attendance is simple: look out of a window and drift.',
    'Brought to you by Backup Plan, the insurance policy for when everything goes slightly differently from how you pictured. Premiums are paid in flexibility.',
    'The Poets\' Cooperative announces that rhyme is not mandatory. Just say the true thing, as plainly as you can. The rest will take care of itself.',
    'This message is from Pillow, an old friend, who has held every one of your hard nights, and asked for nothing. Pillow. Be kind to it.',
    'The Society of Almost Strangers invites you to nod at someone today. A single, small nod. It is astonishing how much it can do.',
    'Hello, this is the Calendar. You may have forgotten that today is just one of many, and that it is allowed to be unremarkable. Thank you, and carry on.',
    'Sponsored by Elsewhere. A place you have never been, and that you imagine often. Visit, in your mind, for the length of this commercial. You are back. Welcome.',
    'The Museum of Pauses is now open. Exhibits include a held breath, the gap between thunder and rain, and the moment before a song begins. Admission: a moment of your attention.',
  );

  R.shows.push(
    { title: 'The Night Pharmacy', intro: 'And now, our fictional hour. A short story called The Night Pharmacy.', lines: [
      { w: 'h', t: 'On a quiet corner of a sleeping city, there is a pharmacy that sells only remedies for ordinary sorrows.' },
      { w: 'g', t: 'Good evening. How can I help?' },
      { w: 'g', t: 'I do not know. I just cannot sleep. Everything feels pointless.' },
      { w: 'g', t: 'I see. Take a seat. I will prepare something. One part warm tea, one part a good book you have not opened, and a pinch of patience.' },
      { w: 'g', t: 'Will that work?' },
      { w: 'g', t: 'Not instantly. But it never does. It works the way a lamp works. You switch it on, and gradually, the room becomes visible again.' },
      { w: 'h', t: 'The customer left with a small paper bag. Outside, the street was empty and quiet. But the streetlights, one by one, looked a little warmer than before.' },
      { w: 'h', t: 'That was The Night Pharmacy.' },
    ] },
    { title: 'The Man Who Collected Echoes', intro: 'Time for the fictional hour. Tonight, a small story called The Man Who Collected Echoes.', lines: [
      { w: 'h', t: 'There was once a man who traveled to canyons, cathedrals, and caves, to record the way his voice came back.' },
      { w: 'g', t: 'Every echo is a little different, you see. This one is a second late, and a little sad. That one is crisp, and almost cheerful.' },
      { w: 'g', t: 'Why do you collect them?' },
      { w: 'g', t: 'Because I realized, a long time ago, that my voice, alone, goes nowhere. It needs a wall to answer.' },
      { w: 'h', t: 'He raised his hands, and called a name into the valley. The valley, patiently, returned it.' },
      { w: 'g', t: 'There. We are all echoes of someone, in the end. The question is only who is on the other side of the wall.' },
      { w: 'h', t: 'That was The Man Who Collected Echoes.' },
    ] },
    { title: 'Window Number Nine', intro: 'And now the fictional hour. A short tale called Window Number Nine.', lines: [
      { w: 'h', t: 'In a very large office, there is a single window where you can ask any question at all.' },
      { w: 'g', t: 'Next, please. Yes, what is your inquiry?' },
      { w: 'g', t: 'I would like to know the meaning of my life.' },
      { w: 'g', t: 'I see. Form 7B. Do you have your identification?' },
      { w: 'h', t: 'The visitor searched his pockets. He found a ticket stub, a train pass, and a letter from a friend.' },
      { w: 'g', t: 'Ah. These will do. Ticket stub: you went somewhere. Train pass: you moved. Letter from a friend: you were loved. I am afraid, sir, that this is all the meaning we have in stock. But it is a respectable amount.' },
      { w: 'h', t: 'He left, slightly dazed, and strangely comforted. That was Window Number Nine.' },
    ] },
    { title: 'The Island of Small Hours', intro: 'It is the fictional hour. Tonight, a story called The Island of Small Hours.', lines: [
      { w: 'h', t: 'Between two and four in the morning, there is an island, and only the sleepless can reach it.' },
      { w: 'g', t: 'Welcome. Please leave your worries at the harbor. They will be here when you return, but you will find them smaller.' },
      { w: 'g', t: 'What do people do on this island?' },
      { w: 'g', t: 'Mostly, they sit by the water, and say what they could not say in the daytime. There is a lighthouse, and a very patient ferryman.' },
      { w: 'h', t: 'She sat, and said it. All of it. The sea listened without interrupting.' },
      { w: 'g', t: 'Better? The ferry leaves at dawn.' },
      { w: 'h', t: 'That was The Island of Small Hours.' },
    ] },
    { title: 'The Second-Hand Piano', intro: 'Now for the fictional hour. A short tale called The Second-Hand Piano.', lines: [
      { w: 'h', t: 'In a corner of a dusty shop stood a piano, with three keys missing and a lot of history.' },
      { w: 'g', t: 'It is out of tune. It has been in a flood. And yet, someone always buys a note from it.' },
      { w: 'g', t: 'Who would want a broken piano?' },
      { w: 'g', t: 'People who are a little broken themselves. They sit down, play something clumsy, and realize that imperfection can make a sound that perfect instruments never will.' },
      { w: 'h', t: 'A girl sat down, and played a few notes, wrong. And the old piano, as if grateful, sounded entirely like itself.' },
      { w: 'h', t: 'That was The Second-Hand Piano.' },
    ] },
    { title: 'Lost Property', intro: 'And now, the fictional hour. A short piece called Lost Property.', lines: [
      { w: 'h', t: 'At the end of every train line, there is a small room where the lost things go.' },
      { w: 'g', t: 'Umbrellas, mostly. Gloves, one at a time. And once, a man\'s sense of purpose, in a plain brown bag.' },
      { w: 'g', t: 'Did he come back for it?' },
      { w: 'g', t: 'Eventually. He had to describe it. That took him a while. In the end, he described it as, the reason I get up in the morning, but smaller than I used to think.' },
      { w: 'g', t: 'And you gave it to him?' },
      { w: 'g', t: 'Of course. It was a perfect match.' },
      { w: 'h', t: 'That was Lost Property. Remember to check your pockets.' },
    ] },
  );

  R.guests.push(
    { name: 'an imagined Al-Maarri', intro: 'Tonight, an imagined guest from the tenth century: a blind poet and a great skeptic from Syria. These are not his real words, only an echo of his spirit. Welcome, Abu al-Ala al-Maarri.', lines: [
      { w: 'h', t: 'Sir, your poetry is among the most clear-eyed and melancholy in Arabic. Why so dark?' },
      { w: 'g', t: 'I do not think it is dark. It is only unafraid. I have never understood why people think that to look at a hard thing is to be gloomy.' },
      { w: 'h', t: 'They say you asked for a strange epitaph, about being born.' },
      { w: 'g', t: 'It is said I asked for it, yes. A line about the wrong done by a father, and that I never did the same to anyone. A strange joke, and a serious one. I will let you decide which.' },
      { w: 'h', t: 'And yet you were also kind.' },
      { w: 'g', t: 'The doubter who is kind is the best sort. Since we do not know what is beyond, we have only one certain duty: do not add to the suffering in the world.' },
      { w: 'h', t: 'Thank you, sir. A peaceful night to you.' },
    ] },
    { name: 'an imagined Rumi', intro: 'An imagined visit tonight, from a Persian poet of the thirteenth century. These are not his real words, only a reverie. Welcome, Rumi.', lines: [
      { w: 'h', t: 'Rumi, so many people turn to you when they are heartbroken. What do you say to them?' },
      { w: 'g', t: 'That the wound is where the light enters. It is a very old thing to say, but it keeps being true.' },
      { w: 'h', t: 'And when someone feels lost?' },
      { w: 'g', t: 'Then you are in the middle of a journey. Lost is only a word for the part of the road without a signpost.' },
      { w: 'h', t: 'What is love, to you?' },
      { w: 'g', t: 'A great, patient thirst. And also the water. It is strange, I know. Both at once.' },
      { w: 'h', t: 'Thank you, Rumi. May your night be soft.' },
    ] },
    { name: 'an imagined Lao Tzu', intro: 'Tonight, an imagined guest from ancient China. These are not his real words, only a modern echo. Welcome, Lao Tzu.', lines: [
      { w: 'h', t: 'Master, we are always striving. What do you advise?' },
      { w: 'g', t: 'Strive less, perhaps. Water does not strive, yet it wears away stone.' },
      { w: 'h', t: 'But how do we succeed, then?' },
      { w: 'g', t: 'You are asking the question with your fist closed. Open it. See what is already in the hand.' },
      { w: 'h', t: 'And when life is hard?' },
      { w: 'g', t: 'Be like the bamboo. Bend with the storm, and stand again in the morning. The stiff tree breaks.' },
      { w: 'h', t: 'Thank you, Lao Tzu. A gentle night.' },
    ] },
    { name: 'an imagined Albert Camus, a second visit', intro: 'He is back, in imagination only. Not his real words, only an echo. Welcome again, Albert Camus.', lines: [
      { w: 'h', t: 'Monsieur Camus, what is the use of a good day, if everything ends?' },
      { w: 'g', t: 'The end does not cancel the day. A summer afternoon is no less warm because the sun sets. I have always found that very consoling, and very stubborn.' },
      { w: 'h', t: 'Do you believe in hope?' },
      { w: 'g', t: 'I believe in the next honest thing to do. Perhaps that is hope in its smallest, sturdiest form.' },
      { w: 'h', t: 'And the sea? You loved the sea.' },
      { w: 'g', t: 'The sea never explains itself. And yet I have never felt more understood than at the edge of it.' },
      { w: 'h', t: 'Thank you. Peace to your Tuesday.' },
    ] },
  );

  const more = {
    time: ['Time is the only thing we all share equally, and spend so differently.', 'A song about the strange fact that the past only grows.', 'We measure it in minutes, and feel it in a heartbeat.', 'Every clock is a polite little reminder.'],
    death: ['A song that stands very quietly beside the end.', 'It does not rush toward the dark, and does not avoid it either.', 'To think about death is, oddly, to think about how to live.', 'A gentle reminder that the page has an edge.'],
    alienation: ['For anyone who feels like a stranger in a familiar room.', 'The alien in the song is a lot like the person in the mirror.', 'A song for the margin of the party, near the door.', 'Alone, in the best and worst senses.'],
    'letting-go': ['For anyone with a very tired grip.', 'The hardest part of holding on is how much of you it takes.', 'Let the current have a go.', 'A little surrender, set to music.'],
    love: ['A song that knows love is a verb, and a risk.', 'Love, once again, refuses to be explained.', 'Tender, and slightly afraid. As love usually is.', 'To love anything is to place a small bet against time.'],
    hope: ['Hope, in the key of a very small light.', 'A stubborn little ember in a song.', 'It believes in tomorrow with its eyes open.', 'A song for the patient.'],
    routine: ['For the days that all look the same, and the small changes inside them.', 'We repeat, we return, we try again. This song knows.', 'The groove is a lot like the grind, only with better taste.', 'To keep going is, in itself, a kind of art.'],
    absurd: ['The absurd, politely stated, and warmly met.', 'A song for the part of the universe that has a sense of humor.', 'Nothing makes sense, and yet the chorus is catchy.', 'A philosophical shrug, with strings.'],
    faith: ['A song that leans toward the sky, in doubt and in trust.', 'Whatever the name, there is something here that prays.', 'Belief, in its quiet and wobbly form.', 'The word amen, without any of the usual furniture.'],
    desire: ['The itch to want, turned into melody.', 'A song about reaching, again, for something just past the fingertips.', 'Desire does not need an excuse. But it does appreciate a good tune.', 'We are made of wanting. This song shows it plainly.'],
    peace: ['A soft landing of a song.', 'This one is a cup of tea, with a melody.', 'A kind of quiet that has a sound.', 'Peace, in three minutes, with no assembly required.'],
  };
  Object.keys(more).forEach(k => { R.themeLine[k] = (R.themeLine[k] || []).concat(more[k]); });

  R.moodLines = R.moodLines.concat([
    'This one is best heard after midnight, but it works at any hour.', 'If you have been holding your breath, you may let it go now.', 'The sort of song that makes you notice the furniture in the room.', 'A song with its own weather.',
    'It sounds like staring out of a train window, in the rain.', 'It feels like a lamp in an empty kitchen.', 'Not sad, exactly. Quiet. There is a difference.', 'Some melodies are doors. This one is a window.',
    'If you like, close your eyes. If you prefer, look out of the window. Either way, listen.', 'A song for the hour between wanting to sleep and not wanting to stop.', 'It will not fix anything, and it will not need to.', 'The voice in it sounds as if it were also awake.',
    'An honest song, in a dishonest world.', 'A slow tide of a track.', 'This is what comfort sounds like, when it is being honest.', 'Listen to how the song breathes between the lines.',
    'It is a very good companion for being a little bit lost.', 'A melody to carry quietly in your pocket.',
  ]);
  R.idents = R.idents.concat([
    'It is {time}. This is {station}. The night is a long corridor, and we have left a few lamps on.', '{station}, at {time}. A quiet voice, a few songs, and the stars outside, doing their best.',
    'You are listening to {station}. It is {time}, and somewhere a kettle is boiling for someone who needed a pause.', '{time} on {station}. If you can hear this, you are still here, and that is already a good start.',
    'This is {host}, at {time}, on {station}. A small blue planet, a small radio, a small light.', 'It is {time}. Stay with us, and let the world be a little less loud.',
    '{station}. {time}. This hour is yours.', 'Time check: {time}. Existential status: manageable, thanks to music.', 'Out in the dark, it is {time}. In here, there is a song coming.',
    'You are tuned to {station}. The hour is {time}. The mood: reflective, with a chance of tea.', 'This is {station}. We have no commercials worth mentioning, and a lot of time for you. It is {time}.',
    'The hour is {time}, and you are not alone with it. {station}, on the air.', 'You have found {station} at {time}. That is either luck or insomnia. Welcome, either way.',
    'A few words at {time}. You are doing fine. This is {station}.',
  ]);
  R.checkins = R.checkins.concat([
    'A tiny reminder from me to you: unclench your hands. Let your forehead soften. There. That is a better evening already.', 'When did you last laugh? Think of the funniest thing you remember. Let it replay for a moment. The mind believes what it replays.',
    'Is there a window nearby? Look out of it for thirty seconds. Notice one thing you have not noticed before.', 'Quick question: what is one small thing you can do tomorrow that your future self will thank you for? Say it out loud. I will not tell anyone.',
    'Maybe drink a glass of water now. Slowly. It is a surprisingly good little ritual for the end of a long day.', 'Check-in. If you are carrying a worry, imagine setting it down on a table next to you. It will be there tomorrow, if you want it. You may not.',
    'A gentle note: you do not have to be productive to be worthy of rest. Stay as long as you like.', 'Take a moment to notice how you are sitting. Adjust it, even slightly. The body likes being asked.',
  ]);
  R.adBridges = R.adBridges.concat(['A word from our sponsors, and then we return to your regularly scheduled contemplation.', 'Now, a commercial, and a short break from sincerity.', 'Before the next song, a message from some very hopeful people.', 'Brief interruption, courtesy of commerce.', 'And now, for something completely beside the point.', 'The following is a paid announcement, and a small joke.']);
  R.talkBridges = R.talkBridges.concat(['We have time, so let us take a long breath, and talk about: {title}.', 'Tonight, for the long hour, I have been mulling over: {title}.', 'Let me spend a few minutes now on an idea. The title: {title}.', 'This is the long hour. Slow down, with me, for: {title}.', 'There is a thought I would like to share. It is called: {title}.', 'And now, a longer conversation, with you, about: {title}.']);
  R.letterBridges = R.letterBridges.concat(['A little note from the studio.', 'Here is a small letter, to hold in your pocket.', 'A page from the notebook.', 'Something gentle, before the next song.', 'A thought, at no extra charge.', 'And a note, from me to you.']);
  R.welcomes.night = R.welcomes.night.concat(['Welcome to the small hours. I am {host}, this is {station}, and it is {time}. Whoever you are, wherever you are, there is a seat for you here.', 'It is {time}, which makes you a member of a very special club: the awake. This is {station}, and I am {host}.']);
  R.welcomes.morning = R.welcomes.morning.concat(['A very good morning. I am {host}, and you are on {station}. It is {time}. Let the day arrive slowly, and let us help.', 'Good morning, and welcome. It is {time}. This is {station}, with {host}, and a few songs for the early hours of the day.']);
  R.welcomes.afternoon = R.welcomes.afternoon.concat(['A calm afternoon to you. This is {station}, with {host}. It is {time}. Let us stretch the day a little, and give it some music.', 'Good afternoon. {time} on {station}. I am {host}. Come, sit, and let us wander through a few songs together.']);
  R.welcomes.evening = R.welcomes.evening.concat(['A soft evening to you. This is {station}, I am {host}, and it is {time}. The lights are low, and the songs are waiting.', 'Good evening, and welcome. {time} on {station}. The day has done its work. Now, let us do something a little gentler.']);
  R.introTemplates = R.introTemplates.concat(['I have been looking forward to this one. {a}, with {t}.', 'Let me share {t} with you. It is by {a}.', 'We are about to hear {a}, and a song called {t}.', 'The next song needs no explanation, only attention. {t}, by {a}.', 'Here is another from {a}. It is called {t}.', 'Let us follow that with {t}, by {a}.', 'And now, something from {a}: {t}.', 'I think you will like this. {t}, by {a}.']);
  R.backTemplates = R.backTemplates.concat(['{a}, with {t}. Beautiful.', 'That was {t}. {a}, in case you were wondering.', 'You have been listening to {a}, and the song {t}.', '{t}, by {a}. Take a breath after that one.', 'That was {a}, with {t}. Let us linger a second.', 'And that was {t}, from {a}. Some songs deserve a quiet moment after.', '{a} again, with {t}. A good companion for the hour.', 'That was {t}. I always notice how the room changes afterward.']);
})();
