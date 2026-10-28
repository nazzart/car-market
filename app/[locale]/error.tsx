"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import Container from "@/components/layout/Container";
import { Link } from "@/i18n/navigation";

// Неожиданная ошибка на странице: шапка и подвал остаются, предлагаем повторить
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common.error");

  useEffect(() => {
    // TODO: отправлять в сервис мониторинга ошибок (например, Sentry)
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div className="py-16 sm:py-24 text-center max-w-xl mx-auto">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-red-50">
          <ErrorOutlineIcon sx={{ fontSize: 30 }} className="text-primary" />
        </span>

        <h1 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="mt-3 text-gray-500">{t("text")}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center h-12 px-6 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold transition cursor-pointer"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="inline-flex items-center h-12 px-6 rounded-full border border-gray-300 font-semibold hover:border-gray-900 transition"
          >
            {t("home")}
          </Link>
        </div>

        {error.digest && <p className="mt-8 text-xs text-gray-400">{t("code", { code: error.digest })}</p>}
      </div>
    </Container>
  );
}
