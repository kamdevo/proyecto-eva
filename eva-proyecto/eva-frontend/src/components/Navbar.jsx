import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [openSubmenus, setOpenSubmenus] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const navigationItems = [
    { icon: Home, label: "Inicio", active: true, submenu: [] },
    {
      icon: Monitor,
      label: "EQUIPOS",
      submenu: [
        { label: "BIOMEDICOS", href: "/equipos/biomedicos" },
        { label: "INDUSTRIALES", href: "/equipos/industriales" },
        { label: "QX", href: "/equipos/qx" },
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
      submenu: [{ label: "REPUESTOS", href: "/repuestos/repuestos" }],
    },
    {
      icon: GraduationCap,
      label: "CAPACITACIONES",
      submenu: [
        { label: "CAPACITACIONES", href: "/capacitaciones/capacitaciones" },
      ],
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
    setOpenSubmenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-base sm:text-lg font-bold text-gray-800">
            EVA APLICATIVO
          </h1>
        </div>
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
                <p>Perfil</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <p>Salir</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>{" "}
      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-full bg-slate-800 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 overflow-hidden"
        }`}
      >
        <div className="p-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            NAVEGACIÓN PRINCIPAL
          </h2>
          <nav className="space-y-1">
            {navigationItems.map((item, index) => (
              <div key={index} className="group">
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-auto py-3 px-3 hover:bg-slate-700 ${
                    item.active ? "bg-slate-700 text-white" : "text-slate-300"
                  }`}
                  onClick={() => toggleSubmenu(item.label)}
                >
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight
                    className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                      openSubmenus.includes(item.label) ? "rotate-90" : ""
                    }`}
                  />
                </Button>

                {/* Submenu */}
                {openSubmenus.includes(item.label) && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-600 pl-4">
                    {item.submenu.map((subItem, subIndex) => (
                      <Button
                        key={subIndex}
                        variant="ghost"
                        className="w-full justify-start text-left h-auto py-2 px-3 text-slate-400 hover:bg-slate-700 hover:text-white text-sm"
                      >
                        <span>{subItem.label}</span>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}{" "}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Navbar;
