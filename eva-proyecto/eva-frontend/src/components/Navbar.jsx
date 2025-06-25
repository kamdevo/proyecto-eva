import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
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
} from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className="p-2" />
        <h1 className="text-base sm:text-lg font-bold text-gray-800">
          EVA APLICATIVO
        </h1>
      </div>
      <NavLink>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex items-center gap-1 sm:gap-2 text-xl sm:text-sm text-gray-600 cursor-pointer">
              <User className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-lg ">Administrador</span>
              <span className="sm:hidden">Admin</span>
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
              <DropdownMenuItem>
                <Link to="/salir">
                  <p>Salir</p>
                </Link>
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

  const navigationItems = [
    { icon: Home, label: "Inicio", active: true, submenu: [], href: "/home" },
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
    {
      icon: BarChart3,
      label: "DASHBOARD",
      submenu: [
        { label: "REPORTES", href: "/dashboard/reportes" },
        { label: "GRAFICAS", href: "/dashboard/graficas" },
      ],
    },
    {
      icon: Settings,
      label: "CONFIGURACIÓN",
      submenu: [
        { label: "SERVICIOS", href: "/config/servicios" },
        { label: "CONTACTOS", href: "/config/contactos" },
        { label: "AREAS", href: "/config/areas" },
      ],
    },
    {
      icon: User,
      label: "ADMINISTRADOR",
      submenu: [
        { label: "USUARIOS", href: "/admin/usuarios" },
        { label: "PROPIETARIOS", href: "/admin/propietarios" },
      ],
    },
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
              {navigationItems.map((item, index) => (
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
