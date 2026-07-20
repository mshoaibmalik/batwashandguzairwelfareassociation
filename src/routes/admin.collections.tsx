import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { store, useStore, type Collection, type CollectionType } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { formatRs, formatDate, formatMonth, todayIso } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/cards/StatCard";

const MONTHLY_RATE = 300;

type Form = {
  familyId: string;
  type: CollectionType;
  amount: number;
  date: string;
  startMonth: string; // YYYY-MM
  monthsCount: number;
  eventId: string;
  notes: string;
};

const empty: Form = { familyId: "", type: "monthly", amount: MONTHLY_RATE, date: todayIso(), startMonth: todayIso().slice(0, 7), monthsCount: 1, eventId: "", notes: "" };

function monthsFrom(start: string, count: number): string[] {
  const [y, m] = start.split("-").map(Number);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(y, m - 1 + i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export default function AdminCollections() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";

  const list = useMemo(() => [...data.collections].sort((a, b) => b.date.localeCompare(a.date)), [data.collections]);

  function openCreate() {
    setEditing(null);
    setForm({ ...empty, familyId: data.families[0]?.id ?? "" });
    setOpen(true);
  }
  function openEdit(c: Collection) {
    setEditing(c);
    setForm({
      familyId: c.familyId,
      type: c.type,
      amount: c.amount,
      date: c.date,
      startMonth: c.monthsCovered?.[0] ?? todayIso().slice(0, 7),
      monthsCount: c.monthsCovered?.length || 1,
      eventId: c.eventId ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  }

  function submit() {
    if (!form.familyId) return toast.error("Select a family");
    if (form.amount <= 0) return toast.error("Amount must be positive");
    const payload: Omit<Collection, "id"> = {
      familyId: form.familyId,
      type: form.type,
      amount: form.type === "monthly" ? MONTHLY_RATE * form.monthsCount : form.amount,
      date: form.date,
      monthsCovered: form.type === "monthly" ? monthsFrom(form.startMonth, form.monthsCount) : [],
      eventId: form.type === "special" ? form.eventId || null : null,
      notes: form.notes,
    };
    if (editing) {
      store.updateCollection(editing.id, payload);
      toast.success("Updated");
    } else {
      store.addCollection(payload);
      toast.success("Collection recorded");
    }
    setOpen(false);
  }

  return (
    <AdminShell title={t("collections")}>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-11" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />{t("add")}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? t("edit") : t("add")} {t("collections")}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label={t("family")}>
                <Select value={form.familyId} onValueChange={(v) => setForm({ ...form, familyId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select family" /></SelectTrigger>
                  <SelectContent>{data.families.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={t("type")}>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CollectionType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">{t("monthly")}</SelectItem>
                    <SelectItem value="special">{t("special")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              {form.type === "monthly" ? (
                <>
                  <Field label="Start month">
                    <Input type="month" value={form.startMonth} onChange={(e) => setForm({ ...form, startMonth: e.target.value })} />
                  </Field>
                  <Field label="Months covered">
                    <Select value={String(form.monthsCount)} onValueChange={(v) => setForm({ ...form, monthsCount: Number(v) })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 12].map((n) => <SelectItem key={n} value={String(n)}>{n} month{n > 1 ? "s" : ""} · {formatRs(MONTHLY_RATE * n)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              ) : (
                <>
                  <Field label={t("amount")}>
                    <Input type="number" min={1} value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
                  </Field>
                  <Field label={t("relatedEvent")}>
                    <Select value={form.eventId} onValueChange={(v) => setForm({ ...form, eventId: v })}>
                      <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        {data.events.map((e) => <SelectItem key={e.id} value={e.id}>{familyName(e.familyId)} · {formatDate(e.eventDate)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                </>
              )}
              <Field label={t("date")}>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label={t("notes")}>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button onClick={submit}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? <EmptyState message={t("noData")} /> : (
        <ul className="space-y-2">
          {list.map((c) => (
            <li key={c.id} className="card-soft p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{familyName(c.familyId)}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge variant={c.type === "monthly" ? "default" : "secondary"} className="h-4 px-1.5 text-[10px]">{t(c.type)}</Badge>
                    <span>{formatDate(c.date)}</span>
                  </div>
                  {c.monthsCovered?.length ? <div className="mt-1 flex flex-wrap gap-1">{c.monthsCovered.map((m) => <span key={m} className="rounded bg-muted px-1.5 py-0.5 text-[10px]">{formatMonth(m)}</span>)}</div> : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="text-sm font-semibold text-success">+{formatRs(c.amount)}</div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { store.deleteCollection(c.id); toast.success("Deleted"); }}>{t("delete")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}