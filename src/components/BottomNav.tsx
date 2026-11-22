"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  Coffee,
  Gift,
  Info,
  ShoppingBag,
  ListOrdered,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAZ } = useLanguage();

  const items = [
    {
      href: "/",
      label: isAZ ? "Ana səhifə" : "Home",
      icon: House,
    },
    {
      href: "/menu",
      label: isAZ ? "Menyu" : "Menu",
      icon: Coffee,
    },
    {
      href: "/loyalty",
      label: isAZ ? "Bonuslar" : "Loyalty",
      icon: Gift,
    },
    {
      href: "/orders",
      label: isAZ ? "Sifarişlərim" : "My Orders",
      icon: ListOrdered,
    },
    {
      href: "/about",
      label: isAZ ? "Haqqımızda" : "About",
      icon: Info,
    },
    {
      href: "/cart",
      label: isAZ ? "Səbət" : "Cart",
      icon: ShoppingBag,
    },
  ];

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE NAVIGATION */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e9dfd2] bg-[#faf7f1]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex h-[76px] max-w-lg items-center justify-around px-1">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`flex h-[66px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl transition ${
                  active
                    ? "text-[#553b2c]"
                    : "text-[#8e7461] hover:bg-[#eee3d5]"
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />

                <span
                  className={`whitespace-nowrap text-[10px] ${
                    active ? "font-black" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>

                {active && (
                  <span className="h-1 w-1 rounded-full bg-[#553b2c]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* DESKTOP FLOATING ICON NAVIGATION */}
      <nav
        aria-label={isAZ ? "Əsas naviqasiya" : "Main navigation"}
        className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 md:block"
      >
        <div className="flex flex-col items-center gap-3">
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 hover:scale-110 ${
                  active
                    ? "border-[#553b2c] bg-[#553b2c] text-white shadow-lg shadow-[#553b2c]/25"
                    : "border-[#e9dfd2] bg-[#faf7f1]/90 text-[#806956] shadow-md shadow-[#553b2c]/10 hover:border-[#553b2c] hover:bg-[#553b2c] hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 2}
                />

                <span className="pointer-events-none absolute left-[54px] whitespace-nowrap rounded-full border border-[#e9dfd2] bg-[#faf7f1] px-3 py-2 text-[11px] font-semibold text-[#553b2c] opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100">
                  {item.label}
                </span>

                {active && (
                  <span className="absolute -left-[3px] h-5 w-[3px] rounded-full bg-[#c69a70]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}