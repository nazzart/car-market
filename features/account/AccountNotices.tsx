"use client";

import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/Button";
import Notice from "@/components/ui/Notice";
import type { User } from "@/features/auth/types";
import { useRouter } from "@/i18n/navigation";

// Что продавцу важно знать сразу: профиль дилера не заполнен, решения модератора, объявления на проверке
export default function AccountNotices({
  user,
  dealerIncomplete,
  blockedCount,
  pendingCount,
  onShow,
}: {
  user: User;
  dealerIncomplete: boolean;
  blockedCount: number;
  pendingCount: number;
  onShow: (tab: "blocked" | "pending") => void;
}) {
  const t = useTranslations("account.notices");
  const tReasons = useTranslations("moderation.reasons");
  const router = useRouter();
  const accountBlock = user.blocked;
  const hourglass = <HourglassEmptyIcon className="shrink-0" />;

  const action = (label: string, onClick: () => void) => (
    <Button variant="outline" size="sm" onClick={onClick}>
      {label}
    </Button>
  );

  return (
    <div className="space-y-3 mt-6 empty:hidden">
      {dealerIncomplete && (
        <Notice
          tone="warning"
          icon={hourglass}
          title={t("completeTitle")}
          action={action(t("completeAction"), () => router.push("/account/profile"))}
        >
          {t("completeText")}
        </Notice>
      )}
      {accountBlock && (
        <Notice tone="danger" title={t("accountTitle")}>
          {t("accountText", { reason: tReasons(accountBlock.reason) })}
          {accountBlock.note && <> — {accountBlock.note}</>}
        </Notice>
      )}
      {!accountBlock && blockedCount > 0 && (
        <Notice tone="danger" title={t("blockedTitle", { count: blockedCount })} action={action(t("show"), () => onShow("blocked"))}>
          {t("blockedText")}
        </Notice>
      )}
      {pendingCount > 0 && (
        <Notice
          tone="warning"
          icon={hourglass}
          title={t("pendingTitle", { count: pendingCount })}
          action={action(t("show"), () => onShow("pending"))}
        >
          {t("pendingText")}
        </Notice>
      )}
    </div>
  );
}
