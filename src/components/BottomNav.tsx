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

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#e9dfd2] bg-[#faf7f1]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-lg items-center justify-around px-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

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
  );
}