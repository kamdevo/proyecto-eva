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
    /**
     * Display Swagger UI
     */
    public function index()
    {
        return view('swagger.index');
    }

    /**
     * Generate OpenAPI JSON
     */
    public function json()
    {
        $openapi = \OpenApi\Generator::scan([
            app_path('Http/Controllers/Api'),
            app_path('Models'),
            app_path('Http/Requests')
        ]);

        return response()->json($openapi->toArray());
    }
}
