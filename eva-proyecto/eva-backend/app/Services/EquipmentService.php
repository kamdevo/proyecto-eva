<?php

namespace App\Services;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class EquipmentService
{
    /**
     * Obtener equipos con filtros y paginación
     */
    public function getEquipments($filters = [], $perPage = 15)
    {
        $query = Equipo::with([
            'servicio:id,nombre',
            'area:id,nombre',
            'propietario:id,nombre',
            'fuenteAlimentacion:id,nombre',
            'tecnologia:id,nombre',
            'frecuenciaMantenimiento:id,nombre',
            'clasificacionBiomedica:id,nombre',
            'clasificacionRiesgo:id,nombre',
            'estadoEquipo:id,nombre',
            'tipo:id,nombre'
        ]);

        // Aplicar filtros
        if (isset($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('marca', 'like', "%{$search}%")
                  ->orWhere('modelo', 'like', "%{$search}%")
                  ->orWhere('serial', 'like', "%{$search}%");
            });
        }

        if (isset($filters['servicio_id'])) {
            $query->where('servicio_id', $filters['servicio_id']);
        }

        if (isset($filters['area_id'])) {
            $query->where('area_id', $filters['area_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }

    /**
     * Crear nuevo equipo
     */
    public function createEquipment($data)
    {
        return DB::transaction(function () use ($data) {
            $equipoData = collect($data)->except(['image'])->toArray();
            $equipoData['status'] = true;
            $equipoData['created_at'] = now();

            // Manejar subida de imagen
            if (isset($data['image'])) {
                $imagePath = $this->handleImageUpload($data['image']);
                $equipoData['image'] = $imagePath;
            }

            $equipo = Equipo::create($equipoData);

            // Cargar relaciones para la respuesta
            $equipo->load([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre',
                'tipo:id,nombre'
            ]);

            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            // Limpiar cache relacionado
            $this->clearRelatedCache();

            return $equipo;
        });
    }

    /**
     * Actualizar equipo
     */
    public function updateEquipment($id, $data)
    {
        return DB::transaction(function () use ($id, $data) {
            $equipo = Equipo::findOrFail($id);
            
            $equipoData = collect($data)->except(['image'])->toArray();

            // Manejar subida de imagen
            if (isset($data['image'])) {
                // Eliminar imagen anterior
                if ($equipo->image && Storage::disk('public')->exists($equipo->image)) {
                    Storage::disk('public')->delete($equipo->image);
                }
                
                $imagePath = $this->handleImageUpload($data['image']);
                $equipoData['image'] = $imagePath;
            }

            $equipo->update($equipoData);

            // Cargar relaciones actualizadas
            $equipo->load([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre',
                'tipo:id,nombre'
            ]);

            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            // Limpiar cache relacionado
            $this->clearRelatedCache();

            return $equipo;
        });
    }

    /**
     * Eliminar equipo con validaciones
     */
    public function deleteEquipment($id)
    {
        return DB::transaction(function () use ($id) {
            $equipo = Equipo::findOrFail($id);

            // Verificar mantenimientos activos
            $mantenimientosActivos = $equipo->mantenimientos()
                ->whereIn('status', ['programado', 'en_proceso'])
                ->count();

            if ($mantenimientosActivos > 0) {
                throw new \Exception('No se puede eliminar el equipo porque tiene mantenimientos activos');
            }

            // Verificar contingencias activas
            $contingenciasActivas = $equipo->contingencias()
                ->where('estado_id', '!=', 3) // 3 = Cerrado
                ->count();

            if ($contingenciasActivas > 0) {
                throw new \Exception('No se puede eliminar el equipo porque tiene contingencias activas');
            }

            // Eliminar imagen si existe
            if ($equipo->image && Storage::disk('public')->exists($equipo->image)) {
                Storage::disk('public')->delete($equipo->image);
            }

            $equipo->delete();

            // Limpiar cache relacionado
            $this->clearRelatedCache();

            return true;
        });
    }

    /**
     * Obtener estadísticas de equipos
     */
    public function getEquipmentStats()
    {
        return Cache::remember('equipment_stats', 30, function () {
            return [
                'total' => Equipo::count(),
                'activos' => Equipo::where('status', 1)->count(),
                'inactivos' => Equipo::where('status', 0)->count(),
                'por_servicio' => $this->getEquipmentsByService(),
                'por_area' => $this->getEquipmentsByArea(),
                'por_riesgo' => $this->getEquipmentsByRisk(),
                'mantenimientos_vencidos' => $this->getOverdueMaintenances(),
                'proximos_mantenimientos' => $this->getUpcomingMaintenances()
            ];
        });
    }

    /**
     * Manejar subida de imagen
     */
    private function handleImageUpload($image)
    {
        $extension = $image->getClientOriginalExtension();
        $fileName = 'equipo_' . time() . '_' . \Str::random(8) . '.' . $extension;
        return $image->storeAs('equipos', $fileName, 'public');
    }

    /**
     * Obtener equipos por servicio
     */
    private function getEquipmentsByService()
    {
        return Equipo::select('servicio_id', DB::raw('count(*) as total'))
            ->with('servicio:id,nombre')
            ->groupBy('servicio_id')
            ->get();
    }

    /**
     * Obtener equipos por área
     */
    private function getEquipmentsByArea()
    {
        return Equipo::select('area_id', DB::raw('count(*) as total'))
            ->with('area:id,nombre')
            ->groupBy('area_id')
            ->get();
    }

    /**
     * Obtener equipos por riesgo
     */
    private function getEquipmentsByRisk()
    {
        return Equipo::select('criesgo_id', DB::raw('count(*) as total'))
            ->with('clasificacionRiesgo:id,nombre')
            ->groupBy('criesgo_id')
            ->get();
    }

    /**
     * Obtener mantenimientos vencidos
     */
    private function getOverdueMaintenances()
    {
        return Mantenimiento::where('status', 'programado')
            ->where('fecha_programada', '<', now())
            ->count();
    }

    /**
     * Obtener próximos mantenimientos
     */
    private function getUpcomingMaintenances()
    {
        return Mantenimiento::where('status', 'programado')
            ->whereBetween('fecha_programada', [now(), now()->addDays(30)])
            ->count();
    }

    /**
     * Limpiar cache relacionado
     */
    private function clearRelatedCache()
    {
        Cache::forget('equipment_stats');
        Cache::forget('dashboard_stats');
        Cache::forget('equipment_list');
    }

    /**
     * Buscar equipos por código
     */
    public function searchByCode($code)
    {
        return Equipo::where('code', 'like', "%{$code}%")
            ->with([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre'
            ])
            ->limit(10)
            ->get();
    }

    /**
     * Duplicar equipo
     */
    public function duplicateEquipment($id)
    {
        return DB::transaction(function () use ($id) {
            $originalEquipo = Equipo::findOrFail($id);
            
            $newEquipoData = $originalEquipo->toArray();
            unset($newEquipoData['id']);
            unset($newEquipoData['created_at']);
            unset($newEquipoData['updated_at']);
            
            // Generar nuevo código único
            $newEquipoData['code'] = $this->generateUniqueCode($originalEquipo->code);
            $newEquipoData['name'] = $originalEquipo->name . ' (Copia)';
            
            $newEquipo = Equipo::create($newEquipoData);
            
            // Limpiar cache
            $this->clearRelatedCache();
            
            return $newEquipo;
        });
    }

    /**
     * Generar código único
     */
    private function generateUniqueCode($baseCode)
    {
        $counter = 1;
        $newCode = $baseCode . '-COPY';
        
        while (Equipo::where('code', $newCode)->exists()) {
            $newCode = $baseCode . '-COPY-' . $counter;
            $counter++;
        }
        
        return $newCode;
    }
}
