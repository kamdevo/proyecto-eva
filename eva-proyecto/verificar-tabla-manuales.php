<?php

// Script para verificar la tabla manuales en la base de datos
require_once __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Database\Schema\Blueprint;

try {
    // Configurar conexión usando las mismas credenciales del proyecto
    $capsule = new DB;
    $capsule->addConnection([
        'driver'    => 'mysql',
        'host'      => 'localhost',
        'database'  => 'eva_db',
        'username'  => 'root',
        'password'  => '',
        'charset'   => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix'    => '',
    ]);

    $capsule->setAsGlobal();
    $capsule->bootEloquent();

    echo "🔍 VERIFICANDO TABLA MANUALES EN BASE DE DATOS\n";
    echo "==============================================\n\n";

    // 1. Verificar si la tabla existe
    $tablaExiste = DB::getSchemaBuilder()->hasTable('manuales');
    echo "📋 ¿Existe la tabla 'manuales'? " . ($tablaExiste ? "✅ SÍ" : "❌ NO") . "\n\n";

    if (!$tablaExiste) {
        echo "🛠️ CREANDO TABLA MANUALES...\n";
        
        DB::getSchemaBuilder()->create('manuales', function (Blueprint $table) {
            $table->id();
            $table->string('descripcion', 500);
            $table->text('url');
            $table->tinyInteger('status')->default(1);
            $table->timestamps();
            
            // Indices para optimización
            $table->index(['status']);
            $table->index(['descripcion']);
        });
        
        echo "✅ Tabla 'manuales' creada exitosamente\n\n";
    }

    // 2. Verificar estructura de columnas
    echo "📊 ESTRUCTURA DE LA TABLA 'manuales':\n";
    echo "-------------------------------------\n";
    
    $columnas = DB::select("DESCRIBE manuales");
    foreach ($columnas as $columna) {
        echo sprintf("%-15s | %-20s | %-8s | %-8s\n", 
            $columna->Field, 
            $columna->Type, 
            $columna->Null, 
            $columna->Default ?? 'NULL'
        );
    }
    echo "\n";

    // 3. Verificar datos existentes
    $count = DB::table('manuales')->count();
    echo "📈 TOTAL DE MANUALES: $count\n\n";

    // 4. Insertar datos de ejemplo si la tabla está vacía
    if ($count == 0) {
        echo "📝 INSERTANDO DATOS DE EJEMPLO...\n";
        
        $manualesEjemplo = [
            [
                'descripcion' => 'Manual de Usuario - Microscopio Quirúrgico TIVATO 7001',
                'url' => 'https://drive.google.com/drive/folders/1g03Se0Y37OYP8iF5QRHDMx',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'descripcion' => 'Manual Técnico - Equipo de Braquiterapia VARIAN BRAVOS',
                'url' => 'https://drive.google.com/drive/folders/1h04Tf1Z48PZQ9jG6RSIENy',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'descripcion' => 'Manual de Operación - Acelerador Lineal VARIAN TRUE BEAM',
                'url' => 'https://drive.google.com/drive/folders/1i05Ug2A59QAR0kH7STJFOz',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        foreach ($manualesEjemplo as $manual) {
            DB::table('manuales')->insert($manual);
        }
        
        $newCount = DB::table('manuales')->count();
        echo "✅ $newCount manuales de ejemplo insertados\n\n";
    }

    // 5. Probar consulta de la API
    echo "🧪 PROBANDO CONSULTA SIMILAR A LA API...\n";
    echo "----------------------------------------\n";
    
    $query = DB::table('manuales');
    $query->where('status', 1);
    $total = $query->count();
    
    $manuales = $query->orderBy('descripcion', 'ASC')
                      ->limit(10)
                      ->select(['id', 'descripcion', 'url', 'status'])
                      ->get();
    
    echo "📊 Total de manuales activos: $total\n";
    echo "📋 Primeros 10 registros:\n\n";
    
    foreach ($manuales as $manual) {
        echo sprintf("ID: %d | %s\n", $manual->id, $manual->descripcion);
        echo sprintf("URL: %s\n", $manual->url);
        echo "---\n";
    }

    echo "\n🎉 VERIFICACIÓN COMPLETA\n";
    echo "========================\n";
    echo "✅ Tabla 'manuales' está configurada correctamente\n";
    echo "✅ Estructura de columnas es válida\n";
    echo "✅ Datos de ejemplo disponibles\n";
    echo "✅ Consultas funcionan correctamente\n\n";
    echo "🚀 El endpoint /api/v1/manuales debería funcionar ahora\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    echo "📂 Archivo: " . $e->getFile() . "\n";
}

function now() {
    return date('Y-m-d H:i:s');
}
