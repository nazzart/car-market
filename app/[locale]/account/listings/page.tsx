import { redirect } from "@/i18n/navigation";

type AccountListingsPageProps = {
  params: Promise<{ locale: string }>;
};

// Объявления пользователя теперь в личном кабинете (/account)
export default async function AccountListingsPage({
  params,
}: AccountListingsPageProps) {
  const { locale } = await params;

  redirect({ href: "/account", locale });
}
