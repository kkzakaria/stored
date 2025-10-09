import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Calendar,
  Edit,
  Shield,
  Building2,
  TrendingUp,
} from "lucide-react";
import { auth } from "@/lib/auth/config";
import { userRepository, warehouseRepository } from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserStatusBadge } from "../_components/user-status-badge";
import { UserWarehouseManager } from "../_components/user-warehouse-manager";
import { UserMovementsHistory } from "../_components/user-movements-history";
import { DeleteUserButton } from "../_components/delete-user-button";
import {
  getUserInitials,
  formatUserName,
  getRoleInfo,
  getRoleIcon,
} from "@/lib/utils/user";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface UserDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  // Check authentication and permissions
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMINISTRATOR can access user management
  const currentUser = await userRepository.findById(session.user.id);
  if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  // Fetch user details
  const { id } = await params;
  const userResult = await userRepository.findById(id, {
    include: {
      warehouseAccess: {
        include: {
          warehouse: true,
        },
        orderBy: {
          warehouse: {
            name: "asc",
          },
        },
      },
      movements: {
        include: {
          product: true,
          variant: true,
          fromWarehouse: true,
          toWarehouse: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      },
    },
  });

  if (!userResult) {
    notFound();
  }

  // Type assertion for included relations
  const user = userResult as typeof userResult & {
    warehouseAccess: Array<{
      id: string;
      userId: string;
      warehouseId: string;
      canWrite: boolean;
      createdAt: Date;
      warehouse: {
        id: string;
        name: string;
        code: string;
        address: string | null;
        city: string | null;
        country: string | null;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
    movements: Array<{
      id: string;
      type: "IN" | "OUT" | "TRANSFER" | "ADJUSTMENT";
      quantity: number;
      createdAt: Date;
      product: {
        id: string;
        name: string;
        sku: string;
      };
      variant: {
        name: string;
      } | null;
      fromWarehouse: {
        id: string;
        name: string;
        code: string;
      } | null;
      toWarehouse: {
        id: string;
        name: string;
        code: string;
      } | null;
    }>;
  };

  // Fetch available warehouses for assignment
  const allWarehouses = await warehouseRepository.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = getRoleIcon(user.role);

  return (
    <div className="space-y-6">
      <PageHeader
        title={formatUserName(user.name)}
        description={user.email}
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/users/${user.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Link>
            </Button>
            <DeleteUserButton userId={user.id} userName={formatUserName(user.name)} />
          </div>
        }
      />

      {/* User Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold text-2xl">
                {getUserInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-medium">{formatUserName(user.name)}</p>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                  <div className="flex items-center gap-2">
                    <RoleIcon className={cn("h-4 w-4", roleInfo.color)} />
                    <p className="font-medium">{roleInfo.label}</p>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <UserStatusBadge active={user.active} />
                </div>

                {/* Created At */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="font-medium">{formatDate(user.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warehouse Access</CardTitle>
            <Building2 className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.warehouseAccess.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user.warehouseAccess.filter((wa) => wa.canWrite).length} with write access
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.movements.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Stock movements created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Permissions</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleInfo.permissions.length}</div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Permission categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="warehouses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="warehouses">
            <Building2 className="h-4 w-4 mr-2" />
            Warehouses ({user.warehouseAccess.length})
          </TabsTrigger>
          <TabsTrigger value="movements">
            <TrendingUp className="h-4 w-4 mr-2" />
            Movements ({user.movements.length})
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        {/* Warehouses Tab */}
        <TabsContent value="warehouses">
          <Suspense fallback={<LoadingState />}>
            <UserWarehouseManager
              userId={user.id}
              userWarehouses={user.warehouseAccess}
              availableWarehouses={allWarehouses}
            />
          </Suspense>
        </TabsContent>

        {/* Movements Tab */}
        <TabsContent value="movements">
          <Suspense fallback={<LoadingState />}>
            <UserMovementsHistory movements={user.movements} limit={20} />
          </Suspense>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {roleInfo.label} Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {roleInfo.description}
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Granted Permissions:</h4>
                  <ul className="space-y-2">
                    {roleInfo.permissions.map((permission, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
