import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";

import { refreshSession } from "./lib/supabase/session";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Язык (lv без префикса, /ru) и обновление сессии входа на каждом запросе страницы
export default async function proxy(request: NextRequest) {
  return refreshSession(request, intl(request));
}

export const config = {
  // всё, кроме API, служебных файлов Next.js и файлов с расширением (картинки, favicon…)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
