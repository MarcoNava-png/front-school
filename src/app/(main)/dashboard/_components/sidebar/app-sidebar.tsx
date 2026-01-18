"use client";

import { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

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
import { usePermissions } from "@/hooks/use-permissions";
import { sidebarItems, filterSidebarByModules } from "@/navigation/sidebar/sidebar-items";

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
    <Sidebar
      {...props}
      className="border-r-0"
      style={{
        background: 'linear-gradient(to bottom, #14356F, #0f2850)',
      }}
    >
      <SidebarHeader
        className="border-b border-white/10"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        }}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[slot=sidebar-menu-button]:!p-3 hover:bg-white/10 transition-all duration-300 group/logo"
            >
              <Link href="/dashboard/default" className="flex items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg ring-2 ring-white/20 group-hover/logo:ring-white/40 transition-all duration-300 group-hover/logo:scale-105">
                  <Image
                    src="/Logousag.png"
                    alt="Logo USAG"
                    width={36}
                    height={36}
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold whitespace-nowrap text-white">
                    {APP_CONFIG.name}
                  </span>
                  <span className="text-xs text-white/70 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-[#5a8fd4]" />
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
      <SidebarFooter className="border-t border-white/10 p-2">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
