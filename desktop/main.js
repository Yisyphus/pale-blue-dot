// Pale Blue Dot Radio, the Windows app: its own window (Electron), not a browser tab.
// - It starts the helper (server.js, in the install folder) with the app's own built-in Node, then shows the radio.
// - The window is never slowed down or paused when it is minimized or covered: YouTube loads and starts songs as
//   usual (in a browser, a song loaded while minimized stays buffering until the window comes back).
// - The voices are made on this PC by the helper (Kokoro for Astro and Luna, Piper for the Arabic news).
// - Links open in the normal browser; Google sign-in opens in a small window of its own.
const { app, BrowserWindow, shell } = require('electron');
const path = require('path'), http = require('http'), { spawn } = require('child_process');

const DIR = process.env.PBD_DIR || path.dirname(process.execPath);   // the install folder (server.js, public, data...)
const PORT = 8787, URL_HOME = 'http://localhost:' + PORT + '/';

// a minimized page must never be put to sleep: no slowed timers, no "hidden" page, no paused media
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.setAppUserModelId('PaleBlueDotRadio');
app.userAgentFallback = app.userAgentFallback.replace(/ Electron\/\S+/, '').replace(/ pale-blue-dot-radio\/\S+/i, '');   // a plain Chrome to YouTube and Google

if (!app.requestSingleInstanceLock()) app.quit();

const ping = () => new Promise(res => {
  const r = http.get({ host: '127.0.0.1', port: PORT, path: '/api/ping', timeout: 1500 }, x => { let b = ''; x.on('data', c => b += c); x.on('end', () => { try { res(JSON.parse(b).app === 'pale-blue-dot'); } catch { res(false); } }); });
  r.on('error', () => res(false)); r.on('timeout', () => { r.destroy(); res(false); });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function startHelper() {
  if (await ping()) return true;
  try {
    spawn(process.execPath, [path.join(DIR, 'server.js')], { cwd: DIR, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', PBD_DESKTOP: '1' }, detached: true, stdio: 'ignore', windowsHide: true }).unref();
  } catch (e) { return false; }
  for (let i = 0; i < 80; i++) { await sleep(250); if (await ping()) return true; }
  return false;
}
const SIGN_IN = /^https:\/\/(accounts\.google\.com|[\w-]+\.firebaseapp\.com|[\w-]+\.web\.app|apis\.google\.com)\//;

let win = null;
async function open() {
  win = new BrowserWindow({
    width: 440, height: 820, minWidth: 360, minHeight: 560, title: 'Pale Blue Dot Radio', backgroundColor: '#05081a',
    icon: path.join(DIR, 'icon.ico'), autoHideMenuBar: true, show: false,
    webPreferences: { backgroundThrottling: false, contextIsolation: true, sandbox: true, spellcheck: false },
  });
  win.removeMenu();
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (SIGN_IN.test(url)) return { action: 'allow', overrideBrowserWindowOptions: { width: 480, height: 640, autoHideMenuBar: true, parent: win, webPreferences: { backgroundThrottling: false } } };
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(URL_HOME)) { e.preventDefault(); if (/^https?:\/\//.test(url)) shell.openExternal(url); } });
  win.on('closed', () => { win = null; });
  const ok = await startHelper();
  if (!ok) { win.loadURL('data:text/html,' + encodeURIComponent('<body style="font:16px sans-serif;background:#05081a;color:#eee;padding:24px"><h2>The radio could not start</h2><p>Close this window and open Pale Blue Dot Radio again. If it happens again, restart the PC.</p></body>')); return; }
  await updateFirst();
  win.loadURL(URL_HOME);
}
// the newest version of the radio before the window shows it (at most a few seconds; offline, the copy on the PC)
function updateFirst() {
  return new Promise(res => {
    const r = http.request({ host: '127.0.0.1', port: PORT, path: '/api/update', method: 'POST', timeout: 8000 }, x => { x.resume(); x.on('end', res); });
    r.on('error', res); r.on('timeout', () => { r.destroy(); res(); }); r.end();
  });
}
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(open);
app.on('window-all-closed', () => {   // closing the window closes the helper too
  const r = http.get({ host: '127.0.0.1', port: PORT, path: '/api/quit', timeout: 1500 }, () => app.quit());
  r.on('error', () => app.quit()); r.on('timeout', () => { r.destroy(); app.quit(); });
});
