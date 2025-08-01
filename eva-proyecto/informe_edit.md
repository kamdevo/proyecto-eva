# Reporte Técnico: Modal "Editar Equipo Biomédico" - Sistema EVA

## 1. INFORMACIÓN GENERAL DEL MODAL

**Propósito**: Permitir la modificación de la información completa de un equipo biomédico existente en el sistema  
**Contexto**: Módulo de Equipos Biomédicos del Hospital Universitario del Valle "Evaristo García"  
**Tipo de Operación**: Actualización de registro existente  
**Nivel de Complejidad**: Alto (múltiples secciones y tipos de datos)

---

## 2. CAMPOS EDITABLES (Modificables por el Usuario)

### 2.1 IDENTIFICACIÓN DEL EQUIPO

#### Información Básica del Equipo

- **Nombre del equipo**: Campo de texto libre con autocompletado basado en equipos existentes
- **Descripción adicional**: Campo de texto complementario para detalles específicos
- **Serie**: Número de serie del fabricante, campo alfanumérico
- **Código de inventario antiguo**: Código previo del sistema hospitalario
- **Código de inventario nuevo**: Código actual del sistema de inventarios
- **Marca**: Campo con autocompletado basado en marcas registradas previamente

#### Especificaciones Técnicas

- **Modelo**: Identificación específica del modelo del equipo
- **Año de fabricación**: Campo numérico para el año de manufactura
- **Año de instalación**: Campo numérico para el año de puesta en servicio
- **Vida útil**: Tiempo estimado de funcionamiento en años

#### Ubicación y Movilidad

- **Servicio**: Departamento o área donde se encuentra el equipo
- **Área específica**: Ubicación detallada dentro del servicio
- **Piso**: Nivel del edificio donde está ubicado
- **Tipo de equipo**: Selección entre "FIJO" o "MÓVIL"

### 2.2 INFORMACIÓN ECONÓMICA

#### Datos Financieros

- **Valor de adquisición**: Costo original de compra del equipo
- **Valor actual**: Valor depreciado o de mercado actual
- **Forma de adquisición**: Método de obtención (compra, donación, comodato, etc.)

### 2.3 CLASIFICACIONES ESPECIALIZADAS (Solo Equipos Biomédicos)

#### Clasificaciones Regulatorias

- **Clasificación biomédica**: Categorización según normativas sanitarias
- **Clasificación de riesgo**: Nivel de riesgo asociado al uso del equipo

### 2.4 DOCUMENTACIÓN Y ARCHIVOS

#### Archivos Asociados

- **Archivo Excel de hoja de vida**: Documento complementario en formato Excel
- **Imagen del equipo**: Fotografía representativa del equipo

### 2.5 INFORMACIÓN DE CONTACTOS

#### Proveedores y Fabricantes

- **Información de fabricantes**: Datos de contacto del fabricante
- **Información de proveedores**: Datos del proveedor local
- **Información de distribuidores**: Datos de distribuidores autorizados

Cada contacto incluye:

- Nombre de la empresa
- Email de contacto
- Teléfono
- Tipo de relación (fabricante/proveedor/distribuidor)

### 2.6 GESTIÓN DE COMPONENTES

#### Componentes del Equipo

- **Lista de componentes**: Partes y accesorios que conforman el equipo
- **Descripción de componentes**: Detalles específicos de cada parte
- **Estado de componentes**: Condición actual de cada componente

### 2.7 HISTORIAL DE MANTENIMIENTOS

#### Registros de Mantenimiento

- **Fecha de mantenimiento**: Cuándo se realizó la intervención
- **Tipo de mantenimiento**: Preventivo, correctivo, calibración
- **Descripción del trabajo**: Detalles de las actividades realizadas
- **Técnico responsable**: Quién ejecutó el mantenimiento
- **Archivos relacionados**: Documentos de soporte del mantenimiento

### 2.8 CALIBRACIONES

#### Control Metrológico

- **Número de calibración**: Identificador único de la calibración
- **Fecha de ejecución**: Cuándo se realizó la calibración
- **Fecha programada**: Cuándo está programada la próxima calibración
- **Archivos de calibración**: Certificados y reportes técnicos

### 2.9 REPUESTOS Y ACCESORIOS

#### Gestión de Repuestos

- **Nombre del repuesto/accesorio**: Identificación de la pieza
- **Observaciones**: Notas adicionales sobre el repuesto
- **Fecha de instalación**: Cuándo se instaló o cambió
- **Cantidad entregada**: Número de unidades suministradas
- **Archivos relacionados**: Documentación de soporte

---

## 3. CAMPOS NO EDITABLES (Automáticos o de Solo Lectura)

### 3.1 IDENTIFICADORES DEL SISTEMA

#### Claves Primarias y Referencias

- **ID del equipo**: Identificador único interno del sistema
- **ID del usuario editor**: Referencia al usuario que realiza la modificación
- **Token de seguridad**: Token CSRF para validación de formulario

### 3.2 INFORMACIÓN CONTEXTUAL AUTOMÁTICA

#### Datos de Ubicación Calculados

- **Centro de costo**: Se asigna automáticamente según el servicio seleccionado
- **Código del centro**: Identificador numérico del centro de costo
- **País de origen**: Se determina automáticamente según la marca/fabricante

### 3.3 METADATOS DEL SISTEMA

#### Auditoría y Control

- **Fecha de creación**: Cuándo se registró inicialmente el equipo
- **Fecha de última modificación**: Se actualiza automáticamente al guardar
- **Usuario que creó**: Referencia al usuario que registró originalmente
- **Historial de cambios**: Log automático de modificaciones

### 3.4 CAMPOS CALCULADOS

#### Información Derivada

- **Antigüedad del equipo**: Se calcula automáticamente desde el año de fabricación
- **Tiempo en servicio**: Se calcula desde el año de instalación
- **Estado de vida útil**: Porcentaje de vida útil consumida
- **Próximo mantenimiento**: Se calcula según la programación establecida

### 3.5 REFERENCIAS CRUZADAS

#### Relaciones con Otras Entidades

- **Número de observaciones**: Contador de observaciones registradas
- **Número de mantenimientos**: Contador de intervenciones realizadas
- **Número de calibraciones**: Contador de calibraciones ejecutadas
- **Estado general**: Se determina según el historial de mantenimientos

---

## 4. LÓGICA DE CAMPOS CONDICIONALES

### 4.1 Campos Dependientes del Tipo de Equipo

#### Solo para Equipos Biomédicos

- Las clasificaciones biomédica y de riesgo solo aparecen cuando el tipo de equipo es "BIOMÉDICO"
- Los campos regulatorios se ocultan para equipos industriales

### 4.2 Campos Dependientes de la Ubicación

#### Jerarquía de Ubicación

- Al seleccionar un servicio, se filtran automáticamente las áreas disponibles
- El centro de costo se asigna automáticamente según el servicio
- Los pisos disponibles se filtran según el edificio del servicio

### 4.3 Campos Dependientes del Estado

#### Visibilidad Condicional

- Algunos campos de mantenimiento solo son visibles si el equipo está activo
- Los campos de baja solo aparecen si el equipo está dado de baja
- Las opciones de calibración dependen del tipo de equipo

---

## 5. FLUJO DE DATOS Y VALIDACIONES

### 5.1 Validaciones de Integridad

#### Consistencia de Datos

- El año de instalación no puede ser anterior al año de fabricación
- Las fechas de mantenimiento deben ser coherentes cronológicamente
- Los códigos de inventario deben ser únicos en el sistema
- Las clasificaciones deben corresponder al tipo de equipo

### 5.2 Validaciones de Negocio

#### Reglas Hospitalarias

- Ciertos equipos requieren calibración obligatoria
- Los equipos de alto riesgo requieren información adicional
- Los equipos móviles tienen restricciones de ubicación
- Los valores económicos deben ser coherentes con las fechas

### 5.3 Validaciones de Seguridad

#### Control de Acceso

- Solo usuarios autorizados pueden editar equipos de ciertas áreas
- Algunos campos requieren permisos especiales para modificación
- Las modificaciones críticas requieren aprobación adicional
- Se mantiene un log completo de todas las modificaciones

---

## 6. IMPACTO DE LAS MODIFICACIONES

### 6.1 Efectos en Otros Módulos

#### Integración del Sistema

- Los cambios en ubicación afectan los reportes de inventario
- Las modificaciones en clasificación impactan las programaciones de mantenimiento
- Los cambios en datos técnicos afectan los protocolos de calibración
- Las actualizaciones de contactos impactan las notificaciones automáticas

### 6.2 Notificaciones Automáticas

#### Alertas del Sistema

- Cambios críticos generan notificaciones a supervisores
- Modificaciones en equipos de alto riesgo alertan al área regulatoria
- Cambios en ubicación notifican a los responsables de área
- Actualizaciones de mantenimiento alertan al personal técnico

### 6.3 Reportes y Estadísticas

#### Impacto en Reportes

- Las modificaciones se reflejan inmediatamente en reportes en tiempo real
- Los cambios históricos se mantienen para auditorías
- Las estadísticas se recalculan automáticamente
- Los indicadores de gestión se actualizan en tiempo real

---

## 7. CONSIDERACIONES ESPECIALES

### 7.1 Equipos en Uso Activo

#### Restricciones Operativas

- Equipos en uso pueden tener campos bloqueados temporalmente
- Ciertas modificaciones requieren que el equipo esté fuera de servicio
- Los cambios críticos pueden requerir re-certificación
- Algunas actualizaciones necesitan validación técnica previa

### 7.2 Equipos Dados de Baja

#### Gestión de Equipos Inactivos

- Los equipos dados de baja tienen campos limitados para edición
- Se mantiene el historial completo para auditorías
- Ciertos datos quedan bloqueados permanentemente
- Las reactivaciones requieren procesos especiales

### 7.3 Equipos en Garantía

#### Consideraciones de Garantía

- Modificaciones pueden afectar condiciones de garantía
- Ciertos cambios requieren notificación al fabricante
- Los mantenimientos no autorizados pueden anular garantías
- Se mantiene trazabilidad completa para reclamaciones

---

## 8. RESUMEN EJECUTIVO

### 8.1 Campos Críticos para Edición

- **Identificación básica**: Nombre, serie, códigos de inventario
- **Ubicación**: Servicio, área, piso, movilidad
- **Información técnica**: Modelo, años, especificaciones
- **Clasificaciones**: Biomédica y de riesgo (cuando aplique)
- **Documentación**: Archivos y fotografías

### 8.2 Campos Automáticos Clave

- **Identificadores del sistema**: IDs, referencias, tokens
- **Metadatos**: Fechas de creación y modificación
- **Campos calculados**: Antigüedad, estado, contadores
- **Referencias cruzadas**: Relaciones con otros módulos

### 8.3 Validaciones Esenciales

- **Integridad temporal**: Coherencia de fechas
- **Unicidad**: Códigos e identificadores únicos
- **Consistencia**: Datos coherentes entre sí
- **Seguridad**: Control de acceso y permisos

El modal de edición de equipos biomédicos es una interfaz compleja que permite la gestión integral de la información de equipos médicos, manteniendo la integridad de los datos y cumpliendo con las regulaciones hospitalarias y sanitarias aplicables.

---

DATOS GENERALES
id (hidden)
name (Nombre del equipo)
descripcion (Descripción)
code (Código/Inventario)
serial (Serial)
modelo (Modelo)
marca (Marca)
invima_id (Registro sanitario INVIMA)
propietario_id (Propietario)
sede_id (Sede)
servicio_id (Servicio)
area_id (Área)
fuente_id (Fuente de energía)
tecnologia_id (Tecnología)
frecuencia_id (Frecuencia de mantenimiento)
cbiomedica_id (Clasificación biomédica)
criesgo_id (Clasificación de riesgo)
tadquisicion_id (Tipo de adquisición)
verificacion_inventario (Verificación inventario)
fecha_recepcion_almacen (Fecha recepción almacén)
fecha_acta_recibo (Fecha acta de recibo)
fecha_inicio_operacion (Fecha inicio operación)
fecha_fabricacion (Fecha fabricación)
fecha_ad (Fecha adquisición)
fecha_instalacion (Fecha instalación)
fecha_mantenimiento (Fecha último mantenimiento)
fecha_vencimiento_garantia (Fecha vencimiento garantía)
vida_util (Vida útil)
garantia (Garantía)
costo (Costo)
costo_original (Costo original)
accesorios (Accesorios)
movilidad (Movilidad)
codigo_antiguo (Código antiguo)
evaluacion_desempenio (Evaluación desempeño)
calibracion (Calibración)
activo_comodato (Activo en comodato)
localizacion_actual (Localización actual)
disponibilidad_id (Disponibilidad)
estadoequipo_id (Estado del equipo)
tmp_estado_equipo_id (Estado temporal)
preview_imagen (Imagen)
archivo_invima1 (Archivo INVIMA)

MANUALES Y PLANOS
manual_id (hidden)
Checkbox de manuales
Checkbox de planos
contenedor_url_manual (URL manual)
contenedor_descripcion_manual (Descripción manual)

ORDEN DE COMPRA / CONTRATOS / COMODATOS
orden_compra_id (hidden)
Visualización de orden de compra, contrato, cruce de cuentas, comodato
file_orden_compra (Archivo orden de compra)

ESPECIFICACIONES TÉCNICAS
Tabla de especificaciones técnicas (inputs dinámicos por fila)

MANTENIMIENTOS PREVENTIVOS
Tabla de mantenimientos preventivos (inputs dinámicos por fila)

CALIBRACIONES
Tabla de calibraciones (inputs dinámicos por fila)

CORRECTIVOS GENERALES
Tabla de correctivos generales (inputs dinámicos por fila)
REPUESTOS/ACCESORIOS
Tabla de repuestos/accesorios (inputs dinámicos por fila)
OBSERVACIONES
Tabla de observaciones (inputs dinámicos por fila)
