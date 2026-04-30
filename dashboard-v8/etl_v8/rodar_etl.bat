@echo off
title Pipeline ETL V8

echo.
echo ========================================
echo  Pipeline ETL V8 [E3]
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando Python...
python --version
if errorlevel 1 goto :erro_python
echo.

if not exist ".venv\" goto :sem_venv

call ".venv\Scripts\activate.bat"
if errorlevel 1 goto :erro_activate

echo Rodando ETL...
echo.
python main.py
if errorlevel 1 goto :erro_run

echo.
pause
exit /b 0

:sem_venv
echo [ERRO] venv nao encontrado.
echo Rode primeiro: gerar_xlsx.bat
echo.
pause
exit /b 1

:erro_python
echo [ERRO] Python nao encontrado no PATH.
echo Instale em: https://www.python.org/downloads/
echo.
pause
exit /b 1

:erro_activate
echo [ERRO] Falha ao ativar venv.
echo.
pause
exit /b 1

:erro_run
echo.
echo [ERRO] ETL falhou. Veja a mensagem acima para detalhes.
echo.
pause
exit /b 1
