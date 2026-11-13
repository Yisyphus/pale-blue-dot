# Builds the Windows downloads for a release (run by .github/workflows/release.yml on a Windows machine):
#   dist\PaleBlueDotRadio-Setup-<version>.exe     the installer
#   dist\PaleBlueDotRadio-<version>-portable.zip   the same radio, unzip anywhere and open "Pale Blue Dot Radio.exe"
# The app is its own program (Electron), not a browser window: "Pale Blue Dot Radio.exe" shows the radio and runs the
# helper (server.js) with its built-in Node. Its voices are made on the PC: Kokoro (kokoro-js, only the two voices the
# table in server.js uses: am_echo = Astro, af_heart = Luna) and Piper (the Arabic news, ar_JO-kareem-medium). The
# speech models themselves are downloaded by the installer (or by the app on its first start).
param([string]$Version = "0.0.0", [string]$ElectronVersion = "44.10.0", [string]$KokoroVersion = "1.2.1", [string]$RceditVersion = "2.0.0",
      [string]$PiperRelease = "2023.11.14-2", [string]$PiperSha256 = "f3c58906402b24f3a96d92145f58acba6d86c9b5db896d207f78dc80811efcea")
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$Version = $Version -replace '^v', ''
$stage = Join-Path $root "stage\PaleBlueDotRadio"
$dist = Join-Path $root "dist"
$tmp = $env:RUNNER_TEMP; if (-not $tmp) { $tmp = [IO.Path]::GetTempPath() }
Remove-Item -Recurse -Force (Join-Path $root "stage"), $dist -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $stage, $dist | Out-Null
$exeName = "Pale Blue Dot Radio.exe"

# 1. Electron for Windows, checked against its published checksum
$ez = "electron-v$ElectronVersion-win32-x64.zip"
$base = "https://github.com/electron/electron/releases/download/v$ElectronVersion"
Invoke-WebRequest "$base/$ez" -OutFile (Join-Path $tmp $ez)
Invoke-WebRequest "$base/SHASUMS256.txt" -OutFile (Join-Path $tmp "SHASUMS256.txt")
$want = ((Get-Content (Join-Path $tmp "SHASUMS256.txt")) | Where-Object { $_ -match [regex]::Escape($ez) + '$' } | Select-Object -First 1).Split(' ')[0]
$got = (Get-FileHash (Join-Path $tmp $ez) -Algorithm SHA256).Hash.ToLower()
if ($want -ne $got) { throw "Electron download did not match its checksum" }
Expand-Archive (Join-Path $tmp $ez) -DestinationPath $stage -Force
Rename-Item (Join-Path $stage "electron.exe") $exeName
Remove-Item (Join-Path $stage "resources\default_app.asar") -ErrorAction SilentlyContinue
Get-ChildItem (Join-Path $stage "locales") -Filter *.pak | Where-Object { $_.Name -notin @("en-US.pak", "en-GB.pak", "fr.pak", "ar.pak") } | Remove-Item   # English is the radio's language; the rest only for Windows dialogs
Rename-Item (Join-Path $stage "LICENSE") "ELECTRON-LICENSE.txt"

# 2. The app's own code (desktop\), the name and icon on the exe
New-Item -ItemType Directory -Force (Join-Path $stage "resources\app") | Out-Null
Copy-Item (Join-Path $root "desktop\main.js"), (Join-Path $root "desktop\package.json") (Join-Path $stage "resources\app")
$rcedit = Join-Path $tmp "rcedit.exe"
Invoke-WebRequest "https://github.com/electron/rcedit/releases/download/v$RceditVersion/rcedit-x64.exe" -OutFile $rcedit
$num = ($Version -replace '[^\d.]', '') ; if (-not $num) { $num = "0.0.0" }
& $rcedit (Join-Path $stage $exeName) --set-icon (Join-Path $PSScriptRoot "icon.ico") --set-version-string "ProductName" "Pale Blue Dot Radio" --set-version-string "FileDescription" "Pale Blue Dot Radio" --set-version-string "CompanyName" "Pale Blue Dot" --set-version-string "OriginalFilename" $exeName --set-file-version $num --set-product-version $num
if ($LASTEXITCODE -ne 0) { throw "rcedit failed" }

# 3. Astro's and Luna's voices: kokoro-js and what it needs on Windows, nothing else
$kd = Join-Path $tmp "kokoro"
New-Item -ItemType Directory -Force $kd | Out-Null
Push-Location $kd
'{ "name": "pbd-voices", "version": "1.0.0", "private": true }' | Set-Content package.json -Encoding UTF8
npm install "kokoro-js@$KokoroVersion" --omit=dev --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
Pop-Location
$nm = Join-Path $kd "node_modules"
Remove-Item -Recurse -Force (Join-Path $nm "onnxruntime-web"), (Join-Path $nm "@img"), (Join-Path $nm "sharp") -ErrorAction SilentlyContinue
Get-ChildItem (Join-Path $nm "onnxruntime-node\bin\napi-v3") -Directory | Where-Object { $_.Name -ne "win32" } | Remove-Item -Recurse -Force
Get-ChildItem (Join-Path $nm "onnxruntime-node\bin\napi-v3\win32") -Directory | Where-Object { $_.Name -ne "x64" } | Remove-Item -Recurse -Force
Get-ChildItem (Join-Path $nm "@huggingface\transformers\dist") -File | Where-Object { $_.Name -ne "transformers.node.cjs" } | Remove-Item -Force
Remove-Item -Recurse -Force (Join-Path $nm "@huggingface\transformers\.cache") -ErrorAction SilentlyContinue
# only the voices the table in server.js uses (VOICES: h and s)
Get-ChildItem (Join-Path $nm "kokoro-js\voices") -Filter *.bin | Where-Object { $_.Name -notin @("am_echo.bin", "af_heart.bin") } | Remove-Item -Force
# transformers loads an image library at start that the voices never use: a small stand-in instead (about 20 MB less)
New-Item -ItemType Directory -Force (Join-Path $nm "sharp") | Out-Null
'{ "name": "sharp", "version": "0.0.0-stub", "main": "index.js" }' | Set-Content (Join-Path $nm "sharp\package.json") -Encoding UTF8
'module.exports = () => { throw new Error("images are not used here"); };' | Set-Content (Join-Path $nm "sharp\index.js") -Encoding UTF8
Copy-Item $nm (Join-Path $stage "node_modules") -Recurse

# 4. The Arabic news voice: the official Piper program for Windows (with espeak-ng-data and libtashkeel, which adds
#    the Arabic vowel marks before reading), pinned and checked
$pz = Join-Path $tmp "piper_windows_amd64.zip"
Invoke-WebRequest "https://github.com/rhasspy/piper/releases/download/$PiperRelease/piper_windows_amd64.zip" -OutFile $pz
if ((Get-FileHash $pz -Algorithm SHA256).Hash.ToLower() -ne $PiperSha256) { throw "Piper download did not match its checksum" }
Expand-Archive $pz -DestinationPath $stage -Force   # -> stage\piper\piper.exe, espeak-ng-data\, libtashkeel_model.ort
if (-not (Test-Path (Join-Path $stage "piper\libtashkeel_model.ort"))) { throw "this Piper has no Arabic vowel marks (libtashkeel)" }

# 5. The helper, and the radio's page with every file listed in files.json
New-Item -ItemType Directory -Force (Join-Path $stage "public") | Out-Null
Copy-Item (Join-Path $root "server.js") $stage
$files = (Get-Content (Join-Path $root "files.json") -Raw | ConvertFrom-Json).files.PSObject.Properties.Name
foreach ($f in $files) { Copy-Item (Join-Path $root $f) (Join-Path $stage "public") }
Copy-Item (Join-Path $root "files.json") (Join-Path $stage "public")

# 6. Where it updates itself from, the icon, and a short note
[IO.File]::WriteAllText((Join-Path $stage "cloud.json"), '{ "appUrl": "https://yisyphus.github.io/pale-blue-dot/" }', (New-Object Text.UTF8Encoding $false))
Copy-Item (Join-Path $PSScriptRoot "icon.ico") $stage
@"
Pale Blue Dot Radio $Version

Open "Pale Blue Dot Radio.exe" to start the radio, in its own window. It keeps playing when the window is minimized.
Astro's and Luna's voices (Kokoro) and Kareem's Arabic news voice (Piper) are made on this PC, free and offline:
the installer downloads them once (about 155 MB); without it, the first start does.
The radio updates itself from https://yisyphus.github.io/pale-blue-dot/

Sign in under Settings > Cloud sync to bring your library, favorites, lists and commercials.
Your own files are created next to this one: data\ (library on this PC), app-cache\ (updates), voice-model\ (the voices).
"@ | Set-Content (Join-Path $stage "README.txt") -Encoding UTF8

# 7. A check, before packing, that the voices load with the app's own Node, and that Piper reads Arabic with vowel marks
$env:ELECTRON_RUN_AS_NODE = "1"
& (Join-Path $stage $exeName) -e "const rq = require('module').createRequire(process.argv[1] + '/server.js'); rq('kokoro-js'); rq('@huggingface/transformers'); rq('onnxruntime-node'); console.log('voices load ok')" $stage
if ($LASTEXITCODE -ne 0) { throw "the voices do not load" }
Remove-Item Env:ELECTRON_RUN_AS_NODE
$kv = Join-Path $tmp "kareem"; New-Item -ItemType Directory -Force $kv | Out-Null
$vb = "https://huggingface.co/rhasspy/piper-voices/resolve/main/ar/ar_JO/kareem/medium/ar_JO-kareem-medium"
Invoke-WebRequest "$vb.onnx" -OutFile (Join-Path $kv "k.onnx"); Invoke-WebRequest "$vb.onnx.json" -OutFile (Join-Path $kv "k.onnx.json")
$out = Join-Path $kv "test.wav"
$psi = New-Object Diagnostics.ProcessStartInfo (Join-Path $stage "piper\piper.exe"), "--model `"$(Join-Path $kv 'k.onnx')`" --output_file `"$out`" --debug"
$psi.UseShellExecute = $false; $psi.RedirectStandardInput = $true; $psi.RedirectStandardError = $true; $psi.WorkingDirectory = Join-Path $stage "piper"
$p = [Diagnostics.Process]::Start($psi)
$w = New-Object IO.StreamWriter($p.StandardInput.BaseStream, (New-Object Text.UTF8Encoding $false)); $w.Write("أهلا بكم في نشرة الأخبار.`n"); $w.Close()
$err = $p.StandardError.ReadToEnd(); $p.WaitForExit()
if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 10000) { throw "piper did not speak: $err" }
if ($err -notmatch 'libtashkeel') { throw "piper did not add the Arabic vowel marks: $err" }
Write-Host "piper ok: $((Get-Item $out).Length) bytes, with libtashkeel"

# 8. The portable zip, and the installer (Inno Setup)
Compress-Archive -Path $stage -DestinationPath (Join-Path $dist "PaleBlueDotRadio-$Version-portable.zip") -CompressionLevel Optimal
$iscc = @("${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe", "$env:ProgramFiles\Inno Setup 6\ISCC.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $iscc) { choco install innosetup -y --no-progress | Out-Null; $iscc = "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe" }
& $iscc "/DMyVersion=$Version" "/DStage=$stage" (Join-Path $PSScriptRoot "installer.iss")
if ($LASTEXITCODE -ne 0) { throw "Inno Setup failed" }

Get-ChildItem $dist | Format-Table Name, Length
