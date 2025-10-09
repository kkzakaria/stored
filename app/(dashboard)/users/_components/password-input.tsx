"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getPasswordStrength } from "@/lib/utils/user";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  showStrength?: boolean;
  error?: string;
  required?: boolean;
}

export function PasswordInput({
  value,
  onChange,
  label = "Password",
  placeholder = "Enter password",
  showStrength = true,
  error,
  required = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const strength = showStrength && value ? getPasswordStrength(value) : null;

  return (
    <div className="space-y-2">
      <Label htmlFor="password">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn("pr-10", error && "border-red-500")}
          required={required}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-gray-400" />
          ) : (
            <Eye className="h-4 w-4 text-gray-400" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>

      {/* Password Strength Indicator */}
      {strength && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-300", strength.color)}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[70px]">
              {strength.label}
            </span>
          </div>

          {/* Suggestions */}
          {strength.suggestions.length > 0 && (
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              {strength.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
