"use client";

import { useState } from "react";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RoleSelector } from "./role-selector";
import { PasswordInput } from "./password-input";
import { isPasswordValid } from "@/lib/utils/user";

interface UserFormProps {
  defaultValues?: {
    name: string;
    email: string;
    role: UserRole;
    active: boolean;
  };
  onSubmit: (data: {
    name: string;
    email: string;
    role: UserRole;
    password?: string;
    active: boolean;
  }) => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function UserForm({
  defaultValues,
  onSubmit,
  isLoading = false,
  mode,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    email: defaultValues?.email || "",
    role: defaultValues?.role || ("USER" as UserRole),
    password: "",
    active: defaultValues?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation for create mode
    if (mode === "create") {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!isPasswordValid(formData.password)) {
        newErrors.password = "Password must be at least 8 characters";
      }
    }

    // Password validation for edit mode (optional)
    if (mode === "edit" && formData.password && !isPasswordValid(formData.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    const submitData: {
      name: string;
      email: string;
      role: UserRole;
      password?: string;
      active: boolean;
    } = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      role: formData.role,
      active: formData.active,
    };

    // Only include password if it's provided
    if (formData.password) {
      submitData.password = formData.password;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setErrors({ ...errors, name: "" });
          }}
          placeholder="Enter full name"
          required
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setErrors({ ...errors, email: "" });
          }}
          placeholder="user@example.com"
          required
          disabled={mode === "edit"} // Email cannot be changed
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        {mode === "edit" && (
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        )}
      </div>

      {/* Role */}
      <RoleSelector
        value={formData.role}
        onChange={(role) => setFormData({ ...formData, role })}
        required
      />

      {/* Password */}
      <PasswordInput
        value={formData.password}
        onChange={(password) => {
          setFormData({ ...formData, password });
          setErrors({ ...errors, password: "" });
        }}
        label={mode === "create" ? "Password" : "New Password (optional)"}
        placeholder={
          mode === "create" ? "Enter password" : "Leave empty to keep current"
        }
        showStrength
        error={errors.password}
        required={mode === "create"}
      />

      {/* Active Status */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="active-status" className="cursor-pointer">
            Active Status
          </Label>
          <p className="text-sm text-gray-500">
            {formData.active
              ? "User can log in and access the system"
              : "User account is disabled"}
          </p>
        </div>
        <Switch
          id="active-status"
          checked={formData.active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, active: checked })
          }
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create User"
              : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
