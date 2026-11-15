Unicode true
!ifndef APP_VERSION
!define APP_VERSION "0.1.0"
!endif
Name "N.U Launcher \${APP_VERSION}"
OutFile "dist\N.U-Launcher-Setup-\${APP_VERSION}-x86.exe"
InstallDir "$LOCALAPPDATA\N.U Launcher"
InstallDirRegKey HKCU "Software\N.U Launcher" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID lzma
ShowInstDetails show
ShowUninstDetails show
Page directory
Page instfiles
UninstPage uninstConfirm
UninstPage instfiles
Section "Install"
  SetOutPath "$INSTDIR"
  File /r "dist\payload\*.*"
  WriteRegStr HKCU "Software\N.U Launcher" "InstallDir" "$INSTDIR"
  CreateDirectory "$SMPROGRAMS\N.U Launcher"
  CreateShortCut "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk" "$INSTDIR\N.U Launcher.exe"
  CreateShortCut "$DESKTOP\N.U Launcher.lnk" "$INSTDIR\N.U Launcher.exe"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
Section "Uninstall"
  Delete "$DESKTOP\N.U Launcher.lnk"
  Delete "$SMPROGRAMS\N.U Launcher\N.U Launcher.lnk"
  RMDir "$SMPROGRAMS\N.U Launcher"
  DeleteRegKey HKCU "Software\N.U Launcher"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir /r "$INSTDIR"
SectionEnd