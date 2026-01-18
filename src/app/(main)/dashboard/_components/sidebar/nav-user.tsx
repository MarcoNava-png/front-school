"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CircleUser, CreditCard, EllipsisVertical, LogOut, MessageSquareDot } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { getInitials } from "@/lib/utils";

export function NavUser() {
  const { isMobile } = useSidebar();
  const logout = useLogout();
  const { user } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="group/user data-[state=open]:bg-white/10 hover:bg-white/10 transition-all duration-200 rounded-xl"
              >
                <Avatar className="h-9 w-9 rounded-xl ring-2 ring-white/20 transition-all duration-200 group-hover/user:ring-white/40">
                  <AvatarImage src={""} alt={user.nombres} />
                  <AvatarFallback
                    className="rounded-xl text-white font-semibold"
                    style={{ background: 'linear-gradient(to bottom right, #5a8fd4, #2a5faa)' }}
                  >
                    {getInitials(`${user.nombres ?? ""} ${user.apellidos ?? ""}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">
                    {user.nombres} {user.apellidos}
                  </span>
                  <span className="text-white/60 truncate text-xs">{user.email}</span>
                </div>
                <EllipsisVertical className="ml-auto size-4 text-white/60 transition-transform group-hover/user:scale-110" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl shadow-xl border-2 border-[#14356F]/20"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div
                  className="flex items-center gap-3 px-3 py-3 rounded-t-xl"
                  style={{ background: 'linear-gradient(to bottom right, rgba(20, 53, 111, 0.1), rgba(30, 74, 143, 0.1))' }}
                >
                  <Avatar className="h-10 w-10 rounded-xl ring-2 ring-white dark:ring-gray-800">
                    <AvatarImage src={user.photoUrl ?? undefined} alt={user.nombres} />
                    <AvatarFallback
                      className="rounded-xl text-white font-bold"
                      style={{ background: 'linear-gradient(to bottom right, #14356F, #1e4a8f)' }}
                    >
                      {getInitials(`${user.nombres ?? ""} ${user.apellidos ?? ""}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold text-foreground">
                      {user.nombres} {user.apellidos}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="px-1">
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-[#14356F]/10 transition-colors">
                  <Link href="/dashboard/profile">
                    <CircleUser className="text-[#14356F]" />
                    <span className="font-medium">Mi Cuenta</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-[#14356F]/10 transition-colors">
                  <CreditCard className="text-[#1e4a8f]" />
                  <span className="font-medium">Facturación</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-[#14356F]/10 transition-colors">
                  <MessageSquareDot className="text-[#5a8fd4]" />
                  <span className="font-medium">Notificaciones</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <div className="px-1 pb-1">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-semibold transition-colors"
                >
                  <LogOut />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
