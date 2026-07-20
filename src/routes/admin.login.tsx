import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";

export default function LoginPage() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin/dashboard");
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await signIn(email, pw);
      toast.success("Signed in");
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error((err as Error).message || "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground"><ArrowLeft className="h-3 w-3" />Back to public view</Link>
        <div className="card-soft p-6">
          <div className="mb-4 flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-11 w-11 rounded-2xl object-cover" />
            <div>
              <div className="text-base font-semibold">{t("admin")} {t("login")}</div>
              <div className="text-xs text-muted-foreground">{t("appName")}</div>
            </div>
          </div>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw">{t("password")}</Label>
              <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" />
            </div>
            <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? "…" : t("signIn")}</Button>
          </form>
          <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <strong className="text-foreground">Admin login</strong> — Sign in with your Firebase Auth credentials
          </div>
        </div>
      </div>
    </div>
  );
}