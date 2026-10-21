@echo off
chcp 65001 >nul 2>&1

REM ============================================
REM  配置区 - 如需修改端口或启动命令，请改这里
REM ============================================
set "DEV_PORT=5173"
set "DEV_COMMAND=npm run dev"
REM ============================================

cd /d "%~dp0"

echo ========================================
echo   校园一站式 APP 开发服务器启动脚本
echo ========================================
echo.

REM --- 检查 Node.js ---
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js，请先安装。
    echo 下载地址 https://nodejs.org/
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do echo [√] Node.js 版本 %%v

REM --- 检查 npm ---
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm，请重新安装 Node.js。
    echo.
    pause
    exit /b 1
)
for /f "delims=" %%v in ('npm -v') do echo [√] npm 版本 %%v

REM --- 检查 package.json ---
if not exist "package.json" (
    echo [错误] 未找到 package.json，请确认脚本在项目根目录。
    echo.
    pause
    exit /b 1
)
echo [√] 已找到 package.json

REM --- 检查并安装依赖 ---
if not exist "node_modules" (
    echo.
    echo [!] 首次运行，正在安装依赖...
    echo     这可能需要几分钟，请耐心等待。
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [错误] 依赖安装失败，请检查网络后重试。
        echo.
        pause
        exit /b 1
    )
    echo [√] 依赖安装完成
) else (
    echo [√] 依赖已就绪
)

echo.
echo ========================================
echo   正在启动开发服务器...
echo   端口 %DEV_PORT%  命令 %DEV_COMMAND%
echo ========================================
echo.

REM --- 在独立窗口启动服务器 ---
start "开发服务器 - 请勿关闭" cmd /k "%DEV_COMMAND%"

REM --- 等待端口就绪 ---
echo 正在等待服务器就绪，最多 30 秒...
set /a COUNT=0

:CHECK_PORT
powershell -NoProfile -Command "try{(New-Object System.Net.Sockets.TcpClient('localhost',%DEV_PORT%)).Close();exit 0}catch{exit 1}" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo [√] 服务器已就绪，正在打开浏览器...
    goto :OPEN_BROWSER
)
set /a COUNT+=1
if %COUNT% geq 30 (
    echo.
    echo [!] 等待超时，仍尝试打开浏览器...
    echo     如页面无法访问，请查看服务器窗口的实际端口。
    goto :OPEN_BROWSER
)
set /a MOD=COUNT%%5
if %MOD% equ 0 echo     已等待 %COUNT% 秒...
timeout /t 1 /nobreak >nul 2>&1
goto :CHECK_PORT

:OPEN_BROWSER
start "" "http://localhost:%DEV_PORT%"

echo.
echo ========================================
echo   启动完成
echo ========================================
echo.
echo  使用说明：
echo   1. 浏览器应已打开，地址 http://localhost:%DEV_PORT%
echo   2. 「开发服务器 - 请勿关闭」窗口是服务器进程
echo   3. 不要关闭服务器窗口，关闭后网页将失效
echo   4. 端口不对：改本脚本顶部的 DEV_PORT
echo   5. 启动命令不对：改本脚本顶部的 DEV_COMMAND
echo   6. 首次安装依赖较慢，后续启动很快
echo.
echo  按任意键关闭此窗口，服务器不受影响...
pause >nul