# Documentación de Servicios Especializados de Exportación

## 📋 Resumen

Los servicios especializados de exportación fueron creados como parte de la refactorización del `ExportController` para mejorar la arquitectura, mantenibilidad y escalabilidad del sistema. Cada servicio maneja un dominio específico de reportes.

## 🏗️ Arquitectura

### Clase Base: `ExportServiceBase`

**Ubicación**: `app/Services/Export/ExportServiceBase.php`

**Propósito**: Proporciona funcionalidades comunes para todos los servicios de exportación.

#### Métodos Principales:
- `exportToExcel($data, $filename)` - Exportación a Excel
- `exportToCSV($data, $filename)` - Exportación a CSV  
- `exportToPDF($data, $titulo)` - Exportación a PDF
- `validateExportRequest($request, $rules)` - Validación común
- `executeExport($data, $titulo, $formato, $filename)` - Ejecutor de exportación
- `formatDate($date, $format)` - Formateo de fechas
- `formatDateTime($date, $format)` - Formateo de fecha y hora

---

## 🔧 Servicios Especializados

### 1. EquiposReportService

**Ubicación**: `app/Services/Export/Reports/EquiposReportService.php`

**Responsabilidad**: Maneja reportes relacionados con equipos médicos e industriales.

#### Métodos Públicos:

##### `exportEquiposConsolidado(Request $request)`
- **Descripción**: Genera reporte consolidado de equipos seleccionados
- **Parámetros**:
  - `equipos_ids` (array): IDs de equipos a incluir
  - `formato` (string): pdf|excel|csv
  - `incluir` (object): Opciones de información a incluir
    - `detalles_equipo` (boolean)
    - `cronograma` (boolean)
    - `cumplimiento` (boolean)
    - `responsables` (boolean)
    - `estadisticas` (boolean)
- **Retorna**: Archivo de reporte o respuesta JSON para PDF

##### `exportEquiposCriticos(Request $request)`
- **Descripción**: Genera reporte de equipos clasificados como críticos
- **Parámetros**:
  - `formato` (string): pdf|excel|csv
- **Retorna**: Archivo de reporte con equipos críticos

#### Métodos Privados:
- `prepareConsolidatedData($equipos, $incluir)` - Prepara datos consolidados
- `prepareEquiposCriticosData($equipos)` - Prepara datos de equipos críticos

---

### 2. MantenimientoReportService

**Ubicación**: `app/Services/Export/Reports/MantenimientoReportService.php`

**Responsabilidad**: Maneja reportes de mantenimientos y estadísticas de cumplimiento.

#### Métodos Públicos:

##### `exportPlantillaMantenimiento(Request $request)`
- **Descripción**: Genera plantilla de mantenimientos programados
- **Parámetros**:
  - `año` (integer): Año de la plantilla (2020-2030)
  - `mes` (integer, opcional): Mes específico (1-12)
  - `servicio_id` (integer, opcional): ID del servicio
  - `formato` (string): pdf|excel
- **Retorna**: Plantilla de mantenimientos

##### `exportEstadisticasCumplimiento(Request $request)`
- **Descripción**: Genera estadísticas de cumplimiento de mantenimientos
- **Parámetros**:
  - `año` (integer): Año de las estadísticas (2020-2030)
  - `servicio_id` (integer, opcional): ID del servicio
  - `formato` (string): pdf|excel
- **Retorna**: Reporte de estadísticas

#### Métodos Privados:
- `preparePlantillaData($mantenimientos)` - Prepara datos de plantilla
- `prepareEstadisticasData($resumen)` - Prepara datos de estadísticas

---

### 3. ContingenciasReportService

**Ubicación**: `app/Services/Export/Reports/ContingenciasReportService.php`

**Responsabilidad**: Maneja reportes de contingencias y eventos adversos.

#### Métodos Públicos:

##### `exportContingencias(Request $request)`
- **Descripción**: Genera reporte de contingencias en rango de fechas
- **Parámetros**:
  - `fecha_desde` (date): Fecha de inicio
  - `fecha_hasta` (date): Fecha de fin
  - `estado` (string, opcional): Activa|En Proceso|Resuelta
  - `severidad` (string, opcional): Baja|Media|Alta|Crítica
  - `formato` (string): pdf|excel|csv
- **Retorna**: Reporte de contingencias

#### Métodos Privados:
- `prepareContingenciasData($contingencias)` - Prepara datos de contingencias

---

### 4. CalibracionesReportService

**Ubicación**: `app/Services/Export/Reports/CalibracionesReportService.php`

**Responsabilidad**: Maneja reportes de calibraciones de equipos.

#### Métodos Públicos:

##### `exportCalibraciones(Request $request)`
- **Descripción**: Genera reporte de calibraciones por año
- **Parámetros**:
  - `año` (integer): Año de las calibraciones (2020-2030)
  - `mes` (integer, opcional): Mes específico (1-12)
  - `estado` (string, opcional): programada|completada|vencida
  - `formato` (string): pdf|excel|csv
- **Retorna**: Reporte de calibraciones

#### Métodos Privados:
- `prepareCalibracionesData($calibraciones)` - Prepara datos de calibraciones

---

### 5. InventarioReportService

**Ubicación**: `app/Services/Export/Reports/InventarioReportService.php`

**Responsabilidad**: Maneja reportes de inventario de repuestos y tickets.

#### Métodos Públicos:

##### `exportInventarioRepuestos(Request $request)`
- **Descripción**: Genera reporte del inventario de repuestos
- **Parámetros**:
  - `categoria` (string, opcional): Categoría de repuesto
  - `bajo_stock` (boolean, opcional): Solo repuestos con bajo stock
  - `criticos` (boolean, opcional): Solo repuestos críticos
  - `formato` (string): pdf|excel|csv
- **Retorna**: Reporte de inventario

##### `exportTickets(Request $request)`
- **Descripción**: Genera reporte de tickets en rango de fechas
- **Parámetros**:
  - `fecha_desde` (date): Fecha de inicio
  - `fecha_hasta` (date): Fecha de fin
  - `estado` (string, opcional): abierto|en_proceso|pendiente|resuelto|cerrado
  - `categoria` (string, opcional): Categoría del ticket
  - `formato` (string): pdf|excel|csv
- **Retorna**: Reporte de tickets

#### Métodos Privados:
- `prepareRepuestosData($repuestos)` - Prepara datos de repuestos
- `prepareTicketsData($tickets)` - Prepara datos de tickets

---

## 🔄 Patrón de Inyección de Dependencias

### ExportController

El controlador principal actúa como coordinador y utiliza inyección de dependencias:

```php
public function __construct(
    EquiposReportService $equiposReportService,
    MantenimientoReportService $mantenimientoReportService,
    ContingenciasReportService $contingenciasReportService,
    CalibracionesReportService $calibracionesReportService,
    InventarioReportService $inventarioReportService
) {
    // Asignación de servicios
}
```

### Delegación de Métodos

Cada método del controlador delega al servicio correspondiente:

```php
public function exportEquiposConsolidado(Request $request)
{
    return $this->equiposReportService->exportEquiposConsolidado($request);
}
```

---

## 🧪 Testing

### Tests Disponibles

1. **ExportEndpointsVerificationTest.php** - Tests de endpoints
2. **Scripts de verificación** - Verificación manual
3. **Tests de instanciación** - Verificación de inyección de dependencias

### Cobertura de Tests

- ✅ Instanciación de servicios
- ✅ Métodos públicos existentes
- ✅ Validación de parámetros
- ✅ Formatos de exportación
- ✅ Respuestas HTTP

---

## 📈 Beneficios de la Arquitectura

### Mantenibilidad
- **Separación clara de responsabilidades**
- **Código organizado por dominio**
- **Fácil localización de funcionalidades**

### Escalabilidad
- **Fácil agregar nuevos tipos de reportes**
- **Servicios independientes y reutilizables**
- **Extensibilidad sin afectar código existente**

### Testabilidad
- **Servicios independientes fáciles de testear**
- **Mocking simplificado para tests unitarios**
- **Aislamiento de funcionalidades**

### Reutilización
- **Funcionalidades comunes en clase base**
- **Servicios reutilizables en otros contextos**
- **Eliminación de duplicación de código**

---

## 🚀 Uso y Ejemplos

### Ejemplo de Uso desde Frontend

```javascript
// Exportar equipos consolidado
const response = await api.post('/export/equipos-consolidado', {
  equipos_ids: [1, 2, 3],
  formato: 'excel',
  incluir: {
    detalles_equipo: true,
    cronograma: true,
    cumplimiento: true,
    responsables: true,
    estadisticas: true
  }
});

// Exportar contingencias
const response = await api.post('/export/contingencias', {
  fecha_desde: '2024-01-01',
  fecha_hasta: '2024-12-31',
  estado: 'Activa',
  formato: 'pdf'
});
```

### Ejemplo de Extensión

Para agregar un nuevo tipo de reporte:

1. Crear nuevo servicio extendiendo `ExportServiceBase`
2. Implementar métodos específicos del dominio
3. Agregar inyección de dependencia en `ExportController`
4. Crear método delegador en el controlador
5. Agregar ruta en `api.php`

---

## 📝 Notas de Implementación

- **Todos los servicios extienden `ExportServiceBase`**
- **Validaciones consistentes usando `validateExportRequest()`**
- **Formateo de fechas estandarizado**
- **Manejo de errores unificado**
- **Compatibilidad 100% con API existente**
