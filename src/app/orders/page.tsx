"use client";

import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import OrderHistory from "@/components/OrderHistory";

export default function OrdersPage() {
  const { isAZ } = useLanguage();

  const t = (en: string, az: string) => (isAZ ? az : en);

  return (
    <main className="min-h-screen bg-[#faf7f1] px-5 py-8 pb-28 text-[#38271f]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[#795b45]"
          >
            <ArrowLeft size={18} />
            {t("Home", "Ana səhifə")}
          </Link>
        </header>

        <section className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#553b2c] text-[#f5e7d1]">
            <ShoppingBag size={30} />
          </div>

          <p className="mb-3 text-xs font-black tracking-[0.35em] text-[#a17a59]">
            ZEBRA COFFEE
          </p>

          <h1 className="text-4xl font-black sm:text-5xl">
            {t("My Orders", "Sifarişlərim")}
          </h1>

          <p className="mt-4 text-sm text-[#987b65]">
            {t(
              "View your orders and track their status.",
              "Sifarişlərinə bax və onların statusunu izlə."
            )}
          </p>
        </section>

        <OrderHistory />
      </div>
    </main>
  );
}