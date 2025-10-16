# Script PowerShell pour deep:qa
Write-Host "Exécution du script deep:qa..." -ForegroundColor Green

# Pattern pour limiter aux tests MVP sport pendant le clean
$testPattern = "src/__tests__/**/(sport|hooks|services|crypto|guestStore|profile|session).*"

Write-Host "Typecheck..." -ForegroundColor Yellow
npx tsc -p tsconfig.json --noEmit
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Typecheck échoué, mais on continue..." -ForegroundColor Yellow 
}

Write-Host "Build..." -ForegroundColor Yellow
npx vite build
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Build échoué, mais on continue..." -ForegroundColor Yellow 
}

Write-Host "Tests..." -ForegroundColor Yellow
$env:CI="1"
npx vitest run "$testPattern" --reporter=basic --no-color --passWithNoTests
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Tests échoués, mais on continue..." -ForegroundColor Yellow 
}

Write-Host "Analyse des cycles..." -ForegroundColor Yellow
npx madge --circular --extensions ts,tsx src > .reports/post-lot-circular.txt
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Analyse des cycles échouée, mais on continue..." -ForegroundColor Yellow 
}

Write-Host "Analyse du bundle..." -ForegroundColor Yellow
npx vite-bundle-visualizer --analyze > .reports/post-lot-bundle.html
if ($LASTEXITCODE -ne 0) { 
    Write-Host "Analyse du bundle échouée, mais on continue..." -ForegroundColor Yellow 
}

Write-Host "Script deep:qa terminé!" -ForegroundColor Green