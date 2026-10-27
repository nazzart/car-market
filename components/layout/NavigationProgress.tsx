"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Тонкая полоска под шапкой при переходе на другую страницу.
// Не loading.tsx: тот включает потоковую отдачу, и 404-страницы отдавались бы со статусом 200
export default function NavigationProgress() {
  const pathname = usePathname();
  const bar = useRef<HTMLDivElement>(null);

  // новая страница отрисована — завершаем полоску
  useEffect(() => {
    if (bar.current?.dataset.state === "loading") bar.current.dataset.state = "done";
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = (e.target as Element).closest("a");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      // другой сайт или та же страница (фильтры, якоря) — полоска не нужна
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      if (bar.current) bar.current.dataset.state = "loading";
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <div ref={bar} data-state="idle" aria-hidden className="nav-progress" />;
}
