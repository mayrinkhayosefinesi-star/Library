@echo off
title Perpustakaan Rapi - Game Susun Buku 3D
echo ===================================================
echo     MEMULAI GAME PERPUSTAKAAN RAPI (3D FIRST-PERSON)
echo ===================================================
echo Membuka game di browser anda...
start play.html
start http://127.0.0.1:8080/play.html
python -m http.server 8080
pause
