@echo OFF
copy /y nul log.txt

cd src

rem Hide the command prompt window so it doesn't stick out like a ugly sore thumb each time we start the app
rem We use a random window title so that nircmd doesn't accidentally mess up other open windows

@echo ON
title WEXMD5kuC4
nircmd.exe win hide ititle "WEXMD5kuC4"

copy /y nul log.txt

start AutoHotkey.exe argo.ahk

start AutoHotkey.exe custom.ahk

call .\node_modules\.bin\electron . >> ../log.txt 2>&1