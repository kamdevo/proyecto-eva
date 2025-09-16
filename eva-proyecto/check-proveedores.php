<?php
$pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
echo "=== ESTRUCTURA PROVEEDORES_MANTENIMIENTO ===\n";
$stmt = $pdo->query('DESCRIBE proveedores_mantenimiento');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  {$row['Field']} ({$row['Type']}) - {$row['Null']} - {$row['Key']}\n";
}
echo "\n=== DATOS DE PROVEEDORES ===\n";
$stmt = $pdo->query('SELECT id, name, status FROM proveedores_mantenimiento LIMIT 10');
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "  ID: {$row['id']}, Nombre: {$row['name']}, Status: {$row['status']}\n";
}
?>
