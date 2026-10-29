"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import Button from "@/components/ui/Button";
import { isEmail } from "@/lib/validate";

import { requestPasswordReset } from "../actions";
import { AuthHeader } from "../ui";

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordView({ onBack }: Props) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = submitted && !isEmail(email);

  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isEmail(email)) return;

    // ссылка в письме ведёт на /api/auth/callback → /account/password (новый пароль)
    setSending(true);
    await requestPasswordReset(email).catch(() => null);
    setSending(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-5">
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 32 }} />
        </span>

        <AuthHeader
          title={t("forgot.sentTitle")}
          subtitle={t("forgot.sentText", { email: email.trim() })}
        />

        <Button size="lg" fullWidth onClick={onBack}>
          {t("forgot.back")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        title={t("forgot.title")}
        subtitle={t("forgot.subtitle")}
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label={t("emailLabel")}
          type="email"
          autoComplete="email"
          autoFocus
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError && t("invalidEmail")}
        />

        <Button type="submit"  size="lg" fullWidth disabled={sending}>
          {t("forgot.submit")}
        </Button>
      </form>
    </>
  );
}
