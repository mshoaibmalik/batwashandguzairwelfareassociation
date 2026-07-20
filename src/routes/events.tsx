import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate } from "@/lib/money";
import { EmptyState } from "@/components/cards/StatCard";
import { ChevronRight, HeartHandshake } from "lucide-react";

export default function EventsPage() {
  const { t } = useT();
  const data = useStore((s) => s);
  const sorted = [...data.events].sort((a, b) => b.eventDate.localeCompare(a.eventDate));
  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";

  return (
    <PublicShell>
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">{t("welfareEvents")}</h2>
        {sorted.length === 0 ? <EmptyState message={t("noData")} /> : (
          <ul className="space-y-2">
            {sorted.map((e) => (
              <li key={e.id}>
                <Link to={`/events/${e.id}`} className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/50">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{familyName(e.familyId)}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{e.description}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                    {formatDate(e.eventDate)}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicShell>
  );
}