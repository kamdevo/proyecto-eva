# 🎫 Sistema de Tickets EVA - Versión Independiente

Una aplicación completa de gestión de tickets para equipos médicos e industriales, desarrollada con React y Tailwind CSS.

## 🚀 Características

### ✅ Funcionalidades Implementadas

- **Dashboard Completo**: Estadísticas, métricas y gráficos en tiempo real
- **Gestión de Tickets**: Crear, editar, asignar y resolver tickets
- **Filtros Avanzados**: Búsqueda por múltiples criterios
- **Estados de Tickets**: Abierto, En Proceso, Pendiente, Resuelto, Cerrado
- **Prioridades**: Baja, Media, Alta, Urgente
- **Categorías**: Soporte Técnico, Mantenimiento, Calibración, Capacitación
- **Comentarios**: Sistema de comentarios y seguimiento
- **Historial**: Registro completo de cambios
- **Archivos Adjuntos**: Soporte para documentos e imágenes
- **Interfaz Responsive**: Optimizada para móviles y escritorio

### 🎨 Componentes Principales

1. **Dashboard** (`/`) - Página principal con estadísticas
2. **Lista de Tickets** (`/tickets`) - Vista completa con filtros
3. **Crear Ticket** (`/create`) - Formulario multi-paso
4. **Detalle de Ticket** (`/tickets/:id`) - Vista detallada con comentarios

## 🛠️ Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación
- **Lucide React** - Iconos
- **Class Variance Authority** - Gestión de variantes de componentes

## 📦 Instalación

1. **Clonar el repositorio**:
```bash
cd eva-proyecto/tickets-standalone
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Iniciar servidor de desarrollo**:
```bash
npm run dev
```

4. **Abrir en el navegador**:
```
http://localhost:3001
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa de build

# Testing
npm run test         # Ejecuta pruebas
npm run test:ui      # Interfaz de pruebas
npm run test:coverage # Cobertura de pruebas
```

## 📁 Estructura del Proyecto

```
tickets-standalone/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   └── badge.jsx
│   │   ├── TicketDashboard.jsx
│   │   ├── TicketList.jsx
│   │   ├── CreateTicket.jsx
│   │   └── TicketDetail.jsx
│   ├── lib/
│   │   └── utils.js         # Utilidades
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   └── index.css            # Estilos globales
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🎨 Componentes UI

### Button
```jsx
import { Button } from './components/ui/button'

<Button variant="default">Botón</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructivo</Button>
```

### Card
```jsx
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    Contenido
  </CardContent>
</Card>
```

### Badge
```jsx
import { Badge } from './components/ui/badge'

<Badge variant="default">Default</Badge>
<Badge variant="destructive">Urgente</Badge>
<Badge variant="secondary">Resuelto</Badge>
```

## 📊 Datos Mock

La aplicación utiliza datos simulados para demostración:

- **6 tickets de ejemplo** con diferentes estados y prioridades
- **Estadísticas simuladas** para el dashboard
- **Comentarios e historial** de ejemplo
- **Categorías predefinidas** (Soporte Técnico, Mantenimiento, etc.)

## 🔧 Personalización

### Colores y Temas
Los colores se definen en `src/index.css` usando variables CSS:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --destructive: 0 84.2% 60.2%;
  --secondary: 210 40% 96%;
  /* ... más variables */
}
```

### Componentes
Todos los componentes están en `src/components/` y pueden ser modificados fácilmente.

### Rutas
Las rutas se definen en `src/App.jsx`:

```jsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/tickets" element={<TicketList />} />
  <Route path="/create" element={<CreateTicket />} />
  <Route path="/tickets/:id" element={<TicketDetail />} />
</Routes>
```

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

### Despliegue en Netlify/Vercel
1. Conectar repositorio
2. Configurar build command: `npm run build`
3. Configurar publish directory: `dist`

## 🧪 Testing

La aplicación incluye configuración para testing con Vitest:

```bash
# Ejecutar pruebas
npm run test

# Modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

## 📝 Próximas Características

- [ ] Integración con API real
- [ ] Autenticación de usuarios
- [ ] Notificaciones en tiempo real
- [ ] Exportación de reportes
- [ ] Modo oscuro
- [ ] Internacionalización (i18n)
- [ ] PWA (Progressive Web App)

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

Desarrollado para el Sistema EVA - Gestión de Equipos Médicos e Industriales.

---

## 🎯 Demo en Vivo

Una vez iniciado el servidor de desarrollo, puedes:

1. **Explorar el Dashboard** - Ver estadísticas y métricas
2. **Navegar por los Tickets** - Filtrar y buscar tickets
3. **Crear un Nuevo Ticket** - Proceso paso a paso
4. **Ver Detalles** - Comentarios e historial completo

¡Disfruta explorando el Sistema de Tickets EVA! 🎉
