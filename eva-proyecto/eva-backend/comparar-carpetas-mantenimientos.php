<?php

echo "=== COMPARACIÓN DE CARPETAS PREVENTIVOS vs MANTENIMIENTOS ===\n\n";

$carpetaMantenimientos = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\mantenimientos';
$carpetaPreventivos = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\preventivos';

echo "1. ARCHIVOS EN /mantenimientos/:\n";
$archivosMantenimientos = array_diff(scandir($carpetaMantenimientos), ['.', '..']);
sort($archivosMantenimientos);
foreach ($archivosMantenimientos as $archivo) {
    $size = filesize($carpetaMantenimientos . '/' . $archivo);
    echo "- $archivo (" . number_format($size) . " bytes)\n";
}

echo "\n2. ARCHIVOS EN /preventivos/:\n";
$archivosPreventivos = array_diff(scandir($carpetaPreventivos), ['.', '..']);
sort($archivosPreventivos);
foreach ($archivosPreventivos as $archivo) {
    $size = filesize($carpetaPreventivos . '/' . $archivo);
    echo "- $archivo (" . number_format($size) . " bytes)\n";
}

echo "\n3. COMPARACIÓN:\n";
echo "Archivos en mantenimientos: " . count($archivosMantenimientos) . "\n";
echo "Archivos en preventivos: " . count($archivosPreventivos) . "\n";

$soloEnMantenimientos = array_diff($archivosMantenimientos, $archivosPreventivos);
$soloEnPreventivos = array_diff($archivosPreventivos, $archivosMantenimientos);
$enAmbos = array_intersect($archivosMantenimientos, $archivosPreventivos);

echo "\n4. ANÁLISIS DE DUPLICACIÓN:\n";
echo "Solo en /mantenimientos/: " . count($soloEnMantenimientos) . " archivos\n";
if ($soloEnMantenimientos) {
    foreach ($soloEnMantenimientos as $archivo) {
        echo "  - $archivo\n";
    }
}

echo "\nSolo en /preventivos/: " . count($soloEnPreventivos) . " archivos\n";
if ($soloEnPreventivos) {
    foreach ($soloEnPreventivos as $archivo) {
        echo "  - $archivo\n";
    }
}

echo "\nEn ambas carpetas: " . count($enAmbos) . " archivos\n";
if ($enAmbos) {
    echo "Archivos duplicados:\n";
    foreach ($enAmbos as $archivo) {
        $size1 = filesize($carpetaMantenimientos . '/' . $archivo);
        $size2 = filesize($carpetaPreventivos . '/' . $archivo);
        $match = ($size1 === $size2) ? "✅ IDÉNTICO" : "❌ DIFERENTE";
        echo "  - $archivo → $match\n";
    }
}

echo "\n5. CONCLUSIÓN:\n";
if (count($soloEnPreventivos) === 0 && count($enAmbos) > 0) {
    echo "✅ TODOS los archivos de /preventivos/ están en /mantenimientos/\n";
    echo "✅ La carpeta /preventivos/ es REDUNDANTE y se puede eliminar\n";
} else {
    echo "⚠️  Hay archivos únicos en /preventivos/ que deben revisarse\n";
}

echo "\n=== FIN DEL ANÁLISIS ===\n";
