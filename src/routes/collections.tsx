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
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight">{t("collections")}</h2>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="monthly" className="flex-1">{t("monthly")}</TabsTrigger>
            <TabsTrigger value="special" className="flex-1">{t("special")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("search")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/60 p-3">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{familyName(c.familyId)}</div>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {c.monthsCovered.map((m) => (
                      <Badge key={m} variant="secondary" className="h-4 px-1.5 text-[10px]">{formatMonth(m)}</Badge>
                    ))}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{formatDate(c.date)}</div>
                </div>
                <div className="shrink-0 text-sm font-semibold text-success">+{formatRs(c.amount)}</div>
              </div>
              {c.notes && <div className="mt-1.5 text-[11px] text-muted-foreground">{c.notes}</div>}
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