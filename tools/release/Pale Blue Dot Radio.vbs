' Pale Blue Dot Radio: starts the helper (hidden) if it is not running yet, then opens the radio in its own window.
' The helper is PaleBlueDotHelper.exe (Node.js, renamed) running server.js from this folder, on http://localhost:8787/
Option Explicit
Dim sh, fso, dir, url, i, edge, p
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
url = "http://localhost:8787/"
sh.CurrentDirectory = dir

Function Running()
  Dim http, ok
  ok = False
  On Error Resume Next
  Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  http.setTimeouts 1000, 1000, 1000, 1000
  http.Open "GET", url & "api/ping", False
  http.Send
  If Err.Number = 0 Then
    If http.Status = 200 Then
      If InStr(http.responseText, "pale-blue-dot") > 0 Then ok = True
    End If
  End If
  Err.Clear
  On Error GoTo 0
  Running = ok
End Function

If Not Running() Then
  sh.Run """" & dir & "\PaleBlueDotHelper.exe"" """ & dir & "\server.js""", 0, False
  For i = 1 To 60
    WScript.Sleep 250
    If Running() Then Exit For
  Next
End If

' Microsoft Edge in app mode: its own small window, and Edge's natural voices (Brian, Emily, Mouna...).
' Without Edge, the radio opens in the default browser.
edge = ""
For Each p In Array("%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe", "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe", "%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe")
  If edge = "" Then
    If fso.FileExists(sh.ExpandEnvironmentStrings(p)) Then edge = sh.ExpandEnvironmentStrings(p)
  End If
Next
If edge <> "" Then
  sh.Run """" & edge & """ --app=" & url & " --window-size=440,800", 1, False
Else
  sh.Run url, 1, False
End If
