import * as React from "react";
import { cn } from "@/lib/utils";
import { Empty } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Empty className={cn("py-8", className)}>
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {Icon && (
          <div className="rounded-full bg-muted p-4">
            <Icon className="size-8 text-muted-foreground" />
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground max-w-md">
              {description}
            </p>
          )}
        </div>

        {action && (
          <Button onClick={action.onClick} variant="default">
            {action.icon && <action.icon className="mr-2 size-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </Empty>
  );
}
