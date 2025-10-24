// Script de debug para probar la creación de tickets desde frontend

// Usar fetch nativo
const API_BASE_URL = 'http://localhost:8001/api';

async function testFrontendTicketCreation() {
    console.log('🔍 DEBUGGEANDO CREACIÓN DE TICKET DESDE FRONTEND');
    console.log('================================================');

    // Simular exactamente los datos que envía el frontend
    const frontendTicketData = {
        // Campos obligatorios para la tabla ordenes
        descripcion: 'TEST - Problema de equipo médico desde frontend',
        fecha_inicio: new Date().toISOString(),
        
        // Mapear tipo de ticket a subproceso_id
        subproceso_id: 1, // biomédico
        
        // Información del equipo
        nombre_equipo: 'Equipo Test Frontend',
        codigo_equipo: 'TEST-001',
        serie_equipo: 'FE2024001',
        marca_equipo: 'TestMarca',
        modelo_equipo: 'TestModel',
        
        // Información del reportante (simulado)
        reportante_id: 1,
        reportante_email: 'test@example.com',
        reportante_nombre: 'Usuario Test',
        
        // Ubicación
        servicio_id: 1,
        area_id: 1,
        
        // Estado inicial
        estado_id: 1, // Abierto
        prioridad: 2, // Media por defecto
        
        // Información adicional
        empresa_id: 1,
        observaciones: 'Datos de prueba desde frontend', // Se mapea a 'reparacion' en backend
        
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

    console.log('📤 Datos que está enviando el frontend:');
    console.log(JSON.stringify(frontendTicketData, null, 2));
    
    try {
        console.log('\n🚀 Enviando POST a /v1/crear-ticket...');
        
        const response = await fetch(`${API_BASE_URL}/v1/crear-ticket`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(frontendTicketData)
        });
        
        console.log(`📊 Status de respuesta: ${response.status}`);
        console.log(`📊 Status text: ${response.statusText}`);
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            console.log('✅ ¡TICKET CREADO EXITOSAMENTE!');
            console.log('📋 Respuesta completa:', result);
            console.log(`🆔 ID del ticket: ${result.data.ticket_id || result.data.id}`);
        } else {
            console.log('❌ ERROR AL CREAR TICKET');
            console.log('📋 Respuesta de error:', result);
        }
        
    } catch (error) {
        console.error('💥 ERROR DE CONEXIÓN:', error.message);
    }
}

// Ejecutar el test
testFrontendTicketCreation().then(() => {
    console.log('\n🏁 Debug completado');
}).catch(err => {
    console.error('💥 Error en debug:', err);
});
