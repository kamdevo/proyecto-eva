# ✅ MODALES DE AGREGAR - Preventivos, Calibraciones y Repuestos

## 📊 **ARCHIVOS CREADOS**

### 1. **Modal de Preventivos** ✅
**Archivo:** `eva-frontend/src/components/modals/add-preventivo-modal.jsx`

**Campos del formulario:**
- ✅ **Código Preventivo** (obligatorio) - Input de texto
- ✅ **Proveedor** - SearchableSelect (poblado de proveedores)
- ✅ **Observaciones** - Textarea
- ✅ **Fecha de Ejecución** (obligatorio) - Date picker
- ✅ **Archivo Asociado** - File uploader (PDF, Word, JPG, PNG - máx 10MB)
- ✅ **Repuesto Pendiente** - Input de texto

**Características:**
- Color verde (bg-green-600)
- Drag & drop para archivos
- Validación de campos obligatorios
- Toast notifications
- Preview del archivo cargado con opción de eliminar

---

### 2. **Modal de Calibraciones** ✅
**Archivo:** `eva-frontend/src/components/modals/add-calibracion-modal.jsx`

**Campos del formulario:**
- ✅ **Código de Calibración** (obligatorio) - Input de texto
- ✅ **Fecha de Ejecución** (obligatorio) - Date picker
- ✅ **Fecha Programada** (obligatorio) - Date picker
- ✅ **Archivo (Certificado de Calibración)** - File uploader (PDF, Word, JPG, PNG - máx 10MB)

**Características:**
- Color azul (bg-blue-600)
- Drag & drop para archivos
- Validación de campos obligatorios
- Toast notifications
- Preview del archivo cargado con opción de eliminar

---

### 3. **Modal de Repuestos/Accesorios** ✅
**Archivo:** `eva-frontend/src/components/modals/add-repuesto-modal.jsx`

**Campos del formulario:**
- ✅ **Repuesto/Accesorio** (obligatorio) - SearchableSelect (poblado de repuestos)
- ✅ **Cantidad** (obligatorio) - Input numérico (mayor a 0)
- ✅ **Observación** - Textarea
- ✅ **Fecha de Instalación** (obligatorio) - Date picker
- ✅ **Archivo Asociado** - File uploader (PDF, Word, JPG, PNG - máx 10MB)

**Características:**
- Color morado/púrpura (bg-purple-600)
- Drag & drop para archivos
- Validación de campos obligatorios
- Validación numérica para cantidad
- Toast notifications
- Preview del archivo cargado con opción de eliminar

---

## 🔄 **INTEGRACIÓN CON MODAL DE EDICIÓN**

### **Archivo modificado:** `edit-equipment-modal.jsx`

#### **1. Imports agregados:**
```javascript
import AddPreventivoModal from "./add-preventivo-modal";
import AddCalibracionModal from "./add-calibracion-modal";
import AddRepuestoModal from "./add-repuesto-modal";
```

#### **2. Estados agregados:**
```javascript
const [showAddPreventivoModal, setShowAddPreventivoModal] = useState(false);
const [showAddCalibracionModal, setShowAddCalibracionModal] = useState(false);
const [showAddRepuestoModal, setShowAddRepuestoModal] = useState(false);
```

#### **3. Botones de "Agregar" agregados:**

**Sección PREVENTIVOS:**
```jsx
<Button
  type="button"
  variant="default"
  size="sm"
  className="ml-2 bg-green-600 hover:bg-green-700 text-white"
  onClick={() => setShowAddPreventivoModal(true)}
>
  <Plus className="h-4 w-4 mr-1" />
  Agregar
</Button>
```

**Sección CALIBRACIONES:**
```jsx
<Button
  type="button"
  variant="default"
  size="sm"
  className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
  onClick={() => setShowAddCalibracionModal(true)}
>
  <Plus className="h-4 w-4 mr-1" />
  Agregar
</Button>
```

**Sección REPUESTOS/ACCESORIOS:**
```jsx
<Button
  type="button"
  variant="default"
  size="sm"
  className="ml-2 bg-purple-600 hover:bg-purple-700 text-white"
  onClick={() => setShowAddRepuestoModal(true)}
>
  <Plus className="h-4 w-4 mr-1" />
  Agregar
</Button>
```

#### **4. Componentes de modales agregados al final:**
```jsx
{/* Modal para agregar preventivo */}
<AddPreventivoModal
  isOpen={showAddPreventivoModal}
  onClose={() => setShowAddPreventivoModal(false)}
  equipmentId={equipment?.id}
  equipmentName={equipment?.name || equipment?.equipo?.name}
  onPreventivoAdded={() => {
    if (equipment?.id) {
      loadEquipmentHistory(equipment.id);
    }
  }}
/>

{/* Modal para agregar calibración */}
<AddCalibracionModal
  isOpen={showAddCalibracionModal}
  onClose={() => setShowAddCalibracionModal(false)}
  equipmentId={equipment?.id}
  equipmentName={equipment?.name || equipment?.equipo?.name}
  onCalibracionAdded={() => {
    if (equipment?.id) {
      loadEquipmentHistory(equipment.id);
    }
  }}
/>

{/* Modal para agregar repuesto */}
<AddRepuestoModal
  isOpen={showAddRepuestoModal}
  onClose={() => setShowAddRepuestoModal(false)}
  equipmentId={equipment?.id}
  equipmentName={equipment?.name || equipment?.equipo?.name}
  onRepuestoAdded={() => {
    if (equipment?.id) {
      loadEquipmentHistory(equipment.id);
    }
  }}
/>
```

---

## 🎨 **CARACTERÍSTICAS COMUNES**

### **UI/UX:**
- ✅ Diseño responsive (max-w-2xl)
- ✅ Scroll automático si el contenido es muy largo (max-h-[90vh] overflow-y-auto)
- ✅ Iconos específicos para cada tipo (Wrench, Gauge, Package)
- ✅ Colores diferenciados por tipo
- ✅ Campos obligatorios marcados con clase "required"
- ✅ Muestra el nombre del equipo en el header

### **Validaciones:**
- ✅ Campos obligatorios validados antes del submit
- ✅ Tamaño de archivo máximo: 10MB
- ✅ Tipos de archivo permitidos: PDF, Word, JPG, PNG
- ✅ Validación numérica para cantidades (> 0)
- ✅ Mensajes de error específicos por campo
- ✅ Toast notifications para éxito/error

### **File Upload:**
- ✅ Drag & drop funcional
- ✅ Click para seleccionar archivo
- ✅ Preview del archivo con nombre y tamaño
- ✅ Botón para remover archivo seleccionado
- ✅ Indicador visual cuando se arrastra archivo
- ✅ Validación de tipo y tamaño

### **Estados del formulario:**
- ✅ Reset automático al abrir/cerrar modal
- ✅ Limpieza de errores al editar campos
- ✅ Indicador de carga (isSubmitting)
- ✅ Botones deshabilitados durante el envío

---

## 📋 **PENDIENTES (TODOs)**

### **Backend:**
- ⏳ Implementar endpoints para crear preventivos
- ⏳ Implementar endpoints para crear calibraciones
- ⏳ Implementar endpoints para crear repuestos

### **Data:**
- ⏳ Cargar catálogo de proveedores desde API (actualmente mock data)
- ⏳ Cargar catálogo de repuestos desde API (actualmente mock data)

### **Funcionalidad:**
- ⏳ Conectar formularios con API real
- ⏳ Implementar upload de archivos al servidor
- ⏳ Actualizar tabla después de agregar registro
- ⏳ Implementar edición de registros existentes
- ⏳ Implementar eliminación de registros

---

## 🚀 **CÓMO PROBAR**

1. **Abrir el modal de edición de un equipo**
2. **Expandir la sección deseada:**
   - PREVENTIVOS (verde)
   - CALIBRACIONES (azul)
   - REPUESTOS/ACCESORIOS (morado)
3. **Click en el botón "Agregar"**
4. **Llenar el formulario:**
   - Campos con asterisco son obligatorios
   - Arrastrar archivo o hacer click para seleccionar
5. **Click en "Guardar"**
   - Se mostrará un mensaje de éxito
   - El modal se cerrará
   - Se recargará el historial del equipo

---

## 📁 **ESTRUCTURA DE ARCHIVOS**

```
eva-frontend/
└── src/
    └── components/
        └── modals/
            ├── add-preventivo-modal.jsx     ✅ NUEVO
            ├── add-calibracion-modal.jsx    ✅ NUEVO
            ├── add-repuesto-modal.jsx       ✅ NUEVO
            └── edit-equipment-modal.jsx     ✅ MODIFICADO
```

---

## ✅ **ESTADO ACTUAL**

**Frontend:** ✅ COMPLETO  
**Backend:** ⏳ PENDIENTE  
**Testing:** ⏳ PENDIENTE  

**Los modales están listos para usar. Solo falta conectarlos con los endpoints del backend.**

---

**Fecha de implementación:** 20 de Noviembre, 2025  
**Estado:** ✅ FRONTEND COMPLETADO - PENDIENTE BACKEND
