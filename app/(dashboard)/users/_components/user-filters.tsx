"use client";

import { Search, X } from "lucide-react";
import { UserRole } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { parseAsString, parseAsBoolean, useQueryStates } from "nuqs";
import { getAllRoles, getRoleInfo, getRoleIcon } from "@/lib/utils/user";
import { cn } from "@/lib/utils";

export function UserFilters() {
  const [filters, setFilters] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      role: parseAsString.withDefault(""),
      activeOnly: parseAsBoolean.withDefault(true),
    },
    { shallow: false }
  );

  const roles = getAllRoles();
  const hasActiveFilters = filters.search !== "" || filters.role !== "" || !filters.activeOnly;

  const handleReset = () => {
    setFilters({
      search: "",
      role: "",
      activeOnly: true,
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <Label htmlFor="role-filter">Role</Label>
          <Select
            value={filters.role || "all"}
            onValueChange={(value) => setFilters({ role: value === "all" ? "" : value })}
          >
            <SelectTrigger id="role-filter">
              <SelectValue placeholder="All roles">
                {filters.role ? (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const roleInfo = getRoleInfo(filters.role as UserRole);
                      const Icon = getRoleIcon(filters.role as UserRole);
                      return (
                        <>
                          <Icon className={cn("h-4 w-4", roleInfo.color)} />
                          <span>{roleInfo.label}</span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  "All roles"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => {
                const roleInfo = getRoleInfo(role);
                const Icon = getRoleIcon(role);
                return (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-4 w-4", roleInfo.color)} />
                      <span>{roleInfo.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Active Only Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="active-only" className="cursor-pointer">
            Active users only
          </Label>
          <Switch
            id="active-only"
            checked={filters.activeOnly}
            onCheckedChange={(checked) => setFilters({ activeOnly: checked })}
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        )}
      </div>
    </Card>
  );
}
