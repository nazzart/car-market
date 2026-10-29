// Типы общих компонентов (components/ui)

// Вариант выбора: значение и подпись (выпадающие списки, чипы, переключатели)
export type Option = { label: string; value: string };

// Вариант поиска с выбором (SearchSelect)
export type SelectOption = Option & {
  count?: number; // число объявлений — справа серым
  keywords?: string; // дополнительные слова для поиска
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
