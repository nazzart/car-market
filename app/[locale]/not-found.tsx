import { useTranslations } from "next-intl";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";
import { Link } from "@/i18n/navigation";

const popularBrands = brands.filter((b) => b.popular).slice(0, 8);

export default function NotFound() {
  const t = useTranslations("common.notFound");

  return (
    <Container>
      <div className="py-16 sm:py-24 text-center max-w-xl mx-auto">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100">
          <SearchOffIcon sx={{ fontSize: 30 }} className="text-gray-500" />
        </span>

        <p className="mt-6 text-sm font-semibold tracking-widest text-gray-400">404</p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-gray-500">{t("text")}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            href="/cars"
            className="inline-flex items-center h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition"
          >
            {t("cars")}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center h-12 px-6 rounded-full border border-gray-300 font-semibold hover:border-gray-900 transition"
          >
            {t("home")}
          </Link>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-3">{t("popular")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularBrands.map((b) => (
              <Link
                key={b.slug}
                href={`/cars?brand=${b.slug}`}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm hover:border-gray-900 transition"
              >
                {b.name}
              </Link>
            ))}
            <Link href="/dealers" className="px-4 py-2 rounded-full border border-gray-200 text-sm hover:border-gray-900 transition">
              {t("dealers")}
            </Link>
          </div>
        </div>
      </div>
    </Container>
  );
}
