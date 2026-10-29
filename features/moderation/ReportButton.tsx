"use client";

import { useState } from "react";
import { Radio } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Dialog, { DialogActions, DialogHeader } from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";

import { BLOCK_REASONS, BlockReason, addReport } from "./store";

// «Пожаловаться на объявление»: причина + комментарий → очередь модератора
export default function ReportButton({ listingId, className }: { listingId: string; className?: string }) {
  const t = useTranslations("moderation.report");
  const tReasons = useTranslations("moderation.reasons");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<BlockReason | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);

  const close = () => {
    setOpen(false);
    // сбрасываем после анимации закрытия
    setTimeout(() => {
      setReason(null);
      setText("");
      setSent(false);
    }, 200);
  };

  const submit = () => {
    if (!reason) return;
    addReport(listingId, reason, text.trim() || undefined);
    setSent(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition cursor-pointer", className)}
      >
        <FlagOutlinedIcon sx={{ fontSize: 18 }} />
        {t("button")}
      </button>

      <Dialog open={open} onClose={close}>
        {sent ? (
          <div className="text-center">
            <CheckCircleOutlineIcon sx={{ fontSize: 48 }} className="text-success-accent" />
            <h2 className="text-lg font-semibold mt-3">{t("thanksTitle")}</h2>
            <p className="text-gray-600 mt-1">{t("thanksText")}</p>
            <Button variant="dark" onClick={close} className="mt-6">
              {t("close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader title={t("title")} text={t("subtitle")} />

            <div role="radiogroup" className="mt-4 space-y-1">
              {BLOCK_REASONS.map((r) => (
                <label
                  key={r}
                  className={cn(
                    "flex items-center gap-1 pr-3 rounded-xl cursor-pointer transition",
                    reason === r ? "bg-gray-100" : "hover:bg-gray-50"
                  )}
                >
                  <Radio size="small" checked={reason === r} onChange={() => setReason(r)} value={r} />
                  <span className="text-sm text-gray-900">{tReasons(r)}</span>
                </label>
              ))}
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("placeholder")}
              rows={3}
              maxLength={500}
              className="mt-3 w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900 resize-none"
            />

            <DialogActions>
              <Button variant="outline" onClick={close}>
                {t("cancel")}
              </Button>
              <Button onClick={submit} disabled={!reason}>
                {t("send")}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}
