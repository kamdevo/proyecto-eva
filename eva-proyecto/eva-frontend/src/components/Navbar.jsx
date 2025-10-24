import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuth as usePermissions } from "../hooks/useAuth.jsx";
import { Button } from "./ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  Menu,
  Home,
  Monitor,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Wrench,
  GraduationCap,
  User,
  ChevronRight,
  Search,
  AlignJustify,
} from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import GlobalEquipmentSearch from "./GlobalEquipmentSearch";

const Header = () => {
  const { toast } = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/", { replace: true });
      toast.info("Sesión cerrada correctamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Forzar navegación incluso si falla el logout
      navigate("/", { replace: true });
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="p-2" />
        <h1 className="text-base sm:text-lg font-bold text-gray-800">
          EVA APLICATIVO
        </h1>
      </div>

      {/* Global Equipment Search - Center */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <GlobalEquipmentSearch />
      </div>

      <NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-1 sm:gap-2 text-xl sm:text-sm text-gray-600 cursor-pointer">
              <User className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-lg ">
                {user?.nombre || "Usuario"}
              </span>
              <span className="sm:hidden">{user?.nombre || "User"}</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2.5">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link to="/perfil">
                  <p>Perfil</p>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout}>
                <p className="cursor-pointer">Salir</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </NavLink>
    </header>
  );
};

const AppSidebar = () => {
  const [openSubmenus, setOpenSubmenus] = useState([]);
  const { permissionService, isAdmin, user } = useAuth();
  const { hasModuleAccess, isAdmin: isPermissionAdmin } = usePermissions();
  

  // Debug: mostrar información del usuario y permisos
  useEffect(() => {
    if (user) {
      console.log('🔍 Navbar - Usuario:', user.nombre, 'Rol:', user.rol_id);
      console.log('🔍 Navbar - isPermissionAdmin():', isPermissionAdmin());
      console.log('🔍 Navbar - Debe ver CONFIGURACIÓN:', user.rol_id === 1);
      console.log('🔍 Navbar - Debe ver DASHBOARD:', user.rol_id <= 2);
    }
  }, [user, isPermissionAdmin]);

  // Initialize permissions when user changes
  useEffect(() => {
    if (user) {
      // Permissions are already initialized in AuthContext, no need for debug logging
    }
  }, [user]);

  const navigationItems = [
    // ✅ PÁGINA DE INICIO - SIEMPRE VISIBLE PARA TODOS LOS USUARIOS
    { 
      icon: Home, 
      label: "INICIO", 
      active: true, 
      submenu: [], 
      href: "/home",
      alwaysVisible: true // Marcador especial para asegurar visibilidad
    },
    {
      icon: Monitor,
      label: "EQUIPOS",
      submenu: [
        { label: "BIOMEDICOS", href: "/equipos/biomedicos" },
        { label: "INDUSTRIALES", href: "/equipos/industriales" },
        { label: "O.C", href: "/equipos/ordenes-compra" },
        { label: "BAJAS", href: "/equipos/bajas" },
        { label: "CONTINGENCIAS", href: "/equipos/contingencias" },
        { label: "GUIAS RAPIDAS", href: "/equipos/guias-rapidas" },
        { label: "MANUALES", href: "/equipos/manuales" },
        { label: "CONSULTAS", href: "/equipos/consultas" },
      ],
    },
    {
      icon: Calendar,
      label: "PLANES",
      submenu: [{ label: "MTTO. PREVENTIVO", href: "/planes/preventivo" }],
    },
    {
      icon: FileText,
      label: "ORDENES",
      submenu: [
        { label: "MIS TICKETS", href: "/ordenes/mis-tickets" },
        { label: "GESTION DE TICKETS", href: "/ordenes/gestion-tickets" },
        { label: "TICKETS CERRADOS", href: "/ordenes/tickets-cerrados" },
      ],
    },
    {
      icon: Wrench,
      label: "REPUESTOS",
      submenu: [{ label: "REPUESTOS", href: "/repuestos" }],
    },
    {
      icon: GraduationCap,
      label: "CAPACITACIONES",
      submenu: [{ label: "CAPACITACIONES", href: "/capacitaciones" }],
    },
    // Only show DASHBOARD/REPORTES for admins (rol_id <= 2)
    ...(user?.rol_id <= 2 ? [{
      icon: BarChart3,
      label: "DASHBOARD",
      submenu: [
        { label: "REPORTES", href: "/dashboard/reportes" },
        { label: "GRAFICAS", href: "/dashboard/graficas" },
      ],
    }] : []),
    // Only show CONFIGURACIÓN for superadmin (rol_id = 1) 
    ...(user?.rol_id === 1 ? [{
      icon: Settings,
      label: "CONFIGURACIÓN",
      submenu: [
        { label: "SERVICIOS", href: "/config/servicios" },
        { label: "CONTACTOS", href: "/config/contactos" },
        { label: "AREAS", href: "/config/areas" },
      ],
    }] : []),
    // Only show admin module for users with admin permissions (superadmin + admin)
    ...(isPermissionAdmin() ? [{
      icon: User,
      label: "ADMINISTRADOR",
      submenu: [
        { label: "USUARIOS", href: "/admin/usuarios" },
        { label: "PROPIETARIOS", href: "/admin/propietarios" },
      ],
    }] : []),
  ];

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => {
      if (prev.includes(label)) {
        return [];
      } else {
        return [label];
      }
    });
  };

  return (
    <Sidebar
      variant="sidebar"
      side="left"
      className="bg-slate-800 text-white border-none"
    >
      <SidebarHeader className="bg-slate-800 border-none">
        <SidebarGroupLabel className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
          NAVEGACIÓN PRINCIPAL
        </SidebarGroupLabel>
      </SidebarHeader>

      <SidebarContent className="bg-slate-800">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {permissionService.filterMenuItems(navigationItems).map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.href ? (
                    // Item with direct link
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `w-full justify-start text-left h-auto py-3 px-3 hover:bg-slate-700 transition-colors text-white ${
                            isActive ? "bg-slate-700 text-white" : ""
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  ) : (
                    // Item with submenu
                    <>
                      <SidebarMenuButton
                        onClick={() => toggleSubmenu(item.label)}
                        className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-slate-700 text-white transition-colors"
                      >
                        <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {item.submenu.length > 0 && (
                          <ChevronRight
                            className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                              openSubmenus.includes(item.label)
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        )}
                      </SidebarMenuButton>

                      {/* Submenu */}
                      {openSubmenus.includes(item.label) && (
                        <SidebarMenuSub className="ml-4 mt-1 space-y-1 border-l border-slate-600 pl-4">
                          {item.submenu.map((subItem, subIndex) => (
                            <SidebarMenuSubItem key={subIndex}>
                              <SidebarMenuSubButton asChild>
                                <NavLink
                                  to={subItem.href}
                                  className={({ isActive }) =>
                                    `w-full justify-start text-left h-auto py-2 px-3 hover:bg-slate-700 text-sm transition-colors text-white ${
                                      isActive ? "bg-slate-700" : ""
                                    }`
                                  }
                                >
                                  <span>{subItem.label}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const Navbar = () => {
  return (
    <>
      <Header />
      <AppSidebar />
    </>
  );
};

export default Navbar;
