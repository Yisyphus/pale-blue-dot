// Radio Amber — tiny local helper. No dependencies, no API keys.
// Serves the player, searches YouTube by scraping the public results page,
// finds "similar" songs from YouTube's own radio mix, and stores your library.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = +process.env.PORT || 8787;
const ROOT = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
const LIB = path.join(DATA, 'library.json');
fs.mkdirSync(DATA, { recursive: true });

// ---------- the radio updates itself from the web ----------
// cloud.json { "appUrl": "https://<you>.github.io/<repo>/" }: at start and every 6 hours the helper reads files.json
// there and downloads only what changed into app-cache/ (each file checked against its hash), then serves from it.
// public/ stays the fallback: first run, offline, or anything missing. A newer server.js is installed too and takes
// effect when the page asks for a restart (/api/restart, at the next opening) or the radio starts. Your data/ folder is never touched.
const crypto = require('crypto');
const CLOUD = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'cloud.json'), 'utf8')); } catch { return {}; } })();
const CACHE = path.join(__dirname, 'app-cache');
const sha = b => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);
function activeRoot() {
  try {
    const m = JSON.parse(fs.readFileSync(path.join(CACHE, 'files.json'), 'utf8'));
    if (m && m.files && Object.keys(m.files).every(f => fs.existsSync(path.join(CACHE, f)))) return CACHE;
  } catch {}
  return ROOT;
}
let SERVE = activeRoot();
const RUNNING = sha(fs.readFileSync(__filename));   // the helper code this process started with
async function syncApp() {
  if (!CLOUD.appUrl) return;
  const base = CLOUD.appUrl.replace(/\/?$/, '/');
  try {
    const r = await fetch(base + 'files.json?t=' + Date.now()); if (!r.ok) return;
    const m = await r.json(); if (!m || !m.files) return;
    let old = {}; try { old = JSON.parse(fs.readFileSync(path.join(CACHE, 'files.json'), 'utf8')).files || {}; } catch {}
    const changed = Object.entries(m.files).filter(([n, h]) => old[n] !== h || !fs.existsSync(path.join(CACHE, n)));
    if (changed.length || Object.keys(old).some(n => !(n in m.files))) {
      const tmp = CACHE + '.new'; fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
      for (const [name, hash] of Object.entries(m.files)) {
        if (!/^[\w.-]+$/.test(name)) continue;
        const have = path.join(CACHE, name);
        if (old[name] === hash && fs.existsSync(have)) { fs.copyFileSync(have, path.join(tmp, name)); continue; }
        const f = await fetch(base + name + '?v=' + hash); if (!f.ok) throw new Error(name + ' ' + f.status);
        const buf = Buffer.from(await f.arrayBuffer());
        if (sha(buf) !== hash) throw new Error(name + ': download did not match');
        fs.writeFileSync(path.join(tmp, name), buf);
      }
      fs.writeFileSync(path.join(tmp, 'files.json'), JSON.stringify(m));
      SERVE = ROOT;   // serve the folder copy for the instant of the swap
      fs.rmSync(CACHE, { recursive: true, force: true }); fs.renameSync(tmp, CACHE);
      console.log('Radio updated: version ' + m.version + ' (' + changed.length + ' files)');
    }
    SERVE = activeRoot();
    // the helper itself: installed now, used from the next start (only if the new file is complete and valid code)
    if (m.server && m.server !== sha(fs.readFileSync(__filename))) {
      const f = await fetch(base + 'server.js?v=' + m.server);
      const buf = f.ok ? Buffer.from(await f.arrayBuffer()) : null;
      if (buf && sha(buf) === m.server) { new (require('vm').Script)(buf.toString('utf8')); fs.writeFileSync(__filename, buf); console.log('Helper updated; it takes effect at the next start.'); }
    }
  } catch (e) { SERVE = activeRoot(); console.log('Update check failed: ' + e.message); }
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Cookie: 'CONSENT=YES+1; SOCS=CAI',
};

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };

function extractJSON(html, marker) {
  const i = html.indexOf(marker);
  if (i < 0) return null;
  let start = html.indexOf('{', i);
  let depth = 0, inStr = false, esc = false;
  for (let p = start; p < html.length; p++) {
    const c = html[p];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) { try { return JSON.parse(html.slice(start, p + 1)); } catch { return null; } } }
  }
  return null;
}

function walk(node, key, out) {
  if (!node || typeof node !== 'object') return out;
  if (Array.isArray(node)) { node.forEach(n => walk(n, key, out)); return out; }
  for (const k of Object.keys(node)) {
    if (k === key) out.push(node[k]); else walk(node[k], key, out);
  }
  return out;
}

const txt = o => (o && (o.simpleText || (o.runs || []).map(r => r.text).join(''))) || '';
const chan = o => txt(o).replace(/\s+and \d+ more$/i, '');
const secs = s => { const p = (s || '').split(':').map(Number); return p.some(isNaN) ? 0 : p.reduce((a, b) => a * 60 + b, 0); };

const BAD = /\b(cover|karaoke|reaction|tutorial|lesson|8d|slowed|reverb|nightcore|sped up|remix|instrumental version|piano version|acoustic version|how to|chords|react|review|explained|analysis|meaning|subtitulad[oa]|traducid[oa]|traducci[oó]n|legendado|sub español|con letra|sous-titr\w*|compilation|playlist)\b/i;

const norm = s => (s || '').toLowerCase().replace(/['’`]/g, '').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim();
function rank(items, q, a, t) {
  const ql = q.toLowerCase();
  const tTokens = norm(t).split(' ').filter(w => w.length > 1 || /[^\x00-\x7f]/.test(w));
  const aTokens = norm(a).split(' ').filter(w => w.length > 2);
  const words = ql.replace(/[^a-z0-9؀-ۿ぀-ヿ ]/gi, ' ').split(/\s+/).filter(w => w.length > 2);
  return items.map(v => {
    const t = v.title.toLowerCase(), ch = v.channel.toLowerCase();
    let s = 0;
    words.forEach(w => { if (t.includes(w)) s += 1; if (ch.includes(w)) s += 1.5; });
    // the song title must actually be in the video title, or we end up with a different song from the same album
    const nt = norm(v.title);
    if (tTokens.length) s += tTokens.every(w => nt.includes(w)) ? 5 : -6;
    if (aTokens.length && aTokens.some(w => nt.includes(w) || norm(v.channel).includes(w))) s += 2;
    if (/- topic$/.test(ch)) s += 3;
    if (/vevo|official/.test(ch)) s += 1.5;
    if (/official (audio|video|music video)|\baudio\b/.test(t)) s += 1;
    if (/live|session|concert|tour/.test(t) && !/live|concert/.test(ql)) s -= 6;
    if (BAD.test(t) && !BAD.test(ql)) s -= 4;
    if (/lyric/.test(t)) s -= 0.3;
    if (v.seconds && v.seconds < 60) s -= 5;
    if (v.seconds && v.seconds > 3000 && !/album|echoes|full/.test(ql)) s -= 3;
    return { ...v, score: s };
  }).sort((a, b) => b.score - a.score);
}

async function search(q, a = '', t = '') {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D', { headers: HEADERS });
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse results');
  const vids = walk(data, 'videoRenderer', []).map(v => ({
    id: v.videoId,
    title: txt(v.title),
    channel: chan(v.ownerText) || chan(v.longBylineText),
    seconds: secs(txt(v.lengthText)),
  })).filter(v => v.id);
  return rank(vids, q, a, t).slice(0, 8);
}

// Long-form talks for the podcast slot: 15 to 90 minutes, preferring podcasts, lectures, and conversations.
const NOT_TALK = /\b(music|mix|playlist|lofi|lo-fi|asmr|binaural|sleep|meditation|hz|chill|beats|ambient|full album|live ?stream|sermon|prayer|compilation|shorts|reaction|trailer|official video|lyrics|soundtrack|gameplay|walkthrough|workout|subliminal|hypnosis|study with me)\b/i;
async function podcast(q, min = 900) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgQQARgC', { headers: HEADERS });
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse results');
  const vids = walk(data, 'videoRenderer', []).map(v => ({ id: v.videoId, title: txt(v.title), channel: chan(v.ownerText) || chan(v.longBylineText), seconds: secs(txt(v.lengthText)) }))
    .filter(v => v.id && v.seconds >= min && v.seconds <= 5400);
  return vids.map(v => {
    const t = v.title.toLowerCase(); let s = 0;
    if (/podcast|conversation|interview|talk|lecture|discussion|essay|philosoph|documentary|episode/.test(t)) s += 2;
    if (NOT_TALK.test(v.title)) s -= 8;
    if (/#shorts/.test(t)) s -= 8;
    return { ...v, score: s };
  }).filter(v => v.score > -5).sort((a, b) => b.score - a.score).slice(0, 10);
}
// One video's own details: title, channel, length and description. A "Topic" upload's description names its album:
// "Provided to YouTube by <label>", then "<track> · <artist>", then the album, then "℗ <year>…".
async function ytInfo(id) {
  if (!/^[\w-]{11}$/.test(id)) throw new Error('bad id');
  const r = await fetch('https://www.youtube.com/watch?v=' + id, { headers: HEADERS });
  const html = await r.text(), p = extractJSON(html, 'var ytInitialPlayerResponse =') || extractJSON(html, 'ytInitialPlayerResponse = ');
  const d = (p && p.videoDetails) || {}, desc = d.shortDescription || '';
  const lines = desc.split('\n').map(x => x.trim()).filter(Boolean);
  const i = lines.findIndex(x => /\s·\s/.test(x));
  return { id, title: d.title || '', channel: d.author || '', seconds: +d.lengthSeconds || 0, topic: /^Provided to YouTube by/i.test(lines[0] || ''), track: i >= 0 ? lines[i].split(' · ')[0] : '', album: i >= 0 && lines[i + 1] && !/^℗|^©|^Released on/i.test(lines[i + 1]) ? lines[i + 1] : '', released: (desc.match(/Released on:\s*([\d-]+)/) || [])[1] || '', desc: desc.slice(0, 3000) };
}
// Live concerts (KEXP full performances, Tiny Desk): 8 to 75 minutes, as YouTube ranks them
async function concert(q) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIQAQ%253D%253D', { headers: HEADERS });
  const html = await r.text(), data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse results');
  return walk(data, 'videoRenderer', []).map(v => ({ id: v.videoId, title: txt(v.title), channel: chan(v.ownerText) || chan(v.longBylineText), seconds: secs(txt(v.lengthText)) }))
    .filter(v => v.id && v.seconds >= 480 && v.seconds <= 4500).slice(0, 15);
}
// Focus mode > Ambient sounds: long recordings (rain, waves, space), half an hour or more
async function longVideos(q) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgQQARgC', { headers: HEADERS });
  const html = await r.text(), data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse results');
  return walk(data, 'videoRenderer', []).map(v => ({ id: v.videoId, title: txt(v.title), channel: chan(v.ownerText) || chan(v.longBylineText), seconds: secs(txt(v.lengthText)) }))
    .filter(v => v.id && v.seconds >= 1800 && !/live|#shorts/i.test(v.title)).slice(0, 10);
}
// ---------- news: the radio page reads the news sites through here (only these sites), and picks the headlines itself ----------
const NEWS_HOSTS = /(^|\.)(kech24\.com|marrakechalaan\.com|hespress\.com|le360\.ma|map\.ma|mapnews\.ma|bbci\.co\.uk|aljazeera\.net|france24\.com|aitnews\.com|cnn\.com|bbc\.com|alarabiya\.net|snrtnews\.com|hitradio\.ma|news\.google\.com|open\.er-api\.com|aladhan\.com|open-meteo\.com|usgs\.gov)$/i;
async function newsFetch(url) {
  const u = new URL(url);
  if (!/^https?:$/.test(u.protocol) || !NEWS_HOSTS.test(u.hostname)) throw new Error('not a news site');
  const r = await fetch(u, { headers: { 'User-Agent': HEADERS['User-Agent'], 'Accept-Language': 'ar,fr;q=0.8,en;q=0.6', 'Accept': 'text/html,application/xhtml+xml,application/rss+xml,application/xml;q=0.9,*/*;q=0.8' }, redirect: 'follow', signal: AbortSignal.timeout(10000) });
  return { status: r.status, body: await r.text() };
}

// ---------- commercials ----------
// The ads are Moroccan commercials. Two sources:
//  1) ads-playlist.json: a snapshot of the YouTube playlist you gave me. It is stored here, so the radio keeps working
//     even if the playlist is deleted. Re-create it any time with:  node server.js --extract-ads <playlist link or id>
//  2) data/ads-extra.json: other Moroccan ads found by searching YouTube, only ones under 60 seconds. Refreshed every 10 days.
const ADS_PLAYLIST = path.join(__dirname, 'ads-playlist.json');
const ADS_EXTRA = path.join(DATA, 'ads-extra.json');

const durText = l => { let t = ''; walk(l, 'thumbnailBadgeViewModel', []).forEach(b => { if (b && b.text && /^\d+:\d+/.test(b.text)) t = b.text; }); return t; };

// Reads a whole public YouTube playlist: the first page, then every "load more" page until the end (no size limit).
// Returns { id, title, items: [{ id, title, channel, seconds }] }.
function playlistItems(node) {
  const items = [];
  walk(node, 'lockupViewModel', []).forEach(l => {                       // current YouTube layout
    const md = l.metadata && l.metadata.lockupMetadataViewModel;
    const rows = md && md.metadata && md.metadata.contentMetadataViewModel && md.metadata.contentMetadataViewModel.metadataRows;
    const channel = rows && rows[0] && rows[0].metadataParts && rows[0].metadataParts[0] && rows[0].metadataParts[0].text ? rows[0].metadataParts[0].text.content : '';
    items.push({ id: l.contentId, title: (md && md.title && md.title.content) || '', channel: channel || '', seconds: secs(durText(l)) });
  });
  walk(node, 'playlistVideoRenderer', []).forEach(v => items.push({ id: v.videoId, title: txt(v.title), channel: txt(v.shortBylineText), seconds: +v.lengthSeconds || 0 }));   // older layout
  return items;
}
// The playlist's own list (not YouTube's suggestions beside it). On the page it is the itemSectionRenderer (newer
// layout) or playlistVideoListRenderer (older) holding the most videos; in each "load more" answer it is
// appendContinuationItemsAction. Its next-page token is the continuation item at the END of that list.
function listNode(node, cont) {
  if (cont) { const l = walk(node, 'appendContinuationItemsAction', []); return l.length ? l : [node]; }
  const cands = [...walk(node, 'playlistVideoListRenderer', []), ...walk(node, 'itemSectionRenderer', [])];
  let best = null, n = 0; cands.forEach(c => { const k = playlistItems(c).length; if (k > n) { n = k; best = c; } });
  return best ? [best] : [node];
}
function nextToken(nodes) {
  let tok = null;
  nodes.forEach(n => {
    const list = n.contents || n.continuationItems || [];
    const last = Array.isArray(list) ? list[list.length - 1] : null;
    const holder = last && (last.continuationItemViewModel || last.continuationItemRenderer);
    if (holder) { const t = JSON.stringify(holder).match(/"token":"([^"]+)"/); if (t) tok = t[1]; }   // the token can sit a few levels deep
  });
  return tok;
}
async function readPlaylist(idOrUrl) {
  const m = String(idOrUrl).match(/[?&]list=([\w-]+)/); const id = m ? m[1] : String(idOrUrl).trim();
  if (!/^[\w-]{10,}$/.test(id)) throw new Error('That does not look like a YouTube playlist link.');
  const r = await fetch('https://www.youtube.com/playlist?list=' + encodeURIComponent(id), { headers: HEADERS });
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('Could not read that playlist (is it public or unlisted?).');
  const first = listNode(data, false);
  const items = first.flatMap(n => playlistItems(n));
  const key = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || [])[1], ver = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20240101.00.00';
  let tok = nextToken(first), pages = 0;
  while (tok && pages < 500) {   // 100 videos per page; YouTube playlists stop at 5000
    pages++;
    const u = 'https://www.youtube.com/youtubei/v1/browse?prettyPrint=false' + (key ? '&key=' + key : '');
    const res = await fetch(u, { method: 'POST', headers: { ...HEADERS, 'Content-Type': 'application/json' }, body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: ver, hl: 'en' } }, continuation: tok }) });
    if (!res.ok) break;
    const j = await res.json();
    const nodes = listNode(j, true);
    const more = nodes.flatMap(n => playlistItems(n)); if (!more.length) break;
    items.push(...more); tok = nextToken(nodes);
    await new Promise(r => setTimeout(r, 400));
  }
  const seen = new Set();
  const out = items.filter(v => v.id && /^[\w-]{11}$/.test(v.id) && !seen.has(v.id) && seen.add(v.id));
  const title = (data.header && JSON.stringify(data.header).match(/"pageTitle":"([^"]+)"/) || [])[1] || (JSON.stringify(data.metadata || {}).match(/"title":"([^"]+)"/) || [])[1] || id;
  return { id, title, items: out };
}
async function extractPlaylist(idOrUrl) {   // the commercials snapshot (ads-playlist.json)
  const p = await readPlaylist(idOrUrl);
  fs.writeFileSync(ADS_PLAYLIST, JSON.stringify({ source: 'youtube playlist ' + p.id, title: p.title, extracted: new Date().toISOString().slice(0, 10), items: p.items.map(({ id, title, seconds }) => ({ id, title, seconds })) }, null, 1));
  return p.items;
}

// Moroccan ad searches (French, Arabic and well-known Moroccan brands)
const AD_QUERIES = [
  'pub maroc', 'pub maroc ramadan', 'pub marocaine', 'اشهار مغربي', 'إشهار مغربي رمضان', 'إشهار المغرب', 'spot publicitaire maroc',
  'pub maroc telecom', 'pub inwi', 'pub orange maroc', 'pub marjane', 'pub sidi ali', 'pub aïn saïss', 'pub centrale danone maroc',
  'pub cosumar', 'pub lesieur cristal', 'pub afia maroc', 'pub dari couscous', 'pub royal air maroc', 'pub attijariwafa bank',
  'pub jumia maroc', 'pub glovo maroc', 'pub tide maroc', 'pub bimo maroc', 'pub jibal', 'pub maroc 2000s', 'pub maroc nostalgie',
];
const MOROCCO = /maroc|morocco|مغرب|المغرب|مغربي|مغربية|inwi|marjane|sidi ali|a[iï]n sa[iï]ss|centrale|cosumar|lesieur|afia|dari|jibal|bimo|attijari|royal air|\bram\b|lydec|maghreb|chergui|casablanca|marrakech|rabat|tanger|agadir/i;
const NOT_AD = /\b(music video|lyrics|karaoke|live|concert|film|episode|reaction|trailer|clip officiel|فيديو كليب|حلقة)\b/i;

async function searchShort(q) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgIYAQ%253D%253D', { headers: HEADERS });   // videos under 4 minutes
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) return [];
  return walk(data, 'videoRenderer', []).map(v => ({ id: v.videoId, title: txt(v.title), channel: chan(v.ownerText) || chan(v.longBylineText), seconds: secs(txt(v.lengthText)) }));
}

let refreshing = false;
async function refreshExtras() {
  if (refreshing) return; refreshing = true;
  try {
    const found = new Map();
    for (const q of AD_QUERIES) {
      try {
        const list = await searchShort(q);
        list.filter(v => v.id && v.seconds >= 8 && v.seconds <= 180 && (MOROCCO.test(v.title) || MOROCCO.test(v.channel)) && !NOT_AD.test(v.title))
          .slice(0, 8).forEach(v => { if (!found.has(v.id)) found.set(v.id, { id: v.id, title: v.title, seconds: v.seconds }); });
      } catch (e) { /* skip this query */ }
      await new Promise(r => setTimeout(r, 1200));   // be gentle with YouTube
    }
    if (found.size) fs.writeFileSync(ADS_EXTRA, JSON.stringify({ updated: Date.now(), max: 180, items: [...found.values()] }, null, 1));
    console.log('Moroccan ads refreshed: ' + found.size);
  } finally { refreshing = false; }
}
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
function adsBase() {
  const pl = readJSON(ADS_PLAYLIST, { items: [] }).items.map(v => ({ ...v, src: 'playlist' }));
  const ex = readJSON(ADS_EXTRA, { items: [] });
  const seen = new Set(pl.map(v => v.id));
  const extra = ex.items.filter(v => v.seconds <= 180 && !seen.has(v.id)).map(v => ({ ...v, src: 'search' }));
  if (!ex.updated || ex.max !== 180 || Date.now() - ex.updated > 10 * 864e5) refreshExtras().catch(() => {});
  return [...pl, ...extra];
}
// Your own changes to the commercials: ads you removed and ads you added (data/ads-edits.json)
const ADS_EDITS = path.join(DATA, 'ads-edits.json');
const readEdits = () => { const e = readJSON(ADS_EDITS, {}); return { removed: e.removed || [], added: e.added || [] }; };
const writeEdits = e => fs.writeFileSync(ADS_EDITS, JSON.stringify(e, null, 1));
function adsAll() {   // everything, with the removed ones marked (for the management screen)
  const e = readEdits(), base = adsBase(), seen = new Set(base.map(v => v.id));
  const mine = e.added.filter(v => !seen.has(v.id)).map(v => ({ ...v, src: 'mine' }));
  return [...base, ...mine].map(v => ({ ...v, removed: e.removed.includes(v.id) }));
}
const adsPool = () => adsAll().filter(v => !v.removed);

const videoId = t => { const m = String(t || '').trim().match(/(?:youtu\.be\/|[?&]v=|\/shorts\/|\/embed\/|^)([\w-]{11})(?:[?&#/]|$)/); return m ? m[1] : null; };
async function videoInfo(id) {
  const r = await fetch('https://www.youtube.com/watch?v=' + id, { headers: HEADERS });
  const html = await r.text();
  const pr = extractJSON(html, 'var ytInitialPlayerResponse =') || extractJSON(html, 'ytInitialPlayerResponse = ');
  if (!pr || !pr.videoDetails) throw new Error('That video could not be found.');
  const vd = pr.videoDetails, ps = pr.playabilityStatus || {};
  if (ps.status && ps.status !== 'OK') throw new Error('That video is not available.');
  if (ps.playableInEmbed === false) throw new Error('That video cannot be played inside the radio (the owner blocked embedding).');
  return { id: vd.videoId, title: vd.title, seconds: +vd.lengthSeconds || 0 };
}
const readBody = req => new Promise(res => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { res(JSON.parse(b || '{}')); } catch { res({}); } }); });
async function adsEdit(body) {
  const e = readEdits(); const id = videoId(body.id || body.link);
  if (!id) throw new Error('That does not look like a YouTube link.');
  if (body.action === 'remove') { if (!e.removed.includes(id)) e.removed.push(id); e.added = e.added.filter(v => v.id !== id); }
  else if (body.action === 'restore') { e.removed = e.removed.filter(x => x !== id); }
  else if (body.action === 'add') {
    const info = await videoInfo(id);
    const wasRemoved = e.removed.includes(id), exists = adsBase().some(v => v.id === id) || e.added.some(v => v.id === id);
    e.removed = e.removed.filter(x => x !== id);
    if (!exists) e.added.push({ id, title: info.title, seconds: info.seconds });
    writeEdits(e); return { ok: true, added: info, already: exists && !wasRemoved };
  } else throw new Error('Unknown action.');
  writeEdits(e); return { ok: true };
}
async function similar(id) {
  const r = await fetch(`https://www.youtube.com/watch?v=${id}&list=RD${id}`, { headers: HEADERS });
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse mix');
  const list = walk(data, 'playlistPanelVideoRenderer', []).map(v => ({
    id: v.videoId,
    title: txt(v.title),
    channel: chan(v.longBylineText) || chan(v.shortBylineText),
    seconds: secs(txt(v.lengthText)),
  })).filter(v => v.id && v.id !== id && v.seconds > 90 && v.seconds < 1500 && !BAD.test(v.title));
  return list.slice(0, 14);
}

const readLib = () => { try { return JSON.parse(fs.readFileSync(LIB, 'utf8')); } catch { return { user: [], cache: {}, removed: [], settings: {} }; } };
const writeLib = l => fs.writeFileSync(LIB, JSON.stringify(l, null, 1));

const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body)); };

const argv = process.argv.slice(2);
if (argv[0] === '--extract-ads') { extractPlaylist(argv[1] || '').then(l => { console.log('Saved ' + l.length + ' ads to ads-playlist.json'); process.exit(0); }).catch(e => { console.error(e.message); process.exit(1); }); }
else {
// ---------- the voices of the Windows app: made on this PC, free and offline (no account, no limit) ----------
// The three voices, in ONE place: change a line here to change a voice (content.js only names them in Settings).
// Kokoro voices ship with the app (node_modules/kokoro-js/voices/<voice>.bin, chosen in tools/release/build.ps1);
// the Piper voice is a model file in voice-model/piper/ (downloaded by the installer, or here on the first start).
const VOICES = {
  h: { engine: 'kokoro', voice: 'am_echo' },               // Astro, the host (English)
  s: { engine: 'kokoro', voice: 'af_heart' },              // Luna, the readings (English)
  ar: { engine: 'piper', voice: 'ar_JO-kareem-medium' },   // the news (Arabic, a man's voice, standard Arabic)
};
// where the Piper voice comes from, checked by SHA-256 (rhasspy/piper-voices on Hugging Face)
const PIPER_VOICE = { base: 'https://huggingface.co/rhasspy/piper-voices/resolve/main/ar/ar_JO/kareem/medium/', onnx: '9e95cab07b679da603bba17c4dec7ab3111320571964ee95c0379603c086491e', json: 'ea6d9b9d9076dbdb6bf5c98c6a141ef154959d2359709b37855727964e7d6c4d' };
// The page asks for a block of text (POST /api/say { text, who, speed, pre }) and gets a WAV back; { items: [...] }
// queues several, in that order, to be made ahead. One block is made at a time; a block needed now goes first.
const VOICE = { state: 'none', progress: 0, rtf: 0, error: '', loadMs: 0, ar: 'none', arError: '' };
let tts = null;
const sayCache = new Map(), sayJobs = [];
let sayBusy = false, sayCur = null;
const VOICE_DIR = path.join(__dirname, 'voice-model');
const PIPER_EXE = path.join(__dirname, 'piper', process.platform === 'win32' ? 'piper.exe' : 'piper');
const piperModel = () => path.join(VOICE_DIR, 'piper', VOICES.ar.voice + '.onnx');
async function voiceInit() {
  let K, T;
  try { const rq = require('module').createRequire(path.join(__dirname, 'server.js')); K = rq('kokoro-js'); T = rq('@huggingface/transformers'); }
  catch (e) { if (process.env.PBD_DESKTOP) { VOICE.state = 'error'; VOICE.error = 'voice engine missing: ' + String(e.message || e).slice(0, 120); } return; }   // the website's helper: the browser speaks
  VOICE.state = 'loading'; VOICE.error = '';
  piperInit();
  const t0 = Date.now();
  try {
    T.env.cacheDir = VOICE_DIR; T.env.allowLocalModels = true;
    const seen = {};
    tts = await K.KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'q8', device: 'cpu', progress_callback: x => {
      if (x && x.file && x.total) { seen[x.file] = [x.loaded || 0, x.total]; const t = Object.values(seen).reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0]); VOICE.progress = Math.round(100 * t[0] / t[1]); }
    } });
    VOICE.state = 'ready'; VOICE.progress = 100; VOICE.loadMs = Date.now() - t0;   // ready as soon as the model loads; the speed (rtf) is measured on the first lines
    console.log('Voices ready in ' + VOICE.loadMs + ' ms');
    runSay();
  } catch (e) { tts = null; VOICE.state = 'error'; VOICE.error = String(e.message || e).slice(0, 200); console.log('Voices failed: ' + VOICE.error); setTimeout(voiceInit, 60000); }
}
// Piper: the program ships with the app; the voice is downloaded once if the installer could not
async function piperInit() {
  if (!fs.existsSync(PIPER_EXE)) { VOICE.ar = 'error'; VOICE.arError = 'piper missing'; return; }
  const m = piperModel();
  if (fs.existsSync(m) && fs.existsSync(m + '.json')) { VOICE.ar = 'ready'; return; }
  VOICE.ar = 'loading';
  try {
    fs.mkdirSync(path.dirname(m), { recursive: true });
    for (const [ext, sum] of [['.onnx.json', PIPER_VOICE.json], ['.onnx', PIPER_VOICE.onnx]]) {
      const r = await fetch(PIPER_VOICE.base + VOICES.ar.voice + ext); if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (crypto.createHash('sha256').update(buf).digest('hex') !== sum) throw new Error(ext + ' did not match its checksum');
      fs.writeFileSync(path.join(path.dirname(m), VOICES.ar.voice + ext + '.part'), buf);
    }
    for (const ext of ['.onnx.json', '.onnx']) fs.renameSync(path.join(path.dirname(m), VOICES.ar.voice + ext + '.part'), path.join(path.dirname(m), VOICES.ar.voice + ext));
    VOICE.ar = 'ready'; runSay();
  } catch (e) { VOICE.ar = 'error'; VOICE.arError = String(e.message || e).slice(0, 160); setTimeout(piperInit, 120000); }
}
// a block, cut into pieces Kokoro can say in one go (it cuts anything longer than about 500 sounds), joined back
// with a short breath; the silence Kokoro leaves at each end of a piece is trimmed so the joins sound natural
function speechPieces(text) {
  const safe = text.replace(/\b(Inc|Mr|Mrs|Dr|St|Pt|Pts|vs)\. /g, '$1․ ');   // never cut after "Mr." or "Dr."
  const sents = safe.match(/[^.!?…]+[.!?…]+["')\]]*\s*|[^.!?…]+$/g) || [safe], out = []; let cur = '';
  for (const x of sents.map(s => s.trim()).filter(Boolean)) { if (cur && (cur + ' ' + x).length > 220) { out.push(cur); cur = x; } else cur = cur ? cur + ' ' + x : x; }
  if (cur) out.push(cur);
  return out.flatMap(p => p.length <= 300 ? [p] : p.match(/.{1,280}(\s|$)|.+/g).map(q => q.trim()).filter(Boolean)).map(p => p.replace(/․/g, '.'));
}
function trimSilence(a, sr) {
  const th = 0.008; let i = 0, j = a.length - 1;
  while (i < j && Math.abs(a[i]) < th) i++; while (j > i && Math.abs(a[j]) < th) j--;
  return a.subarray(Math.max(0, i - Math.round(sr * 0.02)), Math.min(a.length, j + Math.round(sr * 0.06)));
}
function wav(f32, sr) {
  const b = Buffer.alloc(44 + f32.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + f32.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(f32.length * 2, 40);
  for (let i = 0; i < f32.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(f32[i] * 32767))), 44 + i * 2);
  return b;
}
async function kokoroSpeech(text, voice, speed) {
  const parts = [], sr = 24000, gap = new Float32Array(Math.round(sr * 0.14));
  for (const p of speechPieces(text)) { const a = await tts.generate(p, { voice, speed }); if (parts.length) parts.push(gap); parts.push(trimSilence(a.audio, a.sampling_rate)); }
  const n = parts.reduce((x, y) => x + y.length, 0), all = new Float32Array(n); let o = 0; for (const x of parts) { all.set(x, o); o += x.length; }
  return wav(all, sr);
}
function piperSpeech(text, speed) {   // piper.exe --model … --output_file …, the text on stdin (UTF-8); it adds the Arabic vowel marks itself
  return new Promise((res, rej) => {
    const out = path.join(require('os').tmpdir(), 'pbd-' + process.pid + '-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.wav');
    const p = require('child_process').spawn(PIPER_EXE, ['--model', piperModel(), '--output_file', out, '--length_scale', String(+(1 / speed).toFixed(2))], { cwd: path.dirname(PIPER_EXE), windowsHide: true });
    let err = ''; p.stderr.on('data', d => { err = (err + d).slice(-400); });
    const t = setTimeout(() => { try { p.kill(); } catch {} }, 60000);
    p.on('error', e => { clearTimeout(t); rej(e); });
    p.on('close', code => { clearTimeout(t); try { const b = fs.readFileSync(out); fs.unlinkSync(out); return res(b); } catch { rej(new Error('piper failed (' + code + '): ' + err.slice(-160))); } });
    p.stdin.end(Buffer.from(text.replace(/\s+/g, ' ').trim() + '\n', 'utf8'));
  });
}
const wavSeconds = b => { try { return (b.length - 44) / b.readUInt32LE(28); } catch { return 0; } };
const voiceOf = who => VOICES[who] || VOICES.h;
const engineReady = v => v.engine === 'piper' ? VOICE.ar === 'ready' : !!tts;
function say(text, who, speed, pre) {
  const v = voiceOf(who), sp = Math.max(0.7, Math.min(1.4, +speed || 1)), key = v.engine + '|' + v.voice + '|' + sp + '|' + text;
  if (sayCache.has(key)) { const b = sayCache.get(key); sayCache.delete(key); sayCache.set(key, b); return Promise.resolve(b); }
  if (sayCur && sayCur.key === key) return new Promise((res, rej) => sayCur.wait.push([res, rej]));   // being made right now: never twice
  let job = sayJobs.find(j => j.key === key);
  if (!job) { job = { key, text, v, sp, wait: [] }; if (pre) sayJobs.push(job); else sayJobs.unshift(job); }
  else if (!pre) { sayJobs.splice(sayJobs.indexOf(job), 1); sayJobs.unshift(job); }   // needed now: first in line
  const p = new Promise((res, rej) => job.wait.push([res, rej]));
  runSay(); return p;
}
async function runSay() {
  if (sayBusy) return; sayBusy = true;
  try {
    while (sayJobs.length) {
      const i = sayJobs.findIndex(j => engineReady(j.v)); if (i < 0) break;   // the Arabic voice still downloading: its lines wait
      const j = sayCur = sayJobs.splice(i, 1)[0], t0 = Date.now();
      try {
        const b = j.v.engine === 'piper' ? await piperSpeech(j.text, j.sp) : await kokoroSpeech(j.text, j.v.voice, j.sp);
        const sec = wavSeconds(b); if (sec > 1 && j.v.engine === 'kokoro') VOICE.rtf = +(((Date.now() - t0) / 1000) / sec * (VOICE.rtf ? 0.3 : 1) + (VOICE.rtf || 0) * 0.7).toFixed(2);   // seconds of work per second of speech
        sayCache.set(j.key, b); while (sayCache.size > 150) sayCache.delete(sayCache.keys().next().value);
        j.wait.forEach(w => w[0](b));
      } catch (e) { j.wait.forEach(w => w[1](e)); }
    }
  } finally { sayBusy = false; sayCur = null; }
}

let lastActivity = Date.now();
const server = http.createServer(async (req, res) => {
  lastActivity = Date.now();
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api/ping') return send(res, 200, { app: 'pale-blue-dot', ok: true, dir: __dirname, open: 2, desktop: process.env.PBD_DESKTOP === '1', voice: VOICE });   // open 2: links open in the browser (not explorer.exe)
  if (u.pathname === '/api/say' && req.method === 'POST') {   // { text, who: h|s|ar, speed, pre } → audio/wav; { items: [{ text, who, speed }] } to make ahead, in order
    if (VOICE.state !== 'ready') return send(res, 503, { error: 'voices ' + VOICE.state });
    const q = await readBody(req);
    if (Array.isArray(q.items)) { q.items.slice(0, 80).forEach(x => { const t = String((x && x.text) || '').slice(0, 4000).trim(); if (t) say(t, x.who, x.speed, true).catch(() => {}); }); return send(res, 200, { queued: q.items.length }); }
    const text = String(q.text || '').slice(0, 4000).trim();
    if (!text) return send(res, 400, { error: 'no text' });
    if (!engineReady(voiceOf(q.who)) && voiceOf(q.who).engine === 'piper' && VOICE.ar === 'error') return send(res, 503, { error: 'arabic voice ' + VOICE.arError });
    const p = say(text, q.who, q.speed, !!q.pre);
    if (q.pre) { p.catch(() => {}); return send(res, 200, { queued: true }); }
    try { return send(res, 200, await p, 'audio/wav'); } catch (e) { return send(res, 500, { error: String(e.message || e).slice(0, 200) }); }
  }
  try {
    if (u.pathname === '/api/search') return send(res, 200, await search(u.searchParams.get('q') || '', u.searchParams.get('a') || '', u.searchParams.get('t') || ''));
    if (u.pathname === '/api/playlist') { try { return send(res, 200, await readPlaylist(u.searchParams.get('list') || '')); } catch (e) { return send(res, 400, { error: String(e.message || e) }); } }
    if (u.pathname === '/api/fetch') { try { const x = await newsFetch(u.searchParams.get('url') || ''); return x.status === 200 ? send(res, 200, x.body, 'text/plain; charset=utf-8') : send(res, 502, 'the site answered ' + x.status + (/cloudflare|cf-chl|just a moment/i.test(x.body) ? ' (bot wall)' : ''), 'text/plain');  } catch (e) { return send(res, 502, e.name === 'TimeoutError' ? 'the site took too long' : String((e.cause && e.cause.code) || e.message || e), 'text/plain'); } }
    if (u.pathname === '/api/update') {   // the Update button: download the newest radio now; the page then reloads
      await syncApp(); let version = ''; try { version = JSON.parse(fs.readFileSync(path.join(SERVE, 'files.json'), 'utf8')).version || ''; } catch {}
      return send(res, 200, { version, helperLater: sha(fs.readFileSync(__filename)) !== RUNNING });
    }
    if (u.pathname === '/api/restart' && req.method === 'POST') {   // a newer helper was installed: hand over to it now (the page asks, only before you press play)
      if (sha(fs.readFileSync(__filename)) === RUNNING) return send(res, 200, { restarted: false });
      try { require('child_process').spawn(process.execPath, process.argv.slice(1), { cwd: process.cwd(), env: { ...process.env, PBD_RESTARTED: '1' }, detached: true, stdio: 'ignore', windowsHide: true }).unref(); } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
      send(res, 200, { restarted: true }); setTimeout(() => process.exit(0), 300); return;
    }
    if (u.pathname === '/api/open') {   // tapping the headline being read: the article, in your usual browser
      const url = u.searchParams.get('url') || ''; if (!/^https?:\/\/[^\s"]+$/.test(url)) return send(res, 400, { error: 'not a web address' });
      let href = url; try { href = new URL(url).href; } catch {}   // Arabic letters in the address, percent-encoded
      // Windows: explorer.exe opens the Documents folder instead of some links (long ones, or with ? and &); the URL
      // handler opens any web address in the default browser, with no command line in between to mangle it
      const cmd = process.platform === 'win32' ? ['rundll32.exe', ['url.dll,FileProtocolHandler', href]] : process.platform === 'darwin' ? ['open', [href]] : ['xdg-open', [href]];
      try { require('child_process').spawn(cmd[0], cmd[1], { detached: true, stdio: 'ignore' }).unref(); return send(res, 200, { ok: true }); } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
    }
    if (u.pathname === '/api/ads/seed' && req.method === 'POST') {   // a fresh install: its commercials list comes from the cloud copy
      const have = readJSON(ADS_PLAYLIST, { items: [] }).items || [];
      if (have.length) return send(res, 200, { seeded: 0 });
      const b = await readBody(req), items = (Array.isArray(b.items) ? b.items : []).filter(v => v && /^[\w-]{11}$/.test(v.id)).map(v => ({ id: v.id, title: String(v.title || ''), seconds: +v.seconds || 0 }));
      if (items.length) fs.writeFileSync(ADS_PLAYLIST, JSON.stringify({ source: 'copied from the cloud', extracted: new Date().toISOString().slice(0, 10), items }, null, 1));
      return send(res, 200, { seeded: items.length });
    }
    if (u.pathname === '/api/podcast') return send(res, 200, await podcast(u.searchParams.get('q') || '', Math.max(300, +u.searchParams.get('min') || 900)));
    if (u.pathname === '/api/reach') {   // the download button: does this converter site open right now?
      const t = u.searchParams.get('url') || ''; if (!/^https:\/\/(ezconv\.org|yttmp3\.com\.co|tubemixlab\.com)\//.test(t)) return send(res, 400, { error: 'not allowed' });
      try { const r = await fetch(t, { headers: { 'User-Agent': HEADERS['User-Agent'] }, redirect: 'follow', signal: AbortSignal.timeout(6000) }); return send(res, 200, { ok: r.ok, status: r.status }); } catch (e) { return send(res, 200, { ok: false, error: String(e.message || e) }); }
    }
    if (u.pathname === '/api/ytinfo') { try { return send(res, 200, await ytInfo(u.searchParams.get('id') || '')); } catch (e) { return send(res, 400, { error: String(e.message || e) }); } }
    if (u.pathname === '/api/concert') return send(res, 200, await concert(u.searchParams.get('q') || ''));
    if (u.pathname === '/api/long') return send(res, 200, await longVideos(u.searchParams.get('q') || ''));
    if (u.pathname === '/api/ads') return send(res, 200, { items: adsPool() });
    if (u.pathname === '/api/ads/all') return send(res, 200, { items: adsAll() });
    if (u.pathname === '/api/ads/search') return send(res, 200, (await searchShort(u.searchParams.get('q') || '')).filter(v => v.id && v.seconds > 0 && v.seconds <= 240).slice(0, 12));
    if (u.pathname === '/api/ads/edit' && req.method === 'POST') { try { return send(res, 200, await adsEdit(await readBody(req))); } catch (e) { return send(res, 400, { error: String(e.message || e) }); } }
    if (u.pathname === '/api/ads/edits' && req.method === 'GET') { let at = 0; try { at = fs.statSync(ADS_EDITS).mtimeMs; } catch {} return send(res, 200, { ...readEdits(), at }); }
    if (u.pathname === '/api/ads/edits' && req.method === 'POST') {   // your edits from another device (via the cloud) replace the ones here
      try { const b = await readBody(req); writeEdits({ removed: Array.isArray(b.removed) ? b.removed : [], added: Array.isArray(b.added) ? b.added : [] }); return send(res, 200, { ok: true }); }
      catch (e) { return send(res, 400, { error: String(e.message || e) }); }
    }
    if (u.pathname === '/api/ads/refresh') { refreshExtras().catch(() => {}); return send(res, 200, { started: true }); }
    if (u.pathname === '/api/similar') return send(res, 200, await similar(u.searchParams.get('id') || ''));
    if (u.pathname === '/api/log' && req.method === 'POST') {   // playback diagnostics from the page: data/radio-log.txt, last ~300 KB
      let b = ''; req.on('data', c => { if (b.length < 4000) b += c; }); req.on('end', () => {
        try {
          const f = path.join(DATA, 'radio-log.txt'); fs.mkdirSync(DATA, { recursive: true });
          fs.appendFileSync(f, new Date().toISOString() + '  ' + b.replace(/[\r\n]+/g, ' ').slice(0, 1000) + '\n');
          const st = fs.statSync(f); if (st.size > 300000) fs.writeFileSync(f, fs.readFileSync(f, 'utf8').slice(-200000));
        } catch {}
        send(res, 200, { ok: true });
      });
      return;
    }
    if (u.pathname === '/api/library' && req.method === 'GET') return send(res, 200, readLib());
    if (u.pathname === '/api/library' && req.method === 'POST') {
      let b = ''; req.on('data', c => b += c); req.on('end', () => { try { writeLib(JSON.parse(b)); send(res, 200, { ok: true }); } catch (e) { send(res, 400, { error: String(e) }); } });
      return;
    }
    if (u.pathname === '/api/tts') {
      const q = (u.searchParams.get('q') || '').slice(0, 220), tl = u.searchParams.get('tl') === 'ar' ? 'ar' : 'en-GB';
      const r = await fetch('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + tl + '&q=' + encodeURIComponent(q), { headers: { 'User-Agent': HEADERS['User-Agent'], Referer: 'https://translate.google.com/' } });
      if (!r.ok) return send(res, 502, { error: 'tts ' + r.status });
      return send(res, 200, Buffer.from(await r.arrayBuffer()), 'audio/mpeg');
    }
    if (u.pathname === '/api/quit') { send(res, 200, { ok: true }); setTimeout(() => process.exit(0), 200); return; }
    let p = decodeURIComponent(u.pathname);
    if (p === '/') p = '/index.html';
    const root = SERVE, f = path.join(root, path.normalize(p));
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return send(res, 404, 'not found', 'text/plain');
    send(res, 200, fs.readFileSync(f), MIME[path.extname(f)] || 'application/octet-stream');
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

server.listen(PORT, '127.0.0.1', () => { console.log('Pale Blue Dot Radio is on air: http://localhost:' + PORT); syncApp(); voiceInit(); });
setInterval(syncApp, 6 * 3600e3);
let portTries = 0;
server.on('error', e => {
  // just restarted by the old helper: it needs a moment to let go of the port
  if (e.code === 'EADDRINUSE' && process.env.PBD_RESTARTED === '1' && portTries++ < 40) return setTimeout(() => server.listen(PORT, '127.0.0.1'), 250);
  console.error('Could not start: ' + e.message); process.exit(1);
});
process.on('uncaughtException', e => console.error('Unexpected error: ' + (e && e.message)));
process.on('unhandledRejection', e => console.error('Unexpected rejection: ' + (e && e.message)));

// When started by the installed launcher (IDLE_EXIT=1), quit by itself a few minutes after the radio window stops pinging,
// so a closed radio never leaves a background process behind.
if (process.env.IDLE_EXIT === '1') setInterval(() => { if (Date.now() - lastActivity > 180000) process.exit(0); }, 30000);
}
