# EVA — Material de Entrenamiento — Sesión 1

**Sistema:** EVA – Sistema de Gestión de Equipos Médicos e Industriales  
**Hospital Universitario del Valle (HUV)**  
**Versión:** 2.0.0 | **Fecha:** Mayo 2026  
**Duración estimada de la sesión:** 3 horas  
**Audiencia:** Técnicos de mantenimiento biomédico, coordinadores de área

---

## Objetivos de la Sesión 1

Al finalizar esta sesión, el participante podrá:

✅ Acceder al sistema EVA con sus credenciales  
✅ Navegar de forma fluida por los módulos principales  
✅ Consultar el inventario de equipos biomédicos e industriales  
✅ Ver la ficha técnica completa de un equipo  
✅ Agregar y editar equipos en el sistema  
✅ Utilizar los filtros de búsqueda avanzada  
✅ Exportar listados de equipos a Excel  

---

## Agenda de la Sesión 1

| Tiempo | Tema |
|---|---|
| 0:00 – 0:20 | Presentación del sistema EVA y su propósito |
| 0:20 – 0:40 | Acceso, login y navegación general |
| 0:40 – 1:10 | Módulo Equipos Biomédicos: consulta y búsqueda |
| 1:10 – 1:30 | Descanso |
| 1:30 – 2:00 | Ficha técnica de equipo: detalle y campos |
| 2:00 – 2:30 | Agregar y editar equipos |
| 2:30 – 2:50 | Exportaciones y búsqueda global |
| 2:50 – 3:00 | Preguntas y cierre |

---

## Bloque 1: ¿Qué es EVA?

**EVA** (Sistema de Gestión de Equipos) es la plataforma digital del Hospital Universitario del Valle para:

- **Inventariar** y controlar todos los equipos biomédicos e industriales de la institución
- **Gestionar** las órdenes de trabajo (correctivos y preventivos)
- **Planificar** el mantenimiento preventivo anual
- **Documentar** toda la historia técnica de cada equipo
- **Reportar** indicadores de gestión a las áreas directivas

**Acceso:** `http://eva2.huv.gov.co` (funciona en cualquier navegador moderno: Chrome, Firefox, Edge)

---

## Bloque 2: Acceso y Navegación

### 2.1 Cómo Iniciar Sesión

1. Abrir el navegador e ingresar: **`http://eva2.huv.gov.co`**
2. Ingresar su **correo institucional** y **contraseña**
3. Clic en **"Iniciar sesión"**

> La primera vez, el sistema enviará un correo de verificación. Confirmar la cuenta antes de usar el sistema.

### 2.2 Elementos de la Pantalla Principal

```
┌─────────────────────────────────────────────────────────────┐
│ [≡] EVA APLICATIVO    [Barra de búsqueda global]  [Usuario] │  ← Barra superior
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  MENÚ LATERAL    │         CONTENIDO PRINCIPAL              │
│                  │                                          │
│  INICIO          │                                          │
│  EQUIPOS ▶       │                                          │
│  PLANES ▶        │                                          │
│  ORDENES ▶       │                                          │
│  REPUESTOS ▶     │                                          │
│  CAPACITACIONES▶ │                                          │
│  DASHBOARD ▶     │                                          │
│  CONFIGURACIÓN▶  │                                          │
│  ADMINISTRADOR▶  │                                          │
│                  │                                          │
└──────────────────┴──────────────────────────────────────────┘
```

**Menú lateral:** Hacer clic en cada sección para ver sus sub-módulos. Clic en [≡] para ocultar/mostrar el menú.

### 2.3 Timeout de Sesión
- La sesión se cierra automáticamente tras **30 minutos de inactividad**
- Aparecerá un aviso 2 minutos antes con opción de **"Continuar sesión"**

---

## Bloque 3: Módulo de Equipos Biomédicos

**Cómo acceder:** Clic en **EQUIPOS** en el menú → Clic en **BIOMEDICOS**

### 3.1 La Lista de Equipos

Al entrar verá una lista de todos los equipos biomédicos del hospital. Puede cambiar entre dos vistas:
- 📋 **Vista tarjetas:** muestra imagen, nombre, código y estado de cada equipo
- 📊 **Vista tabla:** muestra más campos en filas y columnas

### 3.2 Información Visible por Equipo
- Nombre del equipo
- Código interno y número de serie
- Marca y modelo
- Servicio y área donde está ubicado
- Estado actual (Activo, En mantenimiento, Dado de baja, etc.)

### 3.3 Búsqueda de Equipos

**Búsqueda rápida (barra superior de la vista):**
1. Escribir el nombre, código o serie del equipo
2. La lista se filtra automáticamente en tiempo real

**Filtros avanzados (botón "Filtrar"):**
Permite filtrar por múltiples criterios simultáneamente:
- Servicio / Área
- Estado del equipo
- Marca / Tipo de equipo
- Propietario
- Rango de fechas de adquisición

> **Tip:** Combinar filtros para encontrar equipos específicos. Por ejemplo: "Equipos de marca PHILIPS en el servicio de UCI".

### 3.4 Ver Detalle de un Equipo

1. Hacer clic en el ícono 👁 (ojo) del equipo
2. Se abre el modal de detalle con pestañas:
   - **General:** identificación, ubicación, estado
   - **Adquisición:** compra, contrato, garantía, valor
   - **Técnica:** especificaciones técnicas, riesgo eléctrico
   - **Mantenimientos:** historial de correctivos y preventivos
   - **Calibraciones:** registros de calibración
   - **Documentos:** manuales y certificados adjuntos
   - **Observaciones:** notas técnicas

3. Desde este modal también se puede descargar la **Ficha Técnica en PDF**

---

## Bloque 4: Ficha Técnica del Equipo — Campos Clave

| Campo | Descripción | Ejemplo |
|---|---|---|
| **Nombre** | Nombre genérico del equipo | Monitor de signos vitales |
| **Código interno** | Código EVA único del hospital | BIO-2024-001 |
| **Serie** | Número de serie del fabricante | SN-4521-XZ |
| **Marca** | Fabricante del equipo | PHILIPS |
| **Modelo** | Modelo específico | IntelliVue MX40 |
| **Tipo de equipo** | Clasificación funcional | Monitor |
| **Servicio** | Dependencia del hospital | UCI Adultos |
| **Área** | Área dentro del servicio | Cubículo 3 |
| **Estado** | Condición actual | Activo |
| **Fecha adquisición** | Cuándo se compró | 15/03/2022 |
| **Vida útil** | Años de vida útil estimada | 10 años |
| **Garantía** | Período de garantía | 24 meses |
| **Valor** | Costo de adquisición | $45.000.000 |
| **Propietario** | Institución propietaria | HUV |
| **Riesgo** | Clasificación de riesgo INVIMA | IIb |
| **Registro INVIMA** | Número de registro sanitario | 2020DM-0001 |

---

## Bloque 5: Agregar un Equipo Nuevo

1. Clic en el botón **"Agregar Equipo"** (botón azul, esquina superior)
2. Se abre el formulario con 4 pestañas:

### Pestaña 1: Información General
- **Nombre del equipo** *(obligatorio)*
- **Tipo de equipo** — seleccionar de la lista
- **Marca** — seleccionar o escribir nueva
- **Modelo**
- **Número de serie** *(obligatorio)*
- **Código interno** *(obligatorio)*
- **Servicio** — dependencia del hospital
- **Área** — área dentro del servicio
- **Estado** — condición actual del equipo

### Pestaña 2: Adquisición
- **Fecha de adquisición**
- **Vida útil** (años)
- **Garantía** — seleccionar período (6, 12, 18, 24, 36, 48 meses)
- **Valor de adquisición**
- **Proveedor / Empresa**

### Pestaña 3: Técnica
- **Voltaje, frecuencia, potencia**
- **Peso y dimensiones**
- **Clasificación de riesgo**
- **Registro INVIMA**

3. Al terminar: clic en **"Guardar"**

> **Importante:** Los campos marcados con * son obligatorios. El sistema alertará si falta alguno.

---

## Bloque 6: Editar un Equipo

1. Ubicar el equipo en la lista
2. Clic en el ícono ✏️ (lápiz)
3. Modificar los campos necesarios
4. Los campos con lista desplegable muestran el valor guardado actualmente
5. Clic en **"Guardar cambios"**

> **Tip:** Solo los usuarios con permiso de edición verán el botón ✏️

---

## Bloque 7: Exportar Equipos a Excel

Desde la vista de equipos:
1. Aplicar los filtros deseados (opcional)
2. Clic en el botón de **Exportar Excel** (ícono de hoja de cálculo)
3. El sistema descargará automáticamente el archivo `.xlsx`
4. El archivo incluye todos los campos visibles de los equipos filtrados

---

## Bloque 8: Búsqueda Global

La barra de búsqueda en la **parte superior central** de la pantalla permite encontrar equipos desde cualquier módulo:

1. Clic en la barra de búsqueda (o presionar el ícono 🔍)
2. Escribir el nombre, código o serie
3. Los resultados aparecen en tiempo real
4. Clic en un resultado para abrir el detalle del equipo

---

## Ejercicios Prácticos — Sesión 1

### Ejercicio 1: Navegar el sistema
1. Iniciar sesión con sus credenciales
2. Explorar el menú lateral e identificar todas las secciones disponibles
3. Ir a EQUIPOS → BIOMEDICOS y cambiar entre vista tarjeta y vista tabla

### Ejercicio 2: Buscar un equipo
1. En la vista de equipos biomédicos, buscar un equipo por nombre
2. Aplicar un filtro por servicio
3. Ver el detalle completo del equipo (clic en 👁)

### Ejercicio 3: Agregar un equipo de prueba
1. Clic en "Agregar Equipo"
2. Completar los campos obligatorios con datos ficticios
3. Guardar el equipo
4. Buscarlo y verificar que aparece en la lista

### Ejercicio 4: Exportar
1. Filtrar equipos por un servicio específico
2. Exportar el resultado a Excel
3. Abrir el archivo y verificar los datos

---

## Puntos Clave — Sesión 1

> 🔑 **EVA es el repositorio central** de todos los equipos del HUV. Mantenerlo actualizado es responsabilidad de todos los técnicos.

> 🔑 **Cada equipo tiene un código único** que lo identifica en todo el sistema. Siempre usar este código al buscar o reportar.

> 🔑 **Los filtros son poderosos.** Combinar múltiples criterios para encontrar grupos específicos de equipos.

> 🔑 **Los cambios son auditados.** El sistema registra quién realizó cada modificación y cuándo.

---

## Preguntas Frecuentes — Sesión 1

**¿Qué hago si no encuentro un equipo en el sistema?**  
Verificar que está correctamente registrado. Si no existe, agrégarlo con el botón "Agregar Equipo". Si cree que debería estar, contactar al administrador del sistema.

**¿Puedo agregar un equipo sin todos los datos técnicos?**  
Sí, solo los campos marcados como obligatorios son requeridos. Los demás pueden completarse posteriormente editando el equipo.

**¿Por qué no veo el botón de "Editar" en algunos equipos?**  
Depende de sus permisos asignados. Si necesita acceso de edición, contactar al administrador.

**¿Qué pasa si cometo un error al editar un equipo?**  
El sistema registra el historial de cambios. Contactar al administrador para revisar y revertir si es necesario.

---

## Recursos Adicionales

- Manual completo del sistema: `MANUAL_DE_USUARIO.md`
- Guía de despliegue: `plantillas/GUIA DE DESPLIEGUE DEL APLICATIVO.pdf`
- Soporte técnico: administrador del sistema EVA — HUV
