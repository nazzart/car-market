// Параметры маршрута для страниц под app/[locale]: generateMetadata({ params }: LocaleParams)
export type LocaleParams = { params: Promise<{ locale: string }> };

// Параметры строки запроса (?brand=audi&page=2) — у страниц с фильтрами
export type PageSearchParams = Promise<Record<string, string | string[] | undefined>>;
