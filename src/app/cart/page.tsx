
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
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

const translations = {
  AZ: {
    title: "Səbətim",
    subtitle: "Seçdiyiniz dadlar sizi gözləyir.",
    empty: "Səbətiniz hələ boşdur",
    emptyText: "Sevimli qəhvələrinizi seçmək üçün menyumuza keçin.",
    menu: "Menyuya qayıt",
    total: "Ümumi məbləğ",
    rewards: "ZEBRA BONUSLARI",
    points: "Bonus xalların",
    rewardInfo: "100 xal = 1 AZN endirim",
    usePoints: "Bonus xallarımı istifadə et",
    notEnoughPoints: "Bonus istifadə etmək üçün ən azı 100 xal lazımdır.",
    rewardDiscount: "Bonus endirimi",
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
  },
  EN: {
    title: "My Cart",
    subtitle: "Your selected favorites are waiting for you.",
    empty: "Your cart is empty",
    emptyText: "Visit our menu and choose your favorite coffee.",
    menu: "Back to Menu",
    total: "Total",
    rewards: "ZEBRA REWARDS",
    points: "Your reward points",
    rewardInfo: "100 points = 1 AZN discount",
    usePoints: "Use my reward points",
    notEnoughPoints: "You need at least 100 points to redeem rewards.",
    rewardDiscount: "Reward discount",
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

  useEffect(() => {
    setItems(getCart());
    setLoaded(true);
  }, []);

  useEffect(() => {
    async function loadRewardPoints() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data, error } = await supabase
        .from("loyalty_transactions")
        .select("points")
        .eq("user_id", session.user.id);

      if (!error && data) {
        const balance = data.reduce(
          (sum, transaction) => sum + Number(transaction.points),
          0
        );

        setRewardPoints(balance);
      }
    }

    loadRewardPoints();
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
  }

  function removeItem(key: string) {
    const updated = items.filter((item) => item.key !== key);
    setItems(updated);
    saveCart(updated);
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const maxRedeemPoints = Math.min(
    Math.floor(rewardPoints / 100) * 100,
    Math.floor(total) * 100
  );

  const rewardDiscount = useRewards ? maxRedeemPoints / 100 : 0;

  const payableTotal = Math.max(0, total - rewardDiscount);

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
          })),
          orderType,
          branch,
          customerName,
          phone,
          deliveryAddress: address,
          orderNote: note,
          paymentMethod,
          redeemPoints: useRewards ? maxRedeemPoints : 0,
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
    "w-full rounded-xl border border-[#e8ddd1] bg-[#faf7f1] px-4 py-3 text-sm outline-none focus:border-[#98704d]";

  if (!loaded) {
    return <main className="min-h-screen bg-[#faf7f1] pb-28" />;
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] px-5 py-8 pb-28 text-[#38271f] md:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
          <div className="flex items-center gap-3">
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
          </div>
        </header>

        {successOrder !== null ? (
          <section className="rounded-[28px] border border-[#eee5d9] bg-white px-6 py-16 text-center shadow-sm">
            <CheckCircle
              size={58}
              className="mx-auto mb-5 text-green-700"
            />

            <h2 className="mb-3 text-2xl font-black">{t.success}</h2>

            <p className="mb-3 text-sm text-[#8b7768]">
              {t.orderNumber}: #{successOrder}
            </p>

            {paymentMethod === "demo_card" && (
              <p className="mb-6 text-sm font-bold text-amber-700">
                {t.demoSuccess} — {t.demoBadge}
              </p>
            )}

            <Link
              href="/menu"
              className="inline-flex rounded-full bg-[#553b2c] px-7 py-3 text-sm font-bold text-white"
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
                  <span className="rounded-full bg-[#eee3d5] px-3 py-1 text-sm font-bold">
                    {itemCount}
                  </span>
                )}
              </div>

              <p className="text-sm text-[#8b7768]">{t.subtitle}</p>
            </div>

            {items.length === 0 ? (
              <section className="rounded-[28px] bg-white px-6 py-16 text-center shadow-sm">
                <Coffee
                  size={40}
                  className="mx-auto mb-5 text-[#9b7251]"
                />
                <h3 className="mb-2 text-2xl font-black">{t.empty}</h3>
                <p className="mb-7 text-sm text-[#8b7768]">
                  {t.emptyText}
                </p>

                <Link
                  href="/menu"
                  className="rounded-full bg-[#553b2c] px-7 py-3 text-sm font-bold text-white"
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
                      className="flex gap-4 rounded-[24px] border border-[#eee5d9] bg-white p-4 shadow-sm"
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

                        <p className="mt-1 text-sm font-bold text-[#9b7251]">
                          {item.price.toFixed(2)} AZN
                        </p>

                        {item.sizeEn && (
                          <p className="mt-2 text-xs text-[#806e62]">
                            {lang === "AZ" ? "Ölçü:" : "Size:"}{" "}
                            {lang === "AZ" ? item.sizeAz : item.sizeEn}
                          </p>
                        )}

                        {item.addOns.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-[#806e62]">
                              {lang === "AZ" ? "Əlavələr:" : "Add-ons:"}
                            </p>

                            {item.addOns.map((addon) => (
                              <p
                                key={addon.id}
                                className="text-xs text-[#806e62]"
                              >
                                + {lang === "AZ" ? addon.az : addon.en}
                                {" · "}
                                {addon.price.toFixed(2)} AZN
                              </p>
                            ))}
                          </div>
                        )}

                        <div className="mt-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 rounded-full bg-[#f5eee5] p-1">
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
                            className="flex items-center gap-1 text-xs font-bold text-[#a46c5b]"
                          >
                            <Trash2 size={15} />
                            {t.remove}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>

                <aside className="h-fit space-y-5 rounded-[26px] border border-[#eee5d9] bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-black">
                    <MapPin size={21} />
                    {t.details}
                  </h3>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
                      {t.orderType}
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => changeOrderType("delivery")}
                        className={`rounded-xl border p-3 text-sm font-bold ${
                          orderType === "delivery"
                            ? "border-[#553b2c] bg-[#553b2c] text-white"
                            : "border-[#e8ddd1] bg-[#faf7f1]"
                        }`}
                      >
                        {t.delivery}
                      </button>

                      <button
                        type="button"
                        onClick={() => changeOrderType("pickup")}
                        className={`rounded-xl border p-3 text-sm font-bold ${
                          orderType === "pickup"
                            ? "border-[#553b2c] bg-[#553b2c] text-white"
                            : "border-[#e8ddd1] bg-[#faf7f1]"
                        }`}
                      >
                        {t.pickup}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold">
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
                    <label className="mb-2 block text-sm font-bold">
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
                    <label className="mb-2 block text-sm font-bold">
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
                      <label className="mb-2 block text-sm font-bold">
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
                    <label className="mb-2 block text-sm font-bold">
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
                    <label className="mb-2 block text-sm font-bold">
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
                    <div className="rounded-2xl border border-[#e8ddd1] bg-[#faf7f1] p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-black tracking-widest">
                          DEMO CARD
                        </span>

                        <div className="flex gap-2">
                          <span className="rounded bg-white px-2 py-1 text-xs font-black text-blue-800">
                            VISA
                          </span>

                          <span className="rounded bg-white px-2 py-1 text-xs font-black text-red-700">
                            Mastercard
                          </span>
                        </div>
                      </div>

                      <p className="text-xs leading-5 text-[#8b7768]">
                        {t.demoText}
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[#e8ddd1] bg-[#faf7f1] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-black">{t.rewards}</h4>
                      <span className="text-lg">⭐</span>
                    </div>

                    <p className="text-sm text-[#8b7768]">
                      {t.points}: <strong>{rewardPoints}</strong>
                    </p>

                    <p className="mb-3 mt-1 text-xs text-[#9b7251]">
                      {t.rewardInfo}
                    </p>

                    {maxRedeemPoints >= 100 ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={useRewards}
                          onChange={(e) => setUseRewards(e.target.checked)}
                          className="h-4 w-4 accent-[#553b2c]"
                        />
                        {t.usePoints}
                      </label>
                    ) : (
                      <p className="text-xs text-[#8b7768]">
                        {t.notEnoughPoints}
                      </p>
                    )}

                    {useRewards && rewardDiscount > 0 && (
                      <p className="mt-3 font-bold text-green-800">
                        {t.rewardDiscount}: -{rewardDiscount.toFixed(2)} AZN
                      </p>
                    )}
                  </div>

                  <div className="border-t border-[#eee5d9] pt-5">
                    {useRewards && rewardDiscount > 0 && (
                      <div className="mb-2 flex justify-between text-sm text-[#8b7768]">
                        <span>{t.rewardDiscount}</span>
                        <span>-{rewardDiscount.toFixed(2)} AZN</span>
                      </div>
                    )}

                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-sm text-[#8b7768]">
                        {t.total}
                      </span>

                      <span className="text-2xl font-black text-[#553b2c]">
                        {payableTotal.toFixed(2)} AZN
                      </span>
                    </div>

                    {error && (
                      <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={() => handleCheckout()}
                      disabled={loading || items.length === 0}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#553b2c] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#79563f] disabled:opacity-60"
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
              className="absolute right-5 top-5 rounded-full bg-[#f5eee5] p-2"
            >
              <X size={19} />
            </button>

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#553b2c] text-white">
              <CreditCard size={28} />
            </div>

            <div className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-black tracking-widest text-amber-800">
              {t.demoBadge}
            </div>

            <h2 className="mb-3 text-2xl font-black">{t.demoTitle}</h2>

            <p className="mb-6 text-sm leading-6 text-[#8b7768]">
              {t.demoText}
            </p>

            <div className="mb-6 rounded-2xl bg-[#faf7f1] p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-[#8b7768]">{t.total}</span>

                <span className="text-2xl font-black text-[#553b2c]">
                  {payableTotal.toFixed(2)} AZN
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-green-800">
                <ShieldCheck size={17} />
                {t.demoNotice}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCheckout(true)}
              disabled={loading}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#553b2c] px-5 py-4 text-sm font-bold text-white hover:bg-[#79563f] disabled:opacity-60"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? t.processing : t.demoButton}
            </button>

            <button
              type="button"
              onClick={() => setShowDemoPayment(false)}
              className="w-full rounded-full border border-[#e8ddd1] px-5 py-3 text-sm font-bold"
            >
              {t.demoCancel}
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
