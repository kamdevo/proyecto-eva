# Sistema de Roles y Permisos - Implementación Completa

## 📋 Resumen

Este documento describe la implementación completa del sistema de roles y permisos para el proyecto EVA. El sistema proporciona control granular de acceso basado en permisos por usuario y módulo.

## 🏗️ Arquitectura del Sistema

### Backend (Laravel)

#### 1. **Middleware de Permisos** (`PermissionMiddleware.php`)
- Verifica permisos en tiempo real para cada request
- Utiliza caché para optimizar rendimiento
- Mapea rutas a módulos y acciones HTTP a permisos
- Los administradores (rol_id = 1) tienen acceso completo

#### 2. **Controlador de Autenticación** (`AuthController.php`)
- **Login**: Carga permisos del usuario y los incluye en la respuesta
- **Registro**: Crea permisos por defecto para usuarios normales
- **Métodos auxiliares**: 
  - `getUserPermissions()`: Obtiene permisos formateados
  - `createDefaultPermissions()`: Crea permisos por defecto

#### 3. **Estructura de Base de Datos**
```sql
-- Tabla principal de permisos por usuario
acciones (
    usuario_id -> usuarios.id,
    modulo_id -> modulos.id,
    leer, insertar, editar, eliminar
)

-- Módulos del sistema
modulos (id, name)

-- Roles de usuario
roles (id, nombre)

-- Usuarios
usuarios (id, nombre, rol_id, ...)
```

### Frontend (React)

#### 1. **Servicio de Permisos** (`permissionService.js`)
- Clase singleton que maneja verificación de permisos
- Métodos principales:
  - `canRead()`, `canInsert()`, `canEdit()`, `canDelete()`
  - `canAccessRoute()`: Verifica acceso a rutas específicas
  - `filterMenuItems()`: Filtra elementos de menú basado en permisos
  - `getModulePermissions()`: Obtiene permisos completos de un módulo

#### 2. **Contexto de Autenticación** (`AuthContext.jsx`)
- Integra el servicio de permisos
- Inicializa permisos al hacer login
- Limpia permisos al hacer logout
- Expone funciones de verificación de permisos

#### 3. **Navbar Dinámico** (`Navbar.jsx`)
- Filtra elementos de menú basado en permisos
- Solo muestra opciones accesibles para el usuario
- Incluye debug en modo desarrollo

## 🔧 Configuración de Permisos por Defecto

### Usuario Normal (rol_id = 4)
```javascript
{
  'equipos': { leer: true, insertar: false, editar: false, eliminar: false },
  'equipos industriales': { leer: true, insertar: false, editar: false, eliminar: false },
  'tickets propios': { leer: true, insertar: true, editar: false, eliminar: false },
  // Todos los demás módulos: sin permisos
}
```

### Administrador (rol_id = 1)
- Acceso completo a todos los módulos y acciones
- Bypass automático de verificaciones de permisos

## 🛣️ Mapeo de Rutas a Módulos

```javascript
ROUTE_MODULE_MAPPING = {
  '/equipos/biomedicos': 'equipos',
  '/equipos/industriales': 'equipos industriales',
  '/equipos/ordenes-compra': 'soportes compra',
  '/admin/usuarios': 'usuarios',
  '/ordenes/mis-tickets': 'tickets propios',
  // ... más mapeos
}
```

## 🚀 Uso del Sistema

### En Componentes React
```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { canRead, canInsert, isAdmin } = useAuth();
  
  return (
    <div>
      {canRead('equipos') && <EquiposList />}
      {canInsert('equipos') && <AddEquipoButton />}
      {isAdmin() && <AdminPanel />}
    </div>
  );
}
```

### En Rutas Protegidas (Backend)
```php
// Aplicar middleware a rutas específicas
Route::middleware(['auth:sanctum', 'permission:equipos,leer'])
    ->get('/api/equipos', [EquipoController::class, 'index']);

Route::middleware(['auth:sanctum', 'permission:usuarios,insertar'])
    ->post('/api/usuarios', [UsuarioController::class, 'store']);
```

## 🧪 Testing y Validación

### Script de Prueba PHP (`test-role-system.php`)
- Verifica estructura de base de datos
- Valida integridad referencial
- Muestra estadísticas del sistema
- Identifica problemas potenciales

### Componente de Prueba React (`PermissionTest.jsx`)
- Solo visible en modo desarrollo
- Muestra permisos del usuario actual
- Permite testing interactivo
- Debug de permisos en consola

## 📊 Monitoreo y Debug

### Logs del Sistema
- Login exitoso con permisos cargados
- Creación de permisos por defecto
- Errores de permisos en middleware

### Debug en Desarrollo
```javascript
// En consola del navegador
permissionService.debugPermissions();

// Verificar permisos específicos
console.log('Puede leer equipos:', canRead('equipos'));
```

## 🔒 Seguridad

### Medidas Implementadas
1. **Verificación en Backend**: Middleware valida permisos en cada request
2. **Caché Seguro**: Permisos cacheados por usuario con TTL de 5 minutos
3. **Validación Doble**: Frontend oculta UI, backend bloquea acceso
4. **Logs de Auditoría**: Registro de accesos y cambios de permisos

### Consideraciones
- Los permisos de frontend son solo para UX, la seguridad real está en el backend
- Limpiar caché al modificar permisos de usuario
- Validar integridad referencial regularmente

## 🚀 Despliegue a Producción

### Checklist Pre-Producción
- [ ] Ejecutar `test-role-system.php` sin errores
- [ ] Verificar que usuarios tienen permisos apropiados
- [ ] Confirmar que administradores tienen acceso completo
- [ ] Probar navegación con diferentes roles
- [ ] Validar que rutas protegidas funcionan correctamente

### Variables de Entorno
```env
# Backend
CACHE_DRIVER=redis  # Para mejor rendimiento en producción

# Frontend
NODE_ENV=production  # Oculta componentes de debug
```

## 📈 Rendimiento

### Optimizaciones Implementadas
1. **Caché de Permisos**: 5 minutos TTL por usuario/módulo/acción
2. **Carga Única**: Permisos cargados solo en login
3. **Filtrado Eficiente**: Menús filtrados una vez al cargar
4. **Índices de BD**: Índices optimizados en tablas de permisos

### Métricas Esperadas
- Tiempo de login: < 500ms (incluyendo carga de permisos)
- Verificación de permisos: < 10ms (con caché)
- Filtrado de menú: < 50ms

## 🔄 Mantenimiento

### Tareas Regulares
1. **Limpiar caché** al modificar permisos masivamente
2. **Auditar permisos** de usuarios inactivos
3. **Verificar integridad** con script de prueba
4. **Monitorear logs** de accesos denegados

### Comandos Útiles
```php
// Limpiar caché de permisos de usuario
PermissionMiddleware::clearUserPermissionsCache($userId);

// Obtener todos los permisos de usuario
$permissions = PermissionMiddleware::getUserPermissions($userId);
```

## 📞 Soporte

Para problemas con el sistema de permisos:
1. Ejecutar script de prueba para identificar problemas
2. Verificar logs de aplicación
3. Usar componente de debug en desarrollo
4. Revisar integridad de base de datos

---

**Estado**: ✅ Implementación Completa  
**Versión**: 1.0.0  
**Fecha**: 2025-01-27  
**Listo para Producción**: SÍ
