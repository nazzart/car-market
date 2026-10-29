"use client";

import { useEffect, useRef, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { cn } from "@/lib/utils";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  moreLabel: string; // подпись кнопки «Ещё фильтры»
};

// Прокручиваемая область с подсказками: тень сверху, затемнение снизу и кнопка «ещё»,
// пока ниже есть скрытое содержимое
export default function ScrollArea({ children, className, moreLabel }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  const measure = () => {
    const el = ref.current;
    if (!el) return;

    const top = el.scrollTop > 4;
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 4;
    setEdges((prev) => (prev.top === top && prev.bottom === bottom ? prev : { top, bottom }));
  };

  // высота меняется при раскрытии окна, смене фильтров и т. п.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, []);

  const scrollMore = () => {
    const el = ref.current;
    el?.scrollBy({ top: el.clientHeight * 0.7, behavior: "smooth" });
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div ref={ref} onScroll={measure} className={cn("flex-1 min-h-0 overflow-y-auto scrollbar-thin", className)}>
        <div>{children}</div>
      </div>

      {/* тень под шапкой, когда список прокручен */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-gray-900/[0.06] to-transparent transition-opacity",
          edges.top ? "opacity-100" : "opacity-0"
        )}
      />

      {/* затемнение и кнопка внизу — ниже есть ещё фильтры */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-20 flex items-end justify-center pb-3 bg-gradient-to-t from-white via-white/80 to-transparent transition-opacity",
          edges.bottom ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          type="button"
          onClick={scrollMore}
          tabIndex={edges.bottom ? 0 : -1}
          className={cn(
            "inline-flex items-center gap-1 h-8 pl-3.5 pr-2.5 rounded-full bg-gray-900 text-white text-xs font-medium shadow-lg hover:bg-black transition cursor-pointer",
            edges.bottom && "pointer-events-auto"
          )}
        >
          {moreLabel}
          <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="animate-bounce-subtle" />
        </button>
      </div>
    </div>
  );
}
