"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
    Pronto
  </span>
);

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <Collapsible key={item.title} asChild defaultOpen={isSubmenuOpen(item.subItems)} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          {item.subItems ? (
            <SidebarMenuButton
              disabled={item.comingSoon}
              isActive={isActive(item.url, item.subItems)}
              tooltip={item.title}
              className="group/item relative text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#5a8fd4] data-[active=true]:to-[#2a5faa] data-[active=true]:text-white data-[active=true]:shadow-md transition-all duration-200"
            >
              {item.icon && (
                <item.icon className="group-data-[active=true]/item:drop-shadow-sm transition-transform group-hover/item:scale-110" />
              )}
              <span className="font-medium">{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton
              asChild
              aria-disabled={item.comingSoon}
              isActive={isActive(item.url)}
              tooltip={item.title}
              className="group/item relative text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#5a8fd4] data-[active=true]:to-[#2a5faa] data-[active=true]:text-white data-[active=true]:shadow-md transition-all duration-200"
            >
              <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
                {item.icon && (
                  <item.icon className="group-data-[active=true]/item:drop-shadow-sm transition-transform group-hover/item:scale-110" />
                )}
                <span className="font-medium">{item.title}</span>
                {item.comingSoon && <IsComingSoon />}
              </Link>
            </SidebarMenuButton>
          )}
        </CollapsibleTrigger>
        {item.subItems && (
          <CollapsibleContent className="transition-all duration-200">
            <SidebarMenuSub className="ml-4 border-l-2 border-white/20 pl-2 space-y-1">
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    aria-disabled={subItem.comingSoon}
                    isActive={isActive(subItem.url)}
                    asChild
                    className="group/subitem text-white/70 hover:text-white hover:bg-white/10 data-[active=true]:bg-white/15 data-[active=true]:text-white data-[active=true]:font-semibold rounded-md transition-all duration-150"
                  >
                    <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon className="transition-transform group-hover/subitem:scale-110" />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        )}
      </SidebarMenuItem>
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <SidebarMenuItem key={item.title}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            disabled={item.comingSoon}
            tooltip={item.title}
            isActive={isActive(item.url, item.subItems)}
            className="group/item text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#5a8fd4] data-[active=true]:to-[#2a5faa] data-[active=true]:text-white data-[active=true]:shadow-md transition-all duration-200"
          >
            {item.icon && (
              <item.icon className="group-data-[active=true]/item:drop-shadow-sm transition-transform group-hover/item:scale-110" />
            )}
            <span>{item.title}</span>
            <ChevronRight className="transition-transform group-hover/item:translate-x-0.5" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 rounded-xl shadow-xl border-2 border-[#14356F]/20 p-2" side="right" align="start" sideOffset={8}>
          <div className="space-y-1">
            {item.subItems?.map((subItem) => (
              <DropdownMenuItem key={subItem.title} asChild className="rounded-lg">
                <SidebarMenuSubButton
                  asChild
                  className="focus-visible:ring-0 hover:bg-[#14356F]/10 data-[active=true]:bg-[#14356F]/15 data-[active=true]:text-[#14356F] data-[active=true]:font-semibold transition-all duration-150 cursor-pointer"
                  aria-disabled={subItem.comingSoon}
                  isActive={isActive(subItem.url)}
                >
                  <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                    {subItem.icon && <subItem.icon className="transition-transform hover:scale-110" />}
                    <span>{subItem.title}</span>
                    {subItem.comingSoon && <IsComingSoon />}
                  </Link>
                </SidebarMenuSubButton>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => path.startsWith(sub.url));
    }
    return path === url;
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.id} className="mb-2">
          {group.label && (
            <SidebarGroupLabel className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-[#5a8fd4]"></div>
              {group.label}
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent"></div>
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent className="flex flex-col gap-1.5">
            <SidebarMenu>
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // If no subItems, just render the button as a link
                  if (!item.subItems) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url)}
                          className="group/item text-white/80 hover:text-white hover:bg-white/10 data-[active=true]:bg-gradient-to-r data-[active=true]:from-[#5a8fd4] data-[active=true]:to-[#2a5faa] data-[active=true]:text-white data-[active=true]:shadow-md transition-all duration-200"
                        >
                          <Link href={item.url} target={item.newTab ? "_blank" : undefined}>
                            {item.icon && (
                              <item.icon className="group-data-[active=true]/item:drop-shadow-sm transition-transform group-hover/item:scale-110" />
                            )}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                  // Otherwise, render the dropdown as before
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded key={item.title} item={item} isActive={isItemActive} isSubmenuOpen={isSubmenuOpen} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
