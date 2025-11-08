"use client"

import * as React from "react"
import {
  FileText,
  Users,
  Settings,
  FileDown,
  Mail,
  LogOut,
  BarChart3,
} from "lucide-react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const navItems = [
  {
    title: "Cuestionarios",
    url: "/admin/cuestionarios",
    icon: FileText,
    isActive: true,
  },
  {
    title: "Evaluados",
    url: "/admin/evaluados",
    icon: Users,
  },
  {
    title: "Invitaciones",
    url: "/admin/invitaciones",
    icon: Mail,
    items: [
      {
        title: "Ver Todas",
        url: "/admin/invitaciones",
      },
      {
        title: "Generar Nueva",
        url: "/admin/generar-invitacion",
      },
    ],
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userData: {
    name: string;
    email: string;
    avatar: string;
  };
}

export function AppSidebar({ userData, ...props }: AppSidebarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Error al cerrar sesión");

      toast.success("Sesión cerrada correctamente");
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cerrar sesión");
    }
  }

  return (
    <Sidebar collapsible="icon" {...props} className="border-r border-slate-200 bg-gradient-to-b from-white to-slate-50">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-slate-200 bg-white/80 backdrop-blur-xl transition-all duration-300">
        <div className="overflow-hidden transition-all duration-300 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
          <h2 className="text-base font-bold text-slate-900 whitespace-nowrap px-4">
            MVP de Evaluación
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 mt-auto bg-gradient-to-r from-slate-50 to-blue-50">
        <div className="p-3 space-y-2">
          {/* Botón de Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg text-slate-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 group/logout group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 border border-transparent hover:border-red-200"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 group-hover/logout:bg-red-100 transition-all duration-300 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:bg-transparent">
              <LogOut className="h-[18px] w-[18px] text-red-500 transition-all duration-300 ease-out group-hover/logout:scale-110 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5" strokeWidth={2.5} />
            </div>
            <span className="font-semibold transition-all duration-300 group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 overflow-hidden whitespace-nowrap">
              Cerrar Sesión
            </span>
          </button>

          {/* Usuario */}
          <NavUser user={userData} />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}