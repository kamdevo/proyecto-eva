# 🔍 DEBUG: Imagen del Equipo en PDF - Guía Completa

## 📋 Flujo Completo de la Imagen

### 1️⃣ **BACKEND** - Endpoint que sirve la imagen
**Archivo:** `eva-backend/routes/api.php` (línea 6062)
**Endpoint:** `GET /api/v1/equipos/image-base64/{filename}`

#### Qué hace:
1. Recibe el nombre del archivo (ej: `3e89804278d651b3c69334fb9d6f215d.jpg`)
2. Busca en múltiples rutas:
   - `storage/equipos/images/`
   - `storage/equipos/`
   - `storage/equipos/fotos/`
3. Convierte la imagen a base64
4. Devuelve JSON con formato `data:image/jpeg;base64,...`

#### Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "mime_type": "image/jpeg",
    "size": 123456
  }
}
```

---

### 2️⃣ **FRONTEND** - Carga de la imagen
**Archivo:** `view-equipment-modal.jsx` (línea 79-118)
**Función:** `getImageBase64FromBackend(filename)`

#### Logs a verificar en consola:
```
🌐 [BACKEND REQUEST] URL: http://192.168.2.146:8001/api/v1/equipos/image-base64/FILENAME
📡 [BACKEND RESPONSE] Status: 200 OK
📦 [BACKEND DATA]: { success: true, hasData: true, hasBase64: true, ... }
✅ Imagen obtenida del backend: 882.37 KB
```

---

### 3️⃣ **FRONTEND** - Extracción del nombre de archivo
**Archivo:** `view-equipment-modal.jsx` (línea 459-502)
**useEffect:** Carga imagen cuando se abren detalles del equipo

#### Logs a verificar:
```
🔍 Campos de imagen evaluados: [...]
📸 Valor de imagen encontrado: 3e89804278d651b3c69334fb9d6f215d.jpg
📸 Nombre final del archivo: 3e89804278d651b3c69334fb9d6f215d.jpg
🔄 Obteniendo imagen desde el backend...
✅ Imagen del equipo cargada exitosamente para PDF
📦 Tamaño de base64: 882.37 KB
🔍 Validación de imagen: { isString: true, startsWithData: true, ... }
```

---

### 4️⃣ **FRONTEND** - Estado de React
**Variable:** `equipmentImageBase64` (useState)

#### Debe contener:
- Tipo: `string`
- Formato: `"data:image/jpeg;base64,..."`
- Longitud: > 100,000 caracteres

---

### 5️⃣ **FRONTEND** - Actualización del PDF
**Archivo:** `view-equipment-modal.jsx` (línea 511-548)
**useEffect:** Se ejecuta cuando cambia `equipmentImageBase64`

#### Logs a verificar:
```
📄 Actualizando PDF con datos: {
  hasEquipmentImage: true,
  imageSize: "882.37 KB",
  imageType: "string",
  imagePreview: "data:image/jpeg;base64,/9j/4AAQ..."
}
🎯 pdfData.equipmentImageBase64: { exists: true, same: true }
```

---

### 6️⃣ **COMPONENTE PDF** - Recepción de datos
**Archivo:** `equipment-modal-replica-pdf.jsx` (línea 236-248)

#### Logs a verificar:
```
🖼️ [PDF Component] Imagen del equipo: {
  exists: true,
  type: "string",
  length: 903468,
  isString: true,
  isValidBase64: true,
  preview: "data:image/jpeg;base64,/9j/4AAQ..."
}
```

---

### 7️⃣ **COMPONENTE PDF** - Renderizado
**Archivo:** `equipment-modal-replica-pdf.jsx` (línea 320-335)

#### Debe renderizar:
```jsx
{equipmentImageBase64 ? (
  <Image src={equipmentImageBase64} style={styles.equipmentImage} />
) : (
  <Text>Sin imagen</Text>
)}
```

---

## 🧪 PASOS DE DEBUGGING

### Paso 1: Verificar Backend
1. Abre la consola del navegador
2. Busca el log: `🌐 [BACKEND REQUEST] URL: ...`
3. Copia la URL
4. Pégala en una nueva pestaña del navegador
5. **Debe mostrar JSON con base64**

### Paso 2: Verificar Respuesta
Busca en consola:
- ✅ `📡 [BACKEND RESPONSE] Status: 200 OK` → Bien
- ❌ `📡 [BACKEND RESPONSE] Status: 404` → Archivo no encontrado
- ❌ `📡 [BACKEND RESPONSE] Status: 500` → Error del servidor

### Paso 3: Verificar Datos Recibidos
Busca en consola:
```
📦 [BACKEND DATA]: {
  success: true,      ← DEBE SER true
  hasData: true,      ← DEBE SER true
  hasBase64: true,    ← DEBE SER true
  size: 123456,       ← DEBE SER > 0
  mimeType: "image/jpeg"
}
```

### Paso 4: Verificar Estado de React
Busca en consola:
```
✅ Imagen del equipo cargada exitosamente para PDF
📦 Tamaño de base64: XXX KB    ← DEBE MOSTRAR TAMAÑO
🔍 Validación de imagen: {
  isString: true,              ← DEBE SER true
  startsWithData: true,        ← DEBE SER true
  length: XXXXX,               ← DEBE SER > 100000
  preview: "data:image/..."    ← DEBE EMPEZAR CON "data:image/"
}
```

### Paso 5: Verificar Actualización de PDF
Busca en consola:
```
📄 Actualizando PDF con datos: {
  hasEquipmentImage: true,     ← DEBE SER true
  imageSize: "XXX KB",         ← DEBE MOSTRAR TAMAÑO
  imagePreview: "data:image/..." ← DEBE EMPEZAR CON "data:image/"
}
```

### Paso 6: Verificar Componente PDF
Busca en consola:
```
🖼️ [PDF Component] Imagen del equipo: {
  exists: true,                ← DEBE SER true
  isString: true,              ← DEBE SER true
  isValidBase64: true,         ← DEBE SER true
  length: XXXXX                ← DEBE SER > 100000
}
```

---

## ❌ PROBLEMAS COMUNES

### Problema 1: "Status: 404"
**Causa:** Archivo no encontrado en el servidor
**Solución:**
1. Verifica que el archivo existe en `storage/equipos/images/`
2. Verifica el nombre exacto del archivo en la base de datos
3. Verifica permisos de la carpeta storage

### Problema 2: "hasBase64: false"
**Causa:** El backend no pudo leer el archivo
**Solución:**
1. Verifica que el disco `public` está configurado
2. Verifica que `Storage::disk('public')->exists()` funciona
3. Revisa logs de Laravel

### Problema 3: "isValidBase64: false"
**Causa:** El formato del base64 es incorrecto
**Solución:**
1. Verifica que el backend devuelve `data:image/...`
2. No solo el base64 puro

### Problema 4: "hasEquipmentImage: false"
**Causa:** El estado de React no se está actualizando
**Solución:**
1. Verifica que `setEquipmentImageBase64()` se ejecuta
2. Verifica que no hay errores en el catch
3. Revisa el useEffect de carga de imagen

### Problema 5: "exists: false" en PDF Component
**Causa:** Los datos no están llegando al componente PDF
**Solución:**
1. Verifica que `pdfData` incluye `equipmentImageBase64`
2. Verifica el useEffect de actualización de PDF
3. Verifica las dependencias del useEffect

---

## 📝 CHECKLIST COMPLETO

- [ ] Backend responde 200 OK
- [ ] Backend devuelve `success: true`
- [ ] Backend devuelve `base64` con formato `data:image/...`
- [ ] Frontend recibe la imagen del backend
- [ ] Frontend actualiza el estado `equipmentImageBase64`
- [ ] Estado contiene string que empieza con `data:image/`
- [ ] useEffect de PDF se ejecuta
- [ ] `pdfData` incluye `equipmentImageBase64`
- [ ] Componente PDF recibe `data.equipmentImageBase64`
- [ ] Componente PDF renderiza `<Image>` en lugar de "Sin imagen"

---

## 🎯 SOLUCIÓN RÁPIDA

Si todo lo anterior está bien pero aún dice "Sin imagen":

1. **Elimina el console.log del componente PDF** (puede causar problemas)
2. **Verifica que @react-pdf/renderer está actualizado**
3. **Prueba con una imagen base64 hardcodeada** para descartar problema de renderizado

### Imagen de prueba hardcodeada:
```javascript
// En equipment-modal-replica-pdf.jsx, línea 238
const equipmentImageBase64 = data?.equipmentImageBase64 || 
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzRBOTBFMiIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPlRFU1Q8L3RleHQ+Cjwvc3ZnPg==";
```

Si la imagen de prueba funciona → El problema está en la carga de la imagen
Si la imagen de prueba NO funciona → El problema está en el renderizado del PDF
