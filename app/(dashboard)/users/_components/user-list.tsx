import { UserCard } from "./user-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Users } from "lucide-react";

interface UserListProps {
  users: Array<{
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
  }>;
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users found"
        description="No users match your current filters. Try adjusting your search criteria."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
