@echo off
chcp 65001 >nul
REM ========================================
REM 上传代码到服务器脚本 (批处理)
REM ========================================

echo ========================================
echo 上传代码到腾讯云服务器
echo ========================================
echo.

REM 服务器信息
set SERVER_IP=43.142.188.252
set SERVER_USER=root
set PROJECT_DIR=/root/welding-system

echo 服务器 IP: %SERVER_IP%
echo 项目目录: %PROJECT_DIR%
echo.

REM 步骤 1: 在服务器上创建项目目录
echo ========================================
echo 步骤 1: 在服务器上创建项目目录
echo ========================================
echo.

echo 正在连接服务器...
ssh %SERVER_USER%@%SERVER_IP% "mkdir -p %PROJECT_DIR%"

if %errorlevel% neq 0 (
    echo [错误] 无法连接到服务器，请检查:
    echo   1. 服务器 IP 是否正确
    echo   2. SSH 端口 22 是否开放
    echo   3. 是否有 SSH 密钥或密码
    pause
    exit /b 1
)

echo [成功] 项目目录创建成功: %PROJECT_DIR%
echo.

REM 步骤 2: 上传代码
echo ========================================
echo 步骤 2: 上传代码到服务器
echo ========================================
echo.

echo 正在上传文件，请稍候...
echo 这可能需要几分钟时间，取决于网络速度
echo.

REM 使用 scp 上传整个项目目录
scp -r . %SERVER_USER%@%SERVER_IP%:%PROJECT_DIR%/

if %errorlevel% neq 0 (
    echo [错误] 代码上传失败
    pause
    exit /b 1
)

echo.
echo [成功] 代码上传成功！
echo.

REM 步骤 3: 设置脚本执行权限
echo ========================================
echo 步骤 3: 设置脚本执行权限
echo ========================================
echo.

echo 正在设置执行权限...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && chmod +x deploy.sh create_default_admin.sh"

if %errorlevel% neq 0 (
    echo [警告] 执行权限设置失败
) else (
    echo [成功] 执行权限设置成功
)
echo.

REM 完成
echo ========================================
echo 上传完成！
echo ========================================
echo.

echo 项目已上传到: %SERVER_USER%@%SERVER_IP%:%PROJECT_DIR%
echo.

echo 下一步操作:
echo 1. SSH 登录服务器:
echo    ssh %SERVER_USER%@%SERVER_IP%
echo.
echo 2. 进入项目目录:
echo    cd %PROJECT_DIR%
echo.
echo 3. 运行部署脚本:
echo    ./deploy.sh
echo.

echo 或者直接运行以下命令一键部署:
echo ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && ./deploy.sh"
echo.

REM 询问是否立即部署
set /p DEPLOY="是否现在就开始部署？(y/n): "

if /i "%DEPLOY%"=="y" (
    echo.
    echo ========================================
    echo 开始部署...
    echo ========================================
    echo.
    
    REM 运行部署脚本
    ssh -t %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && ./deploy.sh"
) else (
    echo.
    echo 稍后可以手动运行部署脚本
    echo.
)

echo 完成！
pause

