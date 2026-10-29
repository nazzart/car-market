import { useTranslations } from "next-intl";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CarCrashOutlinedIcon from "@mui/icons-material/CarCrashOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { Link } from "@/i18n/navigation";

// Чем сайт отличается от досок объявлений — каждая плитка ведёт к функции
const features = [
  { key: "damages", icon: CarCrashOutlinedIcon, href: "/listing/9", tint: "bg-rose-100 text-rose-600" },
  { key: "compare", icon: CompareArrowsIcon, href: "/compare", tint: "bg-info-muted text-info" },
  { key: "priceDrop", icon: TrendingDownIcon, href: "/favorites", tint: "bg-success-muted text-success" },
  { key: "dealers", icon: StorefrontOutlinedIcon, href: "/dealers", tint: "bg-warning-muted text-warning" },
] as const;

export default function WhyUs() {
  const t = useTranslations("home.why");

  return (
    <section className="py-8 sm:py-10">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("title")}</h2>
      <p className="text-gray-500 mt-1 mb-6">{t("subtitle")}</p>

      <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 snap-x scroll-px-4">
        {features.map(({ key, icon: Icon, href, tint }) => (
          <Link
            key={key}
            href={href}
            className="group snap-start shrink-0 w-64 sm:w-auto p-5 rounded-card bg-gray-50 hover:bg-gray-100 transition"
          >
            <span className={`inline-flex w-11 h-11 items-center justify-center rounded-xl ${tint} transition group-hover:scale-105`}>
              <Icon />
            </span>
            <h3 className="mt-4 font-semibold text-gray-900">{t(`${key}.title`)}</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">{t(`${key}.text`)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
