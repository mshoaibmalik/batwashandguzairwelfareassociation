import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  Receipt,
  HeartHandshake,
  BarChart3,
  LogOut,
  Menu,
  Globe,
  ExternalLink,
} from "lucide-react";
import { useState, type ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const items = [
  { to: "/admin/dashboard", icon: LayoutDashboard, key: "dashboard" as const },
  { to: "/admin/families", icon: Users, key: "families" as const },
  { to: "/admin/collections", icon: Wallet, key: "collections" as const },
  { to: "/admin/expenses", icon: Receipt, key: "expenses" as const },
  { to: "/admin/events", icon: HeartHandshake, key: "events" as const },
  { to: "/admin/reports", icon: BarChart3, key: "reports" as const },
];

export function AdminShell({ children, title }: { children: ReactNode; title?: string }) {
  const { user, loading, signOut } = useAuth();
  const { t, lang, setLang } = useT();
  const navigate = useNavigate();
  const path = useLocation().pathname;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:max-w-2xl lg:max-w-5xl">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
        <div className="flex flex-1 items-center justify-start">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border/60 p-4">
                <SheetTitle className="flex items-center gap-2">
                  <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                  {t("appName")} · {t("admin")}
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-2">
                {items.map((it) => {
                  const Icon = it.icon;
                  const active = path === it.to;
                  return (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        active ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t(it.key)}
                    </Link>
                  );
                })}
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  <ExternalLink className="h-4 w-4" />
                  Public view
                </Link>
              </nav>
              <div className="border-t border-border/60 p-3">
                <div className="mb-2 truncate text-xs text-muted-foreground">{user.email}</div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={async () => {
                    await signOut();
                    navigate("/admin/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("logout")}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Centered logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src={logo} alt="Logo" className="h-7 w-7 rounded-lg object-cover sm:h-8 sm:w-8" />
        </div>

        <div className="flex flex-1 items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
          >
            <Globe className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{lang === "en" ? "اردو" : "EN"}</span>
            <span className="sm:hidden">{lang === "en" ? "UR" : "EN"}</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-3 pb-10 pt-3 sm:px-4 sm:pb-10 sm:pt-4">{children}</main>
    </div>
  );
}
