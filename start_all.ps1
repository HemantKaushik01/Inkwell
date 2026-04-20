$services = @(
    "eureka-server",
    "api-gateway",
    "auth-service",
    "post-service",
    "comment-service",
    "category-tag-service",
    "media-service",
    "newsletter-service",
    "notification-service",
    "analytics-service"
)

Write-Host "Starting InkWell Microservices..." -ForegroundColor Cyan
Write-Host "Make sure your MySQL database is running and accessible!" -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Green
    
    # Open a new PowerShell window, navigate to the folder, and run the service
    Start-Process powershell -ArgumentList "-NoExit -Command `"cd e:\IncrediblesThoughts\$service; mvn spring-boot:run`""
    
    # Pause briefly to allow Eureka and Gateway to boot slightly ahead of the rest
    if ($service -eq "eureka-server") {
        Write-Host "Waiting 15 seconds for Eureka Server to boot..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    } elseif ($service -eq "api-gateway") {
        Write-Host "Waiting 10 seconds for API Gateway to boot..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Start-Sleep -Seconds 3
    }
}

Write-Host "All backend services are starting up in separate windows!" -ForegroundColor Cyan
Write-Host "To start the frontend, run: cd e:\IncrediblesThoughts\frontend ; npm run dev" -ForegroundColor Cyan
