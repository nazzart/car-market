"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { cn } from "@/lib/utils";
import { pageTitleClass } from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";

type ErrorProps = { error: Error & { digest?: string }; reset: () => void };

// Неожиданная ошибка на странице: шапка и подвал остаются, предлагаем повторить
export default function Error({ error, reset }: ErrorProps) {
  const t = useTranslations("common.error");

  useEffect(() => {
    // TODO: отправлять в сервис мониторинга ошибок (например, Sentry)
    console.error(error);
  }, [error]);

  return (
    <Container>
      <div className="py-16 sm:py-24 text-center max-w-xl mx-auto">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-danger-soft">
          <ErrorOutlineIcon sx={{ fontSize: 30 }} className="text-primary" />
        </span>

        <h1 className={cn("mt-6", pageTitleClass)}>{t("title")}</h1>
        <p className="mt-3 text-gray-500">{t("text")}</p>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Button size="lg" onClick={reset}>
            {t("retry")}
          </Button>
          <Button variant="outline" size="lg" href="/">
            {t("home")}
          </Button>
        </div>

        {error.digest && <p className="mt-8 text-xs text-gray-400">{t("code", { code: error.digest })}</p>}
      </div>
    </Container>
  );
}
