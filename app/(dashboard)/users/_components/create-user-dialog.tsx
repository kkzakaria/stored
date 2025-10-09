"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserForm } from "./user-form";
import { createUser } from "@/lib/actions/user.actions";
import { toast } from "sonner";
import { UserRole } from "@prisma/client";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    active: boolean;
  }) => {
    if (!data.password) {
      toast.error("Password is required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await createUser({
        name: data.name,
        email: data.email,
        role: data.role,
        password: data.password,
      });

      if (result?.serverError || result?.validationErrors) {
        toast.error(result.serverError || "Validation failed");
        return;
      }

      toast.success("User created successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create user");
      console.error("Create user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. They will receive login credentials via email.
          </DialogDescription>
        </DialogHeader>
        <UserForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
