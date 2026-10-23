// The "Reggae dub" group: spacey, reverb-drenched reggae dub (the Black Ark sound, King Tubby's echo, and the
// modern revival like Pachyman). Dub gets its own family, its own genre run, and no longer sits inside "Electronic".
// Every track below was taken from real YouTube results, with its exact video saved.
(function () {
  const R = window.RADIO;
  R.genreMap.dub = { name: 'reggae dub', family: 'dub', near: ['trip-hop', 'ambient'] };
  const lines = [
  "Pachyman|Destroy the Empire|dub|alienation,hope|dark|2|en",
  "Pachyman|All Night Long|dub|desire,peace|dreamy|2|en",
  "Pachyman|Sunset Sound|dub|time,peace|dreamy|2|en",
  "Pachyman|Dub Fellowship|dub|hope,peace|warm|2|en",
  "Pachyman|Sugar on My Tongue (Dub)|dub|desire,love|dreamy|2|en",
  "Pachyman|Strictly Vibes|dub|peace|calm|2|en",
  "Pachyman|Sensi|dub|peace,absurd|dreamy|2|en",
  "The Upsetters|Super Ape|dub|absurd,alienation|dark|2|en",
  "The Upsetters|Black Vest|dub|alienation|dark|2|en",
  "The Upsetters|Zion's Blood|dub|faith,hope|warm|2|en",
  "The Upsetters|Underground|dub|alienation,absurd|dark|2|en",
  "Lee \"Scratch\" Perry|Black Ark International|dub|faith,absurd|dreamy|2|en",
  "The Congos|Congoman|dub|faith,routine|warm|2|en",
  "The Congos|Open Up the Gate|dub|faith,hope|warm|2|en",
  "King Tubby|King Tubby's Special|dub|peace|calm|2|en",
  "King Tubby|Mystical Dub|dub|faith,peace|dreamy|2|en",
  "Scientist|Dance of the Vampires|dub|death,absurd|dark|3|en",
  "Scientist|Your Teeth in My Neck|dub|death,absurd|dark|3|en",
  "Scientist|The Voodoo Curse|dub|death,absurd|dark|2|en",
  "Scientist|The Mummy's Shroud|dub|death,time|dark|2|en",
  "Augustus Pablo|Java|dub|peace,time|calm|2|en",
  "Augustus Pablo|Meditation Dub|dub|peace,faith|calm|1|en",
  "Mad Professor|Sahara Dub|dub|alienation,peace|dreamy|2|en",
  "Mad Professor|Asylum of Dub|dub|alienation,absurd|dark|2|en",
  "Mad Professor|Kathmandu Dub|dub|faith,peace|dreamy|2|en",
  "Creation Rebel|Dub from Creation|dub|faith,absurd|dark|2|en",
  "Creation Rebel|Ian Smith Rock|dub|alienation|dark|2|en",
  "Keith Hudson|Pick a Dub|dub|peace|calm|2|en",
  "Yabby You|Conquering Dub|dub|faith,hope|warm|2|en",
  "Yabby You|Chanting Dub|dub|faith,peace|calm|2|en",
  "Yabby You|Prophets Dub|dub|faith,time|dark|2|en",
  "Prince Jammy|Conspiracy on Neptune|dub|absurd,alienation|dreamy|2|en",
  "Prince Jammy|President Dub|dub|routine|warm|2|en",
  "Burning Spear|The Ghost (Marcus Garvey)|dub|faith,time|dark|2|en",
  "Prince Fatty|Dubbing the Gulf of Thailand|dub|peace,absurd|dreamy|2|en",
  "Prince Fatty|Expansions|dub|hope,desire|warm|2|en",
  "Victor Rice|Eternal Dub|dub|time,peace|calm|2|en",
  "Victor Rice|Dub Land Dub|dub|peace|calm|2|en",
  "Victor Rice|Cultivator Dub|dub|routine,hope|warm|2|en"
];
  lines.forEach(line => {
    const [a, t, g, th, m, e, l] = line.split('|');
    R.catalog.push({ a, t, genre: g, tags: th.split(',').filter(Boolean), mood: m, energy: +e, lang: l, cat: true });
  });
  R.catalogIds = Object.assign(R.catalogIds || {}, {
 "pachyman|destroy the empire": {
  "id": "I1xT3ySnOkU",
  "title": "Pachyman - Destroy The Empire",
  "channel": "PACHYMAN"
 },
 "pachyman|all night long": {
  "id": "Qu0SIQVoAnE",
  "title": "PACHYMAN - All Night Long (OFFICIAL AUDIO)",
  "channel": "PACHYMAN"
 },
 "pachyman|sunset sound": {
  "id": "b7XsdJC_M_s",
  "title": "Pachyman - Sunset Sound",
  "channel": "PACHYMAN"
 },
 "pachyman|dub fellowship": {
  "id": "XfsZVdcDdfk",
  "title": "Pachyman - Dub Fellowship (OFFICIAL AUDIO)",
  "channel": "PACHYMAN"
 },
 "pachyman|sugar on my tongue (dub)": {
  "id": "lNssN6Gi7yU",
  "title": "Sugar On My Tounge (Dub)",
  "channel": "PACHYMAN"
 },
 "pachyman|strictly vibes": {
  "id": "La_oi1pW2vA",
  "title": "\"Strictly Vibes\" • PACHYMAN",
  "channel": "PACHYMAN"
 },
 "pachyman|sensi": {
  "id": "4UfCR3AHoxQ",
  "title": "Pachyman - Sensi",
  "channel": "PACHYMAN"
 },
 "the upsetters|super ape": {
  "id": "MTOomS0HfdA",
  "title": "Super Ape (Album Version)",
  "channel": "The Upsetters - Topic"
 },
 "the upsetters|black vest": {
  "id": "EAlenBCeLM0",
  "title": "Black Vest (Album Version)",
  "channel": "The Upsetters - Topic"
 },
 "the upsetters|zion's blood": {
  "id": "eexjJIuuv0A",
  "title": "Zion's Blood (Album Version)",
  "channel": "The Upsetters - Topic"
 },
 "the upsetters|underground": {
  "id": "Pjj0CE5njfc",
  "title": "Underground (Album Version)",
  "channel": "The Upsetters - Topic"
 },
 "lee \"scratch\" perry|black ark international": {
  "id": "PDArdKD6iqg",
  "title": "Black Ark International",
  "channel": "Lee \"Scratch\" Perry - Topic"
 },
 "the congos|congoman": {
  "id": "TkmDH-uw8fs",
  "title": "Congoman",
  "channel": "The Congos - Topic"
 },
 "the congos|open up the gate": {
  "id": "J-G0zaewrYs",
  "title": "Open Up The Gate",
  "channel": "The Congos - Topic"
 },
 "king tubby|king tubby's special": {
  "id": "5TK6D5NDcDw",
  "title": "King Tubby's Special",
  "channel": "King Tubby - Topic"
 },
 "king tubby|mystical dub": {
  "id": "kCTMssRn7Ck",
  "title": "Mystical Dub",
  "channel": "King Tubby - Topic"
 },
 "scientist|dance of the vampires": {
  "id": "mswVkpgX8EU",
  "title": "Dance of the Vampires",
  "channel": "Scientist - Topic"
 },
 "scientist|your teeth in my neck": {
  "id": "gRoJfhcBhJA",
  "title": "Your Teeth in My Neck",
  "channel": "Scientist - Topic"
 },
 "scientist|the voodoo curse": {
  "id": "81TWkN4DIsQ",
  "title": "The Voodoo Curse",
  "channel": "Scientist - Topic"
 },
 "scientist|the mummy's shroud": {
  "id": "IoBTfVw1xRU",
  "title": "The Mummy's Shroud",
  "channel": "Scientist - Topic"
 },
 "augustus pablo|java": {
  "id": "AZz7tLcIlgg",
  "title": "Augustus Pablo - Java Original",
  "channel": "Augustus Pablodub"
 },
 "augustus pablo|meditation dub": {
  "id": "wLAoqaR6g4I",
  "title": "augustus pablo - meditation dub",
  "channel": "Augustus Pablodub"
 },
 "mad professor|sahara dub": {
  "id": "QiQ1JEQSD_w",
  "title": "Sahara Dub",
  "channel": "Mad Professor - Topic"
 },
 "mad professor|asylum of dub": {
  "id": "e6XPtVP-1l4",
  "title": "Asylum Of Dub",
  "channel": "Mad Professor - Topic"
 },
 "mad professor|kathmandu dub": {
  "id": "v2GL4gIDfA8",
  "title": "Mad Professor - Kathmandu Dub",
  "channel": "dubkulture"
 },
 "creation rebel|dub from creation": {
  "id": "c14Js0WGLac",
  "title": "Dub From Creation",
  "channel": "Creation Rebel - Topic"
 },
 "creation rebel|ian smith rock": {
  "id": "23kvlUUilWY",
  "title": "Ian Smith Rock",
  "channel": "Creation Rebel - Topic"
 },
 "keith hudson|pick a dub": {
  "id": "mi26OuAXC3E",
  "title": "Keith Hudson - Pick A Dub",
  "channel": "OldDubDomain"
 },
 "yabby you|conquering dub": {
  "id": "3AZGTcaabAg",
  "title": "Conquering Dub",
  "channel": "Yabby You - Topic"
 },
 "yabby you|chanting dub": {
  "id": "-rldstJiqJI",
  "title": "Chanting Dub",
  "channel": "Yabby You - Topic"
 },
 "yabby you|prophets dub": {
  "id": "_HVnPRg6r50",
  "title": "Prophets Dub",
  "channel": "Yabby You - Topic"
 },
 "prince jammy|conspiracy on neptune": {
  "id": "80zU8Pa4ID4",
  "title": "Conspiracy On Neptune",
  "channel": "Prince Jammy - Topic"
 },
 "prince jammy|president dub": {
  "id": "ymJ4bsw3iUw",
  "title": "President Dub",
  "channel": "Prince Jammy - Topic"
 },
 "burning spear|the ghost (marcus garvey)": {
  "id": "WRztaynAYkg",
  "title": "The Ghost (Marcus Garvey)",
  "channel": "Burning Spear - Topic"
 },
 "prince fatty|dubbing the gulf of thailand": {
  "id": "lBPQ7OFmwp8",
  "title": "Prince Fatty, Horseman & Ga-pi - Dubbing the Gulf of Thailand",
  "channel": "Prince Fatty TV"
 },
 "prince fatty|expansions": {
  "id": "in_dXLPoFi8",
  "title": "Prince Fatty - Expansions ft. Shniece McMenamin",
  "channel": "PrinceFattyVEVO"
 },
 "victor rice|eternal dub": {
  "id": "O483nAzYZAw",
  "title": "Brother Jerome Meets Victor Rice - Eternal Dub",
  "channel": "Victor Rice"
 },
 "victor rice|dub land dub": {
  "id": "qMuJLU01Jms",
  "title": "The Players Band vs Victor Rice - Dub Land Dub",
  "channel": "Victor Rice"
 },
 "victor rice|cultivator dub": {
  "id": "HmsSHdu6eTc",
  "title": "Linval Thompson +JonQuan + Victor Rice = Cultivator Dub",
  "channel": "Victor Rice"
 }
});
  const el = (R.runs || []).find(r => r.id === 'electronic');
  if (el) { el.genres = el.genres.filter(g => g !== 'dub'); el.label = 'Existential ambient, electronic and trip-hop'; }
  R.runs.push({ id: 'dub', label: 'Spacey reggae dub: echo, reverb and the Black Ark sound', short: 'Reggae dub', genres: ['dub'] });
  R.genreMore = R.genreMore || {};
  R.genreMore.dub = (R.genreMore.dub || []).concat([
    'In dub, the engineer becomes the musician. King Tubby took finished songs apart at his mixing desk, and let the echo play the rest.',
    'Lee Perry built the Black Ark studio in his backyard in Kingston, and made a cathedral out of tape delay and reverb.',
    'Dub is reggae with the singer gone and the room left in. What remains is bass, space, and a voice that comes back like a memory.',
    'Every echo in a dub track is a small repetition of the past, fading. Maybe that is why it sounds so much like thinking.',
  ]);
})();
