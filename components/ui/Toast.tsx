"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

import { Link } from "@/i18n/navigation";

import type { ToastOptions } from "./types";

// Короткие уведомления внизу (или вверху) экрана: «Сохранено», «Удалено — Отменить».
// Одно за раз: новое заменяет предыдущее. Вызов — useToast()({ message, ... })

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

type ToastProviderProps = { children: React.ReactNode };

export function ToastProvider({ children }: ToastProviderProps) {
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);
  const show = useCallback((options: ToastOptions) => setToast({ ...options, id: Date.now() }), []);
  const close = () => setToast(null);

  const action = toast?.action && (
    toast.action.href ? (
      <Link href={toast.action.href} onClick={close} className="px-2 text-sm font-semibold text-white underline underline-offset-4">
        {toast.action.label}
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => {
          toast.action!.onClick?.();
          close();
        }}
        className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white hover:bg-white/10 cursor-pointer"
      >
        {toast.action.label}
      </button>
    )
  );
  const tone = toast?.tone ?? "default";

  return (
    <ToastContext.Provider value={show}>
      {children}
      <Snackbar
        key={toast?.id}
        open={Boolean(toast)}
        autoHideDuration={toast?.duration ?? (toast?.action ? 5000 : 4000)}
        onClose={(_, reason) => reason !== "clickaway" && close()}
        anchorOrigin={{ vertical: toast?.position ?? "bottom", horizontal: "center" }}
        {...(tone === "default" ? { message: toast?.message, action } : {})}
      >
        {tone === "default" ? undefined : (
          <Alert severity={tone} variant="filled" onClose={close} action={action} sx={{ borderRadius: "14px" }}>
            {toast?.message}
          </Alert>
        )}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("useToast: нет ToastProvider выше по дереву");
  return toast;
}
