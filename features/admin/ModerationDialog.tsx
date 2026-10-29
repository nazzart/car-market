"use client";

import { useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Dialog, { DialogActions, DialogHeader } from "@/components/ui/Dialog";
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
    <Dialog open={mode !== null} onClose={onClose}>
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
    <>
      <DialogHeader title={t(`${mode}.title`)} text={t(`${mode}.text`, { name })} />

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

      <DialogActions>
        <Button variant="outline" onClick={onClose}>
          {t("cancel")}
        </Button>
        <Button variant="danger" onClick={() => onConfirm(reason, note.trim())}>
          {t(`${mode}.confirm`)}
        </Button>
      </DialogActions>
    </>
  );
}
