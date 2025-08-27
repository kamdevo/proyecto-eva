# EVA-ORG User Role Permissions System - Technical Report

## Executive Summary

This technical report provides comprehensive documentation of the user role permissions system implemented in the EVA-ORG project. The system employs a multi-layered approach combining role-based access control (RBAC) with granular module-level permissions to ensure secure access to different system functionalities.

## 1. Role Structure Analysis

### 1.1 Role Hierarchy

The EVA-ORG system implements a hierarchical role structure with the following levels:

#### Primary Roles
- **Role ID 1: Super Administrator (Administrador)**
  - Highest privilege level
  - Full system access by default
  - Can manage all users, roles, and permissions
  - Bypass most permission checks

- **Role ID 2: Administrator (Admin)**
  - Administrative privileges with some restrictions
  - Access to user management and system configuration
  - Cannot modify super administrator accounts

- **Role ID 3: Advanced User (Usuario Avanzado)**
  - Extended functionality access
  - Can perform advanced operations within assigned modules
  - Limited administrative capabilities

- **Role ID 4: Basic User (Usuario Básico)**
  - Standard user with restricted access
  - Limited to basic operational functions
  - Cannot access administrative features

### 1.2 Role Inheritance Pattern

The system follows a hierarchical inheritance model where:
- Higher-level roles inherit permissions from lower levels
- Role ID 1 (Super Admin) has automatic full access
- Roles 2-4 require explicit permission assignment
- New modules default to "no access" for roles 2-4

## 2. Permission Matrix

### 2.1 Permission Types

Each role can have four types of permissions per module:

| Permission Type | Description | Database Column |
|----------------|-------------|-----------------|
| **Read (Leer)** | View/access module content | `leer` |
| **Create (Insertar)** | Add new records | `insertar` |
| **Update (Editar)** | Modify existing records | `editar` |
| **Delete (Eliminar)** | Remove records | `eliminar` |

### 2.2 Module Categories

The system organizes permissions across several module categories:

#### Equipment Management Modules
- Equipment (equipos)
- Equipment Status (estado equipos)
- Purchase Orders (soportes compra)
- Quick Guides (guias rapidas)
- Spare Parts (repuestos)

#### Maintenance Modules
- Work Orders (tickets propios)
- Active Tickets (tickets activos)
- Closed Tickets (tickets cerrados)
- Preventive Maintenance (mantenimiento preventivo)
- Calibrations (calibraciones)
- Training (capacitaciones)

#### Administrative Modules
- Users (usuarios)
- Contacts (contactos)
- Locations (servicios)
- Areas (areas)
- Centers (centros)

#### Configuration Modules
- Roles (roles)
- Permissions (permisos)
- Modules (modulos)
- System Settings (configuracion)

### 2.3 Default Permission Matrix

| Role Level | Equipment Mgmt | Maintenance | Administrative | Configuration |
|------------|---------------|-------------|----------------|---------------|
| Super Admin (1) | Full Access | Full Access | Full Access | Full Access |
| Administrator (2) | Read/Write | Read/Write | Read/Write | Read Only |
| Advanced User (3) | Read/Write | Read/Write | Read Only | No Access |
| Basic User (4) | Read Only | Read Only | No Access | No Access |

## 3. Database Schema

### 3.1 Core Permission Tables

#### `usuarios` (Users Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | User unique identifier |
| `username` | VARCHAR | Login username |
| `password` | VARCHAR | Encrypted password |
| `nombre` | VARCHAR | Full name |
| `rol_id` | INT (FK) | Reference to roles table |
| `centro_id` | INT (FK) | Reference to centers table |
| `sede_id` | INT (FK) | Reference to locations table |
| `estado` | INT | User status (1=active, 0=inactive) |
| `anio_plan` | INT | Planning year assignment |

#### `roles` (Roles Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Role unique identifier |
| `nombre` | VARCHAR | Role name |
| `descripcion` | TEXT | Role description |
| `estado` | INT | Role status |

#### `modulos` (Modules Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Module unique identifier |
| `name` | VARCHAR | Module name |
| `descripcion` | TEXT | Module description |
| `controlador` | VARCHAR | Associated controller |
| `estado` | INT | Module status |

#### `acciones` (Actions/Permissions Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Action unique identifier |
| `usuario_id` | INT (FK) | Reference to users table |
| `modulo_id` | INT (FK) | Reference to modules table |
| `leer` | TINYINT | Read permission (0/1) |
| `insertar` | TINYINT | Create permission (0/1) |
| `editar` | TINYINT | Update permission (0/1) |
| `eliminar` | TINYINT | Delete permission (0/1) |

#### `menus` (Menu Items Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Menu item identifier |
| `nombre` | VARCHAR | Menu item name |
| `link` | VARCHAR | Controller/method path |
| `icono` | VARCHAR | Menu icon class |
| `orden` | INT | Display order |

#### `permisos` (Menu Permissions Table)
| Column | Type | Description |
|--------|------|-------------|
| `id` | INT (PK) | Permission identifier |
| `rol_id` | INT (FK) | Reference to roles table |
| `menu_id` | INT (FK) | Reference to menus table |
| `read` | TINYINT | Read access (0/1) |
| `write` | TINYINT | Write access (0/1) |
| `delete` | TINYINT | Delete access (0/1) |

### 3.2 Relationship Structure

```
usuarios (1) ←→ (1) roles
usuarios (1) ←→ (N) acciones
modulos (1) ←→ (N) acciones
roles (1) ←→ (N) permisos
menus (1) ←→ (N) permisos
```

### 3.3 Foreign Key Constraints

- `usuarios.rol_id` → `roles.id`
- `acciones.usuario_id` → `usuarios.id`
- `acciones.modulo_id` → `modulos.id`
- `permisos.rol_id` → `roles.id`
- `permisos.menu_id` → `menus.id`

## 4. Implementation Details

### 4.1 Permission Checking Flow

#### Session-Based Authentication
1. User logs in with username/password
2. System validates credentials against `usuarios` table
3. User's role and permissions loaded into session
4. Session stores:
   - `login` (boolean)
   - `rol_id` (role identifier)
   - `acciones` (array of user permissions)
   - `usuario_id` (user identifier)

#### Controller-Level Permission Enforcement
1. Each controller checks session login status
2. Retrieves user's `acciones` from session
3. Validates specific module permissions
4. Redirects to forbidden page if access denied
5. Allows access if permissions match requirements

#### Menu-Level Access Control
1. System uses `Backend_lib` library for menu access
2. Constructs URL path from controller/method
3. Queries `menus` table for menu item ID
4. Checks `permisos` table for role-based access
5. Redirects to dashboard if read permission = 0

### 4.2 Permission Inheritance Patterns

#### Role-Based Inheritance
- Super Administrator (Role 1): Automatic full access
- Other roles: Explicit permission assignment required
- New modules: Default permissions based on role level

#### Module Permission Propagation
- New modules trigger automatic permission setup
- Super Admin gets full permissions (1,1,1,1)
- Other roles get no permissions (0,0,0,0)
- Manual assignment required for roles 2-4

### 4.3 Frontend Permission Validation

#### Menu Rendering
- Sidebar menus filtered by user permissions
- Different sidebar templates per role level:
  - `layouts/aside` (Super Admin)
  - `layouts/admin_aside` (Administrator)
  - `layouts/advance_aside` (Advanced User)
  - `layouts/basic_aside` (Basic User)

#### Button/Action Visibility
- CRUD buttons shown/hidden based on permissions
- JavaScript checks session permission data
- Dynamic UI element rendering

## 5. Replication Guide

### 5.1 Creating New Roles

#### Step 1: Add Role to Database
```sql
INSERT INTO roles (nombre, descripcion, estado) 
VALUES ('New Role Name', 'Role Description', 1);
```

#### Step 2: Set Default Permissions
- New roles automatically get no permissions
- Manual assignment required for each module
- Use permission management interface

#### Step 3: Create Sidebar Template
- Create new sidebar view file
- Add role-specific menu items
- Update controller logic to load appropriate sidebar

### 5.2 Assigning Permissions to Roles

#### Method 1: Individual User Permissions
1. Access user management interface
2. Select user to modify
3. Update permissions in `acciones` table
4. Permissions apply immediately

#### Method 2: Role-Based Menu Permissions
1. Access permission management interface
2. Select role and menu combination
3. Set read/write/delete permissions
4. Update `permisos` table

### 5.3 Modifying Existing Role Permissions

#### Bulk Permission Updates
1. Use module management interface
2. Select "Reset Permissions" for specific module
3. System automatically assigns default permissions
4. Super Admin gets full access, others get none

#### Individual Permission Modification
1. Access user details interface
2. Modify specific permission checkboxes
3. Save changes to `acciones` table
4. Changes take effect on next page load

### 5.4 Testing Permission Configurations

#### Test Scenarios
1. **Login Test**: Verify user can authenticate
2. **Menu Access Test**: Check sidebar menu visibility
3. **Module Access Test**: Attempt to access restricted modules
4. **CRUD Operation Test**: Test create/read/update/delete operations
5. **Cross-Role Test**: Verify role isolation

#### Validation Steps
1. Create test users for each role level
2. Assign specific permission combinations
3. Test access to each module category
4. Verify proper redirection for denied access
5. Confirm session data accuracy

## 6. Security Considerations

### 6.1 Session Security
- Session-based authentication prevents direct database queries
- Automatic logout on session expiration
- Permission data cached in session for performance

### 6.2 Access Control Enforcement
- Multiple validation layers (session, controller, menu)
- Consistent redirection for unauthorized access
- No direct URL access bypass possible

### 6.3 Role Isolation
- Users cannot escalate their own privileges
- Role modifications require administrative access
- Audit trail through database logging

## 7. Maintenance and Monitoring

### 7.1 Regular Maintenance Tasks
- Review user role assignments quarterly
- Audit permission configurations
- Clean up inactive user accounts
- Monitor failed access attempts

### 7.2 Performance Considerations
- Session-based permission caching
- Minimal database queries per request
- Efficient role hierarchy checking

### 7.3 Troubleshooting Common Issues
- **Access Denied**: Check user role and module permissions
- **Menu Not Visible**: Verify menu permissions table
- **Session Issues**: Clear session data and re-login
- **Permission Not Applied**: Check acciones table entries

## Conclusion

The EVA-ORG permission system provides a robust, scalable approach to access control through its combination of role-based permissions and granular module-level access controls. The system's hierarchical structure ensures appropriate access levels while maintaining security and operational efficiency.

The dual-layer approach (role-based menu permissions and user-specific module permissions) provides flexibility for complex organizational structures while maintaining simplicity for standard use cases. Regular maintenance and proper testing procedures ensure the system remains secure and functional as the organization grows.



Entiendo, quieres un reporte con los permisos que **DEBERÍA** tener cada rol automáticamente, no los permisos por defecto del sistema actual. Basándome en la lógica del negocio y la estructura del sistema, aquí tienes una propuesta de permisos ideales por rol:

## **MATRIZ DE PERMISOS RECOMENDADA POR ROL**
### **Formato: Leer-Insertar-Editar-Eliminar (L-I-E-D)**

| **MÓDULO** | **ROL 1 (Super Admin)** | **ROL 2 (Admin)** | **ROL 3 (Avanzado)** | **ROL 4 (Básico)** |
|------------|-------------------------|-------------------|----------------------|-------------------|

### **EQUIPOS Y DISPOSITIVOS**
| equipos | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |
| equipos industriales | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |
| inivimas | 1-1-1-1 | 1-1-1-0 | 1-0-1-0 | 1-0-0-0 |
| bajas biomedicos | 1-1-1-1 | 1-1-1-1 | 1-0-0-0 | 1-0-0-0 |
| contingencias | 1-1-1-1 | 1-1-1-0 | 1-1-0-0 | 1-0-0-0 |
| estado equipos | 1-1-1-1 | 1-0-1-0 | 1-0-1-0 | 1-0-0-0 |

### **COMPRAS Y SOPORTES**
| soportes compra | 1-1-1-1 | 1-1-1-0 | 1-0-0-0 | 1-0-0-0 |

### **DOCUMENTACIÓN**
| guias rapidas | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |
| manuales | 1-1-1-1 | 1-1-1-0 | 1-0-0-0 | 1-0-0-0 |

### **GESTIÓN DE USUARIOS**
| usuarios | 1-1-1-1 | 1-1-1-0 | 0-0-0-0 | 0-0-0-0 |
| propietarios | 1-1-1-1 | 1-1-1-0 | 1-0-0-0 | 0-0-0-0 |

### **CONFIGURACIÓN Y UBICACIONES**
| servicios | 1-1-1-1 | 1-0-1-0 | 1-0-0-0 | 1-0-0-0 |
| contactos | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |
| areas | 1-1-1-1 | 1-0-1-0 | 1-0-0-0 | 1-0-0-0 |

### **TICKETS Y ÓRDENES**
| tickets propios | 1-1-1-1 | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 |
| tickets activos | 1-1-1-1 | 1-1-1-1 | 1-0-1-0 | 1-0-0-0 |
| tickets cerrados | 1-1-1-1 | 1-0-0-0 | 1-0-0-0 | 1-0-0-0 |

### **MANTENIMIENTO**
| planes mantenimiento | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |
| repuestos | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |

### **CAPACITACIÓN**
| capacitaciones | 1-1-1-1 | 1-1-1-0 | 1-1-1-0 | 1-0-0-0 |

### **REPORTES**
| reportes | 1-1-1-1 | 1-0-0-0 | 1-0-0-0 | 1-0-0-0 |

---

## **JUSTIFICACIÓN POR ROL:**

### **ROL 1 - SUPER ADMINISTRADOR (1-1-1-1)**
- **Acceso completo** a todos los módulos
- **Sin restricciones** operativas
- **Responsabilidad total** del sistema

### **ROL 2 - ADMINISTRADOR**
**Permisos Principales:**
- **Gestión de equipos**: Crear, editar (sin eliminar)
- **Gestión de usuarios**: Crear, editar usuarios (sin eliminar)
- **Tickets**: Gestión completa de tickets
- **Configuración**: Lectura y edición limitada
- **Reportes**: Solo lectura

**Restricciones:**
- **No eliminar** equipos críticos
- **No eliminar** usuarios del sistema
- **No acceso** a configuraciones críticas

### **ROL 3 - USUARIO AVANZADO**
**Permisos Principales:**
- **Equipos**: Crear y editar (sin eliminar)
- **Tickets propios**: Gestión completa de sus tickets
- **Mantenimiento**: Crear y gestionar planes
- **Documentación**: Crear y editar guías
- **Contactos**: Gestión completa

**Restricciones:**
- **No gestión** de usuarios
- **No eliminación** de equipos
- **Solo lectura** en configuraciones

### **ROL 4 - USUARIO BÁSICO**
**Permisos Principales:**
- **Equipos**: Solo lectura
- **Tickets propios**: Crear y editar sus propios tickets
- **Documentación**: Solo lectura de guías y manuales
- **Contactos**: Solo lectura

**Restricciones:**
- **No gestión** administrativa
- **No eliminación** de registros
- **No acceso** a configuraciones
- **No gestión** de otros usuarios

---

## **SCRIPT SQL PARA IMPLEMENTAR PERMISOS RECOMENDADOS:**

```sql
-- Limpiar permisos existentes (excepto Super Admin)
DELETE FROM acciones WHERE usuario_id IN (
    SELECT id FROM usuarios WHERE rol_id > 1
);

-- ROL 2 (ADMINISTRADOR) - Permisos recomendados
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT u.id, m.id,
    CASE m.name
        WHEN 'equipos' THEN 1 WHEN 'equipos industriales' THEN 1 
        WHEN 'usuarios' THEN 1 WHEN 'contactos' THEN 1
        WHEN 'tickets propios' THEN 1 WHEN 'tickets activos' THEN 1
        WHEN 'soportes compra' THEN 1 WHEN 'guias rapidas' THEN 1
        ELSE 1 END as leer,
    CASE m.name
        WHEN 'equipos' THEN 1 WHEN 'usuarios' THEN 1
        WHEN 'tickets propios' THEN 1 WHEN 'tickets activos' THEN 1
        WHEN 'reportes' THEN 0 WHEN 'tickets cerrados' THEN 0
        ELSE 1 END as insertar,
    CASE m.name
        WHEN 'reportes' THEN 0 WHEN 'tickets cerrados' THEN 0
        ELSE 1 END as editar,
    CASE m.name
        WHEN 'tickets propios' THEN 1 WHEN 'tickets activos' THEN 1
        ELSE 0 END as eliminar
FROM usuarios u, modulos m 
WHERE u.rol_id = 2;

-- ROL 3 (AVANZADO) - Permisos recomendados  
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT u.id, m.id,
    CASE m.name
        WHEN 'usuarios' THEN 0 
        ELSE 1 END as leer,
    CASE m.name
        WHEN 'equipos' THEN 1 WHEN 'tickets propios' THEN 1
        WHEN 'contactos' THEN 1 WHEN 'guias rapidas' THEN 1
        WHEN 'usuarios' THEN 0 WHEN 'reportes' THEN 0
        ELSE 1 END as insertar,
    CASE m.name
        WHEN 'usuarios' THEN 0 WHEN 'reportes' THEN 0
        WHEN 'tickets cerrados' THEN 0
        ELSE 1 END as editar,
    0 as eliminar
FROM usuarios u, modulos m 
WHERE u.rol_id = 3;

-- ROL 4 (BÁSICO) - Permisos recomendados
INSERT INTO acciones (usuario_id, modulo_id, leer, insertar, editar, eliminar)
SELECT u.id, m.id,
    CASE m.name
        WHEN 'usuarios' THEN 0 WHEN 'propietarios' THEN 0
        WHEN 'areas' THEN 1 WHEN 'servicios' THEN 1
        ELSE 1 END as leer,
    CASE m.name
        WHEN 'tickets propios' THEN 1
        ELSE 0 END as insertar,
    CASE m.name
        WHEN 'tickets propios' THEN 1
        ELSE 0 END as editar,
    0 as eliminar
FROM usuarios u, modulos m 
WHERE u.rol_id = 4;
```

---

## **RESUMEN DE CAPACIDADES POR ROL:**

### **ROL 1 (Super Admin)**: 
- **Total**: 21 módulos con acceso completo (1-1-1-1)

### **ROL 2 (Admin)**:
- **Lectura**: 21 módulos
- **Creación**: 17 módulos  
- **Edición**: 19 módulos
- **Eliminación**: 2 módulos (solo tickets)

### **ROL 3 (Avanzado)**:
- **Lectura**: 19 módulos
- **Creación**: 8 módulos
- **Edición**: 16 módulos  
- **Eliminación**: 0 módulos

### **ROL 4 (Básico)**:
- **Lectura**: 19 módulos
- **Creación**: 1 módulo (solo tickets propios)
- **Edición**: 1 módulo (solo tickets propios)
- **Eliminación**: 0 módulos

Esta matriz proporciona un balance entre seguridad y funcionalidad operativa para cada nivel de usuario en el sistema EVA-ORG.
