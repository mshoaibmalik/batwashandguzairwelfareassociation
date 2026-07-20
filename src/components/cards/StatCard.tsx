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
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-card ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">{label}</div>
          <div className="mt-1 truncate text-xl font-bold leading-tight">{value}</div>
          {hint ? <div className="mt-0.5 text-[11px] opacity-80">{hint}</div> : null}
        </div>
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15">
          <Icon className="h-5 w-5" />
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
  return (
    <div className="py-8 text-center text-sm text-muted-foreground">{message}</div>
  );
}
