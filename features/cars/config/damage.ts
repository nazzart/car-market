// Общая схема повреждений: форма продажи (выбор) и страница объявления (просмотр)

export type Damage = "paint" | "scratch" | "dent" | "rust";

export type DamageMap = Record<string, Damage[]>;

export const damageOptions: { value: Damage; label: string }[] = [
  { value: "paint", label: "Окрас" },
  { value: "scratch", label: "Скол / Царапина" },
  { value: "dent", label: "Вмятина" },
  { value: "rust", label: "Ржавчина" },
];

export const damageLabel = (damage: Damage) =>
  damageOptions.find((o) => o.value === damage)?.label ?? damage;

// Точки на схеме /cars/car-top.png (вид сверху, перед справа), в процентах
export const damagePoints = [
  { id: "frontBumper", label: "Передний бампер", top: "50%", left: "93%" },
  { id: "hood", label: "Капот", top: "50%", left: "80%" },
  { id: "leftFrontFender", label: "Левое переднее крыло", top: "18%", left: "75%" },
  { id: "rightFrontFender", label: "Правое переднее крыло", top: "81%", left: "75%" },
  { id: "roof", label: "Крыша", top: "50%", left: "45%" },
  { id: "leftFrontDoor", label: "Левая передняя дверь", top: "18%", left: "55%" },
  { id: "rightFrontDoor", label: "Правая передняя дверь", top: "81%", left: "55%" },
  { id: "leftRearDoor", label: "Левая задняя дверь", top: "18%", left: "40%" },
  { id: "rightRearDoor", label: "Правая задняя дверь", top: "81%", left: "40%" },
  { id: "trunk", label: "Багажник", top: "50%", left: "18%" },
  { id: "leftRearFender", label: "Левое заднее крыло", top: "18%", left: "23%" },
  { id: "rightRearFender", label: "Правое заднее крыло", top: "81%", left: "23%" },
  { id: "rearBumper", label: "Задний бампер", top: "50%", left: "8%" },
];
