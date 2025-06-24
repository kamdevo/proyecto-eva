# 🚀 INSTRUCCIONES PARA PONER EVA EN PRODUCCIÓN

## 📋 PASOS OBLIGATORIOS

### 1. **EJECUTAR MIGRACIONES**
```bash
cd eva-proyecto/eva-backend
php artisan migrate
```

### 2. **CONFIGURAR STORAGE**
```bash
php artisan storage:link
```

### 3. **INICIAR SERVIDOR LARAVEL**
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### 4. **VERIFICAR CONFIGURACIÓN**
```bash
# Verificar que el servidor responde
curl http://localhost:8000/api/equipos

# Debería devolver JSON con lista de equipos
```

## 🔧 CONFIGURACIÓN ADICIONAL

### **ARCHIVO .ENV**
Verificar que el archivo `.env` tenga la configuración correcta:

```env
APP_NAME=EVA
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestionthuv
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public
```

### **PERMISOS DE ARCHIVOS**
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

## 🌐 CONFIGURACIÓN PARA FRONTEND

### **CORS (si es necesario)**
En `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:3000', 'http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

### **URLs BASE PARA FRONTEND**
- **API Base**: `http://localhost:8000/api`
- **Archivos**: `http://localhost:8000/storage`

## 📊 VERIFICACIÓN DEL SISTEMA

### **ENDPOINTS PRINCIPALES**
```bash
# Equipos
GET http://localhost:8000/api/equipos

# Mantenimientos
GET http://localhost:8000/api/mantenimientos

# Usuarios
GET http://localhost:8000/api/usuarios

# Servicios
GET http://localhost:8000/api/servicios

# Áreas
GET http://localhost:8000/api/areas

# Tickets
GET http://localhost:8000/api/tickets

# Archivos
GET http://localhost:8000/api/archivos

# Capacitaciones
GET http://localhost:8000/api/capacitaciones

# Repuestos
GET http://localhost:8000/api/repuestos
```

### **PRUEBAS AUTOMÁTICAS**
```bash
# Ejecutar archivo de pruebas
php C:\Users\kevin\Desktop\EVA\proyecto-eva\testPrueba.php
```

## 🔐 SEGURIDAD (OPCIONAL)

### **AUTENTICACIÓN JWT**
Si se requiere autenticación:
```bash
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
php artisan jwt:secret
```

### **MIDDLEWARE DE AUTENTICACIÓN**
Agregar a rutas que requieran autenticación:
```php
Route::middleware('auth:api')->group(function () {
    // Rutas protegidas
});
```

## 📦 BACKUP Y MANTENIMIENTO

### **BACKUP DE BASE DE DATOS**
```bash
mysqldump -u root -p gestionthuv > backup_eva_$(date +%Y%m%d).sql
```

### **BACKUP DE ARCHIVOS**
```bash
tar -czf storage_backup_$(date +%Y%m%d).tar.gz storage/app/public/
```

### **LIMPIEZA DE LOGS**
```bash
php artisan log:clear
```

## 🚨 SOLUCIÓN DE PROBLEMAS

### **Error: "No application encryption key"**
```bash
php artisan key:generate
```

### **Error: "Storage link not found"**
```bash
php artisan storage:link
```

### **Error: "Database connection failed"**
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `.env`
- Verificar que la base de datos `gestionthuv` exista

### **Error: "Class not found"**
```bash
composer dump-autoload
```

### **Error: "Permission denied"**
```bash
sudo chown -R www-data:www-data storage/
sudo chown -R www-data:www-data bootstrap/cache/
```

## 📈 MONITOREO

### **LOGS DEL SISTEMA**
```bash
tail -f storage/logs/laravel.log
```

### **ESTADO DE APIS**
Usar el archivo `testPrueba.php` para verificar que todas las APIs respondan correctamente.

### **MÉTRICAS DE RENDIMIENTO**
- Tiempo de respuesta de APIs
- Uso de memoria
- Conexiones a base de datos

## 🎯 CHECKLIST FINAL

- [ ] ✅ Migraciones ejecutadas
- [ ] ✅ Storage configurado
- [ ] ✅ Servidor Laravel ejecutándose
- [ ] ✅ APIs respondiendo correctamente
- [ ] ✅ Frontend conectado
- [ ] ✅ Archivos subiendo correctamente
- [ ] ✅ Exportaciones funcionando
- [ ] ✅ Base de datos accesible
- [ ] ✅ Logs configurados
- [ ] ✅ Backups programados

## 📞 SOPORTE

Si encuentras problemas:

1. **Revisar logs**: `storage/logs/laravel.log`
2. **Ejecutar pruebas**: `php testPrueba.php`
3. **Verificar configuración**: `.env` y `config/`
4. **Reiniciar servicios**: MySQL y servidor Laravel

---

**🎉 ¡El Sistema EVA está listo para producción!**

Una vez completados estos pasos, el sistema estará 100% operativo y todas las funcionalidades del frontend podrán conectarse correctamente con el backend.
