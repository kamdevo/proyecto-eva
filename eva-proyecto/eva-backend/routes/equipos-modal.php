<?php
// RUTA ESPECIAL PARA MODAL DE EQUIPOS - SIN MIDDLEWARE
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

Route::post('v2/equipos', function(Request $request) {
    try {
        // Headers CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept');
        
        if ($request->getMethod() === 'OPTIONS') {
            return response('', 200);
        }

        // Validaciones de campos requeridos
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100',
            'servicio_id' => 'required|integer|min:1',
            'serial' => 'nullable|string|max:100',
        ], [
            'name.required' => 'El nombre del equipo es obligatorio.',
            'code.required' => 'El código del equipo es obligatorio.',
            'servicio_id.required' => 'Debe seleccionar un servicio.',
            'servicio_id.integer' => 'El servicio debe ser un número válido.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verificar unicidad de código
        $codigoExiste = DB::table('equipos')->where('code', $request->code)->exists();
        if ($codigoExiste) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => ['code' => ['Ya existe un equipo con este código.']]
            ], 422);
        }

        // Verificar que el servicio existe
        $servicioExiste = DB::table('servicios')->where('id', $request->servicio_id)->exists();
        if (!$servicioExiste) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => ['servicio_id' => ['El servicio seleccionado no existe.']]
            ], 422);
        }

        // Verificar unicidad de serial si se proporciona
        if ($request->serial) {
            $serialExiste = DB::table('equipos')->where('serial', $request->serial)->exists();
            if ($serialExiste) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errores de validación',
                    'errors' => ['serial' => ['Ya existe un equipo con este número de serie.']]
                ], 422);
            }
        }

        // Crear equipo
        $equipoId = DB::table('equipos')->insertGetId([
            'name' => $request->name,
            'code' => $request->code,
            'servicio_id' => $request->servicio_id,
            'serial' => $request->serial,
            'marca' => $request->marca,
            'modelo' => $request->modelo,
            'descripcion' => $request->descripcion,
            'status' => 1,
            'created_at' => now(),
            'updated_at' => now(),
            // Valores por defecto para campos requeridos
            'fuente_id' => 1,
            'tecnologia_id' => 1,
            'frecuencia_id' => 1,
            'cbiomedica_id' => 1,
            'criesgo_id' => 1,
            'tadquisicion_id' => 1,
            'invima_id' => 1,
            'orden_compra_id' => 1,
            'baja_id' => 1,
            'estadoequipo_id' => 1,
            'tipo_id' => 1,
            'guia_id' => 1,
            'manual_id' => 1,
            'disponibilidad_id' => 1,
            'area_id' => $request->area_id ?: 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Equipo creado exitosamente',
            'data' => ['id' => $equipoId]
        ], 201);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al crear equipo: ' . $e->getMessage()
        ], 500);
    }
});
