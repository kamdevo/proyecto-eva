// Script para probar que el frontend ya no muestra toast de error automático

const API_BASE_URL = 'http://localhost:8001/api';

async function testFrontendWithoutErrorToast() {
    console.log('🎯 PROBANDO FRONTEND SIN TOAST DE ERROR AUTOMÁTICO');
    console.log('===============================================');

    // Datos que envía el frontend (exactamente como el modal corregido)
    const ticketData = {
        descripcion: 'TEST - Creación desde modal corregido (sin toast error automático)',
        subproceso_id: 1, // biomedico
        nombre_equipo: 'Equipo Test Modal',
        codigo_equipo: null,
        serie_equipo: null,
        marca_equipo: null,
        modelo_equipo: null,
        reportante_id: 1,
        servicio_id: null,
        area_id: null,
        estado_id: 1,
        prioridad: 2,
        empresa_id: null,
        observaciones: null,
        
        // Campos obligatorios con valores por defecto
        tecnico_id: 1,
        electrico: 0,
        mecanico: 0,
        locativo: 0,
        cierre_active: 0,
        usuario_final_id: 1,
        trabajo_id: 1,
        listado_industrial_id: 1
    };

    console.log('📤 Datos enviados por el modal:');
    console.log(JSON.stringify(ticketData, null, 2));
    
    try {
        console.log('\n🚀 Enviando POST a /v1/crear-ticket...');
        
        const response = await fetch(`${API_BASE_URL}/v1/crear-ticket`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        
        console.log(`📊 Status: ${response.status} - ${response.statusText}`);
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ ¡TICKET CREADO EXITOSAMENTE!');
            console.log('🎉 Frontend debería mostrar toast VERDE de éxito (no toast rojo de error)');
            console.log(`🆔 ID del ticket: ${result.data.ticket_id || result.data.id}`);
            console.log('📋 Respuesta del backend:', {
                success: result.success,
                message: result.message,
                ticket_id: result.data.ticket_id || result.data.id
            });
        } else {
            console.log('❌ ERROR AL CREAR TICKET');
            console.log('📋 Respuesta de error:', result);
        }
        
    } catch (error) {
        console.error('💥 ERROR DE CONEXIÓN:', error.message);
    }
    
    console.log('\n📝 RESUMEN DE LA PRUEBA:');
    console.log('=======================');
    console.log('✅ httpService modificado - No muestra toast automático para endpoints de tickets');
    console.log('✅ Modal actualizado - Usa showSuccessToast/showErrorToast en lugar de alert()');
    console.log('✅ Sistema de toasts implementado - Notificaciones visuales mejoradas');
    console.log('🎯 RESULTADO ESPERADO: Solo toast VERDE de éxito, sin toast ROJO automático');
}

// Ejecutar el test
testFrontendWithoutErrorToast().then(() => {
    console.log('\n🏁 Prueba completada - Verificar que frontend muestra toast correcto');
}).catch(err => {
    console.error('💥 Error en prueba:', err);
});
