"use client";

import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { Activity, ChefHat, Dumbbell, Home, Moon, Settings, Sun, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Сегодня", icon: Home },
  { href: "/progress", label: "Прогресс", icon: TrendingUp },
  { href: "/meal-prep", label: "Питание", icon: ChefHat },
  { href: "/training", label: "Тренировки", icon: Dumbbell },
  { href: "/settings", label: "Настройки", icon: Settings },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Sidebar() {
  const pathname = usePathname();
  const theme = useApp((s) => s.ui.theme);
  const setTheme = useApp((s) => s.setTheme);
  const name = useApp((s) => s.profile.name);

  return (
    <aside className="hidden lg:flex sticky top-0 h-screen w-[220px] shrink-0 flex-col bg-bg">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="h-9 w-9 rounded-[10px] bg-accent flex items-center justify-center">
          <Activity className="h-4 w-4 text-white" strokeWidth={2.4} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">Prime Health</div>
          <div className="text-[10px]st text-fg-subtle">{name}</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map((it) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-3.5 py-2 text-[14px] transition-colors",
                active ? "bg-bg-subtle text-fg font-medium" : "text-fg-muted hover:bg-bg-subtle hover:text-fg"
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-fg-muted hover:bg-bg-subtle hover:text-fg"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
        </button>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {NAV.map((it) => {
          const Icon = it.icon;
          const active = isActive(pathname, it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[10px]",
                active ? "text-fg" : "text-fg-subtle"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
