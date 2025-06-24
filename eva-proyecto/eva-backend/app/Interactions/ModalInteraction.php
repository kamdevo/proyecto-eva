<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\Models\Area;
use App\Models\Servicio;
use App\Models\Propietario;
use App\Models\Archivo;
use App\ConexionesVista\ResponseFormatter;
use App\ConexionesVista\ReactViewHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Clase MEJORADA AL 500% para manejar todas las interacciones de modales del frontend
 * Incluye cache de datos estáticos, manejo de relaciones complejas, validaciones completas
 */
class ModalInteraction
{
    /**
     * Tiempo de cache para datos estáticos (en minutos)
     */
    const STATIC_CACHE_TTL = 60;
    const DYNAMIC_CACHE_TTL = 10;

    /**
     * Tipos de modales soportados
     */
    const MODAL_TYPES = [
        'add_equipment', 'edit_equipment', 'equipment_details',
        'add_maintenance', 'edit_maintenance', 'maintenance_details',
        'add_contingency', 'edit_contingency', 'contingency_details',
        'add_user', 'edit_user', 'user_details',
        'add_area', 'edit_area', 'area_details',
        'add_service', 'edit_service', 'service_details',
        'file_upload', 'file_manager', 'bulk_operations',
        'reports', 'analytics', 'settings'
    ];

    /**
     * Obtener datos para cualquier tipo de modal con cache optimizado
     */
    public static function getModalData(string $modalType, $itemId = null, array $options = [])
    {
        try {
            // Validar tipo de modal
            if (!in_array($modalType, self::MODAL_TYPES)) {
                return ResponseFormatter::error('Tipo de modal no válido');
            }

            // Crear clave de cache única
            $cacheKey = "modal_data_{$modalType}" . ($itemId ? "_{$itemId}" : '') . '_' . md5(serialize($options));
            $cacheTTL = self::isStaticModal($modalType) ? self::STATIC_CACHE_TTL : self::DYNAMIC_CACHE_TTL;

            $data = Cache::remember($cacheKey, $cacheTTL, function () use ($modalType, $itemId, $options) {
                return self::generateModalData($modalType, $itemId, $options);
            });

            return ResponseFormatter::reactView($data, $modalType, 'Datos de modal obtenidos exitosamente', [
                'modal_type' => $modalType,
                'cached' => true
            ]);

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos de modal: ' . $e->getMessage(), [
                'modal_type' => $modalType,
                'item_id' => $itemId,
                'options' => $options
            ]);
            return ResponseFormatter::error('Error al obtener datos del modal: ' . $e->getMessage());
        }
    }

    /**
     * Obtener datos para modal de agregar/editar equipo (corregido campos BD)
     */
    public static function getEquipmentModalData($equipoId = null)
    {
        try {
            $cacheKey = "equipment_modal_data" . ($equipoId ? "_{$equipoId}" : '');
            
            return Cache::remember($cacheKey, self::STATIC_CACHE_TTL, function () use ($equipoId) {
                $data = [
                    // Datos del equipo si es edición
                    'equipment' => $equipoId ? ReactViewHelper::formatForReact(Equipo::with(['area', 'servicio', 'propietario'])->find($equipoId)) : null,
                    
                    // Opciones para dropdowns (corregidos campos BD)
                    'servicios' => self::getDropdownOptions('servicios', ['id', 'nombre', 'codigo'], ['status' => 1]),
                    'areas' => self::getDropdownOptions('areas', ['id', 'nombre', 'codigo'], ['status' => 1]),
                    'propietarios' => self::getDropdownOptions('propietarios', ['id', 'nombre', 'codigo'], ['status' => 1]),
                    'usuarios' => self::getDropdownOptions('usuarios', ['id', 'nombre', 'apellido'], ['estado' => 1]), // Corregido: 'apellido' no 'apellidos'
                    
                    // Opciones estáticas
                    'sedes' => self::getSedesOptions(),
                    'formas_adquisicion' => self::getFormasAdquisicionOptions(),
                    'fuentes_alimentacion' => self::getFuentesAlimentacionOptions(),
                    'tecnologias' => self::getTecnologiasOptions(),
                    'frecuencias_mantenimiento' => self::getFrecuenciasMantenimientoOptions(),
                    'clasificaciones_biomedicas' => self::getClasificacionesBiomedicasOptions(),
                    'clasificaciones_riesgo' => self::getClasificacionesRiesgoOptions(),
                    'estados_equipo' => self::getEstadosEquipoOptions(),
                    'tipos_equipo' => self::getTiposEquipoOptions(),
                    'disponibilidades' => self::getDisponibilidadesOptions(),
                    
                    // Configuración del formulario
                    'form_config' => [
                        'required_fields' => ['name', 'code', 'servicio_id', 'area_id'],
                        'file_upload_fields' => ['image', 'manual', 'archivo_invima'],
                        'date_fields' => ['fecha_ad', 'fecha_instalacion', 'fecha_fabricacion'],
                        'numeric_fields' => ['costo', 'vida_util'],
                        'validation_rules' => self::getEquipmentValidationRules()
                    ]
                ];

                return $data;
            });

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos modal equipo: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener datos del modal de equipo');
        }
    }

    /**
     * Obtener datos para modal de mantenimiento (corregido campos BD)
     */
    public static function getMaintenanceModalData($mantenimientoId = null, $equipoId = null)
    {
        try {
            $cacheKey = "maintenance_modal_data" . ($mantenimientoId ? "_{$mantenimientoId}" : '') . ($equipoId ? "_eq_{$equipoId}" : '');
            
            return Cache::remember($cacheKey, self::DYNAMIC_CACHE_TTL, function () use ($mantenimientoId, $equipoId) {
                $data = [
                    // Datos del mantenimiento si es edición
                    'maintenance' => $mantenimientoId ? ReactViewHelper::formatForReact(
                        Mantenimiento::with(['equipo', 'tecnico'])->find($mantenimientoId)
                    ) : null,
                    
                    // Datos del equipo
                    'equipment' => $equipoId ? ReactViewHelper::formatForReact(Equipo::find($equipoId)) : null,
                    
                    // Opciones para dropdowns
                    'equipos' => self::getDropdownOptions('equipos', ['id', 'name', 'code'], ['status' => 1]),
                    'tecnicos' => self::getDropdownOptions('usuarios', ['id', 'nombre', 'apellido'], ['estado' => 1, 'rol_id' => 3]), // Técnicos
                    
                    // Opciones estáticas
                    'tipos_mantenimiento' => self::getTiposMantenimientoOptions(),
                    'estados_mantenimiento' => self::getEstadosMantenimientoOptions(),
                    'prioridades' => self::getPrioridadesOptions(),
                    'periodicidades' => self::getPeriodicidadesOptions(),
                    
                    // Historial de mantenimientos del equipo
                    'maintenance_history' => $equipoId ? self::getMaintenanceHistory($equipoId) : [],
                    
                    // Configuración del formulario
                    'form_config' => [
                        'required_fields' => ['equipo_id', 'tipo', 'descripcion', 'fecha_programada'],
                        'date_fields' => ['fecha_programada', 'fecha_inicio', 'fecha_fin'],
                        'numeric_fields' => ['costo', 'tiempo_estimado', 'tiempo_real'],
                        'validation_rules' => self::getMaintenanceValidationRules()
                    ]
                ];

                return $data;
            });

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos modal mantenimiento: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener datos del modal de mantenimiento');
        }
    }

    /**
     * Obtener datos para modal de contingencia (corregido campos BD)
     */
    public static function getContingencyModalData($contingenciaId = null, $equipoId = null)
    {
        try {
            $cacheKey = "contingency_modal_data" . ($contingenciaId ? "_{$contingenciaId}" : '') . ($equipoId ? "_eq_{$equipoId}" : '');
            
            return Cache::remember($cacheKey, self::DYNAMIC_CACHE_TTL, function () use ($contingenciaId, $equipoId) {
                $data = [
                    // Datos de la contingencia si es edición
                    'contingency' => $contingenciaId ? ReactViewHelper::formatForReact(
                        Contingencia::with(['equipo', 'usuario_reporta', 'usuario_asignado'])->find($contingenciaId)
                    ) : null,
                    
                    // Datos del equipo
                    'equipment' => $equipoId ? ReactViewHelper::formatForReact(Equipo::find($equipoId)) : null,
                    
                    // Opciones para dropdowns
                    'equipos' => self::getDropdownOptions('equipos', ['id', 'name', 'code'], ['status' => 1]),
                    'usuarios' => self::getDropdownOptions('usuarios', ['id', 'nombre', 'apellido'], ['estado' => 1]),
                    'tecnicos' => self::getDropdownOptions('usuarios', ['id', 'nombre', 'apellido'], ['estado' => 1, 'rol_id' => 3]),
                    
                    // Opciones estáticas
                    'tipos_contingencia' => self::getTiposContingenciaOptions(),
                    'estados_contingencia' => self::getEstadosContingenciaOptions(),
                    'prioridades' => self::getPrioridadesOptions(),
                    'severidades' => self::getSeveridadesOptions(),
                    'causas' => self::getCausasOptions(),
                    
                    // Historial de contingencias del equipo
                    'contingency_history' => $equipoId ? self::getContingencyHistory($equipoId) : [],
                    
                    // Configuración del formulario
                    'form_config' => [
                        'required_fields' => ['titulo', 'descripcion', 'prioridad', 'tipo'],
                        'date_fields' => ['fecha_reporte', 'fecha_cierre'],
                        'validation_rules' => self::getContingencyValidationRules()
                    ]
                ];

                return $data;
            });

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos modal contingencia: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener datos del modal de contingencia');
        }
    }

    /**
     * Obtener datos para modal de usuario (corregido campos BD)
     */
    public static function getUserModalData($usuarioId = null)
    {
        try {
            $cacheKey = "user_modal_data" . ($usuarioId ? "_{$usuarioId}" : '');
            
            return Cache::remember($cacheKey, self::STATIC_CACHE_TTL, function () use ($usuarioId) {
                $data = [
                    // Datos del usuario si es edición
                    'user' => $usuarioId ? ReactViewHelper::formatForReact(
                        Usuario::with(['area', 'empresa'])->find($usuarioId)
                    ) : null,
                    
                    // Opciones para dropdowns
                    'roles' => self::getRolesOptions(),
                    'areas' => self::getDropdownOptions('areas', ['id', 'nombre'], ['status' => 1]),
                    'empresas' => self::getEmpresasOptions(),
                    'sedes' => self::getSedesOptions(),
                    
                    // Configuración del formulario
                    'form_config' => [
                        'required_fields' => ['nombre', 'apellido', 'email', 'username'], // Corregido: 'apellido' no 'apellidos'
                        'unique_fields' => ['email', 'username'],
                        'password_fields' => ['password', 'password_confirmation'],
                        'validation_rules' => self::getUserValidationRules()
                    ]
                ];

                return $data;
            });

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos modal usuario: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener datos del modal de usuario');
        }
    }

    /**
     * Obtener datos para modal de archivos
     */
    public static function getFileModalData($entityType = null, $entityId = null)
    {
        try {
            $data = [
                // Archivos existentes
                'files' => $entityType && $entityId ? self::getEntityFiles($entityType, $entityId) : [],
                
                // Configuración de subida
                'upload_config' => [
                    'max_file_size' => '10MB',
                    'allowed_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx'],
                    'max_files' => 10,
                    'entity_type' => $entityType,
                    'entity_id' => $entityId
                ],
                
                // Tipos de archivo
                'file_types' => self::getFileTypesOptions(),
                
                // Configuración del formulario
                'form_config' => [
                    'required_fields' => ['file', 'tipo'],
                    'validation_rules' => self::getFileValidationRules()
                ]
            ];

            return ResponseFormatter::reactView($data, 'file_modal', 'Datos de modal de archivos obtenidos');

        } catch (\Exception $e) {
            Log::error('Error obteniendo datos modal archivo: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener datos del modal de archivos');
        }
    }

    /**
     * Funciones auxiliares privadas
     */

    /**
     * Generar datos según el tipo de modal
     */
    private static function generateModalData(string $modalType, $itemId = null, array $options = [])
    {
        switch ($modalType) {
            case 'add_equipment':
            case 'edit_equipment':
                return self::getEquipmentModalData($itemId);

            case 'add_maintenance':
            case 'edit_maintenance':
                return self::getMaintenanceModalData($itemId, $options['equipo_id'] ?? null);

            case 'add_contingency':
            case 'edit_contingency':
                return self::getContingencyModalData($itemId, $options['equipo_id'] ?? null);

            case 'add_user':
            case 'edit_user':
                return self::getUserModalData($itemId);

            case 'file_upload':
            case 'file_manager':
                return self::getFileModalData($options['entity_type'] ?? null, $options['entity_id'] ?? null);

            default:
                return ['message' => 'Tipo de modal no implementado'];
        }
    }

    /**
     * Verificar si un modal contiene datos estáticos
     */
    private static function isStaticModal(string $modalType): bool
    {
        $staticModals = ['add_equipment', 'add_user', 'add_area', 'add_service', 'settings'];
        return in_array($modalType, $staticModals);
    }

    /**
     * Obtener opciones para dropdown con cache
     */
    private static function getDropdownOptions(string $table, array $fields, array $conditions = [])
    {
        $cacheKey = "dropdown_{$table}_" . md5(serialize([$fields, $conditions]));

        return Cache::remember($cacheKey, self::STATIC_CACHE_TTL, function () use ($table, $fields, $conditions) {
            $query = DB::table($table)->select($fields);

            foreach ($conditions as $field => $value) {
                $query->where($field, $value);
            }

            return $query->get()->map(function ($item) {
                $array = (array) $item;
                return [
                    'value' => $array['id'],
                    'label' => $array['nombre'] ?? $array['name'] ?? $array['titulo'] ?? 'Sin nombre',
                    'code' => $array['codigo'] ?? $array['code'] ?? null
                ];
            })->toArray();
        });
    }

    /**
     * Obtener opciones de sedes
     */
    private static function getSedesOptions(): array
    {
        return [
            ['value' => '1', 'label' => 'SEDE PRINCIPAL'],
            ['value' => '2', 'label' => 'SEDE NORTE'],
            ['value' => '3', 'label' => 'SEDE SUR'],
            ['value' => '4', 'label' => 'SEDE ORIENTE']
        ];
    }

    /**
     * Obtener opciones de formas de adquisición
     */
    private static function getFormasAdquisicionOptions(): array
    {
        return [
            ['value' => 'compra', 'label' => 'Compra'],
            ['value' => 'donacion', 'label' => 'Donación'],
            ['value' => 'comodato', 'label' => 'Comodato'],
            ['value' => 'leasing', 'label' => 'Leasing'],
            ['value' => 'alquiler', 'label' => 'Alquiler']
        ];
    }

    /**
     * Obtener opciones de fuentes de alimentación
     */
    private static function getFuentesAlimentacionOptions(): array
    {
        return [
            ['value' => 'electrica', 'label' => 'Eléctrica'],
            ['value' => 'bateria', 'label' => 'Batería'],
            ['value' => 'manual', 'label' => 'Manual'],
            ['value' => 'neumatica', 'label' => 'Neumática'],
            ['value' => 'hidraulica', 'label' => 'Hidráulica'],
            ['value' => 'solar', 'label' => 'Solar']
        ];
    }

    /**
     * Obtener opciones de tecnologías
     */
    private static function getTecnologiasOptions(): array
    {
        return [
            ['value' => 'electronica', 'label' => 'Electrónica'],
            ['value' => 'mecanica', 'label' => 'Mecánica'],
            ['value' => 'hidraulica', 'label' => 'Hidráulica'],
            ['value' => 'neumatica', 'label' => 'Neumática'],
            ['value' => 'mixta', 'label' => 'Mixta'],
            ['value' => 'digital', 'label' => 'Digital']
        ];
    }

    /**
     * Obtener opciones de frecuencias de mantenimiento
     */
    private static function getFrecuenciasMantenimientoOptions(): array
    {
        return [
            ['value' => 'semanal', 'label' => 'Semanal'],
            ['value' => 'mensual', 'label' => 'Mensual'],
            ['value' => 'bimestral', 'label' => 'Bimestral'],
            ['value' => 'trimestral', 'label' => 'Trimestral'],
            ['value' => 'semestral', 'label' => 'Semestral'],
            ['value' => 'anual', 'label' => 'Anual']
        ];
    }

    /**
     * Obtener opciones de clasificaciones biomédicas
     */
    private static function getClasificacionesBiomedicasOptions(): array
    {
        return [
            ['value' => 'clase_i', 'label' => 'Clase I - Bajo Riesgo'],
            ['value' => 'clase_iia', 'label' => 'Clase IIa - Riesgo Moderado'],
            ['value' => 'clase_iib', 'label' => 'Clase IIb - Riesgo Moderado Alto'],
            ['value' => 'clase_iii', 'label' => 'Clase III - Alto Riesgo']
        ];
    }

    /**
     * Obtener opciones de clasificaciones de riesgo
     */
    private static function getClasificacionesRiesgoOptions(): array
    {
        return [
            ['value' => 'alto', 'label' => 'ALTO'],
            ['value' => 'medio_alto', 'label' => 'MEDIO ALTO'],
            ['value' => 'medio', 'label' => 'MEDIO'],
            ['value' => 'bajo', 'label' => 'BAJO']
        ];
    }

    /**
     * Obtener opciones de estados de equipo
     */
    private static function getEstadosEquipoOptions(): array
    {
        return [
            ['value' => 1, 'label' => 'Operativo'],
            ['value' => 0, 'label' => 'Fuera de Servicio'],
            ['value' => 2, 'label' => 'En Mantenimiento'],
            ['value' => 3, 'label' => 'Dado de Baja']
        ];
    }

    /**
     * Obtener opciones de tipos de equipo
     */
    private static function getTiposEquipoOptions(): array
    {
        return Cache::remember('tipos_equipo_options', self::STATIC_CACHE_TTL, function () {
            return DB::table('tipos')->select('id', 'nombre')->get()->map(function ($tipo) {
                return ['value' => $tipo->id, 'label' => $tipo->nombre];
            })->toArray();
        });
    }

    /**
     * Obtener opciones de disponibilidades
     */
    private static function getDisponibilidadesOptions(): array
    {
        return Cache::remember('disponibilidades_options', self::STATIC_CACHE_TTL, function () {
            return DB::table('disponibilidades')->select('id', 'nombre')->get()->map(function ($disp) {
                return ['value' => $disp->id, 'label' => $disp->nombre];
            })->toArray();
        });
    }

    /**
     * Obtener opciones de tipos de mantenimiento
     */
    private static function getTiposMantenimientoOptions(): array
    {
        return [
            ['value' => 'preventivo', 'label' => 'Preventivo'],
            ['value' => 'correctivo', 'label' => 'Correctivo'],
            ['value' => 'predictivo', 'label' => 'Predictivo'],
            ['value' => 'calibracion', 'label' => 'Calibración'],
            ['value' => 'verificacion', 'label' => 'Verificación']
        ];
    }

    /**
     * Obtener opciones de estados de mantenimiento
     */
    private static function getEstadosMantenimientoOptions(): array
    {
        return [
            ['value' => 'programado', 'label' => 'Programado'],
            ['value' => 'en_proceso', 'label' => 'En Proceso'],
            ['value' => 'completado', 'label' => 'Completado'],
            ['value' => 'cancelado', 'label' => 'Cancelado'],
            ['value' => 'reprogramado', 'label' => 'Reprogramado']
        ];
    }

    /**
     * Obtener opciones de prioridades
     */
    private static function getPrioridadesOptions(): array
    {
        return [
            ['value' => 'baja', 'label' => 'Baja'],
            ['value' => 'media', 'label' => 'Media'],
            ['value' => 'alta', 'label' => 'Alta'],
            ['value' => 'critica', 'label' => 'Crítica']
        ];
    }

    /**
     * Obtener opciones de periodicidades
     */
    private static function getPeriodicidadesOptions(): array
    {
        return [
            ['value' => 'diario', 'label' => 'Diario'],
            ['value' => 'semanal', 'label' => 'Semanal'],
            ['value' => 'mensual', 'label' => 'Mensual'],
            ['value' => 'trimestral', 'label' => 'Trimestral'],
            ['value' => 'semestral', 'label' => 'Semestral'],
            ['value' => 'anual', 'label' => 'Anual']
        ];
    }

    /**
     * Obtener historial de mantenimientos
     */
    private static function getMaintenanceHistory(int $equipoId): array
    {
        return Cache::remember("maintenance_history_{$equipoId}", self::DYNAMIC_CACHE_TTL, function () use ($equipoId) {
            return Mantenimiento::where('equipo_id', $equipoId)
                ->with(['tecnico'])
                ->orderBy('fecha_programada', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($maintenance) {
                    return ReactViewHelper::formatForReact($maintenance);
                })
                ->toArray();
        });
    }

    /**
     * Obtener historial de contingencias
     */
    private static function getContingencyHistory(int $equipoId): array
    {
        return Cache::remember("contingency_history_{$equipoId}", self::DYNAMIC_CACHE_TTL, function () use ($equipoId) {
            return Contingencia::where('equipo_id', $equipoId)
                ->with(['usuario_reporta', 'usuario_asignado'])
                ->orderBy('fecha_reporte', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($contingency) {
                    return ReactViewHelper::formatForReact($contingency);
                })
                ->toArray();
        });
    }

    /**
     * Obtener archivos de una entidad
     */
    private static function getEntityFiles(string $entityType, int $entityId): array
    {
        return Archivo::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->get()
            ->map(function ($file) {
                return ReactViewHelper::formatFileData($file);
            })
            ->toArray();
    }

    /**
     * Obtener reglas de validación para equipos
     */
    private static function getEquipmentValidationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:equipos,code',
            'descripcion' => 'nullable|string',
            'marca' => 'nullable|string|max:255',
            'modelo' => 'nullable|string|max:255',
            'serial' => 'nullable|string|max:255',
            'servicio_id' => 'required|integer|exists:servicios,id',
            'area_id' => 'required|integer|exists:areas,id',
            'costo' => 'nullable|numeric|min:0',
            'vida_util' => 'nullable|integer|min:1'
        ];
    }

    /**
     * Obtener reglas de validación para mantenimientos
     */
    private static function getMaintenanceValidationRules(): array
    {
        return [
            'equipo_id' => 'required|integer|exists:equipos,id',
            'tipo' => 'required|string|in:preventivo,correctivo,predictivo,calibracion,verificacion',
            'descripcion' => 'required|string',
            'fecha_programada' => 'required|date|after:today',
            'tecnico_id' => 'nullable|integer|exists:usuarios,id',
            'costo' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|integer|min:1'
        ];
    }

    /**
     * Obtener reglas de validación para contingencias
     */
    private static function getContingencyValidationRules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'prioridad' => 'required|string|in:baja,media,alta,critica',
            'tipo' => 'required|string',
            'equipo_id' => 'nullable|integer|exists:equipos,id'
        ];
    }

    /**
     * Obtener reglas de validación para usuarios
     */
    private static function getUserValidationRules(): array
    {
        return [
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100', // Corregido: 'apellido' no 'apellidos'
            'email' => 'required|email|unique:usuarios,email',
            'username' => 'required|string|max:45|unique:usuarios,username',
            'password' => 'required|string|min:6|confirmed',
            'rol_id' => 'required|integer|exists:roles,id'
        ];
    }

    /**
     * Obtener reglas de validación para archivos
     */
    private static function getFileValidationRules(): array
    {
        return [
            'file' => 'required|file|max:10240', // 10MB
            'tipo' => 'required|string',
            'entity_type' => 'nullable|string',
            'entity_id' => 'nullable|integer'
        ];
    }

    /**
     * Limpiar cache de modales
     */
    public static function clearModalCache(string $modalType = null, $itemId = null): void
    {
        if ($modalType && $itemId) {
            Cache::forget("modal_data_{$modalType}_{$itemId}");
        } elseif ($modalType) {
            // Limpiar todos los caches de este tipo de modal
            $patterns = ["modal_data_{$modalType}", "{$modalType}_modal_data"];
            foreach ($patterns as $pattern) {
                Cache::forget($pattern);
            }
        } else {
            // Limpiar todos los caches de modales
            Cache::flush(); // En producción, sería más específico
        }
    }
}
