"use client";

import { useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslations } from "next-intl";

type Props = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;

  required?: boolean;
  isValid?: boolean;

  onNext?: () => void;
  onSkip?: () => void;
};

export function SectionContainer({
  id,
  title,
  description,
  children,
  required,
  isValid,
  onNext,
  onSkip,
}: Props) {
  const t = useTranslations("sell.form");
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    onNext?.();
    if (isValid === false && required === true) return;
    setCompleted(true);
  };

  const handleSkip = () => {
    (onSkip ?? onNext)?.();
    setCompleted(true);
  };

  const showSkip = !required;

  return (
    <section
      id={id}
      className="scroll-mt-24 bg-white rounded-3xl border border-gray-200 p-5 sm:p-8 animate-[fadeIn_.3s_ease-out]"
    >
      {/* Header */}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>

          {!required && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {t("optional")}
            </span>
          )}
        </div>

        {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
      </div>

      {/* Content */}

      {children}

      {/* Footer */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ${completed ? "max-h-0 opacity-0" : "max-h-[120px] opacity-100 mt-8"}
        `}
      >
        {onNext && (
          <div className="flex items-center justify-end gap-2 pt-6 border-t border-gray-100">
            {showSkip && (
              <button
                type="button"
                onClick={handleSkip}
                className="h-11 px-5 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                {t("skip")}
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gray-900 hover:bg-black text-white text-sm font-semibold transition cursor-pointer"
            >
              {t("next")}
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
