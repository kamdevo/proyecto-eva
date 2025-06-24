import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Asume que shadcn/ui está configurado
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Filter,
  Plus,
  FileText,
  Users,
  Wrench,
  Eye,
  Calendar,
  Settings,
  Trash2,
  Edit,
  Search,
  Building,
  Cog,
  Truck,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Datos de ejemplo para simular el inventario de repuestos
const initialRepuestos = [
  {
    id: 1,
    name: "Filtro de Aceite (Motor)",
    code: "FIL001",
    grupo: "Motor",
    cantidad: 120,
    precio: 15.5,
    status: 1,
    created_at: "2023-01-15",
  },
  {
    id: 2,
    name: "Pastillas de Freno Delanteras",
    code: "FRE005",
    grupo: "Frenos",
    cantidad: 45,
    precio: 35.75,
    status: 1,
    created_at: "2023-02-20",
  },
  {
    id: 3,
    name: "Batería 12V (70Ah)",
    code: "BAT010",
    grupo: "Eléctrico",
    cantidad: 15,
    precio: 90.0,
    status: 1,
    created_at: "2023-03-01",
  },
  {
    id: 4,
    name: "Bujía Iridium",
    code: "BUJ003",
    grupo: "Motor",
    cantidad: 200,
    precio: 8.2,
    status: 1,
    created_at: "2023-03-10",
  },
  {
    id: 5,
    name: "Amortiguador Trasero",
    code: "AMO012",
    grupo: "Suspensión",
    cantidad: 8,
    precio: 120.0,
    status: 1,
    created_at: "2023-04-05",
  },
  {
    id: 6,
    name: "Aceite de Motor Sintético 5W-30",
    code: "ACE007",
    grupo: "Líquidos",
    cantidad: 60,
    precio: 45.0,
    status: 1,
    created_at: "2023-04-22",
  },
  {
    id: 7,
    name: "Faro Delantero Izquierdo",
    code: "FAR021",
    grupo: "Iluminación",
    cantidad: 3,
    precio: 180.0,
    status: 0,
    created_at: "2023-05-01",
  },
  {
    id: 8,
    name: "Neumático Radial 185/65R15",
    code: "NEU015",
    grupo: "Ruedas",
    cantidad: 22,
    precio: 75.0,
    status: 1,
    created_at: "2023-05-18",
  },
  {
    id: 9,
    name: "Correa de Distribución",
    code: "COR001",
    grupo: "Motor",
    cantidad: 10,
    precio: 60.0,
    status: 1,
    created_at: "2023-06-05",
  },
  {
    id: 10,
    name: "Filtro de Combustible",
    code: "FIC002",
    grupo: "Combustible",
    cantidad: 80,
    precio: 22.0,
    status: 1,
    created_at: "2023-06-25",
  },
];

function RepuestosView() {
  const [repuestos, setRepuestos] = useState(initialRepuestos);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterQuantity, setFilterQuantity] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRepuesto, setCurrentRepuesto] = useState(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [repuestoToDelete, setRepuestoToDelete] = useState(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [repuestoToAdjust, setRepuestoToAdjust] = useState(null);
  const [adjustQuantityValue, setAdjustQuantityValue] = useState("");

  // Obtener todos los grupos únicos para el filtro
  const uniqueGroups = [
    "All",
    ...new Set(initialRepuestos.map((r) => r.grupo)),
  ];

  // Lógica de filtrado y búsqueda
  const filteredRepuestos = repuestos.filter((repuesto) => {
    const matchesSearch =
      repuesto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repuesto.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup =
      filterGroup === "All" || repuesto.grupo === filterGroup;

    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && repuesto.status === 1) ||
      (filterStatus === "Inactive" && repuesto.status === 0);

    const matchesQuantity =
      filterQuantity === "All" ||
      (filterQuantity === "LowStock" && repuesto.cantidad < 10) || // Ejemplo de umbral de stock bajo
      (filterQuantity === "Available" && repuesto.cantidad >= 10);

    return matchesSearch && matchesGroup && matchesStatus && matchesQuantity;
  });

  // Funciones de acción (simuladas)
  const handleAddRepuesto = () => {
    setCurrentRepuesto(null); // Para un nuevo registro
    setIsModalOpen(true);
  };

  const handleEditRepuesto = (repuesto) => {
    setCurrentRepuesto(repuesto); // Para editar un registro existente
    setIsModalOpen(true);
  };

  const handleDeleteRepuesto = (id) => {
    setRepuestoToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = () => {
    if (repuestoToDelete !== null) {
      setRepuestos(repuestos.filter((r) => r.id !== repuestoToDelete));
      console.log(`Repuesto con ID ${repuestoToDelete} eliminado (simulado).`);
      setRepuestoToDelete(null);
      setIsConfirmModalOpen(false);
    }
  };

  const handleAdjustStock = (repuesto) => {
    setRepuestoToAdjust(repuesto);
    setAdjustQuantityValue(repuesto.cantidad.toString()); // Inicializar con la cantidad actual
    setIsAdjustModalOpen(true);
  };

  const confirmAdjustStock = () => {
    if (
      repuestoToAdjust &&
      adjustQuantityValue !== null &&
      !isNaN(Number(adjustQuantityValue)) &&
      Number(adjustQuantityValue) >= 0
    ) {
      setRepuestos((repps) =>
        repps.map((r) =>
          r.id === repuestoToAdjust.id
            ? { ...r, cantidad: Number(adjustQuantityValue) }
            : r
        )
      );
      console.log(
        `Cantidad de ${repuestoToAdjust.name} ajustada a ${adjustQuantityValue} (simulado).`
      );
      setRepuestoToAdjust(null);
      setAdjustQuantityValue("");
      setIsAdjustModalOpen(false);
    } else {
      console.error(
        "Cantidad inválida. Por favor, introduce un número positivo."
      ); // Usar shadcn/ui toast/dialog en una aplicación real
    }
  };

  const handleSaveRepuesto = (formData) => {
    if (currentRepuesto) {
      // Editar
      setRepuestos(
        repuestos.map((r) =>
          r.id === formData.id ? { ...formData, id: r.id } : r
        )
      );
      console.log("Repuesto actualizado (simulado).");
    } else {
      // Añadir
      const newId = Math.max(...repuestos.map((r) => r.id)) + 1;
      setRepuestos([
        ...repuestos,
        {
          ...formData,
          id: newId,
          created_at: new Date().toISOString().slice(0, 10),
          status: 1,
        },
      ]);
      console.log("Repuesto añadido (simulado).");
    }
    setIsModalOpen(false);
  };

  // Componente Modal de Formulario
  const RepuestoFormModal = ({ isOpen, onClose, repuesto, onSave }) => {
    const [formData, setFormData] = useState(
      repuesto || { name: "", code: "", grupo: "", cantidad: "", precio: "" }
    );

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>
              {repuesto ? "Editar Repuesto" : "Añadir Nuevo Repuesto"}
            </DialogTitle>
            <DialogDescription>
              {repuesto
                ? "Modifica los detalles del repuesto."
                : "Añade un nuevo repuesto al inventario."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  Código
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grupo" className="text-right">
                  Grupo
                </Label>
                <Select
                  name="grupo"
                  value={formData.grupo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, grupo: value })
                  }
                  required
                >
                  <SelectTrigger className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Selecciona un grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Se eliminó SelectItem value="" para evitar el error */}
                    {uniqueGroups
                      .filter((g) => g !== "All")
                      .map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cantidad" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="cantidad"
                  name="cantidad"
                  type="number"
                  value={formData.cantidad}
                  onChange={handleChange}
                  className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="precio" className="text-right">
                  Precio
                </Label>
                <Input
                  id="precio"
                  name="precio"
                  type="number"
                  value={formData.precio}
                  onChange={handleChange}
                  className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-md bg-blue-600 hover:bg-blue-700 text-white"
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  // Componente Modal para Ajustar Stock
  const AdjustStockModal = ({
    isOpen,
    onClose,
    repuesto,
    onConfirm,
    currentQuantity,
    onQuantityChange,
  }) => {
    if (!isOpen || !repuesto) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Ajustar Stock para {repuesto.name}</DialogTitle>
            <DialogDescription>
              Cantidad actual: {repuesto.cantidad}. Introduce la nueva cantidad.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="adjust-quantity" className="text-right">
                Nueva Cantidad
              </Label>
              <Input
                id="adjust-quantity"
                type="number"
                value={currentQuantity}
                onChange={(e) => onQuantityChange(e.target.value)}
                className="col-span-3 rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Componente Modal de Confirmación de Eliminación
  const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este repuesto? Esta acción
              no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="rounded-md bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      {" "}
      {/* Fondo claro fuera del contenido principal */}
      {/* Contenido Principal */}
      <div className="max-w-full mx-auto bg-white p-6 rounded-lg shadow-xl border border-gray-200">
        {" "}
        {/* Contenedor blanco principal, sin sidebar */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          {" "}
          {/* Border inferior al header */}
          <h1 className="text-2xl font-bold text-gray-800">
            Inventario General de Repuestos
          </h1>{" "}
          {/* Ajuste de tamaño de título */}
          <div className="flex items-center text-gray-600 text-sm">
            {" "}
            {/* Ajuste de tamaño de texto de Administrador */}
            <svg
              className="h-5 w-5 mr-2 text-gray-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              ></path>
            </svg>
            <span>Administrador</span>
          </div>
        </div>
        {/* Grupo de botones tipo tabs simulado */}
        <div className="mb-6 flex space-x-2 border-b border-gray-200 pb-4">
          {" "}
          {/* Border inferior a los botones de tabs */}
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 active-tab-button"
          >
            {" "}
            + Registrar
          </Button>{" "}
          {/* Clase activa para el look */}
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Depurar
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Consolidar
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Preventivos
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Calibraciones
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Correctivos
          </Button>
          <Button
            variant="outline"
            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Reportes
          </Button>
        </div>
        {/* Barra de Búsqueda y Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          {" "}
          {/* Fondo blanco y border */}
          <div className="col-span-1">
            <Label
              htmlFor="search"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Buscar (Nombre/Código)
            </Label>
            <Input
              type="text"
              id="search"
              placeholder="Buscar repuesto..."
              className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Label
              htmlFor="filterGroup"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Grupo
            </Label>
            <Select
              id="filterGroup"
              value={filterGroup}
              onValueChange={setFilterGroup}
            >
              <SelectTrigger className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Todos los Grupos" />
              </SelectTrigger>
              <SelectContent>
                {uniqueGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group === "All" ? "Todos los Grupos" : group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label
              htmlFor="filterStatus"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Estado
            </Label>
            <Select
              id="filterStatus"
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Todos los Estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todos los Estados</SelectItem>
                <SelectItem value="Active">Activo</SelectItem>
                <SelectItem value="Inactive">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <Label
              htmlFor="filterQuantity"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Filtrar por Cantidad
            </Label>
            <Select
              id="filterQuantity"
              value={filterQuantity}
              onValueChange={setFilterQuantity}
            >
              <SelectTrigger className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Todas las Cantidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Todas las Cantidades</SelectItem>
                <SelectItem value="LowStock">
                  Stock Bajo (menos de 10)
                </SelectItem>
                <SelectItem value="Available">En Stock (10 o más)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Acciones Globales */}
        <div className="mb-6 flex justify-end">
          <Button
            onClick={handleAddRepuesto}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out flex items-center space-x-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Añadir Nuevo Repuesto</span>
          </Button>
        </div>
        {/* Tabla Principal de Inventario */}
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <Table>
            <TableHeader className="bg-gray-100">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">
                  ID
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Nombre
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Código
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Grupo
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Cantidad
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Precio
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Estado
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Fecha Creación
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-200">
              {filteredRepuestos.length > 0 ? (
                filteredRepuestos.map((repuesto) => (
                  <TableRow key={repuesto.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {repuesto.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repuesto.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repuesto.code}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repuesto.grupo}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          repuesto.cantidad < 10
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {repuesto.cantidad}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      ${repuesto.precio.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          repuesto.status === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {repuesto.status === 1 ? "Activo" : "Inactivo"}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repuesto.created_at}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center gap-1">
                        <Button
                          onClick={() => handleEditRepuesto(repuesto)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleAdjustStock(repuesto)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteRepuesto(repuesto.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan="9"
                    className="h-24 text-center text-gray-500"
                  >
                    No se encontraron repuestos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {/* Modals */}
      <RepuestoFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        repuesto={currentRepuesto}
        onSave={handleSaveRepuesto}
      />
      <ConfirmDeleteDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
      />
      <AdjustStockModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        repuesto={repuestoToAdjust}
        onConfirm={confirmAdjustStock}
        currentQuantity={adjustQuantityValue}
        onQuantityChange={setAdjustQuantityValue}
      />
    </div>
  );
}

export default RepuestosView;
