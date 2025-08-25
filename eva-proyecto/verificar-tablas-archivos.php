<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=gestionthuv;charset=utf8", "root", "");
    echo "TABLA ARCHIVOS:\n";
    $stmt = $pdo->query("DESCRIBE archivos");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
    
    echo "\nTABLA OBSERVACIONES:\n";
    $stmt = $pdo->query("DESCRIBE observaciones");
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo $row['Field'] . " | " . $row['Type'] . "\n";
    }
} catch(Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
