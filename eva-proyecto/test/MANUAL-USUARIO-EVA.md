# MANUAL DE USUARIO - SISTEMA EVA

## Equipos y Vidas Aseguradas

**Versión:** 1.0  
**Fecha:** 13 de Agosto, 2025  
**Dirigido a:** Usuario Final  
**Sistema:** Gestión de Equipos Biomédicos

---

## 📖 ÍNDICE

1. [Introducción al Sistema](#introducción-al-sistema)
2. [Instalación o Acceso](#instalación-o-acceso)
3. [Configuración Inicial](#configuración-inicial)
4. [Guía de Uso - Funciones Principales](#guía-de-uso---funciones-principales)
5. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)
6. [Solución de Problemas](#solución-de-problemas)
7. [Contacto y Soporte](#contacto-y-soporte)

---

## 🎯 INTRODUCCIÓN AL SISTEMA

### ¿Qué es EVA?

EVA (Equipos y Vidas Aseguradas) es un sistema integral para la gestión de equipos biomédicos que permite:

- 📋 **Registro completo** de equipos médicos
- 📄 **Gestión de documentación** técnica y regulatoria
- 🔍 **Búsqueda avanzada** y filtrado de equipos
- 📊 **Reportes** y estadísticas en tiempo real
- ✅ **Cumplimiento** con normativas del INVIMA
- 👥 **Control de usuarios** y permisos

### ¿Quién puede usar EVA?

- **Personal médico** y técnico de hospitales
- **Administradores** de equipos biomédicos
- **Técnicos de mantenimiento**
- **Auditores** y personal de calidad
- **Directivos** y administradores

---

## 🚀 INSTALACIÓN O ACCESO

### Opción 1: Acceso Web (Recomendado)

#### **Requisitos del Sistema:**

- **Navegador Web:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Conexión a Internet:** Estable (mínimo 1 Mbps)
- **Resolución de Pantalla:** Mínimo 1024x768px
- **JavaScript:** Habilitado

#### **Pasos para Acceder:**

1. **Abrir Navegador Web**

   - Usar un navegador compatible actualizado

2. **Ingresar URL del Sistema**

   ```
   https://eva.hospitalname.com
   ```

   _(Reemplazar "hospitalname" con el dominio de su institución)_

3. **Verificar Conexión Segura**

   - Verificar que aparezca el ícono de candado 🔒 en la barra de direcciones
   - La URL debe comenzar con "https://"

4. **Guardar en Favoritos**
   - Presionar `Ctrl + D` (Windows) o `Cmd + D` (Mac)
   - Nombrar como "Sistema EVA"

### Opción 2: Aplicación de Escritorio (Empresarial)

#### **Requisitos del Sistema:**

- **Sistema Operativo:** Windows 10/11, macOS 10.15+, Ubuntu 18.04+
- **RAM:** Mínimo 4GB (recomendado 8GB)
- **Espacio en Disco:** 500MB libres
- **Red:** Conexión a red local o internet

#### **Instalación:**

1. **Descargar Instalador**

   - Contactar al administrador de TI para obtener el archivo instalador
   - Archivo típico: `EVA-Setup-v1.0.exe` (Windows)

2. **Ejecutar Instalación**

   ```bash
   # Windows
   Hacer doble clic en EVA-Setup-v1.0.exe

   # macOS
   Abrir EVA-Setup-v1.0.dmg y arrastrar a Aplicaciones

   # Linux
   sudo dpkg -i eva-setup-v1.0.deb
   ```

3. **Seguir Asistente de Instalación**

   - Aceptar términos y condiciones
   - Seleccionar carpeta de instalación
   - Permitir creación de accesos directos

4. **Verificar Instalación**
   - Buscar "EVA" en el menú de inicio
   - Ejecutar primera vez como administrador

---

## ⚙️ CONFIGURACIÓN INICIAL

### Primer Acceso al Sistema

#### **1. Pantalla de Bienvenida**

Al acceder por primera vez, verá:

```
┌─────────────────────────────────────┐
│        🏥 SISTEMA EVA               │
│   Equipos y Vidas Aseguradas       │
│                                     │
│  Usuario: [________________]       │
│  Contraseña: [________________]    │
│                                     │
│     [ Iniciar Sesión ]             │
│                                     │
│  ¿Olvidó su contraseña?            │
│  ¿Necesita una cuenta?             │
└─────────────────────────────────────┘
```

#### **2. Credenciales Iniciales**

**Usuario Administrador por defecto:**

- **Usuario:** `admin@hospital.com`
- **Contraseña:** `Eva2025!`
- ⚠️ **Importante:** Cambiar inmediatamente después del primer acceso

**Usuarios Regulares:**

- Contactar al administrador del sistema para obtener credenciales
- Formato típico: `nombre.apellido@hospital.com`

#### **3. Cambio de Contraseña Obligatorio**

Después del primer acceso:

1. **Ir a Perfil de Usuario**

   - Clic en avatar (esquina superior derecha)
   - Seleccionar "Mi Perfil"

2. **Cambiar Contraseña**

   ```
   Contraseña Actual: [________________]
   Nueva Contraseña:  [________________]
   Confirmar Nueva:   [________________]

   [ Actualizar Contraseña ]
   ```

3. **Requisitos de Contraseña**
   - Mínimo 8 caracteres
   - Al menos 1 mayúscula
   - Al menos 1 minúscula
   - Al menos 1 número
   - Al menos 1 carácter especial (@, #, $, etc.)

### Configuración del Perfil

#### **1. Información Personal**

```
┌─────────────────────────────────────┐
│           MI PERFIL                 │
├─────────────────────────────────────┤
│ Nombre Completo: [________________] │
│ Email:          [________________]  │
│ Teléfono:       [________________]  │
│ Cargo:          [▼ Seleccionar   ]  │
│ Servicio:       [▼ Seleccionar   ]  │
│ Sede:           [▼ Seleccionar   ]  │
│                                     │
│     [ Guardar Cambios ]            │
└─────────────────────────────────────┘
```

#### **2. Preferencias del Sistema**

```
┌─────────────────────────────────────┐
│         PREFERENCIAS                │
├─────────────────────────────────────┤
│ Idioma:         [▼ Español      ]   │
│ Zona Horaria:   [▼ GMT-5        ]   │
│ Tema:           [▼ Claro        ]   │
│ Notificaciones: [☑] Email          │
│                 [☑] En Sistema     │
│                 [☐] SMS            │
│                                     │
│     [ Aplicar Configuración ]      │
└─────────────────────────────────────┘
```

### Configuración de Permisos (Solo Administradores)

#### **1. Gestión de Usuarios**

```bash
Panel Admin → Usuarios → Nuevo Usuario

Información Básica:
- Nombre completo
- Email institucional
- Teléfono
- Cargo/Posición

Permisos de Acceso:
☑ Ver equipos
☑ Registrar equipos
☐ Editar equipos
☐ Eliminar equipos
☑ Ver documentos
☐ Subir documentos
☐ Generar reportes
☐ Administrar usuarios
```

#### **2. Configuración de Servicios**

```
Configuración → Servicios → Agregar Servicio

Nombre del Servicio: [________________]
Código:             [________________]
Responsable:        [▼ Seleccionar   ]
Ubicación:          [________________]
Estado:             [▼ Activo        ]

[ Guardar Servicio ]
```

---

## 📚 GUÍA DE USO - FUNCIONES PRINCIPALES

### 1. REGISTRO DE EQUIPOS MÉDICOS

#### **Acceso a la Función**

```
Menú Principal → Equipos → Registrar Nuevo Equipo
```

#### **Paso 1: Información Básica**

```
┌─────────────────────────────────────┐
│      REGISTRO DE EQUIPO             │
│                                     │
│ Código Único:    [________________] │
│ Nombre Equipo:   [________________] │
│ Marca:           [________________] │
│ Modelo:          [________________] │
│ Serie:           [________________] │
│ Año Fabricación: [▼ 2025         ]  │
│                                     │
│        [ Siguiente ]               │
└─────────────────────────────────────┘
```

**Tips Importantes:**

- 🔍 **Código Único:** Debe ser exclusivo en todo el sistema
- 📝 **Nombre Equipo:** Usar nomenclatura estándar del hospital
- 🏷️ **Marca/Modelo:** Escribir exactamente como aparece en el equipo

#### **Paso 2: Información Técnica**

```
┌─────────────────────────────────────┐
│    ESPECIFICACIONES TÉCNICAS        │
│                                     │
│ Clase de Riesgo: [▼ Clase IIa    ]  │
│ Tecnología:      [▼ Electrónico  ]  │
│ Uso Previsto:    [________________] │
│ Voltaje:         [________________] │
│ Potencia:        [________________] │
│ Peso:            [________________] │
│ Dimensiones:     [________________] │
│                                     │
│   [ Anterior ] [ Siguiente ]       │
└─────────────────────────────────────┘
```

#### **Paso 3: Ubicación y Responsable**

```
┌─────────────────────────────────────┐
│     UBICACIÓN Y RESPONSABLE         │
│                                     │
│ Sede:           [▼ Sede Principal ] │
│ Servicio:       [▼ UCI           ]  │
│ Área Específica:[________________]  │
│ Responsable:    [▼ Dr. García    ]  │
│ Usuario Actual: [▼ Enfermería   ]   │
│ Estado:         [▼ Operativo    ]   │
│                                     │
│   [ Anterior ] [ Siguiente ]       │
└─────────────────────────────────────┘
```

#### **Paso 4: Documentos y Adjuntos**

```
┌─────────────────────────────────────┐
│        DOCUMENTOS REQUERIDOS        │
│                                     │
│ Manual de Usuario:    [ Subir ]     │
│ Hoja de Vida:         [ Subir ]     │
│ Certificado INVIMA:   [ Subir ]     │
│ Acta de Recepción:    [ Subir ]     │
│ Póliza de Garantía:   [ Subir ]     │
│                                     │
│ Documentos Opcionales:              │
│ Manual Técnico:       [ Subir ]     │
│ Certificados Adicionales: [ Subir ] │
│                                     │
│   [ Anterior ] [ Finalizar ]       │
└─────────────────────────────────────┘
```

**Formatos Aceptados:**

- 📄 **PDF:** Documentos oficiales
- 🖼️ **Imágenes:** JPG, PNG (máximo 5MB)
- 📊 **Excel:** XLS, XLSX (especificaciones)

#### **Paso 5: Confirmación y Registro**

```
┌─────────────────────────────────────┐
│         CONFIRMACIÓN                │
│                                     │
│ ✅ Información básica completa      │
│ ✅ Especificaciones técnicas        │
│ ✅ Ubicación asignada               │
│ ✅ Documentos cargados              │
│                                     │
│ ⚠️  Verifique toda la información   │
│    antes de confirmar el registro   │
│                                     │
│  [ Editar ] [ Confirmar Registro ] │
└─────────────────────────────────────┘
```

### 2. BÚSQUEDA Y CONSULTA DE EQUIPOS

#### **Búsqueda Básica**

```
┌─────────────────────────────────────┐
│        BUSCAR EQUIPOS               │
│                                     │
│ Buscar: [________________] [🔍]     │
│                                     │
│ Filtros Rápidos:                    │
│ [Todos] [Operativos] [Mantenimiento]│
│ [UCI] [Quirófano] [Emergencias]     │
└─────────────────────────────────────┘
```

**Opciones de Búsqueda:**

- 🔢 **Por Código:** Ingrese código único
- 📝 **Por Nombre:** Nombre del equipo
- 🏷️ **Por Marca/Modelo:** Fabricante específico
- 📍 **Por Ubicación:** Servicio o área
- 👤 **Por Responsable:** Persona asignada

#### **Búsqueda Avanzada**

```
┌─────────────────────────────────────┐
│      BÚSQUEDA AVANZADA              │
├─────────────────────────────────────┤
│ Código:         [________________]  │
│ Nombre:         [________________]  │
│ Marca:          [▼ Todas         ]  │
│ Clase Riesgo:   [▼ Todas         ]  │
│ Estado:         [▼ Todos         ]  │
│ Servicio:       [▼ Todos         ]  │
│ Responsable:    [▼ Todos         ]  │
│                                     │
│ Fecha Registro:                     │
│ Desde: [📅] Hasta: [📅]             │
│                                     │
│     [ Limpiar ] [ Buscar ]         │
└─────────────────────────────────────┘
```

#### **Resultados de Búsqueda**

```
┌──────────────────────────────────────────────────────┐
│                 RESULTADOS (23)                      │
├──────────────────────────────────────────────────────┤
│ EQ001 │ Monitor Signos │ Phillips │ UCI-A │ Operativo │
│ EQ002 │ Ventilador     │ Dräger   │ UCI-B │ Operativo │
│ EQ003 │ Desfibrilador  │ Zoll     │ ER-1  │ Mantto.   │
│ EQ004 │ Bomba Infusión │ B.Braun  │ UCI-A │ Operativo │
│                                                      │
│ [📄 Ver] [✏️ Editar] [📊 Historial] [🖨️ Exportar]    │
├──────────────────────────────────────────────────────┤
│              📄 1  2  3  ▶️                          │
└──────────────────────────────────────────────────────┘
```

### 3. GESTIÓN DE DOCUMENTOS

#### **Subir Documentos**

```
Equipo → [EQ001] → Documentos → Agregar Documento

┌─────────────────────────────────────┐
│       AGREGAR DOCUMENTO             │
│                                     │
│ Tipo Documento: [▼ Manual Usuario ] │
│ Título:         [________________]  │
│ Descripción:    [________________]  │
│                 [________________]  │
│ Archivo:        [ Seleccionar... ]  │
│                                     │
│ ☑ Documento requerido por INVIMA    │
│ ☐ Confidencial                     │
│ ☐ Requiere aprobación              │
│                                     │
│     [ Cancelar ] [ Subir ]         │
└─────────────────────────────────────┘
```

#### **Visualizar Documentos**

```
┌─────────────────────────────────────┐
│      DOCUMENTOS - EQ001             │
├─────────────────────────────────────┤
│ 📄 Manual Usuario     [Ver] [⬇️]    │
│ 📋 Hoja de Vida      [Ver] [⬇️]     │
│ ✅ Cert. INVIMA      [Ver] [⬇️]     │
│ 📝 Acta Recepción    [Ver] [⬇️]     │
│ 🛡️ Garantía          [Ver] [⬇️]     │
│                                     │
│ [ + Agregar Documento ]             │
└─────────────────────────────────────┘
```

### 4. MANTENIMIENTO Y CALIBRACIÓN

#### **Programar Mantenimiento**

```
Equipo → [EQ001] → Mantenimiento → Programar

┌─────────────────────────────────────┐
│      PROGRAMAR MANTENIMIENTO        │
│                                     │
│ Tipo:           [▼ Preventivo    ]  │
│ Fecha Programada: [📅 DD/MM/AAAA]   │
│ Técnico Asignado: [▼ Ing. López  ]  │
│ Prioridad:      [▼ Normal        ]  │
│ Descripción:    [________________]  │
│                 [________________]  │
│                                     │
│ Recordatorios:                      │
│ ☑ 7 días antes                     │
│ ☑ 1 día antes                      │
│ ☑ Email al responsable             │
│                                     │
│    [ Cancelar ] [ Programar ]      │
└─────────────────────────────────────┘
```

#### **Historial de Mantenimiento**

```
┌─────────────────────────────────────┐
│     HISTORIAL MANTENIMIENTO         │
├─────────────────────────────────────┤
│ 15/08/2025 │ Preventivo │ ✅ OK     │
│ 15/07/2025 │ Calibración│ ✅ OK     │
│ 20/06/2025 │ Correctivo │ ⚠️ Aviso  │
│ 15/05/2025 │ Preventivo │ ✅ OK     │
│                                     │
│ [ Ver Detalles ] [ Exportar ]      │
└─────────────────────────────────────┘
```

### 5. REPORTES Y ESTADÍSTICAS

#### **Generar Reportes**

```
Menú → Reportes → Nuevo Reporte

┌─────────────────────────────────────┐
│         GENERAR REPORTE             │
│                                     │
│ Tipo de Reporte:                    │
│ ○ Inventario General               │
│ ○ Estado de Equipos                │
│ ○ Mantenimientos Pendientes       │
│ ○ Equipos por Servicio             │
│ ○ Cumplimiento INVIMA              │
│ ○ Análisis de Costos               │
│                                     │
│ Periodo:                            │
│ Desde: [📅] Hasta: [📅]             │
│                                     │
│ Formato: [▼ PDF ] [▼ Excel ]        │
│                                     │
│     [ Generar ] [ Programar ]      │
└─────────────────────────────────────┘
```

#### **Dashboard Principal**

```
┌─────────────────────────────────────┐
│           DASHBOARD EVA             │
├─────────────────────────────────────┤
│ 📊 Total Equipos:          1,247   │
│ ✅ Operativos:             1,156   │
│ ⚠️ En Mantenimiento:          78   │
│ ❌ Fuera de Servicio:         13   │
│                                     │
│ 📅 Mantenimientos Hoy:         5   │
│ 📋 Documentos Pendientes:     12   │
│ ⏰ Vencimientos Próximos:      8   │
│                                     │
│ [ Ver Alertas ] [ Reportes ]       │
└─────────────────────────────────────┘
```

---

## ❓ PREGUNTAS FRECUENTES (FAQ)

### 🔐 **Acceso y Seguridad**

#### **P: ¿Olvidé mi contraseña, cómo la recupero?**

**R:**

1. En la pantalla de inicio, clic en "¿Olvidó su contraseña?"
2. Ingrese su email institucional
3. Revise su correo electrónico en 5-10 minutos
4. Siga las instrucciones del email para crear nueva contraseña
5. Si no recibe el email, contacte al administrador

#### **P: ¿Por qué no puedo acceder al sistema?**

**R:** Verifique:

- ✅ URL correcta del sistema
- ✅ Conexión a internet estable
- ✅ Usuario y contraseña correctos
- ✅ Su cuenta está activa (contacte al administrador)
- ✅ Navegador compatible y actualizado

#### **P: ¿Cuánto tiempo puedo estar inactivo antes de cerrar sesión?**

**R:** El sistema cierra automáticamente después de 2 horas de inactividad por seguridad. Recibirá un aviso 15 minutos antes.

### 📋 **Registro de Equipos**

#### **P: ¿Qué hacer si el código único ya existe?**

**R:**

1. Verificar si el equipo ya está registrado usando la búsqueda
2. Si existe, no duplicar el registro
3. Si es un equipo diferente, usar un código alternativo (ej: EQ001-B)
4. Contactar al administrador si persiste el problema

#### **P: ¿Es obligatorio subir todos los documentos?**

**R:**

- **Obligatorios:** Manual de usuario, Certificado INVIMA, Hoja de vida
- **Opcionales:** Manual técnico, certificados adicionales
- **Recomendados:** Acta de recepción, póliza de garantía

#### **P: ¿Qué hacer si no tengo algún documento requerido?**

**R:**

1. Complete el registro con los documentos disponibles
2. Marque en observaciones qué documentos faltan
3. Agregue los documentos faltantes posteriormente
4. El sistema generará recordatorios automáticos

#### **P: ¿Puedo guardar un registro parcial y completarlo después?**

**R:**
Sí, el sistema permite guardar borradores:

- Use el botón "Guardar Borrador" en cualquier paso
- Los datos se mantienen por 30 días
- Puede continuar desde "Mis Borradores" en el menú
- Se envían recordatorios cada 7 días

#### **P: ¿Qué información técnica es obligatoria?**

**R:**
**Campos Obligatorios:**

- Clase de riesgo (I, IIa, IIb, III)
- Tecnología biomédica
- Uso previsto del equipo
- Voltaje de operación
- Peso aproximado

**Campos Opcionales:**

- Dimensiones exactas
- Potencia consumida
- Especificaciones adicionales

#### **P: ¿Cómo asigno correctamente el responsable del equipo?**

**R:**

1. **Responsable:** Persona que responde por el equipo (generalmente jefe de servicio)
2. **Usuario Actual:** Quien usa el equipo día a día (técnico, enfermera)
3. Si no aparece en la lista, contacte al administrador para agregarlo
4. Puede cambiar la asignación posteriormente desde "Editar Equipo"

#### **P: ¿Qué estados de equipo puedo seleccionar?**

**R:**

- **Operativo:** Funcionando normalmente
- **Mantenimiento:** En proceso de mantenimiento
- **Fuera de Servicio:** No funciona, necesita reparación
- **Dado de Baja:** Equipo retirado permanentemente
- **En Tránsito:** Siendo trasladado entre servicios
- **En Instalación:** Nuevo, en proceso de puesta en marcha

#### **P: ¿Puedo registrar equipos sin número de serie?**

**R:**

- **Con serie:** Ideal, use el número exacto del fabricante
- **Sin serie:** Marque "Sin número de serie" y explique en observaciones
- **Serie ilegible:** Use "SERIE-ILEGIBLE-AAAA" (año actual)
- **Equipos antiguos:** Contacte al administrador para casos especiales

#### **P: ¿Cómo manejo equipos que son parte de un sistema más grande?**

**R:**
**Opción 1 - Registro Individual:**

- Registre cada componente por separado
- Use códigos relacionados (ej: RM001-A, RM001-B)
- Indique en observaciones que es parte de un sistema

**Opción 2 - Registro como Sistema:**

- Registre el sistema completo como una unidad
- Liste los componentes en la descripción
- Use la función "Equipos Relacionados"

#### **P: ¿Qué hago si me equivoco en algún dato durante el registro?**

**R:**
**Durante el Registro:**

- Use el botón "Anterior" para corregir pasos previos
- Todos los datos se mantienen al navegar entre pasos

**Después del Registro:**

- Vaya a "Buscar Equipos" → Localice el equipo → "Editar"
- Algunos campos requieren aprobación del administrador
- Los cambios quedan registrados en el historial

#### **P: ¿El sistema valida automáticamente los códigos INVIMA?**

**R:**
Sí, el sistema:

- ✅ Verifica formato del código INVIMA
- ✅ Consulta la base de datos oficial del INVIMA
- ✅ Alerta si el código no existe o está vencido
- ⚠️ Permite continuar con observación si hay problemas de conectividad
- 📋 Genera reporte de equipos con códigos pendientes de validación

### 🔍 **Búsqueda y Consultas**

#### **P: ¿Por qué no encuentro un equipo que sé que existe?**

**R:**

- Verifique ortografía en la búsqueda
- Use búsqueda avanzada con múltiples criterios
- Revise que tenga permisos para ver ese servicio
- El equipo puede estar marcado como "No visible"

#### **P: ¿Puedo exportar los resultados de búsqueda?**

**R:** Sí, use el botón "🖨️ Exportar" en los resultados. Disponible en PDF, Excel y CSV.

### 📄 **Documentos**

#### **P: ¿Qué formatos de archivo acepta el sistema?**

**R:**

- **Documentos:** PDF, DOC, DOCX (máximo 10MB)
- **Imágenes:** JPG, PNG, GIF (máximo 5MB)
- **Hojas de cálculo:** XLS, XLSX (máximo 10MB)
- **Otros:** ZIP, RAR (máximo 25MB)

#### **P: ¿Cómo puedo reemplazar un documento?**

**R:**

1. Ir a la sección Documentos del equipo
2. Clic en el documento a reemplazar
3. Seleccionar "Reemplazar archivo"
4. Subir el nuevo archivo
5. El sistema mantendrá un historial de versiones

### 🔧 **Mantenimiento**

#### **P: ¿Puedo modificar una cita de mantenimiento ya programada?**

**R:**

- **Hasta 24 horas antes:** Sí, puede modificar fecha/hora
- **Menos de 24 horas:** Solo el administrador puede hacer cambios
- **Mantenimiento en curso:** No se puede modificar

#### **P: ¿Qué significa cada estado de mantenimiento?**

**R:**

- **Programado:** Cita agendada, equipo disponible
- **En Proceso:** Técnico trabajando en el equipo
- **Suspendido:** Falta repuestos o información
- **Completado:** Mantenimiento finalizado exitosamente
- **Cancelado:** Mantenimiento cancelado (especificar razón)

### 📊 **Reportes**

#### **P: ¿Con qué frecuencia se actualizan los datos del dashboard?**

**R:** Los datos se actualizan cada 15 minutos automáticamente. También puede usar el botón "🔄 Actualizar" para actualización inmediata.

#### **P: ¿Puedo programar reportes automáticos?**

**R:** Sí, en la sección Reportes:

- Configurar frecuencia (diaria, semanal, mensual)
- Seleccionar destinatarios
- Elegir formato de envío
- Definir criterios de filtrado

### 📱 **Compatibilidad y Rendimiento**

#### **P: ¿Funciona en dispositivos móviles?**

**R:** Sí, EVA es responsive y funciona en:

- **Smartphones:** iOS 12+, Android 8+
- **Tablets:** iPad, Android tablets
- **Pantallas:** Adaptable desde 320px hasta 4K

#### **P: ¿Por qué el sistema está lento?**

**R:** Posibles causas:

- Conexión de internet lenta
- Muchas pestañas del navegador abiertas
- Cache del navegador lleno (limpiar cache)
- Horario de mayor uso (10-12 AM, 2-4 PM)

---

## 🛠️ SOLUCIÓN DE PROBLEMAS

### Problemas Comunes y Soluciones

#### **Error: "Sesión Expirada"**

```
🔧 Solución:
1. Cerrar todas las pestañas del navegador
2. Limpiar cache y cookies
3. Reiniciar navegador
4. Ingresar nuevamente al sistema
```

#### **Error: "No se puede subir archivo"**

```
🔧 Solución:
1. Verificar tamaño del archivo (límites por tipo)
2. Verificar formato compatible
3. Intentar con otro navegador
4. Verificar conexión a internet
```

#### **Error: "Código único duplicado"**

```
🔧 Solución:
1. Buscar el código en el sistema
2. Si existe, verificar si es el mismo equipo
3. Si es diferente, usar variante (ej: -A, -B)
4. Contactar administrador si persiste
```

#### **Dashboard no carga datos**

```
🔧 Solución:
1. Actualizar página (F5)
2. Verificar conexión a internet
3. Cerrar y abrir navegador
4. Reportar al administrador si persiste
```

### Códigos de Error del Sistema

| Código  | Descripción            | Acción                     |
| ------- | ---------------------- | -------------------------- |
| EVA-001 | Error de conexión      | Verificar internet         |
| EVA-002 | Sesión expirada        | Iniciar sesión nuevamente  |
| EVA-003 | Permisos insuficientes | Contactar administrador    |
| EVA-004 | Archivo muy grande     | Reducir tamaño de archivo  |
| EVA-005 | Formato no compatible  | Usar formato válido        |
| EVA-006 | Base de datos ocupada  | Reintentar en unos minutos |

### Contacto para Soporte Técnico

#### **Nivel 1 - Soporte Básico**

- **Email:** soporte@evacorp.com
- **Teléfono:** +57 (1) 234-5678
- **Horario:** Lunes a Viernes, 7:00 AM - 7:00 PM
- **Tiempo de Respuesta:** 2-4 horas

#### **Nivel 2 - Soporte Avanzado**

- **Email:** tech-support@evacorp.com
- **Teléfono:** +57 (1) 234-5679
- **Horario:** 24/7 para problemas críticos
- **Tiempo de Respuesta:** 30 minutos (crítico), 1 hora (alto)

#### **Emergencias (Sistema Caído)**

- **Teléfono:** +57 (1) 234-5680
- **WhatsApp:** +57 300 123-4567
- **Disponibilidad:** 24/7/365

---

## 📞 CONTACTO Y SOPORTE

### Equipo de Soporte EVA

#### **Gerente de Producto**

- **Nombre:** Ing. María González
- **Email:** maria.gonzalez@evacorp.com
- **Teléfono:** +57 (1) 234-5681

#### **Soporte Técnico**

- **Líder:** Ing. Carlos Rodríguez
- **Email:** carlos.rodriguez@evacorp.com
- **Teléfono:** +57 (1) 234-5682

#### **Capacitación y Entrenamiento**

- **Coordinadora:** Lic. Ana Martínez
- **Email:** ana.martinez@evacorp.com
- **Teléfono:** +57 (1) 234-5683

### Recursos Adicionales

#### **Centro de Ayuda Online**

```
https://help.evacorp.com
```

- Tutoriales en video
- Guías paso a paso
- Base de conocimientos
- Foro de usuarios

#### **Capacitaciones Disponibles**

- **Webinars semanales:** Martes 3:00 PM
- **Capacitación presencial:** Bajo solicitud
- **Certificación de usuarios:** Trimestral
- **Entrenamiento personalizado:** Para equipos grandes

#### **Actualizaciones del Sistema**

- **Newsletter mensual:** Nuevas funcionalidades
- **Notas de versión:** Cambios técnicos
- **Calendario de mantenimiento:** Ventanas de actualización

---

## 📋 CHECKLIST DE INICIO RÁPIDO

### ✅ Primer Uso del Sistema

- [ ] Verificar URL de acceso
- [ ] Obtener credenciales del administrador
- [ ] Acceder por primera vez
- [ ] Cambiar contraseña por defecto
- [ ] Completar perfil personal
- [ ] Configurar preferencias
- [ ] Explorar menú principal
- [ ] Realizar búsqueda de prueba
- [ ] Registrar equipo de prueba
- [ ] Subir documento de prueba
- [ ] Revisar dashboard
- [ ] Contactar soporte para dudas

### ✅ Uso Diario del Sistema

- [ ] Revisar alertas del dashboard
- [ ] Verificar mantenimientos del día
- [ ] Revisar documentos pendientes
- [ ] Actualizar estados de equipos
- [ ] Responder notificaciones
- [ ] Generar reportes necesarios

---

_Manual de Usuario EVA v1.0_  
_Última actualización: 13 de Agosto, 2025_  
_© 2025 EVA Corp. Todos los derechos reservados_

---

**🏥 Sistema EVA - Equipos y Vidas Aseguradas**  
_"Tecnología al servicio de la salud y la vida"_
