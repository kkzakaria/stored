"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { hasPermission, type UserWithRole } from "@/lib/auth/permissions";
import { APP_NAME, ROUTES } from "@/lib/utils/constants";
import { getInitials } from "@/lib/utils/helpers";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { USER_ROLE_LABELS } from "@/lib/utils/constants";
import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowRightLeft,
  FolderTree,
  Users,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Produits",
    href: ROUTES.PRODUCTS,
    icon: Package,
    permission: "products:read",
  },
  {
    title: "Entrepôts",
    href: ROUTES.WAREHOUSES,
    icon: Warehouse,
    permission: "warehouses:read",
  },
  {
    title: "Mouvements",
    href: ROUTES.MOVEMENTS,
    icon: ArrowRightLeft,
    permission: "movements:read",
  },
  {
    title: "Catégories",
    href: ROUTES.CATEGORIES,
    icon: FolderTree,
    permission: "categories:read",
  },
  {
    title: "Utilisateurs",
    href: ROUTES.USERS,
    icon: Users,
    permission: "admin:access",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { state } = useSidebar();

  const user = session?.user as unknown as UserWithRole | undefined;

  // Filter nav items based on permissions
  const filteredNavItems = React.useMemo(() => {
    if (!user) return [];

    return navItems.filter((item) => {
      if (!item.permission) return true;
      return hasPermission(user, item.permission as "products:read" | "warehouses:read" | "movements:read" | "categories:read" | "admin:access");
    });
  }, [user]);

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 px-4 py-3"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-4" />
          </div>
          {state === "expanded" && (
            <span className="font-semibold">{APP_NAME}</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <div className="flex items-center gap-3 border-t px-4 py-3">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {state === "expanded" && (
              <div className="flex flex-1 flex-col gap-1 overflow-hidden">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <Badge variant="secondary" className="w-fit text-xs">
                  {USER_ROLE_LABELS[user.role]}
                </Badge>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
