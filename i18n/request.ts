import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

// Переводы разбиты по разделам сайта: messages/{locale}/{namespace}.json
const namespaces = [
  "common",
  "nav",
  "home",
  "options",
  "search",
  "cars",
  "listing",
  "dealers",
  "auth",
  "account",
  "sell",
] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const entries = await Promise.all(
    namespaces.map(async (ns) => [ns, (await import(`../messages/${locale}/${ns}.json`)).default])
  );

  return {
    locale,
    messages: Object.fromEntries(entries),
  };
});
