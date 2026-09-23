@echo off
title Perpustakaan Rapi - Game Susun Buku 3D
echo ===================================================
echo     MEMULAI GAME 3D PERPUSTAKAAN RAPI
echo ===================================================
echo Membuka game di browser anda...
start http://127.0.0.1:8080
python -m http.server 8080
pause
