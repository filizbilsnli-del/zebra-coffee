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
} from "lucide-react";
import { useRouter } from "next/navigation";

type Customer = {
  fullName: string;
  level: string;
  balance: number;
  discountValue: string;
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

export default function CashierPage() {
  const router = useRouter();

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanningRef = useRef(false);
  const purchaseKeyRef = useRef<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [cashierName, setCashierName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [qrToken, setQrToken] = useState("");

  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [branch, setBranch] = useState("GÉ™nclik");
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState("");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  // Kassirin É™mÉ™liyyat tarixÃ§É™sini yÃ¼klÉ™yir
  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in again.");
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
        throw new Error(result.error || "Could not load history.");
      }

      setHistory(result.history || []);
    } catch (err) {
      setHistoryError(
        err instanceof Error
          ? err.message
          : "Unable to load transaction history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  // Kassirin giriÅŸini yoxlayÄ±r
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

  // QR vasitÉ™silÉ™ mÃ¼ÅŸtÉ™rini tapÄ±r
  async function scanCustomer(token: string) {
    if (scanningRef.current) return;

    scanningRef.current = true;
    setLoading(true);
    setError("");
    setCustomer(null);
    setQrToken("");
    setTransactionMessage("");
    setPurchaseAmount("");
    purchaseKeyRef.current = null;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in first.");
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
        throw new Error(result.error || "QR scan failed.");
      }

      setCustomer(result.customer);
      setQrToken(token);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
      scanningRef.current = false;
    }
  }

  // MÃ¼ÅŸtÉ™rinin alÄ±ÅŸÄ±nÄ± qeyd edir
  async function handlePurchase() {
    if (!customer || !qrToken) {
      setTransactionMessage("Please scan a customer QR code first.");
      return;
    }

    const amount = Number(purchaseAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 10000 ||
      Math.round(amount * 100) !== amount * 100
    ) {
      setTransactionMessage("Please enter a valid purchase amount.");
      return;
    }

    setTransactionLoading(true);
    setTransactionMessage("");

    if (!purchaseKeyRef.current) {
      purchaseKeyRef.current = crypto.randomUUID();
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Please sign in again.");
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
        }),
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Purchase failed.");
      }

      if (result.duplicate) {
        purchaseKeyRef.current = null;

        setTransactionMessage(
          "This purchase was already recorded. Scan the QR again to refresh the balance."
        );

        await loadHistory();
        return;
      }

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              balance: previous.balance + result.pointsEarned,
              discountValue: (
                (previous.balance + result.pointsEarned) / 100
              ).toFixed(2),
            }
          : previous
      );

      purchaseKeyRef.current = null;
      setPurchaseAmount("");

      setTransactionMessage(
        `Purchase recorded successfully! ${result.pointsEarned} points earned.`
      );

      // AlÄ±ÅŸdan sonra tarixÃ§É™ni yenilÉ™yir
      await loadHistory();
    } catch (err) {
      setTransactionMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setTransactionLoading(false);
    }
  }

  // KameranÄ± baÅŸladÄ±r
  async function startScanner() {
    try {
      setError("");
      setCustomer(null);
      setQrToken("");
      setTransactionMessage("");
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
        err instanceof Error ? err.message : "Could not start camera."
      );
    }
  }

  // KameranÄ± dayandÄ±rÄ±r
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

  // Kassir hesabÄ±ndan Ã§Ä±xÄ±ÅŸ
  async function logout() {
    await stopScanner();
    await supabase.auth.signOut();
    router.replace("/cashier/login");
  }

  // SÉ™hifÉ™dÉ™n Ã§Ä±xanda kameranÄ± baÄŸlayÄ±r
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
      <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] text-[#553b2c]">
        <Loader2 className="animate-spin" size={32} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] px-5 py-8 text-[#38271f]">
      <div className="mx-auto max-w-3xl">

        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[#553b2c] p-3 text-white">
              <Coffee size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-black">
                ZEBRA COFFEE
              </h1>

              <p className="text-xs text-[#987b65]">
                Cashier Panel Â· {cashierName}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#795b45] shadow-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <section className="mb-8 rounded-[2rem] bg-gradient-to-r from-[#553b2c] to-[#987253] p-8 text-white shadow-lg">
          <ScanLine size={35} />

          <h2 className="mt-5 text-3xl font-black">
            Customer QR Scanner
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/80">
            Scan the customer's digital loyalty card
            to view their account and bonus balance.
          </p>
        </section>

        <section className="mb-8 rounded-[2rem] border border-[#eadfd1] bg-white p-6 shadow-sm">

          <div className="mb-5 flex items-center gap-3">
            <Camera className="text-[#987253]" size={24} />

            <h3 className="text-xl font-black">
              QR Code Scanner
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
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#553b2c] px-6 py-4 font-bold text-white transition hover:bg-[#795b45] disabled:opacity-50"
            >
              <Camera size={20} />
              Start Camera Scanner
            </button>
          )}

          {scanning && (
            <button
              onClick={stopScanner}
              className="mt-5 w-full rounded-2xl border border-red-200 bg-red-50 px-6 py-4 font-bold text-red-700"
            >
              Stop Scanner
            </button>
          )}

          {loading && (
            <div className="mt-5 flex items-center justify-center gap-3 text-[#795b45]">
              <Loader2 className="animate-spin" />
              Checking customer...
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>
          )}

        </section>

        {customer && (
          <section className="mb-8 rounded-[2rem] border border-[#e8c9a6] bg-white p-7 shadow-sm">

            <div className="mb-6 flex items-center gap-3">
              <UserRound className="text-[#987253]" size={27} />

              <div>
                <p className="text-xs font-bold text-[#987b65]">
                  CUSTOMER FOUND
                </p>

                <h3 className="text-2xl font-black">
                  {customer.fullName}
                </h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#faf7f1] p-5">
                <Star className="mb-3 text-[#987253]" />

                <p className="text-xs text-[#987b65]">
                  MEMBER LEVEL
                </p>

                <p className="mt-2 font-black">
                  {customer.level}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf7f1] p-5">
                <Wallet className="mb-3 text-[#987253]" />

                <p className="text-xs text-[#987b65]">
                  BONUS BALANCE
                </p>

                <p className="mt-2 text-2xl font-black">
                  {customer.balance} points
                </p>

                <p className="mt-1 text-xs text-[#987b65]">
                  {customer.discountValue} AZN
                </p>
              </div>

            </div>

            <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">
              Customer account successfully identified.
            </p>

            <div className="mt-7 border-t border-[#eadfd1] pt-7">

              <h3 className="text-xl font-black">
                Record a Purchase
              </h3>

              <p className="mt-2 text-sm text-[#987b65]">
                Enter the customer's purchase amount to calculate loyalty points.
              </p>

              <label className="mt-5 block text-sm font-bold">
                Purchase Amount (AZN)
              </label>

              <input
                type="number"
                min="0.01"
                max="10000"
                step="0.01"
                value={purchaseAmount}
                onChange={(e) => setPurchaseAmount(e.target.value)}
                placeholder="Example: 15.50"
                disabled={transactionLoading}
                className="mt-2 w-full rounded-2xl border border-[#eadfd1] bg-[#faf7f1] px-5 py-4 outline-none focus:border-[#987253]"
              />

              <label className="mt-5 block text-sm font-bold">
                Branch
              </label>

              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                disabled={transactionLoading}
                className="mt-2 w-full rounded-2xl border border-[#eadfd1] bg-[#faf7f1] px-5 py-4 outline-none focus:border-[#987253]"
              >
                <option value="GÉ™nclik">GÉ™nclik</option>
                <option value="28 May">28 May</option>
              </select>

              <button
                onClick={handlePurchase}
                disabled={
                  transactionLoading ||
                  !purchaseAmount ||
                  Number(purchaseAmount) <= 0
                }
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#553b2c] px-6 py-4 font-bold text-white transition hover:bg-[#795b45] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {transactionLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  "Confirm Purchase & Earn Points"
                )}
              </button>

              {transactionMessage && (
                <p className="mt-5 rounded-xl bg-[#faf7f1] p-4 text-sm font-medium text-[#795b45]">
                  {transactionMessage}
                </p>
              )}

            </div>
          </section>
        )}

        {/* TRANSACTION HISTORY */}

        <section className="mb-8 rounded-[2rem] border border-[#eadfd1] bg-white p-6 shadow-sm">

          <div className="mb-6 flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#faf7f1] p-3">
                <History className="text-[#987253]" size={24} />
              </div>

              <div>
                <h3 className="text-xl font-black">
                  Transaction History
                </h3>

                <p className="text-xs text-[#987b65]">
                  Your latest 50 transactions
                </p>
              </div>
            </div>

            <button
              onClick={loadHistory}
              disabled={historyLoading}
              className="flex items-center gap-2 rounded-xl bg-[#faf7f1] px-4 py-3 text-sm font-bold text-[#795b45] transition hover:bg-[#f0e6da] disabled:opacity-50"
            >
              {historyLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <RefreshCw size={17} />
              )}
              Refresh
            </button>

          </div>

          {historyLoading && history.length === 0 && (
            <div className="flex items-center justify-center gap-3 py-10 text-[#795b45]">
              <Loader2 className="animate-spin" />
              Loading transactions...
            </div>
          )}

          {historyError && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {historyError}
            </div>
          )}

          {!historyLoading && !historyError && history.length === 0 && (
            <div className="rounded-2xl bg-[#faf7f1] px-5 py-10 text-center">
              <Receipt className="mx-auto mb-3 text-[#987253]" size={35} />

              <p className="font-bold">
                No transactions yet
              </p>

              <p className="mt-2 text-sm text-[#987b65]">
                Completed customer purchases will appear here.
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-4">

              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#eadfd1] bg-[#faf7f1] p-5"
                >

                  <div className="flex flex-wrap items-start justify-between gap-3">

                    <div>
                      <p className="font-black">
                        {item.customer_name}
                      </p>

                      <p className="mt-1 text-xs text-[#987b65]">
                        {new Date(item.created_at).toLocaleString("az-AZ", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-[#795b45]">
                      {item.branch}
                    </span>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    <div>
                      <p className="text-xs text-[#987b65]">
                        Purchase Amount
                      </p>

                      <p className="mt-1 font-black">
                        {Number(item.amount).toFixed(2)} AZN
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#987b65]">
                        Points Earned
                      </p>

                      <p className="mt-1 font-black text-green-700">
                        +{item.points_earned}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#987b65]">
                        Type
                      </p>

                      <p className="mt-1 font-bold">
                        {item.transaction_type === "purchase"
                          ? "Purchase"
                          : item.transaction_type}
                      </p>
                    </div>

                  </div>

                  {item.points_redeemed > 0 && (
                    <p className="mt-3 text-xs text-[#987b65]">
                      Points redeemed: {item.points_redeemed}
                    </p>
                  )}

                  {Number(item.discount_amount) > 0 && (
                    <p className="mt-1 text-xs text-[#987b65]">
                      Discount: {Number(item.discount_amount).toFixed(2)} AZN
                    </p>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

        <p className="mt-8 text-center text-xs text-[#987b65]">
          ZEBRA COFFEE Â· STAFF PANEL
        </p>

      </div>
    </main>
  );
}
