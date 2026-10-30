import type { SelectOption } from "@/components/ui/types";

import type { FilterModel } from "../types";

// Значение варианта: «5 Series» или «5 Series|530» — модель и версия одним выбором
export const modelValue = (model: string, version?: string) => (version ? `${model}|${version}` : model);
export const parseModelValue = (value: string) => {
  const [model = "", version = ""] = value.split("|");
  return { model, version };
};

// Список «Modelis» (/cars и главная): модели, под каждой — группы версий из объявлений («530», «540») с числом.
// Точные версии каталога («530d», «530d xDrive») — только в поиске: ввели «530d» — выбрали сразу её.
// Выбранная версия, которой нет в списке (пришла из адреса), добавляется под своей моделью
export function modelOptions(models: FilterModel[], countOf: (model: string) => number | undefined, selected = ""): SelectOption[] {
  const current = parseModelValue(selected);
  return models.flatMap(({ name: model, versions, catalogVersions }) => {
    const seen = new Set(versions.map((v) => v.value.toLowerCase()));
    const version = (value: string, count?: number, searchOnly?: boolean): SelectOption => ({
      value: modelValue(model, value),
      label: value,
      fullLabel: `${model} · ${value}`,
      keywords: model,
      count,
      indent: true,
      ...(searchOnly ? { searchOnly } : {}),
    });
    const exact = catalogVersions.filter((v) => {
      const key = v.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const missing = current.model === model && current.version && !seen.has(current.version.toLowerCase());
    return [
      { value: model, label: model, count: countOf(model) },
      ...versions.map((v) => version(v.value, v.count)),
      ...(missing ? [version(current.version)] : []),
      ...exact.map((v) => version(v, undefined, true)),
    ];
  });
}
