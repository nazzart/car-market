import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Заголовок страницы (h1) — тот же размер везде, где нет PageHeader (объявление, дилер, кабинет)
export const pageTitleClass = "text-2xl sm:text-3xl font-semibold tracking-tight";

type PageHeaderProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
  className?: string;
};

// Шапка страницы: «← назад», заголовок, подзаголовок и, справа, элементы управления (сортировка, «Очистить»)
export default function PageHeader({
  title,
  subtitle,
  back,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("mb-6", className)}>
      {back && (
        <Link href={back.href} className="inline-flex items-center gap-1.5 mb-3 text-sm text-gray-600 hover:text-black transition">
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          {back.label}
        </Link>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className={pageTitleClass}>{title}</h1>
          {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
