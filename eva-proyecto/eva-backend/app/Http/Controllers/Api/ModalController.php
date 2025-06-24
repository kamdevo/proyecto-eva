<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Usuario;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Propietario;
use App\Models\FuenteAlimentacion;
use App\Models\Tecnologia;
use App\Models\FrecuenciaMantenimiento;
use App\Models\ClasificacionBiomedica;
use App\Models\ClasificacionRiesgo;
use App\Models\TipoAdquisicion;
use App\Models\EstadoEquipo;
use App\Models\Mantenimiento;
use App\Models\Calibracion;
use App\Models\CorrectivoGeneral;
use App\Models\Contingencia;
use App\Models\Archivo;
use App\Models\Manual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ModalController extends ApiController
{
    /**
     * Obtener datos para modal de agregar equipo
     */
    public function getAddEquipmentData()
    {
        try {
            $data = [
                'servicios' => Servicio::where('status', 1)->get(['id', 'name']),
                'areas' => Area::where('status', 1)->get(['id', 'name']),
                'propietarios' => Propietario::where('status', 1)->get(['id', 'name']),
                'fuentes_alimentacion' => FuenteAlimentacion::all(['id', 'name']),
                'tecnologias' => Tecnologia::all(['id', 'name']),
                'frecuencias_mantenimiento' => FrecuenciaMantenimiento::all(['id', 'name']),
                'clasificaciones_biomedicas' => ClasificacionBiomedica::all(['id', 'name']),
                'clasificaciones_riesgo' => ClasificacionRiesgo::all(['id', 'name']),
                'tipos_adquisicion' => TipoAdquisicion::all(['id', 'name']),
                'estados_equipo' => EstadoEquipo::all(['id', 'name']),
                'usuarios' => Usuario::where('status', 1)->get(['id', 'name', 'lastname']),
                'sedes' => $this->getSedes(),
                'tipos_equipo' => $this->getTiposEquipo()
            ];

            return ResponseFormatter::success($data, 'Datos para modal de agregar equipo obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de mantenimiento preventivo
     */
    public function getPreventiveMaintenanceData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos' => Usuario::where('status', 1)
                    ->whereIn('role', ['admin', 'tecnico'])
                    ->get(['id', 'name', 'lastname']),
                'frecuencias' => FrecuenciaMantenimiento::all(['id', 'name']),
                'tipos_mantenimiento' => ['Preventivo', 'Correctivo', 'Calibración', 'Verificación'],
                'estados' => ['Programado', 'En Proceso', 'Completado', 'Cancelado', 'Pendiente']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area', 'mantenimientos' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(5);
                }])->find($equipoId);
                
                $data['equipo'] = $equipo;
                
                // Obtener último mantenimiento
                $ultimoMantenimiento = Mantenimiento::where('equipo_id', $equipoId)
                    ->orderBy('fecha', 'desc')
                    ->first();
                $data['ultimo_mantenimiento'] = $ultimoMantenimiento;
                
                // Calcular próximo mantenimiento basado en frecuencia
                if ($equipo && $equipo->frecuencia_id) {
                    $data['proximo_mantenimiento_sugerido'] = $this->calcularProximoMantenimiento($equipo);
                }
            }

            return ResponseFormatter::success($data, 'Datos para mantenimiento preventivo obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de calibración
     */
    public function getCalibrationData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos_calibracion' => Usuario::where('status', 1)
                    ->where('role', 'tecnico_calibracion')
                    ->orWhere('role', 'admin')
                    ->get(['id', 'name', 'lastname']),
                'tipos_calibracion' => ['Interna', 'Externa', 'Verificación', 'Ajuste'],
                'estados_calibracion' => ['Programada', 'En Proceso', 'Completada', 'Vencida', 'No Aplica'],
                'periodicidades' => ['Mensual', 'Trimestral', 'Semestral', 'Anual', 'Bianual', 'Según uso'],
                'patrones_referencia' => $this->getPatronesReferencia(),
                'metodos_calibracion' => $this->getMetodosCalibracion()
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['calibraciones' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(5);
                }])->find($equipoId);
                
                $data['equipo'] = $equipo;
                $data['requiere_calibracion'] = $equipo ? $equipo->calibracion == 1 : false;
                
                // Obtener última calibración
                $ultimaCalibracion = Calibracion::where('equipo_id', $equipoId)
                    ->orderBy('fecha', 'desc')
                    ->first();
                $data['ultima_calibracion'] = $ultimaCalibracion;
            }

            return ResponseFormatter::success($data, 'Datos para calibración obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de mantenimiento correctivo
     */
    public function getCorrectiveMaintenanceData($equipoId = null)
    {
        try {
            $data = [
                'tecnicos' => Usuario::where('status', 1)
                    ->whereIn('role', ['admin', 'tecnico'])
                    ->get(['id', 'name', 'lastname']),
                'tipos_falla' => $this->getTiposFalla(),
                'prioridades' => ['Baja', 'Media', 'Alta', 'Crítica', 'Urgente'],
                'estados' => ['Reportado', 'En Diagnóstico', 'En Reparación', 'Esperando Repuestos', 'Completado', 'Cancelado'],
                'causas_falla' => $this->getCausasFalla(),
                'tipos_correctivo' => ['Correctivo', 'Emergencia', 'Reparación', 'Reemplazo']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area', 'correctivos' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(5);
                }])->find($equipoId);
                
                $data['equipo'] = $equipo;
                
                // Obtener historial de correctivos
                $historialCorrectivos = CorrectivoGeneral::where('equipo_id', $equipoId)
                    ->orderBy('fecha', 'desc')
                    ->limit(10)
                    ->get();
                $data['historial_correctivos'] = $historialCorrectivos;
                
                // Verificar si hay correctivos pendientes
                $correctivosPendientes = CorrectivoGeneral::where('equipo_id', $equipoId)
                    ->whereIn('estado', ['Reportado', 'En Diagnóstico', 'En Reparación'])
                    ->count();
                $data['correctivos_pendientes'] = $correctivosPendientes;
            }

            return ResponseFormatter::success($data, 'Datos para mantenimiento correctivo obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de contingencias
     */
    public function getContingencyData($equipoId = null)
    {
        try {
            $data = [
                'usuarios' => Usuario::where('status', 1)->get(['id', 'name', 'lastname']),
                'severidades' => ['Baja', 'Media', 'Alta', 'Crítica'],
                'estados' => ['Activa', 'En Proceso', 'Resuelta', 'Cerrada'],
                'tipos_contingencia' => $this->getTiposContingencia(),
                'origenes' => ['Usuario', 'Mantenimiento', 'Inspección', 'Reporte Externo', 'Monitoreo'],
                'impactos' => ['Bajo', 'Medio', 'Alto', 'Crítico']
            ];

            if ($equipoId) {
                $equipo = Equipo::with(['servicio', 'area'])->find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener contingencias activas del equipo
                $contingenciasActivas = Contingencia::where('equipo_id', $equipoId)
                    ->whereNotIn('estado', ['Resuelta', 'Cerrada'])
                    ->get();
                $data['contingencias_activas'] = $contingenciasActivas;
                
                // Obtener historial de contingencias
                $historialContingencias = Contingencia::where('equipo_id', $equipoId)
                    ->orderBy('fecha', 'desc')
                    ->limit(10)
                    ->get();
                $data['historial_contingencias'] = $historialContingencias;
            }

            return ResponseFormatter::success($data, 'Datos para contingencias obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para modal de documentos
     */
    public function getDocumentData($equipoId = null)
    {
        try {
            $data = [
                'tipos_documento' => $this->getTiposDocumento(),
                'formatos_permitidos' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif', 'zip', 'rar'],
                'tamaño_maximo' => '20MB',
                'categorias' => ['Manual', 'Certificado', 'Garantía', 'Factura', 'Plano', 'Especificación', 'Otro']
            ];

            if ($equipoId) {
                $equipo = Equipo::find($equipoId);
                $data['equipo'] = $equipo;
                
                // Obtener archivos existentes
                $archivos = DB::table('equipo_archivo')
                    ->join('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
                    ->where('equipo_archivo.equipo_id', $equipoId)
                    ->select('archivos.*', 'equipo_archivo.created_at as fecha_asociacion')
                    ->get();
                $data['archivos_existentes'] = $archivos;
                
                // Obtener manuales existentes
                $manuales = Manual::where('status', 1)->get();
                $data['manuales_disponibles'] = $manuales;
            }

            return ResponseFormatter::success($data, 'Datos para documentos obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener datos para filtros avanzados
     */
    public function getAdvancedFiltersData()
    {
        try {
            $data = [
                'servicios' => Servicio::where('status', 1)->get(['id', 'name']),
                'areas' => Area::where('status', 1)->get(['id', 'name']),
                'propietarios' => Propietario::where('status', 1)->get(['id', 'name']),
                'estados_equipo' => EstadoEquipo::all(['id', 'name']),
                'clasificaciones_riesgo' => ClasificacionRiesgo::all(['id', 'name']),
                'clasificaciones_biomedicas' => ClasificacionBiomedica::all(['id', 'name']),
                'tecnologias' => Tecnologia::all(['id', 'name']),
                'fuentes_alimentacion' => FuenteAlimentacion::all(['id', 'name']),
                'marcas' => Equipo::distinct()->pluck('marca')->filter()->values(),
                'modelos' => Equipo::distinct()->pluck('modelo')->filter()->values(),
                'años_fabricacion' => range(date('Y') - 30, date('Y')),
                'rangos_costo' => $this->getRangosCosto(),
                'frecuencias_mantenimiento' => FrecuenciaMantenimiento::all(['id', 'name'])
            ];

            return ResponseFormatter::success($data, 'Datos para filtros avanzados obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener datos: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares privados
    private function getSedes()
    {
        return [
            ['id' => 1, 'name' => 'SEDE HUV'],
            ['id' => 2, 'name' => 'SEDE NORTE'],
            ['id' => 3, 'name' => 'SEDE SUR'],
            ['id' => 4, 'name' => 'SEDE ESTE'],
            ['id' => 5, 'name' => 'SEDE OESTE']
        ];
    }

    private function getTiposEquipo()
    {
        return DB::table('tipos')->where('status', 1)->get(['id', 'name']);
    }

    private function getPatronesReferencia()
    {
        return [
            'Patrón Nacional',
            'Patrón Secundario',
            'Patrón de Trabajo',
            'Patrón de Referencia',
            'Equipo Certificado'
        ];
    }

    private function getMetodosCalibracion()
    {
        return [
            'Comparación Directa',
            'Sustitución',
            'Diferencial',
            'Simulación',
            'Verificación Funcional'
        ];
    }

    private function getTiposFalla()
    {
        return DB::table('tipos_fallas')->get(['id', 'name'])->pluck('name')->toArray() ?: [
            'Mecánica',
            'Eléctrica',
            'Electrónica',
            'Software',
            'Neumática',
            'Hidráulica',
            'Térmica',
            'Óptica'
        ];
    }

    private function getCausasFalla()
    {
        return [
            'Desgaste Normal',
            'Mal Uso',
            'Falta de Mantenimiento',
            'Defecto de Fábrica',
            'Accidente',
            'Sobrecarga',
            'Condiciones Ambientales',
            'Obsolescencia'
        ];
    }

    private function getTiposContingencia()
    {
        return [
            'Falla Equipo',
            'Accidente',
            'Emergencia',
            'Incidente',
            'Evento Adverso',
            'Cuasi Accidente'
        ];
    }

    private function getTiposDocumento()
    {
        return [
            'Manual de Usuario',
            'Manual de Mantenimiento',
            'Manual de Servicio',
            'Certificado de Calibración',
            'Certificado de Conformidad',
            'Garantía',
            'Factura',
            'Orden de Compra',
            'Plano Técnico',
            'Especificación Técnica',
            'Protocolo de Pruebas',
            'Registro Sanitario',
            'Otro'
        ];
    }

    private function getRangosCosto()
    {
        return [
            ['min' => 0, 'max' => 1000000, 'label' => 'Menos de $1M'],
            ['min' => 1000000, 'max' => 5000000, 'label' => '$1M - $5M'],
            ['min' => 5000000, 'max' => 10000000, 'label' => '$5M - $10M'],
            ['min' => 10000000, 'max' => 50000000, 'label' => '$10M - $50M'],
            ['min' => 50000000, 'max' => null, 'label' => 'Más de $50M']
        ];
    }

    private function calcularProximoMantenimiento($equipo)
    {
        if (!$equipo->frecuencia_id) {
            return null;
        }

        $ultimoMantenimiento = $equipo->fecha_mantenimiento ?: $equipo->created_at;
        $frecuencia = FrecuenciaMantenimiento::find($equipo->frecuencia_id);

        if (!$frecuencia) {
            return null;
        }

        // Lógica para calcular próximo mantenimiento basado en la frecuencia
        $fechaBase = \Carbon\Carbon::parse($ultimoMantenimiento);

        switch (strtolower($frecuencia->name)) {
            case 'mensual':
                return $fechaBase->addMonth();
            case 'bimestral':
                return $fechaBase->addMonths(2);
            case 'trimestral':
                return $fechaBase->addMonths(3);
            case 'semestral':
                return $fechaBase->addMonths(6);
            case 'anual':
                return $fechaBase->addYear();
            default:
                return $fechaBase->addMonths(3); // Default trimestral
        }
    }
}