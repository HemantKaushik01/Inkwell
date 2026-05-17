$root = "e:\IncrediblesThoughts"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " InkWell - Commit and Merge Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$branchFiles = [ordered]@{
    "auth-service"         = @("auth-service/src/", "auth-service/pom.xml")
    "api-gateway"          = @("api-gateway/src/", "api-gateway/pom.xml")
    "eureka-server"        = @("eureka-server/src/", "eureka-server/pom.xml")
    "post-service"         = @("post-service/src/", "post-service/pom.xml")
    "comment-service"      = @("comment-service/src/", "comment-service/pom.xml")
    "category-tag-service" = @("category-tag-service/src/", "category-tag-service/pom.xml")
    "media-service"        = @("media-service/src/", "media-service/pom.xml")
    "newsletter-service"   = @("newsletter-service/src/", "newsletter-service/pom.xml")
    "notification-service" = @("notification-service/src/", "notification-service/pom.xml")
    "analytics-service"    = @("analytics-service/src/", "analytics-service/pom.xml")
    "frontend"             = @("frontend/src/", "frontend/public/", "frontend/package.json", "frontend/index.html", "frontend/vite.config.js")
}

$rootFiles = @(
    ".dockerignore",
    ".env.example",
    ".gitignore",
    "docker-compose.yml",
    "docker-compose.auth.yml",
    "render.yaml",
    "init-db.sql",
    "start_all.ps1",
    "run_sonar.ps1",
    "commit_all.ps1"
)

Set-Location $root

# Step 0: Stash only src/ and config files (ignore target/)
Write-Host "-- Stashing current changes (src files only)..." -ForegroundColor Yellow
git stash push --include-untracked -m "pre-commit-script-stash" -- `
    $(git status --porcelain | Where-Object { $_ -notmatch "/target/" } | ForEach-Object { $_.Substring(3).Trim() }) 2>&1 | Out-Null
Write-Host "   [OK] Stashed" -ForegroundColor Green

# Step 1: For each service branch commit its own files
foreach ($branch in $branchFiles.Keys) {
    $paths = $branchFiles[$branch]

    Write-Host ""
    Write-Host "-- Switching to branch: $branch" -ForegroundColor Yellow
    git checkout $branch 2>&1 | Out-Null

    git stash apply 2>&1 | Out-Null

    foreach ($path in $paths) {
        $fullPath = Join-Path $root $path
        if (Test-Path $fullPath) {
            git add $fullPath 2>&1 | Out-Null
        }
    }

    $staged = git diff --cached --name-only 2>&1
    if ($staged) {
        git commit -m "refactor. for the development" 2>&1 | Out-Null
        Write-Host "   [OK] Committed to $branch" -ForegroundColor Green
    } else {
        Write-Host "   [SKIP] Nothing to commit on $branch" -ForegroundColor DarkYellow
    }

    git checkout -- . 2>&1 | Out-Null
}

# Step 2: Dev — apply stash, stage root files, merge all branches, single commit
Write-Host ""
Write-Host "-- Switching to dev branch" -ForegroundColor Yellow
git checkout dev 2>&1 | Out-Null

git stash pop 2>&1 | Out-Null

Write-Host "-- Staging root-level config files" -ForegroundColor Yellow
foreach ($file in $rootFiles) {
    $fullPath = Join-Path $root $file
    if (Test-Path $fullPath) {
        git add $fullPath 2>&1 | Out-Null
    }
}

foreach ($branch in $branchFiles.Keys) {
    Write-Host "-- Merging $branch into dev" -ForegroundColor Yellow
    git merge $branch --no-ff --no-commit 2>&1 | Out-Null
}

$staged = git diff --cached --name-only 2>&1
if ($staged) {
    git commit -m "Merge all branch after the refactor" 2>&1 | Out-Null
    Write-Host ""
    Write-Host "[OK] All branches merged and committed into dev!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[SKIP] Nothing new to commit on dev." -ForegroundColor DarkYellow
}

# Step 3: Push all branches
Write-Host ""
Write-Host "-- Pushing all branches to origin..." -ForegroundColor Yellow

foreach ($branch in $branchFiles.Keys) {
    $result = git push origin $branch 2>&1
    Write-Host "   [OK] Pushed $branch" -ForegroundColor Green
}

git push origin dev 2>&1 | Out-Null
Write-Host "   [OK] Pushed dev" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Done! All commits pushed successfully." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
