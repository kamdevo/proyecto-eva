// Test simple que replica exactamente lo que envía el frontend

const API_BASE_URL = 'http://localhost:8001/api';

async function testFrontendTicket() {
    console.log('🎯 PRUEBA SIMPLE - FRONTEND TICKET');
    console.log('==================================');

    // Datos exactos como el frontend
    const ticketData = {
        // Campos obligatorios para la tabla ordenes
        descripcion: 'Ticket de prueba desde frontend simulado',
        
        // Mapear tipo de ticket a subproceso_id
        subproceso_id: 1, // biomedico
        
        // Información del equipo
        nombre_equipo: 'Equipo Test',
        codigo_equipo: null,
        serie_equipo: null,
        marca_equipo: null,
        modelo_equipo: null,
        
        // Información del reportante (usuario actual) - Solo ID
        reportante_id: 1,
        
        // Ubicación
        servicio_id: null,
        area_id: null,
        
        // Estado inicial
        estado_id: 1, // Abierto
        prioridad: 2, // Media por defecto
        
        // Información adicional
        empresa_id: null,
        observaciones: null, // Se mapea a 'reparacion' en backend
        
        // ✅ CAMPOS OBLIGATORIOS ADICIONALES (Valores por defecto)
        tecnico_id: 1,
        electrico: 0,
        mecanico: 0,
        locativo: 0,
        cierre_active: 0,
        usuario_final_id: 1,
        trabajo_id: 1,
        listado_industrial_id: 1
    };

    console.log('📤 Enviando:', JSON.stringify(ticketData, null, 2));
    
    try {
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
        console.log('📋 Respuesta:', result);
        
        if (result.success) {
            console.log('✅ ¡FRONTEND TICKET CREADO EXITOSAMENTE!');
            console.log(`🆔 ID: ${result.data.ticket_id || result.data.id}`);
        } else {
            console.log('❌ Error:', result.message);
        }
        
    } catch (error) {
        console.error('💥 Error de conexión:', error.message);
    }
}

// Ejecutar
testFrontendTicket().then(() => {
    console.log('\n🏁 Test completado');
}).catch(err => {
    console.error('💥 Error:', err);
});
