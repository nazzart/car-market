import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// Используем вместо next/link и next/navigation — ссылки сохраняют текущий язык
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
