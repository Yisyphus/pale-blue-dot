// Pale Blue Dot Radio app: the browser's speech (speechSynthesis), made by Android's own text-to-speech.
// The web view inside an app has no voices of its own; these are the same Google voices Chrome uses on the phone.
// The radio's code is unchanged: it sees the usual speechSynthesis, SpeechSynthesisUtterance and getVoices().
(function () {
  if (window.__pbdSpeech) return; window.__pbdSpeech = true;
  var N = window.PBDNative; if (!N) return;
  var voices = [], seq = 0, pending = {}, order = [], paused = false, held = [];
  var post = function (o) { try { N.postMessage(JSON.stringify(o)); } catch (e) {} };

  function Utterance(text) {
    var et = new EventTarget();
    et.text = text == null ? '' : String(text); et.lang = ''; et.voice = null; et.rate = 1; et.pitch = 1; et.volume = 1;
    et.onstart = et.onend = et.onerror = et.onboundary = et.onpause = et.onresume = et.onmark = null;
    Object.setPrototypeOf(et, Utterance.prototype);
    return et;
  }
  Utterance.prototype = Object.create(EventTarget.prototype);
  Utterance.prototype.constructor = Utterance;

  function fire(u, type, err) {
    var e = new Event(type);
    try { Object.defineProperty(e, 'utterance', { value: u }); Object.defineProperty(e, 'charIndex', { value: 0 }); Object.defineProperty(e, 'elapsedTime', { value: 0 }); if (err) Object.defineProperty(e, 'error', { value: err }); } catch (x) {}
    try { if (typeof u['on' + type] === 'function') u['on' + type](e); } catch (x) { setTimeout(function () { throw x; }); }
    try { EventTarget.prototype.dispatchEvent.call(u, e); } catch (x) {}
  }
  function send(u) {
    var id = 'u' + (++seq); pending[id] = u; order.push(id);
    var v = u.voice;
    post({ op: 'speak', id: id, text: u.text, voice: v ? v.name : '', lang: u.lang || (v ? v.lang : ''), rate: +u.rate || 1, pitch: +u.pitch || 1, volume: u.volume == null ? 1 : +u.volume });
  }
  function drop(id) { delete pending[id]; var i = order.indexOf(id); if (i >= 0) order.splice(i, 1); }

  var S = new EventTarget();
  S.onvoiceschanged = null;
  S.getVoices = function () { return voices.slice(); };
  S.speak = function (u) { if (!u) return; if (paused) { held.push(u); return; } send(u); };
  S.cancel = function () {
    var list = order.map(function (id, i) { return { u: pending[id], first: i === 0 }; });
    pending = {}; order = []; held = [];
    post({ op: 'cancel' });
    list.forEach(function (x) { fire(x.u, 'error', x.first ? 'interrupted' : 'canceled'); });
  };
  // Android's voices cannot pause: pause stops, and resume says the interrupted line again from its start
  S.pause = function () { if (paused) return; paused = true; held = order.map(function (id) { return pending[id]; }).concat(held); pending = {}; order = []; post({ op: 'cancel' }); };
  S.resume = function () { if (!paused) return; paused = false; var h = held; held = []; h.forEach(send); };
  Object.defineProperty(S, 'speaking', { get: function () { return order.length > 0; } });
  Object.defineProperty(S, 'pending', { get: function () { return order.length > 1 || held.length > 0; } });
  Object.defineProperty(S, 'paused', { get: function () { return paused; } });

  // Sign in with Google, done by Android (the page asks, the app answers with a Google token)
  var signinWait = null;
  window.PBDApp = { signIn: function () {
    return new Promise(function (res, rej) { if (signinWait) signinWait.rej(new Error('cancelled')); signinWait = { res: res, rej: rej }; post({ op: 'signin' }); });
  } };

  N.onmessage = function (m) {
    var d; try { d = JSON.parse(m.data); } catch (e) { return; }
    if (d.op === 'signin') { var w = signinWait; signinWait = null; if (w) { if (d.token) w.res(d.token); else w.rej(new Error(d.error || 'sign-in failed')); } return; }
    if (d.op === 'voices') {
      voices = d.voices.map(function (v) { return { name: v.name, lang: v.lang, voiceURI: v.name, localService: !!v.local, default: !!v.default }; });
      var e = new Event('voiceschanged');
      try { if (typeof S.onvoiceschanged === 'function') S.onvoiceschanged(e); } catch (x) {}
      try { EventTarget.prototype.dispatchEvent.call(S, e); } catch (x) {}
      return;
    }
    var u = pending[d.id]; if (!u) return;   // cancelled meanwhile
    if (d.op === 'start') fire(u, 'start');
    else if (d.op === 'end') { drop(d.id); fire(u, 'end'); }
    else if (d.op === 'error') { drop(d.id); fire(u, 'error', d.error || 'synthesis-failed'); }
  };
  try {
    Object.defineProperty(window, 'speechSynthesis', { value: S, configurable: true, writable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', { value: Utterance, configurable: true, writable: true });
  } catch (e) { window.speechSynthesis = S; window.SpeechSynthesisUtterance = Utterance; }
  post({ op: 'hello' });
})();
