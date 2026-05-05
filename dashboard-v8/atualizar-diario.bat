@echo off
title Atualizar Dashboard V8
chcp 65001 >nul

echo.
echo ══════════════════════════════════════════════════
echo   Atualizar Dashboard V8 — Atualizacao Automatica
echo ══════════════════════════════════════════════════
echo.

:: Volta para a pasta do dashboard (onde este .bat esta)
cd /d "%~dp0"

:: ─── PASSO 1: Rodar Python ETL ───────────────────────────
echo [1/3] Lendo planilhas e gerando dados...
echo.

cd etl_v8

:: Verifica Python
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Python nao encontrado.
    echo Instale em: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

:: Ativa venv se existe
if exist ".venv\Scripts\activate.bat" (
    call ".venv\Scripts\activate.bat"
)

:: Roda o ETL
python main.py
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] ETL falhou. Verifique as planilhas.
    echo.
    pause
    exit /b 1
)

echo.
echo [1/3] ETL concluido com sucesso.
echo.

cd /d "%~dp0"

:: ─── PASSO 2: Compilar o dashboard ───────────────────────
echo [2/3] Compilando dashboard...

:: Verifica Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao encontrado.
    echo Instale em: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Copia snapshot + build
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Build falhou.
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Dashboard compilado com sucesso.
echo.

:: ─── PASSO 3: Publicar no Cloudflare ─────────────────────
echo [3/3] Publicando no site...

call npx wrangler pages deploy dist --project-name=dashboard-borgonovi --branch=main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Deploy falhou. Verifique internet e Wrangler.
    echo.
    pause
    exit /b 1
)

echo.
echo ══════════════════════════════════════════════════
echo   SUCESSO! Dashboard atualizado e publicado.
echo   O site esta no ar com os dados mais recentes.
echo ══════════════════════════════════════════════════
echo.

:: Registra a data/hora da atualizacao
echo Atualizado em %date% as %time% >> atualizacao-log.txt

pause
exit /b 0
