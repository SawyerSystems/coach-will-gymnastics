import * as React from "react";
import { cn } from "@/lib/utils";

export interface MetricCard {
  key: string;
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "orange" | "slate" | "indigo" | "red" | "amber";
}

const colorMap: Record<NonNullable<MetricCard["color"]>, { wrapper: string; title: string; iconBg: string; value: string; hint: string }> = {
  blue:   { wrapper: "from-blue-50 via-blue-25 to-blue-50/30",   title: "text-blue-800",   iconBg: "bg-blue-100",   value: "text-blue-900",   hint: "text-blue-600" },
  green:  { wrapper: "from-green-50 via-green-25 to-green-50/30", title: "text-green-800",  iconBg: "bg-green-100",  value: "text-green-900",  hint: "text-green-600" },
  orange: { wrapper: "from-orange-50 via-orange-25 to-orange-50/30", title: "text-orange-800", iconBg: "bg-orange-100", value: "text-orange-900", hint: "text-orange-600" },
  slate:  { wrapper: "from-slate-50 via-slate-25 to-slate-50/30", title: "text-slate-800",  iconBg: "bg-slate-100",  value: "text-slate-900",  hint: "text-slate-600" },
  indigo: { wrapper: "from-indigo-50 via-indigo-25 to-indigo-50/30", title: "text-indigo-800", iconBg: "bg-indigo-100", value: "text-indigo-900", hint: "text-indigo-700" },
  red:    { wrapper: "from-red-50 via-red-25 to-red-50/30",     title: "text-red-800",    iconBg: "bg-red-100",    value: "text-red-900",    hint: "text-red-600" },
  amber:  { wrapper: "from-amber-50 via-amber-25 to-amber-50/30", title: "text-amber-800",  iconBg: "bg-amber-100",  value: "text-amber-900",  hint: "text-amber-700" },
};

export interface AdminAnalyticsMetricsProps extends React.HTMLAttributes<HTMLDivElement> {
  metrics: MetricCard[];
  columns?: { base?: number; sm?: number; lg?: number };
}

export function AdminAnalyticsMetrics({ metrics, columns, className, ...props }: AdminAnalyticsMetricsProps) {
  const colClasses = cn(
    `grid grid-cols-${columns?.base || 1} sm:grid-cols-${columns?.sm || 2} lg:grid-cols-${columns?.lg || 4} gap-6`,
  );

  return (
    <div className={cn(colClasses, className)} {...props}>
      {metrics.map((m) => {
        const c = colorMap[m.color || "slate"];
        return (
          <div key={m.key} className={cn("relative rounded-xl border-0 bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300", c.wrapper)}>
            <div className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-5">
              <div>
                <div className={cn("text-sm font-semibold", c.title)}>{m.label}</div>
              </div>
              {m.icon && <div className={cn("p-2 rounded-lg", c.iconBg)}>{m.icon}</div>}
            </div>
            <div className="px-4 sm:px-5 pb-4 sm:pb-5">
              <div className={cn("text-3xl font-black", c.value)}>{m.value}</div>
              {m.hint && <p className={cn("text-xs mt-1 font-medium", c.hint)}>{m.hint}</p>}
            </div>
            {/* Optional pulse dot for live metrics */}
            <div className="absolute top-2 right-2">
              <div className="w-2 h-2 bg-gray-400/70 rounded-full"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
