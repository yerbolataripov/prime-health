import type { Program, TrainingKind } from "./types";

export interface ExerciseTemplate {
  name: string;
  sets: string;
  reps: string;
  note?: string;
}

export const PROGRAM_LABEL: Record<Program, string> = {
  full_a: "Full body A",
  full_b: "Full body B",
  full_c: "Full body C",
  other: "Другое",
};

export interface KindMeta {
  label: string;
  emoji: string;
  distance: boolean; // есть смысл вводить км
  strength: boolean; // считается силовой (для чередования A/B/C)
}

export const TRAINING_KINDS: Record<TrainingKind, KindMeta> = {
  gym: { label: "Зал", emoji: "🏋️", distance: false, strength: true },
  walk: { label: "Ходьба", emoji: "🚶", distance: true, strength: false },
  hiking: { label: "Хайкинг", emoji: "🥾", distance: true, strength: false },
  run: { label: "Бег", emoji: "🏃", distance: true, strength: false },
  pool: { label: "Бассейн", emoji: "🏊", distance: true, strength: false },
  stepper: { label: "Степпер", emoji: "🪜", distance: false, strength: false },
  bike: { label: "Велосипед", emoji: "🚴", distance: true, strength: false },
  football: { label: "Футбол", emoji: "⚽", distance: false, strength: false },
  padel: { label: "Падел", emoji: "🎾", distance: false, strength: false },
  tennis: { label: "Теннис", emoji: "🎾", distance: false, strength: false },
  table_tennis: { label: "Настольный теннис", emoji: "🏓", distance: false, strength: false },
  boxing: { label: "Бокс", emoji: "🥊", distance: false, strength: false },
  wrestling: { label: "Борьба", emoji: "🤼", distance: false, strength: false },
  bjj: { label: "Джиу-джитсу", emoji: "🥋", distance: false, strength: false },
  cardio: { label: "Кардио", emoji: "❤️‍🔥", distance: false, strength: false },
  other: { label: "Другое", emoji: "✨", distance: false, strength: false },
};

export const TRAINING_KIND_ORDER: TrainingKind[] = [
  "gym", "walk", "hiking", "run", "pool", "stepper", "bike",
  "football", "padel", "tennis", "table_tennis", "boxing", "wrestling", "bjj", "cardio", "other",
];

/**
 * Три full body тренировки в неделю. Цель на дефиците — сохранить мышцы:
 * рабочие веса держим, 1–2 повтора в запасе, не до отказа.
 */
export const WORKOUT_PROGRAMS: Record<Exclude<Program, "other">, { title: string; focus: string; exercises: ExerciseTemplate[] }> = {
  full_a: {
    title: "Full body A",
    focus: "Ноги + жим + тяга",
    exercises: [
      { name: "Жим ногами / гакк-присед", sets: "3–4", reps: "8–12" },
      { name: "Жим лёжа (штанга или гантели)", sets: "3–4", reps: "6–10" },
      { name: "Тяга верхнего блока", sets: "3–4", reps: "8–12" },
      { name: "Румынская тяга", sets: "3", reps: "8–10" },
      { name: "Жим гантелей сидя", sets: "2–3", reps: "8–12" },
      { name: "Планка", sets: "3", reps: "30–60 сек" },
    ],
  },
  full_b: {
    title: "Full body B",
    focus: "Спина + плечи + низ",
    exercises: [
      { name: "Тяга горизонтального блока", sets: "3–4", reps: "8–12" },
      { name: "Жим гантелей на наклонной", sets: "3–4", reps: "8–12" },
      { name: "Выпады / болгарские приседания", sets: "3", reps: "8–10 на ногу" },
      { name: "Сгибание ног в тренажёре", sets: "3", reps: "10–12" },
      { name: "Разведения на плечи", sets: "3", reps: "12–15" },
      { name: "Бицепс + трицепс", sets: "2–3", reps: "10–12" },
    ],
  },
  full_c: {
    title: "Full body C",
    focus: "Тренажёры, объём",
    exercises: [
      { name: "Жим ногами", sets: "3–4", reps: "10–12" },
      { name: "Тяга гантели в наклоне", sets: "3–4", reps: "8–12" },
      { name: "Жим в тренажёре", sets: "3", reps: "8–12" },
      { name: "Гиперэкстензия", sets: "3", reps: "10–15" },
      { name: "Икры", sets: "3", reps: "12–15" },
      { name: "Пресс", sets: "3", reps: "12–20" },
    ],
  },
};
