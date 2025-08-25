# **Reporte Técnico: Sistema de Roles y Permisos - Proyecto EVA**

## **Estructura de Base de Datos y Flujo de Datos**

## **1. DESCRIPCIÓN GENERAL DEL SISTEMA**

El proyecto EVA implementa un **sistema de permisos granular a nivel de usuario** que combina dos enfoques:

1. **Permisos por ROL** (tabla `permisos`) - Sistema tradicional de roles
2. **Permisos por USUARIO** (tabla `acciones`) - Sistema granular individual

**Característica principal**: Cada usuario tiene permisos específicos por módulo, independientemente de su rol.

## **2. ESTRUCTURA COMPLETA DE TABLAS**

### **2.1 Tabla Principal: `usuarios`**

```sql
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255),
    telefono VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT,                    -- Foreign Key → roles.id
    centro_id INT,                 -- Foreign Key → centros.id
    id_empresa INT,                -- Foreign Key → empresas.id
    sede_id INT,                   -- Foreign Key → sedes.id
    estado TINYINT(1) DEFAULT 1,   -- 1=activo, 0=inactivo
    active VARCHAR(10) DEFAULT 'false', -- "true"/"false" para activación
    anio_plan INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (centro_id) REFERENCES centros(id),
    FOREIGN KEY (id_empresa) REFERENCES empresas(id),
    FOREIGN KEY (sede_id) REFERENCES sedes(id)
);
```

### **2.2 Tabla de Roles: `roles`**

```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL
);

-- Datos típicos
INSERT INTO roles (id, nombre) VALUES
(1, 'Administrador'),
(2, 'Técnico'),
(3, 'Supervisor'),
(4, 'Usuario normal');
```

### **2.3 Tabla de Módulos: `modulos`**

```sql
CREATE TABLE modulos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Módulos principales del sistema
INSERT INTO modulos (id, name) VALUES
(1, 'equipos'),                    -- Equipos biomédicos
(2, 'usuarios'),                   -- Gestión de usuarios
(3, 'servicios'),                  -- Servicios hospitalarios
(4, 'equipos industriales'),       -- Equipos industriales
(5, 'bajas equipos biomedicos'),   -- Bajas de equipos
(6, 'invimas'),                    -- Registros INVIMA
(7, 'soportes compra'),            -- Órdenes de compra
(8, 'repuestos'),                  -- Gestión de repuestos
(9, 'estado equipos'),             -- Estados de equipos
(10, 'contactos'),                 -- Proveedores/Contactos
(11, 'reportes'),                  -- Reportes del sistema
(12, 'planes mantenimiento'),      -- Planes de mantenimiento
(13, 'capacitaciones'),            -- Capacitaciones
(14, 'equipo archivos'),           -- Archivos de equipos
(15, 'tickets propios'),           -- Tickets del usuario
(16, 'tickets activos'),           -- Tickets en proceso
(17, 'tickets cerrados'),          -- Tickets finalizados
(18, 'observaciones'),             -- Observaciones de equipos
(19, 'repuestos'),                 -- Gestión de repuestos
(20, 'areas'),                     -- Áreas hospitalarias
(21, 'contingencias'),             -- Planes de contingencia
(22, 'guias rapidas'),             -- Guías rápidas
(23, 'manuales');                  -- Manuales técnicos
```

### **2.4 Tabla de Acciones: `acciones` (TABLA PRINCIPAL DEL SISTEMA)**

```sql
CREATE TABLE acciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,           -- Foreign Key → usuarios.id
    modulo_id INT NOT NULL,            -- Foreign Key → modulos.id
    leer TINYINT(1) DEFAULT 0,         -- 1=permitido, 0=denegado
    insertar TINYINT(1) DEFAULT 0,     -- 1=permitido, 0=denegado
    editar TINYINT(1) DEFAULT 0,       -- 1=permitido, 0=denegado
    eliminar TINYINT(1) DEFAULT 0,     -- 1=permitido, 0=denegado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (usuario_id, modulo_id)
);

-- Índices para optimización
CREATE INDEX idx_acciones_usuario ON acciones(usuario_id);
CREATE INDEX idx_acciones_modulo ON acciones(modulo_id);
```

### **2.5 Tabla de Permisos por Rol: `permisos` (SISTEMA SECUNDARIO)**

```sql
CREATE TABLE permisos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rol_id INT NOT NULL,               -- Foreign Key → roles.id
    menu_id INT NOT NULL,              -- Foreign Key → menus.id
    read TINYINT(1) DEFAULT 0,         -- 1=permitido, 0=denegado
    insert TINYINT(1) DEFAULT 0,       -- 1=permitido, 0=denegado
    update TINYINT(1) DEFAULT 0,       -- 1=permitido, 0=denegado
    delete TINYINT(1) DEFAULT 0,       -- 1=permitido, 0=denegado
    assign TINYINT(1) DEFAULT 0,       -- 1=permitido, 0=denegado
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rol_menu (rol_id, menu_id)
);
```

### **2.6 Tabla de Menús: `menus`**

```sql
CREATE TABLE menus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,      -- Nombre descriptivo del menú
    link VARCHAR(255) NOT NULL UNIQUE, -- URL del controlador (ej: "administrador/Cusuarios")
    descripcion TEXT,                  -- Descripción opcional
    activo TINYINT(1) DEFAULT 1,       -- 1=activo, 0=inactivo
    orden INT DEFAULT 0,               -- Orden de aparición en menú
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **2.7 Tablas de Soporte Organizacional**

#### **2.7.1 Tabla de Centros de Costo: `centros`**

```sql
CREATE TABLE centros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,        -- Nombre del centro de costo
    code VARCHAR(50) NOT NULL UNIQUE,  -- Código del centro
    status TINYINT(1) DEFAULT 1,       -- 1=activo, 0=inactivo
    descripcion TEXT,                  -- Descripción opcional
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2.7.2 Tabla de Empresas: `empresas`**

```sql
CREATE TABLE empresas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,        -- Nombre de la empresa
    nit VARCHAR(50),                   -- NIT de la empresa
    telefono VARCHAR(20),              -- Teléfono de contacto
    email VARCHAR(255),                -- Email de contacto
    direccion TEXT,                    -- Dirección física
    activa TINYINT(1) DEFAULT 1,       -- 1=activa, 0=inactiva
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **2.7.3 Tabla de Sedes: `sedes`**

```sql
CREATE TABLE sedes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,        -- Nombre de la sede
    direccion TEXT,                    -- Dirección de la sede
    telefono VARCHAR(20),              -- Teléfono de la sede
    activa TINYINT(1) DEFAULT 1,       -- 1=activa, 0=inactiva
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## **3. FLUJO DE DATOS DEL SISTEMA DE PERMISOS**

### **3.1 Proceso de Autenticación y Carga de Permisos**

#### **Query de Login**

```sql
SELECT * FROM usuarios
WHERE username = ?
  AND password = SHA1(MD5(?))
  AND estado = 1
  AND active = 'true';
```

#### **Query de Carga de Acciones (Permisos)**

```sql
SELECT
    acciones.*,
    modulos.name as modulo
FROM acciones
LEFT JOIN modulos ON modulos.id = acciones.modulo_id
WHERE acciones.usuario_id = ?
ORDER BY modulos.id ASC;
```

**Resultado almacenado en sesión**:

```php
// Estructura de datos en $_SESSION['acciones']
[
    {
        "id": 1,
        "usuario_id": 392,
        "modulo_id": 1,
        "leer": 1,
        "insertar": 0,
        "editar": 0,
        "eliminar": 0,
        "modulo": "equipos"
    },
    {
        "id": 2,
        "usuario_id": 392,
        "modulo_id": 15,
        "leer": 1,
        "insertar": 1,
        "editar": 0,
        "eliminar": 0,
        "modulo": "tickets propios"
    }
    // ... más módulos
]
```

### **3.2 Verificación de Permisos en Tiempo Real**

#### **Query para Verificar Acceso a Módulo Específico**

```sql
SELECT leer, insertar, editar, eliminar
FROM acciones a
JOIN modulos m ON a.modulo_id = m.id
WHERE a.usuario_id = ? AND m.name = ?;
```

#### **Query para Verificar Permisos por Rol (Sistema Secundario)**

```sql
SELECT p.read, p.insert, p.update, p.delete, p.assign
FROM permisos p
JOIN menus m ON p.menu_id = m.id
WHERE p.rol_id = ? AND m.link = ?;
```

### **3.3 Creación Automática de Permisos (Activación de Cuenta)**

#### **Query de Inserción Masiva de Permisos por Defecto**

```sql
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar) VALUES
-- Permisos básicos para usuario normal (rol_id = 4)
(?, 1, 1, 0, 0, 0),   -- equipos: solo lectura
(?, 2, 0, 0, 0, 0),   -- usuarios: sin acceso
(?, 3, 0, 0, 0, 0),   -- servicios: sin acceso
(?, 4, 1, 0, 0, 0),   -- equipos industriales: solo lectura
(?, 5, 0, 0, 0, 0),   -- bajas equipos: sin acceso
(?, 6, 0, 0, 0, 0),   -- invimas: sin acceso
(?, 7, 0, 0, 0, 0),   -- soportes compra: sin acceso
(?, 8, 0, 0, 0, 0),   -- repuestos: sin acceso
(?, 15, 1, 1, 0, 0),  -- tickets propios: lectura + inserción
(?, 16, 0, 0, 0, 0),  -- tickets activos: sin acceso
(?, 17, 0, 0, 0, 0),  -- tickets cerrados: sin acceso
(?, 18, 0, 0, 0, 0),  -- observaciones: sin acceso
(?, 20, 0, 0, 0, 0),  -- areas: sin acceso
(?, 21, 0, 0, 0, 0),  -- contingencias: sin acceso
(?, 22, 0, 0, 0, 0);  -- guias rapidas: sin acceso
```

## **4. ADMINISTRACIÓN DE PERMISOS**

### **4.1 Consulta de Usuario con Acciones**

```sql
SELECT
    u.id,
    u.nombre,
    u.apellido,
    u.username,
    u.email,
    r.nombre as rol,
    c.name as centro,
    c.code as codigo_centro,
    e.name as empresa,
    s.name as sede
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN centros c ON u.centro_id = c.id
LEFT JOIN empresas e ON u.id_empresa = e.id
LEFT JOIN sedes s ON u.sede_id = s.id
WHERE u.id = ? AND u.estado = 1;
```

### **4.2 Consulta de Acciones de Usuario Específico**

```sql
SELECT
    a.*,
    m.name as modulo
FROM acciones a
LEFT JOIN modulos m ON m.id = a.modulo_id
WHERE a.usuario_id = ?
ORDER BY m.id ASC;
```

### **4.3 Edición Individual de Permisos**

```sql
-- Alternar permiso de lectura
UPDATE acciones
SET leer = CASE WHEN leer = 1 THEN 0 ELSE 1 END
WHERE id = ?;

-- Alternar permiso de inserción
UPDATE acciones
SET insertar = CASE WHEN insertar = 1 THEN 0 ELSE 1 END
WHERE id = ?;

-- Alternar permiso de edición
UPDATE acciones
SET editar = CASE WHEN editar = 1 THEN 0 ELSE 1 END
WHERE id = ?;

-- Alternar permiso de eliminación
UPDATE acciones
SET eliminar = CASE WHEN eliminar = 1 THEN 0 ELSE 1 END
WHERE id = ?;
```

## **5. GESTIÓN MASIVA DE MÓDULOS**

### **5.1 Consulta de Módulos con Conteo de Usuarios**

```sql
SELECT
    m.*,
    (
        SELECT COUNT(*)
        FROM acciones a
        WHERE a.modulo_id = m.id
    ) AS cantidad_usuarios_con_acceso
FROM modulos m
ORDER BY m.id ASC;
```

### **5.2 Restablecimiento Masivo de Permisos por Módulo**

```sql
-- Eliminar permisos existentes del módulo
DELETE FROM acciones WHERE modulo_id = ?;

-- Crear permisos automáticos basados en rol
INSERT INTO acciones(usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT
    u.id,
    ? as modulo_id,
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END as leer,      -- Admin: todos los permisos
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END as insertar,  -- Otros: sin permisos
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END as editar,
    CASE WHEN u.rol_id = 1 THEN 1 ELSE 0 END as eliminar
FROM usuarios u
WHERE u.estado = 1 AND u.active = 'true';
```

## **6. CONFIGURACIONES POR TIPO DE ROL**

### **6.1 Permisos de Administrador (rol_id = 1)**

```sql
-- Crear permisos completos para administrador
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT
    ? as usuario_id,
    m.id as modulo_id,
    1 as leer,
    1 as insertar,
    1 as editar,
    1 as eliminar
FROM modulos m;
```

### **6.2 Permisos de Usuario Normal (rol_id = 4)**

```sql
-- Crear permisos limitados para usuario normal
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT
    ? as usuario_id,
    m.id as modulo_id,
    CASE
        WHEN m.name IN ('equipos', 'equipos industriales') THEN 1
        WHEN m.name = 'tickets propios' THEN 1
        ELSE 0
    END as leer,
    CASE
        WHEN m.name = 'tickets propios' THEN 1
        ELSE 0
    END as insertar,
    0 as editar,
    0 as eliminar
FROM modulos m;
```

### **6.3 Permisos de Técnico (rol_id = 2)**

```sql
-- Crear permisos de técnico
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT
    ? as usuario_id,
    m.id as modulo_id,
    CASE
        WHEN m.name IN ('equipos', 'equipos industriales', 'tickets propios', 'tickets activos', 'observaciones', 'repuestos') THEN 1
        ELSE 0
    END as leer,
    CASE
        WHEN m.name IN ('tickets propios', 'observaciones') THEN 1
        ELSE 0
    END as insertar,
    CASE
        WHEN m.name IN ('tickets propios', 'tickets activos') THEN 1
        ELSE 0
    END as editar,
    0 as eliminar
FROM modulos m;
```

## **7. CONSULTAS DE VERIFICACIÓN Y AUDITORÍA**

### **7.1 Usuarios con Acceso a Módulo Específico**

```sql
SELECT
    u.nombre,
    u.apellido,
    u.email,
    u.username,
    r.nombre as rol,
    a.leer,
    a.insertar,
    a.editar,
    a.eliminar
FROM acciones a
JOIN usuarios u ON a.usuario_id = u.id
JOIN roles r ON u.rol_id = r.id
JOIN modulos m ON a.modulo_id = m.id
WHERE m.name = ? AND a.leer = 1
ORDER BY u.nombre;
```

### **7.2 Módulos Accesibles por Usuario**

```sql
SELECT
    m.name as modulo,
    a.leer,
    a.insertar,
    a.editar,
    a.eliminar,
    CASE
        WHEN a.leer = 1 THEN 'Sí'
        ELSE 'No'
    END as puede_acceder
FROM acciones a
JOIN modulos m ON a.modulo_id = m.id
WHERE a.usuario_id = ?
ORDER BY m.id;
```

### **7.3 Usuarios sin Permisos en Ningún Módulo**

```sql
SELECT
    u.id,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.id
LEFT JOIN acciones a ON u.id = a.usuario_id
WHERE u.estado = 1
  AND u.active = 'true'
  AND a.usuario_id IS NULL;
```

### **7.4 Módulos sin Usuarios Asignados**

```sql
SELECT
    m.id,
    m.name as modulo
FROM modulos m
LEFT JOIN acciones a ON m.id = a.modulo_id
WHERE a.modulo_id IS NULL;
```

## **8. ESTRUCTURA DE DATOS PARA FRONTEND**

### **8.1 Formato JSON de Permisos en Sesión**

```json
{
  "acciones": [
    {
      "id": 1,
      "usuario_id": 392,
      "modulo_id": 1,
      "leer": "1",
      "insertar": "0",
      "editar": "0",
      "eliminar": "0",
      "modulo": "equipos"
    },
    {
      "id": 2,
      "usuario_id": 392,
      "modulo_id": 15,
      "leer": "1",
      "insertar": "1",
      "editar": "0",
      "eliminar": "0",
      "modulo": "tickets propios"
    }
  ]
}
```

### **8.2 Estructura de Verificación en JavaScript**

```javascript
// Objeto global de permisos
window.permissions = {
  equipos: {
    read: true,
    insert: false,
    edit: false,
    delete: false,
  },
  "tickets propios": {
    read: true,
    insert: true,
    edit: false,
    delete: false,
  },
};
```

## **9. ÍNDICES Y OPTIMIZACIONES**

### **9.1 Índices Recomendados**

```sql
-- Índices para tabla acciones
CREATE INDEX idx_acciones_usuario_modulo ON acciones(usuario_id, modulo_id);
CREATE INDEX idx_acciones_modulo_leer ON acciones(modulo_id, leer);
CREATE INDEX idx_acciones_usuario_leer ON acciones(usuario_id, leer);

-- Índices para tabla usuarios
CREATE INDEX idx_usuarios_rol_estado ON usuarios(rol_id, estado);
CREATE INDEX idx_usuarios_active_estado ON usuarios(active, estado);
CREATE INDEX idx_usuarios_centro ON usuarios(centro_id);

-- Índices para tabla permisos
CREATE INDEX idx_permisos_rol_menu ON permisos(rol_id, menu_id);

-- Índices para tabla modulos
CREATE INDEX idx_modulos_name ON modulos(name);
```

### **9.2 Consultas Optimizadas para Carga Rápida**

```sql
-- Carga optimizada de permisos de usuario
SELECT
    a.modulo_id,
    m.name,
    a.leer,
    a.insertar,
    a.editar,
    a.eliminar
FROM acciones a
FORCE INDEX (idx_acciones_usuario_modulo)
JOIN modulos m ON a.modulo_id = m.id
WHERE a.usuario_id = ?;
```

## **10. CONSIDERACIONES PARA REPLICACIÓN**

### **10.1 Orden de Creación de Tablas**

1. `roles`
2. `centros`
3. `empresas`
4. `sedes`
5. `usuarios`
6. `modulos`
7. `acciones`
8. `menus`
9. `permisos`

### **10.2 Datos Mínimos Requeridos**

```sql
-- Datos esenciales para funcionamiento
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Usuario normal');
INSERT INTO centros (name, code, status) VALUES ('Centro Principal', 'CP001', 1);
INSERT INTO modulos (name) VALUES ('equipos'), ('tickets propios'), ('usuarios');
```

### **10.3 Verificación de Integridad**

```sql
-- Verificar que todos los usuarios activos tengan permisos
SELECT COUNT(*) as usuarios_sin_permisos
FROM usuarios u
LEFT JOIN acciones a ON u.id = a.usuario_id
WHERE u.estado = 1 AND u.active = 'true' AND a.usuario_id IS NULL;

-- Verificar que todos los módulos tengan al menos un usuario con acceso
SELECT COUNT(*) as modulos_sin_usuarios
FROM modulos m
LEFT JOIN acciones a ON m.id = a.modulo_id AND a.leer = 1
WHERE a.modulo_id IS NULL;
```

## **11. RESUMEN DEL SISTEMA**

**Tabla Principal**: `acciones` - Controla todos los permisos granulares por usuario
**Tabla Secundaria**: `permisos` - Sistema tradicional de permisos por rol
**Flujo Principal**: Usuario → Acciones → Módulos → Verificación en tiempo real
**Administración**: Panel de usuarios con edición individual de permisos por módulo
**Flexibilidad**: Máxima granularidad - cada usuario puede tener permisos únicos independientes de su rol

Este sistema permite **control total** sobre qué puede hacer cada usuario en cada módulo específico del sistema, proporcionando seguridad granular y flexibilidad administrativa completa.
