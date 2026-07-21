import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "muted";
  hint?: string;
}) {
  const tones: Record<string, string> = {
    primary: "from-primary to-primary-glow text-primary-foreground",
    success: "from-success to-success/70 text-success-foreground",
    warning: "from-warning to-warning/70 text-warning-foreground",
    danger: "from-destructive to-destructive/70 text-destructive-foreground",
    muted: "from-muted to-muted text-foreground",
  };
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 sm:p-5 shadow-lg ${tones[tone]}`}
    >
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] sm:text-xs font-medium uppercase tracking-wide opacity-90">
            {label}
          </div>
          <div className="mt-1.5 text-lg sm:text-2xl font-bold leading-tight">{value}</div>
          {hint ? <div className="text-[10px] sm:text-xs opacity-80 mt-1">{hint}</div> : null}
        </div>
        <div className="shrink-0">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7 opacity-90" />
        </div>
      </div>
    </div>
  );
}

export function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="card-soft p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="py-8 text-center text-sm text-muted-foreground">{message}</div>;
}
