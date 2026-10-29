"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, Button, TextField } from "@mui/material";

import Skeleton from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";

import { updatePassword } from "../actions";
import { openAuthModal, useAuth } from "../store";
import { AuthHeader, pillSx } from "../ui";

// Новый пароль после перехода по ссылке из письма. Ссылка уже выполнила вход — меняем пароль вошедшему
export default function NewPasswordView() {
  const t = useTranslations("auth");
  const { user, loading } = useAuth();
  const expired = useSearchParams().get("expired") === "1";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (loading) return <Skeleton className="h-64 rounded-3xl bg-gray-50" />;

  if (expired || !user) {
    return (
      <div className="text-center">
        <AuthHeader title={t("newPassword.expired")} subtitle={t("newPassword.expiredText")} />
        <Button variant="contained" size="large" fullWidth onClick={openAuthModal} sx={pillSx}>
          {t("newPassword.login")}
        </Button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="text-center">
        <AuthHeader title={t("newPassword.done")} subtitle={t("newPassword.doneText")} />
        <Link
          href="/account"
          className="inline-flex items-center justify-center w-full h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-semibold"
        >
          {t("newPassword.toAccount")}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError(t("register.rules.length"));
    setState("sending");
    const result = await updatePassword(password).catch(() => ({ error: "failed" as const }));
    if ("error" in result) {
      setState("idle");
      return setError(t(`errors.${result.error}`));
    }
    setState("done");
  };

  return (
    <>
      <AuthHeader title={t("newPassword.title")} subtitle={t("newPassword.subtitle")} />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={t("newPassword.label")}
          type="password"
          autoComplete="new-password"
          autoFocus
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText={t("register.rules.length")}
        />
        {error && (
          <Alert severity="error" sx={{ borderRadius: "12px" }}>
            {error}
          </Alert>
        )}
        <Button type="submit" variant="contained" size="large" fullWidth disabled={state === "sending"} sx={pillSx}>
          {t("newPassword.submit")}
        </Button>
      </form>
    </>
  );
}
