/**
 * Script de prueba para el modal de agregar equipos
 * Verifica la funcionalidad completa del sistema
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuración de la API
const API_BASE_URL = 'http://localhost:8000/api/v1';
const TEST_TOKEN = 'your-test-token-here'; // Reemplazar con token válido

// Headers por defecto
const defaultHeaders = {
    'Authorization': `Bearer ${TEST_TOKEN}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
};

/**
 * Función para probar la carga de catálogos
 */
async function testLoadCatalogs() {
    console.log('🔍 Probando carga de catálogos...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/modal/add-equipment-data`, {
            headers: defaultHeaders
        });
        
        if (response.data.success) {
            console.log('✅ Catálogos cargados exitosamente');
            console.log('📊 Datos disponibles:', Object.keys(response.data.data));
            
            // Verificar que todos los catálogos necesarios estén presentes
            const requiredCatalogs = [
                'servicios', 'areas', 'propietarios', 'fuentes_alimentacion',
                'tecnologias', 'frecuencias_mantenimiento', 'clasificaciones_biomedicas',
                'clasificaciones_riesgo', 'tipos_adquisicion', 'estados_equipo'
            ];
            
            const missingCatalogs = requiredCatalogs.filter(catalog => 
                !response.data.data[catalog] || response.data.data[catalog].length === 0
            );
            
            if (missingCatalogs.length > 0) {
                console.log('⚠️  Catálogos faltantes o vacíos:', missingCatalogs);
            } else {
                console.log('✅ Todos los catálogos requeridos están disponibles');
            }
            
            return response.data.data;
        } else {
            console.log('❌ Error al cargar catálogos:', response.data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de conexión:', error.message);
        return null;
    }
}

/**
 * Función para crear datos de prueba de equipo
 */
function createTestEquipmentData(catalogs) {
    const timestamp = Date.now();
    
    return {
        // Identificación básica
        name: `Equipo de Prueba ${timestamp}`,
        serial: `TEST-${timestamp}`,
        code: `CODE-${timestamp}`,
        marca: 'MARCA TEST',
        modelo: 'MODELO TEST',
        descripcion: 'Descripción de prueba para equipo biomédico',
        codigo_antiguo: `OLD-${timestamp}`,
        codigo_inventario: `INV-${timestamp}`,
        centro_costo: 'CC-TEST-001',
        pais_origen: 'Colombia',
        
        // Ubicación
        servicio_id: catalogs.servicios?.[0]?.id?.toString() || '1',
        area_id: catalogs.areas?.[0]?.id?.toString() || '1',
        sede_id: '1',
        localizacion_actual: 'Sala de pruebas',
        
        // Registro histórico
        tadquisicion_id: catalogs.tipos_adquisicion?.[0]?.id?.toString() || '1',
        garantia: '2 años',
        activo_comodato: '',
        fecha_adquisicion: '2023-01-15',
        fecha_instalacion: '2023-02-01',
        fecha_recepcion_almacen: '2023-01-10',
        fecha_acta_recibo: '2023-01-20',
        fecha_inicio_operacion: '2023-02-05',
        fecha_fabricacion: '2022-12-01',
        costo: '50000000',
        vida_util: '10',
        
        // Registro técnico
        fuente_id: catalogs.fuentes_alimentacion?.[0]?.id?.toString() || '1',
        tecnologia_id: catalogs.tecnologias?.[0]?.id?.toString() || '1',
        evaluacion_desempeno: 'excelente',
        calibracion: true,
        periodicidad_calibracion: '12 meses',
        frecuencia_id: catalogs.frecuencias_mantenimiento?.[0]?.id?.toString() || '1',
        
        // Estado actual
        funcionalidad: 'optima',
        disponibilidad_id: '1',
        estadoequipo_id: catalogs.estados_equipo?.[0]?.id?.toString() || '1',
        
        // Apoyo técnico
        manuales: JSON.stringify({
            operacion: true,
            mantenimiento: true,
            partes: false,
            otros: false
        }),
        planos: JSON.stringify({
            electrico: true,
            electronico: false,
            neumatico: false,
            mecanico: true
        }),
        cbiomedica_id: catalogs.clasificaciones_biomedicas?.[0]?.id?.toString() || '1',
        criesgo_id: catalogs.clasificaciones_riesgo?.[0]?.id?.toString() || '1',
        
        // Componentes y seguimiento
        componentes: 'Componentes de prueba: sensor principal, pantalla LCD, cables de conexión',
        propietario_id: catalogs.propietarios?.[0]?.id?.toString() || '1',
        verificacion_fisica: 'realizada',
        observaciones: 'Equipo de prueba registrado automáticamente para validación del sistema',
        
        // Campos adicionales
        invima: 'REG-TEST-001',
        tipo_id: '1' // Biomédico
    };
}

/**
 * Función para probar el registro de equipo
 */
async function testEquipmentRegistration(catalogs) {
    console.log('📝 Probando registro de equipo...');
    
    try {
        const equipmentData = createTestEquipmentData(catalogs);
        
        // Crear FormData para simular envío con archivos
        const formData = new FormData();
        
        // Agregar todos los campos
        Object.entries(equipmentData).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formData.append(key, value);
            }
        });
        
        // Simular archivo de imagen (crear un archivo temporal pequeño)
        const testImagePath = path.join(__dirname, 'test-image.txt');
        fs.writeFileSync(testImagePath, 'Test image content');
        formData.append('image', fs.createReadStream(testImagePath));
        
        // Simular archivo Excel (crear un archivo temporal)
        const testExcelPath = path.join(__dirname, 'test-excel.txt');
        fs.writeFileSync(testExcelPath, 'Test Excel content');
        formData.append('archivo_excel', fs.createReadStream(testExcelPath));
        
        const response = await axios.post(`${API_BASE_URL}/equipos`, formData, {
            headers: {
                'Authorization': `Bearer ${TEST_TOKEN}`,
                'Accept': 'application/json',
                ...formData.getHeaders()
            }
        });
        
        // Limpiar archivos temporales
        fs.unlinkSync(testImagePath);
        fs.unlinkSync(testExcelPath);
        
        if (response.data.success) {
            console.log('✅ Equipo registrado exitosamente');
            console.log('🆔 ID del equipo:', response.data.data.id);
            console.log('📋 Datos del equipo:', {
                name: response.data.data.name,
                code: response.data.data.code,
                serial: response.data.data.serial
            });
            return response.data.data;
        } else {
            console.log('❌ Error al registrar equipo:', response.data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Error en registro:', error.response?.data?.message || error.message);
        if (error.response?.data?.errors) {
            console.log('📋 Errores de validación:', error.response.data.errors);
        }
        return null;
    }
}

/**
 * Función principal de prueba
 */
async function runTests() {
    console.log('🚀 Iniciando pruebas del modal de agregar equipos...\n');
    
    // Paso 1: Probar carga de catálogos
    const catalogs = await testLoadCatalogs();
    if (!catalogs) {
        console.log('❌ No se pueden continuar las pruebas sin catálogos');
        return;
    }
    
    console.log('\n');
    
    // Paso 2: Probar registro de equipo
    const equipment = await testEquipmentRegistration(catalogs);
    if (!equipment) {
        console.log('❌ Error en el registro de equipo');
        return;
    }
    
    console.log('\n✅ Todas las pruebas completadas exitosamente!');
    console.log('🎉 El modal de agregar equipos está funcionando correctamente');
}

// Ejecutar pruebas si el script se ejecuta directamente
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = {
    testLoadCatalogs,
    testEquipmentRegistration,
    createTestEquipmentData,
    runTests
};
