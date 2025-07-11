import React from "react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Componente Skeleton para mostrar durante la carga de equipos médicos
 * Mantiene la estructura visual mientras se cargan los datos
 */
export const MedicalDevicesSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4">
              {/* Imagen del equipo - Skeleton */}
              <div className="flex-shrink-0">
                <div className="w-full lg:w-24 xl:w-32 h-16 sm:h-18 md:h-20 lg:h-16 xl:h-20 bg-slate-200 animate-pulse rounded"></div>
              </div>

              {/* Información del equipo - Skeleton */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {/* Información básica */}
                <div className="col-span-1 lg:col-span-2 xl:col-span-2">
                  <div className="h-3 bg-slate-200 animate-pulse rounded mb-1"></div>
                  <div className="h-4 bg-slate-300 animate-pulse rounded mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-2/3"></div>
                  </div>
                </div>

                {/* Datos operacionales */}
                <div className="col-span-1">
                  <div className="h-3 bg-slate-200 animate-pulse rounded mb-1"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                    <div className="h-6 bg-slate-300 animate-pulse rounded w-20"></div>
                  </div>
                </div>

                {/* Ubicación */}
                <div className="col-span-1">
                  <div className="h-3 bg-slate-200 animate-pulse rounded mb-1"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 animate-pulse rounded"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                  </div>
                </div>

                {/* Ejecución del plan */}
                <div className="col-span-1">
                  <div className="h-3 bg-slate-200 animate-pulse rounded mb-1"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-2/3"></div>
                  </div>
                </div>

                {/* Última acción */}
                <div className="col-span-1">
                  <div className="h-3 bg-slate-200 animate-pulse rounded mb-1"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
                    <div className="h-3 bg-slate-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>

              {/* Botones de acción - Skeleton */}
              <div className="flex lg:flex-col gap-1 lg:gap-2 justify-end lg:justify-start">
                {Array.from({ length: 6 }).map((_, btnIndex) => (
                  <div
                    key={btnIndex}
                    className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-slate-200 animate-pulse rounded"
                  ></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Skeleton para estadísticas
 */
export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4 mb-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="bg-white border-slate-200">
          <CardContent className="p-2 sm:p-3 text-center">
            <div className="h-6 sm:h-8 bg-slate-200 animate-pulse rounded mb-1"></div>
            <div className="h-3 bg-slate-200 animate-pulse rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/**
 * Skeleton para filtros
 */
export const FiltersSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-8 w-32 bg-slate-200 animate-pulse rounded"
        ></div>
      ))}
    </div>
  );
};

/**
 * Skeleton para botones de acción
 */
export const ActionButtonsSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
      <Card className="bg-slate-200 border-slate-300 shadow-lg flex-1">
        <CardContent className="p-0.5 sm:p-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-6 xs:h-7 sm:h-8 md:h-9 flex-1 bg-slate-300 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-200 border-slate-300 shadow-lg flex-1">
        <CardContent className="p-0.5 sm:p-1">
          <div className="flex gap-0.5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-6 xs:h-7 sm:h-8 md:h-9 flex-1 bg-slate-300 animate-pulse rounded"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Skeleton completo para la vista de equipos médicos
 */
export const FullMedicalDevicesSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-1 xs:p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
      {/* Header Skeleton */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <div className="h-6 sm:h-8 md:h-10 lg:h-12 bg-slate-200 animate-pulse rounded mb-1 sm:mb-2 w-3/4"></div>
        <div className="h-3 sm:h-4 md:h-5 bg-slate-200 animate-pulse rounded w-1/2"></div>
      </div>

      {/* Action Buttons Skeleton */}
      <ActionButtonsSkeleton />

      {/* Search and Filters Skeleton */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <div className="flex-1 h-9 bg-slate-200 animate-pulse rounded"></div>
          <div className="w-24 h-9 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <FiltersSkeleton />
      </div>

      {/* Stats Skeleton */}
      <StatsSkeleton />

      {/* Equipment List Skeleton */}
      <MedicalDevicesSkeleton count={8} />

      {/* Pagination Skeleton */}
      <div className="flex justify-center mt-6">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="w-8 h-8 bg-slate-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default {
  MedicalDevicesSkeleton,
  StatsSkeleton,
  FiltersSkeleton,
  ActionButtonsSkeleton,
  FullMedicalDevicesSkeleton,
};
