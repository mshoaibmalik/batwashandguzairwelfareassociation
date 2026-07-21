import { useState } from "react";
import { Link } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore, familyTotals } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate } from "@/lib/money";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/cards/StatCard";

export default function FamiliesPage() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [q, setQ] = useState("");
  const list = data.families.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.head.toLowerCase().includes(q.toLowerCase()));
  return (
    <PublicShell title={t("families")}>
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-10 pl-9 sm:h-11" placeholder={t("search") + "…"} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {list.length === 0 ? <EmptyState message={t("noData")} /> : (
          <ul className="space-y-2 sm:space-y-3">
            {list.map((f) => {
              const tot = familyTotals(f.id, data);
              return (
                <li key={f.id} className="card-soft p-3 sm:p-4">
                  <Link to={`/families/${f.id}`} className="flex items-start justify-between gap-2 sm:gap-3 hover:bg-muted/30 -mx-1 px-1 py-1 rounded-xl transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="truncate text-sm font-semibold text-primary">{f.name}</div>
                        <Badge variant={f.status === "active" ? "default" : "secondary"} className="h-3.5 px-1.5 text-[9px] sm:h-4 sm:text-[10px]">{t(f.status)}</Badge>
                      </div>
                      <div className="truncate text-[11px] text-muted-foreground sm:text-[12px]">{f.head}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-base font-bold text-primary">{formatRs(tot.total)}</div>
                      <div className="text-[9px] text-muted-foreground sm:text-[10px]">{t("contribution")}</div>
                    </div>
                  </Link>
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-[10px] sm:mt-3 sm:gap-2 sm:text-[11px]">
                    <div className="rounded-lg bg-muted/60 p-1.5 sm:p-2">
                      <div className="text-muted-foreground">{t("monthly")}</div>
                      <div className="font-semibold">{formatRs(tot.monthly)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-1.5 sm:p-2">
                      <div className="text-muted-foreground">{t("special")}</div>
                      <div className="font-semibold">{formatRs(tot.special)}</div>
                    </div>
                    <div className="rounded-lg bg-muted/60 p-1.5 sm:p-2">
                      <div className="text-muted-foreground">{t("lastContribution")}</div>
                      <div className="font-semibold">{formatDate(tot.last)}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PublicShell>
  );
}
