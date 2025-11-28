<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Exception;

/**
 * Servicio simplificado para integración con SECOP
 */
class SecopServiceSimple
{
    private const SECOP_API_BASE = 'https://www.datos.gov.co/resource/jbjy-vk9h.json';
    private const CACHE_TTL = 30;

    public function consultarProcesos(array $filters = []): array
    {
        try {
            $limit = $filters['limit'] ?? 10;
            $cacheKey = 'secop_simple_' . md5(serialize($filters));
            
            // Verificar caché
            $cachedResult = Cache::get($cacheKey);
            if ($cachedResult) {
                return $cachedResult;
            }

            // Parámetros de la API
            $params = ['$limit' => $limit];
            
            // Agregar filtros
            if (!empty($filters['entidad'])) {
                // Mejorar búsqueda: "univalle" también busca "universidad del valle"
                $entidadBusqueda = $filters['entidad'];
                
                // Si buscan "univalle", expandir a "universidad valle" o "universidad del valle"
                if (stripos($entidadBusqueda, 'univalle') !== false || stripos($entidadBusqueda, 'uni valle') !== false) {
                    $params['$where'] = "(upper(nombre_entidad) like upper('%UNIVERSIDAD%VALLE%') OR upper(proveedor_adjudicado) like upper('%UNIVERSIDAD%VALLE%'))";
                } else {
                    $params['$where'] = "(upper(nombre_entidad) like upper('%" . $entidadBusqueda . "%') OR upper(proveedor_adjudicado) like upper('%" . $entidadBusqueda . "%'))";
                }
            }

            // Agregar búsqueda general
            if (!empty($filters['search'])) {
                $searchTerm = $filters['search'];
                $searchWhere = "upper(nombre_entidad) like upper('%" . $searchTerm . "%') OR upper(objeto_del_contrato) like upper('%" . $searchTerm . "%') OR upper(proveedor_adjudicado) like upper('%" . $searchTerm . "%')";
                
                if (isset($params['$where'])) {
                    $params['$where'] .= " AND (" . $searchWhere . ")";
                } else {
                    $params['$where'] = $searchWhere;
                }
            }

            // Logging de parámetros
            Log::info('SECOP: Consultando API con parámetros', ['params' => $params]);
            
            // Hacer petición
            $response = Http::timeout(30)->get(self::SECOP_API_BASE, $params);

            if (!$response->successful()) {
                Log::error('SECOP: Error en respuesta API', ['status' => $response->status()]);
                throw new Exception("Error API: HTTP {$response->status()}");
            }
            
            Log::info('SECOP: Respuesta exitosa', ['count' => count($response->json())]);


            $data = $response->json();
            
            // Formatear datos
            $processedData = [];
            foreach ($data as $item) {
                $processedData[] = [
                    'id' => $item['id_contrato'] ?? '',
                    'entidad' => $item['nombre_entidad'] ?? '',
                    'objeto' => $item['objeto_del_contrato'] ?? '',
                    'proveedor' => $item['proveedor_adjudicado'] ?? '',
                    'valor' => $item['valor_del_contrato'] ?? 0,
                    'fecha_firma' => $item['fecha_de_firma'] ?? '',
                    'estado' => $item['estado_contrato'] ?? '',
                    'proceso' => $item['proceso_de_compra'] ?? '',
                    'referencia' => $item['referencia_del_contrato'] ?? ''
                ];
            }
            
            $result = [
                'success' => true,
                'data' => $processedData,
                'total' => count($processedData)
            ];
            
            // Guardar en caché
            Cache::put($cacheKey, $result, self::CACHE_TTL);
            
            return $result;

        } catch (Exception $e) {
            Log::error('SECOP Error: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'data' => []
            ];
        }
    }

    public function buscarProcesos(array $filters = []): array
    {
        return $this->consultarProcesos($filters);
    }

    public function obtenerEstadisticas(): array
    {
        try {
            $response = Http::timeout(30)->get(self::SECOP_API_BASE, ['$limit' => 1]);
            
            if ($response->successful()) {
                return [
                    'success' => true,
                    'disponible' => true,
                    'endpoint' => self::SECOP_API_BASE
                ];
            }
            
            return [
                'success' => false,
                'disponible' => false,
                'error' => 'API no disponible'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'disponible' => false,
                'error' => $e->getMessage()
            ];
        }
    }
}
