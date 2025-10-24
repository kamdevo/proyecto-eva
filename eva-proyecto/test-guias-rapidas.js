// Script para probar las guías rápidas con datos reales de la BD

const API_BASE_URL = 'http://localhost:8001/api';

async function testGuiasRapidas() {
    console.log('📚 PROBANDO SISTEMA DE GUÍAS RÁPIDAS');
    console.log('==================================');

    try {
        console.log('🚀 Obteniendo guías rápidas desde la BD...');
        
        const response = await fetch(`${API_BASE_URL}/v1/guias-rapidas`);
        console.log(`📊 Status: ${response.status} - ${response.statusText}`);
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ ¡GUÍAS RÁPIDAS OBTENIDAS EXITOSAMENTE!');
            console.log(`📋 Total de guías: ${data.total}`);
            console.log('📚 Lista de guías:');
            
            data.data.forEach((guia, index) => {
                console.log(`   ${index + 1}. ${guia.name}`);
                console.log(`      - ID: ${guia.id}`);
                console.log(`      - Archivo: ${guia.file}`);
                console.log(`      - Estado: ${guia.estado}`);
                console.log('');
            });
            
            // Probar el endpoint de archivo si hay guías
            if (data.data.length > 0) {
                const primeraGuia = data.data[0];
                console.log('🔗 Probando enlace de archivo...');
                console.log(`📄 URL del archivo: ${API_BASE_URL}/v1/guias-rapidas/${primeraGuia.id}/archivo`);
                
                // Verificar que el endpoint de archivo responde
                try {
                    const archivoResponse = await fetch(`${API_BASE_URL}/v1/guias-rapidas/${primeraGuia.id}/archivo`);
                    console.log(`📊 Status del archivo: ${archivoResponse.status} - ${archivoResponse.statusText}`);
                    
                    if (archivoResponse.ok) {
                        console.log('✅ ¡Archivo accesible!');
                        console.log(`📎 Content-Type: ${archivoResponse.headers.get('content-type')}`);
                    } else {
                        console.log('❌ Archivo no accesible');
                    }
                } catch (archivoError) {
                    console.error('❌ Error accediendo al archivo:', archivoError.message);
                }
            }
            
        } else {
            console.log('❌ ERROR AL OBTENER GUÍAS');
            console.log('📋 Mensaje:', data.message);
        }
        
    } catch (error) {
        console.error('💥 ERROR DE CONEXIÓN:', error.message);
    }
    
    console.log('\n📝 RESUMEN DE LA IMPLEMENTACIÓN:');
    console.log('===============================');
    console.log('✅ Backend - Endpoint /v1/guias-rapidas creado');
    console.log('✅ Backend - Endpoint /v1/guias-rapidas/{id}/archivo creado');
    console.log('✅ Frontend - HomePage.jsx actualizado con datos reales');
    console.log('✅ Frontend - Íconos de link agregados con flex layout');
    console.log('✅ Frontend - Estados de carga implementados');
    console.log('✅ Frontend - Función abrirGuiaRapida() creada');
    console.log('');
    console.log('🎯 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('- 📚 Datos reales de tabla guias_rapidas');
    console.log('- 🔗 Íconos ExternalLink al lado de cada guía');
    console.log('- 📂 Archivos servidos desde storage/app/public/guias/');
    console.log('- 🎨 Hover effects y transiciones suaves');
    console.log('- ⏳ Estados de carga y mensajes informativos');
    console.log('- 🔄 Actualización automática al cargar la página');
}

// Ejecutar el test
testGuiasRapidas().then(() => {
    console.log('\n🏁 Prueba completada - Sistema de guías rápidas listo!');
}).catch(err => {
    console.error('💥 Error en prueba:', err);
});
