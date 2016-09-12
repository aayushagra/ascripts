copy /y nul log.txt

cd src

rem Hide the command prompt window so it doesn't stick out like a ugly sore thumb each time we start the app
rem We use a random window title so that nircmd doesn't accidentally mess up other open windows
title WEXMD5kuC4
nircmd.exe win hide ititle "WEXMD5kuC4"
@echo OFF
reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT


rem Download node.exe if it doesn't exist already
if %OS%==32BIT (
	rem echo "copying node.exe"
	copy /b/v/y .\node\node32.exe .\node.exe
	rem bitsadmin.exe /transfer "Downloading node.exe" https://nodejs.org/dist/v4.5.0/win-x86/node.exe "%cd%\node.exe"
)
if %OS%==64BIT (
	rem echo "copying node.exe"
	copy /b/v/y .\node\node64.exe .\node.exe
	rem bitsadmin.exe /transfer "Downloading node.exe" https://nodejs.org/dist/v4.5.0/win-x64/node.exe "%cd%\node.exe"
)



@echo ON

copy /y nul log.txt

start AutoHotkey.exe argo.ahk

start AutoHotkey.exe custom.ahk

call .\node_modules\.bin\electron . >> ../log.txt 2>&1