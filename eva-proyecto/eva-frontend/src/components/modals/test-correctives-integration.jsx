import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CorrectiveModal } from "./corrective-modal";
import { CreateCorrectiveModal } from "./create-corrective-modal";
import { Wrench, Plus, List } from "lucide-react";

/**
 * Componente de prueba para verificar la integración completa
 * de los módulos de correctivos refactorizados
 */
export function TestCorrectivesIntegration() {
  const [correctiveModalOpen, setCorrectiveModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCorrectiveCreated = (newCorrective) => {
    console.log("✅ Nuevo correctivo creado:", newCorrective);
    // Aquí podrías recargar la lista de correctivos si fuera necesario
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Módulo de Correctivos - Versión Refactorizada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Prueba la funcionalidad completa del módulo de correctivos después de la refactorización:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Modal de Lista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Modal simplificado que solo contiene:
                  • Lista de correctivos
                  • Funciones de exportación
                  • Vista de detalles
                </p>
                <Button 
                  onClick={() => setCorrectiveModalOpen(true)}
                  className="w-full"
                >
                  Abrir Lista de Correctivos
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Modal de Creación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Componente independiente para:
                  • Crear nuevos correctivos
                  • Seleccionar equipos
                  • Configurar detalles
                </p>
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Crear Nuevo Correctivo
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Cambios Realizados:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>✅ Backend: Aumentado límite de paginación de 10 a 1000 registros</li>
              <li>✅ Modal principal: Simplificado para solo lista y exportación</li>
              <li>✅ Componente de creación: Extraído como módulo independiente</li>
              <li>✅ Eliminadas funciones de edición del modal principal</li>
              <li>✅ Optimizada carga de todos los correctivos de la BD</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">Funcionalidades Mantenidas:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Búsqueda global en todos los campos</li>
              <li>• Filtrado por estado (Activo, Completado, En Proceso, Pendiente)</li>
              <li>• Ordenamiento por diferentes campos</li>
              <li>• Exportación a Excel y CSV</li>
              <li>• Vista detallada de correctivos</li>
              <li>• Paginación local para navegación</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Lista de Correctivos */}
      <CorrectiveModal 
        open={correctiveModalOpen}
        onOpenChange={setCorrectiveModalOpen}
      />

      {/* Modal de Creación de Correctivos */}
      <CreateCorrectiveModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCorrectiveCreated={handleCorrectiveCreated}
      />
    </div>
  );
}
