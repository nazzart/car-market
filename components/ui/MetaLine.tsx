import { Fragment } from "react";

import { cn } from "@/lib/utils";

// Строка «Rīga · Dīleris · pirms 2 dienām»: пустые части (false, null, "") пропускаются, точки — между остальными
export default function MetaLine({
  items,
  className,
}: {
  items: React.ReactNode[];
  className?: string;
}) {
  const shown = items.filter((item) => item !== null && item !== undefined && item !== false && item !== "");

  return (
    <div className={cn("text-xs text-gray-500", className)}>
      {shown.map((item, i) => (
        <Fragment key={i}>
          {i > 0 && " · "}
          {item}
        </Fragment>
      ))}
    </div>
  );
}
