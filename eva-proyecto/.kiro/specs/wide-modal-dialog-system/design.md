# Design Document - Solución Simple

## Overview

Solución directa: usar clases CSS con `!important` para anular las restricciones de ancho del `DialogContent` por defecto.

## Architecture

### Enfoque Simple
1. **CSS Override Directo**: Usar `!max-w-none` para anular `max-w-lg`
2. **Clases Específicas**: Aplicar `w-[85vw] !max-w-none` directamente al DialogContent
3. **Sin Componentes Nuevos**: Modificar solo el modal existente

## Components and Interfaces

### Solución CSS
```css
/* Clases a aplicar */
w-[85vw] !max-w-none sm:!max-w-none md:!max-w-none lg:!max-w-none xl:!max-w-none
```

### Implementación
- Modificar solo el `className` del `DialogContent` en calibration-modal.jsx
- Agregar clases que anulen las restricciones por defecto
- Mantener responsividad para móviles

## Error Handling

### Si !important no funciona
- Usar estilos inline como fallback
- Crear clase CSS personalizada en archivo CSS

## Testing Strategy

### Manual Testing
1. Abrir modal de calibraciones
2. Verificar que ocupe 85% del ancho
3. Verificar que la tabla se vea completa
4. Probar en diferentes tamaños de pantalla