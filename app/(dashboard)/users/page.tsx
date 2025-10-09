import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { userRepository } from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { UserList } from "./_components/user-list";
import { UserFilters } from "./_components/user-filters";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { UserRole } from "@prisma/client";
import {
  filterUsersByRole,
  filterUsersBySearch,
  filterUsersByStatus,
} from "@/lib/utils/user";

interface UsersPageProps {
  searchParams: Promise<{
    search?: string;
    role?: string;
    activeOnly?: string;
  }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
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

  // Parse search params
  const params = await searchParams;
  const search = params.search || "";
  const role = params.role || "";
  const activeOnly = params.activeOnly !== "false"; // Default to true

  // Fetch all users with counts
  const allUsers = await userRepository.findMany({
    include: {
      _count: {
        select: {
          warehouseAccess: true,
          movements: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Apply filters
  let filteredUsers = allUsers;

  // Filter by search
  if (search) {
    filteredUsers = filterUsersBySearch(filteredUsers, search);
  }

  // Filter by role
  if (role) {
    filteredUsers = filterUsersByRole(filteredUsers, role as UserRole);
  }

  // Filter by active status
  filteredUsers = filterUsersByStatus(filteredUsers, activeOnly);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
        actions={<CreateUserDialog />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<LoadingState variant="skeleton" />}>
            <UserFilters />
          </Suspense>
        </aside>

        {/* Users List */}
        <main className="lg:col-span-3">
          <Suspense fallback={<LoadingState />}>
            <UserList users={filteredUsers} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
