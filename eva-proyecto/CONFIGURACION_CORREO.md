# 📧 CONFIGURACIÓN DE CORREO ELECTRÓNICO - SISTEMA EVA

## ✅ CONFIGURACIÓN REQUERIDA EN `.env`

Agregar las siguientes líneas al archivo `eva-backend/.env`:

```env
# Configuración de Correo - Gmail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=evagestionalamedicina@gmail.com
MAIL_PASSWORD="ddqd vsvu innh dggl"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=evagestionalamedicina@gmail.com
MAIL_FROM_NAME="EVA - Sistema de Gestión"
```

## 📋 TIPOS DE NOTIFICACIONES IMPLEMENTADAS

### 1. **Preventivos con Repuestos Pendientes**
- **Trigger:** Al registrar un preventivo con `repuesto_pendiente = 'si'`
- **Destinatarios:** Usuarios del servicio donde está el equipo
- **Contenido:**
  - Número del preventivo
  - Código y fecha de ejecución
  - Información completa del equipo
  - Ubicación (servicio y área)
  - Descripción del repuesto faltante
  - Observaciones

### 2. **Creación de Tickets/Órdenes de Trabajo**
- **Trigger:** Al crear una nueva orden en tabla `ordenes`
- **Destinatarios:** Técnicos asignados y supervisores
- **Contenido:**
  - Número del ticket
  - Descripción del problema
  - Información del equipo
  - Ubicación
  - Prioridad
  - Datos del solicitante

### 3. **Actualizaciones de Órdenes**
- **Trigger:** Cambios de estado, asignación de técnico, diagnóstico
- **Tipos:**
  - Email de asignación
  - Email de diagnóstico
  - Solicitud de cierre
  - Cierre total

### 4. **Observaciones de Equipos**
- **Trigger:** Al agregar observaciones importantes
- **Destinatarios:** Responsables del área

## 🔧 ENDPOINTS DE CORREO A IMPLEMENTAR

### Backend - Rutas Necesarias:

```php
// Enviar notificación de repuesto pendiente
POST /api/v1/notifications/repuesto-pendiente
Body: {
  "preventivo_id": 123,
  "equipo_id": 456,
  "repuesto_descripcion": "Filtro de aire",
  "observaciones": "Urgente"
}

// Enviar notificación de nuevo ticket
POST /api/v1/notifications/nuevo-ticket
Body: {
  "ticket_id": 789,
  "equipo_id": 456,
  "descripcion": "Falla en equipo",
  "prioridad": "alta"
}

// Enviar notificación de actualización de ticket
POST /api/v1/notifications/actualizar-ticket
Body: {
  "ticket_id": 789,
  "tipo_actualizacion": "asignacion|diagnostico|cierre",
  "datos": {...}
}
```

## 📊 INTEGRACIÓN CON PÁGINA DE PREVENTIVOS

### Funcionalidades Requeridas:

#### 1. **Carga Masiva de Cronograma**
- ✅ Formulario con año y opción de reemplazo
- ✅ Upload de archivo Excel
- ✅ Validación de formato
- ✅ Procesamiento por lotes
- ✅ Actualización automática de estados

#### 2. **Tabla de Consulta**
- ✅ Filtro por año
- ✅ Paginación
- ✅ Búsqueda en tiempo real
- ✅ Exportación a Excel

#### 3. **Edición Individual**
- ✅ Modal de edición
- ✅ Modificación de meses
- ✅ Cambio de responsable
- ✅ Registro de cambios

#### 4. **Exportaciones**
- ✅ Plantilla de importación
- ✅ Consolidado completo
- ✅ Exportación filtrada

## 🎯 VERIFICACIÓN DE CONFIGURACIÓN

### Pasos para probar el envío de correos:

1. **Verificar configuración en .env:**
```bash
cd eva-backend
php artisan config:clear
php artisan config:cache
```

2. **Probar envío de correo de prueba:**
```bash
php artisan tinker
Mail::raw('Test email from EVA', function ($message) {
    $message->to('test@example.com')
            ->subject('Test Email');
});
```

3. **Verificar logs:**
```bash
tail -f storage/logs/laravel.log
```

## 📝 NOTAS IMPORTANTES

- ✅ La contraseña de Gmail es una **contraseña de aplicación**, no la contraseña normal
- ✅ Asegurarse de que la verificación en 2 pasos esté activada en Gmail
- ✅ El puerto 587 usa TLS (más seguro que SSL en puerto 465)
- ✅ Todos los correos se envían desde `evagestionalamedicina@gmail.com`

## 🚀 ESTADO ACTUAL

- ✅ Endpoints de exportación funcionando
- ✅ Descarga de plantilla funcionando
- ⏳ Configuración de correo pendiente
- ⏳ Notificaciones automáticas pendientes
- ⏳ Carga masiva de cronograma pendiente

---

**Última actualización:** 2025-10-02
