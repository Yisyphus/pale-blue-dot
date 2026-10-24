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
// effect the next time the radio starts. Your data/ folder is never touched.
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

// Long-form talks for the midnight slot: 15 to 90 minutes, preferring podcasts, lectures, and conversations.
const NOT_TALK = /\b(music|mix|playlist|lofi|lo-fi|asmr|binaural|sleep|meditation|hz|chill|beats|ambient|full album|live ?stream|sermon|prayer|compilation|shorts|reaction|trailer|official video|lyrics|soundtrack|gameplay|walkthrough|workout|subliminal|hypnosis|study with me)\b/i;
async function podcast(q) {
  const r = await fetch('https://www.youtube.com/results?search_query=' + encodeURIComponent(q) + '&sp=EgQQARgC', { headers: HEADERS });
  const html = await r.text();
  const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
  if (!data) throw new Error('could not parse results');
  const vids = walk(data, 'videoRenderer', []).map(v => ({ id: v.videoId, title: txt(v.title), channel: chan(v.ownerText) || chan(v.longBylineText), seconds: secs(txt(v.lengthText)) }))
    .filter(v => v.id && v.seconds >= 900 && v.seconds <= 5400);
  return vids.map(v => {
    const t = v.title.toLowerCase(); let s = 0;
    if (/podcast|conversation|interview|talk|lecture|discussion|essay|philosoph|documentary|episode/.test(t)) s += 2;
    if (NOT_TALK.test(v.title)) s -= 8;
    if (/#shorts/.test(t)) s -= 8;
    return { ...v, score: s };
  }).filter(v => v.score > -5).sort((a, b) => b.score - a.score).slice(0, 10);
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
        list.filter(v => v.id && v.seconds >= 8 && v.seconds <= 60 && (MOROCCO.test(v.title) || MOROCCO.test(v.channel)) && !NOT_AD.test(v.title))
          .slice(0, 8).forEach(v => { if (!found.has(v.id)) found.set(v.id, { id: v.id, title: v.title, seconds: v.seconds }); });
      } catch (e) { /* skip this query */ }
      await new Promise(r => setTimeout(r, 1200));   // be gentle with YouTube
    }
    if (found.size) fs.writeFileSync(ADS_EXTRA, JSON.stringify({ updated: Date.now(), items: [...found.values()] }, null, 1));
    console.log('Moroccan ads refreshed: ' + found.size);
  } finally { refreshing = false; }
}
const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
function adsBase() {
  const pl = readJSON(ADS_PLAYLIST, { items: [] }).items.map(v => ({ ...v, src: 'playlist' }));
  const ex = readJSON(ADS_EXTRA, { items: [] });
  const seen = new Set(pl.map(v => v.id));
  const extra = ex.items.filter(v => v.seconds <= 60 && !seen.has(v.id)).map(v => ({ ...v, src: 'search' }));
  if (!ex.updated || Date.now() - ex.updated > 10 * 864e5) refreshExtras().catch(() => {});
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
let lastActivity = Date.now();
const server = http.createServer(async (req, res) => {
  lastActivity = Date.now();
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname === '/api/ping') return send(res, 200, { app: 'pale-blue-dot', ok: true, dir: __dirname });
  try {
    if (u.pathname === '/api/search') return send(res, 200, await search(u.searchParams.get('q') || '', u.searchParams.get('a') || '', u.searchParams.get('t') || ''));
    if (u.pathname === '/api/playlist') { try { return send(res, 200, await readPlaylist(u.searchParams.get('list') || '')); } catch (e) { return send(res, 400, { error: String(e.message || e) }); } }
    if (u.pathname === '/api/podcast') return send(res, 200, await podcast(u.searchParams.get('q') || ''));
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
      const q = (u.searchParams.get('q') || '').slice(0, 220);
      const r = await fetch('https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=' + encodeURIComponent(q), { headers: { 'User-Agent': HEADERS['User-Agent'], Referer: 'https://translate.google.com/' } });
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

server.listen(PORT, '127.0.0.1', () => { console.log('Pale Blue Dot Radio is on air: http://localhost:' + PORT); syncApp(); });
setInterval(syncApp, 6 * 3600e3);
server.on('error', e => { console.error('Could not start: ' + e.message); process.exit(1); });
process.on('uncaughtException', e => console.error('Unexpected error: ' + (e && e.message)));
process.on('unhandledRejection', e => console.error('Unexpected rejection: ' + (e && e.message)));

// When started by the installed launcher (IDLE_EXIT=1), quit by itself a few minutes after the radio window stops pinging,
// so a closed radio never leaves a background process behind.
if (process.env.IDLE_EXIT === '1') setInterval(() => { if (Date.now() - lastActivity > 180000) process.exit(0); }, 30000);
}
