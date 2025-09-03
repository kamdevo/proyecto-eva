# Implementation Plan - Mejoras Modal Calibraciones

- [x] 1. Simplificar diseño del modal

  - Remover gradientes y colores excesivos del header y filtros
  - Cambiar a colores simples: bg-white, bg-gray-100, borders simples
  - Hacer diseño consistente con otros modales de la aplicación
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 1.1 Simplificar header y controles del modal

  - Cambiar header de gradiente azul a bg-white con border simple
  - Simplificar botones a estilos estándar de la app
  - Remover fondos especiales de la sección de filtros
  - _Requirements: 1.1, 1.2_

- [ ] 1.2 Simplificar tabla y estilos

  - Cambiar header de tabla de gradiente azul a bg-gray-100 simple

  - Mantener zebra striping pero con colores más suaves
  - Usar colores estándar para botones de acciones
  - _Requirements: 1.2, 1.3_

- [x] 2. Mejorar exportación Excel con formato profesional

  - Modificar CalibracionesReportService para agregar bordes y formato
  - Implementar header con fondo gris y texto en negrita
  - Agregar filas alternadas y ancho de columnas optimizado
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.1 Actualizar CalibracionesReportService con formato Excel

  - Modificar método exportCalibraciones para usar formato avanzado
  - Implementar WithStyles interface para bordes y colores
  - Agregar WithColumnWidths para anchos optimizados
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 2.2 Implementar estilos de Excel profesionales

  - Header con fondo gris (#F3F4F6) y texto bold
  - Bordes en todas las celdas (thin black borders)
  - Filas alternadas con color suave (#F8F9FA)

  - Centrar alineación en columnas específicas
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3. Arreglar sistema de filtros

  - Corregir filtro de búsqueda para que funcione en tiempo real

  - Implementar filtros de mes y año que funcionen correctamente
  - Asegurar que filtros se combinen apropiadamente
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 3.1 Corregir filtro de búsqueda en tiempo real

  - Verificar que applyFilters funcione correctamente con searchTerm
  - Asegurar búsqueda en campos: código, equipo, marca, serie
  - Implementar debounce si es necesario para performance
  - _Requirements: 3.1_

- [ ] 3.2 Implementar filtros de mes y año funcionales

  - Corregir lógica de filtro por mes (comparar correctamente con fecha_calibracion)
  - Corregir lógica de filtro por año
  - Asegurar que filtros vacíos no afecten los resultados
  - _Requirements: 3.2, 3.3_

- [x] 3.3 Verificar combinación de filtros

  - Probar que búsqueda + mes + año funcionen juntos
  - Implementar reset de filtros que funcione correctamente
  - Mantener estado de filtros durante navegación de páginas
  - _Requirements: 3.4_

- [x] 4. Implementar paginación completa

  - Agregar controles de primera página (<<) y última página (>>)
  - Mostrar números de página correctamente
  - Implementar navegación que mantenga filtros
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4.1 Completar controles de paginación

  - Agregar botones de primera página (ChevronsLeft) y última página (ChevronsRight)
  - Implementar lógica para ir a primera y última página
  - Asegurar que botones se deshabiliten apropiadamente
  - _Requirements: 4.1, 4.2_

- [x] 4.2 Mejorar display de números de página

  - Mostrar rango de páginas visible (ej: 1...5,6,7,8,9...15)
  - Implementar ellipsis (...) para rangos grandes
  - Centrar página actual en el rango visible
  - _Requirements: 4.2_

- [x] 4.3 Mantener filtros durante navegación

  - Asegurar que filtros se mantengan al cambiar página
  - Actualizar información de registros mostrados correctamente
  - Resetear a página 1 cuando se cambian filtros
  - _Requirements: 4.3, 4.4_

- [x] 5. Configurar acceso a archivos de calibraciones

  - Verificar ruta de archivos: storage/app/public/calibraciones
  - Configurar URL correcta para acceso desde frontend
  - Implementar manejo de errores para archivos no encontrados
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5.1 Verificar configuración de storage y rutas

  - Confirmar que archivos están en storage/app/public/calibraciones
  - Verificar que storage link está configurado correctamente
  - Probar acceso a archivos desde URL /storage/calibraciones/
  - _Requirements: 5.1, 5.2_

- [x] 5.2 Implementar manejo de errores para archivos

  - Agregar validación de existencia de archivo antes de abrir
  - Mostrar mensaje apropiado cuando archivo no existe
  - Implementar fallback para errores de acceso
  - _Requirements: 5.2, 5.3_

- [ ] 6. Testing y validación final
  - Probar todas las funcionalidades implementadas
  - Verificar que exportación Excel tiene formato correcto
  - Validar que filtros y paginación funcionan correctamente
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_
