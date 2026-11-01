
$ErrorActionPreference = "Stop"

$ROOT = $PSScriptRoot
$PYTHON = "E:\Project.1\RoadGUARD\.venv\Scripts\python.exe"

Write-Host "Starting RoadGuard AI services..." -ForegroundColor Green

# AI Backend - Port 5000
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$ROOT\backend'; & '$PYTHON' app.py"
)

# Community Backend - Port 5001
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$ROOT\backend\community-backend'; & '$PYTHON' app.py"
)

# React Frontend - Port 5173
Start-Process powershell.exe -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location -LiteralPath '$ROOT'; npm.cmd run dev -- --host 127.0.0.1"
)

Write-Host "All services launched in separate windows." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "AI Backend: http://127.0.0.1:5000"
Write-Host "Community Backend: http://127.0.0.1:5001"
