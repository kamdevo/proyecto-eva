"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Eye, Search, RotateCcw } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios";
import { useRoles, useEmpresas, useSedes } from "../hooks/useRoles";
import { useCentrosCosto } from "../hooks/useCentrosCosto";
import { usePermisos } from "../hooks/usePermisos";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Usuarios() {
  // Hooks para datos reales
  const {
    usuarios,
    loading: usuariosLoading,
    error: usuariosError,
    pagination,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuario,
    changePage,
    changePageSize,
    searchUsuarios,
    refresh: refreshUsuarios,
  } = useUsuarios();

  const { roles, loading: rolesLoading } = useRoles();
  const { empresas, loading: empresasLoading } = useEmpresas();
  const { sedes, loading: sedesLoading } = useSedes();
  const { centros, loading: centrosLoading } = useCentrosCosto();
  const {
    modulos,
    fetchUserPermissions,
    updatePermission,
    createDefaultPermissions,
    resetModulePermissions,
    fetchModuleStats,
  } = usePermisos();

  // Estados para modales y UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRelationModalOpen, setIsRelationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [relationToDelete, setRelationToDelete] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isViewUserModalOpen, setIsViewUserModalOpen] = useState(false);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [moduleStats, setModuleStats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addUserForm, setAddUserForm] = useState({
    nombre: "",
    apellidos: "",
    telefono: "",
    email: "",
    username: "",
    password: "",
    rol: "",
    centroCosto: "",
    empresa: "",
  });
  const [addRelationForm, setAddRelationForm] = useState({
    nombreZona: "",
    zona: "",
  });
  const [permissions, setPermissions] = useState({
    usuarios: { leer: false, escribir: false, crear: false, actualizar: false },
    equipos: { leer: false, escribir: false, crear: false, actualizar: false },
    planes: { leer: false, escribir: false, crear: false, actualizar: false },
    ordenes: { leer: false, escribir: false, crear: false, actualizar: false },
    solicitudes: {
      leer: false,
      escribir: false,
      crear: false,
      actualizar: false,
    },
    capacitaciones: {
      leer: false,
      escribir: false,
      crear: false,
      actualizar: false,
    },
    dashboards: {
      leer: false,
      escribir: false,
      crear: false,
      actualizar: false,
    },
    configuracion: {
      leer: false,
      escribir: false,
      crear: false,
      actualizar: false,
    },
    administracion: {
      leer: false,
      escribir: false,
      crear: false,
      actualizar: false,
    },
  });

  // Cargar estadísticas de módulos al montar el componente
  useEffect(() => {
    const loadModuleStats = async () => {
      try {
        const stats = await fetchModuleStats();
        setModuleStats(stats);
      } catch (error) {
        console.error("Error loading module stats:", error);
      }
    };

    loadModuleStats();
  }, [fetchModuleStats]);

  // Funciones para manejar usuarios
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim()) {
      searchUsuarios(value);
    } else {
      refreshUsuarios();
    }
  };

  const handlePageChange = (page) => {
    changePage(page);
  };

  const handlePageSizeChange = (size) => {
    changePageSize(parseInt(size));
  };

  // Datos de relación zonas-usuarios
  const zoneRelationsData = [
    {
      id: 1,
      nombre_zona: "uci",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 2,
      nombre_zona: "consultorios",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 3,
      nombre_zona: "consultorios",
      nombre_usuario: "natalia",
      correo_electronico: "mantenimientobiomedicalhuila@gmail.com",
    },
    {
      id: 4,
      nombre_zona: "consultorios",
      nombre_usuario: "angelica maria",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 5,
      nombre_zona: "zonasangelica",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 6,
      nombre_zona: "zonaguillermo",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 7,
      nombre_zona: "consultorios",
      nombre_usuario: "administrador",
      correo_electronico: "pedroalejo@gmail.com",
    },
    {
      id: 8,
      nombre_zona: "zonasangelica",
      nombre_usuario: "juan sebastian",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 9,
      nombre_zona: "zonasangelica",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 10,
      nombre_zona: "consultorios",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 11,
      nombre_zona: "zonasangelica",
      nombre_usuario: "dayana raigosa",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 12,
      nombre_zona: "consultorios",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
    {
      id: 13,
      nombre_zona: "consultorios",
      nombre_usuario: "julio cesar",
      correo_electronico: "electromedicalhuila@gmail.com",
    },
  ];

  // Datos de empresas y usuarios pertenecientes
  const companyUsersData = [
    {
      empresa: "HUV",
      usuarios: "Eva123 (eva123), Jhon Henry (jsaa)",
    },
    {
      empresa: "SYSMED",
      usuarios: "Sysmed (sysmedhuv)",
    },
    {
      empresa: "HUV MANTENIMIENTO BIOMEDICO ADMINISTRATIVO",
      usuarios:
        "Administrador (admin), Juan Sebastian (juangonza123), Aura María (Biomedica4), Angelica Maria (bioingeniera), Natalia (natalia.pedrerosa), Dayana Raigosa (daya), JULIO CESAR (julio0126), ingeniero mantenimiento (biomedicahuvnorte), Alejandro (alejandro.soporte), CESAR AUGUSTO (electromedicinahuv5), Karen Sofia (electromedicina2), Central de Gases (centralgases)",
    },
    {
      empresa: "HUV MANTENIMIENTO INDUSTRIAL ADMINISTRATIVO",
      usuarios: "JesicA (jesica), Lenker (jefemantenimiento)",
    },
    {
      empresa: "JOMEDICAL",
      usuarios: "Servicio tecnico (jomedical)",
    },
    {
      empresa: "TÉCNICOS MANTENIMIENTO BIOMEDICO",
      usuarios: "",
    },
    {
      empresa: "TÉCNICOS MANTENIMIENTO INDUSTRIAL",
      usuarios: "",
    },
    {
      empresa: "MAQUET",
      usuarios: "",
    },
    {
      empresa: "KAIKA",
      usuarios: "",
    },
    {
      empresa: "GENERAL ELECTRIC",
      usuarios: "",
    },
    {
      empresa: "TERUMO BCT",
      usuarios: "",
    },
    {
      empresa: "BIOTRONITECH",
      usuarios: "",
    },
    {
      empresa: "OLYMPUS",
      usuarios: "",
    },
    {
      empresa: "SIEMENS",
      usuarios: "",
    },
    {
      empresa: "ARROW",
      usuarios: "",
    },
    {
      empresa: "GILMEDICA",
      usuarios: "Empresa Gilmedica (gilmedica), gilmedica (gilmedica 2)",
    },
    {
      empresa: "JAPG",
      usuarios: "",
    },
    {
      empresa: "PHILIPS",
      usuarios: "",
    },
    {
      empresa: "STRYKER",
      usuarios: "",
    },
    {
      empresa: "BAXTER",
      usuarios: "baxter1 (baxter_tickets), baxter2 (baxter2)",
    },
    {
      empresa: "G&C",
      usuarios: "",
    },
    {
      empresa: "QUIRURGIL",
      usuarios: "",
    },
    {
      empresa: "G&C medical",
      usuarios: "",
    },
    {
      empresa: "MEDTRONIC",
      usuarios: "",
    },
    {
      empresa: "ALCON",
      usuarios: "",
    },
    {
      empresa: "ARBOLEDA EQUIPOS",
      usuarios: "",
    },
    {
      empresa: "MANTENIMIENTO BIOMEDICO E INDUSTRIAL",
      usuarios: "LAURA (LauGomez), LAURA (Biomedicanorte)",
    },
    {
      empresa: "MEDITEC S.A.",
      usuarios: "",
    },
    {
      empresa: "INVERMEDICA",
      usuarios: "",
    },
    {
      empresa: "ARBOLEDA",
      usuarios: "Arboleda (Arboleda equipos)",
    },
    {
      empresa: "SANITAS",
      usuarios: "",
    },
    {
      empresa: "JRESPTREPO",
      usuarios: "",
    },
    {
      empresa: "LAB BRAND",
      usuarios: "",
    },
    {
      empresa: "GBARCO",
      usuarios: "",
    },
    {
      empresa: "AGFA",
      usuarios: "",
    },
    {
      empresa: "EQUITRONIC",
      usuarios: "",
    },
    {
      empresa: "OTIS",
      usuarios: "",
    },
    {
      empresa: "SCHINDLER",
      usuarios: "",
    },
    {
      empresa: "C4PASCAL",
      usuarios: "",
    },
    {
      empresa: "GENECOL S.A.S",
      usuarios: "",
    },
    {
      empresa: "GENERAL ELECTROMEDICAL S.A.S",
      usuarios: "",
    },
    {
      empresa: "KAESER COMPRESORES DE COLOMBIA",
      usuarios: "",
    },
    {
      empresa: "GECOLSA",
      usuarios: "",
    },
    {
      empresa: "EQUIPOS Y LABORATORIOS S.A.S",
      usuarios: "",
    },
    {
      empresa: "MEQ",
      usuarios: "",
    },
    {
      empresa: "Jhonson & Jhonson",
      usuarios: "",
    },
    {
      empresa: "SH",
      usuarios: "",
    },
    {
      empresa: "BIMEDCO",
      usuarios: "",
    },
    {
      empresa: "INTERNATIONAL NUCLEAR INDUSTRY",
      usuarios: "",
    },
    {
      empresa: "EQUIPADORA MEDICA",
      usuarios: "",
    },
    {
      empresa: "QUIMBERLAB",
      usuarios: "",
    },
    {
      empresa: "Bioin",
      usuarios: "",
    },
    {
      empresa: "MEDICAH",
      usuarios: "",
    },
    {
      empresa: "GASES MEDICINALES (MESSER)",
      usuarios: "",
    },
    {
      empresa: "DILASER",
      usuarios: "",
    },
    {
      empresa: "J&C MEDICAL SAS",
      usuarios: "",
    },
    {
      empresa: "Becton Dickinson",
      usuarios: "",
    },
    {
      empresa: "PROGYNE S.A.S",
      usuarios: "",
    },
    {
      empresa: "RP MEDICAS",
      usuarios: "",
    },
    {
      empresa: "GS MED IMAGING",
      usuarios: "",
    },
  ];

  const getRoleColor = (rol) => {
    const roleName = typeof rol === "object" ? rol.nombre : rol;
    switch (roleName?.toLowerCase()) {
      case "administrador":
      case "admin":
        return "bg-red-100 text-red-800";
      case "técnico":
      case "tecnico":
        return "bg-green-100 text-green-800";
      case "supervisor":
        return "bg-yellow-100 text-yellow-800";
      case "usuario normal":
      case "usuario":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };

  const handleDeleteRelation = (relation) => {
    setRelationToDelete(relation);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUsuario(userToDelete.id);
        setUserToDelete(null);
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        alert("Error al eliminar usuario: " + error.message);
      }
    }
  };

  const confirmDeleteRelation = () => {
    console.log("Eliminando relación:", relationToDelete);
    setRelationToDelete(null);
  };

  const handleAddUserInputChange = (field, value) => {
    setAddUserForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRelationInputChange = (field, value) => {
    setAddRelationForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = async (
    accionId,
    permissionType,
    currentValue
  ) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      await updatePermission(accionId, permissionType, newValue);

      // Actualizar permisos locales
      setUserPermissions((prev) =>
        prev.map((perm) =>
          perm.id === accionId ? { ...perm, [permissionType]: newValue } : perm
        )
      );
    } catch (error) {
      console.error("Error updating permission:", error);
      alert("Error al actualizar permiso: " + error.message);
    }
  };

  const handleViewUser = async (user) => {
    try {
      const fullUser = await getUsuario(user.id);
      setSelectedUser(fullUser);
      setIsViewUserModalOpen(true);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      alert("Error al obtener detalles del usuario");
    }
  };

  const handleEditUser = async (user) => {
    try {
      const fullUser = await getUsuario(user.id);
      setSelectedUser(fullUser);

      // Cargar permisos del usuario
      const permissions = await fetchUserPermissions(user.id);
      setUserPermissions(permissions);

      setAddUserForm({
        nombre: fullUser.nombre || "",
        apellidos: fullUser.apellido || "",
        telefono: fullUser.telefono || "",
        email: fullUser.email || "",
        username: fullUser.username || "",
        password: "",
        rol: fullUser.rol_id || "",
        centroCosto: fullUser.centro_id || "",
        empresa: fullUser.id_empresa || "",
      });
      setIsEditUserModalOpen(true);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      alert("Error al obtener detalles del usuario");
    }
  };

  const handleSubmitAddUser = async () => {
    try {
      const userData = {
        nombre: addUserForm.nombre,
        apellido: addUserForm.apellidos,
        telefono: addUserForm.telefono,
        email: addUserForm.email,
        username: addUserForm.username,
        password: addUserForm.password,
        rol_id: parseInt(addUserForm.rol),
        centro_id: addUserForm.centroCosto,
        id_empresa: parseInt(addUserForm.empresa) || 1,
        estado: 1,
        active: "true",
      };

      await createUsuario(userData);

      setIsAddUserModalOpen(false);
      setAddUserForm({
        nombre: "",
        apellidos: "",
        telefono: "",
        email: "",
        username: "",
        password: "",
        rol: "",
        centroCosto: "",
        empresa: "",
      });
    } catch (error) {
      console.error("Error creando usuario:", error);
      alert("Error al crear usuario: " + error.message);
    }
  };

  const handleSubmitEditUser = async () => {
    try {
      const userData = {
        nombre: addUserForm.nombre,
        apellido: addUserForm.apellidos,
        telefono: addUserForm.telefono,
        email: addUserForm.email,
        username: addUserForm.username,
        rol_id: parseInt(addUserForm.rol),
        centro_id: addUserForm.centroCosto,
        id_empresa: parseInt(addUserForm.empresa) || 1,
      };

      if (addUserForm.password) {
        userData.password = addUserForm.password;
      }

      await updateUsuario(selectedUser.id, userData);
      setIsEditUserModalOpen(false);
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      alert("Error al actualizar usuario: " + error.message);
    }
  };

  const handleSubmitAddRelation = () => {
    console.log("Agregando relación:", addRelationForm);
    setIsAddRelationModalOpen(false);
    setAddRelationForm({ nombreZona: "", zona: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-slate-200 mt-1">Gestión de usuarios del sistema</p>
        </div>

        {/* Main Users Section */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Usuarios
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Gestiona todos los usuarios del sistema
                </p>
              </div>
              <Dialog
                open={isAddUserModalOpen}
                onOpenChange={setIsAddUserModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
                      Agregar
                    </DialogTitle>
                    <DialogDescription className="text-lg font-medium text-gray-700 mt-4">
                      usuario
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Nombre Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Nombre
                        </Label>
                        <Input
                          placeholder="Ingrese el nombre"
                          value={addUserForm.nombre}
                          onChange={(e) =>
                            handleAddUserInputChange("nombre", e.target.value)
                          }
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>

                      {/* Apellidos Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Apellidos
                        </Label>
                        <Input
                          placeholder="Ingrese los apellidos"
                          value={addUserForm.apellidos}
                          onChange={(e) =>
                            handleAddUserInputChange(
                              "apellidos",
                              e.target.value
                            )
                          }
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>

                      {/* Teléfono Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Teléfono
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">📞</span>
                          </div>
                          <Input
                            placeholder="Número de teléfono"
                            value={addUserForm.telefono}
                            onChange={(e) =>
                              handleAddUserInputChange(
                                "telefono",
                                e.target.value
                              )
                            }
                            className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">@</span>
                          </div>
                          <Input
                            placeholder="correo@ejemplo.com"
                            type="email"
                            value={addUserForm.email}
                            onChange={(e) =>
                              handleAddUserInputChange("email", e.target.value)
                            }
                            className="h-11 pl-8 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Usaremos este email para notificaciones
                        </p>
                      </div>

                      {/* Username Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Username <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">👤</span>
                          </div>
                          <Input
                            placeholder="nombre_usuario"
                            value={addUserForm.username}
                            onChange={(e) =>
                              handleAddUserInputChange(
                                "username",
                                e.target.value
                              )
                            }
                            className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 text-sm">🔒</span>
                          </div>
                          <Input
                            placeholder="Contraseña segura"
                            type="password"
                            value={addUserForm.password}
                            onChange={(e) =>
                              handleAddUserInputChange(
                                "password",
                                e.target.value
                              )
                            }
                            className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Rol Select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Rol <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={addUserForm.rol}
                          onValueChange={(value) =>
                            handleAddUserInputChange("rol", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                            <SelectValue placeholder="Seleccione un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {rolesLoading ? (
                              <SelectItem value="" disabled>
                                Cargando roles...
                              </SelectItem>
                            ) : (
                              roles.map((rol) => (
                                <SelectItem
                                  key={rol.id}
                                  value={rol.id.toString()}
                                >
                                  {rol.nombre}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Centro de Costo Select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Centro de Costo{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={addUserForm.centroCosto}
                          onValueChange={(value) =>
                            handleAddUserInputChange("centroCosto", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                            <SelectValue placeholder="Seleccione un centro de costo" />
                          </SelectTrigger>
                          <SelectContent>
                            {centrosLoading ? (
                              <SelectItem value="" disabled>
                                Cargando centros...
                              </SelectItem>
                            ) : (
                              centros.map((centro) => (
                                <SelectItem
                                  key={centro.id}
                                  value={centro.id.toString()}
                                >
                                  {centro.nombre}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Empresa Select */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Empresa
                        </Label>
                        <Select
                          value={addUserForm.empresa}
                          onValueChange={(value) =>
                            handleAddUserInputChange("empresa", value)
                          }
                        >
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                            <SelectValue placeholder="Seleccione una empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresasLoading ? (
                              <SelectItem value="" disabled>
                                Cargando empresas...
                              </SelectItem>
                            ) : (
                              empresas.map((empresa) => (
                                <SelectItem
                                  key={empresa.id}
                                  value={empresa.id.toString()}
                                >
                                  {empresa.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button
                      onClick={handleSubmitAddUser}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      Ingresar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Search and Pagination Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Mostrar</span>
                <Select
                  value={pagination.per_page.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">
                  registros por página
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshUsuarios}
                className="ml-auto"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading State */}
            {usuariosLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Cargando usuarios...</span>
              </div>
            )}

            {/* Error State */}
            {usuariosError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">Error: {usuariosError}</p>
              </div>
            )}

            {/* Users Table */}
            {!usuariosLoading && !usuariosError && (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-semibold text-gray-900">
                        ID
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Nombre y Apellidos
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Centro de Costo
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Login
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900">
                        Rol
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 text-center">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No se encontraron usuarios
                        </TableCell>
                      </TableRow>
                    ) : (
                      usuarios.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50">
                          <TableCell className="text-gray-600">
                            {user.id}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {user.nombre} {user.apellido}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.centro?.name || user.centro || "Sin asignar"}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {user.username}
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(user.rol)}>
                              {typeof user.rol === "object"
                                ? user.rol.nombre
                                : user.rol || "Sin rol"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditUser(user)}
                                className="w-8 h-8 p-0 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Editar usuario"
                              >
                                <Pencil className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewUser(user)}
                                className="w-8 h-8 p-0 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Examinar usuario"
                              >
                                <Eye className="h-4 w-4 text-white" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteUser(user)}
                                className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4 text-white" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {!usuariosLoading && !usuariosError && usuarios.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Mostrando{" "}
                  {(pagination.current_page - 1) * pagination.per_page + 1} a{" "}
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total
                  )}{" "}
                  de {pagination.total} usuarios
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(pagination.current_page - 1)
                    }
                    disabled={pagination.current_page <= 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-gray-600">
                    Página {pagination.current_page} de {pagination.last_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handlePageChange(pagination.current_page + 1)
                    }
                    disabled={pagination.current_page >= pagination.last_page}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modules Management Section */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Gestión de Módulos
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Administra permisos por módulo del sistema
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Modules Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Módulo
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Usuarios con Acceso
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        No se encontraron módulos
                      </TableCell>
                    </TableRow>
                  ) : (
                    modulos.map((modulo) => {
                      const stats =
                        moduleStats.find((s) => s.id === modulo.id) || {};
                      return (
                        <TableRow key={modulo.id} className="hover:bg-gray-50">
                          <TableCell className="text-gray-600">
                            {modulo.id}
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {modulo.name}
                          </TableCell>
                          <TableCell className="text-gray-600">
                            {stats.usuarios_con_acceso || 0} usuarios
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  resetModulePermissions(modulo.id)
                                }
                                className="w-auto h-8 px-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-all duration-200 hover:shadow-md"
                                title="Restablecer permisos del módulo"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restablecer
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Zone Relations Section */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Relación zonas - usuarios
              </CardTitle>
              <Dialog
                open={isAddRelationModalOpen}
                onOpenChange={setIsAddRelationModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Nueva relación
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
                      Agregar
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Nombre de la zona{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">🏢</span>
                        </div>
                        <Input
                          placeholder="Ingrese el nombre de la zona"
                          value={addRelationForm.nombreZona}
                          onChange={(e) =>
                            handleAddRelationInputChange(
                              "nombreZona",
                              e.target.value
                            )
                          }
                          className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Zona <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={addRelationForm.zona}
                        onValueChange={(value) =>
                          handleAddRelationInputChange("zona", value)
                        }
                      >
                        <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                          <SelectValue placeholder="Seleccione una zona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="uci">UCI</SelectItem>
                          <SelectItem value="consultorios">
                            Consultorios
                          </SelectItem>
                          <SelectItem value="zonasangelica">
                            Zonas Angelica
                          </SelectItem>
                          <SelectItem value="zonaguillermo">
                            Zona Guillermo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Seleccione la zona donde trabajará el usuario
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button
                      onClick={handleSubmitAddRelation}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddRelationModalOpen(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
                    >
                      Cerrar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      nombre de la zona
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      nombre del usuario
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      correo electrónico
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zoneRelationsData.map((relation) => (
                    <TableRow key={relation.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {relation.nombre_zona}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {relation.nombre_usuario}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {relation.correo_electronico}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleDeleteRelation(relation)}
                            className="w-8 h-8 p-0 bg-red-500 hover:bg-red-600 rounded-lg"
                          >
                            <X className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Company Users Section */}
        <Card className="shadow-sm border-0">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Empresas y Usuarios Pertenecientes
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Relación de empresas con sus usuarios asignados
            </p>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900 w-1/3">
                      Empresa
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900">
                      Usuarios pertenecientes
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyUsersData.map((company, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900 border-r border-gray-200">
                        {company.empresa}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {company.usuarios || (
                          <span className="text-gray-400 italic">
                            Sin usuarios asignados
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-blue-600 border-b-2 border-blue-600 pb-2">
              Actualizar
            </DialogTitle>
            <DialogDescription className="text-lg font-medium text-gray-700 mt-4">
              usuario
            </DialogDescription>
          </DialogHeader>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                value={addUserForm.nombre}
                onChange={(e) =>
                  handleAddUserInputChange("nombre", e.target.value)
                }
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Nombre del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Apellidos <span className="text-red-500">*</span>
              </Label>
              <Input
                value={addUserForm.apellidos}
                onChange={(e) =>
                  handleAddUserInputChange("apellidos", e.target.value)
                }
                className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                placeholder="Apellidos del usuario"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Teléfono
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">📞</span>
                </div>
                <Input
                  value={addUserForm.telefono}
                  onChange={(e) =>
                    handleAddUserInputChange("telefono", e.target.value)
                  }
                  className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">@</span>
                </div>
                <Input
                  type="email"
                  value={addUserForm.email}
                  onChange={(e) =>
                    handleAddUserInputChange("email", e.target.value)
                  }
                  className="h-11 pl-8 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">👤</span>
                </div>
                <Input
                  value={addUserForm.username}
                  onChange={(e) =>
                    handleAddUserInputChange("username", e.target.value)
                  }
                  className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="nombre_usuario"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">🔒</span>
                </div>
                <Input
                  type="password"
                  value={addUserForm.password}
                  onChange={(e) =>
                    handleAddUserInputChange("password", e.target.value)
                  }
                  className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                  placeholder="Nueva contraseña (opcional)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={addUserForm.rol}
                onValueChange={(value) =>
                  handleAddUserInputChange("rol", value)
                }
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="administrador">Administrador</SelectItem>
                  <SelectItem value="usuario">Usuario</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Centro de Costo{" "}
                <span className="text-gray-400">(Opcional)</span>
              </Label>
              <Input
                value={addUserForm.centroCosto}
                onChange={(e) =>
                  handleAddUserInputChange("centroCosto", e.target.value)
                }
                className="h-11 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
                placeholder="Código del centro de costo"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700">
                Empresa
              </Label>
              <Select
                value={addUserForm.empresa}
                onValueChange={(value) =>
                  handleAddUserInputChange("empresa", value)
                }
              >
                <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hlv">HLV</SelectItem>
                  <SelectItem value="sysmed">SYSMED</SelectItem>
                  <SelectItem value="hcv">
                    HCV MANTENIMIENTO BIOMEDICO
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Permissions Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Permisos</h3>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-900">
                      Módulo
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Leer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Escribir
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Crear
                    </TableHead>
                    <TableHead className="font-semibold text-gray-900 text-center">
                      Actualizar
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(permissions).map(([module, perms]) => (
                    <TableRow key={module}>
                      <TableCell className="font-medium capitalize">
                        {module}
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perms.leer}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(module, "leer", checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perms.escribir}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(module, "escribir", checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perms.crear}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(module, "crear", checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={perms.actualizar}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(
                              module,
                              "actualizar",
                              checked
                            )
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              onClick={handleSubmitEditUser}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Actualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditUserModalOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View User Modal */}
      <Dialog open={isViewUserModalOpen} onOpenChange={setIsViewUserModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-700">
              Información detallada del usuario
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-3 py-4">
              <div>
                <span className="font-semibold text-gray-700">Nombre: </span>
                <span className="text-gray-600">
                  {selectedUser.nombre.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">apellido: </span>
                <span className="text-gray-600">APELLIDO EJEMPLO</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">teléfono: </span>
                <span className="text-gray-600">3234567834</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">email: </span>
                <span className="text-gray-600">
                  sarahcristina290317@gmail.com
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">username: </span>
                <span className="text-gray-600">{selectedUser.login}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">rol: </span>
                <span className="text-gray-600">{selectedUser.rol}</span>
              </div>
            </div>
          )}

          <div className="flex justify-start pt-6">
            <Button
              onClick={() => setIsViewUserModalOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              usuario{" "}
              <span className="font-semibold">{userToDelete?.nombre}</span> del
              sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setUserToDelete(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Relation Confirmation Dialog */}
      <AlertDialog
        open={!!relationToDelete}
        onOpenChange={() => setRelationToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la
              relación entre la zona{" "}
              <span className="font-semibold">
                {relationToDelete?.nombre_zona}
              </span>{" "}
              y el usuario{" "}
              <span className="font-semibold">
                {relationToDelete?.nombre_usuario}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setRelationToDelete(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-lg font-medium transition-all duration-200"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRelation}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
