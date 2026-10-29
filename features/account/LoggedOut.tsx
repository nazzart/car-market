"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { openAuthModal, useAuth } from "@/features/auth/store";


type LoggedOutProps = { title?: string };

// title — заголовок страницы, на которую пытались попасть (например, «Настройки профиля»)
// Не вошёл — просим войти. Пока профиль загружается, вместо этого — заглушка (чтобы не мигало «Войдите»)
export default function LoggedOut({ title }: LoggedOutProps) {
  const t = useTranslations("account.loggedOut");
  const { loading } = useAuth();

  if (loading) return <Skeleton className="max-w-3xl mx-auto my-10 h-80 rounded-panel bg-gray-50" />;

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-gray-100 text-gray-700 mb-5">
        <LockOutlinedIcon sx={{ fontSize: 30 }} />
      </span>

      <h1 className="text-2xl font-semibold tracking-tight">{title ?? t("title")}</h1>
      <p className="text-gray-500 mt-2">
        {t("text")}
      </p>

      <Button onClick={openAuthModal} className="mt-6 px-8">
        {t("login")}
      </Button>

    </div>
  );
}
