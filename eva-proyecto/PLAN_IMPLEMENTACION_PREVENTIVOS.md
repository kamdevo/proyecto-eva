# 📋 PLAN DE IMPLEMENTACIÓN - MANTENIMIENTO PREVENTIVO Y NOTIFICACIONES

## 🎯 ESTADO ACTUAL

### ✅ **YA IMPLEMENTADO:**
1. ✅ Componente `PlanesMantenimientoView` existe
2. ✅ Endpoints de exportación funcionando:
   - `GET /v1/planes-mantenimientos/export-excel` (TODOS)
   - `POST /v1/planes-mantenimientos/export-custom` (FILTRADOS)
   - `GET /v1/planes-mantenimientos/download-template` (PLANTILLA)
3. ✅ Archivos Excel reales con PhpSpreadsheet
4. ✅ Tabla `mantenimiento` correcta en BD
5. ✅ Hook `useMantenimientoData` para gestión de datos

### ⏳ **PENDIENTE DE IMPLEMENTAR:**

---

## 📧 1. CONFIGURACIÓN DE CORREO ELECTRÓNICO

### **Paso 1: Configurar .env**
Agregar al archivo `eva-backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=evagestionalamedicina@gmail.com
MAIL_PASSWORD="ddqd vsvu innh dggl"
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=evagestionalamedicina@gmail.com
MAIL_FROM_NAME="EVA - Sistema de Gestión"
```

### **Paso 2: Limpiar caché de configuración**
```bash
cd eva-backend
php artisan config:clear
php artisan config:cache
```

### **Paso 3: Crear Mailables (Clases de Email)**

#### **A. RepuestoPendienteEmail.php**
```php
<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RepuestoPendienteEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $preventivo;
    public $equipo;

    public function __construct($preventivo, $equipo)
    {
        $this->preventivo = $preventivo;
        $this->equipo = $equipo;
    }

    public function build()
    {
        return $this->subject('Repuesto Pendiente - Preventivo #' . $this->preventivo->id)
                    ->view('emails.repuesto-pendiente');
    }
}
```

#### **B. NuevoTicketEmail.php**
```php
<?php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NuevoTicketEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $ticket;
    public $equipo;

    public function __construct($ticket, $equipo)
    {
        $this->ticket = $ticket;
        $this->equipo = $equipo;
    }

    public function build()
    {
        return $this->subject('Nuevo Ticket #' . $this->ticket->id)
                    ->view('emails.nuevo-ticket');
    }
}
```

### **Paso 4: Crear Vistas de Email (Blade Templates)**

Crear en `eva-backend/resources/views/emails/`:

#### **repuesto-pendiente.blade.php**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4472C4; color: white; padding: 20px; }
        .content { padding: 20px; background: #f5f5f5; }
        .footer { padding: 10px; text-align: center; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>⚠️ Repuesto Pendiente - Preventivo #{{ $preventivo->id }}</h2>
        </div>
        <div class="content">
            <p><strong>Equipo:</strong> {{ $equipo->name }}</p>
            <p><strong>Código:</strong> {{ $equipo->code }}</p>
            <p><strong>Serie:</strong> {{ $equipo->serial }}</p>
            <p><strong>Ubicación:</strong> {{ $equipo->servicio_nombre }} - {{ $equipo->area_nombre }}</p>
            <p><strong>Repuesto:</strong> {{ $preventivo->repuesto_descripcion }}</p>
            <p><strong>Observaciones:</strong> {{ $preventivo->observacion }}</p>
        </div>
        <div class="footer">
            <p>Sistema EVA - Hospital Universitario del Valle</p>
        </div>
    </div>
</body>
</html>
```

### **Paso 5: Crear Endpoints de Notificaciones**

Agregar en `eva-backend/routes/api.php`:

```php
// Notificaciones por correo
Route::prefix('v1/notifications')->group(function () {
    
    // Enviar notificación de repuesto pendiente
    Route::post('repuesto-pendiente', function (Request $request) {
        try {
            $preventivo = DB::table('mantenimiento')->where('id', $request->preventivo_id)->first();
            $equipo = DB::table('equipos')->where('id', $preventivo->equipo_id)->first();
            
            // Obtener usuarios del servicio
            $usuarios = DB::table('usuarios')
                ->where('servicio_id', $equipo->servicio_id)
                ->whereNotNull('email')
                ->get();
            
            foreach ($usuarios as $usuario) {
                Mail::to($usuario->email)->send(new RepuestoPendienteEmail($preventivo, $equipo));
            }
            
            return response()->json(['success' => true, 'message' => 'Notificaciones enviadas']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    });
    
    // Enviar notificación de nuevo ticket
    Route::post('nuevo-ticket', function (Request $request) {
        try {
            $ticket = DB::table('ordenes')->where('id', $request->ticket_id)->first();
            $equipo = DB::table('equipos')->where('id', $ticket->equipo_id)->first();
            
            // Obtener técnicos asignados
            $tecnicos = DB::table('tecnicos')
                ->whereNotNull('email')
                ->get();
            
            foreach ($tecnicos as $tecnico) {
                Mail::to($tecnico->email)->send(new NuevoTicketEmail($ticket, $equipo));
            }
            
            return response()->json(['success' => true, 'message' => 'Notificaciones enviadas']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    });
});
```

---

## 📊 2. CARGA MASIVA DE CRONOGRAMA

### **Endpoint de Upload Excel**

Ya existe en el hook `useMantenimientoData`, pero necesita el endpoint backend:

```php
Route::post('v1/planes-mantenimientos/upload-excel', function (Request $request) {
    try {
        $request->validate([
            'archivo' => 'required|file|mimes:xlsx,xls',
            'anio' => 'required|integer|min:2019|max:2030',
            'reemplazar' => 'required|boolean'
        ]);
        
        $file = $request->file('archivo');
        $anio = $request->input('anio');
        $reemplazar = $request->input('reemplazar');
        
        // Cargar Excel
        $spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load($file->getRealPath());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();
        
        $insertados = 0;
        $errores = [];
        
        // Si reemplazar = true, eliminar registros del año
        if ($reemplazar) {
            DB::table('planes_mantenimientos')->where('anio', $anio)->delete();
        }
        
        // Procesar filas (desde fila 2, sin headers)
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            
            $equipoId = $row[0]; // Columna A
            $mes1 = $row[1];     // Columna B
            $mes2 = $row[2] ?? null; // Columna C
            $mes3 = $row[3] ?? null; // Columna D
            $responsable = $row[4] ?? ''; // Columna E
            $frecuencia = $row[5] ?? 'ANUAL'; // Columna F
            
            // Validar que el equipo existe
            $equipo = DB::table('equipos')->where('id', $equipoId)->first();
            if (!$equipo) {
                $errores[] = "Fila " . ($i + 1) . ": Equipo ID $equipoId no encontrado";
                continue;
            }
            
            // Insertar plan
            DB::table('planes_mantenimientos')->insert([
                'equipo_id' => $equipoId,
                'anio' => $anio,
                'mes1' => $mes1,
                'mes2' => $mes2,
                'mes3' => $mes3,
                'responsable' => $responsable,
                'frecuencia' => $frecuencia,
                'usuario_id' => auth()->id() ?? 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            $insertados++;
        }
        
        // Actualizar estados automáticamente
        // updateEstadoAutomatico();
        
        return response()->json([
            'success' => true,
            'message' => "Se insertaron $insertados registros",
            'insertados' => $insertados,
            'errores' => $errores
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Error en upload Excel: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Error al procesar archivo: ' . $e->getMessage()
        ], 500);
    }
});
```

---

## 🧪 3. PRUEBAS

### **Probar Configuración de Correo:**

```bash
cd eva-backend
php artisan tinker
```

```php
Mail::raw('Test email from EVA', function ($message) {
    $message->to('tu-email@example.com')
            ->subject('Test Email');
});
```

### **Probar Endpoint de Notificación:**

```bash
curl -X POST http://localhost:8001/api/v1/notifications/repuesto-pendiente \
  -H "Content-Type: application/json" \
  -d '{"preventivo_id": 1}'
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración de Correo:
- [ ] Agregar variables al .env
- [ ] Limpiar caché de configuración
- [ ] Crear clases Mailable
- [ ] Crear vistas Blade de emails
- [ ] Crear endpoints de notificaciones
- [ ] Probar envío de correo de prueba

### Carga Masiva:
- [ ] Verificar endpoint de upload existe
- [ ] Validar formato de Excel
- [ ] Implementar lógica de reemplazo
- [ ] Actualizar estados automáticamente
- [ ] Registrar usuario que carga
- [ ] Manejo de errores

### Frontend:
- [ ] Verificar formulario de carga
- [ ] Validaciones de año y archivo
- [ ] Feedback visual de carga
- [ ] Mensajes de éxito/error
- [ ] Actualización automática de tabla

---

**Fecha:** 2025-10-02  
**Estado:** Documentación completa - Listo para implementar
