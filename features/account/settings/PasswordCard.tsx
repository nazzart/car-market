"use client";

import { useState } from "react";
import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { changePassword } from "@/features/auth/actions";

import SettingsCard from "./SettingsCard";

export default function PasswordCard() {
  const t = useTranslations("account.settings.password");
  const tAuth = useTranslations("auth");

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);
  const [wrongCurrent, setWrongCurrent] = useState(false);

  const strong = next.length >= 8 && /\d/.test(next) && /\p{L}/u.test(next);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setDone(false);
    setWrongCurrent(false);
    if (!current || !strong) return;

    const result = await changePassword(current, next).catch(() => ({ error: "failed" as const }));
    if ("error" in result) return setWrongCurrent(true);
    setCurrent("");
    setNext("");
    setSubmitted(false);
    setDone(true);
  };

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <form onSubmit={handleSubmit} noValidate className="grid sm:grid-cols-2 gap-4">
        <TextField
          label={t("current")}
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          error={(submitted && !current) || wrongCurrent}
          helperText={(submitted && !current && t("currentRequired")) || (wrongCurrent && t("wrong"))}
          fullWidth
        />
        <TextField
          label={t("next")}
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={submitted && !strong}
          helperText={submitted && !strong ? t("weak") : tAuth("register.rules.length")}
          fullWidth
        />

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="outline">
            {t("change")}
          </Button>
          {done && <span className="text-sm text-success">{t("changed")}</span>}
        </div>
      </form>
    </SettingsCard>
  );
}
