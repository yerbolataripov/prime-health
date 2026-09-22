// === Профиль и цели ===
export interface Profile {
  name: string;
  birthDate?: string; // ISO
  heightCm: number;
  started: boolean; // отсчёт начат (старт фиксируется первым взвешиванием)
  startWeightKg: number;
  startDate: string; // ISO
  goalWeightKg: number;
  caloriesTarget: number;
  proteinTarget: number;
  fatTarget: number;
  carbsTarget: number;
  stepsTarget: number;
  trainingsPerWeek: number;
  trainingDays: number[]; // 0 = Пн … 6 = Вс
}

// === Ежедневная запись ===
export type TrainingKind =
  | "gym"
  | "walk"
  | "hiking"
  | "run"
  | "pool"
  | "stepper"
  | "bike"
  | "football"
  | "padel"
  | "tennis"
  | "table_tennis"
  | "boxing"
  | "wrestling"
  | "bjj"
  | "cardio"
  | "other";

export interface TrainingSession {
  id: string;
  kind: TrainingKind;
  durationMin?: number;
  distanceKm?: number;
  note?: string;
}

export interface DailyEntry {
  date: string; // ISO YYYY-MM-DD
  weightKg?: number;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  steps?: number;
  trainings?: TrainingSession[];
  comment?: string;
}

// === Замеры тела (раз в неделю) ===
export interface Measurement {
  date: string;
  weightKg?: number;
  neckCm?: number;
  chestCm?: number;
  waistCm?: number;
  bellyCm?: number;
  shouldersCm?: number;
  bicepsCm?: number;
  forearmCm?: number;
  hipsCm?: number;
  thighCm?: number;
  calfCm?: number;
  comment?: string;
}

export type MeasurementKey = Exclude<keyof Measurement, "date" | "comment">;

// === Тренировки (подробный лог, по желанию) ===
export type Program = "full_a" | "full_b" | "full_c" | "other";

export interface ExerciseSet {
  weightKg?: number;
  reps?: number;
}
export interface Exercise {
  name: string;
  sets: ExerciseSet[];
}
export interface Workout {
  id: string;
  date: string;
  program: Program;
  exercises: Exercise[];
  comment?: string;
}

// === Meal Prep ===
export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack";

export type MealTag =
  | "light"
  | "high_protein"
  | "budget"
  | "no_cooking"
  | "fermented"
  | "training_day"
  | "rest_day";

export type GroceryGroup =
  | "meat_fish"
  | "dairy_eggs"
  | "grains_carbs"
  | "veg_fruit"
  | "sauces"
  | "fermented"
  | "supplements_other";

export interface MealPrepTemplate {
  id: string;
  name: string;
  category: MealCategory;
  ingredients: { name: string; grams?: number; pieces?: number; note?: string; group: GroceryGroup }[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  prepTimeMin: number;
  servings?: number;
  light: boolean; // лёгкое блюдо
  prepFriendly: boolean; // готовится впрок
  tags: MealTag[];
  steps?: string[];
  notes?: string;
}

export type MealPlanGoal =
  | "default"
  | "simple"
  | "prep_2_3_days"
  | "light"
  | "variety"
  | "budget"
  | "more_fish"
  | "more_beef"
  | "more_chicken"
  | "no_dairy"
  | "no_red_fish";

export interface MealPlanDay {
  date: string;
  meals: { templateId: string; category: MealCategory; pinned?: boolean }[];
  trainingDay?: boolean;
}

export interface MealPlan {
  id: string;
  startDate: string;
  endDate: string;
  caloriesTarget: number;
  proteinTarget: number;
  mealsPerDay: 3 | 4 | 5;
  goal: MealPlanGoal;
  excludedIngredients: string[];
  favoriteIngredients: string[];
  favoriteTemplateIds: string[];
  days: MealPlanDay[];
  groceryList: { item: string; group: GroceryGroup; qty?: string }[];
  prepTasks: string[];
  createdAt: string;
}

// === Конструктор рациона ===
export interface RationSlot {
  id: string;
  category: MealCategory;
  templateId?: string;
  portion: number; // множитель порции, 1 = как в рецепте
}

export interface DayRation {
  date: string;
  slots: RationSlot[];
}

// === Всё приложение ===
export interface AppData {
  profile: Profile;
  dailyEntries: DailyEntry[];
  measurements: Measurement[];
  workouts: Workout[];
  mealPlans: MealPlan[];
  rations: DayRation[];
  favoriteMeals: string[];
  ui: {
    theme: "light" | "dark";
    migratedV1?: boolean;
  };
}
