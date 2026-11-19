; N.U Launcher XP-first image-only bootstrap. Build the x86 EXE before compiling this script.
#define AppName "N.U Launcher"
#define AppVersion "0.1.0-xp-bootstrap"
#define AppExe "NULauncher.exe"
#define ImageFile "Original reference image file for Niroo Universe (N.U).png"
[Setup]
AppId={{A7E34B13-9E2D-4F16-8F52-4B6B6F8A2D31}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher=N.U
DefaultDirName={userappdata}\N.U Launcher
DefaultGroupName=N.U Launcher
OutputDir=output
OutputBaseFilename=N.U-Launcher-XP-Setup
Compression=lzma
SolidCompression=yes
PrivilegesRequired=lowest
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#AppExe}
MinVersion=5.1.2600sp3
ArchitecturesInstallIn64BitMode=x64
[Files]
Source: "build\{#AppExe}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\assets\{#ImageFile}"; DestDir: "{app}\assets"; Flags: ignoreversion
[Icons]
Name: "{userdesktop}\N.U Launcher"; Filename: "{app}\{#AppExe}"
Name: "{userprograms}\N.U Launcher"; Filename: "{app}\{#AppExe}"
[Run]
Filename: "{app}\{#AppExe}"; Description: "Launch N.U Launcher"; Flags: postinstall nowait skipifsilent