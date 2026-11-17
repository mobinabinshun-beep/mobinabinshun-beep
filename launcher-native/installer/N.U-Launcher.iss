#define MyAppName "N.U Launcher"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "N.U — Niroo Universe"
#define MyAppExeName "NU-Launcher.exe"

[Setup]
AppId={{D74C3D12-86B8-4D2D-9A21-7B2A4E0A9137}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={localappdata}\Programs\N.U Launcher
DefaultGroupName=N.U Launcher
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=..\build
OutputBaseFilename=N.U-Launcher-Setup-0.1.0
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayIcon={app}\{#MyAppExeName}
ArchitecturesAllowed=x86 x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Files]
Source: "..\build\NU-Launcher.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\build\README.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\build\samples\*"; DestDir: "{app}\samples"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\N.U Launcher"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\N.U Launcher"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Launch N.U Launcher"; Flags: postinstall nowait skipifsilent
