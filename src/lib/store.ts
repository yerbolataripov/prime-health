"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AppData,
  DailyEntry,
  DayRation,
  Measurement,
  MealPlan,
  Profile,
  TrainingSession,
  Workout,
} from "./types";
import { SEED, STORAGE_KEY, LEGACY_STORAGE_KEY } from "./seed";

type AppState = AppData & {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  updateProfile: (p: Partial<Profile>) => void;

  upsertDaily: (e: DailyEntry) => void;
  patchDaily: (date: string, patch: Partial<DailyEntry>) => void;
  deleteDaily: (date: string) => void;
  startProgram: (date: string, weightKg: number) => void;

  addMeasurement: (m: Measurement) => void;
  deleteMeasurement: (date: string) => void;

  addWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;

  addMealPlan: (p: MealPlan) => void;
  updateMealPlan: (id: string, plan: MealPlan) => void;
  deleteMealPlan: (id: string) => void;

  setRation: (r: DayRation) => void;
  deleteRation: (date: string) => void;
  toggleFavoriteMeal: (id: string) => void;

  setTheme: (t: "light" | "dark") => void;
  resetData: () => void;
  importData: (d: AppData) => void;
  migrateLegacy: () => void;
};

const byDateDesc = <T extends { date: string }>(arr: T[]) =>
  [...arr].sort((a, b) => (a.date < b.date ? 1 : -1));

/** Запись считается пустой, если в ней нет ни одного значения кроме даты */
export function isEmptyEntry(e: DailyEntry): boolean {
  return (
    e.weightKg == null &&
    e.calories == null &&
    e.protein == null &&
    e.fat == null &&
    e.carbs == null &&
    e.steps == null &&
    !(e.trainings && e.trainings.length) &&
    !e.comment
  );
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...SEED,
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),

      upsertDaily: (e) =>
        set((s) => {
          const rest = s.dailyEntries.filter((d) => d.date !== e.date);
          if (isEmptyEntry(e)) return { dailyEntries: rest };
          return { dailyEntries: byDateDesc([...rest, e]) };
        }),
      patchDaily: (date, patch) =>
        set((s) => {
          const cur = s.dailyEntries.find((d) => d.date === date) ?? { date };
          const next: DailyEntry = { ...cur, ...patch, date };
          const rest = s.dailyEntries.filter((d) => d.date !== date);
          if (isEmptyEntry(next)) return { dailyEntries: rest };
          return { dailyEntries: byDateDesc([...rest, next]) };
        }),
      deleteDaily: (date) =>
        set((s) => ({ dailyEntries: s.dailyEntries.filter((d) => d.date !== date) })),
      startProgram: (date, weightKg) =>
        set((s) => ({ profile: { ...s.profile, started: true, startDate: date, startWeightKg: weightKg } })),

      addMeasurement: (m) =>
        set((s) => ({
          measurements: byDateDesc([...s.measurements.filter((x) => x.date !== m.date), m]),
        })),
      deleteMeasurement: (date) =>
        set((s) => ({ measurements: s.measurements.filter((m) => m.date !== date) })),

      addWorkout: (w) => set((s) => ({ workouts: byDateDesc([w, ...s.workouts]) })),
      deleteWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addMealPlan: (p) => set((s) => ({ mealPlans: [p, ...s.mealPlans] })),
      updateMealPlan: (id, plan) =>
        set((s) => ({ mealPlans: s.mealPlans.map((p) => (p.id === id ? plan : p)) })),
      deleteMealPlan: (id) => set((s) => ({ mealPlans: s.mealPlans.filter((p) => p.id !== id) })),

      setRation: (r) =>
        set((s) => ({ rations: byDateDesc([...s.rations.filter((x) => x.date !== r.date), r]) })),
      deleteRation: (date) => set((s) => ({ rations: s.rations.filter((r) => r.date !== date) })),
      toggleFavoriteMeal: (id) =>
        set((s) => ({
          favoriteMeals: s.favoriteMeals.includes(id)
            ? s.favoriteMeals.filter((x) => x !== id)
            : [...s.favoriteMeals, id],
        })),

      setTheme: (t) => set((s) => ({ ui: { ...s.ui, theme: t } })),
      resetData: () => set(() => ({ ...SEED, ui: { ...SEED.ui, migratedV1: true } })),
      importData: (d) => set(() => ({ ...d })),

      /** Переносит вес/КБЖУ/шаги/тренировки из старой версии приложения (v1), если она была */
      migrateLegacy: () => {
        const s = get();
        if (s.ui.migratedV1 || typeof window === "undefined") return;
        try {
          const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (!raw) {
            set({ ui: { ...s.ui, migratedV1: true } });
            return;
          }
          const parsed = JSON.parse(raw)?.state ?? {};
          const legacySeedDate = "2026-05-04";
          const entries: DailyEntry[] = (parsed.dailyEntries ?? [])
            .filter((d: any) => d?.date && d.date !== legacySeedDate)
            .map((d: any) => {
              const kind = d.trainingType;
              const e: DailyEntry = {
                date: d.date,
                weightKg: d.weightKg ?? undefined,
                calories: d.calories ?? undefined,
                protein: d.protein ?? undefined,
                fat: d.fat ?? undefined,
                carbs: d.carbs ?? undefined,
                steps: d.steps ?? undefined,
                trainings: d.trained
                  ? [{ id: uid("tr"), kind: kind === "pool" ? "pool" : kind === "walk" ? "walk" : "gym" }]
                  : undefined,
                comment: d.comment || undefined,
              };
              return e;
            })
            .filter((e: DailyEntry) => !isEmptyEntry(e));
          const measurements: Measurement[] = (parsed.measurements ?? [])
            .filter((m: any) => m?.date && m.date !== legacySeedDate)
            .map((m: any) => ({
              date: m.date,
              weightKg: m.weightKg,
              neckCm: m.neckCm,
              chestCm: m.chestCm,
              waistCm: m.waistCm,
              bellyCm: m.bellyCm,
              shouldersCm: m.shouldersCm,
              bicepsCm: m.rightArmCm ?? m.leftArmCm,
              hipsCm: m.glutesCm,
              thighCm: m.rightLegCm ?? m.leftLegCm,
              calfCm: m.calvesCm,
              comment: m.comment,
            }));
          const existingDates = new Set(s.dailyEntries.map((d) => d.date));
          const existingM = new Set(s.measurements.map((m) => m.date));
          set({
            dailyEntries: byDateDesc([...s.dailyEntries, ...entries.filter((e) => !existingDates.has(e.date))]),
            measurements: byDateDesc([...s.measurements, ...measurements.filter((m) => !existingM.has(m.date))]),
            ui: { ...s.ui, migratedV1: true },
          });
        } catch {
          set({ ui: { ...s.ui, migratedV1: true } });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted: any, version) => {
        const st = persisted ?? {};
        if (version < 2) {
          // v2.0 → v2.1: trained/trainingKind → trainings[]
          st.dailyEntries = (st.dailyEntries ?? []).map((d: any) => {
            if (d.trainings) return d;
            const { trained, trainingKind, ...rest } = d;
            const sessions: TrainingSession[] | undefined = trained
              ? [{ id: uid("tr"), kind: trainingKind === "strength" ? "gym" : trainingKind ?? "gym" }]
              : undefined;
            return sessions ? { ...rest, trainings: sessions } : rest;
          });
          if (st.profile && st.profile.started == null) {
            st.profile.started = (st.dailyEntries ?? []).some((d: any) => d.weightKg != null);
          }
        }
        return st;
      },
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          } as unknown as Storage;
        }
        return localStorage;
      }),
      partialize: (s) => ({
        profile: s.profile,
        dailyEntries: s.dailyEntries,
        measurements: s.measurements,
        workouts: s.workouts,
        mealPlans: s.mealPlans,
        rations: s.rations,
        favoriteMeals: s.favoriteMeals,
        ui: s.ui,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
