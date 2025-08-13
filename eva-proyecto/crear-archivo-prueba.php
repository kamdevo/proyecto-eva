<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREANDO ARCHIVO DE PRUEBA PARA VISUALIZACIÓN ===\n";

// Vamos a crear un archivo PDF de prueba para el documento que encontramos
$documentoId = 45458;
$equipoId = 10020;
$nombreArchivo = "1754938643_689a3d13042c2.pdf";

// Crear el directorio si no existe
$directorioDestino = "eva-backend/storage/app/documents";
if (!file_exists($directorioDestino)) {
    mkdir($directorioDestino, 0755, true);
    echo "✅ Directorio creado: $directorioDestino\n";
}

// Crear un PDF de prueba simple
$rutaArchivo = "$directorioDestino/$nombreArchivo";

// Contenido de un PDF básico
$pdfContent = "%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 73 >>
stream
BT
/F1 12 Tf
100 700 Td
(DOCUMENTO DE PRUEBA - EVA SISTEMA) Tj
100 650 Td
(Acta de entrega empresa) Tj
100 600 Td
(Equipo: EQUIPO ALARA PRUEBA BUSQUEDA) Tj
100 550 Td
(ID Documento: $documentoId) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000251 00000 n 
0000000326 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
490
%%EOF";

// Escribir el archivo
if (file_put_contents($rutaArchivo, $pdfContent)) {
    echo "✅ Archivo PDF de prueba creado: $rutaArchivo\n";
    echo "📏 Tamaño: " . filesize($rutaArchivo) . " bytes\n";
} else {
    echo "❌ Error al crear el archivo PDF\n";
}

// Verificar que el archivo existe
if (file_exists($rutaArchivo)) {
    echo "\n🎉 ARCHIVO LISTO PARA PRUEBAS\n";
    echo "📂 Ruta: $rutaArchivo\n";
    echo "🌐 URL de acceso: http://localhost:8000/storage/documents/$nombreArchivo\n";
    echo "\n✨ Ahora puedes probar la funcionalidad de visualización desde el frontend!\n";
} else {
    echo "\n❌ El archivo no se creó correctamente\n";
}

// También crear el enlace simbólico si no existe
$linkCommand = "cd eva-backend && php artisan storage:link";
echo "\n🔗 Ejecuta este comando para crear el enlace simbólico:\n";
echo "$linkCommand\n";
?>
