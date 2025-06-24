<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CompressionMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Solo comprimir respuestas exitosas
        if ($response->getStatusCode() !== 200) {
            return $response;
        }

        // Solo comprimir si el cliente acepta compresión
        $acceptEncoding = $request->header('Accept-Encoding', '');
        if (!str_contains($acceptEncoding, 'gzip')) {
            return $response;
        }

        // Solo comprimir contenido de texto
        $contentType = $response->headers->get('Content-Type', '');
        if (!$this->shouldCompress($contentType)) {
            return $response;
        }

        $content = $response->getContent();
        
        // Solo comprimir si el contenido es lo suficientemente grande
        if (strlen($content) < 1024) { // 1KB mínimo
            return $response;
        }

        // Comprimir el contenido
        $compressedContent = gzencode($content, 6); // Nivel de compresión 6 (balance entre velocidad y tamaño)
        
        if ($compressedContent === false) {
            return $response; // Si falla la compresión, devolver respuesta original
        }

        // Solo usar compresión si realmente reduce el tamaño
        if (strlen($compressedContent) >= strlen($content)) {
            return $response;
        }

        // Establecer headers de compresión
        $response->setContent($compressedContent);
        $response->headers->set('Content-Encoding', 'gzip');
        $response->headers->set('Content-Length', strlen($compressedContent));
        $response->headers->set('Vary', 'Accept-Encoding');

        return $response;
    }

    /**
     * Determinar si el contenido debe ser comprimido
     */
    private function shouldCompress(string $contentType): bool
    {
        $compressibleTypes = [
            'application/json',
            'application/xml',
            'text/html',
            'text/plain',
            'text/css',
            'text/javascript',
            'application/javascript',
            'text/xml',
            'application/rss+xml',
            'application/atom+xml',
        ];

        foreach ($compressibleTypes as $type) {
            if (str_starts_with($contentType, $type)) {
                return true;
            }
        }

        return false;
    }
}
