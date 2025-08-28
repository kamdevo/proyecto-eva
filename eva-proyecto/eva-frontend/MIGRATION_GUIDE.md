# Guía de Migración - Componentes de Tickets EVA

## Resumen

Esta guía describe cómo migrar los componentes prototipo completados a producción, reemplazando los componentes originales con las versiones mejoradas.

## ⚠️ IMPORTANTE - Antes de Migrar

### 1. Backup de Componentes Originales
```bash
# Crear backup de los componentes originales
mkdir -p backup/components/$(date +%Y%m%d)
cp src/components/ClosedTickets.jsx backup/components/$(date +%Y%m%d)/
cp src/components/GestionTickets.jsx backup/components/$(date +%Y%m%d)/
cp src/components/MyTickets.jsx backup/components/$(date +%Y%m%d)/
```

### 2. Validación Previa
- [ ] Probar todos los prototipos en `/prototypes`
- [ ] Verificar conectividad con backend
- [ ] Confirmar que todos los formularios funcionan
- [ ] Validar responsive design en diferentes dispositivos
- [ ] Probar con datos reales si están disponibles

## Proceso de Migración

### Opción 1: Migración Gradual (Recomendada)

#### Paso 1: Mantener Ambas Versiones
Mantener las rutas actuales y las nuevas rutas de prototipo funcionando en paralelo:

```javascript
// En App.jsx - Rutas existentes (mantener)
<Route path="/ordenes/mis-tickets" element={<MyTickets />} />
<Route path="/ordenes/tickets-cerrados" element={<ClosedTickets />} />
<Route path="/ordenes/gestion-tickets" element={<GestionTickets />} />

// Rutas de prototipo (ya implementadas)
<Route path="/prototype/my-tickets" element={<PrototypeMyTickets />} />
<Route path="/prototype/closed-tickets" element={<PrototypeClosedTickets />} />
<Route path="/prototype/gestion-tickets" element={<PrototypeGestionTickets />} />
```

#### Paso 2: Testing en Producción
1. Dirigir a usuarios beta a las rutas `/prototype/*`
2. Recopilar feedback
3. Monitorear errores y performance
4. Ajustar según sea necesario

#### Paso 3: Migración Completa
Una vez validados los prototipos:

```bash
# 1. Backup final
cp src/components/ClosedTickets.jsx backup/ClosedTickets.jsx.backup
cp src/components/GestionTickets.jsx backup/GestionTickets.jsx.backup  
cp src/components/MyTickets.jsx backup/MyTickets.jsx.backup

# 2. Reemplazar componentes
cp "src/components/Prueba tokects/ClosedTickets.jsx" src/components/ClosedTickets.jsx
cp "src/components/Prueba tokects/GestionTickets.jsx" src/components/GestionTickets.jsx
cp "src/components/Prueba tokects/MyTickets.jsx" src/components/MyTickets.jsx

# 3. Limpiar imports en App.jsx (remover imports de prototipos)
```

### Opción 2: Migración Directa

⚠️ **Solo para entornos de desarrollo**

#### Archivos a Reemplazar:

1. **ClosedTickets.jsx**
```bash
# Backup
mv src/components/ClosedTickets.jsx src/components/ClosedTickets.jsx.backup

# Reemplazar
cp "src/components/Prueba tokects/ClosedTickets.jsx" src/components/ClosedTickets.jsx
```

2. **GestionTickets.jsx**
```bash
# Backup  
mv src/components/GestionTickets.jsx src/components/GestionTickets.jsx.backup

# Reemplazar
cp "src/components/Prueba tokects/GestionTickets.jsx" src/components/GestionTickets.jsx
```

3. **MyTickets.jsx**
```bash
# Backup
mv src/components/MyTickets.jsx src/components/MyTickets.jsx.backup

# Reemplazar
cp "src/components/Prueba tokects/MyTickets.jsx" src/components/MyTickets.jsx
```

## Ajustes Post-Migración

### 1. Actualizar Imports
Después de la migración, verificar que no hay imports rotos:

```javascript
// Remover estos imports de App.jsx si se hizo migración directa
import PrototypeClosedTickets from "./components/Prueba tokects/ClosedTickets";
import PrototypeGestionTickets from "./components/Prueba tokects/GestionTickets";
import PrototypeMyTickets from "./components/Prueba tokects/MyTickets";
```

### 2. Verificar Dependencias
Asegurar que todas las dependencias estén instaladas:
```bash
npm install sonner  # Para toast notifications si no está instalado
```

### 3. Configurar Variables de Entorno
Verificar que las variables de entorno del backend estén configuradas:
```env
VITE_API_URL=http://localhost:8001/api
VITE_API_BASE_URL=http://localhost:8001
```

## Testing Post-Migración

### Checklist de Validación

#### ClosedTickets
- [ ] Carga de datos desde backend
- [ ] Filtros funcionan correctamente
- [ ] Modal de documentos se abre
- [ ] Vista responsive funciona
- [ ] Estadísticas se actualizan

#### GestionTickets  
- [ ] Búsqueda en tiempo real
- [ ] Filtros por origen
- [ ] Paginación funciona
- [ ] Modal de órdenes de trabajo
- [ ] Vista móvil correcta

#### MyTickets
- [ ] Formularios se envían correctamente
- [ ] Validación de campos
- [ ] Carga de archivos funciona
- [ ] Selects se populan con datos reales
- [ ] Toast notifications aparecen

### Monitoreo de Errores

Revisar en consola del navegador:
```javascript
// Errores comunes a buscar:
// - 404 en endpoints de API
// - Errores de CORS
// - Componentes no encontrados
// - Props faltantes
```

## Rollback Plan

Si algo sale mal, rollback inmediato:

```bash
# Restaurar componentes originales
cp backup/ClosedTickets.jsx.backup src/components/ClosedTickets.jsx
cp backup/GestionTickets.jsx.backup src/components/GestionTickets.jsx  
cp backup/MyTickets.jsx.backup src/components/MyTickets.jsx

# Reiniciar servidor de desarrollo
npm run dev
```

## Limpieza Post-Migración

Una vez confirmado que todo funciona:

```bash
# Opcional: Limpiar archivos de prototipo
rm -rf "src/components/Prueba tokects/"
rm src/components/PrototypeNavigation.jsx

# Remover rutas de prototipo de App.jsx
# Remover imports no utilizados
```

## Notas Importantes

1. **Backend Dependency**: Los componentes requieren que el backend esté funcionando o usarán datos de fallback
2. **Toast System**: Asegurar que el sistema de toast notifications esté configurado
3. **File Uploads**: Verificar que el backend puede manejar uploads de archivos
4. **Permissions**: Confirmar que los usuarios tienen permisos para las nuevas funcionalidades

## Soporte

En caso de problemas:
1. Revisar logs de consola del navegador
2. Verificar Network tab para peticiones HTTP fallidas
3. Comprobar que el backend responde correctamente
4. Validar que todas las dependencias están instaladas
5. Confirmar configuración de variables de entorno

## Contacto Técnico

Para soporte durante la migración:
- Revisar `PROTOTYPE_INTEGRATION_SUMMARY.md` para detalles técnicos
- Logs detallados disponibles en consola del navegador
- Componentes fuente en `src/components/Prueba tokects/`
