import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { userRepository } from "@/lib/db/repositories";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { Card, CardContent } from "@/components/ui/card";
import { UserEditForm } from "./_components/user-edit-form";
import { formatUserName } from "@/lib/utils/user";

interface UserEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserEditPage({ params }: UserEditPageProps) {
  // Check authentication and permissions
  const session = await auth.api.getSession({
    headers: await import("next/headers").then((m) => m.headers()),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMINISTRATOR can edit users
  const currentUser = await userRepository.findById(session.user.id);
  if (!currentUser || currentUser.role !== "ADMINISTRATOR") {
    redirect("/dashboard");
  }

  // Fetch user to edit
  const { id } = await params;
  const user = await userRepository.findById(id);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit User: ${formatUserName(user.name)}`}
        description="Update user information, role, and account status"
      />

      <Card>
        <CardContent className="pt-6">
          <Suspense fallback={<LoadingState />}>
            <UserEditForm user={user} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
