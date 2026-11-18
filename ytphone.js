// Reading a YouTube playlist on the phone, inside the Android app (no PC helper there).
// The app can fetch YouTube's pages for the radio (PBDApp.http, youtube.com only), which a web page cannot do; this
// is the same reading as the PC helper's readPlaylist() in server.js (keep the two in step when YouTube changes its
// pages). Anywhere else (the website, the PC) window.PhoneYT stays off and nothing here runs.
(function () {
  const app = window.PBDApp;
  if (!app || typeof app.http !== 'function') { window.PhoneYT = { ok: false }; return; }

  function extractJSON(html, marker) {
    const i = html.indexOf(marker); if (i < 0) return null;
    const start = html.indexOf('{', i); let depth = 0, inStr = false, esc = false;
    for (let p = start; p < html.length; p++) {
      const c = html[p];
      if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
      if (c === '"') inStr = true;
      else if (c === '{') depth++;
      else if (c === '}') { depth--; if (depth === 0) { try { return JSON.parse(html.slice(start, p + 1)); } catch (e) { return null; } } }
    }
    return null;
  }
  function walk(node, key, out) {
    if (!node || typeof node !== 'object') return out;
    if (Array.isArray(node)) { node.forEach(n => walk(n, key, out)); return out; }
    for (const k of Object.keys(node)) { if (k === key) out.push(node[k]); else walk(node[k], key, out); }
    return out;
  }
  const txt = o => (o && (o.simpleText || (o.runs || []).map(r => r.text).join(''))) || '';
  const secs = s => { const p = (s || '').split(':').map(Number); return p.some(isNaN) ? 0 : p.reduce((a, b) => a * 60 + b, 0); };
  const durText = l => { let t = ''; walk(l, 'thumbnailBadgeViewModel', []).forEach(b => { if (b && b.text && /^\d+:\d+/.test(b.text)) t = b.text; }); return t; };
  function playlistItems(node) {
    const items = [];
    walk(node, 'lockupViewModel', []).forEach(l => {
      const md = l.metadata && l.metadata.lockupMetadataViewModel;
      const rows = md && md.metadata && md.metadata.contentMetadataViewModel && md.metadata.contentMetadataViewModel.metadataRows;
      const channel = rows && rows[0] && rows[0].metadataParts && rows[0].metadataParts[0] && rows[0].metadataParts[0].text ? rows[0].metadataParts[0].text.content : '';
      items.push({ id: l.contentId, title: (md && md.title && md.title.content) || '', channel: channel || '', seconds: secs(durText(l)) });
    });
    walk(node, 'playlistVideoRenderer', []).forEach(v => items.push({ id: v.videoId, title: txt(v.title), channel: txt(v.shortBylineText), seconds: +v.lengthSeconds || 0 }));
    return items;
  }
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
      if (holder) { const t = JSON.stringify(holder).match(/"token":"([^"]+)"/); if (t) tok = t[1]; }
    });
    return tok;
  }
  async function playlist(idOrUrl) {
    const m = String(idOrUrl).match(/[?&]list=([\w-]+)/); const id = m ? m[1] : String(idOrUrl).trim();
    if (!/^[\w-]{10,}$/.test(id)) throw new Error('That does not look like a YouTube playlist link.');
    const r = await app.http('https://www.youtube.com/playlist?list=' + encodeURIComponent(id));
    if (r.status !== 200) throw new Error('YouTube did not answer (' + r.status + ').');
    const html = r.text;
    const data = extractJSON(html, 'var ytInitialData =') || extractJSON(html, 'ytInitialData = ');
    if (!data) throw new Error('Could not read that playlist (is it public or unlisted?).');
    const first = listNode(data, false);
    const items = first.flatMap(n => playlistItems(n));
    const key = (html.match(/"INNERTUBE_API_KEY":"([^"]+)"/) || [])[1], ver = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20240101.00.00';
    let tok = nextToken(first), pages = 0;
    while (tok && pages < 50) {   // 100 videos a page: albums and lists are far shorter
      pages++;
      const res = await app.http('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false' + (key ? '&key=' + key : ''), {
        method: 'POST', body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: ver, hl: 'en' } }, continuation: tok }) });
      if (res.status !== 200) break;
      let j; try { j = JSON.parse(res.text); } catch (e) { break; }
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
  window.PhoneYT = { ok: true, playlist };
})();
