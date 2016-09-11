rem Hide the command prompt window so it doesn't stick out like a ugly sore thumb each time we start the app
copy /y nul log.txt
title ascripts
nircmd.exe win hide ititle "ascripts"

start AutoHotkey.exe argo.ahk

start AutoHotkey.exe custom.ahk

call .\node_modules\.bin\electron . >> log.txt 2>&1 