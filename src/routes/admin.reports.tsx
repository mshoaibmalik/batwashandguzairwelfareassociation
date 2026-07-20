import { AdminShell } from "@/components/layout/AdminShell";
import { useFundSummary, useStore, familyTotals } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatDate, formatMonth } from "@/lib/money";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { exportExcel, exportPdf } from "@/lib/export";
import { SectionCard } from "@/components/cards/StatCard";

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

  return (
    <AdminShell title={t("reports")}>
      <Tabs defaultValue="balance">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance">Balance</TabsTrigger>
          <TabsTrigger value="coll">Coll.</TabsTrigger>
          <TabsTrigger value="exp">Exp.</TabsTrigger>
          <TabsTrigger value="fam">Fam.</TabsTrigger>
        </TabsList>
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