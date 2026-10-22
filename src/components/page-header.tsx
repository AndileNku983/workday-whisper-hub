import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-destructive/12 text-destructive",
  high: "bg-warning/15 text-warning",
  medium: "bg-violet-soft text-accent-foreground",
  normal: "bg-violet-soft text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

export function PriorityBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${PRIORITY_STYLES[value] ?? PRIORITY_STYLES.low}`}>
      {value}
    </span>
  );
}
