"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, TextField } from "@mui/material";

import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

import { updatePassword } from "../actions";
import { openAuthModal, useAuth } from "../store";
import { AuthHeader } from "../ui";

// Новый пароль после перехода по ссылке из письма. Ссылка уже выполнила вход — меняем пароль вошедшему
export default function NewPasswordView() {
  const t = useTranslations("auth");
  const { user, loading } = useAuth();
  const expired = useSearchParams().get("expired") === "1";
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (loading) return <Skeleton className="h-64 rounded-panel bg-gray-50" />;

  if (expired || !user) {
    return (
      <div className="text-center">
        <AuthHeader title={t("newPassword.expired")} subtitle={t("newPassword.expiredText")} />
        <Button size="lg" fullWidth onClick={openAuthModal}>
          {t("newPassword.login")}
        </Button>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="text-center">
        <AuthHeader title={t("newPassword.done")} subtitle={t("newPassword.doneText")} />
        <Button size="lg" fullWidth href="/account">
          {t("newPassword.toAccount")}
        </Button>
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
        <Button type="submit"  size="lg" fullWidth disabled={state === "sending"}>
          {t("newPassword.submit")}
        </Button>
      </form>
    </>
  );
}
