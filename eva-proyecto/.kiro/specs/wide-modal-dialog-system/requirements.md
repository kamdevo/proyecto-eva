# Requirements Document - Solución Simple para Modal Ancho

## Introduction

El modal de calibraciones se ve angosto porque el componente `DialogContent` tiene clases CSS `max-w-lg` y `sm:max-w-lg` que limitan el ancho máximo. Necesitamos una solución simple y rápida para permitir modales más anchos.

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero poder hacer modales más anchos de forma simple, para que los usuarios puedan ver mejor las tablas y contenido.

#### Acceptance Criteria

1. WHEN aplico clases CSS de ancho THEN el modal SHALL mostrar el ancho especificado sin ser limitado por max-w-lg
2. WHEN uso !max-w-none THEN SHALL anular las restricciones de ancho por defecto
3. WHEN especifico w-[85vw] THEN el modal SHALL ocupar 85% del ancho de la pantalla

### Requirement 2

**User Story:** Como usuario, quiero que el modal de calibraciones use más espacio de pantalla, para ver mejor la tabla y filtros.

#### Acceptance Criteria

1. WHEN abro el modal de calibraciones THEN SHALL ocupar al menos 85% del ancho de pantalla en desktop
2. WHEN veo la tabla THEN todas las columnas SHALL ser visibles sin scroll horizontal
3. WHEN uso los filtros THEN SHALL tener espacio adecuado sin verse apretados
