"use client";

import { UserRole } from "@prisma/client";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { getAllRoles, getRoleInfo, getRoleIcon } from "@/lib/utils/user";
import { cn } from "@/lib/utils";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (value: UserRole) => void;
  label?: string;
  required?: boolean;
  showDetails?: boolean;
}

export function RoleSelector({
  value,
  onChange,
  label = "Role",
  required = false,
  showDetails = true,
}: RoleSelectorProps) {
  const roles = getAllRoles();
  const selectedRoleInfo = getRoleInfo(value);
  const Icon = getRoleIcon(value);

  return (
    <div className="space-y-3">
      <Label htmlFor="role">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Select value={value} onValueChange={(val) => onChange(val as UserRole)}>
        <SelectTrigger id="role">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", selectedRoleInfo.color)} />
              <span>{selectedRoleInfo.label}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => {
            const roleInfo = getRoleInfo(role);
            const RoleIcon = getRoleIcon(role);
            return (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <RoleIcon className={cn("h-4 w-4", roleInfo.color)} />
                  <span>{roleInfo.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Role Details Card */}
      {showDetails && (
        <Card className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg bg-gray-100 dark:bg-gray-800")}>
              <Icon className={cn("h-5 w-5", selectedRoleInfo.color)} />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-sm">{selectedRoleInfo.label}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedRoleInfo.description}
              </p>
            </div>
          </div>

          {/* Permissions List */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Permissions:
            </h5>
            <ul className="space-y-1.5">
              {selectedRoleInfo.permissions.map((permission, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400"
                >
                  <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{permission}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
