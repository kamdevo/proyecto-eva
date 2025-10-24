# Dockerfile SIMPLE para Frontend React/Vite - Sistema EVA (Desarrollo Local)
FROM node:20-alpine

LABEL maintainer="Sistema EVA - Hospital Universitario del Valle"
LABEL version="1.0.0-dev"
LABEL description="Frontend React/Vite para Sistema EVA - Desarrollo Local"

# Variables de construcción
ARG VITE_API_URL
ARG VITE_APP_NAME="EVA - Sistema de Gestión"

# Instalar dependencias del sistema
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo dev)
RUN npm install --silent

# Copiar código fuente
COPY . .

# Configurar variables de entorno para desarrollo
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}
ENV NODE_ENV=development

# Crear script de inicio simple
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "🚀 Iniciando EVA Frontend en modo desarrollo..."' >> /start.sh && \
    echo 'echo "🌐 API URL: $VITE_API_URL"' >> /start.sh && \
    echo 'echo "📱 App Name: $VITE_APP_NAME"' >> /start.sh && \
    echo 'npm run dev -- --host 0.0.0.0 --port 5173' >> /start.sh && \
    chmod +x /start.sh

# Exponer puerto
EXPOSE 5173

# Health check simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5173 || exit 1

# Comando de inicio (servidor de desarrollo)
CMD ["/start.sh"]
