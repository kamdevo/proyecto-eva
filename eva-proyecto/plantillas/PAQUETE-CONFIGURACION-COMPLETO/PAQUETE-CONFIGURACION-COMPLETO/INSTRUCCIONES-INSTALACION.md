# 📦 PAQUETE CONFIGURACIÓN COMPLETO - INSTALACIÓN

## 🎯 CONTENIDO DEL PAQUETE

Este paquete contiene **4 sistemas completos** de configuración hospitalaria:

### 1. 🔧 SERVICIOS (50 servicios)
- Vista principal con tabla responsive
- 4 modales CRUD (Agregar, Editar, Eliminar, Ver)
- Búsqueda y paginación
- Tema azul corporativo

### 2. 👥 CONTACTOS (10 contactos)
- Vista principal con gestión de proveedores
- 4 modales CRUD completos
- Información de contacto detallada
- Diseño responsive

### 3. 🏢 ÁREAS (15 áreas)
- Vista principal con áreas hospitalarias
- 4 modales CRUD + modal de ver
- Gestión completa de áreas
- Tema slate/azul

### 4. 🗺️ ZONAS (8 zonas)
- Vista principal con zonas hospitalarias
- 4 modales CRUD ultra compactos estilo Excel
- Validaciones completas
- Tema azul consistente

## 🚀 INSTALACIÓN PASO A PASO

### 1. Copiar Archivos
```bash
# Copiar las 4 carpetas a tu proyecto React:
# - servicios/
# - contactos/
# - areas/
# - zonas/
```

### 2. Instalar Dependencias
```bash
# Componentes Shadcn/ui
npx shadcn-ui@latest add card button badge table select input label dialog textarea

# Iconos Lucide React
npm install lucide-react
```

### 3. Agregar Rutas en App.jsx
```jsx
// Importaciones
import VistaServiciosPrincipal from "./components/servicios/vista-servicios-principal";
import VistaContactosPrincipal from "./components/contactos/vista-contactos-principal";
import VistaAreasPrincipal from "./components/areas/vista-areas-principal";
import VistaZonasPrincipal from "./components/zonas/vista-zonas-principal";

// Rutas
<Route path="/config/servicios" element={<VistaServiciosPrincipal />} />
<Route path="/config/contactos" element={<VistaContactosPrincipal />} />
<Route path="/config/areas" element={<VistaAreasPrincipal />} />
<Route path="/config/zonas" element={<VistaZonasPrincipal />} />
```

### 4. Actualizar Menú de Navegación
```jsx
// En tu Navbar.jsx, agregar en el submenú de CONFIGURACIÓN:
{
  icon: Settings,
  label: "CONFIGURACIÓN",
  submenu: [
    { label: "SERVICIOS", href: "/config/servicios" },
    { label: "CONTACTOS", href: "/config/contactos" },
    { label: "AREAS", href: "/config/areas" },
    { label: "ZONAS", href: "/config/zonas" },
  ],
}
```

## 📁 ESTRUCTURA DE ARCHIVOS

```
tu-proyecto/
├── src/
│   └── components/
│       ├── servicios/
│       │   ├── vista-servicios-principal.jsx
│       │   └── modals/
│       │       ├── ui-modal-agregar-servicio.jsx
│       │       ├── ui-modal-editar-servicio.jsx
│       │       ├── ui-modal-eliminar-servicio.jsx
│       │       └── ui-modal-ver-servicio.jsx
│       ├── contactos/
│       │   ├── vista-contactos-principal.jsx
│       │   └── modals/
│       │       ├── ui-modal-agregar-contacto.jsx
│       │       ├── ui-modal-editar-contacto.jsx
│       │       ├── ui-modal-eliminar-contacto.jsx
│       │       └── ui-modal-ver-contacto.jsx
│       ├── areas/
│       │   ├── vista-areas-principal.jsx
│       │   └── modals/
│       │       ├── ui-modal-agregar-area.jsx
│       │       ├── ui-modal-editar-area.jsx
│       │       ├── ui-modal-eliminar-area.jsx
│       │       └── ui-modal-ver-area.jsx
│       └── zonas/
│           ├── vista-zonas-principal.jsx
│           └── modals/
│               ├── ui-modal-agregar-zona.jsx
│               ├── ui-modal-editar-zona.jsx
│               ├── ui-modal-eliminar-zona.jsx
│               └── ui-modal-ver-zona.jsx
```

## ✨ CARACTERÍSTICAS INCLUIDAS

### 🎨 Diseño
- ✅ Responsive mobile-first
- ✅ Componentes Shadcn/ui
- ✅ Iconografía Lucide React
- ✅ Tema azul consistente
- ✅ Modales ultra compactos (Zonas estilo Excel)

### 🔧 Funcionalidades
- ✅ 16 modales CRUD completos
- ✅ Validaciones de formularios
- ✅ Estados de loading
- ✅ Confirmaciones de seguridad
- ✅ Búsqueda en tiempo real
- ✅ Paginación completa
- ✅ Datos de ejemplo incluidos

### 📊 Datos Incluidos
- **Servicios**: 50 servicios hospitalarios completos
- **Contactos**: 10 contactos/proveedores con información detallada
- **Áreas**: 15 áreas hospitalarias con jerarquía
- **Zonas**: 8 zonas con jefes y estadísticas

## 🔗 URLs DE ACCESO

Una vez instalado, accede a:
- **Servicios**: `http://localhost:3000/config/servicios`
- **Contactos**: `http://localhost:3000/config/contactos`
- **Áreas**: `http://localhost:3000/config/areas`
- **Zonas**: `http://localhost:3000/config/zonas`

## 🛠️ DEPENDENCIAS REQUERIDAS

```json
{
  "lucide-react": "^0.x.x",
  "@radix-ui/react-dialog": "^1.x.x",
  "@radix-ui/react-select": "^1.x.x",
  "class-variance-authority": "^0.x.x",
  "clsx": "^2.x.x",
  "tailwind-merge": "^2.x.x"
}
```

## 📱 COMPATIBILIDAD

- ✅ Mobile (320px+)
- ✅ Tablet (768px+)
- ✅ Desktop (1024px+)
- ✅ React 18+
- ✅ Next.js 13+
- ✅ Tailwind CSS 3+

## 🎯 PRÓXIMOS PASOS

1. Copiar archivos al proyecto
2. Instalar dependencias
3. Agregar rutas
4. Actualizar navegación
5. ¡Listo para usar!

---
**Desarrollado para Sistema Hospitalario EVA**  
**Versión**: 1.0.0  
**Incluye**: 4 vistas + 16 modales + datos de ejemplo