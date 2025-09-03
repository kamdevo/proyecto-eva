# Design Document - Mejoras Modal Calibraciones

## Overview

Mejoras integrales al modal de calibraciones enfocadas en simplicidad de diseño, exportación Excel formateada, filtros funcionales, paginación completa y acceso a archivos.

## Architecture

### Componentes a Modificar
1. **Modal UI**: Simplificar colores y diseño
2. **Export Service**: Mejorar formato Excel con bordes y colores
3. **Filter System**: Arreglar filtros de búsqueda, mes y año
4. **Pagination**: Implementar paginación completa
5. **File Access**: Configurar acceso a archivos de calibraciones

## Components and Interfaces

### 1. Diseño Simplificado
```css
/* Colores simples */
- Header: bg-white con border simple
- Table header: bg-gray-100 (sin gradientes)
- Buttons: colores estándar de la app
- Filters: diseño simple sin fondos especiales
```

### 2. Export Excel Formateado
```php
// En CalibracionesReportService
- Bordes en todas las celdas
- Header con fondo gris (#F3F4F6) y texto bold
- Filas alternadas con color suave
- Ancho de columnas optimizado
- Formato de fechas consistente
```

### 3. Sistema de Filtros
```javascript
// Filtros funcionales
- searchTerm: filtro en tiempo real
- monthFilter: filtro por mes (1-12)
- yearFilter: filtro por año
- Combinación de filtros
- Reset de filtros
```

### 4. Paginación Completa
```javascript
// Controles de paginación
- Primera página (<<)
- Página anterior (<)
- Números de página (1, 2, 3...)
- Página siguiente (>)
- Última página (>>)
- Información de registros
```

### 5. Acceso a Archivos
```javascript
// Configuración de rutas
- Base URL: /storage/calibraciones/
- Validación de archivos existentes
- Manejo de errores para archivos no encontrados
```

## Data Models

### Filter State
```javascript
{
  searchTerm: string,
  monthFilter: string, // "1"-"12" o ""
  yearFilter: string,  // "2020"-"2024" o ""
  currentPage: number,
  itemsPerPage: number
}
```

### Export Configuration
```php
[
  'borders' => true,
  'headerStyle' => ['background' => '#F3F4F6', 'bold' => true],
  'alternateRows' => true,
  'columnWidths' => [18, 20, 18, 15, 25, 40, 12, 20, 30]
]
```

## Error Handling

### File Access Errors
- Archivo no encontrado: mostrar mensaje "Archivo no disponible"
- Error de permisos: mostrar mensaje de error apropiado
- Timeout: mostrar mensaje de timeout

### Filter Errors
- Datos inválidos: ignorar y mantener filtro anterior
- Error de red: mostrar mensaje de error
- Sin resultados: mostrar mensaje "No se encontraron registros"

## Testing Strategy

### Manual Testing
1. **Diseño**: Verificar colores simples y consistencia
2. **Export**: Descargar Excel y verificar formato
3. **Filtros**: Probar cada filtro individualmente y combinados
4. **Paginación**: Navegar por todas las páginas
5. **Archivos**: Probar acceso a documentos existentes y no existentes