import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { store, useStore, type WelfareEvent } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatRs, formatDate, todayIso } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/cards/StatCard";

type Form = { familyId: string; eventDate: string; description: string };
const empty: Form = { familyId: "", eventDate: todayIso(), description: "" };

export default function AdminEvents() {
  const { t } = useT();
  const data = useStore((s) => s);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WelfareEvent | null>(null);
  const [form, setForm] = useState<Form>(empty);

  const familyName = (id: string) => data.families.find((f) => f.id === id)?.name ?? "—";
  const eventTotal = (eid: string) => data.expenses.filter((e) => e.eventId === eid).reduce((a, b) => a + b.amount, 0);
  const list = [...data.events].sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  function openCreate() {
    setEditing(null);
    setForm({ ...empty, familyId: data.families[0]?.id ?? "" });
    setOpen(true);
  }
  function openEdit(e: WelfareEvent) {
    setEditing(e);
    setForm({ familyId: e.familyId, eventDate: e.eventDate, description: e.description });
    setOpen(true);
  }
  function submit() {
    if (!form.familyId) return toast.error("Select a family");
    if (editing) {
      store.updateEvent(editing.id, form);
      toast.success("Updated");
    } else {
      store.addEvent(form);
      toast.success("Event created");
    }
    setOpen(false);
  }

  return (
    <AdminShell title={t("welfareEvents")}>
      <div className="mb-3 flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="h-10 sm:h-11" onClick={openCreate}><Plus className="mr-1 h-4 w-4" /><span className="hidden sm:inline">{t("add")}</span></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? t("edit") : t("add")} {t("events")}</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <Field label={t("family")}>
                <Select value={form.familyId} onValueChange={(v) => setForm({ ...form, familyId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select family" /></SelectTrigger>
                  <SelectContent>{data.families.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label={t("eventDate")}><Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></Field>
              <Field label={t("description")}>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
              <div className="rounded-lg bg-muted/50 p-2 text-[11px] text-muted-foreground">Type: {t("bereavement")}</div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
              <Button onClick={submit}>{t("save")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {list.length === 0 ? <EmptyState message={t("noData")} /> : (
        <ul className="space-y-2 sm:space-y-3">
          {list.map((e) => (
            <li key={e.id} className="card-soft p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 sm:gap-2"><Badge className="text-[9px] sm:text-[10px]">{t("bereavement")}</Badge></div>
                  <div className="mt-1 truncate text-sm font-semibold">{familyName(e.familyId)}</div>
                  <div className="truncate text-[10px] text-muted-foreground sm:text-[11px]">{formatDate(e.eventDate)} · {e.description}</div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-destructive">{formatRs(eventTotal(e.id))}</div>
                    <div className="text-[9px] text-muted-foreground sm:text-[10px]">expenses</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                        <AlertDialogDescription>This also removes linked expenses.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { store.deleteEvent(e.id); toast.success("Deleted"); }}>{t("delete")}</AlertDialogAction>
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