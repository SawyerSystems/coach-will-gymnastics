import * as React from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ParentTabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

export function ParentTabs({ defaultValue, children, className }: ParentTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      {children}
    </Tabs>
  );
}

export function ParentTabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TabsList
      className={cn(
        "grid w-full rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 p-2 dark:bg-purple-900/30 dark:border-purple-400/20",
        className
      )}
      {...props}
    />
  );
}

export interface ParentTabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function ParentTabsTrigger({ className, value, ...props }: ParentTabsTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "rounded-xl font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md text-blue-800 dark:text-purple-300 dark:data-[state=active]:text-white",
        className
      )}
      {...props}
    />
  );
}

export function ParentTabsContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <TabsContent
      className={cn(
        "mt-6 focus:outline-none",
        className
      )}
      {...props}
    />
  );
}
