import { Link } from "react-router-dom";
import { Wallet, Receipt, Users, HeartHandshake, TrendingUp, TrendingDown } from "lucide-react";
import { PublicShell } from "@/components/layout/PublicShell";
import { StatCard, SectionCard, EmptyState } from "@/components/cards/StatCard";
import { useFundSummary, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate } from "@/lib/money";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { t } = useT();
  const sum = useFundSummary();
  const data = useStore((s) => s);
  const recentColl = [...data.collections].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentExp = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const recentEv = [...data.events].sort((a, b) => b.eventDate.localeCompare(a.eventDate)).slice(0, 3);
  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";
  const eventLabel = (id: string) => {
    const e = data.events.find((x) => x.id === id);
    return e ? `${familyName(e.familyId)} · ${formatDate(e.eventDate)}` : "—";
  };

  return (
    <PublicShell>
      <div className="space-y-3 sm:space-y-4">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-glow p-4 text-primary-foreground shadow-card sm:p-5">
          <div className="text-[10px] font-medium uppercase tracking-wide opacity-80 sm:text-xs">{t("fundBalance")}</div>
          <div className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">{formatRs(sum.balance)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2">
              <div className="flex items-center gap-1 opacity-90"><TrendingUp className="h-3 w-3" />{t("totalCollections")}</div>
              <div className="mt-0.5 font-semibold">{formatRs(sum.totalCollections)}</div>
            </div>
            <div className="rounded-xl bg-white/15 p-2">
              <div className="flex items-center gap-1 opacity-90"><TrendingDown className="h-3 w-3" />{t("totalExpenses")}</div>
              <div className="mt-0.5 font-semibold">{formatRs(sum.totalExpenses)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <StatCard label={t("totalFamilies")} value={sum.totalFamilies} icon={Users} tone="success" hint={`${sum.activeFamilies} ${t("active").toLowerCase()}`} />
          <StatCard label={t("welfareEvents")} value={sum.totalEvents} icon={HeartHandshake} tone="warning" />
        </div>

        <SectionCard
          title={t("recentCollections")}
          action={<Link to="/collections" className="text-xs font-medium text-primary">{t("viewAll")}</Link>}
        >
          {recentColl.length === 0 ? <EmptyState message={t("noData")} /> : (
            <ul className="divide-y divide-border/60">
              {recentColl.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 sm:py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium sm:text-sm">{familyName(c.familyId)}</div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground sm:text-[11px]">
                      <span>{formatDate(c.date)}</span>
                      <Badge variant="secondary" className="h-3.5 px-1.5 text-[9px] sm:h-4 sm:text-[10px]">{t(c.type)}</Badge>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-semibold text-success sm:text-sm">+{formatRs(c.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={t("recentExpenses")}
          action={<Link to="/expenses" className="text-xs font-medium text-primary">{t("viewAll")}</Link>}
        >
          {recentExp.length === 0 ? <EmptyState message={t("noData")} /> : (
            <ul className="divide-y divide-border/60">
              {recentExp.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{eventLabel(e.eventId)}</div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span>{formatDate(e.date)}</span>
                      <Badge variant="outline" className="h-4 px-1.5 text-[10px]">{t(e.category)}</Badge>
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-destructive">−{formatRs(e.amount)}</div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title={t("recentEvents")}
          action={<Link to="/events" className="text-xs font-medium text-primary">{t("viewAll")}</Link>}
        >
          {recentEv.length === 0 ? <EmptyState message={t("noData")} /> : (
            <ul className="space-y-2">
              {recentEv.map((e) => (
                <li key={e.id}>
                  <Link to={`/events/${e.id}`} className="flex items-center justify-between rounded-xl border border-border/60 p-3 hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{familyName(e.familyId)}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{e.description}</div>
                    </div>
                    <div className="shrink-0 text-[11px] text-muted-foreground">{formatDate(e.eventDate)}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </PublicShell>
  );
}