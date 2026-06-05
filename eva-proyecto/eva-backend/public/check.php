<?php
header('Content-Type: text/plain; charset=utf-8');

if (class_exists('ZipArchive')) {
    echo "✅ Éxito: La extensión 'zip' está activa y funcionando.";
} else {
    echo "❌ Error: La extensión 'zip' sigue desactivada.";
}