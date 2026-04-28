Write-Host "Stopping all backend services (Java processes)..." -ForegroundColor Yellow
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Closing related PowerShell windows..." -ForegroundColor Yellow
Get-CimInstance Win32_Process -Filter "Name = 'powershell.exe'" | Where-Object { $_.CommandLine -match "mvn spring-boot:run" } | Invoke-CimMethod -MethodName Terminate

Write-Host "All backend services have been stopped!" -ForegroundColor Green

# Uncomment the following lines if you also want to stop the frontend (Node.js)
# Write-Host "Stopping frontend service (Node processes)..." -ForegroundColor Yellow
# Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
