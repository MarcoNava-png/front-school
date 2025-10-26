"use client";

import { useEffect, useState } from "react";

import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useLogout } from "@/hooks/use-logout";
import { cn, getInitials } from "@/lib/utils";

/* --------------------------------- AvatarCard --------------------------------- */
function AvatarCard({
  nombres,
  apellidos,
  photoUrl,
  role,
}: {
  nombres: string;
  apellidos: string;
  photoUrl?: string | null;
  role?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2 px-2 py-1.5">
      <Avatar className="size-9 rounded-lg">
        <AvatarImage src={photoUrl ?? undefined} alt={`${nombres} ${apellidos}`} />
        <AvatarFallback className="bg-muted rounded-lg text-xs font-medium">
          {getInitials(`${nombres} ${apellidos}`)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">
          {nombres} {apellidos}
        </span>
        {role && <span className="text-muted-foreground truncate text-xs capitalize">{role}</span>}
      </div>
    </div>
  );
}

/* -------------------------------- AccountSwitcher ------------------------------ */
export function AccountSwitcher() {
  const user = useCurrentUser();
  const logout = useLogout();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 cursor-pointer rounded-lg transition hover:opacity-90">
          <AvatarImage src={user.photoUrl ?? undefined} alt={`${user.nombres} ${user.apellidos}`} />
          <AvatarFallback className="bg-muted rounded-lg text-xs font-medium">
            {getInitials(`${user.nombres} ${user.apellidos}`)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg shadow-md" side="bottom" align="end" sideOffset={4}>
        {/* Usuario actual */}
        <DropdownMenuItem
          key={user.email}
          className={cn(
            "hover:bg-accent cursor-pointer border-l-2 border-transparent p-0",
            "bg-accent/50 border-l-primary",
          )}
        >
          <AvatarCard
            nombres={user.nombres}
            apellidos={user.apellidos ?? ""}
            photoUrl={user.photoUrl}
            role={user.role}
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck className="mr-2 size-4" />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 size-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 size-4" />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-600">
          <LogOut className="mr-2 size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
