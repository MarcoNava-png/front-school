"use client";

import { useEffect, useState } from "react";

import { EllipsisVertical, CircleUser, CreditCard, MessageSquareDot, LogOut } from "lucide-react";

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
                className="group/user data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-indigo-50 dark:data-[state=open]:from-blue-950/40 dark:data-[state=open]:to-indigo-950/40 hover:bg-sidebar-accent/80 transition-all duration-200 rounded-xl"
              >
                <Avatar className="h-9 w-9 rounded-xl ring-2 ring-blue-500/20 transition-all duration-200 group-hover/user:ring-blue-500/40">
                  <AvatarImage src={""} alt={user.nombres} />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                    {getInitials(`${user.nombres ?? ""} ${user.apellidos ?? ""}`)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-foreground">
                    {user.nombres} {user.apellidos}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                </div>
                <EllipsisVertical className="ml-auto size-4 transition-transform group-hover/user:scale-110" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl shadow-xl border-2"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={8}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-xl">
                  <Avatar className="h-10 w-10 rounded-xl ring-2 ring-white dark:ring-gray-800">
                    <AvatarImage src={user.photoUrl ?? undefined} alt={user.nombres} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold">
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
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  <a href="/dashboard/profile">
                    <CircleUser className="text-blue-600" />
                    <span className="font-medium">Mi Cuenta</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  <CreditCard className="text-green-600" />
                  <span className="font-medium">Facturación</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                  <MessageSquareDot className="text-purple-600" />
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
