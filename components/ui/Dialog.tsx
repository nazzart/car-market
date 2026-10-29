"use client";

import { Dialog as MuiDialog } from "@mui/material";

import Button from "./Button";
import type { ButtonVariant } from "./types";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  maxWidth?: number;
  children: React.ReactNode;
};

// Окно поверх страницы в стиле сайта: скруглённая белая панель с отступами.
// Внутри — DialogHeader, содержимое и DialogActions (на телефоне кнопки друг под другом)
export default function Dialog({
  open,
  onClose,
  maxWidth = 460,
  children,
}: DialogProps) {
  return (
    <MuiDialog open={open} onClose={onClose} slotProps={{ paper: { sx: { borderRadius: "var(--radius-panel)", m: 2, width: "100%", maxWidth } } }}>
      <div className="p-6">{children}</div>
    </MuiDialog>
  );
}

type DialogHeaderProps = { title: React.ReactNode; text?: React.ReactNode };

export function DialogHeader({ title, text }: DialogHeaderProps) {
  return (
    <>
      <h2 className="text-lg font-semibold">{title}</h2>
      {text && <p className="text-sm text-gray-600 mt-1">{text}</p>}
    </>
  );
}

type DialogActionsProps = { children: React.ReactNode };

export function DialogActions({ children }: DialogActionsProps) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">{children}</div>;
}

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  text?: React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  tone?: Extract<ButtonVariant, "danger" | "primary" | "dark">;
  confirmDisabled?: boolean;
  maxWidth?: number;
  children?: React.ReactNode;
};

// «Вы уверены?»: заголовок, пояснение, дополнительные поля (children) и две кнопки. Enter подтверждает
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel,
  cancelLabel,
  tone = "danger",
  confirmDisabled,
  maxWidth,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <DialogHeader title={title} text={text} />
        {children}
        <DialogActions>
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant={tone} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
