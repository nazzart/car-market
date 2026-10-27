"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import CollectionsMenu from "@/features/collections/components/CollectionsMenu";

const links = [
  { label: "Легковые", href: "/cars", match: ["/cars", "/listing"] },
  { label: "Дилеры", href: "/dealers", match: ["/dealers"] },
];

export default function DesktopNav() {
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
            {link.label}
          </Link>
        );
      })}

      <CollectionsMenu />
    </nav>
  );
}
