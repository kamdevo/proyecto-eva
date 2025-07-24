<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Interactions\InteraccionEquipos;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Controlador para debugging y limpieza de datos de equipos
 * Implementa funcionalidades de análisis y normalización de nomenclatura
 */
class EquipmentDebuggingController extends Controller
{
    /**
     * Obtener análisis de nombres duplicados y inconsistentes
     */
    public function getNameAnalysis(Request $request)
    {
        try {
            // Debug logging
            Log::info('EquipmentDebugging: getNameAnalysis called', [
                'request_data' => $request->all(),
                'query_params' => $request->query(),
                'method' => $request->method(),
                'headers' => $request->headers->all()
            ]);

            $validator = Validator::make($request->all(), [
                'per_page' => 'nullable|numeric|min:5|max:100',
                'page' => 'nullable|numeric|min:1',
                'search' => 'nullable|string|max:255',
                'min_count' => 'nullable|numeric|min:1',
                'sort_by' => 'nullable|string|in:name,count,alphabetical',
                'sort_direction' => 'nullable|string|in:asc,desc'
            ]);

            if ($validator->fails()) {
                Log::error('EquipmentDebugging: Validation failed', [
                    'errors' => $validator->errors()->toArray(),
                    'request_data' => $request->all()
                ]);
                return ResponseFormatter::validation($validator->errors());
            }

            $perPage = $request->get('per_page', 10);
            $search = $request->get('search', '');
            $minCount = $request->get('min_count', 1);
            $sortBy = $request->get('sort_by', 'count');
            $sortDirection = $request->get('sort_direction', 'desc');

            // Consulta base para análisis de nombres
            $query = DB::table('equipos')
                ->select('name', DB::raw('COUNT(*) as count'))
                ->where('status', 1)
                ->whereNotNull('name')
                ->where('name', '!=', '');

            // Aplicar filtro de búsqueda si existe
            if (!empty($search)) {
                $query->where('name', 'like', "%{$search}%");
            }

            // Agrupar por nombre y filtrar por cantidad mínima
            $query->groupBy('name')
                ->having('count', '>=', $minCount);

            // Aplicar ordenamiento
            switch ($sortBy) {
                case 'name':
                case 'alphabetical':
                    $query->orderBy('name', $sortDirection);
                    break;
                case 'count':
                default:
                    $query->orderBy('count', $sortDirection);
                    break;
            }

            // Obtener resultados paginados
            $results = $query->paginate($perPage);

            // Enriquecer datos con análisis adicional
            $enrichedData = $results->getCollection()->map(function ($item) {
                return [
                    'name' => $item->name,
                    'count' => $item->count,
                    'normalized_name' => $this->normalizeEquipmentName($item->name),
                    'potential_duplicates' => $this->findPotentialDuplicates($item->name),
                    'suggested_name' => $this->suggestStandardName($item->name),
                    'analysis' => [
                        'has_special_chars' => $this->hasSpecialCharacters($item->name),
                        'has_extra_spaces' => $this->hasExtraSpaces($item->name),
                        'is_mixed_case' => $this->isMixedCase($item->name),
                        'length' => strlen($item->name),
                        'word_count' => str_word_count($item->name)
                    ]
                ];
            });

            $results->setCollection($enrichedData);

            // Estadísticas generales
            $stats = $this->getGeneralStats($search, $minCount);

            return ResponseFormatter::success([
                'data' => $results->items(),
                'pagination' => [
                    'current_page' => $results->currentPage(),
                    'last_page' => $results->lastPage(),
                    'per_page' => $results->perPage(),
                    'total' => $results->total(),
                    'from' => $results->firstItem(),
                    'to' => $results->lastItem()
                ],
                'stats' => $stats,
                'filters' => [
                    'search' => $search,
                    'min_count' => $minCount,
                    'sort_by' => $sortBy,
                    'sort_direction' => $sortDirection
                ]
            ], 'Análisis de nombres obtenido exitosamente');

        } catch (\Exception $e) {
            Log::error('Error en análisis de nombres de equipos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return ResponseFormatter::error(
                'Error al obtener análisis de nombres: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Obtener estadísticas generales del sistema
     */
    private function getGeneralStats($search = '', $minCount = 1)
    {
        try {
            $baseQuery = DB::table('equipos')
                ->where('status', 1)
                ->whereNotNull('name')
                ->where('name', '!=', '');

            if (!empty($search)) {
                $baseQuery->where('name', 'like', "%{$search}%");
            }

            $totalEquipment = $baseQuery->count();
            
            $uniqueNamesQuery = clone $baseQuery;
            $uniqueNames = $uniqueNamesQuery->distinct('name')->count('name');

            $duplicateNamesQuery = DB::table('equipos')
                ->select('name', DB::raw('COUNT(*) as count'))
                ->where('status', 1)
                ->whereNotNull('name')
                ->where('name', '!=', '');

            if (!empty($search)) {
                $duplicateNamesQuery->where('name', 'like', "%{$search}%");
            }

            $duplicateNames = $duplicateNamesQuery
                ->groupBy('name')
                ->having('count', '>', 1)
                ->count();

            $potentialIssues = $this->countPotentialIssues($search);

            return [
                'total_equipment' => $totalEquipment,
                'unique_names' => $uniqueNames,
                'duplicate_names' => $duplicateNames,
                'potential_issues' => $potentialIssues,
                'cleanup_potential' => $duplicateNames > 0 ? round(($duplicateNames / $uniqueNames) * 100, 2) : 0,
                'last_updated' => Carbon::now()->toISOString()
            ];

        } catch (\Exception $e) {
            Log::error('Error calculando estadísticas generales', ['error' => $e->getMessage()]);
            
            return [
                'total_equipment' => 0,
                'unique_names' => 0,
                'duplicate_names' => 0,
                'potential_issues' => 0,
                'cleanup_potential' => 0,
                'last_updated' => Carbon::now()->toISOString(),
                'error' => 'Error calculando estadísticas'
            ];
        }
    }

    /**
     * Contar problemas potenciales en nombres
     */
    private function countPotentialIssues($search = '')
    {
        try {
            $query = DB::table('equipos')
                ->where('status', 1)
                ->whereNotNull('name')
                ->where('name', '!=', '');

            if (!empty($search)) {
                $query->where('name', 'like', "%{$search}%");
            }

            $names = $query->pluck('name');
            $issues = 0;

            foreach ($names as $name) {
                if ($this->hasSpecialCharacters($name) ||
                    $this->hasExtraSpaces($name) ||
                    $this->isMixedCase($name)) {
                    $issues++;
                }
            }

            return $issues;

        } catch (\Exception $e) {
            Log::error('Error contando problemas potenciales', ['error' => $e->getMessage()]);
            return 0;
        }
    }

    /**
     * Normalizar nombre de equipo
     */
    private function normalizeEquipmentName($name)
    {
        if (empty($name)) return '';

        // Aplicar normalización básica
        $normalized = trim($name);
        $normalized = preg_replace('/\s+/', ' ', $normalized);
        $normalized = ucwords(strtolower($normalized));
        
        // Remover caracteres especiales problemáticos
        $normalized = preg_replace('/[^\w\s\-\(\)\/]/', '', $normalized);
        
        return $normalized;
    }

    /**
     * Encontrar duplicados potenciales
     */
    private function findPotentialDuplicates($name)
    {
        try {
            $normalized = $this->normalizeEquipmentName($name);
            
            $duplicates = DB::table('equipos')
                ->select('name', DB::raw('COUNT(*) as count'))
                ->where('status', 1)
                ->where('name', '!=', $name)
                ->whereRaw('UPPER(TRIM(REGEXP_REPLACE(name, "[^a-zA-Z0-9 ]", ""))) LIKE ?', 
                    ['%' . strtoupper(trim(preg_replace('/[^a-zA-Z0-9 ]/', '', $normalized))) . '%'])
                ->groupBy('name')
                ->limit(5)
                ->get();

            return $duplicates->toArray();

        } catch (\Exception $e) {
            Log::error('Error buscando duplicados potenciales', ['error' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Sugerir nombre estándar
     */
    private function suggestStandardName($name)
    {
        // Diccionario de nombres estándar comunes
        $standardNames = [
            'monitor' => 'Monitor de Signos Vitales',
            'ventilador' => 'Ventilador Mecánico',
            'desfibrilador' => 'Desfibrilador',
            'electrocardiografo' => 'Electrocardiógrafo',
            'bomba' => 'Bomba de Infusión',
            'rayos' => 'Equipo de Rayos X',
            'ultrasonido' => 'Ecógrafo',
            'incubadora' => 'Incubadora Neonatal'
        ];

        $nameLower = strtolower($name);
        
        foreach ($standardNames as $key => $standard) {
            if (strpos($nameLower, $key) !== false) {
                return $standard;
            }
        }

        return $this->normalizeEquipmentName($name);
    }

    /**
     * Verificar si tiene caracteres especiales
     */
    private function hasSpecialCharacters($name)
    {
        return preg_match('/[^\w\s\-\(\)\/]/', $name) === 1;
    }

    /**
     * Verificar si tiene espacios extra
     */
    private function hasExtraSpaces($name)
    {
        return preg_match('/\s{2,}/', $name) === 1 || 
               trim($name) !== $name;
    }

    /**
     * Verificar si tiene mayúsculas y minúsculas mezcladas incorrectamente
     */
    private function isMixedCase($name)
    {
        return $name !== ucwords(strtolower($name)) &&
               $name !== strtoupper($name) &&
               $name !== strtolower($name);
    }

    /**
     * Test endpoint para verificar conectividad
     */
    public function testConnection(Request $request)
    {
        return ResponseFormatter::success([
            'message' => 'Conexión exitosa',
            'timestamp' => Carbon::now()->toISOString(),
            'request_data' => $request->all()
        ], 'Test de conexión exitoso');
    }

    /**
     * Aplicar limpieza de nombres seleccionados
     */
    public function applyNameCleaning(Request $request)
    {
        try {
            // Log de entrada para debugging
            Log::info('EquipmentDebugging: applyNameCleaning called', [
                'request_data' => $request->all(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            $validator = Validator::make($request->all(), [
                'selected_names' => 'required|array|min:1',
                'selected_names.*' => 'required|string|max:255',
                'new_name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'apply_to_all' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $selectedNames = $request->get('selected_names');
            $newName = trim($request->get('new_name'));
            $description = $request->get('description', '');
            $applyToAll = $request->get('apply_to_all', false);

            // Validar que el nuevo nombre no esté vacío
            if (empty($newName)) {
                return ResponseFormatter::error('El nuevo nombre no puede estar vacío', 400);
            }

            DB::beginTransaction();

            $updatedCount = 0;
            $affectedEquipment = [];

            try {
                foreach ($selectedNames as $oldName) {
                    Log::info('Processing name change', ['old_name' => $oldName, 'new_name' => $newName]);

                    // Obtener equipos con este nombre
                    $equipos = Equipo::where('name', $oldName)
                        ->where('status', 1)
                        ->get();

                    Log::info('Found equipos for name', ['old_name' => $oldName, 'count' => $equipos->count()]);

                    foreach ($equipos as $equipo) {
                        $oldEquipmentName = $equipo->name;

                        // Actualizar nombre
                        $equipo->name = $newName;

                        // Actualizar descripción si se proporcionó
                        if (!empty($description)) {
                            $equipo->descripcion = $description;
                        }

                        $equipo->save();

                        $updatedCount++;
                        $affectedEquipment[] = [
                            'id' => $equipo->id,
                            'code' => $equipo->code ?? 'N/A',
                            'old_name' => $oldEquipmentName,
                            'new_name' => $newName,
                            'servicio' => optional($equipo->servicio)->name ?? 'N/A',
                            'area' => optional($equipo->area)->name ?? 'N/A'
                        ];
                    }
                }

                DB::commit();

                // Log de la operación
                Log::info('Limpieza de nombres de equipos aplicada', [
                    'selected_names' => $selectedNames,
                    'new_name' => $newName,
                    'updated_count' => $updatedCount,
                    'user_id' => 'system' // Sin autenticación para debugging
                ]);

                return ResponseFormatter::success([
                    'updated_count' => $updatedCount,
                    'affected_equipment' => $affectedEquipment,
                    'operation_summary' => [
                        'old_names' => $selectedNames,
                        'new_name' => $newName,
                        'description' => $description,
                        'timestamp' => Carbon::now()->toISOString()
                    ]
                ], "Se actualizaron {$updatedCount} equipos exitosamente");

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error aplicando limpieza de nombres', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return ResponseFormatter::error(
                'Error al aplicar limpieza de nombres: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Obtener vista previa de cambios antes de aplicar
     */
    public function previewChanges(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'selected_names' => 'required|array|min:1',
                'selected_names.*' => 'required|string|max:255',
                'new_name' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $selectedNames = $request->get('selected_names');
            $newName = trim($request->get('new_name'));

            $preview = [];
            $totalAffected = 0;

            foreach ($selectedNames as $oldName) {
                $equipos = Equipo::where('name', $oldName)
                    ->where('status', 1)
                    ->with(['servicio:id,name', 'area:id,name'])
                    ->get();

                $equipmentList = $equipos->map(function ($equipo) use ($newName) {
                    return [
                        'id' => $equipo->id,
                        'code' => $equipo->code,
                        'current_name' => $equipo->name,
                        'new_name' => $newName,
                        'servicio' => $equipo->servicio->name ?? 'N/A',
                        'area' => $equipo->area->name ?? 'N/A',
                        'marca' => $equipo->marca,
                        'modelo' => $equipo->modelo
                    ];
                });

                $preview[] = [
                    'old_name' => $oldName,
                    'new_name' => $newName,
                    'affected_count' => $equipos->count(),
                    'equipment' => $equipmentList
                ];

                $totalAffected += $equipos->count();
            }

            return ResponseFormatter::success([
                'preview' => $preview,
                'summary' => [
                    'total_names_to_change' => count($selectedNames),
                    'total_equipment_affected' => $totalAffected,
                    'new_standard_name' => $newName
                ]
            ], 'Vista previa de cambios generada exitosamente');

        } catch (\Exception $e) {
            Log::error('Error generando vista previa', [
                'error' => $e->getMessage(),
                'request_data' => $request->all()
            ]);

            return ResponseFormatter::error(
                'Error al generar vista previa: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Obtener sugerencias de nombres estándar
     */
    public function getNameSuggestions(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|min:2|max:100'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $query = $request->get('query');

            // Obtener nombres más comunes que coincidan
            $suggestions = DB::table('equipos')
                ->select('name', DB::raw('COUNT(*) as frequency'))
                ->where('status', 1)
                ->where('name', 'like', "%{$query}%")
                ->groupBy('name')
                ->orderBy('frequency', 'desc')
                ->limit(10)
                ->get();

            // Agregar sugerencias predefinidas
            $predefinedSuggestions = $this->getPredefinedSuggestions($query);

            return ResponseFormatter::success([
                'database_suggestions' => $suggestions,
                'predefined_suggestions' => $predefinedSuggestions,
                'query' => $query
            ], 'Sugerencias obtenidas exitosamente');

        } catch (\Exception $e) {
            Log::error('Error obteniendo sugerencias', [
                'error' => $e->getMessage(),
                'query' => $request->get('query', '')
            ]);

            return ResponseFormatter::error(
                'Error al obtener sugerencias: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Obtener sugerencias predefinidas
     */
    private function getPredefinedSuggestions($query)
    {
        $predefined = [
            'Monitor de Signos Vitales',
            'Ventilador Mecánico',
            'Desfibrilador',
            'Electrocardiógrafo',
            'Bomba de Infusión',
            'Equipo de Rayos X',
            'Ecógrafo',
            'Incubadora Neonatal',
            'Cama Hospitalaria',
            'Lámpara Quirúrgica',
            'Mesa Quirúrgica',
            'Autoclave',
            'Centrífuga',
            'Microscopio',
            'Analizador de Química Sanguínea'
        ];

        $queryLower = strtolower($query);

        return array_filter($predefined, function ($suggestion) use ($queryLower) {
            return strpos(strtolower($suggestion), $queryLower) !== false;
        });
    }
}
