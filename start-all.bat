@echo off
title Medcine Solution - Lanceur Complet
echo ====================================================
echo  Lancement de l'application Medcine Solution
echo ====================================================

:: 1. Verifier et demarrer MySQL XAMPP (Port 3307)
echo [1/3] Verification de MySQL (Port 3307)...
netstat -ano | findstr ":3307" >nul 2>&1
if errorlevel 1 (
    echo Demarrage de MySQL XAMPP...
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "" /B "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
        timeout /t 3 /nobreak >nul
    ) else (
        echo [ATTENTION] MySQL XAMPP non trouve dans C:\xampp\mysql\bin\
    )
) else (
    echo MySQL est deja actif sur le port 3307.
)

:: 2. Demarrer le Backend PHP sur le port 8000
echo [2/3] Lancement du Backend PHP sur http://127.0.0.1:8000...
if exist "C:\xampp\php\php.exe" (
    start "Backend PHP - Medcine Solution" cmd /k "cd /d %~dp0 && C:\xampp\php\php.exe -S 127.0.0.1:8000 -t backend backend/router.php"
) else (
    start "Backend PHP - Medcine Solution" cmd /k "cd /d %~dp0 && php -S 127.0.0.1:8000 -t backend backend/router.php"
)

:: 3. Demarrer le Frontend React sur le port 3000
echo [3/3] Lancement du Frontend React sur http://localhost:3000...
start "Frontend React - Medcine Solution" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ====================================================
echo  Tous les services ont ete demarres avec succes !
echo  - Frontend React : http://localhost:3000
echo  - Backend API PHP: http://127.0.0.1:8000
echo ====================================================
timeout /t 5 >nul
exit
