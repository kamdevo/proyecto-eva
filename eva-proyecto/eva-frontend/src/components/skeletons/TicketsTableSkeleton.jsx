import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Componente Skeleton para tablas de tickets
 * Muestra un placeholder animado durante la carga de datos
 */
export const TicketsTableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header de la tabla */}
      <div className="grid grid-cols-7 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        {["ID", "Descripción", "Estado", "Prioridad", "Tipo", "Fecha", "Acciones"].map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>

      {/* Filas de la tabla */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-7 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          {/* ID */}
          <div className="flex items-center">
            <Skeleton className="h-6 w-12" />
          </div>

          {/* Descripción */}
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>

          {/* Estado */}
          <div className="flex items-center">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Prioridad */}
          <div className="flex items-center">
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Tipo */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Fecha */}
          <div className="flex items-center">
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton para filtros de tickets
 */
export const TicketsFiltersSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
};

/**
 * Skeleton completo para página de tickets
 */
export const FullTicketsPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Botones de acción Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* Búsqueda Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {/* Filtros Skeleton */}
      <TicketsFiltersSkeleton />

      {/* Tabla Skeleton */}
      <TicketsTableSkeleton rows={8} />

      {/* Paginación Skeleton */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-10" />
        ))}
      </div>
    </div>
  );
};

export default TicketsTableSkeleton;
