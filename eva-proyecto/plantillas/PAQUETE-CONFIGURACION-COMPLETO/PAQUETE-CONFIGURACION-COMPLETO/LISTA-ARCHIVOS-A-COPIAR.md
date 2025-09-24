# 📋 LISTA DE ARCHIVOS A COPIAR

## 🔧 SERVICIOS
**Copiar desde**: `c:\Users\Soporte\Desktop\code}\eva\servicios-completo\`

### Vista Principal:
- `vista-servicios-principal.jsx` → `servicios/vista-servicios-principal.jsx`

### Modales:
- `modals/ui-modal-agregar-servicio.jsx` → `servicios/modals/ui-modal-agregar-servicio.jsx`
- `modals/ui-modal-editar-servicio.jsx` → `servicios/modals/ui-modal-editar-servicio.jsx`
- `modals/ui-modal-eliminar-servicio.jsx` → `servicios/modals/ui-modal-eliminar-servicio.jsx`
- `modals/ui-modal-ver-servicio.jsx` → `servicios/modals/ui-modal-ver-servicio.jsx`

---

## 👥 CONTACTOS
**Copiar desde**: `c:\Users\Soporte\Desktop\code}\eva\proyecto-eva\eva-proyecto\eva-frontend\src\components\`

### Vista Principal:
- `Contacts.jsx` → `contactos/vista-contactos-principal.jsx`

### Modales (crear nuevos basados en servicios):
- Crear: `contactos/modals/ui-modal-agregar-contacto.jsx`
- Crear: `contactos/modals/ui-modal-editar-contacto.jsx`
- Crear: `contactos/modals/ui-modal-eliminar-contacto.jsx`
- Crear: `contactos/modals/ui-modal-ver-contacto.jsx`

---

## 🏢 ÁREAS
**Copiar desde**: `c:\Users\Soporte\Desktop\code}\eva\areas-completo\`

### Vista Principal:
- `vista-areas-principal.jsx` → `areas/vista-areas-principal.jsx`

### Modales:
- `modals/ui-modal-agregar-area.jsx` → `areas/modals/ui-modal-agregar-area.jsx`
- `modals/ui-modal-editar-area.jsx` → `areas/modals/ui-modal-editar-area.jsx`
- `modals/ui-modal-eliminar-area.jsx` → `areas/modals/ui-modal-eliminar-area.jsx`
- `modals/ui-modal-ver-area.jsx` → `areas/modals/ui-modal-ver-area.jsx`

---

## 🗺️ ZONAS
**Copiar desde**: `c:\Users\Soporte\Desktop\code}\eva\proyecto-eva\eva-proyecto\eva-frontend\src\components\`

### Vista Principal:
- `vista-zonas-principal.jsx` → `zonas/vista-zonas-principal.jsx`

### Modales:
- `modals/ui-modal-agregar-zona.jsx` → `zonas/modals/ui-modal-agregar-zona.jsx`
- `modals/ui-modal-editar-zona.jsx` → `zonas/modals/ui-modal-editar-zona.jsx`
- `modals/ui-modal-eliminar-zona.jsx` → `zonas/modals/ui-modal-eliminar-zona.jsx`
- `modals/ui-modal-ver-zona.jsx` → `zonas/modals/ui-modal-ver-zona.jsx`

---

## ⚠️ IMPORTANTE - AJUSTAR RUTAS DE IMPORTACIÓN

Al copiar los archivos, **CAMBIAR** las rutas de importación:

### ❌ Antes:
```jsx
import { Card } from "@/components/ui/card";
import Modal from "./modals/ui-modal-agregar.jsx";
```

### ✅ Después:
```jsx
import { Card } from "../ui/card";
import Modal from "./modals/ui-modal-agregar.jsx";
```

## 🔄 PASOS DE COPIA:

1. **Crear estructura de carpetas** (ya está creada)
2. **Copiar archivos** de las ubicaciones indicadas
3. **Ajustar imports** en cada archivo copiado
4. **Verificar** que todos los modales estén importados correctamente
5. **Probar** cada vista en el navegador

## 📝 TOTAL DE ARCHIVOS:
- **20 archivos** en total
- **4 vistas principales**
- **16 modales CRUD**
- **Todos con datos de ejemplo incluidos**