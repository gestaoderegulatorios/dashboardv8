@echo off
title Dashboard V8

echo.
echo ========================================
echo Dashboard V8
echo Iniciando servidor...
echo ========================================
echo.

:: Verifica se Node.js esta instalado
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale em: https://nodejs.org/
    echo Baixe a versao LTS e instale.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado.
echo.

:: Verifica se node_modules existe, senao instala
if not exist "node_modules\" (
    echo [1/2] Instalando dependencias (primeira vez)...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
    echo [1/2] Dependencias instaladas.
    echo.
) else (
    echo [1/2] Dependencias OK. Pulando install.
    echo.
)

:: Verifica se o build existe, senao compila
if not exist "dist\index.html" (
    echo [2/2] Compilando dashboard (primeira vez)...
    call npm run build
    if %ERRORLEVEL% neq 0 (
        echo [ERRO] Falha ao compilar.
        pause
        exit /b 1
    )
    echo [2/2] Dashboard compilado.
    echo.
) else (
    echo [2/2] Build OK. Pulando compilacao.
    echo.
)

:: Abre o browser
echo Abrindo navegador...
start http://localhost:4173

:: Sobe o servidor de preview
echo.
echo Servidor rodando em: http://localhost:4173
echo Pressione Ctrl+C para parar.
echo.
call npm run preview
