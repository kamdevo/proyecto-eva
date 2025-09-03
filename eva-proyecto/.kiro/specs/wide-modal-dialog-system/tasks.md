# Implementation Plan - Solución Simple

- [ ] 1. Aplicar clases CSS override al modal de calibraciones
  - Modificar el className del DialogContent en calibration-modal.jsx
  - Agregar clases w-[85vw] !max-w-none para anular restricciones por defecto
  - Probar que el modal se vea más ancho
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.1 Modificar className del DialogContent
  - Cambiar className actual por uno que incluya w-[85vw] !max-w-none
  - Agregar clases responsive para diferentes breakpoints
  - Mantener clases existentes para altura y otros estilos
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 Probar y ajustar si es necesario
  - Abrir modal y verificar ancho en navegador
  - Si no funciona, agregar estilos inline como fallback
  - Ajustar para móviles si es necesario
  - _Requirements: 1.3, 2.1, 2.2_

- [ ] 1.3 Verificar tabla y filtros se ven mejor
  - Comprobar que tabla no necesita scroll horizontal
  - Verificar que filtros tienen espacio adecuado
  - Probar paginación se ve bien
  - _Requirements: 2.1, 2.2, 2.3_