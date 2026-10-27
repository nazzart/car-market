"use client";

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";

import { AuthHeader, isEmail, pillSx } from "../ui";

type Props = {
  onBack: () => void;
};

export default function ForgotPasswordView({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const emailError = submitted && !isEmail(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (!isEmail(email)) return;

    // TODO: отправка письма через API
    setSent(true);
  };

  if (sent) {
    return (
      <div className="text-center">
        <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-5">
          <MarkEmailReadOutlinedIcon sx={{ fontSize: 32 }} />
        </span>

        <AuthHeader
          title="Проверьте почту"
          subtitle={`Если аккаунт с адресом ${email.trim()} существует, мы отправили на него ссылку для смены пароля.`}
        />

        <Button variant="contained" size="large" fullWidth onClick={onBack} sx={pillSx}>
          Вернуться ко входу
        </Button>
      </div>
    );
  }

  return (
    <>
      <AuthHeader
        title="Восстановление пароля"
        subtitle="Укажите email — пришлём ссылку для создания нового пароля"
      />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={emailError}
          helperText={emailError && "Введите корректный email"}
        />

        <Button type="submit" variant="contained" size="large" fullWidth sx={pillSx}>
          Отправить ссылку
        </Button>
      </form>
    </>
  );
}
