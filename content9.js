// Podcast episode lines for the regular (every 40th song) slot, at any hour. The midnight ones are in content5.js.
(function () {
  const R = window.RADIO;
  R.podcastIntrosDay = [
    'We have been listening to songs for a while, so let us change the texture. I found a long conversation for you, on the subject of {topic}. It is called {t}, from {a}, and runs about {min} minutes. The songs will return when it ends.',
    'This is a good moment for a talk. Today\'s episode is about {topic}: {t}, from {a}. About {min} minutes. Get comfortable.',
    'It is {time}, and the music steps back for a little while. I would like you to hear a voice. The subject is {topic}, and the episode is called {t}, from {a}. It lasts around {min} minutes.',
    'Time for a podcast. Not mine, but one I think you will like. {t}, from {a}, on {topic}. It is about {min} minutes long. I will be here when it is over.',
    'Let us hand the microphone to someone else for a bit. The topic: {topic}. The episode: {t}, from {a}. {min} minutes, give or take.',
    'A change of pace on {station}. I have a conversation about {topic} for you, called {t}, from {a}. It runs about {min} minutes. Settle in.',
    'The songs will wait. For the next stretch, here is an episode from {a}, on {topic}. The title is {t}. It is around {min} minutes.',
    'We have come to the part of the program where we listen to a longer thought. This one is about {topic}. {t}, from {a}. {min} minutes.',
    'Let us borrow some wisdom. Today\'s episode is on {topic}, from {a}, called {t}. About {min} minutes. Listen closely, or let it float by.',
    'Here is a little detour, in the form of a podcast. The subject is {topic}, and the episode is {t}, from {a}. It takes about {min} minutes. See you after.',
  ];
  R.podcastOutrosDay = [
    'That was the episode, from {a}. I hope something in it was worth keeping. Back to the music now.',
    'And that is the end of the talk. {t}, from {a}. Let us return to the songs.',
    'Thank you, {a}, for the company. And now, a song.',
    'The voices have faded. That was {t}. Let me find you something gentle to follow it.',
    'That was a good conversation. Now, back to the music.',
    'The episode is over, but the thought can stay. That was {a}, with {t}. And now, the next song.',
    'We are back. That was {t}, from {a}. The songs resume.',
    'That was a long listen, and a good one. Back to the music.',
    'And that concludes the episode from {a}. Let us go back to where we were, with a song.',
    'A good talk deserves a moment of quiet. Take it. Then, music.',
  ];
})();
