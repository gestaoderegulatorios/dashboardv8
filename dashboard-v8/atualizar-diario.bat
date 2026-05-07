@echo off
title Atualizar Dashboard V8

echo.
echo ========================================================
echo  Atualizar Dashboard V8
echo  Este script faz TUDO automaticamente:
echo  [1/3] Le as planilhas Excel e gera os dados - Python
echo  [2/3] Compila o dashboard - Node.js
echo  [3/3] Publica no site - Cloudflare
echo ========================================================
echo.

:: Volta para a pasta do dashboard
cd /d "%~dp0"
echo Pasta de trabalho: %CD%
echo.

:: -------------------------------------------------------
:: PASSO 1: Rodar Python ETL
:: -------------------------------------------------------
echo --------------------------------------------------------
echo [1/3] Lendo planilhas e gerando dados...
echo --------------------------------------------------------
echo.

:: Verifica se dados_raw existe
if not exist "dados_raw" (
    echo.
    echo [ERRO] Pasta dados_raw nao encontrada em:
    echo        %CD%\dados_raw
    echo.
    echo        Coloque as planilhas XLSX dentro dessa pasta.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

:: Verifica se venv existe
if not exist "etl_v8\.venv\Scripts\python.exe" (
    echo.
    echo [ERRO] Ambiente Python - venv - nao encontrado.
    echo.
    echo        Para criar, abra um CMD e rode:
    echo        cd /d "%~dp0etl_v8"
    echo        python -m venv .venv
    echo        .venv\Scripts\pip.exe install -r requirements.txt
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

:: Roda o ETL com o python do venv
echo Rodando Python ETL...
echo.
call "etl_v8\.venv\Scripts\python.exe" "etl_v8\main.py"
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] ETL falhou. Veja a mensagem acima.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

:: Verifica se snapshot.json foi gerado
if not exist "etl_v8\output\snapshot.json" (
    echo.
    echo [ERRO] snapshot.json nao foi gerado.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo.
echo [1/3] ETL concluido! snapshot.json gerado.
echo.

:: -------------------------------------------------------
:: PASSO 2: Compilar o dashboard
:: -------------------------------------------------------
echo --------------------------------------------------------
echo [2/3] Compilando dashboard...
echo --------------------------------------------------------
echo.

:: Verifica Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Node.js nao encontrado.
    echo        Instale em: https://nodejs.org/
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

:: Verifica se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias - primeira vez...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo [ERRO] npm install falhou.
        echo.
        echo Pressione qualquer tecla para fechar...
        pause >nul
        exit /b 1
    )
)

:: Compila
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Build falhou. Veja a mensagem acima.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

:: Verifica se dist/ foi gerado
if not exist "dist\index.html" (
    echo.
    echo [ERRO] Build nao gerou dist\index.html.
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo.
echo [2/3] Dashboard compilado!
echo.

:: -------------------------------------------------------
:: PASSO 3: Publicar no Cloudflare
:: -------------------------------------------------------
echo --------------------------------------------------------
echo [3/3] Publicando no site...
echo --------------------------------------------------------
echo.

call npx wrangler pages deploy dist --project-name=dashboard-borgonovi --branch=main
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERRO] Deploy falhou. Possiveis causas:
    echo        - Sem internet
    echo        - Wrangler desatualizado. Rode: npm install wrangler -g
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo.
echo ========================================================
echo  SUCESSO! Dashboard atualizado e publicado no ar.
echo  O site esta com os dados mais recentes das planilhas.
echo ========================================================
echo.

:: Registra a data/hora da atualizacao
echo Atualizado em %date% as %time% >> atualizacao-log.txt

echo Pressione qualquer tecla para fechar...
pause >nul
exit /b 0
