import * as React from "react";
import { cn } from "@/lib/utils";

export function ParentMainContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Main container with purple-themed gradient background
        "min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20",
        className
      )}
      {...props}
    />
  );
}

export function ParentContentContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "container mx-auto px-4 sm:px-6 py-6 sm:py-8",
        className
      )}
      {...props}
    />
  );
}

export function ParentPageHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mb-8",
        className
      )}
      {...props}
    />
  );
}

export function ParentPageTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-2xl sm:text-3xl font-bold text-blue-800 dark:text-white mb-2",
        className
      )}
      {...props}
    />
  );
}

export function ParentPageSubtitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-blue-600/80 dark:text-purple-300",
        className
      )}
      {...props}
    />
  );
}
