"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";

import Button from "@/components/ui/Button";

import { AuthHeader } from "../ui";

type RegisterSuccessViewProps = {
  email: string;
  onClose: () => void;
};

export default function RegisterSuccessView({ email, onClose }: RegisterSuccessViewProps) {
  const t = useTranslations("auth.success");
  const [resent, setResent] = useState(false);

  return (
    <div className="text-center">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-success-soft text-success-accent mb-5">
        <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 32 }} />
      </span>

      <AuthHeader
        title={t("title")}
        subtitle={t("text", { email })}
      />

      <Button size="lg" fullWidth onClick={onClose}>
        {t("ok")}
      </Button>

      <p className="text-sm text-gray-600 mt-5">
        {resent ? (
          t("resent")
        ) : (
          <>
            {t("notReceived")}{" "}
            {/* TODO(backend): повторная отправка через API */}
            <button
              type="button"
              onClick={() => setResent(true)}
              className="font-semibold text-gray-900 underline underline-offset-4 hover:text-primary cursor-pointer"
            >
              {t("resend")}
            </button>
          </>
        )}
      </p>
    </div>
  );
}
