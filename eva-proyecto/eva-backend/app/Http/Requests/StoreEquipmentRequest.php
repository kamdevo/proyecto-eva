<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\ConexionesVista\ResponseFormatter;

class StoreEquipmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Permitir acceso sin autenticación para el modal de registro
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // TEMPORALMENTE COMENTADO: Validaciones obligatorias (solo mantener unicidad de serial)
            /*
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:equipos,code|max:100',
            'servicio_id' => 'required|exists:servicios,id',
            */
            
            // Campos opcionales (sin required)
            'name' => 'nullable|string|max:255',
            'code' => 'nullable|string|max:100', // Temporalmente sin unique
            'servicio_id' => 'nullable|exists:servicios,id',
            'area_id' => 'nullable|numeric|min:0',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            
            // SOLO MANTENER: Validación de unicidad del número de serie
            'serial' => 'nullable|string|max:100|unique:equipos,serial',
            'descripcion' => 'nullable|string|max:1000',
            'costo' => 'nullable|numeric|min:0|max:999999999.99',
            'fecha_ad' => 'nullable|date|before_or_equal:today', // fecha_adquisicion mapeada
            'fecha_fabricacion' => 'nullable|date|before_or_equal:today',
            'fecha_instalacion' => 'nullable|date|before_or_equal:today',
            'fecha_inicio_operacion' => 'nullable|date|before_or_equal:today',
            'fecha_acta_recibo' => 'nullable|date|before_or_equal:today',
            'fecha_recepcion_almacen' => 'nullable|date|before_or_equal:today',
            'fecha_vencimiento_garantia' => 'nullable|date|after:today',
            'vida_util' => 'nullable|integer|min:1|max:50',
            'propietario_id' => 'nullable|numeric|min:0',
            'fuente_id' => 'nullable|exists:fuenteal,id',
            'tecnologia_id' => 'nullable|exists:tecnologiap,id',
            'frecuencia_id' => 'nullable|exists:frecuenciam,id',
            'cbiomedica_id' => 'nullable|exists:cbiomedica,id',
            'criesgo_id' => 'nullable|exists:criesgo,id',
            'tadquisicion_id' => 'nullable|exists:tadquisicion,id',
            'estadoequipo_id' => 'nullable|exists:estadoequipos,id',
            'tipo_id' => 'nullable|exists:tipos,id',
            'invima' => 'nullable|string|max:100',
            'garantia' => 'nullable|string|max:255',
            'accesorios' => 'nullable|string|max:1000',
            'localizacion_actual' => 'nullable|string|max:255',
            'calibracion' => 'nullable|boolean',
            'repuesto_pendiente' => 'nullable|boolean',
            'movilidad' => 'nullable|string|max:100',
            'propiedad' => 'nullable|string|max:100',
            'evaluacion_desempenio' => 'nullable|string|max:100',
            'periodicidad' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120|dimensions:max_width=2048,max_height=2048',
            'archivo_excel' => 'nullable|file|mimes:xlsx,xls,pdf|max:20480', // 20MB max
            'codigo_antiguo' => 'nullable|string|max:100', // Temporalmente sin unique
            'evaluacion_desempenio' => 'nullable|string|max:100',
            'periodicidad_calibracion' => 'nullable|string|max:100',
            'disponibilidad_id' => 'nullable|numeric|min:1',
            'componentes' => 'nullable|string|max:2000',
            'verificacion_inventario' => 'nullable|string|max:10',
            'observacion' => 'nullable|string|max:2000', // usar observacion en lugar de observaciones
            'otros' => 'nullable|string|max:2000', // para campos adicionales
            'manuales' => 'nullable|json',
            'planos' => 'nullable|json'
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del equipo es obligatorio.',
            'name.max' => 'El nombre del equipo no puede exceder 255 caracteres.',
            'code.required' => 'El código del equipo es obligatorio.',
            'code.unique' => 'Ya existe un equipo con este código.',
            'code.max' => 'El código no puede exceder 100 caracteres.',
            'servicio_id.required' => 'Debe seleccionar un servicio.',
            'servicio_id.exists' => 'El servicio seleccionado no existe.',

            'serial.unique' => 'Ya existe un equipo con este número de serie.',
            'costo.numeric' => 'El costo debe ser un valor numérico.',
            'costo.min' => 'El costo no puede ser negativo.',
            'fecha_fabricacion.date' => 'La fecha de fabricación debe ser una fecha válida.',
            'fecha_fabricacion.before_or_equal' => 'La fecha de fabricación no puede ser futura.',
            'fecha_vencimiento_garantia.after' => 'La fecha de vencimiento de garantía debe ser futura.',
            'vida_util.integer' => 'La vida útil debe ser un número entero.',
            'vida_util.min' => 'La vida útil debe ser al menos 1 año.',
            'vida_util.max' => 'La vida útil no puede exceder 50 años.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser de tipo: jpeg, png, jpg, gif o webp.',
            'image.max' => 'La imagen no puede exceder 5MB.',
            'image.dimensions' => 'La imagen no puede exceder 2048x2048 píxeles.',
            'archivo_excel.required' => 'El archivo Excel de hoja de vida es obligatorio.',
            'archivo_excel.file' => 'Debe seleccionar un archivo válido.',
            'archivo_excel.mimes' => 'El archivo debe ser de tipo: xlsx, xls o pdf.',
            'archivo_excel.max' => 'El archivo no puede exceder 20MB.',
            'codigo_antiguo.required' => 'El código antiguo es obligatorio.',
            'codigo_antiguo.unique' => 'Ya existe un equipo con este código antiguo.',
            'codigo_inventario.required' => 'El código de inventario es obligatorio.',
            'centro_costo.required' => 'El centro de costo es obligatorio.',
            'pais_origen.required' => 'El país de origen es obligatorio.',
            'fecha_adquisicion.required' => 'La fecha de adquisición es obligatoria.',
            'fecha_adquisicion.before_or_equal' => 'La fecha de adquisición no puede ser futura.',
            'evaluacion_desempeno.required' => 'La evaluación de desempeño es obligatoria.',
            'funcionalidad.required' => 'La funcionalidad es obligatoria.',
            'disponibilidad_id.required' => 'La disponibilidad es obligatoria.',
            'verificacion_fisica.required' => 'La verificación física es obligatoria.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'code' => 'código',
            'servicio_id' => 'servicio',
            'area_id' => 'área',
            'marca' => 'marca',
            'modelo' => 'modelo',
            'serial' => 'número de serie',
            'descripcion' => 'descripción',
            'costo' => 'costo',
            'vida_util' => 'vida útil',
            'image' => 'imagen',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            ResponseFormatter::validation($validator->errors())
        );
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Limpiar y preparar datos antes de la validación - SOLO si existen
        $mergeData = [];

        if ($this->has('code') && !is_null($this->code)) {
            $mergeData['code'] = strtoupper(trim($this->code));
        }

        if ($this->has('serial') && !is_null($this->serial)) {
            $mergeData['serial'] = strtoupper(trim($this->serial));
        }

        if ($this->has('marca') && !is_null($this->marca)) {
            $mergeData['marca'] = ucwords(strtolower(trim($this->marca)));
        }

        if ($this->has('modelo') && !is_null($this->modelo)) {
            $mergeData['modelo'] = trim($this->modelo);
        }

        // Solo hacer merge si hay datos para procesar
        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }
}
