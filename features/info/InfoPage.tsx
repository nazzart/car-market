import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import { Link } from "@/i18n/navigation";

export const INFO_PAGES = ["about", "rules", "privacy", "contacts"] as const;
export type InfoPageKey = (typeof INFO_PAGES)[number];

type Section = { title: string; text: string[] };

// Простые текстовые страницы: «О нас», правила, конфиденциальность, контакты.
// Тексты — в messages/{locale}/info.json
export default async function InfoPage({ page }: { page: InfoPageKey }) {
  const t = await getTranslations("info");
  const sections = t.raw(`${page}.sections`) as Section[];

  return (
    <Container>
      <div className="grid lg:grid-cols-[220px_minmax(0,1fr)] gap-10 py-10 sm:py-14">
        {/* Навигация между страницами */}
        <nav aria-label={t("nav")} className="flex lg:flex-col gap-1 overflow-x-auto scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
          {INFO_PAGES.map((key) => (
            <Link
              key={key}
              href={`/${key}`}
              aria-current={key === page ? "page" : undefined}
              className={`shrink-0 px-3 py-2 rounded-lg text-sm transition ${
                key === page ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-600 hover:text-black hover:bg-gray-50"
              }`}
            >
              {t(`${key}.title`)}
            </Link>
          ))}
        </nav>

        <article className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{t(`${page}.title`)}</h1>
          <p className="mt-3 text-lg text-gray-600">{t(`${page}.lead`)}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-semibold">{section.title}</h2>
                {section.text.map((p) => (
                  <p key={p} className="mt-2 text-gray-700 leading-relaxed">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </div>
    </Container>
  );
}

export async function infoMetadata(locale: string, page: InfoPageKey) {
  const t = await getTranslations({ locale, namespace: "info" });
  return { title: `${t(`${page}.title`)} | bestauto.lv`, description: t(`${page}.lead`) };
}
