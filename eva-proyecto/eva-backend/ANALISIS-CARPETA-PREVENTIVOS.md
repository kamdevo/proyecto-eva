# ANÁLISIS DE CARPETAS PREVENTIVOS vs MANTENIMIENTOS

## SITUACIÓN ACTUAL:

### 1. **CARPETAS FÍSICAS**:

-   ✅ `/storage/app/public/mantenimientos/` → 16 archivos
-   ✅ `/storage/app/public/preventivos/` → 16 archivos (MISMO contenido)

### 2. **ENDPOINTS CONFIGURADOS**:

-   `/api/v1/download/mantenimientos/{filename}` → apunta a `/mantenimientos/`
-   `/api/v1/download/preventivos/{filename}` → apunta a `/mantenimientos/` ❗
-   `/api/v1/storage/mantenimientos/{filename}` → apunta a `/mantenimientos/`

### 3. **BASE DE DATOS**:

-   Tabla: `mantenimiento` (NO hay tabla `preventivos`)
-   Campo: `file` contiene nombres de archivos
-   Los "preventivos" son registros en la tabla `mantenimiento`

### 4. **CÓDIGO FRONTEND/BACKEND**:

-   ✅ USA: `mantenimientos_preventivos` (campo lógico, no carpeta)
-   ❌ NO REFERENCIA: carpeta `/preventivos/` física

## CONCLUSIÓN:

### ✅ **LA CARPETA `/preventivos/` ES REDUNDANTE**

**Razones:**

1. **Contenido duplicado**: Mismos archivos que `/mantenimientos/`
2. **Endpoints no la usan**: Todos apuntan a `/mantenimientos/`
3. **BD no la referencia**: Solo tabla `mantenimiento`
4. **Código no la usa**: Solo referencias lógicas

### 🗑️ **SE PUEDE ELIMINAR SEGURAMENTE**

**Verificación:**

-   Los archivos están duplicados en `/mantenimientos/`
-   Todos los endpoints funcionan sin `/preventivos/`
-   El código usa conceptos lógicos, no rutas físicas

## RECOMENDACIÓN:

```bash
# Verificar que archivos estén en /mantenimientos/
# Luego eliminar /preventivos/ completamente
rmdir /s "C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\preventivos"
```

**La separación conceptual entre "preventivos" y "correctivos" se maneja a nivel de datos/lógica, NO a nivel de carpetas físicas.**
