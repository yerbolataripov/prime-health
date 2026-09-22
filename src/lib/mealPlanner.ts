import type {
  DayRation,
  GroceryGroup,
  MealCategory,
  MealPlan,
  MealPlanDay,
  MealPlanGoal,
  MealPrepTemplate,
  MealTag,
} from "./types";
import { addDaysISO } from "./utils";
import { MEAL_LIBRARY_EXTRA } from "./mealLibraryExtra";

export const GROUP_LABEL: Record<GroceryGroup, string> = {
  meat_fish: "Мясо / рыба",
  dairy_eggs: "Молочка / яйца",
  grains_carbs: "Крупы / углеводы",
  veg_fruit: "Овощи / фрукты",
  sauces: "Соусы / специи",
  fermented: "Ферментированные",
  supplements_other: "Прочее / добавки",
};


export const GOAL_LABEL: Record<MealPlanGoal, string> = {
  default: "Обычное",
  simple: "Максимально простое",
  prep_2_3_days: "Meal prep на 2–3 дня",
  light: "Лёгкие блюда",
  variety: "Больше разнообразия",
  budget: "Бюджетное",
  more_fish: "Больше рыбы",
  more_beef: "Больше говядины",
  more_chicken: "Больше курицы",
  no_dairy: "Без молочки",
  no_red_fish: "Без красной рыбы",
};

export const TAG_LABEL: Record<MealTag, string> = {
  light: "лёгкое",
  high_protein: "много белка",
  budget: "бюджетно",
  no_cooking: "без готовки",
  fermented: "ферментированное",
  training_day: "день тренировки",
  rest_day: "день отдыха",
};

export const CATEGORY_ORDER: MealCategory[] = ["breakfast", "lunch", "snack", "dinner"];

export const CATEGORY_LABEL: Record<MealCategory, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

// === Базовая библиотека (50) ===
const MEAL_LIBRARY_BASE: MealPrepTemplate[] = [
  // ── ЗАВТРАКИ (1–12)
  {
    id: "tpl-eggs-oats",
    name: "Омлет 3 яйца + овсянка 60 г + йогурт 150 г + ягоды",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 3, group: "dairy_eggs" },
      { name: "Овсянка", grams: 60, group: "grains_carbs" },
      { name: "Греческий йогурт", grams: 150, group: "dairy_eggs" },
      { name: "Ягоды", grams: 80, group: "veg_fruit" },
    ],
    calories: 620, protein: 38, fat: 22, carbs: 65, fiber: 7, prepTimeMin: 12,
    light: true, prepFriendly: false,
    tags: ["high_protein"],
    steps: [
      "Сварить овсянку на воде 5–7 минут.",
      "Параллельно взбить яйца и приготовить омлет на сухой сковороде.",
      "Йогурт + ягоды разложить в миску.",
      "Подать овсянку, омлет и йогурт вместе.",
    ],
  },
  {
    id: "tpl-cottage",
    name: "Творог 250 г + ягоды + орехи 20 г",
    category: "breakfast",
    ingredients: [
      { name: "Творог 5%", grams: 250, group: "dairy_eggs" },
      { name: "Ягоды", grams: 80, group: "veg_fruit" },
      { name: "Орехи", grams: 20, group: "supplements_other" },
    ],
    calories: 480, protein: 38, fat: 22, carbs: 30, fiber: 5, prepTimeMin: 3,
    light: true, prepFriendly: true,
    tags: ["no_cooking", "high_protein"],
    steps: [
      "Выложить творог в миску.",
      "Добавить ягоды и орехи сверху.",
      "По желанию — корица или щепотка соли.",
    ],
  },
  {
    id: "tpl-yogurt-shake",
    name: "Йогурт 250 г + протеин 25 г + фрукты",
    category: "breakfast",
    ingredients: [
      { name: "Греческий йогурт", grams: 250, group: "dairy_eggs" },
      { name: "Протеин", grams: 25, group: "supplements_other" },
      { name: "Банан", pieces: 1, group: "veg_fruit" },
    ],
    calories: 420, protein: 45, fat: 6, carbs: 45, fiber: 3, prepTimeMin: 2,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein", "light"],
    steps: [
      "Размешать протеин в йогурте.",
      "Добавить нарезанные фрукты.",
    ],
  },
  {
    id: "tpl-shakshuka",
    name: "Шакшука с яйцами и овощами",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 3, group: "dairy_eggs" },
      { name: "Помидоры", grams: 200, group: "veg_fruit" },
      { name: "Перец / лук", grams: 150, group: "veg_fruit" },
      { name: "Соус (паприка/чеснок)", grams: 20, group: "sauces" },
    ],
    calories: 380, protein: 26, fat: 22, carbs: 18, fiber: 5, prepTimeMin: 15,
    light: true, prepFriendly: false,
    tags: ["high_protein", "light"],
    steps: [
      "Обжарить лук и перец 3–4 минуты.",
      "Добавить помидоры и специи, тушить 5 минут.",
      "Сделать 3 «лунки» и разбить туда яйца.",
      "Накрыть крышкой и довести до готовности 4–5 минут.",
    ],
  },
  {
    id: "tpl-omelette-pastrami",
    name: "Омлет с куриной пастрамой и овощами",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 3, group: "dairy_eggs" },
      { name: "Куриная пастрама", grams: 100, group: "meat_fish" },
      { name: "Овощи (лук, перец)", grams: 150, group: "veg_fruit" },
    ],
    calories: 410, protein: 38, fat: 22, carbs: 8, fiber: 3, prepTimeMin: 12,
    light: true, prepFriendly: false,
    tags: ["high_protein", "light"],
    steps: [
      "Нарезать пастраму и овощи, слегка обжарить.",
      "Залить яйцами и довести под крышкой 3–4 минуты.",
    ],
  },
  {
    id: "tpl-oats-protein",
    name: "Овсянка с протеином и бананом",
    category: "breakfast",
    ingredients: [
      { name: "Овсянка", grams: 60, group: "grains_carbs" },
      { name: "Протеин", grams: 25, group: "supplements_other" },
      { name: "Банан", pieces: 1, group: "veg_fruit" },
    ],
    calories: 480, protein: 35, fat: 8, carbs: 70, fiber: 8, prepTimeMin: 8,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Сварить овсянку на воде или молоке.",
      "Снять с огня, дать остыть 1 минуту.",
      "Размешать протеин (не на горячее), добавить банан.",
    ],
  },
  {
    id: "tpl-syrniki",
    name: "Творожные сырники без сахара",
    category: "breakfast",
    ingredients: [
      { name: "Творог 5%", grams: 200, group: "dairy_eggs" },
      { name: "Яйцо", pieces: 1, group: "dairy_eggs" },
      { name: "Овсяная мука", grams: 30, group: "grains_carbs" },
    ],
    calories: 380, protein: 32, fat: 12, carbs: 35, fiber: 3, prepTimeMin: 15,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Смешать творог, яйцо и муку.",
      "Сформировать сырники, обжарить на сухой сковороде по 3 мин с каждой стороны.",
      "Подать с йогуртом и ягодами.",
    ],
    notes: "Можно сделать впрок на 2 дня.",
  },
  {
    id: "tpl-lavash-egg-chicken",
    name: "Лаваш-ролл с яйцом и курицей",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 2, group: "dairy_eggs" },
      { name: "Курица филе", grams: 100, group: "meat_fish" },
      { name: "Лаваш", grams: 60, group: "grains_carbs" },
      { name: "Зелень / огурец", grams: 80, group: "veg_fruit" },
    ],
    calories: 480, protein: 42, fat: 16, carbs: 40, fiber: 4, prepTimeMin: 10,
    light: true, prepFriendly: false,
    tags: ["high_protein"],
    steps: [
      "Обжарить курицу до готовности.",
      "Сделать яичницу-болтунью.",
      "Завернуть в лаваш с зеленью и огурцом.",
    ],
  },
  {
    id: "tpl-eggs-beef",
    name: "Яичница с говяжьим фаршем и овощами",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 3, group: "dairy_eggs" },
      { name: "Говяжий фарш", grams: 150, group: "meat_fish" },
      { name: "Овощи (перец/лук)", grams: 100, group: "veg_fruit" },
    ],
    calories: 460, protein: 40, fat: 28, carbs: 10, fiber: 3, prepTimeMin: 12,
    light: false, prepFriendly: false,
    tags: ["high_protein"],
    steps: [
      "Обжарить фарш с овощами 6–8 минут.",
      "Залить яйцами, довести под крышкой 3 минуты.",
    ],
  },
  {
    id: "tpl-yogurt-oats-berries",
    name: "Йогурт + овсянка + ягоды",
    category: "breakfast",
    ingredients: [
      { name: "Греческий йогурт", grams: 200, group: "dairy_eggs" },
      { name: "Овсянка", grams: 40, group: "grains_carbs" },
      { name: "Ягоды", grams: 80, group: "veg_fruit" },
    ],
    calories: 380, protein: 24, fat: 8, carbs: 50, fiber: 6, prepTimeMin: 1,
    light: true, prepFriendly: true,
    tags: ["no_cooking", "light", "budget"],
    steps: [
      "Смешать йогурт и сухую овсянку с вечера (overnight oats) или сразу.",
      "Добавить ягоды.",
    ],
    notes: "Идеально на 2–3 дня впрок.",
  },
  {
    id: "tpl-cottage-apple",
    name: "Творог + яблоко + протеин + корица",
    category: "breakfast",
    ingredients: [
      { name: "Творог 5%", grams: 200, group: "dairy_eggs" },
      { name: "Яблоко", pieces: 1, group: "veg_fruit" },
      { name: "Протеин", grams: 20, group: "supplements_other" },
    ],
    calories: 380, protein: 40, fat: 5, carbs: 35, fiber: 4, prepTimeMin: 3,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein"],
    steps: [
      "Размять творог вилкой, добавить протеин и щепотку корицы.",
      "Сверху — нарезанное яблоко.",
    ],
  },
  {
    id: "tpl-omelette-veg",
    name: "Омлет 3 яйца + овощи 200 г + сыр 30 г",
    category: "breakfast",
    ingredients: [
      { name: "Яйцо", pieces: 3, group: "dairy_eggs" },
      { name: "Овощи", grams: 200, group: "veg_fruit" },
      { name: "Сыр", grams: 30, group: "dairy_eggs" },
    ],
    calories: 420, protein: 32, fat: 26, carbs: 12, fiber: 5, prepTimeMin: 10,
    light: true, prepFriendly: false,
    tags: ["light"],
    steps: [
      "Овощи нарезать, потушить 3–4 минуты.",
      "Залить яйцами, посыпать тёртым сыром, довести под крышкой.",
    ],
  },

  // ── ОБЕДЫ / УЖИНЫ (13–45)
  {
    id: "tpl-pastrama-rice",
    name: "Куриная пастрама + рис + салат",
    category: "lunch",
    ingredients: [
      { name: "Куриная пастрама", grams: 200, group: "meat_fish" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Салат-микс", grams: 250, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 50, group: "sauces" },
    ],
    calories: 720, protein: 52, fat: 22, carbs: 75, fiber: 8, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Сварить рис.",
      "Нарезать пастраму крупно.",
      "Собрать боул: рис, пастрама, салат, соус.",
    ],
  },
  {
    id: "tpl-redfish",
    name: "Красная рыба + картофель + овощи",
    category: "lunch",
    ingredients: [
      { name: "Лосось / форель", grams: 220, group: "meat_fish" },
      { name: "Картофель", grams: 300, group: "grains_carbs" },
      { name: "Овощи на гриле", grams: 250, group: "veg_fruit" },
    ],
    calories: 820, protein: 48, fat: 32, carbs: 70, fiber: 10, prepTimeMin: 30,
    light: false, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Запечь рыбу 12–15 минут при 200°C.",
      "Картофель — отварить или запечь дольками.",
      "Овощи — на гриле или в духовке 12 минут.",
    ],
  },
  {
    id: "tpl-kofte",
    name: "Говяжьи кофте + гречка + салат",
    category: "lunch",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Гречка", grams: 70, group: "grains_carbs" },
      { name: "Салат-микс", grams: 250, group: "veg_fruit" },
    ],
    calories: 740, protein: 50, fat: 28, carbs: 65, fiber: 9, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Сделать продолговатые кофте из фарша с луком и специями.",
      "Запечь или обжарить 12–15 минут.",
      "Подать с отварной гречкой и салатом.",
    ],
  },
  {
    id: "tpl-tortilla",
    name: "Chicken tortilla: курица + тортилья + овощи + соус",
    category: "dinner",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Тортилья", grams: 80, group: "grains_carbs" },
      { name: "Перец / лук", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 60, group: "sauces" },
    ],
    calories: 660, protein: 48, fat: 22, carbs: 60, fiber: 6, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Курицу нарезать, обжарить со специями 8 минут.",
      "Овощи — на той же сковороде 4 минуты.",
      "Завернуть всё в тёплую тортилью с соусом.",
    ],
  },
  {
    id: "tpl-stuffed-pepper",
    name: "Фаршированный перец с говяжьим фаршем",
    category: "dinner",
    ingredients: [
      { name: "Болгарский перец", pieces: 4, group: "veg_fruit" },
      { name: "Говяжий фарш", grams: 250, group: "meat_fish" },
      { name: "Рис", grams: 60, group: "grains_carbs" },
      { name: "Лук", pieces: 1, group: "veg_fruit" },
    ],
    calories: 580, protein: 42, fat: 22, carbs: 45, fiber: 8, prepTimeMin: 50,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Смешать фарш, отваренный рис и обжаренный лук.",
      "Нафаршировать перцы, выложить в форму.",
      "Запекать с томатным соусом 35–40 минут при 180°C.",
    ],
  },
  {
    id: "tpl-adana",
    name: "Адана-кебаб из фарша + лаваш + овощи",
    category: "dinner",
    ingredients: [
      { name: "Куриный фарш", grams: 250, group: "meat_fish" },
      { name: "Лаваш", grams: 80, group: "grains_carbs" },
      { name: "Овощи свежие", grams: 250, group: "veg_fruit" },
      { name: "Кимчи", grams: 50, group: "fermented" },
    ],
    calories: 640, protein: 45, fat: 18, carbs: 60, fiber: 12, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "fermented"],
    steps: [
      "Фарш с луком и специями — на шампуры или в форму, запечь 15 минут.",
      "Прогреть лаваш.",
      "Подать с овощами и кимчи.",
    ],
  },
  {
    id: "tpl-chicken-meatballs",
    name: "Куриные фрикадельки + кускус + овощи",
    category: "lunch",
    ingredients: [
      { name: "Куриный фарш", grams: 250, group: "meat_fish" },
      { name: "Овощи на пару", grams: 250, group: "veg_fruit" },
      { name: "Кускус", grams: 60, group: "grains_carbs" },
    ],
    calories: 640, protein: 50, fat: 18, carbs: 60, fiber: 7, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Сформировать фрикадельки из куриного фарша с луком.",
      "Запечь 15 минут при 190°C.",
      "Кускус залить кипятком на 5 минут. Овощи — на пару.",
    ],
  },
  {
    id: "tpl-beef-cutlets-buckwheat",
    name: "Говяжьи котлеты + гречка + салат",
    category: "lunch",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Гречка", grams: 70, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 720, protein: 50, fat: 26, carbs: 60, fiber: 8, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Котлеты — фарш с луком, чесноком, солью.",
      "Запечь 15–18 минут при 190°C.",
      "Подать с гречкой и салатом.",
    ],
  },
  {
    id: "tpl-konina",
    name: "Конина / говядина + овощи + квашеная капуста",
    category: "dinner",
    ingredients: [
      { name: "Конина / говядина", grams: 220, group: "meat_fish" },
      { name: "Овощи на пару", grams: 250, group: "veg_fruit" },
      { name: "Квашеная капуста", grams: 80, group: "fermented" },
    ],
    calories: 600, protein: 45, fat: 28, carbs: 25, fiber: 6, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "fermented", "budget"],
    steps: [
      "Мясо отварить или запечь до готовности.",
      "Овощи приготовить на пару.",
      "Подать с квашеной капустой.",
    ],
  },
  {
    id: "tpl-beans-mince",
    name: "Фасоль 200 г + говяжий фарш 200 г + овощи",
    category: "dinner",
    ingredients: [
      { name: "Фасоль (готовая)", grams: 200, group: "grains_carbs" },
      { name: "Говяжий фарш", grams: 200, group: "meat_fish" },
      { name: "Помидоры/лук", grams: 200, group: "veg_fruit" },
    ],
    calories: 600, protein: 48, fat: 22, carbs: 50, fiber: 14, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Обжарить лук, добавить фарш, готовить 6 минут.",
      "Добавить помидоры и фасоль, тушить 10 минут.",
    ],
  },
  {
    id: "tpl-chicken-roll",
    name: "Лаваш-ролл с курицей и овощами",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 200, group: "meat_fish" },
      { name: "Лаваш", grams: 80, group: "grains_carbs" },
      { name: "Огурец / помидор", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 50, group: "sauces" },
    ],
    calories: 580, protein: 48, fat: 14, carbs: 60, fiber: 6, prepTimeMin: 15,
    light: true, prepFriendly: false,
    tags: ["high_protein"],
    steps: [
      "Курицу обжарить и нарезать.",
      "Завернуть в лаваш с овощами и соусом.",
    ],
  },
  {
    id: "tpl-mince-beans-corn",
    name: "Куриный фарш + фасоль + кукуруза + салат",
    category: "lunch",
    ingredients: [
      { name: "Куриный фарш", grams: 220, group: "meat_fish" },
      { name: "Фасоль (готовая)", grams: 150, group: "grains_carbs" },
      { name: "Кукуруза", grams: 100, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 620, protein: 50, fat: 16, carbs: 60, fiber: 12, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Обжарить фарш с луком 6 минут.",
      "Добавить фасоль и кукурузу, прогреть 4 минуты.",
      "Подать с салатом.",
    ],
  },
  {
    id: "tpl-beef-mince-rice-veg",
    name: "Говяжий фарш + рис + овощи",
    category: "dinner",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Овощи (перец/лук/морковь)", grams: 200, group: "veg_fruit" },
    ],
    calories: 700, protein: 48, fat: 26, carbs: 60, fiber: 7, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Сварить рис.",
      "Обжарить фарш с овощами 10 минут.",
      "Подать вместе.",
    ],
  },
  {
    id: "tpl-chicken-potato",
    name: "Курица + картофель + салат",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Картофель", grams: 250, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 660, protein: 50, fat: 14, carbs: 70, fiber: 8, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget", "training_day"],
    steps: [
      "Картофель запечь дольками 25 минут при 200°C.",
      "Курицу — рядом или на сковороде, 8 минут.",
      "Подать с салатом.",
    ],
  },
  {
    id: "tpl-fish-rice",
    name: "Красная рыба + рис + овощи",
    category: "dinner",
    ingredients: [
      { name: "Лосось / форель", grams: 200, group: "meat_fish" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Овощи на пару", grams: 200, group: "veg_fruit" },
    ],
    calories: 700, protein: 46, fat: 24, carbs: 65, fiber: 5, prepTimeMin: 25,
    light: false, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Сварить рис.",
      "Рыбу — в духовке 12 минут при 200°C.",
      "Овощи — на пару 8 минут.",
    ],
  },
  {
    id: "tpl-chicken-buckwheat-kimchi",
    name: "Куриная грудка + гречка + кимчи",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Гречка", grams: 70, group: "grains_carbs" },
      { name: "Кимчи", grams: 80, group: "fermented" },
      { name: "Овощи свежие", grams: 100, group: "veg_fruit" },
    ],
    calories: 620, protein: 52, fat: 12, carbs: 60, fiber: 7, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "fermented", "budget"],
    steps: [
      "Сварить гречку.",
      "Курицу обжарить или запечь 10 минут.",
      "Подать с кимчи и свежими овощами.",
    ],
  },
  {
    id: "tpl-beef-bowl-no-bun",
    name: "Говяжий бургер-боул без булки",
    category: "lunch",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
      { name: "Помидоры/лук", grams: 150, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 40, group: "sauces" },
      { name: "Маринованные огурцы", grams: 50, group: "fermented" },
    ],
    calories: 620, protein: 48, fat: 28, carbs: 25, fiber: 6, prepTimeMin: 20,
    light: true, prepFriendly: false,
    tags: ["high_protein", "fermented"],
    steps: [
      "Сделать котлету из фарша 220 г, обжарить 4 мин с каждой стороны.",
      "Собрать боул: салат, овощи, котлета, маринованные огурцы.",
      "Полить соусом.",
    ],
  },
  {
    id: "tpl-chicken-kebab-lavash",
    name: "Куриный кебаб + лаваш + овощи",
    category: "dinner",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Лаваш", grams: 80, group: "grains_carbs" },
      { name: "Овощи свежие", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 40, group: "sauces" },
    ],
    calories: 620, protein: 50, fat: 14, carbs: 60, fiber: 6, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Курицу нарезать, замариновать с йогуртом, специями 15 минут.",
      "Обжарить или запечь 10–12 минут.",
      "Завернуть в лаваш с овощами.",
    ],
  },
  {
    id: "tpl-mince-tortilla",
    name: "Говяжий фарш в тортилье + овощи",
    category: "dinner",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Тортилья", grams: 80, group: "grains_carbs" },
      { name: "Овощи (перец/лук/помидор)", grams: 200, group: "veg_fruit" },
      { name: "Соус", grams: 40, group: "sauces" },
    ],
    calories: 660, protein: 46, fat: 26, carbs: 55, fiber: 6, prepTimeMin: 20,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Обжарить фарш с луком и перцем 8 минут.",
      "Прогреть тортилью, начинить, полить соусом.",
    ],
  },
  {
    id: "tpl-chicken-cutlets-potato",
    name: "Куриные котлеты + картофель + салат",
    category: "lunch",
    ingredients: [
      { name: "Куриный фарш", grams: 220, group: "meat_fish" },
      { name: "Картофель", grams: 250, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 660, protein: 50, fat: 14, carbs: 70, fiber: 7, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Сформировать котлеты, запечь 18 минут при 190°C.",
      "Картофель — дольками в духовке.",
      "Подать с салатом.",
    ],
  },
  {
    id: "tpl-konina-buckwheat",
    name: "Конина + гречка + овощи",
    category: "dinner",
    ingredients: [
      { name: "Конина", grams: 220, group: "meat_fish" },
      { name: "Гречка", grams: 70, group: "grains_carbs" },
      { name: "Овощи на пару", grams: 200, group: "veg_fruit" },
    ],
    calories: 640, protein: 50, fat: 22, carbs: 55, fiber: 6, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Конину отварить или запечь до готовности.",
      "Гречка и овощи — на пару.",
    ],
  },
  {
    id: "tpl-chicken-yogurt-rice",
    name: "Курица в йогуртовом маринаде + рис",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Греческий йогурт", grams: 80, group: "dairy_eggs" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Огурец / помидор", grams: 150, group: "veg_fruit" },
    ],
    calories: 660, protein: 52, fat: 16, carbs: 60, fiber: 4, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Замариновать курицу в йогурте со специями 30 минут.",
      "Обжарить или запечь 12 минут.",
      "Подать с рисом и салатом.",
    ],
  },
  {
    id: "tpl-beef-stew-potato",
    name: "Говядина тушёная + картофель + овощи",
    category: "dinner",
    ingredients: [
      { name: "Говядина", grams: 200, group: "meat_fish" },
      { name: "Картофель", grams: 250, group: "grains_carbs" },
      { name: "Овощи (морковь/лук)", grams: 200, group: "veg_fruit" },
    ],
    calories: 700, protein: 46, fat: 26, carbs: 65, fiber: 7, prepTimeMin: 50,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Говядину нарезать кусочками, обжарить.",
      "Добавить лук, морковь, картофель и воду.",
      "Тушить 35–40 минут до мягкости.",
    ],
  },
  {
    id: "tpl-fish-tortilla-salad",
    name: "Красная рыба + салат + тортилья",
    category: "dinner",
    ingredients: [
      { name: "Лосось / форель", grams: 200, group: "meat_fish" },
      { name: "Тортилья", grams: 80, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 40, group: "sauces" },
    ],
    calories: 660, protein: 44, fat: 26, carbs: 50, fiber: 5, prepTimeMin: 20,
    light: false, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Рыбу обжарить или запечь 10 минут.",
      "Подать в тортилье с салатом и соусом.",
    ],
  },
  {
    id: "tpl-pastrami-beans",
    name: "Куриная пастрама + фасоль + овощи",
    category: "lunch",
    ingredients: [
      { name: "Куриная пастрама", grams: 200, group: "meat_fish" },
      { name: "Фасоль (готовая)", grams: 200, group: "grains_carbs" },
      { name: "Овощи свежие", grams: 200, group: "veg_fruit" },
    ],
    calories: 580, protein: 48, fat: 16, carbs: 50, fiber: 14, prepTimeMin: 15,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget"],
    steps: [
      "Прогреть пастраму.",
      "Фасоль — слегка прогреть.",
      "Подать с овощами.",
    ],
  },
  {
    id: "tpl-meatballs-rice",
    name: "Говяжьи тефтели + рис + салат",
    category: "lunch",
    ingredients: [
      { name: "Говяжий фарш", grams: 220, group: "meat_fish" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 700, protein: 48, fat: 24, carbs: 65, fiber: 5, prepTimeMin: 30,
    light: true, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Сделать круглые тефтели, обжарить и потушить с томатным соусом 15 минут.",
      "Подать с рисом и салатом.",
    ],
  },
  {
    id: "tpl-chicken-soup",
    name: "Куриный суп с овощами и картофелем",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Картофель", grams: 200, group: "grains_carbs" },
      { name: "Морковь / лук / зелень", grams: 200, group: "veg_fruit" },
    ],
    calories: 520, protein: 46, fat: 10, carbs: 55, fiber: 6, prepTimeMin: 35,
    light: true, prepFriendly: true,
    tags: ["light", "high_protein", "budget"],
    steps: [
      "Курицу отварить, вынуть, нарезать.",
      "В бульон добавить картофель и морковь, варить 15 минут.",
      "Вернуть курицу, посолить, подать с зеленью.",
    ],
  },
  {
    id: "tpl-beef-soup",
    name: "Говяжий суп с овощами",
    category: "lunch",
    ingredients: [
      { name: "Говядина", grams: 200, group: "meat_fish" },
      { name: "Картофель", grams: 150, group: "grains_carbs" },
      { name: "Овощи (морковь/лук/перец)", grams: 200, group: "veg_fruit" },
    ],
    calories: 540, protein: 42, fat: 18, carbs: 45, fiber: 6, prepTimeMin: 60,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget", "light"],
    steps: [
      "Говядину отварить 40 минут.",
      "Добавить картофель и овощи, варить ещё 15 минут.",
    ],
  },
  {
    id: "tpl-lentil-chicken-soup",
    name: "Чечевичный суп с курицей",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 200, group: "meat_fish" },
      { name: "Чечевица", grams: 80, group: "grains_carbs" },
      { name: "Морковь / лук / помидор", grams: 200, group: "veg_fruit" },
    ],
    calories: 540, protein: 48, fat: 8, carbs: 60, fiber: 12, prepTimeMin: 40,
    light: true, prepFriendly: true,
    tags: ["high_protein", "budget", "light"],
    steps: [
      "Курицу нарезать, обжарить с луком.",
      "Добавить морковь, помидоры, чечевицу и воду.",
      "Варить 25 минут до мягкости чечевицы.",
    ],
  },
  {
    id: "tpl-chicken-rice-corn-bowl",
    name: "Bowl: курица + рис + кукуруза + овощи",
    category: "lunch",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Рис", grams: 70, group: "grains_carbs" },
      { name: "Кукуруза", grams: 100, group: "grains_carbs" },
      { name: "Овощи (перец/огурец)", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 40, group: "sauces" },
    ],
    calories: 720, protein: 52, fat: 14, carbs: 80, fiber: 8, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "training_day"],
    steps: [
      "Сварить рис.",
      "Курицу обжарить, нарезать.",
      "Собрать боул: рис, курица, кукуруза, овощи, соус.",
    ],
  },
  {
    id: "tpl-beef-beans-bowl",
    name: "Bowl: говядина + фасоль + овощи",
    category: "dinner",
    ingredients: [
      { name: "Говяжий фарш", grams: 200, group: "meat_fish" },
      { name: "Фасоль (готовая)", grams: 150, group: "grains_carbs" },
      { name: "Овощи (перец/лук/помидор)", grams: 200, group: "veg_fruit" },
      { name: "Кимчи", grams: 50, group: "fermented" },
    ],
    calories: 620, protein: 46, fat: 22, carbs: 50, fiber: 14, prepTimeMin: 25,
    light: true, prepFriendly: true,
    tags: ["high_protein", "fermented", "budget"],
    steps: [
      "Обжарить фарш с луком и перцем.",
      "Добавить фасоль и помидоры.",
      "Подать в боуле с кимчи.",
    ],
  },
  {
    id: "tpl-chicken-shawarma-light",
    name: "Куриная шаурма в лаваше (light)",
    category: "dinner",
    ingredients: [
      { name: "Курица филе", grams: 220, group: "meat_fish" },
      { name: "Лаваш", grams: 80, group: "grains_carbs" },
      { name: "Овощи (огурец/помидор/капуста)", grams: 200, group: "veg_fruit" },
      { name: "Соус йогурт", grams: 50, group: "sauces" },
    ],
    calories: 600, protein: 50, fat: 14, carbs: 60, fiber: 6, prepTimeMin: 25,
    light: true, prepFriendly: false,
    tags: ["high_protein"],
    steps: [
      "Замариновать курицу в специях 15 минут, обжарить.",
      "Завернуть в лаваш с овощами и соусом.",
    ],
    notes: "Light = без жирного соуса и сыра.",
  },
  {
    id: "tpl-fish-potato-salad-bowl",
    name: "Рыбный bowl с картофелем и салатом",
    category: "dinner",
    ingredients: [
      { name: "Лосось / форель", grams: 200, group: "meat_fish" },
      { name: "Картофель", grams: 250, group: "grains_carbs" },
      { name: "Салат-микс", grams: 200, group: "veg_fruit" },
    ],
    calories: 700, protein: 44, fat: 24, carbs: 65, fiber: 7, prepTimeMin: 30,
    light: false, prepFriendly: true,
    tags: ["high_protein"],
    steps: [
      "Рыбу запечь 12 минут.",
      "Картофель — дольками в духовке.",
      "Подать в боуле с салатом.",
    ],
  },

  // ── ПЕРЕКУСЫ (46–50)
  {
    id: "tpl-shake",
    name: "Протеин 30 г + банан",
    category: "snack",
    ingredients: [
      { name: "Протеин", grams: 30, group: "supplements_other" },
      { name: "Банан", pieces: 1, group: "veg_fruit" },
    ],
    calories: 230, protein: 25, fat: 2, carbs: 30, fiber: 3, prepTimeMin: 1,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "light", "high_protein"],
    steps: ["Размешать протеин с водой/молоком, съесть с бананом."],
  },
  {
    id: "tpl-cottage-snack",
    name: "Творог 200 г + фрукт",
    category: "snack",
    ingredients: [
      { name: "Творог 5%", grams: 200, group: "dairy_eggs" },
      { name: "Яблоко / груша", pieces: 1, group: "veg_fruit" },
    ],
    calories: 240, protein: 26, fat: 4, carbs: 25, fiber: 3, prepTimeMin: 1,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein", "budget"],
    steps: ["Творог + нарезанный фрукт."],
  },
  {
    id: "tpl-yogurt-snack",
    name: "Греческий йогурт + ягоды",
    category: "snack",
    ingredients: [
      { name: "Греческий йогурт", grams: 200, group: "dairy_eggs" },
      { name: "Ягоды", grams: 80, group: "veg_fruit" },
    ],
    calories: 200, protein: 18, fat: 3, carbs: 22, fiber: 3, prepTimeMin: 1,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein"],
    steps: ["Йогурт + ягоды сверху."],
  },
  {
    id: "tpl-protein-yogurt-apple",
    name: "Протеиновый йогурт + яблоко",
    category: "snack",
    ingredients: [
      { name: "Греческий йогурт", grams: 200, group: "dairy_eggs" },
      { name: "Протеин", grams: 15, group: "supplements_other" },
      { name: "Яблоко", pieces: 1, group: "veg_fruit" },
    ],
    calories: 290, protein: 32, fat: 4, carbs: 30, fiber: 4, prepTimeMin: 2,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein"],
    steps: ["Размешать протеин в йогурте, есть с яблоком."],
  },
  {
    id: "tpl-cottage-kiwi",
    name: "Творог + киви + корица",
    category: "snack",
    ingredients: [
      { name: "Творог 5%", grams: 200, group: "dairy_eggs" },
      { name: "Киви", pieces: 2, group: "veg_fruit" },
    ],
    calories: 250, protein: 26, fat: 4, carbs: 30, fiber: 4, prepTimeMin: 2,
    light: true, prepFriendly: false,
    tags: ["no_cooking", "high_protein", "budget"],
    steps: ["Творог + нарезанное киви + щепотка корицы."],
  },
];

/** Полная библиотека: базовые 50 + дополнительные */
export const MEAL_PREP_LIBRARY: MealPrepTemplate[] = [...MEAL_LIBRARY_BASE, ...MEAL_LIBRARY_EXTRA];

// === Генератор ===

const PORK_KEYWORDS = ["свинин", "сало", "бекон", "ветчин"];

export const byId = (id: string) => MEAL_PREP_LIBRARY.find((t) => t.id === id);

export interface PlanInput {
  caloriesTarget: number;
  proteinTarget: number;
  mealsPerDay: 3 | 4 | 5;
  goal: MealPlanGoal;
  excludedIngredients: string[];
  favoriteIngredients: string[];
  favoriteTemplateIds: string[];
  trainingDays: number[]; // 0..6 (Пн=0)
  startDate: string;
}

export function filterPool(inp: Pick<PlanInput, "goal" | "excludedIngredients">): MealPrepTemplate[] {
  const exclude = (inp.excludedIngredients ?? []).map((e) => e.toLowerCase().trim()).filter(Boolean);
  return MEAL_PREP_LIBRARY.filter((t) => {
    const namesLower = t.ingredients.map((i) => i.name.toLowerCase()).concat(t.name.toLowerCase());
    if (PORK_KEYWORDS.some((p) => namesLower.some((n) => n.includes(p)))) return false;
    if (exclude.length && namesLower.some((n) => exclude.some((e) => n.includes(e)))) return false;

    if (inp.goal === "light" && !t.light) return false;
    if (inp.goal === "prep_2_3_days" && !t.prepFriendly) return false;
    if (inp.goal === "simple" && t.prepTimeMin > 25) return false;
    if (inp.goal === "budget" && t.calories > 720 && !t.tags.includes("budget")) return false;
    if (inp.goal === "no_dairy" && t.ingredients.some((i) => /йогурт|творог|сыр|молок/.test(i.name.toLowerCase()))) return false;
    if (inp.goal === "no_red_fish" && t.ingredients.some((i) => /лосос|форел|сёмга|семга|красная рыба/.test(i.name.toLowerCase()))) return false;
    return true;
  });
}

function preferenceWeight(t: MealPrepTemplate, inp: PlanInput): number {
  let w = 1;
  const lower = t.name.toLowerCase();
  if (inp.goal === "more_chicken" && /курин|курица|пастрама/.test(lower)) w += 2;
  if (inp.goal === "more_beef" && /говяд|кофте|тефтел|бургер|конина/.test(lower)) w += 2;
  if (inp.goal === "more_fish" && /рыба|лосос|форел/.test(lower)) w += 2;
  if (inp.goal === "variety") w += Math.random() * 1.5;
  if (inp.goal === "budget" && t.tags.includes("budget")) w += 1.5;
  if (inp.goal === "light" && t.tags.includes("light")) w += 1.5;
  if (inp.favoriteTemplateIds?.includes(t.id)) w += 2.5;
  const favIng = (inp.favoriteIngredients ?? []).map((s) => s.toLowerCase()).filter(Boolean);
  if (favIng.length && t.ingredients.some((i) => favIng.some((f) => i.name.toLowerCase().includes(f)))) w += 1.5;
  return w;
}

interface SlotContext {
  category: MealCategory;
  isTraining: boolean;
}

function pickTemplate(
  pool: MealPrepTemplate[],
  ctx: SlotContext,
  inp: PlanInput,
  usageCount: Record<string, number>,
  usedToday: Set<string>,
  excludeId?: string
): MealPrepTemplate | undefined {
  const candidates = pool.filter((t) => {
    if (t.category !== ctx.category) return false;
    if (excludeId && t.id === excludeId) return false;
    if (usedToday.has(t.id)) return false;
    if ((usageCount[t.id] ?? 0) >= 2) return false; // не более 2 раз в неделю
    if (ctx.isTraining && t.tags.includes("rest_day")) return false;
    if (!ctx.isTraining && t.tags.includes("training_day") && t.calories > 750) return false;
    return true;
  });
  if (candidates.length === 0) {
    const soft = pool.filter((t) => t.category === ctx.category && t.id !== excludeId && !usedToday.has(t.id));
    if (soft.length === 0) return pool.find((t) => t.category === ctx.category);
    return soft[Math.floor(Math.random() * soft.length)];
  }
  const weights = candidates.map((t) => preferenceWeight(t, inp));
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i];
    if (r <= 0) return candidates[i];
  }
  return candidates[candidates.length - 1];
}

export function categoriesForMealCount(n: 3 | 4 | 5): MealCategory[] {
  if (n === 3) return ["breakfast", "lunch", "dinner"];
  if (n === 4) return ["breakfast", "lunch", "snack", "dinner"];
  return ["breakfast", "snack", "lunch", "snack", "dinner"];
}

/** Насколько день далёк от цели: 0 — идеально. Белок важнее калорий. */
function fitScore(meals: MealPlanDay["meals"], calTarget: number, protTarget: number): number {
  let cal = 0;
  let p = 0;
  for (const m of meals) {
    const t = byId(m.templateId);
    if (!t) continue;
    cal += t.calories;
    p += t.protein;
  }
  const calPenalty = Math.abs(cal - calTarget) / calTarget; // доля отклонения
  const protPenalty = p < protTarget ? (protTarget - p) / protTarget : Math.max(0, (p - protTarget * 1.2) / protTarget);
  return calPenalty + protPenalty * 2;
}

/** Собирает день: несколько случайных попыток, берём лучшую по попаданию в цели */
function buildDay(
  pool: MealPrepTemplate[],
  cats: MealCategory[],
  isTraining: boolean,
  inp: PlanInput,
  usageCount: Record<string, number>,
  existingDay?: MealPlanDay,
  attempts = 30
): MealPlanDay["meals"] {
  let best: MealPlanDay["meals"] | null = null;
  let bestScore = Infinity;
  for (let a = 0; a < attempts; a++) {
    const meals: MealPlanDay["meals"] = [];
    const usedToday = new Set<string>();
    const localUsage = { ...usageCount };
    cats.forEach((cat, idx) => {
      const existingSlot = existingDay?.meals[idx];
      if (existingSlot?.pinned && byId(existingSlot.templateId)) {
        meals.push({ ...existingSlot });
        usedToday.add(existingSlot.templateId);
        return;
      }
      const tpl = pickTemplate(pool, { category: cat, isTraining }, inp, localUsage, usedToday);
      if (!tpl) return;
      meals.push({ templateId: tpl.id, category: cat });
      localUsage[tpl.id] = (localUsage[tpl.id] ?? 0) + 1;
      usedToday.add(tpl.id);
    });
    const score = fitScore(meals, inp.caloriesTarget, inp.proteinTarget);
    if (score < bestScore) {
      bestScore = score;
      best = meals;
    }
  }
  return best ?? [];
}

export function generateMealPlan(inp: PlanInput, existing?: MealPlan): MealPlan {
  const pool = filterPool(inp);
  const days: MealPlanDay[] = [];
  const usageCount: Record<string, number> = {};
  const cats = categoriesForMealCount(inp.mealsPerDay);

  if (existing) {
    existing.days.forEach((d) =>
      d.meals.forEach((m) => {
        if (m.pinned) usageCount[m.templateId] = (usageCount[m.templateId] ?? 0) + 1;
      })
    );
  }

  if (pool.length) {
    for (let i = 0; i < 7; i++) {
      const date = addDaysISO(inp.startDate, i);
      const wd = (new Date(date + "T00:00:00").getDay() + 6) % 7;
      const isTraining = inp.trainingDays.includes(wd);
      const existingDay = existing?.days.find((d) => d.date === date);
      const meals = buildDay(pool, cats, isTraining, inp, usageCount, existingDay);
      meals.forEach((m) => {
        if (!m.pinned) usageCount[m.templateId] = (usageCount[m.templateId] ?? 0) + 1;
      });
      days.push({ date, meals, trainingDay: isTraining });
    }
  }

  return finalize({
    id: existing?.id ?? `mp-${Date.now()}`,
    startDate: inp.startDate,
    endDate: addDaysISO(inp.startDate, 6),
    caloriesTarget: inp.caloriesTarget,
    proteinTarget: inp.proteinTarget,
    mealsPerDay: inp.mealsPerDay,
    goal: inp.goal,
    excludedIngredients: inp.excludedIngredients,
    favoriteIngredients: inp.favoriteIngredients,
    favoriteTemplateIds: inp.favoriteTemplateIds,
    days,
    groceryList: [],
    prepTasks: [],
    createdAt: existing?.createdAt ?? new Date().toISOString().slice(0, 10),
  });
}

function finalize(plan: MealPlan): MealPlan {
  return {
    ...plan,
    groceryList: aggregateGrocery(plan.days.flatMap((d) => d.meals.map((m) => ({ templateId: m.templateId, portion: 1 })))),
    prepTasks: plan.goal === "prep_2_3_days" ? buildPrepTasks(plan.days, 3) : [],
  };
}

export function planToInput(plan: MealPlan): PlanInput {
  return {
    caloriesTarget: plan.caloriesTarget,
    proteinTarget: plan.proteinTarget,
    mealsPerDay: plan.mealsPerDay,
    goal: plan.goal,
    excludedIngredients: plan.excludedIngredients,
    favoriteIngredients: plan.favoriteIngredients,
    favoriteTemplateIds: plan.favoriteTemplateIds,
    trainingDays: plan.days.reduce<number[]>((acc, d) => {
      if (d.trainingDay) {
        const wd = (new Date(d.date + "T00:00:00").getDay() + 6) % 7;
        if (!acc.includes(wd)) acc.push(wd);
      }
      return acc;
    }, []),
    startDate: plan.startDate,
  };
}

/** Заменить одно блюдо: пробуем несколько кандидатов, берём того, кто лучше держит день в цели */
export function replaceMeal(plan: MealPlan, dayIdx: number, mealIdx: number): MealPlan {
  const inp = planToInput(plan);
  const pool = filterPool(inp);
  const day = plan.days[dayIdx];
  if (!day) return plan;
  const slot = day.meals[mealIdx];
  if (!slot || slot.pinned) return plan;

  const usage: Record<string, number> = {};
  plan.days.forEach((d, di) =>
    d.meals.forEach((m, mi) => {
      if (di === dayIdx && mi === mealIdx) return;
      usage[m.templateId] = (usage[m.templateId] ?? 0) + 1;
    })
  );
  const usedToday = new Set(day.meals.filter((_, i) => i !== mealIdx).map((m) => m.templateId));

  let best: MealPrepTemplate | undefined;
  let bestScore = Infinity;
  for (let a = 0; a < 12; a++) {
    const tpl = pickTemplate(pool, { category: slot.category, isTraining: !!day.trainingDay }, inp, usage, usedToday, slot.templateId);
    if (!tpl) break;
    const trial = day.meals.map((m, mi) => (mi === mealIdx ? { ...m, templateId: tpl.id } : m));
    const score = fitScore(trial, plan.caloriesTarget, plan.proteinTarget);
    if (score < bestScore) {
      bestScore = score;
      best = tpl;
    }
  }
  if (!best) return plan;
  const chosen = best;
  const days = plan.days.map((d, di) =>
    di !== dayIdx ? d : { ...d, meals: d.meals.map((m, mi) => (mi === mealIdx ? { ...m, templateId: chosen.id } : m)) }
  );
  return finalize({ ...plan, days });
}

export function regenerateDay(plan: MealPlan, dayIdx: number): MealPlan {
  const inp = planToInput(plan);
  const pool = filterPool(inp);
  const day = plan.days[dayIdx];
  if (!day) return plan;
  const usage: Record<string, number> = {};
  plan.days.forEach((d, di) =>
    d.meals.forEach((m) => {
      if (di === dayIdx && !m.pinned) return;
      usage[m.templateId] = (usage[m.templateId] ?? 0) + 1;
    })
  );
  const cats = day.meals.map((m) => m.category);
  const meals = buildDay(pool, cats, !!day.trainingDay, inp, usage, day);
  const days = plan.days.map((d, di) => (di === dayIdx ? { ...d, meals } : d));
  return finalize({ ...plan, days });
}

export function setMeal(plan: MealPlan, dayIdx: number, mealIdx: number, templateId: string): MealPlan {
  const days = plan.days.map((d, di) =>
    di !== dayIdx ? d : { ...d, meals: d.meals.map((m, mi) => (mi === mealIdx ? { ...m, templateId } : m)) }
  );
  return finalize({ ...plan, days });
}

export function togglePin(plan: MealPlan, dayIdx: number, mealIdx: number): MealPlan {
  const days = plan.days.map((d, di) =>
    di !== dayIdx ? d : { ...d, meals: d.meals.map((m, mi) => (mi === mealIdx ? { ...m, pinned: !m.pinned } : m)) }
  );
  return { ...plan, days };
}

export function regenerateWeek(plan: MealPlan): MealPlan {
  return generateMealPlan(planToInput(plan), plan);
}

// === Продукты ===

export function aggregateGrocery(items: { templateId: string; portion: number }[]) {
  const acc = new Map<string, { item: string; group: GroceryGroup; qtyG: number; qtyP: number }>();
  items.forEach((it) => {
    const t = byId(it.templateId);
    if (!t) return;
    t.ingredients.forEach((ing) => {
      const key = ing.name.toLowerCase();
      const cur = acc.get(key) ?? { item: ing.name, group: ing.group, qtyG: 0, qtyP: 0 };
      if (ing.grams) cur.qtyG += ing.grams * it.portion;
      if (ing.pieces) cur.qtyP += ing.pieces * it.portion;
      acc.set(key, cur);
    });
  });
  const groupOrder: GroceryGroup[] = ["meat_fish", "dairy_eggs", "grains_carbs", "veg_fruit", "fermented", "sauces", "supplements_other"];
  return Array.from(acc.values())
    .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a.item.localeCompare(b.item, "ru"))
    .map((x) => ({
      item: x.item,
      group: x.group,
      qty: [x.qtyG ? `${Math.round(x.qtyG)} г` : "", x.qtyP ? `${Math.round(x.qtyP * 10) / 10} шт.` : ""].filter(Boolean).join(" / "),
    }));
}

function buildPrepTasks(days: MealPlanDay[], prepDays: number): string[] {
  const tasks: string[] = [];
  const meatNeeded: Record<string, number> = {};
  days.slice(0, prepDays).forEach((d) =>
    d.meals.forEach((m) => {
      const t = byId(m.templateId);
      t?.ingredients.forEach((i) => {
        if (i.group === "meat_fish" && i.grams) meatNeeded[i.name] = (meatNeeded[i.name] ?? 0) + i.grams;
      });
    })
  );
  Object.entries(meatNeeded).forEach(([name, g]) => {
    tasks.push(`Замариновать и приготовить ${name} ~${g} г на ${prepDays} дн.`);
  });
  tasks.push("Сварить рис и гречку на 2–3 дня, разложить по контейнерам");
  tasks.push("Нарезать овощи на 2–3 дня (огурцы, помидоры, перец, зелень)");
  tasks.push("Разложить творог / йогурт по контейнерам 200 г");
  return tasks;
}

// === Итоги ===

export interface Totals {
  cal: number;
  p: number;
  f: number;
  c: number;
  fb: number;
}

export const ZERO_TOTALS: Totals = { cal: 0, p: 0, f: 0, c: 0, fb: 0 };

export function totalsFor(items: { templateId?: string; portion?: number }[]): Totals {
  return items.reduce<Totals>(
    (a, it) => {
      const t = it.templateId ? byId(it.templateId) : undefined;
      if (!t) return a;
      const k = it.portion ?? 1;
      return {
        cal: a.cal + Math.round(t.calories * k),
        p: a.p + Math.round(t.protein * k),
        f: a.f + Math.round(t.fat * k),
        c: a.c + Math.round(t.carbs * k),
        fb: a.fb + Math.round((t.fiber ?? 0) * k),
      };
    },
    { ...ZERO_TOTALS }
  );
}

export function totalsForDay(day: MealPlanDay): Totals {
  return totalsFor(day.meals);
}

export function totalsForRation(r: DayRation): Totals {
  return totalsFor(r.slots);
}

export function dayInRange(t: Totals, calTarget: number, protTarget: number): boolean {
  const calsOk = Math.abs(t.cal - calTarget) <= Math.max(150, calTarget * 0.1);
  const protOk = t.p >= protTarget * 0.9;
  return calsOk && protOk;
}

/**
 * Автодобор для конструктора: заполняет пустые слоты так, чтобы попасть в цели.
 * Жадно, по одному слоту, с расчётом «сколько осталось на слот».
 */
export function autoFillRation(
  ration: DayRation,
  calTarget: number,
  protTarget: number,
  favorites: string[],
  exclude: string[] = []
): DayRation {
  const pool = filterPool({ goal: "default", excludedIngredients: exclude });
  const used = new Set(ration.slots.map((s) => s.templateId).filter(Boolean) as string[]);
  let slots = ration.slots.map((s) => ({ ...s }));
  const empties = slots.map((s, i) => (s.templateId ? -1 : i)).filter((i) => i >= 0);
  for (let k = 0; k < empties.length; k++) {
    const idx = empties[k];
    const cur = totalsFor(slots);
    const left = empties.length - k;
    const calNeed = (calTarget - cur.cal) / left;
    const protNeed = (protTarget - cur.p) / left;
    const cands = pool.filter((t) => t.category === slots[idx].category && !used.has(t.id));
    if (!cands.length) continue;
    let best = cands[0];
    let bestScore = Infinity;
    for (const t of cands) {
      const score =
        Math.abs(t.calories - calNeed) / Math.max(200, Math.abs(calNeed)) +
        (t.protein < protNeed ? (protNeed - t.protein) / Math.max(20, Math.abs(protNeed)) : 0) * 1.5 -
        (favorites.includes(t.id) ? 0.15 : 0) +
        Math.random() * 0.1;
      if (score < bestScore) {
        bestScore = score;
        best = t;
      }
    }
    slots[idx] = { ...slots[idx], templateId: best.id, portion: 1 };
    used.add(best.id);
  }
  return { ...ration, slots };
}
