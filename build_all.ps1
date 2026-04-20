$services = @("eureka-server", "api-gateway", "auth-service", "post-service", "comment-service", "category-tag-service", "media-service", "newsletter-service", "notification-service", "analytics-service")

foreach ($service in $services) {
    Write-Host "Building $service..."
    Push-Location "e:\IncrediblesThoughts\$service"
    mvn clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to build $service" -ForegroundColor Red
        Pop-Location
        exit $LASTEXITCODE
    }
    Pop-Location
}
Write-Host "All services built successfully!" -ForegroundColor Green
