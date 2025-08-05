@echo off
echo 🚀 Preparing URL Shortener for Render deployment...

REM Check if git is initialized
if not exist ".git" (
    echo ❌ Git repository not found. Please initialize git first:
    echo    git init
    echo    git remote add origin YOUR_GITHUB_REPO_URL
    pause
    exit /b 1
)

REM Check if .env file exists and warn about sensitive data
if exist ".env" (
    echo ⚠️  Warning: .env file contains sensitive data
    echo    Make sure .env is in .gitignore before pushing
    echo    Environment variables will be set in Render dashboard
    set /p continue="Continue? (y/n): "
    if /i not "%continue%"=="y" (
        exit /b 1
    )
)

REM Add all files
echo 📁 Adding files to git...
git add .

REM Commit changes
echo 💾 Committing changes...
git commit -m "🚀 Ready for Render deployment - %date% %time%"

REM Push to GitHub
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub successfully!
echo.
echo 🌐 Next steps:
echo 1. Go to https://render.com
echo 2. Sign up/Login with GitHub
echo 3. Click "New +" → "Web Service"
echo 4. Connect your repository
echo 5. Configure environment variables:
echo    - NODE_ENV=production
echo    - PORT=10000
echo    - BASE_URL=https://your-app-name.onrender.com
echo    - MONGODB_URI_0=your_mongodb_uri
echo    - REDIS_URL=your_redis_url
echo.
echo 📖 See DEPLOYMENT.md for detailed instructions
echo.
echo 🎉 Happy deploying!
pause 