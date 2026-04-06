const fs = require('fs');
const origin = 'src/components/modals/add-equipment-modal.jsx';
const dest = 'src/components/modals/copy-equipment-modal.jsx';

try {
  let content = fs.readFileSync(origin, 'utf-8');

  // Renombrar la funcion
  content = content.replace('export function AddEquipmentModal', 'export function CopyEquipmentModal');

  // Asegurar que usa las props correctas para una copia
  content = content.replace(
    /equipmentType = "biomedical",/g,
    'equipmentType = "biomedical",\n  equipment,'
  );

  // Reemplazar titulos estéticos para que se sepa que es una copia
  content = content.replace(/NUEVO EQUIPO/g, 'COPIA DE EQUIPO');
  content = content.replace(/REGISTRO DE EQUIPOS BIOMÉDICOS/g, 'COPIAR - EQUIPO BIOMÉDICO');
  content = content.replace(/NUEVO REGISTRO DE EQUIPO/gi, 'COPIAR EQUIPO');
  content = content.replace(/Registrando equipo.../g, 'Copiando equipo...');
  content = content.replace(/Equipo registrado exitosamente/g, 'Equipo copiado exitosamente');
  
  // En onEquipmentAdded, para reutilizar, podemos dejarlo igual o cambiarlo
  
  // Agregar un hook que prellene datos si equipment esta disponible
  const hookCode = `

  // ====== LÓGICA DE COPIA (PRE-POBLADO) ======
  useEffect(() => {
    if (open && equipment) {
      console.log("[CopyModal] Precargando datos base del equipo:", equipment);
      
      // Intentar extraer data principal
      const baseEq = equipment.equipo || equipment;
      const ubi = equipment.ubicacion || {};
      const dataExt = equipment.data || {};
      const mantInfo = equipment.mantenimiento || {};
      
      setFormData(prev => ({
        ...prev,
        name: baseEq.name || baseEq.nombre || "",
        marca: baseEq.marca || "",
        modelo: baseEq.modelo || "",
        descripcion: baseEq.descripcion || "",
        pais_origen: dataExt.propiedad || equipment.pais_origen || "",
        
        // Dejar VACÍOS a propósito los identificadores únicos
        serial: "",
        codigo_antiguo: "",
        codigo_inventario: "",
        code: "",
        
        // Ubicacion (se intenta precargar si en la BD se manejan los IDs)
        // Nota: para selectores complejos donde no hay _id sino strings, el usuario tendrá que reasignarlos
        // o si existen \`servicio_id\`, \`area_id\`:
        servicio_id: ubi.servicio_id || prev.servicio_id,
        area_id: ubi.area_id || prev.area_id,
        sede_id: "1", // Generalmente 1 para SEDE principal
        
        // Costos / Vida util
        costo: equipment.costo || "",
        vida_util: equipment.vida_util || "",
      }));
    }
  }, [open, equipment]);
  // ============================================

`;

  // Injectar tras la inicializacion de catalogos o refs
  content = content.replace(
    'const excelInputRef = useRef(null);',
    'const excelInputRef = useRef(null);' + hookCode
  );

  fs.writeFileSync(dest, content);
  console.log("✅ Exito! copy-equipment-modal.jsx regenerado en base a add-equipment-modal.jsx.");
} catch (error) {
  console.error("Error procesando los archivos:", error);
}
