<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Modal Equipos - Laravel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .status {
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            font-weight: bold;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .loading {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        button {
            background-color: #2b3d5e;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px 5px;
            font-size: 16px;
        }
        button:hover {
            background-color: #1f2d44;
        }
        .results {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-top: 15px;
            font-family: monospace;
            white-space: pre-wrap;
            max-height: 400px;
            overflow-y: auto;
        }
        .catalog-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .catalog-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2b3d5e;
        }
        .catalog-item h4 {
            margin: 0 0 10px 0;
            color: #2b3d5e;
        }
        .catalog-item .count {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test Modal Equipos - Desde Laravel</h1>
        <p>Esta página está servida desde Laravel y puede acceder a las APIs sin problemas de CORS.</p>

        <div id="status" class="status loading">
            ⏳ Iniciando pruebas automáticas...
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <button onclick="testCORS()">🌐 Probar CORS</button>
            <button onclick="testBasicConnection()">🔗 Probar Conexión DB</button>
            <button onclick="analyzeModalStructure()">🎯 Análisis Enfocado Modal</button>
            <button onclick="testCatalogCounts()">📊 Probar Conteo Catálogos</button>
            <button onclick="testFullModalData()">📋 Probar Datos Completos</button>
            <button onclick="runAllTests()">🚀 Ejecutar Todas las Pruebas</button>
        </div>

        <div id="catalog-summary" class="catalog-summary" style="display: none;"></div>
        <div id="results" class="results" style="display: none;"></div>
    </div>

    <script>
        function updateStatus(message, type = 'loading') {
            const statusDiv = document.getElementById('status');
            statusDiv.className = `status ${type}`;
            statusDiv.innerHTML = message;
        }

        function showResults(data) {
            const resultsDiv = document.getElementById('results');
            resultsDiv.style.display = 'block';
            resultsDiv.textContent = JSON.stringify(data, null, 2);
        }

        function showCatalogSummary(data) {
            const summaryDiv = document.getElementById('catalog-summary');
            summaryDiv.style.display = 'grid';
            summaryDiv.innerHTML = '';

            Object.entries(data).forEach(([key, value]) => {
                const count = Array.isArray(value) ? value.length : (typeof value === 'number' ? value : 'N/A');
                const item = document.createElement('div');
                item.className = 'catalog-item';
                item.innerHTML = `
                    <h4>${key.replace(/_/g, ' ').toUpperCase()}</h4>
                    <div class="count">${count}</div>
                    <small>${Array.isArray(value) ? 'registros' : 'items'}</small>
                `;
                summaryDiv.appendChild(item);
            });
        }

        async function testCORS() {
            updateStatus('🌐 Probando CORS...', 'loading');
            
            try {
                const response = await fetch('/api/v1/test/cors');
                const data = await response.json();
                
                if (data.success) {
                    updateStatus('✅ CORS funcionando correctamente!', 'success');
                    showResults(data);
                    return true;
                } else {
                    updateStatus('❌ Error en CORS', 'error');
                    showResults(data);
                    return false;
                }
            } catch (error) {
                updateStatus('❌ Error de CORS: ' + error.message, 'error');
                showResults({ error: error.message });
                return false;
            }
        }

        async function testBasicConnection() {
            updateStatus('🔗 Probando conexión a base de datos...', 'loading');

            try {
                const response = await fetch('/api/v1/test/db');
                const data = await response.json();

                if (data.success) {
                    updateStatus(`✅ Base de datos conectada! Equipos: ${data.equipos_count}`, 'success');
                    showResults(data);
                    return true;
                } else {
                    updateStatus('❌ Error en la base de datos', 'error');
                    showResults(data);
                    return false;
                }
            } catch (error) {
                updateStatus('❌ Error de conexión DB: ' + error.message, 'error');
                showResults({ error: error.message });
                return false;
            }
        }

        async function analyzeModalStructure() {
            updateStatus('🎯 Analizando estructura específica para el modal...', 'loading');

            try {
                const response = await fetch('/api/v1/test/modal-analysis');
                const data = await response.json();

                if (data.success) {
                    const analysis = data.data;
                    updateStatus(`✅ Análisis enfocado completado! BD: ${analysis.database}`, 'success');

                    // Mostrar resumen de catálogos
                    const summary = {};
                    Object.entries(analysis.catalog_analysis).forEach(([table, info]) => {
                        if (info.exists) {
                            const nameField = analysis.recommendations.name_field_mapping[table] || 'N/A';
                            const statusField = analysis.recommendations.status_field_mapping[table] || 'N/A';
                            summary[table] = `✅ ${info.count} registros (${nameField}/${statusField})`;
                        } else {
                            summary[table] = '❌ NO EXISTE';
                        }
                    });
                    showCatalogSummary(summary);

                    // Mostrar información clave
                    console.log('📋 Análisis de equipos:', analysis.equipos_analysis);
                    console.log('📊 Catálogos existentes:', analysis.recommendations.existing_catalogs);
                    console.log('❌ Catálogos faltantes:', analysis.recommendations.missing_catalogs);
                    console.log('🏷️ Mapeo de campos nombre:', analysis.recommendations.name_field_mapping);
                    console.log('📊 Mapeo de campos status:', analysis.recommendations.status_field_mapping);

                    showResults(data);
                    return true;
                } else {
                    updateStatus('❌ Error al analizar estructura del modal', 'error');
                    showResults(data);
                    return false;
                }
            } catch (error) {
                updateStatus('❌ Error: ' + error.message, 'error');
                showResults({ error: error.message });
                return false;
            }
        }

        async function testCatalogCounts() {
            updateStatus('📊 Probando conteo de catálogos...', 'loading');
            
            try {
                const response = await fetch('/api/v1/test/catalogs');
                const data = await response.json();
                
                if (data.success) {
                    updateStatus('✅ Catálogos disponibles!', 'success');
                    showCatalogSummary(data.data);
                    showResults(data);
                    return true;
                } else {
                    updateStatus('❌ Error al obtener catálogos', 'error');
                    showResults(data);
                    return false;
                }
            } catch (error) {
                updateStatus('❌ Error: ' + error.message, 'error');
                showResults({ error: error.message });
                return false;
            }
        }

        async function testFullModalData() {
            updateStatus('📋 Probando datos completos del modal...', 'loading');
            
            try {
                const response = await fetch('/api/v1/test/modal-data');
                const data = await response.json();
                
                if (data.success) {
                    updateStatus('✅ Datos del modal cargados exitosamente!', 'success');
                    showCatalogSummary(data.data);
                    showResults(data);
                    return true;
                } else {
                    updateStatus('❌ Error al cargar datos del modal', 'error');
                    showResults(data);
                    return false;
                }
            } catch (error) {
                updateStatus('❌ Error: ' + error.message, 'error');
                showResults({ error: error.message });
                return false;
            }
        }

        async function runAllTests() {
            updateStatus('🚀 Ejecutando todas las pruebas...', 'loading');
            
            const results = {
                cors: await testCORS(),
                db: false,
                catalogs: false,
                modal: false
            };
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (results.cors) {
                results.db = await testBasicConnection();
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                if (results.db) {
                    results.catalogs = await testCatalogCounts();
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (results.catalogs) {
                        results.modal = await testFullModalData();
                    }
                }
            }
            
            const passed = Object.values(results).filter(Boolean).length;
            const total = Object.keys(results).length;
            const percentage = Math.round((passed / total) * 100);
            
            if (percentage >= 75) {
                updateStatus(`🎉 ¡Todas las pruebas pasaron! (${passed}/${total} - ${percentage}%)`, 'success');
            } else {
                updateStatus(`⚠️ Algunas pruebas fallaron (${passed}/${total} - ${percentage}%)`, 'error');
            }
        }

        // Auto-ejecutar todas las pruebas al cargar
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🧪 Página de pruebas Laravel cargada');
            setTimeout(runAllTests, 1000);
        });
    </script>
</body>
</html>
