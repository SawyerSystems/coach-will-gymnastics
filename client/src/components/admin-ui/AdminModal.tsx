import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "./AdminCard";
import { cn } from "@/lib/utils";
import { X, ChevronDown, ChevronUp } from "lucide-react";
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
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const gradientClasses = {
  blue: "bg-gradient-to-r from-white to-blue-50 border-blue-100 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40",
  purple: "bg-gradient-to-r from-white to-purple-50 border-purple-100 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40", 
  green: "bg-gradient-to-r from-white to-green-50 border-green-100 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40",
  amber: "bg-gradient-to-r from-white to-amber-50 border-amber-100 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40",
  red: "bg-gradient-to-r from-white to-red-50 border-red-100 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40",
  gray: "bg-gradient-to-r from-white to-gray-50 border-gray-200 dark:from-[#0F0276]/20 dark:to-[#0F0276]/30 dark:border-[#2A4A9B]/40"
};

const titleColorClasses = {
  blue: "text-blue-800 dark:text-blue-200",
  purple: "text-purple-800 dark:text-blue-200",
  green: "text-green-800 dark:text-blue-200", 
  amber: "text-amber-800 dark:text-blue-200",
  red: "text-red-800 dark:text-blue-200",
  gray: "text-gray-800 dark:text-blue-200"
};

export function AdminModalSection({ 
  title, 
  icon, 
  gradient = "blue", 
  children, 
  className,
  collapsible = false,
  isExpanded = true,
  onToggle,
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
      <div 
        className={cn(
          "font-semibold flex items-center gap-2 mb-3",
          titleColorClasses[gradient],
          collapsible && "cursor-pointer hover:opacity-75 transition-opacity"
        )}
        onClick={collapsible ? onToggle : undefined}
      >
        {icon}
        {title}
        {collapsible && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        )}
      </div>
      {(!collapsible || isExpanded) && children}
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
    <div className={cn("flex items-center justify-between bg-white bg-opacity-70 p-2 rounded-lg dark:bg-[#0F0276]/40 dark:bg-opacity-60", className)}>
      <span className="font-medium text-gray-700 flex items-center gap-1.5 dark:text-blue-200">
        {icon}
        {label}:
      </span>
      <span className="text-gray-900 text-right dark:text-blue-100">{value}</span>
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
