// Pale Blue Dot Radio app: runs at the start of every page and frame (the radio and YouTube's player).
// YouTube's player stops (or never starts) a song when the page is hidden: screen locked, another app in front.
// Inside this app the page always counts as visible, so the radio keeps playing like it does on the screen.
(function () {
  if (window.__pbdVisible) return; window.__pbdVisible = true;
  try {
    var D = Document.prototype;
    Object.defineProperty(D, 'hidden', { get: function () { return false; }, configurable: true });
    Object.defineProperty(D, 'webkitHidden', { get: function () { return false; }, configurable: true });
    Object.defineProperty(D, 'visibilityState', { get: function () { return 'visible'; }, configurable: true });
    Object.defineProperty(D, 'webkitVisibilityState', { get: function () { return 'visible'; }, configurable: true });
    D.hasFocus = function () { return true; };
  } catch (e) {}
  // nobody hears that the page was hidden, frozen or lost focus
  var quiet = function (e) { e.stopImmediatePropagation(); };
  ['visibilitychange', 'webkitvisibilitychange', 'freeze', 'blur'].forEach(function (t) {
    try { window.addEventListener(t, quiet, true); document.addEventListener(t, quiet, true); } catch (e) {}
  });
  // With the screen off nothing is drawn, so animation frames stop. A page that waits for one gets it a moment later
  // from an ordinary timer instead of never.
  try {
    var raf = window.requestAnimationFrame.bind(window), caf = window.cancelAnimationFrame.bind(window);
    var n = 0, live = {};
    window.requestAnimationFrame = function (cb) {
      var id = ++n, r, t;
      var run = function (ts) { if (!live[id]) return; delete live[id]; caf(r); clearTimeout(t); cb(ts); };
      live[id] = true;
      r = raf(run);
      t = setTimeout(function () { run(performance.now()); }, 250);
      live[id] = { r: r, t: t };
      return id;
    };
    window.cancelAnimationFrame = function (id) { var x = live[id]; if (x && x !== true) { caf(x.r); clearTimeout(x.t); } delete live[id]; };
  } catch (e) {}
})();
