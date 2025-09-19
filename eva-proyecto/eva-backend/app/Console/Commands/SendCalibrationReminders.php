<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Notifications\CalibrationReminder;
use App\Models\Usuario;
use Carbon\Carbon;

/**
 * Comando para enviar recordatorios de calibración
 * Se ejecuta diariamente para verificar calibraciones próximas a vencer y vencidas
 */
class SendCalibrationReminders extends Command
{
    /**
     * Nombre y firma del comando
     */
    protected $signature = 'notifications:send-calibration-reminders 
                            {--days=30,15,7 : Días antes del vencimiento para enviar recordatorios}
                            {--expired : Incluir calibraciones vencidas}
                            {--dry-run : Simular envío sin enviar correos}';

    /**
     * Descripción del comando
     */
    protected $description = 'Envía recordatorios de calibración próximas a vencer y vencidas';

    /**
     * Ejecutar el comando
     */
    public function handle()
    {
        $this->info('🔬 Iniciando envío de recordatorios de calibración...');
        
        $dryRun = $this->option('dry-run');
        $includeExpired = $this->option('expired');
        $reminderDays = explode(',', $this->option('days'));
        
        if ($dryRun) {
            $this->warn('⚠️ MODO SIMULACIÓN - No se enviarán correos reales');
        }

        $totalSent = 0;

        // Enviar recordatorios para calibraciones próximas
        foreach ($reminderDays as $days) {
            $days = (int) trim($days);
            $sent = $this->sendUpcomingReminders($days, $dryRun);
            $totalSent += $sent;
            $this->info("📅 Recordatorios enviados para {$days} días: {$sent}");
        }

        // Enviar recordatorios para calibraciones vencidas
        if ($includeExpired) {
            $sent = $this->sendExpiredReminders($dryRun);
            $totalSent += $sent;
            $this->info("🔴 Recordatorios de vencidas enviados: {$sent}");
        }

        $this->info("✅ Total de recordatorios enviados: {$totalSent}");
        
        return 0;
    }

    /**
     * Enviar recordatorios para calibraciones próximas a vencer
     */
    private function sendUpcomingReminders(int $days, bool $dryRun): int
    {
        $targetDate = Carbon::now()->addDays($days);
        
        $calibrations = DB::table('calibraciones')
            ->join('equipos', 'calibraciones.equipo_id', '=', 'equipos.id')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
            ->where('calibraciones.status', 1)
            ->whereDate('calibraciones.fecha_vencimiento', $targetDate->format('Y-m-d'))
            ->select([
                'calibraciones.*',
                'equipos.name as equipo_name',
                'equipos.code as equipo_code',
                'equipos.marca',
                'equipos.modelo',
                'servicios.name as servicio_name',
                'areas.name as area_name',
                'sedes.name as sede_name',
                'sedes.id as sede_id'
            ])
            ->get();

        $sent = 0;

        foreach ($calibrations as $calibration) {
            $users = $this->getResponsibleUsers($calibration);

            foreach ($users as $user) {
                if ($dryRun) {
                    $this->line("  📧 [SIMULACIÓN] Enviando a: {$user->email} - Equipo: {$calibration->equipo_name}");
                } else {
                    try {
                        $equipment = (object) [
                            'id' => $calibration->equipo_id,
                            'name' => $calibration->equipo_name,
                            'code' => $calibration->equipo_code,
                            'marca' => $calibration->marca,
                            'modelo' => $calibration->modelo,
                            'servicio' => (object) ['name' => $calibration->servicio_name],
                            'area' => (object) ['name' => $calibration->area_name]
                        ];

                        $calibrationObj = (object) [
                            'id' => $calibration->id,
                            'fecha_vencimiento' => $calibration->fecha_vencimiento,
                            'fecha_calibracion' => $calibration->fecha_calibracion,
                            'proveedor' => $calibration->proveedor
                        ];

                        $user->notify(new CalibrationReminder(
                            $calibrationObj,
                            $equipment,
                            $days,
                            'upcoming'
                        ));

                        $sent++;
                    } catch (\Exception $e) {
                        $this->error("❌ Error enviando a {$user->email}: " . $e->getMessage());
                    }
                }
            }
        }

        return $sent;
    }

    /**
     * Enviar recordatorios para calibraciones vencidas
     */
    private function sendExpiredReminders(bool $dryRun): int
    {
        $currentDate = Carbon::now();
        
        $expiredCalibrations = DB::table('calibraciones')
            ->join('equipos', 'calibraciones.equipo_id', '=', 'equipos.id')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
            ->where('calibraciones.status', 1)
            ->whereDate('calibraciones.fecha_vencimiento', '<', $currentDate->format('Y-m-d'))
            ->select([
                'calibraciones.*',
                'equipos.name as equipo_name',
                'equipos.code as equipo_code',
                'equipos.marca',
                'equipos.modelo',
                'servicios.name as servicio_name',
                'areas.name as area_name',
                'sedes.name as sede_name',
                'sedes.id as sede_id'
            ])
            ->get();

        $sent = 0;

        foreach ($expiredCalibrations as $calibration) {
            $expirationDate = Carbon::parse($calibration->fecha_vencimiento);
            $daysExpired = $currentDate->diffInDays($expirationDate);
            
            $users = $this->getResponsibleUsers($calibration);

            foreach ($users as $user) {
                if ($dryRun) {
                    $this->line("  🔴 [SIMULACIÓN] Vencida a: {$user->email} - Equipo: {$calibration->equipo_name} ({$daysExpired} días)");
                } else {
                    try {
                        $equipment = (object) [
                            'id' => $calibration->equipo_id,
                            'name' => $calibration->equipo_name,
                            'code' => $calibration->equipo_code,
                            'marca' => $calibration->marca,
                            'modelo' => $calibration->modelo,
                            'servicio' => (object) ['name' => $calibration->servicio_name],
                            'area' => (object) ['name' => $calibration->area_name]
                        ];

                        $calibrationObj = (object) [
                            'id' => $calibration->id,
                            'fecha_vencimiento' => $calibration->fecha_vencimiento,
                            'fecha_calibracion' => $calibration->fecha_calibracion,
                            'proveedor' => $calibration->proveedor
                        ];

                        $user->notify(new CalibrationReminder(
                            $calibrationObj,
                            $equipment,
                            $daysExpired,
                            'expired'
                        ));

                        $sent++;
                    } catch (\Exception $e) {
                        $this->error("❌ Error enviando vencida a {$user->email}: " . $e->getMessage());
                    }
                }
            }
        }

        return $sent;
    }

    /**
     * Obtener usuarios responsables de la calibración
     */
    private function getResponsibleUsers($calibration)
    {
        // Obtener usuarios según roles y responsabilidades
        $users = Usuario::where('estado', 1)
            ->where(function ($query) use ($calibration) {
                // Super administradores reciben todas las notificaciones
                $query->where('rol', 'super_admin')
                      // Administradores de la sede
                      ->orWhere(function ($q) use ($calibration) {
                          $q->where('rol', 'admin')
                            ->where('sede_id', $calibration->sede_id ?? null);
                      })
                      // Técnicos de calibración
                      ->orWhere(function ($q) use ($calibration) {
                          $q->where('rol', 'tecnico')
                            ->where('especialidad', 'like', '%calibracion%');
                      })
                      // Usuarios del servicio donde está el equipo
                      ->orWhere(function ($q) use ($calibration) {
                          $q->where('servicio_id', $calibration->servicio_id ?? null);
                      });
            })
            ->whereNotNull('email')
            ->get();

        return $users;
    }
}
