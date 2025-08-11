import * as React from "react";
import { cn } from "@/lib/utils";

export function ParentStatsGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8",
        className
      )}
      {...props}
    />
  );
}

export interface ParentStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: "purple" | "blue" | "green" | "red" | "orange" | "indigo";
}

const colorVariants = {
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30",
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
    labelColor: "text-purple-600 dark:text-purple-400",
    valueColor: "text-purple-800 dark:text-white",
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30",
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
    labelColor: "text-blue-600 dark:text-blue-400",
    valueColor: "text-blue-800 dark:text-white",
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30",
    iconBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-600 dark:text-green-400",
    labelColor: "text-green-600 dark:text-green-400",
    valueColor: "text-green-800 dark:text-white",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30",
    iconBg: "bg-red-100 dark:bg-red-900/50",
    iconColor: "text-red-600 dark:text-red-400",
    labelColor: "text-red-600 dark:text-red-400",
    valueColor: "text-red-800 dark:text-white",
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/30",
    iconBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-600 dark:text-orange-400",
    labelColor: "text-orange-600 dark:text-orange-400",
    valueColor: "text-orange-800 dark:text-white",
  },
  indigo: {
    bg: "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    labelColor: "text-indigo-600 dark:text-indigo-400",
    valueColor: "text-indigo-800 dark:text-white",
  },
};

export function ParentStatCard({ 
  className, 
  icon, 
  label, 
  value, 
  color = "purple",
  ...props 
}: ParentStatCardProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        "border-0 shadow-md overflow-hidden rounded-2xl",
        colors.bg,
        className
      )}
      {...props}
    >
      <div className="pt-6 pb-6 px-6">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full", colors.iconBg)}>
            <div className={cn("h-6 w-6", colors.iconColor)}>
              {icon}
            </div>
          </div>
          <div>
            <p className={cn("text-sm font-medium", colors.labelColor)}>{label}</p>
            <p className={cn("text-2xl font-bold", colors.valueColor)}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
