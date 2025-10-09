import Link from "next/link";
import { Mail, Calendar, Building2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserStatusBadge } from "./user-status-badge";
import {
  getUserInitials,
  formatUserName,
  getRoleInfo,
  getRoleIcon,
} from "@/lib/utils/user";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    role: "ADMINISTRATOR" | "MANAGER" | "USER" | "VISITOR_ADMIN" | "VISITOR";
    active: boolean;
    createdAt: Date;
    _count?: {
      warehouseAccess: number;
      movements: number;
    };
  };
}

export function UserCard({ user }: UserCardProps) {
  const roleInfo = getRoleInfo(user.role);
  const RoleIcon = getRoleIcon(user.role);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* User Avatar and Basic Info */}
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                {getUserInitials(user.name || user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">
                    {formatUserName(user.name)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate flex items-center gap-1">
                    <Mail className="h-3 w-3 flex-shrink-0" />
                    {user.email}
                  </p>
                </div>
                <UserStatusBadge active={user.active} />
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <RoleIcon className={cn("h-4 w-4", roleInfo.color)} />
            <span className="text-sm font-medium">{roleInfo.label}</span>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>
                {user._count?.warehouseAccess || 0}{" "}
                {user._count?.warehouseAccess === 1 ? "warehouse" : "warehouses"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-4 w-4" />
              <span>
                {user._count?.movements || 0}{" "}
                {user._count?.movements === 1 ? "movement" : "movements"}
              </span>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="h-3 w-3" />
            <span>Joined {formatDate(user.createdAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/users/${user.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
