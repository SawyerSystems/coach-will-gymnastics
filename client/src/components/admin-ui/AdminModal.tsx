import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "./AdminCard";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AdminButton } from "./AdminButton";

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl", 
  "4xl": "max-w-4xl",
  full: "max-w-full"
};

export function AdminModal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "2xl",
  className,
  showCloseButton = true,
  footer
}: AdminModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          sizeClasses[size],
          "max-h-[90vh] overflow-y-auto p-0 gap-0 bg-transparent border-none shadow-none",
          className
        )}
      >
        <AdminCard className="w-full">
          <AdminCardHeader className="flex flex-row items-center justify-between pb-4">
            <AdminCardTitle className="text-xl">{title}</AdminCardTitle>
            {showCloseButton && (
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </AdminButton>
            )}
          </AdminCardHeader>
          <AdminCardContent className="pt-0">
            {children}
          </AdminCardContent>
          {footer && (
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              {footer}
            </div>
          )}
        </AdminCard>
      </DialogContent>
    </Dialog>
  );
}

export interface AdminModalSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  gradient?: "blue" | "purple" | "green" | "amber" | "red" | "gray";
  children: React.ReactNode;
}

const gradientClasses = {
  blue: "bg-gradient-to-r from-white to-blue-50 border-blue-100",
  purple: "bg-gradient-to-r from-white to-purple-50 border-purple-100", 
  green: "bg-gradient-to-r from-white to-green-50 border-green-100",
  amber: "bg-gradient-to-r from-white to-amber-50 border-amber-100",
  red: "bg-gradient-to-r from-white to-red-50 border-red-100",
  gray: "bg-gradient-to-r from-white to-gray-50 border-gray-200"
};

const titleColorClasses = {
  blue: "text-blue-800",
  purple: "text-purple-800",
  green: "text-green-800", 
  amber: "text-amber-800",
  red: "text-red-800",
  gray: "text-gray-800"
};

export function AdminModalSection({ 
  title, 
  icon, 
  gradient = "blue", 
  children, 
  className,
  ...props 
}: AdminModalSectionProps) {
  return (
    <div 
      className={cn(
        "p-3 sm:p-4 rounded-xl border shadow-sm",
        gradientClasses[gradient],
        className
      )}
      {...props}
    >
      <h4 className={cn(
        "font-semibold flex items-center gap-2 mb-3",
        titleColorClasses[gradient]
      )}>
        {icon}
        {title}
      </h4>
      {children}
    </div>
  );
}

export function AdminModalDetailRow({ 
  label, 
  value, 
  icon,
  className 
}: { 
  label: string; 
  value: React.ReactNode; 
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between bg-white bg-opacity-70 p-2 rounded-lg", className)}>
      <span className="font-medium text-gray-700 flex items-center gap-1.5">
        {icon}
        {label}:
      </span>
      <span className="text-gray-900 text-right">{value}</span>
    </div>
  );
}

export function AdminModalGrid({ 
  children, 
  cols = 1,
  className 
}: { 
  children: React.ReactNode; 
  cols?: 1 | 2 | 3;
  className?: string;
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  };

  return (
    <div className={cn("grid gap-4 sm:gap-6", colClasses[cols], className)}>
      {children}
    </div>
  );
}
