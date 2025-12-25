"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_CONFIG } from "@/config/app-config";
import { sidebarItems, filterSidebarByModules } from "@/navigation/sidebar/sidebar-items";
import { usePermissions } from "@/hooks/use-permissions";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { accessibleModules, isLoading, isAdmin } = usePermissions();

  // Filtrar items del sidebar segun los modulos accesibles
  const filteredItems = useMemo(() => {
    // Si es admin, mostrar todo
    if (isAdmin) return sidebarItems;
    // Si aun esta cargando, mostrar solo dashboard
    if (isLoading) return filterSidebarByModules(["Dashboard"]);
    // Filtrar segun modulos accesibles
    return filterSidebarByModules(accessibleModules);
  }, [accessibleModules, isLoading, isAdmin]);

  return (
    <Sidebar {...props} className="border-r">
      <SidebarHeader className="border-b border-sidebar-border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-all duration-300 group/logo"
            >
              <Link href="/dashboard/default" className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-2 ring-blue-200/50 dark:ring-blue-800/50 group-hover/logo:ring-blue-400 dark:group-hover/logo:ring-blue-600 transition-all duration-300 group-hover/logo:scale-105">
                  <img
                    src="/Logousag.png"
                    alt="Logo USAG"
                    className="h-9 w-9 object-contain rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold whitespace-nowrap bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    {APP_CONFIG.name}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-blue-500" />
                    Sistema Académico
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={filteredItems} />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
