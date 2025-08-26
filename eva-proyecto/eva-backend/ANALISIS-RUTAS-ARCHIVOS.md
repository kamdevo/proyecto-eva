# 📁 ANÁLISIS COMPLETO DE RUTAS DE ARCHIVOS - SISTEMA EVA

## 🔍 **PROBLEMA IDENTIFICADO**

-   **Mantenimientos**: Los archivos están registrados en BD pero **NO están en la carpeta correcta**
-   **15,532 registros** en BD vs **16 archivos** físicos = **99.9% de archivos perdidos**

## 📂 **RUTAS CONFIGURADAS ACTUALMENTE**

### ✅ **RUTAS CORRECTAS (Funcionando)**

1. **Equipos - Imágenes**

    - Endpoint: `GET /api/v1/equipos/{id}/image/{filename}`
    - Ruta física: `storage/app/public/equipos/images/`
    - Estado: ✅ Funcionando correctamente

2. **Equipos - Documentos**

    - Endpoint: `GET /api/v1/equipos/download/{filename}`
    - Ruta física: `storage/app/public/equipos/archivos/`
    - Estado: ✅ Funcionando correctamente

3. **Correctivos**

    - Endpoint: `GET /api/v1/download/correctivos/{filename}`
    - Ruta física: `storage/app/public/correctivos/`
    - Estado: ✅ Funcionando correctamente

4. **Observaciones**

    - Endpoint: `GET /api/v1/download/observaciones/{filename}`
    - Ruta física: `storage/app/public/observaciones/`
    - Estado: ✅ Funcionando correctamente

5. **Repuestos**

    - Endpoint: `GET /api/v1/download/repuestos/{filename}`
    - Ruta física: `storage/app/public/repuestos/`
    - Estado: ✅ Funcionando correctamente

6. **Registros INVIMA**
    - Endpoints:
        - `GET /api/v1/invima/download/{filename}`
        - `GET /api/v1/equipos/{id}/invima/{filename}`
    - Ruta física: `storage/app/public/invimas/`
    - Estado: ✅ Funcionando correctamente

### ❌ **RUTAS PROBLEMÁTICAS**

1. **MANTENIMIENTOS/PREVENTIVOS**

    - **Problema**: ❌ NO HAY ENDPOINT DE DESCARGA
    - **BD**: 15,532 registros con archivos
    - **Físicos**: Solo 16 archivos en `storage/app/public/mantenimientos/`
    - **Columna BD**: `mantenimiento.file`
    - **Acción requerida**:
        - ✅ Crear endpoint de descarga
        - ❌ Migrar archivos a la ubicación correcta

2. **ÓRDENES DE COMPRA**
    - **Problema**: ❌ Archivos almacenados en ubicación incorrecta
    - **Configurado**: `storeAs('purchase_orders', ...)`
    - **Debería ser**: `storage/app/public/ordenes_compra/`
    - **Acción requerida**: Corregir ruta de almacenamiento

## 🛠️ **ACCIONES REQUERIDAS**

### 1. **CREAR ENDPOINT PARA MANTENIMIENTOS**

```php
// Agregar en routes/api.php
Route::get('download/mantenimientos/{filename}', function($filename) {
    $filePath = storage_path('app/public/mantenimientos/' . $filename);

    if (!file_exists($filePath)) {
        return response()->json(['error' => 'Archivo no encontrado'], 404);
    }

    return response()->file($filePath);
});
```

### 2. **CORREGIR ALMACENAMIENTO DE ÓRDENES DE COMPRA**

```php
// Cambiar de:
$filePath = $file->storeAs('purchase_orders', $fileName, 'public');
// A:
$filePath = $file->storeAs('ordenes_compra', $fileName, 'public');
```

### 3. **MIGRACIÓN DE ARCHIVOS DE MANTENIMIENTOS**

-   Los archivos están dispersos o en otra ubicación
-   Necesario script de migración para mover archivos existentes

## 📊 **ESTADÍSTICAS ACTUALES**

| Tipo           | Registros BD | Archivos Físicos | Estado            |
| -------------- | ------------ | ---------------- | ----------------- |
| Mantenimientos | 15,532       | 16               | ❌ 99.9% perdidos |
| Equipos        | -            | Múltiples        | ✅ Funcionando    |
| Correctivos    | -            | Múltiples        | ✅ Funcionando    |
| Observaciones  | -            | Múltiples        | ✅ Funcionando    |
| Repuestos      | -            | Múltiples        | ✅ Funcionando    |
| INVIMA         | -            | Múltiples        | ✅ Funcionando    |

## 🎯 **PRIORIDADES**

1. **ALTA**: Crear endpoint descarga mantenimientos
2. **MEDIA**: Corregir almacenamiento órdenes de compra
3. **BAJA**: Investigar migración archivos mantenimientos perdidos

---

_Análisis realizado el 25 de agosto de 2025_
