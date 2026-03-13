import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuth as usePermissions } from "../hooks/useAuth.jsx";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
    <header className="fixed top-0 left-0 w-full bg-[#1D293D] text-white px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="p-2" />
        <h1 className="text-base sm:text-lg font-bold text-white">
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
            <div className="flex items-center gap-1 sm:gap-2 text-xl sm:text-sm text-white cursor-pointer">
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
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const { permissionService, isAdmin, user } = useAuth();
  const { hasModuleAccess, isAdmin: isPermissionAdmin } = usePermissions();

  // Verificar si los permisos están cargados
  useEffect(() => {
    if (user && permissionService) {
      // Dar un pequeño delay para asegurar que los permisos se carguen
      const timer = setTimeout(() => {
        const readableModules = permissionService.getReadableModules();
        setPermissionsLoaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, permissionService]);


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
              {(() => {
                // Si los permisos no están cargados, usar fallback basado en rol
                if (!permissionsLoaded) {

                  // Admins ven todo
                  if (user && user.rol_id <= 2) {
                    return navigationItems;
                  }

                  // Usuarios normales ven módulos básicos
                  return navigationItems.filter(item => {
                    if (item.alwaysVisible) return true; // INICIO
                    if (item.label === 'EQUIPOS') return true; // EQUIPOS
                    if (item.label === 'ORDENES') {
                      // Solo mostrar "MIS TICKETS"
                      item.submenu = item.submenu.filter(sub => sub.href === '/ordenes/mis-tickets');
                      return item.submenu.length > 0;
                    }
                    return false;
                  });
                }

                // Una vez cargados, usar el filtro normal de permisos
                const filteredItems = permissionService.filterMenuItems(navigationItems);

                // Si no hay items filtrados, mostrar solo INICIO
                if (filteredItems.length === 0) {
                  const inicioItem = navigationItems.find(item => item.alwaysVisible);
                  return inicioItem ? [inicioItem] : [];
                }

                return filteredItems;
              })().map((item, index) => (
                <SidebarMenuItem key={index}>
                  {item.href ? (
                    // Item with direct link
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{
                        scale: 1.03,
                        x: 6,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `w-full justify-start text-left h-auto py-3 px-3 hover:bg-white hover:text-gray-900 transition-all duration-200 text-white rounded-lg group shadow-sm hover:shadow-lg ${isActive ? "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg" : ""
                            }`
                          }
                        >
                          <item.icon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                          <span className="flex-1 font-semibold">{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </motion.div>
                  ) : (
                    // Item with submenu
                    <>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{
                          scale: 1.03,
                          x: 6,
                          transition: { duration: 0.2, ease: "easeOut" }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <SidebarMenuButton
                          onClick={() => toggleSubmenu(item.label)}
                          className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-white hover:text-gray-900 text-white transition-all duration-200 rounded-lg group shadow-sm hover:shadow-lg"
                        >
                          <item.icon className="h-4 w-4 mr-3 flex-shrink-0 group-hover:scale-110 transition-all duration-300" />
                          <span className="flex-1 font-semibold">{item.label}</span>
                          {item.submenu.length > 0 && (
                            <ChevronRight
                              className={`h-4 w-4 ml-auto transition-transform duration-300 group-hover:translate-x-1 ${openSubmenus.includes(item.label)
                                ? "rotate-90"
                                : ""
                                }`}
                            />
                          )}
                        </SidebarMenuButton>
                      </motion.div>

                      {/* Submenu */}
                      <AnimatePresence>
                        {openSubmenus.includes(item.label) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1 border-l-2 border-blue-500/30 pl-4">
                              {item.submenu.map((subItem, subIndex) => (
                                <motion.div
                                  key={subIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                                  whileHover={{
                                    scale: 1.05,
                                    x: 8,
                                    transition: { duration: 0.2, ease: "easeOut" }
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <SidebarMenuSubItem>
                                    <SidebarMenuSubButton asChild>
                                      <NavLink
                                        to={subItem.href}
                                        className={({ isActive }) =>
                                          `w-full justify-start text-left h-auto py-2 px-3 hover:bg-white hover:text-gray-900 text-sm transition-all duration-200 text-white rounded-md group shadow-sm hover:shadow-md ${isActive ? "bg-gradient-to-r from-blue-600/80 to-blue-700/80 font-semibold" : ""
                                          }`
                                        }
                                      >
                                        <span className="group-hover:translate-x-2 transition-transform duration-200 font-medium">{subItem.label}</span>
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                </motion.div>
                              ))}
                            </SidebarMenuSub>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
