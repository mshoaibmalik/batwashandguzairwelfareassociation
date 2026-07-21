import { AdminShell } from "@/components/layout/AdminShell";
import { StatCard, SectionCard, EmptyState } from "@/components/cards/StatCard";
import { useFundSummary, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { formatRs, formatRsShort, formatDate } from "@/lib/money";
import { Wallet, Receipt, Users, HeartHandshake, TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

export default function AdminDashboard() {
  const { t } = useT();
  const sum = useFundSummary();
  const data = useStore((s) => s);

  // build monthly chart
  const byMonth: Record<string, { month: string; collections: number; expenses: number }> = {};
  for (const c of data.collections) {
    const m = c.date.slice(0, 7);
    byMonth[m] ??= { month: m, collections: 0, expenses: 0 };
    byMonth[m].collections += c.amount;
  }
  for (const e of data.expenses) {
    const m = e.date.slice(0, 7);
    byMonth[m] ??= { month: m, collections: 0, expenses: 0 };
    byMonth[m].expenses += e.amount;
  }
  const monthly = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  const byCat: Record<string, number> = {};
  for (const e of data.expenses) byCat[e.category] = (byCat[e.category] ?? 0) + e.amount;
  const catData = Object.entries(byCat).map(([name, value]) => ({ name: t(name as "food"), value }));
  const COLORS = ["#0F766E", "#14B8A6", "#EA580C", "#16A34A", "#DC2626"];

  const recent = [
    ...data.collections.map((c) => ({ id: c.id, type: "in" as const, label: data.families.find((f) => f.id === c.familyId)?.name ?? "—", amount: c.amount, date: c.date })),
    ...data.expenses.map((e) => ({ id: e.id, type: "out" as const, label: t(e.category), amount: e.amount, date: e.date })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  return (
    <AdminShell title={t("dashboard")}>
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

        <SectionCard title="Collections vs Expenses">
          <div className="h-48 sm:h-56 w-full">
            <ResponsiveContainer>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v: number) => formatRs(v)} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="collections" fill="#0F766E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Expense Categories">
          {catData.length === 0 ? <EmptyState message={t("noData")} /> : (
            <div className="h-48 sm:h-56 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" outerRadius={70} label={(p) => p.name}>
                    {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatRs(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Transactions">
          <ul className="divide-y divide-border/60">
            {recent.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2 sm:py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-medium">{r.label}</div>
                  <div className="text-[10px] text-muted-foreground sm:text-[11px]">{formatDate(r.date)}</div>
                </div>
                <div className={`text-xs sm:text-sm font-semibold ${r.type === "in" ? "text-success" : "text-destructive"}`}>
                  {r.type === "in" ? "+" : "−"}{formatRs(r.amount)}
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </AdminShell>
  );
}
