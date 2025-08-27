# **Reporte Técnico: Página de Administración de Usuarios**

## **Funcionalidades, Secciones y Estructura de Datos**

## **1. DESCRIPCIÓN GENERAL DE LA PÁGINA**

La página de administración de usuarios (`administrador/Cusuarios`) es el **centro de control principal** para la gestión completa de usuarios y permisos del sistema. Permite a los administradores crear, editar, visualizar y gestionar permisos de usuarios de forma granular.

## **2. ESTRUCTURA PRINCIPAL DE LA PÁGINA**

### **2.1 Sección Superior: Gestión de Usuarios**

- **Tabla principal** con listado de usuarios
- **Botones de acción** para cada usuario
- **Funcionalidad de búsqueda** y paginación
- **Modales** para agregar, editar y visualizar usuarios

### **2.2 Sección Inferior: Gestión de Módulos**

- **Tabla de módulos** del sistema
- **Contadores** de usuarios por módulo
- **Funciones de restablecimiento** masivo de permisos

### **2.3 Sección Adicional: Relaciones Usuario-Zona**

- **Tabla de asignaciones** usuario-zona geográfica
- **Gestión de relaciones** especiales

## **3. TABLA PRINCIPAL DE USUARIOS**

### **3.1 Estructura de la Tabla**

```sql
-- Query principal para el listado
SELECT
    usuarios.id,
    usuarios.nombre,
    usuarios.apellido,
    usuarios.username,
    usuarios.telefono,
    usuarios.email,
    usuarios.estado,
    roles.nombre as rol,
    centros.name as centro,
    centros.code as codigo_centro
FROM usuarios
LEFT JOIN roles ON roles.id = usuarios.rol_id
LEFT JOIN centros ON centros.id = usuarios.centro_id
WHERE usuarios.estado != 0
ORDER BY usuarios.nombre ASC;
```

### **3.2 Columnas Mostradas en la Tabla**

| Columna                 | Origen                                | Descripción                           |
| ----------------------- | ------------------------------------- | ------------------------------------- |
| **Nombres y Apellidos** | `usuarios.nombre + usuarios.apellido` | Nombre completo del usuario           |
| **Centro de Costo**     | `centros.name`                        | Centro de costo asignado              |
| **Login**               | `usuarios.username`                   | Nombre de usuario para acceso         |
| **Rol**                 | `roles.nombre`                        | Rol asignado al usuario               |
| **Opciones**            | Acciones                              | Botones de editar, examinar, eliminar |

### **3.3 Funcionalidades de la Tabla**

- **Paginación**: Configuración de 5, 10, 20 registros por página
- **Búsqueda**: Por nombre de usuario y nombre completo
- **Ordenamiento**: Por cualquier columna
- **Filtrado**: En tiempo real mientras se escribe

## **4. MODAL DE AGREGAR USUARIO**

### **4.1 Campos del Formulario**

```sql
-- Tablas y columnas involucradas en la creación
INSERT INTO usuarios (
    nombre,           -- VARCHAR(255) - Requerido
    apellido,         -- VARCHAR(255) - Opcional
    telefono,         -- VARCHAR(20) - Opcional
    email,            -- VARCHAR(255) - Opcional, único
    username,         -- VARCHAR(100) - Requerido, único
    password,         -- VARCHAR(255) - Encriptado SHA1(MD5())
    rol_id,           -- INT - Foreign Key → roles.id
    centro_id,        -- INT - Foreign Key → centros.id
    id_empresa,       -- INT - Foreign Key → empresas.id
    estado,           -- TINYINT(1) - Default 1
    active            -- VARCHAR(10) - Default 'true'
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'true');
```

### **4.2 Selects Dinámicos**

#### **4.2.1 Select de Roles**

```sql
-- Carga de roles disponibles
SELECT id, nombre
FROM roles
ORDER BY nombre ASC;
```

#### **4.2.2 Select de Centros de Costo**

```sql
-- Carga de centros activos
SELECT id, name, code
FROM centros
WHERE status = 1
ORDER BY name ASC;
```

#### **4.2.3 Select de Empresas**

```sql
-- Carga de empresas disponibles
SELECT id, name
FROM empresas
ORDER BY name ASC;
```

### **4.3 Validaciones Requeridas**

- **Nombre**: Mínimo 3 caracteres
- **Username**: Único en la tabla `usuarios`
- **Email**: Formato válido y único (si se proporciona)
- **Rol**: Debe existir en tabla `roles`
- **Centro**: Debe existir en tabla `centros`

## **5. MODAL DE EDITAR USUARIO**

### **5.1 Carga de Datos del Usuario**

```sql
-- Query para obtener usuario completo
SELECT
    u.id,
    u.nombre,
    u.apellido,
    u.telefono,
    u.email,
    u.username,
    u.rol_id,
    u.centro_id,
    u.id_empresa,
    u.sede_id,
    u.estado,
    r.nombre as rol,
    c.name as centro,
    e.name as empresa,
    s.name as sede
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN centros c ON u.centro_id = c.id
LEFT JOIN empresas e ON u.id_empresa = e.id
LEFT JOIN sedes s ON u.sede_id = s.id
WHERE u.id = ?;
```

### **5.2 Sección de Permisos (Tabla de Acciones)**

```sql
-- Query para cargar permisos del usuario
SELECT
    a.id,
    a.usuario_id,
    a.modulo_id,
    a.leer,
    a.insertar,
    a.editar,
    a.eliminar,
    m.name as modulo
FROM acciones a
LEFT JOIN modulos m ON m.id = a.modulo_id
WHERE a.usuario_id = ?
ORDER BY m.id ASC;
```

### **5.3 Estructura de la Tabla de Permisos**

| Columna      | Funcionalidad       | Acción       |
| ------------ | ------------------- | ------------ |
| **Módulo**   | `modulos.name`      | Solo lectura |
| **Leer**     | `acciones.leer`     | Toggle 0↔1   |
| **Insertar** | `acciones.insertar` | Toggle 0↔1   |
| **Editar**   | `acciones.editar`   | Toggle 0↔1   |
| **Eliminar** | `acciones.eliminar` | Toggle 0↔1   |

### **5.4 Edición Individual de Permisos**

```sql
-- Query para alternar permiso específico
UPDATE acciones
SET leer = CASE WHEN leer = 1 THEN 0 ELSE 1 END
WHERE id = ?;

UPDATE acciones
SET insertar = CASE WHEN insertar = 1 THEN 0 ELSE 1 END
WHERE id = ?;

UPDATE acciones
SET editar = CASE WHEN editar = 1 THEN 0 ELSE 1 END
WHERE id = ?;

UPDATE acciones
SET eliminar = CASE WHEN eliminar = 1 THEN 0 ELSE 1 END
WHERE id = ?;
```

## **6. MODAL DE VISUALIZAR USUARIO**

### **6.1 Información Mostrada**

```sql
-- Query para vista detallada
SELECT
    u.nombre,
    u.apellido,
    u.telefono,
    u.email,
    u.username,
    r.nombre as rol,
    c.name as centro,
    c.code as codigo_centro,
    e.name as empresa,
    s.name as sede,
    u.estado,
    u.active,
    u.anio_plan,
    u.created_at
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN centros c ON u.centro_id = c.id
LEFT JOIN empresas e ON u.id_empresa = e.id
LEFT JOIN sedes s ON u.sede_id = s.id
WHERE u.id = ?;
```

### **6.2 Campos Mostrados**

- **Información Personal**: Nombre, apellido, teléfono, email
- **Credenciales**: Username (sin mostrar password)
- **Asignaciones**: Rol, centro de costo, empresa, sede
- **Estado**: Activo/Inactivo, cuenta activada
- **Metadatos**: Año del plan, fecha de creación

## **7. SECCIÓN DE GESTIÓN DE MÓDULOS**

### **7.1 Tabla de Módulos con Contadores**

```sql
-- Query para módulos con estadísticas
SELECT
    m.id,
    m.name,
    (
        SELECT COUNT(*)
        FROM acciones a
        WHERE a.modulo_id = m.id
    ) AS cantidad_usuarios_con_acceso,
    (
        SELECT COUNT(*)
        FROM acciones a
        WHERE a.modulo_id = m.id AND a.leer = 1
    ) AS usuarios_con_lectura,
    (
        SELECT COUNT(*)
        FROM acciones a
        WHERE a.modulo_id = m.id AND a.insertar = 1
    ) AS usuarios_con_insercion
FROM modulos m
ORDER BY m.id ASC;
```

### **7.2 Funcionalidad de Restablecimiento**

```sql
-- Query para restablecer permisos de un módulo
-- Paso 1: Eliminar permisos existentes
DELETE FROM acciones WHERE modulo_id = ?;

-- Paso 2: Crear permisos automáticos basados en rol
INSERT INTO acciones(usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT
    u.id,
    ? as modulo_id,
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END,  -- Admin: todos los permisos
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END,  -- Otros: sin permisos
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END,
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END
FROM usuarios u
WHERE u.estado = 1 AND u.active = 'true';
```

## **8. SECCIÓN DE RELACIONES USUARIO-ZONA**

### **8.1 Tabla de Relaciones**

```sql
-- Estructura de la tabla usuarios_zonas
CREATE TABLE usuarios_zonas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,           -- Foreign Key → usuarios.id
    zona_id INT NOT NULL,              -- Foreign Key → zonas.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_zone (usuario_id, zona_id)
);
```

### **8.2 Query para Mostrar Relaciones**

```sql
SELECT
    uz.id,
    uz.usuario_id,
    uz.zona_id,
    u.nombre AS usuario,
    u.email AS email,
    z.name AS zona
FROM usuarios_zonas uz
LEFT JOIN usuarios u ON u.id = uz.usuario_id
LEFT JOIN zonas z ON z.id = uz.zona_id
ORDER BY z.name ASC, u.nombre ASC;
```

### **8.3 Modal de Agregar Relación Usuario-Zona**

```sql
-- Selects para el modal
-- Select de usuarios
SELECT id, nombre, username, email
FROM usuarios
WHERE estado = 1
ORDER BY nombre ASC;

-- Select de zonas
SELECT id, name
FROM zonas
WHERE status = 1
ORDER BY name ASC;

-- Inserción de nueva relación
INSERT INTO usuarios_zonas (usuario_id, zona_id)
VALUES (?, ?);
```

## **9. FUNCIONALIDADES ADICIONALES**

### **9.1 Eliminación Lógica de Usuarios**

```sql
-- No se elimina físicamente, se cambia estado
UPDATE usuarios
SET estado = 0
WHERE id = ?;
```

### **9.2 Activación/Desactivación de Cuentas**

```sql
-- Cambiar estado de activación
UPDATE usuarios
SET active = CASE WHEN active = 'true' THEN 'false' ELSE 'true' END
WHERE id = ?;
```

### **9.3 Cambio de Sede de Usuario**

```sql
-- Cambiar sede del usuario
UPDATE usuarios
SET sede_id = ?
WHERE id = ?;
```

### **9.4 Cambio de Año del Plan**

```sql
-- Actualizar año del plan
UPDATE usuarios
SET anio_plan = ?
WHERE id = ?;
```

## **10. BÚSQUEDAS Y FILTROS**

### **10.1 Búsqueda en Tabla Principal**

```sql
-- Query con filtro de búsqueda
SELECT
    usuarios.*,
    roles.nombre as rol,
    centros.name as centro
FROM usuarios
LEFT JOIN roles ON roles.id = usuarios.rol_id
LEFT JOIN centros ON centros.id = usuarios.centro_id
WHERE usuarios.estado != 0
  AND (
    usuarios.username LIKE '%?%' OR
    usuarios.nombre LIKE '%?%' OR
    usuarios.apellido LIKE '%?%'
  )
ORDER BY usuarios.nombre ASC
LIMIT ? OFFSET ?;
```

### **10.2 Filtros por Estado**

```sql
-- Usuarios activos
SELECT * FROM usuarios WHERE estado = 1 AND active = 'true';

-- Usuarios inactivos
SELECT * FROM usuarios WHERE estado = 0 OR active = 'false';

-- Usuarios por rol
SELECT * FROM usuarios WHERE rol_id = ?;

-- Usuarios por centro de costo
SELECT * FROM usuarios WHERE centro_id = ?;
```

## **11. ESTADÍSTICAS Y REPORTES**

### **11.1 Contadores Generales**

```sql
-- Total de usuarios activos
SELECT COUNT(*) as total_activos
FROM usuarios
WHERE estado = 1 AND active = 'true';

-- Usuarios por rol
SELECT
    r.nombre as rol,
    COUNT(u.id) as cantidad
FROM roles r
LEFT JOIN usuarios u ON r.id = u.rol_id AND u.estado = 1
GROUP BY r.id, r.nombre;

-- Usuarios por centro de costo
SELECT
    c.name as centro,
    c.code as codigo,
    COUNT(u.id) as cantidad
FROM centros c
LEFT JOIN usuarios u ON c.id = u.centro_id AND u.estado = 1
GROUP BY c.id, c.name, c.code;
```

### **11.2 Análisis de Permisos**

```sql
-- Usuarios sin permisos
SELECT
    u.id,
    u.nombre,
    u.username
FROM usuarios u
LEFT JOIN acciones a ON u.id = a.usuario_id
WHERE u.estado = 1
  AND u.active = 'true'
  AND a.usuario_id IS NULL;

-- Módulos más utilizados
SELECT
    m.name as modulo,
    COUNT(a.id) as usuarios_con_acceso
FROM modulos m
LEFT JOIN acciones a ON m.id = a.modulo_id AND a.leer = 1
GROUP BY m.id, m.name
ORDER BY usuarios_con_acceso DESC;
```

## **12. ESTRUCTURA DE BOTONES Y ACCIONES**

### **12.1 Botones por Usuario**

| Botón        | Función                  | Query Asociada                                                   |
| ------------ | ------------------------ | ---------------------------------------------------------------- |
| **Editar**   | Abrir modal de edición   | `SELECT * FROM usuarios WHERE id = ?`                            |
| **Examinar** | Ver detalles del usuario | `SELECT usuarios.*, roles.nombre, centros.name FROM usuarios...` |
| **Eliminar** | Eliminación lógica       | `UPDATE usuarios SET estado = 0 WHERE id = ?`                    |

### **12.2 Botones Globales**

| Botón                  | Función                 | Descripción                           |
| ---------------------- | ----------------------- | ------------------------------------- |
| **Agregar Usuario**    | Abrir modal de creación | Formulario vacío con selects cargados |
| **Exportar**           | Generar reporte Excel   | Exportación de todos los usuarios     |
| **Restablecer Módulo** | Reset permisos masivo   | Por cada módulo individualmente       |

## **13. VALIDACIONES Y RESTRICCIONES**

### **13.1 Validaciones de Integridad**

```sql
-- Verificar username único
SELECT COUNT(*) FROM usuarios WHERE username = ? AND id != ?;

-- Verificar email único
SELECT COUNT(*) FROM usuarios WHERE email = ? AND id != ?;

-- Verificar existencia de rol
SELECT COUNT(*) FROM roles WHERE id = ?;

-- Verificar existencia de centro
SELECT COUNT(*) FROM centros WHERE id = ? AND status = 1;
```

### **13.2 Restricciones de Eliminación**

```sql
-- No permitir eliminar si tiene tickets activos
SELECT COUNT(*) FROM ordenes
WHERE (reportante_id = ? OR asignado_id = ?)
  AND estado_id NOT IN (SELECT id FROM estados WHERE descripcion LIKE '%cerrado%');

-- No permitir eliminar si es el único administrador
SELECT COUNT(*) FROM usuarios
WHERE rol_id = 1 AND estado = 1 AND id != ?;
```

## **14. RESUMEN DE FUNCIONALIDADES**

### **14.1 Gestión Completa de Usuarios**

- **Crear**: Formulario completo con validaciones
- **Editar**: Información personal + permisos granulares
- **Visualizar**: Vista detallada de toda la información
- **Eliminar**: Eliminación lógica con validaciones

### **14.2 Gestión de Permisos**

- **Individual**: Por usuario y por módulo
- **Masiva**: Restablecimiento por módulo
- **Tiempo Real**: Cambios inmediatos con toggle
- **Auditoría**: Visualización completa de permisos

### **14.3 Gestión de Relaciones**

- **Usuario-Zona**: Asignaciones geográficas
- **Usuario-Empresa**: Asignaciones organizacionales
- **Usuario-Centro**: Asignaciones de costo

### **14.4 Reportes y Estadísticas**

- **Contadores**: Usuarios por rol, centro, estado
- **Análisis**: Permisos, módulos, actividad
- **Exportación**: Datos completos en Excel

Esta página proporciona **control total** sobre la gestión de usuarios y permisos, permitiendo administración granular y flexible del sistema de acceso.
