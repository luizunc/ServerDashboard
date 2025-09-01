@echo off
echo.
echo ========================================
echo    HYPEMC - Dashboard Minecraft
echo ========================================
echo.
echo Iniciando dashboard automaticamente...
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js não encontrado!
    echo Instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se as dependências estão instaladas
if not exist "node_modules" (
    echo Instalando dependências...
    npm install
    if %errorlevel% neq 0 (
        echo Erro ao instalar dependências!
        pause
        exit /b 1
    )
)

echo Dependências instaladas!
echo.
echo Iniciando servidor e dashboard...
echo.
echo Dashboard: http://localhost:3000
echo API: http://localhost:5000
echo.
echo Pressione Ctrl+C para parar
echo.

REM Iniciar o projeto
npm run dev

pause 