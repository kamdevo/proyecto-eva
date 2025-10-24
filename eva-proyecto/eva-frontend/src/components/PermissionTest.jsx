import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente de prueba para verificar el sistema de permisos
 * Solo visible en modo desarrollo
 */
const PermissionTest = () => {
  const { 
    user, 
    isAdmin, 
    canRead, 
    canInsert, 
    canEdit, 
    canDelete, 
    canAccessRoute,
    permissionService 
  } = useAuth();

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!user) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
        <strong>⚠️ Permission Test:</strong> No hay usuario autenticado
      </div>
    );
  }

  const testModules = [
    'equipos',
    'usuarios', 
    'servicios',
    'equipos industriales',
    'tickets propios',
    'reportes'
  ];

  const testRoutes = [
    '/equipos/biomedicos',
    '/admin/usuarios',
    '/config/servicios',
    '/ordenes/mis-tickets',
    '/dashboard/reportes'
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        🔐 Permission System Test (Development Only)
      </h3>
      
      {/* Información del usuario */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-medium text-gray-800 mb-2">👤 Usuario Actual</h4>
        <div className="text-sm text-gray-600">
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Rol:</strong> {typeof user.rol === 'object' ? user.rol.nombre : user.rol} (ID: {user.rol_id})</p>
          <p><strong>Es Admin:</strong> {isAdmin() ? '✅ Sí' : '❌ No'}</p>
        </div>
      </div>

      {/* Test de permisos por módulo */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-medium text-gray-800 mb-2">🔧 Permisos por Módulo</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {testModules.map(module => {
            const permissions = permissionService.getModulePermissions(module);
            return (
              <div key={module} className="border rounded p-2">
                <div className="font-medium text-gray-700 mb-1">{module}</div>
                {permissions ? (
                  <div className="flex gap-2 text-xs">
                    <span className={`px-1 rounded ${permissions.leer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {permissions.leer ? '✅' : '❌'} Leer
                    </span>
                    <span className={`px-1 rounded ${permissions.insertar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {permissions.insertar ? '✅' : '❌'} Insertar
                    </span>
                    <span className={`px-1 rounded ${permissions.editar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {permissions.editar ? '✅' : '❌'} Editar
                    </span>
                    <span className={`px-1 rounded ${permissions.eliminar ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {permissions.eliminar ? '✅' : '❌'} Eliminar
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500 text-xs">Sin permisos configurados</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Test de acceso a rutas */}
      <div className="mb-4 p-3 bg-white rounded border">
        <h4 className="font-medium text-gray-800 mb-2">🛣️ Acceso a Rutas</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {testRoutes.map(route => (
            <div key={route} className="flex items-center justify-between border rounded p-2">
              <span className="text-gray-700">{route}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                canAccessRoute(route) 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {canAccessRoute(route) ? '✅ Permitido' : '❌ Denegado'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Funciones de utilidad */}
      <div className="p-3 bg-white rounded border">
        <h4 className="font-medium text-gray-800 mb-2">🛠️ Funciones de Utilidad</h4>
        <div className="flex flex-wrap gap-2 text-sm">
          <button 
            onClick={() => permissionService.debugPermissions()}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🐛 Debug Permisos (Consola)
          </button>
          <button 
            onClick={() => console.log('Módulos legibles:', permissionService.getReadableModules())}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📖 Módulos Legibles
          </button>
          <button 
            onClick={() => {
              const testResults = {
                canReadEquipos: canRead('equipos'),
                canInsertUsuarios: canInsert('usuarios'),
                canEditServicios: canEdit('servicios'),
                canDeleteReportes: canDelete('reportes')
              };
              console.log('🧪 Resultados de prueba:', testResults);
            }}
            className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            🧪 Test Rápido
          </button>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        💡 Este componente solo es visible en modo desarrollo. 
        Abre la consola del navegador para ver información detallada.
      </div>
    </div>
  );
};

export default PermissionTest;
