import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

import Container from "../Container";

// "#" — страницы, которые ещё не созданы
// Ключи — nav.* в messages; "#" — страницы, которые ещё не созданы
const columns = [
  {
    title: "footer.buyers",
    links: [
      { label: "cars", href: "/cars" },
      { label: "dealers", href: "/dealers" },
      { label: "favorites", href: "/favorites" },
    ],
  },
  {
    title: "footer.sellers",
    links: [
      { label: "postListing", href: "/sell" },
      { label: "footer.account", href: "/account" },
    ],
  },
  {
    title: "footer.about",
    links: [
      { label: "footer.aboutUs", href: "/about" },
      { label: "footer.rules", href: "/rules" },
      { label: "footer.privacy", href: "/privacy" },
      { label: "footer.contacts", href: "/contacts" },
    ],
  },
];

export default function Footer() {
  const t = useTranslations("nav");

  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <Container className="bg-transparent py-10">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-bold text-lg text-primary">
              bestauto.lv
            </Link>

            <p className="text-sm text-gray-500 mt-2 max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {t(col.title)}
              </h3>

              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-black transition"
                    >
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-500">
          © {new Date().getFullYear()} bestauto.lv
        </div>
      </Container>
    </footer>
  );
}
