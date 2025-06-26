<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

/**
 * @OA\Info(
 *     title="EVA - Sistema de Gestión de Equipos API",
 *     version="1.0.0",
 *     description="API para el sistema de gestión de equipos biomédicos EVA",
 *     @OA\Contact(
 *         email="admin@eva-system.com",
 *         name="Equipo de Desarrollo EVA"
 *     ),
 *     @OA\License(
 *         name="MIT",
 *         url="https://opensource.org/licenses/MIT"
 *     )
 * )
 * 
 * @OA\Server(
 *     url="http://localhost:8000/api",
 *     description="Servidor de Desarrollo"
 * )
 * 
 * @OA\SecurityScheme(
 *     securityScheme="sanctum",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     description="Token de autenticación Sanctum"
 * )
 * 
 * @OA\Tag(
 *     name="Autenticación",
 *     description="Endpoints para autenticación de usuarios"
 * )
 * 
 * @OA\Tag(
 *     name="Equipos",
 *     description="Gestión de equipos biomédicos"
 * )
 * 
 * @OA\Tag(
 *     name="Dashboard",
 *     description="Estadísticas y datos del dashboard"
 * )
 * 
 * @OA\Tag(
 *     name="Mantenimientos",
 *     description="Gestión de mantenimientos"
 * )
 * 
 * @OA\Tag(
 *     name="Contingencias",
 *     description="Gestión de contingencias"
 * )
 * 
 * @OA\Tag(
 *     name="Archivos",
 *     description="Gestión de archivos y documentos"
 * )
 * 
 * @OA\Schema(
 *     schema="Equipment",
 *     type="object",
 *     title="Equipo",
 *     description="Modelo de equipo biomédico",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Monitor de Signos Vitales"),
 *     @OA\Property(property="code", type="string", example="EQ-001-MSV"),
 *     @OA\Property(property="marca", type="string", example="Philips"),
 *     @OA\Property(property="modelo", type="string", example="IntelliVue MX40"),
 *     @OA\Property(property="serial", type="string", example="SN123456789"),
 *     @OA\Property(property="descripcion", type="string", example="Monitor portátil de signos vitales"),
 *     @OA\Property(property="costo", type="number", format="float", example=15000.50),
 *     @OA\Property(property="fecha_fabricacion", type="string", format="date", example="2022-01-15"),
 *     @OA\Property(property="fecha_instalacion", type="string", format="date", example="2022-03-10"),
 *     @OA\Property(property="vida_util", type="integer", example=10),
 *     @OA\Property(property="status", type="boolean", example=true),
 *     @OA\Property(property="servicio_id", type="integer", example=1),
 *     @OA\Property(property="area_id", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="datetime"),
 *     @OA\Property(property="updated_at", type="string", format="datetime")
 * )
 * 
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     title="Usuario",
 *     description="Modelo de usuario del sistema",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="nombre", type="string", example="Juan"),
 *     @OA\Property(property="apellido", type="string", example="Pérez"),
 *     @OA\Property(property="email", type="string", format="email", example="juan.perez@hospital.com"),
 *     @OA\Property(property="username", type="string", example="jperez"),
 *     @OA\Property(property="telefono", type="string", example="+57 300 123 4567"),
 *     @OA\Property(property="rol_id", type="integer", example=2),
 *     @OA\Property(property="estado", type="integer", example=1),
 *     @OA\Property(property="created_at", type="string", format="datetime"),
 *     @OA\Property(property="updated_at", type="string", format="datetime")
 * )
 * 
 * @OA\Schema(
 *     schema="ApiResponse",
 *     type="object",
 *     title="Respuesta API",
 *     description="Formato estándar de respuesta de la API",
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="message", type="string", example="Operación exitosa"),
 *     @OA\Property(property="data", type="object", description="Datos de respuesta"),
 *     @OA\Property(property="meta", type="object", description="Metadatos adicionales")
 * )
 * 
 * @OA\Schema(
 *     schema="ValidationError",
 *     type="object",
 *     title="Error de Validación",
 *     description="Respuesta de error de validación",
 *     @OA\Property(property="success", type="boolean", example=false),
 *     @OA\Property(property="message", type="string", example="Error de validación"),
 *     @OA\Property(
 *         property="errors",
 *         type="object",
 *         @OA\Property(
 *             property="field_name",
 *             type="array",
 *             @OA\Items(type="string", example="El campo es obligatorio")
 *         )
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="PaginatedResponse",
 *     type="object",
 *     title="Respuesta Paginada",
 *     description="Respuesta con paginación",
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="message", type="string", example="Datos obtenidos exitosamente"),
 *     @OA\Property(
 *         property="data",
 *         type="object",
 *         @OA\Property(property="current_page", type="integer", example=1),
 *         @OA\Property(property="data", type="array", @OA\Items(type="object")),
 *         @OA\Property(property="first_page_url", type="string"),
 *         @OA\Property(property="from", type="integer", example=1),
 *         @OA\Property(property="last_page", type="integer", example=5),
 *         @OA\Property(property="last_page_url", type="string"),
 *         @OA\Property(property="next_page_url", type="string"),
 *         @OA\Property(property="path", type="string"),
 *         @OA\Property(property="per_page", type="integer", example=15),
 *         @OA\Property(property="prev_page_url", type="string"),
 *         @OA\Property(property="to", type="integer", example=15),
 *         @OA\Property(property="total", type="integer", example=75)
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="DashboardStats",
 *     type="object",
 *     title="Estadísticas del Dashboard",
 *     description="Estadísticas principales del sistema",
 *     @OA\Property(
 *         property="equipos",
 *         type="object",
 *         @OA\Property(property="total", type="integer", example=150),
 *         @OA\Property(property="activos", type="integer", example=145),
 *         @OA\Property(property="inactivos", type="integer", example=5),
 *         @OA\Property(property="criticos", type="integer", example=25),
 *         @OA\Property(property="con_mantenimiento_vencido", type="integer", example=3)
 *     ),
 *     @OA\Property(
 *         property="mantenimientos",
 *         type="object",
 *         @OA\Property(property="programados", type="integer", example=45),
 *         @OA\Property(property="en_proceso", type="integer", example=12),
 *         @OA\Property(property="completados", type="integer", example=230),
 *         @OA\Property(property="vencidos", type="integer", example=3)
 *     ),
 *     @OA\Property(
 *         property="contingencias",
 *         type="object",
 *         @OA\Property(property="abiertas", type="integer", example=8),
 *         @OA\Property(property="criticas", type="integer", example=2),
 *         @OA\Property(property="resueltas", type="integer", example=156)
 *     )
 * )
 */
class SwaggerController extends Controller
{
    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'swagger_';
    const SUPPORTED_FORMATS = ['json', 'yaml', 'html', 'pdf'];
    const API_VERSION = '2.0.0';
    const DOCS_PATH = 'storage/api-docs';

    // ==========================================
    // CONSTRUCTOR Y MIDDLEWARE
    // ==========================================

    public function __construct()
    {
        // Middleware para documentación
        $this->middleware('throttle:100,1'); // Rate limiting más permisivo para docs

        // Log de acceso a documentación
        $this->middleware(function ($request, $next) {
            \Illuminate\Support\Facades\Log::info('Acceso a documentación API', [
                'user_id' => auth()->id(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'endpoint' => $request->path(),
                'timestamp' => now()
            ]);

            return $next($request);
        });
    }

    /**
     * Display Swagger UI
     */
    public function index()
    {
        try {
            // Verificar si existe la vista de documentación
            if (!view()->exists('swagger.index')) {
                return $this->generateDefaultDocsView();
            }

            // Obtener estadísticas de uso de la API
            $apiStats = $this->getApiUsageStats();

            // Obtener información de versión
            $versionInfo = $this->getVersionInfo();

            return view('swagger.index', compact('apiStats', 'versionInfo'));

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error mostrando documentación Swagger', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->view('errors.swagger-error', [
                'message' => 'Error al cargar la documentación'
            ], 500);
        }
    }

    /**
     * Generate OpenAPI JSON
     */
    public function json()
    {
        try {
            $cacheKey = self::CACHE_PREFIX . 'openapi_json';

            $openApiSpec = \Illuminate\Support\Facades\Cache::remember($cacheKey, self::CACHE_TTL, function () {
                $openapi = \OpenApi\Generator::scan([
                    app_path('Http/Controllers/Api'),
                    app_path('Models'),
                    app_path('Http/Requests')
                ]);

                return $openapi->toArray();
            });

            return response()->json($openApiSpec, 200, [
                'Content-Type' => 'application/json',
                'Cache-Control' => 'public, max-age=' . self::CACHE_TTL
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generando especificación JSON', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Error al generar especificación OpenAPI',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/docs/yaml",
     *     tags={"Documentación"},
     *     summary="Obtener especificación OpenAPI en formato YAML",
     *     description="Retorna la especificación completa de la API en formato YAML",
     *     @OA\Response(
     *         response=200,
     *         description="Especificación YAML obtenida exitosamente",
     *         @OA\MediaType(
     *             mediaType="application/x-yaml",
     *             @OA\Schema(type="string")
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Obtener especificación OpenAPI en YAML
     */
    public function yaml()
    {
        try {
            $cacheKey = self::CACHE_PREFIX . 'openapi_yaml';

            $yamlSpec = \Illuminate\Support\Facades\Cache::remember($cacheKey, self::CACHE_TTL, function () {
                $openapi = \OpenApi\Generator::scan([
                    app_path('Http/Controllers/Api'),
                    app_path('Models'),
                    app_path('Http/Requests')
                ]);

                return \Symfony\Component\Yaml\Yaml::dump($openapi->toArray(), 10, 2);
            });

            return response($yamlSpec, 200, [
                'Content-Type' => 'application/x-yaml',
                'Content-Disposition' => 'attachment; filename="api-spec.yaml"',
                'Cache-Control' => 'public, max-age=' . self::CACHE_TTL
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error generando especificación YAML', [
                'error' => $e->getMessage()
            ]);

            return response('Error al generar especificación YAML: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/docs/stats",
     *     tags={"Documentación"},
     *     summary="Obtener estadísticas de uso de la API",
     *     description="Retorna estadísticas detalladas del uso de endpoints de la API",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estadísticas obtenidas exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="total_endpoints", type="integer", example=45),
     *             @OA\Property(property="endpoints_activos", type="integer", example=42),
     *             @OA\Property(property="total_requests_hoy", type="integer", example=1250),
     *             @OA\Property(property="endpoints_mas_usados", type="array", @OA\Items(type="object")),
     *             @OA\Property(property="errores_frecuentes", type="array", @OA\Items(type="object"))
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Obtener estadísticas de uso de la API
     */
    public function stats()
    {
        try {
            $stats = $this->getApiUsageStats();

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas obtenidas exitosamente',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error obteniendo estadísticas API', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/docs/validate",
     *     tags={"Documentación"},
     *     summary="Validar especificación OpenAPI",
     *     description="Valida la especificación OpenAPI generada contra el estándar",
     *     security={{"sanctum": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Validación completada",
     *         @OA\JsonContent(
     *             @OA\Property(property="valid", type="boolean", example=true),
     *             @OA\Property(property="errors", type="array", @OA\Items(type="string")),
     *             @OA\Property(property="warnings", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Validar especificación OpenAPI
     */
    public function validate()
    {
        try {
            $validation = $this->validateOpenApiSpec();

            return response()->json([
                'success' => true,
                'message' => 'Validación completada',
                'data' => $validation
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error validando especificación OpenAPI', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error en validación',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE SOPORTE
    // ==========================================

    /**
     * Generar vista de documentación por defecto
     */
    private function generateDefaultDocsView()
    {
        $html = '<!DOCTYPE html>
        <html>
        <head>
            <title>API Documentation - Sistema EVA</title>
            <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui.css" />
            <style>
                html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
                *, *:before, *:after { box-sizing: inherit; }
                body { margin:0; background: #fafafa; }
            </style>
        </head>
        <body>
            <div id="swagger-ui"></div>
            <script src="https://unpkg.com/swagger-ui-dist@3.25.0/swagger-ui-bundle.js"></script>
            <script>
                window.onload = function() {
                    SwaggerUIBundle({
                        url: "/api/docs/json",
                        dom_id: "#swagger-ui",
                        deepLinking: true,
                        presets: [
                            SwaggerUIBundle.presets.apis,
                            SwaggerUIBundle.presets.standalone
                        ],
                        plugins: [
                            SwaggerUIBundle.plugins.DownloadUrl
                        ],
                        layout: "StandaloneLayout"
                    });
                };
            </script>
        </body>
        </html>';

        return response($html)->header('Content-Type', 'text/html');
    }

    /**
     * Obtener estadísticas de uso de la API
     */
    private function getApiUsageStats(): array
    {
        return [
            'total_endpoints' => $this->countTotalEndpoints(),
            'endpoints_activos' => $this->countActiveEndpoints(),
            'total_requests_hoy' => $this->getTodayRequestCount(),
            'endpoints_mas_usados' => $this->getMostUsedEndpoints(),
            'errores_frecuentes' => $this->getFrequentErrors(),
            'tiempo_respuesta_promedio' => $this->getAverageResponseTime(),
            'usuarios_activos' => $this->getActiveUsersCount(),
            'version_api' => self::API_VERSION,
            'ultima_actualizacion' => now()->toISOString()
        ];
    }

    /**
     * Obtener información de versión
     */
    private function getVersionInfo(): array
    {
        return [
            'version' => self::API_VERSION,
            'fecha_release' => '2024-06-26',
            'changelog' => [
                '2.0.0' => 'Optimización empresarial completa, nuevos endpoints, mejoras de seguridad',
                '1.5.0' => 'Agregados endpoints de exportación y reportes',
                '1.0.0' => 'Versión inicial del sistema EVA'
            ],
            'compatibilidad' => [
                'openapi' => '3.0.0',
                'php' => '>=8.0',
                'laravel' => '>=9.0'
            ]
        ];
    }

    /**
     * Validar especificación OpenAPI
     */
    private function validateOpenApiSpec(): array
    {
        try {
            $openapi = \OpenApi\Generator::scan([
                app_path('Http/Controllers/Api'),
                app_path('Models'),
                app_path('Http/Requests')
            ]);

            $spec = $openapi->toArray();
            $errors = [];
            $warnings = [];

            // Validaciones básicas
            if (!isset($spec['info']['title'])) {
                $errors[] = 'Falta el título de la API';
            }

            if (!isset($spec['info']['version'])) {
                $errors[] = 'Falta la versión de la API';
            }

            if (!isset($spec['paths']) || empty($spec['paths'])) {
                $errors[] = 'No se encontraron endpoints documentados';
            }

            // Validar que todos los endpoints tengan documentación
            $undocumentedEndpoints = $this->findUndocumentedEndpoints();
            if (!empty($undocumentedEndpoints)) {
                $warnings[] = 'Endpoints sin documentar: ' . implode(', ', $undocumentedEndpoints);
            }

            return [
                'valid' => empty($errors),
                'errors' => $errors,
                'warnings' => $warnings,
                'total_endpoints' => count($spec['paths'] ?? []),
                'schemas_count' => count($spec['components']['schemas'] ?? [])
            ];

        } catch (\Exception $e) {
            return [
                'valid' => false,
                'errors' => ['Error al validar especificación: ' . $e->getMessage()],
                'warnings' => []
            ];
        }
    }

    /**
     * Contar total de endpoints
     */
    private function countTotalEndpoints(): int
    {
        try {
            $routes = \Illuminate\Support\Facades\Route::getRoutes();
            $apiRoutes = 0;

            foreach ($routes as $route) {
                if (str_starts_with($route->uri(), 'api/')) {
                    $apiRoutes++;
                }
            }

            return $apiRoutes;
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Contar endpoints activos
     */
    private function countActiveEndpoints(): int
    {
        // Por ahora retornamos el total, en el futuro se puede implementar
        // lógica para detectar endpoints inactivos o deprecados
        return $this->countTotalEndpoints();
    }

    /**
     * Obtener conteo de requests de hoy
     */
    private function getTodayRequestCount(): int
    {
        // Implementar lógica para contar requests del día actual
        // Por ahora retornamos un valor simulado
        return rand(500, 2000);
    }

    /**
     * Obtener endpoints más usados
     */
    private function getMostUsedEndpoints(): array
    {
        // Implementar lógica para obtener estadísticas reales
        return [
            ['endpoint' => '/api/equipos', 'requests' => 450],
            ['endpoint' => '/api/dashboard/stats', 'requests' => 320],
            ['endpoint' => '/api/mantenimientos', 'requests' => 280],
            ['endpoint' => '/api/usuarios', 'requests' => 210],
            ['endpoint' => '/api/contingencias', 'requests' => 180]
        ];
    }

    /**
     * Obtener errores frecuentes
     */
    private function getFrequentErrors(): array
    {
        // Implementar lógica para obtener errores reales de logs
        return [
            ['error' => '422 Validation Error', 'count' => 45],
            ['error' => '404 Not Found', 'count' => 23],
            ['error' => '401 Unauthorized', 'count' => 12],
            ['error' => '500 Internal Server Error', 'count' => 5]
        ];
    }

    /**
     * Obtener tiempo de respuesta promedio
     */
    private function getAverageResponseTime(): float
    {
        // Implementar lógica para calcular tiempo real
        return round(rand(50, 200) / 10, 1); // Simular entre 5.0 y 20.0 ms
    }

    /**
     * Obtener conteo de usuarios activos
     */
    private function getActiveUsersCount(): int
    {
        try {
            return \App\Models\Usuario::where('estado', 1)
                                   ->whereDate('updated_at', '>=', now()->subDays(7))
                                   ->count();
        } catch (\Exception $e) {
            return 0;
        }
    }

    /**
     * Encontrar endpoints sin documentar
     */
    private function findUndocumentedEndpoints(): array
    {
        // Implementar lógica para comparar rutas con documentación
        // Por ahora retornamos array vacío
        return [];
    }
}
