
@echo OFF

reg Query "HKLM\Hardware\Description\System\CentralProcessor\0" | find /i "x86" > NUL && set OS=32BIT || set OS=64BIT

if not exist "%cd%\node.exe" (
	rem Download node.exe if it doesn't exist already
	if %OS%==32BIT (
		echo "Downloading node.exe"
		bitsadmin.exe /transfer "Downloading node.exe" https://nodejs.org/dist/v4.5.0/win-x86/node.exe "%cd%\node.exe"
	)
	if %OS%==64BIT (
		echo "Downloading node.exe"
		bitsadmin.exe /transfer "Downloading node.exe" https://nodejs.org/dist/v4.5.0/win-x64/node.exe "%cd%\node.exe"
	)
)


@echo ON

call npm install

pause