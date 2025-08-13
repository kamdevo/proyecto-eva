<?php
// Endpoint alternativo para servir imágenes de equipos
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

Route::get('images/equipos/{filename}', function($filename) {
    try {
        // Buscar archivo en diferentes ubicaciones
        $possiblePaths = [
            'equipos/images/' . $filename,
            'equipos/' . $filename,
            $filename
        ];
        
        foreach ($possiblePaths as $path) {
            if (Storage::disk('public')->exists($path)) {
                $file = Storage::disk('public')->get($path);
                $mimeType = Storage::disk('public')->mimeType($path);
                
                return Response::make($file, 200, [
                    'Content-Type' => $mimeType,
                    'Cache-Control' => 'public, max-age=3600',
                    'Access-Control-Allow-Origin' => '*'
                ]);
            }
        }
        
        // Si no se encuentra, devolver imagen por defecto
        return response()->file(public_path('images/no-image.png'));
        
    } catch (Exception $e) {
        return response()->json(['error' => 'Image not found'], 404);
    }
})->where('filename', '.*');
