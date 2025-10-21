@echo off
title Kill All Welding System Services

echo ========================================
echo Killing All Welding System Services
echo ========================================
echo.

echo Killing Python processes (Backend)...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul

echo Killing Node.js processes (Frontend/Admin)...
taskkill /F /IM node.exe 2>nul

echo Killing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Killing processes on port 3001...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Killing processes on port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Killing processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo All services killed successfully!
echo.
timeout /t 2 /nobreak >nul
pause

