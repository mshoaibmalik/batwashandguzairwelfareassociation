import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PublicShell } from "@/components/layout/PublicShell";
import { useStore, familyTotals } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate, formatMonth } from "@/lib/money";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, Users } from "lucide-react";
import { EmptyState, SectionCard } from "@/components/cards/StatCard";
import { exportFamilyPaymentPdf } from "@/lib/export";

export default function FamilyDetail() {
  const { familyId } = useParams<{ familyId: string }>();
  const { t } = useT();
  const data = useStore((s) => s);
  const family = data.families.find((f) => f.id === familyId);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  if (!family) {
    return (
      <PublicShell title={t("families")}>
        <div className="space-y-4">
          <Link to="/families" className="inline-flex items-center gap-1 text-sm text-primary">
            <ArrowLeft className="h-4 w-4" />
            {t("families")}
          </Link>
          <EmptyState message="Family not found" />
        </div>
      </PublicShell>
    );
  }

  const totals = familyTotals(family!.id, data);
  const familyCollections = data.collections
    .filter((c) => c.familyId === family!.id)
    .filter((c) => selectedYear === "all" || c.date.startsWith(selectedYear))
    .sort((a, b) => b.date.localeCompare(a.date));

  const collectionsByYear = useMemo(() => {
    const grouped: Record<string, typeof familyCollections> = {};
    for (const c of familyCollections) {
      const year = c.date.slice(0, 4);
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(c);
    }
    return grouped;
  }, [familyCollections]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    data.collections
      .filter((c) => c.familyId === family!.id)
      .forEach((c) => years.add(c.date.slice(0, 4)));
    return Array.from(years).sort();
  }, [data.collections, family!.id]);

  function handleExportPdf() {
    const paymentsByYear: Record<string, any[]> = {};

    for (const c of familyCollections) {
      const year = c.date.slice(0, 4);
      if (!paymentsByYear[year]) paymentsByYear[year] = [];

      const payment: any = {
        date: formatDate(c.date),
        type: c.type,
        amount: c.amount,
        monthsCovered: c.monthsCovered,
        notes: c.notes,
      };

      if (c.type === "special" && c.eventId) {
        const ev = data.events.find((e) => e.id === c.eventId);
        if (ev) {
          const fam = data.families.find((f) => f.id === ev.familyId);
          payment.relatedEvent = `${t("bereavement")} - ${fam?.name || "—"}`;
        }
      }

      paymentsByYear[year].push(payment);
    }

    exportFamilyPaymentPdf({
      familyName: family!.name,
      familyHead: family!.head,
      familyPhone: family!.phone,
      familyAddress: family!.address,
      totalPaid: totals.total,
      totalMonthly: totals.monthly,
      totalSpecial: totals.special,
      lastContribution: formatDate(totals.last),
      paymentsByYear,
      filename: `${family!.name}-payment-history`,
    });
  }

  return (
    <PublicShell title={family.name}>
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/families"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            {t("families")}
          </Link>
          <Button size="sm" variant="outline" onClick={handleExportPdf} className="h-8 sm:h-9">
            <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{t("exportPdf")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="h-9 w-28 sm:w-32">
              <SelectValue placeholder={t("year")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="card-soft p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold">{family!.name}</h2>
              <p className="text-[11px] text-muted-foreground mt-1 sm:text-xs">
                {family!.head} · {family!.phone}
              </p>
              <p className="text-[11px] text-muted-foreground sm:text-xs">{family!.address}</p>
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium sm:text-xs ${
                family.status === "active"
                  ? "bg-success/10 text-success"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {t(family.status)}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground sm:text-[11px]">
            {t("dateCreated")}: {formatDate(family.createdAt)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <SectionCard title={t("totalPaid")}>
            <div className="text-xl sm:text-2xl font-bold text-primary">
              {formatRs(totals.total)}
            </div>
          </SectionCard>
          <SectionCard title={t("monthly")}>
            <div className="text-xl sm:text-2xl font-bold text-success">
              {formatRs(totals.monthly)}
            </div>
          </SectionCard>
          <SectionCard title={t("special")}>
            <div className="text-xl sm:text-2xl font-bold text-warning">
              {formatRs(totals.special)}
            </div>
          </SectionCard>
          <SectionCard title={t("lastContribution")}>
            <div className="text-base sm:text-lg font-semibold">{formatDate(totals.last)}</div>
          </SectionCard>
        </div>

        <SectionCard title={t("paymentHistory")}>
          {Object.keys(collectionsByYear).length === 0 ? (
            <EmptyState message={t("noData")} />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {Object.keys(collectionsByYear)
                .sort()
                .reverse()
                .map((year) => (
                  <div key={year} className="space-y-2">
                    <div className="border-b border-border/60 pb-2 text-xs sm:text-sm font-semibold">
                      {year}
                    </div>
                    <div className="space-y-2">
                      {collectionsByYear[year].map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-border/60 p-2.5 sm:p-3 space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium sm:text-sm">
                                {formatDate(c.date)}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span
                                  className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium sm:text-[10px] ${
                                    c.type === "monthly"
                                      ? "bg-primary/10 text-primary"
                                      : "bg-warning/10 text-warning"
                                  }`}
                                >
                                  {t(c.type)}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs sm:text-sm font-bold text-success">
                              +{formatRs(c.amount)}
                            </div>
                          </div>

                          {c.type === "monthly" && c.monthsCovered?.length > 0 && (
                            <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                              <span className="font-medium">{t("monthsCovered")}:</span>{" "}
                              {c.monthsCovered.map((m) => formatMonth(m)).join(", ")}
                            </div>
                          )}

                          {c.type === "special" && c.eventId && (
                            <div className="text-[10px] text-muted-foreground sm:text-[11px]">
                              <span className="font-medium">{t("relatedEvent")}:</span>{" "}
                              {(() => {
                                const ev = data.events.find((e) => e.id === c.eventId);
                                if (!ev) return "—";
                                const fam = data.families.find((f) => f.id === ev.familyId);
                                return `${t("bereavement")} - ${fam?.name || "—"}`;
                              })()}
                            </div>
                          )}

                          {c.notes && (
                            <div className="text-[10px] text-muted-foreground italic sm:text-[11px]">
                              {c.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </SectionCard>
      </div>
    </PublicShell>
  );
}
