"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white hover:bg-white transition-all duration-200 h-auto py-2.5 px-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md"
            >
              <Avatar className="h-9 w-9 rounded-lg border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold">
                  {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-slate-900">{user.name}</span>
                <span className="truncate text-xs text-slate-500">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-slate-400" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-xl shadow-xl border-slate-200"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-slate-200">
                <Avatar className="h-10 w-10 rounded-lg border-2 border-white shadow-sm">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-slate-900">{user.name}</span>
                  <span className="truncate text-xs text-slate-600">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuGroup className="p-1">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2.5 px-3 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <span className="font-medium text-slate-700">Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2.5 px-3 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-slate-700">Cuenta</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2.5 px-3 hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-50">
                  <Bell className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-medium text-slate-700">Notificaciones</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="my-1" />
            <div className="p-1">
              <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2.5 px-3 hover:bg-red-50 transition-colors text-red-600 hover:text-red-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                  <LogOut className="h-4 w-4 text-red-600" />
                </div>
                <span className="font-semibold">Cerrar Sesión</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}