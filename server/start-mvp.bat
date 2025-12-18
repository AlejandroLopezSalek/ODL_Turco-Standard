@echo off
REM TurkAmerica MVP Quick Start Script
REM Save this as: start-mvp.bat

echo.
echo ╔═══════════════════════════════════════╗
echo ║   TurkAmerica MVP Quick Start         ║
echo ╚═══════════════════════════════════════╝
echo.

REM Check if we're in the right directory
if not exist server.js (
    echo ❌ Error: server.js not found
    echo 💡 Make sure you're in the server directory
    pause
    exit /b 1
)

REM Step 1: Check MongoDB
echo 📊 Step 1: Checking MongoDB...
net start | find "MongoDB" >nul
if errorlevel 1 (
    echo ⚠️  MongoDB is not running
    echo 🔧 Attempting to start MongoDB...
    net start MongoDB
    if errorlevel 1 (
        echo ❌ Failed to start MongoDB
        echo 💡 Install MongoDB or run it manually
        pause
        exit /b 1
    )
) else (
    echo ✅ MongoDB is running
)

REM Step 2: Check dependencies
echo.
echo 📦 Step 2: Checking dependencies...
if not exist node_modules (
    echo 📥 Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install failed
        pause
        exit /b 1
    )
) else (
    echo ✅ Dependencies installed
)

REM Step 3: Check .env
echo.
echo ⚙️  Step 3: Checking configuration...
if not exist .env (
    echo ⚠️  .env file not found
    echo 📝 Creating .env from template...
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo MONGODB_URI=mongodb://localhost:27017/turkamerica
        echo JWT_SECRET=turkamerica-mvp-secret-key-%RANDOM%%RANDOM%
    ) > .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file exists
)

REM Step 4: Start server
echo.
echo 🚀 Step 4: Starting server...
echo.
echo ═══════════════════════════════════════
echo Server starting on http://localhost:3000
echo Health check: http://localhost:3000/health
echo ═══════════════════════════════════════
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

REM If server exits
echo.
echo 🛑 Server stopped
pause