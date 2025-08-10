import * as React from "react";
import { cn } from "@/lib/utils";

export function AdminTable({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={cn(
        "w-full text-sm rounded-xl overflow-hidden border border-slate-200/60 bg-white/60 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30",
        className
      )}
      {...props}
    />
  );
}

export function AdminThead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-white/60 dark:bg-white/10", className)} {...props} />;
}

export function AdminTh({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("text-left p-3 font-semibold text-[#0F0276] dark:text-white", className)} {...props} />;
}

export function AdminTd({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-3 border-t border-slate-200/40 dark:border-white/10", className)} {...props} />;
}
