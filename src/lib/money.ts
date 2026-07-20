export function formatRs(value: number): string {
  const n = Math.round(Number(value) || 0);
  return "Rs. " + n.toLocaleString("en-PK");
}

export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatMonth(ym: string): string {
  // ym = "2026-06"
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
