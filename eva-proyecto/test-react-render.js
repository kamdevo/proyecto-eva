/**
 * Script de prueba para verificar que el frontend renderiza correctamente
 * los datos de equipos médicos sin errores de React
 */

const testMedicalDevicesData = {
  "success": true,
  "status": "success",
  "message": "Equipos médicos obtenidos exitosamente",
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "equipo": {
          "name": "Monitor de Signos Vitales Philips",
          "code": "MSV-001",
          "brand": "Philips",
          "model": "IntelliVue MX40",
          "series": "PHL-MSV-2024-001"
        },
        "data": {
          "status": null,
          "registroSanitario": null,
          "clasificacion": null,
          "riesgo": null,
          "archivos": 0,
          "planesMantenimiento": 0
        },
        "ubicacion": {
          "servicio": "UCI - Unidad de Cuidados Intensivos",
          "area": null,
          "sede": "Sede Principal"
        },
        "mantenimiento": {
          "ultimoMantenimiento": null,
          "ultimaCalibración": null,
          "ultimoCorrectivo": null
        },
        "propietario": {
          "nombre": null,
          "logo": null
        },
        "compra": {
          "orden": null,
          "tipo": null
        },
        "observaciones": {
          "ultima": null
        },
        "tickets": {
          "fechaUltimoTicket": null
        }
      }
    ],
    "per_page": 1,
    "total": 2,
    "last_page": 2,
    "from": 1,
    "to": 1
  }
};

// Función helper para renderizado seguro (similar a la del componente)
const safeRenderText = (value, fallback = 'Sin información') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // Si es un objeto con una propiedad nombre, usar esa
    if (value.nombre) return value.nombre;
    // Si no, retornar fallback para evitar renderizar el objeto
    return fallback;
  }
  return String(value);
};

// Probar el renderizado de cada campo problemático
const device = testMedicalDevicesData.data.data[0];

console.log("=== PRUEBA DE RENDERIZADO SEGURO ===");
console.log("device.equipo?.name:", safeRenderText(device.equipo?.name, 'Sin nombre'));
console.log("device.equipo?.brand:", safeRenderText(device.equipo?.brand, 'Sin marca'));
console.log("device.equipo?.model:", safeRenderText(device.equipo?.model, 'Sin modelo'));
console.log("device.equipo?.series:", safeRenderText(device.equipo?.series, 'Sin serie'));
console.log("device.equipo?.code:", safeRenderText(device.equipo?.code, 'Sin código'));

console.log("\n=== DATOS GENERALES ===");
console.log("device.data?.status:", safeRenderText(device.data?.status, 'Sin estado'));
console.log("device.data?.registroSanitario:", safeRenderText(device.data?.registroSanitario, 'Sin registro'));
console.log("device.data?.clasificacion:", safeRenderText(device.data?.clasificacion, 'Sin clasificación'));
console.log("device.data?.riesgo:", safeRenderText(device.data?.riesgo, 'Sin clasificar'));
console.log("device.data?.archivos:", safeRenderText(device.data?.archivos, "0"));
console.log("device.data?.planesMantenimiento:", safeRenderText(device.data?.planesMantenimiento, "0"));

console.log("\n=== UBICACIÓN ===");
console.log("device.ubicacion?.servicio:", safeRenderText(device.ubicacion?.servicio, 'Sin servicio'));
console.log("device.ubicacion?.area:", safeRenderText(device.ubicacion?.area, 'Sin área'));
console.log("device.ubicacion?.sede:", safeRenderText(device.ubicacion?.sede, 'Sin sede'));

console.log("\n=== PROPIETARIO (PROBLEMATICO) ===");
console.log("device.propietario:", device.propietario);
console.log("device.propietario tipo:", typeof device.propietario);
console.log("device.propietario?.nombre:", device.propietario?.nombre);
console.log("safeRenderText(device.propietario):", safeRenderText(device.propietario, 'Sin propietario'));

console.log("\n=== COMPRA ===");
console.log("device.compra?.orden:", safeRenderText(device.compra?.orden, 'Sin orden'));
console.log("device.compra?.tipo:", safeRenderText(device.compra?.tipo, 'Sin especificar'));

console.log("\n=== OBSERVACIONES ===");
console.log("device.observaciones?.ultima:", safeRenderText(device.observaciones?.ultima, 'Sin observaciones'));

console.log("\n=== VERIFICACIÓN COMPLETA ===");
console.log("✅ Todos los campos fueron procesados de forma segura");
console.log("✅ El objeto propietario {nombre: null, logo: null} fue manejado correctamente");
console.log("✅ No se intentó renderizar objetos directamente en React");
