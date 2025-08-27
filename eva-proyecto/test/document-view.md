# Modal de Visualización de Documentos de un Equipo - Reporte Técnico

## 1. Descripción General del Modal

El modal de visualización de documentos de un equipo es una interfaz especializada que permite consultar, gestionar y compartir los archivos/documentos asociados a un equipo específico. Su objetivo principal es centralizar el acceso a toda la documentación relevante de cada equipo, facilitando la gestión documental y el cumplimiento normativo.

### Propósito Principal

- Centralizar la visualización de documentos de equipos
- Facilitar la gestión documental integral
- Permitir compartir archivos entre equipos
- Controlar acceso según permisos de usuario
- Mantener historial de documentación

### Ubicación del Modal en el Sistema

- **Vista**: `html/application/views/equipos/modal_show_archivos.php`
- **Controlador**: `html/application/controllers/equipo/Cequipos.php` (método show_archivos)
- **Modelo**: `html/application/models/Mequipo_archivos.php`
- **JavaScript**: `html/js/Equipos.js` (función show_archivos)

## 2. Datos que se Muestran en el Modal

### Información Básica de Documentos

- **Listado completo** de todos los documentos asociados al equipo
- **Agrupación por tipo** de documento (manuales, certificados, capacitaciones, etc.)
- **Nombre del documento** o tipo de archivo según el catálogo de tipos
- **Fecha de carga** o asociación del documento
- **Usuario responsable** de la carga del archivo (cuando aplique)

### Metadatos Específicos por Tipo de Documento

- **Archivos de capacitación**: fecha y hora específica de la capacitación
- **Certificados**: información de vigencia y tipo de certificación
- **Manuales**: clasificación por tipo (operación, mantenimiento, partes)
- **Planos**: categoría específica (eléctrico, electrónico, neumático, mecánico)

### Acciones Disponibles

- **Ver/Previsualizar**: acceso directo al contenido del archivo
- **Descargar**: obtener copia local del documento
- **Eliminar**: remover archivo del equipo (según permisos)
- **Compartir/Copiar**: asociar el mismo archivo a otros equipos
- **Editar metadatos**: modificar información adicional del archivo

## 3. Funciones Principales del Modal

### 3.1 Visualización y Descarga

- **Acceso directo** a archivos almacenados en el servidor
- **Previsualización** de documentos compatibles (PDF, imágenes)
- **Descarga segura** con validación de permisos
- **Historial de accesos** para auditoría

### 3.2 Gestión de Archivos

- **Eliminación controlada** según permisos del usuario
- **Validación de integridad** antes de operaciones
- **Limpieza automática** de archivos huérfanos
- **Backup automático** antes de eliminaciones

### 3.3 Función de Compartir/Copiar Archivos

- **Selección múltiple** de equipos destino
- **Copia de metadatos** junto con el archivo
- **Validación de duplicados** antes de la copia
- **Registro de operaciones** para trazabilidad
- **Optimización de almacenamiento** evitando duplicación física

### 3.4 Filtrado y Organización

- **Filtros por tipo** de documento
- **Ordenamiento cronológico** por fecha de carga
- **Búsqueda por nombre** o tipo de archivo
- **Agrupación visual** por categorías

### 3.5 Control de Acceso

- **Validación de permisos** por tipo de usuario
- **Restricciones por estado** del equipo
- **Auditoría de accesos** y modificaciones
- **Encriptación de nombres** de archivos

## 4. Estructura de Base de Datos

### 4.1 Tabla Principal: `equipo_archivo`

**Propósito**: Tabla de relación entre equipos y archivos

| Columna      | Tipo de Dato       | Propósito                           | Restricciones               |
| ------------ | ------------------ | ----------------------------------- | --------------------------- |
| `id`         | INT AUTO_INCREMENT | Identificador único del registro    | NOT NULL, PRIMARY KEY       |
| `equipo_id`  | INT                | Referencia al equipo específico     | NOT NULL, FK a equipos.id   |
| `archivo_id` | INT                | Tipo de documento según catálogo    | NOT NULL, FK a archivos.id  |
| `vinculo`    | VARCHAR(255)       | Nombre/ubicación del archivo físico | Permite NULL                |
| `created_at` | DATETIME           | Fecha y hora de carga/asociación    | NOT NULL                    |
| `usuario_id` | INT                | Usuario que realizó la carga        | FK a usuarios.id (opcional) |

### 4.2 Tabla de Catálogo: `archivos`

**Propósito**: Define los tipos de documentos disponibles

| Columna       | Tipo de Dato       | Propósito                                | Restricciones         |
| ------------- | ------------------ | ---------------------------------------- | --------------------- |
| `id`          | INT AUTO_INCREMENT | Identificador único del tipo             | NOT NULL, PRIMARY KEY |
| `name`        | VARCHAR(255)       | Nombre descriptivo del tipo de documento | NOT NULL              |
| `status`      | INT                | Estado activo/inactivo del tipo          | DEFAULT 1             |
| `descripcion` | TEXT               | Descripción detallada del tipo           | Permite NULL          |

**Tipos de Documentos Comunes**:

- Manuales de operación
- Manuales de mantenimiento
- Manuales de partes
- Planos eléctricos/electrónicos/neumáticos/mecánicos
- Protocolos y certificados de calibración
- Capacitaciones (con funcionalidad especial)
- Hojas de seguridad
- Guías de instalación
- Certificados de conformidad
- Documentación técnica
- Garantías y facturas
- Otros documentos específicos

### 4.3 Tabla de Usuarios: `usuarios`

**Propósito**: Información de usuarios para trazabilidad

| Columna    | Tipo de Dato | Propósito                        |
| ---------- | ------------ | -------------------------------- |
| `id`       | INT          | Identificador único del usuario  |
| `nombre`   | VARCHAR(255) | Nombre completo del usuario      |
| `email`    | VARCHAR(255) | Correo electrónico               |
| `permisos` | JSON/TEXT    | Permisos específicos del usuario |

### 4.4 Relaciones entre Tablas

- `equipo_archivo.equipo_id` → `equipos.id` (muchos a uno)
- `equipo_archivo.archivo_id` → `archivos.id` (muchos a uno)
- `equipo_archivo.usuario_id` → `usuarios.id` (muchos a uno, opcional)

## 5. Flujo de Datos y Operaciones

### 5.1 Carga Inicial del Modal

1. **Identificación del equipo** mediante ID
2. **Consulta de documentos** asociados al equipo
3. **Obtención de metadatos** de cada archivo
4. **Validación de permisos** del usuario actual
5. **Renderizado de lista** organizada por tipos

### 5.2 Operación de Compartir Archivos

1. **Selección del archivo** origen
2. **Búsqueda de equipos** destino candidatos
3. **Validación de duplicados** en equipos destino
4. **Confirmación del usuario** para proceder
5. **Creación de registros** en equipo_archivo para cada destino
6. **Actualización de interfaces** relacionadas

### 5.3 Eliminación de Archivos

1. **Validación de permisos** de eliminación
2. **Verificación del estado** del equipo
3. **Confirmación del usuario** para proceder
4. **Eliminación del registro** en base de datos
5. **Eliminación del archivo físico** del servidor
6. **Registro de auditoría** de la operación

## 6. Consideraciones de Seguridad

### 6.1 Control de Acceso

- **Validación de sesión** antes de cualquier operación
- **Permisos granulares** por tipo de operación
- **Restricciones por estado** del equipo
- **Logs de auditoría** para todas las acciones

### 6.2 Protección de Archivos

- **Nombres encriptados** para evitar acceso directo
- **Validación de tipos** de archivo
- **Límites de tamaño** por archivo
- **Escaneo antivirus** (recomendado)

### 6.3 Integridad de Datos

- **Transacciones atómicas** para operaciones críticas
- **Validación de integridad** antes de eliminaciones
- **Backup automático** de metadatos importantes
- **Recuperación de errores** en operaciones masivas

## 7. Integración con Otros Módulos

### 7.1 Módulo de Equipos

- **Indicadores visuales** de cantidad de documentos
- **Acceso directo** desde listados de equipos
- **Sincronización de estados** entre equipo y documentos

### 7.2 Módulo de Mantenimiento

- **Asociación automática** de reportes de mantenimiento
- **Referencia cruzada** con órdenes de trabajo
- **Historial integrado** de documentación técnica

### 7.3 Módulo de Calibraciones

- **Gestión de certificados** de calibración
- **Alertas de vencimiento** de documentos
- **Trazabilidad completa** de procesos de calibración

## 8. Beneficios del Sistema

### 8.1 Gestión Documental

- **Centralización** de toda la documentación de equipos
- **Estandarización** de tipos de documentos
- **Reutilización eficiente** de documentos comunes
- **Reducción de duplicados** innecesarios

### 8.2 Cumplimiento Normativo

- **Trazabilidad completa** de documentación
- **Auditoría facilitada** con registros detallados
- **Cumplimiento de estándares** de gestión documental
- **Respaldo legal** para procedimientos

### 8.3 Eficiencia Operacional

- **Acceso rápido** a documentación crítica
- **Compartir recursos** entre equipos similares
- **Reducción de tiempo** en búsqueda de documentos
- **Mejor organización** de información técnica

Este modal representa una pieza fundamental en la gestión integral de equipos médicos e industriales, proporcionando una solución completa para el manejo de documentación asociada con cada equipo del sistema.

TEN EN CUENTA:

El modal de visualización de documentos de un equipo permite consultar, gestionar y compartir los archivos/documentos asociados a un equipo específico. Su objetivo es centralizar el acceso a toda la documentación relevante de cada equipo, facilitando la gestión documental y el cumplimiento normativo.

Datos que se muestran en el modal:

Listado de todos los documentos asociados al equipo, agrupados por tipo (manuales, certificados, capacitaciones, etc.)
Nombre del documento o tipo de archivo (según catálogo de tipos)
Fecha de carga o asociación
Usuario que subió el archivo (si aplica)
Acciones disponibles para cada archivo (ver, descargar, eliminar, compartir/copiar a otros equipos)
Información adicional según el tipo de documento (por ejemplo, fecha de capacitación para archivos de tipo capacitación)
Funciones principales del modal:

Visualizar y descargar archivos/documentos asociados al equipo
Eliminar archivos (según permisos y estado del equipo)
Compartir/copiar archivos a otros equipos (función de reutilización documental)
Filtrar o agrupar documentos por tipo
Mostrar metadatos relevantes de cada archivo (fecha, usuario, tipo)
Tablas y columnas relacionadas en la base de datos:

equipo_archivo: tabla principal de relación entre equipos y archivos
id: identificador del registro
equipo_id: referencia al equipo
archivo_id: tipo de documento (catálogo)
vinculo: nombre/ubicación del archivo físico
created_at: fecha y hora de carga/asociación
archivos: catálogo de tipos de documentos
id: identificador del tipo
name: nombre del tipo de documento
usuarios (opcional, si se almacena el usuario que subió el archivo)
id, nombre
Notas:

La función de compartir/copiar archivos permite seleccionar uno o varios equipos destino y asociarles el mismo documento, optimizando la gestión documental.
Las acciones disponibles pueden variar según los permisos del usuario y el estado del equipo (por ejemplo, equipos dados de baja pueden restringir la edición/eliminación de archivos).
El visor de archivos es clave para auditorías, gestión de mantenimientos y cumplimiento de normativas.
