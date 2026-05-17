# SonarCloud Analysis Script for Backend Microservices

# Configuration - Replace these with your actual SonarCloud details
$SONAR_TOKEN = "ef5b76867b137e5470f6b0f8c8137c7ba8d063a8"
$SONAR_ORG = "hemantkaushik01"
$SONAR_HOST_URL = "https://sonarcloud.io"

# List of microservices to analyze
$services = @(
    "analytics-service",
    "api-gateway",
    "auth-service",
    "category-tag-service",
    "comment-service",
    "eureka-server",
    "media-service",
    "newsletter-service",
    "notification-service",
    "post-service"
)

foreach ($service in $services) {
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    Write-Host "Analyzing Service: $service" -ForegroundColor Cyan
    Write-Host "----------------------------------------------------" -ForegroundColor Cyan
    
    if (Test-Path $service) {
        Push-Location $service
        
        # Construct the project key (usually organization_directory-name)
        $projectKey = "${SONAR_ORG}_${service}"
        
        # Run Maven Sonar analysis
        mvn clean verify sonar:sonar `
            "-Dsonar.projectKey=$projectKey" `
            "-Dsonar.organization=$SONAR_ORG" `
            "-Dsonar.host.url=$SONAR_HOST_URL" `
            "-Dsonar.login=$SONAR_TOKEN" `
            "-Dsonar.java.binaries=target/classes"
            
        Pop-Location
    } else {
        Write-Host "Warning: Directory $service not found. Skipping." -ForegroundColor Yellow
    }
}

# --- Frontend Analysis ---
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "Analyzing Frontend" -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

if (Test-Path "frontend") {
    Push-Location "frontend"
    # Use npm to run the sonar script we added to package.json
    npm run sonar
    Pop-Location
} else {
    Write-Host "Warning: frontend directory not found. Skipping." -ForegroundColor Yellow
}

Write-Host "All analyses complete!" -ForegroundColor Green
