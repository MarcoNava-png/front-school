"use client";

import { useMemo } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";
import { sidebarItems, filterSidebarByModules } from "@/navigation/sidebar/sidebar-items";

import { NavMain } from "./nav-main";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { accessibleModules, isLoading, isAdmin } = usePermissions();

  const filteredItems = useMemo(() => {
    if (isAdmin) return sidebarItems;
    if (isLoading) return filterSidebarByModules(["Dashboard"]);
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
      <SidebarHeader className="border-b border-white/10 p-4">
        <Link
          href="/dashboard/default"
          className="block w-full rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, #14356F, #1e4a8f)' }}
        >
          <div className="p-4 flex items-center justify-center">
            <Image
              src="/Logousag.png"
              alt="USAG"
              width={180}
              height={70}
              className="object-contain w-full h-auto"
              priority
              unoptimized
            />
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <NavMain items={filteredItems} />
      </SidebarContent>
    </Sidebar>
  );
}
