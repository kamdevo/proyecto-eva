"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, ChevronLeft, ChevronRight, List } from "lucide-react";
import { Input } from "@/components/ui/input";

// Datos de ejemplo de equipos biomédicos
const equiposBiomedicos = [
  {
    id: "CAMA ELECTROMECANICA",
    nombre: "CAMA ELECTROMECANICA",
    estado: "ACTIVO",
    fecha: "Feb 16,19",
    tipo: "CAMA ELECTROMECANICA",
  },
  {
    id: "CAMA ELECTROMECANICA",
    nombre: "CAMA ELECTROMECANICA",
    estado: "ACTIVO",
    fecha: "Feb 16,19",
    tipo: "CAMA ELECTROMECANICA",
  },
  {
    id: "CAMA ELECTROMECANICA",
    nombre: "CAMA ELECTROMECANICA",
    estado: "ACTIVO",
    fecha: "Feb 16,19",
    tipo: "CAMA ELECTROMECANICA",
  },
  {
    id: "CAMA ELECTROMECANICA",
    nombre: "CAMA ELECTROMECANICA",
    estado: "ACTIVO",
    fecha: "Feb 16,19",
    tipo: "CAMA ELECTROMECANICA",
  },
  {
    id: "CAMA ELECTROMECANICA",
    nombre: "CAMA ELECTROMECANICA",
    estado: "ACTIVO",
    fecha: "Feb 16,19",
    tipo: "CAMA ELECTROMECANICA",
  },
];
function ModalTablaEquipos({ open, onOpenChange, document }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 5;

  // Filtrar equipos según término de búsqueda
  const filteredEquipos = equiposBiomedicos.filter((equipo) =>
    equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredEquipos.slice(startIndex, endIndex);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="w-full">
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-blue-600 border-b border-blue-200 pb-2">
            Equipos
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Barra de búsqueda */}
          <div className="mb-4">
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="max-w-sm"
            />
          </div>

          {/* Tabla */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium">ID</TableHead>
                  <TableHead className="font-medium">Nombre</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                  <TableHead className="font-medium">Fecha</TableHead>
                  <TableHead className="font-medium">Editar</TableHead>
                  <TableHead className="font-medium">Tipo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((equipo, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-sm">
                      {equipo.id}
                    </TableCell>
                    <TableCell className="text-sm">{equipo.nombre}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        {equipo.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{equipo.fecha}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm">{equipo.tipo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Paginación */}
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredEquipos.length)} of{" "}
                {filteredEquipos.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalTablaEquipos;
