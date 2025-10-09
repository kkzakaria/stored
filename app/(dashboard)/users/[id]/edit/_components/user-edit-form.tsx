"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserForm } from "../../../_components/user-form";
import { updateUser } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import Link from "next/link";

interface UserEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
  };
}

export function UserEditForm({ user }: UserEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    active: boolean;
  }) => {
    setIsLoading(true);

    try {
      const updateData: {
        id: string;
        name?: string;
        role?: UserRole;
        active?: boolean;
        password?: string;
      } = {
        id: user.id,
        name: data.name !== user.name ? data.name : undefined,
        role: data.role !== user.role ? data.role : undefined,
        active: data.active !== user.active ? data.active : undefined,
      };

      // Only include password if it was provided
      if (data.password) {
        updateData.password = data.password;
      }

      const result = await updateUser(updateData);

      if (result?.serverError || result?.validationErrors) {
        toast.error(result.serverError || "Validation failed");
        return;
      }

      toast.success("User updated successfully");
      router.push(`/users/${user.id}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Update user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <UserForm
        mode="edit"
        defaultValues={{
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        }}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      <div className="flex justify-start">
        <Button asChild variant="outline">
          <Link href={`/users/${user.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User Details
          </Link>
        </Button>
      </div>
    </div>
  );
}
