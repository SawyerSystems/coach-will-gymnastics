import * as React from "react";
import { cn } from "@/lib/utils";

export function ParentMainContainer({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        // Main container with blue-themed gradient background matching admin
        "min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-[#0F0276] dark:via-[#1e293b] dark:to-[#0F0276]",
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
        "text-2xl sm:text-3xl font-bold text-[#0F0276] dark:text-white mb-2",
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
        "text-[#0F0276]/80 dark:text-white/70",
        className
      )}
      {...props}
    />
  );
}