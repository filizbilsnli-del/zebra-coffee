"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Gift,
  ArrowLeft,
  Star,
  History,
  LogOut,
  Loader2,
  GraduationCap,
  CalendarDays,
  UserRound,
  Wallet,
  Pencil,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import OrderHistory from "@/components/OrderHistory";

type Transaction = {
  id: number;
  points: number;
  transaction_type: "earned" | "redeemed";
  description: string | null;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  birth_date: string | null;
  student_status: "not_student" | "pending" | "verified" | "rejected";
};

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = (en: string, az: string) => (isAZ ? az : en);

  const earned = transactions
    .filter((item) => item.transaction_type === "earned")
    .reduce((sum, item) => sum + item.points, 0);

  const redeemed = transactions
  .filter((item) => item.transaction_type === "redeemed")
  .reduce((sum, item) => sum + Math.abs(item.points), 0);
  const balance = earned - redeemed;
  const moneyValue = (balance / 100).toFixed(2);

  const today = new Date();
  const birthDate = profile?.birth_date;

  const isBirthdayToday =
    !!birthDate &&
    birthDate.slice(5, 10) ===
      `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
      ).padStart(2, "0")}`;

  useEffect(() => {
    async function loadLoyalty() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        setUserEmail(user.email ?? "");

        const [profileResult, transactionResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("full_name, birth_date, student_status")
            .eq("id", user.id)
            .maybeSingle(),

          supabase
            .from("loyalty_transactions")
            .select(
              "id, points, transaction_type, description, created_at"
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

        if (profileResult.error) {
          throw profileResult.error;
        }

        if (transactionResult.error) {
          throw transactionResult.error;
        }

        setProfile(profileResult.data as Profile | null);
        setTransactions(transactionResult.data ?? []);
      } catch {
        setError(
          t(
            "Could not load your rewards. Please try again.",
            "Bonus məlumatlarını yükləmək mümkün olmadı. Yenidən yoxla."
          )
        );
      } finally {
        setLoading(false);
      }
    }

    loadLoyalty();
  }, [router, isAZ]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function studentStatusText() {
    switch (profile?.student_status) {
      case "verified":
        return t("Verified — 10% discount", "Təsdiqlənib — 10% endirim");
      case "pending":
        return t("Pending verification", "Yoxlanılır");
      case "rejected":
        return t("Application rejected", "Müraciət təsdiqlənməyib");
      default:
        return t("Not registered as a student", "Tələbə kimi qeydiyyat yoxdur");
    }
  }

  return (
    <main className="min-h-screen bg-[#faf7f1] px-5 py-8 pb-28 text-[#38271f]">
      <div className="mx-auto max-w-5xl">

        <header className="mb-10 flex items-center justify-between">
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
            <Gift size={30} />
          </div>

          <p className="mb-3 text-xs font-black tracking-[0.35em] text-[#a17a59]">
            ZEBRA REWARDS
          </p>

          <h1 className="text-4xl font-black sm:text-5xl">
            {t("Your rewards", "Sənin bonusların")}
          </h1>

          <p className="mt-4 text-sm text-[#987b65]">
            {t(
              "Every coffee brings you closer to a reward.",
              "Hər qəhvə səni yeni mükafata yaxınlaşdırır."
            )}
          </p>
        </section>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#795b45]" size={35} />
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            {/* PROFILE */}
            <section className="mb-8 rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm">

              <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserRound size={23} className="text-[#987253]" />
                  <h2 className="text-xl font-black">
                    {t("My profile", "Profilim")}
                  </h2>
                </div>

                <Link
                  href="/profile"
                  className="flex shrink-0 items-center gap-2 rounded-full bg-[#f5efe7] px-4 py-2 text-xs font-bold text-[#795b45] transition hover:bg-[#eadfd1]"
                >
                  <Pencil size={14} />
                  {t("Edit profile", "Redaktə et")}
                </Link>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-[#987b65]">
                    {t("Full name", "Ad və soyad")}
                  </p>
                  <p className="mt-1 font-bold">
                    {profile?.full_name || t("Not provided", "Qeyd edilməyib")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#987b65]">Email</p>
                  <p className="mt-1 font-bold">{userEmail}</p>
                </div>

                <div>
                  <p className="text-xs text-[#987b65]">
                    {t("Date of birth", "Doğum tarixi")}
                  </p>
                  <p className="mt-1 flex items-center gap-2 font-bold">
                    <CalendarDays size={17} />
                    {profile?.birth_date || t("Not provided", "Qeyd edilməyib")}
                  </p>
                </div>
              </div>
            </section>
<OrderHistory />

            {/* POINTS BALANCE */}
            <section className="rounded-[2rem] bg-[#553b2c] p-8 text-white shadow-xl sm:p-12">
              <div className="flex items-center gap-3 text-[#e8c9a6]">
                <Star size={22} />
                <span className="text-sm font-bold tracking-widest">
                  {t("YOUR POINTS BALANCE", "BONUS BALANSIN")}
                </span>
              </div>

              <div className="mt-6 flex items-end gap-3">
                <span className="text-6xl font-black">{balance}</span>
                <span className="pb-2 text-lg text-[#e8c9a6]">
                  {t("points", "bal")}
                </span>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[#e8d8c7]">
                <Wallet size={20} />
                <p className="text-sm">
                  {t("Available value:", "Bonusların dəyəri:")}{" "}
                  <strong>{moneyValue} AZN</strong>
                </p>
              </div>

              <p className="mt-3 text-xs text-[#e8c9a6]">
                {t(
                  "100 points = 1 AZN discount.",
                  "100 bal = 1 AZN endirim."
                )}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                <div>
                  <p className="text-xs text-[#e8c9a6]">
                    {t("Total earned", "Qazanılan")}
                  </p>
                  <p className="mt-2 text-2xl font-bold">+{earned}</p>
                </div>

                <div>
                  <p className="text-xs text-[#e8c9a6]">
                    {t("Total redeemed", "İstifadə edilən")}
                  </p>
                  <p className="mt-2 text-2xl font-bold">-{redeemed}</p>
                </div>
              </div>
            </section>

            {/* DISCOUNTS */}
            <section className="mt-10">
              <h2 className="mb-6 text-2xl font-black">
                {t("Your discounts", "Sənin endirimlərin")}
              </h2>

              <div className="grid gap-5 sm:grid-cols-2">

                {/* BIRTHDAY */}
                <div className="rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f8e8e1] text-[#a15b42]">
                    <Gift size={25} />
                  </div>

                  <h3 className="text-lg font-black">
                    {t("Birthday discount", "Ad günü endirimi")}
                  </h3>

                  <p className="my-3 text-4xl font-black text-[#a15b42]">
                    15%
                  </p>

                  <p className="text-sm leading-6 text-[#987b65]">
                    {isBirthdayToday
                      ? t(
                          "Happy birthday! Your birthday discount is available today.",
                          "Ad günün mübarək! Ad günü endirimin bu gün aktivdir."
                        )
                      : t(
                          "Available on your birthday.",
                          "Doğum günündə aktiv olacaq."
                        )}
                  </p>

                  {isBirthdayToday && (
                    <span className="mt-4 inline-block rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-800">
                      {t("Available today", "Bu gün aktivdir")}
                    </span>
                  )}
                </div>

                {/* STUDENT */}
                <div className="rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9eee5] text-[#55734b]">
                    <GraduationCap size={25} />
                  </div>

                  <h3 className="text-lg font-black">
                    {t("Student discount", "Tələbə endirimi")}
                  </h3>

                  <p className="my-3 text-4xl font-black text-[#55734b]">
                    10%
                  </p>

                  <p className="text-sm leading-6 text-[#987b65]">
                    {studentStatusText()}
                  </p>

                  <span
                    className={`mt-4 inline-block rounded-full px-4 py-2 text-xs font-bold ${
                      profile?.student_status === "verified"
                        ? "bg-green-100 text-green-800"
                        : profile?.student_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-[#f5efe7] text-[#806651]"
                    }`}
                  >
                    {profile?.student_status === "verified"
                      ? t("Active", "Aktiv")
                      : profile?.student_status === "pending"
                        ? t("Under review", "Yoxlanılır")
                        : t("Not active", "Aktiv deyil")}
                  </span>
                </div>
              </div>
            </section>

            {/* HISTORY */}
            <section className="mt-10 rounded-[2rem] border border-[#eadfd1] bg-white p-7 shadow-sm sm:p-9">
              <div className="mb-7 flex items-center gap-3">
                <History className="text-[#987253]" size={23} />
                <h2 className="text-xl font-black">
                  {t("Points history", "Bonus tarixçəsi")}
                </h2>
              </div>

              {transactions.length === 0 ? (
                <div className="py-10 text-center">
                  <Coffee
                    size={35}
                    className="mx-auto mb-4 text-[#b69b82]"
                  />
                  <p className="font-bold">
                    {t("No rewards yet", "Hələ bonus yoxdur")}
                  </p>
                  <p className="mt-2 text-sm text-[#987b65]">
                    {t(
                      "Your points and transactions will appear here.",
                      "Bonusların və əməliyyatların burada görünəcək."
                    )}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#eee5dc]">
                  {transactions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div>
                        <p className="font-bold">
                          {item.description ||
                            (item.transaction_type === "earned"
                              ? t("Points earned", "Bonus qazanıldı")
                              : t("Points redeemed", "Bonus istifadə edildi"))}
                        </p>

                        <p className="mt-1 text-xs text-[#a18a75]">
                          {new Date(item.created_at).toLocaleDateString(
                            isAZ ? "az-AZ" : "en-US"
                          )}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 font-black ${
                          item.transaction_type === "earned"
                            ? "text-green-700"
                            : "text-[#a15b42]"
                        }`}
                      >
                        {item.transaction_type === "earned" ? "+" : "-"}
{Math.abs(item.points)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* BUTTONS */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/menu"
                className="flex items-center gap-2 rounded-full bg-[#553b2c] px-7 py-4 text-sm font-bold text-white hover:bg-[#76533c]"
              >
                <Coffee size={18} />
                {t("Explore menu", "Menyuya bax")}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full border border-[#dfd0c0] px-7 py-4 text-sm font-bold hover:bg-[#f1e8de]"
              >
                <LogOut size={18} />
                {t("Sign out", "Çıxış")}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}