Unicode true
Name "N.U Launcher 0.1"
OutFile "..\\..\\N.U-Launcher-Setup-0.1.exe"
InstallDir "$APPDATA\N.U Launcher"
RequestExecutionLevel user
SetCompressor zlib
ShowInstDetails show
ShowUninstDetails show

Page directory
Page instfiles
UninstPage uninstConfirm
UninstPage instfiles

Section "N.U Launcher"
  SetOutPath "$INSTDIR"
  File "build\NULauncher.exe"
  File "build\launcher-background.bmp"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateDirectory "$SMPROGRAMS\N.U Launcher"
  CreateShortcut "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk" "$INSTDIR\NULauncher.exe"
  CreateShortcut "$DESKTOP\N.U Launcher.lnk" "$INSTDIR\NULauncher.exe"
SectionEnd

Section "Uninstall"
  Delete "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk"
  RMDir "$SMPROGRAMS\N.U Launcher"
  Delete "$DESKTOP\N.U Launcher.lnk"
  Delete "$INSTDIR\NULauncher.exe"
  Delete "$INSTDIR\launcher-background.bmp"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
SectionEnd
