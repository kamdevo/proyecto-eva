<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use App\Notifications\PreventiveMaintenanceReminder;
use App\Models\Usuario;
use Carbon\Carbon;

/**
 * Comando para enviar recordatorios de mantenimiento preventivo
 * Se ejecuta diariamente para verificar mantenimientos próximos y vencidos
 */
class SendMaintenanceReminders extends Command
{
    /**
     * Nombre y firma del comando
     */
    protected $signature = 'notifications:send-maintenance-reminders 
                            {--days=7,3,1 : Días antes del vencimiento para enviar recordatorios}
                            {--overdue : Incluir mantenimientos vencidos}
                            {--dry-run : Simular envío sin enviar correos}';

    /**
     * Descripción del comando
     */
    protected $description = 'Envía recordatorios de mantenimiento preventivo próximos y vencidos';

    /**
     * Ejecutar el comando
     */
    public function handle()
    {
        $this->info('🔧 Iniciando envío de recordatorios de mantenimiento...');
        
        $dryRun = $this->option('dry-run');
        $includeOverdue = $this->option('overdue');
        $reminderDays = explode(',', $this->option('days'));
        
        if ($dryRun) {
            $this->warn('⚠️ MODO SIMULACIÓN - No se enviarán correos reales');
        }

        $totalSent = 0;

        // Enviar recordatorios para mantenimientos próximos
        foreach ($reminderDays as $days) {
            $days = (int) trim($days);
            $sent = $this->sendUpcomingReminders($days, $dryRun);
            $totalSent += $sent;
            $this->info("📅 Recordatorios enviados para {$days} días: {$sent}");
        }

        // Enviar recordatorios para mantenimientos vencidos
        if ($includeOverdue) {
            $sent = $this->sendOverdueReminders($dryRun);
            $totalSent += $sent;
            $this->info("🔴 Recordatorios de vencidos enviados: {$sent}");
        }

        $this->info("✅ Total de recordatorios enviados: {$totalSent}");
        
        return 0;
    }

    /**
     * Enviar recordatorios para mantenimientos próximos
     */
    private function sendUpcomingReminders(int $days, bool $dryRun): int
    {
        $targetDate = Carbon::now()->addDays($days)->format('Y-m-d');
        
        $maintenances = DB::table('planes_mantenimientos')
            ->join('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
            ->where('planes_mantenimientos.anio', Carbon::now()->year)
            ->where(function ($query) use ($targetDate) {
                $month = Carbon::parse($targetDate)->month;
                $query->where('planes_mantenimientos.mes1', $month)
                      ->orWhere('planes_mantenimientos.mes2', $month)
                      ->orWhere('planes_mantenimientos.mes3', $month);
            })
            ->whereNotExists(function ($query) use ($targetDate) {
                $query->select(DB::raw(1))
                      ->from('mantenimiento')
                      ->whereColumn('mantenimiento.equipo_id', 'planes_mantenimientos.equipo_id')
                      ->whereYear('mantenimiento.fecha_mantenimiento', Carbon::now()->year)
                      ->whereMonth('mantenimiento.fecha_mantenimiento', Carbon::parse($targetDate)->month);
            })
            ->select([
                'planes_mantenimientos.*',
                'equipos.name as equipo_name',
                'equipos.code as equipo_code',
                'equipos.marca',
                'equipos.modelo',
                'servicios.name as servicio_name',
                'areas.name as area_name',
                'sedes.name as sede_name'
            ])
            ->get();

        $sent = 0;

        foreach ($maintenances as $maintenance) {
            // Crear fecha programada basada en el mes correspondiente
            $scheduledDate = $this->getScheduledDate($maintenance, $targetDate);
            
            if (!$scheduledDate) continue;

            // Obtener usuarios responsables
            $users = $this->getResponsibleUsers($maintenance);

            foreach ($users as $user) {
                if ($dryRun) {
                    $this->line("  📧 [SIMULACIÓN] Enviando a: {$user->email} - Equipo: {$maintenance->equipo_name}");
                } else {
                    try {
                        $equipment = (object) [
                            'id' => $maintenance->equipo_id,
                            'name' => $maintenance->equipo_name,
                            'code' => $maintenance->equipo_code,
                            'marca' => $maintenance->marca,
                            'modelo' => $maintenance->modelo,
                            'servicio' => (object) ['name' => $maintenance->servicio_name],
                            'area' => (object) ['name' => $maintenance->area_name]
                        ];

                        $maintenanceObj = (object) [
                            'id' => $maintenance->id,
                            'fecha_programada' => $scheduledDate,
                            'responsable' => $maintenance->responsable
                        ];

                        $user->notify(new PreventiveMaintenanceReminder(
                            $maintenanceObj,
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
     * Enviar recordatorios para mantenimientos vencidos
     */
    private function sendOverdueReminders(bool $dryRun): int
    {
        $currentDate = Carbon::now();
        
        $overdueMaintenances = DB::table('planes_mantenimientos')
            ->join('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->where('planes_mantenimientos.anio', $currentDate->year)
            ->where(function ($query) use ($currentDate) {
                $currentMonth = $currentDate->month;
                $query->where(function ($q) use ($currentMonth) {
                    $q->where('planes_mantenimientos.mes1', '<', $currentMonth)
                      ->orWhere('planes_mantenimientos.mes2', '<', $currentMonth)
                      ->orWhere('planes_mantenimientos.mes3', '<', $currentMonth);
                });
            })
            ->whereNotExists(function ($query) use ($currentDate) {
                $query->select(DB::raw(1))
                      ->from('mantenimiento')
                      ->whereColumn('mantenimiento.equipo_id', 'planes_mantenimientos.equipo_id')
                      ->whereYear('mantenimiento.fecha_mantenimiento', $currentDate->year);
            })
            ->select([
                'planes_mantenimientos.*',
                'equipos.name as equipo_name',
                'equipos.code as equipo_code',
                'equipos.marca',
                'equipos.modelo',
                'servicios.name as servicio_name',
                'areas.name as area_name'
            ])
            ->get();

        $sent = 0;

        foreach ($overdueMaintenances as $maintenance) {
            $daysOverdue = $this->calculateDaysOverdue($maintenance, $currentDate);
            
            if ($daysOverdue <= 0) continue;

            $users = $this->getResponsibleUsers($maintenance);

            foreach ($users as $user) {
                if ($dryRun) {
                    $this->line("  🔴 [SIMULACIÓN] Vencido a: {$user->email} - Equipo: {$maintenance->equipo_name} ({$daysOverdue} días)");
                } else {
                    try {
                        $equipment = (object) [
                            'id' => $maintenance->equipo_id,
                            'name' => $maintenance->equipo_name,
                            'code' => $maintenance->equipo_code,
                            'marca' => $maintenance->marca,
                            'modelo' => $maintenance->modelo,
                            'servicio' => (object) ['name' => $maintenance->servicio_name],
                            'area' => (object) ['name' => $maintenance->area_name]
                        ];

                        $maintenanceObj = (object) [
                            'id' => $maintenance->id,
                            'fecha_programada' => $this->getOverdueDate($maintenance),
                            'responsable' => $maintenance->responsable
                        ];

                        $user->notify(new PreventiveMaintenanceReminder(
                            $maintenanceObj,
                            $equipment,
                            $daysOverdue,
                            'overdue'
                        ));

                        $sent++;
                    } catch (\Exception $e) {
                        $this->error("❌ Error enviando vencido a {$user->email}: " . $e->getMessage());
                    }
                }
            }
        }

        return $sent;
    }

    /**
     * Obtener usuarios responsables del mantenimiento
     */
    private function getResponsibleUsers($maintenance)
    {
        // Obtener usuarios según roles y responsabilidades
        $users = Usuario::where('estado', 1)
            ->where(function ($query) use ($maintenance) {
                // Super administradores reciben todas las notificaciones
                $query->where('rol', 'super_admin')
                      // Administradores de la sede
                      ->orWhere(function ($q) use ($maintenance) {
                          $q->where('rol', 'admin')
                            ->where('sede_id', $maintenance->sede_id ?? null);
                      })
                      // Técnicos responsables
                      ->orWhere(function ($q) use ($maintenance) {
                          $q->where('rol', 'tecnico')
                            ->where('especialidad', 'like', '%mantenimiento%');
                      });
            })
            ->whereNotNull('email')
            ->get();

        return $users;
    }

    /**
     * Obtener fecha programada basada en el mes
     */
    private function getScheduledDate($maintenance, $targetDate)
    {
        $targetMonth = Carbon::parse($targetDate)->month;
        $year = Carbon::parse($targetDate)->year;

        if ($maintenance->mes1 == $targetMonth) {
            return Carbon::create($year, $targetMonth, 15)->format('Y-m-d');
        } elseif ($maintenance->mes2 == $targetMonth) {
            return Carbon::create($year, $targetMonth, 15)->format('Y-m-d');
        } elseif ($maintenance->mes3 == $targetMonth) {
            return Carbon::create($year, $targetMonth, 15)->format('Y-m-d');
        }

        return null;
    }

    /**
     * Calcular días de vencimiento
     */
    private function calculateDaysOverdue($maintenance, $currentDate)
    {
        $overdueMonths = [];
        
        if ($maintenance->mes1 && $maintenance->mes1 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes1;
        }
        if ($maintenance->mes2 && $maintenance->mes2 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes2;
        }
        if ($maintenance->mes3 && $maintenance->mes3 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes3;
        }

        if (empty($overdueMonths)) {
            return 0;
        }

        $latestOverdueMonth = max($overdueMonths);
        $overdueDate = Carbon::create($currentDate->year, $latestOverdueMonth, 15);
        
        return $currentDate->diffInDays($overdueDate);
    }

    /**
     * Obtener fecha de vencimiento más reciente
     */
    private function getOverdueDate($maintenance)
    {
        $currentDate = Carbon::now();
        $overdueMonths = [];
        
        if ($maintenance->mes1 && $maintenance->mes1 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes1;
        }
        if ($maintenance->mes2 && $maintenance->mes2 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes2;
        }
        if ($maintenance->mes3 && $maintenance->mes3 < $currentDate->month) {
            $overdueMonths[] = $maintenance->mes3;
        }

        if (empty($overdueMonths)) {
            return $currentDate->format('Y-m-d');
        }

        $latestOverdueMonth = max($overdueMonths);
        return Carbon::create($currentDate->year, $latestOverdueMonth, 15)->format('Y-m-d');
    }
}
