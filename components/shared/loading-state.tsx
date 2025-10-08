import * as React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "inline";
  text?: string;
  fullPage?: boolean;
  rows?: number;
  className?: string;
}

export function LoadingState({
  variant = "spinner",
  text = "Chargement...",
  fullPage = false,
  rows = 5,
  className,
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Spinner className="size-4" />
        {text && <span>{text}</span>}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            className={cn(
              "h-12 w-full",
              index === 0 && "h-8" // First row is usually header
            )}
          />
        ))}
      </div>
    );
  }

  // Spinner variant (default)
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <Spinner className="size-8" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
