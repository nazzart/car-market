// Типы общих компонентов (components/ui)

// Вариант выбора: значение и подпись (выпадающие списки, чипы, переключатели)
export type Option = { label: string; value: string };

// Вариант поиска с выбором (SearchSelect)
export type SelectOption = Option & {
  count?: number; // число объявлений — справа серым
  keywords?: string; // дополнительные слова для поиска
  // вложенный вариант — с отступом под родителем: версия «530» под моделью «5 Series»
  indent?: boolean;
  fullLabel?: string; // подпись в поле и в результатах поиска, где родителя рядом нет: «5 Series 530»
  searchOnly?: boolean; // только в результатах поиска (и если выбран): точная версия «530d»
};

// Вариант с названием группы — для заголовков групп в списке SearchSelect
export type GroupedOption = SelectOption & { group?: string };

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "danger" | "dangerOutline" | "white";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type BadgeTone = "neutral" | "muted" | "success" | "info" | "warning" | "danger" | "dangerStrong" | "solid";
export type NoticeTone = "danger" | "warning";

export type ToastAction = { label: string; onClick?: () => void; href?: string };

export type ToastOptions = {
  message: React.ReactNode;
  tone?: "default" | "success" | "error";
  action?: ToastAction;
  position?: "top" | "bottom";
  duration?: number;
};
