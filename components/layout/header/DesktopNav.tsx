import Link from "next/link";

import CollectionsMenu from "@/features/collections/components/CollectionsMenu";

export default function DesktopNav() {
    return (
      <nav className="flex items-center gap-8 text-sm text-gray-700">
  
        <Link href="/cars" className="text-primary font-medium cursor-pointer">
          Легковые
        </Link>
  
        <a className="hover:text-black cursor-pointer">
          Дилеры
        </a>
  
        <a className="hover:text-black cursor-pointer">
          Коммерческие
        </a>

        <CollectionsMenu />
  
      </nav>
    );
  }