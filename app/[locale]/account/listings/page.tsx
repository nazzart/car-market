import { redirect } from "@/i18n/navigation";

// Объявления пользователя теперь в личном кабинете (/account)
export default async function AccountListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  redirect({ href: "/account", locale });
}
