# 🧪 Plan de Pruebas - Modal Agregar Equipos Biomédicos

## 📋 Lista de Verificación Completa

### ✅ FASE 1: Verificación de Conexiones
- [ ] **Backend corriendo** en http://localhost:8000
- [ ] **Frontend corriendo** en http://localhost:3000 (o puerto configurado)
- [ ] **Base de datos conectada** y con datos de catálogos
- [ ] **Storage configurado** con carpetas equipos/images y equipos/documentos

### ✅ FASE 2: Pruebas de API Backend
- [ ] **GET /api/v1/modal/add-equipment-data** - Cargar catálogos
- [ ] **POST /api/v1/equipos** - Crear equipo (sin archivos)
- [ ] **POST /api/v1/equipos** - Crear equipo (con archivos)
- [ ] **Validaciones de campos obligatorios**
- [ ] **Validaciones de unicidad** (code, serial, codigo_antiguo)

### ✅ FASE 3: Pruebas de Frontend
- [ ] **Modal se abre correctamente**
- [ ] **Catálogos se cargan en selects**
- [ ] **Campos dependientes funcionan** (área depende de servicio)
- [ ] **Validaciones en tiempo real**
- [ ] **Subida de archivos** (drag & drop)
- [ ] **Previsualización de archivos**
- [ ] **Toasts de Sonner** (loading, success, error)

### ✅ FASE 4: Pruebas de Integración Completa
- [ ] **Flujo completo de registro**
- [ ] **Archivos se almacenan correctamente**
- [ ] **Datos se guardan en BD**
- [ ] **Modal se cierra después del éxito**
- [ ] **Lista de equipos se actualiza**

---

## 🔧 Comandos de Prueba

### 1. Verificar Backend
```bash
# Verificar que el servidor esté corriendo
curl http://localhost:8000/api/v1/health

# Probar endpoint de catálogos
curl -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8000/api/v1/modal/add-equipment-data
```

### 2. Verificar Base de Datos
```sql
-- Verificar catálogos tienen datos
SELECT 'servicios' as tabla, COUNT(*) as registros FROM servicios
UNION ALL
SELECT 'areas' as tabla, COUNT(*) as registros FROM areas
UNION ALL
SELECT 'propietarios' as tabla, COUNT(*) as registros FROM propietarios;

-- Verificar estructura tabla equipos
DESCRIBE equipos;
```

### 3. Verificar Storage
```bash
# Verificar carpetas existen
ls -la storage/app/public/equipos/
ls -la storage/app/public/equipos/images/
ls -la storage/app/public/equipos/documentos/

# Verificar permisos
chmod -R 755 storage/app/public/equipos/
```

---

## 📝 Casos de Prueba Específicos

### Caso 1: Registro Básico
**Objetivo**: Registrar equipo con campos mínimos obligatorios
**Datos**:
- Nombre: "Equipo Prueba 001"
- Serie: "TEST-001"
- Código: "INV-001"
- Marca: "MARCA TEST"
- Modelo: "MODELO TEST"

**Resultado Esperado**: ✅ Equipo registrado exitosamente

### Caso 2: Registro Completo
**Objetivo**: Registrar equipo con todos los campos
**Incluye**:
- Todos los campos obligatorios
- Imagen (JPG < 5MB)
- Archivo Excel/PDF (< 20MB)
- Manuales y planos seleccionados
- Fechas coherentes

**Resultado Esperado**: ✅ Equipo registrado con archivos

### Caso 3: Validaciones de Error
**Objetivo**: Verificar validaciones funcionan
**Pruebas**:
- Campos vacíos → Error de validación
- Código duplicado → Error de unicidad
- Archivo muy grande → Error de tamaño
- Fechas incoherentes → Error de lógica

**Resultado Esperado**: ❌ Errores mostrados correctamente

### Caso 4: Campos Condicionales
**Objetivo**: Verificar campos dependientes
**Pruebas**:
- Seleccionar servicio → Áreas se filtran
- Tipo comodato → Campo comodato se habilita
- Calibración = Sí → Campo periodicidad se habilita

**Resultado Esperado**: ✅ Campos se muestran/ocultan correctamente

---

## 🎯 Checklist de Funcionalidades

### Modal y UI
- [ ] Modal se abre con diseño correcto
- [ ] Todas las secciones visibles
- [ ] Campos tienen placeholders apropiados
- [ ] Botones funcionan correctamente
- [ ] Responsive en diferentes tamaños

### Catálogos
- [ ] Servicios se cargan
- [ ] Áreas se cargan filtradas por servicio
- [ ] Propietarios se cargan
- [ ] Fuentes de alimentación se cargan
- [ ] Tecnologías se cargan
- [ ] Frecuencias de mantenimiento se cargan
- [ ] Clasificaciones biomédicas se cargan
- [ ] Clasificaciones de riesgo se cargan
- [ ] Tipos de adquisición se cargan
- [ ] Estados de equipo se cargan
- [ ] Disponibilidades se cargan

### Validaciones
- [ ] Campos obligatorios marcados con *
- [ ] Validación en tiempo real
- [ ] Mensajes de error claros
- [ ] Validación de unicidad asíncrona
- [ ] Validación de archivos

### Archivos
- [ ] Drag & drop funciona
- [ ] Selección de archivos funciona
- [ ] Previsualización de imágenes
- [ ] Previsualización de PDFs con PDFSlick
- [ ] Validación de tipos de archivo
- [ ] Validación de tamaños
- [ ] Compresión de imágenes grandes

### Toasts
- [ ] Toast de loading al enviar
- [ ] Toast de success al completar
- [ ] Toast de error en fallos
- [ ] Toast de validación de archivos

### Backend
- [ ] Datos se guardan correctamente
- [ ] Archivos se almacenan en storage
- [ ] Relaciones FK se crean
- [ ] Campos JSON se procesan
- [ ] Validaciones backend funcionan

---

## 🚨 Problemas Comunes y Soluciones

### Error: "Catálogos no cargan"
**Causa**: Token de autenticación inválido
**Solución**: Verificar login y token en localStorage

### Error: "Archivos no se suben"
**Causa**: Permisos de storage o tamaño
**Solución**: 
```bash
chmod -R 755 storage/
php artisan storage:link
```

### Error: "Validación falla"
**Causa**: Campos obligatorios o formato incorrecto
**Solución**: Verificar todos los campos marcados con *

### Error: "Modal no se cierra"
**Causa**: Error en envío o validación
**Solución**: Revisar console del navegador para errores JS

---

## 📊 Métricas de Éxito

- **Tiempo de carga de catálogos**: < 2 segundos
- **Tiempo de envío de formulario**: < 5 segundos
- **Tasa de éxito de validaciones**: 100%
- **Archivos almacenados correctamente**: 100%
- **Toasts mostrados apropiadamente**: 100%

---

## 🎉 Criterios de Aceptación Final

✅ **APROBADO** si:
- Modal se abre y funciona completamente
- Todos los catálogos cargan correctamente
- Formulario se envía sin errores
- Archivos se almacenan en storage
- Datos se guardan en base de datos
- Toasts se muestran apropiadamente
- Modal se cierra después del éxito

❌ **RECHAZADO** si:
- Cualquier funcionalidad crítica falla
- Errores de JavaScript en console
- Archivos no se almacenan
- Datos no se guardan en BD
- Validaciones no funcionan
