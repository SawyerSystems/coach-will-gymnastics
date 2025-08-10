import * as React from "react";
import { cn } from "@/lib/utils";

export type AdminButtonVariant =
  | "primary" // athletes tab style
  | "secondary" // glass outline
  | "destructive" // red gradient
  | "ghost"; // minimal

export interface AdminButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  size?: "sm" | "md" | "lg";
}

const base =
  "inline-flex items-center justify-center gap-2 select-none font-semibold transition-all duration-200 focus:outline-none disabled:opacity-60 disabled:pointer-events-none transform-gpu";

const sizes: Record<NonNullable<AdminButtonProps["size"]>, string> = {
  sm: "h-9 px-3 rounded-lg text-sm",
  md: "h-10 px-4 rounded-xl",
  lg: "h-12 px-6 rounded-2xl text-lg",
};

const variants: Record<AdminButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-[#0F0276] to-[#0F0276]/90 hover:from-[#0F0276]/90 hover:to-[#0F0276] text-white border-0 shadow-lg hover:shadow-xl",
  secondary:
    "border border-slate-200/60 bg-white/80 hover:bg-white/90 dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30 dark:hover:bg-[#0F0276]/50 backdrop-blur-sm",
  destructive:
    "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-md hover:shadow-lg",
  ghost:
    "bg-transparent hover:bg-white/50 dark:hover:bg-white/10",
};

export const AdminButton = React.forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, sizes[size], variants[variant], className)}
        {...props}
      />
    );
  }
);
AdminButton.displayName = "AdminButton";
