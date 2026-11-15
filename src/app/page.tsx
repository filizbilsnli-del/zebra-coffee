"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
  
  UserRound,
  House,
  Coffee,
  Gift,
  Info,
  ArrowRight,
  MapPin,
  Globe,
  Menu as MenuIcon,
  X,
  Plus,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Caramel Latte",
    az: "Karamelli Latte",
    category: "Coffee",
    price: "8.50",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700",
    badge: "Bestseller",
  },
  {
    id: 2,
    name: "Iced Spanish Latte",
    az: "Soyuq Spanish Latte",
    category: "Iced Coffee",
    price: "9.00",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Matcha Latte",
    az: "Matcha Latte",
    category: "Matcha",
    price: "10.00",
    image:
      "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=700",
    badge: "New",
  },
  {
    id: 4,
    name: "Chocolate Croissant",
    az: "Şokoladlı Kruassan",
    category: "Bakery",
    price: "6.50",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700",
    badge: "",
  },
];

export default function Home() {
  const { isAZ } = useLanguage();
  const [mobileMenu, setMobileMenu] = useState(false);

  const t = (en: string, az: string) => (isAZ ? az : en);

  return (
    <main className="min-h-screen bg-[#faf7f1] pb-28 text-[#38271f]">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-[#e9dfd2] bg-[#faf7f1]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#553b2c] text-xl font-black text-[#f5e7d1]">
              Z
            </div>

            <div>
              <h1 className="text-xl font-black tracking-[0.16em]">
                ZEBRA
              </h1>
              <p className="text-[9px] font-bold tracking-[0.35em] text-[#9a7559]">
                COFFEE HOUSE
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 md:flex md:pr-28">
            <Link
              href="/login"
              className="rounded-full p-2 transition hover:bg-[#eee3d5]"
              aria-label="Profile"
            >
              <UserRound size={21} />
            </Link>

                      </div>

          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Open menu"
            >
              {mobileMenu ? <X /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {mobileMenu && (
  <div className="border-t border-[#e9dfd2] bg-[#faf7f1] px-6 py-5 md:hidden">
    <div className="flex flex-col gap-5 font-semibold">
      <Link href="/login" onClick={() => setMobileMenu(false)}>
        {t("My Profile", "Profilim")}
      </Link>

      <Link href="/menu" onClick={() => setMobileMenu(false)}>
        {t("Explore Menu", "Menyuya bax")}
      </Link>
    </div>
  </div>
)}
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pt-8 md:px-10 md:pt-12">
        <div className="relative min-h-[540px] overflow-hidden rounded-[32px] bg-[#3b281e] md:min-h-[570px]">
          <img
            src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1800"
            alt="Coffee shop"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#211710]/90 via-[#211710]/60 to-transparent" />

          <div className="relative z-10 flex min-h-[540px] max-w-2xl flex-col justify-center px-7 py-16 text-white md:min-h-[570px] md:px-16">
            <span className="mb-6 w-fit rounded-full border border-white/30 px-5 py-2 text-xs font-bold tracking-[0.2em]">
              ZEBRA COFFEE
            </span>

            <h2 className="text-5xl font-black leading-[1.08] md:text-7xl">
              {t("A little coffee.", "Bir fincan")}
              <br />
              <span className="text-[#e6bd8e]">
                {t("A lot of joy.", "qəhvə,")}
              </span>
              <br />
              {t("Every day.", "bol sevinc.")}
            </h2>

            <p className="mt-7 max-w-md text-sm leading-7 text-white/80 md:text-base">
              {t(
                "Discover your favourite coffee, enjoy beautiful moments and make every day special.",
                "Sevimli qəhvəni kəşf et, xoş anların dadını çıxar və hər gününü xüsusi et."
              )}
            </p>

            <Link
              href="/menu"
              className="mt-9 flex w-fit items-center gap-3 rounded-full bg-[#e8c49b] px-8 py-4 text-sm font-black text-[#38271f] transition hover:bg-white"
            >
              {t("Explore our menu", "Menyunu kəşf et")}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="absolute bottom-7 right-8 hidden text-right text-white md:block">
            <p className="text-xs tracking-[0.3em] text-white/70">
              YOUR DAILY
            </p>
            <p className="text-3xl font-black tracking-widest">
              COFFEE MOMENT
            </p>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center md:px-10">
        <p className="text-xs font-black tracking-[0.35em] text-[#a17c5d]">
          {t("WELCOME TO ZEBRA", "ZEBRA-A XOŞ GƏLMİSİNİZ")}
        </p>

        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black leading-tight md:text-5xl">
          {t(
            "Coffee tastes better when shared.",
            "Qəhvə paylaşdıqca daha dadlıdır."
          )}
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#8c7869] md:text-base">
          {t(
            "Your favourite place for coffee, conversations and little everyday pleasures.",
            "Qəhvə, söhbət və gündəlik kiçik xoşbəxtliklər üçün sevimli məkanın."
          )}
        </p>
      </section>

      {/* POPULAR PRODUCTS */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <div className="mb-9 flex items-end justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-[#a17c5d]">
              {t("OUR FAVOURITES", "SEVİMLİLƏRİMİZ")}
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              {t("Popular right now", "Ən çox sevilənlər")}
            </h2>
          </div>

          <Link
            href="/menu"
            className="hidden items-center gap-2 text-sm font-bold text-[#9b7251] hover:text-[#38271f] sm:flex"
          >
            {t("View all", "Hamısına bax")}
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-[25px] border border-[#eee5d9] bg-white transition duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="relative h-44 overflow-hidden md:h-60">
                <img
                  src={product.image}
                  alt={isAZ ? product.az : product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#f5e5d1] px-3 py-1 text-[10px] font-black text-[#604431]">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="p-4 md:p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#a58b76]">
                  {product.category}
                </p>

                <h3 className="mt-2 min-h-10 text-sm font-black md:text-base">
                  {isAZ ? product.az : product.name}
                </h3>

                <div className="mt-4 flex items-center justify-between">
                  <p className="font-black">
                    {product.price} <span className="text-xs">₼</span>
                  </p>

                  <Link
                    href="/menu"
                    aria-label="View product"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#553b2c] text-white transition hover:bg-[#9b7251]"
                  >
                    <Plus size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 font-bold text-[#9b7251]"
          >
            {t("View all products", "Bütün məhsullara bax")}
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* LOYALTY */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <div className="relative overflow-hidden rounded-[30px] bg-[#553b2c] px-7 py-12 text-white md:px-16 md:py-16">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[35px] border-white/5" />
          <div className="absolute -bottom-32 right-40 h-72 w-72 rounded-full border-[35px] border-white/5" />

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8c49b] text-[#553b2c]">
              <Gift size={27} />
            </div>

            <p className="text-xs font-bold tracking-[0.3em] text-[#e8c49b]">
              ZEBRA REWARDS
            </p>

            <h2 className="mt-4 text-3xl font-black leading-tight md:text-5xl">
              {t(
                "Every coffee brings you closer to a reward.",
                "Hər qəhvə səni mükafata bir addım yaxınlaşdırır."
              )}
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/70">
              {t(
                "Join our loyalty program, collect points and discover special rewards.",
                "Loyallıq proqramımıza qoşul, xallar topla və xüsusi mükafatları kəşf et."
              )}
            </p>

            <Link
              href="/loyalty"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#e8c49b] px-7 py-4 text-sm font-black text-[#38271f] transition hover:bg-white"
            >
              {t("Discover rewards", "Mükafatları kəşf et")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="mx-auto max-w-7xl px-5 pb-20 md:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black tracking-[0.3em] text-[#a17c5d]">
              {t("FIND YOUR PLACE", "BİZİ TAP")}
            </p>

            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              {t("Visit our coffee house", "Bizimlə görüş")}
            </h2>
          </div>

          <Link
            href="/branches"
            className="flex items-center gap-2 text-sm font-bold text-[#9b7251]"
          >
            {t("Explore branches", "Filiallara bax")}
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="relative h-64 overflow-hidden rounded-[25px]">
            <img
              src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000"
              alt="Coffee shop interior"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            <div className="absolute bottom-6 left-6 text-white">
              <p className="flex items-center gap-2 text-sm">
                <MapPin size={16} />
                {t("Our coffee house", "Coffee house")}
              </p>

              <h3 className="mt-2 text-2xl font-black">
                {t("A place to enjoy", "Zövq alacağın məkan")}
              </h3>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-[25px] bg-[#efe6da] p-8 md:p-12">
            <Coffee size={35} className="text-[#9b7251]" />

            <h3 className="mt-6 text-2xl font-black md:text-3xl">
              {t(
                "Your next favourite coffee is waiting.",
                "Növbəti sevimli qəhvən səni gözləyir."
              )}
            </h3>

            <p className="mt-4 text-sm leading-7 text-[#806c5d]">
              {t(
                "Explore our menu and find something special for yourself.",
                "Menyumuza bax və özün üçün xüsusi bir dad kəşf et."
              )}
            </p>

            <Link
              href="/menu"
              className="mt-7 flex w-fit items-center gap-2 rounded-full bg-[#553b2c] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#79583f]"
            >
              {t("Order now", "İndi sifariş et")}
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e9dfd2] px-5 py-10 md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black tracking-[0.2em]">
              ZEBRA.
            </h2>

            <p className="mt-2 text-xs text-[#9a8575]">
              {t(
                "Coffee, comfort and good moments.",
                "Qəhvə, rahatlıq və xoş anlar."
              )}
            </p>
          </div>

         
          <p className="text-xs text-[#a58b76]">
            © 2026 Zebra Coffee
          </p>
        </div>
      </footer>
    </main>
  );
}
