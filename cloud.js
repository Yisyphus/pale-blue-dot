// Cloud sync with Firebase: your library, favorites, removed songs, chosen versions, the cycle position and the
// commercials live in your own Firestore space (users/<your id>/radio/...), so every device sees the same radio.
// Sign in once with Google; the security rules only let your own account read or write it.
// If firebase-config.js is empty, or the internet is down, the radio simply works without the cloud.
(function () {
  const C = window.Cloud = { enabled: false, user: null, status: 'off', onRemote: null, onStatus: null };
  const cfg = window.FIREBASE_CONFIG;
  const DEVICE = (() => { try { let d = localStorage.getItem('pbd-device'); if (!d) { d = Math.random().toString(36).slice(2, 10); localStorage.setItem('pbd-device', d); } return d; } catch { return 'dev-' + Math.random().toString(36).slice(2, 8); } })();
  C.device = DEVICE;
  const setStatus = s => { C.status = s; if (C.onStatus) try { C.onStatus(s); } catch {} };
  let db, authKnown, authResolve;
  C.authKnown = new Promise(r => { authResolve = r; authKnown = r; });
  if (!cfg || !cfg.apiKey || !window.firebase) { authResolve(null); return; }
  try {
    firebase.initializeApp(cfg);
    db = firebase.firestore();
    try { db.enablePersistence({ synchronizeTabs: true }).catch(() => {}); } catch {}   // works offline, catches up later
    C.enabled = true;
  } catch (e) { console.warn('[cloud] init failed', e); authResolve(null); return; }

  const ref = name => db.collection('users').doc(C.user.uid).collection('radio').doc(name);
  let unsub = [];
  firebase.auth().onAuthStateChanged(u => {
    C.user = u || null;
    unsub.forEach(f => f()); unsub = [];
    setStatus(u ? 'signed in' : 'signed out');
    authKnown(u || null);
    if (u) listen();
  });
  C.signIn = async () => {
    const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
    try { await firebase.auth().signInWithPopup(p); }
    catch (e) { if (/popup/i.test(e.code || '')) await firebase.auth().signInWithRedirect(p); else throw e; }
  };
  C.signOut = () => firebase.auth().signOut();

  // ---- reading ----
  C.pull = async () => {
    if (!C.user) return null;
    const [m, c, a] = await Promise.all(['main', 'cache', 'ads'].map(n => ref(n).get().then(d => d.exists ? d.data() : null)));
    if (!m) return { empty: true, ads: a };
    const lib = JSON.parse(m.json || '{}');
    if (c && c.json) lib.cache = JSON.parse(c.json);
    return { lib, savedAt: m.savedAt || 0, device: m.device, ads: a };
  };
  // live updates from your other devices
  function listen() {
    unsub.push(ref('main').onSnapshot(d => {
      if (!d.exists || d.metadata.hasPendingWrites) return;
      const m = d.data(); if (m.device === DEVICE) return;
      ref('cache').get().then(c => {
        const lib = JSON.parse(m.json || '{}'); if (c.exists && c.data().json) lib.cache = JSON.parse(c.data().json);
        if (C.onRemote) C.onRemote({ lib, savedAt: m.savedAt || 0 });
      }).catch(() => {});
    }, () => {}));
    unsub.push(ref('ads').onSnapshot(d => {
      if (!d.exists || d.metadata.hasPendingWrites) return;
      const a = d.data(); if (a.device === DEVICE) return;
      if (C.onRemoteAds) C.onRemoteAds(a);
    }, () => {}));
  }

  // ---- writing: grouped, at most every 20 seconds, and at once when the window is hidden or closed ----
  let pending = null, timer = null, lastMain = '', lastCache = '';
  C.push = (lib, now) => {
    if (!C.user) return;
    pending = lib;
    if (now) return flush();
    if (!timer) timer = setTimeout(flush, 20000);
  };
  async function flush() {
    clearTimeout(timer); timer = null;
    if (!pending || !C.user) return;
    const lib = pending; pending = null;
    const { cache, ...rest } = lib;
    const mainJson = JSON.stringify(rest), cacheJson = JSON.stringify(cache || {});
    const savedAt = lib.savedAt || Date.now();
    try {
      setStatus('saving');
      const w = [];
      if (mainJson !== lastMain) w.push(ref('main').set({ json: mainJson, savedAt, device: DEVICE, by: C.user.email || '' }));
      if (cacheJson !== lastCache) w.push(ref('cache').set({ json: cacheJson, savedAt, device: DEVICE }));
      await Promise.all(w);
      lastMain = mainJson; lastCache = cacheJson;
      setStatus('saved');
    } catch (e) { console.warn('[cloud] save failed', e); setStatus('error: ' + (e.code || e.message)); }
  }
  C.flush = flush;
  C.pushAds = async (edits, pool) => {
    if (!C.user) return;
    try { await ref('ads').set({ edits: JSON.stringify(edits || {}), pool: JSON.stringify(pool || []), savedAt: Date.now(), device: DEVICE }); } catch (e) { console.warn('[cloud] ads save failed', e); }
  };
  const bye = () => { if (pending) flush(); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') bye(); });
  window.addEventListener('pagehide', bye);
})();
