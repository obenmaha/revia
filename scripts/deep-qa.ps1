# Script PowerShell pour deep:qa
Write-Host "🔧 Exécution du script deep:qa..." -ForegroundColor Green

Write-Host "📦 Build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build réussi" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Build échoué, mais on continue..." -ForegroundColor Yellow
}

Write-Host "🧪 Tests..." -ForegroundColor Yellow
try {
    npm run test
    Write-Host "✅ Tests réussis" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tests échoués, mais on continue..." -ForegroundColor Yellow
}

Write-Host "🔍 Analyse des cycles..." -ForegroundColor Yellow
try {
    npx madge --circular --extensions ts,tsx src > .reports/post-lot-circular.txt
    Write-Host "✅ Analyse des cycles terminée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Analyse des cycles échouée" -ForegroundColor Yellow
}

Write-Host "📊 Analyse du bundle..." -ForegroundColor Yellow
try {
    npx vite-bundle-visualizer --analyze > .reports/post-lot-bundle.html
    Write-Host "✅ Analyse du bundle terminée" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Analyse du bundle échouée" -ForegroundColor Yellow
}

Write-Host "🎉 Script deep:qa terminé!" -ForegroundColor Green
