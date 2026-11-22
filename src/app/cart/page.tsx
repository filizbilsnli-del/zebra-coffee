"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { products } from "@/data/products";
import {
  Coffee,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  CheckCircle,
  Loader2,
  MapPin,
  CreditCard,
  ShieldCheck,
  X,
} from "lucide-react";
import { CartItem, getCart, saveCart } from "@/lib/cart";

import { supabase } from "@/lib/supabase";

type MonthlyRewardType =
  | "monthly_discount"
  | "free_addon"
  | "free_size_upgrade"
  | "free_drink";

type MonthlyReward = {
  id: number;
  reward_name: string;
  status: "available" | "used";
  type: MonthlyRewardType;
};

const FREE_DRINKS = [
  { id: 1, name: "Espresso" },
  { id: 2, name: "Americano" },
  { id: 3, name: "Cappuccino" },
  { id: 4, name: "Flat White" },
  { id: 12, name: "Classic Latte" },
  { id: 13, name: "Classic Iced Coffee" },
  { id: 15, name: "Iced Americano" },
  { id: 19, name: "Cold Brew" },
];

const FREE_ADDONS = [
  {
    id: "extra-espresso",
    en: "Extra espresso shot",
    az: "Əlavə espresso",
  },
  {
    id: "vanilla-syrup",
    en: "Vanilla syrup",
    az: "Vanil siropu",
  },
  {
    id: "caramel-syrup",
    en: "Caramel syrup",
    az: "Karamel siropu",
  },
  {
    id: "chocolate-syrup",
    en: "Chocolate syrup",
    az: "Şokolad siropu",
  },
];

const translations = {
  AZ: {
    title: "Səbətim",
    subtitle: "Seçdiyiniz dadlar sizi gözləyir.",
    empty: "Səbətiniz hələ boşdur",
    emptyText: "Sevimli qəhvələrinizi seçmək üçün menyumuza keçin.",
    menu: "Menyuya qayıt",
    total: "Yekun məbləğ",
    subtotal: "Məhsulların cəmi",
    rewards: "ZEBRA BONUSLARI",
    points: "Bonus xalların",
    rewardInfo: "100 xal = 1 AZN endirim",
    usePoints: "Bonus xallarımı istifadə et",
    notEnoughPoints: "Bonus istifadə etmək üçün ən azı 100 xal lazımdır.",
    rewardDiscount: "Bonus endirimi",
    birthdayDiscount: "Ad günü endirimi (15%)",
    studentDiscount: "Tələbə endirimi (10%)",
    checkout: "Sifarişi tamamla",
    remove: "Sil",
    login: "Sifariş vermək üçün hesabınıza daxil olun.",
    success: "Sifarişiniz uğurla qəbul edildi!",
    orderNumber: "Sifariş nömrəsi",
    continue: "Menyuya davam et",
    processing: "Sifariş göndərilir...",
    orderType: "Sifariş növü",
    delivery: "Çatdırılma",
    pickup: "Filialdan götürmə",
    branch: "Filial seçin",
    name: "Ad və soyad",
    phone: "Telefon nömrəsi",
    address: "Çatdırılma ünvanı",
    note: "Əlavə qeyd",
    payment: "Ödəniş üsulu",
    cashDelivery: "Çatdırılma zamanı nağd",
    cashBranch: "Filialda nağd",
    cardBranch: "Filialda kartla",
    onlineCard: "Onlayn kartla ödəniş (Demo)",
    required: "Zəhmət olmasa bütün vacib xanaları doldurun.",
    error: "Sifariş yaradılarkən xəta baş verdi.",
    details: "Sifariş məlumatları",
    demoTitle: "Təhlükəsiz demo ödəniş",
    demoText:
      "Bu, yalnız təqdimat məqsədli sınaq ödənişidir. Real pul tutulmur və kart məlumatları tələb edilmir.",
    demoButton: "Demo ödənişi təsdiqlə",
    demoCancel: "Geri qayıt",
    demoSuccess: "Demo ödəniş addımı tamamlandı!",
    demoBadge: "DEMO MODE",
    demoNotice: "Real bank əməliyyatı aparılmır.",

    monthlyTitle: "ZEBRA AYLIQ MÜKAFATI",
    monthlyAvailable: "Bu ayın mükafatı istifadəyə hazırdır.",
    monthlyUsed: "Bu ayın mükafatı artıq istifadə olunub.",
    monthlyUse: "Bu ayın mükafatından istifadə et",
    monthlySelected: "Mükafat seçildi",
    monthlyDiscount: "5% aylıq üzv endirimi",
    freeAddon: "Pulsuz espresso və ya sirop",
    freeSize: "Pulsuz ölçü artımı",
    freeDrink: "Bir pulsuz standart içki",
    selectProduct: "Məhsul seçin",
    selectAddon: "Əlavə seçin",
    selectSize: "Yeni ölçü seçin",
    selectDrink: "Pulsuz içki seçin",
    noEligibleItem: "Bu mükafat üçün uyğun məhsul seçin.",
    cannotCombine:
      "Aylıq 5% endirim tələbə və ad günü endirimi ilə birləşdirilmir.",
  },

  EN: {
    title: "My Cart",
    subtitle: "Your selected favorites are waiting for you.",
    empty: "Your cart is empty",
    emptyText: "Visit our menu and choose your favorite coffee.",
    menu: "Back to Menu",
    total: "Final total",
    subtotal: "Subtotal",
    rewards: "ZEBRA REWARDS",
    points: "Your reward points",
    rewardInfo: "100 points = 1 AZN discount",
    usePoints: "Use my reward points",
    notEnoughPoints: "You need at least 100 points to redeem rewards.",
    rewardDiscount: "Reward discount",
    birthdayDiscount: "Birthday discount (15%)",
    studentDiscount: "Student discount (10%)",
    checkout: "Place Order",
    remove: "Remove",
    login: "Please log in to place an order.",
    success: "Your order has been placed successfully!",
    orderNumber: "Order number",
    continue: "Continue shopping",
    processing: "Placing your order...",
    orderType: "Order type",
    delivery: "Delivery",
    pickup: "Pickup",
    branch: "Select branch",
    name: "Full name",
    phone: "Phone number",
    address: "Delivery address",
    note: "Additional note",
    payment: "Payment method",
    cashDelivery: "Cash on delivery",
    cashBranch: "Cash at branch",
    cardBranch: "Card at branch",
    onlineCard: "Online Card Payment (Demo)",
    required: "Please complete all required fields.",
    error: "An error occurred while placing your order.",
    details: "Order details",
    demoTitle: "Secure demo payment",
    demoText:
      "This is a presentation-only simulated payment. No real money is charged and no card details are required.",
    demoButton: "Confirm demo payment",
    demoCancel: "Go back",
    demoSuccess: "Demo payment step completed!",
    demoBadge: "DEMO MODE",
    demoNotice: "No real banking transaction takes place.",

    monthlyTitle: "ZEBRA MONTHLY REWARD",
    monthlyAvailable: "Your monthly reward is ready to use.",
    monthlyUsed: "This month's reward has already been used.",
    monthlyUse: "Use this month's reward",
    monthlySelected: "Reward selected",
    monthlyDiscount: "5% monthly member discount",
    freeAddon: "Free espresso shot or syrup",
    freeSize: "Free size upgrade",
    freeDrink: "One free standard drink",
    selectProduct: "Select a product",
    selectAddon: "Select an add-on",
    selectSize: "Select new size",
    selectDrink: "Select a free drink",
    noEligibleItem: "Select an eligible product for this reward.",
    cannotCombine:
      "The monthly 5% discount cannot be combined with student or birthday discounts.",
  },
};

export default function CartPage() {
  const { language: lang } = useLanguage();
  const t = translations[lang];

  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState<number | null>(null);
  const [showDemoPayment, setShowDemoPayment] = useState(false);

  const [orderType, setOrderType] = useState<"delivery" | "pickup">("delivery");
  const [branch, setBranch] = useState("Gənclik");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");

  const [rewardPoints, setRewardPoints] = useState(0);
  const [useRewards, setUseRewards] = useState(false);

  const [discountRate, setDiscountRate] = useState(0);
  const [discountType, setDiscountType] = useState<
    "birthday" | "student" | null
  >(null);

  const [monthlyReward, setMonthlyReward] =
    useState<MonthlyReward | null>(null);

  const [useMonthlyReward, setUseMonthlyReward] = useState(false);
  const [monthlyTargetKey, setMonthlyTargetKey] = useState("");
  const [monthlyAddOnId, setMonthlyAddOnId] =
    useState("extra-espresso");
  const [monthlySizeId, setMonthlySizeId] = useState("medium");
  const [monthlyDrinkId, setMonthlyDrinkId] = useState("1");

  useEffect(() => {
    setItems(getCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    async function loadUserDiscounts() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const userId = session.user.id;

      // Load and synchronize the monthly reward.
      const { data: syncData, error: syncError } = await supabase.rpc(
        "sync_monthly_member_reward"
      );

      if (syncError) {
        console.error("Monthly reward sync error:", syncError);
      } else if (syncData?.reward_name && syncData?.reward_month) {
        const { data: rewardRow, error: rewardError } = await supabase
          .from("member_rewards")
          .select("id, reward_name, status")
          .eq("user_id", userId)
          .eq("reward_type", "monthly_level_reward")
          .eq("reward_month", syncData.reward_month)
          .maybeSingle();

        if (rewardError) {
          console.error("Monthly reward loading error:", rewardError);
        } else if (rewardRow) {
          let rewardType: MonthlyRewardType | null = null;

          if (rewardRow.reward_name === "5% monthly member discount") {
            rewardType = "monthly_discount";
          } else if (
            rewardRow.reward_name ===
            "One free espresso shot or syrup"
          ) {
            rewardType = "free_addon";
          } else if (
            rewardRow.reward_name === "One free size upgrade"
          ) {
            rewardType = "free_size_upgrade";
          } else if (
            rewardRow.reward_name === "One free standard drink"
          ) {
            rewardType = "free_drink";
          }

          if (rewardType) {
            setMonthlyReward({
              id: Number(rewardRow.id),
              reward_name: rewardRow.reward_name,
              status: rewardRow.status,
              type: rewardType,
            });
          }
        }
      }

      const { data: transactions, error: rewardsError } = await supabase
        .from("loyalty_transactions")
        .select("points, transaction_type")
        .eq("user_id", userId);

      if (!rewardsError && transactions) {
        const balance = transactions.reduce((sum, transaction) => {
  const points = Number(transaction.points);

  if (transaction.transaction_type === "earned") {
    return sum + points;
  }

  if (transaction.transaction_type === "redeemed") {
    return sum - Math.abs(points);
  }

  return sum;
}, 0);

setRewardPoints(Math.max(0, balance));

        setRewardPoints(balance);
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("birth_date, student_status")
        .eq("id", userId)
        .maybeSingle();

      if (profileError || !profile) return;

      const todayParts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Baku",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(new Date());

      const todayMonth = Number(
        todayParts.find((part) => part.type === "month")?.value
      );

      const todayDay = Number(
        todayParts.find((part) => part.type === "day")?.value
      );

      const birthDate = profile.birth_date
        ? String(profile.birth_date).slice(0, 10)
        : "";

      const birthMonth = birthDate
        ? Number(birthDate.split("-")[1])
        : 0;

      const birthDay = birthDate
        ? Number(birthDate.split("-")[2])
        : 0;

      const isBirthday =
        birthMonth === todayMonth && birthDay === todayDay;

      if (isBirthday) {
        setDiscountRate(0.15);
        setDiscountType("birthday");
      } else if (profile.student_status === "verified") {
        setDiscountRate(0.10);
        setDiscountType("student");
      } else {
        setDiscountRate(0);
        setDiscountType(null);
      }
    }

    loadUserDiscounts();
  }, []);

  function updateQuantity(key: string, change: number) {
    const updated = items
      .map((item) =>
        item.key === key
          ? { ...item, quantity: item.quantity + change }
          : item
      )
      .filter((item) => item.quantity > 0);

    setItems(updated);
    saveCart(updated);

    if (monthlyTargetKey === key && !updated.some((item) => item.key === key)) {
      setMonthlyTargetKey("");
      setUseMonthlyReward(false);
    }
  }

  function removeItem(key: string) {
    const updated = items.filter((item) => item.key !== key);

    setItems(updated);
    saveCart(updated);

    if (monthlyTargetKey === key) {
      setMonthlyTargetKey("");
      setUseMonthlyReward(false);
    }
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const baseDiscount = Number((total * discountRate).toFixed(2));

  const monthlyDiscount =
    useMonthlyReward &&
    monthlyReward?.type === "monthly_discount" &&
    discountRate === 0
      ? Number((total * 0.05).toFixed(2))
      : 0;

  const afterBaseDiscount = Math.max(
    0,
    total - baseDiscount - monthlyDiscount
  );

  const maxRedeemPoints = Math.min(
    Math.floor(rewardPoints / 100) * 100,
    Math.floor(afterBaseDiscount) * 100
  );

  const rewardDiscount = useRewards ? maxRedeemPoints / 100 : 0;

  const payableTotal = Math.max(
    0,
    Number((afterBaseDiscount - rewardDiscount).toFixed(2))
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const selectedMonthlyItem = items.find(
    (item) => item.key === monthlyTargetKey
  );
const eligibleMonthlyAddonItems = items.filter((item) => {
  const product = products.find((product) => product.id === item.id);

  return (
    product &&
    ["Hot Coffee", "Iced Coffee"].includes(product.category)
  );
});
   

  
  const monthlySelectionValid =
    !useMonthlyReward ||
    !monthlyReward ||
    monthlyReward.type === "monthly_discount" ||
    monthlyReward.type === "free_drink" ||
    (monthlyReward.type === "free_addon" &&
      eligibleMonthlyAddonItems.some(
        (item) => item.key === monthlyTargetKey
      )) ||
    (monthlyReward.type === "free_size_upgrade" &&
      Boolean(selectedMonthlyItem) &&
      (selectedMonthlyItem?.sizeId === "small" ||
        selectedMonthlyItem?.sizeId === "medium") &&
      ((selectedMonthlyItem?.sizeId === "small" &&
        monthlySizeId === "medium") ||
        (selectedMonthlyItem?.sizeId === "medium" &&
          monthlySizeId === "large")));

  function changeOrderType(type: "delivery" | "pickup") {
    setOrderType(type);
    setPaymentMethod(
      type === "delivery" ? "cash_on_delivery" : "cash_at_branch"
    );
    setShowDemoPayment(false);
  }

  async function handleCheckout(confirmDemo = false) {
    if (loading || items.length === 0) return;

    if (
      useMonthlyReward &&
      !monthlySelectionValid
    ) {
      setError(t.noEligibleItem);
      return;
    }

    if (
      customerName.trim().length < 2 ||
      phone.trim().length < 7 ||
      (orderType === "delivery" && address.trim().length < 5)
    ) {
      setError(t.required);
      setShowDemoPayment(false);
      return;
    }

    if (paymentMethod === "demo_card" && !confirmDemo) {
      setError("");
      setShowDemoPayment(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError(t.login);
        return;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            sizeId: item.sizeId,
            addOnIds: item.addOns.map((addon) => addon.id),

            // Required by the API to identify the selected cart item.
            cartItemKey: item.key,
          })),

          orderType,
          branch,
          customerName,
          phone,
          deliveryAddress: address,
          orderNote: note,
          paymentMethod,

          redeemPoints: useRewards ? maxRedeemPoints : 0,

          monthlyReward:
            useMonthlyReward && monthlyReward
              ? {
                  rewardId: monthlyReward.id,
                  type: monthlyReward.type,

                  ...(monthlyReward.type === "free_addon"
                    ? {
                        cartItemKey: monthlyTargetKey,
                        addOnId: monthlyAddOnId,
                      }
                    : {}),

                  ...(monthlyReward.type === "free_size_upgrade"
                    ? {
                        cartItemKey: monthlyTargetKey,
                        sizeId: monthlySizeId,
                      }
                    : {}),

                  ...(monthlyReward.type === "free_drink"
                    ? {
                        productId: Number(monthlyDrinkId),
                      }
                    : {}),
                }
              : null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || t.error);
      }

      setSuccessOrder(result.order.id);
      setItems([]);
      saveCart([]);
      setShowDemoPayment(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#EDE3D8] bg-[#FCFAF6] px-4 py-3 text-base outline-none focus:border-[#98704d]";

  if (!loaded) {
    return <main className="min-h-screen bg-[#FCFAF6] pb-28" />;
  }

  return (
    <main className="min-h-screen bg-[#FCFAF6] px-5 py-8 pb-28 text-[#49372C] md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#76563F] text-xl font-black text-[#f5e7d1]">
              Z
            </div>

            <div>
              <h1 className="text-xl font-black tracking-[0.16em]">
                ZEBRA
              </h1>
              <p className="text-[9px] font-bold tracking-[0.35em] text-[#A08065]">
                COFFEE HOUSE
              </p>
            </div>
          </div>
        </header>

        {successOrder !== null ? (
          <section className="rounded-[28px] border border-[#F0E8DE] bg-white px-6 py-16 text-center shadow-sm">
            <CheckCircle
              size={58}
              className="mx-auto mb-5 text-green-700"
            />

            <h2 className="mb-3 text-2xl font-black">{t.success}</h2>

            <p className="mb-3 text-base text-[#806F62]">
              {t.orderNumber}: #{successOrder}
            </p>

            {paymentMethod === "demo_card" && (
              <p className="mb-6 text-base font-bold text-amber-700">
                {t.demoSuccess} — {t.demoBadge}
              </p>
            )}

            <Link
              href="/menu"
              className="inline-flex rounded-full bg-[#76563F] px-7 py-3 text-base font-bold text-white"
            >
              {t.continue}
            </Link>
          </section>
        ) : (
          <>
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-3">
                <ShoppingBag size={27} />

                <h2 className="text-3xl font-black md:text-4xl">
                  {t.title}
                </h2>

                {itemCount > 0 && (
                  <span className="rounded-full bg-[#eee3d5] px-3 py-1 text-base font-bold">
                    {itemCount}
                  </span>
                )}
              </div>

              <p className="text-base text-[#806F62]">{t.subtitle}</p>
            </div>

            {items.length === 0 ? (
              <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm">
                <Coffee
                  size={40}
                  className="mx-auto mb-5 text-[#A17C5B]"
                />

                <h3 className="mb-2 text-2xl font-black">{t.empty}</h3>

                <p className="mb-7 text-base text-[#806F62]">
                  {t.emptyText}
                </p>

                <Link
                  href="/menu"
                  className="rounded-full bg-[#76563F] px-7 py-3 text-base font-bold text-white"
                >
                  {t.menu}
                </Link>
              </section>
            ) : (
              <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
                <section className="space-y-4">
                 {items.map((item) => (
                    <article
                      key={item.key}
                      className="flex gap-4 rounded-[24px] border border-[#F0E8DE] bg-white p-4 shadow-sm"
                    >
                      <img
                        src={
                          item.image.startsWith("/")
                            ? item.image
                            : `/images/${item.image}`
                        }
                        alt={lang === "AZ" ? item.az : item.en}
                        className="h-24 w-24 rounded-2xl object-cover"
                      />

                      <div className="min-w-0 flex-1">
                        <h3 className="font-black">
                          {lang === "AZ" ? item.az : item.en}
                        </h3>

                        <p className="mt-1 text-base font-bold text-[#A17C5B]">
                          {item.price.toFixed(2)} AZN
                        </p>

                        {item.sizeEn && (
                          <p className="mt-2 text-base text-[#79695E]">
                            {lang === "AZ" ? "Ölçü:" : "Size:"}{" "}
                            {lang === "AZ" ? item.sizeAz : item.sizeEn}
                          </p>
                        )}

                        {item.addOns.length > 0 && (
                          <div className="mt-2">
                            <p className="text-base font-semibold text-[#79695E]">
                              {lang === "AZ" ? "Əlavələr:" : "Add-ons:"}
                            </p>

                            {item.addOns.map((addon) => (
                              <p
                                key={addon.id}
                                className="text-base text-[#79695E]"
                              >
                                + {lang === "AZ" ? addon.az : addon.en}
                                {" · "}
                                {addon.price.toFixed(2)} AZN
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 rounded-full bg-[#F6EFE6] p-1">
                            <button
                              onClick={() => updateQuantity(item.key, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="font-black">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.key, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full bg-white"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.key)}
                            className="flex items-center gap-1 text-base font-bold text-[#a46c5b]"
                          >
                            <Trash2 size={15} />
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                <aside className="h-fit space-y-5 rounded-[26px] border border-[#F0E8DE] bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-black">
                    <MapPin size={21} />
                    {t.details}
                  </h3>

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.orderType}
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => changeOrderType("delivery")}
                        className={`rounded-xl border p-3 text-base font-bold ${
                          orderType === "delivery"
                            ? "border-[#76563F] bg-[#76563F] text-white"
                            : "border-[#EDE3D8] bg-[#FCFAF6]"
                        }`}
                      >
                        {t.delivery}
                      </button>

                      <button
                        type="button"
                        onClick={() => changeOrderType("pickup")}
                        className={`rounded-xl border p-3 text-base font-bold ${
                          orderType === "pickup"
                            ? "border-[#76563F] bg-[#76563F] text-white"
                            : "border-[#EDE3D8] bg-[#FCFAF6]"
                        }`}
                      >
                        {t.pickup}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.branch}
                    </label>

                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Gənclik">Gənclik</option>
                      <option value="28 May">28 May</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.name}
                    </label>

                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={inputClass}
                      placeholder={t.name}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.phone}
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+994..."
                    />
                  </div>

                  {orderType === "delivery" && (
                    <div>
                      <label className="mb-2 block text-base font-bold">
                        {t.address}
                      </label>

                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder={t.address}
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.note}
                    </label>

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className={inputClass}
                      rows={2}
                      placeholder={t.note}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-base font-bold">
                      {t.payment}
                    </label>

                    <select
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setShowDemoPayment(false);
                      }}
                      className={inputClass}
                    >
                      {orderType === "delivery" ? (
                        <option value="cash_on_delivery">
                          {t.cashDelivery}
                        </option>
                      ) : (
                        <>
                          <option value="cash_at_branch">
                            {t.cashBranch}
                          </option>

                          <option value="card_at_branch">
                            {t.cardBranch}
                          </option>
                        </>
                      )}

                      <option value="demo_card">{t.onlineCard}</option>
                    </select>
                  </div>

                  {paymentMethod === "demo_card" && (
                    <div className="rounded-2xl border border-[#EDE3D8] bg-[#FCFAF6] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-base font-black tracking-widest">
                          DEMO CARD
                        </span>

                        <div className="flex gap-2">
                          <span className="rounded bg-white px-2 py-1 text-base font-black text-blue-800">
                            VISA
                          </span>

                          <span className="rounded bg-white px-2 py-1 text-base font-black text-red-700">
                            Mastercard
                          </span>
                        </div>
                      </div>

                      <p className="text-base leading-5 text-[#806F62]">
                        {t.demoText}
                      </p>
                    </div>
                  )}

                  {/* Existing points rewards */}
                  <div className="rounded-2xl border border-[#EDE3D8] bg-[#FCFAF6] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-black">{t.rewards}</h4>
                      <span className="text-lg">⭐</span>
                    </div>

                    <p className="text-base text-[#806F62]">
                      {t.points}: <strong>{rewardPoints}</strong>
                    </p>

                    <p className="mb-3 mt-1 text-base text-[#A17C5B]">
                      {t.rewardInfo}
                    </p>

                    {maxRedeemPoints >= 100 ? (
                      <label className="flex cursor-pointer items-center gap-2 text-base font-bold">
                        <input
                          type="checkbox"
                          checked={useRewards}
                          onChange={(e) => setUseRewards(e.target.checked)}
                          className="h-4 w-4 accent-[#76563F]"
                        />
                        {t.usePoints}
                      </label>
                    ) : (
                      <p className="text-base text-[#806F62]">
                        {t.notEnoughPoints}
                      </p>
                    )}

                    {useRewards && rewardDiscount > 0 && (
                      <p className="mt-3 font-bold text-green-800">
                        {t.rewardDiscount}: -{rewardDiscount.toFixed(2)} AZN
                      </p>
                    )}
                  </div>

                  {/* Monthly membership reward */}
                  {monthlyReward && (
                    <div className="rounded-2xl border border-[#E9D9C5] bg-[#FBF5EC] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-black">{t.monthlyTitle}</h4>
                        <span className="text-xl">🎁</span>
                      </div>

                      <p className="mb-2 text-base font-bold text-[#76563F]">
                        {monthlyReward.type === "monthly_discount" &&
                          t.monthlyDiscount}

                        {monthlyReward.type === "free_addon" &&
                          t.freeAddon}

                        {monthlyReward.type === "free_size_upgrade" &&
                          t.freeSize}

                        {monthlyReward.type === "free_drink" &&
                          t.freeDrink}
                      </p>

                      {monthlyReward.status === "used" ? (
                        <p className="text-base font-bold text-[#806F62]">
                          ✓ {t.monthlyUsed}
                        </p>
                      ) : (
                        <>
                          <p className="mb-3 text-base text-[#806F62]">
                            {t.monthlyAvailable}
                          </p>

                          {monthlyReward.type === "free_addon" && (
                            <>
                              <label className="mb-1 block text-base font-bold">
                                {t.selectProduct}
                              </label>

                              <select
                                value={monthlyTargetKey}
                                onChange={(e) =>
                                  setMonthlyTargetKey(e.target.value)
                                }
                                className={`${inputClass} mb-3`}
                              >
                                <option value="">
                                  {t.selectProduct}
                                </option>

                                {eligibleMonthlyAddonItems.map((item) => (
                                  <option
                                    key={item.key}
                                    value={item.key}
                                  >
                                    {lang === "AZ" ? item.az : item.en}
                                  </option>
                                ))}
                              </select>

                              <label className="mb-1 block text-base font-bold">
                                {t.selectAddon}
                              </label>

                              <select
                                value={monthlyAddOnId}
                                onChange={(e) =>
                                  setMonthlyAddOnId(e.target.value)
                                }
                                className={inputClass}
                              >
                                {FREE_ADDONS.map((addon) => (
                                  <option key={addon.id} value={addon.id}>
                                    {lang === "AZ" ? addon.az : addon.en}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}

                          {monthlyReward.type === "free_size_upgrade" && (
                            <>
                              <label className="mb-1 block text-base font-bold">
                                {t.selectProduct}
                              </label>

                              <select
                                value={monthlyTargetKey}
                                onChange={(e) => {
                                  const selected = items.find(
                                    (item) => item.key === e.target.value
                                  );

                                  setMonthlyTargetKey(e.target.value);

                                  setMonthlySizeId(
                                    selected?.sizeId === "small"
                                      ? "medium"
                                      : "large"
                                  );
                                }}
                                className={`${inputClass} mb-3`}
                              >
                                <option value="">
                                  {t.selectProduct}
                                </option>

                                {items
                                  .filter(
                                    (item) =>
                                      item.sizeId === "small" ||
                                      item.sizeId === "medium"
                                  )
                                  .map((item) => (
                                    <option
                                      key={item.key}
                                      value={item.key}
                                    >
                                      {lang === "AZ" ? item.az : item.en}
                                      {" — "}
                                      {lang === "AZ"
                                        ? item.sizeAz
                                        : item.sizeEn}
                                    </option>
                                  ))}
                              </select>

                              <label className="mb-1 block text-base font-bold">
                                {t.selectSize}
                              </label>

                              <select
                                value={monthlySizeId}
                                onChange={(e) =>
                                  setMonthlySizeId(e.target.value)
                                }
                                className={inputClass}
                              >
                                {selectedMonthlyItem?.sizeId === "small" && (
                                  <option value="medium">
                                    {lang === "AZ"
                                      ? "Orta · 350 ml"
                                      : "Medium · 350 ml"}
                                  </option>
                                )}

                                {selectedMonthlyItem?.sizeId === "medium" && (
                                  <option value="large">
                                    {lang === "AZ"
                                      ? "Böyük · 450 ml"
                                      : "Large · 450 ml"}
                                  </option>
                                )}
                              </select>
                            </>
                          )}

                          {monthlyReward.type === "free_drink" && (
                            <>
                              <label className="mb-1 block text-base font-bold">
                                {t.selectDrink}
                              </label>

                              <select
                                value={monthlyDrinkId}
                                onChange={(e) =>
                                  setMonthlyDrinkId(e.target.value)
                                }
                                className={inputClass}
                              >
                                {FREE_DRINKS.map((drink) => (
                                  <option
                                    key={drink.id}
                                    value={drink.id}
                                  >
                                    {drink.name}
                                  </option>
                                ))}
                              </select>
                            </>
                          )}

                          {monthlyReward.type === "monthly_discount" &&
                            discountRate > 0 && (
                              <p className="mb-3 text-base font-semibold text-amber-800">
                                {t.cannotCombine}
                              </p>
                            )}

                          <button
                            type="button"
                            disabled={
                              (monthlyReward.type === "monthly_discount" &&
                                discountRate > 0) ||
                              ((monthlyReward.type === "free_addon" ||
                                monthlyReward.type === "free_size_upgrade") &&
                                !monthlyTargetKey) ||
                              (monthlyReward.type === "free_size_upgrade" &&
                                !monthlySelectionValid &&
                                useMonthlyReward)
                            }
                            onClick={() => {
                              setUseMonthlyReward(!useMonthlyReward);
                              setError("");
                            }}
                            className={`mt-3 w-full rounded-full px-4 py-3 text-base font-bold transition ${
                              useMonthlyReward
                                ? "bg-green-800 text-white"
                                : "bg-[#76563F] text-white hover:bg-[#98765A]"
                            } disabled:cursor-not-allowed disabled:opacity-40`}
                          >
                            {useMonthlyReward
                              ? `✓ ${t.monthlySelected}`
                              : t.monthlyUse}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="border-t border-[#F0E8DE] pt-5">
                    <div className="mb-2 flex justify-between text-base text-[#806F62]">
                      <span>{t.subtotal}</span>
                      <span>{total.toFixed(2)} AZN</span>
                    </div>

                    {baseDiscount > 0 && (
                      <div className="mb-2 flex justify-between text-base font-semibold text-green-800">
                        <span>
                          {discountType === "birthday"
                            ? t.birthdayDiscount
                            : t.studentDiscount}
                        </span>

                        <span>-{baseDiscount.toFixed(2)} AZN</span>
                      </div>
                    )}

                    {monthlyDiscount > 0 && (
                      <div className="mb-2 flex justify-between text-base font-semibold text-green-800">
                        <span>{t.monthlyDiscount}</span>
                        <span>-{monthlyDiscount.toFixed(2)} AZN</span>
                      </div>
                    )}

                    {useRewards && rewardDiscount > 0 && (
                      <div className="mb-2 flex justify-between text-base text-green-800">
                        <span>{t.rewardDiscount}</span>
                        <span>-{rewardDiscount.toFixed(2)} AZN</span>
                      </div>
                    )}

                    <div className="mb-5 mt-4 flex items-center justify-between border-t border-[#F0E8DE] pt-4">
                      <span className="text-base font-bold text-[#806F62]">
                        {t.total}
                      </span>

                      <span className="text-2xl font-black text-[#76563F]">
                        {payableTotal.toFixed(2)} AZN
                      </span>
                    </div>

                    {error && (
                      <p className="mb-4 rounded-xl bg-red-50 p-3 text-base text-red-700">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={() => handleCheckout()}
                      disabled={
                        loading ||
                        items.length === 0 ||
                        (useMonthlyReward && !monthlySelectionValid)
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#76563F] px-5 py-4 text-base font-bold text-white transition hover:bg-[#98765A] disabled:opacity-60"
                    >
                      {loading && (
                        <Loader2 size={18} className="animate-spin" />
                      )}

                      {loading ? t.processing : t.checkout}
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </>
        )}
      </div>

      {showDemoPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <section className="relative w-full max-w-md rounded-[28px] bg-white p-7 shadow-2xl">
            <button
              type="button"
              onClick={() => setShowDemoPayment(false)}
              className="absolute right-5 top-5 rounded-full bg-[#F6EFE6] p-2"
            >
              <X size={19} />
            </button>

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#76563F] text-white">
              <CreditCard size={28} />
            </div>

            <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-base font-black tracking-widest text-amber-800">
              {t.demoBadge}
            </div>

            <h2 className="mb-3 text-2xl font-black">{t.demoTitle}</h2>

            <p className="mb-6 text-base leading-6 text-[#806F62]">
              {t.demoText}
            </p>

            <div className="mb-6 rounded-2xl bg-[#FCFAF6] p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-base text-[#806F62]">{t.total}</span>

                <span className="text-2xl font-black text-[#76563F]">
                  {payableTotal.toFixed(2)} AZN
                </span>
              </div>

              <div className="flex items-center gap-2 text-base font-bold text-green-800">
                <ShieldCheck size={17} />
                {t.demoNotice}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheckout(true)}
              disabled={loading}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#76563F] px-5 py-4 text-base font-bold text-white hover:bg-[#98765A] disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? t.processing : t.demoButton}
            </button>

            <button
              type="button"
              onClick={() => setShowDemoPayment(false)}
              className="w-full rounded-full border border-[#EDE3D8] px-5 py-3 text-base font-bold"
            >
              {t.demoCancel}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
