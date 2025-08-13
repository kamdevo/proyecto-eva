<?php
// Endpoint funcional para servir imágenes
Route::get('storage/equipos/images/{filename}', function($filename) {
    $imagePath = storage_path('app/public/equipos/images/' . $filename);
    
    if (file_exists($imagePath)) {
        return response()->file($imagePath, [
            'Content-Type' => mime_content_type($imagePath),
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    
    return response()->json(['error' => 'Image not found'], 404);
})->where('filename', '.*');

Route::get('storage/{path}', function($path) {
    $fullPath = storage_path('app/public/' . $path);
    
    if (file_exists($fullPath)) {
        return response()->file($fullPath, [
            'Content-Type' => mime_content_type($fullPath),
            'Cache-Control' => 'public, max-age=3600',
            'Access-Control-Allow-Origin' => '*'
        ]);
    }
    
    return response()->json(['error' => 'File not found'], 404);
})->where('path', '.*');
