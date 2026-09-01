<?php

namespace App\Support;

/**
 * Saneado de texto enriquecido (descripciones de tickets, observaciones, etc.).
 *
 * CONTEXTO: el editor del frontend solo ofrece NEGRITA. Al pegar desde
 * Gmail/Word, el navegador inyectaba el HTML de origen completo (con style,
 * font-family, &quot;, etc.), que se guardaba tal cual y salía crudo en los
 * exportes a Excel, correos y PDF.
 *
 * Esta clase es la defensa del lado del servidor: no importa qué cliente
 * escriba, en base de datos solo entra <strong> y <br>.
 */
class TextSanitizer
{
    /**
     * Deja solo <strong> y <br>, sin atributos. Para GUARDAR.
     * Es idempotente: aplicarlo dos veces da el mismo resultado.
     */
    public static function sanitizeRich(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        // Fuera por completo el contenido peligroso o inútil.
        $html = preg_replace('/<\s*(script|style|noscript|iframe|object|embed)\b[\s\S]*?<\s*\/\s*\1\s*>/i', '', $html);
        $html = preg_replace('/<!--[\s\S]*?-->/', '', $html);

        // Normalizar la negrita a <strong> sin atributos.
        $html = preg_replace('/<\s*(b|strong)\b[^>]*>/i', '<strong>', $html);
        $html = preg_replace('/<\s*\/\s*(b|strong)\s*>/i', '</strong>', $html);

        // Saltos de línea: <br> y los cierres de bloque.
        $html = preg_replace('/<\s*br\b[^>]*>/i', '<br>', $html);
        $html = preg_replace('/<\s*\/\s*(div|p|li|tr|h[1-6]|blockquote)\s*>/i', '<br>', $html);

        // Tras normalizar, las etiquetas permitidas ya no tienen atributos.
        $html = strip_tags($html, '<strong><br>');

        // Las entidades se decodifican a caracteres reales (MES&Oacute;N -> MESÓN)
        // sin romper las etiquetas que sí se conservan.
        $html = self::decodeEntitiesPreservingTags($html);

        return self::tidy($html);
    }

    /**
     * Convierte a texto plano legible. Para EXPORTES, correos y PDF.
     */
    public static function toPlainText(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        $text = preg_replace('/<\s*(script|style|noscript)\b[\s\S]*?<\s*\/\s*\1\s*>/i', '', $html);
        $text = preg_replace('/<!--[\s\S]*?-->/', '', $text);

        // Los saltos estructurales se conservan como saltos de línea reales.
        $text = preg_replace('/<\s*br\b[^>]*>/i', "\n", $text);
        $text = preg_replace('/<\s*\/\s*(div|p|li|tr|h[1-6]|blockquote)\s*>/i', "\n", $text);

        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Espacios duros y ruido de espaciado.
        $text = str_replace("\xC2\xA0", ' ', $text);
        $text = preg_replace('/[ \t]+/', ' ', $text);
        $text = preg_replace('/ *\n */', "\n", $text);
        $text = preg_replace('/\n{3,}/', "\n\n", $text);

        return trim($text);
    }

    /** ¿El valor trae etiquetas HTML? Útil para diagnóstico y limpieza. */
    public static function looksLikeHtml(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        return (bool) preg_match('/<\s*\/?\s*(br|div|span|p|b|strong|font|ul|ol|li|table|tr|td|h[1-6]|a|img)\b[^>]*>/i', $value)
            || (bool) preg_match('/&(nbsp|quot|amp|lt|gt|#\d+);/i', $value);
    }

    /**
     * Decodifica entidades HTML sin destruir <strong>/<br>, y vuelve a escapar
     * los <, > y & que queden como texto del usuario.
     */
    private static function decodeEntitiesPreservingTags(string $html): string
    {
        $map = [
            '<strong>'  => "S",
            '</strong>' => "E",
            '<br>'      => "B",
        ];

        $html = str_replace(array_keys($map), array_values($map), $html);
        $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $html = htmlspecialchars($html, ENT_NOQUOTES, 'UTF-8', true);

        return str_replace(array_values($map), array_keys($map), $html);
    }

    /** Colapsa saltos repetidos y recorta los de los extremos. */
    private static function tidy(string $html): string
    {
        $html = preg_replace('/(?:\s*<br>\s*){3,}/i', '<br><br>', $html);
        $html = preg_replace('/^(?:\s*<br>\s*)+/i', '', $html);
        $html = preg_replace('/(?:\s*<br>\s*)+$/i', '', $html);

        return trim($html);
    }
}
