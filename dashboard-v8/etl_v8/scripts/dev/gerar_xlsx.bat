@echo off
title Gerador de XLSX sinteticos - V8

echo.
echo ========================================
echo  Gerador de XLSX sinteticos - V8
echo ========================================
echo.

:: Volta para a pasta etl_v8 (pai de scripts\dev)
set ETL_DIR=%~dp0..\..
cd /d "%ETL_DIR%"

:: Verifica Python
echo Verificando Python...
python --version
if errorlevel 1 goto :erro_python
echo.

:: Cria venv se nao existir
if exist ".venv\" goto :venv_ok
echo [1/3] Criando ambiente virtual Python - primeira vez...
python -m venv .venv
if errorlevel 1 goto :erro_venv
echo [1/3] Venv criado.
echo.
goto :ativa_venv

:venv_ok
echo [1/3] Venv OK.
echo.

:ativa_venv
call ".venv\Scripts\activate.bat"
if errorlevel 1 goto :erro_activate

:: Instala deps se primeira vez (sentinela: pasta pandas)
if exist ".venv\Lib\site-packages\pandas\" goto :deps_ok
echo [2/3] Instalando dependencias: pandas, openpyxl, pandera...
echo        Pode demorar 1-2 minutos na primeira vez.
pip install -q -r requirements.txt
if errorlevel 1 goto :erro_deps
echo [2/3] Dependencias instaladas.
echo.
goto :rodar

:deps_ok
echo [2/3] Dependencias OK.
echo.

:rodar
echo [3/3] Gerando XLSX sinteticos em ..\dados_raw\
echo.
python scripts\dev\gerar_mock_xlsx.py
if errorlevel 1 goto :erro_run

echo.
echo ========================================
echo  Pronto. Confira ..\dados_raw\
echo ========================================
echo.
pause
exit /b 0

:erro_python
echo.
echo [ERRO] Python nao encontrado no PATH.
echo        Instale em: https://www.python.org/downloads/
echo.
pause
exit /b 1

:erro_venv
echo.
echo [ERRO] Falha ao criar ambiente virtual Python.
echo.
pause
exit /b 1

:erro_activate
echo.
echo [ERRO] Falha ao ativar o ambiente virtual.
echo        Tente apagar a pasta .venv e rodar novamente.
echo.
pause
exit /b 1

:erro_deps
echo.
echo [ERRO] Falha ao instalar dependencias.
echo        Verifique sua conexao com a internet.
echo.
pause
exit /b 1

:erro_run
echo.
echo [ERRO] Falha ao rodar o gerador de XLSX.
echo        Veja a mensagem acima para detalhes.
echo.
pause
exit /b 1
