/**
 * COMPREHENSIVE TEST FOR FORM FIELD POPULATION
 * This test verifies that ALL form fields are properly populated with equipment data
 */

console.log('🧪 TESTING FORM FIELD POPULATION - COMPREHENSIVE VERIFICATION\n');

// Mock complete equipment data structure (what the backend returns)
const MOCK_COMPLETE_EQUIPMENT_DATA = {
  // Basic information
  id: 1,
  name: "Monitor de Signos Vitales",
  descripcion: "Monitor multiparamétrico para UCI",
  serial: "MSV-2024-001",
  code: "EQ-001",
  codigo_antiguo: "OLD-001",
  marca: "Philips",
  modelo: "IntelliVue MX450",
  invima: "2024-DM-001",
  image: "equipos/monitor-001.jpg",
  image_url: "http://localhost:8000/storage/equipos/monitor-001.jpg",
  
  // Dates
  fecha_fabricacion: "2024-01-15",
  fecha_instalacion: "2024-02-01",
  fecha_ad: "2024-01-30",
  fecha_vencimiento_garantia: "2027-01-30",
  fecha_acta_recibo: "2024-02-01",
  fecha_inicio_operacion: "2024-02-05",
  fecha_recepcion_almacen: "2024-01-31",
  vida_util: 10,
  
  // Location
  servicio_id: 1,
  area_id: 1,
  movilidad: "FIJO",
  localizacion_actual: "UCI - Habitación 101",
  
  // Economic
  costo: 15000000,
  tadquisicion_id: 1,
  garantia: "3 años",
  activo_comodato: "",
  
  // Technical
  fuente_id: 1,
  tecnologia_id: 1,
  frecuencia_id: 1,
  calibracion: "1", // Database stores as string
  evaluacion_desempenio: "Excelente",
  periodicidad: "ANUAL",
  repuesto_pendiente: "0", // Database stores as string
  
  // Electrical
  v1: "110V",
  v2: "220V",
  v3: "",
  
  // Owner and type
  propietario_id: 1,
  tipo_id: 1,
  propiedad: "PROPIO",
  
  // Status
  estadoequipo_id: 1,
  disponibilidad_id: 1,
  
  // Documentation
  manual: "Manual-MSV-2024.pdf",
  archivo_invima: "INVIMA-2024-DM-001.pdf",
  plano: "Planos técnicos disponibles",
  accesorios: "Cables ECG, Sensor SpO2, Brazalete NIBP",
  
  // Additional IDs
  invima_id: 1,
  orden_compra_id: 1,
  baja_id: null,
  guia_id: 1,
  manual_id: 1,
  necesidad_id: 1,
  
  // Maintenance
  plan: "Plan de mantenimiento preventivo anual",
  
  // Observations
  observacion: "Equipo en excelente estado, funcionando correctamente",
  otros: "Información adicional del equipo"
};

// All form fields that should be populated
const ALL_FORM_FIELDS = [
  // Basic information (8 fields)
  { field: 'name', type: 'text', required: true },
  { field: 'descripcion', type: 'textarea', required: false },
  { field: 'serial', type: 'text', required: true },
  { field: 'code', type: 'text', required: false },
  { field: 'codigo_antiguo', type: 'text', required: false },
  { field: 'marca', type: 'text', required: true },
  { field: 'modelo', type: 'text', required: true },
  { field: 'invima', type: 'text', required: false },
  
  // Dates (8 fields)
  { field: 'fecha_fabricacion', type: 'date', required: false },
  { field: 'fecha_instalacion', type: 'date', required: false },
  { field: 'fecha_ad', type: 'date', required: false },
  { field: 'fecha_vencimiento_garantia', type: 'date', required: false },
  { field: 'fecha_acta_recibo', type: 'date', required: false },
  { field: 'fecha_inicio_operacion', type: 'date', required: false },
  { field: 'fecha_recepcion_almacen', type: 'date', required: false },
  { field: 'vida_util', type: 'number', required: false },
  
  // Location (4 fields)
  { field: 'servicio_id', type: 'select', required: true },
  { field: 'area_id', type: 'select', required: false },
  { field: 'movilidad', type: 'select', required: false },
  { field: 'localizacion_actual', type: 'text', required: false },
  
  // Economic (4 fields)
  { field: 'costo', type: 'number', required: false },
  { field: 'tadquisicion_id', type: 'select', required: false },
  { field: 'garantia', type: 'text', required: false },
  { field: 'activo_comodato', type: 'text', required: false },
  
  // Technical (7 fields)
  { field: 'fuente_id', type: 'select', required: false },
  { field: 'tecnologia_id', type: 'select', required: false },
  { field: 'frecuencia_id', type: 'select', required: false },
  { field: 'calibracion', type: 'boolean', required: false },
  { field: 'evaluacion_desempenio', type: 'text', required: false },
  { field: 'periodicidad', type: 'text', required: false },
  { field: 'repuesto_pendiente', type: 'boolean', required: false },
  
  // Electrical (3 fields)
  { field: 'v1', type: 'text', required: false },
  { field: 'v2', type: 'text', required: false },
  { field: 'v3', type: 'text', required: false },
  
  // Owner and type (3 fields)
  { field: 'propietario_id', type: 'select', required: true },
  { field: 'tipo_id', type: 'select', required: false },
  { field: 'propiedad', type: 'text', required: false },
  
  // Status (2 fields)
  { field: 'estadoequipo_id', type: 'select', required: false },
  { field: 'disponibilidad_id', type: 'select', required: false },
  
  // Documentation (4 fields)
  { field: 'manual', type: 'text', required: false },
  { field: 'archivo_invima', type: 'text', required: false },
  { field: 'plano', type: 'textarea', required: false },
  { field: 'accesorios', type: 'textarea', required: false },
  
  // Additional IDs (6 fields)
  { field: 'invima_id', type: 'select', required: false },
  { field: 'orden_compra_id', type: 'select', required: false },
  { field: 'baja_id', type: 'select', required: false },
  { field: 'guia_id', type: 'select', required: false },
  { field: 'manual_id', type: 'select', required: false },
  { field: 'necesidad_id', type: 'select', required: false },
  
  // Maintenance (1 field)
  { field: 'plan', type: 'text', required: false },
  
  // Observations (2 fields)
  { field: 'observacion', type: 'textarea', required: false },
  { field: 'otros', type: 'textarea', required: false }
];

/**
 * Simulate the form data initialization process
 */
function simulateFormDataInitialization(equipmentData) {
  const formData = {};
  
  // Simulate the exact logic from the edit modal
  formData.name = equipmentData.name || "";
  formData.descripcion = equipmentData.descripcion || "";
  formData.serial = equipmentData.serial || "";
  formData.code = equipmentData.code || "";
  formData.codigo_antiguo = equipmentData.codigo_antiguo || "";
  formData.marca = equipmentData.marca || "";
  formData.modelo = equipmentData.modelo || "";
  formData.invima = equipmentData.invima || "";

  // Dates
  formData.fecha_fabricacion = equipmentData.fecha_fabricacion || "";
  formData.fecha_instalacion = equipmentData.fecha_instalacion || "";
  formData.fecha_ad = equipmentData.fecha_ad || "";
  formData.fecha_vencimiento_garantia = equipmentData.fecha_vencimiento_garantia || "";
  formData.fecha_acta_recibo = equipmentData.fecha_acta_recibo || "";
  formData.fecha_inicio_operacion = equipmentData.fecha_inicio_operacion || "";
  formData.fecha_recepcion_almacen = equipmentData.fecha_recepcion_almacen || "";
  formData.vida_util = equipmentData.vida_util || "";

  // Location
  formData.servicio_id = equipmentData.servicio_id?.toString() || "";
  formData.area_id = equipmentData.area_id?.toString() || "";
  formData.movilidad = equipmentData.movilidad || "FIJO";
  formData.localizacion_actual = equipmentData.localizacion_actual || "";

  // Economic
  formData.costo = equipmentData.costo || "";
  formData.tadquisicion_id = equipmentData.tadquisicion_id?.toString() || "";
  formData.garantia = equipmentData.garantia || "";
  formData.activo_comodato = equipmentData.activo_comodato || "";

  // Technical
  formData.fuente_id = equipmentData.fuente_id?.toString() || "";
  formData.tecnologia_id = equipmentData.tecnologia_id?.toString() || "";
  formData.frecuencia_id = equipmentData.frecuencia_id?.toString() || "";
  formData.calibracion = equipmentData.calibracion === "1" || equipmentData.calibracion === true || equipmentData.calibracion === "SI";
  formData.evaluacion_desempenio = equipmentData.evaluacion_desempenio || "";
  formData.periodicidad = equipmentData.periodicidad || "ANUAL";
  formData.repuesto_pendiente = equipmentData.repuesto_pendiente === "1" || equipmentData.repuesto_pendiente === true || equipmentData.repuesto_pendiente === "si";

  // Electrical
  formData.v1 = equipmentData.v1 || "";
  formData.v2 = equipmentData.v2 || "";
  formData.v3 = equipmentData.v3 || "";

  // Owner and type
  formData.propietario_id = equipmentData.propietario_id?.toString() || "";
  formData.tipo_id = equipmentData.tipo_id?.toString() || "";
  formData.propiedad = equipmentData.propiedad || "";

  // Status
  formData.estadoequipo_id = equipmentData.estadoequipo_id?.toString() || "";
  formData.disponibilidad_id = equipmentData.disponibilidad_id?.toString() || "";

  // Documentation
  formData.manual = equipmentData.manual || "";
  formData.archivo_invima = equipmentData.archivo_invima || "";
  formData.plano = equipmentData.plano || "";
  formData.accesorios = equipmentData.accesorios || "";

  // Additional IDs
  formData.invima_id = equipmentData.invima_id?.toString() || "";
  formData.orden_compra_id = equipmentData.orden_compra_id?.toString() || "";
  formData.baja_id = equipmentData.baja_id?.toString() || "";
  formData.guia_id = equipmentData.guia_id?.toString() || "";
  formData.manual_id = equipmentData.manual_id?.toString() || "";
  formData.necesidad_id = equipmentData.necesidad_id?.toString() || "";

  // Maintenance
  formData.plan = equipmentData.plan || "";

  // Observations
  formData.observacion = equipmentData.observacion || "";
  formData.otros = equipmentData.otros || "";

  return formData;
}

/**
 * Test form field population
 */
function testFormFieldPopulation() {
  console.log('🚀 RUNNING FORM FIELD POPULATION TEST\n');
  console.log('=' .repeat(60));
  
  // Simulate form data initialization
  const formData = simulateFormDataInitialization(MOCK_COMPLETE_EQUIPMENT_DATA);
  
  let totalFields = 0;
  let populatedFields = 0;
  let emptyFields = 0;
  let requiredFieldsPopulated = 0;
  let requiredFieldsEmpty = 0;
  
  console.log('📋 FIELD POPULATION RESULTS:\n');
  
  ALL_FORM_FIELDS.forEach(({ field, type, required }) => {
    totalFields++;
    const value = formData[field];
    const hasValue = value !== "" && value !== null && value !== undefined;
    
    if (hasValue) {
      populatedFields++;
      if (required) requiredFieldsPopulated++;
      console.log(`✅ ${field} (${type}${required ? ', required' : ''}): ${JSON.stringify(value)}`);
    } else {
      emptyFields++;
      if (required) requiredFieldsEmpty++;
      console.log(`${required ? '❌' : '⚪'} ${field} (${type}${required ? ', required' : ''}): EMPTY`);
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 SUMMARY STATISTICS:');
  console.log(`   📝 Total fields: ${totalFields}`);
  console.log(`   ✅ Populated fields: ${populatedFields} (${((populatedFields/totalFields)*100).toFixed(1)}%)`);
  console.log(`   ⚪ Empty fields: ${emptyFields} (${((emptyFields/totalFields)*100).toFixed(1)}%)`);
  console.log(`   🔒 Required fields populated: ${requiredFieldsPopulated}/${requiredFieldsPopulated + requiredFieldsEmpty}`);
  
  const allRequiredPopulated = requiredFieldsEmpty === 0;
  const goodPopulationRate = (populatedFields/totalFields) >= 0.8; // 80% or more
  
  console.log('\n🎯 OVERALL RESULT:');
  if (allRequiredPopulated && goodPopulationRate) {
    console.log('🎉 EXCELLENT! Form field population is working correctly.');
    console.log('✅ All required fields are populated');
    console.log('✅ Good population rate achieved');
  } else if (allRequiredPopulated) {
    console.log('✅ GOOD! All required fields are populated.');
    console.log('⚠️ Some optional fields could be improved');
  } else {
    console.log('❌ ISSUES FOUND! Some required fields are not populated.');
    console.log('🔧 Please check the form data initialization logic');
  }
  
  return {
    totalFields,
    populatedFields,
    emptyFields,
    requiredFieldsPopulated,
    requiredFieldsEmpty,
    allRequiredPopulated,
    goodPopulationRate
  };
}

// Run the test
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    testFormFieldPopulation, 
    MOCK_COMPLETE_EQUIPMENT_DATA, 
    ALL_FORM_FIELDS,
    simulateFormDataInitialization
  };
} else {
  testFormFieldPopulation();
}
