import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { store, useStore, type Expense, type ExpenseCategory } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatRs, formatDate, todayIso } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/cards/StatCard";

const CATEGORIES: ExpenseCategory[] = ["food", "tent", "transport", "misc"];

type Form = {
  eventId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
};
const empty: Form = { eventId: "", category: "food", amount: 0, date: todayIso(), description: "" };

export default function AdminExpenses() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";
  const eventLabel = (id: string) => {
    const e = data.events.find((x) => x.id === id);
    return e ? `${familyName(e.familyId)} · ${formatDate(e.eventDate)}` : "—";
  };
  const list = [...data.expenses].sort((a, b) => b.date.localeCompare(a.date));

  function openCreate() {
    setEditing(null);
    setForm({ ...empty, eventId: data.events[0]?.id ?? "" });
    setOpen(true);
  }
  function openEdit(e: Expense) {
    setEditing(e);
    setForm({
      eventId: e.eventId,
      category: e.category,
      amount: e.amount,
      date: e.date,
      description: e.description ?? "",
    });
    setOpen(true);
  }
  function submit() {
    if (!form.eventId) return toast.error("Select an event");
    if (form.amount <= 0) return toast.error("Amount must be positive");
    if (editing) {
      store.updateExpense(editing.id, form);
      toast.success("Updated");
    } else {
      store.addExpense(form);
      toast.success("Expense added");
    }
    setOpen(false);
  }

  return (
    <AdminShell title={t("expenses")}>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 sm:h-11" onClick={openCreate}>
              <Plus className="mr-1 h-4 w-4" />
              <span className="hidden sm:inline">{t("add")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? t("edit") : t("add")} {t("expenses")}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Field label={t("relatedEvent")}>
                <Select
                  value={form.eventId}
                  onValueChange={(v) => setForm({ ...form, eventId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.events.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {familyName(e.familyId)} · {formatDate(e.eventDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("category")}>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {t(c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("amount")}>
                <Input
                  type="number"
                  min={1}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                />
              </Field>
              <Field label={t("date")}>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label={t("description")}>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Field>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={submit}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {list.length === 0 ? (
        <EmptyState message={t("noData")} />
      ) : (
        <ul className="space-y-2 sm:space-y-3">
          {list.map((e) => (
            <li key={e.id} className="card-soft p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{eventLabel(e.eventId)}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground sm:text-[11px]">
                    <Badge
                      variant="outline"
                      className="h-3.5 px-1.5 text-[9px] sm:h-4 sm:text-[10px]"
                    >
                      {t(e.category)}
                    </Badge>
                    <span>{formatDate(e.date)}</span>
                  </div>
                  {e.description && (
                    <div className="mt-1 text-[10px] text-muted-foreground sm:text-[11px]">
                      {e.description}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="text-xs sm:text-sm font-semibold text-destructive">
                    −{formatRs(e.amount)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEdit(e)}
                  >
                    <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            store.deleteExpense(e.id);
                            toast.success("Deleted");
                          }}
                        >
                          {t("delete")}
                        </AlertDialogAction>
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
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
