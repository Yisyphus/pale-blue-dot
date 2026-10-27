# Pale Blue Dot Radio: read this first

## Where the radio lives now

- **This GitHub repo, `Yisyphus/pale-blue-dot`, is the only source of truth.** Every change is made here, on `main`.
- **The website** is published from this repo by GitHub Pages: https://yisyphus.github.io/pale-blue-dot/
  (The old address `ymoumou-axigeo.github.io` no longer exists.)
- **The Windows app (the exe)** is installed in `%LOCALAPPDATA%\Programs\PaleBlueDotRadio`. It updates itself from the website: its `cloud.json` holds `"appUrl": "https://yisyphus.github.io/pale-blue-dot/"`. New page files take effect the next time it opens; a new `server.js` (the helper) takes effect after the second restart.
- **Your data** (library, favorites, lists, settings, commercial edits, daily backups) is in Firebase, tied to the owner's Google account. It is not in this repo.

## The old `radio-amber` folder is archived

`C:\Users\myoussef\Downloads\radio-amber` (and its zip) is an **old, archived copy**. Do not edit it, run it, publish from it, or copy files from it into this repo: everything in it is out of date and would undo recent work. The only things it still holds that are not here are the old installer build files (`dist\PaleBlueDotRadio-Setup.exe` and its build script); if a new installer is ever needed, rebuild it from this repo's current files.

## How to publish a change

1. Edit the files in this repo.
2. Run `python3 tools/publish.py`. It refreshes every `?v=` in `index.html`, stamps the version, and regenerates `files.json` (the list the exe uses to update itself). Never skip this, or the exe will not pick the change up.
3. Commit and push to `main`. GitHub Pages deploys in about a minute.

## How to make a new Windows release (installer and portable zip)

Write the new version (for example `v2026.11.02`) in `tools/release/VERSION`, commit and push to `main`. The
`Release` workflow (`.github/workflows/release.yml`) builds `PaleBlueDotRadio-Setup-<version>.exe` and
`PaleBlueDotRadio-<version>-portable.zip` on a Windows machine (`tools/release/build.ps1`, Inno Setup script
`tools/release/installer.iss`, launcher `Pale Blue Dot Radio.vbs`) and publishes them as a GitHub Release.

## Rules that matter

- Library and commercial edits from different devices are always **merged**, never replaced (see `mergeLib` and `syncAds` in `app.js`). Never write code that overwrites the cloud copy with a local one.
- Phone-only fixes are gated by `mobileWeb()`; the PC keeps its own behaviour.
- Everything the host (Astro) and Luna say lives in the `content*.js` files, not in `app.js`.
