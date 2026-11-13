# Pale Blue Dot Radio: the complete blueprint

A full description of the radio as it is (12 November 2026), written so that a new chat can build a new version for
someone else from it without missing anything. Read it with the code: the code is the final word on details.

---

## 1. What it is

A personal radio station that runs in a browser window. It plays music from YouTube, and between songs a spoken
host (**Astro**) introduces the songs and talks about life's big questions: time, death, love, the absurd, desire,
hope, peace. A second voice (**Luna**) reads poems and passages. Every 4 hours an Arabic news bulletin is read by a
third voice. There are commercials (real Moroccan ads from YouTube), podcasts, live concerts, letters written to the
listener, conversations between the host and other versions of the listener, a focus mode for instrumental music,
marathons, synced lyrics, and a library that syncs across devices.

- **Station:** Pale Blue Dot Radio, "the station at the edge of the night". Host: Astro.
- **Tone:** existential, warm, honest, never preachy; Camus, Sisyphus, memento mori, with humour.
- **Language:** the host speaks English; the news, the Arabic shows and some of the music are in Arabic.
- **Runs on:** a Windows PC (installed app, the main way) and any browser or phone (the website).

---

## 2. How it is built

No framework, no build step, no dependencies. Plain HTML, CSS and JavaScript.

| Part | What it is |
|---|---|
| `index.html` | The whole interface: player, sheets (Suggest, Library, Settings, Marathon…), all the CSS. Script tags carry `?v=<hash>`. |
| `app.js` | All the behaviour (~3,200 lines, one file, wrapped in an IIFE). Sections are marked `// ---------- name ----------`. |
| `content*.js` | Everything the host and Luna say, plus the song catalog, lists and data. Edited freely; never put spoken text in `app.js`. |
| `jingles.js` | Jingles synthesised with Web Audio (bells, plucks, pads): no audio files. |
| `cloud.js` + `firebase-config.js` | Cloud sync through Firebase (Google sign-in + Firestore). |
| `server.js` | The **PC helper**: a small Node.js server (no npm packages) on `http://localhost:8787`. |
| `files.json` | List of every page file with its hash: what the installed app downloads to update itself. |
| `tools/publish.py` | Refreshes every `?v=` in `index.html`, stamps the version, regenerates `files.json`. Run before every commit. |
| `tools/release/` | Windows installer: `build.ps1`, Inno Setup `installer.iss`, launcher `Pale Blue Dot Radio.vbs`, `icon.ico`, `VERSION`. |
| `.github/workflows/release.yml` | Builds the installer and portable zip on Windows when `VERSION` changes on `main`, publishes a GitHub Release. |

### The PC helper (`server.js`)
The browser cannot search YouTube or read most news sites (CORS), so on the PC a helper does it:
- `/api/search` (songs), `/api/podcast` (long talks, over 20 min), `/api/concert` (8–75 min), `/api/long` (ambient
  recordings, 30 min+), `/api/similar` (YouTube's own mix), `/api/playlist` (read a playlist): all by **scraping
  YouTube's public results page** (`ytInitialData`). No API key.
- `/api/fetch?url=` reads news sites (only an allowlist of hosts, `NEWS_HOSTS`).
- `/api/tts` online text-to-speech fallback; `/api/library` (GET/POST) the local copy of the library in `data/`.
- Commercials: `/api/ads`, `/api/ads/all`, `/api/ads/search`, `/api/ads/edit`, `/api/ads/edits`, `/api/ads/seed`, `/api/ads/refresh`.
- `/api/ytinfo?id=` one video's own page: title, channel, length, and for a "Topic" upload the track and album named
  in its description ("Provided to YouTube by …", "Track · Artist", "Album", "℗ …"), plus the description itself.
- `/api/reach?url=` whether one of the three MP3 converter sites opens right now (only those three).
- `/api/open?url=` opens a link in the default browser (Windows: `rundll32 url.dll,FileProtocolHandler`, never
  `explorer.exe`, which opened the Documents folder).
- `/api/update` downloads the newest page files; `/api/restart` hands over to a newly installed `server.js`;
  `/api/ping` returns `{ app: 'pale-blue-dot', open: 2 }`; `/api/quit`; `/api/log` (diagnostics to `data/radio-log.txt`).
- **Self-update:** `cloud.json` holds `appUrl`. At start, every 6 hours and on `/api/update`, the helper reads
  `files.json` there and downloads only changed files into `app-cache/` (hash-checked), then serves from it. A new
  `server.js` is validated and installed too. `public/` stays the fallback.

### The installed app (Windows)
- Installed in `%LOCALAPPDATA%\Programs\PaleBlueDotRadio` (no admin rights). **Its own program (Electron)**:
  `Pale Blue Dot Radio.exe` with `resources\app` = `desktop/` (`main.js`, `package.json`). The window has
  `backgroundThrottling: false` and the switches `disable-renderer-backgrounding`, `disable-background-timer-throttling`,
  `disable-backgrounding-occluded-windows`, `autoplay-policy=no-user-gesture-required`, so it stays "visible" when
  minimized: YouTube loads and starts songs as usual (in a browser, a song loaded while minimized stays buffering
  forever). The user agent has no "Electron/". It starts the helper with its own Node (`ELECTRON_RUN_AS_NODE=1`,
  `PBD_DESKTOP=1`), waits for `/api/ping`, calls `/api/update` once, then loads `http://localhost:8787/`. Links open in
  the normal browser; the Google sign-in popup is a child window; one instance only; closing the window calls `/api/quit`.
- **Voices made on the PC** (helper, `POST /api/say { text, who, speed, pre }` → WAV, `{ items: [...] }` to make
  ahead in order): the table `VOICES` in `server.js` — Astro `h` = Kokoro `am_echo`, Luna `s` = Kokoro `af_heart`, the
  news `ar` = Piper `ar_JO-kareem-medium` (`piper\piper.exe`, which adds the Arabic vowel marks itself with
  libtashkeel). Kokoro: kokoro-js 1.2.1, q8, CPU, model in `voice-model\onnx-community\Kokoro-82M-v1.0-ONNX` (revision
  1939ad2a…); Kareem in `voice-model\piper`. One job at a time, a line needed now first, 150 cached, never the same
  line twice. `/api/ping` reports `desktop` and `voice: { state, progress, rtf, error, ar, arError }`.
- **The page in the app** (`desktopApp`): `say()` plays the helper's recordings (`sayKokoro`/`playPiece`, caption
  following the playback); never a stand-in voice: the first welcome waits for the voices ("Getting the voices
  ready…"), a break before they are ready is skipped, the news is skipped until Kareem is ready. The next break and
  its intro are written ~95 s before a song ends (`planBreak`) and recorded ahead; every break and bulletin is sent
  as ONE ordered list when it starts; blocks are cut in pieces (first piece one sentence). The other voices of a
  script (the versions of you) are Astro's or Luna's played slightly higher or lower. `R.kokoroSay` (content.js):
  Kokoro's own pronunciation list (checked with the phonemizer, espeak en-us), applied before `R.sayAs`.
- **The next song is primed**: loaded on the idle player at volume 0 (never `mute()`), paused at 0 once playing,
  then started with unMute + seekTo(0) + playVideo. The report logs "window minimized" / "window back" with both
  players, player changes while minimized, "next song ready", and "voices …".
- **Release** (`tools/release/build.ps1`, Windows on GitHub Actions): Electron 44.10.0 (checked against SHASUMS256),
  renamed and branded with rcedit; kokoro-js trimmed to what Windows needs, only the two voices; Piper 2023.11.14-2
  (checksum pinned); a check that Kokoro loads with the app's Node and that piper.exe speaks Arabic with libtashkeel.
  The installer downloads Kokoro's model and Kareem (SHA-256 each), removes the old `.vbs` launcher and node helper,
  and its uninstall removes `voice-model\`.
- The radio's own **✕** turns everything off.

### The website and the phone
Published by GitHub Pages from `main`. Without the helper (phone, other browsers), `mobileWeb()` is true: YouTube
search is not available (songs with a known video id still play), news goes through public CORS relays, the
online TTS is used when there is no device voice. **Phone-only fixes are gated by `mobileWeb()`**; the PC keeps its
own behaviour.

### Publishing a change
1. Edit files. 2. `python3 tools/publish.py`. 3. Commit and push to `main` (Pages deploys in about a minute).
For a new Windows release: write the version (e.g. `v2026.11.11`) in `tools/release/VERSION` in the same push.

---

## 3. The music

### The library
- **Catalog** (`content12.js`, `content21.js`…): the curated pool. Each line `Artist|Title|genre|themes|mood|energy|lang`.
  Every song has an accurate genre, the themes of its lyrics, a mood and an energy level (1 calm – 5 driving).
- **Exact videos** (`content13.js`, `R.catalogIds`): the checked YouTube id per song, so no search is needed.
- **Your songs** (`lib.user`): songs added with Suggest. **Removed songs** (`lib.removed`) never play again.
- **Labels** (`lib.labels`): genre, themes, mood, energy for any song; Library > Needs labels, with "suggest labels
  from the same artist" (only saved when confirmed).
- **Genre groups / runs** (`R.runs`): e.g. Prog rock classics, Psychedelic, Dream pop & shoegaze, Jazz, Arabic &
  Moroccan, Reggae dub… A run plays the next 20–40 songs of one group, then back to the normal mix. Favorites and
  saved lists can be run too (all of them, shuffled).
- **Choosing the next song** (`choose()`): follows a feeling (themes, mood, energy, genre "near" relations), avoids
  repeats (remembered across sessions), never the same artist twice in a row.
- **Similar songs** found automatically from YouTube's own mix.

### Playback
- **Two YouTube iframe players**: the next song is prepared (searched and cued 75 s before the end) and crossfaded.
- Settings: **Fade between songs**, **Trim song endings** (learned per song when you skip near the end).
- **Silence watchdog**: what the screen says is playing must really be audible (unmutes, restores volume).
- **"No sound or wrong song? try another version"**: pick another upload; the choice is remembered.
- **✕ remove this song** (two taps): out of the library (normal mode) or out of the station (Focus mode).
- **♥ Favorites**, **Previous** (history), **Next**, pause stops everything (song, voice, jingle, ad, bed).
- **⟲ Repeat** (right of Next): whatever is playing (song, album track, Focus track, episode) starts again when it
  ends, with no talk, no fade, no next song prepared; stays on until pressed again; Next still moves on.
- **↓ Download** (left of the title): opens the first MP3 converter that answers (`/api/reach`): **ezconv.org** with
  the video's link in its address (`?url=`, it starts by itself), else **yttmp3.com.co** or **tubemixlab.com** with
  the link copied to paste. The quality is chosen on the site. No direct download is built in (the sites have no
  official interface, and YouTube audio is about 160 kbps whatever the file says).
- **The caption box** (the host's words, the news) has no height limit, so a whole sentence always shows.
- **Ambient bed**: a soft pad under the host so the air is never silent.

### Suggest (the + button)
- **One song**: search, pick the right result, it joins the library and plays next; optional themes; optional
  **dedication** (Astro says a few words, then your words exactly, then the song; never saved).
- **A list**: a YouTube playlist link or one "Artist - Title" per line, no size limit; every match shown with a tick
  box; saved as a named list (Library > Lists) with a genre for unlabelled songs; "play these next".
- In Focus mode, Suggest adds to the playing **station** instead (no dedication, no themes, no list).

### Lyrics
- From **LRCLIB** (lrclib.net, free, no key, CORS allowed). Exact match by artist, title and length first, then the
  synced version closest in length. Plain (unsynced) lyrics shown as text; instrumentals say so.
- Synced to the player's real position 5 times a second, so skip, rewind and seek keep the right line.
- **Tap the line being sung** to fix the timing (or earlier / later by 0.5 s); kept per song in `lib.lyrOff`, synced.
- Shown in place of the record; button in the row of icons; remembered on/off.

---

## 4. The host and the programming

### A 64-song cycle (saved, continues where it stopped)
After song **8, 24, 40, 56**: commercials · **16**: The Long Hour (a long talk) · **32**: A Long Letter to You (5–8
min, ending with Luna's reading) · **48**: Conversations with You · **64**: a podcast (Saturdays: a live concert).
At most one big part per break. The host speaks every 2 songs (or every song: Settings > Host speaks). The other
breaks may get a small extra: a genre note, a letter + reading, a station ident, a check-in.

### What the host says (all in `content*.js`)
| File | Contents |
|---|---|
| `content.js` | Station, tagline, host; `themeLine` (lines per theme); `genreNotes` (genre and existential feeling). |
| `content2.js` | Pools of short connective lines (welcomes per time of day, bridges…), never repeated until each pool is used up. Placeholders `{host} {station} {time} {a} {t} {title} {age}`. |
| `content_songs.js`, `content6.js` | Hand-written intros and back-announcements per song and per theme. |
| `content22.js` | Notes on the songs (what they are about) and on the artists. |
| `content3.js`, `content7.js` | Long talks (The Long Hour) and letters. |
| `content4.js`, `content8.js` | Readings and poems (public domain), fictional commercials and shows, imagined guests. |
| `content5.js`, `content9.js` | Podcast intros and outros (midnight and day). |
| `content10.js` | Genre runs. |
| `content11.js` | Commercial-break intros and outros. |
| `content14.js` | Luna's readings after the letters (public domain), chosen by theme, never one heard recently. |
| `content15–16.js` | Letters to the Absurd, and to You: general letters. |
| `content17–18.js` | **Personal letters written from the owner's own profile.** Replace entirely for someone else. |
| `content19.js` | A Long Letter to You; the **birthday letter** (plays only on the listener's birthday); `R.listener = { born }`. |
| `content20.js` | Conversations with You: the host and the listener younger (y), older (o), the part that refuses (r), the part that keeps going (k)… each a different voice and pitch. |
| `content23.js` | Focus stations, ambient sounds, dedication lines, the podcast shows and concerts, pronunciation fixes (`R.sayAs`). |
| `content24.js` | The album show: the albums, their tracklists, what Astro says before and between the tracks. |
| `jingles.js` | The jingles. |

- **Voices** (Settings): Astro (default Brian Multilingual), Luna (Emily, Ireland), News (Mouna, Morocco), speaking
  pace. Edge's natural voices are preferred; an online voice is the fallback.
- **Pronunciation**: `R.sayAs` rewrites names before speaking (e.g. "Da7ee7" → "Daheeh", the 7 was read "seven").
  Spoken text must avoid symbols the voice reads aloud (a trailing "-" was read "شرطة").
- **Sleep timer** ends with a goodnight line.

### Commercials
- Real Moroccan TV ads from YouTube: a YouTube playlist snapshot + an automatic search (Moroccan, 8 s to 3 min),
  refreshed every 10 days. A break is jingle, ad, jingle, ad, jingle; one jingle between ads in a marathon.
- **Manage commercials** (Settings): Playing / Removed tabs, add by link, playlist or search, "Play commercials now",
  copy the list. "✕ never play this ad" while one plays. An ad YouTube reports removed (error 100) leaves by itself.
- Each ad plays to its real end (timed on the video, never on a clock that counts loading).
- **Ad edits are merged across devices, never replaced** (`syncAds`).

### Podcasts and concerts
- The podcast slot takes turns: a regular episode before each show — **في الحضارة** (AlarabyTube), **الدحيح**
  (several channels), **هو ليه؟** (AlarabyTube), **مع عبد اللطيف** (channel "عبد اللطيف +"). Each show is limited to its
  channels and title pattern; if nothing is found, a regular episode. Played episodes never return (`lib.pod`).
- **Saturdays**: a live concert instead — a **KEXP Full Performance** or an **NPR Music Tiny Desk Concert**.
- Settings: **A podcast, now** (each show) and **A live concert, now** (Either, KEXP, Tiny Desk).

### The news (Arabic, every 4 hours on the hour: 00, 04, 08, 12, 16, 20)
- Gathered 3 minutes before the hour while the music plays. Interrupts whatever is on, then brings it back from the
  start (the song or episode from 0:00, a break from the interrupted part).
- Sections and sizes (`NEWS_PLAN`): Marrakech 6, Moroccan news 5 (MAP: royal 1, politics 2, economy 2), latest 6,
  world 4, Moroccan tech 4, world tech 4, art & culture 8, trending on social media 4. No sport, ever. At most 2
  crime stories in the Marrakech section while other news is left.
- Sources (`NEWS_SOURCES`): Kech24, Marrakech Alaan, MAP (via Google News), Hespress, Le360, BBC Arabic, Al Jazeera,
  France 24, AIT News, Al Jazeera tech, BBC tech, CNN Arabic tech, Hit Radio, BBC culture, Al Arabiya and BBC social media.
- Each section: new headlines from its own sources first, then fitting ones from elsewhere, then the most important
  already read, then older. Headlines cleaned (`cleanHead`): source suffixes, "فيديو:", trailing dashes.
- Then **the weather in Marrakech** (Open-Meteo: now, the rest of today, tomorrow), weather warnings, the dirham
  rate, the next prayer, the next public holiday. Arabic pronunciation fixes (مُرّاكُش, numbers, units).
- On the PC each site is read through the helper first; each site has its own time limit, so one slow site only
  loses its own headlines. Settings: on/off, Play now, Check sources (✓/✗ per site), Last bulletin (every line with
  its link). Tapping the caption during the news opens the article. Previous / Next move between headlines.

### Focus mode (headphones icon)
- No talk, no commercials; the news stays. **Instrumental stations that never mix**: Piano & Strings, Deep Ambient,
  Lofi & Chill Beats, Downtempo, Synth & Retro, Post-rock, Late-night Jazz, Jazz Noir, Oud & the East, Dub (~310
  hand-picked instrumentals, nothing cinematic), plus **your own genres** (+ Add a genre: a name and 3+ tracks you
  pick; edit, delete; nothing is found for you). Or **Ambient sounds** (rain, night rain, deep space, ocean, forest,
  café, fireplace, thunder, desert wind: one long recording at a time). PC only.
- Focus tracks never touch the library, history or favorites.

### Album show (Library > Albums, or Settings > Album show)
A whole album in its own order. Astro introduces the band and the album, plays 3 tracks, pauses to talk about them,
and so on to the end, then a closing line. Never programmed; tracks stay out of the library and history; no early
fade or trim between tracks; the next track is loaded ahead. Next skips a track, Previous goes back one, ■ stops the
album. PC only (the tracks are found and checked through the helper).

- **`content24.js`**, `R.albums` (20 albums, 211 tracks): `tracks` (order checked against MusicBrainz), `aka` (the same
  tracks as the official streaming releases title them, e.g. "Nata Ni Thlae", "Breathe (In the Air)", "War Pigs /
  Luke's Wall"), `lengths` (seconds on the original album, from MusicBrainz and Deezer; a track may have two),
  `intro`, one `notes` entry per 3 tracks (the last one is said at the end), `ytArtist` / `ytAlbum` when YouTube
  writes the name differently. Facts from the albums' Wikipedia articles (four written from knowledge when Wikipedia
  refused the requests: Neutral Milk Hotel, Altın Gün, Yīn Yīn, L'morphine). `R.albumOutros`, `R.albumIntroPlain`.
- **Which video plays** (`resolveAlbum`), in this order:
  1. **Videos saved from a playlist** (`lib.albumVideos`, synced). A playlist is read **once**; its videos are matched
     to the tracks (by title and `aka`, the rest by position when the counts are equal) and saved in the album. From
     then on those exact videos play; the playlist is never read again and YouTube is not searched for those tracks.
     `R.albumPlaylists` (the owner's two) and `lib.albumLists` (pasted in Library > Albums) are the playlists; one that
     matches none of the albums becomes an album of its own (plays straight through, plain intro, no pauses).
  2. **Otherwise, a YouTube search where every candidate must pass five checks** (anything not proven is skipped,
     never replaced by another version): it is a Topic upload ("Provided to YouTube by"); its title is the track's own
     (`foldTrack`/`sameTrack`: only remaster, year, mono/stereo, "feat." may differ; demo, live, remix, edit, acoustic,
     instrumental, "Pt. Two" make it another recording; "&" = "and", Turkish ı = i); its album line is this album
     (`albumTitleOk`: whole words, brackets kept; live, remix, demo, session, box sets, compilations refused; "Original
     Album Mix" accepted); nothing else in its description says live, demo, remix, session, outtake (`otherVersion`;
     credits and the label line ignored); its length is within 8 s or 3% of the album's (`albumLenOk`).
- **Before an album starts**, every track is looked up and checked ("Checking the album on YouTube: 4 of 10"); missing
  tracks are named in a message. With an older PC helper (no `/api/ytinfo`), the show does not start at all.
- Found videos are kept on the device (`pbd-album-cache6`; the number goes up whenever the rules change, so old picks
  are forgotten). The Playback report lists every refused upload with the album, title and length its page gave.
- **Library > Albums**: ▶ Play, **✎** (an album with notes: paste the playlist whose videos it should save, or empty
  to go back to the checked search; an album of its own: rename it), **✕** remove (two-step, **Restore** at the
  bottom). `lib.albumHidden`, `lib.albumEdits`, `lib.albumVideos`, `lib.albumLists`: all synced.

### Marathon (Settings > Marathon)
Four groups, each a box that ticks or clears all of it (ticking inside ticks the group):
- **Songs** (no host over the music), from: whole library, favorites, each list, genre groups.
- **Voices**: letters, long letters, The Long Hour, conversations, check-ins, readings.
- **Podcasts**: each show. **Commercials**.
With songs and other parts: **songs between parts** 1 · 2 · 3 · 5 (default 2). Only songs: non-stop music.
Previous goes back to the part before (any kind, last 40). Next skips to the next part.

---

## 5. Data, sync and backups

- **`lib`** (the library object): `user` (your songs), `fav`, `lists`, `removed` + `removedTs`, `labels`, `cache`
  (found videos), `trim`, `bad`, `used` (shuffle bags), `hist`, `pod` (played episodes), `podTurn`, `b` (cycle
  position), `settings` (S), `focusAdd` / `focusCustom` (Focus tracks and genres), `lyrOff`, `adNotes`,
  `adCleanups`, `adsHidden`, `albumVideos` (the exact videos of each album, saved from a playlist), `albumLists`
  (your album playlists), `albumHidden`, `albumEdits`, `del` (deletion records), `savedAt`. Kept on the device only:
  repeat on/off, lyrics on/off, Focus mode, the album lookups.
- Stored: on the PC in `data/library.json` (helper); in the browser in `localStorage`; in the cloud in Firestore
  `users/<uid>/radio/main` + `cache` (+ `ads`, daily backups), Google sign-in, rules allow only the owner.
- **The rule that matters most:** every device's copy is **merged**, never replaced (`mergeLib`). Additions from
  everywhere are kept; something you deliberately removed is recorded in `lib.del` with a time, so a merge does not
  bring it back. A device writes to the cloud only after it has merged once (`Cloud.ready`). Never write code that
  overwrites the cloud copy with a local one.
- **Backups**: Settings > Library backup: save to a file, restore (merged), and one copy a day in the cloud for 30 days.
- Diagnostics: Settings > Playback report (what YouTube did).

---

## 6. What is personal to the owner (change all of it for someone else)

| Personal | Where | For a new person |
|---|---|---|
| Name, branding | `content.js` (station, tagline, host), `index.html` (title, header), icon | New station name, host name, tagline, icon. |
| Birth date, birthday letter | `content19.js` (`R.listener`, birthday letter) | Their date, a new letter. |
| Personal letters | `content17.js`, `content18.js` | Rewrite from the new person's profile, or remove. |
| Long letters, conversations | `content19.js`, `content20.js` | Review: some draw on the owner's life. |
| Music taste | catalog `content12.js`, `content13.js`, `content21.js`, notes `content22.js`, scripts `content_songs.js` | A new catalog for their taste (and the exact-video file regenerated). |
| City and country | news sources and plan, Marrakech weather coordinates (`MA`), Arabic news voice, prayer times, dirham, Moroccan holidays, vigilance warnings | Their city, their language, their sources. |
| Commercials | the Moroccan ads playlist and search (`server.js`: `AD_QUERIES`, `MOROCCO`) | Their country's ads, or none. |
| Shows | `content23.js` podcast shows, concert sources | Shows they like. |
| Albums | `content24.js` (20 albums with notes, `R.albumPlaylists`) | Their albums, with tracklists, `aka`, lengths and notes checked the same way. |
| Voices | defaults (Brian, Emily, Mouna) | Voices in their languages. |
| Cloud | `firebase-config.js` (owner's Firebase project) | **A new Firebase project** (Auth: Google; Firestore with owner-only rules). Never reuse the owner's. |
| Website | GitHub Pages URL, `cloud.json` `appUrl` in the installer, `tools/release` names | A new repository and Pages URL; the installer's `cloud.json` pointing to it. |

---

## 7. Lessons learned (keep these)

- The PC helper must stay dependency-free and self-updating; the page must keep working with an **older helper**
  (check its abilities through `/api/ping`, fall back when an endpoint is missing).
- A browser slows a minimized page down and YouTube's fresh loads then stall: the app is Electron with background
  throttling off. Its voices are made on the PC (Kokoro, Piper), never a stand-in; record ahead so a slow PC keeps up.
- Long jobs on a weak connection: give each source its own time limit; never let one global timeout discard results
  that already arrived. Ask the PC first, the public relays only if that fails.
- Time media by the media's own clock (player position), never by a timer that starts at load.
- Anything spoken goes through the content files and pronunciation fixes; test how names and symbols are read.
- Two-tap confirmation for destructive buttons; everything removable can be restored.
- Data: merge, never overwrite; record deletions with timestamps.
- YouTube, news sites and Windows cannot be tested from a cloud session: say so, test with stand-ins in a browser
  (Playwright with mocked `/api/*` and a stub YouTube iframe API), and let the first real run on the PC confirm.
  Never claim something was checked when it could not be.
- **Exact versions** (learned the hard way on the album show): a matching title on the artist's Topic channel is not
  proof. Topic channels hold the same song from remixes, box sets, demos and live albums, often with identical titles.
  Prove it with the video's own page (album line, track line, description) and the length; skip what cannot be
  proven; never fall back to an unchecked match, not even with an older helper.
- Take track titles from the **official streaming releases** (Deezer, Apple Music: they match YouTube's Topic
  uploads), not only from MusicBrainz, and compare every one before shipping. Watch for special letters (ı), "&",
  "Pt. 1 / Pt. One", and tracks that have two official lengths.
- When the user gives exact sources (a playlist), save what they point to (the video ids) and stick to it.

---

## 8. Starting a new version for someone else

1. **Make a new repository** from this one (GitHub: Use this template, or copy the files). Keep this blueprint in it.
2. **Open a new chat on that repository** and paste the prompt below, filled in.
3. The new chat changes everything in section 6, keeps sections 2–5 and 7, and publishes as in section 2.

```
I am building a new version of my personal radio for <name>. The repository is <owner/repo>.
Read docs/BLUEPRINT.md and CLAUDE.md first, then the code. Keep the architecture, the features and the rules
(merge never overwrite, content in content*.js, publish with tools/publish.py). Change what is personal:

- Station name / tagline / host name and personality: <…>
- Listener: name <…>, birthday <…>, city <…>, languages <…>
- Music taste (genres, artists, eras, languages): <…>
- News: <on/off>, language <…>, city and sources <…>
- Commercials: <country / none>
- Podcasts and shows: <…>; Saturday concerts: <keep / change>
- Letters and conversations: <rewrite for this person (what I can tell you about them) / remove>
- Voices: <…>
- Features to drop or add: <…>
- Cloud: a new Firebase project (I will create it; tell me exactly what to click) and a new GitHub Pages site.
- Windows installer: <yes / no>, app name <…>

Ask me anything you need before writing the personal parts.
```
