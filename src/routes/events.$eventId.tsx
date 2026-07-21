import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate } from "@/lib/money";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState, SectionCard } from "@/components/cards/StatCard";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const { t } = useT();
  const data = useStore((s) => s);
  const ev = data.events.find((e) => e.id === eventId);
  if (!ev) {
    return (
      <PublicShell title={t("welfareEvents")}>
        <EmptyState message="Event not found" />
        <Link to="/events" className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </PublicShell>
    );
  }
  const family = data.families.find((f) => f.id === ev.familyId);
  const expenses = data.expenses.filter((e) => e.eventId === ev.id);
  const specialColl = data.collections.filter((c) => c.eventId === ev.id);
  const totalExpense = expenses.reduce((a, b) => a + b.amount, 0);
  const totalSpecial = specialColl.reduce((a, b) => a + b.amount, 0);
  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";

  return (
    <PublicShell title={family?.name ?? "Event"}>
      <Link
        to="/events"
        className="mb-2 sm:mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground"
      >
        <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        Back
      </Link>
      <div className="card-soft p-3 sm:p-4">
        <Badge className="mb-2 text-[10px] sm:text-xs">{t("bereavement")}</Badge>
        <div className="text-base sm:text-lg font-semibold">{family?.name}</div>
        <div className="text-[11px] text-muted-foreground sm:text-xs">
          {family?.head} · {formatDate(ev.eventDate)}
        </div>
        <p className="mt-2 text-xs sm:text-sm">{ev.description}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="rounded-xl bg-destructive/10 p-2 sm:p-3 text-destructive">
            <div className="text-[10px] uppercase">{t("totalExpenses")}</div>
            <div className="text-base sm:text-lg font-bold">{formatRs(totalExpense)}</div>
          </div>
          <div className="rounded-xl bg-success/10 p-2 sm:p-3 text-success">
            <div className="text-[10px] uppercase">
              {t("special")} {t("collections").toLowerCase()}
            </div>
            <div className="text-base sm:text-lg font-bold">{formatRs(totalSpecial)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <SectionCard title={t("expenses")}>
          {expenses.length === 0 ? (
            <EmptyState message={t("noData")} />
          ) : (
            <ul className="divide-y divide-border/60">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2 sm:py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium">{t(e.category)}</div>
                    <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                      {e.description ?? formatDate(e.date)}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-destructive">
                    −{formatRs(e.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={`${t("special")} ${t("collections")}`}>
          {specialColl.length === 0 ? (
            <EmptyState message={t("noData")} />
          ) : (
            <ul className="divide-y divide-border/60">
              {specialColl.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 sm:py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-medium">{familyName(c.familyId)}</div>
                    <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                      {formatDate(c.date)}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-success">
                    +{formatRs(c.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </PublicShell>
  );
}
