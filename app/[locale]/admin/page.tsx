import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import Container from "@/components/layout/Container";
import AdminView from "@/features/admin/AdminView";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "moderation.admin" });

  // модерация не для поиска Google
  return { title: t("metaTitle"), robots: { index: false, follow: false } };
}

// TODO(backend): с бэкендом — проверка роли на сервере (сейчас демо: роль из браузера)
export default function AdminPage() {
  return (
    <Container>
      <AdminView />
    </Container>
  );
}
