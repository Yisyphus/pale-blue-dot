(() => {
const R = window.RADIO;
const $ = id => document.getElementById(id);
const rnd = a => a[Math.floor(Math.random() * a.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const THEMES = ['time', 'death', 'alienation', 'letting-go', 'love', 'hope', 'routine', 'absurd', 'faith', 'desire', 'peace'];
const MAX_DISCOVERED = 220;

// ---------- state ----------
let lib = { user: [], cache: {}, removed: [], settings: {}, trim: {}, disc: {} };
let S = { talk: 'normal', rate: 90, voice: '', sleep: 0, deep: 30, vol: 80, trim: 5 };
let songs = [];
let current = null, history = [], played = [], upNext = [], planned = null, preload = null;
let batch = null, startAnnounce = null, lastRunSong = null; // genre run state
let nextPending = false, nextOverride = null; // a suggested song can take the place of the one chosen to play next
let pl = [null, null], ai = 0, ytReady = false, playing = false, started = false, busy = false;
let runId = 0, speaking = false, airMs = 0, songsSinceBreak = 0;
let sleepAt = 0, candIdx = 0, startWatch = null;

const key = s => (s.a + '|' + s.t).toLowerCase();
// Where the library lives:
// - on the PC, the helper (server.js) keeps data/library.json, a local copy that also works offline;
// - opened from the web with no helper (the phone), a copy is kept in the browser;
// - signed in, the cloud (cloud.js) keeps the shared copy, and the newest copy wins.
let HELPER = false, cloudAds = null;
const NEEDS_PC = 'Searching YouTube needs the radio running on your PC (start.bat). Here you can still play, skip, choose favorites, and remove songs or ads.';
function normalizeLib() {
  if (lib.cacheV !== 2) { lib.cache = {}; lib.cacheV = 2; } // earlier versions cached some wrong videos; search again with the stricter matching
  lib.used = lib.used || {}; lib.b = lib.b || 0; lib.trim = lib.trim || {}; lib.disc = lib.disc || {}; lib.cache = lib.cache || {}; lib.user = lib.user || []; lib.removed = lib.removed || [];
  S = Object.assign(S, lib.settings || {});
  if (S.talk === 'low') S.talk = 'normal';
}
async function loadLib() {
  HELPER = await fetch('/api/ping').then(r => r.ok ? r.json() : null).then(j => !!(j && j.app === 'pale-blue-dot')).catch(() => false);
  if (HELPER) { try { const r = await fetch('/api/library'); lib = Object.assign(lib, await r.json()); } catch {} }
  else { try { const c = JSON.parse(localStorage.getItem('pbd-lib') || 'null'); if (c) lib = Object.assign(lib, c); } catch {} }
  if (window.Cloud && Cloud.enabled) {
    const u = await Promise.race([Cloud.authKnown, sleep(6000)]);
    if (u) await syncWithCloud();
  }
  normalizeLib();
}
// Two copies of the library (this device, and the cloud or another device) are MERGED, never swapped:
// favorites, your songs, removed songs, saved versions, trims and broken-song marks from both are kept.
// Things you deliberately took away are remembered with a date in lib.del, so they do not come back.
// (A plain "newest copy wins" once let a brand-new, empty library replace everything.)
function mergeLib(a, b) {
  a = a || {}; b = b || {};
  const newer = (a.savedAt || 0) >= (b.savedAt || 0) ? a : b, older = newer === a ? b : a;
  const out = Object.assign({}, older, newer);   // settings, history, letter rotation...: from the newer copy
  const del = {};
  ['fav', 'user', 'removed'].forEach(k => {
    del[k] = {};
    [older, newer].forEach(c => Object.entries((c.del || {})[k] || {}).forEach(([key, t]) => { if ((del[k][key] || 0) < t) del[k][key] = t; }));
  });
  out.del = del;
  const alive = (k, key, ts) => !(del[k][key] && del[k][key] >= (ts || 0));
  const byKey = (list, tsOf) => { const m = new Map(); list.forEach(x => { if (!x || !x.key) return; const p = m.get(x.key); if (!p || tsOf(x) >= tsOf(p)) m.set(x.key, x); }); return [...m.values()]; };
  out.fav = byKey([...(older.fav || []), ...(newer.fav || [])], x => x.ts || 0).filter(f => alive('fav', f.key, f.ts)).sort((x, y) => (x.ts || 0) - (y.ts || 0));
  out.user = byKey([...(older.user || []), ...(newer.user || [])], x => x.added || 0).filter(s => alive('user', s.key, s.added));
  out.removedTs = Object.assign({}, older.removedTs, newer.removedTs);
  out.removed = [...new Set([...(older.removed || []), ...(newer.removed || [])])].filter(k => alive('removed', k, out.removedTs[k]));
  ['cache', 'trim', 'bad'].forEach(k => { out[k] = Object.assign({}, older[k], newer[k]); });
  out.b = Math.max(older.b || 0, newer.b || 0);
  out.hist = (newer.hist || []).length >= (older.hist || []).length ? newer.hist : older.hist;
  return out;
}
const libSig = l => JSON.stringify([(l.fav || []).map(f => f.key), (l.user || []).map(s => s.key), l.removed || [], Object.keys(l.cache || {}).length, l.del || {}]);
// Sign-in, or opening the radio signed in: merge with the cloud, keep the result here, and send it up if it differs.
async function syncWithCloud() {
  try {
    const c = await Cloud.pull(); if (!c) return;
    cloudAds = c.ads || null;
    const merged = mergeLib(lib, c.lib ? Object.assign({ savedAt: c.savedAt || 0 }, c.lib) : {});
    const changedHere = libSig(merged) !== libSig(lib), changedThere = !c.lib || libSig(merged) !== libSig(c.lib);
    lib = Object.assign({ user: [], cache: {}, removed: [], settings: {}, trim: {}, disc: {} }, merged);
    if (changedHere && HELPER) fetch('/api/library', { method: 'POST', body: JSON.stringify(lib) }).catch(() => {});   // refresh the local copy
    if (changedThere) { lib.savedAt = Date.now(); Cloud.push(lib, true); }
    rlog('cloud sync', { favorites: (lib.fav || []).length, yourSongs: (lib.user || []).length, removed: (lib.removed || []).length, sentUp: changedThere });
  } catch (e) { console.warn('[cloud]', e); toast('Cloud: ' + (e.code === 'permission-denied' ? 'this Google account is not allowed.' : 'could not sync right now.')); }
}
// Recording what you deliberately take away, so merging does not bring it back.
function markDeleted(kind, key) { lib.del = lib.del || {}; lib.del[kind] = lib.del[kind] || {}; lib.del[kind][key] = Date.now(); }
let saveT;
function saveLib() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    lib.settings = S; lib.savedAt = Date.now();
    if (HELPER) fetch('/api/library', { method: 'POST', body: JSON.stringify(lib) }).catch(() => {});
    else { try { localStorage.setItem('pbd-lib', JSON.stringify(lib)); } catch {} }
    if (window.Cloud && Cloud.user) Cloud.push(lib);
  }, 400);
}
// A change made on your other device: take it, as long as it is newer than what we have here.
if (window.Cloud) Cloud.onRemote = ({ lib: rl, savedAt }) => {
  if (!rl) return;
  const merged = mergeLib(lib, Object.assign({ savedAt }, rl));
  if (libSig(merged) === libSig(lib) && savedAt <= (lib.savedAt || 0)) return;
  lib = Object.assign({ user: [], cache: {}, removed: [], settings: {}, trim: {}, disc: {} }, merged);
  normalizeLib(); buildSongs(); updateHeart();
  if (libSig(merged) !== libSig(rl)) { lib.savedAt = Date.now(); Cloud.push(lib); }   // the other device was missing something we have: send the merge back
  if (HELPER) fetch('/api/library', { method: 'POST', body: JSON.stringify(lib) }).catch(() => {});
  else { try { localStorage.setItem('pbd-lib', JSON.stringify(lib)); } catch {} }
};
function buildSongs() {
  // the whole pool: your first songs, the curated catalog, and the songs you added yourself.
  // Songs that the old version pulled in automatically from YouTube mixes ("found for you") are switched off here, but kept in the file.
  const seed = R.songs.map(s => ({ ...s, key: key(s) }));
  const cat = (R.catalog || []).map(s => ({ ...s, key: key(s) }));
  const user = lib.user.filter(s => !s.discovered).map(s => ({ ...s, key: s.key || key(s) }));
  const seen = new Set(); songs = [];
  [...seed, ...cat, ...user].forEach(s => { if (seen.has(s.key) || lib.removed.includes(s.key)) return; seen.add(s.key); songs.push(s); });
  songs.forEach(s => {
    if (lib.cache[s.key]) s.cands = lib.cache[s.key];
    else if (R.catalogIds && R.catalogIds[s.key]) { const v = R.catalogIds[s.key]; s.cands = [{ id: v.id, title: v.title, channel: v.channel, seconds: 0 }]; }   // checked in advance: no search needed
  });
}

// ---------- ui helpers ----------
function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200); }
function caption(kind, text) { $('cap').classList.toggle('idle', !text); $('capKind').textContent = kind || R.host; $('capText').textContent = text || ''; }
function setPlayIcon(on) { $('playIcon').innerHTML = on ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>' : '<path d="M8 5v14l11-7z"/>'; }
// Artwork on the record label. YouTube answers a missing thumbnail with a small grey placeholder (120 px wide)
// instead of an error, so each image is checked first; then other sizes and the song's other saved versions are tried.
let artToken = 0;
function setArt(s, id) {
  const my = ++artToken, label = $('label');
  if (!id) { label.style.backgroundImage = ''; return; }
  const ids = [id, ...((s && s.cands) || []).map(c => c.id).filter(x => x && x !== id)].slice(0, 3);
  const urls = [];
  ids.forEach(v => ['hqdefault', 'mqdefault', 'sddefault'].forEach(sz => urls.push(`https://i.ytimg.com/vi/${v}/${sz}.jpg`)));
  const tryAt = i => {
    if (my !== artToken) return;
    if (i >= urls.length) { label.style.backgroundImage = ''; rlog('no artwork found', { song: s && s.key }); return; }
    const img = new Image();
    img.onload = () => { if (img.naturalWidth > 120) { if (my === artToken) label.style.backgroundImage = `url(${urls[i]})`; } else tryAt(i + 1); };
    img.onerror = () => tryAt(i + 1);
    img.src = urls[i];
  };
  tryAt(0);
}
function setNow(s, kind) {
  $('kind').textContent = kind || (s && s.podcast ? (s.midnight ? 'midnight podcast' : 'podcast') : 'now playing');
  $('title').textContent = s ? s.t : 'Pale Blue Dot';
  $('artist').textContent = s ? s.a : '';
  $('chips').innerHTML = s ? [...(s.tags || []).slice(0, 3), s.genre].filter(Boolean).map(t => `<span class="chip">${t}</span>`).join('') : '';
  const id = s && s.cands && s.cands[0] ? (s.cands[candIdx] || s.cands[0]).id : null;
  setArt(s, id);
  if (s) { let h = 0; for (const c of s.key) h = (h * 31 + c.charCodeAt(0)) >>> 0; const p = 8 + (h % 84); $('needle').style.left = p + '%'; $('freq').textContent = (87.5 + p * 0.2).toFixed(1) + ' FM'; }
  document.title = s ? `${s.t} · ${s.a}` : 'Pale Blue Dot Radio';
  updateHeart();
  if ('mediaSession' in navigator && s) navigator.mediaSession.metadata = new MediaMetadata({ title: s.t, artist: s.a, album: 'Pale Blue Dot Radio' });
}
function setLive(on) { $('onair').classList.toggle('live', on); $('vinyl').classList.toggle('on', on); }

// ---------- voice ----------
let voices = [];
const isEn = v => /^en/i.test(v.lang);
const ONLINE = '__online';
function loadVoices() {
  voices = speechSynthesis.getVoices();
  const sel = $('voiceSel'); sel.innerHTML = '';
  const add = (val, label) => { const o = document.createElement('option'); o.value = val; o.textContent = label; sel.appendChild(o); };
  add('', 'Automatic (best English voice)');
  add(ONLINE, 'Online English voice (fallback)');
  [...voices].sort((a, b) => (isEn(b) - isEn(a)) || a.name.localeCompare(b.name)).forEach(v => add(v.name, `${v.name.replace('Microsoft ', '')} · ${v.lang}`));
  sel.value = S.voice || '';
  const note = $('voiceNote');
  if (note) note.textContent = voices.some(isEn) ? '' : 'No English voice is installed on this computer, so the host uses the online English fallback. For a better voice: Windows Settings > Time & language > Speech > Add voices > English, or open the radio in Microsoft Edge for its free natural voices.';
}
function hostVoice() {
  if (S.voice === ONLINE) return null;
  if (S.voice) { const v = voices.find(v => v.name === S.voice); if (v) return v; }
  const en = voices.filter(isEn);
  const pref = [/brian multilingual.*natural/i, /brian.*natural/i, /andrew.*natural/i, /guy.*natural/i, /christopher.*natural/i, /eric.*natural/i, /natural/i, /guy|ryan|david|mark|george|james|daniel/i];
  for (const p of pref) { const v = en.find(v => p.test(v.name)); if (v) return v; }
  return en[0] || null;
}
function guestVoice() { const host = hostVoice(); const en = voices.filter(v => isEn(v) && v !== host); return en.find(v => /(aria|jenny|ava|emma|ana|sonia|libby).*natural/i.test(v.name)) || en.find(v => /natural/i.test(v.name)) || null; }
// Other voices, by the code a script line carries: s = Sonia (the readings), and the versions of you in
// "Conversations with You": y = you, younger; o = you, older; r = the part that refuses; k = the part that keeps going;
// b = you on your best day. Each takes the first installed natural voice from its list that is not the host's.
const VOICE_PREFS = {
  s: [/sonia.*natural/i, /libby.*natural/i, /(emma|ava|jenny|aria).*natural/i],
  y: [/liam.*natural/i, /andrew.*natural/i, /connor.*natural/i],
  o: [/roger.*natural/i, /christopher.*natural/i, /thomas.*natural/i],
  r: [/ryan.*natural/i, /thomas.*natural/i, /guy.*natural/i],
  k: [/steffan.*natural/i, /eric.*natural/i, /guy.*natural/i],
  b: [/william.*natural/i, /connor.*natural/i, /andrew.*natural/i],
};
function voiceFor(code) {
  if (code === 'g') return guestVoice();
  const host = hostVoice(), en = voices.filter(v => isEn(v) && v !== host);
  for (const p of VOICE_PREFS[code] || []) { const v = en.find(v => p.test(v.name)); if (v) return v; }
  return code === 's' ? guestVoice() : (en.find(v => /natural/i.test(v.name) && !/(sonia|libby|emma|ava|jenny|aria|ana|maisie|michelle)/i.test(v.name)) || null);
}
speechSynthesis.onvoiceschanged = loadVoices;

let curAudio = null;
const splitParts = text => (text.match(/[^.!?…]+[.!?…]+["')\]]*\s*|[^.!?…]+$/g) || [text]).map(s => s.trim()).filter(Boolean);

// Speak a block of text. All sentences are queued at once so there is no gap between them.
function say(text, who = 'h') {
  return new Promise(res => {
    const id = runId, parts = splitParts(text);
    const hv = hostVoice();
    speaking = true;
    let finished = false, guard;
    const done = () => { if (finished) return; finished = true; clearInterval(guard); speaking = false; res(); };
    let budget = parts.reduce((n, p) => n + Math.max(2500, p.length * 130), 6000);   // safety net; time spent paused does not count
    guard = setInterval(() => { if (!globalPaused && (budget -= 250) <= 0) done(); }, 250);
    if (!hv) { // online fallback, with the next sentences preloaded
      const auds = parts.map(p => { const a = new Audio('/api/tts?q=' + encodeURIComponent(p)); a.preload = 'auto'; a.playbackRate = who !== 'h' ? 0.88 : 0.95; return a; });
      let i = 0;
      const nextA = () => { if (id !== runId || i >= auds.length) return done(); const a = auds[i]; $('capText').textContent = parts[i]; i++; curAudio = a; a.onended = nextA; a.onerror = nextA; a.play().catch(nextA); };
      nextA(); return;
    }
    const gv = who !== 'h' ? voiceFor(who) : null;
    const pitchFor = { g: 1.25, s: 1.3, y: 1.15, o: 0.85, r: 0.92, k: 1.05, b: 1.08 };
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = 'en-US'; u.voice = gv || hv;
      u.rate = (S.rate || 90) / 100 * (who === 'o' ? 0.9 : who === 's' ? 0.92 : who !== 'h' && !gv ? 0.95 : 1);   // readings and the older you go a little slower
      u.pitch = who !== 'h' && !gv ? (pitchFor[who] || 1.2) : 1;
      u.onstart = () => { if (id === runId) $('capText').textContent = part; if (globalPaused) { try { speechSynthesis.pause(); } catch {} } };
      u.onend = () => { if (i === parts.length - 1 || id !== runId) done(); };
      u.onerror = () => { if (id !== runId || i === parts.length - 1) done(); };
      speechSynthesis.speak(u);
    });
  });
}
function stopSpeech() { runId++; if (breakSkip) { const b = breakSkip; breakSkip = null; try { b(); } catch {} } speechSynthesis.cancel(); try { if (curAudio) { curAudio.onended = null; curAudio.pause(); curAudio = null; } } catch {} speaking = false; }


// ---------- ambient bed: keeps the air filled during breaks so there is never dead silence ----------
let actx, bed;
function bedOn() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    if (bed) return;
    const g = actx.createGain(); g.gain.value = 0; g.connect(actx.destination);
    const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.connect(g);
    const lfo = actx.createOscillator(); lfo.frequency.value = 0.07; const lg = actx.createGain(); lg.gain.value = 140; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const oscs = [110, 164.8, 220.3, 277.2, 329.6].map((f, i) => { const o = actx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = f; o.detune.value = (i - 2) * 6; const og = actx.createGain(); og.gain.value = 0.22 / (i + 1.2); o.connect(og); og.connect(lp); o.start(); return o; });
    g.gain.linearRampToValueAtTime(0.07, actx.currentTime + 1.5);
    bed = { g, oscs, lfo };
  } catch {}
}
function bedOff(sec = 3) {
  if (!bed) return; const b = bed; bed = null;
  try { b.g.gain.cancelScheduledValues(actx.currentTime); b.g.gain.setValueAtTime(b.g.gain.value, actx.currentTime); b.g.gain.linearRampToValueAtTime(0, actx.currentTime + sec); setTimeout(() => { b.oscs.forEach(o => o.stop()); b.lfo.stop(); b.g.disconnect(); }, sec * 1000 + 300); } catch {}
}

// ---------- youtube: two players so the next song can be prepared and crossfaded ----------
window.onYouTubeIframeAPIReady = () => {
  let ready = 0;
  [0, 1].forEach(i => {
    pl[i] = new YT.Player('yt' + i, { height: '180', width: '320', playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0, origin: location.origin }, events: {
      onReady: () => { setVol(pl[i], 0); if (++ready === 2) ytReady = true; },
      onStateChange: e => {
        if (adHook && adHook.idx === i) { adHook.state(e.data); return; }
        if (i !== ai) return;
        if (e.data === YT.PlayerState.PLAYING) { clearTimeout(startWatch); playing = true; setPlayIcon(true); setLive(true); try { pl[i].unMute(); if (Number.isFinite(pl[i]._vol)) pl[i].setVolume(pl[i]._vol); } catch {} }
        else if (e.data === YT.PlayerState.PAUSED) {
          // paused, but not by the radio's pause button: YouTube (or the phone) stopped it. Note it, and start it again twice at most.
          if (!globalPaused && current && !current._selfPauses) current._selfPauses = 0;
          if (!globalPaused && current) {
            rlog('song paused by itself', { song: current.key, t: Math.round(pl[i].getCurrentTime()), busy, retry: current._selfPauses });
            if (current._selfPauses < 2) { current._selfPauses++; setTimeout(() => { try { if (!globalPaused && pl[ai] === pl[i]) pl[i].playVideo(); } catch {} }, 700); return; }
          }
          if (busy) return; playing = false; setPlayIcon(false); setLive(false);
        }
        else if (e.data === YT.PlayerState.ENDED) { console.info('[radio] ENDED event, busy=' + busy); if (started && !busy) advance(); }
      },
      onError: e => {
        if (adHook && adHook.idx === i) { adHook.error(); return; }
        if (i === ai) { const c = current && current.cands && current.cands[candIdx]; rlog('player error ' + (e && e.data), { song: current && current.key, id: c && c.id }); tryNextCand(e && e.data); }
        else preload = null;
      },
    } });
  });
};
const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(tag);
const waitYT = async () => { while (!ytReady) await sleep(200); };
const P = () => pl[ai];
window.__radio = { setAds: x => { adPool = x; }, brk: (n, prevPodcast) => {   // test helper: what the break after song n would contain (does not change the saved cycle)
    const keepB = lib.b, keepUsed = JSON.stringify(lib.used); lib.b = n / breakEvery() - 1;
    const p = prevPodcast ? { a: 'x', t: 'y', podcast: true, key: 'p' } : songs[0];
    const out = makeBreak(p, songs[1], false); lib.b = keepB; lib.used = JSON.parse(keepUsed); saveLib();
    return { podcastDue, parts: out.map(s => ({ kind: s.kind, title: s.title, lines: (s.lines || []).map(l => (l.w || 'h') + ': ' + l.t) })) };
  }, sim: (n, startKey) => {   // test helper: simulate the picker without playing anything
    let cur = (startKey && songs.find(s => s.key === startKey)) || rnd(songs); const hist = [], out = [];
    for (let i = 0; i < n; i++) {
      const l3 = hist.slice(-2).concat([cur]); const rs = { recentKeys: new Set(hist.slice(-200).map(s => s.key)), recentArtists: new Set(hist.slice(-6).map(s => (s.a || "").toLowerCase()).concat([(cur.a || "").toLowerCase()])), streakGenre: l3.length >= 3 && l3.every(s => s.genre === l3[0].genre) ? l3[0].genre : null, streakFamily: l3.length >= 3 && l3.every(s => famOf(s.genre) === famOf(l3[0].genre)) ? famOf(l3[0].genre) : null, pairGenre: l3.length >= 2 && l3[l3.length - 2].genre === cur.genre ? cur.genre : null };
      const c = choose(cur, rs); hist.push(cur);
      out.push({ from: cur.a + " - " + cur.t, fg: cur.genre, to: c.song.a + " - " + c.song.t, tg: c.song.genre, why: c.why, shared: (c.song.tags || []).filter(t => (cur.tags || []).includes(t)), e: [cur.energy, c.song.energy], user: !!c.song.user });
      cur = c.song;
    }
    return out;
  }, songsCount: () => songs.length, intro: (k, pk, why) => { const s = songs.find(x => x.key === k), p = songs.find(x => x.key === pk); if (why) lastPick = { key: k, why }; return introFor(s, p); }, pl, fadeP: (...x) => fadeP(...x), state: () => ({ ai, busy, speaking, playing, vol: S.vol, paused: globalPaused, ctx: actx ? actx.state : null, voiceAudioPaused: curAudio ? curAudio.paused : null, icon: document.getElementById('playIcon').innerHTML.indexOf('M8 5v14') >= 0 ? 'play' : 'pause', players: pl.map(p => { try { return { vol: p.getVolume(), muted: p.isMuted(), st: p.getPlayerState(), t: Math.round(p.getCurrentTime()) }; } catch { return null; } }) }) }; // debug helper

// Volume is tracked by us, never read back from YouTube: right after a video loads, getVolume() returns undefined,
// which used to turn a fade-in into NaN and leave the song playing at volume 0 (silent).
function setVol(p, v) {
  v = Math.max(0, Math.min(100, Math.round(+v)));
  if (!Number.isFinite(v)) v = 0;
  p._vol = v;
  try { p.setVolume(v); } catch {}
}
function fadeP(p, to, ms) {
  return new Promise(res => {
    clearInterval(p._ft);
    const from = Number.isFinite(p._vol) ? p._vol : 0;
    const n = Math.max(1, Math.round(ms / 100)); let i = 0;
    p._fading = true;
    p._ft = setInterval(() => {
      i++; setVol(p, from + (to - from) * i / n);
      if (i >= n) { clearInterval(p._ft); p._fading = false; setVol(p, to); res(); }
    }, ms / n);
  });
}
async function resolve(s) {
  if (s.cands && s.cands.length) return s.cands;
  try {
    const r = await fetch('/api/search?q=' + encodeURIComponent(s.a + ' ' + s.t) + '&a=' + encodeURIComponent(s.a) + '&t=' + encodeURIComponent(s.t));
    const c = (await r.json()).slice(0, 5);
    if (Array.isArray(c) && c.length) { s.cands = c; lib.cache[s.key] = c; saveLib(); return c; }
  } catch {}
  return [];
}
// Start a song on the idle player. startVol: initial volume. fadeInMs: ramp up to S.vol after starting.
async function startSong(s, startVol, fadeInMs = 0) {
  const run = runId;
  await waitYT();
  const c = await resolve(s);
  // you pressed Next (or something else took over) while this song was still being looked up: do not start it late,
  // on top of the newer song, at the quiet volume used under the host's voice
  if (run !== runId) { rlog('stale start ignored', { song: s.key }); return null; }
  if (!c.length) { toast(`Could not find "${s.t}". Skipping.`); return false; }
  const old = pl[ai], n = 1 - ai;
  candIdx = 0; current = s; ai = n; playing = false;
  const np = pl[n];
  setVol(np, fadeInMs ? 0 : startVol);
  if (preload && preload.key === s.key && preload.idx === n) np.playVideo(); else np.loadVideoById(c[0].id);
  preload = null;
  rlog('start', { song: s.key, id: c[0].id });
  fadeP(old, 0, 1200).then(() => { try { if (pl[ai] !== old) old.pauseVideo(); } catch {} });
  setNow(s);
  clearTimeout(startWatch); startWatch = setTimeout(() => { if (!playing && !globalPaused) tryNextCand(); }, 14000);
  if (fadeInMs) fadeP(np, S.vol, fadeInMs);
  if (!s.podcast) {   // remembered across sessions, so the radio does not replay the same songs every time it opens
    lib.hist = lib.hist || []; lib.hist.push({ k: s.key, a: s.a }); if (lib.hist.length > 400) lib.hist.splice(0, lib.hist.length - 400); saveLib();
  }
  return true;
}
function wrongSong() {
  if (!current || !current.cands || current.cands.length < 2 || busy) return toast('No other version to try.');
  const c = current.cands; c.push(c.shift()); // the wrong one goes to the back, so it is remembered
  current.cands = c; lib.cache[current.key] = c;
  const u = lib.user.find(x => x.key === current.key); if (u) u.cands = c;
  if (current.podcast) { current.a = c[0].channel; current.t = cleanTitle(c[0].title); }
  saveLib(); candIdx = 0; P().loadVideoById(c[0].id); setNow(current); toast(current.podcast ? 'Trying another episode.' : 'Trying another version.');
}
// "Try another version": a sheet with search results for the playing song. The chosen upload plays at once and
// replaces the saved version everywhere (library, favorites); the old ones stay behind it as backups.
let verSong = null;
function openVersions() {
  if (!current) return toast('Nothing is playing.');
  if (current.podcast) return wrongSong();   // podcasts keep the quick "next episode" behaviour
  verSong = current;
  $('verq').value = `${current.a} - ${current.t}`;
  openSheet('shVer'); searchVersions();
}
async function searchVersions() {
  const s = verSong, q = $('verq').value.trim(); if (!s || !q) return;
  const box = $('verRes');
  if (!HELPER) {   // without the helper: only the versions already saved for this song
    box.innerHTML = `<p style="color:var(--mute);font-size:13px">${NEEDS_PC}</p>`;
    (s.cands || []).forEach((v, i) => { const d = document.createElement('div'); d.className = 'item'; d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="btn" style="padding:6px 11px"></button>`; d.querySelector('b').textContent = cleanTitle(v.title || s.t); d.querySelector('span').textContent = v.channel || ''; const b = d.querySelector('button'); const on = i === candIdx; b.textContent = on ? 'Playing' : 'Use this'; b.disabled = on; b.onclick = () => useVersion(s, v); box.appendChild(d); });
    return;
  }
  box.innerHTML = '<p style="color:var(--mute)">Searching…</p>';
  try {
    const r = await (await fetch('/api/search?q=' + encodeURIComponent(q))).json();
    if (verSong !== s) return;
    const playingId = current === s && s.cands ? (s.cands[candIdx] || s.cands[0] || {}).id : null;
    const list = (Array.isArray(r) ? r : []).slice(0, 8);
    if (playingId && !list.some(v => v.id === playingId)) { const pv = s.cands.find(c => c.id === playingId); if (pv) list.unshift(pv); }
    if (!list.length) throw 0;
    box.innerHTML = '';
    list.forEach(v => {
      const on = v.id === playingId;
      const d = document.createElement('div'); d.className = 'item';
      d.innerHTML = `<img src="https://i.ytimg.com/vi/${v.id}/default.jpg" width="48" height="36" style="border-radius:6px;object-fit:cover"><div class="meta"><b></b><span></span></div><button class="btn" style="padding:6px 11px"></button>`;
      d.querySelector('b').textContent = cleanTitle(v.title || '');
      d.querySelector('span').textContent = `${v.channel || ''}${v.seconds ? ' · ' + fmt(v.seconds) : ''}${on ? ' · playing now' : ''}`;
      const b = d.querySelector('button'); b.textContent = on ? 'Playing' : 'Use this'; b.disabled = on;
      b.onclick = () => useVersion(s, v);
      box.appendChild(d);
    });
  } catch { box.innerHTML = '<p style="color:var(--mute)">Nothing found, or the search failed. Try other words.</p>'; }
}
function useVersion(s, v) {
  const c = [v, ...(s.cands || []).filter(x => x.id !== v.id)];
  s.cands = c; lib.cache[s.key] = c;
  const u = lib.user.find(x => x.key === s.key); if (u) u.cands = c;
  const f = (lib.fav || []).find(x => x.key === s.key); if (f) f.id = v.id;   // favorites remember the exact version too
  saveLib(); openSheet(null);
  if (current === s) {
    candIdx = 0; playing = false; P().loadVideoById(v.id); setNow(s);
    clearTimeout(startWatch); startWatch = setTimeout(() => { if (!playing && !globalPaused) tryNextCand(); }, 14000);
  }
  toast('Saved: this version of "' + s.t + '" will play from now on.');
}
$('verGo').onclick = searchVersions; $('verq').onkeydown = e => { if (e.key === 'Enter') searchVersions(); };

// Playback diagnostics: kept in data/radio-log.txt by the helper, so a silent or skipped song can be explained later.
// The last 80 events are also kept on the device, for Settings > Playback report (useful on the phone, where there is no helper log).
const diag = (() => { try { return JSON.parse(localStorage.getItem('pbd-diag') || '[]'); } catch { return []; } })();
function rlog(msg, data) {
  try {
    console.info('[radio] ' + msg, data || '');
    diag.push(new Date().toLocaleTimeString('en-GB') + '  ' + msg + (data ? '  ' + JSON.stringify(data) : '')); if (diag.length > 80) diag.splice(0, diag.length - 80);
    try { localStorage.setItem('pbd-diag', JSON.stringify(diag)); } catch {}
    if (HELPER) fetch('/api/log', { method: 'POST', body: msg + (data ? ' ' + JSON.stringify(data) : '') }).catch(() => {});
  } catch {}
}
// code: the YouTube error. 100 = removed, 101/150 = the owner does not allow embedding. Those versions are
// dropped from the saved list for good, so the same broken upload is never tried again.
function tryNextCand(code) {
  if (!current || !current.cands) return skipBroken();
  if ([100, 101, 150].includes(code) && current.cands[candIdx] && !current.podcast) {
    const bad = current.cands[candIdx];
    current.cands = current.cands.filter(c => c.id !== bad.id);
    lib.cache[current.key] = current.cands;
    const u = lib.user.find(x => x.key === current.key); if (u) u.cands = current.cands;
    saveLib();
    candIdx--;   // the list moved up by one, so the next try is the same position
  }
  candIdx++;
  if (candIdx >= current.cands.length) {
    // the saved versions could not play: search YouTube once for other uploads of the same song before giving up
    if (!current.podcast && !current._searched) {
      const s = current; s._searched = true;
      fetch('/api/search?q=' + encodeURIComponent(s.a + ' ' + s.t) + '&a=' + encodeURIComponent(s.a) + '&t=' + encodeURIComponent(s.t))
        .then(r => r.json()).catch(() => [])
        .then(c => {
          if (current !== s) return;
          const more = (Array.isArray(c) ? c : []).filter(x => !s.cands.some(y => y.id === x.id)).slice(0, 5);
          if (!more.length) return skipBroken();
          s.cands = s.cands.concat(more); lib.cache[s.key] = s.cands; saveLib();
          P().loadVideoById(s.cands[candIdx].id); setNow(s);
          clearTimeout(startWatch); startWatch = setTimeout(() => { if (!playing && !globalPaused) tryNextCand(); }, 14000);
        });
      return;
    }
    return skipBroken();
  }
  if (current.podcast) { const v = current.cands[candIdx]; current.a = v.channel; current.t = cleanTitle(v.title); }
  P().loadVideoById(current.cands[candIdx].id); setNow(current);
  clearTimeout(startWatch); startWatch = setTimeout(() => { if (!playing && !globalPaused) tryNextCand(); }, 14000);
}
function skipBroken() {
  if (!current) return;
  rlog('skip: no playable version', { song: current.key });
  if (!current.podcast) { lib.bad = lib.bad || {}; lib.bad[current.key] = Date.now(); saveLib(); }   // rested for 30 days, then tried again
  toast(`"${current.t}" cannot be played here right now. Skipping.`); played.push(current.key); current = null; busy = false; advance({ noCount: true });
}
const restingBroken = s => lib.bad && lib.bad[s.key] && Date.now() - lib.bad[s.key] < 30 * 864e5;

// ---------- finding similar songs automatically ----------
const cleanTitle = t => t.replace(/\s*[\(\[][^\)\]]*(official|audio|video|lyric|remaster|hd|4k|visuali[sz]er)[^\)\]]*[\)\]]/gi, '').replace(/\s*\|.*$/, '').trim();
function splitTitle(v) {
  const t = cleanTitle(v.title); const m = t.match(/^(.+?)\s[-–—]\s(.+)$/);
  if (m) return { a: m[1].trim(), t: m[2].trim() };
  return { a: v.channel.replace(/\s*-\s*Topic$/i, '').replace(/VEVO$/i, '').trim(), t };
}
async function discover(s, id, max = 6) {
  try {
    const list = await (await fetch('/api/similar?id=' + id)).json();
    let n = 0; const have = new Set(songs.map(x => x.key)); const ids = new Set(songs.flatMap(x => (x.cands || []).map(c => c.id)));
    for (const v of list) {
      if (n >= max) break; if (ids.has(v.id)) continue; const p = splitTitle(v);
      const d = { a: p.a, t: p.t, q: `${p.a} ${p.t}`, tags: (s.tags || []).slice(), genre: s.genre || '', user: true, discovered: true, from: s.key, cands: [v] };
      d.key = key(d); if (have.has(d.key)) continue; have.add(d.key); ids.add(v.id);
      lib.user.push(d); lib.cache[d.key] = d.cands; n++;
    }
    if (n) { buildSongs(); saveLib(); }
    return n;
  } catch { return 0; }
}
async function maybeDiscover(s) {
  if (lib.disc[s.key] || lib.user.filter(x => x.discovered).length >= MAX_DISCOVERED) return;
  lib.disc[s.key] = 1;
  const c = s.cands && s.cands[0]; if (!c) return;
  const n = await discover(s, c.id, 5);
  if (n && $('shLib').classList.contains('open')) renderLib();
}

// ---------- programming ----------
// ---------- choosing the next song ----------
// It follows the feeling of what is playing: the same or a neighbouring genre, shared lyric themes, a similar mood and
// energy (calmer late at night), then draws at random among the best dozen, so it never becomes predictable.
// Now and then it takes a detour: the same theme in a completely different musical world.
// It never repeats an artist within a few songs, and never replays songs heard in the last sessions.
let lastPick = { key: null, why: '' };
const famOf = g => (R.genreMap && R.genreMap[g] || {}).family;
function energyTarget() { const h = new Date().getHours(); return h < 6 ? 1.6 : h < 11 ? 2.6 : h < 17 ? 3 : h < 21 ? 2.6 : 2.1; }
function similarity(a, b) {
  if (!a) return 0;
  const ma = R.genreMap && R.genreMap[a.genre], mb = R.genreMap && R.genreMap[b.genre];
  let s = 0;
  if (a.genre && a.genre === b.genre) s += 3;
  else if (ma && ma.near.includes(b.genre)) s += 1.8;
  else if (ma && mb && ma.family === mb.family) s += 1;
  const shared = (b.tags || []).filter(t => (a.tags || []).includes(t)).length;
  s += Math.min(shared, 3) * 1.1;
  if (a.mood && a.mood === b.mood) s += 0.8;
  if (a.energy && b.energy) s -= 0.5 * Math.abs(a.energy - b.energy);
  return s;
}
function recentSets() {
  const hist = lib.hist || [];
  const n = Math.max(10, Math.min(250, Math.floor(songs.length * 0.6)));
  const recentKeys = new Set([...hist.slice(-n).map(h => h.k), ...played.slice(-n)]);
  const recentArtists = new Set(hist.slice(-6).map(h => (h.a || '').toLowerCase()));
  if (current && current.a) recentArtists.add(current.a.toLowerCase());
  const byKey = k => songs.find(s => s.key === k);
  const last = hist.slice(-2).map(h => byKey(h.k)).filter(Boolean).concat(current ? [current] : []);
  const streakGenre = last.length >= 3 && last.every(s => s.genre && s.genre === last[0].genre) ? last[0].genre : null;
  const streakFamily = last.length >= 3 && last.every(s => famOf(s.genre) && famOf(s.genre) === famOf(last[0].genre)) ? famOf(last[0].genre) : null;
  const l2 = last.slice(-2), pairGenre = l2.length === 2 && l2[0].genre && l2[0].genre === l2[1].genre ? l2[0].genre : null;
  return { recentKeys, recentArtists, streakGenre, streakFamily, pairGenre };
}
function choose(cur, rs) {
  const target = energyTarget();
  const curT = cur && cur.t ? cur.t.toLowerCase() : null;   // also never the same title twice in a row (two Hallelujahs)
  let pool = songs.filter(s => !rs.recentKeys.has(s.key) && !rs.recentArtists.has((s.a || '').toLowerCase()) && (!cur || s.key !== cur.key) && !restingBroken(s) && (s.t || '').toLowerCase() !== curT);
  if (pool.length < 15) pool = songs.filter(s => !cur || s.key !== cur.key);
  // never a 4th song of the same genre in a row (a strong match used to beat the penalty)
  if (rs.streakGenre) { const p2 = pool.filter(s => s.genre !== rs.streakGenre); if (p2.length >= 15) pool = p2; }
  if (cur && Math.random() < 0.18) {
    const detour = pool.filter(s => famOf(s.genre) && famOf(s.genre) !== "pop" && famOf(s.genre) !== famOf(cur.genre) && (s.tags || []).some(t => (cur.tags || []).includes(t)) && Math.abs((s.energy || 2) - (cur.energy || 2)) <= 1);
    if (detour.length) return { song: rnd(detour), why: 'detour' };
  }
  const scored = pool.map(s => ({ s, v: similarity(cur, s) - 0.35 * Math.abs((s.energy || 2) - target) + (favIdx(s.key) >= 0 ? 0.4 : 0) - (rs.pairGenre && s.genre === rs.pairGenre ? 1 : 0) - (rs.streakFamily && famOf(s.genre) === rs.streakFamily ? 1.5 : 0) - (famOf(s.genre) === "pop" ? 0.9 : 0) + Math.random() * 2.2 }));
  scored.sort((x, y) => y.v - x.v);
  const top = scored.slice(0, 12), low = top[top.length - 1].v;
  const w = top.map(x => Math.pow(x.v - low + 0.5, 2)); let r = Math.random() * w.reduce((p, q) => p + q, 0);
  for (let i = 0; i < top.length; i++) { r -= w[i]; if (r <= 0) return { song: top[i].s, why: 'match' }; }
  return { song: top[0].s, why: 'match' };
}
function lastHeard() { const h = (lib.hist || []).slice(-1)[0]; return h ? songs.find(s => s.key === h.k) : null; }
function pick() {
  if (upNext.length) return upNext.shift();
  if (batch) { const s = nextFromRun(); if (s) return s; }
  const c = choose(current || lastHeard(), recentSets());
  lastPick = { key: c.song.key, why: c.why };
  return c.song;
}
const takePlanned = () => { const p = planned; planned = null; return p || pick(); };
function planPreload() {
  if (planned) return; planned = pick(); if (!planned) return;
  const p = planned;
  resolve(p).then(c => { if (planned !== p || !c.length || !ytReady) return; const n = 1 - ai; try { setVol(pl[n], 0); pl[n].cueVideoById(c[0].id); preload = { key: p.key, idx: n }; } catch {} });
}
const clock = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const period = () => { const h = new Date().getHours(); return h < 5 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'; };
// {age}: the listener's age, from the birth date in R.listener (content19.js)
const listenerAge = () => { const b = R.listener && R.listener.born; if (!b) return ''; const [y, m, d] = b.split('-').map(Number), n = new Date(); return n.getFullYear() - y - ((n.getMonth() + 1 < m || (n.getMonth() + 1 === m && n.getDate() < d)) ? 1 : 0); };
const isBirthday = () => { const b = R.listener && R.listener.born; if (!b) return false; const n = new Date(); return b.slice(5) === String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0'); };
const sub = (text, s, x) => String(text || '').replace(/\{age\}/g, listenerAge()).replace(/\{label\}/g, x && x.label ? x.label : '').replace(/\{min\}/g, x ? x.min : '').replace(/\{topic\}/g, x ? x.topic : '').replace(/\{host\}/g, R.host).replace(/\{station\}/g, R.station).replace(/\{time\}/g, clock()).replace(/\{a\}/g, s ? s.a : '').replace(/\{t\}/g, s ? s.t : '');
const fill = sub;

// Shuffle bag: nothing repeats until everything in its pool has been used. Remembered between sessions.
const idOf = x => typeof x === 'string' ? x.slice(0, 48) : (x.id || x.title || x.name || JSON.stringify(x).slice(0, 48));
function fresh(name, arr) {
  if (!arr || !arr.length) return undefined;
  const used = (lib.used[name] = lib.used[name] || []);
  let avail = arr.filter(x => !used.includes(idOf(x)));
  if (!avail.length) { used.length = 0; avail = arr.slice(); }
  const x = avail[Math.floor(Math.random() * avail.length)];
  used.push(idOf(x)); if (used.length > 500) used.shift(); saveLib();
  return x;
}
const seedByKey = new Map(R.songs.map(s => [key(s), s]));
const scriptFor = s => (seedByKey.has(s.key) && R.songScripts) ? R.songScripts[s.t.toLowerCase()] : null;
const tagOf = s => rnd(s.tags && s.tags.length ? s.tags : ['absurd']);
const themeLine = s => { const tg = tagOf(s); return fresh('theme:' + tg, R.themeLine[tg] || R.themeLine.absurd); };
function genreNote(s) {
  const g = s.genre || ''; const base = R.genreNotes.find(x => x.g === g);
  let pool = [base && base.t, ...((R.genreMore || {})[g] || [])].filter(Boolean);
  if (!pool.length) pool = R.genreNotes.map(x => x.t);
  return fresh('genre:' + (g || 'any'), pool);
}
function introFor(s, prev) {
  // a small bridge when the new song shares a theme with the last one, or a word about the detour
  let bridge = '';
  const shared = prev ? (s.tags || []).filter(t => (prev.tags || []).includes(t)) : [];
  if (lastPick.key === s.key && lastPick.why === 'detour' && shared.length && R.detourLines) bridge = sub(fresh('detour', R.detourLines)).replace('{theme}', shared[0].replace('-', ' '));
  else if (shared.length && R.themeBridges && Math.random() < 0.45) bridge = fresh('tb:' + shared[0], R.themeBridges[shared[0]] || []) || '';
  const sc = scriptFor(s);
  if (sc && sc.intros && sc.intros.length) return (bridge ? bridge + ' ' : '') + sub(fresh('intro:' + s.key, sc.intros), s);
  const mine = s.user && !s.discovered;
  const parts = [];
  if (bridge) parts.push(bridge);
  parts.push(sub(fresh(mine ? 'newsong' : 'opener', mine ? R.newSongTemplates : R.introTemplates), s));
  if (s.fact) parts.push(s.fact);
  else {
    const r = Math.random();
    parts.push(r < 0.4 ? themeLine(s) : r < 0.78 && s.genre ? genreNote(s) : fresh('mood', R.moodLines));
    if (Math.random() < 0.3) parts.push(fresh('mood', R.moodLines));
  }
  return parts.join(' ');
}
function backFor(s) {
  if (s.podcast) return sub(s.midnight ? fresh('podoutro', R.podcastOutros) : fresh('podoutroday', R.podcastOutrosDay), s);
  const sc = scriptFor(s);
  if (sc && sc.backs && sc.backs.length) return sub(fresh('back:' + s.key, sc.backs), s);
  return sub(fresh('back', R.backTemplates), s) + (Math.random() < 0.6 ? ' ' + themeLine(s) : '');
}

// The host speaks after every 2 songs (or after every song, if you choose that in Settings).
const breakEvery = () => S.talk === 'high' ? 1 : 2;

// Programming: a cycle of 64 songs, with at most ONE big part per break, so the host never promises music
// that a long part is about to delay. After song 8, 24, 40, 56: commercials; 16: the Long Hour; 32: a long letter
// to you; 48: a conversation with another version of you; 64: a podcast episode. The cycle position is saved, so
// it continues where it stopped. The other breaks may get a small extra (a genre note, a letter + reading, an ident, a check-in).
const CYCLE = 64;
function bigPartAt(n) {
  const pos = n % CYCLE;
  if (pos === 0) return 'podcast';
  if (pos % 16 === 8) return 'ads';
  return { 16: 'talk', 32: 'longletter', 48: 'convo' }[pos] || null;
}
let lastBreakN = 0, podcastDue = false;

// Readings for the letters are read by a second voice (Sonia). A letter may name its reading; otherwise one that
// shares its themes is chosen, never one heard recently.
function pickReading(L) {
  const all = (R.readings || []).filter(r => !(r.tags || []).includes('mortality'));   // death as rest is never offered as the answer to a letter
  if (L.read) { const r = all.find(x => x.title === L.read); if (r) { const u = (lib.used.reading = lib.used.reading || []); u.push(idOf(r)); if (u.length > 500) u.shift(); return r; } }
  const used = (lib.used.reading = lib.used.reading || []);
  const tg = L.tags || [];
  const fresh1 = all.filter(r => !used.includes(idOf(r)));
  const pool = fresh1.length ? fresh1 : all;
  const match = pool.filter(r => (r.tags || []).some(t => tg.includes(t)));
  const r = rnd(match.length ? match : pool);
  if (!fresh1.length) used.length = 0;
  used.push(idOf(r)); if (used.length > 500) used.shift(); saveLib();
  return r;
}
function letterSeg(L, long) {
  const lines = [{ t: sub(fresh(long ? 'longletterbridge' : 'letterbridge', long ? R.longLetterBridges : R.letterBridges)) }];
  (Array.isArray(L.t) ? L.t : [L.t]).forEach(x => lines.push({ t: sub(x) }));
  const rd = pickReading(L);
  if (rd) {
    lines.push({ t: sub(fresh('sonia', R.soniaHandoffs)).replace(/\{title\}/g, rd.title).replace(/\{by\}/g, rd.by) });
    lines.push({ t: rd.t, w: 's' });
  }
  return { kind: long ? 'A Long Letter to You' : 'Letters to the Absurd, and to You', title: L.title, lines };
}

function makeBreak(prev, next, first) {
  const out = [], station = R.station;
  podcastDue = false;
  if (first) { out.push({ kind: station, lines: [{ t: sub(fresh('welcome:' + period(), R.welcomes[period()]), next) }] }); return out; }
  if (prev) out.push({ kind: station, lines: [{ t: backFor(prev) }] });
  let runAnnounced = false;
  if (prev && lastRunSong && prev.key === lastRunSong.key) { out.push({ kind: 'Genre run', title: lastRunSong.label, lines: [{ t: sub(fresh('runend', R.runEnds), null, { label: lastRunSong.label }) }] }); lastRunSong = null; runAnnounced = true; }
  lib.b = (lib.b || 0) + 1; saveLib();
  const n = lib.b * breakEvery();
  lastBreakN = n;
  const big = bigPartAt(n);
  podcastDue = big === 'podcast';
  const wantAd = big === 'ads';
  if (wantAd) { // announce the break, then: jingle, ad, jingle, ad, jingle, and a closing line
    out.push({ kind: 'Commercial break', adGroup: true, lines: [{ t: sub(fresh('breakintro', R.breakIntros)) }] });
    out.push({ kind: 'Jingle', adGroup: true, jingle: true });
    out.push({ kind: 'Commercial', adGroup: true, ad: true });
    out.push({ kind: 'Jingle', adGroup: true, jingle: true });
    out.push({ kind: 'Commercial', adGroup: true, ad: true });
    out.push({ kind: 'Jingle', adGroup: true, jingle: true });
    out.push({ kind: 'Commercial break', adGroup: true, lines: [{ t: sub(fresh('breakoutro', R.breakOutros)) }] });
  }
  if (big === 'talk') {
    const tg = next.tags || [];
    const match = R.talks.filter(t => t.tags.some(x => tg.includes(x)));
    const t = fresh('talk', match.length && Math.random() < 0.6 ? match : R.talks);
    out.push({ kind: 'The Long Hour', title: t.title, lines: [{ t: sub(fresh('talkbridge', R.talkBridges).replace(/\{title\}/g, t.title)) }, ...t.p.map(x => ({ t: sub(x) }))] });
  }
  if (big === 'longletter' && (R.longLetters || []).length) {
    out.push(letterSeg(fresh('longletter', R.longLetters.filter(x => !x.birthday)), true));   // the birthday letter has its own day (below)
  }
  if (big === 'convo' && (R.conversations || []).length) {
    const c = fresh('convo', R.conversations);
    out.push({ kind: 'Conversations with You', title: c.title, lines: [{ t: sub(c.intro) }, ...c.lines.map(l => ({ t: sub(l.t), w: l.w }))] });
  }
  // small extras: only on breaks with no big part, and never right after a podcast (its outro already says "back to the music")
  const today = new Date().toDateString(), bdayLetter = (R.longLetters || []).find(x => x.birthday);
  if (!big && !(prev && prev.podcast) && !startAnnounce && bdayLetter && isBirthday() && lib.bdayDone !== today) {
    lib.bdayDone = today; saveLib(); out.push(letterSeg(bdayLetter, true));   // on the birthday: its own letter, at the first free break of the day
  } else if (!big && !runAnnounced && !(prev && prev.podcast) && !startAnnounce && Math.random() < 0.8) {
    const r = Math.random();
    if (r < 0.24) out.push({ kind: 'On the genre', title: next.genre, lines: [{ t: genreNote(next) }] });
    else if (r < 0.72) out.push(letterSeg(fresh('letter', R.letters), false));
    else if (r < 0.9) out.push({ kind: station, lines: [{ t: sub(fresh('ident', R.idents), next) }] });
    else out.push({ kind: 'Check-in', lines: [{ t: sub(fresh('checkin', R.checkins)) }] });
  }
  // a genre run is announced last, right before its first song; if a podcast comes first, it waits until after it
  if (startAnnounce && !podcastDue) { out.push({ kind: 'Genre run', title: startAnnounce, lines: [{ t: sub(fresh('runstart', R.runStarts), null, { label: startAnnounce }) }] }); startAnnounce = null; }
  return out;
}

// ---------- commercial break: jingle, ad, jingle, ad, jingle (audio only, the vinyl keeps spinning) ----------
let breakSkip = null, adHook = null, adPool = [];
const getCtx = () => { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); return actx; };
// Commercials: on the PC the helper keeps the list (your playlist, ads found by search, and your edits) and a copy
// goes to the cloud; on the phone the list comes from the cloud. cloudAds = { edits, pool, savedAt } as stored there.
const parseJ = (s, d) => { try { return JSON.parse(s); } catch { return d; } };
async function loadAds() {
  if (HELPER) { try { const r = await (await fetch('/api/ads')).json(); if (r && Array.isArray(r.items) && r.items.length) adPool = r.items; } catch {} return; }
  if (cloudAds) adPool = parseJ(cloudAds.pool, []).filter(v => !v.removed);
}
let lastAdsPushed = '';
async function pushAdsToCloud() {   // after an edit on the PC (or at start): send the helper's list to the cloud
  if (!HELPER || !window.Cloud || !Cloud.user) return;
  try {
    const [e, all] = await Promise.all([fetch('/api/ads/edits').then(r => r.json()), fetch('/api/ads/all').then(r => r.json())]);
    const edits = { removed: e.removed || [], added: e.added || [] }, pool = all.items || [];
    const sig = JSON.stringify([edits, pool.map(v => v.id + (v.removed ? '-' : ''))]);
    if (sig === lastAdsPushed) return;
    lastAdsPushed = sig; await Cloud.pushAds(edits, pool);
  } catch {}
}
async function syncAds() {   // at start: edits made on another device (newer than the helper's) are applied here first
  if (HELPER && cloudAds) {
    try {
      const e = await (await fetch('/api/ads/edits')).json();
      if ((cloudAds.savedAt || 0) > (e.at || 0)) await fetch('/api/ads/edits', { method: 'POST', body: cloudAds.edits || '{}' });
    } catch {}
  }
  await loadAds(); pushAdsToCloud();
}
if (window.Cloud) Cloud.onRemoteAds = a => { cloudAds = a; syncAds(); };
const nextAd = () => adPool.length ? fresh('adpick', adPool) : null;   // a shuffle bag: no ad repeats until all have played

async function runJingle() {
  $('kind').textContent = 'jingle'; $('capKind').textContent = 'Commercial break'; $('capText').textContent = '♪';
  bedOff(0.5);
  const j = Jingles.play(getCtx(), S.jingle || Jingles.defaultId);
  breakSkip = () => j.stop();
  await j.done; breakSkip = null;
}
// Plays one ad on the idle player. Resolves true when it played (or you skipped it), false when it could not load.
function playAdVideo(v) {
  return new Promise(res => {
    const idx = 1 - ai, p = pl[idx]; let started = false, done = false, tick;
    const finish = ok => { if (done) return; done = true; clearInterval(tick); adHook = null; breakSkip = null; try { p.pauseVideo(); } catch {} res(ok); };
    adHook = { idx, state: s => { if (s === YT.PlayerState.PLAYING) { started = true; setLive(true); } else if (s === YT.PlayerState.ENDED) finish(true); }, error: () => finish(false) };
    breakSkip = () => finish(true);                       // the Next button skips this ad
    preload = null;
    try { p.unMute(); } catch {}
    setVol(p, Math.round(S.vol * 0.9)); p.loadVideoById(v.id);
    // not started within 14 s: the caller tries the next ad; a safety cap ends an ad that never ends. Paused time does not count.
    let waited = 0, ran = 0; const capMs = (Math.min(v.seconds || 90, 150) + 12) * 1000;
    tick = setInterval(() => { if (globalPaused) return; waited += 500; ran += 500; if (!started && waited >= 14000) finish(false); else if (ran >= capMs) finish(started); }, 500);
  });
}
async function runAd(id) {
  $('kind').textContent = 'commercial';
  for (let tries = 0; tries < 8 && id === runId; tries++) {
    const ad = nextAd();
    if (!ad) { toast('No commercials loaded. If you just updated the radio, close it completely and open it again.'); return; }
    $('capKind').textContent = 'Commercial'; $('capText').textContent = ad.title;
    console.info('[radio] ad', ad.src, ad.id, ad.title);
    curAd = ad; $('btnAdRemove').style.display = '';
    const played = await playAdVideo(ad);
    curAd = null; $('btnAdRemove').style.display = 'none';
    if (played) return;
    if (id !== runId) return;
  }
}

// ---------- managing the commercials: remove some, add others ----------
let curAd = null, adTab = 'on';
async function adsEditCall(body) {
  if (!HELPER) return cloudAdsEdit(body);
  const r = await fetch('/api/ads/edit', { method: 'POST', body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Something went wrong.');
  await loadAds(); pushAdsToCloud(); return j;
}
// Without the helper (the phone): remove and restore work on the cloud copy; adding a new ad needs the PC.
async function cloudAdsEdit(body) {
  if (!window.Cloud || !Cloud.user || !cloudAds) throw new Error('Sign in (Settings > Cloud sync) to change the commercials here.');
  if (body.action === 'add') throw new Error('Adding a new commercial needs the radio on your PC.');
  const edits = Object.assign({ removed: [], added: [] }, parseJ(cloudAds.edits, {})), pool = parseJ(cloudAds.pool, []);
  const id = body.id, gone = body.action === 'remove';
  edits.removed = edits.removed.filter(x => x !== id); if (gone) edits.removed.push(id);
  pool.forEach(v => { if (v.id === id) v.removed = gone; });
  await Cloud.pushAds(edits, pool);
  cloudAds = { edits: JSON.stringify(edits), pool: JSON.stringify(pool), savedAt: Date.now() };
  await loadAds(); return { ok: true };
}
$('btnAdRemove').onclick = async () => {   // the ad that is playing right now
  if (!curAd) return; const ad = curAd;
  try { await adsEditCall({ action: 'remove', id: ad.id }); toast('That ad will not play again. You can restore it in Settings > Manage commercials.'); } catch (e) { toast(e.message); }
  if (breakSkip) { const b = breakSkip; breakSkip = null; b(); }
};
const fmtSec = s => s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : '';
async function renderAds() {
  document.querySelectorAll('#adTabs button').forEach(b => b.classList.toggle('on', b.dataset.v === adTab));
  let items = [];
  if (HELPER) { try { items = (await (await fetch('/api/ads/all')).json()).items || []; } catch {} }
  else if (cloudAds) items = parseJ(cloudAds.pool, []);
  const on = items.filter(v => !v.removed), off = items.filter(v => v.removed);
  $('adCount').textContent = `· ${on.length} playing, ${off.length} removed`;
  const l = $('adList'); l.innerHTML = '';
  const shown = adTab === 'on' ? on : off;
  if (!shown.length) l.innerHTML = `<p style="color:var(--mute);font-size:13px;line-height:1.5">${adTab === 'on' ? 'No commercials are playing. Add some above.' : 'Nothing removed.'}</p>`;
  const badge = { playlist: 'playlist', search: 'found', mine: 'yours' };
  shown.forEach(v => {
    const d = document.createElement('div'); d.className = 'item';
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn"></button>`;
    d.querySelector('b').textContent = v.title; d.querySelector('span').textContent = `${fmtSec(v.seconds)} · ${badge[v.src] || v.src}`;
    const b = d.querySelector('.mini-btn'); b.textContent = adTab === 'on' ? '✕' : 'Restore'; b.title = adTab === 'on' ? 'Never play this ad' : 'Play this ad again';
    b.onclick = async () => { try { await adsEditCall({ action: adTab === 'on' ? 'remove' : 'restore', id: v.id }); renderAds(); } catch (e) { toast(e.message); } };
    l.appendChild(d);
  });
}
async function addAd(idOrLink) {
  try { const r = await adsEditCall({ action: 'add', id: idOrLink }); toast(r.already ? `"${r.added.title}" is already in the list.` : `Added "${r.added.title}".`); $('adq').value = ''; $('adRes').innerHTML = ''; adTab = 'on'; renderAds(); }
  catch (e) { toast(e.message); }
}
async function adGo() {
  const q = $('adq').value.trim(); if (!q) return;
  if (!HELPER) { $('adRes').innerHTML = `<p style="color:var(--mute)">${NEEDS_PC}</p>`; return; }
  if (/youtu|^[\w-]{11}$/.test(q)) return addAd(q);   // a link or a video id: add it directly
  $('adRes').innerHTML = '<p style="color:var(--mute)">Searching…</p>';
  try {
    const r = await (await fetch('/api/ads/search?q=' + encodeURIComponent(q))).json();
    if (!r.length) throw 0;
    $('adRes').innerHTML = '';
    r.forEach(v => {
      const d = document.createElement('div'); d.className = 'item';
      d.innerHTML = `<img src="https://i.ytimg.com/vi/${v.id}/default.jpg" width="48" height="36" style="border-radius:6px;object-fit:cover"><div class="meta"><b></b><span></span></div><button class="btn" style="padding:6px 11px">Add</button>`;
      d.querySelector('b').textContent = v.title; d.querySelector('span').textContent = `${v.channel} · ${fmtSec(v.seconds)}`;
      d.querySelector('button').onclick = () => addAd(v.id);
      $('adRes').appendChild(d);
    });
  } catch { $('adRes').innerHTML = '<p style="color:var(--mute)">Nothing found. Try other words, or paste a YouTube link.</p>'; }
}
function openAds() { $('adRes').innerHTML = ''; renderAds(); openSheet('shAds'); }

async function runSegments(segs, id) {
  for (const seg of segs) {
    if (id !== runId) return false;
    $('vinyl').classList.add('talk');
    $('kind').textContent = seg.kind.toLowerCase();
    $('capKind').textContent = seg.title ? `${seg.kind} · ${seg.title}` : seg.kind;
    if (seg.jingle) { await runJingle(); continue; }
    if (seg.ad) { await runAd(id); continue; }
    if (seg.adGroup) bedOff(0.5); else bedOn();
    for (const l of seg.lines) {
      if (id !== runId) return false;
      if (seg.adGroup) breakSkip = () => { speechSynthesis.cancel(); try { if (curAudio && curAudio.onended) curAudio.onended(); } catch {} };   // Next skips the spoken line
      if (l.w === 's') $('capKind').textContent = 'Sonia · reading';
      else if (seg.lines.some(x => x.w === 's')) $('capKind').textContent = seg.title ? `${seg.kind} · ${seg.title}` : seg.kind;
      await say(l.t, l.w && l.w !== 'h' ? l.w : 'h');
      breakSkip = null;
      if (id !== runId) return false;
      await sleep(seg.lines.length > 3 ? 250 : 120);
    }
  }
  return id === runId;
}

// ---------- midnight podcast (00:00 to 01:00) ----------
const forceHour = new URLSearchParams(location.search).get('hour'); // for testing: open /?hour=0
const inMidnight = () => (forceHour !== null ? +forceHour : new Date().getHours()) === 0;
let podDone = false;
async function findPodcast() {
  lib.pod = lib.pod || [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const topic = fresh('podtopic', R.podcastTopics);
    try {
      const r = await (await fetch('/api/podcast?q=' + encodeURIComponent(topic.q))).json();
      if (!Array.isArray(r)) continue;
      const fresh5 = r.filter(x => !lib.pod.includes(x.id)).slice(0, 5);
      if (!fresh5.length) continue;
      const v = rnd(fresh5);
      return { topic, v, alts: fresh5.filter(x => x.id !== v.id) };
    } catch {}
  }
  return null;
}
async function playPodcast(pod, prev, opts, id) {
  const midnight = !opts.scheduled;
  if (midnight) podDone = true; // the end-of-cycle podcast does not use up the midnight one
  const v = pod.v;
  const ep = { a: v.channel, t: cleanTitle(v.title), key: 'podcast|' + v.id, podcast: true, midnight, tags: [], genre: 'podcast', cands: [v, ...pod.alts] };
  lib.pod.push(v.id); if (lib.pod.length > 300) lib.pod.shift(); saveLib();
  const old = P();
  if (!opts.first) fadeP(old, 0, 3000).then(() => { try { if (pl[ai] === old) old.pauseVideo(); } catch {} });
  bedOn();
  const segs = [];
  if (opts.first) segs.push({ kind: R.station, lines: [{ t: sub(fresh('welcome:' + period(), R.welcomes[period()]), ep) }] });
  else if (prev) segs.push({ kind: R.station, lines: [{ t: backFor(prev) }] });
  const extra = { min: Math.max(1, Math.round(v.seconds / 60)), topic: pod.topic.label };
  segs.push({ kind: midnight ? 'Midnight podcast' : 'Podcast', title: pod.topic.label, lines: [{ t: sub(midnight ? fresh('podintro', R.podcastIntros) : fresh('podintroday', R.podcastIntrosDay), ep, extra) }] });
  console.info('[radio] midnight podcast', ep.t, '|', ep.a, '|', extra.min + ' min');
  const ok = await runSegments(segs, id);
  if (!ok) return;
  const okEp = await startSong(ep, S.vol);
  if (id !== runId) return;
  if (!okEp) { busy = false; bedOff(); return advance({ noCount: true }); }
  $('vinyl').classList.remove('talk');
  bedOff(2.5);
  caption(R.host, '');
  busy = false;
}

async function advance(opts = {}) {
  if (globalPaused) clearPause();   // anything new starts un-paused
  stopSpeech();
  const id = runId;
  busy = true;
  const prev = opts.prev !== undefined ? opts.prev : current;
  const afterPod = !!(prev && prev.podcast);
  // between midnight and 1 a.m., once per time you open the radio, an episode replaces the normal plan
  let pod = null;
  if (started && inMidnight() && !podDone && !opts.silent && !opts.song && !afterPod) {
    pod = await findPodcast();
    if (id !== runId) return;
  }
  nextPending = false; nextOverride = null;
  let next = pod ? null : (opts.song || takePlanned());
  if (!pod && !next) { busy = false; return; }
  if (prev && !afterPod) { if (opts.prev !== null) { history.push(prev); if (history.length > 60) history.shift(); } if (!played.includes(prev.key)) played.push(prev.key); }
  current = null; updateHeart();   // the heart is only active while a song is playing
  if (pod) return playPodcast(pod, prev, opts, id);
  if (!opts.noCount && !afterPod) songsSinceBreak++;
  const endRunNow = !!(prev && lastRunSong && prev.key === lastRunSong.key);
  const talk = !opts.silent && (opts.first || afterPod || endRunNow || songsSinceBreak >= breakEvery() || opts.forceTalk);
  console.info('[radio] advance', { next: next.t, talk, count: songsSinceBreak, every: breakEvery() });
  if (talk) songsSinceBreak = 0;
  const old = P();
  if (!talk) {
    // no commentary this time: crossfade straight into the next song
    $('kind').textContent = 'tuning'; caption(R.host, ''); $('vinyl').classList.remove('talk');
    const okQ = await startSong(next, S.vol, opts.quick ? 1200 : 3500);
    if (id !== runId) return;
    if (!okQ) { busy = false; return advance({ noCount: true }); }
    busy = false; return;
  }
  // commentary: let the old song fade under the host, with a soft bed so the air is never empty
  if (!opts.first) fadeP(old, 0, 3000).then(() => { try { if (pl[ai] === old) old.pauseVideo(); } catch {} });
  bedOn();
  nextPending = true; // a song you suggest while the host is talking takes the place of this one
  resolve(next);
  const segs = makeBreak(prev, next, opts.first);
  console.info('[radio] break', lib.b, segs.map(s => s.kind + (s.title ? ' · ' + s.title : '')));
  const ok = await runSegments(segs, id);
  if (!ok) return;
  if (nextOverride) { planned = next; next = nextOverride; nextOverride = null; resolve(next); }
  if (podcastDue && !opts.first) { // the end of each 64-song cycle: an episode, then the planned song comes after
    const pod = await findPodcast();
    if (id !== runId) return;
    if (pod) { planned = next; return playPodcast(pod, null, { scheduled: true }, id); }
  }
  $('kind').textContent = 'up next';
  const okT = await startSong(next, 14);
  if (id !== runId) return;
  if (!okT) { busy = false; bedOff(); return advance({ noCount: true }); }
  nextPending = false;
  $('vinyl').classList.add('talk');
  $('capKind').textContent = R.host;
  await say(introFor(next, prev), 'h');
  $('vinyl').classList.remove('talk');
  if (id !== runId) return;
  bedOff(2.5);
  caption(R.host, '');
  busy = false;
  await fadeP(P(), S.vol, 3000);
}

// ---------- genre runs: the next 20 to 40 songs come from one genre, then back to the normal mix ----------
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function startRun(id) {
  let favList = null, pack = (R.runs || []).find(p => p.id === id);
  if (id === 'fav') {   // a run made of your favorites
    favList = (lib.fav || []).map(favToSong);
    if (!favList.length) return toast('No favorites yet. Press the heart on a song you love.');
    pack = { id: 'fav', label: 'Your favorites', short: 'Favorites', genres: [], langs: [], songs: [], tags: [], genre: '' };
  }
  if (!pack) return;
  const size = Math.random() < 0.15 ? 40 : 20 + Math.floor(Math.random() * 11);
  const rs = recentSets();
  const fits = songs.filter(s => (pack.genres || []).includes(s.genre));
  const fresher = fits.filter(s => !rs.recentKeys.has(s.key));          // songs not heard lately come first
  const list = favList ? shuffle(favList) : [...shuffle(fresher), ...shuffle(fits.filter(s => rs.recentKeys.has(s.key)))];
  if (!list.length) return toast('No songs of that genre in the library yet.');
  batch = { id, label: pack.label, short: pack.short, left: Math.min(size, list.length), list };
  planned = null; preload = null; startAnnounce = pack.label; songsSinceBreak = 99; lastRunSong = null;
  toast(`Genre run: ${pack.short}, about ${batch.left} songs. It starts after this song.`);
  updateRunUI();
}
function stopRun() { batch = null; startAnnounce = null; planned = null; preload = null; toast('Back to the normal mix.'); updateRunUI(); }
function nextFromRun() {
  const lastA = current && current.a ? current.a.toLowerCase() : '';
  const s = batch.list.find(x => !played.includes(x.key) && !(current && x.key === current.key) && (x.a || '').toLowerCase() !== lastA) || batch.list.find(x => !played.includes(x.key) && !(current && x.key === current.key));
  if (!s) { batch = null; updateRunUI(); return null; }
  batch.left--;
  if (batch.left <= 0) { lastRunSong = { key: s.key, label: batch.label }; batch = null; }
  updateRunUI();
  return s;
}
function updateRunUI() {
  $('btnRun').classList.toggle('on', !!batch);
  $('runInfo').style.display = batch ? '' : 'none';
  if (batch) $('runInfo').textContent = `${batch.short} run · ${batch.left} songs left`;
}
function openRun() {
  const l = $('runList'); l.innerHTML = '';
  const add = (label, sub, active, fn) => { const d = document.createElement('div'); d.className = 'item' + (active ? ' now' : ''); d.innerHTML = '<div class="meta"><b></b><span></span></div>'; d.querySelector('b').textContent = label; d.querySelector('span').textContent = sub; d.onclick = () => { openSheet(null); fn(); }; l.appendChild(d); };
  add('Off: normal mix', 'The usual wandering mix of everything', !batch, () => { if (batch) stopRun(); else toast('Already on the normal mix.'); });
  const nFav = (lib.fav || []).length;
  add('♥ Your favorites', nFav ? `${nFav} songs you hearted` : 'Press the heart on a song to add it here', batch && batch.id === 'fav', () => startRun('fav'));
  (R.runs || []).forEach(p => { const n = songs.filter(s => p.genres.includes(s.genre)).length; add(p.label, `${n} songs`, batch && batch.id === p.id, () => startRun(p.id)); });
  openSheet('shRun');
}

// ---------- controls ----------
// Pause stops everything that makes sound, whatever the radio is doing: the song (either player), the host's voice,
// a jingle, an ad and the soft ambient bed. Play continues exactly where each one was.
let globalPaused = false, pausedPlayers = [];
function pauseAll() {
  globalPaused = true; pausedPlayers = [];
  pl.forEach((p, i) => { try { const s = p.getPlayerState(); if (s === 1 || s === 3) { p.pauseVideo(); pausedPlayers.push(i); } } catch {} });
  try { speechSynthesis.pause(); } catch {}
  try { if (curAudio && !curAudio.paused) curAudio.pause(); } catch {}
  try { if (actx && actx.state === 'running') actx.suspend(); } catch {}
  playing = false; setPlayIcon(false); setLive(false);
}
function resumeAll() {
  globalPaused = false;
  try { if (actx && actx.state === 'suspended') actx.resume(); } catch {}
  try { speechSynthesis.resume(); } catch {}
  try { if (curAudio && curAudio.paused && !curAudio.ended) curAudio.play().catch(() => {}); } catch {}
  pausedPlayers.forEach(i => { try { pl[i].playVideo(); } catch {} }); pausedPlayers = [];
  setPlayIcon(true); if (speaking || busy) setLive(true);
}
function clearPause() {   // leaving the paused state because something new starts (Next, Previous...)
  globalPaused = false; pausedPlayers = [];
  try { if (actx && actx.state === 'suspended') actx.resume(); } catch {}
  try { speechSynthesis.cancel(); speechSynthesis.resume(); } catch {}
  setPlayIcon(true);
}
async function togglePlay() {
  if (!started) return tuneIn();
  if (!ytReady) return;
  if (globalPaused) resumeAll(); else pauseAll();
}
function next() {
  if (!started) return;
  if (globalPaused) resumeAll();
  if (breakSkip) { const b = breakSkip; breakSkip = null; b(); return; }   // during a commercial break: skip the current jingle, ad or spoken line
  try { // learn where a silent tail begins: if you skip near the end, trim there from now on
    if (current && !current.podcast && playing && !busy) { const d = P().getDuration(), c = P().getCurrentTime(); if (d > 60 && d - c < 90 && d - c > 3) { lib.trim[current.key] = Math.max(0, c - 1); saveLib(); toast('Got it. I will end this song right here from now on.'); } }
  } catch {}
  advance({ quick: true });
}
function prev() { if (started && globalPaused) resumeAll(); if (!started || !history.length) return toast('No earlier song yet.'); const p = history.pop(); advance({ song: p, prev: null, silent: true, noCount: true, quick: true }); }
async function tuneIn() {
  started = true; $('tune').style.display = 'none';
  if (!voices.length) loadVoices();
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {}
  setPlayIcon(true);
  await advance({ first: true });
}

// ---------- panels ----------
const sheets = ['shAdd', 'shLib', 'shSet', 'shRun', 'shAds', 'shVer', 'shReport'];
$('btnReport').onclick = () => {
  const head = [`device: ${/Android|iPhone|iPad/i.test(navigator.userAgent) ? (navigator.userAgent.match(/Android[^;)]*|iPhone|iPad/) || [''])[0] : 'computer'} · ${(navigator.userAgent.match(/(EdgA|Edg|Brave|SamsungBrowser|Firefox|Chrome)\/[\d.]+/) || ['browser'])[0]}`,
    `helper on this device: ${HELPER ? 'yes' : 'no'} · cloud: ${window.Cloud && Cloud.user ? 'signed in' : 'not signed in'} · now: ${current ? current.a + ' - ' + current.t : 'nothing'}`, ''];
  $('reportText').textContent = head.concat(diag.slice().reverse()).join('\n') || 'Nothing recorded yet.';
  openSheet('shReport');
};
function openSheet(id) { sheets.forEach(s => $(s).classList.toggle('open', s === id)); }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => openSheet(null));

$('addThemes').innerHTML = THEMES.map(t => `<label><input type="checkbox" value="${t}"><span>${t}</span></label>`).join('');
async function doSearch() {
  const q = $('addq').value.trim(); if (!q) return;
  if (!HELPER) { $('addRes').innerHTML = `<p style="color:var(--mute)">${NEEDS_PC}</p>`; return; }
  $('addRes').innerHTML = '<p style="color:var(--mute)">Searching…</p>';
  try {
    const r = await (await fetch('/api/search?q=' + encodeURIComponent(q))).json();
    if (!r.length) throw 0;
    $('addRes').innerHTML = '';
    r.slice(0, 6).forEach(v => {
      const d = document.createElement('div'); d.className = 'item';
      d.innerHTML = `<img src="https://i.ytimg.com/vi/${v.id}/default.jpg" width="48" height="36" style="border-radius:6px;object-fit:cover"><div class="meta"><b></b><span></span></div><button class="btn" style="padding:6px 11px">Add</button>`;
      d.querySelector('b').textContent = cleanTitle(v.title); d.querySelector('span').textContent = `${v.channel} · ${fmt(v.seconds)}`;
      d.querySelector('button').onclick = () => addSong(v, q);
      $('addRes').appendChild(d);
    });
  } catch { $('addRes').innerHTML = '<p style="color:var(--mute)">Nothing found, or the search failed. Try different words.</p>'; }
}
async function addSong(v, q) {
  // a suggested song is added to your library and plays next. Nothing else is pulled in with it.
  const ts = [...document.querySelectorAll('#addThemes input:checked')].map(i => i.value);
  const { a, t } = splitTitle(v);
  const draft = { a, t, q, tags: ts.length ? ts : (current && current.tags && current.tags.length ? current.tags.slice() : ['absurd']), genre: '', user: true, cands: [v], added: Date.now() };
  draft.key = key(draft);
  let s = songs.find(x => (x.cands || []).some(c => c.id === v.id)) || songs.find(x => x.key === draft.key);
  const isNew = !s;
  if (isNew) { lib.user.push(draft); lib.cache[draft.key] = draft.cands; buildSongs(); saveLib(); s = songs.find(x => x.key === draft.key); }
  queueNext(s);
  openSheet(null); $('addq').value = ''; document.querySelectorAll('#addThemes input').forEach(i => i.checked = false);
  toast(isNew ? '"' + s.t + '" was added to your library and plays next.' : '"' + s.t + '" plays next.');
}
function queueNext(song) {
  if (nextPending && !nextOverride) { nextOverride = song; return; } // the host is mid-break: swap it in before the next song starts
  planned = null; preload = null; upNext.push(song);
}
$('addGo').onclick = doSearch; $('addq').onkeydown = e => { if (e.key === 'Enter') doSearch(); };
$('btnAdd').onclick = () => { openSheet('shAdd'); setTimeout(() => $('addq').focus(), 50); };

// ---------- favorites ----------
let libTab = 'all';
const favIdx = k => (lib.fav || []).findIndex(f => f.key === k);
function updateHeart() {
  const b = $('btnHeart'); if (!b) return;
  const on = !!current && favIdx(current.key) >= 0;
  b.classList.toggle('on', on); b.disabled = !current || !!current.podcast;
  b.title = on ? 'Remove from favorites' : 'Add to favorites'; b.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function toggleFav() {
  if (!current || current.podcast) return;
  lib.fav = lib.fav || []; const i = favIdx(current.key);
  if (i >= 0) { lib.fav.splice(i, 1); markDeleted('fav', current.key); toast('Removed from your favorites.'); }
  else {
    const c = current.cands && (current.cands[candIdx] || current.cands[0]);   // remember the exact version that is playing
    lib.fav.push({ key: current.key, a: current.a, t: current.t, id: c ? c.id : null, tags: (current.tags || []).slice(), genre: current.genre || '', ts: Date.now() });
    toast(`"${current.t}" is now in your favorites.`);
  }
  saveLib(); updateHeart(); if ($('shLib').classList.contains('open')) renderLib();
}
function favToSong(f) {
  const ex = songs.find(s => s.key === f.key);
  const cands = f.id ? [{ id: f.id, title: f.t, channel: f.a, seconds: 0 }] : (ex && ex.cands);
  return Object.assign({}, ex || { a: f.a, t: f.t, q: f.a + ' ' + f.t, tags: f.tags && f.tags.length ? f.tags : ['absurd'], genre: f.genre || '' }, { key: f.key, cands });
}
function renderFav() {
  const l = $('libList'); l.innerHTML = ''; const f = lib.fav || [];
  $('libCount').textContent = `· ${f.length} favorites`;
  if (!f.length) { l.innerHTML = '<p style="color:var(--mute);font-size:13px;line-height:1.5">No favorites yet. Press the heart next to the song title while a song plays, and it will be kept here.</p>'; return; }
  const run = document.createElement('div'); run.innerHTML = '<button class="btn" style="width:100%;margin-bottom:4px">Play my favorites</button>';
  run.querySelector('button').onclick = () => { openSheet(null); startRun('fav'); };
  l.appendChild(run);
  f.slice().reverse().forEach(x => {
    const d = document.createElement('div'); d.className = 'item' + (current && current.key === x.key ? ' now' : '');
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn" title="Play next">&#9654;</button><button class="mini-btn" title="Remove from favorites">&#10005;</button>`;
    d.querySelector('b').textContent = x.t; d.querySelector('span').textContent = x.a;
    const [pn, rm] = d.querySelectorAll('.mini-btn');
    const playNext = () => { queueNext(favToSong(x)); toast(`"${x.t}" plays next.`); };
    d.querySelector('.meta').onclick = playNext; pn.onclick = playNext;
    rm.onclick = () => { lib.fav = lib.fav.filter(y => y.key !== x.key); markDeleted('fav', x.key); saveLib(); updateHeart(); renderLib(); };
    l.appendChild(d);
  });
}
function renderLib() {
  document.querySelectorAll('#libTabs button').forEach(b => b.classList.toggle('on', b.dataset.v === libTab));
  if (libTab === 'fav') return renderFav();
  $('libCount').textContent = `· ${songs.length} songs`;
  const l = $('libList'); l.innerHTML = '';
  songs.forEach(s => {
    const d = document.createElement('div'); d.className = 'item' + (current && current.key === s.key ? ' now' : '');
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn" title="Remove">✕</button>`;
    d.querySelector('b').textContent = s.t; d.querySelector('span').textContent = `${s.a} · ${(R.genreMap && R.genreMap[s.genre] || {}).name || 'genre not set'}${s.user ? ' · yours' : ''}`;
    d.querySelector('.meta').onclick = () => { openSheet(null); planned = null; preload = null; advance({ song: s, quick: true }); };
    const [rm] = d.querySelectorAll('.mini-btn');
    rm.onclick = () => { lib.removed.push(s.key); lib.removedTs = lib.removedTs || {}; lib.removedTs[s.key] = Date.now(); if (lib.user.some(x => x.key === s.key)) markDeleted('user', s.key); lib.user = lib.user.filter(x => x.key !== s.key); buildSongs(); saveLib(); renderLib(); };
    l.appendChild(d);
  });
}
$('btnRun').onclick = openRun;
$('btnHeart').onclick = toggleFav;
$('btnAds').onclick = openAds; $('adGo').onclick = adGo; $('adq').onkeydown = e => { if (e.key === 'Enter') adGo(); };
document.querySelectorAll('#adTabs button').forEach(b => b.onclick = () => { adTab = b.dataset.v; renderAds(); });
document.querySelectorAll('#libTabs button').forEach(b => b.onclick = () => { libTab = b.dataset.v; renderLib(); });
$('btnLib').onclick = () => { renderLib(); openSheet('shLib'); };

function seg(id, k, cast = v => v) { const el = $(id); const paint = () => el.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S[k]) === b.dataset.v)); el.querySelectorAll('button').forEach(b => b.onclick = () => { S[k] = cast(b.dataset.v); paint(); saveLib(); if (k === 'sleep') setSleep(); }); paint(); }
function setSleep() { sleepAt = S.sleep ? Date.now() + S.sleep * 60000 : 0; if (S.sleep) toast(`Sleep timer set: ${S.sleep} minutes.`); }
$('btnSet').onclick = () => { openSheet('shSet'); seg('segTalk', 'talk'); seg('segSleep', 'sleep', Number); seg('segTrim', 'trim', Number); $('rate').value = S.rate; loadVoices(); };
$('voiceSel').onchange = e => { S.voice = e.target.value; saveLib(); };
$('rate').oninput = e => { S.rate = +e.target.value; saveLib(); };
$('btnTest').onclick = () => { stopSpeech(); say(`Hello. This is ${R.host}, and this is how I sound on Pale Blue Dot Radio.`); };
$('btnReset').onclick = () => { lib.removed.forEach(k => markDeleted('removed', k)); lib.removed = []; buildSongs(); saveLib(); toast('All songs restored.'); };

$('vol').oninput = e => { S.vol = +e.target.value; if (ytReady && !busy && !P()._fading) setVol(P(), S.vol); saveLib(); };
$('btnWrong').onclick = openVersions;
$('btnPlay').onclick = togglePlay; $('btnNext').onclick = next; $('btnPrev').onclick = prev; $('btnTune').onclick = tuneIn;
$('bar').onclick = e => { if (!ytReady || !playing) return; const r = $('bar').getBoundingClientRect(); P().seekTo(P().getDuration() * (e.clientX - r.left) / r.width, true); };
$('btnMini').onclick = () => { const m = document.body.classList.toggle('mini'); try { window.resizeTo(m ? 420 : 440, m ? 220 : 760); } catch {} };
$('btnClose').onclick = async () => { if (!confirm('Turn the radio off?')) return; stopSpeech(); try { pl.forEach(p => p.pauseVideo()); } catch {} try { await fetch('/api/quit'); } catch {} window.close(); document.body.innerHTML = '<p style="padding:40px;font-family:Georgia;color:#8a97c7">Pale Blue Dot Radio is off. Goodnight.</p>'; };
document.addEventListener('keydown', e => { if (/input|select/i.test(e.target.tagName)) return; if (e.code === 'Space') { if (e.target.tagName === 'BUTTON') return; e.preventDefault(); togglePlay(); } if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });
if ('mediaSession' in navigator) { navigator.mediaSession.setActionHandler('play', togglePlay); navigator.mediaSession.setActionHandler('pause', togglePlay); navigator.mediaSession.setActionHandler('nexttrack', next); navigator.mediaSession.setActionHandler('previoustrack', prev); }

// ---------- ticker: progress, end-of-song trimming, preparing the next song ----------
setInterval(() => {
  if (!started) return;
  if (playing || speaking) airMs += 500;
  if (ytReady && playing && !busy && !P()._fading && Number.isFinite(P()._vol) && P()._vol !== S.vol) setVol(P(), S.vol);
  if (ytReady && playing && current && !busy) {
    try {
      const d = P().getDuration(), c = P().getCurrentTime(), rem = d - c;
      $('tcur').textContent = fmt(c); $('tdur').textContent = fmt(d); $('barfill').style.width = d ? (100 * c / d) + '%' : '0';
      const isPod = current.podcast;
      if (!isPod && d > 60 && rem <= 30) planPreload();
      const trimAt = lib.trim[current.key];
      // end the song a little early (and learn-trim) so trailing silence never reaches you
      if (!isPod && d > 30 && ((S.trim > 0 && rem <= S.trim) || (trimAt && c >= trimAt))) { console.info('[radio] trim trigger', { d, c, rem, trimAt, trim: S.trim, key: current.key }); advance({ fadeOldMs: 3000 }); }
    } catch {}
  }
  if (sleepAt && Date.now() > sleepAt) { sleepAt = 0; S.sleep = 0; stopSpeech(); bedOff(); busy = true; (async () => { try { await say('It is time to rest. Goodnight. The world will still be here in the morning, and so will you.', 'h'); await fadeP(P(), 0, 6000); if (current) current._selfPauses = 99; P().pauseVideo(); setVol(P(), S.vol); } catch {} busy = false; })(); }
}, 500);

// keeps the helper alive while the radio window is open (the installed version closes the helper when the window is gone)
setInterval(() => { if (HELPER) fetch('/api/ping').catch(() => {}); }, 20000);   // keeps the PC helper alive; nothing to ping on the web

// ---------- silence watchdog: what the screen says is playing must really be audible ----------
// Every 2 s, while a song is shown as playing and nothing else is happening: unmute a player the browser muted,
// restore a volume left low by an interrupted transition, restart a player that stopped by itself, and move on
// from one that is stuck. Everything it fixes is written to data/radio-log.txt.
let wd = { stuck: 0, lastT: -1, muted: 0, armed: false };
function armUnmute() {   // the browser refuses to unmute without a click: the next click anywhere turns the sound on
  if (wd.armed) return; wd.armed = true;
  toast('The browser muted the music. Click anywhere to turn the sound on.');
  document.addEventListener('pointerdown', () => { wd.armed = false; try { P().unMute(); setVol(P(), S.vol); } catch {} rlog('unmuted after click'); }, { once: true, capture: true });
}
setInterval(() => {
  if (!started || !ytReady || globalPaused || busy || !playing || !current || adHook) { wd.stuck = 0; wd.lastT = -1; return; }
  const p = P();
  try {
    const st = p.getPlayerState(), t = p.getCurrentTime(), v = p.getVolume();
    if (p.isMuted()) {
      p.unMute(); setVol(p, S.vol);
      if (++wd.muted >= 2) { rlog('player muted by the browser', { song: current.key }); armUnmute(); wd.muted = 0; }
    } else wd.muted = 0;
    if (!p._fading && Number.isFinite(v) && v < S.vol - 4) { rlog('volume was left low, restored', { song: current.key, v, want: S.vol }); setVol(p, S.vol); }
    if (st === YT.PlayerState.PLAYING) {
      if (t === wd.lastT) wd.stuck++; else wd.stuck = 0;
      wd.lastT = t;
      if (wd.stuck >= 4) { rlog('stuck: time not moving', { song: current.key, t }); wd.stuck = 0; tryNextCand(0); }
    } else if (st === YT.PlayerState.PAUSED || st === YT.PlayerState.CUED || st === -1) {
      // shown as playing but the player stopped by itself (not your pause button): start it again, then try another version
      if (++wd.stuck === 2) { rlog('player stopped by itself, restarting', { song: current.key, st }); p.playVideo(); }
      else if (wd.stuck >= 5) { rlog('player would not restart, next version', { song: current.key, st }); wd.stuck = 0; tryNextCand(0); }
    } else if (st === YT.PlayerState.BUFFERING) {
      if (++wd.stuck >= 10) { rlog('buffering for 20 s, next version', { song: current.key }); wd.stuck = 0; tryNextCand(0); }
    }
  } catch {}
}, 2000);

// ---------- cloud sync button (Settings) ----------
function updateCloudUI() {
  const b = $('btnCloud'), n = $('cloudNote'); if (!b || !n) return;
  if (!window.Cloud || !Cloud.enabled) { b.disabled = true; b.textContent = 'Sign in with Google'; n.textContent = window.FIREBASE_CONFIG ? 'unavailable (offline?)' : 'not set up yet'; return; }
  b.disabled = false;
  if (Cloud.user) { b.textContent = 'Sign out'; n.textContent = `synced as ${Cloud.user.email}` + (Cloud.status === 'saving' ? ' · saving…' : /^error/.test(Cloud.status) ? ' · ' + Cloud.status : ''); }
  else { b.textContent = 'Sign in with Google'; n.textContent = 'off: sign in to share your library between devices'; }
}
if (window.Cloud) Cloud.onStatus = updateCloudUI;
$('btnCloud').onclick = async () => {
  if (!window.Cloud || !Cloud.enabled) return;
  try {
    if (Cloud.user) { await Cloud.flush(); await Cloud.signOut(); toast('Signed out. The radio keeps a copy on this device.'); }
    else {
      await Cloud.signIn();
      if (Cloud.user) { await syncWithCloud(); normalizeLib(); buildSongs(); updateHeart(); await syncAds(); toast('Signed in. Your library is synced.'); }
    }
  } catch (e) { toast('Sign-in did not work: ' + (e.message || e)); }
  updateCloudUI();
};

// ---------- boot ----------
(async () => {
  await loadLib(); buildSongs(); loadVoices(); syncAds();
  $('vol').value = S.vol;
  setNow(null); updateCloudUI();
})();
})();
