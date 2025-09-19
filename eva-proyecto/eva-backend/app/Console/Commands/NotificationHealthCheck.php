<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * Comando para verificar la salud del sistema de notificaciones
 * Verifica conectividad SMTP, cola de trabajos y estadísticas de entrega
 */
class NotificationHealthCheck extends Command
{
    /**
     * Nombre y firma del comando
     */
    protected $signature = 'notifications:health-check 
                            {--send-report : Enviar reporte de salud por correo}
                            {--email= : Email para enviar reporte}';

    /**
     * Descripción del comando
     */
    protected $description = 'Verificar la salud del sistema de notificaciones y correo';

    /**
     * Ejecutar el comando
     */
    public function handle()
    {
        $this->info('🔍 Iniciando verificación de salud del sistema de notificaciones...');
        
        $healthReport = [
            'timestamp' => Carbon::now(),
            'smtp_connection' => $this->checkSmtpConnection(),
            'queue_status' => $this->checkQueueStatus(),
            'delivery_rates' => $this->checkDeliveryRates(),
            'recent_errors' => $this->checkRecentErrors(),
            'disk_space' => $this->checkDiskSpace(),
            'overall_status' => 'healthy'
        ];

        // Determinar estado general
        $issues = 0;
        foreach ($healthReport as $key => $value) {
            if (is_array($value) && isset($value['status']) && $value['status'] !== 'ok') {
                $issues++;
            }
        }

        if ($issues > 0) {
            $healthReport['overall_status'] = $issues > 2 ? 'critical' : 'warning';
        }

        // Mostrar resultados
        $this->displayHealthReport($healthReport);

        // Enviar reporte por correo si se solicita
        if ($this->option('send-report')) {
            $this->sendHealthReport($healthReport);
        }

        // Log del reporte
        Log::info('Notification Health Check', $healthReport);

        return $healthReport['overall_status'] === 'healthy' ? 0 : 1;
    }

    /**
     * Verificar conexión SMTP
     */
    private function checkSmtpConnection(): array
    {
        try {
            $this->info('📧 Verificando conexión SMTP...');
            
            // Intentar enviar un correo de prueba a una dirección ficticia
            $testResult = Mail::raw('Test de conectividad SMTP', function ($message) {
                $message->to('test@example.com')
                        ->subject('SMTP Health Check');
            });

            return [
                'status' => 'ok',
                'message' => 'Conexión SMTP exitosa',
                'details' => [
                    'host' => config('mail.mailers.smtp.host'),
                    'port' => config('mail.mailers.smtp.port'),
                    'encryption' => config('mail.mailers.smtp.encryption')
                ]
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error de conexión SMTP',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar estado de la cola
     */
    private function checkQueueStatus(): array
    {
        try {
            $this->info('⏳ Verificando estado de la cola...');
            
            // Verificar trabajos pendientes
            $pendingJobs = DB::table('jobs')->count();
            $failedJobs = DB::table('failed_jobs')->count();
            
            $status = 'ok';
            $message = 'Cola funcionando correctamente';
            
            if ($pendingJobs > 100) {
                $status = 'warning';
                $message = 'Muchos trabajos pendientes en cola';
            }
            
            if ($failedJobs > 10) {
                $status = 'error';
                $message = 'Demasiados trabajos fallidos';
            }

            return [
                'status' => $status,
                'message' => $message,
                'details' => [
                    'pending_jobs' => $pendingJobs,
                    'failed_jobs' => $failedJobs,
                    'queue_connection' => config('queue.default')
                ]
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error verificando cola',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar tasas de entrega
     */
    private function checkDeliveryRates(): array
    {
        try {
            $this->info('📊 Verificando tasas de entrega...');
            
            $last24h = Carbon::now()->subDay();
            $last7d = Carbon::now()->subWeek();
            
            // Estadísticas últimas 24 horas
            $sent24h = DB::table('notification_logs')
                ->where('sent_at', '>=', $last24h)
                ->count();
                
            $delivered24h = DB::table('notification_logs')
                ->where('sent_at', '>=', $last24h)
                ->where('status', 'delivered')
                ->count();
                
            $failed24h = DB::table('notification_logs')
                ->where('sent_at', '>=', $last24h)
                ->where('status', 'failed')
                ->count();

            // Estadísticas últimos 7 días
            $sent7d = DB::table('notification_logs')
                ->where('sent_at', '>=', $last7d)
                ->count();
                
            $delivered7d = DB::table('notification_logs')
                ->where('sent_at', '>=', $last7d)
                ->where('status', 'delivered')
                ->count();

            $deliveryRate24h = $sent24h > 0 ? round(($delivered24h / $sent24h) * 100, 2) : 0;
            $deliveryRate7d = $sent7d > 0 ? round(($delivered7d / $sent7d) * 100, 2) : 0;
            $failureRate24h = $sent24h > 0 ? round(($failed24h / $sent24h) * 100, 2) : 0;

            $status = 'ok';
            $message = 'Tasas de entrega normales';
            
            if ($deliveryRate24h < 80) {
                $status = 'warning';
                $message = 'Tasa de entrega baja en 24h';
            }
            
            if ($failureRate24h > 20) {
                $status = 'error';
                $message = 'Alta tasa de fallos en 24h';
            }

            return [
                'status' => $status,
                'message' => $message,
                'details' => [
                    'last_24h' => [
                        'sent' => $sent24h,
                        'delivered' => $delivered24h,
                        'failed' => $failed24h,
                        'delivery_rate' => $deliveryRate24h,
                        'failure_rate' => $failureRate24h
                    ],
                    'last_7d' => [
                        'sent' => $sent7d,
                        'delivered' => $delivered7d,
                        'delivery_rate' => $deliveryRate7d
                    ]
                ]
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error verificando tasas de entrega',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar errores recientes
     */
    private function checkRecentErrors(): array
    {
        try {
            $this->info('🚨 Verificando errores recientes...');
            
            $last24h = Carbon::now()->subDay();
            
            $recentErrors = DB::table('notification_logs')
                ->where('status', 'failed')
                ->where('sent_at', '>=', $last24h)
                ->select('error_message', DB::raw('count(*) as count'))
                ->groupBy('error_message')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get();

            $totalErrors = $recentErrors->sum('count');
            
            $status = $totalErrors > 50 ? 'error' : ($totalErrors > 10 ? 'warning' : 'ok');
            $message = $totalErrors === 0 ? 'Sin errores recientes' : "Se encontraron {$totalErrors} errores en 24h";

            return [
                'status' => $status,
                'message' => $message,
                'details' => [
                    'total_errors_24h' => $totalErrors,
                    'top_errors' => $recentErrors->toArray()
                ]
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error verificando errores recientes',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Verificar espacio en disco
     */
    private function checkDiskSpace(): array
    {
        try {
            $this->info('💾 Verificando espacio en disco...');
            
            $logPath = storage_path('logs');
            $totalSpace = disk_total_space($logPath);
            $freeSpace = disk_free_space($logPath);
            $usedSpace = $totalSpace - $freeSpace;
            
            $usagePercent = round(($usedSpace / $totalSpace) * 100, 2);
            
            $status = 'ok';
            $message = 'Espacio en disco suficiente';
            
            if ($usagePercent > 90) {
                $status = 'error';
                $message = 'Espacio en disco crítico';
            } elseif ($usagePercent > 80) {
                $status = 'warning';
                $message = 'Espacio en disco bajo';
            }

            return [
                'status' => $status,
                'message' => $message,
                'details' => [
                    'total_space_gb' => round($totalSpace / 1024 / 1024 / 1024, 2),
                    'free_space_gb' => round($freeSpace / 1024 / 1024 / 1024, 2),
                    'usage_percent' => $usagePercent
                ]
            ];

        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Error verificando espacio en disco',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Mostrar reporte de salud
     */
    private function displayHealthReport(array $report): void
    {
        $this->info("\n📋 REPORTE DE SALUD DEL SISTEMA");
        $this->info("=" . str_repeat("=", 50));
        
        $statusIcon = [
            'healthy' => '✅',
            'warning' => '⚠️',
            'critical' => '🔴'
        ];
        
        $this->info("Estado General: " . ($statusIcon[$report['overall_status']] ?? '❓') . " " . strtoupper($report['overall_status']));
        $this->info("Fecha: " . $report['timestamp']->format('Y-m-d H:i:s'));
        $this->line("");

        // Mostrar cada verificación
        foreach ($report as $key => $value) {
            if (is_array($value) && isset($value['status'])) {
                $icon = $value['status'] === 'ok' ? '✅' : ($value['status'] === 'warning' ? '⚠️' : '❌');
                $this->line("{$icon} " . ucfirst(str_replace('_', ' ', $key)) . ": " . $value['message']);
                
                if (isset($value['details']) && is_array($value['details'])) {
                    foreach ($value['details'] as $detailKey => $detailValue) {
                        if (is_scalar($detailValue)) {
                            $this->line("   • " . ucfirst(str_replace('_', ' ', $detailKey)) . ": " . $detailValue);
                        }
                    }
                }
                $this->line("");
            }
        }
    }

    /**
     * Enviar reporte de salud por correo
     */
    private function sendHealthReport(array $report): void
    {
        try {
            $email = $this->option('email') ?? config('mail.admin_email', 'admin@hospital.com');
            
            $subject = "Reporte de Salud - Sistema EVA - " . strtoupper($report['overall_status']);
            
            $body = $this->formatHealthReportForEmail($report);
            
            Mail::raw($body, function ($message) use ($email, $subject) {
                $message->to($email)
                        ->subject($subject)
                        ->from(config('mail.from.address'), 'Sistema EVA - Health Check');
            });
            
            $this->info("📧 Reporte enviado a: {$email}");
            
        } catch (\Exception $e) {
            $this->error("❌ Error enviando reporte: " . $e->getMessage());
        }
    }

    /**
     * Formatear reporte para correo
     */
    private function formatHealthReportForEmail(array $report): string
    {
        $body = "REPORTE DE SALUD DEL SISTEMA EVA\n";
        $body .= str_repeat("=", 50) . "\n\n";
        $body .= "Estado General: " . strtoupper($report['overall_status']) . "\n";
        $body .= "Fecha: " . $report['timestamp']->format('Y-m-d H:i:s') . "\n\n";

        foreach ($report as $key => $value) {
            if (is_array($value) && isset($value['status'])) {
                $status = $value['status'] === 'ok' ? 'OK' : strtoupper($value['status']);
                $body .= ucfirst(str_replace('_', ' ', $key)) . ": [{$status}] " . $value['message'] . "\n";
                
                if (isset($value['details']) && is_array($value['details'])) {
                    foreach ($value['details'] as $detailKey => $detailValue) {
                        if (is_scalar($detailValue)) {
                            $body .= "  - " . ucfirst(str_replace('_', ' ', $detailKey)) . ": " . $detailValue . "\n";
                        }
                    }
                }
                $body .= "\n";
            }
        }

        $body .= "\n" . str_repeat("-", 50) . "\n";
        $body .= "Este es un reporte automático del Sistema EVA.\n";
        $body .= "Para más información, revise los logs del sistema.\n";

        return $body;
    }
}
