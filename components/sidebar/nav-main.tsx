"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

// Colores representativos para cada tipo de icono con gradientes
const iconStyles = {
  FileText: "text-blue-600 group-hover/item:text-blue-700",
  Users: "text-green-600 group-hover/item:text-green-700",
  Mail: "text-purple-600 group-hover/item:text-purple-700",
  FileDown: "text-orange-600 group-hover/item:text-orange-700",
  BarChart3: "text-cyan-600 group-hover/item:text-cyan-700",
  Settings: "text-slate-600 group-hover/item:text-slate-700",
}

const iconBgStyles = {
  FileText: "bg-blue-50 group-hover/item:bg-blue-100 group-data-[active=true]/item:bg-blue-100",
  Users: "bg-green-50 group-hover/item:bg-green-100 group-data-[active=true]/item:bg-green-100",
  Mail: "bg-purple-50 group-hover/item:bg-purple-100 group-data-[active=true]/item:bg-purple-100",
  FileDown: "bg-orange-50 group-hover/item:bg-orange-100 group-data-[active=true]/item:bg-orange-100",
  BarChart3: "bg-cyan-50 group-hover/item:bg-cyan-100 group-data-[active=true]/item:bg-cyan-100",
  Settings: "bg-slate-50 group-hover/item:bg-slate-100 group-data-[active=true]/item:bg-slate-100",
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu className="space-y-1.5">
        {items.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          const hasSubItems = item.items && item.items.length > 0
          const iconColorClass = item.icon ? iconStyles[item.icon.name as keyof typeof iconStyles] || "text-slate-600" : ""
          const iconBgClass = item.icon ? iconBgStyles[item.icon.name as keyof typeof iconBgStyles] || "bg-slate-50" : ""

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {hasSubItems ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={isActive}
                        className="h-11 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-indigo-50 data-[active=true]:text-blue-700 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-blue-200 group/item group-data-[collapsible=icon]:px-2"
                      >
                        {item.icon && (
                          <div className={`flex items-center justify-center min-w-[32px] h-8 rounded-lg transition-all duration-300 ${iconBgClass} group-data-[collapsible=icon]:min-w-full`}>
                            <item.icon 
                              className={`h-[18px] w-[18px] shrink-0 transition-all duration-300 ease-out ${iconColorClass} group-hover/item:scale-110 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5`}
                              strokeWidth={2.5} 
                            />
                          </div>
                        )}
                        <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden text-slate-400" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-0 border-l-2 border-slate-200 pl-6 mt-1.5 space-y-1">
                        {item.items?.map((subItem) => {
                          const isSubActive = pathname === subItem.url
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubActive}
                                className="h-9 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-indigo-50 data-[active=true]:text-blue-700 data-[active=true]:font-semibold"
                              >
                                <Link href={subItem.url}>
                                  <div className="flex items-center gap-2.5">
                                    <div className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                                      isSubActive 
                                        ? 'bg-blue-600 scale-125 shadow-sm shadow-blue-400' 
                                        : 'bg-slate-300'
                                    }`}></div>
                                    <span className="text-sm">{subItem.title}</span>
                                  </div>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className="h-11 px-3 rounded-lg hover:bg-slate-100 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-indigo-50 data-[active=true]:text-blue-700 data-[active=true]:font-semibold data-[active=true]:border data-[active=true]:border-blue-200 group/item group-data-[collapsible=icon]:px-2"
                  >
                    <Link href={item.url}>
                      {item.icon && (
                        <div className={`flex items-center justify-center min-w-[32px] h-8 rounded-lg transition-all duration-300 ${iconBgClass} group-data-[collapsible=icon]:min-w-full`}>
                          <item.icon 
                            className={`h-[18px] w-[18px] shrink-0 transition-all duration-300 ease-out ${iconColorClass} group-hover/item:scale-110 group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5`}
                            strokeWidth={2.5} 
                          />
                        </div>
                      )}
                      <span className="text-sm font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}