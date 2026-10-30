"use client";

import { useEffect, useRef, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { cn } from "@/lib/utils";

type ScrollAreaProps = {
  children: React.ReactNode;
  className?: string;
  moreLabel: string; // подпись кнопки «Ещё фильтры»
  fadeClassName?: string; // цвет затемнения снизу — под фон панели (from-white, from-gray-50)
};

// Прокручиваемая область с подсказками: тень сверху, затемнение снизу и кнопка «ещё» в подвале,
// пока ниже есть скрытое содержимое. Кнопка не лежит поверх фильтров, чтобы их не закрывать
export default function ScrollArea({ children, className, moreLabel, fadeClassName = "from-white" }: ScrollAreaProps) {
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

      {/* ниже есть ещё фильтры: мягкое затемнение над подвалом и кнопка в подвале */}
      {edges.bottom && (
        <>
          <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-x-0 bottom-11 h-8 bg-gradient-to-t to-transparent", fadeClassName)}
          />
          <button
            type="button"
            onClick={scrollMore}
            className="shrink-0 flex items-center justify-center gap-1 h-11 border-t border-gray-900/10 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-900/5 transition cursor-pointer"
          >
            {moreLabel}
            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="animate-bounce-subtle" />
          </button>
        </>
      )}
    </div>
  );
}
