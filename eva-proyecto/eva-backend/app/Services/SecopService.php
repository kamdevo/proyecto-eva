<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

/**
 * Servicio para integración con SECOP (Sistema Electrónico de Contratación Pública)
 * 
 * Este servicio maneja la comunicación con la API del gobierno colombiano
 * para consultar procesos de contratación pública.
 */
class SecopService
{
    /**
     * URL base de la API de SECOP II
     */
    private const SECOP_API_BASE = 'https://www.datos.gov.co/resource/jbjy-vk9h.json';
    
    /**
     * Límite de registros por consulta
     */
    private const DEFAULT_LIMIT = 100;
    
    /**
     * Tiempo de caché en minutos
     */
    private const CACHE_TTL = 30;

    /**
     * Consultar procesos SECOP con filtros
     *
     * @param array $filters Filtros de búsqueda
     * @return array
     */
    public function consultarProcesos(array $filters = []): array
    {
        try {
            // Construir query de búsqueda
            $query = $this->buildQuery($filters);
            
            // Generar clave de caché
            $cacheKey = 'secop_consulta_' . md5($query);
            
            // Intentar obtener de caché primero
            $cachedResult = Cache::get($cacheKey);
            if ($cachedResult) {
                Log::info('SECOP: Datos obtenidos de caché', ['query' => $query]);
                return $cachedResult;
            }

            // Realizar consulta a la API
            $response = Http::timeout(30)
                ->get(self::SECOP_API_BASE, [
                    '$query' => $query,
                    '$limit' => self::DEFAULT_LIMIT
                ]);

            if (!$response->successful()) {
                throw new Exception("Error en API SECOP: HTTP {$response->status()}");
            }

            $data = $response->json();
            
            // Procesar y formatear datos
            $processedData = $this->processSecopData($data);
            
            // Guardar en caché
            Cache::put($cacheKey, $processedData, self::CACHE_TTL);
            
            Log::info('SECOP: Consulta exitosa', [
                'registros' => count($processedData['data']),
                'query' => $query
            ]);

            return $processedData;

        } catch (Exception $e) {
            Log::error('SECOP: Error en consulta', [
                'error' => $e->getMessage(),
                'filters' => $filters
            ]);

            return [
                'success' => false,
                'error' => 'Error al consultar SECOP: ' . $e->getMessage(),
                'data' => []
            ];
        }
    }

    /**
     * Obtener proceso específico por UID
     *
     * @param string $uid UID del proceso SECOP
     * @return array
     */
    public function obtenerProcesoPorUid(string $uid): array
    {
        try {
            $cacheKey = "secop_proceso_{$uid}";
            
            // Verificar caché
            $cachedResult = Cache::get($cacheKey);
            if ($cachedResult) {
                return $cachedResult;
            }

            $query = "SELECT * WHERE uid='{$uid}'";
            
            $response = Http::timeout(15)
                ->get(self::SECOP_API_BASE, [
                    '$query' => $query
                ]);

            if (!$response->successful()) {
                throw new Exception("Error en API SECOP: HTTP {$response->status()}");
            }

            $data = $response->json();
            
            if (empty($data)) {
                return [
                    'success' => false,
                    'error' => 'Proceso no encontrado',
                    'data' => null
                ];
            }

            $proceso = $this->formatearProceso($data[0]);
            
            // Guardar en caché por más tiempo (1 hora)
            Cache::put($cacheKey, $proceso, 60);
            
            return [
                'success' => true,
                'data' => $proceso
            ];

        } catch (Exception $e) {
            Log::error('SECOP: Error obteniendo proceso por UID', [
                'uid' => $uid,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al obtener proceso: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Buscar procesos por texto
     *
     * @param string $searchTerm Término de búsqueda
     * @param int $limit Límite de resultados
     * @return array
     */
    public function buscarProcesos(string $searchTerm, int $limit = 50): array
    {
        $filters = [
            'search' => $searchTerm,
            'limit' => $limit
        ];

        return $this->consultarProcesos($filters);
    }

    /**
     * Obtener estadísticas de SECOP
     *
     * @return array
     */
    public function obtenerEstadisticas(): array
    {
        try {
            $cacheKey = 'secop_estadisticas';
            
            $cachedStats = Cache::get($cacheKey);
            if ($cachedStats) {
                return $cachedStats;
            }

            // Consulta para obtener estadísticas básicas
            $query = "SELECT COUNT(*) as total";
            
            $response = Http::timeout(20)
                ->get(self::SECOP_API_BASE, [
                    '$query' => $query
                ]);

            if (!$response->successful()) {
                throw new Exception("Error en API SECOP: HTTP {$response->status()}");
            }

            $data = $response->json();
            
            $stats = [
                'success' => true,
                'total_procesos' => $data[0]['total'] ?? 0,
                'ultima_actualizacion' => now()->format('Y-m-d H:i:s'),
                'fuente' => 'datos.gov.co'
            ];
            
            // Caché por 1 hora
            Cache::put($cacheKey, $stats, 60);
            
            return $stats;

        } catch (Exception $e) {
            Log::error('SECOP: Error obteniendo estadísticas', [
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Error al obtener estadísticas',
                'total_procesos' => 0
            ];
        }
    }

    /**
     * Construir query SQL para la API de SECOP
     *
     * @param array $filters
     * @return string
     */
    private function buildQuery(array $filters): string
    {
        $conditions = [];
        
        // Filtro por entidad
        if (!empty($filters['entidad'])) {
            $conditions[] = "nombre_entidad LIKE '%{$filters['entidad']}%'";
        }
        
        // Filtro por objeto del contrato
        if (!empty($filters['objeto'])) {
            $conditions[] = "objeto_del_contrato LIKE '%{$filters['objeto']}%'";
        }
        
        // Filtro por rango de fechas
        if (!empty($filters['fecha_inicio'])) {
            $conditions[] = "fecha_de_firma >= '{$filters['fecha_inicio']}'";
        }
        
        if (!empty($filters['fecha_fin'])) {
            $conditions[] = "fecha_de_firma <= '{$filters['fecha_fin']}'";
        }
        
        // Filtro por valor mínimo
        if (!empty($filters['valor_minimo'])) {
            $conditions[] = "valor_del_contrato >= {$filters['valor_minimo']}";
        }
        
        // Búsqueda general
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $conditions[] = "(nombre_entidad LIKE '%{$searchTerm}%' OR objeto_del_contrato LIKE '%{$searchTerm}%' OR proveedor_adjudicado LIKE '%{$searchTerm}%')";
        }
        
        // Construir query final
        $query = "SELECT *";
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $query .= " ORDER BY fecha_de_firma DESC";
        
        return $query;
    }

    /**
     * Procesar datos de SECOP para formato estándar
     *
     * @param array $data
     * @return array
     */
    private function processSecopData(array $data): array
    {
        $processedData = [];
        
        foreach ($data as $item) {
            $processedData[] = $this->formatearProceso($item);
        }
        
        return [
            'success' => true,
            'total' => count($processedData),
            'data' => $processedData
        ];
    }

    /**
     * Formatear un proceso individual de SECOP
     *
     * @param array $proceso
     * @return array
     */
    private function formatearProceso(array $proceso): array
    {
        return [
            'uid' => $proceso['uid'] ?? null,
            'numero_constancia' => $proceso['numero_de_constancia'] ?? null,
            'entidad' => $proceso['nombre_entidad'] ?? null,
            'objeto' => $proceso['objeto_contratar'] ?? null,
            'valor' => $proceso['valor_del_contrato'] ?? 0,
            'fecha_firma' => $proceso['fecha_de_firma'] ?? null,
            'estado' => $proceso['estado_del_proceso'] ?? null,
            'modalidad' => $proceso['modalidad_de_contratacion'] ?? null,
            'url_secop' => $proceso['ruta_proceso_en_secop_i']['url'] ?? null,
            'nit_entidad' => $proceso['nit_entidad'] ?? null,
            'departamento' => $proceso['departamento'] ?? null,
            'ciudad' => $proceso['ciudad'] ?? null,
            'fecha_inicio_ejecucion' => $proceso['fecha_de_inicio_del_contrato'] ?? null,
            'fecha_fin_ejecucion' => $proceso['fecha_de_fin_del_contrato'] ?? null,
            'tipo_contrato' => $proceso['tipo_de_contrato'] ?? null,
        ];
    }

    /**
     * Limpiar caché de SECOP
     *
     * @return bool
     */
    public function limpiarCache(): bool
    {
        try {
            Cache::flush();
            Log::info('SECOP: Caché limpiado exitosamente');
            return true;
        } catch (Exception $e) {
            Log::error('SECOP: Error limpiando caché', ['error' => $e->getMessage()]);
            return false;
        }
    }
}
