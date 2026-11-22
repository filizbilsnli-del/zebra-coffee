"use client";

import { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase";
import {
  Camera,
  Coffee,
  UserRound,
  Star,
  Wallet,
  LogOut,
  Loader2,
  ScanLine,
  History,
  RefreshCw,
  Receipt,
  Gift,
  BadgePercent,
  Languages,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Language = "EN" | "AZ";

type Customer = {
  id?: string;
  fullName: string;
  level: string;
  balance: number;
  discountValue: string;
  lifetimeEarned?: number;
  isBirthday?: boolean;
  isVerifiedStudent?: boolean;
  discountType?: "birthday" | "student" | "monthly" | "none";
  discountRate?: number;
  monthlyReward?: {
    id: string;
    name: string;
    status: string;
  } | null;
};

type HistoryItem = {
  id: string;
  customer_name: string;
  amount: number;
  points_earned: number;
  points_redeemed: number;
  discount_amount: number;
  branch: string;
  transaction_type: string;
  created_at: string;
};

const translations = {
  EN: {
    logout: "Logout",
    cashierPanel: "Cashier Panel",
    scannerTitle: "Customer QR Scanner",
    scannerDescription:
      "Scan the customer's digital loyalty card to view their account and bonus balance.",
    qrScanner: "QR Code Scanner",
    startCamera: "Start Camera Scanner",
    stopScanner: "Stop Scanner",
    checkingCustomer: "Checking customer...",
    customerFound: "CUSTOMER FOUND",
    memberLevel: "MEMBER LEVEL",
    bonusBalance: "BONUS BALANCE",
    accountIdentified: "Customer account successfully identified.",
    recordPurchase: "Record a Purchase",
    purchaseDescription:
      "Enter the purchase amount and the bonus points the customer wants to use.",
    purchaseAmount: "Purchase Amount (AZN)",
    useBonus: "Use Bonus Points",
    conversion: "100 points = 1 AZN discount",
    pointsToRedeem: "Points to Redeem",
    availablePoints: "Available points",
    branch: "Branch",
    summary: "Payment Summary",
    originalAmount: "Purchase Amount",
    percentageDiscount: "Percentage Discount",
    birthdayDiscount: "Birthday discount (15%)",
    studentDiscount: "Student discount (10%)",
    monthlyDiscount: "Monthly member discount (5%)",
    noPercentageDiscount: "No percentage discount",
    bonusUsed: "Bonus Used",
    pointsDiscount: "Bonus Points Discount",
    totalDiscount: "Total Discount",
    finalAmount: "Final Amount",
    confirmPurchase: "Confirm Purchase & Apply Discounts",
    processing: "Processing...",
    history: "Transaction History",
    latestTransactions: "Your latest 50 transactions",
    refresh: "Refresh",
    loadingTransactions: "Loading transactions...",
    noTransactions: "No transactions yet",
    noTransactionsDescription:
      "Completed customer purchases will appear here.",
    pointsEarned: "Points Earned",
    type: "Type",
    purchase: "Purchase",
    pointsRedeemed: "Points Redeemed",
    discount: "Discount",
    staffPanel: "STAFF PANEL",
    validAmount: "Please enter a valid purchase amount.",
    validPoints: "Points must be a non-negative multiple of 100.",
    notEnoughPoints: "The customer does not have enough bonus points.",
    discountTooHigh:
      "The bonus discount cannot exceed the remaining purchase amount.",
    scanFirst: "Please scan a customer QR code first.",
    signInAgain: "Please sign in again.",
    scanAgain:
      "This purchase was already recorded. Scan the QR again to refresh the balance.",
    purchaseSuccess: "Purchase successful!",
    redeemed: "points redeemed.",
    paid: "Amount paid:",
    earned: "new points earned.",
    birthdayAvailable: "Birthday discount is available.",
    studentAvailable: "Verified student discount is available.",
    monthlyAvailable: "Personal monthly 5% reward is available.",
    rewardAvailable: "Available monthly reward:",
    freeRewardNote:
      "This reward requires product selection and cannot be applied to an amount-only purchase.",
    noDiscount: "No percentage discount is currently available.",
    pointsMustBe100:
      "Points can only be redeemed in multiples of 100.",
    amountAfterDiscount: "Amount after percentage discount",
    language: "Language",
    cameraError: "Could not start camera.",
    qrError: "QR scan failed.",
    historyError: "Unable to load transaction history.",
    customerError: "Something went wrong.",
    discountApplied: "discount applied.",
    pointsUnit: "points",
    branchGenclik: "Gənclik",
    branch28May: "28 May",
  },

  AZ: {
    logout: "Çıxış",
    cashierPanel: "Kassir paneli",
    scannerTitle: "Müştəri QR skaneri",
    scannerDescription:
      "Müştərinin loyallıq kartını skan edərək hesabını və bonus balansını yoxlayın.",
    qrScanner: "QR kod skaneri",
    startCamera: "Kameranı başlat",
    stopScanner: "Skaneri dayandır",
    checkingCustomer: "Müştəri yoxlanılır...",
    customerFound: "MÜŞTƏRİ TAPILDI",
    memberLevel: "ÜZVLÜK SƏVİYYƏSİ",
    bonusBalance: "BONUS BALANSI",
    accountIdentified: "Müştəri hesabı uğurla müəyyən edildi.",
    recordPurchase: "Alışı qeyd et",
    purchaseDescription:
      "Alış məbləğini və müştərinin istifadə etmək istədiyi bonus xallarını daxil edin.",
    purchaseAmount: "Alış məbləği (AZN)",
    useBonus: "Bonus xallarından istifadə",
    conversion: "100 xal = 1 AZN endirim",
    pointsToRedeem: "İstifadə ediləcək xallar",
    availablePoints: "Mövcud xallar",
    branch: "Filial",
    summary: "Ödəniş xülasəsi",
    originalAmount: "Alış məbləği",
    percentageDiscount: "Faiz endirimi",
    birthdayDiscount: "Ad günü endirimi (15%)",
    studentDiscount: "Tələbə endirimi (10%)",
    monthlyDiscount: "Aylıq üzv endirimi (5%)",
    noPercentageDiscount: "Faiz endirimi yoxdur",
    bonusUsed: "İstifadə edilən bonus",
    pointsDiscount: "Bonus xal endirimi",
    totalDiscount: "Ümumi endirim",
    finalAmount: "Yekun məbləğ",
    confirmPurchase: "Alışı təsdiqlə və endirimləri tətbiq et",
    processing: "Emal edilir...",
    history: "Əməliyyat tarixçəsi",
    latestTransactions: "Son 50 əməliyyat",
    refresh: "Yenilə",
    loadingTransactions: "Əməliyyatlar yüklənir...",
    noTransactions: "Hələ əməliyyat yoxdur",
    noTransactionsDescription:
      "Tamamlanmış müştəri alışları burada görünəcək.",
    pointsEarned: "Qazanılan xallar",
    type: "Növ",
    purchase: "Alış",
    pointsRedeemed: "İstifadə edilən xallar",
    discount: "Endirim",
    staffPanel: "ƏMƏKDAŞ PANELİ",
    validAmount: "Düzgün alış məbləği daxil edin.",
    validPoints: "Xallar 100-ün müsbət və ya sıfır qatları olmalıdır.",
    notEnoughPoints: "Müştərinin kifayət qədər bonus xalı yoxdur.",
    discountTooHigh:
      "Bonus endirimi qalan alış məbləğindən çox ola bilməz.",
    scanFirst: "Əvvəlcə müştərinin QR kodunu skan edin.",
    signInAgain: "Yenidən daxil olun.",
    scanAgain:
      "Bu alış artıq qeydə alınıb. Balansı yeniləmək üçün QR kodu yenidən skan edin.",
    purchaseSuccess: "Alış uğurla qeydə alındı!",
    redeemed: "xal istifadə edildi.",
    paid: "Ödənilən məbləğ:",
    earned: "yeni xal qazanıldı.",
    birthdayAvailable: "Ad günü endirimi aktivdir.",
    studentAvailable: "Təsdiqlənmiş tələbə endirimi aktivdir.",
    monthlyAvailable: "Şəxsi aylıq 5% mükafat aktivdir.",
    rewardAvailable: "Mövcud aylıq mükafat:",
    freeRewardNote:
      "Bu mükafat məhsul seçimi tələb edir və yalnız məbləğ daxil edilən alışda tətbiq edilə bilməz.",
    noDiscount: "Hazırda faiz endirimi mövcud deyil.",
    pointsMustBe100: "Xallar yalnız 100-ün qatları ilə istifadə edilə bilər.",
    amountAfterDiscount: "Faiz endirimindən sonrakı məbləğ",
    language: "Dil",
    cameraError: "Kamera başlatmaq mümkün olmadı.",
    qrError: "QR kod skan edilə bilmədi.",
    historyError: "Əməliyyat tarixçəsini yükləmək mümkün olmadı.",
    customerError: "Xəta baş verdi.",
    discountApplied: "endirim tətbiq edildi.",
    pointsUnit: "xal",
    branchGenclik: "Gənclik",
    branch28May: "28 May",
  },
};

export default function CashierPage() {
  const router = useRouter();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);
  const purchaseKeyRef = useRef<string | null>(null);

  const [language, setLanguage] = useState<Language>("EN");
  const t = translations[language];

  const [scanning, setScanning] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cashierName, setCashierName] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [qrToken, setQrToken] = useState("");

  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [redeemPoints, setRedeemPoints] = useState("0");
  const [branch, setBranch] = useState("Gənclik");

  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState("");
  const [transactionSuccess, setTransactionSuccess] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Purchase calculations
  const amountValue = Number(purchaseAmount);
  const validAmountValue =
    Number.isFinite(amountValue) && amountValue > 0
      ? amountValue
      : 0;

  const redeemValue = Number(redeemPoints);
  const discountRate = customer?.discountRate ?? 0;

  const percentageDiscount =
    validAmountValue > 0
      ? Math.round(validAmountValue * discountRate * 100) / 100
      : 0;

  const amountAfterPercentage = Math.max(
    0,
    validAmountValue - percentageDiscount
  );

  const pointsDiscount =
    Number.isInteger(redeemValue) && redeemValue >= 0
      ? redeemValue / 100
      : 0;

  const calculatedTotalDiscount =
    percentageDiscount + pointsDiscount;

  const calculatedFinalAmount = Math.max(
    0,
    validAmountValue - calculatedTotalDiscount
  );

  const redemptionValid =
    Number.isInteger(redeemValue) &&
    redeemValue >= 0 &&
    redeemValue % 100 === 0 &&
    !!customer &&
    redeemValue <= customer.balance &&
    pointsDiscount <= amountAfterPercentage;

  const discountLabel =
    customer?.discountType === "birthday"
      ? t.birthdayDiscount
      : customer?.discountType === "student"
        ? t.studentDiscount
        : customer?.discountType === "monthly"
          ? t.monthlyDiscount
          : t.noPercentageDiscount;

  // Load transaction history
  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(t.signInAgain);
      }

      const response = await fetch("/api/cashier/history", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.historyError);
      }

      setHistory(result.history || []);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : t.historyError
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // Verify cashier account
  useEffect(() => {
    let mounted = true;

    async function verifyCashier() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/cashier/login");
          return;
        }

        const response = await fetch("/api/cashier/session", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.authorized) {
          await supabase.auth.signOut();
          router.replace("/cashier/login");
          return;
        }

        if (mounted) {
          setCashierName(result.cashier.fullName);
          await loadHistory();
        }
      } catch {
        router.replace("/cashier/login");
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    verifyCashier();

    return () => {
      mounted = false;
    };
  }, [router]);

  // Find customer using QR code
  async function scanCustomer(token: string) {
    if (scanningRef.current) return;

    scanningRef.current = true;
    setLoading(true);
    setError("");
    setCustomer(null);
    setQrToken("");
    setTransactionMessage("");
    setTransactionSuccess(false);
    setPurchaseAmount("");
    setRedeemPoints("0");
    purchaseKeyRef.current = null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(t.signInAgain);
      }

      const response = await fetch("/api/cashier/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ qrToken: token }),
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.qrError);
      }

      setCustomer(result.customer);
      setQrToken(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.customerError
      );
    } finally {
      setLoading(false);
      scanningRef.current = false;
    }
  }

  // Record purchase and redeem bonus points
  async function handlePurchase() {
    if (!customer || !qrToken) {
      setTransactionMessage(t.scanFirst);
      setTransactionSuccess(false);
      return;
    }

    const amount = Number(purchaseAmount);
    const pointsToRedeem = Number(redeemPoints);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 10000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      setTransactionMessage(t.validAmount);
      setTransactionSuccess(false);
      return;
    }

    if (
      !Number.isInteger(pointsToRedeem) ||
      pointsToRedeem < 0 ||
      pointsToRedeem % 100 !== 0
    ) {
      setTransactionMessage(t.validPoints);
      setTransactionSuccess(false);
      return;
    }

    if (pointsToRedeem > customer.balance) {
      setTransactionMessage(t.notEnoughPoints);
      setTransactionSuccess(false);
      return;
    }

    const percentDiscount =
      Math.round(amount * (customer.discountRate ?? 0) * 100) / 100;

    const pointsDiscount = pointsToRedeem / 100;

    if (pointsDiscount > amount - percentDiscount) {
      setTransactionMessage(t.discountTooHigh);
      setTransactionSuccess(false);
      return;
    }

    setTransactionLoading(true);
    setTransactionMessage("");
    setTransactionSuccess(false);

    if (!purchaseKeyRef.current) {
      purchaseKeyRef.current = crypto.randomUUID();
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(t.signInAgain);
      }

      const response = await fetch("/api/cashier/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          qrToken,
          amount,
          branch,
          idempotencyKey: purchaseKeyRef.current,
          pointsToRedeem,
        }),
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Purchase failed.");
      }

      if (result.duplicate) {
        purchaseKeyRef.current = null;

        setTransactionMessage(t.scanAgain);
        setTransactionSuccess(false);
        await loadHistory();
        return;
      }

      const actualPointsRedeemed = Number(
        result.pointsRedeemed ?? pointsToRedeem
      );

      const actualPointsEarned = Number(result.pointsEarned ?? 0);

      const newBalance =
        typeof result.balanceAfter === "number"
          ? result.balanceAfter
          : customer.balance -
            actualPointsRedeemed +
            actualPointsEarned;

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              balance: newBalance,
              discountValue: (newBalance / 100).toFixed(2),
              monthlyReward: result.monthlyRewardUsed
                ? null
                : previous.monthlyReward,
              discountType:
                result.discountType === "monthly"
                  ? "none"
                  : previous.discountType,
              discountRate:
                result.discountType === "monthly"
                  ? 0
                  : previous.discountRate,
            }
          : previous
      );

      const actualDiscount = Number(
        result.discountAmount ?? calculatedTotalDiscount
      );

      const finalAmount = Number(
        result.netAmount ?? amount - actualDiscount
      );

      purchaseKeyRef.current = null;

      setPurchaseAmount("");
      setRedeemPoints("0");

      setTransactionMessage(
        `${t.purchaseSuccess} ${actualPointsRedeemed} ${t.redeemed} ${actualDiscount.toFixed(
          2
        )} AZN ${t.discountApplied} ${t.paid} ${finalAmount.toFixed(
          2
        )} AZN. ${actualPointsEarned} ${t.earned}`
      );

      setTransactionSuccess(true);

      await loadHistory();
    } catch (err) {
      setTransactionMessage(
        err instanceof Error ? err.message : t.customerError
      );
      setTransactionSuccess(false);
    } finally {
      setTransactionLoading(false);
    }
  }

  // Start camera
  async function startScanner() {
    try {
      setError("");
      setCustomer(null);
      setQrToken("");
      setTransactionMessage("");
      setTransactionSuccess(false);
      setPurchaseAmount("");
      setRedeemPoints("0");
      purchaseKeyRef.current = null;

      const scanner = new Html5Qrcode("cashier-qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 230, height: 230 },
        },
        async (decodedText) => {
          if (scanningRef.current) return;

          setScanning(false);

          try {
            await scanner.stop();
          } catch {}

          await scanCustomer(decodedText);
        },
        () => {}
      );

      setScanning(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t.cameraError
      );
    }
  }

  // Stop camera
  async function stopScanner() {
    const scanner = scannerRef.current;

    if (scanner) {
      try {
        await scanner.stop();
      } catch {}

      scannerRef.current = null;
    }

    setScanning(false);
  }

  // Logout
  async function logout() {
    await stopScanner();
    await supabase.auth.signOut();
    router.replace("/cashier/login");
  }

  // Clean up camera
  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FCFAF6] text-[#76563F]">
        <Loader2 className="animate-spin" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF6] px-5 py-8 pb-28 text-[#49372C]">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <header className="mb-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#A08065] p-3 text-white">
              <Coffee size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                ZEBRA COFFEE
              </h1>

              <p className="text-base text-[#987b65]">
                {t.cashierPanel} · {cashierName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLanguage((previous) =>
                  previous === "EN" ? "AZ" : "EN"
                )
              }
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-3 text-sm font-bold text-[#795b45] shadow-sm transition hover:bg-[#F0E6DA]"
              title={t.language}
            >
              <Languages size={17} />
              {language}
            </button>

            <button
              onClick={logout}
              className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-bold text-[#795b45] shadow-sm transition hover:bg-[#F0E6DA]"
            >
              <LogOut size={16} />
              {t.logout}
            </button>
          </div>
        </header>

        {/* QR INTRO */}

        <section className="mb-8 rounded-[2rem] bg-gradient-to-r from-[#A08065] to-[#C5A889] p-8 text-white shadow-lg">
          <ScanLine size={35} />

          <h2 className="mt-5 text-3xl font-black">
            {t.scannerTitle}
          </h2>

          <p className="mt-3 text-base leading-7 text-white/90">
            {t.scannerDescription}
          </p>
        </section>

        {/* QR SCANNER */}

        <section className="mb-8 rounded-[2rem] border border-[#EDE3D8] bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Camera className="text-[#A08065]" size={24} />

            <h3 className="text-xl font-black">
              {t.qrScanner}
            </h3>
          </div>

          <div
            id="cashier-qr-reader"
            className="overflow-hidden rounded-2xl"
          />

          {!scanning && (
            <button
              onClick={startScanner}
              disabled={loading}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#A08065] px-6 py-4 text-base font-bold text-white transition hover:bg-[#80624D] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={20} />
              {t.startCamera}
            </button>
          )}

          {scanning && (
            <button
              onClick={stopScanner}
              className="mt-5 w-full cursor-pointer rounded-2xl border border-red-200 bg-red-50 px-6 py-4 font-bold text-red-700"
            >
              {t.stopScanner}
            </button>
          )}

          {loading && (
            <div className="mt-5 flex items-center justify-center gap-3 text-[#80624D]">
              <Loader2 className="animate-spin" />
              {t.checkingCustomer}
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-base text-red-700">
              {error}
            </p>
          )}
        </section>

        {/* CUSTOMER AND PURCHASE */}

        {customer && (
          <section className="mb-8 rounded-[2rem] border border-[#E9D9C5] bg-white p-7 shadow-sm">

            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-[#A08065]" size={27} />

              <div>
                <p className="text-sm font-bold text-[#987b65]">
                  {t.customerFound}
                </p>

                <h3 className="text-2xl font-black">
                  {customer.fullName}
                </h3>
              </div>
            </div>

            {/* CUSTOMER INFO */}

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#FBF8F3] p-5">
                <Star className="mb-3 text-[#A08065]" />

                <p className="text-sm text-[#806F62]">
                  {t.memberLevel}
                </p>

                <p className="mt-2 text-xl font-black">
                  {customer.level}
                </p>
              </div>

              <div className="rounded-2xl bg-[#FBF8F3] p-5">
                <Wallet className="mb-3 text-[#A08065]" />

                <p className="text-sm text-[#806F62]">
                  {t.bonusBalance}
                </p>

                <p className="mt-2 text-2xl font-black">
                  {customer.balance} {t.pointsUnit}
                </p>

                <p className="mt-1 text-base text-[#806F62]">
                  {customer.discountValue} AZN
                </p>
              </div>

            </div>

            <p className="mt-5 rounded-xl bg-green-50 p-4 text-base text-green-800">
              {t.accountIdentified}
            </p>

            {/* CUSTOMER DISCOUNTS */}

            <div className="mt-5 rounded-2xl border border-[#E9D9C5] bg-[#FCFAF6] p-5">
              <div className="mb-3 flex items-center gap-2">
                <BadgePercent className="text-[#A08065]" size={23} />

                <h4 className="text-lg font-black">
                  {t.percentageDiscount}
                </h4>
              </div>

              {customer.discountType === "birthday" && (
                <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">
                  {t.birthdayAvailable}
                </p>
              )}

              {customer.discountType === "student" && (
                <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">
                  {t.studentAvailable}
                </p>
              )}

              {customer.discountType === "monthly" && (
                <p className="rounded-xl bg-green-50 p-3 text-sm font-bold text-green-800">
                  {t.monthlyAvailable}
                </p>
              )}

              {(!customer.discountType ||
                customer.discountType === "none") && (
                <p className="rounded-xl bg-[#F0E6DA] p-3 text-sm text-[#795b45]">
                  {t.noDiscount}
                </p>
              )}

              {customer.monthlyReward && (
                <div className="mt-3 rounded-xl bg-white p-3">
                  <p className="text-sm font-bold text-[#795b45]">
                    {t.rewardAvailable}
                  </p>

                  <p className="mt-1 font-black">
                    {customer.monthlyReward.name}
                  </p>

                  {customer.monthlyReward.name !==
                    "5% monthly member discount" && (
                    <p className="mt-2 text-xs leading-5 text-[#806F62]">
                      {t.freeRewardNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* PURCHASE FORM */}

            <div className="mt-7 border-t border-[#EDE3D8] pt-7">

              <h3 className="text-2xl font-black">
                {t.recordPurchase}
              </h3>

              <p className="mt-2 text-base text-[#806F62]">
                {t.purchaseDescription}
              </p>

              {/* PURCHASE AMOUNT */}

              <label className="mt-6 block text-base font-bold">
                {t.purchaseAmount}
              </label>

              <input
                type="number"
                min="0.01"
                max="10000"
                step="0.01"
                value={purchaseAmount}
                onChange={(e) => {
                  setPurchaseAmount(e.target.value);
                  purchaseKeyRef.current = null;
                }}
                placeholder="20.00"
                disabled={transactionLoading}
                className="mt-2 w-full rounded-2xl border border-[#EDE3D8] bg-[#FBF8F3] px-5 py-4 text-lg outline-none focus:border-[#A08065]"
              />

              {/* BONUS REDEMPTION */}

              <div className="mt-7 rounded-2xl border border-[#E9D9C5] bg-[#FCFAF6] p-5">

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#F0E6DA] p-3">
                    <Gift className="text-[#A08065]" size={24} />
                  </div>

                  <div>
                    <h4 className="text-lg font-black">
                      {t.useBonus}
                    </h4>

                    <p className="text-sm text-[#806F62]">
                      {t.conversion}
                    </p>
                  </div>
                </div>

                <label className="mt-5 block text-base font-bold">
                  {t.pointsToRedeem}
                </label>

                <input
                  type="number"
                  min="0"
                  max={customer.balance}
                  step="100"
                  value={redeemPoints}
                  onChange={(e) => {
                    setRedeemPoints(e.target.value);
                    purchaseKeyRef.current = null;
                  }}
                  disabled={transactionLoading}
                  placeholder="0"
                  className="mt-2 w-full rounded-2xl border border-[#EDE3D8] bg-white px-5 py-4 text-lg outline-none focus:border-[#A08065]"
                />

                <div className="mt-3 flex items-center justify-between text-base">
                  <span className="text-[#806F62]">
                    {t.availablePoints}
                  </span>

                  <strong className="text-[#76563F]">
                    {customer.balance} {t.pointsUnit}
                  </strong>
                </div>

                {redeemPoints !== "" &&
                  (!Number.isInteger(redeemValue) ||
                    redeemValue < 0 ||
                    redeemValue % 100 !== 0) && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      {t.pointsMustBe100}
                    </p>
                  )}

                {redeemValue > customer.balance && (
                  <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {t.notEnoughPoints}
                  </p>
                )}

                {Number.isInteger(redeemValue) &&
                  redeemValue >= 0 &&
                  pointsDiscount > amountAfterPercentage &&
                  purchaseAmount !== "" && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                      {t.discountTooHigh}
                    </p>
                  )}

              </div>

              {/* BRANCH */}

              <label className="mt-6 block text-base font-bold">
                {t.branch}
              </label>

              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={transactionLoading}
                className="mt-2 w-full cursor-pointer rounded-2xl border border-[#EDE3D8] bg-[#FBF8F3] px-5 py-4 text-base outline-none focus:border-[#A08065]"
              >
                <option value="Gənclik">
                  {t.branchGenclik}
                </option>

                <option value="28 May">
                  {t.branch28May}
                </option>
              </select>

              {/* PAYMENT SUMMARY */}

              <div className="mt-7 rounded-2xl bg-[#F6EFE6] p-5">

                <div className="mb-4 flex items-center gap-3">
                  <BadgePercent className="text-[#A08065]" size={24} />

                  <h4 className="text-lg font-black">
                    {t.summary}
                  </h4>
                </div>

                <div className="space-y-3 text-base">

                  <div className="flex justify-between gap-3">
                    <span className="text-[#795b45]">
                      {t.originalAmount}
                    </span>

                    <strong>
                      {validAmountValue.toFixed(2)} AZN
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#795b45]">
                      {discountLabel}
                    </span>

                    <strong className="text-green-700">
                      -{percentageDiscount.toFixed(2)} AZN
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#795b45]">
                      {t.amountAfterDiscount}
                    </span>

                    <strong>
                      {amountAfterPercentage.toFixed(2)} AZN
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#795b45]">
                      {t.bonusUsed}
                    </span>

                    <strong>
                      {redemptionValid ? redeemValue : 0}{" "}
                      {t.pointsUnit}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-[#795b45]">
                      {t.pointsDiscount}
                    </span>

                    <strong className="text-green-700">
                      -
                      {redemptionValid
                        ? pointsDiscount.toFixed(2)
                        : "0.00"}{" "}
                      AZN
                    </strong>
                  </div>

                  <div className="flex justify-between gap-3 border-t border-[#E9D9C5] pt-3">
                    <span className="font-bold text-[#795b45]">
                      {t.totalDiscount}
                    </span>

                    <strong className="text-green-700">
                      -
                      {redemptionValid
                        ? calculatedTotalDiscount.toFixed(2)
                        : percentageDiscount.toFixed(2)}{" "}
                      AZN
                    </strong>
                  </div>

                  <div className="border-t border-[#E9D9C5] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-black">
                        {t.finalAmount}
                      </span>

                      <strong className="text-2xl font-black text-[#76563F]">
                        {redemptionValid && validAmountValue > 0
                          ? calculatedFinalAmount.toFixed(2)
                          : amountAfterPercentage.toFixed(2)}{" "}
                        AZN
                      </strong>
                    </div>
                  </div>

                </div>
              </div>

              {/* CONFIRM */}

              <button
                onClick={handlePurchase}
                disabled={
                  transactionLoading ||
                  !purchaseAmount ||
                  !Number.isFinite(amountValue) ||
                  amountValue <= 0 ||
                  !redemptionValid
                }
                className="mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#A08065] px-6 py-4 text-base font-bold text-white transition hover:bg-[#80624D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transactionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {t.processing}
                  </>
                ) : (
                  t.confirmPurchase
                )}
              </button>

              {transactionMessage && (
                <p
                  className={`mt-5 rounded-xl p-4 text-base font-medium ${
                    transactionSuccess
                      ? "bg-green-50 text-green-800"
                      : "bg-[#FBF8F3] text-[#795b45]"
                  }`}
                >
                  {transactionMessage}
                </p>
              )}

            </div>
          </section>
        )}

        {/* TRANSACTION HISTORY */}

        <section className="mb-8 rounded-[2rem] border border-[#EDE3D8] bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#FBF8F3] p-3">
                <History className="text-[#A08065]" size={24} />
              </div>

              <div>
                <h3 className="text-xl font-black">
                  {t.history}
                </h3>

                <p className="text-sm text-[#806F62]">
                  {t.latestTransactions}
                </p>
              </div>
            </div>

            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#FBF8F3] px-4 py-3 text-sm font-bold text-[#795b45] transition hover:bg-[#F0E6DA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {historyLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
              {t.refresh}
            </button>

          </div>

          {historyLoading && history.length === 0 && (
            <div className="flex items-center justify-center gap-3 py-10 text-[#795b45]">
              <Loader2 className="animate-spin" />
              {t.loadingTransactions}
            </div>
          )}

          {historyError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {historyError}
            </div>
          )}

          {!historyLoading && !historyError && history.length === 0 && (
            <div className="rounded-2xl bg-[#FBF8F3] px-5 py-10 text-center">
              <Receipt className="mx-auto mb-3 text-[#A08065]" size={35} />

              <p className="font-bold">
                {t.noTransactions}
              </p>

              <p className="mt-2 text-sm text-[#806F62]">
                {t.noTransactionsDescription}
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-4">

              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#EDE3D8] bg-[#FBF8F3] p-5"
                >

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div>
                      <p className="font-black">
                        {item.customer_name}
                      </p>

                      <p className="mt-1 text-sm text-[#806F62]">
                        {new Date(item.created_at).toLocaleString(
                          language === "AZ" ? "az-AZ" : "en-GB",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#795b45]">
                      {item.branch}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    <div>
                      <p className="text-sm text-[#806F62]">
                        {t.originalAmount}
                      </p>

                      <p className="mt-1 font-black">
                        {Number(item.amount).toFixed(2)} AZN
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#806F62]">
                        {t.pointsEarned}
                      </p>

                      <p className="mt-1 font-black text-green-700">
                        +{item.points_earned}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-[#806F62]">
                        {t.type}
                      </p>

                      <p className="mt-1 font-bold">
                        {item.transaction_type === "purchase"
                          ? t.purchase
                          : item.transaction_type}
                      </p>
                    </div>

                  </div>

                  {(item.points_redeemed > 0 ||
                    Number(item.discount_amount) > 0) && (
                    <div className="mt-4 rounded-xl bg-[#F0E6DA] p-3">

                      {item.points_redeemed > 0 && (
                        <p className="text-sm font-bold text-[#795b45]">
                          {t.pointsRedeemed}: {item.points_redeemed}
                        </p>
                      )}

                      <p className="mt-1 text-sm text-green-700">
                        {t.discount}:{" "}
                        {Number(item.discount_amount).toFixed(2)} AZN
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#76563F]">
                        {t.finalAmount}:{" "}
                        {(
                          Number(item.amount) -
                          Number(item.discount_amount)
                        ).toFixed(2)}{" "}
                        AZN
                      </p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

        <p className="mt-8 text-center text-sm text-[#806F62]">
          ZEBRA COFFEE · {t.staffPanel}
        </p>

      </div>
    </main>
  );
}