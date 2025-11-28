# Script para actualizar FRONTEND_URL en el archivo .env
# Uso: .\fix-frontend-url.ps1 [puerto]
# Ejemplo: .\fix-frontend-url.ps1 5173

param(
    [string]$Puerto = "5173"  # Puerto por defecto
)

$envFile = "$PSScriptRoot\.env"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ No se encontró el archivo .env" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Buscando FRONTEND_URL en .env..." -ForegroundColor Cyan

$content = Get-Content $envFile -Raw

# Obtener IP actual del sistema
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    $ipAddress = "192.168.2.146"  # Fallback
    Write-Host "⚠️  No se pudo detectar la IP, usando: $ipAddress" -ForegroundColor Yellow
} else {
    Write-Host "✅ IP detectada: $ipAddress" -ForegroundColor Green
}

$newFrontendUrl = "http://${ipAddress}:${Puerto}"

# Actualizar FRONTEND_URL
if ($content -match "FRONTEND_URL=.*") {
    $oldUrl = ($content | Select-String "FRONTEND_URL=(.*)").Matches.Groups[1].Value
    $content = $content -replace "FRONTEND_URL=.*", "FRONTEND_URL=$newFrontendUrl"
    Write-Host "✅ FRONTEND_URL actualizada:" -ForegroundColor Green
    Write-Host "   Anterior: $oldUrl" -ForegroundColor Yellow
    Write-Host "   Nueva:    $newFrontendUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️  FRONTEND_URL no encontrada, agregándola..." -ForegroundColor Yellow
    $content += "`nFRONTEND_URL=$newFrontendUrl`n"
}

# Guardar cambios
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "`n✅ Archivo .env actualizado correctamente" -ForegroundColor Green
Write-Host "📝 Ejecuta los siguientes comandos:" -ForegroundColor Cyan
Write-Host "   php artisan config:clear" -ForegroundColor White
Write-Host "   php artisan cache:clear" -ForegroundColor White

Write-Host "`n🔗 URL de verificación: $newFrontendUrl/confirmar-cuenta/`{token`}" -ForegroundColor Cyan
