"use client";

import { useState } from "react";
import { Dialog, MenuItem, TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import { BLOCK_REASONS, BlockReason } from "@/features/moderation/store";

export type DialogMode = "block" | "remove" | "reject" | "blockAccount";

type Props = {
  mode: DialogMode | null;
  name: string; // название объявления или аккаунта
  defaultReason?: BlockReason; // например, причина жалобы или найденный риск
  onClose: () => void;
  onConfirm: (reason: BlockReason, note: string) => void;
};

// Блокировка / удаление / отклонение: причина обязательна (её увидит продавец), пояснение — по желанию
export default function ModerationDialog({ mode, name, defaultReason, onClose, onConfirm }: Props) {
  return (
    <Dialog
      open={mode !== null}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: 4, m: 2, width: "100%", maxWidth: 460 } } }}
    >
      {/* key: при каждом открытии — свежие поля */}
      {mode && (
        <DialogBody
          key={`${mode}-${name}`}
          mode={mode}
          name={name}
          defaultReason={defaultReason}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      )}
    </Dialog>
  );
}

function DialogBody({ mode, name, defaultReason, onClose, onConfirm }: Omit<Props, "mode"> & { mode: DialogMode }) {
  const t = useTranslations("moderation.admin.dialog");
  const tReasons = useTranslations("moderation.reasons");
  const [reason, setReason] = useState<BlockReason>(defaultReason ?? "wrongInfo");
  const [note, setNote] = useState("");

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">{t(`${mode}.title`)}</h2>
      <p className="text-sm text-gray-600 mt-1">{t(`${mode}.text`, { name })}</p>

      <div className="space-y-4 mt-5">
        <TextField
          select
          label={t("reason")}
          value={reason}
          onChange={(e) => setReason(e.target.value as BlockReason)}
          fullWidth
        >
          {BLOCK_REASONS.map((r) => (
            <MenuItem key={r} value={r}>
              {tReasons(r)}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label={t("note")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          rows={2}
          fullWidth
          slotProps={{ htmlInput: { maxLength: 300 } }}
        />
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="h-11 px-5 rounded-full border border-gray-200 hover:border-gray-900 text-sm font-medium transition cursor-pointer"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={() => onConfirm(reason, note.trim())}
          className="h-11 px-5 rounded-full bg-error hover:opacity-90 text-white text-sm font-semibold transition cursor-pointer"
        >
          {t(`${mode}.confirm`)}
        </button>
      </div>
    </div>
  );
}
