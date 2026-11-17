@echo off
setlocal
where cl.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: cl.exe not found. Open the Visual Studio 2010 x86 Developer Command Prompt.
  exit /b 1
)
if not exist build mkdir build
cl /nologo /O1 /MT /EHsc /W3 /DWINVER=0x0501 /D_WIN32_WINNT=0x0501 /DWIN32_LEAN_AND_MEAN src\main.cpp /link /SUBSYSTEM:WINDOWS,5.01 /OUT:build\NU-Launcher.exe user32.lib gdi32.lib comdlg32.lib kernel32.lib
if errorlevel 1 exit /b 1
echo Built build\NU-Launcher.exe
echo Verify on Windows XP SP3 x86 before claiming XP compatibility.
endlocal
