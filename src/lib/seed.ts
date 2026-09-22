import type { AppData } from "./types";

export const STORAGE_KEY = "prime-health:v2";
export const LEGACY_STORAGE_KEY = "prime-health-os:v1";

export const SEED: AppData = {
  profile: {
    name: "Ерболат",
    heightCm: 178,
    started: false,
    startWeightKg: 123,
    startDate: "2026-09-22",
    goalWeightKg: 80,
    caloriesTarget: 2000,
    proteinTarget: 180,
    fatTarget: 65,
    carbsTarget: 175,
    stepsTarget: 10000,
    trainingsPerWeek: 3,
    trainingDays: [0, 2, 4], // Пн, Ср, Пт
  },
  dailyEntries: [],
  measurements: [],
  workouts: [],
  mealPlans: [],
  rations: [],
  favoriteMeals: [],
  ui: { theme: "dark" },
};
