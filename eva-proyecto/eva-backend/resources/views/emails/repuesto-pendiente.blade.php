<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de repuesto pendiente</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background-color: #70bbd9;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }
        .header p {
            color: #ffffff;
            margin: 10px 0 0 0;
            font-size: 18px;
        }
        .subtitle {
            background-color: #5aa9c9;
            padding: 15px 20px;
            text-align: center;
            color: #ffffff;
            font-size: 16px;
            font-style: italic;
        }
        .content {
            padding: 30px 20px;
            background-color: #ffffff;
        }
        .section-title {
            color: #333333;
            font-size: 16px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid #70bbd9;
        }
        .info-row {
            padding: 8px 0;
            line-height: 1.6;
        }
        .info-label {
            color: #333333;
            font-weight: bold;
        }
        .info-value {
            color: #666666;
        }
        .observation-box {
            background-color: #fff9e6;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 15px 0;
        }
        .repuesto-box {
            background-color: #ffebee;
            border-left: 4px solid #ee4c50;
            padding: 15px;
            margin: 15px 0;
            font-weight: bold;
        }
        .footer {
            background-color: #ee4c50;
            padding: 20px;
            text-align: center;
            color: #ffffff;
        }
        .footer p {
            margin: 5px 0;
            font-size: 12px;
        }
        .social-links {
            margin-top: 15px;
        }
        .social-links a {
            color: #ffffff;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>PREVENTIVO NRO {{ $preventivo->id }}</h1>
        </div>
        
        <!-- Subtitle -->
        <div class="subtitle">
            Eva Gestiona la tecnología
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Información Básica -->
            <div class="info-row">
                <span class="info-label">Código de preventivo:</span>
                <span class="info-value">{{ $preventivo->id }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha de ejecución:</span>
                <span class="info-value">{{ $preventivo->fecha_mantenimiento ?? 'No registrada' }}</span>
            </div>
            
            <!-- Observaciones (si existen) -->
            @if($preventivo->observacion)
            <div class="observation-box">
                <div class="section-title">Observación:</div>
                <p style="margin: 10px 0 0 0; color: #666;">{{ $preventivo->observacion }}</p>
            </div>
            @endif
            
            <!-- Ubicación -->
            <div class="section-title">Ubicación de referencia:</div>
            <div class="info-row">
                <span class="info-value">{{ $preventivo->servicio_nombre ?? 'N/A' }}</span>
            </div>
            @if($preventivo->area_nombre)
            <div class="info-row">
                <span class="info-label">Área:</span>
                <span class="info-value">{{ $preventivo->area_nombre }}</span>
            </div>
            @endif
            
            <!-- Información del Equipo -->
            <div class="section-title">Información del equipo:</div>
            <div class="info-row">• <span class="info-label">Id del equipo en el sistema:</span> {{ $preventivo->equipo_id ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Nombre del equipo:</span> {{ $preventivo->equipo_nombre ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Marca del equipo:</span> {{ $preventivo->equipo_marca ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Modelo del equipo:</span> {{ $preventivo->equipo_modelo ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Activo fijo del equipo:</span> {{ $preventivo->equipo_codigo ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Serie del equipo:</span> {{ $preventivo->equipo_serie ?? 'N/A' }}</div>
            
            <!-- Repuesto Faltante -->
            <div class="repuesto-box">
                <div class="section-title" style="border: none; margin: 0 0 10px 0;">Repuesto faltante:</div>
                <p style="margin: 0; color: #333;">{{ $preventivo->observacion ?? 'Repuesto pendiente de especificar' }}</p>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>Electromedicina, 2019 - Hospital Universitario del valle</strong></p>
            <div class="social-links">
                <a href="https://twitter.com/HUValleCali" target="_blank">Twitter</a>
                <a href="https://www.facebook.com/HUValleCali" target="_blank">Facebook</a>
            </div>
        </div>
    </div>
</body>
</html>
