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
          "rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-md dark:border-purple-400/20 dark:bg-purple-900/90",
          sizeClasses[size]
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-blue-800 dark:text-white font-bold text-xl">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-blue-600/70 dark:text-purple-300">
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
        <h3 className="font-semibold text-blue-800 dark:text-white border-b border-slate-200/60 dark:border-purple-400/20 pb-2">
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
      <span className="font-medium text-blue-700 dark:text-purple-300 text-sm">
        {label}
      </span>
      <span className="text-blue-900 dark:text-white text-sm sm:text-right">
        {value}
      </span>
    </div>
  );
}
