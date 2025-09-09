# Informe Funcional - SECOP en Página de Órdenes de Compra

## Resumen Ejecutivo

Este informe documenta la funcionalidad del Sistema Electrónico de Contratación Pública (SECOP) integrada en la página de órdenes de compra del sistema EVA-ORG del Hospital Universitario del Valle. La integración permite consultar, gestionar y vincular procesos de contratación pública con el inventario de equipos biomédicos de la institución.

## 1. Descripción General del Sistema SECOP

### 1.1 Propósito de la Integración
La funcionalidad SECOP en la página de órdenes de compra tiene como objetivo:
- Consultar procesos de contratación pública en tiempo real
- Vincular órdenes de compra internas con procesos SECOP
- Mantener trazabilidad de adquisiciones públicas
- Garantizar transparencia en procesos de compra

### 1.2 Alcance Funcional
El sistema gestiona cuatro tipos de soportes de compra:
- **Órdenes de Compra**: Procesos de adquisición directa
- **Contratos**: Acuerdos formales de suministro
- **Cruces de Cuentas**: Compensaciones contables
- **Comodatos**: Préstamos de equipos

## 2. Estructura de Datos del Sistema

### 2.1 Información de Órdenes de Compra

#### 2.1.1 Datos Principales
| Campo | Descripción | Características |
|-------|-------------|-----------------|
| **Código/Número** | Identificador único del soporte | Obligatorio, único en sistema |
| **Fecha** | Fecha de emisión del soporte | Formato estándar |
| **Proveedor** | Empresa o persona que suministra | Selección de catálogo |
| **Tipo de Compra** | Clasificación del soporte | Obligatorio |
| **URL SECOP** | Enlace al proceso público | Opcional, vinculación externa |
| **Archivo** | Documento de respaldo | Opcional, múltiples formatos |

#### 2.1.2 Tipos de Compra Configurados
1. **Órdenes de Compra**: Adquisiciones directas de bienes y servicios
2. **Contratos**: Acuerdos formales de suministro a largo plazo
3. **Cruces de Cuentas**: Compensaciones y ajustes contables
4. **Comodatos**: Préstamos de equipos sin transferencia de propiedad

### 2.2 Información de Proveedores
- **Nombre**: Razón social o nombre del proveedor
- **Datos de Contacto**: Teléfono y correo electrónico
- **Estado**: Activo o inactivo en el sistema
- **Tipo**: Clasificación como proveedor

### 2.3 Vinculación con Equipos
- **Relación**: Cada equipo puede asociarse a una orden de compra
- **Trazabilidad**: Seguimiento desde adquisición hasta ubicación actual
- **Conteo**: Número de equipos asociados por orden

## 3. Funcionalidad de Consulta SECOP

### 3.1 Acceso a Información Pública

#### 3.1.1 Fuente de Datos
- **Plataforma**: Portal de Datos Abiertos del Gobierno Colombiano
- **Entidad**: Hospital Universitario del Valle Evaristo García
- **Cobertura**: Procesos de contratación pública de la institución

#### 3.1.2 Información Consultada
| Campo SECOP | Descripción |
|-------------|-------------|
| **UID** | Identificador único del proceso |
| **Número del Contrato** | Código oficial del proceso |
| **Nombre del Proceso** | Descripción del objeto contractual |
| **Fecha de Publicación** | Fecha de publicación en SECOP |

### 3.2 Proceso de Consulta

#### 3.2.1 Flujo de Consulta SECOP
1. **Activación**: Usuario solicita consulta SECOP
2. **Conexión**: Sistema se conecta a plataforma gubernamental
3. **Filtrado**: Búsqueda específica por entidad hospitalaria
4. **Presentación**: Resultados mostrados en tabla organizada
5. **Selección**: Usuario puede elegir procesos específicos

#### 3.2.2 Criterios de Búsqueda
- **Entidad específica**: Valle del Cauca - ESE Hospital Universitario del Valle
- **Límite de resultados**: Máximo 10,000 procesos
- **Ordenamiento**: Por fecha de publicación (más recientes primero)

## 4. Estructura de la Página Principal

### 4.1 Encabezado y Navegación
- **Título**: "Órdenes de Compra"
- **Subtítulo**: "Listado"
- **Contexto**: Módulo de gestión de soportes de compra

### 4.2 Herramientas de Gestión

#### 4.2.1 Botones de Acción
| Función | Propósito | Resultado |
|---------|-----------|-----------|
| **Agregar** | Crear nueva orden de compra | Modal de creación |
| **Consultar SECOP** | Acceder a procesos públicos | Modal de consulta externa |
| **Exportar** | Generar reporte completo | Archivo de exportación |

### 4.3 Tabla Principal de Órdenes

#### 4.3.1 Columnas de Información
| Columna | Contenido | Funcionalidad |
|---------|-----------|---------------|
| **Código/Número** | Identificador + enlace SECOP | Acceso directo a proceso público |
| **Tipo de Compra** | Clasificación del soporte | Identificación visual |
| **Fecha** | Fecha de emisión | Ordenamiento cronológico |
| **Archivo** | Documento adjunto | Descarga directa |
| **Proveedor** | Nombre del suministrador | Información de contacto |
| **Acciones** | Opciones de gestión | Editar, asociar, consultar |

#### 4.3.2 Funcionalidades de Navegación
- **Paginación**: Navegación por páginas de resultados
- **Búsqueda**: Filtrado en tiempo real por cualquier campo
- **Ordenamiento**: Clasificación por columnas
- **Persistencia**: Conservación de configuración entre sesiones

## 5. Modalidades de Interacción

### 5.1 Consulta de Procesos SECOP

#### 5.1.1 Ventana de Consulta Externa
- **Título**: "Procesos de contratación SECOP"
- **Tamaño**: Ventana amplia para visualización completa
- **Contenido**: Tabla con procesos de contratación pública

#### 5.1.2 Información Mostrada
- **Identificador único**: Código interno del proceso
- **Número de contrato**: Numeración oficial con enlace directo
- **Descripción**: Objeto del proceso de contratación
- **Fecha**: Momento de publicación en plataforma

#### 5.1.3 Funcionalidades de Consulta
- **Búsqueda**: Filtrado por términos específicos
- **Ordenamiento**: Por fecha de publicación
- **Selección**: Elección de procesos para vinculación
- **Navegación**: Paginación de resultados extensos

### 5.2 Creación de Órdenes de Compra

#### 5.2.1 Formulario de Registro
| Campo | Tipo | Obligatorio | Validaciones |
|-------|------|-------------|--------------|
| **Código** | Texto | Sí | Único, mínimo 4 caracteres |
| **Fecha** | Fecha | No | Formato válido |
| **Proveedor** | Selección | No | Proveedores activos |
| **Tipo de Compra** | Selección | Sí | Tipos configurados |
| **URL SECOP** | Enlace | No | Formato de URL válido |
| **Archivo** | Documento | No | Múltiples formatos |

#### 5.2.2 Proceso de Creación
1. **Apertura**: Usuario activa formulario de creación
2. **Completado**: Ingreso de información requerida
3. **Validación**: Verificación de datos obligatorios y únicos
4. **Almacenamiento**: Guardado en sistema
5. **Confirmación**: Notificación de éxito y actualización de lista

### 5.3 Edición de Órdenes Existentes

#### 5.3.1 Modificación de Datos
- **Carga automática**: Información actual pre-poblada
- **Campos editables**: Todos excepto identificador interno
- **Validaciones**: Mantenimiento de unicidad y formato
- **Actualización**: Cambios reflejados inmediatamente

#### 5.3.2 Gestión de Archivos
- **Visualización**: Archivo actual mostrado si existe
- **Reemplazo**: Opción de cambiar documento adjunto
- **Eliminación**: Posibilidad de quitar archivo
- **Formatos**: Aceptación de múltiples tipos de documento

### 5.4 Consulta de Soportes Internos

#### 5.4.1 Visualización por Tipo
- **Órdenes de Compra**: Listado específico tipo 1
- **Contratos**: Listado específico tipo 2
- **Cruces de Cuentas**: Listado específico tipo 3
- **Comodatos**: Listado específico tipo 4

#### 5.4.2 Información de Consulta
| Campo | Descripción |
|-------|-------------|
| **Código** | Identificador con opción de selección |
| **Fecha** | Fecha de emisión del soporte |
| **Proveedor** | Nombre del suministrador |
| **Archivo** | Enlace de descarga si existe |

## 6. Flujos Operativos Principales

### 6.1 Flujo de Consulta SECOP Completo

#### 6.1.1 Secuencia de Operaciones
```
Inicio → Acceso a Página → Botón Consultar SECOP → 
Conexión Externa → Filtrado por Entidad → 
Presentación de Resultados → Selección Opcional → 
Vinculación con Orden Interna → Fin
```

#### 6.1.2 Pasos Detallados
1. **Acceso**: Usuario ingresa a página de órdenes de compra
2. **Activación**: Clic en botón "Consultar SECOP"
3. **Procesamiento**: Sistema consulta plataforma gubernamental
4. **Filtrado**: Búsqueda específica por Hospital Universitario del Valle
5. **Presentación**: Resultados en tabla organizada y paginada
6. **Interacción**: Usuario puede buscar, ordenar y seleccionar
7. **Vinculación**: Opción de asociar proceso SECOP con orden interna

### 6.2 Flujo de Gestión de Órdenes

#### 6.2.1 Creación de Nueva Orden
```
Inicio → Botón Agregar → Formulario → Validación → 
Subida de Archivo → Almacenamiento → Actualización Lista → Fin
```

#### 6.2.2 Edición de Orden Existente
```
Inicio → Selección de Orden → Botón Editar → 
Carga de Datos → Modificación → Validación → 
Actualización → Confirmación → Fin
```

### 6.3 Flujo de Asociación con Equipos

#### 6.3.1 Asociación Individual
```
Equipo → Selección de Orden → Consulta de Soportes → 
Elección Específica → Vinculación → Confirmación
```

#### 6.3.2 Asociación Múltiple
```
Orden de Compra → Botón Asociar → Lista de Equipos → 
Selección Múltiple → Vinculación Masiva → Actualización Contadores
```

## 7. Gestión Documental

### 7.1 Manejo de Archivos Adjuntos

#### 7.1.1 Características de Almacenamiento
- **Ubicación**: Directorio específico para órdenes de compra
- **Formatos**: Aceptación de todos los tipos de archivo
- **Nomenclatura**: Nombres seguros para prevenir conflictos
- **Acceso**: Enlaces directos para descarga

#### 7.1.2 Proceso de Subida
1. **Selección**: Usuario elige archivo desde su dispositivo
2. **Validación**: Verificación de formato y tamaño
3. **Almacenamiento**: Guardado en directorio específico
4. **Registro**: Vinculación con orden de compra
5. **Acceso**: Generación de enlace de descarga

### 7.2 Seguridad Documental
- **Nombres encriptados**: Prevención de acceso no autorizado
- **Validación de tipos**: Control de archivos potencialmente peligrosos
- **Respaldo**: Inclusión en copias de seguridad regulares
- **Acceso controlado**: Solo usuarios autorizados pueden descargar

## 8. Indicadores y Métricas del Sistema

### 8.1 Métricas de Órdenes de Compra

#### 8.1.1 Contadores Principales
| Indicador | Descripción | Utilidad |
|-----------|-------------|----------|
| **Total de Órdenes** | Cantidad total por tipo | Volumen de gestión |
| **Equipos Asociados** | Número de equipos vinculados | Trazabilidad |
| **Documentación** | Órdenes con archivos adjuntos | Completitud |
| **Vinculación SECOP** | Órdenes con URL pública | Transparencia |

#### 8.1.2 Análisis de Distribución
- **Por tipo de compra**: Distribución porcentual de soportes
- **Por proveedor**: Concentración de adquisiciones
- **Por período**: Tendencias temporales de compra
- **Por estado**: Órdenes activas vs inactivas

### 8.2 Indicadores de Transparencia

#### 8.2.1 Vinculación con SECOP
- **Cobertura**: Porcentaje de órdenes con enlace SECOP
- **Actualización**: Frecuencia de consultas a plataforma pública
- **Correspondencia**: Coherencia entre datos internos y públicos

#### 8.2.2 Completitud Documental
- **Archivos adjuntos**: Porcentaje de órdenes con documentación
- **Información completa**: Órdenes con todos los campos llenos
- **Trazabilidad**: Órdenes vinculadas a equipos específicos

## 9. Integración con Gestión de Equipos

### 9.1 Vinculación Bidireccional

#### 9.1.1 Desde Órdenes hacia Equipos
- **Asociación múltiple**: Una orden puede vincular varios equipos
- **Consulta específica**: Ver equipos asociados a orden particular
- **Gestión masiva**: Modificación de múltiples vinculaciones

#### 9.1.2 Desde Equipos hacia Órdenes
- **Selección de soporte**: Elegir orden de compra para equipo
- **Consulta de origen**: Ver detalles de adquisición
- **Validación**: Verificar coherencia de información

### 9.2 Trazabilidad Completa

#### 9.2.1 Cadena de Información
```
Proceso SECOP → Orden de Compra → Proveedor → 
Equipo Biomédico → Ubicación Actual → Estado Operativo
```

#### 9.2.2 Beneficios de Trazabilidad
- **Transparencia**: Seguimiento público de adquisiciones
- **Control**: Verificación de origen de equipos
- **Auditoría**: Rastro completo para revisiones
- **Planificación**: Análisis de patrones de compra

## 10. Controles de Acceso y Permisos

### 10.1 Niveles de Acceso

#### 10.1.1 Permisos por Rol
| Rol | Consultar | Crear | Editar | Eliminar | SECOP |
|-----|-----------|-------|--------|----------|-------|
| **Consulta** | ✓ | ✗ | ✗ | ✗ | ✓ |
| **Gestión** | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Administración** | ✓ | ✓ | ✓ | ✓ | ✓ |

#### 10.1.2 Restricciones de Acceso
- **Módulo específico**: Acceso solo con permisos de "soportes compra"
- **Validación de sesión**: Usuario debe estar autenticado
- **Redirección**: Usuarios sin permisos dirigidos a página de error

### 10.2 Seguridad de Información

#### 10.2.1 Protección de Datos
- **Validación de entrada**: Verificación de datos ingresados
- **Prevención de duplicados**: Control de unicidad de códigos
- **Integridad referencial**: Mantenimiento de relaciones correctas

#### 10.2.2 Auditoría de Acciones
- **Registro de operaciones**: Log de acciones críticas
- **Identificación de usuario**: Trazabilidad de modificaciones
- **Respaldo de información**: Copias de seguridad regulares

## 11. Casos de Uso Operativos

### 11.1 Consulta de Proceso SECOP

#### 11.1.1 Escenario Principal
**Actor**: Funcionario de adquisiciones  
**Objetivo**: Verificar proceso de contratación pública

**Flujo**:
1. Accede a página de órdenes de compra
2. Activa consulta SECOP
3. Revisa procesos disponibles
4. Filtra por criterios específicos
5. Selecciona proceso de interés
6. Vincula con orden interna (opcional)

#### 11.1.2 Resultados Esperados
- Lista actualizada de procesos SECOP
- Información detallada de cada proceso
- Posibilidad de vinculación directa
- Trazabilidad completa de adquisición

### 11.2 Registro de Nueva Orden

#### 11.2.1 Escenario Principal
**Actor**: Administrador de inventarios  
**Objetivo**: Registrar nueva adquisición

**Flujo**:
1. Activa formulario de creación
2. Ingresa código único de orden
3. Selecciona tipo de compra
4. Especifica proveedor
5. Adjunta documento de respaldo
6. Incluye URL SECOP si aplica
7. Confirma registro

#### 11.2.2 Validaciones Aplicadas
- Unicidad de código en sistema
- Formato correcto de fecha
- Selección válida de proveedor
- Tipo de compra obligatorio
- Formato válido de URL SECOP

### 11.3 Asociación de Equipos

#### 11.3.1 Escenario Principal
**Actor**: Técnico biomédico  
**Objetivo**: Vincular equipos con orden de compra

**Flujo**:
1. Identifica orden en tabla principal
2. Activa función de asociación
3. Selecciona equipos disponibles
4. Confirma vinculación múltiple
5. Verifica actualización de contadores

#### 11.3.2 Beneficios Obtenidos
- Trazabilidad completa de equipos
- Control de inventario mejorado
- Información de garantías
- Seguimiento de proveedores

## 12. Mantenimiento y Monitoreo

### 12.1 Tareas de Mantenimiento Regular

#### 12.1.1 Gestión de Archivos
- **Verificación de integridad**: Validación de archivos existentes
- **Limpieza de huérfanos**: Eliminación de archivos sin referencia
- **Organización**: Mantenimiento de estructura de directorios
- **Respaldo**: Copias de seguridad de documentos

#### 12.1.2 Validación de Datos
- **Consistencia**: Verificación de relaciones entre tablas
- **Integridad**: Validación de referencias cruzadas
- **Actualización**: Sincronización con cambios externos
- **Limpieza**: Eliminación de registros obsoletos

### 12.2 Monitoreo del Sistema

#### 12.2.1 Indicadores de Rendimiento
- **Tiempo de consulta SECOP**: Velocidad de respuesta externa
- **Completitud de datos**: Porcentaje de campos llenos
- **Uso de funcionalidades**: Frecuencia de operaciones
- **Errores de sistema**: Incidencias y resoluciones

#### 12.2.2 Alertas Operativas
- **Conectividad SECOP**: Notificación de fallos de conexión
- **Espacio de almacenamiento**: Alerta de capacidad
- **Inconsistencias**: Detección de datos incoherentes
- **Accesos no autorizados**: Intentos de acceso sin permisos

## 13. Beneficios del Sistema

### 13.1 Transparencia y Cumplimiento

#### 13.1.1 Transparencia Pública
- **Vinculación directa**: Enlaces a procesos SECOP oficiales
- **Información actualizada**: Consulta en tiempo real
- **Trazabilidad completa**: Desde proceso público hasta equipo final
- **Acceso ciudadano**: Información disponible públicamente

#### 13.1.2 Cumplimiento Normativo
- **Regulaciones públicas**: Adherencia a normativas gubernamentales
- **Auditorías**: Facilita procesos de revisión externa
- **Documentación**: Respaldo completo de adquisiciones
- **Reportes**: Generación de informes normativos

### 13.2 Eficiencia Operativa

#### 13.2.1 Gestión Mejorada
- **Centralización**: Toda la información en un solo lugar
- **Automatización**: Reducción de procesos manuales
- **Integración**: Conexión entre diferentes módulos
- **Actualización**: Información siempre actualizada

#### 13.2.2 Control de Inventarios
- **Trazabilidad**: Seguimiento completo de equipos
- **Asociación**: Vinculación clara entre compra y equipo
- **Historial**: Registro completo de adquisiciones
- **Análisis**: Información para toma de decisiones

## 14. Conclusiones

### 14.1 Impacto de la Funcionalidad SECOP

La integración de SECOP en la página de órdenes de compra representa un avance significativo en la gestión hospitalaria, proporcionando:

#### 14.1.1 Beneficios Institucionales
- **Transparencia**: Cumplimiento de normativas de transparencia pública
- **Eficiencia**: Optimización de procesos de gestión de compras
- **Control**: Mejor seguimiento de adquisiciones y equipos
- **Cumplimiento**: Adherencia a regulaciones gubernamentales

#### 14.1.2 Mejoras Operativas
- **Centralización**: Unificación de información de compras
- **Automatización**: Reducción de tareas manuales repetitivas
- **Integración**: Conexión fluida entre módulos del sistema
- **Trazabilidad**: Seguimiento completo desde compra hasta uso

### 14.2 Valor Agregado del Sistema

#### 14.2.1 Para la Institución
- Cumplimiento de normativas de contratación pública
- Mejora en procesos de auditoría y control
- Optimización de recursos y tiempo
- Fortalecimiento de la transparencia institucional

#### 14.2.2 Para los Usuarios
- Interfaz intuitiva y funcional
- Acceso rápido a información relevante
- Procesos simplificados de gestión
- Información actualizada y confiable

### 14.3 Proyección Futura

La funcionalidad SECOP establece las bases para:
- Expansión de integraciones con sistemas gubernamentales
- Mejora continua en procesos de transparencia
- Optimización de gestión de recursos públicos
- Fortalecimiento del control institucional

---

**Documento elaborado por**: Sistema de Documentación EVA-ORG  
**Fecha**: Diciembre 2024  
**Versión**: 1.0  
**Tipo**: Informe Funcional Operativo