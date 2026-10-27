"use client";

import { useEffect, useRef, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function ListingDescription({ text }: { text?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // Кнопка нужна, только если текст реально не помещается в 4 строки
  // (зависит от ширины экрана, поэтому меряем, а не считаем символы)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(() =>
      setOverflows(el.scrollHeight > el.clientHeight + 1)
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!text) {
    return <p className="text-gray-500">Продавец не добавил описание.</p>;
  }

  return (
    <div>
      <p
        ref={ref}
        className={`text-gray-800 leading-relaxed whitespace-pre-line ${
          expanded ? "" : "line-clamp-4"
        }`}
      >
        {text}
      </p>

      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-3 inline-flex items-center gap-0.5 text-sm font-semibold text-gray-900 underline underline-offset-4 cursor-pointer"
        >
          {expanded ? "Свернуть" : "Читать полностью"}
          <KeyboardArrowDownIcon
            fontSize="small"
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      )}
    </div>
  );
}
