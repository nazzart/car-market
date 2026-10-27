// Общая схема повреждений: форма продажи (выбор) и страница объявления (просмотр)

export type Damage = "paint" | "scratch" | "dent" | "rust";

export type DamageMap = Record<string, Damage[]>;

// Названия — messages/{locale}/options.json → damageTypes / damageParts
export const damageTypes: Damage[] = ["paint", "scratch", "dent", "rust"];

// Точки на схеме /cars/car-top.png (вид сверху, перед справа), в процентах
export const damagePoints = [
  { id: "frontBumper", top: "50%", left: "93%" },
  { id: "hood", top: "50%", left: "80%" },
  { id: "leftFrontFender", top: "18%", left: "75%" },
  { id: "rightFrontFender", top: "81%", left: "75%" },
  { id: "roof", top: "50%", left: "45%" },
  { id: "leftFrontDoor", top: "18%", left: "55%" },
  { id: "rightFrontDoor", top: "81%", left: "55%" },
  { id: "leftRearDoor", top: "18%", left: "40%" },
  { id: "rightRearDoor", top: "81%", left: "40%" },
  { id: "trunk", top: "50%", left: "18%" },
  { id: "leftRearFender", top: "18%", left: "23%" },
  { id: "rightRearFender", top: "81%", left: "23%" },
  { id: "rearBumper", top: "50%", left: "8%" },
];
