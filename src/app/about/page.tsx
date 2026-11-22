"use client";

import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
  Coffee,
  Heart,
  Leaf,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Store,
} from "lucide-react";

export default function AboutPage() {
  const { language: lang } = useLanguage();
  const isAZ = lang === "AZ";

  const content = {
    EN: {
      label: "OUR STORY",
      title: "More than just coffee.",
      subtitle:
        "A little place for great coffee, good moments, and everyday comfort.",
      introLabel: "WELCOME TO ZEBRA",
      introTitle: "A place to enjoy every moment.",
      intro:
        "We believe that a good cup of coffee can make an ordinary day special. Zebra Coffee brings together carefully prepared drinks, delicious treats, and a welcoming atmosphere. Whether you are meeting friends or enjoying a quiet moment, we are happy to have you here.",
      valuesLabel: "WHAT MAKES US SPECIAL",
      valuesTitle: "Our values",
      features: [
        {
          icon: Coffee,
          title: "Coffee with care",
          text: "Every cup is prepared with attention to taste and quality.",
        },
        {
          icon: Heart,
          title: "Made for moments",
          text: "A welcoming space for conversations, breaks, and little joys.",
        },
        {
          icon: Leaf,
          title: "Simple pleasure",
          text: "Drinks and treats that make your everyday moments better.",
        },
      ],
      philosophyLabel: "OUR PHILOSOPHY",
      missionTitle: "Good coffee. Good moments.",
      mission:
        "We want every visit to feel comfortable, enjoyable, and worth repeating. From your first morning coffee to an afternoon break, Zebra Coffee is a place where you can slow down and enjoy the moment.",
      branchesLabel: "FIND YOUR ZEBRA",
      branchesTitle: "Visit our branches",
      branchesSubtitle:
        "Two locations in Baku, one place for your favourite coffee.",
      branchLocation: "Baku, Azerbaijan",
      branchHoursLabel: "Opening hours",
      branchHours: "Every day · 09:00–23:00",
      branchOne: "28 May Branch",
      branchTwo: "Gənclik Branch",
      mapButton: "Find on map",
      visitTitle: "Your coffee moment is waiting.",
      visitText:
        "Explore our menu, discover your favourite drink, and visit Zebra Coffee.",
      menuButton: "Explore our menu",
      footer: "Coffee, taste and comfort.",
    },
    AZ: {
      label: "BİZİ TANIYIN",
      title: "Sadəcə qəhvədən daha artığı.",
      subtitle:
        "Dadlı qəhvə, xoş anlar və gündəlik rahatlıq üçün kiçik bir məkan.",
      introLabel: "ZEBRA COFFEE-YƏ XOŞ GƏLMİSİNİZ",
      introTitle: "Hər anın dadını çıxaracağınız məkan.",
      intro:
        "İnanırıq ki, yaxşı bir fincan qəhvə adi günü xüsusi edə bilər. Zebra Coffee diqqətlə hazırlanan içkiləri, dadlı təamları və rahat atmosferi bir araya gətirir. İstər dostlarınızla görüşün, istər sakit bir an keçirin — sizi burada görməkdən məmnunuq.",
      valuesLabel: "BİZİ FƏRQLƏNDİRƏN",
      valuesTitle: "Dəyərlərimiz",
      features: [
        {
          icon: Coffee,
          title: "Diqqətlə hazırlanan qəhvə",
          text: "Hər fincan dad və keyfiyyətə diqqət yetirilərək hazırlanır.",
        },
        {
          icon: Heart,
          title: "Xoş anlar üçün",
          text: "Söhbətlər, fasilələr və kiçik sevinc anları üçün rahat məkan.",
        },
        {
          icon: Leaf,
          title: "Sadə zövq",
          text: "Gündəlik anlarınızı gözəlləşdirən içkilər və təamlar.",
        },
      ],
      philosophyLabel: "FƏLSƏFƏMİZ",
      missionTitle: "Dadlı qəhvə. Gözəl anlar.",
      mission:
        "İstəyirik ki, hər ziyarətiniz rahat, xoş və təkrar yaşamaq istədiyiniz bir təcrübə olsun. Səhər qəhvənizdən günorta fasiləsinə qədər Zebra Coffee gündəlik tələskənlikdən uzaqlaşıb anın dadını çıxara biləcəyiniz məkandır.",
      branchesLabel: "SİZƏ YAXIN ZEBRA",
      branchesTitle: "Filiallarımız",
      branchesSubtitle:
        "Bakıda iki məkan, sevimli qəhvəniz üçün eyni ünvan.",
      branchLocation: "Bakı, Azərbaycan",
      branchHoursLabel: "İş saatları",
      branchHours: "Hər gün · 09:00–23:00",
      branchOne: "28 May filialı",
      branchTwo: "Gənclik filialı",
      mapButton: "Xəritədə göstər",
      visitTitle: "Qəhvə anınız sizi gözləyir.",
      visitText:
        "Menyumuzla tanış olun, sevimli içkinizi kəşf edin və Zebra Coffee-yə baş çəkin.",
      menuButton: "Menyuya bax",
      footer: "Qəhvə, dad və rahatlıq.",
    },
  };

  const t = content[lang];

  const branches = [
    {
      name: t.branchOne,
      image:
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000",
      map: "https://www.google.com/maps/search/?api=1&query=28+May+Baku+Azerbaijan",
      number: "01",
    },
    {
      name: t.branchTwo,
      image:
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000",
      map: "https://www.google.com/maps/search/?api=1&query=Ganjlik+Baku+Azerbaijan",
      number: "02",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-[#faf7f1] pb-28 text-[#493629]">
      {/* HEADER */}
      <header className="mx-auto flex max-w-7xl items-center px-5 py-6 md:px-10">
        <div className="text-2xl font-bold tracking-[0.15em]">
          ZEBRA<span className="text-[#b78355]">.</span>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto w-full max-w-[1600px] px-5 pb-20 pt-16 text-center md:px-10 md:pb-28 md:pt-24">
        <div className="absolute left-1/2 top-10 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ead9c5] opacity-40 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e7d9c9] bg-white px-5 py-2 text-xs font-semibold tracking-[0.2em] text-[#a47750]">
            <Sparkles size={15} />
            {t.label}
          </div>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-7xl">
            {t.title}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-[#8e7461] md:text-lg">
            {t.subtitle}
          </p>

          <div className="mx-auto mt-12 flex max-w-xl items-center justify-center gap-5">
            <div className="h-px flex-1 bg-[#dfcdb9]" />
            <Coffee size={30} className="text-[#b78355]" />
            <div className="h-px flex-1 bg-[#dfcdb9]" />
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
        <div className="group relative">
          <div className="absolute -bottom-4 -right-4 h-full w-full rounded-[2rem] bg-[#e9ddce]" />

          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1100"
              alt="Coffee being prepared"
              className="h-[350px] w-full object-cover transition duration-700 group-hover:scale-105 md:h-[470px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            <div className="absolute bottom-7 left-7 text-white">
              <p className="text-3xl font-bold tracking-[0.15em]">
                ZEBRA.
              </p>
              <p className="mt-1 text-xs tracking-[0.3em]">
                COFFEE & MOMENTS
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-[#b78355]">
            {t.introLabel}
          </p>

          <h2 className="text-3xl font-semibold leading-tight md:text-5xl">
            {t.introTitle}
          </h2>

          <p className="mt-7 text-base leading-8 text-[#806b5b]">
            {t.intro}
          </p>

          <div className="mt-9 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9ddce] text-[#76523c]">
              <Star size={20} />
            </div>
            <p className="text-sm font-semibold tracking-wide">
              ZEBRA COFFEE
            </p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="w-full bg-[#f1e9df] px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.25em] text-[#b78355]">
              {t.valuesLabel}
            </p>

            <h2 className="text-3xl font-semibold md:text-5xl">
              {t.valuesTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {t.features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <article
                  key={index}
                  className="rounded-[2rem] border border-[#e6d9ca] bg-[#faf7f1] p-8 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9ddce] text-[#76523c]">
                    <Icon size={29} strokeWidth={1.6} />
                  </div>

                  <h3 className="text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-[#8e7461]">
                    {feature.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="relative px-5 py-24 text-center md:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9ddce] text-[#76523c]">
            <Heart size={27} />
          </div>

          <p className="mb-4 text-xs font-bold tracking-[0.25em] text-[#b78355]">
            {t.philosophyLabel}
          </p>

          <h2 className="text-3xl font-semibold md:text-5xl">
            {t.missionTitle}
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#806b5b]">
            {t.mission}
          </p>

          <div className="mx-auto mt-10 h-1 w-20 rounded-full bg-[#b78355]" />
        </div>
      </section>

      {/* BRANCHES */}
      <section className="w-full bg-[#f1e9df] px-5 py-20 md:px-10 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-bold tracking-[0.25em] text-[#b78355]">
              {t.branchesLabel}
            </p>

            <h2 className="text-3xl font-semibold md:text-5xl">
              {t.branchesTitle}
            </h2>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#8e7461]">
              {t.branchesSubtitle}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {branches.map((branch) => (
              <article
                key={branch.number}
                className="group overflow-hidden rounded-[2rem] border border-[#e6d9ca] bg-[#faf7f1] shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="h-72 w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-xs font-bold tracking-widest text-[#76523c]">
                    {branch.number}
                  </span>

                  <h3 className="absolute bottom-6 left-7 text-3xl font-semibold text-white">
                    {branch.name}
                  </h3>
                </div>

                <div className="p-7">
                  <div className="mb-6 flex items-center gap-3 text-[#8e7461]">
                    <MapPin size={21} className="text-[#b78355]" />
                    <span className="text-sm">{t.branchLocation}</span>
                  </div>

                  <div className="mb-6 flex items-center gap-3 text-[#8e7461]">
                    <Clock size={21} className="text-[#b78355]" />
                    <div>
                      <p className="text-xs font-semibold text-[#b78355]">
                        {t.branchHoursLabel}
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {t.branchHours}
                      </p>
                    </div>
                  </div>

                  <a
                    href={branch.map}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full bg-[#553b2c] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#76533c]"
                  >
                    {t.mapButton}
                    <ArrowRight size={17} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="mx-auto my-16 w-[calc(100%-2.5rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-[#553b2c] px-6 py-16 text-center text-[#faf7f1] md:my-24 md:px-12 md:py-20">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-[#d6ad83]">
          <Store size={29} />
        </div>

        <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-semibold md:text-5xl">
          {t.visitTitle}
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-8 text-[#e3d4c5] md:text-base">
          {t.visitText}
        </p>

        <Link
          href="/menu"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#f3e7d8] px-8 py-4 text-sm font-bold text-[#553b2c] transition hover:bg-white"
        >
          {t.menuButton}
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="mx-auto w-full max-w-6xl px-5 pb-8 pt-4 text-center">
        <div className="text-2xl font-bold tracking-[0.15em]">
          ZEBRA<span className="text-[#b78355]">.</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[#a47750]">
          <Coffee size={16} />
          <span className="text-xs tracking-wide">ZEBRA COFFEE</span>
        </div>

        <p className="mt-3 text-xs text-[#9b8675]">{t.footer}</p>

        <p className="mt-5 text-[11px] text-[#b3a294]">
          © 2026 Zebra Coffee. All rights reserved.
        </p>
      </footer>
    </main>
  );
}