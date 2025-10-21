@echo off
title Welding System - Kill and Restart All Services

echo ========================================
echo Welding System - Kill and Restart
echo ========================================
echo.

REM ========================================
REM Step 1: Kill all existing processes
REM ========================================
echo [Step 1/4] Killing existing processes...
echo.

REM Kill Python processes (Backend)
echo Killing Python/Uvicorn processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM pythonw.exe 2>nul
timeout /t 1 /nobreak >nul

REM Kill Node processes (Frontend/Admin)
echo Killing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul

REM Kill processes on specific ports
echo Killing processes on ports 3000, 3001, 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
timeout /t 2 /nobreak >nul

echo All processes killed successfully!
echo.

REM ========================================
REM Step 2: Wait for ports to be released
REM ========================================
echo [Step 2/4] Waiting for ports to be released...
timeout /t 3 /nobreak >nul
echo Ports released!
echo.

REM ========================================
REM Step 3: Start Backend Service
REM ========================================
echo [Step 3/4] Starting Backend API on port 8000...
cd /d "%~dp0backend"
start "Backend API - Port 8000 - FIXED" cmd /k "python -m uvicorn app.main:app --host localhost --port 8000 --reload"
echo Backend starting... waiting 8 seconds...
timeout /t 8 /nobreak >nul
echo.

REM ========================================
REM Step 4: Start Frontend Services
REM ========================================
echo [Step 4/4] Starting Frontend services...
echo.

REM Start User Portal
echo Starting User Portal on port 3000...
cd /d "%~dp0frontend"
start "User Portal - Port 3000" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

REM Start Admin Portal (optional)
echo Starting Admin Portal on port 3001...
cd /d "%~dp0admin-portal"
start "Admin Portal - Port 3001" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo All Services Started Successfully!
echo ========================================
echo.
echo Access URLs:
echo   User Portal:   http://localhost:3000
echo   Admin Portal:  http://localhost:3001
echo   Backend API:   http://localhost:8000
echo   API Docs:      http://localhost:8000/docs
echo.
echo IMPORTANT:
echo   - Backend has latest fixes applied
echo   - Wait 10-15 seconds for all services to fully start
echo   - Check each window for any errors
echo   - Close each window to stop the service
echo.
echo ========================================
echo.
pause

