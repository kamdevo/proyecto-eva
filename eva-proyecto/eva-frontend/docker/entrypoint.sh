#!/bin/sh

echo "🚀 Iniciando Sistema EVA Frontend..."

# Obtener la IP del host automáticamente
HOST_IP=${HOST_IP:-$(hostname -I | awk '{print $1}')}
if [ -z "$HOST_IP" ]; then
    HOST_IP=$(ip route get 1 | awk '{print $(NF-2);exit}')
fi

# Si aún no tenemos IP, usar la IP del gateway por defecto
if [ -z "$HOST_IP" ]; then
    HOST_IP=$(ip route show default | awk '/default/ {print $3}')
fi

echo "🌐 Detectada IP del host: $HOST_IP"

# Configurar URLs dinámicas
VITE_API_URL=${VITE_API_URL:-"http://$HOST_IP:8001/api"}
VITE_APP_NAME=${VITE_APP_NAME:-"EVA - Sistema de Gestión"}

echo "🔧 Configurando variables de entorno:"
echo "   - VITE_API_URL: $VITE_API_URL"
echo "   - VITE_APP_NAME: $VITE_APP_NAME"
echo "   - HOST_IP: $HOST_IP"

# Generar archivo de configuración dinámico
cat > /usr/share/nginx/html/config.js << EOF
// Configuración dinámica generada al iniciar el contenedor
window.APP_CONFIG = {
  API_URL: '$VITE_API_URL',
  APP_NAME: '$VITE_APP_NAME',
  HOST_IP: '$HOST_IP',
  BACKEND_URL: 'http://$HOST_IP:8001',
  FRONTEND_URL: 'http://$HOST_IP:5173',
  WS_URL: 'ws://$HOST_IP:8001',
  ENVIRONMENT: 'production',
  VERSION: '1.0.0',
  BUILD_TIME: '$(date -Iseconds)',
  FEATURES: {
    REACT_EMAIL: true,
    PDF_GENERATION: true,
    DIGITAL_SIGNATURES: true,
    REAL_TIME_NOTIFICATIONS: true
  }
};

// Legacy support - para compatibilidad con código existente
if (typeof window !== 'undefined') {
  window.VITE_API_URL = '$VITE_API_URL';
  window.VITE_APP_NAME = '$VITE_APP_NAME';
}

console.log('🔧 EVA Frontend Config loaded:', window.APP_CONFIG);
EOF

# Reemplazar placeholders en archivos HTML si existen
if [ -f /usr/share/nginx/html/index.html ]; then
    sed -i "s|VITE_API_URL_PLACEHOLDER|$VITE_API_URL|g" /usr/share/nginx/html/index.html
    sed -i "s|HOST_IP_PLACEHOLDER|$HOST_IP|g" /usr/share/nginx/html/index.html
fi

# Actualizar configuración de Nginx con IP dinámica
if [ -f /etc/nginx/nginx.conf ]; then
    sed -i "s|eva_backend:8001|$HOST_IP:8001|g" /etc/nginx/nginx.conf
fi

echo "✅ Frontend EVA configurado correctamente"
echo "🌐 Accesible en: http://$HOST_IP:5173"
echo "🔗 API Backend: $VITE_API_URL"

# Ejecutar comando original
exec "$@"
