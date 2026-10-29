import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";

import type { LocaleParams } from "@/i18n/types";
import Container from "@/components/layout/Container";
import NewPasswordView from "@/features/auth/views/NewPasswordView";

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.newPassword" });
  return { title: t("title"), robots: { index: false } };
}

// Сюда ведёт ссылка из письма «Смена пароля» (через /api/auth/callback, который уже выполнил вход)
export default function NewPasswordPage() {
  return (
    <Container>
      <div className="max-w-md mx-auto py-12">
        {/* Suspense нужен для useSearchParams в клиентском компоненте */}
        <Suspense>
          <NewPasswordView />
        </Suspense>
      </div>
    </Container>
  );
}
