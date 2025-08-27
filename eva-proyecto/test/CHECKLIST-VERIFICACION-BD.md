# ✅ Checklist de Verificación de Base de Datos
## Sistema de Equipos Biomédicos - Hospital Universitario del Valle

### 📋 Instrucciones de Verificación

Este checklist debe ser completado para asegurar que el sistema de registro de equipos funciona correctamente con la base de datos.

---

## 🔍 1. VERIFICACIÓN DE ESTRUCTURA DE BASE DE DATOS

### ✅ Tablas Principales
- [ ] **equipos** - Tabla principal con todos los campos requeridos
- [ ] **servicios** - Catálogo de servicios hospitalarios
- [ ] **areas** - Catálogo de áreas por servicio
- [ ] **propietarios** - Catálogo de propietarios de equipos
- [ ] **fuentes_alimentacion** - Catálogo de fuentes de alimentación
- [ ] **tecnologias** - Catálogo de tecnologías predominantes
- [ ] **frecuencias_mantenimiento** - Catálogo de frecuencias de mantenimiento
- [ ] **clasificaciones_biomedicas** - Catálogo de clasificaciones biomédicas
- [ ] **clasificaciones_riesgo** - Catálogo de clasificaciones de riesgo
- [ ] **tipos_adquisicion** - Catálogo de tipos de adquisición
- [ ] **estados_equipo** - Catálogo de estados de equipos
- [ ] **disponibilidad** - Catálogo de disponibilidades
- [ ] **sedes** - Catálogo de sedes hospitalarias

### ✅ Campos de la Tabla Equipos
#### Identificación Básica
- [ ] **id** (Primary Key, Auto Increment)
- [ ] **name** (VARCHAR, NOT NULL)
- [ ] **serial** (VARCHAR, NOT NULL, UNIQUE)
- [ ] **code** (VARCHAR, NOT NULL, UNIQUE)
- [ ] **marca** (VARCHAR, NOT NULL)
- [ ] **modelo** (VARCHAR, NOT NULL)
- [ ] **descripcion** (TEXT, NULLABLE)
- [ ] **codigo_antiguo** (VARCHAR, NOT NULL, UNIQUE)
- [ ] **codigo_inventario** (VARCHAR, NOT NULL)
- [ ] **centro_costo** (VARCHAR, NOT NULL)
- [ ] **pais_origen** (VARCHAR, NOT NULL)

#### Ubicación
- [ ] **servicio_id** (Foreign Key -> servicios.id)
- [ ] **area_id** (Foreign Key -> areas.id)
- [ ] **sede_id** (Foreign Key -> sedes.id)
- [ ] **localizacion_actual** (VARCHAR, NOT NULL)

#### Registro Histórico
- [ ] **tadquisicion_id** (Foreign Key -> tipos_adquisicion.id)
- [ ] **garantia** (VARCHAR, NOT NULL)
- [ ] **activo_comodato** (VARCHAR, NULLABLE)
- [ ] **fecha_adquisicion** (DATE, NOT NULL)
- [ ] **fecha_instalacion** (DATE, NOT NULL)
- [ ] **fecha_recepcion_almacen** (DATE, NOT NULL)
- [ ] **fecha_acta_recibo** (DATE, NOT NULL)
- [ ] **fecha_inicio_operacion** (DATE, NOT NULL)
- [ ] **fecha_fabricacion** (DATE, NOT NULL)
- [ ] **costo** (DECIMAL, NOT NULL)
- [ ] **vida_util** (INTEGER, NOT NULL)

#### Registro Técnico
- [ ] **fuente_id** (Foreign Key -> fuentes_alimentacion.id)
- [ ] **tecnologia_id** (Foreign Key -> tecnologias.id)
- [ ] **evaluacion_desempeno** (ENUM: excelente, bueno, regular, deficiente)
- [ ] **calibracion** (BOOLEAN)
- [ ] **periodicidad_calibracion** (VARCHAR, NULLABLE)
- [ ] **frecuencia_id** (Foreign Key -> frecuencias_mantenimiento.id)

#### Estado Actual
- [ ] **funcionalidad** (ENUM: optima, buena, regular, deficiente)
- [ ] **disponibilidad_id** (Foreign Key -> disponibilidad.id)
- [ ] **estadoequipo_id** (Foreign Key -> estados_equipo.id)

#### Apoyo Técnico
- [ ] **manual_operacion** (BOOLEAN)
- [ ] **manual_mantenimiento** (BOOLEAN)
- [ ] **manual_partes** (BOOLEAN)
- [ ] **manual_otros** (BOOLEAN)
- [ ] **plano_electrico** (BOOLEAN)
- [ ] **plano_electronico** (BOOLEAN)
- [ ] **plano_neumatico** (BOOLEAN)
- [ ] **plano_mecanico** (BOOLEAN)
- [ ] **cbiomedica_id** (Foreign Key -> clasificaciones_biomedicas.id)
- [ ] **criesgo_id** (Foreign Key -> clasificaciones_riesgo.id)

#### Seguimiento
- [ ] **componentes** (TEXT, NULLABLE)
- [ ] **propietario_id** (Foreign Key -> propietarios.id)
- [ ] **verificacion_fisica** (ENUM: realizada, pendiente, no-aplica)
- [ ] **observaciones** (TEXT, NULLABLE)

#### Archivos y Metadatos
- [ ] **image** (VARCHAR, NULLABLE) - Ruta de imagen
- [ ] **archivo_hoja_vida** (VARCHAR, NULLABLE) - Ruta de archivo Excel/PDF
- [ ] **invima** (VARCHAR, NULLABLE)
- [ ] **tipo_id** (INTEGER, DEFAULT 1) - Tipo de equipo
- [ ] **usuario_id** (Foreign Key -> users.id)
- [ ] **status** (BOOLEAN, DEFAULT 1)
- [ ] **created_at** (TIMESTAMP)
- [ ] **updated_at** (TIMESTAMP)

---

## 🔗 2. VERIFICACIÓN DE RELACIONES

### ✅ Llaves Foráneas
- [ ] **equipos.servicio_id** → servicios.id
- [ ] **equipos.area_id** → areas.id
- [ ] **equipos.sede_id** → sedes.id
- [ ] **equipos.tadquisicion_id** → tipos_adquisicion.id
- [ ] **equipos.fuente_id** → fuentes_alimentacion.id
- [ ] **equipos.tecnologia_id** → tecnologias.id
- [ ] **equipos.frecuencia_id** → frecuencias_mantenimiento.id
- [ ] **equipos.disponibilidad_id** → disponibilidad.id
- [ ] **equipos.estadoequipo_id** → estados_equipo.id
- [ ] **equipos.cbiomedica_id** → clasificaciones_biomedicas.id
- [ ] **equipos.criesgo_id** → clasificaciones_riesgo.id
- [ ] **equipos.propietario_id** → propietarios.id
- [ ] **equipos.usuario_id** → users.id
- [ ] **areas.servicio_id** → servicios.id

### ✅ Restricciones de Unicidad
- [ ] **equipos.code** - Único en toda la tabla
- [ ] **equipos.serial** - Único en toda la tabla
- [ ] **equipos.codigo_antiguo** - Único en toda la tabla

---

## 📊 3. VERIFICACIÓN DE DATOS

### ✅ Catálogos con Datos
- [ ] **servicios** - Al menos 5 servicios activos
- [ ] **areas** - Al menos 10 áreas distribuidas por servicios
- [ ] **propietarios** - Al menos 3 propietarios (HUV, Terceros, etc.)
- [ ] **fuentes_alimentacion** - Al menos 5 tipos (Eléctrica, Batería, etc.)
- [ ] **tecnologias** - Al menos 5 tecnologías (Electrónica, Mecánica, etc.)
- [ ] **frecuencias_mantenimiento** - Al menos 6 frecuencias (Mensual, Trimestral, etc.)
- [ ] **clasificaciones_biomedicas** - Al menos 4 clasificaciones (Clase I, IIa, IIb, III)
- [ ] **clasificaciones_riesgo** - Al menos 3 niveles (Bajo, Medio, Alto)
- [ ] **tipos_adquisicion** - Al menos 4 tipos (Compra, Donación, Comodato, etc.)
- [ ] **estados_equipo** - Al menos 5 estados (Operativo, Mantenimiento, etc.)
- [ ] **disponibilidad** - Al menos 3 estados (Disponible, No Disponible, etc.)
- [ ] **sedes** - Al menos 1 sede (SEDE HUV)

---

## 🧪 4. PRUEBAS DE FUNCIONALIDAD

### ✅ Inserción de Equipos
- [ ] **Registro básico** - Campos obligatorios únicamente
- [ ] **Registro completo** - Todos los campos con datos
- [ ] **Validación de unicidad** - Code, Serial, Código Antiguo
- [ ] **Relaciones válidas** - Todas las FK apuntan a registros existentes
- [ ] **Campos condicionales** - Comodato solo si tipo = comodato
- [ ] **Fechas coherentes** - Fabricación < Adquisición < Instalación < Operación

### ✅ Manejo de Archivos
- [ ] **Subida de imagen** - Archivo se guarda en storage/equipos/images/
- [ ] **Subida de Excel/PDF** - Archivo se guarda en storage/equipos/documentos/
- [ ] **Renombrado automático** - Archivos tienen timestamp + ID único
- [ ] **Validación de tipos** - Solo tipos permitidos se aceptan
- [ ] **Validación de tamaño** - Límites respetados (5MB imagen, 20MB docs)
- [ ] **Ruta en BD** - Campo image/archivo_hoja_vida contiene ruta correcta

### ✅ Validaciones
- [ ] **Frontend** - Campos obligatorios marcados visualmente
- [ ] **Backend** - StoreEquipmentRequest valida todos los campos
- [ ] **Base de datos** - Constraints y tipos de datos correctos
- [ ] **Unicidad** - No se permiten duplicados en campos únicos
- [ ] **Relaciones** - FK válidas o error de inserción

---

## 🔍 5. COMANDOS DE VERIFICACIÓN

### ✅ Ejecutar Scripts de Verificación

#### Opción 1: Script SQL
```sql
-- Ejecutar en MySQL/phpMyAdmin
source eva-proyecto/database-verification.sql;
```

#### Opción 2: Script PHP
```bash
# Ejecutar en terminal
cd eva-proyecto
php database-verification.php
```

#### Opción 3: Verificación Manual
```sql
-- Verificar estructura
DESCRIBE equipos;

-- Verificar datos
SELECT COUNT(*) FROM equipos;
SELECT COUNT(*) FROM servicios;
SELECT COUNT(*) FROM areas;

-- Verificar relaciones
SELECT e.name, s.name as servicio, a.name as area 
FROM equipos e 
JOIN servicios s ON e.servicio_id = s.id 
JOIN areas a ON e.area_id = a.id 
LIMIT 5;

-- Verificar unicidad
SELECT code, COUNT(*) as duplicados 
FROM equipos 
GROUP BY code 
HAVING COUNT(*) > 1;
```

---

## ✅ 6. CRITERIOS DE ACEPTACIÓN

### ✅ Estructura
- [ ] Todas las tablas existen
- [ ] Todos los campos están presentes
- [ ] Tipos de datos son correctos
- [ ] Llaves foráneas funcionan
- [ ] Restricciones de unicidad activas

### ✅ Datos
- [ ] Catálogos tienen datos de prueba
- [ ] Relaciones son válidas
- [ ] No hay datos huérfanos
- [ ] Campos obligatorios completos

### ✅ Funcionalidad
- [ ] Inserción de equipos funciona
- [ ] Validaciones funcionan
- [ ] Archivos se suben correctamente
- [ ] Toasts se muestran apropiadamente
- [ ] Modal se cierra después del registro

---

## 🎯 RESULTADO ESPERADO

Al completar este checklist, el sistema debe:

1. ✅ **Registrar equipos** sin errores
2. ✅ **Validar datos** correctamente
3. ✅ **Manejar archivos** de forma segura
4. ✅ **Mantener integridad** de datos
5. ✅ **Mostrar feedback** apropiado al usuario

---

## 📞 Soporte

Si alguna verificación falla:

1. **Revisar logs** de Laravel en `storage/logs/`
2. **Verificar configuración** de base de datos en `.env`
3. **Ejecutar migraciones** con `php artisan migrate`
4. **Sembrar datos** con `php artisan db:seed`
5. **Verificar permisos** de storage con `php artisan storage:link`

---

**Fecha de verificación:** _______________  
**Verificado por:** _______________  
**Estado:** [ ] ✅ APROBADO [ ] ❌ REQUIERE CORRECCIONES
