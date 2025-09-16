<?php
echo "=== BÚSQUEDA DE TABLAS PROVEEDORES ===\n";

$pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');

echo "Buscando tablas relacionadas con proveedores:\n";
$stmt = $pdo->query("SHOW TABLES LIKE '%proveedor%'");
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo "  - {$row[0]}\n";
}

echo "\nBuscando tablas con 'mantenimiento':\n";
$stmt = $pdo->query("SHOW TABLES LIKE '%mantenimiento%'");
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo "  - {$row[0]}\n";
}

echo "\nVerificando IDs de proveedor en tabla mantenimiento:\n";
$stmt = $pdo->query("SELECT DISTINCT proveedor_mantenimiento_id FROM mantenimiento WHERE proveedor_mantenimiento_id IS NOT NULL LIMIT 10");
while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
    echo "  ID: {$row[0]}\n";
}

echo "\nBuscando tablas que podrían contener proveedores:\n";
$tablas = ['proveedores', 'empresas', 'contratistas', 'terceros'];
foreach ($tablas as $tabla) {
    $stmt = $pdo->query("SHOW TABLES LIKE '%$tabla%'");
    if ($stmt->rowCount() > 0) {
        echo "  ✓ Encontrada tabla relacionada: $tabla\n";
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            echo "    - {$row[0]}\n";
        }
    }
}
?>
