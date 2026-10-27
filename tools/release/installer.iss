; Pale Blue Dot Radio installer (Inno Setup 6). Built by .github/workflows/release.yml from tools/release/build.ps1.
; Installs for the current user only (no administrator rights), in %LOCALAPPDATA%\Programs\PaleBlueDotRadio,
; the same place as before: an update keeps your data, the downloaded updates and your commercials list.

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
DisableDirPage=yes
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\..\dist
OutputBaseFilename=PaleBlueDotRadio-Setup-{#MyVersion}
SetupIconFile=icon.ico
UninstallDisplayIcon={app}\icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Shortcuts:"

[Files]
; everything the radio needs; your own files (data, app-cache, ads-playlist.json) are never touched
Source: "{#Stage}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{userprograms}\Pale Blue Dot Radio"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Pale Blue Dot Radio.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"
Name: "{userdesktop}\Pale Blue Dot Radio"; Filename: "{sys}\wscript.exe"; Parameters: """{app}\Pale Blue Dot Radio.vbs"""; WorkingDir: "{app}"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon

[Run]
Filename: "{sys}\wscript.exe"; Parameters: """{app}\Pale Blue Dot Radio.vbs"""; Description: "Open Pale Blue Dot Radio"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -WindowStyle Hidden -Command ""try {{ Invoke-WebRequest http://127.0.0.1:8787/api/quit -UseBasicParsing -TimeoutSec 3 | Out-Null }} catch {{}}"""; Flags: runhidden; RunOnceId: "StopHelper"

[Code]
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
