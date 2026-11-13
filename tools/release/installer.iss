; Pale Blue Dot Radio installer (Inno Setup 6). Built by .github/workflows/release.yml from tools/release/build.ps1.
; Installs for the current user only (no administrator rights), in %LOCALAPPDATA%\Programs\PaleBlueDotRadio,
; the same place as before: an update keeps your data, the downloaded updates and your commercials list.
; The radio is its own program now ("Pale Blue Dot Radio.exe", Electron); the old Edge launcher is removed.

#ifndef MyVersion
  #define MyVersion "0.0.0"
#endif
#ifndef Stage
  #define Stage "..\..\stage\PaleBlueDotRadio"
#endif

[Setup]
AppId={{6B1F3C2A-5D4E-4B8F-9A7C-PALEBLUEDOT01}
AppName=Pale Blue Dot Radio
AppVersion={#MyVersion}
AppPublisher=Pale Blue Dot
DefaultDirName={localappdata}\Programs\PaleBlueDotRadio
MinVersion=10.0
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\..\dist
OutputBaseFilename=PaleBlueDotRadio-Setup-{#MyVersion}
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\Pale Blue Dot Radio.exe
CloseApplications=yes
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"

[InstallDelete]
; the launcher and helper of the older, Edge-based app
Type: files; Name: "{app}\Pale Blue Dot Radio.vbs"
Type: files; Name: "{app}\PaleBlueDotHelper.exe"
Type: files; Name: "{app}\NODE-LICENSE.txt"
Type: filesandordirs; Name: "{app}\voice-profile"

[Files]
; everything the radio needs; your own files (data, app-cache, voice-model, ads-playlist.json) are never touched
Source: "{#Stage}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; the voices, downloaded by the installer so the radio speaks from the very first start (Kokoro for Astro and Luna,
; Piper's Kareem for the Arabic news). If the download fails (no internet), the app downloads them itself later.
Source: "{tmp}\model_quantized.onnx"; DestDir: "{app}\voice-model\onnx-community\Kokoro-82M-v1.0-ONNX\onnx"; Flags: external skipifsourcedoesntexist ignoreversion
Source: "{tmp}\config.json"; DestDir: "{app}\voice-model\onnx-community\Kokoro-82M-v1.0-ONNX"; Flags: external skipifsourcedoesntexist ignoreversion
Source: "{tmp}\tokenizer.json"; DestDir: "{app}\voice-model\onnx-community\Kokoro-82M-v1.0-ONNX"; Flags: external skipifsourcedoesntexist ignoreversion
Source: "{tmp}\tokenizer_config.json"; DestDir: "{app}\voice-model\onnx-community\Kokoro-82M-v1.0-ONNX"; Flags: external skipifsourcedoesntexist ignoreversion
Source: "{tmp}\ar_JO-kareem-medium.onnx"; DestDir: "{app}\voice-model\piper"; Flags: external skipifsourcedoesntexist ignoreversion
Source: "{tmp}\ar_JO-kareem-medium.onnx.json"; DestDir: "{app}\voice-model\piper"; Flags: external skipifsourcedoesntexist ignoreversion

[Icons]
Name: "{userprograms}\Pale Blue Dot Radio"; Filename: "{app}\Pale Blue Dot Radio.exe"; WorkingDir: "{app}"
Name: "{userdesktop}\Pale Blue Dot Radio"; Filename: "{app}\Pale Blue Dot Radio.exe"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\Pale Blue Dot Radio.exe"; Description: "Open Pale Blue Dot Radio"; Flags: postinstall nowait skipifsilent

[UninstallDelete]
; the downloaded voices and updates go with the app (your library in data\ stays, in case you install it again)
Type: filesandordirs; Name: "{app}\voice-model"
Type: filesandordirs; Name: "{app}\app-cache"

[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -WindowStyle Hidden -Command ""try {{ Invoke-WebRequest http://127.0.0.1:8787/api/quit -UseBasicParsing -TimeoutSec 3 | Out-Null }} catch {{}}"""; Flags: runhidden; RunOnceId: "StopHelper"

[Code]
const
  KokoroBase = 'https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/1939ad2a8e416c0acfeecc08a694d14ef25f2231/';
  KareemBase = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/ar/ar_JO/kareem/medium/';
var
  DownloadPage: TDownloadWizardPage;

procedure InitializeWizard;
begin
  DownloadPage := CreateDownloadPage('Getting the voices', 'Downloading Astro''s, Luna''s and the news voices, once (about 155 MB). This can take a few minutes on a slow Wi-Fi.', nil);
end;

function HaveKokoro: Boolean;
begin
  Result := FileExists(ExpandConstant('{app}\voice-model\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_quantized.onnx'));
end;

function HaveKareem: Boolean;
begin
  Result := FileExists(ExpandConstant('{app}\voice-model\piper\ar_JO-kareem-medium.onnx'));
end;

// After "Install" is pressed: the voices first (each skipped when an earlier install already has it)
function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if (CurPageID = wpReady) and not (HaveKokoro and HaveKareem) then begin
    DownloadPage.Clear;
    if not HaveKokoro then begin
      DownloadPage.Add(KokoroBase + 'config.json', 'config.json', 'df34b4f930b23447cd4dc410fabfb42eb3f24e803e6c3f97d618fb359380a36f');
      DownloadPage.Add(KokoroBase + 'tokenizer.json', 'tokenizer.json', '77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34');
      DownloadPage.Add(KokoroBase + 'tokenizer_config.json', 'tokenizer_config.json', 'be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20');
      DownloadPage.Add(KokoroBase + 'onnx/model_quantized.onnx', 'model_quantized.onnx', 'fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478');
    end;
    if not HaveKareem then begin
      DownloadPage.Add(KareemBase + 'ar_JO-kareem-medium.onnx.json', 'ar_JO-kareem-medium.onnx.json', 'ea6d9b9d9076dbdb6bf5c98c6a141ef154959d2359709b37855727964e7d6c4d');
      DownloadPage.Add(KareemBase + 'ar_JO-kareem-medium.onnx', 'ar_JO-kareem-medium.onnx', '9e95cab07b679da603bba17c4dec7ab3111320571964ee95c0379603c086491e');
    end;
    DownloadPage.Show;
    try
      try
        DownloadPage.Download;
      except
        // no internet or the download stopped: install anyway, the app gets the voices itself on its first start
        Log('Voices not downloaded: ' + GetExceptionMessage);
      end;
    finally
      DownloadPage.Hide;
    end;
  end;
end;

// Before installing over a running radio: ask its helper to stop, so its files can be replaced
function PrepareToInstall(var NeedsRestart: Boolean): String;
var
  Code: Integer;
begin
  Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'),
    '-NoProfile -WindowStyle Hidden -Command "try { Invoke-WebRequest http://127.0.0.1:8787/api/quit -UseBasicParsing -TimeoutSec 3 | Out-Null } catch {}; Start-Sleep -Milliseconds 800"',
    '', SW_HIDE, ewWaitUntilTerminated, Code);
  Result := '';
end;
