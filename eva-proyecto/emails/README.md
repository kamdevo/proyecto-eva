# 📧 EVA Email Templates - React Email

Sistema de plantillas de correo para el Hospital Universitario del Valle usando React Email.

## 🎨 **Diseño Institucional**

Todos los correos incluyen:
- **Header azul** (#70bbd9) - Logo del Hospital Universitario del Valle
- **Subtítulo** "Eva Gestiona la tecnología" 
- **Cuerpo blanco** con información organizada
- **Footer rojo** (#ee4c50) - Copyright y redes sociales
- **Tipografía Arial** - Profesional y legible

## 📁 **Estructura de Archivos**

```
eva-frontend/emails/
├── repuesto-pendiente.jsx   # Email de repuesto pendiente
├── nuevo-ticket.jsx         # Email de nuevo ticket  
├── test-email.jsx          # Email de prueba
└── README.md               # Esta documentación
```

## 🚀 **Configuración**

Las dependencias ya están instaladas en el `package.json` del frontend:
- ✅ `@react-email/components` - Componentes para emails
- ✅ `react-email` - Herramientas de desarrollo
- ✅ `react` y `react-dom` - Runtime de React

La configuración JSX está en `jsconfig.json` del frontend.

## 📧 **Plantillas Disponibles**

### 1. **Repuesto Pendiente** (`repuesto-pendiente.jsx`)
- Asunto: "Notificación de repuesto pendiente. ID preventivo: [ID]"
- Información del preventivo, equipo y repuesto faltante
- Observaciones condicionales

### 2. **Nuevo Ticket** (`nuevo-ticket.jsx`)  
- Asunto: "Creación de Ticket Nro [ID]"
- Información del ticket, equipo y solicitante
- Prioridad con colores (ALTA/MEDIA/BAJA)

### 3. **Email de Prueba** (`test-email.jsx`)
- Asunto: "Prueba Sistema EVA - Hospital Universitario del Valle"
- Información del sistema y características del diseño

## 🔧 **Uso desde PHP (Backend)**

El servicio `ReactEmailService` maneja el renderizado:

```php
use App\Services\ReactEmailService;

$reactEmailService = new ReactEmailService();

```bash
php test-react-email.php  # Prueba todas las plantillas
```

#### **Exportar emails:**
```bash
cd eva-frontend
npm run email:export  # Exporta todos los emails a HTML
```

### Probar desde PHP:
```bash
# En la raíz del proyecto
```

Este script genera archivos HTML que puedes abrir en el navegador.

## 📊 **Datos de Entrada**

### Repuesto Pendiente:
```json
{
  "preventivo": {
    "id": 123,
    "fecha_mantenimiento": "2024-10-03 15:30:00",
    "observacion": "Equipo requiere calibración",
    "servicio_nombre": "RADIOLOGÍA", 
    "area_nombre": "Diagnóstico por Imágenes",
    "equipo_id": 456,
    "equipo_nombre": "Rayos X Portátil",
    "equipo_marca": "Siemens",
    "equipo_modelo": "MobileDiagnost wDR",
    "equipo_codigo": "RX-001-HUV",
    "equipo_serie": "SN123456789"
  }
}
```

### Nuevo Ticket:
```json
{
  "ticket": {
    "id": 789,
    "descripcion": "Falla en sistema de refrigeración",
    "fecha_inicio": "2024-10-03 14:15:00",
    "prioridad": 3,
    "servicio_nombre": "RADIOLOGÍA",
    "area_nombre": "Resonancia Magnética", 
    "equipo_id": 789,
    "equipo_nombre": "Resonancia Magnética 1.5T",
    "equipo_marca": "General Electric",
    "equipo_modelo": "Signa HDxt",
    "equipo_codigo": "RM-002-HUV", 
    "equipo_serie": "GE987654321",
    "reportante_nombre": "Dr. Juan Carlos Pérez"
  }
}
```

## 🎨 **Personalización**

### Colores Institucionales:
```typescript
const colors = {
  headerBlue: '#70bbd9',    // Header azul
  subtitleBlue: '#5aa9c9',  // Subtítulo azul oscuro  
  footerRed: '#ee4c50',     // Footer rojo
  warningYellow: '#ffc107', // Alertas amarillas
  successGreen: '#4caf50'   // Confirmaciones verdes
};
```

### Tipografía:
- **Fuente:** Arial, sans-serif
- **Tamaños:** 12px-24px según jerarquía
- **Responsive:** Compatible con todos los clientes

## 🔄 **Fallback System**

Si React Email falla, el sistema automáticamente usa las plantillas Blade como respaldo:
- `resources/views/emails/repuesto-pendiente.blade.php`
- `resources/views/emails/nuevo-ticket.blade.php`

## 📱 **Compatibilidad**

✅ **Clientes de correo soportados:**
- Gmail (web y móvil)
- Outlook (web y desktop)
- Apple Mail (iOS y macOS)
- Thunderbird
- Yahoo Mail
- Otros clientes modernos

## 🚀 **Desarrollo**

### Iniciar servidor de desarrollo:
```bash
cd eva-frontend/emails
npm run dev
```

### Exportar HTML estático:
```bash
npm run export
```

## 📝 **Notas Técnicas**

- **React Email** renderiza componentes React a HTML compatible con email
- **TypeScript** para tipado seguro
- **Fallback automático** a Blade si React Email falla
- **Datos estructurados** desde la base de datos real
- **Responsive design** con max-width: 600px

---

**🏥 Hospital Universitario del Valle "Evaristo García"**  
**⚡ Sistema EVA - Gestión Tecnológica**
