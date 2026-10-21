// Long talks, letters, and extra genre notes.
(function () {
  const R = window.RADIO;

  // The original twelve talks started with a greeting line; the host now opens with a varied bridge, so drop it.
  R.talks.forEach(t => { if (!t.trimmed) { t.p = t.p.slice(1); t.trimmed = true; } });

  R.talks.push(
    { id: 'paleblue', title: 'The pale blue dot', tags: ['absurd', 'alienation', 'hope', 'time'], p: [
      'In February of 1990, the Voyager 1 spacecraft, already billions of kilometers from home, was turned around to take one last picture of the planet it had left behind. In the photograph, the Earth is a single pale pixel, hanging in a beam of scattered sunlight.',
      'Everyone you have ever loved lives on that pixel. Every war, every poem, every Tuesday, every argument you lost sleep over. All of it, on a speck of dust, in a sunbeam.',
      'The astronomer Carl Sagan looked at that image and wrote about humility. About how our posturing, our imagined self-importance, our certainty that we occupy some privileged position, is challenged by that point of pale light.',
      'You might expect that to feel crushing. And on some nights, it is. But there is another way to hold it. If we are this small, and this alone, then the only thing that can possibly matter is how kind we are to one another, here, in the little time we have.',
      'So tonight, when your problems feel enormous, step back until the Earth is a dot. Look at your worry from there. Some will shrink. Some will not. But those will be the ones worth your care.',
    ] },
    { id: 'nostalgia', title: 'Nostalgia, the sweet ache', tags: ['time', 'love', 'alienation'], p: [
      'The word nostalgia was coined in the seventeenth century by a Swiss medical student, to describe the homesickness of soldiers. It combined the Greek for return, and the Greek for pain. A sickness, then. A pain for a return that cannot happen.',
      'We still feel it. A song from a summer long ago, a smell from a grandparent\'s kitchen, and suddenly the present dissolves. It is exquisite, and it hurts.',
      'The trouble with nostalgia is that it edits. It keeps the golden light and forgets the exams, the arguments, the worries that were enormous at the time. The past you miss never fully existed.',
      'But the feeling is not a lie. It tells you what you valued. When you ache for a place or a person, you are learning what matters to you.',
      'So let nostalgia be a compass, not a cage. Ask what the ache is pointing toward, and see if a little of it can be built into this week. A phone call. A recipe. A walk down an old street. The past is gone, but its ingredients are still on the shelf.',
    ] },
    { id: 'comparison', title: 'Comparison, the thief of peace', tags: ['desire', 'peace', 'alienation'], p: [
      'Theodore Roosevelt is often credited with saying that comparison is the thief of joy. Whoever said it was right, and our age has given the thief a very bright screen.',
      'Every day, we are shown the polished edges of thousands of lives, and compare them to our own backstage, the one we know intimately, with all its mess and doubt. It is not a fair fight. It is not even the same game.',
      'The ancient Stoics had a simple remedy: attend to what is in your power. Your effort, your choices, your response to the day. Another person\'s success is not subtracted from yours. The world is not a ladder with limited rungs.',
      'Try an experiment. For one day, compare yourself only to yourself last year. Are you a little kinder? A little more honest? A little more able to rest? That is the only race with a finish line that belongs to you.',
      'And when envy comes, which it will, treat it as information. It points at something you want. Thank it, and then make a small plan.',
    ] },
    { id: 'burnout', title: 'Burnout, and the myth of productivity', tags: ['routine', 'peace', 'desire'], p: [
      'We live in an age that treats exhaustion as a badge, and rest as a reward you must earn. It is a very strange religion, and it asks for a great deal of sacrifice.',
      'Burnout is not weakness. It is what happens when a human being is run like a machine, with no maintenance and no meaning. The mind, like a field, needs to lie fallow now and then.',
      'The philosopher Byung-Chul Han calls ours the achievement society, in which we exploit ourselves, and call it freedom. The overseer is internal. The whip is a to-do list.',
      'You do not need to quit everything. But you can ask a few quiet questions. What am I doing out of fear? What would still be fine if I did it badly, or not at all? What would I do tomorrow if I were not worried about being enough?',
      'Productivity is not the point of a life. A life is not a project plan. Take the afternoon off, from guilt as well as work, and see whether the world has noticed.',
    ] },
    { id: 'grief', title: 'Grief, love with nowhere to go', tags: ['death', 'love', 'time'], p: [
      'Grief is what love becomes when the person is gone. All that tenderness, all those habits, the thousand small gestures, and nowhere to put them.',
      'We are told to move on, as though grief were a place you can leave. But those who have walked it say it is less like a road and more like weather. Some days it is calm. Some days a song, or a smell, brings the storm back, without warning.',
      'There is nothing to fix. The ancient practices of mourning, the rituals, the black clothes, the forty days, were not about solving a problem. They were ways of giving grief a shape, and a witness.',
      'If you are carrying someone tonight, say their name out loud. Tell a story about them to someone who will listen. Let the grief be a measure of the love, not a failure of recovery.',
      'And if you are not grieving, someone near you probably is. A message, a visit, a cup of tea, and no advice. That is all it takes to carry a small corner of the weight.',
    ] },
    { id: 'freewill', title: 'Free will, and the stories we tell', tags: ['absurd', 'faith'], p: [
      'Do you choose your thoughts, or do they arrive, like guests, and you simply open the door? Philosophers have argued about free will for thousands of years, and neuroscience has joined the argument with brain scans and uncomfortable timing experiments.',
      'Some say we are fully determined: a long chain of causes, running back to the beginning of time. Others say that some part of us stands outside the chain, and truly decides. And some say the question is badly asked.',
      'The existentialists took a practical stance. Sartre wrote that we are condemned to be free. Not because we have infinite options, but because even in a cage, we must choose how to stand.',
      'Whatever the metaphysics, you will go on deliberating, hesitating, deciding. That experience is real, and it shapes outcomes. It is the one tool you have.',
      'So perhaps the useful question is not whether you are free, but how to act as if your choices matter, with a modest heart. Because tomorrow, they will.',
    ] },
    { id: 'boredom', title: 'Boredom, the doorway', tags: ['routine', 'peace', 'desire'], p: [
      'When was the last time you were bored? Truly bored, with nothing in your hand and nothing in your ear? It is getting rare. We have invented a world that fills every silence.',
      'Kierkegaard thought boredom was the root of all evil. Schopenhauer said life swings between pain and boredom. But the psychologists have found something more hopeful: boredom is a signal, a message from the mind, saying that what you are doing has stopped mattering.',
      'And it is the soil of creativity. Many of the great ideas arrived on long walks, in waiting rooms, in the shower, when the mind was free to wander.',
      'So try, tonight, to be bored on purpose. No phone. Just a window, a chair, and a few minutes. At first it will itch. Then it will soften. And somewhere in there, an old thought you forgot will walk up and introduce itself.',
      'Boredom is not an emptiness to be filled. It is a doorway. Wait a little, and see what comes through.',
    ] },
    { id: 'courage', title: 'Courage in small amounts', tags: ['hope', 'absurd', 'peace'], p: [
      'We imagine courage as something grand: running into burning buildings, speaking truth to tyrants. And sometimes it is. But most of the time, courage is small, and quiet, and nobody sees it.',
      'It is calling the person you have been avoiding. It is saying I do not know. It is going to bed at a reasonable hour, when your whole mind wants to stay up and worry. It is asking for help.',
      'Aristotle thought courage was a balance, a mean between recklessness and cowardice. And you find that mean by practice, in small tests, like a muscle in the gym.',
      'So choose one small brave thing for tomorrow. Not the biggest, just the next. Write it down. When you have done it, notice how it feels, and how the world did not end.',
      'Courage is not the absence of fear. It is fear, walking with its head up, to the end of the street.',
    ] },
    { id: 'memory', title: 'Memory, and who you used to be', tags: ['time', 'alienation', 'love'], p: [
      'Think of yourself ten years ago. Do you recognize that person? Some of their opinions, you would now disown. Some of their fears seem silly, and others, strangely wise.',
      'The philosopher Derek Parfit wondered whether we are really the same person over a lifetime. Our cells change, our beliefs change, our memories fade and are rewritten each time we recall them. What stays?',
      'Perhaps what persists is less a thing and more a thread: a particular way of caring, a style of attention, a set of things you cannot help loving.',
      'It can be comforting. You are allowed to change. You are not bound by the promises of your younger self, nor condemned by their mistakes. You are a river, not a statue.',
      'And it can be generous. Be kind to the person you used to be. They did the best they could with what they knew. Someday, the person you are now will look back, and want the same grace.',
    ] },
    { id: 'silence', title: 'Silence', tags: ['peace', 'letting-go', 'faith'], p: [
      'Notice how rarely we hear silence. There is always a hum: a refrigerator, a traffic far away, a notification. The composer John Cage once sat in a perfectly soundproofed room, and still heard two sounds: his nervous system, and his blood.',
      'Many traditions prize silence. The monastic retreats, the Quaker meetings, the long Zen sits. Not because silence is empty, but because it is full of everything we usually drown out.',
      'In silence, the mind slowly stops performing. The inner commentator runs out of material, and for a moment you simply are, without a narration.',
      'You do not need a retreat. Five minutes will do. Turn off every sound you can, sit comfortably, and listen to what remains. It will be strange. It will be a little scary. It will also be rest.',
      'Silence is not the opposite of music. It is the canvas on which every good song is painted.',
    ] },
    { id: 'failure', title: 'Failure, honestly', tags: ['hope', 'absurd', 'desire'], p: [
      'Nobody tells you how often the people you admire have failed. Their résumés are polished, and their failures, if mentioned at all, are cleaned into amusing anecdotes.',
      'But failing is not a detour from a good life. It is a large part of it. Experiments fail. Relationships end. Plans collapse. If you are not failing at something, you are probably not attempting much.',
      'Samuel Beckett wrote a line that has become a motto for the stubborn: Ever tried. Ever failed. No matter. Try again. Fail again. Fail better. It is a hopeful sentence, in an odd, gloomy way.',
      'The sting of failure is real. Let it sting. Then ask what it taught you, and what is still within reach. The point is not to find a silver lining, but to decide what to do with the lead.',
      'You are not your worst result. You are the person who is still in the room, still thinking about what to do next. That is a better definition of success than most.',
    ] },
    { id: 'home', title: 'Home: where is it?', tags: ['alienation', 'love', 'time'], p: [
      'What is home? A place? A smell? A person? A language? Many of us feel that we are always slightly away from it, even when we are standing in the middle of our own city.',
      'The Portuguese word saudade tries to name a longing for something absent, perhaps something that never was. The Arabic word hanin speaks of a similar ache. These feelings are older than airplanes. People have always carried a homeland in their chest.',
      'For some, home is a fixed address. For others, it is more like a moving object: the people you can be yourself with, the corner where you feel unobserved, the song that makes your shoulders drop.',
      'If you feel unmoored, perhaps stop looking for home and start building it, in small pieces. A shelf of books. A weekly meal. A greeting you exchange with the neighbor. A place you return to, again and again, until it starts returning the favor.',
      'Home is not found. It is, slowly and quietly, made.',
    ] },
    { id: 'insomnia', title: 'Three in the morning', tags: ['peace', 'alienation', 'death'], p: [
      'The hour of three in the morning has a reputation. It is when worries swell and perspective shrinks. F. Scott Fitzgerald wrote that in a real dark night of the soul, it is always three o\'clock in the morning.',
      'There is a reason for this. At night, the brain is tired, its filters are down, and the day\'s unfinished business comes knocking. Everything feels urgent, and nothing is fixable.',
      'Here is a kind tip. Treat the three a.m. mind like a very anxious child. Do not argue with it. Say, I hear you. We will look at this in the morning, when we have light, and coffee, and friends.',
      'Write the worry on a piece of paper, so the brain can stop holding it. Breathe slowly, longer out than in. And remember that thoughts at this hour are not verdicts. They are weather.',
      'The morning will come. It always has, so far, and it is a decent record.',
    ] },
    { id: 'friendship', title: 'Friendship, the quiet miracle', tags: ['love', 'alienation', 'hope'], p: [
      'Aristotle devoted two entire chapters of his ethics to friendship, and called it among the most necessary things for life. Nobody, he said, would choose to live without friends, even if they had all other goods.',
      'He distinguished kinds. Friendships of use, of pleasure, and the rare third kind, friendships of virtue, in which two people wish each other well for the other\'s own sake.',
      'Modern life makes the third kind hard. We are busy, scattered, tired. Friendships thin out unless they are fed. And yet the research is clear: the strength of our relationships is one of the best predictors of a long, healthy life.',
      'You do not need a crowd. One person who will answer at midnight is enough. And if you do not have that, you can start by being that person for someone else.',
      'Send a message tonight, with no agenda. How are you really? Then wait, and listen. It is one of the smallest, strongest acts in the world.',
    ] },
    { id: 'beauty', title: 'Beauty, the small rebellion', tags: ['hope', 'peace', 'absurd'], p: [
      'In a world with so much suffering, is it frivolous to care about beauty? A song, a face, a window with morning in it? The Japanese tradition would say no. They have a phrase, mono no aware, a gentle sadness at the passing of things, which is exactly what makes them beautiful.',
      'Cherry blossoms matter because they fall. A song matters because it ends. Beauty and impermanence are not enemies. They are the same fact, seen from two sides.',
      'And beauty is a kind of argument. It says, without words, that there is something here worth attending to. In a world that asks us to be useful, a moment of beauty is a small rebellion.',
      'Make space for it. Walk by the water. Look at an old building properly. Put on the whole record, not just the single. Let a few unproductive minutes pass in the company of something lovely.',
      'It will not fix the world. But it might fix your afternoon, and that is where the world starts.',
    ] },
    { id: 'work', title: 'Work, and what it is for', tags: ['routine', 'desire', 'absurd'], p: [
      'Most of us will spend a third of our waking lives working. And so it is strange how seldom we ask what it is for.',
      'Marx called it alienation, when the worker becomes a stranger to what they make. Simone Weil thought attention was the core of good work, and that real labor teaches patience. Studs Terkel, collecting interviews, found that people want work to give them not only money, but meaning, daily.',
      'Not everyone has the luxury of a calling. For many, a job is a bridge, and a hard one. That is not a failure of character. It is a fact of the world.',
      'But even a job you did not choose can hold a few things you can: a standard of care, a small kindness, a craft you build alongside it. Meaning is sometimes brought to the work, not found in it.',
      'And outside of work, remember that you are more than your output. The rest of your life is not a lesser room. It might be the main one.',
    ] },
    { id: 'anger', title: 'Anger, the loud messenger', tags: ['desire', 'peace', 'absurd'], p: [
      'Anger has a bad reputation, but it is often the first honest feeling we have. It rises when a boundary has been crossed, when something unfair has happened, when something we love has been threatened.',
      'The Stoics warned against letting it drive the car. Seneca wrote a whole treatise on anger, calling it a brief madness. But even he did not say to deny it. He said to look at it, and delay.',
      'A practical approach: when anger rises, give it a breath, a walk, a night. Ask what it is protecting. Often it is grief, or fear, wearing a costume.',
      'Then use it. Anger can be a very precise fuel when you point it at something worth changing. A boundary stated calmly. A letter written, and not sent, and then rewritten. A decision made with a cool head and a hot heart.',
      'Be angry at what deserves it, and be gentle with yourself. The two can happen on the same evening.',
    ] },
  );

  R.letters.push(
    { title: 'Write it down', t: 'When your head is full, put the thoughts on paper. Not to solve them, only to see them. A worry on a page is smaller than a worry in the dark, because it has edges. Write for five minutes, and then close the notebook. It will hold things for you overnight.' },
    { title: 'Walk without a destination', t: 'If you can, tonight or tomorrow, go for a walk with no goal. No steps to count, no podcast. Just notice. A light in a window, a cat on a wall, a sound you usually ignore. The mind rearranges itself while the legs are moving. It is one of the oldest therapies.' },
    { title: 'Be a beginner', t: 'You do not have to be good at things. Learn something badly, on purpose. Draw a terrible cat. Play three chords. Cook a strange soup. There is a quiet freedom in being a beginner, and it reminds you that you are still growing, even on days you do not feel it.' },
    { title: 'Name what you feel', t: 'Researchers have found that simply naming a feeling lowers its volume. Not I am bad. Just: I feel anxious. Or: I feel lonely. The label does not fix it, but it gives you a rope, and something on the other end of the rope to pull against.' },
    { title: 'Sleep is philosophy', t: 'Most of the dark thoughts of the night look different after a long sleep. So before you decide the universe is meaningless, make sure you have eaten, slept, and had some daylight. Existential problems are real, but a good sleep is a surprisingly powerful argument.' },
    { title: 'Your small duty', t: 'You do not have to save the world. But you might look after one corner of it: a plant, a neighbor, a younger cousin, a stray cat. Responsibility, in a small dose, is a wonderful antidote to feeling that nothing matters.' },
    { title: 'Compare gently', t: 'If you feel behind, here is a gentle rule. Compare yourself only to the person you were, not to the highlight reels of others. A single honest step forward is worth more than ten imagined races you have already lost.' },
    { title: 'Make a tiny promise', t: 'Make yourself a promise so small you cannot break it. Drink a glass of water each morning. Read one page. Stretch for one minute. The point is not the task. It is the practice of keeping your word to yourself, which is the foundation of everything.' },
    { title: 'Let the day be enough', t: 'At the end of the day, try to say, that was enough. Not perfect, not impressive, just enough. It is an astonishing sentence, and the mind resists it, and the practice of saying it slowly rewires how rest feels.' },
    { title: 'Ask for help early', t: 'Many people wait until the rope is almost gone before they ask for help. It is easier, and braver, to ask while there is still plenty. A friend, a doctor, a counselor, a helpline. Asking does not mean you failed. It means you are using all the tools available.' },
    { title: 'Disconnect, briefly', t: 'Switch your phone off for one hour tonight. See what comes up in the silence. At first you may feel an itch, then a loosening. The world will wait. Almost everything does. And you might hear your own thoughts, which, you may notice, have been trying to reach you for days.' },
    { title: 'You are allowed to enjoy things', t: 'It is not frivolous to enjoy a song, a meal, a sunset, while the world is complicated. Joy is not a betrayal of seriousness. It is the fuel that keeps people going long enough to be useful. Take the small pleasures without apology.' },
    { title: 'Forgive yourself in installments', t: 'Self-forgiveness rarely arrives in one grand moment. It comes in small installments: a pause before the inner critic speaks, a kinder word, a day you do not replay your mistakes. Make one small payment tonight.' },
    { title: 'Clean one thing', t: 'When everything feels chaotic, tidy one small surface. A desk, a shelf, a corner of the kitchen. It sounds trivial, and it is. But a clear spot in the outer world gives the inner one a place to rest.' },
    { title: 'Talk to someone older', t: 'Find someone older than you, a grandparent, a neighbor, a teacher, and ask what they were afraid of at your age. You will find that the fears were similar, and that most of them dissolved. It is a surprisingly effective kind of perspective.' },
    { title: 'Practice enough', t: 'Our culture sells more. More achievement, more comfort, more everything. Try, for a day, to ask: what would be enough? Enough food, enough work, enough news. Finding your enough is a quiet way of becoming rich.' },
    { title: 'Be curious about others', t: 'When you feel lonely, ask someone a real question, and listen to the whole answer. Curiosity about another person is the shortest bridge between two islands. And the person on the other side is, more often than not, lonely too.' },
    { title: 'Hold the paradox', t: 'You can believe that life is absurd, and still love it. You can know that nothing is permanent, and still build. The adult mind can hold two opposite truths at once, and the ability to do so is called wisdom, or perhaps just survival.' },
    { title: 'Dress for the day you want', t: 'It is oddly powerful to look after how you appear when you feel low. Wash your face, put on a clean shirt, open the curtains. It is not vanity. It is a signal to yourself that you are worth the effort, even today.' },
    { title: 'Your body is not an enemy', t: 'The mind is a hard place to live in when the body is neglected. Move a little, stretch, breathe. Eat something warm. The body is your oldest friend, and it has been quietly carrying you through every difficult hour.' },
  );

  R.genreMore = {
    prog: [
      'Progressive rock took seriously the idea that popular music could be as ambitious as a symphony or a novel. Long songs, strange time signatures, and lyrics about time, death, and the cosmos. It is the genre of people who refuse to be brief about the big things.',
      'In prog, songs are not trying to fit a radio slot. They are trying to build a world. And inside that world, there is room for doubt, dread, and astonishment to unfold slowly. The length is the lesson.',
      'There is something very existential about a song that changes shape halfway through. It is how life behaves. Prog rock simply makes the surprise audible.',
    ],
    jazz: [
      'In jazz, a mistake is just an unexpected note waiting for a good response. That is a rather practical philosophy of life, as it happens.',
      'Jazz musicians talk about listening more than playing. Which is perhaps the best advice in any conversation, and in any existential crisis.',
      'The cool, late-night mood of jazz is the sound of someone who has seen a lot, and decided to be gentle anyway.',
    ],
    psych: [
      'Psychedelic music tried to put the experience of a dissolving self into sound. Echoes, reverb, backwards guitars. It asks you to doubt the ground a little, in a safe way.',
      'The sixties psych movement asked big questions with loud colors: who am I, what is real, and what if the rules are optional? Many of the questions still wait for good answers.',
      'Psychedelia is a reminder that your ordinary view of the world is only one of many, and not necessarily the most interesting.',
    ],
    'neo-psych': [
      'Neo-psychedelia took the dissolving sounds of the sixties and gave them a modern ache. Less utopian, more melancholic. The doors of perception are open, and it is awfully quiet in here.',
      'Modern psychedelic pop often hides heavy feelings inside shimmering sound. It is like finding a very sad poem inside a very pretty bottle.',
      'There is a loneliness in neo-psych that feels distinctly contemporary: connected to everything, and strangely alone in a bedroom with a synthesizer.',
    ],
    'anti-pop': [
      'Anti-pop is what happens when a clever mind enters the world of catchy hooks and decides to smuggle a few doubts inside. You hum the tune before you notice what you are singing.',
      'The oldest trick in the book: the sweeter the melody, the easier the truth goes down. Anti-pop is full of that sugar and that medicine.',
      'It dances on the edge of irony, and sometimes falls into sincerity, which is the best kind of accident.',
    ],
    folk: [
      'Folk music is testimony. A voice, a guitar, a few plain words about work, death, and love. It does not argue. It witnesses.',
      'Folk is philosophy for people who do not have time for philosophy. It is passed on hand to hand, and the wisdom is usually in the repetition.',
      'There is something comforting in folk music: the sense that others, long ago, felt exactly what you feel, and wrote it down in a tune.',
    ],
    soul: [
      'Soul is the sound of someone refusing to be silenced by their own pain. The voice cracks, and the crack becomes part of the melody.',
      'The tradition of soul comes from gospel, from churches, from kitchens. It carries the weight of survival, and the stubborn light of hope.',
      'Soul music teaches that you can be broken and magnificent at the same time.',
    ],
    chanson: [
      'The French chanson tradition treats a song like a short story. Time, regret, love, the ones who left. It never pretended life was simple, only that it could be said beautifully.',
      'In chanson, words matter as much as melody. The singer is a narrator, a witness, an old friend at the end of the bar.',
      'It is the genre of the elegant shrug, and the tender goodbye.',
    ],
    vapor: [
      'Vaporwave takes the leftover sounds of the eighties and nineties, the elevator music, the commercials, the corporate synths, and stretches them until they become dreamlike. It is nostalgia for a mall that does not exist.',
      'It is one of the first genres born entirely on the internet, and it speaks about consumerism and memory in a language of slowed-down glitter.',
      'There is a quiet critique in it. The shiny promises of capitalism, echoing, softened, and a little haunted.',
    ],
    'lo-fi': [
      'Lo-fi is the sound of a bedroom, a cheap microphone, and a person who needed to say something. Imperfections are part of the message. The hiss is the proof of a human being.',
      'Sometimes the most honest music is the least polished. When the production disappears, only the feeling remains.',
      'Lo-fi says: you do not need permission, or equipment, to make something true.',
    ],
    ambient: [
      'Ambient music was invented, in a way, by Brian Eno, who wanted music that was as ignorable as it was interesting. It does not demand your attention. It simply makes the room more spacious.',
      'In ambient, nothing is urgent. And in an age of urgency, that is a quiet kind of radicalism.',
      'It is music for breathing. It slows the pulse and gives the day a soft edge.',
    ],
    indie: [
      'Indie rock is where a lot of modern existential feeling lives: small rooms, big questions, and a guitar that is a little out of tune on purpose.',
      'It is often the music of people who are honest in public while pretending to be shy. The lyrics are the diary, and the chorus is the confession.',
      'Indie songs often sound like talking to yourself, and finding out that a lot of people were listening.',
    ],
    hiphop: [
      'Hip hop is a genre built on speaking from the edge: naming what is unfair, turning a hard day into a verse. It is testimony, set to a beat.',
      'At its most introspective, hip hop is a diary read over drums. It is the sound of someone thinking out loud in the neighborhood they were given.',
      'Rappers have long done what philosophers do: take a world that makes no sense, and try to describe it precisely.',
    ],
    score: [
      'Film music works on you without asking permission. A single sustained note can tell you a character is doomed, a saxophone can make a rainy street feel lonely.',
      'Scores are the sound of what a character feels and cannot say. They are existential by nature: all subtext, no explanation.',
      'The best film music does not need the film. It carries its own small world inside it.',
    ],
    glam: [
      'Glam rock took theatrical costume, and used it to ask serious questions about identity. Who are you, if you can be anyone? Is the mask the truth, or the face?',
      'Glam is the genre of the persona. And a persona, strangely, can be a very honest way of saying something you could not say plainly.',
      'It dressed up despair in sequins, and in the contrast, made both more visible.',
    ],
    'soft-rock': [
      'Soft rock gets laughed at, but its job is the same as any music: to make complicated feelings easy to carry. Sometimes the gentlest melodies are carrying the heaviest cargo.',
      'There is a kind of bravery in softness. In a world that praises loud, a calm voice is a quiet act of resistance.',
      'Soft rock is where many of us first learned how to be sentimental without being embarrassed.',
    ],
  };
})();
