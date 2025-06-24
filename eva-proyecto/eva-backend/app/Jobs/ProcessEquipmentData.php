<?php

namespace App\Jobs;

use App\Models\Equipo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProcessEquipmentData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 300;

    /**
     * Equipment data to process.
     */
    protected array $equipmentData;

    /**
     * User ID who initiated the process.
     */
    protected ?int $userId;

    /**
     * Create a new job instance.
     */
    public function __construct(array $equipmentData, ?int $userId = null)
    {
        $this->equipmentData = $equipmentData;
        $this->userId = $userId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing equipment data', [
            'user_id' => $this->userId,
            'equipment_count' => count($this->equipmentData),
            'job_id' => $this->job->getJobId(),
        ]);

        try {
            foreach ($this->equipmentData as $data) {
                $this->processEquipment($data);
            }

            // Clear equipment cache after processing
            Cache::tags(['equipos'])->flush();

            Log::info('Equipment data processing completed', [
                'user_id' => $this->userId,
                'processed_count' => count($this->equipmentData),
            ]);

        } catch (\Exception $e) {
            Log::error('Equipment data processing failed', [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Process individual equipment.
     */
    protected function processEquipment(array $data): void
    {
        try {
            // Validate and sanitize data
            $cleanData = $this->sanitizeEquipmentData($data);

            // Create or update equipment
            if (isset($cleanData['id'])) {
                $equipo = Equipo::findOrFail($cleanData['id']);
                $equipo->update($cleanData);
            } else {
                $equipo = Equipo::create($cleanData);
            }

            // Process related data
            $this->processRelatedData($equipo, $data);

            Log::debug('Equipment processed successfully', [
                'equipment_id' => $equipo->id,
                'equipment_code' => $equipo->code,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process equipment', [
                'equipment_data' => $data,
                'error' => $e->getMessage(),
            ]);

            // Don't throw here to continue processing other equipment
        }
    }

    /**
     * Sanitize equipment data.
     */
    protected function sanitizeEquipmentData(array $data): array
    {
        $allowedFields = [
            'code', 'name', 'descripcion', 'marca', 'modelo', 'serial',
            'servicio_id', 'area_id', 'tipo_id', 'estadoequipo_id',
            'propietario_id', 'fuente_id', 'tecnologia_id', 'frecuencia_id',
            'cbiomedica_id', 'criesgo_id', 'tadquisicion_id', 'disponibilidad_id',
            'fecha_ad', 'fecha_instalacion', 'vida_util', 'costo', 'garantia',
            'periodicidad', 'calibracion', 'verificacion_inventario',
            'repuesto_pendiente', 'propiedad', 'movilidad', 'evaluacion_desempenio'
        ];

        $cleanData = array_intersect_key($data, array_flip($allowedFields));

        // Sanitize string fields
        foreach ($cleanData as $key => $value) {
            if (is_string($value)) {
                $cleanData[$key] = strip_tags(trim($value));
            }
        }

        // Validate dates
        $dateFields = ['fecha_ad', 'fecha_instalacion'];
        foreach ($dateFields as $field) {
            if (isset($cleanData[$field]) && !empty($cleanData[$field])) {
                try {
                    $cleanData[$field] = \Carbon\Carbon::parse($cleanData[$field])->format('Y-m-d');
                } catch (\Exception $e) {
                    unset($cleanData[$field]);
                }
            }
        }

        return $cleanData;
    }

    /**
     * Process related data for equipment.
     */
    protected function processRelatedData(Equipo $equipo, array $data): void
    {
        // Process manuals if provided
        if (isset($data['manuales']) && is_array($data['manuales'])) {
            $equipo->manuales()->sync($data['manuales']);
        }

        // Process spare parts if provided
        if (isset($data['repuestos']) && is_array($data['repuestos'])) {
            $repuestosData = [];
            foreach ($data['repuestos'] as $repuesto) {
                if (isset($repuesto['id'])) {
                    $repuestosData[$repuesto['id']] = [
                        'cantidad_recomendada' => $repuesto['cantidad_recomendada'] ?? 1,
                        'cantidad_actual' => $repuesto['cantidad_actual'] ?? 0,
                        'observaciones' => $repuesto['observaciones'] ?? null,
                    ];
                }
            }
            $equipo->repuestos()->sync($repuestosData);
        }

        // Process files if provided
        if (isset($data['archivos']) && is_array($data['archivos'])) {
            $equipo->archivos()->sync($data['archivos']);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('Equipment data processing job failed', [
            'user_id' => $this->userId,
            'equipment_count' => count($this->equipmentData),
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);

        // Notify user or admin about the failure
        // You could send an email or create a notification here
    }
}
