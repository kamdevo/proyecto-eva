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
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:equipos,code|max:100',
            'servicio_id' => 'required|exists:servicios,id',
            'area_id' => 'required|exists:areas,id',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'serial' => 'nullable|string|max:100|unique:equipos,serial',
            'descripcion' => 'nullable|string|max:1000',
            'costo' => 'nullable|numeric|min:0|max:999999999.99',
            'fecha_fabricacion' => 'nullable|date|before_or_equal:today',
            'fecha_instalacion' => 'nullable|date|before_or_equal:today',
            'fecha_inicio_operacion' => 'nullable|date|before_or_equal:today',
            'fecha_acta_recibo' => 'nullable|date|before_or_equal:today',
            'fecha_vencimiento_garantia' => 'nullable|date|after:today',
            'vida_util' => 'nullable|integer|min:1|max:50',
            'propietario_id' => 'nullable|exists:propietarios,id',
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120|dimensions:max_width=2048,max_height=2048'
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
            'area_id.required' => 'Debe seleccionar un área.',
            'area_id.exists' => 'El área seleccionada no existe.',
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
        // Limpiar y preparar datos antes de la validación
        $this->merge([
            'code' => strtoupper(trim($this->code ?? '')),
            'serial' => strtoupper(trim($this->serial ?? '')),
            'marca' => ucwords(strtolower(trim($this->marca ?? ''))),
            'modelo' => trim($this->modelo ?? ''),
        ]);
    }
}
