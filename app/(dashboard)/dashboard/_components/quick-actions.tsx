import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  Building2,
  TrendingUp,
  Users,
  Zap,
  ArrowDownUp,
  PackagePlus,
  WarehouseIcon,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface QuickActionsProps {
  userRole: UserRole;
}

export function QuickActions({ userRole }: QuickActionsProps) {
  const canManageProducts = ["ADMINISTRATOR", "MANAGER", "USER"].includes(userRole);
  const canManageWarehouses = ["ADMINISTRATOR", "MANAGER"].includes(userRole);
  const canManageUsers = userRole === "ADMINISTRATOR";
  const canCreateMovements = ["ADMINISTRATOR", "MANAGER", "USER"].includes(userRole);

  const actions = [
    {
      label: "New Movement",
      description: "Record stock IN/OUT/TRANSFER",
      icon: TrendingUp,
      href: "/movements/new",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
      visible: canCreateMovements,
    },
    {
      label: "New Product",
      description: "Add product to catalog",
      icon: PackagePlus,
      href: "/products/new",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
      visible: canManageProducts,
    },
    {
      label: "New Warehouse",
      description: "Create storage location",
      icon: WarehouseIcon,
      href: "/warehouses/new",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
      visible: canManageWarehouses,
    },
    {
      label: "Manage Users",
      description: "User roles & permissions",
      icon: Users,
      href: "/users",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900",
      visible: canManageUsers,
    },
    {
      label: "View Products",
      description: "Browse product catalog",
      icon: Package,
      href: "/products",
      color: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-100 dark:bg-teal-900",
      visible: true,
    },
    {
      label: "View Warehouses",
      description: "Browse storage locations",
      icon: Building2,
      href: "/warehouses",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900",
      visible: true,
    },
    {
      label: "View Movements",
      description: "Stock transaction history",
      icon: ArrowDownUp,
      href: "/movements",
      color: "text-pink-600 dark:text-pink-400",
      bgColor: "bg-pink-100 dark:bg-pink-900",
      visible: true,
    },
    {
      label: "View Stock",
      description: "Current inventory levels",
      icon: Package,
      href: "/stock",
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-100 dark:bg-cyan-900",
      visible: true,
    },
  ];

  const visibleActions = actions.filter((action) => action.visible);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visibleActions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="h-auto flex-col items-start p-4 hover:shadow-md transition-shadow"
              >
                <Link href={action.href}>
                  <div className={`p-2 rounded-lg ${action.bgColor} mb-2`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-sm">{action.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {action.description}
                    </p>
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
