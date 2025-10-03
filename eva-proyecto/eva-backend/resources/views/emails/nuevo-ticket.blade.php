<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creación de Ticket</title>
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
        .description-box {
            background-color: #f8f9fa;
            border-left: 4px solid #70bbd9;
            padding: 15px;
            margin: 15px 0;
        }
        .priority-box {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 4px;
            font-weight: bold;
            margin: 10px 0;
        }
        .priority-alta {
            background-color: #ffebee;
            color: #ee4c50;
        }
        .priority-media {
            background-color: #fff9e6;
            color: #ffc107;
        }
        .priority-baja {
            background-color: #e8f5e9;
            color: #4caf50;
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
            <h1>TICKET NRO {{ $ticket->id }}</h1>
        </div>
        
        <!-- Subtitle -->
        <div class="subtitle">
            Eva Gestiona la tecnología
        </div>
        
        <!-- Content -->
        <div class="content">
            <!-- Asunto -->
            <div class="info-row">
                <span class="info-label">Asunto:</span>
                <span class="info-value">{{ $ticket->descripcion ?? 'Nuevo ticket creado' }}</span>
            </div>
            
            <!-- Descripción -->
            <div class="description-box">
                <div class="section-title" style="border: none; margin: 0 0 10px 0;">Descripción:</div>
                <p style="margin: 0; color: #666;">{{ $ticket->descripcion ?? 'Sin descripción detallada' }}</p>
                <div style="margin-top: 10px;">
                    <span class="info-label">Fecha de registro:</span>
                    <span class="info-value">{{ $ticket->fecha_inicio ?? now() }}</span>
                </div>
            </div>
            
            <!-- Ubicación -->
            <div class="section-title">Ubicación de referencia:</div>
            <div class="info-row">
                <span class="info-value">{{ $ticket->servicio_nombre ?? 'N/A' }}</span>
            </div>
            @if($ticket->area_nombre)
            <div class="info-row">
                <span class="info-label">Área:</span>
                <span class="info-value">{{ $ticket->area_nombre }}</span>
            </div>
            @endif
            
            <!-- Información del Equipo -->
            <div class="section-title">Información del equipo:</div>
            <div class="info-row">• <span class="info-label">Id del equipo en el sistema:</span> {{ $ticket->equipo_id ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Nombre del equipo:</span> {{ $ticket->equipo_nombre ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Marca del equipo:</span> {{ $ticket->equipo_marca ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Modelo del equipo:</span> {{ $ticket->equipo_modelo ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Activo fijo del equipo:</span> {{ $ticket->equipo_codigo ?? 'N/A' }}</div>
            <div class="info-row">• <span class="info-label">Serie del equipo:</span> {{ $ticket->equipo_serie ?? 'N/A' }}</div>
            <div class="info-row">
                • <span class="info-label">Prioridad:</span>
                @if($ticket->prioridad == 3)
                    <span class="priority-box priority-alta">ALTA</span>
                @elseif($ticket->prioridad == 2)
                    <span class="priority-box priority-media">MEDIA</span>
                @else
                    <span class="priority-box priority-baja">BAJA</span>
                @endif
            </div>
            
            <!-- Información del Solicitante -->
            <div class="section-title">Información del Solicitante:</div>
            <div class="info-row">• <span class="info-label">Nombre:</span> {{ $ticket->reportante_nombre ?? 'N/A' }}</div>
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
