import { useTranslations } from "next-intl";
import SearchOffIcon from "@mui/icons-material/SearchOff";

import { cn } from "@/lib/utils";
import { pageTitleClass } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import { brands } from "@/features/brands/data/brands";

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
        <h1 className={cn("mt-2", pageTitleClass)}>{t("title")}</h1>
        <p className="mt-3 text-gray-500">{t("text")}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button size="lg" href="/cars">
            {t("cars")}
          </Button>
          <Button variant="outline" size="lg" href="/">
            {t("home")}
          </Button>
        </div>

        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-3">{t("popular")}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {popularBrands.map((b) => (
              <Button variant="outline" size="sm" key={b.slug} href={`/cars?brand=${b.slug}`}>
                {b.name}
              </Button>
            ))}
            <Button variant="outline" size="sm" href="/dealers">
              {t("dealers")}
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
