import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: React.ElementType<{ sx?: object; className?: string }>;
  iconClassName?: string; // цвет значка в hero
  title?: React.ReactNode;
  text?: React.ReactNode;
  variant?: "box" | "hero";
  className?: string;
  children?: React.ReactNode;
};

// «Ничего нет»: значок, заголовок, пояснение и, если нужно, действия (children).
// box — пунктирная рамка внутри страницы (пустой список, нет результатов);
// hero — крупный блок на всю страницу, когда раздел пуст целиком (избранное, сравнение)
export default function EmptyState({
  icon: Icon,
  iconClassName,
  title,
  text,
  variant = "box",
  className,
  children,
}: EmptyStateProps) {
  const hero = variant === "hero";

  return (
    <div
      className={cn(
        "text-center px-6",
        hero ? "py-12 sm:py-14 rounded-panel bg-gray-50" : "py-14 rounded-card border border-dashed border-gray-200",
        className
      )}
    >
      {Icon &&
        (hero ? (
          <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon sx={{ fontSize: 30 }} className={iconClassName ?? "text-gray-900"} />
          </span>
        ) : (
          <Icon sx={{ fontSize: 44 }} className="text-gray-300" />
        ))}

      {title &&
        (hero ? (
          <h2 className="text-xl font-semibold mt-4">{title}</h2>
        ) : (
          <h3 className={cn("text-lg font-semibold", Icon && "mt-3")}>{title}</h3>
        ))}

      {text && (
        <p className={cn("text-gray-500", hero ? "mt-2 max-w-md mx-auto" : title ? "mt-1" : Icon && "mt-2")}>{text}</p>
      )}

      {children}
    </div>
  );
}
