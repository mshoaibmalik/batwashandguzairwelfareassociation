import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { store, useStore, type Family, type FamilyStatus } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/cards/StatCard";

type FormState = { name: string; head: string; phone: string; address: string; status: FamilyStatus };
const empty: FormState = { name: "", head: "", phone: "", address: "", status: "active" };

export default function AdminFamilies() {
  const { t } = useT();
  const families = useStore((s) => s.families);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(f: Family) {
    setEditing(f);
    setForm({ name: f.name, head: f.head, phone: f.phone, address: f.address, status: f.status });
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim() || !form.head.trim()) {
      toast.error("Name and head are required");
      return;
    }
    if (editing) {
      store.updateFamily(editing.id, form);
      toast.success("Family updated");
    } else {
      store.addFamily(form);
      toast.success("Family added");
    }
    setOpen(false);
  }
  const list = families.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()) || f.head.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell title={t("families")}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" placeholder={t("search") + "…"} value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="h-11" onClick={openCreate}><Plus className="mr-1 h-4 w-4" />{t("add")}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? t("edit") : t("add")} {t("family")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Field label={t("family")}><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Khan" /></Field>
                <Field label={t("head")}><Input value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} /></Field>
                <Field label={t("phone")}><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
                <Field label={t("address")}><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field>
                <Field label={t("status")}>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as FamilyStatus })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t("active")}</SelectItem>
                      <SelectItem value="inactive">{t("inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
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
            {list.map((f) => (
              <li key={f.id} className="card-soft p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold">{f.name}</div>
                      <Badge variant={f.status === "active" ? "default" : "secondary"} className="h-4 px-1.5 text-[10px]">{t(f.status)}</Badge>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{f.head} · {f.phone}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{f.address}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
                          <AlertDialogDescription>{f.name}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => { store.deleteFamily(f.id); toast.success("Deleted"); }}>{t("delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
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