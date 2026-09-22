"use client";

import { BottomNav, Sidebar } from "./Nav";
import { useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useApp((s) => s.hasHydrated);
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-4 lg:px-8 py-5 lg:py-8 pb-24 lg:pb-8 max-w-[1200px] w-full mx-auto">
          {hydrated ? children : <div className="text-fg-muted text-sm">Загрузка…</div>}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
