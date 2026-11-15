Unicode true
Name "N.U Launcher — XP-first preview"
OutFile "dist/N.U-Launcher-Setup-x86.exe"
InstallDir "$LOCALAPPDATA\N.U Launcher"
RequestExecutionLevel user
SetCompressor /SOLID lzma

Page directory
Page instfiles
UninstPage uninstConfirm
UninstPage instfiles

Section "Install"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File "dist\NULauncher.exe"
  File "dist\background.bmp"
  File "dist\README.txt"
  CreateDirectory "$SMPROGRAMS\N.U Launcher"
  CreateShortCut "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk" "$INSTDIR\NULauncher.exe"
  CreateShortCut "$DESKTOP\N.U Launcher.lnk" "$INSTDIR\NULauncher.exe"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NULauncher" "DisplayName" "N.U Launcher — XP-first preview"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NULauncher" "UninstallString" '"$INSTDIR\Uninstall.exe"'
SectionEnd

Section "Uninstall"
  SetShellVarContext current
  Delete "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk"
  RMDir "$SMPROGRAMS\N.U Launcher"
  Delete "$DESKTOP\N.U Launcher.lnk"
  Delete "$INSTDIR\NULauncher.exe"
  Delete "$INSTDIR\background.bmp"
  Delete "$INSTDIR\README.txt"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NULauncher"
SectionEnd
