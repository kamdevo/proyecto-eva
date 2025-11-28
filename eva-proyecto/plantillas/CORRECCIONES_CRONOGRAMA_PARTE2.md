# CORRECCIONES REQUERIDAS - CRONOGRAMA DE MANTENIMIENTO (PARTE 2)

## CORRECCIONES FRONTEND

### CORRECCIÓN 7: Crear Modal de Historial de Cambios

**Archivo NUEVO:** `eva-frontend/src/components/modals/historial-cambios-modal.jsx`

```jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

export function HistorialCambiosModal({ open, onOpenChange, planId }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && planId) {
      loadHistorial();
    }
  }, [open, planId]);

  const loadHistorial = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/api/v1/planes-mantenimientos/${planId}/historial`
      );
      const data = await response.json();
      
      if (data.success) {
        setHistorial(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Error loading historial:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Historial de Cambios
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {loading && (
            <div className="text-center py-8 text-slate-500">
              Cargando historial...
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {!loading && !error && historial.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No hay cambios registrados para este plan
            </div>
          )}
          
          {!loading && !error && historial.map((cambio, index) => (
            <div 
              key={cambio.id} 
              className="border-l-4 border-blue-500 bg-blue-50 pl-4 pr-3 py-3 rounded-r"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <Badge variant="outline" className="bg-white">
                    {cambio.usuario_nombre}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" />
                  {formatFecha(cambio.created_at)}
                </div>
              </div>
              <div className="text-sm text-slate-800 font-medium">
                {cambio.cambio}
              </div>
              {index < historial.length - 1 && (
                <div className="mt-3 border-b border-slate-200"></div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

### CORRECCIÓN 8: Actualizar planes-mantenimiento-view.jsx

**Archivo:** `eva-frontend/src/components/planes-mantenimiento-view.jsx`

**1. Importar el nuevo modal:**
```jsx
// Línea ~40, AGREGAR:
import { HistorialCambiosModal } from "@/components/modals/historial-cambios-modal";
```

**2. Agregar estado para el modal:**
```jsx
// Línea ~83, AGREGAR:
const [historialModalOpen, setHistorialModalOpen] = useState(false);
const [selectedPlanId, setSelectedPlanId] = useState(null);
```

**3. Crear handler para abrir historial:**
```jsx
// Línea ~311, AGREGAR:
const handleVerHistorial = (plan) => {
  setSelectedPlanId(plan.id);
  setHistorialModalOpen(true);
};
```

**4. Actualizar botón de historial en la tabla:**
```jsx
// Línea ~789, CAMBIAR:
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleVerDocumentacion(plan)}
  className="text-green-600 hover:text-green-800 hover:bg-green-50 w-6 h-6 p-0"
  title="Ver historial"
>
  <Eye className="w-3 h-3" />
</Button>

// POR:
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleVerHistorial(plan)}
  className="text-green-600 hover:text-green-800 hover:bg-green-50 w-6 h-6 p-0"
  title="Ver historial de cambios"
>
  <Eye className="w-3 h-3" />
</Button>
```

**5. Agregar el nuevo modal al final:**
```jsx
// Línea ~1149, AGREGAR ANTES del cierre de </div>:
<HistorialCambiosModal
  open={historialModalOpen}
  onOpenChange={setHistorialModalOpen}
  planId={selectedPlanId}
/>
```

---

### CORRECCIÓN 9: Actualizar Modal de Edición

**Archivo:** `eva-frontend/src/components/modals/editar-observaciones-modal.jsx`

**Agregar función para actualizar plan:**

```jsx
// Dentro del modal, agregar función de actualización:
const handleUpdate = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001"}/api/v1/planes-mantenimientos/${equipo.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          mes1: formData.mes1,
          mes2: formData.mes2,
          mes3: formData.mes3,
          responsable: formData.responsable
        })
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      setSuccessMessage('Plan actualizado exitosamente');
      setTimeout(() => {
        onOpenChange(false);
        if (onUpdate) onUpdate(); // Recargar datos
      }, 1500);
    } else {
      setError(data.message);
    }
  } catch (err) {
    console.error('Error updating plan:', err);
    setError('Error de conexión al actualizar');
  } finally {
    setLoading(false);
  }
};
```

---

## VALIDACIONES ADICIONALES

### VALIDACIÓN 1: Upload de Excel - Validar Formato de Meses

**Archivo:** `eva-frontend/src/components/planes-mantenimiento-view.jsx`

**Agregar validación antes del upload:**

```jsx
// Línea ~186, DENTRO de handleExcelUpload, AGREGAR:
const validateExcelContent = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        // Validar que tenga datos
        if (rows.length === 0) {
          reject('El archivo está vacío');
          return;
        }
        
        // Validar estructura básica
        let validRows = 0;
        let errors = [];
        
        rows.forEach((row, index) => {
          if (index === 0) return; // Skip header
          
          const equipoId = row[0];
          const mes1 = row[1];
          const mes2 = row[2];
          const mes3 = row[3];
          
          // Validar ID de equipo
          if (!equipoId || isNaN(equipoId)) {
            errors.push(`Fila ${index + 1}: ID de equipo inválido`);
          }
          
          // Validar al menos un mes
          if (!mes1 && !mes2 && !mes3) {
            errors.push(`Fila ${index + 1}: Debe especificar al menos un mes`);
          }
          
          // Validar rango de meses
          [mes1, mes2, mes3].forEach((mes, mIndex) => {
            if (mes && (isNaN(mes) || mes < 1 || mes > 12)) {
              errors.push(`Fila ${index + 1}: Mes ${mIndex + 1} fuera de rango (1-12)`);
            }
          });
          
          if (errors.length === 0) validRows++;
        });
        
        if (errors.length > 5) {
          reject(`Se encontraron ${errors.length} errores. Primeros 5: ${errors.slice(0, 5).join('; ')}`);
        } else if (errors.length > 0) {
          reject(errors.join('; '));
        } else {
          resolve({ validRows, totalRows: rows.length - 1 });
        }
        
      } catch (err) {
        reject('Error al leer el archivo Excel');
      }
    };
    
    reader.onerror = () => reject('Error al leer el archivo');
    reader.readAsArrayBuffer(file);
  });
};

// Luego llamar esta función antes del upload:
try {
  const validation = await validateExcelContent(selectedFiles[0]);
  console.log(`Validación OK: ${validation.validRows} filas válidas de ${validation.totalRows}`);
} catch (validationError) {
  setErrors({ fileUpload: validationError });
  setAlertMessage('Error de validación: ' + validationError);
  clearMessages();
  setIsLoading(false);
  return;
}
```

**NOTA:** Requiere instalar librería XLSX:
```bash
npm install xlsx
```

---

### VALIDACIÓN 2: Validar Año Seleccionado

**Agregar en el componente:**

```jsx
const validateYear = (year) => {
  const currentYear = new Date().getFullYear();
  const minYear = 2019;
  const maxYear = currentYear + 5;
  
  if (year < minYear || year > maxYear) {
    setErrors({
      ...errors, 
      year: `El año debe estar entre ${minYear} y ${maxYear}`
    });
    return false;
  }
  
  return true;
};
```

---

## MEJORAS DE UX

### MEJORA 1: Indicador de Progreso en Upload

```jsx
const [uploadProgress, setUploadProgress] = useState(0);

// En handleExcelUpload:
const xhr = new XMLHttpRequest();

xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percentComplete = Math.round((e.loaded / e.total) * 100);
    setUploadProgress(percentComplete);
  }
});

// Mostrar barra de progreso en UI:
{isLoading && (
  <div className="mt-4">
    <div className="flex justify-between mb-2">
      <span className="text-sm text-slate-600">Subiendo archivo...</span>
      <span className="text-sm font-medium text-blue-600">{uploadProgress}%</span>
    </div>
    <div className="w-full bg-slate-200 rounded-full h-2">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${uploadProgress}%` }}
      ></div>
    </div>
  </div>
)}
```

---

### MEJORA 2: Confirmación Antes de Reemplazar

```jsx
const handleExcelUpload = async () => {
  // ... validaciones existentes ...
  
  if (replaceInfo === 'si') {
    const confirmed = window.confirm(
      `⚠️ ATENCIÓN: Esta acción eliminará TODOS los registros del año ${selectedYear}.\n\n` +
      `¿Está seguro de que desea continuar?`
    );
    
    if (!confirmed) {
      return;
    }
  }
  
  // ... continuar con upload ...
};
```

---

## CHECKLIST FINAL

### Base de Datos
- [ ] Tabla `cambios_cronograma` creada
- [ ] Campo `usuario_id` agregado a `planes_mantenimientos`
- [ ] Datos de prueba insertados

### Backend
- [ ] Endpoint PUT `/v1/planes-mantenimientos/{id}` funciona
- [ ] Endpoint GET `/v1/planes-mantenimientos/{id}/historial` funciona
- [ ] Upload-excel registra `usuario_id`
- [ ] Cronograma incluye `cuenta_cambios`

### Frontend
- [ ] Modal de historial creado y funcional
- [ ] Botón de historial abre modal correcto
- [ ] Modal de edición actualiza y registra cambios
- [ ] Validaciones de Excel implementadas
- [ ] UX mejorado con confirmaciones

### Testing
- [ ] Subir Excel con 5 equipos
- [ ] Editar 3 planes diferentes
- [ ] Ver historial de cambios
- [ ] Verificar en BD los registros de auditoría
- [ ] Probar con año inválido
- [ ] Probar con archivo corrupto

---

## TIEMPO ESTIMADO TOTAL

- Parte 1 (Backend + BD): **40 minutos**
- Parte 2 (Frontend): **60 minutos**
- Testing completo: **20 minutos**

**TOTAL: 2 horas**

---

## ✅ RESULTADO ESPERADO

Después de implementar todas las correcciones:

1. ✅ Sistema 100% conforme con documentación
2. ✅ Auditoría completa de cambios
3. ✅ Trazabilidad de quién hizo qué y cuándo
4. ✅ Validaciones robustas
5. ✅ UX mejorado con feedback claro
6. ✅ Sistema sólido y confiable para producción
