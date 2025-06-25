<?php

namespace App\Listeners;

use App\Events\Equipment\EquipmentCreated;
use App\Events\Equipment\EquipmentUpdated;
use App\Events\Equipment\EquipmentDeleted;
use App\Events\Maintenance\MaintenanceScheduled;
use App\Events\Contingency\ContingencyCreated;
use App\Events\Calibration\CalibrationScheduled;
use App\Events\Training\TrainingScheduled;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Calibracion;
use App\Models\Capacitacion;
use Illuminate\Support\Facades\Log;

class ModelEventListener
{
    /**
     * Handle equipment created model event.
     */
    public function handleEquipmentCreated($event, $data): void
    {
        try {
            $equipment = $data[0] ?? null;
            
            if (!$equipment instanceof Equipo) {
                return;
            }

            // The observer already handles this, but we can add additional logic here
            Log::info('Model event: Equipment created', [
                'equipment_id' => $equipment->id,
                'code' => $equipment->code,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment created model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle equipment updated model event.
     */
    public function handleEquipmentUpdated($event, $data): void
    {
        try {
            $equipment = $data[0] ?? null;
            
            if (!$equipment instanceof Equipo) {
                return;
            }

            // Additional logic for equipment updates
            Log::info('Model event: Equipment updated', [
                'equipment_id' => $equipment->id,
                'code' => $equipment->code,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment updated model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle equipment deleted model event.
     */
    public function handleEquipmentDeleted($event, $data): void
    {
        try {
            $equipment = $data[0] ?? null;
            
            if (!$equipment instanceof Equipo) {
                return;
            }

            // Additional logic for equipment deletion
            Log::warning('Model event: Equipment deleted', [
                'equipment_id' => $equipment->id,
                'code' => $equipment->code,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle equipment deleted model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle maintenance created model event.
     */
    public function handleMaintenanceCreated($event, $data): void
    {
        try {
            $maintenance = $data[0] ?? null;
            
            if (!$maintenance instanceof Mantenimiento) {
                return;
            }

            // Fire maintenance scheduled event
            event(new MaintenanceScheduled($maintenance, auth()->user(), [
                'action' => 'scheduled',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Model event: Maintenance created', [
                'maintenance_id' => $maintenance->id,
                'equipment_id' => $maintenance->equipo_id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle maintenance created model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle maintenance updated model event.
     */
    public function handleMaintenanceUpdated($event, $data): void
    {
        try {
            $maintenance = $data[0] ?? null;
            
            if (!$maintenance instanceof Mantenimiento) {
                return;
            }

            // Check if status changed to completed
            if ($maintenance->wasChanged('status') && $maintenance->status == 1) {
                event(new \App\Events\Maintenance\MaintenanceCompleted($maintenance, [
                    'completion_date' => $maintenance->fecha_mantenimiento,
                    'observations' => $maintenance->observacion,
                ], auth()->user()));
            }

            Log::info('Model event: Maintenance updated', [
                'maintenance_id' => $maintenance->id,
                'equipment_id' => $maintenance->equipo_id,
                'changes' => array_keys($maintenance->getChanges()),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle maintenance updated model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle contingency created model event.
     */
    public function handleContingencyCreated($event, $data): void
    {
        try {
            $contingency = $data[0] ?? null;
            
            if (!$contingency instanceof Contingencia) {
                return;
            }

            // Fire contingency created event
            event(new ContingencyCreated($contingency, auth()->user(), [
                'action' => 'created',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Model event: Contingency created', [
                'contingency_id' => $contingency->id,
                'equipment_id' => $contingency->equipo_id,
                'impact' => $contingency->impacto,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle contingency created model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle calibration created model event.
     */
    public function handleCalibrationCreated($event, $data): void
    {
        try {
            $calibration = $data[0] ?? null;
            
            if (!$calibration instanceof Calibracion) {
                return;
            }

            // Fire calibration scheduled event
            event(new CalibrationScheduled($calibration, auth()->user(), [
                'action' => 'scheduled',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Model event: Calibration created', [
                'calibration_id' => $calibration->id,
                'equipment_id' => $calibration->equipo_id,
                'scheduled_date' => $calibration->fecha_programada,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle calibration created model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle training created model event.
     */
    public function handleTrainingCreated($event, $data): void
    {
        try {
            $training = $data[0] ?? null;
            
            if (!$training instanceof Capacitacion) {
                return;
            }

            // Fire training scheduled event
            event(new TrainingScheduled($training, auth()->user(), [
                'action' => 'scheduled',
                'ip' => request()?->ip(),
                'user_agent' => request()?->userAgent(),
            ]));

            Log::info('Model event: Training created', [
                'training_id' => $training->id,
                'equipment_id' => $training->equipo_id,
                'scheduled_date' => $training->fecha_programada,
                'title' => $training->titulo,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to handle training created model event', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
