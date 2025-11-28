# 📘 MANUAL DE USUARIO - SISTEMA EVA
## Servicios Ambulatorios - Gestión de Equipos Biomédicos

**Hospital Universitario del Valle "Evaristo García"**  
**Departamento de Bioingeniería Clínica**  
**Versión 1.0 - Noviembre 2025**

---

## 📋 Tabla de Contenido

1. [Introducción](#introducción)
2. [Acceso al Sistema](#acceso-al-sistema)
3. [Gestión de Equipos](#gestión-de-equipos)
4. [Mantenimientos](#mantenimientos)
5. [Reportes de Fallas](#reportes-de-fallas)
6. [Consultas y Búsquedas](#consultas-y-búsquedas)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 Introducción

### ¿Qué es el Sistema EVA?

EVA (Equipos y Vidas Aseguradas) es el sistema de gestión integral de equipos biomédicos del Hospital Universitario del Valle. Permite al personal de Servicios Ambulatorios:

- ✅ Consultar información de equipos médicos
- ✅ Reportar fallas y averías
- ✅ Programar mantenimientos
- ✅ Visualizar hojas de vida de equipos
- ✅ Generar reportes

### Usuarios del Sistema

Este manual está dirigido a:
- 👨‍⚕️ Personal médico de Servicios Ambulatorios
- 👩‍⚕️ Personal de enfermería
- 🏥 Coordinadores de servicio
- 📋 Administrativos de área

---

## 🔐 Acceso al Sistema

### Ingreso al Sistema

1. **Abrir el navegador web** (Chrome, Edge o Firefox)
2. **Ingresar la URL:** `http://[dirección-del-servidor]/eva`
3. **Pantalla de inicio de sesión:**

   ![Login](Captura del login si existe)

4. **Ingresar credenciales:**
   - **Usuario:** Su número de cédula o usuario asignado
   - **Contraseña:** Proporcionada por el Dpto. de Bioingeniería

5. **Hacer clic en** "Iniciar Sesión"

### ⚠️ Problemas de Acceso

Si no puede ingresar:
- Verifique que su usuario y contraseña sean correctos
- Contacte a Bioingeniería al ext. **[extensión]**
- Email: bioingenieria@huv.gov.co

---

## 🏥 Gestión de Equipos

### Ver Equipos del Servicio

#### Acceso a Equipos Biomédicos

1. En el menú principal, clic en **"Equipos"**
2. Seleccionar **"Equipos Biomédicos"**
3. Se mostrará el listado de equipos

#### Filtros Disponibles

Puede filtrar equipos por:
- 📍 **Ubicación:** Consultorio, sala específica
- 🏷️ **Estado:** Operativo, en mantenimiento, fuera de servicio
- 🔍 **Búsqueda:** Código, nombre o marca del equipo

**Ejemplo:** Para ver solo equipos operativos en Consultorio 3:
1. Clic en filtro "Ubicación" → Seleccionar "Consultorio 3"
2. Clic en filtro "Estado" → Seleccionar "Operativo"
3. Clic en "Aplicar filtros"

### Consultar Hoja de Vida de un Equipo

#### Información del Equipo

1. **Localizar el equipo** en el listado
2. **Hacer clic en el ícono** 👁️ (ojo) en la columna "Acciones"
3. **Se abrirá una ventana** con la información completa:

**Información General:**
- Código institucional
- Nombre del equipo
- Marca y modelo
- Número de serie
- Estado actual
- Ubicación precisa

**Especificaciones Técnicas:**
- Voltaje
- Frecuencia
- Potencia
- Clase de equipo
- Clasificación de riesgo
- Tecnología biomédica

**Historial:**
- Fecha de adquisición
- Mantenimientos realizados
- Calibraciones
- Reparaciones

#### Exportar Hoja de Vida

1. Desde la ventana de detalles del equipo
2. Clic en **"Descargar PDF"** 📄
3. El archivo se descargará con formato:
   `Equipo_[Código]_HojaVida.pdf`

---

## 🔧 Mantenimientos

### Tipos de Mantenimiento

#### Mantenimiento Preventivo
- ⏰ Programado según cronograma
- 🔄 Periódico (mensual, trimestral, semestral, anual)
- ✅ Evita fallas futuras

#### Mantenimiento Correctivo
- 🚨 Por falla o avería del equipo
- ⚡ Urgente cuando afecta la operación
- 🛠️ Reparación de componentes

### Ver Programación de Mantenimientos

1. Menú **"Mantenimientos"** → **"Programación"**
2. **Vista de calendario** con mantenimientos próximos
3. **Filtrar por:**
   - Fecha
   - Equipo
   - Tipo de mantenimiento
   - Estado

### Solicitar Mantenimiento Correctivo

#### Cuando un equipo presenta falla:

1. **Menú "Mantenimientos"** → **"Solicitar Mantenimiento"**

2. **Llenar el formulario:**
   - **Equipo:** Seleccionar de la lista o buscar por código
   - **Tipo:** Mantenimiento Correctivo
   - **Prioridad:** 
     - 🔴 Alta (equipo crítico, afecta operación)
     - 🟡 Media (puede esperar)
     - 🟢 Baja (no afecta operación)
   - **Descripción de la falla:** Sea lo más específico posible

3. **Adjuntar evidencias** (opcional):
   - Fotos de la falla
   - Mensajes de error
   - Documentos relacionados

4. **Clic en** "Enviar Solicitud"

5. **Confirmación:** Recibirá un número de ticket

**Ejemplo de descripción:**
> ❌ Mal: "El equipo no funciona"
> ✅ Bien: "Monitor de signos vitales no enciende. Luz indicadora no se activa. Verificado cable de poder conectado. Última vez funcionó: 25/11/2025"

### Seguimiento de Solicitudes

#### Ver estado de sus solicitudes:

1. **Menú "Mantenimientos"** → **"Mis Solicitudes"**
2. **Verá el listado con:**
   - 🎫 Número de ticket
   - 📅 Fecha de solicitud
   - 🏥 Equipo solicitado
   - 📊 Estado actual:
     - 🔵 **Recibida:** Solicitud registrada
     - 🟡 **En proceso:** Técnico asignado
     - 🟢 **Completada:** Mantenimiento finalizado
     - 🔴 **Pendiente de repuesto:** Esperando pieza

3. **Hacer clic en un ticket** para ver detalles completos

---

## 🚨 Reportes de Fallas

### Reportar Falla Rápida

Si un equipo presenta falla inmediata:

1. **Menú principal** → **Botón rojo "Reportar Falla"** 🆘

2. **Formulario rápido:**
   - Ubicación del equipo
   - Código o nombre del equipo
   - Descripción breve
   - Nivel de urgencia

3. **Enviar:** La solicitud llegará inmediatamente a Bioingeniería

### Contingencias

#### ¿Qué es una contingencia?
Situación donde la falla del equipo afecta directamente la atención de pacientes.

#### Reportar Contingencia:

1. **Menú "Contingencias"** → **"Nueva Contingencia"**

2. **Información requerida:**
   - Equipo afectado
   - Descripción del impacto
   - Pacientes afectados
   - Alternativas disponibles
   - Prioridad crítica

3. **Seguimiento prioritario:** El personal de Bioingeniería atenderá en máximo 2 horas

---

## 🔍 Consultas y Búsquedas

### Búsqueda Rápida de Equipos

En la barra superior del sistema:

1. **Clic en el ícono de búsqueda** 🔍
2. **Escribir:**
   - Código del equipo (ej: "BIO-2024-001")
   - Nombre (ej: "Electrocardiografo")
   - Marca (ej: "Philips")
3. **Presionar Enter**

### Búsqueda Avanzada

1. **Menú "Equipos"** → **"Búsqueda Avanzada"**

2. **Filtros múltiples:**
   - Servicio
   - Área específica
   - Rango de fechas de adquisición
   - Estado del equipo
   - Tecnología
   - Clasificación de riesgo

3. **Clic en "Buscar"**

4. **Exportar resultados:**
   - 📊 Excel
   - 📄 PDF
   - 📋 CSV

### Consultar Manuales de Usuario

1. **Menú "Equipos"** → **"Manuales"**
2. **Buscar por:**
   - Nombre del equipo
   - Marca
   - Modelo
3. **Descargar manual en PDF**

---

## 📊 Reportes

### Reportes Disponibles

#### Para Personal de Servicios Ambulatorios:

1. **Reporte de Equipos del Servicio**
   - Listado completo de equipos asignados
   - Incluye estado y ubicación

2. **Reporte de Mantenimientos Realizados**
   - Mantenimientos del mes/trimestre/año
   - Por equipo o por servicio

3. **Reporte de Fallas**
   - Fallas reportadas
   - Tiempo de respuesta
   - Estado de resolución

### Generar Reporte

1. **Menú "Reportes"**
2. **Seleccionar tipo de reporte**
3. **Configurar parámetros:**
   - Rango de fechas
   - Filtros específicos
4. **Elegir formato:** Excel o PDF
5. **Clic en "Generar"**
6. **Descargar:** El reporte se descargará automáticamente

---

## ❓ Preguntas Frecuentes

### Sobre el Sistema

**P: ¿Puedo acceder al sistema desde mi celular?**  
R: Sí, el sistema es responsive y funciona en dispositivos móviles.

**P: ¿Necesito instalar algún programa?**  
R: No, solo necesita un navegador web actualizado.

**P: ¿Puedo ver equipos de otros servicios?**  
R: Solo puede ver equipos de su servicio asignado por seguridad.

### Sobre Equipos

**P: ¿Qué hago si no encuentro un equipo en el sistema?**  
R: Contacte a Bioingeniería para verificar el código o registrar el equipo.

**P: ¿Cómo sé cuándo le toca mantenimiento a un equipo?**  
R: En la hoja de vida del equipo, sección "Próximo mantenimiento".

**P: ¿Puedo mover un equipo a otra ubicación?**  
R: Debe notificar a Bioingeniería para actualizar la ubicación en el sistema.

### Sobre Mantenimientos

**P: ¿Cuánto tiempo toma atender una solicitud de mantenimiento?**  
R: 
- 🔴 Alta prioridad: 24-48 horas
- 🟡 Media prioridad: 3-5 días
- 🟢 Baja prioridad: 7-10 días

**P: ¿Puedo cancelar una solicitud?**  
R: Sí, desde "Mis Solicitudes" → Seleccionar ticket → "Cancelar"

**P: ¿El equipo se puede usar durante el mantenimiento preventivo?**  
R: No, el equipo debe estar desocupado durante el mantenimiento.

### Sobre Reportes de Fallas

**P: ¿Qué información debo incluir al reportar una falla?**  
R: 
- Descripción clara del problema
- Cuándo ocurrió
- Si el equipo muestra códigos de error
- Fotos si es posible

**P: ¿Quién atiende las fallas reportadas?**  
R: El equipo técnico de Bioingeniería asignará un técnico según la prioridad.

**P: ¿Puedo reportar una falla por teléfono?**  
R: Sí, pero debe registrarla también en el sistema para trazabilidad.

---

## 📞 Contacto y Soporte

### Departamento de Bioingeniería Clínica

**📧 Email:** bioingenieria@huv.gov.co  
**📱 Extensión:** [Número de extensión]  
**🏥 Ubicación:** [Ubicación física en el hospital]

**Horario de Atención:**
- Lunes a Viernes: 7:00 AM - 5:00 PM
- Sábados: 8:00 AM - 12:00 PM
- Emergencias 24/7: [Número de emergencia]

### Soporte Técnico del Sistema

Para problemas con el sistema EVA:

**📧 Email:** soporte.eva@huv.gov.co  
**📱 Ext:** [Extensión de soporte]

---

## 📝 Notas Importantes

### Seguridad y Confidencialidad

⚠️ **IMPORTANTE:**
- No comparta su usuario y contraseña
- Cierre sesión al terminar
- La información del sistema es confidencial
- Uso exclusivo para labores institucionales

### Responsabilidades del Usuario

✅ **Debe:**
- Mantener su información de contacto actualizada
- Reportar fallas oportunamente
- Usar el sistema de manera responsable
- Seguir los procedimientos establecidos

❌ **No debe:**
- Intentar acceder a información no autorizada
- Modificar datos sin autorización
- Usar el sistema para fines personales

---

## 🔄 Actualizaciones del Manual

**Versión 1.0 - Noviembre 2025**
- Versión inicial del manual

Para sugerencias o correcciones a este manual:  
📧 bioingenieria@huv.gov.co

---

**🏥 Hospital Universitario del Valle "Evaristo García"**  
**Sistema EVA - Equipos y Vidas Aseguradas**  
*"Gestión eficiente para una atención de calidad"*

---

## 📚 Glosario de Términos

- **Bioingeniería:** Departamento encargado del mantenimiento de equipos médicos
- **Contingencia:** Situación crítica que afecta la operación del servicio
- **Hoja de Vida:** Documento con toda la información histórica del equipo
- **Mantenimiento Correctivo:** Reparación por falla
- **Mantenimiento Preventivo:** Mantenimiento programado
- **Ticket:** Número de identificación de una solicitud
- **EVA:** Equipos y Vidas Aseguradas (nombre del sistema)

---

*Fin del Manual de Usuario*
