"use client";

import { useEffect, useRef, useState } from "react";

// «Копировать» с подтверждением: copied = true на 2 секунды после успешного копирования.
// copy возвращает false, если буфер обмена недоступен (старый браузер, нет разрешения)
export function useCopyToClipboard(resetMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return false;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), resetMs);
    return true;
  };

  return { copied, copy };
}
