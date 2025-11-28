# CORRECCIONES REQUERIDAS - CRONOGRAMA DE MANTENIMIENTO (PARTE 1)

## RESUMEN DE PROBLEMAS ENCONTRADOS

### ❌ CRÍTICOS (Deben corregirse INMEDIATAMENTE)

1. **Tabla `cambios_cronograma` NO EXISTE**
   - Impide auditoría de cambios
   - Botón "Ver historial" no funciona

2. **Campo `usuario_id` falta en `planes_mantenimientos`**
   - No se registra quién subió el Excel
   - No hay trazabilidad

3. **Campo `frecuencia` es texto, no FK**
   - Debería ser `frecuencia_id` con FK a `frecuenciam`
   - Datos inconsistentes (ANUAL vs anual vs Anual)

---

## CORRECCIÓN 1: CREAR TABLA cambios_cronograma

```sql
CREATE TABLE IF NOT EXISTS cambios_cronograma (
    id INT PRIMARY KEY AUTO_INCREMENT,
    planes_mantenimientos_id INT NOT NULL,
    usuario_id INT NOT NULL,
    cambio TEXT COMMENT 'Descripción: "(campo: anterior → nuevo)"',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (planes_mantenimientos_id) 
        REFERENCES planes_mantenimientos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id),
    
    INDEX idx_plan (planes_mantenimientos_id),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## CORRECCIÓN 2: AGREGAR usuario_id

```sql
ALTER TABLE planes_mantenimientos 
ADD COLUMN usuario_id INT AFTER proveedor_mantenimiento_id;

ALTER TABLE planes_mantenimientos 
ADD FOREIGN KEY (usuario_id) REFERENCES usuarios(id);

-- Actualizar registros existentes (ajustar ID según tu sistema)
UPDATE planes_mantenimientos 
SET usuario_id = 1 
WHERE usuario_id IS NULL;
```

---

## CORRECCIÓN 3: MODIFICAR UPLOAD-EXCEL

**Archivo:** `eva-backend/routes/api.php` líneas 11890-11905

**CAMBIAR:**
```php
DB::table('planes_mantenimientos')->insert([
    'equipo_id' => $equipoId,
    'anio' => $year,
    'mes1' => $meses[0] ?? null,
    'mes2' => $meses[1] ?? null,
    'mes3' => $meses[2] ?? null,
    'fecha_programada_1' => $fecha1,
    'fecha_programada_2' => $fecha2,
    'fecha_programada_3' => $fecha3,
    'responsable' => $responsable,
    'frecuencia' => $frecuencia, // ❌ PROBLEMA
    'proveedor_mantenimiento_id' => $proveedorId,
    'estado_cumplimiento' => 'PENDIENTE',
    'created_at' => now(),
    'updated_at' => now()
]);
```

**POR:**
```php
DB::table('planes_mantenimientos')->insert([
    'equipo_id' => $equipoId,
    'anio' => $year,
    'mes1' => $meses[0] ?? null,
    'mes2' => $meses[1] ?? null,
    'mes3' => $meses[2] ?? null,
    'fecha_programada_1' => $fecha1,
    'fecha_programada_2' => $fecha2,
    'fecha_programada_3' => $fecha3,
    'responsable' => $responsable,
    'frecuencia' => $frecuencia, // ✅ Mantener por compatibilidad
    'proveedor_mantenimiento_id' => $proveedorId,
    'usuario_id' => Auth::id(), // ✅ AGREGAR ESTO
    'estado_cumplimiento' => 'PENDIENTE',
    'created_at' => now(),
    'updated_at' => now()
]);
```

---

## CORRECCIÓN 4: ENDPOINT PARA EDITAR PLANES

**Archivo:** `eva-backend/routes/api.php` (nuevo endpoint después de upload-excel)

```php
// Actualizar plan de mantenimiento con registro de cambios
Route::put('v1/planes-mantenimientos/{id}', function (Request $request, $id) {
    try {
        $request->validate([
            'mes1' => 'nullable|integer|min:1|max:12',
            'mes2' => 'nullable|integer|min:1|max:12',
            'mes3' => 'nullable|integer|min:1|max:12',
            'responsable' => 'required|string|max:255'
        ]);
        
        $planActual = DB::table('planes_mantenimientos')->where('id', $id)->first();
        
        if (!$planActual) {
            return response()->json([
                'success' => false,
                'message' => 'Plan no encontrado'
            ], 404);
        }
        
        // Detectar cambios
        $cambios = [];
        if ($request->mes1 != $planActual->mes1) {
            $cambios[] = "(mes1: {$planActual->mes1} → {$request->mes1})";
        }
        if ($request->mes2 != $planActual->mes2) {
            $cambios[] = "(mes2: {$planActual->mes2} → {$request->mes2})";
        }
        if ($request->mes3 != $planActual->mes3) {
            $cambios[] = "(mes3: {$planActual->mes3} → {$request->mes3})";
        }
        if ($request->responsable != $planActual->responsable) {
            $cambios[] = "(responsable: {$planActual->responsable} → {$request->responsable})";
        }
        
        if (empty($cambios)) {
            return response()->json([
                'success' => false,
                'message' => 'No se detectaron cambios'
            ], 400);
        }
        
        DB::beginTransaction();
        
        // Actualizar plan
        DB::table('planes_mantenimientos')
          ->where('id', $id)
          ->update([
              'mes1' => $request->mes1,
              'mes2' => $request->mes2,
              'mes3' => $request->mes3,
              'responsable' => $request->responsable,
              'updated_at' => now()
          ]);
        
        // Registrar cambio
        DB::table('cambios_cronograma')->insert([
            'planes_mantenimientos_id' => $id,
            'usuario_id' => Auth::id() ?? 1,
            'cambio' => implode('', $cambios),
            'created_at' => now()
        ]);
        
        DB::commit();
        
        return response()->json([
            'success' => true,
            'message' => 'Plan actualizado exitosamente'
        ]);
        
    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});
```

---

## CORRECCIÓN 5: ENDPOINT PARA HISTORIAL

```php
// Obtener historial de cambios de un plan
Route::get('v1/planes-mantenimientos/{id}/historial', function ($id) {
    try {
        $historial = DB::table('cambios_cronograma as cc')
            ->leftJoin('usuarios as u', 'cc.usuario_id', '=', 'u.id')
            ->where('cc.planes_mantenimientos_id', $id)
            ->select([
                'cc.id',
                'cc.cambio',
                'cc.created_at',
                DB::raw('CONCAT(u.nombre, " ", u.apellido) as usuario_nombre')
            ])
            ->orderBy('cc.created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $historial
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
});
```

---

## CORRECCIÓN 6: AGREGAR cuenta_cambios AL CRONOGRAMA

**Archivo:** `eva-backend/routes/api.php` línea ~12715

**CAMBIAR:**
```php
->select([
    'pm.*',
    'e.name as equipo_nombre',
    // ... otros campos
    DB::raw('(SELECT COUNT(*) FROM mantenimiento m 
             WHERE m.equipo_id = pm.equipo_id 
             AND YEAR(m.fecha_mantenimiento) = pm.anio) as cantidad_ejecutados'),
```

**POR:**
```php
->select([
    'pm.*',
    'e.name as equipo_nombre',
    // ... otros campos
    DB::raw('(SELECT COUNT(*) FROM mantenimiento m 
             WHERE m.equipo_id = pm.equipo_id 
             AND YEAR(m.fecha_mantenimiento) = pm.anio) as cantidad_ejecutados'),
    DB::raw('(SELECT COUNT(*) FROM cambios_cronograma 
             WHERE cambios_cronograma.planes_mantenimientos_id = pm.id) as cuenta_cambios'),
```

**Y en el formateo (línea ~12854), CAMBIAR:**
```php
'cuenta_cambios' => 0, // TODO: Implementar conteo de cambios
```

**POR:**
```php
'cuenta_cambios' => (int)$plan->cuenta_cambios ?? 0,
```

---

## TESTING DESPUÉS DE CORRECCIONES

### 1. Probar Upload de Excel
```bash
# Subir un Excel con 3 equipos
# Verificar en BD que todos tengan usuario_id
SELECT id, equipo_id, usuario_id, responsable 
FROM planes_mantenimientos 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Probar Edición de Plan
```bash
# Editar un mes en el frontend
# Verificar en BD el registro de cambio
SELECT * FROM cambios_cronograma 
ORDER BY created_at DESC 
LIMIT 5;
```

### 3. Probar Historial
```bash
# Hacer 3 cambios al mismo plan
# Abrir modal de historial
# Debe mostrar 3 registros con usuario y fecha
```

---

## PRIORIDAD DE IMPLEMENTACIÓN

1. ✅ **URGENTE**: SQL Scripts (5 minutos)
2. ✅ **URGENTE**: Modificar upload-excel (5 minutos)
3. ✅ **ALTA**: Endpoint PUT editar (15 minutos)
4. ✅ **ALTA**: Endpoint GET historial (10 minutos)
5. ✅ **ALTA**: Agregar cuenta_cambios (5 minutos)

**TIEMPO TOTAL: 40 minutos**
