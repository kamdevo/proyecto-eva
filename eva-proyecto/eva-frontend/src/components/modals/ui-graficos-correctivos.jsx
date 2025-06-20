"use client"

export default function UIGraficosCorrectivos({ dataSistemas = [], dataCorrectivos = [] }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">CORRECTIVOS</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 1 - Estado actual de los sistemas */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Estado actual de los sistemas</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Fondo del círculo */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                {/* Segmento naranja (mayor) */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="20"
                  strokeDasharray="377 503"
                  strokeDashoffset="0"
                />
                {/* Segmento azul */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="63 503"
                  strokeDashoffset="-377"
                />
                {/* Segmento verde */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="31 503"
                  strokeDashoffset="-440"
                />
                {/* Segmento rojo */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="32 503"
                  strokeDashoffset="-471"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">100%</span>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Activo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Inactivo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Reparado</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Otro</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2 - Estado actual de los correctivos generales */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Estado actual de los correctivos generales</h3>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                {/* Fondo del círculo */}
                <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="20" />
                {/* Segmento naranja (mayor) */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="20"
                  strokeDasharray="440 503"
                  strokeDashoffset="0"
                />
                {/* Otros segmentos más pequeños */}
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="20"
                  strokeDasharray="21 503"
                  strokeDashoffset="-440"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray="21 503"
                  strokeDashoffset="-461"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray="21 503"
                  strokeDashoffset="-482"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">100%</span>
              </div>
            </div>
          </div>

          {/* Leyenda */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>ABIERTO</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>CERRADO</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>EN EJECUCIÓN</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>ESCALADO</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>PAUSADO</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span>Otro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
