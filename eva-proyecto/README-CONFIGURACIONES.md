# 🏥 Sistema EVA - Hospital Universitario del Valle

## 📋 **CONFIGURACIONES DISPONIBLES**

### 🎯 **MODO ACTUAL: XAMPP NATIVO**
- ✅ Backend: Laravel con `php artisan serve`
- ✅ Frontend: React/Vite con `npm run dev`
- ✅ Base de datos: MySQL XAMPP (puerto 3307)
- ✅ Acceso de red: http://192.168.2.146:5174

---

## 🔧 **SCRIPTS DISPONIBLES**

### **🚀 XAMPP NATIVO (RECOMENDADO PARA DESARROLLO):**

#### `iniciar-eva-xampp.bat`
- Inicia Backend Laravel (puerto 8001)
- Inicia Frontend React (puerto 5174)
- Verifica XAMPP MySQL (puerto 3307)
- **Ventajas:** Logs visibles, desarrollo rápido, fácil debugging

#### `parar-eva-xampp.bat`
- Para todos los servicios nativos
- XAMPP MySQL no se afecta

#### `cambiar-a-xampp.bat`
- Configura .env para XAMPP
- Para Docker si está corriendo
- Actualiza URLs para red local

---

### **🐳 DOCKER (PARA PRODUCCIÓN/TESTING):**

#### `deploy-eva-simple.bat`
- Docker completo (MySQL + Backend + Frontend)
- Base de datos aislada en contenedor
- **Ventajas:** Ambiente controlado, fácil deployment

#### `cambiar-a-docker.bat`
- Configura .env para Docker
- Para servicios nativos
- Inicia contenedores automáticamente

#### `deploy-eva-xampp.bat`
- Docker Backend/Frontend + XAMPP MySQL
- Híbrido para testing

---

## 📁 **ARCHIVOS DE CONFIGURACIÓN**

### **DOCKER:**
- `docker-compose-simple.yml` - Docker completo
- `docker-compose-xampp.yml` - Docker + XAMPP MySQL
- `eva-backend/.env.docker-simple` - Configuración Docker

### **XAMPP:**
- `eva-backend/.env` - Configuración actual (XAMPP)
- `eva-frontend/.env` - Variables frontend

---

## 🌐 **URLS DE ACCESO**

### **XAMPP NATIVO:**
- **Frontend:** http://192.168.2.146:5174
- **Backend API:** http://192.168.2.146:8001/api
- **MySQL:** localhost:3307

### **DOCKER:**
- **Frontend:** http://192.168.2.146:5173
- **Backend API:** http://192.168.2.146:8001/api
- **MySQL:** 192.168.2.146:3306

---

## 🔄 **CÓMO CAMBIAR ENTRE MODOS**

### **De Docker → XAMPP:**
1. Ejecutar `cambiar-a-xampp.bat`
2. Verificar que XAMPP MySQL esté corriendo
3. Ejecutar `iniciar-eva-xampp.bat`

### **De XAMPP → Docker:**
1. Ejecutar `parar-eva-xampp.bat`
2. Ejecutar `cambiar-a-docker.bat`

---

## 💾 **BASE DE DATOS**

### **Backup disponible:**
- `db/gestionthuv(3).sql` - BD completa (32.4 MB)
- 101 tablas, 9,750 equipos, 13,359 órdenes

### **Para importar a XAMPP:**
1. phpMyAdmin → Importar
2. Seleccionar `gestionthuv(3).sql`
3. Ejecutar importación

---

## 🐛 **DEBUGGING**

### **XAMPP (mejor para desarrollo):**
- ✅ Logs visibles en terminal
- ✅ Artisan commands directos
- ✅ Hot reload funcional
- ✅ Fácil modificar archivos

### **Docker:**
- ✅ Ambiente aislado
- ✅ No conflicts de versiones
- ❌ Logs menos accesibles

---

## 📱 **ACCESO DESDE LA RED**

**Desde cualquier dispositivo en la red WiFi:**
- Celular: http://192.168.2.146:5174 (XAMPP) o :5173 (Docker)
- Tablet: http://192.168.2.146:5174 (XAMPP) o :5173 (Docker)
- Otro PC: http://192.168.2.146:5174 (XAMPP) o :5173 (Docker)

---

## ⚡ **INICIO RÁPIDO**

### **Para desarrollo diario:**
```bash
iniciar-eva-xampp.bat
```

### **Para testing en ambiente controlado:**
```bash
deploy-eva-simple.bat
```

### **Para parar todo:**
```bash
parar-eva-xampp.bat  # XAMPP
# O
docker-compose -f docker-compose-simple.tmp.yml down  # Docker
```

---

## 🎯 **RECOMENDACIONES**

- **Desarrollo:** Usar XAMPP nativo
- **Testing:** Usar Docker
- **Producción:** Usar Docker con reverse proxy
- **Backup:** Siempre tener `gestionthuv(3).sql` actualizado
