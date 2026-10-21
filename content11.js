// What the host says to open and close a commercial break. The break itself is: jingle, ad, jingle, ad, jingle.
(function () {
  const R = window.RADIO;
  R.breakIntros = [
    'We will take a short commercial break. Stay with us.',
    'A quick pause now, for the commercials.',
    'Time for a commercial break. We will be right back.',
    'Let us step out for a few ads, and then we return.',
    'And now, a little break for our sponsors.',
    'Do not go anywhere. Here is a short commercial break.',
    'A short interruption, courtesy of the advertisers.',
    'We pause the music for a moment, for a few words from our sponsors.',
    'Commercial break. A little time travel to the ads of old Morocco, and then we are back.',
    'Hold that thought. The commercials are on their way.',
  ];
  R.breakOutros = [
    'And we are back.',
    'Thank you for waiting. We return to the radio.',
    'That was our commercial break. Now, back to the night.',
    'And that is the end of the break. Welcome back.',
    'Back on the air. Where were we?',
    'The ads are done, and the radio carries on.',
    'We are back, and the lamp is still on.',
    'Thanks for staying with us. Back to the music.',
    'Break over. Let us return to what we do best: slowing things down.',
    'And now, back to our regular wandering.',
  ];
})();
