<?php

namespace App\Services;

use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Log;

class ReactEmailService
{
    private $emailsPath;
    
    public function __construct()
    {
        $this->emailsPath = base_path('../emails');
    }
    
    /**
     * Renderizar email de repuesto pendiente
     */
    public function renderRepuestoPendiente($preventivo)
    {
        try {
            $data = [
                'preventivo' => [
                    'id' => $preventivo->id ?? 0,
                    'fecha_mantenimiento' => $preventivo->fecha_mantenimiento ?? null,
                    'observacion' => $preventivo->observacion ?? null,
                    'servicio_nombre' => $preventivo->servicio_nombre ?? null,
                    'area_nombre' => $preventivo->area_nombre ?? null,
                    'equipo_id' => $preventivo->equipo_id ?? null,
                    'equipo_nombre' => $preventivo->equipo_nombre ?? null,
                    'equipo_marca' => $preventivo->equipo_marca ?? null,
                    'equipo_modelo' => $preventivo->equipo_modelo ?? null,
                    'equipo_codigo' => $preventivo->equipo_codigo ?? null,
                    'equipo_serie' => $preventivo->equipo_serie ?? null,
                ]
            ];
            
            return $this->renderEmail('repuesto-pendiente', $data);
            
        } catch (\Exception $e) {
            Log::error('Error renderizando email de repuesto pendiente: ' . $e->getMessage());
            return $this->getFallbackHtml('repuesto-pendiente', $preventivo);
        }
    }
    
    /**
     * Renderizar email de nuevo ticket
     */
    public function renderNuevoTicket($ticket)
    {
        try {
            // Normalizar datos del ticket (puede venir como objeto o array)
            $ticketArray = is_object($ticket) ? (array)$ticket : $ticket;
            
            // Normalizar prioridad (puede venir como texto o número)
            $prioridadRaw = $ticketArray['prioridad'] ?? 1;
            $prioridadNormalizada = 1; // Por defecto BAJA
            if ($prioridadRaw === 'alta' || $prioridadRaw === 3) {
                $prioridadNormalizada = 3; // ALTA
            } elseif ($prioridadRaw === 'media' || $prioridadRaw === 2) {
                $prioridadNormalizada = 2; // MEDIA
            }
            
            $data = [
                'ticket' => [
                    'id' => $ticketArray['id'] ?? 0,
                    'descripcion' => $ticketArray['descripcion'] ?? null,
                    'fecha_inicio' => $ticketArray['fecha_inicio'] ?? null,
                    'prioridad' => $prioridadNormalizada,
                    'servicio_nombre' => $ticketArray['servicio_nombre'] ?? null,
                    'area_nombre' => $ticketArray['area_nombre'] ?? null,
                    'equipo_id' => $ticketArray['equipo_id'] ?? null,
                    'equipo_nombre' => $ticketArray['equipo_nombre'] ?? null,
                    'equipo_marca' => $ticketArray['equipo_marca'] ?? null,
                    'equipo_modelo' => $ticketArray['equipo_modelo'] ?? null,
                    'equipo_codigo' => $ticketArray['equipo_codigo'] ?? null,
                    'equipo_serie' => $ticketArray['equipo_serie'] ?? null,
                    'reportante_nombre' => $ticketArray['reportante_nombre'] ?? null,
                ]
            ];
            
            Log::info('📊 Datos del ticket preparados: ID=' . $data['ticket']['id'] . ', Descripción=' . substr($data['ticket']['descripcion'], 0, 50));
            Log::info('🔍 DATOS COMPLETOS DEL TICKET: ' . json_encode($data['ticket'], JSON_PRETTY_PRINT));
            
            return $this->renderEmail('nuevo-ticket', $data);
        } catch (\Exception $e) {
            Log::error('Error renderizando email de nuevo ticket: ' . $e->getMessage());
            return $this->getFallbackHtml('nuevo-ticket', ['ticket' => (array)$ticket]);
        }
    }
    
    /**
     * Renderizar email de confirmación de cuenta
     */
    public function renderConfirmacionCuenta($usuario, $urlConfirmacion)
    {
        try {
            $data = [
                'usuario' => [
                    'nombre' => $usuario->nombre ?? '',
                    'apellido' => $usuario->apellido ?? '',
                    'email' => $usuario->email ?? '',
                ],
                'urlConfirmacion' => $urlConfirmacion
            ];
            
            return $this->renderEmail('confirmacion-cuenta', $data);
            
        } catch (\Exception $e) {
            Log::error('Error renderizando email de confirmación de cuenta: ' . $e->getMessage());
            return $this->getFallbackHtml('confirmacion-cuenta', $data);
        }
    }
    
    /**
     * Renderizar email de prueba
     */
    public function renderTestEmail($email = 'test@example.com')
    {
        try {
            $data = [
                'email' => $email,
                'fecha' => now()->format('d/m/Y H:i:s')
            ];
            
            return $this->renderEmail('test-email', $data);
            
        } catch (\Exception $e) {
            Log::error('Error renderizando email de prueba: ' . $e->getMessage());
            return $this->getFallbackTestHtml($email);
        }
    }
    
    /**
     * Renderizar email usando React Email
     */
    private function renderEmail($template, $data)
    {
        try {
            // USAR DIRECTAMENTE HTML ROBUSTO con datos reales
            Log::info("📧 Usando HTML optimizado para $template con datos reales");
            return $this->getFallbackHtml($template, $data);
            
        } catch (\Exception $e) {
            \Log::error("Error generando HTML para $template: " . $e->getMessage());
            // Fallback básico de emergencia
            return $this->getBasicHtml($template, $data);
        }
    }
    
    /**
     * Renderizar email usando React Email con datos reales
     */
    private function renderEmailWithReact($template, $data)
    {
        try {
            // Directorio de React Email
            $emailsPath = base_path('../emails');
            
            // Primero generar los HTML estáticos
            Log::info("🚀 Generando plantillas React Email...");
            $exportResult = Process::run("cd {$emailsPath} && npm run export", timeout: 30);
            
            if (!$exportResult->successful()) {
                throw new \Exception("Error generando plantillas: " . $exportResult->errorOutput());
            }
            
            // Leer el HTML generado
            $htmlFilePath = $emailsPath . '/out/' . $template . '.html';
            
            if (!file_exists($htmlFilePath)) {
                throw new \Exception("Archivo HTML no generado: {$htmlFilePath}");
            }
            
            $htmlContent = file_get_contents($htmlFilePath);
            
            // Reemplazar datos por valores reales
            $htmlContent = $this->insertRealData($htmlContent, $template, $data);
            
            Log::info("✅ React Email con datos reales exitoso. HTML: " . strlen($htmlContent) . " caracteres");
            return $htmlContent;
            
        } catch (\Exception $e) {
            Log::error("❌ Error en renderEmailWithReact: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Insertar datos reales en el HTML generado
     */
    private function insertRealData($htmlContent, $template, $data)
    {
        Log::info("🔄 insertRealData ejecutándose para template: $template");
        Log::info("📊 Datos recibidos: " . json_encode($data, JSON_PRETTY_PRINT));
        
        if ($template === 'nuevo-ticket' && isset($data['ticket'])) {
            $ticket = $data['ticket'];
            
            Log::info("🎯 Procesando ticket ID: " . ($ticket['id'] ?? 'NO_ID'));
            
            // Como estamos usando getFallbackHtml directamente, los datos ya están incluidos
            // No necesitamos hacer reemplazos porque el HTML se genera dinámicamente
            Log::info("✅ Datos del ticket ya incluidos en el HTML generado dinámicamente");
            
        } else if ($template === 'repuesto-pendiente' && isset($data['preventivo'])) {
            $preventivo = $data['preventivo'];
            
            Log::info("🎯 Procesando preventivo ID: " . ($preventivo['id'] ?? 'NO_ID'));
            Log::info("✅ Datos del preventivo ya incluidos en el HTML generado dinámicamente");
        }
        
        return $htmlContent;
    }
    
    /**
     * HTML de fallback si React Email falla
     */
    private function getFallbackHtml($template, $data)
    {
        switch ($template) {
            case 'repuesto-pendiente':
                return $this->getFallbackRepuestoHtml($data);
            case 'nuevo-ticket':
                return $this->getFallbackTicketHtml($data);
            case 'confirmacion-cuenta':
                return $this->getFallbackConfirmacionCuentaHtml($data);
            case 'test-email':
                return $this->getFallbackTestHtml($data['email'] ?? 'test@example.com');
            default:
                return '<h1>Email de prueba</h1><p>Template: ' . $template . '</p>';
        }
    }
    
    private function getFallbackRepuestoHtml($data)
    {
        $preventivo = $data['preventivo'] ?? $data;
        $fechaActual = now()->format('d/m/Y H:i:s');
        $año = now()->year;
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Repuesto Pendiente - Hospital Universitario del Valle</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
                .header img { display: block; margin: 0 auto 15px auto; border-radius: 10px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
                .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
                .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
                .content { padding: 30px 20px; background-color: #ffffff; }
                .info-title { color: #333333; font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #70bbd9; }
                .info-row { margin: 8px 0; }
                .info-label { color: #333333; font-weight: bold; }
                .info-value { color: #666666; }
                .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
                .equipment-info { padding: 5px 0; line-height: 1.6; color: #666666; }
                .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
                .footer p { margin: 5px 0; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header con Logo -->
                <div class="header">
                    <img src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg" 
                         alt="Hospital Universitario del Valle" 
                         width="120" height="120">
                    <h1>PREVENTIVO NRO ' . ($preventivo['id'] ?? 'N/A') . '</h1>
                </div>

                <!-- Subtítulo -->
                <div class="subtitle">
                    <p>Eva Gestiona la tecnología</p>
                </div>

                <!-- Contenido -->
                <div class="content">
                    <!-- Alerta de Repuesto Pendiente -->
                    <div class="alert-box">
                        <h3 style="color: #856404; margin: 0 0 10px 0;">⚠️ REPUESTO PENDIENTE</h3>
                        <p style="color: #856404; margin: 0;">Este mantenimiento preventivo requiere repuestos para completarse.</p>
                    </div>

                    <!-- Información del Preventivo -->
                    <h3 class="info-title">Información del Mantenimiento:</h3>
                    <div class="info-row">
                        <span class="info-label">Fecha de ejecución:</span> 
                        <span class="info-value">' . ($preventivo['fecha_mantenimiento'] ?? $fechaActual) . '</span>
                    </div>
                    ' . (($preventivo['observacion'] ?? false) ? '
                    <div class="info-row">
                        <span class="info-label">Observaciones:</span> 
                        <span class="info-value">' . $preventivo['observacion'] . '</span>
                    </div>' : '') . '

                    <!-- Ubicación -->
                    <h3 class="info-title">Ubicación:</h3>
                    <div class="info-row">
                        <span class="info-label">Servicio:</span> 
                        <span class="info-value">' . ($preventivo['servicio_nombre'] ?? 'N/A') . '</span>
                    </div>
                    ' . (($preventivo['area_nombre'] ?? false) ? '
                    <div class="info-row">
                        <span class="info-label">Área:</span> 
                        <span class="info-value">' . $preventivo['area_nombre'] . '</span>
                    </div>' : '') . '

                    <!-- Información del Equipo -->
                    <h3 class="info-title">Información del equipo:</h3>
                    <div class="equipment-info">• <strong>Id del equipo:</strong> ' . ($preventivo['equipo_id'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Nombre del equipo:</strong> ' . ($preventivo['equipo_nombre'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Marca del equipo:</strong> ' . ($preventivo['equipo_marca'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Modelo del equipo:</strong> ' . ($preventivo['equipo_modelo'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Código del equipo:</strong> ' . ($preventivo['equipo_codigo'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Serie del equipo:</strong> ' . ($preventivo['equipo_serie'] ?? 'N/A') . '</div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p><strong>Eva Gestiona la medicina</strong></p>
                    <p>Hospital Universitario del Valle - Evaristo García E.S.E.</p>
                    <p>' . $fechaActual . ' - ' . $año . '</p>
                </div>
            </div>
        </body>
        </html>';
    }
    
    private function getFallbackTicketHtml($data)
    {
        $ticket = $data['ticket'] ?? $data;
        $fechaActual = now()->format('d/m/Y H:i:s');
        $año = now()->year;
        
        $prioridad = $ticket['prioridad'] ?? 1;
        $prioridadTexto = $prioridad == 3 ? 'ALTA' : ($prioridad == 2 ? 'MEDIA' : 'BAJA');
        $prioridadColor = $prioridad == 3 ? '#dc3545' : ($prioridad == 2 ? '#ffc107' : '#28a745');
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Nuevo Ticket - Hospital Universitario del Valle</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
                .header img { display: block; margin: 0 auto 15px auto; border-radius: 10px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
                .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
                .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
                .content { padding: 30px 20px; background-color: #ffffff; }
                .info-section { margin: 20px 0; }
                .info-title { color: #333333; font-size: 16px; font-weight: bold; margin: 15px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #70bbd9; }
                .info-row { margin: 8px 0; }
                .info-label { color: #333333; font-weight: bold; }
                .info-value { color: #666666; }
                .description-box { background-color: #f8f9fa; border-left: 4px solid #70bbd9; padding: 15px; margin: 15px 0; }
                .equipment-info { padding: 5px 0; line-height: 1.6; color: #666666; }
                .priority-badge { display: inline-block; padding: 5px 15px; border-radius: 4px; font-weight: bold; color: white; background-color: ' . $prioridadColor . '; }
                .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
                .footer p { margin: 5px 0; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header con Logo -->
                <div class="header">
                    <img src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg" 
                         alt="Hospital Universitario del Valle" 
                         width="120" height="120">
                    <h1>TICKET NRO ' . ($ticket['id'] ?? 'N/A') . '</h1>
                </div>

                <!-- Subtítulo -->
                <div class="subtitle">
                    <p>Eva Gestiona la tecnología</p>
                </div>

                <!-- Contenido -->
                <div class="content">
                    <!-- Descripción Principal -->
                    <div class="description-box">
                        <h3 class="info-title" style="border: none; margin: 0 0 10px 0;">Descripción del Problema:</h3>
                        <p style="margin: 0; color: #666;">' . ($ticket['descripcion'] ?? 'Sin descripción disponible') . '</p>
                        <div class="info-row" style="margin-top: 10px;">
                            <span class="info-label">Fecha de registro:</span> 
                            <span class="info-value">' . ($ticket['fecha_inicio'] ?? $fechaActual) . '</span>
                        </div>
                    </div>

                    <!-- Ubicación -->
                    <h3 class="info-title">Ubicación de referencia:</h3>
                    <div class="info-row">
                        <span class="info-label">Servicio:</span> 
                        <span class="info-value">' . ($ticket['servicio_nombre'] ?? 'N/A') . '</span>
                    </div>
                    ' . (($ticket['area_nombre'] ?? false) ? '
                    <div class="info-row">
                        <span class="info-label">Área:</span> 
                        <span class="info-value">' . $ticket['area_nombre'] . '</span>
                    </div>' : '') . '

                    <!-- Información del Equipo -->
                    <h3 class="info-title">Información del equipo:</h3>
                    <div class="equipment-info">• <strong>Id del equipo:</strong> ' . ($ticket['equipo_id'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Nombre del equipo:</strong> ' . ($ticket['equipo_nombre'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Marca del equipo:</strong> ' . ($ticket['equipo_marca'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Modelo del equipo:</strong> ' . ($ticket['equipo_modelo'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Código del equipo:</strong> ' . ($ticket['equipo_codigo'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Serie del equipo:</strong> ' . ($ticket['equipo_serie'] ?? 'N/A') . '</div>
                    <div class="equipment-info">• <strong>Prioridad:</strong> <span class="priority-badge">' . $prioridadTexto . '</span></div>

                    <!-- Información del Solicitante -->
                    <h3 class="info-title">Información del Solicitante:</h3>
                    <div class="equipment-info">• <strong>Nombre:</strong> ' . ($ticket['reportante_nombre'] ?? 'N/A') . '</div>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p><strong>Eva Gestiona la medicina</strong></p>
                    <p>Hospital Universitario del Valle - Evaristo García E.S.E.</p>
                    <p>' . $fechaActual . ' - ' . $año . '</p>
                </div>
            </div>
        </body>
        </html>';
    }
    
    
    /**
     * HTML de fallback para email de confirmación de cuenta
     */
    private function getFallbackConfirmacionCuentaHtml($data)
    {
        $usuario = $data['usuario'] ?? [];
        $urlConfirmacion = $data['urlConfirmacion'] ?? '#';
        $nombreCompleto = trim(($usuario['nombre'] ?? '') . ' ' . ($usuario['apellido'] ?? ''));
        $email = $usuario['email'] ?? '';
        $fechaActual = now()->format('d/m/Y H:i:s');
        $año = now()->year;
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Confirmación de Cuenta - Sistema EVA</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
                .header img { display: block; margin: 0 auto 15px auto; border-radius: 10px; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
                .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
                .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
                .content { padding: 30px 20px; background-color: #ffffff; }
                .welcome-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; text-align: center; }
                .welcome-box h2 { color: #2e7d32; margin: 0 0 10px 0; font-size: 20px; }
                .welcome-box p { color: #388e3c; margin: 5px 0; font-size: 14px; }
                .info-section { margin: 20px 0; }
                .info-row { margin: 8px 0; }
                .info-label { color: #333333; font-weight: bold; }
                .info-value { color: #666666; }
                .button-container { text-align: center; margin: 30px 0; }
                .confirm-button { 
                    display: inline-block; 
                    background-color: #2196F3; 
                    color: #ffffff; 
                    padding: 15px 40px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    font-size: 16px;
                }
                .confirm-button:hover { background-color: #1976D2; }
                .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
                .footer p { margin: 5px 0; font-size: 12px; }
                .note { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; font-size: 13px; color: #856404; }
            </style>
        </head>
        <body>
            <div class="container">
                <!-- Header con Logo -->
                <div class="header">
                    <img src="https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg" 
                         alt="Hospital Universitario del Valle" 
                         width="120" height="120">
                    <h1>CONFIRMACIÓN DE CUENTA</h1>
                </div>

                <!-- Subtítulo -->
                <div class="subtitle">
                    <p>Eva Gestiona la tecnología</p>
                </div>

                <!-- Contenido -->
                <div class="content">
                    <!-- Mensaje de Bienvenida -->
                    <div class="welcome-box">
                        <h2>¡Bienvenido al Sistema EVA!</h2>
                        <p>Gracias por registrarte en nuestro sistema de gestión tecnológica</p>
                    </div>

                    <p style="color: #333; font-size: 15px; line-height: 1.6;">
                        Hola <strong>' . htmlspecialchars($nombreCompleto) . '</strong>,
                    </p>

                    <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 15px;">
                        Tu cuenta ha sido creada exitosamente. Para activarla y poder acceder al sistema, 
                        necesitamos que confirmes tu dirección de correo electrónico.
                    </p>

                    <!-- Información de la cuenta -->
                    <div class="info-section">
                        <div class="info-row">
                            <span class="info-label">📧 Email:</span> 
                            <span class="info-value">' . htmlspecialchars($email) . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">👤 Nombre:</span> 
                            <span class="info-value">' . htmlspecialchars($nombreCompleto) . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📅 Fecha de registro:</span> 
                            <span class="info-value">' . $fechaActual . '</span>
                        </div>
                    </div>

                    <!-- Botón de Confirmación -->
                    <div class="button-container">
                        <a href="' . htmlspecialchars($urlConfirmacion) . '" class="confirm-button">
                            ✓ CONFIRMAR MI CUENTA
                        </a>
                    </div>

                    <!-- Nota importante -->
                    <div class="note">
                        <strong>⚠️ Nota Importante:</strong><br>
                        Este enlace de confirmación expirará en <strong>24 horas</strong>. 
                        Si no confirmaste tu cuenta dentro de este período, deberás solicitar un nuevo enlace.
                    </div>

                    <p style="color: #999; font-size: 12px; margin-top: 20px; line-height: 1.5;">
                        Si no creaste esta cuenta, puedes ignorar este mensaje. 
                        Si tienes alguna pregunta, contacta con el administrador del sistema.
                    </p>
                </div>

                <!-- Footer -->
                <div class="footer">
                    <p><strong>Sistema EVA</strong></p>
                    <p>Eva Gestiona la tecnología - Hospital Universitario del Valle</p>
                    <p>' . $fechaActual . ' - ' . $año . '</p>
                </div>
            </div>
        </body>
        </html>';
    }
    
    /**
     * HTML de fallback para email de prueba
     */
    private function getFallbackTestHtml($email)
    {
        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Prueba Sistema EVA</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
        <div style="background: #70bbd9; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0;">🧪 PRUEBA DE CORREO</h1>
        </div>
        <div style="background: #5aa9c9; color: white; padding: 15px; text-align: center; font-style: italic;">
            Eva Gestiona la tecnología
        </div>
        <div style="padding: 30px;">
            <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0;">
                <h3 style="color: #2e7d32; margin: 0 0 10px 0;">✅ ¡Configuración Exitosa!</h3>
                <p style="color: #388e3c; margin: 0;">Sistema EVA funcionando correctamente (Fallback HTML)</p>
            </div>
            <p><strong>Destinatario:</strong> ' . $email . '</p>
            <p><strong>Fecha:</strong> ' . now()->format('d/m/Y H:i:s') . '</p>
        </div>
        <div style="background: #ee4c50; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0; font-size: 12px;"><strong>Electromedicina, 2019 - Hospital Universitario del valle</strong></p>
        </div>
    </div>
</body>
</html>';
    }
}
