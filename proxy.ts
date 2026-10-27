import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // всё, кроме API, служебных файлов Next.js и файлов с расширением (картинки, favicon…)
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
