<?php

echo "🖼️ CONVERSIÓN DE LOGO HUV A BASE64 PARA CORREOS\n\n";

// Ruta del logo
$logoPath = __DIR__ . '/emails/logo_huv.jpg';

if (!file_exists($logoPath)) {
    echo "❌ Error: Logo no encontrado en $logoPath\n";
    exit(1);
}

echo "📁 Logo encontrado: $logoPath\n";
echo "📏 Tamaño: " . number_format(filesize($logoPath)) . " bytes\n\n";

// Convertir a base64
$logoData = file_get_contents($logoPath);
$logoBase64 = base64_encode($logoData);
$logoDataUri = 'data:image/jpeg;base64,' . $logoBase64;

echo "✅ Logo convertido a base64\n";
echo "📏 Tamaño base64: " . number_format(strlen($logoBase64)) . " caracteres\n";
echo "🔗 Data URI: " . substr($logoDataUri, 0, 50) . "...\n\n";

// Crear constante para usar en templates
$logoConstant = "export const LOGO_HUV_BASE64 = '$logoDataUri';";

// Guardar en archivo
$constantFile = __DIR__ . '/emails/logo-base64.js';
file_put_contents($constantFile, $logoConstant);

echo "💾 Constante guardada en: $constantFile\n\n";

// Mostrar preview del data URI
echo "🎨 PREVIEW DEL DATA URI:\n";
echo "```javascript\n";
echo "const LOGO_HUV_BASE64 = '$logoDataUri';\n";
echo "```\n\n";

echo "📋 PRÓXIMO PASO:\n";
echo "Actualizar templates React Email para usar:\n";
echo "import { LOGO_HUV_BASE64 } from '../logo-base64.js';\n";
echo "<Img src={LOGO_HUV_BASE64} alt=\"Hospital Universitario del Valle\" />\n\n";

echo "✅ Conversión completada exitosamente\n";

?>
