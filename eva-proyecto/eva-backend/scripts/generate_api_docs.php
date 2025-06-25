<?php

/**
 * Script para generar documentación API en formatos JSON y HTML
 * Versión simplificada sin dependencias externas
 */

class ApiDocumentationGenerator
{
    private $outputDir;
    private $publicDir;

    public function __construct()
    {
        $this->outputDir = __DIR__ . '/../docs/api/';
        $this->publicDir = __DIR__ . '/../public/docs/';
        
        // Crear directorios si no existen
        if (!is_dir($this->outputDir)) {
            mkdir($this->outputDir, 0755, true);
        }
        if (!is_dir($this->publicDir)) {
            mkdir($this->publicDir, 0755, true);
        }
    }

    /**
     * Generar documentación OpenAPI en formato JSON
     */
    public function generateJson()
    {
        echo "🔍 Generando documentación OpenAPI JSON...\n";

        try {
            // Crear estructura OpenAPI manualmente
            $openapi = [
                'openapi' => '3.0.0',
                'info' => [
                    'title' => 'EVA - Sistema de Gestión de Equipos API',
                    'version' => '1.0.0',
                    'description' => 'API completa para el sistema de gestión de equipos biomédicos EVA',
                    'contact' => [
                        'email' => 'admin@eva-system.com',
                        'name' => 'Equipo de Desarrollo EVA'
                    ]
                ],
                'servers' => [
                    [
                        'url' => 'http://localhost:8000/api',
                        'description' => 'Servidor de Desarrollo'
                    ]
                ],
                'components' => [
                    'securitySchemes' => [
                        'sanctum' => [
                            'type' => 'http',
                            'scheme' => 'bearer',
                            'bearerFormat' => 'JWT',
                            'description' => 'Token de autenticación Sanctum'
                        ]
                    ]
                ],
                'tags' => [
                    ['name' => 'Autenticación', 'description' => 'Endpoints para autenticación de usuarios'],
                    ['name' => 'Equipos', 'description' => 'Gestión de equipos biomédicos'],
                    ['name' => 'Dashboard', 'description' => 'Estadísticas y datos del dashboard'],
                    ['name' => 'Mantenimientos', 'description' => 'Gestión de mantenimientos'],
                    ['name' => 'Contingencias', 'description' => 'Gestión de contingencias'],
                    ['name' => 'Exportación', 'description' => 'Endpoints para exportación de reportes especializados'],
                    ['name' => 'Archivos', 'description' => 'Gestión de archivos y documentos']
                ],
                'paths' => $this->generatePaths()
            ];

            $jsonContent = json_encode($openapi, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

            // Guardar en docs/api/
            $jsonFile = $this->outputDir . 'openapi.json';
            file_put_contents($jsonFile, $jsonContent);

            // Guardar en public/docs/ para acceso web
            $publicJsonFile = $this->publicDir . 'openapi.json';
            file_put_contents($publicJsonFile, $jsonContent);

            echo "✅ JSON generado exitosamente:\n";
            echo "   - {$jsonFile}\n";
            echo "   - {$publicJsonFile}\n";

            return $openapi;

        } catch (Exception $e) {
            echo "❌ Error al generar JSON: " . $e->getMessage() . "\n";
            return null;
        }
    }

    /**
     * Generar paths de la API
     */
    private function generatePaths()
    {
        return [
            '/login' => [
                'post' => [
                    'tags' => ['Autenticación'],
                    'summary' => 'Iniciar sesión',
                    'description' => 'Autenticar usuario y obtener token de acceso',
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['email', 'password'],
                                    'properties' => [
                                        'email' => ['type' => 'string', 'format' => 'email'],
                                        'password' => ['type' => 'string', 'minLength' => 6]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => ['description' => 'Login exitoso'],
                        '401' => ['description' => 'Credenciales inválidas']
                    ]
                ]
            ],
            '/export/equipos-consolidado' => [
                'post' => [
                    'tags' => ['Exportación'],
                    'summary' => 'Exportar reporte consolidado de equipos',
                    'description' => 'Genera un reporte consolidado de equipos seleccionados con opciones configurables',
                    'security' => [['sanctum' => []]],
                    'requestBody' => [
                        'required' => true,
                        'content' => [
                            'application/json' => [
                                'schema' => [
                                    'type' => 'object',
                                    'required' => ['equipos_ids', 'formato', 'incluir'],
                                    'properties' => [
                                        'equipos_ids' => [
                                            'type' => 'array',
                                            'items' => ['type' => 'integer'],
                                            'description' => 'IDs de equipos a incluir'
                                        ],
                                        'formato' => [
                                            'type' => 'string',
                                            'enum' => ['pdf', 'excel', 'csv'],
                                            'description' => 'Formato de exportación'
                                        ],
                                        'incluir' => [
                                            'type' => 'object',
                                            'properties' => [
                                                'detalles_equipo' => ['type' => 'boolean'],
                                                'cronograma' => ['type' => 'boolean'],
                                                'cumplimiento' => ['type' => 'boolean'],
                                                'responsables' => ['type' => 'boolean'],
                                                'estadisticas' => ['type' => 'boolean']
                                            ]
                                        ]
                                    ]
                                ]
                            ]
                        ]
                    ],
                    'responses' => [
                        '200' => ['description' => 'Archivo de reporte generado exitosamente'],
                        '422' => ['description' => 'Error de validación'],
                        '500' => ['description' => 'Error interno del servidor']
                    ]
                ]
            ],
            '/export/plantilla-mantenimiento' => [
                'post' => [
                    'tags' => ['Exportación'],
                    'summary' => 'Exportar plantilla de mantenimiento',
                    'description' => 'Genera una plantilla de mantenimientos programados para un año específico',
                    'security' => [['sanctum' => []]],
                    'responses' => ['200' => ['description' => 'Plantilla generada exitosamente']]
                ]
            ],
            '/export/contingencias' => [
                'post' => [
                    'tags' => ['Exportación'],
                    'summary' => 'Exportar reporte de contingencias',
                    'description' => 'Genera un reporte de contingencias en un rango de fechas',
                    'security' => [['sanctum' => []]],
                    'responses' => ['200' => ['description' => 'Reporte generado exitosamente']]
                ]
            ],
            '/equipos' => [
                'get' => [
                    'tags' => ['Equipos'],
                    'summary' => 'Listar equipos',
                    'description' => 'Obtener lista paginada de equipos con filtros',
                    'security' => [['sanctum' => []]],
                    'responses' => ['200' => ['description' => 'Lista de equipos']]
                ],
                'post' => [
                    'tags' => ['Equipos'],
                    'summary' => 'Crear equipo',
                    'description' => 'Crear un nuevo equipo médico',
                    'security' => [['sanctum' => []]],
                    'responses' => ['201' => ['description' => 'Equipo creado exitosamente']]
                ]
            ],
            '/dashboard/stats' => [
                'get' => [
                    'tags' => ['Dashboard'],
                    'summary' => 'Obtener estadísticas del dashboard',
                    'description' => 'Estadísticas generales del sistema',
                    'security' => [['sanctum' => []]],
                    'responses' => ['200' => ['description' => 'Estadísticas del dashboard']]
                ]
            ]
        ];
    }

    /**
     * Generar documentación HTML usando Swagger UI
     */
    public function generateHtml($apiData = null)
    {
        echo "\n🎨 Generando documentación HTML...\n";

        if (!$apiData) {
            echo "⚠️  No hay datos de API disponibles para HTML\n";
            return;
        }

        $htmlContent = $this->generateSwaggerHtml();
        
        // Guardar en docs/api/
        $htmlFile = $this->outputDir . 'index.html';
        file_put_contents($htmlFile, $htmlContent);
        
        // Guardar en public/docs/ para acceso web
        $publicHtmlFile = $this->publicDir . 'index.html';
        file_put_contents($publicHtmlFile, $htmlContent);

        echo "✅ HTML generado exitosamente:\n";
        echo "   - {$htmlFile}\n";
        echo "   - {$publicHtmlFile}\n";
        echo "   - Accesible en: http://localhost:8000/docs/\n";
    }

    /**
     * Generar HTML con Swagger UI
     */
    private function generateSwaggerHtml()
    {
        return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EVA API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin:0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            background-color: #2c3e50;
        }
        .swagger-ui .topbar .download-url-wrapper .select-label {
            color: #fff;
        }
        .swagger-ui .topbar .download-url-wrapper input[type=text] {
            border: 2px solid #34495e;
        }
        .custom-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
            margin-bottom: 20px;
        }
        .custom-header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .custom-header p {
            margin: 10px 0 0 0;
            font-size: 1.2em;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="custom-header">
        <h1>🏥 EVA - Sistema de Gestión de Equipos</h1>
        <p>Documentación completa de la API REST</p>
        <p><strong>Versión:</strong> 1.0.0 | <strong>Última actualización:</strong> ' . date('d/m/Y H:i') . '</p>
    </div>
    
    <div id="swagger-ui"></div>
    
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "./openapi.json",
                dom_id: "#swagger-ui",
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                defaultModelsExpandDepth: 1,
                defaultModelExpandDepth: 1,
                docExpansion: "list",
                filter: true,
                showRequestHeaders: true,
                showCommonExtensions: true,
                tryItOutEnabled: true,
                requestInterceptor: function(request) {
                    // Agregar token de autorización si está disponible
                    const token = localStorage.getItem("eva_auth_token");
                    if (token) {
                        request.headers["Authorization"] = "Bearer " + token;
                    }
                    return request;
                },
                onComplete: function() {
                    console.log("EVA API Documentation loaded successfully");
                }
            });
            
            // Función para establecer token de autorización
            window.setAuthToken = function(token) {
                localStorage.setItem("eva_auth_token", token);
                console.log("Token de autorización establecido");
            };
            
            // Función para limpiar token
            window.clearAuthToken = function() {
                localStorage.removeItem("eva_auth_token");
                console.log("Token de autorización eliminado");
            };
            
            console.log("Para usar la API con autenticación:");
            console.log("1. Ejecuta: setAuthToken(\'tu_token_aqui\')");
            console.log("2. Para limpiar: clearAuthToken()");
        };
    </script>
</body>
</html>';
    }

    /**
     * Generar documentación markdown
     */
    public function generateMarkdown($apiData)
    {
        echo "\n📝 Generando documentación Markdown...\n";

        if (!$apiData) {
            echo "⚠️  No hay datos de API disponibles para Markdown\n";
            return;
        }

        $markdown = $this->generateApiMarkdown($apiData);
        
        $markdownFile = $this->outputDir . 'API_DOCUMENTATION.md';
        file_put_contents($markdownFile, $markdown);

        echo "✅ Markdown generado exitosamente: {$markdownFile}\n";
    }

    /**
     * Generar contenido markdown
     */
    private function generateApiMarkdown($apiData)
    {
        $markdown = "# EVA API Documentation\n\n";
        $markdown .= "**Versión:** " . ($apiData['info']['version'] ?? '1.0.0') . "\n";
        $markdown .= "**Descripción:** " . ($apiData['info']['description'] ?? 'API del Sistema EVA') . "\n";
        $markdown .= "**Generado:** " . date('d/m/Y H:i:s') . "\n\n";

        $markdown .= "## 🔐 Autenticación\n\n";
        $markdown .= "La API utiliza autenticación Bearer Token (Sanctum):\n\n";
        $markdown .= "```\nAuthorization: Bearer YOUR_TOKEN_HERE\n```\n\n";

        $markdown .= "## 📊 Endpoints Disponibles\n\n";

        if (isset($apiData['paths'])) {
            foreach ($apiData['paths'] as $path => $methods) {
                $markdown .= "### `{$path}`\n\n";
                
                foreach ($methods as $method => $details) {
                    if (is_array($details) && isset($details['summary'])) {
                        $markdown .= "#### " . strtoupper($method) . " {$path}\n\n";
                        $markdown .= "**Resumen:** " . $details['summary'] . "\n\n";
                        
                        if (isset($details['description'])) {
                            $markdown .= "**Descripción:** " . $details['description'] . "\n\n";
                        }
                        
                        if (isset($details['tags'])) {
                            $markdown .= "**Tags:** " . implode(', ', $details['tags']) . "\n\n";
                        }
                    }
                }
                
                $markdown .= "---\n\n";
            }
        }

        $markdown .= "## 📱 Uso desde Frontend\n\n";
        $markdown .= "```javascript\n";
        $markdown .= "// Configuración base\n";
        $markdown .= "const api = axios.create({\n";
        $markdown .= "  baseURL: 'http://localhost:8000/api',\n";
        $markdown .= "  headers: {\n";
        $markdown .= "    'Authorization': 'Bearer ' + token,\n";
        $markdown .= "    'Content-Type': 'application/json'\n";
        $markdown .= "  }\n";
        $markdown .= "});\n";
        $markdown .= "```\n\n";

        return $markdown;
    }

    /**
     * Generar estadísticas de la API
     */
    public function generateStats($apiData)
    {
        echo "\n📈 Generando estadísticas de la API...\n";

        if (!$apiData) {
            echo "⚠️  No hay datos disponibles para estadísticas\n";
            return;
        }

        $stats = [
            'total_endpoints' => 0,
            'endpoints_by_method' => [],
            'endpoints_by_tag' => [],
            'total_schemas' => 0
        ];

        if (isset($apiData['paths'])) {
            foreach ($apiData['paths'] as $path => $methods) {
                foreach ($methods as $method => $details) {
                    if (is_array($details)) {
                        $stats['total_endpoints']++;
                        
                        $method = strtoupper($method);
                        $stats['endpoints_by_method'][$method] = ($stats['endpoints_by_method'][$method] ?? 0) + 1;
                        
                        if (isset($details['tags'])) {
                            foreach ($details['tags'] as $tag) {
                                $stats['endpoints_by_tag'][$tag] = ($stats['endpoints_by_tag'][$tag] ?? 0) + 1;
                            }
                        }
                    }
                }
            }
        }

        if (isset($apiData['components']['schemas'])) {
            $stats['total_schemas'] = count($apiData['components']['schemas']);
        }

        $statsFile = $this->outputDir . 'api_stats.json';
        file_put_contents($statsFile, json_encode($stats, JSON_PRETTY_PRINT));

        echo "✅ Estadísticas generadas: {$statsFile}\n";
        echo "   - Total endpoints: {$stats['total_endpoints']}\n";
        echo "   - Total schemas: {$stats['total_schemas']}\n";

        return $stats;
    }

    /**
     * Ejecutar generación completa
     */
    public function generateAll()
    {
        echo "🚀 Iniciando generación completa de documentación API...\n\n";

        $apiData = $this->generateJson();
        
        if ($apiData) {
            $this->generateHtml($apiData);
            $this->generateMarkdown($apiData);
            $this->generateStats($apiData);
        }

        echo "\n🎉 Generación de documentación completada!\n";
        echo "\n📂 Archivos generados en:\n";
        echo "   - docs/api/ (documentación técnica)\n";
        echo "   - public/docs/ (acceso web)\n";
        echo "\n🌐 Acceso web: http://localhost:8000/docs/\n";
    }
}

// Ejecutar generación
$generator = new ApiDocumentationGenerator();
$generator->generateAll();
