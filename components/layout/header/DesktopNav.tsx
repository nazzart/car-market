"use client";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";

import CollectionsMenu from "@/features/collections/components/CollectionsMenu";

const links = [
  { key: "cars", href: "/cars", match: ["/cars", "/listing"] },
  { key: "dealers", href: "/dealers", match: ["/dealers"] },
];

export default function DesktopNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-8 text-sm text-gray-700">
      {links.map((link) => {
        const active = link.match.some((m) => pathname.startsWith(m));

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={active ? "text-primary font-medium" : "hover:text-black"}
          >
            {t(link.key)}
          </Link>
        );
      })}

      <CollectionsMenu />
    </nav>
  );
}
