// Script para probar el envío automático de correos al crear tickets

const API_BASE_URL = 'http://localhost:8001/api';

async function testCorreoAutomaticoTicket() {
    console.log('📧 PROBANDO ENVÍO AUTOMÁTICO DE CORREOS AL CREAR TICKETS');
    console.log('=====================================================');

    // Datos de ticket de prueba (como los que envía el usuario innovaciondesa)
    const ticketData = {
        descripcion: 'TEST - Verificación de envío automático de correos',
        subproceso_id: 1, // biomedico
        nombre_equipo: 'Monitor de Signos Vitales - TEST CORREO',
        codigo_equipo: 'TEST-001',
        serie_equipo: 'SN-TEST-2024',
        marca_equipo: 'Marca Test',
        modelo_equipo: 'Modelo Test v1.0',
        reportante_id: 406, // Usuario innovaciondesa (encontrado en BD)
        servicio_id: 1,
        area_id: 1,
        estado_id: 1,
        prioridad: 1, // Alta para que sea notoria
        empresa_id: 1,
        observaciones: 'Ticket de prueba para verificar envío automático de correos',
        
        // Campos obligatorios con valores por defecto
        tecnico_id: 1,
        electrico: 0,
        mecanico: 1,
        locativo: 0,
        cierre_active: 0,
        usuario_final_id: 4,
        trabajo_id: 1,
        listado_industrial_id: 1
    };

    console.log('📤 Datos del ticket de prueba:');
    console.log(JSON.stringify(ticketData, null, 2));
    
    try {
        console.log('\n🚀 Enviando POST a /v1/crear-ticket con correo automático habilitado...');
        
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
            console.log(`🆔 ID del ticket: ${result.data.ticket_id || result.data.id}`);
            
            console.log('\n📧 VERIFICACIÓN DE CORREO AUTOMÁTICO:');
            console.log('====================================');
            console.log('✅ El correo debería enviarse automáticamente');
            console.log('👤 Destinatario: CORREO DEL USUARIO CREADOR (reportante_id: 406)');
            console.log('📧 Email esperado: innovacionydesarrollo@correohuv.gov.co');
            console.log('📋 Asunto: 🎫 Creación de Ticket Nro [ID] - Sistema EVA');
            console.log('🎨 Formato: React Email con diseño Hospital Universitario del Valle');
            console.log('📊 Contenido: Información completa del ticket y equipo');
            
            console.log('\n🔍 INFORMACIÓN DEL TICKET CREADO:');
            if (result.data.ticket) {
                const ticket = result.data.ticket;
                console.log(`📝 Descripción: ${ticket.descripcion}`);
                console.log(`🏥 Servicio: ${ticket.servicio_nombre || 'No especificado'}`);
                console.log(`📍 Área: ${ticket.area_nombre || 'No especificado'}`);
                console.log(`⚡ Prioridad: ${ticket.prioridad === 1 ? 'Alta' : ticket.prioridad === 2 ? 'Media' : 'Baja'}`);
                console.log(`👤 Reportante: ${ticket.reportante_nombre || 'Usuario Sistema'}`);
                console.log(`🏗️ Tipo: ${ticket.subproceso_nombre || 'Biomédico'}`);
            }
            
        } else {
            console.log('❌ ERROR AL CREAR TICKET');
            console.log('📋 Respuesta de error:', result);
        }
        
    } catch (error) {
        console.error('💥 ERROR DE CONEXIÓN:', error.message);
    }
    
    console.log('\n📝 CONFIGURACIÓN REQUERIDA PARA CORREOS:');
    console.log('=======================================');
    console.log('🔧 Variables .env necesarias:');
    console.log('   MAIL_MAILER=smtp');
    console.log('   MAIL_HOST=smtp.gmail.com');
    console.log('   MAIL_PORT=587');
    console.log('   MAIL_USERNAME=evagestionalamedicina@gmail.com');
    console.log('   MAIL_PASSWORD="ddqd vsvu innh dggl"');
    console.log('   MAIL_ENCRYPTION=tls');
    console.log('   MAIL_FROM_ADDRESS=evagestionalamedicina@gmail.com');
    console.log('   MAIL_FROM_NAME="EVA - Sistema de Gestión"');
    console.log('   NOTIFICATION_EMAIL=camilomoralesyk@gmail.com');
    
    console.log('\n🎯 VERIFICAR EN LOGS DEL BACKEND:');
    console.log('================================');
    console.log('📂 Archivo: eva-backend/storage/logs/laravel.log');
    console.log('🔍 Buscar: [CREAR-TICKET] para ver el proceso completo');
    console.log('📧 Buscar: "Iniciando envío de correo de notificación"');
    console.log('✅ Buscar: "¡Correo enviado exitosamente!"');
    console.log('❌ Buscar: "Error enviando correo" si hay problemas');
}

// Ejecutar el test
testCorreoAutomaticoTicket().then(() => {
    console.log('\n🏁 Prueba completada');
    console.log('🔔 Si el correo no llega, revisar:');
    console.log('   1. Configuración .env del backend');
    console.log('   2. Logs de Laravel en storage/logs/');
    console.log('   3. Carpeta spam del correo destino');
    console.log('   4. Estado del servicio SMTP de Gmail');
}).catch(err => {
    console.error('💥 Error en prueba:', err);
});
