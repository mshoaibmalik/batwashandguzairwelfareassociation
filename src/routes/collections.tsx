import { useState } from "react";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate, formatMonth } from "@/lib/money";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

export default function Collections() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [tab, setTab] = useState<"monthly" | "special">("monthly");
  const [q, setQ] = useState("");
  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";

  const filtered = data.collections
    .filter((c) => c.type === tab)
    .filter((c) => !q || familyName(c.familyId).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <PublicShell>
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">{t("collections")}</h2>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly" className="text-xs sm:text-sm">
              {t("monthly")}
            </TabsTrigger>
            <TabsTrigger value="special" className="text-xs sm:text-sm">
              {t("special")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
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
          {filtered.map((c) => (
            <div key={c.id} className="card-soft p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{familyName(c.familyId)}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.monthsCovered.map((m) => (
                      <Badge
                        key={m}
                        variant="secondary"
                        className="h-3.5 px-1.5 text-[9px] sm:h-4 sm:text-[10px]"
                      >
                        {formatMonth(m)}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
                    {formatDate(c.date)}
                  </div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-success">
                  +{formatRs(c.amount)}
                </div>
              </div>
              {c.notes && (
                <div className="mt-1.5 text-[10px] text-muted-foreground sm:text-[11px]">
                  {c.notes}
                </div>
              )}
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
