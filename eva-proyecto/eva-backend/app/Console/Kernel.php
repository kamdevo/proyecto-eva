<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Recordatorios de mantenimiento preventivo
        $schedule->command('notifications:send-maintenance-reminders --overdue')
                 ->dailyAt('08:00')
                 ->description('Enviar recordatorios diarios de mantenimiento')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Recordatorios de calibración
        $schedule->command('notifications:send-calibration-reminders --expired')
                 ->dailyAt('08:30')
                 ->description('Enviar recordatorios diarios de calibración')
                 ->withoutOverlapping()
                 ->runInBackground();

        // Recordatorios semanales (lunes)
        $schedule->command('notifications:send-maintenance-reminders --days=7')
                 ->weeklyOn(1, '09:00')
                 ->description('Recordatorios semanales de mantenimiento')
                 ->withoutOverlapping();

        $schedule->command('notifications:send-calibration-reminders --days=30,15')
                 ->weeklyOn(1, '09:30')
                 ->description('Recordatorios semanales de calibración')
                 ->withoutOverlapping();

        // Limpieza de logs antiguos (mensual)
        $schedule->command('notifications:cleanup')
                 ->monthlyOn(1, '02:00')
                 ->description('Limpiar logs de notificaciones antiguos')
                 ->withoutOverlapping();

        // Respaldo de datos de notificaciones (semanal)
        $schedule->command('backup:notification-data')
                 ->weeklyOn(7, '03:00')
                 ->description('Respaldar datos de notificaciones')
                 ->withoutOverlapping();

        // Verificación de salud del sistema de correo (cada 6 horas)
        $schedule->command('notifications:health-check')
                 ->everySixHours()
                 ->description('Verificar salud del sistema de correo')
                 ->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
