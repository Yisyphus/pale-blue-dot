// Pools of short connective lines. The radio picks from these without repeating until each pool is used up.
// Placeholders: {host} {station} {time} {a} (artist) {t} (title) {title} (talk title)
(function () {
  const R = window.RADIO;

  R.welcomes = {
    night: [
      'Good night, and welcome. I am {host}, and this is {station}. It is {time}. The world is asleep, or pretending to be, and we are awake together. Settle in.',
      'Hello, night owl. You are listening to {station}, and I am {host}. It is {time}, the hour when thoughts are louder and honesty is cheaper. Let us keep each other company.',
      'It is {time}, and the lamp is on. This is {station}, and I am {host}. No rush tonight. Pour something warm, and let the dark do what it does.',
      'Good night. {station} is on the air, and I am {host}. If you are here at {time}, you are probably carrying something. Put it down for a while. The music will hold it.',
    ],
    morning: [
      'Good morning. I am {host}, and this is {station}. It is {time}. Before the day starts asking things of you, here is a little space to think.',
      'Morning has arrived, whether we like it or not. This is {station}, I am {host}, and it is {time}. Let us ease into it with some honest music.',
      'Good morning, and welcome to {station}. I am {host}. It is {time}. The universe is still indifferent, but the coffee is not. Let us begin.',
      'Hello, and good morning. {host} here, at {time}, on {station}. A new day, which is a strange gift, and an even stranger responsibility. Let us listen our way into it.',
    ],
    afternoon: [
      'Good afternoon. This is {station}, and I am {host}. It is {time}, the long middle of the day, when the sun leans and the mind wanders. Wander with me.',
      'It is {time}, and you are listening to {station}. I am {host}. The afternoon is a quiet philosopher. Let us ask it a few questions.',
      'Good afternoon, and welcome. {host} here. {station}, at {time}. Take a breath, drop your shoulders, and let some songs do the thinking for a while.',
      'Hello, afternoon listener. I am {host}, and this is {station}. It is {time}. If your day feels like a loop, you are in the right place. We specialize in loops.',
    ],
    evening: [
      'Good evening. I am {host}, and you are listening to {station}, the station at the edge of the night. It is {time}. Settle in. There is no hurry here.',
      'Good evening, and welcome. This is {station}. I am {host}. It is {time}, and the light is going soft. A good hour to ask big questions in a small voice.',
      'The evening is here, and so are we. I am {host}, this is {station}, and it is {time}. Let the day finish without you. We will take it from here.',
      'Good evening. {host} on {station}, at {time}. Whatever the day was, it is done now, and that is a mercy. Let us spend the evening gently.',
    ],
  };

  R.introTemplates = [
    'Up next, {t}, by {a}.', 'Here is {a}, with {t}.', 'This one is {t}, from {a}.', 'Let us listen to {a}. The song is {t}.', 'Next, a track I like very much: {t}, by {a}.',
    'Coming up: {a}, and a song called {t}.', 'I would like to play you something. {t}, by {a}.', 'Now, {a}, with {t}.', 'Here comes {t}, from {a}.', 'The next song is {t}, by {a}.',
    'Let me put this on for you: {t}, by {a}.', 'Staying with us, {a}, and {t}.', 'Close your eyes for this one. {a}, with {t}.', 'Time for {t}, by {a}.', 'A song for the next few minutes: {t}, from {a}.',
  ];
  R.backTemplates = [
    'That was {a}, with {t}.', 'You just heard {t}, by {a}.', '{a}, and {t}. Still ringing in the room.', 'That was {t}, from {a}.', 'That was {t}, by {a}. Let it settle for a second.',
    'We just heard {a}, with {t}.', '{t}, by {a}. I will give it a moment of silence in my head.', 'That, my friend, was {a}, and {t}.', 'That was {a}. The song: {t}.', 'You were listening to {a}, playing {t}.',
    'And that was {t}. {a}, in case you want to find more.', '{a}, with {t}. Some songs end, and the room stays different.',
  ];
  R.newSongTemplates = [
    'This next one is a song you suggested to me. {t}, by {a}. Good taste, by the way.', 'From your own list: {a}, with {t}. I am glad it is here.', 'You asked for this one, and I listened. {t}, by {a}.',
    'This is one of yours: {a}, and {t}. It fits the room perfectly.', 'A song from your own collection now. {a}, with {t}. Thank you for sharing it.', 'You put this on the shelf, so here it is: {t}, by {a}.',
  ];

  // generic mood lines, used for songs without a hand-written script
  R.moodLines = [
    'Turn it up a little, or turn the lights down. Either works.', 'It is the kind of song that makes the room feel bigger and the clock feel smaller.', 'You do not have to understand it. Just let it be near you.',
    'Some songs are answers. This one is a better question.', 'There is a loneliness in it that somehow feels like company.', 'Listen for the part where the song stops explaining and just feels.',
    'A good song for looking out of a window and not rushing anywhere.', 'It sounds like a memory you are not sure belongs to you.', 'This is music for the space between two thoughts.',
    'Let the melody carry the heavy part, so you do not have to.', 'It will not fix anything, but it will sit with you while you wonder.', 'The best songs do not tell you how to feel. They make room for what you already do.',
    'There is something honest in the way it is made, and honesty is rare enough to deserve a few minutes.', 'Somewhere in the middle of this one, you may notice you have stopped worrying. That is the song working.',
    'It is not trying to impress anyone. That is exactly why it works.', 'A gentle one, with a little shadow inside it.', 'I find that songs like this are best heard without a phone in your hand.',
    'This is what it sounds like when someone tells the truth quietly.', 'It belongs to the hour. Whatever hour you are in.', 'If you are tired, this one will understand.',
    'The sound is small, and the feeling is not.', 'You may feel a little sad. That is fine. Sadness is just love with nowhere to go.', 'A song to be alone with, in the good way.', 'It carries a kind of tender dread. Which, by now, you know is our house style.',
  ];

  // extra theme lines
  const more = {
    time: ['Time does not heal, exactly. It just changes the furniture.', 'A song about how the clock keeps its promises and we keep breaking ours.', 'Every song is a small experiment in how long three minutes can feel.', 'This one is about the moment you notice the years have been moving without you.', 'The past is always closer in a song than in a calendar.', 'We spend time like it is free. It is the only currency we cannot print.'],
    death: ['A song that treats the ending as part of the story, not a plot twist.', 'It is hard to love anything fully without knowing it is temporary.', 'Every good song about death is secretly about being alive.', 'The old philosophers said to rehearse the ending. This is a gentle rehearsal.', 'It does not flinch, and neither should we, for three minutes.', 'We carry our endings quietly, like an unopened letter. This song reads it aloud.'],
    alienation: ['A song for the part of you that never quite fits the picture.', 'Being the odd one out is a lonely sport, but a very honest one.', 'There is a company in feeling alone, which is a funny thing to say on the radio.', 'For anyone who has smiled in a room and felt like a visitor.', 'The outsider sees the whole furniture of the world. That is both the gift and the weight.', 'Some rooms are crowded and still feel like empty chairs. This song knows those rooms.'],
    'letting-go': ['Letting go is not losing. It is only changing what your hands are for.', 'A song about opening your fingers, one by one.', 'Not everything has to be held. Some things only have to be passed through.', 'The river does not argue with the shore. Try being a river for a while.', 'To surrender is not to quit. It is to stop fighting the weather.', 'This one dissolves the edges, softly, like sugar in tea.'],
    love: ['Love is rarely loud. More often it is a small, repeated act of attention.', 'A song about tenderness, and the fear that comes with it.', 'People say love is a feeling, but the good songs know it is a practice.', 'We love in spite of the ending, and maybe because of it.', 'A reminder that being tender is not the same as being weak.', 'Love is the oldest answer to a question that does not have words.'],
    hope: ['Hope is not optimism. It is the decision to keep a window open.', 'A song that believes in morning without being naive about the night.', 'Small light is still light.', 'The hopeful ones are not the ones who ignore the dark. They are the ones who light a match in it.', 'Hope is a kind of stubbornness with good manners.', 'It says that something might change, and that you might be there to see it.'],
    routine: ['Routine is where most of life actually happens. Do not despise it too quickly.', 'We are all, in some way, pushing a rock uphill. A good soundtrack helps.', 'The days blur, but the songs stay sharp. That is their job.', 'A little loop, a little groove, a little way of staying sane.', 'Repetition can be a prison or a prayer. It depends on how you listen.', 'The commute, the queue, the same cup. And somewhere in it, a song.'],
    absurd: ['Camus said to imagine Sisyphus happy. This song is a little help with that.', 'The universe made no promises. Neither does this song. That is why it is trustworthy.', 'There is a strange joy in admitting that nothing makes sense and carrying on anyway.', 'The absurd is not a problem to solve. It is a room to furnish.', 'A song that shrugs at the cosmos and puts the kettle on.', 'When the questions have no answers, the music keeps asking more beautifully.'],
    faith: ['Whether or not you believe, there is a kind of prayer in listening closely.', 'Doubt and faith are not enemies. They are old roommates.', 'A song about reaching toward something you cannot name.', 'Even the silence between songs can feel like a small cathedral.', 'Belief is a verb. It is something you do on certain nights.', 'It asks a question upward and listens, with patience, for a reply.'],
    desire: ['Wanting is the engine. The trick is choosing where it drives you.', 'A song about the itch under everything, and what it is really asking for.', 'We chase, we get, we chase again. A little music makes the loop kinder.', 'Desire is a compass that does not always point somewhere good, but it always points somewhere.', 'What we want tells us who we are, if we are brave enough to listen.', 'The thing you crave is rarely the thing you need, but it is a clue.'],
    peace: ['Peace is not an absence. It is a presence you have to invite.', 'A song for putting your shoulders down, one inch at a time.', 'If you can hear your own breathing, you are already halfway there.', 'Calm is a muscle. This is a small workout.', 'Not every song has to be about something. Some are just a warm room.', 'For the next few minutes, nothing is required of you. That is rare. Enjoy it.'],
  };
  Object.keys(more).forEach(k => { R.themeLine[k] = (R.themeLine[k] || []).concat(more[k]); });

  R.idents = [
    'You are listening to {station}, the station at the edge of the night. It is {time}.', 'It is {time} on {station}. If you are awake, so are we.', 'This is {host}, with you at {time}. {station}, where the lamp stays on.',
    '{station}. {time}. Somewhere out there, someone else is awake and listening to the same song.', '{time} on {station}. You have no meetings tonight, only thoughts. Let us keep them company.',
    'It is {time}, and you are tuned to {station}. No news, no traffic, no weather. Only the long weather of the soul.', '{station}, at {time}. Music for people who think too much, and feel just enough.',
    'A little reminder at {time}: you are not behind, you are not late, and you are not alone. This is {station}.', 'This is {station}. The time is {time}, give or take an existential crisis.',
    'Station identification: you are on a small blue planet, listening to {station}. The clock says {time}.', 'It is {time}. {station} is on the air, and I am {host}, speaking quietly into the dark.',
    '{time} and all is, well, as it always is. This is {station}.', 'You are tuned to {station}, a station that plays songs, asks questions, and never promises answers. It is {time}.',
    'It is {time}. If this is the only voice you hear tonight, I hope it is a kind one. {station}.', 'The clock reads {time}, and the stars do not care, which is oddly comforting. {station}.',
    '{host}, {station}, {time}. Three facts. The rest we are working out together.', 'Tuned in at {time}? Good. {station} was hoping you would find us.', 'Somewhere between yesterday and tomorrow, at {time}, this is {station}.',
    'You are listening to {station}. It is {time}, and there is still time for one more good song.', 'At {time}, in the quiet part of the dial, this is {station}. Stay as long as you like.',
  ];
  R.checkins = [
    'A small check-in, from me to you. Have you had water? Have you eaten something today? Is there someone you could text, even with a single emoji? Do one of those, and then come back. The music will wait.',
    'Quick pause. Drop your shoulders. Unclench your jaw. Breathe out slowly. You are doing better than your thoughts say you are.',
    'A gentle question: when did you last stand up? Do it now. Stretch your arms, roll your neck, look out of a window. I will wait right here.',
    'Check-in time. Notice your feet on the floor. Notice the chair holding you. You are being held by quite a lot of things, if you pay attention.',
    'If your mind is racing, try this. Name five things you can see, four you can hear, three you can touch. It works better than it sounds like it should.',
    'A friendly reminder that it is allowed to rest. You are not a machine, and even machines are given nights off.',
    'Pause with me for a moment. Whatever you were worrying about, it will still be there in five minutes. But for those five minutes, you are free of it.',
    'Check-in. Have you been kind to yourself today? Not perfect, not productive, just kind. If the answer is no, you still have time.',
    'Here is a small thing to try tonight: say one honest sentence out loud, to nobody. Something like, I am tired, or I am trying. It lands differently when it is heard.',
    'A breath, slowly in, slowly out, and another. There. You just did the most important thing anyone does all day.',
  ];

  R.adBridges = [
    'We will be right back, after this short message from our sponsors.', 'A quick word from the people who keep the lamp lit.', 'And now, a brief interruption from commerce.',
    'Stay with us. First, a message.', 'Please hold your existential dread for just a moment. This is a commercial.', 'Time for a little advertising, the most honest kind of fiction.',
    'And now, a short word from our sponsors, who very much hope you are listening.', 'We interrupt your thinking for a brief message.', 'Hold that thought. Here is something to buy, or at least smile at.', 'A message from the world of goods and services.',
  ];
  R.talkBridges = [
    'And now, the long hour. Tonight, a topic we have been circling: {title}.', 'It is time for a longer thought. Today, I want to talk about this: {title}.', 'Dim the lights a little. This is the long hour, and the question tonight is: {title}.',
    'I want to take a few minutes now, slowly, to talk about something that matters. The title is: {title}.', 'Let us slow down. For the long hour, I have been thinking about: {title}.',
    'Make yourself comfortable. Tonight on the long hour: {title}.', 'This is the part of the night where we sit with one idea. Today it is: {title}.', 'The long hour begins now. Our subject: {title}.',
    'Put the phone down, if you can. This is the long hour, and we are talking about: {title}.', 'Let me tell you something I have been turning over for a while. The subject: {title}.',
  ];
  R.letterBridges = [
    'A letter to the absurd, and to you.', 'Here is a note for the road.', 'A small piece of advice, from one traveler to another.', 'Something I wanted to tell you.', 'Letters to the Absurd. Today\'s page:',
    'This one is a gentle reminder.', 'A short letter for tonight.', 'Here is a thought to carry in your pocket.', 'Let me read you a small note.', 'If you need a nudge, here it is.',
  ];
})();
