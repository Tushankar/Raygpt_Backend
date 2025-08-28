@echo off
echo Setting up RayGPT Server...

echo.
echo Installing Node.js dependencies...
npm install

echo.
echo Checking environment variables...
if not exist .env (
    echo WARNING: .env file not found. Please copy .env.example to .env and configure your environment variables.
) else (
    echo .env file found.
)

echo.
echo Initializing Firebase database...
npm run init-db

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Configure your .env file with production values
echo 2. For development: npm run dev
echo 3. For production: npm start
echo.
echo See README.md for detailed deployment instructions.

pause
