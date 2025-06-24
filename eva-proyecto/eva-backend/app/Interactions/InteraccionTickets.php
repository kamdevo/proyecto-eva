<?php

namespace App\Interactions;

use App\Models\Ticket;
use App\Models\Equipo;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de tickets
 * Maneja operaciones específicas de tickets de soporte y mesa de ayuda
 */
class InteraccionTickets
{
    /**
     * Crear ticket automático desde contingencia
     */
    public static function crearTicketDesdeContingencia($contingenciaId, $datos = [])
    {
        try {
            DB::beginTransaction();

            // Generar número de ticket único
            $numeroTicket = self::generarNumeroTicket();

            $ticket = Ticket::create([
                'numero_ticket' => $numeroTicket,
                'titulo' => $datos['titulo'] ?? 'Ticket generado desde contingencia',
                'descripcion' => $datos['descripcion'],
                'categoria' => 'mantenimiento',
                'prioridad' => $datos['prioridad'] ?? 'media',
                'estado' => 'abierto',
                'equipo_id' => $datos['equipo_id'] ?? null,
                'usuario_creador' => auth()->id(),
                'fecha_creacion' => now(),
                'fecha_limite' => $datos['fecha_limite'] ?? now()->addDays(3)
            ]);

            DB::commit();

            return ResponseFormatter::success($ticket, 'Ticket creado desde contingencia');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Asignar ticket automáticamente
     */
    public static function asignarTicketAutomatico($ticketId)
    {
        try {
            $ticket = Ticket::findOrFail($ticketId);

            // Buscar técnico disponible basado en categoría y carga de trabajo
            $tecnico = self::buscarTecnicoDisponible($ticket->categoria, $ticket->equipo_id);

            if (!$tecnico) {
                return ResponseFormatter::error('No hay técnicos disponibles', 400);
            }

            $ticket->update([
                'usuario_asignado' => $tecnico->id,
                'estado' => 'en_proceso',
                'fecha_asignacion' => now()
            ]);

            return ResponseFormatter::success([
                'ticket' => $ticket,
                'tecnico' => $tecnico
            ], 'Ticket asignado automáticamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al asignar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Escalar ticket por tiempo de respuesta
     */
    public static function escalarTicketPorTiempo($ticketId)
    {
        try {
            $ticket = Ticket::findOrFail($ticketId);

            if ($ticket->estado === 'cerrado') {
                return ResponseFormatter::error('El ticket ya está cerrado', 400);
            }

            $horasTranscurridas = Carbon::parse($ticket->fecha_creacion)->diffInHours(now());
            $limiteEscalacion = self::obtenerLimiteEscalacion($ticket->prioridad);

            if ($horasTranscurridas < $limiteEscalacion) {
                return ResponseFormatter::error('El ticket aún no requiere escalación', 400);
            }

            // Escalar prioridad
            $nuevaPrioridad = self::escalarPrioridad($ticket->prioridad);
            
            $ticket->update([
                'prioridad' => $nuevaPrioridad,
                'escalado' => true,
                'fecha_escalacion' => now()
            ]);

            // Reasignar a supervisor si es necesario
            if ($nuevaPrioridad === 'urgente') {
                $supervisor = self::buscarSupervisor($ticket->categoria);
                if ($supervisor) {
                    $ticket->update(['usuario_asignado' => $supervisor->id]);
                }
            }

            return ResponseFormatter::success($ticket, 'Ticket escalado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al escalar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cerrar ticket con validaciones
     */
    public static function cerrarTicketConValidaciones($ticketId, $datos)
    {
        try {
            DB::beginTransaction();

            $ticket = Ticket::findOrFail($ticketId);

            if ($ticket->estado === 'cerrado') {
                return ResponseFormatter::error('El ticket ya está cerrado', 400);
            }

            // Validar datos requeridos
            if (empty($datos['solucion'])) {
                return ResponseFormatter::error('La solución es requerida', 400);
            }

            $ticket->update([
                'estado' => 'cerrado',
                'fecha_cierre' => now(),
                'solucion' => $datos['solucion'],
                'comentarios_cierre' => $datos['comentarios_cierre'] ?? null,
                'satisfaccion' => $datos['satisfaccion'] ?? null
            ]);

            // Si está relacionado con un equipo, actualizar estado si es necesario
            if ($ticket->equipo_id && isset($datos['actualizar_equipo'])) {
                $equipo = Equipo::find($ticket->equipo_id);
                if ($equipo && $datos['actualizar_equipo']) {
                    $equipo->update(['status' => true]);
                }
            }

            DB::commit();

            return ResponseFormatter::success($ticket, 'Ticket cerrado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al cerrar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tickets por vencer
     */
    public static function obtenerTicketsPorVencer($dias = 1)
    {
        try {
            $fechaLimite = now()->addDays($dias);

            $tickets = Ticket::with([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])
            ->where('fecha_limite', '<=', $fechaLimite)
            ->where('fecha_limite', '>=', now())
            ->orderBy('fecha_limite', 'asc')
            ->get();

            return ResponseFormatter::success($tickets, 'Tickets por vencer obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar reporte de productividad
     */
    public static function generarReporteProductividad($usuarioId, $fechaInicio, $fechaFin)
    {
        try {
            $tickets = Ticket::where('usuario_asignado', $usuarioId)
                ->whereBetween('fecha_creacion', [$fechaInicio, $fechaFin])
                ->get();

            $reporte = [
                'usuario_id' => $usuarioId,
                'periodo' => [
                    'inicio' => $fechaInicio,
                    'fin' => $fechaFin
                ],
                'resumen' => [
                    'total_tickets' => $tickets->count(),
                    'tickets_cerrados' => $tickets->where('estado', 'cerrado')->count(),
                    'tickets_pendientes' => $tickets->whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])->count(),
                    'tiempo_promedio_resolucion' => self::calcularTiempoPromedioResolucion($tickets->where('estado', 'cerrado')),
                    'satisfaccion_promedio' => $tickets->where('estado', 'cerrado')->whereNotNull('satisfaccion')->avg('satisfaccion')
                ],
                'por_categoria' => $tickets->groupBy('categoria')->map(function ($group) {
                    return [
                        'total' => $group->count(),
                        'cerrados' => $group->where('estado', 'cerrado')->count()
                    ];
                }),
                'por_prioridad' => $tickets->groupBy('prioridad')->map(function ($group) {
                    return [
                        'total' => $group->count(),
                        'cerrados' => $group->where('estado', 'cerrado')->count()
                    ];
                })
            ];

            return ResponseFormatter::success($reporte, 'Reporte de productividad generado');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private static function generarNumeroTicket()
    {
        $year = date('Y');
        $count = Ticket::whereYear('fecha_creacion', $year)->count() + 1;
        return 'TK-' . $year . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private static function buscarTecnicoDisponible($categoria, $equipoId = null)
    {
        // Lógica para buscar técnico basada en especialidad y carga de trabajo
        $query = Usuario::where('activo', true)
                        ->where('rol', 'tecnico');

        // Si hay equipo, buscar técnico del mismo servicio
        if ($equipoId) {
            $equipo = Equipo::find($equipoId);
            if ($equipo) {
                $query->where('servicio_id', $equipo->servicio_id);
            }
        }

        // Buscar el técnico con menos tickets asignados
        $tecnicos = $query->withCount(['ticketsAsignados' => function ($q) {
            $q->whereIn('estado', ['abierto', 'en_proceso', 'pendiente']);
        }])->orderBy('tickets_asignados_count', 'asc')->first();

        return $tecnicos;
    }

    private static function obtenerLimiteEscalacion($prioridad)
    {
        $limites = [
            'baja' => 72,      // 72 horas
            'media' => 48,     // 48 horas
            'alta' => 24,      // 24 horas
            'urgente' => 4     // 4 horas
        ];

        return $limites[$prioridad] ?? 48;
    }

    private static function escalarPrioridad($prioridadActual)
    {
        $escalacion = [
            'baja' => 'media',
            'media' => 'alta',
            'alta' => 'urgente',
            'urgente' => 'urgente'
        ];

        return $escalacion[$prioridadActual] ?? 'media';
    }

    private static function buscarSupervisor($categoria)
    {
        return Usuario::where('activo', true)
                     ->where('rol', 'supervisor')
                     ->first();
    }

    private static function calcularTiempoPromedioResolucion($tickets)
    {
        if ($tickets->isEmpty()) return 0;

        $tiempoTotal = 0;
        $count = 0;

        foreach ($tickets as $ticket) {
            if ($ticket->fecha_cierre) {
                $tiempoTotal += Carbon::parse($ticket->fecha_creacion)->diffInHours(Carbon::parse($ticket->fecha_cierre));
                $count++;
            }
        }

        return $count > 0 ? round($tiempoTotal / $count, 2) : 0;
    }
}
