// Short instrumental jingles, made entirely by the app (no audio files, no vocals): soft bells, plucks and warm pads.
// Usage: const j = Jingles.play(audioContext, 'dawn'); await j.done; j.stop() fades it out early.
(function () {
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);

  // a small "room": echo plus a soft reverb tail, shared by every note of a jingle
  function room(ctx, out) {
    const send = ctx.createGain(); send.gain.value = 0.55;
    const echo = ctx.createDelay(1.0); echo.delayTime.value = 0.27;
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const tone = ctx.createBiquadFilter(); tone.type = 'lowpass'; tone.frequency.value = 3200;
    send.connect(echo); echo.connect(tone); tone.connect(fb); fb.connect(echo);
    const len = Math.floor(ctx.sampleRate * 2.4), buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
    const rev = ctx.createConvolver(); rev.buffer = buf;
    const wet = ctx.createGain(); wet.gain.value = 0.42;
    send.connect(rev); tone.connect(rev); rev.connect(wet); wet.connect(out);
    tone.connect(out);
    return send;
  }

  // FM bell: a sine whose pitch is shaken by a fast partner that dies away quickly
  function bell(ctx, dry, wet, t, midi, vel, dur) {
    const f = hz(midi), car = ctx.createOscillator(), mod = ctx.createOscillator(), mg = ctx.createGain(), g = ctx.createGain();
    car.frequency.value = f; mod.frequency.value = f * 3.5;
    mg.gain.setValueAtTime(f * 1.3, t); mg.gain.exponentialRampToValueAtTime(f * 0.015, t + dur * 0.55);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(dry); g.connect(wet);
    car.start(t); mod.start(t); car.stop(t + dur + 0.05); mod.stop(t + dur + 0.05);
  }

  // soft pluck: a triangle wave through a filter that closes quickly
  function pluck(ctx, dry, wet, t, midi, vel, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = hz(midi); o2.frequency.value = hz(midi) * 2;
    f.type = 'lowpass'; f.frequency.setValueAtTime(3400, t); f.frequency.exponentialRampToValueAtTime(600, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(dry); g.connect(wet);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }

  // warm pad: a few detuned triangles that swell in and out
  function pad(ctx, dry, wet, t, notes, dur, vel, vibrato) {
    const g = ctx.createGain(), f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1200;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + dur * 0.35); g.gain.linearRampToValueAtTime(0.0001, t + dur);
    f.connect(g); g.connect(dry); g.connect(wet);
    notes.forEach((m, i) => {
      [-5, 5].forEach(cents => {
        const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = cents + i;
        if (vibrato) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 5; lg.gain.value = 6; l.connect(lg); lg.connect(o.detune); l.start(t); l.stop(t + dur + 0.1); }
        o.connect(f); o.start(t); o.stop(t + dur + 0.1);
      });
    });
  }

  const SEQ = (ctx, d, w, t0, list, fn, step, vel, dur) => list.forEach((m, i) => fn(ctx, d, w, t0 + i * step, m, vel, dur));

  // newsroom sounds: a short high tick (the wire machine), a low hit with a falling pitch, and a bright brass-like stab
  function tick(ctx, dry, t, vel) {
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 2100; f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    o.connect(f); f.connect(g); g.connect(dry); o.start(t); o.stop(t + 0.06);
  }
  function hit(ctx, dry, wet, t, midi, vel, dur) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sine'; o2.type = 'triangle';
    o.frequency.setValueAtTime(hz(midi) * 2, t); o.frequency.exponentialRampToValueAtTime(hz(midi), t + 0.08);
    o2.frequency.setValueAtTime(hz(midi + 12), t);
    f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(220, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); o2.connect(f); f.connect(g); g.connect(dry); g.connect(wet);
    o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
  }
  function stab(ctx, dry, wet, t, notes, vel, dur) {
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'lowpass'; f.frequency.setValueAtTime(600, t); f.frequency.exponentialRampToValueAtTime(3800, t + 0.06); f.frequency.exponentialRampToValueAtTime(900, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vel, t + 0.03); g.gain.setValueAtTime(vel, t + dur * 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    f.connect(g); g.connect(dry); g.connect(wet);
    notes.forEach(m => [-7, 0, 7].forEach(c => { const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = c; o.connect(f); o.start(t); o.stop(t + dur + 0.05); }));
  }

  // ---------- the jingles: "Dawn Bell" for the commercial breaks, "News Desk" for the news ----------
  const LIST = [
    { id: 'dawn', name: 'Dawn Bell', length: 4.2, about: 'A bright rising pentatonic run that lands on a high bell. Hopeful, clean.',
      build(ctx, d, w, t) {
        pad(ctx, d, w, t, [48, 55, 64], 4.2, 0.05);
        SEQ(ctx, d, w, t + 0.05, [72, 76, 79, 81, 84], pluck, 0.16, 0.16, 0.5);
        bell(ctx, d, w, t + 0.95, 88, 0.14, 2.6); bell(ctx, d, w, t + 0.95, 76, 0.1, 2.8);
      } },
    // the news: serious and steady. A ticking wire under a low pulse in D minor, a rising four-note call, and a firm final chord.
    { id: 'news', name: 'News Desk', length: 4.6, about: 'Ticking wire, low pulse, a rising call in D minor and a firm brass-like chord. Serious, for the news.',
      build(ctx, d, w, t) {
        for (let i = 0; i < 24; i++) tick(ctx, d, t + i * 0.125, i % 4 === 0 ? 0.05 : 0.025);
        [0, 0.5, 1.0, 1.5, 2.0, 2.25, 2.5].forEach(x => hit(ctx, d, w, t + x, 38, 0.32, 0.45));
        pad(ctx, d, w, t, [50, 57, 62, 65], 3.2, 0.035);
        SEQ(ctx, d, w, t + 1.0, [62, 65, 69, 74], pluck, 0.25, 0.13, 0.45);
        stab(ctx, d, w, t + 3.0, [50, 57, 62, 65, 69], 0.06, 1.5);
        hit(ctx, d, w, t + 3.0, 38, 0.4, 1.2); bell(ctx, d, w, t + 3.0, 86, 0.06, 1.8);
      } },
  ];
  function play(ctx, id) {
    const j = LIST.find(x => x.id === id) || LIST[0];
    if (ctx.state === 'suspended') ctx.resume();
    const master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.connect(master);
    const dry = ctx.createGain(); dry.gain.value = 0.9; dry.connect(comp);
    const wet = room(ctx, comp);
    const t = ctx.currentTime + 0.05;
    j.build(ctx, dry, wet, t);
    let stopped = false, finish;
    const done = new Promise(res => { finish = res; });
    const endAt = t + j.length + 1.2;   // measured on the audio clock, so a paused (suspended) context does not run it out
    const timer = setInterval(() => { if (!stopped && ctx.currentTime >= endAt) { stopped = true; clearInterval(timer); finish(); } }, 100);
    return {
      done,
      stop() { if (stopped) return; stopped = true; clearInterval(timer); try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.05); } catch (e) { } setTimeout(() => { try { master.disconnect(); } catch (e) { } }, 400); finish(); },
    };
  }

  window.Jingles = { list: LIST.map(j => ({ id: j.id, name: j.name, about: j.about, length: j.length })), play, defaultId: 'dawn' };
})();
