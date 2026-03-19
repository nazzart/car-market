import { useState } from "react";

export function useSectionNext(
  isValid: boolean,
  required: boolean,
  onNext?: () => void
) {
  const [attemptedNext, setAttemptedNext] = useState(false);

  const handleNext = () => {
    setAttemptedNext(true);

    if (required && !isValid) return;

    onNext?.();
  };

  return {
    attemptedNext,
    handleNext,
  };
}