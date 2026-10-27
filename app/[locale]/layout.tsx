import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import AppThemeProvider from "@/components/providers/ThemeProvider";
import "../globals.css";
import { colors } from "@/lib/colors";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";
import NavigationProgress from "@/components/layout/NavigationProgress";
import CompareBar from "@/features/compare/components/CompareBar";
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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      style={{
        ["--color-primary" as any]: colors.primary,
        ["--color-primary-hover" as any]: colors.primaryHover,
      }}
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider>
          <AppThemeProvider>
            <Header />
            <NavigationProgress />
            {/* flex-1 — подвал прижат к низу экрана даже на коротких страницах */}
            <main className="flex-1">{children}</main>
            <Footer />
            <CompareBar />
          </AppThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
