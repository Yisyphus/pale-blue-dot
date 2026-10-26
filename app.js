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
let S = { talk: 'normal', rate: 90, voice: '', sleep: 0, deep: 30, vol: 80, trim: 5, news: 'on', fade: 8 };
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
  lib.used = lib.used || {}; lib.b = lib.b || 0; lib.trim = lib.trim || {}; lib.disc = lib.disc || {}; lib.cache = lib.cache || {}; lib.user = lib.user || []; lib.removed = lib.removed || []; lib.lists = lib.lists || [];
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
  ['fav', 'user', 'removed', 'lists'].forEach(k => {
    del[k] = {};
    [older, newer].forEach(c => Object.entries((c.del || {})[k] || {}).forEach(([key, t]) => { if ((del[k][key] || 0) < t) del[k][key] = t; }));
  });
  out.del = del;
  const alive = (k, key, ts) => !(del[k][key] && del[k][key] >= (ts || 0));
  const byKey = (list, tsOf) => { const m = new Map(); list.forEach(x => { if (!x || !x.key) return; const p = m.get(x.key); if (!p || tsOf(x) >= tsOf(p)) m.set(x.key, x); }); return [...m.values()]; };
  out.fav = byKey([...(older.fav || []), ...(newer.fav || [])], x => x.ts || 0).filter(f => alive('fav', f.key, f.ts)).sort((x, y) => (x.ts || 0) - (y.ts || 0));
  out.user = byKey([...(older.user || []), ...(newer.user || [])], x => x.added || 0).filter(s => alive('user', s.key, s.added));
  out.lists = byKey([...(older.lists || []), ...(newer.lists || [])], x => x.ts || 0).filter(l => alive('lists', l.key, l.ts)).sort((x, y) => (x.created || 0) - (y.created || 0));   // saved lists: per list, the most recently edited wins
  out.removedTs = Object.assign({}, older.removedTs, newer.removedTs);
  out.removed = [...new Set([...(older.removed || []), ...(newer.removed || [])])].filter(k => alive('removed', k, out.removedTs[k]));
  ['cache', 'trim', 'bad'].forEach(k => { out[k] = Object.assign({}, older[k], newer[k]); });
  out.labels = Object.assign({}, older.labels);   // labels: per song, the most recently edited wins
  Object.entries(newer.labels || {}).forEach(([k, v]) => { if (!out.labels[k] || (v.ts || 0) >= (out.labels[k].ts || 0)) out.labels[k] = v; });
  out.adCleanups = [...new Set([...(older.adCleanups || []), ...(newer.adCleanups || [])])];
  out.adsHidden = [...new Set([...(older.adsHidden || []), ...(newer.adsHidden || [])])];
  out.b = Math.max(older.b || 0, newer.b || 0);
  out.hist = (newer.hist || []).length >= (older.hist || []).length ? newer.hist : older.hist;
  return out;
}
const libSig = l => JSON.stringify([(l.fav || []).map(f => f.key), (l.user || []).map(s => s.key), l.removed || [], Object.keys(l.cache || {}).length, l.del || {}, Object.entries(l.labels || {}).map(([k, v]) => k + v.ts), (l.lists || []).map(x => x.key + x.ts), l.adCleanups || [], (l.adsHidden || []).length]);
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
    const L = (lib.labels || {})[s.key];   // your own labels (Library > the pencil) win over the catalog's
    if (L) { if (L.genre) s.genre = L.genre; if (L.tags) s.tags = L.tags.slice(); if (L.mood) s.mood = L.mood; if (L.energy) s.energy = L.energy; }
  });
}
const needsLabels = s => !s.genre;
// a saved list's songs, in its order, leaving out the ones you removed since
const listSongs = L => { const m = new Map(songs.map(s => [s.key, s])); return (L.keys || []).map(k => m.get(k)).filter(Boolean); };
const genreOptions = first => `<option value="">${first}</option>` + Object.entries(R.genreMap || {}).sort((x, y) => x[1].name.localeCompare(y[1].name)).map(([id, g]) => `<option value="${id}">${g.name}</option>`).join('');
// gives a genre to the songs that have none yet (songs you already labelled keep theirs)
function labelGenre(keys, genre) {
  const now = Date.now(); let n = 0; lib.labels = lib.labels || {};
  keys.forEach(k => {
    const s = songs.find(x => x.key === k); if (!s || s.genre) return;
    lib.labels[k] = Object.assign({}, lib.labels[k], { genre, ts: now }); n++;
    const u = lib.user.find(x => x.key === k); if (u) u.genre = genre;
  });
  return n;
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
// the news is read in Arabic: a Moroccan natural voice (Edge: Jamal, Mouna) if there is one, then any Arabic voice
function arabicVoice() {
  const ar = voices.filter(v => /^ar/i.test(v.lang));
  return ar.find(v => /ar-MA/i.test(v.lang) && /natural/i.test(v.name)) || ar.find(v => /natural/i.test(v.name)) || ar.find(v => /ar-MA/i.test(v.lang)) || ar[0] || null;
}
function voiceFor(code) {
  if (code === 'ar') return arabicVoice();
  if (code === 'g') return guestVoice();
  const host = hostVoice(), en = voices.filter(v => isEn(v) && v !== host);
  for (const p of VOICE_PREFS[code] || []) { const v = en.find(v => p.test(v.name)); if (v) return v; }
  return code === 's' ? guestVoice() : (en.find(v => /natural/i.test(v.name) && !/(sonia|libby|emma|ava|jenny|aria|ana|maisie|michelle)/i.test(v.name)) || null);
}
speechSynthesis.onvoiceschanged = loadVoices;

let curAudio = null;
const splitParts = text => (text.match(/[^.!?…؟]+[.!?…؟]+["')\]]*\s*|[^.!?…؟]+$/g) || [text]).map(s => s.trim()).filter(Boolean);

// Speak a block of text. All sentences are queued at once so there is no gap between them.
// The website opened on a phone (no PC helper). Everything made for phones (the checked Arabic voice, the unlocked
// audio player, the online voice asked directly, the gentler way of fetching the news) applies only there; the PC
// and computer browsers keep working exactly as before.
const mobileWeb = () => !HELPER && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
// The online voice (Google): through the PC helper when there is one; on a phone, the page asks Google directly.
// It takes at most about 200 characters at a time, so long lines are cut at commas, then at spaces.
const ttsUrl = (q, tl) => HELPER ? '/api/tts?q=' + encodeURIComponent(q) + (tl === 'ar' ? '&tl=ar' : '')
  : 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + tl + '&q=' + encodeURIComponent(q);
function onlineChunks(parts) {
  const out = [];
  parts.forEach(p => {
    while (p.length > 180) {
      let cut = Math.max(p.lastIndexOf('،', 180), p.lastIndexOf(',', 180));
      if (cut < 60) cut = p.lastIndexOf(' ', 180);
      if (cut < 60) cut = 180;
      out.push(p.slice(0, cut + 1).trim()); p = p.slice(cut + 1).trim();
    }
    if (p) out.push(p);
  });
  return out;
}
// ---------- the news voice: Arabic, checked sentence by sentence ----------
// Phones often list an Arabic voice whose data is not installed: it "finishes" at once, without a sound. So each
// sentence is spoken alone, and a voice that ends instantly or fails is dropped for the session and the next one is
// tried: the device's Arabic voice, then Google's online voice, then StreamElements' Zeina (Amazon's Arabic voice).
// The one that works is kept and tried first after that. The Playback report says what happened.
const AR_ONLINE = [
  { name: 'Google', url: q => ttsUrl(q, 'ar') },
  { name: 'Zeina (StreamElements)', url: q => 'https://api.streamelements.com/kappa/v2/speech?voice=Zeina&text=' + encodeURIComponent(q) },
];
let arDeviceBroken = false, arOnlineFirst = 0;
const arWho = () => { const v = !arDeviceBroken && arabicVoice(); return v ? v.name : AR_ONLINE[arOnlineFirst].name; };
function speakDevice(part, v, alive) {   // true when the voice really spoke (it started, and took a plausible time)
  return new Promise(res => {
    let u; try { u = new SpeechSynthesisUtterance(part); u.voice = v; u.lang = v.lang; u.rate = 0.95; } catch { return res(false); }
    let began = 0, over = false; const end = ok => { if (over) return; over = true; clearInterval(t); res(ok); };
    let left = Math.max(4000, part.length * 200); const t = setInterval(() => { if (!alive()) { speechSynthesis.cancel(); end(true); } else if (!globalPaused && (left -= 250) <= 0) end(!!began); }, 250);
    u.onstart = () => { began = Date.now(); if (globalPaused) { try { speechSynthesis.pause(); } catch {} } };
    u.onend = () => end(!!began && (Date.now() - began > Math.min(600, part.length * 25)));
    u.onerror = () => end(!alive());   // cancelled by an arrow or by Next: not the voice's fault
    try { speechSynthesis.speak(u); } catch { end(false); }
  });
}
// Phones only let a page start sound from a tap. So the online voices use ONE audio player, unlocked by your tap on
// Play or on the news buttons (a tenth of a second of silence), and reused for every sentence after that.
const ttsPlayer = new Audio(); ttsPlayer.preload = 'auto';
const SILENT_WAV = 'data:audio/wav;base64,UklGRmQGAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YUAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
function unlockAudio() { if (!mobileWeb()) return; try { ttsPlayer.src = SILENT_WAV; const p = ttsPlayer.play(); if (p) p.catch(() => {}); } catch {} }
let lastAudioError = '';
function playOnline(url, alive) {   // true when the audio really played
  return new Promise(res => {
    const a = ttsPlayer; let played = false, over = false; curAudio = a;
    const end = (ok, why) => { if (over) return; over = true; clearInterval(t); a.onplaying = a.onended = a.onerror = null; if (!ok && why) lastAudioError = why; res(ok); };
    a.onplaying = () => { played = true; };
    a.onended = () => end(played && a.currentTime > 0.3, 'ended without sound');
    a.onerror = () => end(false, 'media error ' + (a.error ? a.error.code : '?') + (a.error && a.error.code === 4 ? ' (blocked or not audio)' : a.error && a.error.code === 2 ? ' (network)' : ''));
    let left = 20000; const t = setInterval(() => { if (!alive()) { try { a.pause(); } catch {} end(true); } else if (!globalPaused && !played && (left -= 250) <= 0) end(false, 'no answer in 20 s'); }, 250);
    try { a.src = url; const p = a.play(); if (p) p.catch(e => end(false, (e && e.name) + (e && e.name === 'NotAllowedError' ? ' (the browser blocked sound that did not start from a tap)' : ''))); } catch (e) { end(false, String(e)); }
  });
}
async function sayArabic(text) {
  const id = runId, tok = newsLineTok, alive = () => id === runId && tok === newsLineTok; speaking = true;
  for (const part of splitParts(text)) {
    if (!alive()) break;
    $('capText').textContent = part;
    const v = !arDeviceBroken && arabicVoice();
    if (v) {
      if (await speakDevice(part, v, alive)) continue;
      if (!alive()) break;
      arDeviceBroken = true; speechSynthesis.cancel(); rlog('arabic voice on this device is silent, using an online voice', { voice: v.name + ' (' + v.lang + ')' });
    }
    let ok = false;
    for (let k = 0; k < AR_ONLINE.length && !ok && alive(); k++) {
      const src = AR_ONLINE[(arOnlineFirst + k) % AR_ONLINE.length];
      ok = true;
      for (const chunk of onlineChunks([part])) { if (!alive()) break; if (!(await playOnline(src.url(chunk), alive))) { ok = false; break; } }
      if (ok) arOnlineFirst = (arOnlineFirst + k) % AR_ONLINE.length;
      else rlog('online arabic voice failed', { voice: src.name, why: lastAudioError });
    }
    if (!ok && alive()) { rlog('no arabic voice could speak', { part: part.slice(0, 40) }); toast('No Arabic voice could speak here. See Settings > Playback report.'); }
  }
  speaking = false;
}

function say(text, who = 'h') {
  return new Promise(res => {
    const id = runId, parts = splitParts(text);
    const hv = who === 'ar' ? arabicVoice() : hostVoice();
    speaking = true;
    let finished = false, guard;
    const done = () => { if (finished) return; finished = true; clearInterval(guard); speaking = false; res(); };
    let budget = parts.reduce((n, p) => n + Math.max(2500, p.length * 130), 6000);   // safety net; time spent paused does not count
    guard = setInterval(() => { if (!globalPaused && (budget -= 250) <= 0) done(); }, 250);
    if (!hv) { // online fallback, with the next sentences preloaded
      const m = mobileWeb(), src = p => m ? ttsUrl(p, who === 'ar' ? 'ar' : 'en-GB') : '/api/tts?q=' + encodeURIComponent(p) + (who === 'ar' ? '&tl=ar' : '');
      const auds = (m ? onlineChunks(parts) : parts.slice()).map(p => { const a = new Audio(src(p)); a.preload = 'auto'; a.playbackRate = who === 'ar' ? 1 : who !== 'h' ? 0.88 : 0.95; a._text = p; return a; });
      parts.length = 0; auds.forEach(x => parts.push(x._text));
      let i = 0;
      const nextA = () => { if (id !== runId || i >= auds.length) return done(); const a = auds[i]; $('capText').textContent = parts[i]; i++; curAudio = a; a.onended = nextA; a.onerror = nextA; a.play().catch(nextA); };
      nextA(); return;
    }
    const gv = who !== 'h' && who !== 'ar' ? voiceFor(who) : null;
    const pitchFor = { g: 1.25, s: 1.3, y: 1.15, o: 0.85, r: 0.92, k: 1.05, b: 1.08 };
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part);
      u.lang = who === 'ar' ? hv.lang : 'en-US'; u.voice = gv || hv;
      u.rate = who === 'ar' ? 0.95 : (S.rate || 90) / 100 * (who === 'o' ? 0.9 : who === 's' ? 0.92 : who !== 'h' && !gv ? 0.95 : 1);   // readings and the older you go a little slower
      u.pitch = who !== 'h' && who !== 'ar' && !gv ? (pitchFor[who] || 1.2) : 1;
      u.onstart = () => { if (id === runId) $('capText').textContent = part; if (globalPaused) { try { speechSynthesis.pause(); } catch {} } };
      u.onend = () => { if (i === parts.length - 1 || id !== runId) done(); };
      u.onerror = () => { if (id !== runId || i === parts.length - 1) done(); };
      speechSynthesis.speak(u);
    });
  });
}
// The news on a computer: one sentence at a time, so an arrow can stop it cleanly. A sentence that does not start
// within 3 seconds (Chrome and Edge sometimes drop one spoken right after a cancel) is tried once more, then left,
// so the bulletin never freezes.
function speakOnce(part, v, alive) {
  return new Promise(res => {
    let began = false, over = false; const end = r => { if (over) return; over = true; clearInterval(t); res(r); };
    const u = new SpeechSynthesisUtterance(part); u.voice = v; u.lang = v.lang; u.rate = 0.95;
    u.onstart = () => { began = true; $('capText').textContent = part; if (globalPaused) { try { speechSynthesis.pause(); } catch {} } };
    u.onend = () => end('ok'); u.onerror = () => end(began ? 'ok' : 'nostart');
    let wait = 3000, left = Math.max(5000, part.length * 180);
    const t = setInterval(() => { if (!alive()) return end('abort'); if (globalPaused) return; if (!began && (wait -= 200) <= 0) end('nostart'); else if (began && (left -= 200) <= 0) end('ok'); }, 200);
    try { speechSynthesis.speak(u); } catch { end('nostart'); }
  });
}
async function sayNewsComputer(text) {
  const v = arabicVoice(); if (!v) return say(text, 'ar');   // no Arabic voice here: the online voice, as before
  const id = runId, tok = newsLineTok, alive = () => id === runId && tok === newsLineTok;
  speaking = true;
  for (const part of splitParts(text)) {
    if (!alive()) break;
    $('capText').textContent = part;
    let r = await speakOnce(part, v, alive);
    if (r === 'nostart' && alive()) { try { speechSynthesis.cancel(); speechSynthesis.resume(); } catch {} await sleep(200); r = await speakOnce(part, v, alive); }
    if (r === 'nostart') rlog('a news sentence would not start, moving on', { part: part.slice(0, 40) });
  }
  speaking = false;
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
          if (newsOn) return;   // the news paused it on purpose
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
        if (adHook && adHook.idx === i) { adHook.error(e && e.data); return; }
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
    p._fadeTo = to;
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
// Every transition lets the old song fade from where it is down to silence, slowly, under the host's voice or the
// next song, instead of cutting it off (Settings > Fade between songs; at the end of a song, the seconds that are left).
const fadeMs = () => (S.fade || 8) * 1000;
// Start a song on the idle player. startVol: initial volume. fadeInMs: ramp up to S.vol after starting. outMs: the old song's fade.
async function startSong(s, startVol, fadeInMs = 0, outMs = fadeMs()) {
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
  const stopOld = () => { try { if (pl[ai] !== old) old.pauseVideo(); } catch {} };
  if (old._fading && old._fadeTo === 0) { const w = setInterval(() => { if (!old._fading) { clearInterval(w); stopOld(); } }, 250); }   // already fading under the host: let it finish
  else fadeP(old, 0, outMs).then(stopOld);
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
const tagOf = s => s.tags && s.tags.length ? (Math.random() < 0.6 ? s.tags[0] : rnd(s.tags)) : 'absurd';   // the first theme is the song's main one
// What the host knows about a song (content22.js): its own notes first, otherwise a word about the artist, now and then.
let artistNoteMap = null;
function noteFor(s, back) {
  const own = (R.songNotes || {})[s.key];
  if (own && own.length) return fresh((back ? 'noteb:' : 'note:') + s.key, own);
  if (!artistNoteMap) { artistNoteMap = new Map(); Object.entries(R.artistNotes || {}).forEach(([k, v]) => artistNoteMap.set(fold(k).trim(), v)); }
  const main = artistParts(s.a)[0], an = main && artistNoteMap.get(main);
  return an && Math.random() < (back ? 0.25 : 0.5) ? fresh('anote:' + main, an) : '';
}
const moodLine = s => { const m = R.moodBy && R.moodBy[s.mood]; return m && m.length && Math.random() < 0.7 ? fresh('moodby:' + s.mood, m) : fresh('mood', R.moodLines); };
function energyLine(prev, s) {   // only for a big change, and not every time
  if (!prev || !prev.energy || !s.energy || prev.podcast || Math.random() > 0.7) return '';
  const d = s.energy - prev.energy;
  return d <= -2 && R.energyDown ? fresh('edown', R.energyDown) : d >= 2 && R.energyUp ? fresh('eup', R.energyUp) : '';
}
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
  const el = energyLine(prev, s); if (el) parts.push(el);
  parts.push(sub(fresh(mine ? 'newsong' : 'opener', mine ? R.newSongTemplates : R.introTemplates), s));
  const note = s.fact || noteFor(s);
  s._said = '';
  if (note && Math.random() < 0.85) { parts.push(note); s._said = note; }   // what this song is about comes first
  else {
    // otherwise its main theme, its genre (only when the genre changes), or a line that fits its mood
    const r = Math.random(), newGenre = s.genre && (!prev || prev.genre !== s.genre);
    parts.push(r < 0.4 ? themeLine(s) : r < 0.75 && newGenre ? genreNote(s) : moodLine(s));
    if (Math.random() < 0.25) parts.push(moodLine(s));
  }
  return parts.join(' ');
}
function backFor(s) {
  if (s.podcast) return sub(s.midnight ? fresh('podoutro', R.podcastOutros) : fresh('podoutroday', R.podcastOutrosDay), s);
  const sc = scriptFor(s);
  if (sc && sc.backs && sc.backs.length) return sub(fresh('back:' + s.key, sc.backs), s);
  let r = Math.random(), note = r < 0.3 ? noteFor(s, true) : '';
  if (note && note === s._said) { note = ''; r = 0.5; }   // never the same note twice in a row for one song
  return sub(fresh('back', R.backTemplates), s) + (note ? ' ' + note : r < 0.75 ? ' ' + themeLine(s) : '');
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

// a commercial break: announced, then jingle, ad, jingle, ad, jingle, and a closing line
function adBreakSegs() {
  return [
    { kind: 'Commercial break', adGroup: true, lines: [{ t: sub(fresh('breakintro', R.breakIntros)) }] },
    { kind: 'Jingle', adGroup: true, jingle: true },
    { kind: 'Commercial', adGroup: true, ad: true },
    { kind: 'Jingle', adGroup: true, jingle: true },
    { kind: 'Commercial', adGroup: true, ad: true },
    { kind: 'Jingle', adGroup: true, jingle: true },
    { kind: 'Commercial break', adGroup: true, lines: [{ t: sub(fresh('breakoutro', R.breakOutros)) }] },
  ];
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
  if (wantAd) out.push(...adBreakSegs());
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
    // YouTube's error 100: the video was removed (or made private). Any other error only means it cannot play right now.
    adHook = { idx, state: s => { if (s === YT.PlayerState.PLAYING) { started = true; setLive(true); } else if (s === YT.PlayerState.ENDED) finish(true); }, error: code => finish(code === 100 ? 'gone' : false) };
    breakSkip = () => finish(true);                       // the Next button skips this ad
    preload = null;
    try { p.unMute(); } catch {}
    setVol(p, Math.round(S.vol * 0.9)); p.loadVideoById(v.id);
    // not started within 8 s: the caller tries the next ad; a safety cap ends an ad that never ends. Paused time does not count.
    let waited = 0, ran = 0; const capMs = (Math.min(v.seconds || 90, 150) + 12) * 1000;
    tick = setInterval(() => { if (globalPaused) return; waited += 500; ran += 500; if (!started && waited >= 8000) finish(false); else if (ran >= capMs) finish(started); }, 500);
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
    if (played === true) return;
    if (played === 'gone') adRemovedFromYouTube(ad);   // anything else: just skipped this time, another one plays
    if (id !== runId) return;
  }
}

// A commercial that YouTube says was removed (error 100) leaves the playing list, with a note in Removed.
// One that only fails to start, or that its owner will not let play here, is skipped for this break and stays.
function adRemovedFromYouTube(ad) {
  rlog('commercial removed from YouTube', { id: ad.id, title: ad.title });
  lib.adNotes = lib.adNotes || {}; lib.adNotes[ad.id] = 'no longer on YouTube'; saveLib();
  adPool = adPool.filter(v => v.id !== ad.id);
  adsEditCall({ action: 'remove', id: ad.id }).catch(() => {});
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
async function allAds() {
  if (HELPER) { try { return (await (await fetch('/api/ads/all')).json()).items || []; } catch { return []; } }
  return cloudAds ? parseJ(cloudAds.pool, []) : [];
}
// "Clear the list" hides removed ads from the Removed tab; they stay removed (forgetting them would bring them back)
const adHidden = () => new Set(lib.adsHidden || []);
async function renderAds() {
  document.querySelectorAll('#adTabs button').forEach(b => b.classList.toggle('on', b.dataset.v === adTab));
  const items = await allAds(), hidden = adHidden();
  const on = items.filter(v => !v.removed), off = items.filter(v => v.removed && !hidden.has(v.id));
  adListed = { on, off };
  $('adCount').textContent = `· ${on.length} playing, ${off.length} removed`;
  const l = $('adList'); l.innerHTML = '';
  const shown = adTab === 'on' ? on : off;
  if (!shown.length) l.innerHTML = `<p style="color:var(--mute);font-size:13px;line-height:1.5">${adTab === 'on' ? 'No commercials are playing. Add some above.' : 'Nothing removed.'}</p>`;
  if (adTab === 'off' && off.length) {
    const c = document.createElement('div'); c.innerHTML = '<button class="btn ghost" style="width:100%;margin-bottom:4px">Clear the list (they stay removed)</button>';
    c.querySelector('button').onclick = () => { lib.adsHidden = [...new Set([...(lib.adsHidden || []), ...off.map(v => v.id)])]; saveLib(); renderAds(); };
    l.appendChild(c);
  }
  const badge = { playlist: 'playlist', search: 'found', mine: 'yours' };
  shown.forEach(v => {
    const d = document.createElement('div'); d.className = 'item';
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn"></button>`;
    d.querySelector('b').textContent = v.title; d.querySelector('span').textContent = `${fmtSec(v.seconds)} · ${badge[v.src] || v.src}${v.removed && (lib.adNotes || {})[v.id] ? ' · ' + lib.adNotes[v.id] : ''}`;
    const b = d.querySelector('.mini-btn'); b.textContent = adTab === 'on' ? '✕' : 'Restore'; b.title = adTab === 'on' ? 'Never play this ad' : 'Play this ad again';
    b.onclick = async () => { try { await adsEditCall({ action: adTab === 'on' ? 'remove' : 'restore', id: v.id }); renderAds(); } catch (e) { toast(e.message); } };
    l.appendChild(d);
  });
}
const ytId = s => { const m = String(s).match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/) || String(s).trim().match(/^([\w-]{11})$/); return m ? m[1] : ''; };
const adTitleKey = t => fold(t).replace(/\b(pub|publicite|publicité|spot|tv|maroc|morocco|ad|commercial|اشهار|إشهار|إعلان|اعلان)\b/gi, '').replace(/\s+/g, ' ').trim();
async function addAd(idOrLink) {
  const id = ytId(idOrLink), have = id ? (await allAds()).find(v => v.id === id) : null;
  if (have && !have.removed) { toast(`"${have.title}" is already playing. Not added again.`); $('adq').value = ''; $('adRes').innerHTML = ''; return; }
  try { const r = await adsEditCall({ action: 'add', id: idOrLink }); toast(r.already ? `"${r.added.title}" is already in the list.` : `Added "${r.added.title}".`); $('adq').value = ''; $('adRes').innerHTML = ''; adTab = 'on'; renderAds(); }
  catch (e) { toast(e.message); }
}
// A playlist link: every video in it is added (the ones already playing are left as they are)
async function adsFromPlaylist(link, progress = () => {}) {   // returns { title, added, already }
  progress('Reading the playlist…');
  const r = await fetch('/api/playlist?list=' + encodeURIComponent((link.match(/[?&]list=([\w-]+)/) || [, link])[1]));
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'The playlist could not be read.');
  // nothing that is already in the list (playing, or removed by you), and no second copy of a title already playing
  // (titles are compared only when long enough to tell ads apart: "pub maroc telecom" could be any of them)
  const list = await allAds(), have = new Set(list.map(v => v.id)), titles = new Set(list.filter(v => !v.removed).map(v => adTitleKey(v.title)).filter(Boolean));
  const todo = (j.items || []).filter(v => { if (!v.id || have.has(v.id)) return false; const k = adTitleKey(v.title || ''); if (k.length >= 12 && titles.has(k)) return false; if (k.length >= 12) titles.add(k); have.add(v.id); return true; });
  let n = 0;
  for (const v of todo) { progress(`Adding ${n + 1} of ${todo.length}: ${v.title || v.id}`); try { await adsEditCall({ action: 'add', id: v.id }); n++; } catch {} }
  return { title: j.title || 'Playlist', added: n, already: (j.items || []).length - todo.length };
}
const playlistToast = x => `"${x.title}": ${x.added} commercial${x.added === 1 ? '' : 's'} added${x.already ? `, ${x.already} ${x.already === 1 ? 'was' : 'were'} already in the list` : ''}.`;
async function addAdPlaylist(link) {
  const st = m => { $('adRes').innerHTML = '<p style="color:var(--mute);font-size:13px"></p>'; $('adRes').querySelector('p').textContent = m; };
  try {
    const x = await adsFromPlaylist(link, st);
    $('adRes').innerHTML = ''; $('adq').value = ''; adTab = 'on'; renderAds();
    toast(playlistToast(x));
  } catch (e) { st(e.message || String(e)); }
}
async function adGo() {
  const q = $('adq').value.trim(); if (!q) return;
  if (!HELPER) { $('adRes').innerHTML = `<p style="color:var(--mute)">${NEEDS_PC}</p>`; return; }
  if (/[?&]list=|^(PL|OL|UU|FL)[\w-]{10,}$/.test(q)) return addAdPlaylist(q);   // a whole playlist
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
// Every commercial as a numbered line with its YouTube link, ready to paste into a message
let adListed = { on: [], off: [] };
$('adCopy').onclick = async () => {
  const line = (v, i) => `${i + 1}. ${v.title} (${fmtSec(v.seconds) || '?'}) https://www.youtube.com/watch?v=${v.id}`;
  const text = `Commercials playing (${adListed.on.length}):\n${adListed.on.map(line).join('\n')}` + (adListed.off.length ? `\n\nRemoved (${adListed.off.length}):\n${adListed.off.map(line).join('\n')}` : '');
  try { await navigator.clipboard.writeText(text); toast(`Copied ${adListed.on.length + adListed.off.length} commercials. Paste them anywhere.`); }
  catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('Copied.'); } catch { toast('Could not copy here.'); } t.remove(); }
};
// One-time clean-ups of the commercials, as you asked for them. Each runs once, on the first device that can save it
// (the PC, or a phone signed in to the cloud), through the same path as the ✕ button, so it reaches the cloud too.
const AD_CLEANUPS = [
  { id: '2026-10-25', hideRemoved: true, remove: [
    '3f6gmNpVqQU', 'C457wcIvIoc', 'bKEqz8kaWgI', 'j-EIZeR9yZ4', 'DwwhLsLtzMk', 'B6FdsqhfxJE', 'jZ5q65PD0eI', 'J87mPeNK9gk', 'Zt0jgM69byo',
    'pvHoqZ_idZI', 'xAtuB6T7JeI', 'DRApcrEyyCM', 'JKzxHtV-ex8', '0DAXd5Te1h8', 'z7MDSWv7_lU', '-pmL6aZQRMM', '0Zn-K2Jjkf0',
    'pjk3G3K9UUc',   // the second "Colorado pub" (0:34): "Colorado pub 2m" stays
  ] },
  { id: '2026-10-25-playlist', addPlaylist: 'PLe8DdggI3F7k' },   // reading a playlist needs the PC; tried at 3 openings at most
];
async function runAdCleanups() {
  const tries = lib.adCleanupTries = lib.adCleanupTries || {};
  const todo = AD_CLEANUPS.filter(c => !(lib.adCleanups || []).includes(c.id) && (tries[c.id] || 0) < 3);
  if (!todo.length || !(HELPER || (window.Cloud && Cloud.user && cloudAds))) return;
  for (const c of todo) {
    if (c.addPlaylist) {
      if (!HELPER) continue;
      tries[c.id] = (tries[c.id] || 0) + 1; saveLib();
      try {
        const x = await adsFromPlaylist(c.addPlaylist);
        lib.adCleanups = [...(lib.adCleanups || []), c.id]; saveLib();
        rlog('commercials playlist added', { playlist: c.addPlaylist, ...x }); toast(playlistToast(x));
      } catch (e) {
        rlog('commercials playlist failed', { playlist: c.addPlaylist, error: e.message, attempt: tries[c.id] });
        toast(`Could not add the commercials playlist: ${e.message}${tries[c.id] < 3 ? ' I will try again next time.' : ''}`);
      }
      continue;
    }
    let items = await allAds(); if (!items.length) return;
    let n = 0;
    for (const id of c.remove) { const v = items.find(x => x.id === id); if (v && !v.removed) { try { await adsEditCall({ action: 'remove', id }); n++; } catch {} } }
    if (c.hideRemoved) { items = await allAds(); lib.adsHidden = [...new Set([...(lib.adsHidden || []), ...items.filter(v => v.removed).map(v => v.id)])]; }
    lib.adCleanups = [...(lib.adCleanups || []), c.id]; saveLib();
    rlog('commercials cleaned up', { cleanup: c.id, removed: n });
    if (n) toast(`${n} commercials removed, as you asked.`);
  }
}
// Manage commercials > Play commercials: a break right now; the song that was playing fades out under it, then the next one
$('adPlayNow').onclick = () => {
  if (!started) return toast('Press play first, then try the commercials.');
  if (!adPool.length) return toast('No commercials are playing. Add some first.');
  if (newsOn) return toast('The news is on. Try again after it.');
  openSheet(null); planned = null; preload = null;
  advance({ forceTalk: true, noCount: true, replaySegs: adBreakSegs() });
};
function openAds() { $('adRes').innerHTML = ''; renderAds(); openSheet('shAds'); }

async function runSegments(segs, id) {
  for (let si = 0; si < segs.length; si++) {
    const seg = segs[si];
    if (id !== runId) return false;
    if (curBreak && curBreak.segs === segs) curBreak.idx = si;   // where the news would pick this break up again
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

// ---------- podcast episodes (song 64 of every cycle) ----------
// What is playing or being said right now, so the news can bring it back from the start: a break (from the part that
// was interrupted, a talk from its first sentence), a podcast being introduced, or the song or episode itself.
let curBreak = null, curPod = null;
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
  const midnight = false;
  curBreak = null; curPod = pod;
  const v = pod.v;
  const ep = { a: v.channel, t: cleanTitle(v.title), key: 'podcast|' + v.id, podcast: true, midnight, tags: [], genre: 'podcast', cands: [v, ...pod.alts] };
  if (!lib.pod.includes(v.id)) { lib.pod.push(v.id); if (lib.pod.length > 300) lib.pod.shift(); saveLib(); }
  const old = P();
  if (!opts.first) fadeP(old, 0, opts.fadeOldMs || fadeMs()).then(() => { try { if (pl[ai] === old) old.pauseVideo(); } catch {} });
  bedOn();
  const segs = [];
  if (opts.first) segs.push({ kind: R.station, lines: [{ t: sub(fresh('welcome:' + period(), R.welcomes[period()]), ep) }] });
  else if (prev) segs.push({ kind: R.station, lines: [{ t: backFor(prev) }] });
  const extra = { min: Math.max(1, Math.round(v.seconds / 60)), topic: pod.topic.label };
  segs.push({ kind: midnight ? 'Midnight podcast' : 'Podcast', title: pod.topic.label, lines: [{ t: sub(midnight ? fresh('podintro', R.podcastIntros) : fresh('podintroday', R.podcastIntrosDay), ep, extra) }] });
  console.info('[radio] podcast', ep.t, '|', ep.a, '|', extra.min + ' min');
  const ok = await runSegments(segs, id);
  if (!ok) return;
  const okEp = await startSong(ep, S.vol);
  if (id !== runId) return;
  curPod = null;
  if (!okEp) { busy = false; bedOff(); return advance({ noCount: true }); }
  $('vinyl').classList.remove('talk');
  bedOff(2.5);
  caption(R.host, '');
  busy = false;
}

async function advance(opts = {}) {
  if (globalPaused) clearPause();   // anything new starts un-paused
  if (newsOn) { newsOn = false; newsBack = null; }   // you chose something else during the news
  stopSpeech();
  const id = runId;
  busy = true;
  const prev = opts.prev !== undefined ? opts.prev : current;
  const afterPod = !!(prev && prev.podcast);
  curBreak = null; curPod = null;
  nextPending = false; nextOverride = null;
  let next = opts.song || takePlanned();
  if (!next) { busy = false; return; }
  if (prev && !afterPod) { if (opts.prev !== null) { history.push(prev); if (history.length > 60) history.shift(); } if (!played.includes(prev.key)) played.push(prev.key); }
  current = null; updateHeart();   // the heart is only active while a song is playing
  if (!opts.noCount && !afterPod) songsSinceBreak++;
  const endRunNow = !!(prev && lastRunSong && prev.key === lastRunSong.key);
  const talk = !opts.silent && (opts.first || afterPod || endRunNow || songsSinceBreak >= breakEvery() || opts.forceTalk);
  console.info('[radio] advance', { next: next.t, talk, count: songsSinceBreak, every: breakEvery() });
  if (talk) songsSinceBreak = 0;
  const old = P();
  if (!talk) {
    // no commentary this time: crossfade straight into the next song
    $('kind').textContent = 'tuning'; caption(R.host, ''); $('vinyl').classList.remove('talk');
    const okQ = await startSong(next, S.vol, opts.quick ? 2500 : 3500, opts.fadeOldMs || fadeMs());
    if (id !== runId) return;
    if (!okQ) { busy = false; return advance({ noCount: true }); }
    busy = false; return;
  }
  // commentary: let the old song fade under the host, with a soft bed so the air is never empty
  if (!opts.first) fadeP(old, 0, opts.fadeOldMs || fadeMs()).then(() => { try { if (pl[ai] === old) old.pauseVideo(); } catch {} });
  bedOn();
  nextPending = true; // a song you suggest while the host is talking takes the place of this one
  resolve(next);
  const segs = opts.replaySegs || makeBreak(prev, next, opts.first);   // after the news: the rest of the interrupted break
  console.info('[radio] break', lib.b, segs.map(s => s.kind + (s.title ? ' · ' + s.title : '')));
  curBreak = { segs, next, idx: 0 };
  const ok = await runSegments(segs, id);
  if (!ok) return;
  if (nextOverride) { planned = next; next = nextOverride; nextOverride = null; resolve(next); }
  curBreak.next = next;
  if (podcastDue && !opts.first) { // the end of each 64-song cycle: an episode, then the planned song comes after
    const pod = await findPodcast();
    if (id !== runId) return;
    if (pod) { planned = next; return playPodcast(pod, null, { scheduled: true }, id); }
  }
  $('kind').textContent = 'up next';
  const okT = await startSong(next, 14);
  if (id !== runId) return;
  curBreak = null;
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

// ---------- the news: every 4 hours on the hour (00:00, 04:00, 08:00, 12:00, 16:00, 20:00), in Arabic ----------
// It interrupts whatever is on (a song, a talk, a commercial, a podcast), reads the headlines and the Marrakech weather,
// then brings that back from the start: the song or episode from 0:00, a break from the part that was interrupted.
// The headlines come from the PC helper (/api/news), so the news needs the radio running on the PC.
let newsOn = false, newsBack = null, newsJingle = null, newsShown = null, lastNewsSlot = '';
const NEWS_TOPIC_AR = { marrakech: 'من مراكش', moroccoaj: 'أخبار المغرب', morocco: 'آخر الأخبار', world: 'آخر الأخبار', tech: 'في التكنولوجيا والذكاء الاصطناعي', techworld: 'في التكنولوجيا والذكاء الاصطناعي', art: 'في الفن', trend: 'الأكثر تداولا على مواقع التواصل' };   // Moroccan and world headlines are mixed in the sources, so they share one heading
const NEWS_IN = [
  'It is {time}. Time for the news. Then we come straight back to what was playing.',
  'It is {time} on {station}. Let us stop for a moment for the headlines. We will pick up again right after.',
  'It is {time}, and that means the news. The headlines and the weather, and then back to where we were.',
  'A short pause for the world outside. It is {time}, and here are the headlines.',
];
const NEWS_OUT = [
  'That was the news. And now, back to where we were.',
  'Those were the headlines. The world will keep turning; we go back to what was playing.',
  'That is the news for now. Next one in four hours. Back to it.',
  'Thank you for listening to the news. And now, we pick up where we left off.',
];
function resumeTarget() {
  if (curPod) return { type: 'pod', pod: curPod };
  if (curBreak) return { type: 'break', segs: curBreak.segs, idx: curBreak.idx || 0, next: curBreak.next };
  if (current) return { type: 'song', song: current };
  return null;
}
async function newsJingleRun() {
  $('capKind').textContent = 'News'; $('capText').textContent = '♪';
  newsJingle = Jingles.play(getCtx(), 'news');
  await newsJingle.done; newsJingle = null;
}
// Where the headlines come from: the radio reads each source itself, its RSS feed when it has one, otherwise the
// headlines on the page. Pages are fetched by the PC helper (/api/fetch) and, at the same time, through public relays
// that let a web page read another site, and the first good answer wins. So the news also works on the phone, and with
// a helper that has not updated yet. The weather comes straight from Open-Meteo, which any page may read.
// take: how many headlines that source gives its topic; a source that fails leaves its place to the others of the topic.
// A backup for a site that turns readers away (Hit Radio and Al Arabiya sit behind a bot wall): the same site's
// recent headlines as Google News lists them, found by the site's address and words of the section.
const GN = (q, days = 3) => 'https://news.google.com/rss/search?q=' + encodeURIComponent(q + ' when:' + days + 'd') + '&hl=ar&gl=MA&ceid=MA:ar';
const NEWS_SOURCES = [
  { id: 'kech24', name: 'Kech24 Marrakech', topic: 'marrakech', take: 4, local: true, urls: ['https://kech24.com/cat/%d9%85%d8%b1%d8%a7%d9%83%d8%b4/feed', 'https://kech24.com/cat/%d9%85%d8%b1%d8%a7%d9%83%d8%b4'] },
  { id: 'alaan', name: 'Marrakech Alaan', topic: 'marrakech', take: 2, local: true, urls: ['https://www.marrakechalaan.com/article-category/news-marrakech/feed', 'https://www.marrakechalaan.com/article-category/news-marrakech'] },
  // أخبار المغرب: MAP (the national news agency), royal activities 1, politics 2, economy 2
  { id: 'maproyal', name: 'MAP royal activities', topic: 'moroccoaj', take: 1, local: true, urls: ['https://www.mapnews.ma/ar/activites_royales', GN('site:mapnews.ma الملك OR جلالة OR ولي العهد')] },
  { id: 'mappolitics', name: 'MAP politics', topic: 'moroccoaj', take: 2, local: true, urls: ['https://www.mapnews.ma/ar/actualites/politique', GN('site:mapnews.ma الحكومة OR البرلمان OR حزب OR وزير OR مجلس')] },
  { id: 'mapeconomy', name: 'MAP economy', topic: 'moroccoaj', take: 2, local: true, urls: ['https://www.mapnews.ma/ar/actualites/economie', GN('site:mapnews.ma اقتصاد OR استثمار OR صادرات OR بنك OR التضخم OR السياحة')] },
  { id: 'hespress', name: 'Hespress 24h', topic: 'morocco', take: 4, local: true, urls: ['https://www.hespress.com/tag/24heures/feed', 'https://www.hespress.com/tag/24heures'] },
  { id: 'le360', name: 'Le360', topic: 'morocco', take: 1, local: true, urls: ['https://ar.le360.ma/arc/outboundfeeds/rss/?outputType=xml', 'https://ar.le360.ma/'] },
  { id: 'bbc', name: 'BBC Arabic', topic: 'world', take: 1, urls: ['https://feeds.bbci.co.uk/arabic/rss.xml'] },
  { id: 'aljazeera', name: 'Al Jazeera', topic: 'world', take: 1, urls: ['https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9'] },
  { id: 'france24', name: 'France 24', topic: 'world', take: 1, urls: ['https://www.france24.com/ar/rss'] },
  { id: 'aitnews', name: 'AIT News', topic: 'techworld', take: 2, urls: ['https://aitnews.com/feed/', 'https://aitnews.com/'] },
  { id: 'ajtech', name: 'Al Jazeera tech', topic: 'techworld', take: 1, urls: ['https://www.aljazeera.net/tech/'] },
  { id: 'bbctech', name: 'BBC Arabic tech', topic: 'techworld', take: 1, urls: ['https://feeds.bbci.co.uk/arabic/scienceandtech/rss.xml'] },
  { id: 'cnntech', name: 'CNN Arabic tech', topic: 'techworld', take: 1, urls: ['https://arabic.cnn.com/tech'] },
  // Hit Radio: only its stories written in Arabic, from the last 10 days (it posts every few days), and only about
  // art (songs, films, festivals, culture): it also posts politics and sport, which are left out
  { id: 'hitradio', name: 'Hit Radio', topic: 'art', take: 4, maxAgeDays: 10, local: true, only: 'art', noPolitics: true, urls: ['https://hitradio.ma/news', GN('site:hitradio.ma', 10)] },
  { id: 'bbcart', name: 'BBC Arabic culture', topic: 'art', take: 4, maxAgeDays: 7, urls: ['https://feeds.bbci.co.uk/arabic/artandculture/rss.xml'] },
  // trending on social media: news stories about viral videos and online trends, from the sections that cover them…
  { id: 'arabiyasocial', name: 'Al Arabiya social media', topic: 'trend', take: 2, urls: ['https://www.alarabiya.net/social-media', GN('site:alarabiya.net "مواقع التواصل" OR "منصات التواصل" OR "رواد مواقع التواصل" OR "فيديو متداول" OR تريند OR "ترند"')] },
  { id: 'bbctopic', name: 'BBC Arabic social media', topic: 'trend', take: 2, urls: ['https://www.bbc.com/arabic/topics/c6vzyk7dg8zt'] },
  { id: 'bbctrend', name: 'BBC Arabic trending', topic: 'trend', take: 2, urls: ['https://feeds.bbci.co.uk/arabic/trending/rss.xml', 'https://www.bbc.com/arabic/trending'] },
  { id: 'hessocial', name: 'Hespress social media', topic: 'trend', take: 1, urls: ['https://www.hespress.com/tag/%d9%85%d9%88%d8%a7%d9%82%d8%b9-%d8%a7%d9%84%d8%aa%d9%88%d8%a7%d8%b5%d9%84-%d8%a7%d9%84%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9%d9%8a/feed', 'https://www.hespress.com/tag/%d9%85%d9%88%d8%a7%d9%82%d8%b9-%d8%a7%d9%84%d8%aa%d9%88%d8%a7%d8%b5%d9%84-%d8%a7%d9%84%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9%d9%8a'] },
  { id: 'ajsocial', name: 'Al Jazeera social media', topic: 'trend', take: 1, urls: ['https://www.aljazeera.net/tag/%d9%85%d9%88%d8%a7%d9%82%d8%b9-%d8%a7%d9%84%d8%aa%d9%88%d8%a7%d8%b5%d9%84-%d8%a7%d9%84%d8%a7%d8%ac%d8%aa%d9%85%d8%a7%d8%b9%d9%8a/', GN('site:aljazeera.net "مواقع التواصل" OR "منصات التواصل" OR "رواد مواقع التواصل" OR "فيديو متداول" OR تريند OR "ترند"')] },
  // …and from the full Hespress and Kech24 feeds, only searched for viral stories (these two are in no section of their own)
  { id: 'hesall', name: 'Hespress (all)', topic: 'pool', take: 0, local: true, urls: ['https://www.hespress.com/feed'] },
  { id: 'kechall', name: 'Kech24 (all)', topic: 'pool', take: 0, local: true, urls: ['https://kech24.com/feed/'] },
];
// in this order; tech and art can also come from any other source, by their words
const NEWS_PLAN = [['marrakech', 6], ['moroccoaj', 5], ['morocco', 6], ['world', 4], ['tech', 4], ['techworld', 4], ['art', 8], ['trend', 4]];   // art: BBC 4, Hit Radio 4   // tech: Moroccan stories; techworld: international
const RELAYS = [
  u => HELPER ? '/api/fetch?url=' + encodeURIComponent(u) : null,
  u => 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u),
  u => 'https://corsproxy.io/?url=' + encodeURIComponent(u),
  u => 'https://api.codetabs.com/v1/proxy/?quest=' + encodeURIComponent(u),
  u => /feed|rss/.test(u) ? 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(u) : null,
];
const SPORT_RX = /رياض[ةي]|كرة|مباراة|مباريات|المنتخب|الدوري|البطولة|بطولة|لاعب|الوداد|الرجاء|أسود الأطلس|كأس|الركراكي|فيفا|الكاف|الأولمبي|ملعب|هدف|أهداف|ميركاتو|مدرب|نادي|فريق|الجامعة الملكية المغربية لكرة|\/sports?\b|\/sport\/|\bsport|football|\bvs\.?\s|\bfc\b|\bmatch\b|ligue|liga\b|premier league|champions league|botola|\braja\b|wydad|\bnba\b|\bufc\b/i;
const TECH_RX = /ذكاء الاصطناعي|ذكاء اصطناعي|تكنولوجي|التقني|تقنية|التحول الرقمي|الرقمنة|إنترنت|هواتف ذكية|هاتف ذكي|الهاتف الذكي|آبل|أبل|غوغل|جوجل|مايكروسوفت|ميتا|تطبيقات|روبوت|شات ?جي ?بي ?تي|سيبراني|البرمجيات|حاسوب|رقائق|أشباه الموصلات|وكالة الفضاء|الفضاء الخارجي|ناسا|سبيس ?إكس|\/tech(nology)?\/|\/science\/|technolog/i;   // whole words where a shorter one would also match ordinary news
const ART_RX = /موسيق|أغني|أغان|غناء|مطرب|فنان|لفنون|لفن(?![؀-ۿ])|سينما|سينمائي|فيلم|أفلام|مهرجان|معرض فني|معرض تشكيلي|تشكيلي|لمسرح(?! الجريمة)|مسرحي|ثقاف|رواية|روائي|لشعر(?![؀-ۿ])|شاعر|قصيدة|ألبوم|حفل غنائي|حفلا غنائيا|\/culture\/|\/arts?\/|\/art-?and-?culture/i;
// trending on social media: viral videos, trends and online debates
const SOCIAL_RX = /مواقع التواصل|منصات التواصل|وسائل التواصل|شبكات التواصل|الفضاء الأزرق|السوشيال ميديا|تيك ?توك|فيسبوك|فايسبوك|إنستغرام|انستغرام|يوتيوب|تويتر|منصة إكس|ترند|تريند|هاشتاغ|فيديو متداول|فيديو يوثق|فيديو يظهر|فيديو صادم|فيديو مثير|مقطع فيديو|مقطع متداول|شريط فيديو|يجتاح|انتشار واسع|ينتشر بسرعة|ينتشر كالنار|يثير جدلا|يثير الجدل|جدل واسع|موجة سخرية|موجة تفاعل|تفاعل واسع|رواد مواقع|رواد التواصل|رواد الإنترنت|رواد المنصات|مدونون|نشطاء|مؤثر|مؤثرة|بلوغر|يوتيوبر|تيكتوكر|صانع محتوى|صانعة محتوى|صناع المحتوى|\/trending/i;
const POLITICS_RX = /جلالة الملك|الملك محمد|ولي العهد|الأمير|الانتخابات|انتخابات|التشريعية|البرلمان|مجلس النواب|مجلس المستشارين|الحكومة|رئيس الحكومة|وزير|وزارة|حزب|الأحزاب|سياسي|سياسة|يعين|تعيين|دبلوماسي|سفير/;
const cleanHead = t => String(t || '').replace(/\s+/g, ' ').trim().replace(/^(فيديو|شاهد|بالفيديو)\s*[,،:]\s*/, '').replace(/\s*[,،]\s*المدة\s*[\d,.:]+\s*$/, '').replace(/\s*[-|–—]\s*(BBC News عربي|بي بي سي.*|فرانس ?24.*|France ?24.*|الجزيرة.*|هسبريس.*|Hespress.*|كش ?24.*|Le360.*|لو360.*|مراكش ال[آا]ن.*|و\.م\.ع.*)$/i, '').replace(/^\s*(مراكش ال[آا]ن|كش ?24|هسبريس)\s*([:|\-–—،,/»«]+|\.\.+)\s*/, '').replace(/^(عاجل|بالفيديو|فيديو|صور|بالصور)\s*[:|-]\s*/, '').trim();
const WEATHER_RX = /طقس|الأحوال الجوية|أحوال الجو|حالة الجو|نشرة إنذارية|النشرة الجوية/;
const dURI = u => { try { return decodeURI(u); } catch { return u; } };
const OPINION_RX = /\/(opinions?|blogs?|columns?|chroniques?|programmes?|programs?|emissions?|برامج|ريبورتاج|رأي|آراء|مقالات)\/|آراء|مقالات رأي|كتاب وآراء|أعمدة|^رأي\b/i;   // tested on the link and the categories
const JUNK_RX = /الرئيسية|^\s*(الأخبار|أخبار|آخر الأخبار|أخر الأخبار|أقسام|فيديو|صور)\s*$/;   // "الرئيسية : CNN الاقتصادية": a page's breadcrumb or a section name, not news
const headKey = t => t.replace(/[^\p{L}\p{N}]+/gu, '').slice(0, 40);
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('no answer')), ms))]);
// A feed (RSS, Atom, or rss2json), or else a news page: its headlines are the links whose text reads like one
// (mostly Arabic, a real sentence, pointing to an article on the same site), in the order the page shows them.
// "المواعيد القادمة" on a page: the block under that heading, each item read as a title and its date
const AR_MONTHS = 'يناير|فبراير|مارس|أبريل|ابريل|ماي|مايو|يونيو|يوليوز|يوليو|غشت|أغسطس|اغسطس|شتنبر|سبتمبر|أكتوبر|اكتوبر|نونبر|نوفمبر|دجنبر|ديسمبر';
const AR_MONTH_N = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
const DATE_RX = new RegExp(`((?:من\\s*)?\\d{1,2}(?:\\s*(?:${AR_MONTHS}))?(?:\\s*\\d{4})?\\s*(?:إلى|الى|-|و)\\s*\\d{1,2}\\s*(?:${AR_MONTHS})(?:\\s*\\d{4})?|(?:من\\s*)?\\d{1,2}\\s*(?:${AR_MONTHS})(?:\\s*\\d{4})?|\\d{1,2}[/.\\-]\\d{1,2}(?:[/.\\-]\\d{2,4})?)`);
const sayDate = d => d.replace(/^(\d{1,2})[/.\-](\d{1,2})(?:[/.\-](\d{2,4}))?$/, (m, dd, mm, yy) => `${+dd} ${AR_MONTH_N[+mm - 1] || mm}${yy ? ' ' + (yy.length === 2 ? '20' + yy : yy) : ''}`);
function parseEvents(text, pageUrl) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const head = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6,span,div,p,strong')].find(el => /المواعيد القادمة/.test(el.textContent) && el.textContent.trim().length < 40);
  if (!head) throw new Error('no "المواعيد القادمة" on the page');
  let box = head.parentElement;
  for (let k = 0; k < 4 && box && !box.querySelector('a, li, article'); k++) box = box.parentElement;
  if (!box) throw new Error('no events under "المواعيد القادمة"');
  const items = [...box.querySelectorAll('li, article, a, [class*="item"], [class*="card"]')].filter(el => !el.contains(head) && el !== head);
  const out = [], seen = new Set();
  items.forEach(el => {
    const all = (el.textContent || '').replace(/\s+/g, ' ').trim(); if (!all || all.length > 300) return;
    const dm = all.match(DATE_RX), date = dm ? sayDate(dm[1].trim()).replace(/(^|\D)0(\d)/g, '$1$2') : '';   // "04 دجنبر" is said "4 دجنبر"
    const titleEl = el.querySelector('h1,h2,h3,h4,h5,[class*="title"]') || el;
    let t = (titleEl.textContent || '').replace(/\s+/g, ' ').trim(); if (dm) t = t.replace(dm[1], '').replace(/\s+/g, ' ').trim();
    t = t.replace(/^[\s:،\-–—|]+|[\s:،\-–—|]+$/g, '');
    if (t.length < 8 || (t.match(/[؀-ۿ]/g) || []).length < t.length * 0.5 || seen.has(t)) return;
    seen.add(t); out.push({ title: t, date, event: true, link: pageUrl + '#e' + out.length, cats: '', when: 0 });
  });
  if (!out.length) throw new Error('no events under "المواعيد القادمة"');
  return out;
}
// What on a news page is NOT the section's own news: menus, the page footer, side boxes, and the breaking-news ticker
// (on SNRT it mixes every topic, sport included). If the page has a "آخر الأخبار" heading, only that block is read.
const NOISE_LABELS = /^(الأخبار العاجلة|أخبار عاجلة|ملف الشهر|ملفات|الأخبار الزائفة|الأكثر قراءة|الأكثر مشاهدة|اقرأ أيضا|مواضيع ذات صلة)$/;   // not "عاجل": that is also a badge on real articles
const FR_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const AR_MONTH_ALL = [['يناير'], ['فبراير'], ['مارس'], ['أبريل', 'ابريل'], ['ماي', 'مايو'], ['يونيو'], ['يوليوز', 'يوليو'], ['غشت', 'أغسطس', 'اغسطس'], ['شتنبر', 'سبتمبر'], ['أكتوبر', 'اكتوبر'], ['نونبر', 'نوفمبر'], ['دجنبر', 'ديسمبر']];
function cardDate(t) {   // the date written on a news card, or 0
  const y2 = y => !y ? new Date().getFullYear() : y.length === 2 ? 2000 + +y : +y;
  let m = t.match(/(\d{1,2})\s+(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\.?\s*(\d{2,4})?/i);
  if (m) { const mi = FR_MONTHS.findIndex(x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '') === m[2].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')); if (mi >= 0) return new Date(y2(m[3]), mi, +m[1], 12).getTime(); }
  m = t.match(new RegExp(`(\\d{1,2})\\s*(${AR_MONTH_ALL.flat().join('|')})\\s*(\\d{4})?`));
  if (m) { const mi = AR_MONTH_ALL.findIndex(v => v.includes(m[2])); return new Date(y2(m[3]), mi, +m[1], 12).getTime(); }
  m = t.match(/(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})/);
  if (m) return new Date(y2(m[3]), +m[2] - 1, +m[1], 12).getTime();
  return 0;
}
function newsScope(doc) {
  doc.querySelectorAll('nav, footer, aside, body > header, [class*="ticker"], [id*="ticker"], [class*="breaking"], [class*="urgent"], [class*="marquee"], [class*="menu"]').forEach(el => el.remove());
  const LATEST = /^(آخر|أخر|اخر) الأخبار$/;
  [...doc.querySelectorAll('h1,h2,h3,h4,h5,span,div,p,strong,a')].filter(el => NOISE_LABELS.test((el.textContent || '').trim())).forEach(el => {
    const box = el.parentElement;   // the box under a label like "ملف الشهر", unless it also holds the latest news
    if (box && box !== doc.body && box.isConnected && ![...box.querySelectorAll('h1,h2,h3,h4,h5,span,div,p,strong')].some(x => LATEST.test((x.textContent || '').trim()))) box.remove();
  });
  const latest = [...doc.querySelectorAll('h1,h2,h3,h4,h5,span,div,p,strong')].find(el => /^(آخر|أخر|اخر) الأخبار$/.test((el.textContent || '').trim()));
  if (!latest) return doc;
  let box = latest.parentElement;
  for (let k = 0; k < 5 && box && box.querySelectorAll('a[href]').length < 3; k++) box = box.parentElement;
  return box || doc;
}
function parseNews(text, pageUrl, feedOnly) {
  if (/^\s*\{/.test(text)) {   // rss2json
    const j = JSON.parse(text); if (j.status !== 'ok') throw new Error(j.message || 'relay refused');
    return (j.items || []).map(x => ({ title: x.title, link: x.link || '', cats: (x.categories || []).join(' '), when: Date.parse((x.pubDate || '').replace(' ', 'T') + 'Z') || 0 }));
  }
  if (/^\s*(<\?xml|<rss|<feed)/i.test(text)) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('broken feed');
    return [...doc.querySelectorAll('item, entry')].map(el => {
      const g = n => { const e = el.getElementsByTagName(n)[0]; return e ? e.textContent.trim() : ''; };
      const linkEl = el.getElementsByTagName('link')[0];
      return { title: g('title'), link: (linkEl && (linkEl.getAttribute('href') || linkEl.textContent)) || '', cats: [...el.getElementsByTagName('category')].map(c => c.textContent || c.getAttribute('term') || '').join(' '), when: Date.parse(g('pubDate') || g('published') || g('updated') || g('dc:date')) || 0 };
    }).filter(x => x.title);
  }
  if (feedOnly) throw new Error('no feed at this address');   // never read headlines off an error page
  if (!/<html|<body|<a\s/i.test(text)) throw new Error('not a page');
  const doc = new DOMParser().parseFromString(text, 'text/html'), host = new URL(pageUrl).hostname.replace(/^www\./, ''), seen = new Set(), out = [];
  const scope = newsScope(doc);
  scope.querySelectorAll('h1 a, h2 a, h3 a, h4 a, a h2, a h3, a h4, [class*="title"] a, a[class*="title"], a [class*="title"], article a, a[href*="/article/"], a[href*="/news/"]').forEach(el => {
    const aEl = el.tagName === 'A' ? el : el.closest('a'); if (!aEl) return;
    const inner = el.tagName === 'A' && el.querySelector('h1,h2,h3,h4,h5,[class*="title"]');   // a link around a whole card: its heading is the title
    const shown = ((inner || el).textContent || '').replace(/\s+/g, ' ').trim();
    // a card that shortens its title ("…") often keeps the whole one in the link's tooltip, label or picture description
    const longer = [aEl.getAttribute('title'), aEl.getAttribute('aria-label'), (aEl.querySelector('img') || {}).alt].map(x => (x || '').replace(/\s+/g, ' ').trim())
      .filter(x => x.length > shown.replace(/(\.\.\.|…)\s*$/, '').length && /[\u0600-\u06FF]/.test(x) && x.startsWith(shown.replace(/(\.\.\.|…)\s*$/, '').trim().slice(0, 12)));
    const t = (longer[0] || shown || (aEl.getAttribute('title') || '').trim() || ((aEl.querySelector('img') || {}).alt || '').trim())
      .replace(/\d{1,2}\s+(janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\.?\s*\d{0,4}/gi, '').replace(/\d{1,2}:\d{2}\s*-\s*\d{1,2}\/\d{1,2}\/\d{2,4}/g, '').replace(/\s+/g, ' ').trim();
    let href = ''; try { href = new URL(aEl.getAttribute('href') || '', pageUrl).href; } catch { return; }
    const arabic = (t.match(/[؀-ۿ]/g) || []).length;
    if (t.length < 25 || t.length > 220 || arabic < t.replace(/\s/g, '').length * 0.6 || t.split(' ').length < 4) return;
    if (!href.includes(host) || /\/(tag|cat|category|article-category|author|page)\//.test(href) || seen.has(href) || seen.has(t)) return;
    // the card around the link usually carries its date
    let card = aEl, when = 0; for (let k = 0; k < 5 && card && !when; k++) { when = cardDate((card.textContent || '').replace(/\s+/g, ' ')); card = card.parentElement; }
    if (when > Date.now() + 2 * 864e5) when = 0;   // a date in the future is an event date, not a publication date
    seen.add(href); seen.add(t); out.push({ title: t, link: href, cats: '', when });
  });
  if (!out.length) {   // a page built by scripts: its titles are often kept in the page's data
    const rx = /"(?:title|headline)"\s*:\s*"((?:[^"\\]|\\.){25,220})"/g; let m;
    while ((m = rx.exec(text)) && out.length < 30) {
      let t = m[1]; try { t = JSON.parse('"' + t + '"'); } catch {}
      t = t.replace(/\s+/g, ' ').trim();
      if ((t.match(/[\u0600-\u06FF]/g) || []).length < t.replace(/\s/g, '').length * 0.6 || t.split(' ').length < 4 || seen.has(t)) continue;
      seen.add(t); out.push({ title: t, link: pageUrl + '#d' + out.length, cats: '', when: 0 });
    }
  }
  return out;
}
// The relay that worked for a source last time is asked first, alone; only if it fails are the others asked, together.
// That keeps the number of requests small, which matters on a phone (a browser sends only a few at a time per site).
const relayMemo = () => { try { return JSON.parse(localStorage.getItem('pbd-relay2') || '{}'); } catch { return {}; } };
// A headline cut short ("…"): the article's own page has it whole (its heading, or the title it shares with).
// Only the first few are looked up; one that stays cut is left out rather than read half-finished.
const CUT = /(\.\.\.|…)\s*$/;
async function tryRelayFor(url, ri) {
  const order = [ri, ...RELAYS.keys()].filter((x, i, arr) => arr.indexOf(x) === i && RELAYS[x](url));
  for (const k of order) { try { const r = await withTimeout(fetch(RELAYS[k](url)), 10000); if (r.ok) return await r.text(); } catch {} }
  return '';
}
async function uncut(items, get) {
  const cut = items.filter(x => CUT.test(x.title) && /^https?:/.test(x.link)).slice(0, 8);
  await Promise.all(cut.map(async x => {
    try {
      const doc = new DOMParser().parseFromString(await get(x.link), 'text/html');
      const og = (doc.querySelector('meta[property="og:title"], meta[name="twitter:title"]') || {}).content || '', h1 = (doc.querySelector('h1') || {}).textContent || '';
      const start = x.title.replace(CUT, '').trim().slice(0, 12);
      const full = [og, h1].map(t => (t || '').replace(/\s+/g, ' ').replace(/\s*[|\-–—]\s*(Hit ?Radio|هيت راديو).*$/i, '').trim()).find(t => t.length > x.title.length - 3 && t.startsWith(start) && !CUT.test(t));
      if (full) x.title = full;
    } catch {}
  }));
  return items.filter(x => !CUT.test(x.title));
}
async function readSourceHere(src) {
  const errs = [];
  const memo = relayMemo();
  for (const u of src.urls) {
    const tryRelay = (ri, ms) => withTimeout((async () => {
      const url = RELAYS[ri](u);
      const r = await fetch(url);
      if (url.startsWith('/api/fetch') && r.status === 404) helperNewsMissing = true;   // a helper that has not updated yet
      if (!r.ok) throw new Error(url.startsWith('/api/fetch') ? r.status === 404 ? 'your PC helper is an older version: close the radio completely and start it again' : 'your PC: ' + ((await r.text()).slice(0, 60) || 'HTTP ' + r.status) : 'HTTP ' + r.status);
      const body = await r.text(), it = src.events ? parseEvents(body, u) : parseNews(body, u, /\/feed$|rss|outboundfeeds/.test(u));
      if (!it.length) throw new Error('no headlines');
      return { it, ri };
    })(), ms);
    const all = RELAYS.map((f, i) => f(u) ? i : -1).filter(i => i >= 0), pref = memo[u];
    try {
      let got = null;
      if (!mobileWeb()) got = await Promise.any(all.map(i => tryRelay(i, 10000)));   // PC and computers: every relay at once
      else {   // a phone: the relay that worked last time first, alone, then the others
        if (all.includes(pref)) { try { got = await tryRelay(pref, 9000); } catch {} }
        if (!got) got = await Promise.any(all.filter(i => i !== pref).map(i => tryRelay(i, 15000)));
      }
      if (mobileWeb() && got.ri !== pref) { const m = relayMemo(); m[u] = got.ri; try { localStorage.setItem('pbd-relay2', JSON.stringify(m)); } catch {} }
      if (/news\.google\./.test(u)) got.it = got.it.map(x => ({ ...x, title: x.title.replace(/\s+[-–|]\s+[^-–|]{2,40}$/, '').trim() }));   // "headline - SNRTnews"
      const it = await uncut(got.it, url => tryRelayFor(url, got.ri));
      return { ok: true, items: it.map(x => ({ ...x, page: u, src: src.id, name: src.name, topic: src.topic })) };
    } catch (e) { errs.push((/news\.google\./.test(u) ? 'backup via Google News: ' : '') + ((e.errors && e.errors[0] && e.errors[0].message) || e.message || String(e))); }
  }
  return { ok: false, error: errs.join(' · ') || 'no answer', items: [] };
}
async function inBatches(list, size, fn) {   // fn over list, at most `size` at a time, results in order
  const out = new Array(list.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(size, list.length) }, async () => { while (next < list.length) { const i = next++; out[i] = await fn(list[i]); } }));
  return out;
}
function servedNews() { try { return JSON.parse(localStorage.getItem('pbd-news-served') || '{}'); } catch { return {}; } }
// Every section is filled to its number. In this order: new headlines from its own sources, in their shares
// (Kech24 4, Marrakech Alaan 2…); then new headlines from elsewhere that fit it (tech, art and trending by their
// words; Marrakech when the headline names the city; the Moroccan and latest sections from any general news);
// only then, if nothing new is left, the most important headlines already read (breaking and top stories first);
// and last, older stories. No sport, ever.
const srcRank = x => { const i = NEWS_SOURCES.findIndex(o => o.id === x.src); return i < 0 ? 99 : i; };
const artRank = x => x.event ? 2 : x.src === 'hitradio' ? 1 : 0;
function pickNews(results, test) {
  const now = Date.now(), served = servedNews();
  Object.keys(served).forEach(k => { if (now - served[k] > 12 * 3600e3) delete served[k]; });
  const seen = new Set(), isNew = x => test || !served[headKey(x.title)];
  const maxAge = Object.fromEntries(NEWS_SOURCES.map(s => [s.id, (s.maxAgeDays || 1.5) * 864e5]));
  const recent = x => !x.when || now - x.when < (maxAge[x.src] || 36 * 3600e3);
  const lists = {};
  results.forEach((r, i) => {
    lists[NEWS_SOURCES[i].id] = r.items.map(x => ({ ...x, title: cleanHead(x.title), breaking: /^\s*عاجل/.test(x.title) || /عاجل/.test(x.cats) }))
      .filter(x => { if (x.title.length <= 12 || SPORT_RX.test(x.title + ' ' + x.cats + ' ' + x.link) || WEATHER_RX.test(x.title) || JUNK_RX.test(x.title) || OPINION_RX.test(dURI(x.link || '') + ' ' + x.cats)) return false; const k = headKey(x.title); if (seen.has(k)) return false; seen.add(k); return true; })
      .filter(x => !NEWS_SOURCES[i].maxAgeDays || (x.when && Date.now() - x.when < NEWS_SOURCES[i].maxAgeDays * 864e5))   // "recent" means a date we could read
      .filter(x => NEWS_SOURCES[i].only !== 'art' || ART_RX.test(x.title + ' ' + x.cats + ' ' + x.link))   // a mixed source: only its stories on the topic
      .filter(x => !NEWS_SOURCES[i].noPolitics || !POLITICS_RX.test(x.title))
      .filter(x => NEWS_SOURCES[i].topic !== 'trend' || !/news\.google\./.test(x.link || '') || SOCIAL_RX.test(x.title))   // a search result must really be about social media
      .sort((p, q) => q.breaking - p.breaking);   // breaking first, then the order the source gives (its top stories)
  });
  const all = id => lists[id] || [], text = x => x.title + ' ' + x.cats + ' ' + x.link;
  const GENERAL = NEWS_SOURCES.filter(s => ['moroccoaj', 'morocco', 'world'].includes(s.topic) && !/^map/.test(s.id)).map(s => s.id);   // MAP is only for أخبار المغرب
  const MOROCCAN = NEWS_SOURCES.filter(s => s.local && !s.events && !['kech24', 'alaan', 'kechall'].includes(s.id)).map(s => s.id);   // أخبار المغرب is filled only from Moroccan sources
  const MARRAKECH_ONLY = ['kech24', 'alaan', 'kechall'];   // Kech24 and Marrakech Alaan feed only the Marrakech section
  const used = new Set(), picked = [];
  NEWS_PLAN.forEach(([topic, n]) => {
    const start = picked.length, room = () => picked.length - start < n;
    const take = x => { if (room() && !used.has(x)) { used.add(x); picked.push({ ...x, topic }); } };
    const own = NEWS_SOURCES.filter(s => s.topic === topic);
    const rx = { tech: TECH_RX, techworld: TECH_RX, art: ART_RX, trend: SOCIAL_RX }[topic];
    // headlines from elsewhere that fit this section
    const elsewhere = () => rx ? NEWS_SOURCES.filter(s => (topic !== 'tech' || s.local) && !s.events && !MARRAKECH_ONLY.includes(s.id)).flatMap(s => all(s.id)).filter(x => rx.test(text(x)))
      : topic === 'marrakech' ? Object.values(lists).flat().filter(x => !x.event && /مراكش/.test(x.title))
      : topic === 'moroccoaj' ? MOROCCAN.flatMap(all)
      : GENERAL.flatMap(all);
    const tiers = [x => isNew(x) && recent(x), x => recent(x), () => true];   // new; then already read; then older
    if (topic === 'moroccoaj') own.forEach(s => {   // fixed shares (royal 1, politics 2, economy 2): each from its own page, even an older headline, before anything else
      const mine = () => picked.slice(start).filter(x => x.src === s.id).length;
      tiers.forEach(tier => all(s.id).filter(tier).forEach(x => { if (mine() < s.take) take(x); }));
    });
    tiers.forEach((tier, ti) => {
      if (ti === 0) own.forEach(s => all(s.id).filter(tier).slice(0, s.take).forEach(take));   // each source's share
      own.forEach(s => all(s.id).filter(tier).slice(0, s.events ? s.take : undefined).forEach(take));   // never more upcoming events than asked
      elsewhere().filter(tier).forEach(take);
    });
  });
  if (!test) { picked.forEach(x => { served[headKey(x.title)] = now; }); try { localStorage.setItem('pbd-news-served', JSON.stringify(served)); } catch {} }
  return picked.map(x => ({ title: x.title, link: x.link, page: x.page, topic: x.topic, source: x.name, src: x.src, breaking: x.breaking, event: x.event, date: x.date }))
    .sort((p, q) => (p.topic !== q.topic ? 0 : p.topic === 'moroccoaj' ? srcRank(p) - srcRank(q) : artRank(p) - artRank(q)));   // art: BBC, then Hit Radio; أخبار المغرب: royal, politics, economy
}
const WMO_AR = { 0: 'سماء صافية', 1: 'سماء صافية في الغالب', 2: 'سماء غائمة جزئيا', 3: 'سماء غائمة', 45: 'ضباب', 48: 'ضباب', 51: 'رذاذ خفيف', 53: 'رذاذ', 55: 'رذاذ كثيف', 56: 'رذاذ متجمد', 57: 'رذاذ متجمد', 61: 'أمطار خفيفة', 63: 'أمطار', 65: 'أمطار غزيرة', 66: 'أمطار متجمدة', 67: 'أمطار متجمدة', 71: 'ثلوج خفيفة', 73: 'ثلوج', 75: 'ثلوج كثيفة', 77: 'ثلوج', 80: 'زخات مطرية خفيفة', 81: 'زخات مطرية', 82: 'زخات مطرية قوية', 85: 'زخات ثلجية', 86: 'زخات ثلجية', 95: 'عواصف رعدية', 96: 'عواصف رعدية مع برد', 99: 'عواصف رعدية مع برد' };
// Marrakech: now, the rest of today (the hours still to come), and tomorrow
async function weatherNow() {
  const u = 'https://api.open-meteo.com/v1/forecast?latitude=31.63&longitude=-8.01&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Africa%2FCasablanca&forecast_days=2';
  const j = await (await withTimeout(fetch(u), mobileWeb() ? 15000 : 10000)).json();
  const c = j.current, d = j.daily, h = j.hourly, today = c.time.slice(0, 10), hourNow = +c.time.slice(11, 13);
  const later = h.time.map((t, i) => ({ t, temp: h.temperature_2m[i], code: h.weather_code[i] })).filter(x => x.t.slice(0, 10) === today && +x.t.slice(11, 13) > hourNow);
  const rest = later.length >= 2 ? { min: Math.round(Math.min(...later.map(x => x.temp))), max: Math.round(Math.max(...later.map(x => x.temp))), sky: WMO_AR[Math.max(...later.map(x => x.code))] || '', night: hourNow >= 18 } : null;
  return { now: { temp: Math.round(c.temperature_2m), sky: WMO_AR[c.weather_code] || '' }, rest, tomorrow: { min: Math.round(d.temperature_2m_min[1]), max: Math.round(d.temperature_2m_max[1]), sky: WMO_AR[d.weather_code[1]] || '' } };
}
let helperNewsMissing = false;
async function getNews(manual) {
  const wx = weatherNow().catch(() => null);
  helperNewsMissing = false;
  const results = await inBatches(NEWS_SOURCES, mobileWeb() ? 6 : NEWS_SOURCES.length, readSourceHere);
  return { items: pickNews(results, manual), weather: await wx, via: HELPER && !helperNewsMissing ? 'your PC and the web' : 'the web', sources: NEWS_SOURCES.map((s, i) => ({ id: s.id, name: s.name, ok: results[i].ok, n: results[i].items.length, error: results[i].error || '' })) };
}
const wxLine = (w, sky) => w.min === w.max ? `${sky || 'جو معتدل'}، وحرارة في حدود ${w.max} درجة.` : `${sky || 'جو معتدل'}، والحرارة بين ${w.min} و${w.max} درجة.`;
// Said as words, not letters: كلغ is a kilogram, كلم a kilometre; Marrakech is voweled so it sounds Murrākush
const AR_UNIT = { 'كلغ': 'كيلوغرام', 'كغ': 'كيلوغرام', 'كلم': 'كيلومتر', 'ملم': 'مليمتر', 'سنتم': 'سنتيمتر' };
const spokenArabic = l => l.replace(/مراكش/g, 'مُرّاكُش')
  .replace(/(^|[^\u0600-\u06FF])(بال|لل|ال|ب|ل|و)?(كلغ|كغ|كلم|ملم|سنتم)(?=$|[^\u0600-\u06FF])/g, (m, pre, pfx, u) => pre + (pfx || '') + AR_UNIT[u])
  .replace(/(\d)\s*[%٪]/g, '$1 في المائة').replace(/(\d)\s*°/g, '$1 درجة');
const NEWS_SECTION_TAG = { marrakech: 'مراكش', moroccoaj: 'أخبار المغرب', morocco: 'آخر الأخبار', world: 'آخر الأخبار', tech: 'التكنولوجيا والذكاء الاصطناعي', techworld: 'التكنولوجيا والذكاء الاصطناعي', art: 'الفن', trend: 'الأكثر تداولا على مواقع التواصل' };
function newsTag(x) {   // "أخبار المغرب · Hespress", the site's name without the page it came from
  const site = (x.name || (NEWS_SOURCES.find(o => o.id === x.src) || {}).name || x.src || '').replace(/\s+(Marrakech|royal activities|politics|economy|24h|world|tech|culture|social media|trending|upcoming events|\(all\))$/i, '');
  return [NEWS_SECTION_TAG[x.topic] || '', site + (/news\.google\./.test(x.link || '') ? ' (via Google News)' : '')].filter(Boolean).join(' · ');
}
function arabicBulletin(n) {
  const h = new Date().getHours(), lines = [h === 0 ? 'أهلا بكم في نشرة أخبار منتصف الليل.' : `أهلا بكم في نشرة الأخبار. الساعة ${h}.`];
  let label = '';   // a heading is said once, when it changes
  const info = [{}];   // for Settings > News > Last bulletin: where each line came from
  const tags = [''];   // shown in cyan under each headline: its section · its source
  (n.items || []).forEach(x => {
    const title = x.topic === 'marrakech' ? x.title.replace(/^\s*(مراكش( ال[آا]ن)?|كش ?24)\s*([:|\-–—،,/»«]+|\.\.+)\s*/, '') : x.title;   // "مراكش: …" right after the Marrakech heading
    const head = x.event ? `ومن المواعيد الثقافية القادمة: ${x.title.replace(/\s*(\.{2,}|…)\s*/g, '، ')}${x.date ? '، ' + x.date : ''}.` : (x.breaking ? 'عاجل: ' : '') + title.replace(/\s*(\.{2,}|…)\s*$/, '').replace(/\s*(\.{2,}|…)\s*/g, '، ').replace(/\?$/, '؟').replace(/([^؟!.])$/, '$1.'), l = NEWS_TOPIC_AR[x.topic] || '';   // a question stays a question   // "المغرب والجزائر.. اتصالات": a pause, not the end
    lines.push(l && l !== label ? `${l}: ${head}` : head);
    tags.push(newsTag(x)); info.push({ title: x.title, link: x.link || '', page: x.page || '' });
    label = l;
  });
  const w = n.weather;
  if (w && w.now && Number.isFinite(w.now.temp)) {
    lines.push(`وأخيرا، حالة الطقس في مراكش. حاليا ${w.now.sky || 'جو معتدل'}، ودرجة الحرارة ${w.now.temp} درجة.`);
    if (w.rest) lines.push((w.rest.night ? 'وفي ما تبقى من الليلة، ' : 'وفي ما تبقى من اليوم، ') + wxLine(w.rest, w.rest.sky));
    if (w.tomorrow && Number.isFinite(w.tomorrow.max)) lines.push('وغدا، ' + wxLine(w.tomorrow, w.tomorrow.sky));
  }
  while (tags.length < lines.length) tags.push('الطقس · Open-Meteo');   // the weather lines
  lines.push('كانت هذه أبرز العناوين. شكرا لمتابعتكم.');
  const out = lines.map(spokenArabic); out.tags = tags; out.info = info;
  return out;   // voweled, so the voice says Murrākush, not Marākish
}
async function runNews(manual) {
  if (newsOn) return;
  if (!started) { if (manual) toast('Press play first, then try the news.'); return; }
  newsBack = resumeTarget();
  newsShown = { kind: $('kind').textContent, title: $('title').textContent, artist: $('artist').textContent, chips: $('chips').innerHTML };
  if (globalPaused) clearPause();
  stopSpeech(); newsOn = true;
  const id = runId;
  busy = true; clearTimeout(startWatch); planned = null; preload = null;
  pl.forEach(p => { if (!p) return; fadeP(p, 0, 1200).then(() => { try { if (newsOn) p.pauseVideo(); } catch {} }); });
  bedOff(0.8);
  $('kind').textContent = 'news'; $('title').textContent = 'The News'; $('artist').textContent = 'الأخبار · ' + clock(); $('chips').innerHTML = '';
  $('vinyl').classList.add('talk'); setLive(true);
  rlog('news', { manual, back: newsBack && newsBack.type, arabicVoice: arWho() });
  const fetched = withTimeout(getNews(manual), mobileWeb() ? 75000 : 45000).catch(() => null);
  await sleep(1300);
  if (id !== runId) return;
  $('capKind').textContent = R.host;
  await say(sub(fresh('newsin', NEWS_IN)), 'h');
  let ready = false; fetched.then(() => { ready = true; });
  if (mobileWeb()) await sleep(1500);
  if (!ready && id === runId && mobileWeb()) { bedOn(); await say(fresh('newswait', ['The headlines are coming in. One moment.', 'One moment, the news is on its way.', 'The wires are still coming in. Bear with me.']), 'h'); }   // a slow connection: no silence
  const n = await fetched;
  if (mobileWeb()) bedOff(0.8);
  if (id !== runId) return;
  if (n) { lastNewsSources = n.sources || null; lastNewsVia = n.via || ''; paintNewsNote(); }
  rlog('news fetched', { via: n && n.via, items: n && (n.items || []).length, weather: !!(n && n.weather), sources: n && n.sources && n.sources.map(s => s.id + (s.ok ? ':ok' : ':' + s.error)).join(' ') });
  if (!n || (!(n.items || []).length && !(n.weather && n.weather.now))) {
    await say('The news sources are not answering right now, so no headlines this time. Back to where we were.', 'h');
    if (id === runId) finishNews();
    return;
  }
  await newsJingleRun();
  if (id !== runId) return;
  $('capKind').textContent = 'الأخبار';
  const lines = arabicBulletin(n);
  try { localStorage.setItem('pbd-news-last', JSON.stringify({ at: Date.now(), lines: lines.map((t, i) => ({ said: t, tag: lines.tags[i] || '', ...(lines.info[i] || {}) })) })); } catch {}
  newsArrows(true);
  let jumped = false;
  for (let li = 0; li < lines.length; ) {
    newsAt = li; newsJump = 0; const tok = ++newsLineTok;
    $('capText').textContent = lines[li]; newsLink = ((lines.info || [])[li] || {}).link || ''; $('capSrc').textContent = ((lines.tags || [])[li] || '') + (newsLink ? ' · ↗ tap to open' : ''); $('cap').classList.toggle('linkable', !!newsLink);   // shown at once, also right after an arrow
    if (jumped) { jumped = false; await sleep(250); try { speechSynthesis.cancel(); speechSynthesis.resume(); } catch {} await sleep(100); if (id !== runId) break; if (newsJump) { li = Math.max(0, Math.min(lines.length, li + newsJump)); jumped = true; continue; } }   // let the voice settle after the cancel (an arrow pressed meanwhile moves on again)
    await Promise.race([mobileWeb() ? sayArabic(lines[li]) : sayNewsComputer(lines[li]), new Promise(r => { newsSkipTo = r; })]);
    if (id !== runId) { newsArrows(false); return; }
    if (newsJump) { li = Math.max(0, Math.min(lines.length, li + newsJump)); jumped = true; continue; }   // an arrow: that headline right away, then on from there
    if (tok !== newsLineTok) continue;
    li++; await sleep(350);
  }
  newsArrows(false);
  await newsJingleRun();
  if (id !== runId) return;
  $('capKind').textContent = R.host;
  await say(sub(fresh('newsout', NEWS_OUT)), 'h');
  if (id === runId) finishNews();
}
// ‹ and › in the caption box, only while the headlines are read: the previous headline, or the next one
let newsAt = 0, newsJump = 0, newsLineTok = 0, newsSkipTo = null;
function newsArrows(on) { ['newsPrev', 'newsNext'].forEach(i => { const b = $(i); if (b) b.style.display = on ? '' : 'none'; }); $('cap').classList.toggle('arrows', !!on); if (!on) { $('capSrc').textContent = ''; newsLink = ''; $('cap').classList.remove('linkable'); } }
let newsLink = '';
$('cap').addEventListener('click', async e => {   // during the news: the article being read, in your browser
  if (!newsOn || !newsLink || e.target.closest('button')) return;
  const url = newsLink;
  if (HELPER) { try { const r = await fetch('/api/open?url=' + encodeURIComponent(url)); if (r.ok) return toast('Opened in your browser.'); } catch {} }
  window.open(url, '_blank', 'noopener');
});
function newsStep(d) {
  if (!newsOn) return;
  newsJump = d; newsLineTok++;
  try { speechSynthesis.cancel(); } catch {} try { if (curAudio) curAudio.pause(); } catch {}
  if (newsSkipTo) { const r = newsSkipTo; newsSkipTo = null; r(); }
}
$('newsPrev').onclick = e => { e.stopPropagation(); newsStep(-1); };
$('newsNext').onclick = e => { e.stopPropagation(); newsStep(1); };
function endNews() {   // Next during the news
  if (!newsOn) return;
  stopSpeech(); if (newsJingle) { try { newsJingle.stop(); } catch {} newsJingle = null; }
  finishNews();
}
function finishNews() {
  newsArrows(false);
  const back = newsBack; newsOn = false; newsBack = null; busy = false;
  $('vinyl').classList.remove('talk'); caption(R.host, '');
  if (newsShown) { $('kind').textContent = newsShown.kind; $('title').textContent = newsShown.title; $('artist').textContent = newsShown.artist; $('chips').innerHTML = newsShown.chips; newsShown = null; }
  if (!back) { setLive(false); return; }
  if (back.type === 'break') return advance({ song: back.next, prev: null, replaySegs: back.segs.slice(back.idx), noCount: true, forceTalk: true });
  if (back.type === 'pod') { busy = true; stopSpeech(); return playPodcast(back.pod, null, { scheduled: true }, runId); }
  return advance({ song: back.song, prev: null, silent: true, noCount: true, quick: true });
}
// on the hour, every 4 hours; skipped while you have paused the radio
setInterval(() => {
  if (!started || S.news === 'off' || newsOn || globalPaused) return;
  const d = new Date(); if (d.getMinutes() !== 0 || d.getHours() % 4) return;
  const slot = d.toDateString() + ' ' + d.getHours(); if (slot === lastNewsSlot) return;
  lastNewsSlot = slot; runNews(false);
}, 5000);
let lastNewsSources = null, lastNewsVia = '';
function paintNewsNote() {
  const n = $('newsNote'); if (!n) return;
  const old = HELPER && helperNewsMissing ? 'Your PC helper is an older version: close the radio completely and open it again (twice) to update it. Meanwhile the headlines come through the web. ' : '';
  if (!lastNewsSources) { n.textContent = old + 'every 4 hours on the hour, in Arabic'; return; }
  n.textContent = old + (lastNewsVia ? `last news via ${lastNewsVia}: ` : '') + lastNewsSources.map(x => `${x.name} ${x.ok ? '✓' : '✗ ' + x.error}`).join(' · ');
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
  const L = id.startsWith('list:') && (lib.lists || []).find(x => 'list:' + x.key === id);
  if (L) {   // one of your saved lists: all of it, shuffled
    favList = listSongs(L);
    if (!favList.length) return toast('That list has no songs left in the library.');
    pack = { id, label: 'your list, ' + L.name, short: L.name, genres: [], langs: [], songs: [], tags: [], genre: '' };
  }
  if (!pack) return;
  const size = Math.random() < 0.15 ? 40 : 20 + Math.floor(Math.random() * 11);
  const rs = recentSets();
  const fits = songs.filter(s => (pack.genres || []).includes(s.genre));
  const fresher = fits.filter(s => !rs.recentKeys.has(s.key));          // songs not heard lately come first
  const list = favList ? shuffle(favList) : [...shuffle(fresher), ...shuffle(fits.filter(s => rs.recentKeys.has(s.key)))];
  if (!list.length) return toast('No songs of that genre in the library yet.');
  batch = { id, label: pack.label, short: pack.short, left: L ? list.length : Math.min(size, list.length), list };
  planned = null; preload = null; startAnnounce = pack.label; songsSinceBreak = 99; lastRunSong = null;
  toast(L ? `Your list "${L.name}": ${batch.left} songs, shuffled. It starts after this song.` : `Genre run: ${pack.short}, about ${batch.left} songs. It starts after this song.`);
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
  (lib.lists || []).forEach(L => add('▶ ' + L.name, `your list · ${listSongs(L).length} songs, all of them`, batch && batch.id === 'list:' + L.key, () => startRun('list:' + L.key)));
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
  if (newsOn) return endNews(true);   // Next during the news: stop it and go back to what was playing
  if (globalPaused) resumeAll();
  if (breakSkip) { const b = breakSkip; breakSkip = null; b(); return; }   // during a commercial break: skip the current jingle, ad or spoken line
  try { // learn where a silent tail begins: if you skip near the end, trim there from now on
    if (current && !current.podcast && playing && !busy) { const d = P().getDuration(), c = P().getCurrentTime(); if (d > 60 && d - c < 90 && d - c > 3) { lib.trim[current.key] = Math.max(0, c - 1); saveLib(); toast('Got it. I will end this song right here from now on.'); } }
  } catch {}
  advance({ quick: true });
}
function prev() { if (started && globalPaused) resumeAll(); if (!started || !history.length) return toast('No earlier song yet.'); const p = history.pop(); advance({ song: p, prev: null, silent: true, noCount: true, quick: true }); }
async function tuneIn() {
  started = true; $('tune').style.display = 'none'; unlockAudio();
  if (!voices.length) loadVoices();
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch {}
  setPlayIcon(true);
  const back = updResume; updResume = null;
  if (back && back.song) {   // right after an update: the same song, from where it was, without the welcome
    await advance({ song: back.song, silent: true, noCount: true, prev: null });
    if (current && current.key === back.song.key && back.t > 3) setTimeout(() => { try { P().seekTo(back.t, true); } catch {} }, 1500);
    return;
  }
  await advance({ first: back ? false : true, silent: !!back });
}

// ---------- Update: the newest version now, without closing the radio ----------
// The PC asks its helper to download the new files at once; the web just reloads past the browser's cache. Either way
// the page reloads, and pressing play carries on with the same song from the same moment.
let updResume = null;
try { const r = JSON.parse(sessionStorage.getItem('pbd-resume') || 'null'); sessionStorage.removeItem('pbd-resume'); if (r && Date.now() - r.at < 10 * 60e3) { updResume = r; $('tuneSub').textContent = 'updated · press play to carry on'; } } catch {}
const pageVersion = () => (document.querySelector('meta[name="pbd-version"]') || {}).content || '';
$('btnUpdate').onclick = async () => {
  const b = $('btnUpdate'); if (b.disabled) return; b.disabled = true; b.textContent = 'Checking…';
  try {
    let version = '', helperLater = false;
    if (HELPER) {
      const r = await fetch('/api/update', { method: 'POST' }).catch(() => null);
      if (r && r.ok) { const j = await r.json(); version = j.version || ''; helperLater = !!j.helperLater; }
    }
    if (!version) { try { version = ((await (await fetch('files.json?t=' + Date.now(), { cache: 'no-store' })).json()) || {}).version || ''; } catch {} }   // unknown: reload anyway
    if (version && version === pageVersion()) { toast(helperLater ? 'You have the newest version. One part of the PC helper takes effect the next time you open the radio.' : 'You have the newest version.'); return; }
    try { sessionStorage.setItem('pbd-resume', JSON.stringify({ at: Date.now(), song: current && !current.podcast && !newsOn ? current : null, t: (() => { try { return P().getCurrentTime(); } catch { return 0; } })() })); } catch {}
    toast('Updating…');
    await sleep(400);
    location.replace(location.pathname + '?u=' + Date.now());
  } catch (e) { toast('Could not check for updates: ' + (e.message || e)); }
  finally { b.disabled = false; b.textContent = 'Update'; }
};

// ---------- panels ----------
const sheets = ['shAdd', 'shLib', 'shSet', 'shRun', 'shAds', 'shVer', 'shReport', 'shLabel'];
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
$('btnAdd').onclick = () => { openSheet('shAdd'); setTimeout(() => (addTab === 'list' ? $('listIn') : $('addq')).focus(), 50); };

// ---------- Suggest > A list: a YouTube playlist link, or one "Artist - Title" per line (no size limit) ----------
// Every song is matched and shown with a tick box before anything is added. Added songs join the library
// with no genre ("Needs labels" in the Library) and, if "Play these next" is ticked, play in order after this song.
let addTab = 'one', listItems = [], listBusy = false;
document.querySelectorAll('#addTabs button').forEach(b => b.onclick = () => {
  addTab = b.dataset.v;
  document.querySelectorAll('#addTabs button').forEach(x => x.classList.toggle('on', x === b));
  $('addOne').style.display = addTab === 'one' ? 'contents' : 'none';
  $('addList').style.display = addTab === 'list' ? 'flex' : 'none';
});
function listEntry(a, t, cands, line) {
  const k = (a + '|' + t).toLowerCase(), v = cands[0];
  const ex = songs.find(s => s.key === k) || songs.find(s => (s.cands || []).some(c => c.id === v.id));
  const removed = lib.removed.includes(k);
  return { a, t, key: k, libKey: ex ? ex.key : k, cands, line, ci: 0, inLib: !!ex, removed, on: !removed };   // songs already in the library are ticked too: they belong to the list, and are not added twice
}
function renderListRes() {
  const box = $('listRes'); box.innerHTML = '';
  listItems.forEach(it => {
    const d = document.createElement('div'); d.className = 'item';
    if (it.missing) { d.innerHTML = `<div class="meta"><b></b><span>${it.failed ? 'YouTube did not answer, try again later' : 'not found on YouTube'}</span></div>`; d.querySelector('b').textContent = it.line; box.appendChild(d); return; }
    const v = it.cands[it.ci];
    d.innerHTML = `<input type="checkbox" style="margin:0 8px 0 0;flex:none"><img src="https://i.ytimg.com/vi/${v.id}/default.jpg" width="48" height="36" style="border-radius:6px;object-fit:cover;flex:none"><div class="meta"><b></b><span></span></div>${it.cands.length > 1 ? '<button class="mini-btn" title="Show the next YouTube result">other</button>' : ''}`;
    const cb = d.querySelector('input'); cb.checked = it.on; cb.onchange = () => { it.on = cb.checked; updateListAdd(); };
    d.querySelector('b').textContent = `${it.a} - ${it.t}`;
    d.querySelector('span').textContent = `${cleanTitle(v.title || '')} · ${v.channel || ''}${it.inLib ? ' · already in your library' : ''}${it.removed ? ' · you removed this before' : ''}`;
    const ob = d.querySelector('.mini-btn'); if (ob) ob.onclick = () => { it.ci = (it.ci + 1) % it.cands.length; renderListRes(); };
    box.appendChild(d);
  });
  updateListAdd();
}
function updateListAdd() {
  const n = listItems.filter(x => x.on && !x.missing).length;
  const named = $('listName').value.trim();
  $('listAdd').style.display = n ? '' : 'none'; $('listAdd').textContent = named ? `Save the list (${n} song${n === 1 ? '' : 's'})` : `Add ${n} song${n === 1 ? '' : 's'}`;
  $('listAll').style.display = listItems.some(x => !x.missing) ? '' : 'none';
  const miss = listItems.filter(x => x.missing).length;
  $('listRetry').style.display = miss && !listBusy ? '' : 'none'; $('listRetry').textContent = `Search the ${miss} missing again`;
  $('listSave').style.display = listItems.some(x => !x.missing) ? 'flex' : 'none';
}
$('listAll').onclick = () => { const anyOff = listItems.some(x => !x.missing && !x.on); listItems.forEach(x => { if (!x.missing) x.on = anyOff; }); renderListRes(); };
// Searching a pasted list, quickly but politely: up to 3 lines at a time, with a shared pace between requests.
// The pace speeds up while YouTube answers and slows right down when it refuses (too many searches in a row);
// a refused line waits and is tried again instead of being called missing. Songs already in the library need no search.
const pace = { gap: 300, next: 0 };
async function slot() { const now = Date.now(), at = Math.max(now, pace.next); pace.next = at + pace.gap; if (at > now) await sleep(at - now); }
const nrm = x => (x || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
let known = null;   // "artist|title" of every library song that already has a video, built once per search
function findKnown(a, t) {
  if (!known) { known = new Map(); songs.forEach(s => { if (s.cands && s.cands.length) known.set(nrm(s.a) + '|' + nrm(s.t), s); }); }
  return a ? known.get(nrm(a) + '|' + nrm(t)) : null;
}
async function findLine(line) {
  const parts = line.split(/\s+[-–—]\s+/), a = parts.length > 1 ? parts[0] : '', t = parts.length > 1 ? parts.slice(1).join(' - ') : line;
  const ex = findKnown(a, t); if (ex) return listEntry(ex.a, ex.t, ex.cands, line);
  const ask = async q => {
    await slot();
    const r = await fetch('/api/search?q=' + q); const j = r.ok ? await r.json() : null;
    if (!Array.isArray(j)) { pace.gap = 2000; throw new Error('refused'); }
    if (pace.gap > 300) pace.gap = Math.max(300, Math.round(pace.gap * 0.8));   // answering again: speed back up
    return j;
  };
  for (const wait of [0, 10, 30, 60]) {
    for (let w = wait; w > 0 && listBusy; w--) { $('listStatus').textContent = `YouTube is asking us to slow down. Trying again in ${w}s…`; await sleep(1000); }
    if (!listBusy) break;
    try {
      let r = await ask(encodeURIComponent(line) + (a ? '&a=' + encodeURIComponent(a) + '&t=' + encodeURIComponent(t) : ''));
      if (!r.length) r = await ask(encodeURIComponent(line));   // a looser second try
      if (!r.length) return { line, missing: true };
      const c = r.slice(0, 5), s0 = splitTitle(c[0]);
      return listEntry(a || s0.a, a ? t : s0.t, c, line);
    } catch {}
  }
  return { line, missing: true, failed: true };
}
// runs findLine over lines with 3 workers; results land in their own place so the list keeps your order
async function searchLines(lines, put, label) {
  known = null; let next = 0, done = 0;
  const worker = async () => {
    while (listBusy && next < lines.length) {
      const i = next++, it = await findLine(lines[i]);
      if (!listBusy && it.failed) return;   // stopped while waiting
      put(i, it); done++; renderListRes();
      if (!/slow down/.test($('listStatus').textContent) || done === lines.length) $('listStatus').textContent = `${label} ${done} of ${lines.length}…`;
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}
$('listRetry').onclick = async () => {
  if (listBusy) return;
  listBusy = true; $('listGo').textContent = 'Stop'; updateListAdd();
  const todo = listItems.filter(x => x.missing);
  await searchLines(todo.map(x => x.line), (i, it) => { listItems[listItems.indexOf(todo[i])] = it; }, 'Searching again:');
  const miss = listItems.filter(x => x.missing).length;
  $('listStatus').textContent = miss ? `${miss} still missing. Check the spelling, or try again later.` : 'All found.';
  listBusy = false; $('listGo').textContent = 'Read the list'; updateListAdd();
};
$('listGo').onclick = async () => {
  if (listBusy) { listBusy = false; return; }   // the button reads "Stop" while searching
  if (!HELPER) { $('listStatus').textContent = NEEDS_PC; return; }
  const raw = $('listIn').value.trim(); if (!raw) return;
  listItems = []; renderListRes(); listBusy = true; $('listGo').textContent = 'Stop';
  $('listGenre').innerHTML = genreOptions('none, I will label them later');
  try {
    const pl = raw.match(/[?&]list=([\w-]+)/) || (/^(PL|OL|UU|FL|RD)[\w-]{10,}$/.test(raw) ? [raw, raw] : null);
    if (pl) {
      $('listStatus').textContent = 'Reading the playlist…';
      const r = await fetch('/api/playlist?list=' + encodeURIComponent(pl[1])); const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'the playlist could not be read');
      j.items.forEach(v => { const { a, t } = splitTitle(v); listItems.push(listEntry(a, t, [v], '')); });
      if (j.title) $('listName').value = j.title;
      renderListRes();
      $('listStatus').textContent = `"${j.title}": ${listItems.length} songs. Untick any you don't want, or press "other" for another version.`;
    } else {
      const lines = raw.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      if (!$('listName').value.trim()) $('listName').value = 'My list, ' + new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const slots = [];
      await searchLines(lines, (i, it) => { slots[i] = it; listItems = slots.filter(Boolean); }, 'Searching:');
      const found = listItems.filter(x => !x.missing).length, refused = listItems.filter(x => x.failed).length;
      $('listStatus').textContent = `${found} of ${lines.length} found${listBusy ? '' : ' (stopped)'}.${refused ? ` YouTube did not answer for ${refused}: press "Search the missing again" in a few minutes.` : ''} Untick any you don't want, or press "other" for another version.`;
    }
  } catch (e) { $('listStatus').textContent = 'Could not read that: ' + (e.message || e); }
  listBusy = false; $('listGo').textContent = 'Read the list'; updateListAdd();
};
$('listName').oninput = updateListAdd;
$('listAdd').onclick = () => {
  const chosen = listItems.filter(x => x.on && !x.missing); if (!chosen.length) return;
  const now = Date.now(), keys = [], added = chosen.filter(it => !it.inLib).length;
  chosen.forEach((it, i) => {
    if (it.inLib) { if (!keys.includes(it.libKey)) keys.push(it.libKey); return; }   // already in the library: only joins the list
    const v = it.cands[it.ci], cands = [v, ...it.cands.filter(c => c.id !== v.id)];
    if (lib.removed.includes(it.key)) { lib.removed = lib.removed.filter(k => k !== it.key); markDeleted('removed', it.key); }   // you ticked a song you had removed: it comes back
    if (!lib.user.some(u => u.key === it.key)) lib.user.push({ a: it.a, t: it.t, q: it.line || `${it.a} - ${it.t}`, tags: [], genre: '', user: true, cands, added: now + i, key: it.key });
    lib.cache[it.key] = cands; if (!keys.includes(it.key)) keys.push(it.key);
  });
  buildSongs();
  const genre = $('listGenre').value, name = $('listName').value.trim();
  if (genre && labelGenre(keys, genre)) buildSongs();
  let L = null;
  if (name) {   // the same name again (a playlist read a second time) adds to that list instead of making a twin
    lib.lists = lib.lists || [];
    L = lib.lists.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (L) { L.keys = [...new Set([...L.keys, ...keys])]; L.ts = now; if (genre) L.genre = genre; }
    else lib.lists.push(L = { key: 'l' + now.toString(36), name, keys, genre, created: now, ts: now });
  }
  saveLib(); if (window.Cloud && Cloud.user) Cloud.push(lib, true);
  const playNext = $('listPlayNext').checked;
  if (playNext) { planned = null; preload = null; keys.forEach(k => { const s = songs.find(x => x.key === k); if (s) upNext.push(s); }); }
  rlog('list added', { songs: keys.length, new: added, list: name, genre, playNext });
  const left = keys.filter(k => { const s = songs.find(x => x.key === k); return s && !s.genre; }).length;
  toast(`${L ? `List "${L.name}" saved, ${keys.length} songs (${added} new)` : `${added} song${added === 1 ? '' : 's'} added to your library`}${playNext ? ', playing next' : ''}.${left ? ` ${left} still need a genre.` : ''}`);
  listItems = []; renderListRes(); $('listIn').value = ''; $('listName').value = ''; openSheet(null);
};

// ---------- labels for any song: genre, lyric themes, mood, energy (kept in lib.labels, synced through the cloud) ----------
const MOODS = ['calm', 'warm', 'dreamy', 'melancholic', 'dark', 'tense', 'playful'];
let labelKey = null, labelEnergy = 2;
function openLabels(s) {
  labelKey = s.key; $('labelSong').textContent = `${s.a} - ${s.t}`;
  $('labelGenre').innerHTML = genreOptions('choose a genre');
  $('labelGenre').value = s.genre || '';
  $('labelThemes').innerHTML = THEMES.map(t => `<label><input type="checkbox" value="${t}"${(s.tags || []).includes(t) ? ' checked' : ''}><span>${t}</span></label>`).join('');
  $('labelMood').innerHTML = MOODS.map(m => `<option>${m}</option>`).join(''); $('labelMood').value = MOODS.includes(s.mood) ? s.mood : 'calm';
  labelEnergy = s.energy || 2; paintEnergy();
  openSheet('shLabel');
}
function paintEnergy() { document.querySelectorAll('#labelEnergy button').forEach(b => b.classList.toggle('on', +b.dataset.v === labelEnergy)); }
document.querySelectorAll('#labelEnergy button').forEach(b => b.onclick = () => { labelEnergy = +b.dataset.v; paintEnergy(); });
$('labelSave').onclick = () => {
  const genre = $('labelGenre').value; if (!genre) return toast('Choose a genre first.');
  const tags = [...document.querySelectorAll('#labelThemes input:checked')].map(i => i.value), mood = $('labelMood').value;
  lib.labels = lib.labels || {}; lib.labels[labelKey] = { genre, tags, mood, energy: labelEnergy, ts: Date.now() };
  const u = lib.user.find(x => x.key === labelKey); if (u) { u.genre = genre; u.tags = tags; u.mood = mood; u.energy = labelEnergy; }
  buildSongs(); saveLib(); toast('Labels saved.');
  openSheet('shLib'); renderLib();
};

// ---------- favorites ----------
let libTab = 'all';
// the Library search box: every word must appear in the artist or the title (accents and punctuation ignored)
const fold = x => (x || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ');
const libMatch = (...fields) => { const ws = fold($('libQ').value).split(' ').filter(Boolean); if (!ws.length) return true; const h = ' ' + fields.map(fold).join(' ') + ' '; return ws.every(w => h.includes(w)); };
const noMatch = () => `<p style="color:var(--mute);font-size:13px">Nothing here matches "${$('libQ').value.replace(/[<&"]/g, '')}".</p>`;
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
  const fm = f.filter(x => libMatch(x.a, x.t)); if (!fm.length) l.insertAdjacentHTML('beforeend', noMatch());
  fm.slice().reverse().forEach(x => {
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
function renderLists() {
  const l = $('libList'); l.innerHTML = ''; const ls = lib.lists || [];
  $('libCount').textContent = `· ${ls.length} list${ls.length === 1 ? '' : 's'}`;
  if (!ls.length) { l.innerHTML = '<p style="color:var(--mute);font-size:13px;line-height:1.5">No saved lists yet. In Suggest &gt; A list, paste a playlist link or a few songs and give the list a name.</p>'; return; }
  const lm = ls.filter(L => libMatch(L.name) || listSongs(L).some(s => libMatch(s.a, s.t))); if (!lm.length) l.innerHTML = noMatch();
  lm.slice().reverse().forEach(L => {
    const n = listSongs(L).length, d = document.createElement('div'); d.className = 'item' + (batch && batch.id === 'list:' + L.key ? ' now' : '');
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn" title="Play this list (shuffled)">&#9654;</button><button class="mini-btn" title="Delete the list (its songs stay in the library)">&#10005;</button>`;
    d.querySelector('b').textContent = L.name; d.querySelector('span').textContent = `${n} songs${L.genre ? ' · ' + (((R.genreMap || {})[L.genre] || {}).name || '') : ''}`;
    const [pn, rm] = d.querySelectorAll('.mini-btn');
    d.querySelector('.meta').onclick = () => { libTab = 'list:' + L.key; renderLib(); };
    pn.onclick = () => { openSheet(null); startRun('list:' + L.key); };
    rm.onclick = () => { if (!confirm(`Delete the list "${L.name}"? Its songs stay in your library.`)) return; lib.lists = lib.lists.filter(x => x !== L); markDeleted('lists', L.key); saveLib(); renderLib(); };
    l.appendChild(d);
  });
}
// ---------- Needs labels > Suggest: labels from your other songs by the same artist, saved only when you confirm ----------
// For each song without a genre: the genre most of that artist's labelled songs have, their usual mood, their middle
// energy and their most common themes. Artists change, so every suggestion shows what it is based on and can be edited.
let labelDraft = null;   // key -> { genre, mood, energy, tags, n, on }
const artistParts = a => String(a || '').split(/\s*(?:,|&|\+|\/|\bfeat\b\.?|\bft\b\.?|\s[x×]\s|\band\b|\bwith\b|\bvs\b\.?)\s*/i).map(x => fold(x).trim()).filter(x => x.length > 1);
function suggestLabels(list) {
  const byArtist = new Map();
  songs.forEach(s => { if (!s.genre) return; artistParts(s.a).forEach(a => { if (!byArtist.has(a)) byArtist.set(a, []); byArtist.get(a).push(s); }); });
  const top = (arr, n) => { const c = {}; arr.forEach(x => { if (x) c[x] = (c[x] || 0) + 1; }); return Object.entries(c).sort((x, y) => y[1] - x[1]).slice(0, n).map(x => x[0]); };
  const out = new Map();
  list.forEach(s => {
    const parts = artistParts(s.a), main = parts[0];
    let ref = (main && byArtist.get(main)) || [];
    if (!ref.length) ref = [...new Set(parts.slice(1).flatMap(a => byArtist.get(a) || []))];   // a featured artist, if the main one is unknown
    ref = ref.filter(x => x.key !== s.key);
    if (!ref.length) return;
    const en = ref.map(x => x.energy).filter(Boolean).sort((a, b) => a - b);
    out.set(s.key, { genre: top(ref.map(x => x.genre), 1)[0], mood: top(ref.map(x => x.mood), 1)[0] || '', energy: en.length ? en[Math.floor(en.length / 2)] : 0, tags: top(ref.flatMap(x => x.tags || []), 3), n: ref.length, by: ref[0].a, on: true });
  });
  return out;
}
function renderDraft(l, list) {
  const withS = list.filter(s => labelDraft.has(s.key)), ticked = withS.filter(s => labelDraft.get(s.key).on).length;
  const h = document.createElement('div'); h.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:4px';
  h.innerHTML = `<p style="color:var(--mute);font-size:12.5px;line-height:1.5;margin:0">${withS.length} of ${list.length} songs have a suggestion from the same artist. Nothing is saved yet: untick or change any, then save.</p><div class="field" style="flex-wrap:wrap"><button class="btn">Save ${ticked} ticked</button><button class="btn ghost">Tick all / none</button><button class="btn ghost">Cancel</button></div>`;
  const [save, all, cancel] = h.querySelectorAll('button');
  save.onclick = () => {
    const now = Date.now(); let n = 0; lib.labels = lib.labels || {};
    withS.forEach(s => { const d = labelDraft.get(s.key); if (!d.on || !d.genre) return; lib.labels[s.key] = { genre: d.genre, tags: d.tags, mood: d.mood, energy: d.energy || 2, ts: now }; const u = lib.user.find(x => x.key === s.key); if (u) Object.assign(u, { genre: d.genre, tags: d.tags, mood: d.mood, energy: d.energy || 2 }); n++; });
    labelDraft = null; buildSongs(); saveLib(); toast(`${n} song${n === 1 ? '' : 's'} labelled.`); renderLib();
  };
  all.onclick = () => { const any = withS.some(s => !labelDraft.get(s.key).on); withS.forEach(s => { labelDraft.get(s.key).on = any; }); renderLib(); };
  cancel.onclick = () => { labelDraft = null; renderLib(); };
  l.appendChild(h);
  const opts = genreOptions('choose a genre');
  withS.forEach(s => {
    const d = labelDraft.get(s.key), row = document.createElement('div'); row.className = 'item'; row.style.flexWrap = 'wrap';
    row.innerHTML = `<input type="checkbox" style="margin:0 4px 0 0;flex:none"><div class="meta" style="cursor:default"><b></b><span></span></div><select style="flex:none;max-width:150px">${opts}</select>`;
    const cb = row.querySelector('input'); cb.checked = d.on; cb.onchange = () => { d.on = cb.checked; save.textContent = `Save ${withS.filter(x => labelDraft.get(x.key).on).length} ticked`; };
    row.querySelector('b').textContent = `${s.a} - ${s.t}`;
    row.querySelector('span').textContent = `from ${d.n} song${d.n === 1 ? '' : 's'} by ${d.by}${d.mood ? ' · ' + d.mood : ''}${d.energy ? ' · energy ' + d.energy : ''}${d.tags.length ? ' · ' + d.tags.join(', ') : ''}`;
    const sel = row.querySelector('select'); sel.value = d.genre; sel.onchange = () => { d.genre = sel.value; };
    l.appendChild(row);
  });
  const none = list.filter(s => !labelDraft.has(s.key));
  if (none.length) { const p = document.createElement('p'); p.style.cssText = 'color:var(--mute);font-size:12.5px;line-height:1.5;margin:6px 0 0'; p.textContent = none.length === 1 ? '1 has no other song by the same artist in your library, so no suggestion: label it with the pencil.' : `${none.length} have no other song by the same artist in your library, so no suggestion: label them with the pencil.`; l.appendChild(p); }
}
function renderLib() {
  document.querySelectorAll('#libTabs button').forEach(b => b.classList.toggle('on', b.dataset.v === libTab || (b.dataset.v === 'lists' && libTab.startsWith('list:'))));
  if (libTab === 'fav') return renderFav();
  if (libTab === 'lists') return renderLists();
  const L = libTab.startsWith('list:') && (lib.lists || []).find(x => 'list:' + x.key === libTab);
  if (libTab.startsWith('list:') && !L) { libTab = 'lists'; return renderLists(); }   // deleted on another device
  const all = L ? listSongs(L) : libTab === 'unlabeled' ? songs.filter(needsLabels) : songs, shown = all.filter(s => libMatch(s.a, s.t));
  $('libCount').textContent = (L ? `· ${all.length} songs` : libTab === 'unlabeled' ? `· ${all.length} need labels` : `· ${songs.length} songs`) + (shown.length < all.length ? `, ${shown.length} shown` : '');
  const l = $('libList'); l.innerHTML = '';
  if (libTab === 'unlabeled' && !all.length) l.innerHTML = '<p style="color:var(--mute);font-size:13px">Every song has a genre. Songs you add from a list appear here until you label them.</p>';
  if (L) {   // one list: back, play, and a genre for all its songs that have none
    const unl = all.filter(needsLabels).length, h = document.createElement('div');
    h.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:4px';
    h.innerHTML = `<div class="field" style="align-items:center"><button class="mini-btn" title="Back to your lists">&larr; Lists</button><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap"></b><button class="btn">Play this list</button></div>` +
      (unl ? `<div class="set" style="padding:4px 0;border:0"><span style="font-size:13px">${unl} without a genre: give them</span><select>${genreOptions('choose a genre')}</select></div>` : '');
    h.querySelector('b').textContent = L.name;
    h.querySelector('.mini-btn').onclick = () => { libTab = 'lists'; renderLib(); };
    h.querySelector('.btn').onclick = () => { openSheet(null); startRun('list:' + L.key); };
    const sel = h.querySelector('select');
    if (sel) sel.onchange = () => { if (!sel.value) return; const n = labelGenre(L.keys, sel.value); L.genre = sel.value; L.ts = Date.now(); buildSongs(); saveLib(); toast(`${n} song${n === 1 ? '' : 's'} labelled ${((R.genreMap || {})[sel.value] || {}).name}.`); renderLib(); };
    l.appendChild(h);
  }
  if (libTab !== 'unlabeled') labelDraft = null;
  if (libTab === 'unlabeled' && labelDraft) return renderDraft(l, shown);
  if (libTab === 'unlabeled' && shown.length) {
    const b = document.createElement('div'); b.innerHTML = '<button class="btn" style="width:100%;margin-bottom:4px">Suggest labels from the same artist</button>';
    b.querySelector('button').onclick = () => { labelDraft = suggestLabels(shown); if (!labelDraft.size) { labelDraft = null; toast('None of these artists has another labelled song in your library yet.'); return; } renderLib(); };
    l.appendChild(b);
  }
  if (all.length && !shown.length) l.insertAdjacentHTML('beforeend', noMatch());
  shown.forEach(s => {
    const d = document.createElement('div'); d.className = 'item' + (current && current.key === s.key ? ' now' : '');
    d.innerHTML = `<div class="meta"><b></b><span></span></div><button class="mini-btn" title="Edit labels: genre, themes, mood, energy">✎</button><button class="mini-btn" title="${L ? 'Take it out of this list (it stays in the library)' : 'Remove'}">✕</button>`;
    d.querySelector('b').textContent = s.t; d.querySelector('span').textContent = `${s.a} · ${(R.genreMap && R.genreMap[s.genre] || {}).name || 'needs labels'}${s.user ? ' · yours' : ''}`;
    d.querySelector('.meta').onclick = () => { openSheet(null); planned = null; preload = null; advance({ song: s, quick: true }); };
    const [ed, rm] = d.querySelectorAll('.mini-btn');
    ed.onclick = () => openLabels(s);
    if (L) rm.onclick = () => { L.keys = L.keys.filter(k => k !== s.key); L.ts = Date.now(); saveLib(); renderLib(); };
    else rm.onclick = () => { lib.removed.push(s.key); lib.removedTs = lib.removedTs || {}; lib.removedTs[s.key] = Date.now(); if (lib.user.some(x => x.key === s.key)) markDeleted('user', s.key); lib.user = lib.user.filter(x => x.key !== s.key); buildSongs(); saveLib(); renderLib(); };
    l.appendChild(d);
  });
}
$('btnRun').onclick = openRun;
$('btnHeart').onclick = toggleFav;
$('btnAds').onclick = openAds; $('adGo').onclick = adGo; $('adq').onkeydown = e => { if (e.key === 'Enter') adGo(); };
document.querySelectorAll('#adTabs button').forEach(b => b.onclick = () => { adTab = b.dataset.v; renderAds(); });
document.querySelectorAll('#libTabs button').forEach(b => b.onclick = () => { libTab = b.dataset.v; renderLib(); });
$('btnLib').onclick = () => { renderLib(); openSheet('shLib'); };
let libQT; $('libQ').oninput = () => { clearTimeout(libQT); libQT = setTimeout(renderLib, 120); };
$('libQ').onkeydown = e => { if (e.key === 'Escape' && $('libQ').value) { e.stopPropagation(); $('libQ').value = ''; renderLib(); } };

function seg(id, k, cast = v => v) { const el = $(id); const paint = () => el.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S[k]) === b.dataset.v)); el.querySelectorAll('button').forEach(b => b.onclick = () => { S[k] = cast(b.dataset.v); paint(); saveLib(); if (k === 'sleep') setSleep(); }); paint(); }
function setSleep() { sleepAt = S.sleep ? Date.now() + S.sleep * 60000 : 0; if (S.sleep) toast(`Sleep timer set: ${S.sleep} minutes.`); }
$('btnSet').onclick = () => { openSheet('shSet'); seg('segTalk', 'talk'); seg('segSleep', 'sleep', Number); seg('segTrim', 'trim', Number); seg('segFade', 'fade', Number); seg('segNews', 'news'); paintNewsNote(); $('rate').value = S.rate; loadVoices(); };
$('voiceSel').onchange = e => { S.voice = e.target.value; saveLib(); };
$('rate').oninput = e => { S.rate = +e.target.value; saveLib(); };
$('btnNews').onclick = () => { unlockAudio(); openSheet(null); runNews(true); };
const ago = t => { const h = Math.round((Date.now() - t) / 36e5); return h < 1 ? 'just now' : h < 48 ? h + ' h ago' : Math.round(h / 24) + ' days ago'; };
$('btnNewsCheck').onclick = async () => {
  $('reportText').textContent = 'Asking every source… this can take up to a minute.'; openSheet('shReport');
  const res = await inBatches(NEWS_SOURCES, mobileWeb() ? 6 : NEWS_SOURCES.length, readSourceHere);
  $('reportText').textContent = `News sources, checked ${new Date().toLocaleString('en-GB')}\n\n` + NEWS_SOURCES.map((s, i) => {
    const r = res[i]; if (!r.ok) return `✗ ${s.name}: ${r.error}\n   ${decodeURI(s.urls[s.urls.length - 1])}`;
    return `✓ ${s.name}: ${r.items.length} found\n` + r.items.slice(0, 4).map(x => `   · ${x.title}${x.date ? ' (' + x.date + ')' : x.when ? ' (' + ago(x.when) + ')' : ''}`).join('\n');
  }).join('\n\n');
};
$('btnNewsLast').onclick = () => {   // everything the last bulletin read, with where each headline came from
  let last = null; try { last = JSON.parse(localStorage.getItem('pbd-news-last') || 'null'); } catch {}
  $('reportText').textContent = !last ? 'No bulletin has been read on this device yet. Play the news, then come back here.'
    : `Last bulletin, read ${new Date(last.at).toLocaleString('en-GB')}\n\n` + last.lines.map((l, i) => [`${i + 1}. ${l.said}`, l.tag && `   ${l.tag}`, l.link && `   link: ${dURI(l.link)}`, l.page && `   from page: ${dURI(l.page)}`].filter(Boolean).join('\n')).join('\n\n');
  openSheet('shReport');
};
$('reportCopy').onclick = async () => { const t = $('reportText').textContent; try { await navigator.clipboard.writeText(t); toast('Copied.'); } catch { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); toast('Copied.'); } catch {} a.remove(); } };
$('btnNewsNow').onclick = () => { unlockAudio(); if (newsOn) endNews(); else runNews(true); };
document.addEventListener('pointerdown', () => { if (!ttsPlayer.src) unlockAudio(); }, { once: true, capture: true });
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
      if (!isPod && d > 30 && (rem <= Math.max(S.trim || 0, S.fade || 0) || (trimAt && c >= trimAt))) {   // the last seconds fade out under what comes next
        console.info('[radio] trim trigger', { d, c, rem, trimAt, trim: S.trim, key: current.key }); advance({ fadeOldMs: trimAt && c >= trimAt ? 4000 : Math.max(2000, Math.round(rem * 1000)) }); }   // fade over what is left of the song
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
  await loadLib(); buildSongs(); loadVoices(); syncAds().then(runAdCleanups);
  $('vol').value = S.vol;
  setNow(null); updateCloudUI();
})();
})();
