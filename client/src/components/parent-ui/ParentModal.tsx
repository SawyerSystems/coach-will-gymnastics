import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface ParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg", 
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
};

export function ParentModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  size = "md" 
}: ParentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "rounded-2xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md shadow-lg dark:border-white/10 dark:bg-white/10",
          sizeClasses[size]
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-[#0F0276] dark:text-white font-bold text-xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function ParentModalSection({ className, title, children, ...props }: {
  className?: string;
  title?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {title && (
        <h3 className="font-semibold text-[#0F0276] dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

export function ParentModalGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4",
        className
      )}
      {...props}
    />
  );
}

export function ParentModalDetailRow({ label, value, className }: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4", className)}>
      <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
        {label}
      </span>
      <span className="text-[#0F0276] dark:text-white text-sm sm:text-right">
        {value}
      </span>
    </div>
  );
}
