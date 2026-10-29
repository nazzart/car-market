import { cn } from "@/lib/utils";

// Белая карточка с рамкой — основа боковых блоков, списков в модерации, разделов формы.
// card — обычная карточка, panel — крупный раздел (форма подачи, настройки) с бо́льшим скруглением и отступами
const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-5 sm:p-8" };

export default function Card({
  as: Tag = "div",
  size = "card",
  padding = size === "panel" ? "lg" : "md",
  className,
  children,
  ...rest
}: {
  as?: "div" | "section" | "aside" | "article" | "ul";
  size?: "card" | "panel";
  padding?: keyof typeof paddings;
  className?: string;
  children: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className">) {
  return (
    <Tag
      {...rest}
      className={cn(
        "border border-gray-200 bg-white",
        size === "panel" ? "rounded-panel" : "rounded-card",
        paddings[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}

// Заголовок небольшой карточки (боковые блоки, разделы модерации)
export function CardTitle({ as: Tag = "h3", className, children }: { as?: "h2" | "h3"; className?: string; children: React.ReactNode }) {
  return <Tag className={cn("font-semibold mb-3", className)}>{children}</Tag>;
}
