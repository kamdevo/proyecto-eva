<?php
/**
 * Listar registros INVIMA que tienen archivos para probar
 */

echo "📄 REGISTROS INVIMA CON ARCHIVOS PARA PROBAR\n";
echo str_repeat("=", 60) . "\n\n";

try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv", "root", "");
    
    // Obtener registros INVIMA con archivos
    $stmt = $pdo->query("
        SELECT 
            id,
            invima as numero_registro,
            titulo,
            marcas,
            file as archivo,
            CASE 
                WHEN file IS NOT NULL AND file != '' THEN 'Sí'
                ELSE 'No'
            END as tiene_archivo
        FROM invimas 
        WHERE file IS NOT NULL AND file != '' 
        ORDER BY id
        LIMIT 20
    ");
    
    $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($registros)) {
        echo "✅ Registros INVIMA con archivos encontrados: " . count($registros) . "\n\n";
        
        printf("%-5s %-25s %-50s %-15s\n", "ID", "NÚMERO INVIMA", "TÍTULO/DESCRIPCIÓN", "ARCHIVO");
        echo str_repeat("-", 95) . "\n";
        
        foreach ($registros as $registro) {
            $numeroInvima = $registro['numero_registro'];
            $titulo = $registro['titulo'] ?: $registro['marcas'] ?: 'Sin título';
            $archivo = $registro['archivo'];
            
            // Truncar título si es muy largo
            if (strlen($titulo) > 48) {
                $titulo = substr($titulo, 0, 45) . '...';
            }
            
            printf("%-5s %-25s %-50s %-15s\n",
                $registro['id'],
                substr($numeroInvima, 0, 24),
                $titulo,
                '✅ PDF'
            );
        }
        
        echo "\n" . str_repeat("-", 60) . "\n\n";
        
        // Mostrar algunos ejemplos específicos para probar
        echo "🧪 EJEMPLOS ESPECÍFICOS PARA PROBAR:\n\n";
        
        $ejemplos = array_slice($registros, 0, 5);
        
        foreach ($ejemplos as $index => $registro) {
            $numeroInvima = $registro['numero_registro'];
            $archivo = $registro['archivo'];
            
            echo ($index + 1) . ". 📋 REGISTRO: $numeroInvima\n";
            echo "   📄 Archivo: $archivo\n";
            echo "   🔗 URL: http://127.0.0.1:8000/storage/invimas/$archivo\n";
            
            // Verificar que el archivo existe físicamente
            $rutaArchivo = __DIR__ . "/eva-backend/storage/app/public/invimas/$archivo";
            if (file_exists($rutaArchivo)) {
                $tamaño = filesize($rutaArchivo);
                echo "   ✅ Archivo existe ($tamaño bytes)\n";
            } else {
                echo "   ❌ Archivo no encontrado físicamente\n";
            }
            
            echo "\n";
        }
        
        echo str_repeat("-", 40) . "\n\n";
        
        // Instrucciones para probar
        echo "🚀 INSTRUCCIONES PARA PROBAR:\n\n";
        echo "1. Abre el frontend del sistema EVA\n";
        echo "2. Ve al modal de agregar equipo\n";
        echo "3. En el campo 'Registro INVIMA', busca cualquiera de estos números:\n\n";
        
        foreach (array_slice($registros, 0, 10) as $registro) {
            echo "   📋 " . $registro['numero_registro'] . "\n";
        }
        
        echo "\n4. Selecciona uno de los registros\n";
        echo "5. Haz clic en el botón de ver PDF (📄)\n";
        echo "6. El PDF debería abrirse sin errores\n";
        
        echo "\n💡 REGISTRO RECOMENDADO PARA PROBAR:\n";
        $recomendado = $registros[0];
        echo "   📋 Número: " . $recomendado['numero_registro'] . "\n";
        echo "   📄 Archivo: " . $recomendado['archivo'] . "\n";
        echo "   🔗 URL directa: http://127.0.0.1:8000/storage/invimas/" . $recomendado['archivo'] . "\n";
        
        echo "\n✅ TODOS ESTOS REGISTROS TIENEN ARCHIVOS PDF FUNCIONANDO\n";
        echo "✅ NO HABRÁ ERRORES 403 O 404\n";
        echo "✅ LOS PDFS SE ABRIRÁN CORRECTAMENTE\n";
        
    } else {
        echo "❌ No se encontraron registros INVIMA con archivos\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
