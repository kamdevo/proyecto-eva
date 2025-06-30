<?php

/**
 * Script para documentar automáticamente todos los controladores con Swagger/OpenAPI
 * Añade anotaciones @OA\ a todos los métodos públicos de los controladores
 */

class ControllerDocumenter
{
    private $controllersDir;
    private $controllerMappings;

    public function __construct()
    {
        $this->controllersDir = __DIR__ . '/../app/Http/Controllers/Api/';
        $this->initializeControllerMappings();
    }

    /**
     * Mapeo de controladores con sus configuraciones
     */
    private function initializeControllerMappings()
    {
        $this->controllerMappings = [
            'AdministradorController' => [
                'tag' => 'Administradores',
                'description' => 'Gestión de usuarios administradores del sistema',
                'methods' => [
                    'index' => ['GET', '/api/administradores', 'Listar administradores'],
                    'store' => ['POST', '/api/administradores', 'Crear nuevo administrador'],
                    'show' => ['GET', '/api/administradores/{id}', 'Obtener administrador específico'],
                    'update' => ['PUT', '/api/administradores/{id}', 'Actualizar administrador'],
                    'destroy' => ['DELETE', '/api/administradores/{id}', 'Eliminar administrador'],
                    'activate' => ['POST', '/api/administradores/{id}/activate', 'Activar administrador'],
                    'deactivate' => ['POST', '/api/administradores/{id}/deactivate', 'Desactivar administrador'],
                    'resetPassword' => ['POST', '/api/administradores/{id}/reset-password', 'Resetear contraseña']
                ]
            ],
            'ArchivosController' => [
                'tag' => 'Archivos',
                'description' => 'Gestión de archivos y documentos del sistema',
                'methods' => [
                    'index' => ['GET', '/api/archivos', 'Listar archivos'],
                    'store' => ['POST', '/api/archivos', 'Subir nuevo archivo'],
                    'show' => ['GET', '/api/archivos/{id}', 'Obtener archivo específico'],
                    'download' => ['GET', '/api/archivos/{id}/download', 'Descargar archivo'],
                    'update' => ['PUT', '/api/archivos/{id}', 'Actualizar información del archivo'],
                    'destroy' => ['DELETE', '/api/archivos/{id}', 'Eliminar archivo'],
                    'uploadMultiple' => ['POST', '/api/archivos/multiple', 'Subir múltiples archivos'],
                    'getByEquipo' => ['GET', '/api/archivos/equipo/{equipoId}', 'Obtener archivos de un equipo'],
                    'getByMantenimiento' => ['GET', '/api/archivos/mantenimiento/{mantenimientoId}', 'Obtener archivos de mantenimiento'],
                    'validateFile' => ['POST', '/api/archivos/validate', 'Validar archivo antes de subir'],
                    'getMetadata' => ['GET', '/api/archivos/{id}/metadata', 'Obtener metadatos del archivo'],
                    'updateMetadata' => ['PUT', '/api/archivos/{id}/metadata', 'Actualizar metadatos del archivo']
                ]
            ],
            'AreaController' => [
                'tag' => 'Áreas',
                'description' => 'Gestión de áreas hospitalarias y departamentos',
                'methods' => [
                    'index' => ['GET', '/api/areas', 'Listar áreas'],
                    'store' => ['POST', '/api/areas', 'Crear nueva área'],
                    'show' => ['GET', '/api/areas/{id}', 'Obtener área específica'],
                    'update' => ['PUT', '/api/areas/{id}', 'Actualizar área'],
                    'destroy' => ['DELETE', '/api/areas/{id}', 'Eliminar área'],
                    'getByServicio' => ['GET', '/api/areas/servicio/{servicioId}', 'Obtener áreas por servicio'],
                    'getEquipos' => ['GET', '/api/areas/{id}/equipos', 'Obtener equipos del área'],
                    'getStats' => ['GET', '/api/areas/{id}/stats', 'Obtener estadísticas del área'],
                    'activate' => ['POST', '/api/areas/{id}/activate', 'Activar área']
                ]
            ],
            'CalibracionController' => [
                'tag' => 'Calibraciones',
                'description' => 'Gestión de calibraciones de equipos médicos',
                'methods' => [
                    'index' => ['GET', '/api/calibraciones', 'Listar calibraciones'],
                    'store' => ['POST', '/api/calibraciones', 'Crear nueva calibración'],
                    'show' => ['GET', '/api/calibraciones/{id}', 'Obtener calibración específica'],
                    'update' => ['PUT', '/api/calibraciones/{id}', 'Actualizar calibración'],
                    'destroy' => ['DELETE', '/api/calibraciones/{id}', 'Eliminar calibración'],
                    'getByEquipo' => ['GET', '/api/calibraciones/equipo/{equipoId}', 'Obtener calibraciones de un equipo'],
                    'getPendientes' => ['GET', '/api/calibraciones/pendientes', 'Obtener calibraciones pendientes'],
                    'getVencidas' => ['GET', '/api/calibraciones/vencidas', 'Obtener calibraciones vencidas'],
                    'marcarCompletada' => ['POST', '/api/calibraciones/{id}/completar', 'Marcar calibración como completada'],
                    'programar' => ['POST', '/api/calibraciones/{id}/programar', 'Programar nueva fecha de calibración'],
                    'getCertificado' => ['GET', '/api/calibraciones/{id}/certificado', 'Obtener certificado de calibración']
                ]
            ],
            'ContingenciaController' => [
                'tag' => 'Contingencias',
                'description' => 'Gestión de contingencias y eventos críticos',
                'methods' => [
                    'index' => ['GET', '/api/contingencias', 'Listar contingencias'],
                    'store' => ['POST', '/api/contingencias', 'Crear nueva contingencia'],
                    'show' => ['GET', '/api/contingencias/{id}', 'Obtener contingencia específica'],
                    'update' => ['PUT', '/api/contingencias/{id}', 'Actualizar contingencia'],
                    'destroy' => ['DELETE', '/api/contingencias/{id}', 'Eliminar contingencia'],
                    'getActivas' => ['GET', '/api/contingencias/activas', 'Obtener contingencias activas'],
                    'getCriticas' => ['GET', '/api/contingencias/criticas', 'Obtener contingencias críticas'],
                    'resolver' => ['POST', '/api/contingencias/{id}/resolver', 'Resolver contingencia'],
                    'escalar' => ['POST', '/api/contingencias/{id}/escalar', 'Escalar contingencia'],
                    'asignar' => ['POST', '/api/contingencias/{id}/asignar', 'Asignar responsable'],
                    'getHistorial' => ['GET', '/api/contingencias/{id}/historial', 'Obtener historial de la contingencia']
                ]
            ],
            'MantenimientoController' => [
                'tag' => 'Mantenimientos',
                'description' => 'Gestión de mantenimientos preventivos y correctivos',
                'methods' => [
                    'index' => ['GET', '/api/mantenimientos', 'Listar mantenimientos'],
                    'store' => ['POST', '/api/mantenimientos', 'Crear nuevo mantenimiento'],
                    'show' => ['GET', '/api/mantenimientos/{id}', 'Obtener mantenimiento específico'],
                    'update' => ['PUT', '/api/mantenimientos/{id}', 'Actualizar mantenimiento'],
                    'destroy' => ['DELETE', '/api/mantenimientos/{id}', 'Eliminar mantenimiento'],
                    'getPendientes' => ['GET', '/api/mantenimientos/pendientes', 'Obtener mantenimientos pendientes'],
                    'getVencidos' => ['GET', '/api/mantenimientos/vencidos', 'Obtener mantenimientos vencidos'],
                    'completar' => ['POST', '/api/mantenimientos/{id}/completar', 'Completar mantenimiento'],
                    'programar' => ['POST', '/api/mantenimientos/{id}/programar', 'Programar mantenimiento'],
                    'getByEquipo' => ['GET', '/api/mantenimientos/equipo/{equipoId}', 'Obtener mantenimientos de un equipo'],
                    'getCalendario' => ['GET', '/api/mantenimientos/calendario', 'Obtener calendario de mantenimientos']
                ]
            ],
            'TicketController' => [
                'tag' => 'Tickets',
                'description' => 'Sistema de tickets y solicitudes de soporte',
                'methods' => [
                    'index' => ['GET', '/api/tickets', 'Listar tickets'],
                    'store' => ['POST', '/api/tickets', 'Crear nuevo ticket'],
                    'show' => ['GET', '/api/tickets/{id}', 'Obtener ticket específico'],
                    'update' => ['PUT', '/api/tickets/{id}', 'Actualizar ticket'],
                    'destroy' => ['DELETE', '/api/tickets/{id}', 'Eliminar ticket'],
                    'asignar' => ['POST', '/api/tickets/{id}/asignar', 'Asignar ticket a técnico'],
                    'cambiarEstado' => ['POST', '/api/tickets/{id}/estado', 'Cambiar estado del ticket'],
                    'addComentario' => ['POST', '/api/tickets/{id}/comentarios', 'Añadir comentario al ticket'],
                    'getComentarios' => ['GET', '/api/tickets/{id}/comentarios', 'Obtener comentarios del ticket'],
                    'cerrar' => ['POST', '/api/tickets/{id}/cerrar', 'Cerrar ticket'],
                    'reabrir' => ['POST', '/api/tickets/{id}/reabrir', 'Reabrir ticket'],
                    'getStats' => ['GET', '/api/tickets/stats', 'Obtener estadísticas de tickets']
                ]
            ],
            'CapacitacionController' => [
                'tag' => 'Capacitaciones',
                'description' => 'Gestión de capacitaciones y entrenamientos del personal',
                'methods' => [
                    'index' => ['GET', '/api/capacitaciones', 'Listar capacitaciones'],
                    'store' => ['POST', '/api/capacitaciones', 'Crear nueva capacitación'],
                    'show' => ['GET', '/api/capacitaciones/{id}', 'Obtener capacitación específica'],
                    'update' => ['PUT', '/api/capacitaciones/{id}', 'Actualizar capacitación'],
                    'destroy' => ['DELETE', '/api/capacitaciones/{id}', 'Eliminar capacitación'],
                    'inscribir' => ['POST', '/api/capacitaciones/{id}/inscribir', 'Inscribir usuario a capacitación'],
                    'completar' => ['POST', '/api/capacitaciones/{id}/completar', 'Marcar capacitación como completada'],
                    'getCertificado' => ['GET', '/api/capacitaciones/{id}/certificado', 'Obtener certificado de capacitación'],
                    'getParticipantes' => ['GET', '/api/capacitaciones/{id}/participantes', 'Obtener participantes de la capacitación']
                ]
            ],
            'ContactoController' => [
                'tag' => 'Contactos',
                'description' => 'Gestión de contactos y proveedores',
                'methods' => [
                    'index' => ['GET', '/api/contactos', 'Listar contactos'],
                    'store' => ['POST', '/api/contactos', 'Crear nuevo contacto'],
                    'show' => ['GET', '/api/contactos/{id}', 'Obtener contacto específico'],
                    'update' => ['PUT', '/api/contactos/{id}', 'Actualizar contacto'],
                    'destroy' => ['DELETE', '/api/contactos/{id}', 'Eliminar contacto'],
                    'getProveedores' => ['GET', '/api/contactos/proveedores', 'Obtener contactos proveedores'],
                    'getTecnicos' => ['GET', '/api/contactos/tecnicos', 'Obtener contactos técnicos'],
                    'activate' => ['POST', '/api/contactos/{id}/activate', 'Activar contacto'],
                    'deactivate' => ['POST', '/api/contactos/{id}/deactivate', 'Desactivar contacto'],
                    'search' => ['GET', '/api/contactos/search', 'Buscar contactos']
                ]
            ],
            'CorrectivoController' => [
                'tag' => 'Correctivos',
                'description' => 'Gestión de mantenimientos correctivos',
                'methods' => [
                    'index' => ['GET', '/api/correctivos', 'Listar mantenimientos correctivos'],
                    'store' => ['POST', '/api/correctivos', 'Crear nuevo correctivo'],
                    'show' => ['GET', '/api/correctivos/{id}', 'Obtener correctivo específico'],
                    'update' => ['PUT', '/api/correctivos/{id}', 'Actualizar correctivo'],
                    'destroy' => ['DELETE', '/api/correctivos/{id}', 'Eliminar correctivo'],
                    'completar' => ['POST', '/api/correctivos/{id}/completar', 'Completar correctivo'],
                    'asignarTecnico' => ['POST', '/api/correctivos/{id}/asignar', 'Asignar técnico al correctivo'],
                    'getByEquipo' => ['GET', '/api/correctivos/equipo/{equipoId}', 'Obtener correctivos de un equipo'],
                    'getUrgentes' => ['GET', '/api/correctivos/urgentes', 'Obtener correctivos urgentes']
                ]
            ],
            'EquipoController' => [
                'tag' => 'Equipos',
                'description' => 'Gestión básica de equipos',
                'methods' => [
                    'index' => ['GET', '/api/equipos-basic', 'Listar equipos básico'],
                    'store' => ['POST', '/api/equipos-basic', 'Crear equipo básico'],
                    'show' => ['GET', '/api/equipos-basic/{id}', 'Obtener equipo básico'],
                    'update' => ['PUT', '/api/equipos-basic/{id}', 'Actualizar equipo básico'],
                    'destroy' => ['DELETE', '/api/equipos-basic/{id}', 'Eliminar equipo básico']
                ]
            ],
            'FileController' => [
                'tag' => 'Archivos',
                'description' => 'Gestión avanzada de archivos del sistema',
                'methods' => [
                    'upload' => ['POST', '/api/files/upload', 'Subir archivo'],
                    'download' => ['GET', '/api/files/{id}/download', 'Descargar archivo'],
                    'delete' => ['DELETE', '/api/files/{id}', 'Eliminar archivo'],
                    'getInfo' => ['GET', '/api/files/{id}/info', 'Obtener información del archivo'],
                    'updateInfo' => ['PUT', '/api/files/{id}/info', 'Actualizar información del archivo'],
                    'getByType' => ['GET', '/api/files/type/{type}', 'Obtener archivos por tipo'],
                    'compress' => ['POST', '/api/files/{id}/compress', 'Comprimir archivo'],
                    'extract' => ['POST', '/api/files/{id}/extract', 'Extraer archivo comprimido'],
                    'preview' => ['GET', '/api/files/{id}/preview', 'Vista previa del archivo'],
                    'share' => ['POST', '/api/files/{id}/share', 'Compartir archivo'],
                    'getShared' => ['GET', '/api/files/shared', 'Obtener archivos compartidos'],
                    'revokeShare' => ['DELETE', '/api/files/{id}/share', 'Revocar compartir archivo']
                ]
            ],
            'FiltrosController' => [
                'tag' => 'Filtros',
                'description' => 'Gestión de filtros del sistema',
                'methods' => [
                    'getEquipoFilters' => ['GET', '/api/filtros/equipos', 'Obtener filtros para equipos'],
                    'getMantenimientoFilters' => ['GET', '/api/filtros/mantenimientos', 'Obtener filtros para mantenimientos'],
                    'getContingenciaFilters' => ['GET', '/api/filtros/contingencias', 'Obtener filtros para contingencias'],
                    'saveUserFilters' => ['POST', '/api/filtros/user', 'Guardar filtros de usuario']
                ]
            ],
            'GuiaRapidaController' => [
                'tag' => 'Guías Rápidas',
                'description' => 'Gestión de guías rápidas y documentación',
                'methods' => [
                    'index' => ['GET', '/api/guias', 'Listar guías rápidas'],
                    'store' => ['POST', '/api/guias', 'Crear nueva guía'],
                    'show' => ['GET', '/api/guias/{id}', 'Obtener guía específica'],
                    'update' => ['PUT', '/api/guias/{id}', 'Actualizar guía'],
                    'destroy' => ['DELETE', '/api/guias/{id}', 'Eliminar guía'],
                    'getByCategoria' => ['GET', '/api/guias/categoria/{categoria}', 'Obtener guías por categoría'],
                    'search' => ['GET', '/api/guias/search', 'Buscar guías'],
                    'publish' => ['POST', '/api/guias/{id}/publish', 'Publicar guía'],
                    'unpublish' => ['POST', '/api/guias/{id}/unpublish', 'Despublicar guía'],
                    'getPopulares' => ['GET', '/api/guias/populares', 'Obtener guías populares']
                ]
            ],
            'ModalController' => [
                'tag' => 'Modales',
                'description' => 'Gestión de ventanas modales del sistema',
                'methods' => [
                    'getEquipoModal' => ['GET', '/api/modales/equipo/{id}', 'Obtener datos para modal de equipo'],
                    'getMantenimientoModal' => ['GET', '/api/modales/mantenimiento/{id}', 'Obtener datos para modal de mantenimiento'],
                    'getContingenciaModal' => ['GET', '/api/modales/contingencia/{id}', 'Obtener datos para modal de contingencia'],
                    'getUserModal' => ['GET', '/api/modales/user/{id}', 'Obtener datos para modal de usuario'],
                    'getReportModal' => ['GET', '/api/modales/report/{type}', 'Obtener datos para modal de reporte'],
                    'getConfigModal' => ['GET', '/api/modales/config', 'Obtener datos para modal de configuración'],
                    'saveModalState' => ['POST', '/api/modales/state', 'Guardar estado del modal']
                ]
            ],
            'ObservacionController' => [
                'tag' => 'Observaciones',
                'description' => 'Gestión de observaciones y comentarios',
                'methods' => [
                    'index' => ['GET', '/api/observaciones', 'Listar observaciones'],
                    'store' => ['POST', '/api/observaciones', 'Crear nueva observación'],
                    'show' => ['GET', '/api/observaciones/{id}', 'Obtener observación específica'],
                    'update' => ['PUT', '/api/observaciones/{id}', 'Actualizar observación'],
                    'destroy' => ['DELETE', '/api/observaciones/{id}', 'Eliminar observación'],
                    'getByEquipo' => ['GET', '/api/observaciones/equipo/{equipoId}', 'Obtener observaciones de un equipo'],
                    'getByMantenimiento' => ['GET', '/api/observaciones/mantenimiento/{mantenimientoId}', 'Obtener observaciones de mantenimiento'],
                    'marcarLeida' => ['POST', '/api/observaciones/{id}/leida', 'Marcar observación como leída'],
                    'getNoLeidas' => ['GET', '/api/observaciones/no-leidas', 'Obtener observaciones no leídas']
                ]
            ],
            'PlanMantenimientoController' => [
                'tag' => 'Planes de Mantenimiento',
                'description' => 'Gestión de planes de mantenimiento',
                'methods' => [
                    'index' => ['GET', '/api/planes-mantenimiento', 'Listar planes de mantenimiento'],
                    'store' => ['POST', '/api/planes-mantenimiento', 'Crear nuevo plan'],
                    'show' => ['GET', '/api/planes-mantenimiento/{id}', 'Obtener plan específico'],
                    'update' => ['PUT', '/api/planes-mantenimiento/{id}', 'Actualizar plan'],
                    'destroy' => ['DELETE', '/api/planes-mantenimiento/{id}', 'Eliminar plan'],
                    'activar' => ['POST', '/api/planes-mantenimiento/{id}/activar', 'Activar plan'],
                    'desactivar' => ['POST', '/api/planes-mantenimiento/{id}/desactivar', 'Desactivar plan'],
                    'duplicar' => ['POST', '/api/planes-mantenimiento/{id}/duplicar', 'Duplicar plan']
                ]
            ],
            'PropietarioController' => [
                'tag' => 'Propietarios',
                'description' => 'Gestión de propietarios de equipos',
                'methods' => [
                    'index' => ['GET', '/api/propietarios', 'Listar propietarios'],
                    'store' => ['POST', '/api/propietarios', 'Crear nuevo propietario'],
                    'show' => ['GET', '/api/propietarios/{id}', 'Obtener propietario específico'],
                    'update' => ['PUT', '/api/propietarios/{id}', 'Actualizar propietario'],
                    'destroy' => ['DELETE', '/api/propietarios/{id}', 'Eliminar propietario'],
                    'getEquipos' => ['GET', '/api/propietarios/{id}/equipos', 'Obtener equipos del propietario'],
                    'getContratos' => ['GET', '/api/propietarios/{id}/contratos', 'Obtener contratos del propietario'],
                    'activate' => ['POST', '/api/propietarios/{id}/activate', 'Activar propietario'],
                    'deactivate' => ['POST', '/api/propietarios/{id}/deactivate', 'Desactivar propietario']
                ]
            ],
            'RepuestosController' => [
                'tag' => 'Repuestos',
                'description' => 'Gestión de inventario de repuestos',
                'methods' => [
                    'index' => ['GET', '/api/repuestos', 'Listar repuestos'],
                    'store' => ['POST', '/api/repuestos', 'Crear nuevo repuesto'],
                    'show' => ['GET', '/api/repuestos/{id}', 'Obtener repuesto específico'],
                    'update' => ['PUT', '/api/repuestos/{id}', 'Actualizar repuesto'],
                    'destroy' => ['DELETE', '/api/repuestos/{id}', 'Eliminar repuesto'],
                    'getBajoStock' => ['GET', '/api/repuestos/bajo-stock', 'Obtener repuestos con bajo stock'],
                    'updateStock' => ['POST', '/api/repuestos/{id}/stock', 'Actualizar stock del repuesto'],
                    'getByEquipo' => ['GET', '/api/repuestos/equipo/{equipoId}', 'Obtener repuestos de un equipo'],
                    'reservar' => ['POST', '/api/repuestos/{id}/reservar', 'Reservar repuesto'],
                    'liberar' => ['POST', '/api/repuestos/{id}/liberar', 'Liberar reserva de repuesto']
                ]
            ],
            'ServicioController' => [
                'tag' => 'Servicios',
                'description' => 'Gestión de servicios hospitalarios',
                'methods' => [
                    'index' => ['GET', '/api/servicios', 'Listar servicios'],
                    'store' => ['POST', '/api/servicios', 'Crear nuevo servicio'],
                    'show' => ['GET', '/api/servicios/{id}', 'Obtener servicio específico'],
                    'update' => ['PUT', '/api/servicios/{id}', 'Actualizar servicio'],
                    'destroy' => ['DELETE', '/api/servicios/{id}', 'Eliminar servicio'],
                    'getAreas' => ['GET', '/api/servicios/{id}/areas', 'Obtener áreas del servicio'],
                    'getEquipos' => ['GET', '/api/servicios/{id}/equipos', 'Obtener equipos del servicio'],
                    'getStats' => ['GET', '/api/servicios/{id}/stats', 'Obtener estadísticas del servicio'],
                    'activate' => ['POST', '/api/servicios/{id}/activate', 'Activar servicio']
                ]
            ],
            'SystemManagerController' => [
                'tag' => 'Gestión del Sistema',
                'description' => 'Gestión y configuración del sistema',
                'methods' => [
                    'getSystemInfo' => ['GET', '/api/system/info', 'Obtener información del sistema'],
                    'getSystemHealth' => ['GET', '/api/system/health', 'Verificar salud del sistema'],
                    'clearCache' => ['POST', '/api/system/cache/clear', 'Limpiar caché del sistema'],
                    'getSystemLogs' => ['GET', '/api/system/logs', 'Obtener logs del sistema'],
                    'backupDatabase' => ['POST', '/api/system/backup', 'Crear backup de la base de datos'],
                    'getBackups' => ['GET', '/api/system/backups', 'Listar backups disponibles'],
                    'restoreBackup' => ['POST', '/api/system/restore/{backupId}', 'Restaurar backup'],
                    'updateSystem' => ['POST', '/api/system/update', 'Actualizar sistema'],
                    'getSystemConfig' => ['GET', '/api/system/config', 'Obtener configuración del sistema'],
                    'updateSystemConfig' => ['PUT', '/api/system/config', 'Actualizar configuración del sistema']
                ]
            ]
        ];
    }

    /**
     * Documentar todos los controladores
     */
    public function documentAllControllers()
    {
        echo "🚀 Iniciando documentación automática de controladores...\n\n";

        $documented = 0;
        $total = count($this->controllerMappings);

        foreach ($this->controllerMappings as $controllerName => $config) {
            echo "📄 Documentando {$controllerName}...\n";
            
            if ($this->documentController($controllerName, $config)) {
                $documented++;
                echo "   ✅ {$controllerName} documentado exitosamente\n";
            } else {
                echo "   ❌ Error documentando {$controllerName}\n";
            }
        }

        echo "\n🎉 Documentación completada!\n";
        echo "📊 Controladores documentados: {$documented}/{$total}\n";
        
        return $documented === $total;
    }

    /**
     * Documentar un controlador específico
     */
    private function documentController($controllerName, $config)
    {
        $filePath = $this->controllersDir . $controllerName . '.php';
        
        if (!file_exists($filePath)) {
            echo "   ⚠️ Archivo no encontrado: {$filePath}\n";
            return false;
        }

        try {
            $content = file_get_contents($filePath);
            
            // Añadir tag del controlador si no existe
            if (!preg_match('/@OA\\\\Tag/', $content)) {
                $content = $this->addControllerTag($content, $config);
            }

            // Documentar métodos
            foreach ($config['methods'] as $methodName => $methodConfig) {
                $content = $this->documentMethod($content, $methodName, $methodConfig, $config['tag']);
            }

            file_put_contents($filePath, $content);
            return true;

        } catch (\Exception $e) {
            echo "   ❌ Error: " . $e->getMessage() . "\n";
            return false;
        }
    }

    /**
     * Añadir tag del controlador
     */
    private function addControllerTag($content, $config)
    {
        $tagAnnotation = "/**\n * @OA\\Tag(\n *     name=\"{$config['tag']}\",\n *     description=\"{$config['description']}\"\n * )\n * \n";
        
        // Buscar el comentario de la clase y añadir el tag
        $pattern = '/\/\*\*\s*\n\s*\*\s*([^*\/]+)\s*\*\/\s*class/';
        $replacement = $tagAnnotation . ' * $1' . "\n */\nclass";
        
        return preg_replace($pattern, $replacement, $content);
    }

    /**
     * Documentar un método específico
     */
    private function documentMethod($content, $methodName, $methodConfig, $tag)
    {
        // Si el método ya está documentado con @OA\, no lo modificamos
        $methodPattern = "/public\s+function\s+{$methodName}\s*\(/";
        if (preg_match($methodPattern, $content, $matches, PREG_OFFSET_CAPTURE)) {
            $methodPos = $matches[0][1];
            $beforeMethod = substr($content, 0, $methodPos);
            
            // Verificar si ya tiene documentación @OA\
            if (preg_match('/@OA\\\\(Get|Post|Put|Delete|Patch)/', substr($beforeMethod, -500))) {
                return $content; // Ya documentado
            }
        }

        list($httpMethod, $path, $summary) = $methodConfig;
        
        $annotation = $this->generateMethodAnnotation($httpMethod, $path, $summary, $tag, $methodName);
        
        // Buscar el método y añadir la documentación antes
        $pattern = "/(\/\*\*[^*]*\*\/\s*)?public\s+function\s+{$methodName}\s*\(/";
        $replacement = $annotation . "\n    public function {$methodName}(";
        
        return preg_replace($pattern, $replacement, $content);
    }

    /**
     * Generar anotación para un método
     */
    private function generateMethodAnnotation($httpMethod, $path, $summary, $tag, $methodName)
    {
        $method = strtolower($httpMethod);
        $methodUpper = strtoupper($httpMethod);
        
        $annotation = "    /**\n";
        $annotation .= "     * @OA\\{$methodUpper}(\n";
        $annotation .= "     *     path=\"{$path}\",\n";
        $annotation .= "     *     tags={\"{$tag}\"},\n";
        $annotation .= "     *     summary=\"{$summary}\",\n";
        $annotation .= "     *     security={{\"sanctum\": {}}},\n";
        
        // Añadir parámetros si es necesario
        if (strpos($path, '{id}') !== false) {
            $annotation .= "     *     @OA\\Parameter(\n";
            $annotation .= "     *         name=\"id\",\n";
            $annotation .= "     *         in=\"path\",\n";
            $annotation .= "     *         required=true,\n";
            $annotation .= "     *         @OA\\Schema(type=\"integer\")\n";
            $annotation .= "     *     ),\n";
        }
        
        // Respuestas estándar
        $annotation .= "     *     @OA\\Response(response=200, description=\"Operación exitosa\"),\n";
        $annotation .= "     *     @OA\\Response(response=401, description=\"No autorizado\"),\n";
        $annotation .= "     *     @OA\\Response(response=500, description=\"Error interno del servidor\")\n";
        $annotation .= "     * )\n";
        $annotation .= "     */";
        
        return $annotation;
    }
}

// Ejecutar documentación
$documenter = new ControllerDocumenter();
$success = $documenter->documentAllControllers();

if ($success) {
    echo "\n🎯 ¡Todos los controladores han sido documentados exitosamente!\n";
    echo "📈 Ejecuta el script de verificación para confirmar la cobertura al 100%\n";
} else {
    echo "\n⚠️ Algunos controladores no pudieron ser documentados completamente\n";
    echo "🔍 Revisa los errores mostrados arriba\n";
}
