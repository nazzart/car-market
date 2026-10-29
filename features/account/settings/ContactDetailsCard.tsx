"use client";

import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import SettingsCard from "./SettingsCard";

type ContactDetailsCardProps = {
  email: string;
  phone: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  emailError: boolean;
  phoneError: boolean;
};

// Email и телефон аккаунта — одинаковые у частного лица и дилера
export default function ContactDetailsCard({
  email,
  phone,
  onEmailChange,
  onPhoneChange,
  emailError,
  phoneError,
}: ContactDetailsCardProps) {
  const t = useTranslations("account.settings.contacts");

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <div className="grid sm:grid-cols-2 gap-4">
        <TextField
          label={t("email")}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={emailError}
          helperText={emailError && t("emailError")}
          required
          fullWidth
        />
        <TextField
          label={t("phone")}
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          error={phoneError}
          helperText={phoneError && t("phoneError")}
          required
          fullWidth
        />
      </div>
    </SettingsCard>
  );
}
