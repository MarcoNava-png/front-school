"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CircleUser, LogOut } from "lucide-react";

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
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const { user } = useCurrentUser();
  const logout = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer focus:outline-none">
            <Avatar className="h-8 w-8 rounded-lg ring-2 ring-[#14356F]/20 transition-all hover:ring-[#14356F]/40">
              <AvatarImage src={user.photoUrl ?? undefined} alt={user.nombres} />
              <AvatarFallback
                className="rounded-lg text-white text-xs font-semibold"
                style={{ background: 'linear-gradient(to bottom right, #14356F, #1e4a8f)' }}
              >
                {getInitials(`${user.nombres ?? ""} ${user.apellidos ?? ""}`)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:grid text-left text-sm leading-tight">
              <span className="truncate font-semibold text-foreground max-w-32">
                {user.nombres} {user.apellidos}
              </span>
              <span className="text-muted-foreground truncate text-xs max-w-32">{user.email}</span>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-64 rounded-xl shadow-xl border-2 border-[#14356F]/20"
          side="bottom"
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
                {user.role && (
                  <span className="text-[#14356F] truncate text-xs font-medium capitalize mt-0.5">
                    {user.role}
                  </span>
                )}
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
    </div>
  );
}
