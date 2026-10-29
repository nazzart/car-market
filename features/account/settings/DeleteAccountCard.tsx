"use client";

import { useState } from "react";
import { Button, Dialog, TextField } from "@mui/material";
import { useTranslations } from "next-intl";

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

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <Button variant="outlined" color="error" onClick={() => setOpen(true)} sx={{ borderRadius: "999px", px: 3 }}>
        {t("button")}
      </Button>

      <Dialog open={open} onClose={close} slotProps={{ paper: { sx: { borderRadius: "24px", maxWidth: 440 } } }}>
        <form onSubmit={confirm} className="p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-semibold">{t("dialogTitle")}</h2>
          <p className="text-sm text-gray-600">{isDealer ? t("dialogTextDealer") : t("dialogText")}</p>
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
          />
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button onClick={close} sx={{ borderRadius: "999px", px: 3, color: "grey.800" }}>
              {t("cancel")}
            </Button>
            <Button type="submit" variant="contained" color="error" disabled={sending} sx={{ borderRadius: "999px", px: 3 }}>
              {t("confirm")}
            </Button>
          </div>
        </form>
      </Dialog>
    </SettingsCard>
  );
}
