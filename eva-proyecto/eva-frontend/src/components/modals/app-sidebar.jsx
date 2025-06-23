"use client"

import { Home, Settings, Users, FileText, BarChart3, GraduationCap, LayoutDashboard, Cog, Shield } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "INICIO",
    url: "#",
    icon: Home,
    isActive: true,
  },
  {
    title: "EQUIPOS",
    url: "#",
    icon: Settings,
  },
  {
    title: "PLANES",
    url: "#",
    icon: FileText,
  },
  {
    title: "ORDENES",
    url: "#",
    icon: Users,
  },
  {
    title: "REPORTES",
    url: "#",
    icon: BarChart3,
  },
  {
    title: "CAPACITACIONES",
    url: "#",
    icon: GraduationCap,
  },
  {
    title: "DASHBOARD",
    url: "#",
    icon: LayoutDashboard,
  },
  {
    title: "CONFIGURACION",
    url: "#",
    icon: Cog,
  },
  {
    title: "ADMINISTRADOR",
    url: "#",
    icon: Shield,
  },
]

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
      className="bg-gradient-to-b from-slate-800 via-slate-900 to-black shadow-2xl border-r-4 border-blue-500"
      {...props}>
      <SidebarHeader className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div
            className="text-white font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            EVA APLICATIVO
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-600 data-[active=true]:to-purple-600 transition-all duration-300 hover:scale-105 mx-2 rounded-xl shadow-lg hover:shadow-xl">
                    <a href={item.url} className="flex items-center gap-4 p-3">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
