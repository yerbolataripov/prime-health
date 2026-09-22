"use client";

import { useApp } from "@/lib/store";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useApp((s) => s.ui.theme);
  const hasHydrated = useApp((s) => s.hasHydrated);
  const migrateLegacy = useApp((s) => s.migrateLegacy);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, hasHydrated]);

  useEffect(() => {
    if (hasHydrated) migrateLegacy();
  }, [hasHydrated, migrateLegacy]);

  return <>{children}</>;
}
