// Configuración runtime del sistema EVA
// Se detecta el entorno según el hostname para evitar que local apunte a producción
(function () {
  var hostname = window.location.hostname;

  // Producción: solo cuando estamos en los dominios oficiales del HUV
  var isProduction =
    hostname === 'eva2.huv.gov.co' ||
    hostname === 'api.eva2.huv.gov.co' ||
    hostname.endsWith('.huv.gov.co');

  if (isProduction) {
    window.APP_CONFIG = {
      API_BASE_URL: 'http://api.eva2.huv.gov.co',
      APP_NAME: 'EVA Sistema',
      ENV: 'production'
    };
  } else {
    // Local / desarrollo: NO establecer API_BASE_URL para que api.js
    // use VITE_API_BASE_URL del .env (o los fallbacks de localhost)
    window.APP_CONFIG = {
      APP_NAME: 'EVA Sistema (Local)',
      ENV: 'development'
      // API_BASE_URL intencionalmente omitido aquí
    };
  }
})();