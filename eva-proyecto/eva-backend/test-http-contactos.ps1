Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRUEBA DE ENDPOINTS HTTP - CONTACTOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://192.168.2.146:8001/api/v1"

# 1. GET - Listar contactos
Write-Host "1️⃣  GET /contactos/list" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/contactos/list" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "Total contactos: $($response.data.Count)" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        $first = $response.data[0]
        Write-Host "Ejemplo:" -ForegroundColor Gray
        Write-Host "  ID: $($first.id)" -ForegroundColor Gray
        Write-Host "  Nombre: $($first.name)" -ForegroundColor Gray
        Write-Host "  Email: $($first.email)" -ForegroundColor Gray
        Write-Host "  Tipo: $($first.tipo_nombre)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2️⃣  GET /tcontacto (tipos)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tcontacto" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "✅ Status: OK" -ForegroundColor Green
    Write-Host "Total tipos: $($response.data.Count)" -ForegroundColor Green
    foreach ($tipo in $response.data) {
        Write-Host "  - $($tipo.id): $($tipo.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3️⃣  POST /contactos/create (crear contacto)" -ForegroundColor Yellow
try {
    $nuevoContacto = @{
        name = "TEST CONTACTO $(Get-Date -Format 'HHmmss')"
        email = "test@ejemplo.com"
        telefono = "300 123 4567"
        tcontacto_id = 3
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/contactos/create" -Method POST -Body $nuevoContacto -ContentType "application/json"
    Write-Host "✅ Contacto creado exitosamente" -ForegroundColor Green
    Write-Host "  ID: $($response.data.id)" -ForegroundColor Gray
    Write-Host "  Nombre: $($response.data.name)" -ForegroundColor Gray
    $testId = $response.data.id
    
    # 4. PUT - Actualizar
    Write-Host "`n4️⃣  PUT /contactos/$testId (actualizar)" -ForegroundColor Yellow
    $contactoActualizado = @{
        name = "TEST ACTUALIZADO"
        email = "actualizado@ejemplo.com"
        telefono = "300 999 9999"
        tcontacto_id = 4
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/contactos/$testId" -Method PUT -Body $contactoActualizado -ContentType "application/json"
    Write-Host "✅ Contacto actualizado" -ForegroundColor Green
    Write-Host "  Nombre: $($response.data.name)" -ForegroundColor Gray
    Write-Host "  Email: $($response.data.email)" -ForegroundColor Gray
    
    # 5. DELETE - Eliminar
    Write-Host "`n5️⃣  DELETE /contactos/$testId (eliminar)" -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$baseUrl/contactos/$testId" -Method DELETE
    Write-Host "✅ Contacto eliminado" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6️⃣  GET /contactos/list?search=EQUIPAR" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/contactos/list?search=EQUIPAR" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "✅ Búsqueda completada" -ForegroundColor Green
    Write-Host "Resultados: $($response.data.Count)" -ForegroundColor Green
    if ($response.data.Count -gt 0) {
        Write-Host "Primeros resultados:" -ForegroundColor Gray
        $response.data | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - $($_.name)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PRUEBA COMPLETADA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
