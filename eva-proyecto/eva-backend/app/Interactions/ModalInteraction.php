<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase para manejar todas las interacciones de modales del frontend
 */
class ModalInteraction
{
    /**
     * Obtener datos para modal de agregar equipo
     */
    public static function getAddEquipmentData()
    {
        try {
            $data = [
                'servicios' => \App\Models\Servicio::where('activo', true)->get(['id', 'nombre', 'codigo']),
                'areas' => \App\Models\Area::where('activo', true)->get(['id', 'nombre', 'codigo']),
                'propietarios' => \App\Models\Propietario::where('activo', true)->get(['id', 'nombre', 'codigo']),
                'usuarios' => Usuario::where('activo', true)->get(['id', 'nombre', 'apellidos']),
                'sedes' => ['SEDE HUV', 'SEDE NORTE', 'SEDE SUR'],
                'formas_adquisicion' => ['Compra', 'Donación', 'Comodato', 'Leasing'],
                'fuentes_alimentacion' => ['Eléctrica', 'Batería', 'Manual', 'Neumática', 'Hidráulica'],
                'tecnologias' => ['Electrónica', 'Mecánica', 'Hidráulica', 'Neumática', 'Mixta'],
                'frecuencias_mantenimiento' => ['Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'],
                'clasificaciones_biomedicas' => ['Clase I', 'Clase IIa', 'Clase IIb', 'Clase III'],
                'clasificaciones_riesgo' => ['ALTO', 'MEDIO ALTO', 'MEDIO', 'BAJO']
            ];

            return ResponseFormatter::success($data, 'Datos para modal obtenidos exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de mantenimiento preventivo
     */
    public static function getPreventiveMaintenanceData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos' => Usuario::where('rol', 'admin')
                    ->orWhere('rol', 'administrador')
                    ->where('activo', true)
                    ->get(['id', 'nombre', 'apellidos']),
                'tipos_mantenimiento' => ['Preventivo', 'Correctivo', 'Calibración'],
                'frecuencias' => ['Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'],
                'estados' => ['Programado', 'En Proceso', 'Completado', 'Cancelado']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area'])->find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener último mantenimiento
                $ultimoMantenimiento = Mantenimiento::where('equipo_id', $equipoId)
                    ->orderBy('fecha_programada', 'desc')
                    ->first();
                $data['ultimo_mantenimiento'] = $ultimoMantenimiento;
            }

            return ResponseFormatter::success($data, 'Datos para mantenimiento preventivo obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de calibración
     */
    public static function getCalibrationData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos_calibracion' => Usuario::where('activo', true)->get(['id', 'nombre', 'apellidos']),
                'tipos_calibracion' => ['Interna', 'Externa', 'Verificación'],
                'estados_calibracion' => ['Programada', 'En Proceso', 'Completada', 'Vencida'],
                'periodicidades' => ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Bianual'],
                'patrones_referencia' => ['Patrón Nacional', 'Patrón Secundario', 'Patrón de Trabajo']
            ];

            if ($equipoId) {
                $equipo = Equipo::find($equipoId);
                $data['equipo'] = $equipo;
                
                // Verificar si el equipo requiere calibración
                $data['requiere_calibracion'] = $equipo ? $equipo->requiere_calibracion ?? false : false;
            }

            return ResponseFormatter::success($data, 'Datos para calibración obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de mantenimiento correctivo
     */
    public static function getCorrectiveMaintenanceData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos' => Usuario::where('activo', true)->get(['id', 'nombre', 'apellidos']),
                'tipos_falla' => ['Mecánica', 'Eléctrica', 'Electrónica', 'Software', 'Neumática', 'Hidráulica'],
                'prioridades' => ['Baja', 'Media', 'Alta', 'Crítica'],
                'estados' => ['Reportado', 'En Diagnóstico', 'En Reparación', 'Completado', 'Requiere Repuestos'],
                'causas_falla' => ['Desgaste Normal', 'Mal Uso', 'Falta de Mantenimiento', 'Defecto de Fábrica', 'Accidente']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area'])->find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener historial de correctivos
                $historialCorrectivos = Mantenimiento::where('equipo_id', $equipoId)
                    ->where('type', 'correctivo')
                    ->orderBy('fecha_programada', 'desc')
                    ->limit(5)
                    ->get();
                $data['historial_correctivos'] = $historialCorrectivos;
            }

            return ResponseFormatter::success($data, 'Datos para mantenimiento correctivo obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de contingencias
     */
    public static function getContingencyData($equipoId = null)
    {
        try {
            $data = [
                'usuarios' => Usuario::where('activo', true)->get(['id', 'nombre', 'apellidos']),
                'severidades' => ['Baja', 'Media', 'Alta', 'Crítica'],
                'estados' => ['Activa', 'En Proceso', 'Resuelta'],
                'tipos_contingencia' => ['Falla Equipo', 'Accidente', 'Emergencia', 'Incidente'],
                'origenes' => ['Usuario', 'Mantenimiento', 'Inspección', 'Reporte Externo']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area'])->find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener contingencias activas del equipo
                $contingenciasActivas = Contingencia::where('equipo_id', $equipoId)
                    ->where('estado', '!=', 'Resuelta')
                    ->get();
                $data['contingencias_activas'] = $contingenciasActivas;
            }

            return ResponseFormatter::success($data, 'Datos para contingencias obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de documentos
     */
    public static function getDocumentData($equipoId = null)
    {
        try {
            $data = [
                'tipos_documento' => ['Manual de Usuario', 'Manual de Mantenimiento', 'Certificado', 'Garantía', 'Factura', 'Otro'],
                'formatos_permitidos' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png'],
                'tamaño_maximo' => '10MB'
            ];

            if ($equipoId) {
                $equipo = Equipo::find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener documentos existentes
                $documentos = \App\Models\Manual::where('equipo_id', $equipoId)
                    ->where('is_active', true)
                    ->get();
                $data['documentos_existentes'] = $documentos;
            }

            return ResponseFormatter::success($data, 'Datos para documentos obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para filtros avanzados
     */
    public static function getAdvancedFiltersData()
    {
        try {
            $data = [
                'servicios' => \App\Models\Servicio::where('activo', true)->get(['id', 'nombre']),
                'areas' => \App\Models\Area::where('activo', true)->get(['id', 'nombre']),
                'propietarios' => \App\Models\Propietario::where('activo', true)->get(['id', 'nombre']),
                'estados_equipo' => ['Operativo', 'Mantenimiento', 'Baja', 'Reparación'],
                'clasificaciones_riesgo' => ['ALTO', 'MEDIO ALTO', 'MEDIO', 'BAJO'],
                'marcas' => Equipo::distinct()->pluck('marca')->filter()->values(),
                'modelos' => Equipo::distinct()->pluck('modelo')->filter()->values(),
                'años_fabricacion' => range(date('Y') - 20, date('Y')),
                'rangos_costo' => [
                    ['min' => 0, 'max' => 1000000, 'label' => 'Menos de $1M'],
                    ['min' => 1000000, 'max' => 5000000, 'label' => '$1M - $5M'],
                    ['min' => 5000000, 'max' => 10000000, 'label' => '$5M - $10M'],
                    ['min' => 10000000, 'max' => null, 'label' => 'Más de $10M']
                ]
            ];

            return ResponseFormatter::success($data, 'Datos para filtros avanzados obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Validar datos de modal antes de procesamiento
     */
    public static function validateModalData($modalType, $data)
    {
        $rules = [];
        
        switch ($modalType) {
            case 'add_equipment':
                $rules = [
                    'nombre' => 'required|string|max:255',
                    'codigo' => 'required|string|unique:equipos,codigo',
                    'servicio_id' => 'required|exists:servicios,id',
                    'area_id' => 'required|exists:areas,id'
                ];
                break;
                
            case 'preventive_maintenance':
                $rules = [
                    'equipo_id' => 'required|exists:equipos,id',
                    'tecnico_id' => 'required|exists:usuarios,id',
                    'fecha_programada' => 'required|date|after:today'
                ];
                break;
                
            case 'corrective_maintenance':
                $rules = [
                    'equipo_id' => 'required|exists:equipos,id',
                    'descripcion' => 'required|string',
                    'prioridad' => 'required|in:Baja,Media,Alta,Crítica'
                ];
                break;
        }
        
        return \Illuminate\Support\Facades\Validator::make($data, $rules);
    }
}
