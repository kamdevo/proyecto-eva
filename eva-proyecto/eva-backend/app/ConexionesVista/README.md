# Conexiones Vista - Laravel & React

Esta carpeta contiene los archivos y clases necesarios para manejar las conexiones entre el backend de Laravel y las vistas de React.

## Estructura

- `ApiController.php` - Controlador base para APIs que se conectan con React
- `ReactViewHelper.php` - Helper para manejar datos entre Laravel y React
- `CorsMiddleware.php` - Middleware para manejar CORS entre Laravel y React
- `ResponseFormatter.php` - Formateador de respuestas para APIs

## Uso

Esta carpeta facilita la comunicación entre:
- Backend Laravel (eva-backend)
- Frontend React (eva-frontend)

## Configuración

Asegúrate de configurar las rutas API en `routes/api.php` y las configuraciones CORS necesarias.
