<?php

namespace App\Services;

use App\Models\Equipo;
use App\Jobs\ProcessEquipmentData;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\UploadedFile;

class EquipoService extends BaseService
{
    /**
     * Get model instance.
     */
    protected function getModel(): Model
    {
        return new Equipo();
    }

    /**
     * Get equipment with full relations.
     */
    public function getWithFullRelations(int $id): ?Equipo
    {
        $cacheKey = $this->getCacheKey("full_relations_{$id}");

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($id) {
            return $this->model->with([
                'servicio:id,name',
                'area:id,name',
                'tipo:id,name',
                'estadoequipo:id,name,color',
                'propietario:id,nombre,logo',
                'mantenimientos' => function ($query) {
                    $query->latest()->limit(10);
                },
                'contingencias' => function ($query) {
                    $query->latest()->limit(5);
                },
                'calibraciones' => function ($query) {
                    $query->latest()->limit(5);
                },
                'archivos' => function ($query) {
                    $query->where('activo', true);
                },
                'repuestos' => function ($query) {
                    $query->wherePivot('cantidad_actual', '>', 0);
                }
            ])->find($id);
        });
    }

    /**
     * Get equipment by service.
     */
    public function getByService(int $servicioId, bool $activeOnly = true): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey("by_service_{$servicioId}", ['active' => $activeOnly]);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($servicioId, $activeOnly) {
            $query = $this->model->where('servicio_id', $servicioId);
            
            if ($activeOnly) {
                $query->where('status', 1);
            }

            return $query->with(['area:id,name', 'tipo:id,name', 'estadoequipo:id,name,color'])
                        ->orderBy('name')
                        ->get();
        });
    }

    /**
     * Get equipment needing maintenance.
     */
    public function getNeedingMaintenance(): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey('needing_maintenance');

        return Cache::remember($cacheKey, 1800, function () { // 30 minutes cache
            return $this->model->where('estado_mantenimiento', 1)
                              ->with(['servicio:id,name', 'area:id,name'])
                              ->orderBy('fecha_mantenimiento')
                              ->get();
        });
    }

    /**
     * Get equipment statistics.
     */
    public function getStatistics(): array
    {
        $cacheKey = $this->getCacheKey('statistics');

        return Cache::remember($cacheKey, 1800, function () {
            return [
                'total' => $this->model->count(),
                'active' => $this->model->where('status', 1)->count(),
                'inactive' => $this->model->where('status', 0)->count(),
                'needs_maintenance' => $this->model->where('estado_mantenimiento', 1)->count(),
                'by_service' => $this->model->selectRaw('servicio_id, COUNT(*) as count')
                                          ->groupBy('servicio_id')
                                          ->with('servicio:id,name')
                                          ->get(),
                'by_status' => $this->model->selectRaw('estadoequipo_id, COUNT(*) as count')
                                          ->groupBy('estadoequipo_id')
                                          ->with('estadoequipo:id,name,color')
                                          ->get(),
                'by_risk' => $this->model->selectRaw('criesgo_id, COUNT(*) as count')
                                        ->groupBy('criesgo_id')
                                        ->get(),
            ];
        });
    }

    /**
     * Search equipment with advanced filters.
     */
    public function advancedSearch(array $filters, int $perPage = 15)
    {
        $query = $this->model->with([
            'servicio:id,name',
            'area:id,name',
            'tipo:id,name',
            'estadoequipo:id,name,color'
        ]);

        // Text search
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'LIKE', "%{$search}%")
                  ->orWhere('name', 'LIKE', "%{$search}%")
                  ->orWhere('marca', 'LIKE', "%{$search}%")
                  ->orWhere('modelo', 'LIKE', "%{$search}%")
                  ->orWhere('serial', 'LIKE', "%{$search}%");
            });
        }

        // Service filter
        if (!empty($filters['servicio_id'])) {
            $query->where('servicio_id', $filters['servicio_id']);
        }

        // Area filter
        if (!empty($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        // Status filter
        if (!empty($filters['estadoequipo_id'])) {
            $query->where('estadoequipo_id', $filters['estadoequipo_id']);
        }

        // Type filter
        if (!empty($filters['tipo_id'])) {
            $query->where('tipo_id', $filters['tipo_id']);
        }

        // Risk filter
        if (!empty($filters['criesgo_id'])) {
            $query->where('criesgo_id', $filters['criesgo_id']);
        }

        // Date range filter
        if (!empty($filters['fecha_desde'])) {
            $query->where('created_at', '>=', $filters['fecha_desde']);
        }

        if (!empty($filters['fecha_hasta'])) {
            $query->where('created_at', '<=', $filters['fecha_hasta']);
        }

        // Maintenance status filter
        if (isset($filters['needs_maintenance'])) {
            $query->where('estado_mantenimiento', $filters['needs_maintenance'] ? 1 : 0);
        }

        // Active status filter
        if (isset($filters['active'])) {
            $query->where('status', $filters['active'] ? 1 : 0);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        return $query->paginate($perPage);
    }

    /**
     * Upload equipment file.
     */
    public function uploadFile(int $equipoId, UploadedFile $file, string $type = 'document'): string
    {
        $equipo = $this->findById($equipoId);
        
        if (!$equipo) {
            throw new \Exception('Equipment not found');
        }

        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $directory = "equipos/{$equipoId}/{$type}";
        
        $path = $file->storeAs($directory, $filename, 'public');

        // Update equipment record based on file type
        switch ($type) {
            case 'image':
                $equipo->update(['image' => $path]);
                break;
            case 'manual':
                $equipo->update(['manual' => $path]);
                break;
            case 'document':
            default:
                $equipo->update(['file' => $path]);
                break;
        }

        $this->clearCache();

        return $path;
    }

    /**
     * Delete equipment file.
     */
    public function deleteFile(int $equipoId, string $type = 'document'): bool
    {
        $equipo = $this->findById($equipoId);
        
        if (!$equipo) {
            throw new \Exception('Equipment not found');
        }

        $filePath = match ($type) {
            'image' => $equipo->image,
            'manual' => $equipo->manual,
            'document' => $equipo->file,
            default => null
        };

        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        // Clear the file path from equipment record
        $updateData = match ($type) {
            'image' => ['image' => null],
            'manual' => ['manual' => null],
            'document' => ['file' => null],
            default => []
        };

        if (!empty($updateData)) {
            $equipo->update($updateData);
        }

        $this->clearCache();

        return true;
    }

    /**
     * Process equipment data in background.
     */
    public function processInBackground(array $equipmentData): void
    {
        ProcessEquipmentData::dispatch($equipmentData, auth()->id());
    }

    /**
     * Get equipment maintenance history.
     */
    public function getMaintenanceHistory(int $equipoId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey("maintenance_history_{$equipoId}");

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($equipoId) {
            return $this->model->find($equipoId)
                              ->mantenimientos()
                              ->with(['proveedor:id,name', 'tecnico:id,name'])
                              ->orderBy('fecha_mantenimiento', 'desc')
                              ->get();
        });
    }

    /**
     * Get equipment contingency history.
     */
    public function getContingencyHistory(int $equipoId): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey("contingency_history_{$equipoId}");

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($equipoId) {
            return $this->model->find($equipoId)
                              ->contingencias()
                              ->with(['usuario:id,nombre,apellido'])
                              ->orderBy('fecha', 'desc')
                              ->get();
        });
    }

    /**
     * Update equipment location.
     */
    public function updateLocation(int $equipoId, int $newServiceId, int $newAreaId): bool
    {
        $equipo = $this->findById($equipoId);
        
        if (!$equipo) {
            throw new \Exception('Equipment not found');
        }

        $oldServiceId = $equipo->servicio_id;
        $oldAreaId = $equipo->area_id;

        $updated = $equipo->update([
            'servicio_id' => $newServiceId,
            'area_id' => $newAreaId,
            'localizacion_actual' => "Servicio: {$newServiceId}, Área: {$newAreaId}",
        ]);

        if ($updated) {
            // Log location change
            \Log::info('Equipment location changed', [
                'equipo_id' => $equipoId,
                'old_service' => $oldServiceId,
                'new_service' => $newServiceId,
                'old_area' => $oldAreaId,
                'new_area' => $newAreaId,
                'user_id' => auth()->id(),
            ]);

            $this->clearCache();
        }

        return $updated;
    }

    /**
     * Generate equipment QR code.
     */
    public function generateQRCode(int $equipoId): string
    {
        $equipo = $this->findById($equipoId);
        
        if (!$equipo) {
            throw new \Exception('Equipment not found');
        }

        // Generate QR code data
        $qrData = [
            'id' => $equipo->id,
            'code' => $equipo->code,
            'name' => $equipo->name,
            'url' => config('app.frontend_url') . "/equipos/{$equipo->id}",
        ];

        // Here you would use a QR code library to generate the actual QR code
        // For now, return the data as JSON
        return json_encode($qrData);
    }
}
