"use client";

import { useState } from "react";
import { TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { deleteAccount } from "@/features/account/actions";
import { useAuth } from "@/features/auth/store";
import { useRouter } from "@/i18n/navigation";

import SettingsCard from "./SettingsCard";

// Удаление аккаунта — навсегда, с подтверждением паролем
export default function DeleteAccountCard({ isDealer }: { isDealer: boolean }) {
  const t = useTranslations("account.settings.delete");
  const { setUser } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [sending, setSending] = useState(false);

  const close = () => {
    setOpen(false);
    setPassword("");
    setWrong(false);
  };

  const confirm = async () => {
    if (!password) return setWrong(true);
    setSending(true);
    const result = await deleteAccount(password).catch(() => ({ error: "invalid" as const }));
    setSending(false);
    if ("error" in result) return setWrong(true);
    setUser(null);
    router.replace("/");
  };

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <Button variant="dangerOutline" onClick={() => setOpen(true)}>
        {t("button")}
      </Button>

      <ConfirmDialog
        open={open}
        onClose={close}
        onConfirm={confirm}
        title={t("dialogTitle")}
        text={isDealer ? t("dialogTextDealer") : t("dialogText")}
        confirmLabel={t("confirm")}
        cancelLabel={t("cancel")}
        confirmDisabled={sending}
        maxWidth={440}
      >
        <TextField
          label={t("password")}
          type="password"
          autoComplete="current-password"
          autoFocus
          fullWidth
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setWrong(false);
          }}
          error={wrong}
          helperText={wrong && t("wrongPassword")}
          sx={{ mt: 3 }}
        />
      </ConfirmDialog>
    </SettingsCard>
  );
}
