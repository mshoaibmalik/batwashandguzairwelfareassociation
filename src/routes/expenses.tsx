import { useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function Expenses() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [q, setQ] = useState("");
  const eventLabel = (id: string) => {
    const e = data.events.find((x) => x.id === id);
    const f = e ? data.families.find((x) => x.id === e.familyId) : null;
    return e ? `${f?.name ?? "—"} · ${formatDate(e.eventDate)}` : "—";
  };

  const filtered = data.expenses
    .filter((e) => !q || eventLabel(e.eventId).toLowerCase().includes(q.toLowerCase()) || t(e.category).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PublicShell>
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{t("expenses")}</h2>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 pl-9 sm:h-11"
          />
        </div>
        <div className="space-y-2 sm:space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="card-soft p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{eventLabel(e.eventId)}</div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-[11px]">
                    <span>{formatDate(e.date)}</span>
                    <Badge variant="outline" className="h-3.5 px-1.5 text-[9px] sm:h-4 sm:text-[10px]">{t(e.category)}</Badge>
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-destructive">−{formatRs(e.amount)}</div>
              </div>
              {e.description && <div className="mt-1.5 text-[10px] text-muted-foreground sm:text-[11px]">{e.description}</div>}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">{t("noData")}</div>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
