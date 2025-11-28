# PLAN DE ACCIÓN - CRONOGRAMA DE MANTENIMIENTO

## ✅ ESTADO ACTUAL: 80% COMPLETO

---

## 🎯 OBJETIVO

Completar el 20% faltante para que el sistema de cronograma de mantenimiento cumpla 100% con la documentación `FLUJO_CRONOGRAMA_MANTENIMIENTO.md`

---

## 📋 TAREAS POR ORDEN DE EJECUCIÓN

### FASE 1: BASE DE DATOS (15 minutos)

#### Tarea 1.1: Crear tabla cambios_cronograma
```bash
# Ejecutar SQL en MySQL Workbench o cliente
# Ver archivo: CORRECCIONES_CRONOGRAMA_PARTE1.md - CORRECCIÓN 1
```
**Archivo SQL:** Copiar de CORRECCIONES_CRONOGRAMA_PARTE1.md
**Tiempo:** 2 minutos
**Verificación:** `SHOW TABLES LIKE 'cambios_cronograma';`

---

#### Tarea 1.2: Agregar campo usuario_id
```bash
# Ejecutar SQL para agregar columna y FK
# Ver archivo: CORRECCIONES_CRONOGRAMA_PARTE1.md - CORRECCIÓN 2
```
**Archivo SQL:** Copiar de CORRECCIONES_CRONOGRAMA_PARTE1.md
**Tiempo:** 3 minutos
**Verificación:** `DESC planes_mantenimientos;`

---

#### Tarea 1.3: Poblar frecuenciam (OPCIONAL)
```bash
# Solo si vas a implementar frecuencia_id
# Ver archivo: CORRECCIONES_CRONOGRAMA_PARTE1.md - Script 3
```
**Archivo SQL:** Copiar de CORRECCIONES_CRONOGRAMA_PARTE1.md
**Tiempo:** 2 minutos (opcional)
**Verificación:** `SELECT * FROM frecuenciam;`

---

### FASE 2: BACKEND (25 minutos)

#### Tarea 2.1: Modificar Upload Excel para registrar usuario_id
**Archivo:** `eva-backend/routes/api.php`
**Línea:** ~11890-11905
**Cambio:** Agregar `'usuario_id' => Auth::id()`
**Tiempo:** 2 minutos

```php
// BUSCAR esta línea:
DB::table('planes_mantenimientos')->insert([

// AGREGAR después de 'proveedor_mantenimiento_id':
'usuario_id' => Auth::id(), // ✅ NUEVO
```

---

#### Tarea 2.2: Crear endpoint PUT para editar planes
**Archivo:** `eva-backend/routes/api.php`
**Ubicación:** Después de la línea 11943 (después del endpoint upload-excel)
**Tiempo:** 10 minutos

```php
// COPIAR COMPLETO de CORRECCIONES_CRONOGRAMA_PARTE1.md - CORRECCIÓN 4
Route::put('v1/planes-mantenimientos/{id}', function (Request $request, $id) {
    // ... código completo ...
});
```

---

#### Tarea 2.3: Crear endpoint GET para historial
**Archivo:** `eva-backend/routes/api.php`
**Ubicación:** Después del endpoint PUT recién creado
**Tiempo:** 5 minutos

```php
// COPIAR COMPLETO de CORRECCIONES_CRONOGRAMA_PARTE1.md - CORRECCIÓN 5
Route::get('v1/planes-mantenimientos/{id}/historial', function ($id) {
    // ... código completo ...
});
```

---

#### Tarea 2.4: Agregar cuenta_cambios al cronograma
**Archivo:** `eva-backend/routes/api.php`
**Línea:** ~12715 y ~12854
**Tiempo:** 3 minutos

```php
// LÍNEA ~12715 - En el SELECT, AGREGAR:
DB::raw('(SELECT COUNT(*) FROM cambios_cronograma 
         WHERE cambios_cronograma.planes_mantenimientos_id = pm.id) as cuenta_cambios'),

// LÍNEA ~12854 - CAMBIAR:
'cuenta_cambios' => 0,  // ❌ ANTES

// POR:
'cuenta_cambios' => (int)$plan->cuenta_cambios ?? 0,  // ✅ AHORA
```

---

#### Tarea 2.5: Probar endpoints con Postman
**Tiempo:** 5 minutos

```bash
# Test 1: Subir Excel
POST http://192.168.2.146:8001/api/v1/planes-mantenimientos/upload-excel
Body: FormData con archivo + anio + reemplazar

# Test 2: Editar plan (usar ID real de tu BD)
PUT http://192.168.2.146:8001/api/v1/planes-mantenimientos/1
Body: JSON con mes1, mes2, mes3, responsable

# Test 3: Ver historial
GET http://192.168.2.146:8001/api/v1/planes-mantenimientos/1/historial
```

---

### FASE 3: FRONTEND (45 minutos)

#### Tarea 3.1: Crear modal de historial
**Archivo NUEVO:** `eva-frontend/src/components/modals/historial-cambios-modal.jsx`
**Tiempo:** 15 minutos

```bash
# Crear archivo nuevo
# Copiar COMPLETO de CORRECCIONES_CRONOGRAMA_PARTE2.md - CORRECCIÓN 7
```

---

#### Tarea 3.2: Actualizar planes-mantenimiento-view.jsx
**Archivo:** `eva-frontend/src/components/planes-mantenimiento-view.jsx`
**Tiempo:** 10 minutos

**Paso A:** Importar nuevo modal (línea ~40)
```jsx
import { HistorialCambiosModal } from "@/components/modals/historial-cambios-modal";
```

**Paso B:** Agregar estados (línea ~83)
```jsx
const [historialModalOpen, setHistorialModalOpen] = useState(false);
const [selectedPlanId, setSelectedPlanId] = useState(null);
```

**Paso C:** Crear handler (línea ~311)
```jsx
const handleVerHistorial = (plan) => {
  setSelectedPlanId(plan.id);
  setHistorialModalOpen(true);
};
```

**Paso D:** Actualizar botón (línea ~789)
```jsx
onClick={() => handleVerHistorial(plan)}
```

**Paso E:** Agregar modal al final (línea ~1149)
```jsx
<HistorialCambiosModal
  open={historialModalOpen}
  onOpenChange={setHistorialModalOpen}
  planId={selectedPlanId}
/>
```

---

#### Tarea 3.3: Actualizar modal de edición
**Archivo:** `eva-frontend/src/components/modals/editar-observaciones-modal.jsx`
**Tiempo:** 15 minutos

```jsx
// Agregar función handleUpdate completa
// Ver CORRECCIONES_CRONOGRAMA_PARTE2.md - CORRECCIÓN 9
```

---

#### Tarea 3.4: Probar en navegador
**Tiempo:** 5 minutos

```bash
# Abrir: http://192.168.2.146:5173/planes/preventivo

# Test 1: Subir Excel con 2 equipos
# Test 2: Editar un plan (cambiar mes1)
# Test 3: Abrir historial (debe mostrar el cambio)
```

---

### FASE 4: TESTING COMPLETO (20 minutos)

#### Test 1: Upload y Auditoría
```sql
-- Subir Excel con 3 equipos
-- Verificar en BD:
SELECT id, equipo_id, usuario_id, responsable, created_at 
FROM planes_mantenimientos 
ORDER BY created_at DESC 
LIMIT 3;

-- Verificar que todos tengan usuario_id NOT NULL
```

---

#### Test 2: Edición y Registro de Cambios
```sql
-- Editar plan desde frontend (cambiar mes1 de 1 a 3)
-- Verificar en BD:
SELECT * FROM cambios_cronograma 
ORDER BY created_at DESC 
LIMIT 1;

-- Debe mostrar: "(mes1: 1 → 3)"
```

---

#### Test 3: Historial en Frontend
```bash
1. Editar mismo plan 3 veces (cambiar mes1, mes2, responsable)
2. Abrir modal de historial
3. Debe mostrar 3 registros con:
   - Usuario que hizo cada cambio
   - Fecha y hora exacta
   - Descripción del cambio
```

---

#### Test 4: Validaciones
```bash
1. Intentar subir archivo sin seleccionar año → Debe mostrar error
2. Intentar subir archivo sin seleccionar reemplazar → Debe mostrar error
3. Subir archivo con mes fuera de rango (13) → Backend debe rechazar
4. Editar plan sin cambios → Backend debe rechazar
```

---

## 📊 PROGRESO TRACKING

```markdown
### BASE DE DATOS
- [ ] Tabla cambios_cronograma creada
- [ ] Campo usuario_id agregado
- [ ] Verificado con DESC y SELECT

### BACKEND  
- [ ] Upload registra usuario_id
- [ ] Endpoint PUT /planes-mantenimientos/{id} funciona
- [ ] Endpoint GET /historial funciona
- [ ] cuenta_cambios agregado
- [ ] Probado con Postman

### FRONTEND
- [ ] Modal HistorialCambiosModal creado
- [ ] planes-mantenimiento-view actualizado
- [ ] Modal de edición actualizado
- [ ] Probado en navegador

### TESTING
- [ ] Upload audita correctamente
- [ ] Edición registra cambios
- [ ] Historial muestra cambios
- [ ] Validaciones funcionan
```

---

## ⏱️ TIEMPO TOTAL ESTIMADO

| Fase | Tiempo |
|------|--------|
| Fase 1: Base de Datos | 15 min |
| Fase 2: Backend | 25 min |
| Fase 3: Frontend | 45 min |
| Fase 4: Testing | 20 min |
| **TOTAL** | **1h 45min** |

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: Auth::id() devuelve null

**Causa:** No hay usuario autenticado en la sesión

**Solución:**
```php
// En lugar de:
'usuario_id' => Auth::id(),

// Usar:
'usuario_id' => Auth::id() ?? 1,  // 1 = Usuario por defecto
```

---

### Problema 2: Error "Table cambios_cronograma doesn't exist"

**Causa:** No se ejecutó el SQL de creación de tabla

**Solución:**
```bash
# Conectar a MySQL
mysql -u root -p

# Seleccionar BD
USE nombre_de_tu_base_de_datos;

# Copiar y ejecutar SQL de CORRECCIÓN 1
```

---

### Problema 3: Modal de historial no muestra datos

**Causa:** Frontend no encuentra el endpoint

**Solución:**
```jsx
// Verificar URL en historial-cambios-modal.jsx
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.2.146:8001";

// Probar endpoint en navegador:
// http://192.168.2.146:8001/api/v1/planes-mantenimientos/1/historial
```

---

## ✅ VERIFICACIÓN FINAL

Después de completar TODO, verificar:

```bash
✅ Base de Datos
   - cambios_cronograma existe
   - planes_mantenimientos tiene usuario_id
   
✅ Backend
   - 3 endpoints nuevos funcionan
   - Upload registra usuario
   - Cronograma incluye cuenta_cambios
   
✅ Frontend
   - Modal de historial abre
   - Muestra cambios correctamente
   - Botón funciona en tabla
   
✅ Funcionalidad End-to-End
   - Subir Excel → OK
   - Editar plan → OK
   - Ver historial → OK
   - Todo se registra en BD → OK
```

---

## 🎉 RESULTADO FINAL ESPERADO

**SISTEMA 100% CONFORME CON DOCUMENTACIÓN**

- ✅ Auditoría completa de cambios
- ✅ Trazabilidad: quién, qué, cuándo
- ✅ Historial visible en UI
- ✅ Validaciones robustas
- ✅ Sistema sólido para producción

---

## 📞 SOPORTE

Si encuentras problemas durante la implementación:

1. Revisar logs del backend: `eva-backend/storage/logs/laravel.log`
2. Revisar consola del navegador (F12)
3. Verificar estructura de BD con `DESC tabla`
4. Probar endpoints con Postman primero
5. Revisar documentación: `FLUJO_CRONOGRAMA_MANTENIMIENTO.md`

---

**¡ÉXITO EN LA IMPLEMENTACIÓN! 🚀**
