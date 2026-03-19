"use client";

import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useState } from "react";

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
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    onNext?.();
    if (isValid === false && required === true) return;
    setCompleted(true);
  };

  const showSkip = !required;

  return (
    <section
      id={id}
      className="
        bg-white
        rounded-xl
        p-6
        border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.05)]

      "
    >
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>

        {description && (
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        )}
      </div>

      {/* Content */}

      {children}

      {/* Footer */}

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ${
            completed
              ? "max-h-0 opacity-0 mt-0"
              : "max-h-[120px] opacity-100 mt-6"
          }
        `}
      >
        {onNext && (
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            {showSkip ? (
              <Button
                variant="text"
                size="large"
                onClick={onSkip}
                sx={{ textTransform: "none" }}
              >
                Пропустить
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={handleNext}
            >
              Далее
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
