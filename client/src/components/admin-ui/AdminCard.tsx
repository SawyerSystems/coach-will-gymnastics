import * as React from "react";
import { cn } from "@/lib/utils";

export interface AdminCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminCard({ className, ...props }: AdminCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90",
        className
      )}
      {...props}
    />
  );
}

export function AdminCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-4 py-3 sm:px-6 sm:py-4", className)} {...props} />;
}

export function AdminCardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-bold text-[#0F0276] dark:text-white", className)} {...props} />;
}

export function AdminCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-6", className)} {...props} />;
}
