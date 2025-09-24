# 🚀 Guía de Instalación - Sistema de Contactos

## 📋 Requisitos Previos

### 1. Dependencias de Shadcn/ui
```bash
# Instalar componentes necesarios
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog
```

### 2. Iconos Lucide
```bash
npm install lucide-react
```

## 📁 Estructura de Instalación

### Opción 1: Integración directa
```
src/
├── components/
│   ├── contactos/
│   │   └── vista-contactos-principal.jsx    # Copiar aquí
│   └── ui/                                  # Componentes Shadcn/ui
```

### Opción 2: Como módulo independiente
```
src/
├── modules/
│   └── contactos-completo/                  # Copiar toda la carpeta
└── components/
    └── ui/                                  # Componentes Shadcn/ui
```

## 🔧 Configuración

### 1. Configurar rutas en App.jsx
```jsx
import ContactsView from './components/contactos/vista-contactos-principal';
// o
import ContactsView from './modules/contactos-completo/vista-contactos-principal';

// En tu router
<Route path="/config/contactos" element={<ContactsView />} />
```

### 2. Verificar alias de importación
Asegúrate de que tu `vite.config.js` tenga configurado el alias `@`:

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

### 3. Verificar Tailwind CSS
El sistema usa clases de Tailwind CSS. Asegúrate de tenerlo configurado:

```js
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## ✅ Verificación de Instalación

### 1. Comprobar imports
Todos los componentes deben importar correctamente:
- ✅ Button, Card, Input, Label, Select
- ✅ Table, Badge, Dialog, AlertDialog
- ✅ Iconos de Lucide React

### 2. Probar funcionalidades básicas
- ✅ La tabla se renderiza con 10 contactos
- ✅ El botón "Agregar Contacto" abre el modal
- ✅ Los botones de editar cargan los datos en el modal
- ✅ Los botones de eliminar muestran confirmación
- ✅ La paginación se muestra correctamente

### 3. Verificar responsividad
- ✅ **Mobile (320px)**: Controles apilados verticalmente
- ✅ **Tablet (768px)**: Layout híbrido
- ✅ **Desktop (1024px+)**: Experiencia completa

## 🐛 Solución de Problemas

### Error: "Cannot resolve module @/components/ui/..."
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
npx tailwindcss init -p
```

### Error: Alias @ no funciona
Verificar configuración en `vite.config.js`:
```js
resolve: {
  alias: {
    "@": path.resolve(__dirname, "./src"),
  },
}
```

### Error: Modal no se abre
Verificar que el estado `isModalOpen` se maneje correctamente y que Dialog esté importado.

## 🎯 Prueba Rápida

Después de la instalación, visita `/config/contactos` y deberías ver:

1. **Header azul** con título "Contactos y proveedores"
2. **Botón azul** "Agregar Contacto" que abre modal
3. **Tabla** con 10 contactos de ejemplo
4. **Botones de acción** (editar/eliminar) en cada fila
5. **Paginación** en la parte inferior
6. **Búsqueda** funcional (estructura preparada)

## 📱 Pruebas de Responsividad

### Mobile (320px - 640px)
- [ ] Controles apilados verticalmente
- [ ] Tabla con scroll horizontal
- [ ] Botones de paginación simplificados
- [ ] Modal ocupa toda la pantalla

### Tablet (640px - 1024px)
- [ ] Layout híbrido con mejor distribución
- [ ] Algunos controles en fila
- [ ] Más botones de paginación visibles

### Desktop (1024px+)
- [ ] Experiencia completa
- [ ] Todos los controles visibles
- [ ] Tabla sin scroll horizontal
- [ ] Paginación completa con texto

## 🔄 Personalización

### Cambiar colores de tipos
Edita la función `getTypeColor` en el archivo:
```jsx
const getTypeColor = (tipo) => {
  switch (tipo) {
    case "PROVEEDOR":
      return "bg-blue-100 text-blue-800";    // Cambiar aquí
    case "FABRICANTE":
      return "bg-green-100 text-green-800";  // Cambiar aquí
    case "REPRESENTANTE":
      return "bg-purple-100 text-purple-800"; // Cambiar aquí
  }
};
```

### Agregar nuevos campos
1. Actualizar `formData` state
2. Agregar campos en el modal
3. Actualizar la tabla si es necesario

### Conectar con API
Reemplazar los `console.log` en:
- `handleSubmit` - Para crear/actualizar
- `confirmDelete` - Para eliminar

## 📞 Soporte

Si encuentras problemas:
1. Verifica que todas las dependencias estén instaladas
2. Comprueba las rutas de importación
3. Revisa la consola del navegador para errores específicos
4. Asegúrate de que Tailwind CSS esté configurado correctamente
5. Verifica que el alias `@` esté funcionando