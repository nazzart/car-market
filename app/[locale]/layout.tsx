import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AppThemeProvider from "@/components/providers/ThemeProvider";
import { CatalogProvider } from "@/components/providers/CatalogProvider";
import "../globals.css";
import { colors } from "@/lib/colors";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import NavigationProgress from "@/components/layout/NavigationProgress";
import CompareBar from "@/features/compare/components/CompareBar";
import { getListingStats } from "@/features/cars/api";
import { getDealers } from "@/features/dealers/api";
import { routing } from "@/i18n/routing";

// latin-ext — латышские ā, ē, ļ, š…; cyrillic — русский
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext", "cyrillic"],
});

type Props = Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>;

// Страницы собираются заранее и обновляются из базы не реже раза в 5 минут (и сразу — по revalidateTag)
export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.meta" });

  return {
    // абсолютные ссылки для превью (og:image и т. п.)
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: t("title"),
    description: t("description"),
    openGraph: { siteName: "bestauto.lv", locale: locale === "ru" ? "ru_LV" : "lv_LV", type: "website" },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const [stats, dealers] = await Promise.all([getListingStats(), getDealers()]);

  return (
    <html
      lang={locale}
      // цвет бренда — CSS-переменные для Tailwind (bg-primary и т. п.)
      style={
        {
          "--color-primary": colors.primary,
          "--color-primary-hover": colors.primaryHover,
        } as React.CSSProperties
      }
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider>
          <AppThemeProvider>
            <CatalogProvider dealers={dealers} stats={stats}>
              <Header />
              <NavigationProgress />
              {/* flex-1 — подвал прижат к низу экрана даже на коротких страницах */}
              <main className="flex-1">{children}</main>
              <Footer />
              <CompareBar />
            </CatalogProvider>
          </AppThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
