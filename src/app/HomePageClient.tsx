"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowRight,
  Check,
  Coffee,
  Gift,
  MapPin,
  QrCode,
  X,
  Sparkles,
  ShoppingBag,
  Info,
  Star,
  Truck,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { products, Product } from "@/data/products";
import {
  getProductDetails,
  ProductOption,
} from "@/data/product-options";
import { addToCart } from "@/lib/cart";

export default function HomePage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [session, setSession] = useState<Session | null>(null);
  const [customerName, setCustomerName] = useState("");

  const [qrOpen, setQrOpen] = useState(false);
  const [qrToken, setQrToken] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const [addedProduct, setAddedProduct] = useState(false);

  const t = {
    heroSmall: isAZ
      ? "HƏR FİNCANDA XÜSUSİ DAD"
      : "A SPECIAL TASTE IN EVERY CUP",

    heroTitle: isAZ
      ? "Hər fincanda kiçik bir xoşbəxtlik."
      : "A little happiness in every cup.",

    heroDescription: isAZ
      ? "Sevdiyiniz qəhvə və şirniyyatları kəşf edin. Hər sifarişdə Zebra Coffee dadını yaşayın."
      : "Discover your favourite coffee and desserts. Enjoy the Zebra Coffee experience with every order.",

    exploreMenu: isAZ ? "Menyunu kəşf et" : "Explore menu",
    learnMore: isAZ ? "Daha çox" : "Learn more",

    loyaltyTitle: isAZ ? "Zebra Bonus Kartı" : "Zebra Loyalty Card",

    loyaltyDescription: isAZ
      ? "QR kodunuzu kassada göstərin, alış-veriş edin və bonuslarınızı toplayın."
      : "Show your QR code at the cashier, make a purchase and collect loyalty points.",

    openQR: isAZ ? "QR kodumu aç" : "Open my QR code",
    loginForQR: isAZ ? "QR kart üçün daxil ol" : "Log in for your QR card",

    scanMessage: isAZ
      ? "QR kodunuzu kassirə göstərərək bonus hesabınıza daxil olun."
      : "Show this QR code to the cashier to access your loyalty account.",

    popularCoffee: isAZ ? "Populyar məhsullar" : "Popular Products",

    coffeeDescription: isAZ
      ? "Zebra Coffee-nin sevilən dadlarını kəşf edin."
      : "Discover the favourite flavours of Zebra Coffee.",

    favoriteFoods: isAZ ? "Sevimli şirniyyatlar" : "Favourite Treats",

    foodDescription: isAZ
      ? "Qəhvənizin yanında dadına baxmalı olduğunuz ləzzətlər."
      : "Delicious treats that go perfectly with your coffee.",

    add: isAZ ? "Səbətə əlavə et" : "Add to cart",
    added: isAZ ? "Məhsul səbətə əlavə edildi!" : "Product added to cart!",
    viewAll: isAZ ? "Bütün məhsullar" : "View all products",

    branches: isAZ ? "Filiallarımız" : "Our Branches",

    branchesDescription: isAZ
      ? "Sizi sevdiyiniz qəhvə ilə filiallarımızda gözləyirik."
      : "We are waiting for you at our branches.",

    map: isAZ ? "Xəritədə aç" : "View on map",

    footerText: isAZ
      ? "Hər fincanda bir az xoşbəxtlik."
      : "A little happiness in every cup.",

    close: isAZ ? "Bağla" : "Close",

    qrError: isAZ
      ? "QR kod yaradılarkən xəta baş verdi. Yenidən cəhd edin."
      : "Something went wrong while creating your QR code. Please try again.",

    chooseSize: isAZ ? "Ölçü seçin" : "Choose size",
    addOns: isAZ ? "Əlavələr" : "Add-ons",
    ingredients: isAZ ? "Məhsulun tərkibi" : "Ingredients",
    allergens: isAZ ? "Allergen məlumatı" : "Allergen information",
    basePrice: isAZ ? "Əsas qiymət" : "Base price",
    totalPrice: isAZ ? "Yekun qiymət" : "Total price",
    included: isAZ ? "Daxildir" : "Included",

    noAllergens: isAZ
      ? "İlkin resept məlumatında əsas allergen qeyd edilməyib."
      : "No major allergens are listed in the preliminary recipe information.",

    note: isAZ
      ? "Qeyd: Tərkib və allergen məlumatları ilkin məlumatlardır. Resept və istehsalçı məlumatları ilə təsdiqlənməlidir. Çarpaz təmas ehtimalı mövcuddur."
      : "Note: Ingredient and allergen information is preliminary and must be verified against recipes and supplier information. Cross-contact may occur.",
  };

  // Authentication and profile
  useEffect(() => {
    let active = true;

    const loadProfile = async (currentSession: Session | null) => {
      if (!active) return;

      setSession(currentSession);

      if (!currentSession) {
        setCustomerName("");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentSession.user.id)
        .maybeSingle();

      if (active) {
        setCustomerName(data?.full_name || "");
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      loadProfile(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      loadProfile(currentSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // Product groups
  const popularCoffeeNames = [
    "Caramel Latte",
    "Cappuccino",
    "Spanish Latte",
    "Classic Latte",
  ];

  const favoriteFoodNames = [
    "Chocolate Croissant",
    "Cinnamon Roll",
    "Tiramisu",
    "Oreo Cheesecake",
  ];

  const popularCoffees = popularCoffeeNames
    .map((name) => products.find((product) => product.en === name))
    .filter((product): product is Product => Boolean(product));

  const favoriteFoods = favoriteFoodNames
    .map((name) => products.find((product) => product.en === name))
    .filter((product): product is Product => Boolean(product));

  const details = selectedProduct
    ? getProductDetails(selectedProduct)
    : null;

  const currentSize = details?.sizes.find(
    (size) => size.id === selectedSize
  );

  const currentAddOns =
    details?.addOns.filter((addon) =>
      selectedAddOns.includes(addon.id)
    ) || [];

  const totalPrice = selectedProduct
    ? selectedProduct.price +
      (currentSize?.price || 0) +
      currentAddOns.reduce((sum, addon) => sum + addon.price, 0)
    : 0;

  const greeting = isAZ
    ? customerName
      ? `Xoş gəldin, ${customerName}!`
      : "Zebra Coffee-yə xoş gəlmisən!"
    : customerName
      ? `Welcome, ${customerName}!`
      : "Welcome to Zebra Coffee!";

  // Open product customization
  function openProduct(product: Product) {
    const productDetails = getProductDetails(product);

    setSelectedProduct(product);

    setSelectedSize(
      productDetails.sizes.length > 0
        ? productDetails.sizes[0].id
        : ""
    );

    setSelectedAddOns([]);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  // Add customized product to cart
  function handleAddToCart() {
    if (!selectedProduct || !details) return;

    const size = details.sizes.find(
      (item) => item.id === selectedSize
    );

    addToCart({
      id: selectedProduct.id,
      en: selectedProduct.en,
      az: selectedProduct.az,
      price: totalPrice,
      basePrice: selectedProduct.price,
      image: selectedProduct.image,
      sizeId: size?.id || null,
      sizeEn: size?.en || null,
      sizeAz: size?.az || null,
      addOns: currentAddOns,
    });

    setSelectedProduct(null);
    setSelectedAddOns([]);
    setAddedProduct(true);

    window.setTimeout(() => {
      setAddedProduct(false);
    }, 2200);
  }

  // Customer QR
  const openCustomerQR = async () => {
    if (!session) {
      router.push("/login?next=/");
      return;
    }

    setQrOpen(true);
    setQrError("");

    const savedToken = sessionStorage.getItem(
      `zebra-customer-qr-${session.user.id}`
    );

    if (savedToken) {
      setQrToken(savedToken);
      return;
    }

    setQrLoading(true);

    try {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        router.push("/login?next=/");
        return;
      }

      const response = await fetch("/api/customer-qr", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.qrToken) {
        throw new Error("QR generation failed");
      }

      sessionStorage.setItem(
        `zebra-customer-qr-${currentSession.user.id}`,
        result.qrToken
      );

      setQrToken(result.qrToken);
    } catch {
      setQrError(t.qrError);
    } finally {
      setQrLoading(false);
    }
  };

  // Product card
  const renderProductCard = (product: Product) => (
    <article
      key={product.id}
      className="group overflow-hidden rounded-[26px] border border-[#E8D5C3] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <button
        type="button"
        onClick={() => openProduct(product)}
        className="relative block h-52 w-full cursor-pointer overflow-hidden bg-[#EAD9C8]"
        aria-label={isAZ ? `${product.az} seç` : `Select ${product.en}`}
      >
        <img
          src={product.image}
          alt={isAZ ? product.az : product.en}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold text-[#68402B] shadow">
          {product.price.toFixed(2)} ₼
        </span>
      </button>

      <div className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => openProduct(product)}
          className="cursor-pointer text-left"
        >
          <h3 className="text-lg font-extrabold text-[#34231D] transition hover:text-[#80563D]">
            {isAZ ? product.az : product.en}
          </h3>
        </button>

        <p className="mt-2 min-h-[42px] text-sm leading-6 text-[#78675B]">
          {isAZ ? product.descAz : product.descEn}
        </p>

        <button
          type="button"
          onClick={() => openProduct(product)}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#633A25] py-3.5 text-sm font-bold text-white transition hover:bg-[#34231D] active:scale-[0.98]"
        >
          <ShoppingBag size={17} />
          {isAZ ? "Seçim et" : "Customize"}
        </button>
      </div>
    </article>
  );

  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#FBF3EA] pb-24 text-[#34231D]">

      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-[#E8D5C3] bg-[#FFF9F2]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#633A25] text-white shadow-md">
              <Coffee size={26} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-[0.12em] text-[#34231D]">
                ZEBRA
              </h1>
              <p className="text-[10px] font-bold tracking-[0.35em] text-[#9B7257]">
                COFFEE
              </p>
            </div>
          </Link>
        </div>
      </header>

      {/* HERO + ZEBRA BONUS CARD */}
      <section className="relative mx-auto max-w-[1600px] px-4 pt-5 sm:px-6 lg:px-8 lg:pt-6">
        <div className="relative min-h-[440px] overflow-hidden rounded-[30px] bg-[#D9B99D] lg:min-h-[470px]">

          <img
            src="/images/zebra-hero.png"
            alt="Zebra Coffee"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#F5DFCC] via-[#E9C9AE]/90 to-[#34231D]/20" />

          <div className="relative z-10 grid min-h-[440px] items-center gap-8 px-6 py-9 sm:px-10 lg:min-h-[470px] lg:grid-cols-[1fr_300px] lg:px-14 lg:py-10">

            {/* HERO TEXT */}
            <div className="max-w-2xl">

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/65 px-4 py-2 text-[11px] font-extrabold tracking-[0.2em] text-[#74452D] backdrop-blur-sm">
                <Sparkles size={15} />
                {t.heroSmall}
              </div>

              {session && (
                <p className="mb-3 text-sm font-bold text-[#70432C]">
                  {greeting}
                </p>
              )}

              <h2 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-[#382216] sm:text-5xl lg:text-6xl">
                {t.heroTitle}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#624431] sm:text-base sm:leading-8">
                {t.heroDescription}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/menu"
                  className="inline-flex items-center gap-3 rounded-full bg-[#633A25] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#34231D]"
                >
                  {t.exploreMenu}
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-[#9B7257] bg-white/70 px-6 py-3.5 text-sm font-bold text-[#633A25] backdrop-blur-sm transition hover:bg-white"
                >
                  {t.learnMore}
                </Link>

              </div>
            </div>

            {/* ZEBRA BONUS CARD */}
            <div className="w-full max-w-[300px] justify-self-center lg:justify-self-end">

              <button
                type="button"
                onClick={openCustomerQR}
                className="group w-full cursor-pointer rounded-[26px] border border-white/20 bg-[#34231D]/95 p-5 text-left shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-[#493025]"
              >

                <div className="mb-4 flex items-center justify-between">

                  <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#E8DED2]">
                    <Gift size={13} />
                    ZEBRA BONUS
                  </span>

                  <Sparkles size={19} className="text-[#D9B99D]" />

                </div>

                <div className="flex items-center gap-4">

                  <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg">
                    <QrCode
                      size={65}
                      strokeWidth={1.7}
                      className="text-[#34231D]"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-black leading-tight text-white">
                      {t.loyaltyTitle}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-[#D8C7B9]">
                      {isAZ
                        ? "Hər alış-verişdə bonuslar qazan!"
                        : "Earn rewards with every purchase!"}
                    </p>
                  </div>

                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#34231D] transition group-hover:bg-[#F0E3D6]">

                  <span>
                    {session ? t.openQR : t.loginForQR}
                  </span>

                  <ArrowRight size={18} />

                </div>

                <p className="mt-3 text-center text-[10px] font-medium text-[#CBB6A5]">
                  {isAZ
                    ? "Şəxsi bonus kartınızı açın"
                    : "Open your personal rewards card"}
                </p>

              </button>

            </div>

          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="relative z-10 mx-auto -mt-5 max-w-7xl px-5 lg:px-8">
        <div className="grid grid-cols-2 gap-3 rounded-[25px] border border-white bg-[#FFF9F2] p-4 shadow-xl sm:grid-cols-4 sm:gap-5 sm:p-6">

          {[
            {
              icon: Coffee,
              text: isAZ ? "Keyfiyyətli qəhvə" : "Quality coffee",
            },
            {
              icon: Star,
              text: isAZ ? "Dadlı şirniyyatlar" : "Delicious desserts",
            },
            {
              icon: Gift,
              text: isAZ ? "Bonus ballar" : "Reward points",
            },
            {
              icon: Truck,
              text: isAZ ? "Sürətli çatdırılma" : "Fast delivery",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={index}
                className="flex items-center justify-center gap-3 py-3 text-center sm:justify-start"
              >
                <Icon className="shrink-0 text-[#74452D]" size={27} />

                <span className="text-xs font-bold text-[#4C3325] sm:text-sm">
                  {item.text}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPULAR COFFEE */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-extrabold tracking-[0.25em] text-[#B18A6E]">
              ZEBRA FAVOURITES
            </p>

            <h2 className="text-3xl font-black text-[#382216] sm:text-4xl">
              {t.popularCoffee}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#78675B] sm:text-base">
              {t.coffeeDescription}
            </p>
          </div>

          <Link
            href="/menu"
            className="inline-flex items-center gap-2 rounded-full border border-[#D9C0AB] bg-white px-5 py-3 text-sm font-bold text-[#633A25] transition hover:bg-[#F0E3D6]"
          >
            {t.viewAll}
            <ArrowRight size={17} />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popularCoffees.map(renderProductCard)}
        </div>
      </section>

      {/* FAVORITE FOODS */}
      <section className="bg-[#F0E3D6] py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-extrabold tracking-[0.25em] text-[#B18A6E]">
                SOMETHING DELICIOUS
              </p>

              <h2 className="text-3xl font-black text-[#382216] sm:text-4xl">
                {t.favoriteFoods}
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#78675B] sm:text-base">
                {t.foodDescription}
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 rounded-full border border-[#D9C0AB] bg-white px-5 py-3 text-sm font-bold text-[#633A25] transition hover:bg-[#FBF3EA]"
            >
              {t.viewAll}
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {favoriteFoods.map(renderProductCard)}
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">
        <div className="mb-9 text-center">
          <p className="mb-2 text-xs font-extrabold tracking-[0.25em] text-[#B18A6E]">
            {isAZ ? "BİZİ TAP" : "FIND US"}
          </p>

          <h2 className="text-3xl font-black text-[#382216] sm:text-4xl">
            {t.branches}
          </h2>

          <p className="mt-3 text-sm text-[#78675B] sm:text-base">
            {t.branchesDescription}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              name: "Gənclik",
              mapUrl:
                "https://www.google.com/maps/search/?api=1&query=Zebra+Coffee+Ganjlik+Baku",
            },
            {
              name: "28 May",
              mapUrl:
                "https://www.google.com/maps/search/?api=1&query=Zebra+Coffee+28+May+Baku",
            },
          ].map((branch) => (
            <a
              key={branch.name}
              href={branch.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-5 rounded-3xl border border-[#E8D5C3] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-[#B18A6E] hover:shadow-xl"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F0E3D6] text-[#80563D] transition group-hover:bg-[#633A25] group-hover:text-white">
                  <MapPin size={27} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#34231D]">
                    {branch.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#78675B]">
                    Zebra Coffee
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm font-bold text-[#80563D]">
                <span className="hidden sm:inline">{t.map}</span>
                <ArrowRight size={19} />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-[#34231D] px-5 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-[0.2em]">
            ZEBRA COFFEE
          </h2>

          <p className="mt-3 text-sm text-[#E8DED2]">
            {t.footerText}
          </p>

          <div className="mt-6 h-px w-24 bg-[#8B6852]" />

          <p className="mt-5 text-xs text-[#CBB6A5]">
            © {new Date().getFullYear()} Zebra Coffee.{" "}
            {isAZ ? "Bütün hüquqlar qorunur." : "All rights reserved."}
          </p>
        </div>
      </footer>

      {/* PRODUCT CUSTOMIZATION MODAL */}
      {selectedProduct && details && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#211710]/65 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-[#E8D5C3] bg-[#FFFDF9] p-5 shadow-2xl sm:rounded-[28px] sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold tracking-[0.2em] text-[#B18A6E]">
                  ZEBRA COFFEE
                </p>

                <h2 className="mt-2 text-2xl font-black text-[#34231D]">
                  {isAZ ? selectedProduct.az : selectedProduct.en}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="rounded-full bg-[#F0E3D6] p-2.5 text-[#633A25] transition hover:bg-[#E8D5C3]"
                aria-label={t.close}
              >
                <X size={21} />
              </button>
            </div>

            <img
              src={selectedProduct.image}
              alt={isAZ ? selectedProduct.az : selectedProduct.en}
              className="mb-5 h-48 w-full rounded-2xl object-cover"
            />

            <div className="mb-5 rounded-2xl border border-[#E8D5C3] bg-[#FBF3EA] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#78675B]">
                  {t.basePrice}
                </span>

                <span className="font-black text-[#633A25]">
                  {selectedProduct.price.toFixed(2)} ₼
                </span>
              </div>
            </div>

            {/* SIZES */}
            {details.sizes.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-extrabold text-[#34231D]">
                  {t.chooseSize}
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {details.sizes.map((size) => (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.id)}
                      className={`rounded-xl border p-3 text-center transition ${
                        selectedSize === size.id
                          ? "border-[#633A25] bg-[#633A25] text-white shadow-md"
                          : "border-[#E8D5C3] bg-white text-[#654D3E] hover:bg-[#FBF3EA]"
                      }`}
                    >
                      <span className="block text-sm font-bold">
                        {isAZ
                          ? size.az.split(" · ")[0]
                          : size.en.split(" · ")[0]}
                      </span>

                      <span className="mt-1 block text-xs opacity-80">
                        {size.id === "small"
                          ? "250 ml"
                          : size.id === "medium"
                            ? "350 ml"
                            : "450 ml"}
                      </span>

                      <span className="mt-1 block text-xs font-semibold">
                        {size.price === 0
                          ? t.included
                          : `+${size.price.toFixed(2)} ₼`}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* ADD-ONS */}
            {details.addOns.length > 0 && (
              <section className="mb-6">
                <h3 className="mb-3 font-extrabold text-[#34231D]">
                  {t.addOns}
                </h3>

                <div className="space-y-2">
                  {details.addOns.map((addon: ProductOption) => {
                    const checked = selectedAddOns.includes(addon.id);

                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddOn(addon.id)}
                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                          checked
                            ? "border-[#A77A59] bg-[#F0E3D6]"
                            : "border-[#E8D5C3] bg-white hover:bg-[#FBF3EA]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 items-center justify-center rounded border ${
                              checked
                                ? "border-[#633A25] bg-[#633A25] text-white"
                                : "border-[#CDBBAA] bg-white"
                            }`}
                          >
                            {checked && <Check size={13} />}
                          </span>

                          <span className="text-sm font-medium text-[#553B2C]">
                            {isAZ ? addon.az : addon.en}
                          </span>
                        </span>

                        <span className="text-sm font-bold text-[#98704D]">
                          +{addon.price.toFixed(2)} ₼
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* INGREDIENTS */}
            <section className="mb-6 rounded-2xl border border-[#E8D5C3] bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 font-extrabold text-[#34231D]">
                <Info size={18} className="text-[#A78A72]" />
                {t.ingredients}
              </h3>

              <p className="text-sm leading-6 text-[#78675B]">
                {(isAZ
                  ? details.ingredientsAz
                  : details.ingredientsEn
                ).join(", ")}
              </p>

              <div className="my-4 border-t border-[#E8D5C3]" />

              <h3 className="mb-2 font-extrabold text-[#34231D]">
                {t.allergens}
              </h3>

              {details.allergensEn.length > 0 ? (
                <p className="text-sm leading-6 text-[#9A6348]">
                  {(isAZ
                    ? details.allergensAz
                    : details.allergensEn
                  ).join(", ")}
                </p>
              ) : (
                <p className="text-sm text-[#78675B]">
                  {t.noAllergens}
                </p>
              )}

              <p className="mt-3 text-xs leading-5 text-[#9A8170]">
                {t.note}
              </p>
            </section>

            {/* TOTAL */}
            <div className="sticky bottom-0 border-t border-[#E8D5C3] bg-[#FFFDF9] pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold text-[#34231D]">
                  {t.totalPrice}
                </span>

                <span className="text-2xl font-black text-[#80563D]">
                  {totalPrice.toFixed(2)} ₼
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#633A25] py-4 font-extrabold text-white transition hover:bg-[#34231D] active:scale-[0.98]"
              >
                <ShoppingBag size={19} />
                {t.add}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-[#241711]/70 p-5 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[30px] bg-white p-7 text-center shadow-2xl sm:p-9"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              aria-label={t.close}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E6DA] text-[#80563D] transition hover:bg-[#E8DED2]"
            >
              <X size={20} />
            </button>

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F0E6DA] text-[#80563D]">
              <QrCode size={32} />
            </div>

            <p className="text-xs font-bold tracking-[0.2em] text-[#A78A72]">
              {isAZ ? "ZEBRA BONUSLARI" : "ZEBRA REWARDS"}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold text-[#34231D]">
              {t.loyaltyTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-[#78675B]">
              {t.scanMessage}
            </p>

            <div className="mx-auto mt-7 flex min-h-[240px] w-full max-w-[260px] items-center justify-center rounded-3xl border border-[#E8DED2] bg-white p-4">
              {qrLoading ? (
                <div className="flex flex-col items-center gap-3 text-[#80563D]">
                  <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#E8DED2] border-t-[#80563D]" />

                  <span className="text-sm font-medium">
                    {isAZ ? "QR hazırlanır..." : "Preparing QR code..."}
                  </span>
                </div>
              ) : qrError ? (
                <div className="px-3 text-sm font-medium text-red-600">
                  {qrError}

                  <button
                    type="button"
                    onClick={openCustomerQR}
                    className="mt-3 block w-full rounded-full bg-[#80563D] px-4 py-2 text-white"
                  >
                    {isAZ ? "Yenidən cəhd et" : "Try again"}
                  </button>
                </div>
              ) : qrToken ? (
                <QRCodeSVG
                  value={qrToken}
                  size={220}
                  level="H"
                  includeMargin
                />
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-[#A78A72]">
              <Check size={15} />

              {isAZ
                ? "Sizin şəxsi loyallıq kartınız"
                : "Your personal loyalty card"}
            </div>

            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="mt-7 w-full rounded-full bg-[#80563D] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#34231D]"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* ADD TO CART NOTIFICATION */}
      {addedProduct && (
        <div className="fixed bottom-24 left-1/2 z-[120] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-full bg-[#34231D] px-6 py-4 text-sm font-semibold text-white shadow-xl">
          <Check size={18} />
          {t.added}
        </div>
      )}

    </main>
  );
}