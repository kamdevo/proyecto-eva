<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use App\ConexionesVista\ResponseFormatter;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Registro es público
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'apellido' => 'nullable|string|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'telefono' => 'nullable|string|max:20|regex:/^[\d\s\-\+\(\)]+$/',
            'email' => 'required|email|unique:usuarios,email|max:255',
            'username' => 'required|string|unique:usuarios,username|max:45|regex:/^[a-zA-Z0-9_\-\.]+$/',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            'centro_id' => 'nullable|string|max:100',
            'id_empresa' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'nombre.string' => 'El nombre debe ser texto.',
            'nombre.max' => 'El nombre no puede exceder 100 caracteres.',
            'nombre.regex' => 'El nombre solo puede contener letras y espacios.',
            
            'apellido.string' => 'El apellido debe ser texto.',
            'apellido.max' => 'El apellido no puede exceder 100 caracteres.',
            'apellido.regex' => 'El apellido solo puede contener letras y espacios.',
            
            'telefono.string' => 'El teléfono debe ser texto.',
            'telefono.max' => 'El teléfono no puede exceder 20 caracteres.',
            'telefono.regex' => 'El teléfono solo puede contener números, espacios, guiones y paréntesis.',
            
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe tener un formato válido.',
            'email.unique' => 'Ya existe un usuario con este email.',
            'email.max' => 'El email no puede exceder 255 caracteres.',
            
            'username.required' => 'El nombre de usuario es obligatorio.',
            'username.string' => 'El nombre de usuario debe ser texto.',
            'username.unique' => 'Ya existe un usuario con este nombre de usuario.',
            'username.max' => 'El nombre de usuario no puede exceder 45 caracteres.',
            'username.regex' => 'El nombre de usuario solo puede contener letras, números, guiones y puntos.',
            
            'password.required' => 'La contraseña es obligatoria.',
            'password.string' => 'La contraseña debe ser texto.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'La confirmación de contraseña no coincide.',
            'password.regex' => 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial.',
            
            'id_empresa.integer' => 'El ID de empresa debe ser un número.',
            'id_empresa.min' => 'El ID de empresa no puede ser negativo.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'apellido' => 'apellido',
            'telefono' => 'teléfono',
            'email' => 'email',
            'username' => 'nombre de usuario',
            'password' => 'contraseña',
            'centro_id' => 'centro',
            'id_empresa' => 'empresa',
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
            'nombre' => ucwords(strtolower(trim($this->nombre ?? ''))),
            'apellido' => ucwords(strtolower(trim($this->apellido ?? ''))),
            'email' => strtolower(trim($this->email ?? '')),
            'username' => strtolower(trim($this->username ?? '')),
            'telefono' => preg_replace('/[^\d\s\-\+\(\)]/', '', $this->telefono ?? ''),
        ]);
    }
}
