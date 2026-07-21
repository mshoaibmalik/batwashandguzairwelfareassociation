import { Link, useLocation } from "react-router-dom";
import { Home, Users, Wallet, Receipt, HeartHandshake, Globe, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const items = [
  { to: "/", icon: Home, key: "home" as const },
  { to: "/families", icon: Users, key: "families" as const },
  { to: "/collections", icon: Wallet, key: "collections" as const },
  { to: "/expenses", icon: Receipt, key: "expenses" as const },
  { to: "/events", icon: HeartHandshake, key: "events" as const },
];

export function PublicShell({ children, title }: { children: ReactNode; title?: string }) {
  const { t, lang, setLang } = useT();
  const path = useLocation().pathname;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background sm:max-w-2xl lg:max-w-5xl">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-border/60 bg-background/95 px-3 py-2.5 backdrop-blur sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img src={logo} alt="Logo" className="h-8 w-8 shrink-0 rounded-lg object-cover sm:h-9 sm:w-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold leading-tight">{title || t("appName")}</div>
            <div className="truncate text-[10px] text-muted-foreground sm:text-[11px]">{t("publicView")}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs font-medium"
            onClick={() => setLang(lang === "en" ? "ur" : "en")}
            aria-label="Toggle language"
          >
            <Globe className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{lang === "en" ? "اردو" : "EN"}</span>
            <span className="sm:hidden">{lang === "en" ? "UR" : "EN"}</span>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 px-2 text-xs">
            <Link to="/admin/login">
              <ShieldCheck className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{t("admin")}</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-3 pb-20 pt-3 sm:px-4 sm:pb-24 sm:pt-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto grid w-full max-w-md grid-cols-5 safe-bottom sm:max-w-2xl lg:max-w-5xl">
          {items.map((it) => {
            const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "scale-110" : ""}`} />
                <span>{t(it.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
