<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Manual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends ApiController
{
    /**
     * Subir imagen de equipo
     */
    public function uploadEquipmentImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120' // 5MB max
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $equipo = Equipo::findOrFail($request->equipo_id);

            // Eliminar imagen anterior si existe
            if ($equipo->image && Storage::disk('public')->exists($equipo->image)) {
                Storage::disk('public')->delete($equipo->image);
            }

            // Subir nueva imagen
            $image = $request->file('image');
            $imageName = 'equipos/' . Str::uuid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('equipos', $imageName, 'public');

            // Actualizar equipo con la nueva imagen
            $equipo->update(['image' => $imagePath]);

            return ResponseFormatter::success([
                'image_path' => $imagePath,
                'image_url' => Storage::disk('public')->url($imagePath)
            ], 'Imagen subida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al subir imagen: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir documento/manual
     */
    public function uploadDocument(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'nullable|exists:equipos,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // 10MB max
            'tipo_documento' => 'required|string|in:Manual de Usuario,Manual de Mantenimiento,Certificado,Garantía,Factura,Otro'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $file = $request->file('document');
            $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $filePath = $file->storeAs('documentos', $fileName, 'public');

            $manual = Manual::create([
                'name' => $request->title,
                'description' => $request->description,
                'file' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getClientOriginalExtension(),
                'file_size' => $file->getSize(),
                'equipo_id' => $request->equipo_id,
                'usuario_id' => auth()->id(),
                'tipo' => $request->tipo_documento,
                'status' => true,
                'created_at' => now()
            ]);

            return ResponseFormatter::success($manual, 'Documento subido exitosamente', 201);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al subir documento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Descargar documento
     */
    public function downloadDocument($id)
    {
        try {
            $manual = Manual::findOrFail($id);

            if (!Storage::disk('public')->exists($manual->file)) {
                return ResponseFormatter::notFound('Archivo no encontrado');
            }

            $filePath = Storage::disk('public')->path($manual->file);

            return response()->download($filePath, $manual->file_name);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al descargar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar documento
     */
    public function deleteDocument($id)
    {
        try {
            $manual = Manual::findOrFail($id);

            // Eliminar archivo del storage
            if (Storage::disk('public')->exists($manual->file)) {
                Storage::disk('public')->delete($manual->file);
            }

            // Eliminar registro de la base de datos
            $manual->delete();

            return ResponseFormatter::success(null, 'Documento eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar documento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Listar documentos de un equipo
     */
    public function getEquipmentDocuments($equipoId)
    {
        try {
            $documentos = Manual::where('equipo_id', $equipoId)
                ->where('status', true)
                ->with('usuario:id,nombre,apellido')
                ->orderBy('created_at', 'desc')
                ->get();

            $documentos->each(function ($doc) {
                $doc->file_url = Storage::disk('public')->url($doc->file);
                $doc->file_size_formatted = $this->formatFileSize($doc->file_size);
            });

            return ResponseFormatter::success($documentos, 'Documentos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener documentos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir múltiples archivos
     */
    public function uploadMultipleFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'nullable|exists:equipos,id',
            'files' => 'required|array|max:10',
            'files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,png|max:10240',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $uploadedFiles = [];
            $files = $request->file('files');
            $descriptions = $request->input('descriptions', []);

            foreach ($files as $index => $file) {
                $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('documentos', $fileName, 'public');

                $manual = Manual::create([
                    'name' => $file->getClientOriginalName(),
                    'description' => $descriptions[$index] ?? null,
                    'file' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientOriginalExtension(),
                    'file_size' => $file->getSize(),
                    'equipo_id' => $request->equipo_id,
                    'usuario_id' => auth()->id(),
                    'status' => true,
                    'created_at' => now()
                ]);

                $uploadedFiles[] = $manual;
            }

            return ResponseFormatter::success($uploadedFiles, count($uploadedFiles) . ' archivos subidos exitosamente', 201);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al subir archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener información de archivo
     */
    public function getFileInfo($id)
    {
        try {
            $manual = Manual::with(['equipo:id,name,code', 'usuario:id,nombre,apellido'])
                ->findOrFail($id);

            $manual->file_url = Storage::disk('public')->url($manual->file);
            $manual->file_size_formatted = $this->formatFileSize($manual->file_size);
            $manual->file_exists = Storage::disk('public')->exists($manual->file);

            return ResponseFormatter::success($manual, 'Información del archivo obtenida');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener información: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Formatear tamaño de archivo
     */
    private function formatFileSize($bytes)
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Validar tipo de archivo
     */
    public function validateFileType(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $file = $request->file('file');
            $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'];
            $fileExtension = $file->getClientOriginalExtension();

            $isValid = in_array(strtolower($fileExtension), $allowedTypes);
            $fileSize = $file->getSize();
            $maxSize = 10 * 1024 * 1024; // 10MB

            return ResponseFormatter::success([
                'is_valid' => $isValid && $fileSize <= $maxSize,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $this->formatFileSize($fileSize),
                'file_type' => $fileExtension,
                'is_size_valid' => $fileSize <= $maxSize,
                'is_type_valid' => $isValid
            ], 'Validación de archivo completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al validar archivo: ' . $e->getMessage(), 500);
        }
    }
}
