"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";

import { AuthHeader, pillSx } from "../ui";

type Props = {
  email: string;
  onClose: () => void;
};

export default function RegisterSuccessView({ email, onClose }: Props) {
  const [resent, setResent] = useState(false);

  return (
    <div className="text-center">
      <span className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-5">
        <MarkEmailUnreadOutlinedIcon sx={{ fontSize: 32 }} />
      </span>

      <AuthHeader
        title="Подтвердите email"
        subtitle={`Мы отправили письмо на ${email}. Перейдите по ссылке в письме, чтобы активировать аккаунт.`}
      />

      <Button variant="contained" size="large" fullWidth onClick={onClose} sx={pillSx}>
        Понятно
      </Button>

      <p className="text-sm text-gray-600 mt-5">
        {resent ? (
          "Письмо отправлено повторно"
        ) : (
          <>
            Письмо не пришло? Проверьте «Спам» или{" "}
            {/* TODO: повторная отправка через API */}
            <button
              type="button"
              onClick={() => setResent(true)}
              className="font-semibold text-gray-900 underline underline-offset-4 hover:text-primary cursor-pointer"
            >
              отправьте ещё раз
            </button>
          </>
        )}
      </p>
    </div>
  );
}
