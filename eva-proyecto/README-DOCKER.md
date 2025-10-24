# 🐳 Sistema EVA - Despliegue con Docker

## Hospital Universitario del Valle - Electromedicina

Este documento proporciona instrucciones completas para desplegar el Sistema EVA utilizando Docker en red local.

---

## 📋 Requisitos Previos

### Software Necesario:
- **Docker Desktop** 4.0+ instalado y funcionando
- **Git** para clonar el repositorio
- **Windows 10/11** o **Windows Server**
- **8GB RAM** mínimo (16GB recomendado)
- **20GB** de espacio libre en disco

### Puertos Utilizados:
- **5173** - Frontend React (EVA Interface)
- **8001** - Backend Laravel (API)
- **3306** - MySQL Database
- **6379** - Redis Cache
- **80** - Nginx Proxy (opcional)

---

## 🚀 Instalación Rápida

### Paso 1: Clonar o Descargar el Proyecto
```bash
git clone <repository-url>
cd proyecto-eva
```

### Paso 2: Ejecutar Script de Despliegue
```batch
# Hacer doble clic en:
deploy-eva-docker.bat
```

**¡Eso es todo!** El script detectará automáticamente la IP de tu equipo y configurará todo el sistema.

---

## 🔧 Configuración Manual (Avanzada)

### 1. Preparar Variables de Entorno

Edita el archivo `.env.docker` si necesitas configuraciones específicas:

```env
# Configuración de Base de Datos
DB_DATABASE=gestionthuv
DB_USERNAME=eva_user
DB_PASSWORD=eva_password_2024

# Configuración de Email
MAIL_USERNAME=evagestionalamedicina@gmail.com
MAIL_PASSWORD="ddqd vsvu innh dggl"
NOTIFICATION_EMAIL=tu-email@hospital.com
```

### 2. Construir e Iniciar Servicios

```bash
# Construir todas las imágenes
docker-compose build --no-cache

# Iniciar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f
```

### 3. Verificar Estado de Servicios

```bash
# Ver estado de contenedores
docker-compose ps

# Verificar logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

---

## 🌐 Acceso al Sistema

Una vez desplegado, el sistema estará disponible en:

### URLs Principales:
- **Aplicación Principal:** `http://[IP-DE-TU-EQUIPO]:5173`
- **API Backend:** `http://[IP-DE-TU-EQUIPO]:8001/api`
- **Documentos/Storage:** `http://[IP-DE-TU-EQUIPO]:8001/storage`

### Ejemplo con IP 192.168.1.100:
- Frontend: `http://192.168.1.100:5173`
- Backend: `http://192.168.1.100:8001`

---

## 🛠️ Scripts Disponibles

### Despliegue y Gestión:
- **`deploy-eva-docker.bat`** - Despliegue completo automático
- **`stop-eva-docker.bat`** - Detener todos los servicios
- **`restart-eva-docker.bat`** - Reiniciar servicios específicos
- **`logs-eva-docker.bat`** - Ver logs en tiempo real

### Uso de Scripts:
```batch
# Desplegar sistema completo
deploy-eva-docker.bat

# Ver logs del backend
logs-eva-docker.bat
# Seleccionar opción 2 (Backend)

# Reiniciar solo el frontend
restart-eva-docker.bat
# Seleccionar opción 3 (Frontend)
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   React/Vite    │◄──►│  Laravel/PHP    │◄──►│     MySQL       │
│   Port: 5173    │    │   Port: 8001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │  Cache/Sessions │
                    │   Port: 6379    │
                    └─────────────────┘
```

### Servicios Docker:

#### 1. **eva_frontend** (React/Vite)
- **Imagen:** Node.js 20 Alpine
- **Puerto:** 5173
- **Función:** Interfaz de usuario, comunicación con API
- **Características:** Configuración dinámica de URLs, PWA ready

#### 2. **eva_backend** (Laravel/PHP)
- **Imagen:** PHP 8.2 FPM Alpine + Nginx
- **Puerto:** 8001
- **Función:** API REST, lógica de negocio, autenticación
- **Características:** Optimizaciones de performance, manejo de archivos

#### 3. **eva_mysql** (MySQL 8.0)
- **Puerto:** 3306
- **Función:** Base de datos principal
- **Características:** Configuración optimizada para EVA, charset UTF8MB4

#### 4. **eva_redis** (Redis 7)
- **Puerto:** 6379
- **Función:** Cache, sesiones, colas de trabajo
- **Características:** Persistencia activada, contraseña segura

#### 5. **eva_nginx** (Nginx Proxy - Opcional)
- **Puerto:** 80
- **Función:** Proxy reverso, balanceador de carga
- **Características:** Rate limiting, compresión GZIP

---

## 🔒 Seguridad

### Contraseñas Predeterminadas:
- **MySQL Root:** `eva_root_password_2024`
- **MySQL User:** `eva_user` / `eva_password_2024`
- **Redis:** `eva_redis_password_2024`

### Recomendaciones de Seguridad:
1. **Cambiar contraseñas** antes de producción
2. **Configurar firewall** para limitar acceso a puertos
3. **Usar HTTPS** en producción (certificados SSL)
4. **Backup regular** de la base de datos
5. **Monitoreo** de logs y recursos

### Cambiar Contraseñas:
```bash
# Editar archivo docker-compose.yml
# Buscar y cambiar:
MYSQL_ROOT_PASSWORD: nueva_contraseña_root
MYSQL_PASSWORD: nueva_contraseña_usuario
REDIS_PASSWORD: nueva_contraseña_redis
```

---

## 📈 Monitoreo y Mantenimiento

### Ver Estado del Sistema:
```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Espacio en disco
docker system df
```

### Logs de Depuración:
```bash
# Logs de todos los servicios
docker-compose logs -f

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f mysql --tail=50
```

### Backup de Base de Datos:
```bash
# Crear backup
docker exec eva_mysql mysqldump -u eva_user -peva_password_2024 gestionthuv > backup_eva_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i eva_mysql mysql -u eva_user -peva_password_2024 gestionthuv < backup_eva_20241007.sql
```

---

## 🔧 Solución de Problemas

### Problemas Comunes:

#### 1. **Error: "No se puede conectar a Docker"**
- Verificar que Docker Desktop está corriendo
- Reiniciar Docker Desktop
- Verificar permisos de usuario

#### 2. **Error: "Puerto ya en uso"**
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :5173
netstat -ano | findstr :8001

# Detener proceso específico
taskkill /PID [NUMERO_PID] /F
```

#### 3. **Error: "Base de datos no conecta"**
```bash
# Verificar logs de MySQL
docker-compose logs mysql

# Reiniciar solo MySQL
docker-compose restart mysql

# Verificar conexión
docker exec eva_mysql mysql -u eva_user -peva_password_2024 -e "SELECT 1"
```

#### 4. **Frontend no carga / Pantalla blanca**
```bash
# Verificar logs del frontend
docker-compose logs frontend

# Reconstruir frontend
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

#### 5. **API no responde / Error 500**
```bash
# Ver logs detallados del backend
docker-compose logs backend

# Entrar al contenedor para debugging
docker exec -it eva_backend bash

# Verificar permisos
docker exec eva_backend chown -R eva:eva /var/www/html/storage
```

### Comandos de Diagnóstico:
```bash
# Información completa del sistema
docker system info

# Verificar redes
docker network ls

# Verificar volúmenes
docker volume ls

# Limpiar sistema (¡CUIDADO!)
docker system prune -f
```

---

## 🚀 Optimización de Performance

### Configuraciones Recomendadas:

#### Para Producción:
1. **Aumentar recursos** en docker-compose.yml:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'  
          memory: 1G
```

2. **Habilitar Redis** para cache:
```env
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

3. **Configurar backup automático**:
```bash
# Agregar a crontab
0 2 * * * docker exec eva_mysql mysqldump -u eva_user -peva_password_2024 gestionthuv > /backups/eva_$(date +\%Y\%m\%d).sql
```

---

## 📞 Soporte Técnico

### Información de Contacto:
- **Hospital:** Hospital Universitario del Valle
- **Departamento:** Electromedicina
- **Sistema:** EVA - Gestión de Equipos Médicos

### Para Soporte:
1. **Recopilar logs:**
```bash
docker-compose logs > logs_eva_$(date +%Y%m%d_%H%M%S).txt
```

2. **Información del sistema:**
```bash
docker version > system_info.txt
docker-compose version >> system_info.txt
docker system info >> system_info.txt
```

3. **Enviar información** junto con descripción del problema

---

## 📝 Changelog

### Versión 1.0.0 - Docker Release
- ✅ Dockerización completa del sistema EVA
- ✅ Configuración automática de red local
- ✅ Scripts de despliegue automatizado
- ✅ Documentación completa
- ✅ Sistema de backup integrado
- ✅ Monitoreo y logging avanzado

---

**© 2024 Hospital Universitario del Valle - Electromedicina**  
**Sistema EVA - Gestión de Equipos Médicos**
