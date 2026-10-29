"use client";

// Секция панели фильтров /cars. Поля, списки и чипы — в components/ui/form.tsx

export function FilterSection({
  title,
  active,
  children,
}: {
  title: string;
  active?: boolean; // в секции выбран фильтр — точка у заголовка
  children: React.ReactNode;
}) {
  return (
    <div className="py-5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
        {title}
        {active && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </div>
      {children}
    </div>
  );
}
