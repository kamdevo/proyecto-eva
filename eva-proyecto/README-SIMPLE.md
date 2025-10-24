# 🐳 Sistema EVA - Versión Simple (3 Contenedores)

## Hospital Universitario del Valle - Electromedicina

Este es el despliegue **SIMPLE** del Sistema EVA con solo 3 contenedores esenciales.

---

## ⚡ **VERSIÓN SIMPLE vs COMPLETA**

### 🎯 **Versión Simple (Recomendada para empezar):**
- ✅ **3 contenedores:** MySQL + Backend + Frontend
- ✅ **Menos recursos** de memoria y CPU
- ✅ **Más fácil de mantener**
- ✅ **Inicio más rápido**
- ⚠️ **Cache en base de datos** (sin Redis)
- ⚠️ **Sin proxy** Nginx

### 🚀 **Versión Completa (Producción):**
- ✅ **5 contenedores:** + Redis + Nginx
- ✅ **Mejor performance** con cache Redis
- ✅ **Balanceador de carga** Nginx
- ❌ **Más recursos** requeridos
- ❌ **Más complejo** de mantener

---

## 🚀 **Instalación Súper Simple**

### **1 Solo Comando:**
```batch
# Ejecutar:
deploy-eva-simple.bat
```

**¡Eso es todo!** El sistema estará funcionando en 3 contenedores.

---

## 📊 **Arquitectura Simple**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   React/Vite    │◄──►│  Laravel/PHP    │◄──►│     MySQL       │
│   Port: 5173    │    │   Port: 8001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Solo 3 Servicios:**

1. **🗄️ eva_mysql** - Base de datos MySQL 8.0
2. **🔗 eva_backend** - API Laravel/PHP 
3. **📱 eva_frontend** - Interfaz React/Vite

---

## 📋 **Requisitos Mínimos**

- **Docker Desktop** instalado
- **4GB RAM** (en lugar de 8GB)
- **10GB** espacio libre
- **Windows 10/11**

---

## 🌐 **URLs de Acceso**

- **Aplicación:** `http://[TU-IP]:5173`
- **API:** `http://[TU-IP]:8001/api`
- **Base de Datos:** `[TU-IP]:3306`

---

## 🛠️ **Scripts Disponibles**

### **Gestión Simple:**
- **`deploy-eva-simple.bat`** - Despliegue completo
- **`health-check-simple.bat`** - Verificar estado
- **`stop-eva-docker.bat`** - Detener (funciona igual)
- **`restart-eva-docker.bat`** - Reiniciar (funciona igual)

### **Comandos Docker:**
```bash
# Ver estado
docker-compose -f docker-compose-simple.yml ps

# Ver logs
docker-compose -f docker-compose-simple.yml logs -f

# Detener
docker-compose -f docker-compose-simple.yml down

# Reiniciar
docker-compose -f docker-compose-simple.yml restart
```

---

## ⚙️ **Configuración**

### **Cache y Sesiones:**
- ✅ **Cache:** Base de datos MySQL (en lugar de Redis)
- ✅ **Sesiones:** Base de datos MySQL 
- ✅ **Colas:** Base de datos MySQL

### **Performance:**
- 🟢 **Buena** para equipos de trabajo normales
- 🟢 **Suficiente** para hasta 50 usuarios concurrentes
- 🟢 **Rápido** para cargas de trabajo típicas del hospital

---

## 🔧 **Cuándo Usar Cada Versión**

### **✅ Usa Versión SIMPLE si:**
- Es tu primera vez con EVA
- Tienes recursos limitados
- Quieres algo fácil de mantener
- Tienes menos de 50 usuarios
- Prefieres simplicidad sobre performance

### **🚀 Usa Versión COMPLETA si:**
- Ya probaste la versión simple
- Tienes más de 50 usuarios concurrentes
- Necesitas máxima performance
- Tienes recursos suficientes
- El sistema está en producción crítica

---

## 📈 **Migrar de Simple a Completa**

Si empezaste con la versión simple y quieres más performance:

```bash
# 1. Detener versión simple
docker-compose -f docker-compose-simple.yml down

# 2. Usar versión completa
deploy-eva-docker.bat
```

**Los datos se mantienen** porque usan el mismo volumen de MySQL.

---

## 🎯 **Ventajas de la Versión Simple**

1. **🚀 Inicio rápido** - Solo 3 contenedores
2. **💾 Menos memoria** - ~2GB vs ~4GB
3. **🔧 Fácil debugging** - Menos componentes
4. **📱 Misma funcionalidad** - Todas las características de EVA
5. **🌐 Red local** - Acceso desde cualquier dispositivo
6. **⚡ Suficiente performance** - Para uso normal del hospital

---

## 🆘 **Solución de Problemas**

### **Problemas Comunes:**

#### **"Sistema lento"**
- ✅ **Normal:** Cache en base de datos es más lento que Redis
- 🔧 **Solución:** Migrar a versión completa si es crítico

#### **"Error de memoria"**
- ✅ **Ventaja:** Versión simple usa menos memoria
- 🔧 **Solución:** Verificar Docker Desktop tiene suficiente RAM

#### **"Base de datos no conecta"**
```bash
# Verificar MySQL
docker exec eva_mysql mysql -u eva_user -peva_password_2024 -e "SELECT 1"
```

---

## 📞 **Soporte**

### **Health Check:**
```bash
health-check-simple.bat
```

### **Logs:**
```bash
# Todos los servicios
docker-compose -f docker-compose-simple.yml logs -f

# Solo backend
docker-compose -f docker-compose-simple.yml logs -f backend
```

---

## 🎉 **Conclusión**

**La versión simple es perfecta para:**
- ✅ Empezar con EVA
- ✅ Equipos de trabajo pequeños/medianos
- ✅ Ambientes de desarrollo/pruebas
- ✅ Instalaciones con recursos limitados

**¡Solo ejecuta `deploy-eva-simple.bat` y tendrás EVA funcionando en minutos!**

---

**© 2024 Hospital Universitario del Valle - Electromedicina**  
**Sistema EVA - Versión Simple con Docker**
