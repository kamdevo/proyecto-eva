import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton para páginas de configuración del módulo EVA.
 * Replica la estructura: Header (icono + título + stat card) → Barra de búsqueda → Tabla.
 *
 * @param {{ columns?: number, rows?: number, accentColor?: string }} props
 *   - columns: número de columnas de la tabla (default 4)
 *   - rows: número de filas simuladas (default 6)
 *   - accentColor: color tailwind base para el acento, ej. "blue", "amber", "violet" (default "slate")
 */
export default function ConfigPageSkeleton({ columns = 4, rows = 6, accentColor = "slate" }) {
  // Anchos variados para dar aspecto orgánico a cada celda
  const cellWidths = ["w-3/4", "w-2/3", "w-1/2", "w-5/6", "w-4/5", "w-3/5"];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8 animate-in fade-in duration-300">

      {/* ── HEADER ── */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        {/* Icono + Título + Descripción */}
        <div className="flex items-start gap-4">
          <Skeleton className={`h-14 w-14 rounded-2xl bg-${accentColor}-100`} />
          <div className="space-y-3 mt-1">
            <Skeleton className="h-9 w-56 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
        </div>

        {/* Stat Card */}
        <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center gap-5 w-full md:w-64">
          <Skeleton className={`h-14 w-14 rounded-2xl bg-${accentColor}-50`} />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-24 rounded" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </header>

      {/* ── SEARCH BAR ── */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 items-center">
          <Skeleton className="h-12 flex-grow w-full rounded-2xl" />
          <Skeleton className="h-12 w-20 rounded-2xl shrink-0" />
          <Skeleton className="h-12 w-40 rounded-2xl shrink-0" />
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">

          {/* Cabecera de tabla */}
          <div className="px-6 py-5 border-b border-slate-50 flex gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton
                key={`th-${i}`}
                className="h-3.5 rounded"
                style={{ width: `${100 / columns}%` }}
              />
            ))}
          </div>

          {/* Filas */}
          <div className="divide-y divide-slate-50">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <div key={rowIdx} className="flex items-center gap-4 px-6 py-4">
                {Array.from({ length: columns }).map((_, colIdx) => {
                  const isLast = colIdx === columns - 1;
                  return (
                    <div
                      key={colIdx}
                      className="flex items-center"
                      style={{ width: `${100 / columns}%` }}
                    >
                      {isLast ? (
                        /* Botones de acción */
                        <div className="flex gap-2 ml-auto">
                          <Skeleton className="h-8 w-8 rounded-lg" />
                          <Skeleton className="h-8 w-8 rounded-lg" />
                        </div>
                      ) : colIdx === 0 ? (
                        /* Primera columna: badge corto */
                        <Skeleton className="h-5 w-16 rounded-full" />
                      ) : (
                        /* Columnas intermedias: ancho variable */
                        <Skeleton
                          className={`h-4 ${cellWidths[(rowIdx + colIdx) % cellWidths.length]} rounded`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── PAGINATION ── */}
        <div className="flex justify-between items-center px-2">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
