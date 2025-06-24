<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Ticket;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de tickets de soporte
 * Maneja solicitudes, incidencias y tickets de mesa de ayuda
 */
class TicketController extends ApiController
{
    /**
     * Obtener lista de tickets con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Ticket::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('numero_ticket', 'like', "%{$search}%");
                });
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('prioridad')) {
                $query->where('prioridad', $request->prioridad);
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('usuario_creador')) {
                $query->where('usuario_creador', $request->usuario_creador);
            }

            if ($request->has('usuario_asignado')) {
                $query->where('usuario_asignado', $request->usuario_asignado);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha_creacion', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha_creacion', '<=', $request->fecha_hasta);
            }

            // Filtro por tickets abiertos
            if ($request->has('solo_abiertos') && $request->solo_abiertos) {
                $query->whereIn('estado', ['abierto', 'en_proceso', 'pendiente']);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_creacion');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $tickets = $query->paginate($perPage);

            // Calcular tiempo transcurrido para tickets abiertos
            $tickets->getCollection()->transform(function ($ticket) {
                if (in_array($ticket->estado, ['abierto', 'en_proceso', 'pendiente'])) {
                    $ticket->tiempo_transcurrido = Carbon::parse($ticket->fecha_creacion)->diffForHumans();
                    $ticket->horas_transcurridas = Carbon::parse($ticket->fecha_creacion)->diffInHours(now());
                }

                if ($ticket->archivo_adjunto) {
                    $ticket->archivo_url = Storage::disk('public')->url($ticket->archivo_adjunto);
                }

                return $ticket;
            });

            return ResponseFormatter::success($tickets, 'Tickets obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo ticket
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|in:soporte_tecnico,mantenimiento,calibracion,capacitacion,otro',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'equipo_id' => 'nullable|exists:equipos,id',
            'usuario_asignado' => 'nullable|exists:usuarios,id',
            'fecha_limite' => 'nullable|date|after:today',
            'archivo_adjunto' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,zip|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            // Generar número de ticket único
            $numeroTicket = 'TK-' . date('Y') . '-' . str_pad(
                Ticket::whereYear('fecha_creacion', date('Y'))->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );

            $ticketData = $request->except(['archivo_adjunto']);
            $ticketData['numero_ticket'] = $numeroTicket;
            $ticketData['estado'] = 'abierto';
            $ticketData['fecha_creacion'] = now();
            $ticketData['usuario_creador'] = auth()->id();

            // Manejar archivo adjunto
            if ($request->hasFile('archivo_adjunto')) {
                $file = $request->file('archivo_adjunto');
                $fileName = 'tickets/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('tickets', $fileName, 'public');
                $ticketData['archivo_adjunto'] = $filePath;
            }

            $ticket = Ticket::create($ticketData);

            // Cargar relaciones para la respuesta
            $ticket->load([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($ticket, 'Ticket creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar ticket específico
     */
    public function show($id)
    {
        try {
            $ticket = Ticket::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioCreador:id,nombre,apellido,telefono,email',
                'usuarioAsignado:id,nombre,apellido,telefono,email',
                'comentarios.usuario:id,nombre,apellido'
            ])->findOrFail($id);

            // Agregar URL del archivo si existe
            if ($ticket->archivo_adjunto) {
                $ticket->archivo_url = Storage::disk('public')->url($ticket->archivo_adjunto);
            }

            // Calcular tiempo de resolución si está cerrado
            if ($ticket->estado === 'cerrado' && $ticket->fecha_cierre) {
                $ticket->tiempo_resolucion = Carbon::parse($ticket->fecha_creacion)
                    ->diffForHumans(Carbon::parse($ticket->fecha_cierre), true);
                $ticket->horas_resolucion = Carbon::parse($ticket->fecha_creacion)
                    ->diffInHours(Carbon::parse($ticket->fecha_cierre));
            }

            return ResponseFormatter::success($ticket, 'Ticket obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar ticket
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'categoria' => 'required|in:soporte_tecnico,mantenimiento,calibracion,capacitacion,otro',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'estado' => 'required|in:abierto,en_proceso,pendiente,resuelto,cerrado',
            'equipo_id' => 'nullable|exists:equipos,id',
            'usuario_asignado' => 'nullable|exists:usuarios,id',
            'fecha_limite' => 'nullable|date',
            'archivo_adjunto' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,zip|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $ticket = Ticket::findOrFail($id);
            $ticketData = $request->except(['archivo_adjunto']);

            // Manejar actualización de archivo
            if ($request->hasFile('archivo_adjunto')) {
                // Eliminar archivo anterior si existe
                if ($ticket->archivo_adjunto && Storage::disk('public')->exists($ticket->archivo_adjunto)) {
                    Storage::disk('public')->delete($ticket->archivo_adjunto);
                }

                $file = $request->file('archivo_adjunto');
                $fileName = 'tickets/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('tickets', $fileName, 'public');
                $ticketData['archivo_adjunto'] = $filePath;
            }

            // Si se está cerrando el ticket, agregar fecha de cierre
            if ($request->estado === 'cerrado' && $ticket->estado !== 'cerrado') {
                $ticketData['fecha_cierre'] = now();
            }

            $ticket->update($ticketData);

            // Cargar relaciones para la respuesta
            $ticket->load([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            if ($ticket->archivo_adjunto) {
                $ticket->archivo_url = Storage::disk('public')->url($ticket->archivo_adjunto);
            }

            DB::commit();

            return ResponseFormatter::success($ticket, 'Ticket actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar ticket
     */
    public function destroy($id)
    {
        try {
            $ticket = Ticket::findOrFail($id);

            // Solo permitir eliminar si está abierto
            if ($ticket->estado !== 'abierto') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar tickets en estado abierto',
                    400
                );
            }

            // Eliminar archivo si existe
            if ($ticket->archivo_adjunto && Storage::disk('public')->exists($ticket->archivo_adjunto)) {
                Storage::disk('public')->delete($ticket->archivo_adjunto);
            }

            $ticket->delete();

            return ResponseFormatter::success(null, 'Ticket eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Asignar ticket a usuario
     */
    public function asignar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'usuario_asignado' => 'required|exists:usuarios,id',
            'comentario' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $ticket = Ticket::findOrFail($id);

            $ticket->update([
                'usuario_asignado' => $request->usuario_asignado,
                'estado' => 'en_proceso',
                'fecha_asignacion' => now()
            ]);

            // Cargar relaciones
            $ticket->load([
                'usuarioAsignado:id,nombre,apellido'
            ]);

            return ResponseFormatter::success($ticket, 'Ticket asignado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al asignar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cerrar ticket
     */
    public function cerrar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'solucion' => 'required|string|max:1000',
            'comentarios_cierre' => 'nullable|string',
            'satisfaccion' => 'nullable|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $ticket = Ticket::findOrFail($id);

            if ($ticket->estado === 'cerrado') {
                return ResponseFormatter::error('El ticket ya está cerrado', 400);
            }

            $ticket->update([
                'estado' => 'cerrado',
                'fecha_cierre' => now(),
                'solucion' => $request->solucion,
                'comentarios_cierre' => $request->comentarios_cierre,
                'satisfaccion' => $request->satisfaccion
            ]);

            return ResponseFormatter::success($ticket, 'Ticket cerrado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cerrar ticket: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tickets abiertos
     */
    public function abiertos()
    {
        try {
            $tickets = Ticket::with([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])
            ->orderBy('prioridad', 'desc')
            ->orderBy('fecha_creacion', 'asc')
            ->get();

            // Calcular tiempo transcurrido
            $tickets->each(function ($ticket) {
                $ticket->horas_transcurridas = Carbon::parse($ticket->fecha_creacion)->diffInHours(now());
                $ticket->tiempo_transcurrido = Carbon::parse($ticket->fecha_creacion)->diffForHumans();
            });

            return ResponseFormatter::success($tickets, 'Tickets abiertos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets abiertos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tickets por usuario
     */
    public function porUsuario($usuarioId)
    {
        try {
            $tickets = Ticket::with([
                'equipo:id,name,code',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->where('usuario_creador', $usuarioId)
            ->orderBy('fecha_creacion', 'desc')
            ->get();

            return ResponseFormatter::success($tickets, 'Tickets del usuario obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tickets asignados a usuario
     */
    public function asignadosA($usuarioId)
    {
        try {
            $tickets = Ticket::with([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido'
            ])
            ->where('usuario_asignado', $usuarioId)
            ->whereIn('estado', ['en_proceso', 'pendiente'])
            ->orderBy('prioridad', 'desc')
            ->orderBy('fecha_creacion', 'asc')
            ->get();

            return ResponseFormatter::success($tickets, 'Tickets asignados obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets asignados: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de tickets
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_tickets' => Ticket::whereYear('fecha_creacion', $year)->count(),
                'total_abiertos' => Ticket::whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])->count(),
                'total_cerrados' => Ticket::where('estado', 'cerrado')
                    ->whereYear('fecha_creacion', $year)->count(),
                'por_categoria' => Ticket::whereYear('fecha_creacion', $year)
                    ->groupBy('categoria')
                    ->selectRaw('categoria, count(*) as total')
                    ->get(),
                'por_prioridad' => Ticket::whereYear('fecha_creacion', $year)
                    ->groupBy('prioridad')
                    ->selectRaw('prioridad, count(*) as total')
                    ->get(),
                'por_estado' => Ticket::whereYear('fecha_creacion', $year)
                    ->groupBy('estado')
                    ->selectRaw('estado, count(*) as total')
                    ->get(),
                'por_mes' => Ticket::whereYear('fecha_creacion', $year)
                    ->groupBy(DB::raw('MONTH(fecha_creacion)'))
                    ->selectRaw('MONTH(fecha_creacion) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'tiempo_promedio_resolucion' => $this->getTiempoPromedioResolucion($year),
                'satisfaccion_promedio' => Ticket::where('estado', 'cerrado')
                    ->whereYear('fecha_creacion', $year)
                    ->whereNotNull('satisfaccion')
                    ->avg('satisfaccion'),
                'tickets_vencidos' => Ticket::where('fecha_limite', '<', now())
                    ->whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])
                    ->count()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de tickets obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener tickets urgentes
     */
    public function urgentes()
    {
        try {
            $tickets = Ticket::with([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->where('prioridad', 'urgente')
            ->whereIn('estado', ['abierto', 'en_proceso', 'pendiente'])
            ->orderBy('fecha_creacion', 'asc')
            ->get();

            return ResponseFormatter::success($tickets, 'Tickets urgentes obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener tickets urgentes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private function getTiempoPromedioResolucion($year)
    {
        $ticketsCerrados = Ticket::where('estado', 'cerrado')
            ->whereYear('fecha_creacion', $year)
            ->whereNotNull('fecha_cierre')
            ->get();

        if ($ticketsCerrados->isEmpty()) {
            return 0;
        }

        $tiempoTotal = 0;
        foreach ($ticketsCerrados as $ticket) {
            $tiempoTotal += Carbon::parse($ticket->fecha_creacion)->diffInHours(Carbon::parse($ticket->fecha_cierre));
        }

        return round($tiempoTotal / $ticketsCerrados->count(), 2);
    }
}
