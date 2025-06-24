<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase para manejar todas las interacciones de botones del frontend
 */
class ButtonInteraction
{
    /**
     * Acción del botón "Dar de Baja" equipo
     */
    public static function decommissionEquipment($equipoId, $motivo, $usuarioId)
    {
        try {
            DB::beginTransaction();
            
            $equipo = Equipo::findOrFail($equipoId);
            
            // Actualizar estado del equipo
            $equipo->update([
                'estado' => 'Baja',
                'fecha_baja' => now(),
                'motivo_baja' => $motivo,
                'usuario_baja' => $usuarioId
            ]);
            
            // Crear registro en tabla de bajas
            DB::table('equipos_bajas')->insert([
                'equipo_id' => $equipoId,
                'motivo' => $motivo,
                'fecha_baja' => now(),
                'usuario_id' => $usuarioId,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Cancelar mantenimientos programados
            Mantenimiento::where('equipo_id', $equipoId)
                ->where('status', 'programado')
                ->update(['status' => 'cancelado']);
            
            DB::commit();
            
            return ResponseFormatter::success(null, 'Equipo dado de baja exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al dar de baja equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Programar Mantenimiento"
     */
    public static function scheduleMaintenanceAction($equipoId, $data)
    {
        try {
            $mantenimiento = Mantenimiento::create([
                'equipo_id' => $equipoId,
                'type' => $data['tipo'] ?? 'preventivo',
                'description' => $data['descripcion'],
                'fecha_programada' => $data['fecha_programada'],
                'tecnico_id' => $data['tecnico_id'],
                'status' => 'programado',
                'maintenance_number' => 'MANT-' . date('Y') . '-' . str_pad(Mantenimiento::count() + 1, 4, '0', STR_PAD_LEFT)
            ]);
            
            // Actualizar próximo mantenimiento en equipo
            $equipo = Equipo::find($equipoId);
            $equipo->update(['proximo_mantenimiento' => $data['fecha_programada']]);
            
            return ResponseFormatter::success($mantenimiento, 'Mantenimiento programado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al programar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Completar Mantenimiento"
     */
    public static function completeMaintenanceAction($mantenimientoId, $data)
    {
        try {
            DB::beginTransaction();
            
            $mantenimiento = Mantenimiento::findOrFail($mantenimientoId);
            
            $mantenimiento->update([
                'status' => 'completado',
                'fecha_fin' => now(),
                'observaciones' => $data['observaciones'] ?? '',
                'repuestos_utilizados' => $data['repuestos'] ?? '',
                'costo' => $data['costo'] ?? 0,
                'tiempo_real' => $data['tiempo_real'] ?? 0
            ]);
            
            // Actualizar último mantenimiento en equipo
            $equipo = Equipo::find($mantenimiento->equipo_id);
            $equipo->update([
                'ultimo_mantenimiento' => now(),
                'estado' => 'Operativo'
            ]);
            
            // Calcular próximo mantenimiento basado en frecuencia
            if ($equipo->frecuencia_mantenimiento) {
                $proximoMantenimiento = self::calculateNextMaintenance($equipo->frecuencia_mantenimiento);
                $equipo->update(['proximo_mantenimiento' => $proximoMantenimiento]);
            }
            
            DB::commit();
            
            return ResponseFormatter::success($mantenimiento, 'Mantenimiento completado exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Cerrar Contingencia"
     */
    public static function closeContingencyAction($contingenciaId, $data)
    {
        try {
            $contingencia = Contingencia::findOrFail($contingenciaId);
            
            $contingencia->update([
                'estado' => 'Cerrado',
                'fecha_cierre' => now(),
                'acciones_tomadas' => $data['acciones_tomadas'] ?? '',
                'usuario_cierre' => $data['usuario_id']
            ]);
            
            return ResponseFormatter::success($contingencia, 'Contingencia cerrada exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cerrar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Duplicar Equipo"
     */
    public static function duplicateEquipmentAction($equipoId)
    {
        try {
            $equipoOriginal = Equipo::findOrFail($equipoId);
            
            $equipoDuplicado = $equipoOriginal->replicate();
            $equipoDuplicado->codigo = $equipoOriginal->codigo . '-COPY-' . time();
            $equipoDuplicado->nombre = $equipoOriginal->nombre . ' (Copia)';
            $equipoDuplicado->created_at = now();
            $equipoDuplicado->updated_at = now();
            $equipoDuplicado->save();
            
            return ResponseFormatter::success($equipoDuplicado, 'Equipo duplicado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al duplicar equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Fusionar Equipos"
     */
    public static function mergeEquipmentsAction($equiposPrincipales, $equiposSecundarios, $data)
    {
        try {
            DB::beginTransaction();
            
            $equipoPrincipal = Equipo::findOrFail($equiposPrincipales[0]);
            
            // Transferir mantenimientos de equipos secundarios al principal
            foreach ($equiposSecundarios as $equipoSecundarioId) {
                Mantenimiento::where('equipo_id', $equipoSecundarioId)
                    ->update(['equipo_id' => $equipoPrincipal->id]);
                
                Contingencia::where('equipo_id', $equipoSecundarioId)
                    ->update(['equipo_id' => $equipoPrincipal->id]);
                
                // Marcar equipo secundario como fusionado
                Equipo::where('id', $equipoSecundarioId)
                    ->update([
                        'estado' => 'Fusionado',
                        'equipo_fusion_id' => $equipoPrincipal->id,
                        'fecha_fusion' => now()
                    ]);
            }
            
            // Actualizar información del equipo principal si se proporciona
            if (isset($data['nombre'])) {
                $equipoPrincipal->update($data);
            }
            
            DB::commit();
            
            return ResponseFormatter::success($equipoPrincipal, 'Equipos fusionados exitosamente');
        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al fusionar equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Limpiar Nombres"
     */
    public static function cleanNamesAction($equiposIds)
    {
        try {
            $equiposActualizados = 0;
            
            foreach ($equiposIds as $equipoId) {
                $equipo = Equipo::find($equipoId);
                if ($equipo) {
                    $nombreLimpio = self::cleanEquipmentName($equipo->nombre);
                    if ($nombreLimpio !== $equipo->nombre) {
                        $equipo->update(['nombre' => $nombreLimpio]);
                        $equiposActualizados++;
                    }
                }
            }
            
            return ResponseFormatter::success(
                ['equipos_actualizados' => $equiposActualizados], 
                "Se limpiaron {$equiposActualizados} nombres de equipos"
            );
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al limpiar nombres: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Acción del botón "Generar Código QR"
     */
    public static function generateQRCodeAction($equipoId)
    {
        try {
            $equipo = Equipo::findOrFail($equipoId);
            
            // Generar datos para QR
            $qrData = [
                'id' => $equipo->id,
                'codigo' => $equipo->codigo,
                'nombre' => $equipo->nombre,
                'url' => config('app.url') . '/equipos/' . $equipo->id
            ];
            
            // Aquí se integraría con una librería de QR como SimpleSoftwareIO/simple-qrcode
            $qrCode = base64_encode(json_encode($qrData)); // Placeholder
            
            return ResponseFormatter::success([
                'qr_code' => $qrCode,
                'qr_data' => $qrData
            ], 'Código QR generado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar QR: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular próximo mantenimiento basado en frecuencia
     */
    private static function calculateNextMaintenance($frecuencia)
    {
        $now = Carbon::now();
        
        switch (strtolower($frecuencia)) {
            case 'mensual':
                return $now->addMonth();
            case 'bimestral':
                return $now->addMonths(2);
            case 'trimestral':
                return $now->addMonths(3);
            case 'semestral':
                return $now->addMonths(6);
            case 'anual':
                return $now->addYear();
            default:
                return $now->addMonths(3); // Default trimestral
        }
    }

    /**
     * Limpiar nombre de equipo (remover caracteres especiales, espacios extra, etc.)
     */
    private static function cleanEquipmentName($nombre)
    {
        // Remover espacios extra
        $nombre = preg_replace('/\s+/', ' ', trim($nombre));
        
        // Capitalizar primera letra de cada palabra
        $nombre = ucwords(strtolower($nombre));
        
        // Remover caracteres especiales excepto guiones y paréntesis
        $nombre = preg_replace('/[^a-zA-Z0-9\s\-\(\)]/', '', $nombre);
        
        return $nombre;
    }

    /**
     * Acción del botón "Exportar Seleccionados"
     */
    public static function exportSelectedAction($equiposIds, $formato = 'excel')
    {
        try {
            $equipos = Equipo::with(['servicio', 'area', 'propietario'])
                ->whereIn('id', $equiposIds)
                ->get();
            
            // Aquí se integraría con librerías de exportación como Laravel Excel
            $exportData = $equipos->map(function ($equipo) {
                return [
                    'Código' => $equipo->codigo,
                    'Nombre' => $equipo->nombre,
                    'Marca' => $equipo->marca,
                    'Modelo' => $equipo->modelo,
                    'Serie' => $equipo->serie,
                    'Estado' => $equipo->estado,
                    'Servicio' => $equipo->servicio->nombre ?? '',
                    'Área' => $equipo->area->nombre ?? '',
                    'Propietario' => $equipo->propietario->nombre ?? ''
                ];
            });
            
            return ResponseFormatter::success([
                'data' => $exportData,
                'formato' => $formato,
                'total_equipos' => count($equiposIds)
            ], 'Datos preparados para exportación');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar: ' . $e->getMessage(), 500);
        }
    }
}
