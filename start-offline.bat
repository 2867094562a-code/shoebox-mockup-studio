@echo off
setlocal
cd /d "%~dp0"
set PORT=8124
echo Starting offline shoebox mockup server on http://127.0.0.1:%PORT%/
start "" http://127.0.0.1:%PORT%/
python -m http.server %PORT% --bind 127.0.0.1
pause
