"use client";

import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import HeaderActions from "./HeaderActions";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto h-16 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-3">
          {/* mobile menu */}
          <div className="lg:hidden">
            <MobileMenu />
          </div>

          <Logo />
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden lg:block">
          <DesktopNav />
        </div>

        {/* RIGHT */}
        <HeaderActions />
      </div>
    </header>
  );
}
