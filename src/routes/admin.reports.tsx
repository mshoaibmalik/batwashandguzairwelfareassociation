import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useFundSummary, useStore, familyTotals } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate, formatMonth } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FileDown, FileSpreadsheet, Search } from "lucide-react";
import { exportExcel, exportPdf } from "@/lib/export";
import { SectionCard, EmptyState } from "@/components/cards/StatCard";

function groupBy<T>(arr: T[], key: (t: T) => string) {
  const out: Record<string, T[]> = {};
  for (const x of arr) {
    const k = key(x);
    (out[k] ??= []).push(x);
  }
  return out;
}

export default function ReportsPage() {
  const { t } = useT();
  const data = useStore((s) => s);
  const sum = useFundSummary();
  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";

  // Collection report (by month)
  const collByMonth = groupBy(data.collections, (c) => c.date.slice(0, 7));
  const collRows = Object.keys(collByMonth).sort().map((m) => {
    const total = collByMonth[m].reduce((a, b) => a + b.amount, 0);
    return [formatMonth(m), collByMonth[m].length, formatRs(total)];
  });

  const expByMonth = groupBy(data.expenses, (e) => e.date.slice(0, 7));
  const expRows = Object.keys(expByMonth).sort().map((m) => {
    const total = expByMonth[m].reduce((a, b) => a + b.amount, 0);
    return [formatMonth(m), expByMonth[m].length, formatRs(total)];
  });

  const famRows = data.families.map((f) => {
    const tot = familyTotals(f.id, data);
    return [f.name, f.head, formatRs(tot.monthly), formatRs(tot.special), formatRs(tot.total), formatDate(tot.last)];
  });

  const balanceRows = [
    ["Total Collections", formatRs(sum.totalCollections)],
    ["Total Expenses", formatRs(sum.totalExpenses)],
    ["Current Balance", formatRs(sum.balance)],
    ["Total Families", String(sum.totalFamilies)],
    ["Active Families", String(sum.activeFamilies)],
    ["Welfare Events", String(sum.totalEvents)],
  ];

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const allYears = new Set<number>();
    data.collections.forEach((c) => allYears.add(Number(c.date.slice(0, 4))));
    data.families.forEach((f) => allYears.add(Number(f.createdAt.slice(0, 4))));
    return Array.from(allYears).sort();
  }, [data.collections, data.families]);

  return (
    <AdminShell title={t("reports")}>
      <Tabs defaultValue="balance">
        <div className="w-full overflow-x-auto scrollbar-hide -mx-3 sm:mx-0 mb-3">
          <TabsList className="flex w-max min-w-full gap-1.5 px-3 sm:px-0">
            <TabsTrigger value="balance" className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-2 sm:py-2 whitespace-nowrap">Balance</TabsTrigger>
            <TabsTrigger value="coll" className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-2 sm:py-2 whitespace-nowrap">Coll.</TabsTrigger>
            <TabsTrigger value="exp" className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-2 sm:py-2 whitespace-nowrap">Exp.</TabsTrigger>
            <TabsTrigger value="fam" className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-2 sm:py-2 whitespace-nowrap">Fam.</TabsTrigger>
            <TabsTrigger value="insights" className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-2 sm:py-2 whitespace-nowrap">{t("collectionInsights")}</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="balance" className="mt-3">
          <Report title="Fund Balance" headers={["Metric", "Value"]} rows={balanceRows} filename="balance-report" />
        </TabsContent>
        <TabsContent value="coll" className="mt-3">
          <Report title="Collections by Month" headers={["Month", "Records", "Total"]} rows={collRows} filename="collections-report" />
        </TabsContent>
        <TabsContent value="exp" className="mt-3">
          <Report title="Expenses by Month" headers={["Month", "Records", "Total"]} rows={expRows} filename="expenses-report" />
        </TabsContent>
        <TabsContent value="fam" className="mt-3">
          <Report title="Family Contributions" headers={["Family", "Head", "Monthly", "Special", "Total", "Last"]} rows={famRows} filename="families-report" />
        </TabsContent>
        <TabsContent value="insights" className="mt-3">
          <CollectionInsights data={data} years={years} currentYear={currentYear} />
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}

function Report({ title, headers, rows, filename }: { title: string; headers: string[]; rows: (string | number)[][]; filename: string }) {
  return (
    <SectionCard
      title={title}
      action={
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-8" onClick={() => exportPdf({ title, headers, rows, filename })}><FileDown className="mr-1 h-3 w-3" />PDF</Button>
          <Button size="sm" variant="outline" className="h-8" onClick={() => exportExcel({ sheetName: title, headers, rows, filename })}><FileSpreadsheet className="mr-1 h-3 w-3" />Excel</Button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] uppercase text-muted-foreground">
              {headers.map((h) => <th key={h} className="py-2 pr-3 font-medium">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="py-6 text-center text-muted-foreground">No data</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="border-b border-border/40">
                {r.map((c, j) => <td key={j} className="py-2 pr-3">{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function CollectionInsights({ data, years, currentYear }: { data: any; years: number[]; currentYear: number }) {
  const { t } = useT();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [hoveredCell, setHoveredCell] = useState<{ familyId: string; month: string } | null>(null);

  const activeFamilies = useMemo(() => {
    return data.families.filter((f: any) => f.status === "active");
  }, [data.families]);

  const filteredFamilies = useMemo(() => {
    if (!searchQuery) return activeFamilies;
    return activeFamilies.filter((f: any) => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.head.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeFamilies, searchQuery]);

  const getPaymentStatus = (familyId: string, month: string) => {
    const monthStr = `${selectedYear}-${String(MONTHS.indexOf(month) + 1).padStart(2, "0")}`;
    const hasPayment = data.collections.some((c: any) => 
      c.familyId === familyId && 
      c.type === "monthly" && 
      c.monthsCovered?.includes(monthStr)
    );
    return hasPayment ? "paid" : "unpaid";
  };

  const getPaymentDetails = (familyId: string, month: string) => {
    const monthStr = `${selectedYear}-${String(MONTHS.indexOf(month) + 1).padStart(2, "0")}`;
    const collection = data.collections.find((c: any) => 
      c.familyId === familyId && 
      c.type === "monthly" && 
      c.monthsCovered?.includes(monthStr)
    );
    return collection;
  };

  const handleCellClick = (familyId: string, month: string) => {
    const status = getPaymentStatus(familyId, month);
    if (status === "paid") {
      const collection = getPaymentDetails(familyId, month);
      if (collection) {
        alert(`Payment Details:\n\nDate: ${formatDate(collection.date)}\nAmount: ${formatRs(collection.amount)}\nMonths Covered: ${collection.monthsCovered?.map((m: string) => formatMonth(m)).join(", ")}\nTransaction ID: ${collection.id}`);
      }
    } else {
      const family = data.families.find((f: any) => f.id === familyId);
      alert(`Payment not received for ${family?.name} - ${month} ${selectedYear}\n\nClick "Quick Add Collection" to record payment.`);
    }
  };

  const handleExportPdf = () => {
    const headers = ["Family", ...MONTHS.map(m => m.slice(0, 3))];
    const rows = filteredFamilies.map((f: any) => {
      const row = [f.name];
      MONTHS.forEach((month, idx) => {
        const isFuture = idx > currentMonth && selectedYear === currentYear;
        if (isFuture) {
          row.push("—");
        } else {
          const status = getPaymentStatus(f.id, month);
          row.push(status === "paid" ? "✔" : "✖");
        }
      });
      return row;
    });

    exportPdf({
      title: `Collection Insights - ${selectedYear}`,
      headers,
      rows,
      filename: `collection-insights-${selectedYear}`,
    });
  };

  const handleExportExcel = () => {
    const headers = ["Family", ...MONTHS.map(m => m.slice(0, 3))];
    const rows = filteredFamilies.map((f: any) => {
      const row = [f.name];
      MONTHS.forEach((month, idx) => {
        const isFuture = idx > currentMonth && selectedYear === currentYear;
        if (isFuture) {
          row.push("N/A");
        } else {
          const status = getPaymentStatus(f.id, month);
          row.push(status === "paid" ? "Paid" : "Unpaid");
        }
      });
      return row;
    });

    exportExcel({
      sheetName: `Collection Insights ${selectedYear}`,
      headers,
      rows,
      filename: `collection-insights-${selectedYear}`,
    });
  };

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("search") + "..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
            <SelectTrigger className="h-10 w-full sm:w-auto sm:min-w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("all")}</SelectItem>
              <SelectItem value="paid">{t("paid")}</SelectItem>
              <SelectItem value="unpaid">{t("unpaid")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-success"></div>
              <span>{t("paid")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-destructive"></div>
              <span>{t("unpaid")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-muted"></div>
              <span>{t("notApplicable")}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-border"></div>
              <span>{t("futureMonth")}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-9 flex-1 sm:flex-none" onClick={handleExportPdf}>
              <FileDown className="mr-1 h-3 w-3" />PDF
            </Button>
            <Button size="sm" variant="outline" className="h-9 flex-1 sm:flex-none" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-1 h-3 w-3" />Excel
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <div className="min-w-[640px] px-3 sm:px-0">
          <div className="grid grid-cols-[100px_repeat(12,1fr)] gap-0.5">
            <div className="sticky left-0 z-10 bg-background p-1 sm:p-1.5 text-[9px] sm:text-[10px] font-semibold">
              {t("family")}
            </div>
            {MONTHS.map((month, idx) => (
              <div key={month} className={`p-1 sm:p-1.5 text-center text-[8px] sm:text-[9px] font-medium ${idx === currentMonth ? "bg-primary/10 text-primary" : "bg-muted/50"}`}>
                {month.slice(0, 3)}
              </div>
            ))}

            {filteredFamilies.map((family: any) => (
              <>
                <div key={family.id} className="sticky left-0 z-10 bg-background p-1 sm:p-1.5 text-[9px] sm:text-[10px] font-medium truncate">
                  {family.name}
                </div>
                {MONTHS.map((month, idx) => {
                  const isFuture = idx > currentMonth && selectedYear === currentYear;
                  const status = getPaymentStatus(family.id, month);
                  const isFiltered = statusFilter !== "all" && statusFilter !== status;
                  
                  if (isFuture) {
                    return (
                      <div
                        key={month}
                        className="flex h-7 sm:h-9 items-center justify-center rounded bg-border/50"
                        title={`${family.name} - ${month} ${selectedYear}`}
                      >
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground">—</span>
                      </div>
                    );
                  }

                  if (isFiltered) {
                    return (
                      <div
                        key={month}
                        className="flex h-7 sm:h-9 items-center justify-center rounded bg-muted/30"
                      >
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground">N/A</span>
                      </div>
                    );
                  }

                  const details = getPaymentDetails(family.id, month);
                  const isHovered = hoveredCell?.familyId === family.id && hoveredCell?.month === month;

                  return (
                    <div
                      key={month}
                      className={`flex h-7 sm:h-9 cursor-pointer items-center justify-center rounded transition-colors ${
                        status === "paid"
                          ? "bg-success/20 hover:bg-success/30"
                          : "bg-destructive/20 hover:bg-destructive/30"
                      } ${isHovered ? "ring-2 ring-primary" : ""}`}
                      onClick={() => handleCellClick(family.id, month)}
                      onMouseEnter={() => setHoveredCell({ familyId: family.id, month })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={isHovered ? (status === "paid" ? t("paymentReceived") : t("paymentNotReceived")) : ""}
                    >
                      <span className="text-[10px] sm:text-xs font-bold">{status === "paid" ? "✔" : "✖"}</span>
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {filteredFamilies.length === 0 && (
        <EmptyState message={t("noData")} />
      )}
    </div>
  );
}
