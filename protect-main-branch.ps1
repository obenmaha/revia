# Script pour protéger la branche main sur GitHub
# Nécessite un token GitHub avec droits d'admin sur le repo

param(
    [Parameter(Mandatory = $true)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory = $false)]
    [string]$Owner = "obenmaha",
    
    [Parameter(Mandatory = $false)]
    [string]$Repo = "app-kine"
)

# Vérifier que le token est fourni
if (-not $GitHubToken) {
    Write-Error "Token GitHub requis. Utilisez: .\protect-main-branch.ps1 -GitHubToken 'votre_token'"
    exit 1
}

# Configuration de la protection de branche
$protectionConfig = @{
    required_status_checks        = @{
        strict   = $true
        contexts = @("ci", "scope-guard", "nfr-gate")
    }
    enforce_admins                = $true
    required_pull_request_reviews = @{
        required_approving_review_count = 1
        dismiss_stale_reviews           = $true
        require_code_owner_reviews      = $false
    }
    restrictions                  = $null
    allow_force_pushes            = $false
    allow_deletions               = $false
    allow_fork_syncing            = $true
} | ConvertTo-Json -Depth 10

# Headers pour l'API GitHub
$headers = @{
    "Accept"               = "application/vnd.github+json"
    "Authorization"        = "Bearer $GitHubToken"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# URL de l'API GitHub
$url = "https://api.github.com/repos/$Owner/$Repo/branches/main/protection"

Write-Host "Configuration de la protection de la branche main..." -ForegroundColor Yellow
Write-Host "Repo: $Owner/$Repo" -ForegroundColor Cyan
Write-Host "Checks requis: ci, scope-guard, nfr-gate" -ForegroundColor Cyan
Write-Host "Reviews requis: 1" -ForegroundColor Cyan

try {
    # Appel à l'API GitHub
    $response = Invoke-RestMethod -Uri $url -Method PUT -Headers $headers -Body $protectionConfig -ContentType "application/json"
    
    Write-Host "✅ Protection de la branche main configurée avec succès!" -ForegroundColor Green
    Write-Host "Status checks requis: $($response.required_status_checks.contexts -join ', ')" -ForegroundColor Green
    Write-Host "Reviews requis: $($response.required_pull_request_reviews.required_approving_review_count)" -ForegroundColor Green
    
}
catch {
    Write-Error "❌ Erreur lors de la configuration de la protection:"
    Write-Error $_.Exception.Message
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        $reasonPhrase = $_.Exception.Response.ReasonPhrase
        Write-Error "Code d'erreur: $statusCode - $reasonPhrase"
        
        # Lire le corps de la réponse d'erreur
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Error "Détails: $responseBody"
    }
    
    exit 1
}
