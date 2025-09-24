# 🚀 Guía de Instalación - Sistema de Servicios

## 📋 Requisitos Previos

### 1. Dependencias de Shadcn/ui
```bash
# Instalar componentes necesarios
npx shadcn-ui@latest add card
npx shadcn-ui@latest add button
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add table
npx shadcn-ui@latest add select
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add textarea
```

### 2. Iconos Lucide
```bash
npm install lucide-react
```

## 📁 Estructura de Instalación

### Opción 1: Copiar a tu proyecto
```
src/
├── components/
│   ├── servicios/                    # Crear esta carpeta
│   │   ├── vista-servicios-principal.jsx
│   │   └── modals/
│   │       ├── ui-modal-agregar-servicio.jsx
│   │       ├── ui-modal-editar-servicio.jsx
│   │       ├── ui-modal-eliminar-servicio.jsx
│   │       ├── ui-modal-ver-servicio.jsx
│   │       ├── ui-modal-crear-zona.jsx
│   │       ├── ui-modal-crear-sede.jsx
│   │       └── ui-modal-crear-area.jsx
│   └── ui/                          # Componentes Shadcn/ui
```

### Opción 2: Como módulo independiente
```
src/
├── modules/
│   └── servicios-completo/          # Copiar toda la carpeta aquí
└── components/
    └── ui/                          # Componentes Shadcn/ui
```

## 🔧 Configuración

### 1. Actualizar imports (si es necesario)
Si cambias la ubicación, actualiza las rutas de importación en `vista-servicios-principal.jsx`:

```jsx
// Cambiar de:
import UIModalAgregarServicio from "./modals/ui-modal-agregar-servicio";

// A tu nueva ruta:
import UIModalAgregarServicio from "../modals/ui-modal-agregar-servicio";
```

### 2. Configurar rutas en tu App.jsx
```jsx
import VistaServiciosPrincipal from './components/servicios/vista-servicios-principal';

// En tu router
<Route path="/servicios" element={<VistaServiciosPrincipal />} />
```

### 3. Verificar alias de importación
Asegúrate de que tu `vite.config.js` o `tsconfig.json` tenga configurado el alias `@`:

```js
// vite.config.js
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

## ✅ Verificación de Instalación

### 1. Comprobar imports
Todos los archivos deben importar correctamente sin errores.

### 2. Probar funcionalidades
- ✅ Tabla se renderiza con 50 servicios
- ✅ Paginación funciona
- ✅ Búsqueda filtra resultados
- ✅ Botones abren modales
- ✅ Formularios se envían sin errores

### 3. Verificar estilos
- ✅ Colores de botones correctos
- ✅ Tabla responsiva
- ✅ Modales se centran correctamente

## 🐛 Solución de Problemas

### Error: "Cannot resolve module"
```bash
# Verificar que Shadcn/ui esté instalado
npx shadcn-ui@latest add [component-name]
```

### Error: "lucide-react not found"
```bash
npm install lucide-react
```

### Error: Estilos no se aplican
```bash
# Verificar Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
```

### Error: Alias @ no funciona
Verificar configuración en `vite.config.js` o `tsconfig.json`

## 🎯 Prueba Rápida

Después de la instalación, visita `/servicios` en tu aplicación y deberías ver:

1. **Header azul** con título "Services"
2. **4 botones** de colores (Agregar, Crear Zona, Crear Sede, Crear Área)
3. **Tabla** con 50 servicios hospitalarios
4. **3 botones de acción** por fila (Ver, Editar, Eliminar)
5. **Paginación** en la parte inferior

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias estén instaladas
2. Comprueba las rutas de importación
3. Revisa la consola del navegador para errores específicos
4. Asegúrate de que Tailwind CSS esté configurado correctamente