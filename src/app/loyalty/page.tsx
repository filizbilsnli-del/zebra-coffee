"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
   QrCode,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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

type MonthlyReward = {
  lifetime_points?: number;
  reward_name?: string | null;
  reward?: string | null;
  status?: "available" | "used";
  reward_month?: string;
  level?: string;
  message?: string;
};

export default function LoyaltyPage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [monthlyReward, setMonthlyReward] =
    useState<MonthlyReward | null>(null);
const [qrToken, setQrToken] = useState("");
const [qrLoading, setQrLoading] = useState(false);
const [qrError, setQrError] = useState("");
  const t = (en: string, az: string) => (isAZ ? az : en);
async function generateCustomerQR() {
  try {
    setQrLoading(true);
    setQrError("");

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      setQrError(
        t("Please sign in again.", "Yenidən hesaba daxil ol.")
      );
      return;
    }

    const response = await fetch("/api/customer-qr", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.qrToken) {
      throw new Error(result.error || "Could not create QR code.");
    }

    setQrToken(result.qrToken);
  } catch (error) {
    console.error("Customer QR error:", error);
    setQrError(
      t(
        "Could not create your QR code. Please try again.",
        "QR kodunu yaratmaq mümkün olmadı. Yenidən yoxla."
      )
    );
  } finally {
    setQrLoading(false);
  }
}
useEffect(() => {
  generateCustomerQR();
}, []);
  const earned = transactions
    .filter((item) => item.transaction_type === "earned")
    .reduce((sum, item) => sum + item.points, 0);

  const redeemed = transactions
    .filter((item) => item.transaction_type === "redeemed")
    .reduce((sum, item) => sum + Math.abs(item.points), 0);

  const balance = earned - redeemed;
  const moneyValue = (balance / 100).toFixed(2);
  const lifetimePoints = earned;

    const levels = [
    {
      min: 0,
      max: 100,
      name: "Coffee Beginner",
      nameAZ: "Qəhvə həvəskarı",
      emoji: "☕",
      reward: "No extra monthly reward",
      rewardAZ: "Əlavə aylıq mükafat yoxdur",
      description: "Collect points to unlock your first member reward.",
      descriptionAZ: "İlk üzv mükafatını açmaq üçün bonus xalları topla.",
    },
    {
      min: 100,
      max: 300,
      name: "Zebra Friend",
      nameAZ: "Zebra dostu",
      emoji: "🦓",
      reward: "5% extra monthly discount",
      rewardAZ: "5% əlavə aylıq endirim",
      description:
        "Enjoy one additional 5% discount per month. It cannot be combined with student or birthday discounts.",
      descriptionAZ:
        "Ayda bir dəfə əlavə 5% endirim qazan. Tələbə və ad günü endirimləri ilə birləşdirilmir.",
    },
    {
      min: 300,
      max: 600,
      name: "Coffee Lover",
      nameAZ: "Qəhvə sevən",
      emoji: "⭐",
      reward: "One free espresso shot or syrup",
      rewardAZ: "Bir pulsuz espresso shot və ya sirop",
      description:
        "Choose one free extra espresso shot or one syrup per month.",
      descriptionAZ:
        "Hər ay bir pulsuz əlavə espresso shot və ya bir sirop seç.",
    },
    {
      min: 600,
      max: 1000,
      name: "Gold Member",
      nameAZ: "Qızıl üzv",
      emoji: "👑",
      reward: "One free size upgrade",
      rewardAZ: "Bir dəfə pulsuz ölçü artırılması",
      description:
        "Upgrade Small to Medium or Medium to Large once per month.",
      descriptionAZ:
        "Ayda bir dəfə Kiçik ölçünü Orta, yaxud Orta ölçünü Böyük ölçüyə pulsuz artır.",
    },
    {
      min: 1000,
      max: Infinity,
      name: "Zebra Legend",
      nameAZ: "Zebra əfsanəsi",
      emoji: "💎",
      reward: "One free standard drink",
      rewardAZ: "Bir pulsuz standart içki",
      description:
        "Choose one free standard drink per month from the selected drinks.",
      descriptionAZ:
        "Hər ay müəyyən edilmiş standart içkilər arasından birini pulsuz seç.",
    },
  ];

  const currentLevel =
    [...levels].reverse().find((level) => lifetimePoints >= level.min) ??
    levels[0];

  const nextLevel = levels[levels.indexOf(currentLevel) + 1];

  const pointsToNextLevel = nextLevel
    ? Math.max(0, nextLevel.min - lifetimePoints)
    : 0;

  const levelProgress = nextLevel
    ? Math.min(
        100,
        ((lifetimePoints - currentLevel.min) /
          (nextLevel.min - currentLevel.min)) *
          100
      )
    : 100;

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

        // MONTHLY MEMBER REWARD
        const {
          data: monthlyRewardData,
          error: monthlyRewardError,
        } = await supabase.rpc("sync_monthly_member_reward");

        if (monthlyRewardError) {
          console.error("Monthly reward error:", monthlyRewardError);
        } else {
          setMonthlyReward(monthlyRewardData as MonthlyReward);
        }

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
      } catch (err) {
        console.error("Loyalty loading error:", err);

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

  function monthlyRewardName() {
    const rewardName = monthlyReward?.reward_name;

    if (rewardName === "5% monthly member discount") {
      return t("5% monthly member discount", "5% aylıq üzv endirimi");
    }

    if (rewardName === "One free espresso shot or syrup") {
      return t(
        "One free espresso shot or syrup",
        "Bir pulsuz espresso shot və ya sirop"
      );
    }

    if (rewardName === "One free size upgrade") {
      return t(
        "One free size upgrade",
        "Bir dəfə pulsuz ölçü artırılması"
      );
    }

    if (rewardName === "One free standard drink") {
      return t("One free standard drink", "Bir pulsuz standart içki");
    }

    return rewardName ?? "";
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

            {/* DIGITAL LOYALTY CARD */}
            <section className="mb-8 rounded-[2rem] border border-[#eadfd1] bg-white p-7 text-center shadow-sm">
              <div className="mb-4 flex items-center justify-center gap-2">
                <QrCode size={24} className="text-[#987253]" />
                <h2 className="text-xl font-black">
                  {t("My digital loyalty card", "Mənim rəqəmsal bonus kartım")}
                </h2>
              </div>

              <p className="mb-5 text-sm text-[#987b65]">
                {t(
                  "Show this QR code to the cashier to identify your loyalty account.",
                  "Bonus hesabını tanıtmaq üçün bu QR kodu kassirə göstər."
                )}
              </p>

              {qrLoading ? (
                <Loader2 className="mx-auto animate-spin text-[#795b45]" size={35} />
              ) : qrError ? (
                <p className="text-sm text-red-600">{qrError}</p>
              ) : qrToken ? (
                <div className="mx-auto w-fit rounded-2xl border border-[#eadfd1] bg-white p-4">
                  <QRCodeSVG value={qrToken} size={210} />
                </div>
              ) : null}
            </section>

            {/* ZEBRA LEVEL */}
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#e8c9a6] bg-gradient-to-r from-[#fffaf2] to-[#f1e5d5] p-7 shadow-sm sm:p-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-[#a17a59]">
                    ZEBRA REWARDS CLUB
                  </p>

                  <h2 className="mt-3 text-2xl font-black">
                    {t("Your member level", "Sənin üzvlük səviyyən")}
                  </h2>

                  <p className="mt-2 text-sm text-[#987b65]">
                    {t(
                      "Your level is based on all points you have ever earned.",
                      "Səviyyən indiyə qədər qazandığın bütün bonuslara əsaslanır."
                    )}
                  </p>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#553b2c] text-4xl shadow-md">
                  {currentLevel.emoji}
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-white/80 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#a17a59]">
                  {t("CURRENT LEVEL", "HAZIRKI SƏVİYYƏ")}
                </p>

                <h3 className="mt-2 text-3xl font-black text-[#553b2c]">
                  {t(currentLevel.name, currentLevel.nameAZ)}
                </h3>

                <p className="mt-2 text-sm font-bold text-[#987b65]">
                  {lifetimePoints} {t("lifetime points", "ümumi qazanılmış bal")}
                </p>
              </div>

              {nextLevel ? (
                <div className="mt-6">
                  <div className="mb-3 flex justify-between gap-3 text-sm">
                    <span className="font-bold text-[#795b45]">
                      {t("Next level:", "Növbəti səviyyə:")}{" "}
                      {t(nextLevel.name, nextLevel.nameAZ)}
                    </span>

                    <span className="font-black text-[#795b45]">
                      {pointsToNextLevel} {t("points left", "bal qalıb")}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#e8d8c7]">
                    <div
                      className="h-full rounded-full bg-[#987253] transition-all duration-700"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-6 font-bold text-[#795b45]">
                  {t(
                    "Congratulations! You have reached the highest level!",
                    "Təbriklər! Ən yüksək səviyyəyə çatmısan!"
                  )}
                </p>
              )}

              <p className="mt-5 text-xs leading-5 text-[#987b65]">
                {t(
                  "Redeeming points does not reduce your member level.",
                  "Bonuslardan istifadə etmək üzvlük səviyyəni azaltmır."
                )}
              </p>

              <div className="mt-7">
                <h3 className="mb-4 text-lg font-black text-[#553b2c]">
                  {t("Explore all levels", "Bütün səviyyələr")}
                </h3>

                <div className="space-y-3">
                  {levels.map((level) => {
                    const isExpanded = expandedLevel === level.name;
                    const isUnlocked = lifetimePoints >= level.min;
                    const isCurrent = currentLevel.name === level.name;

                    const range =
                      level.max === Infinity
                        ? "1000+"
                        : `${level.min}–${level.max - 1}`;

                    return (
                      <div
                        key={level.name}
                        className="overflow-hidden rounded-2xl border border-[#e8d8c7] bg-white/80"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLevel(isExpanded ? null : level.name)
                          }
                          className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-[#fffaf2]"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5eadc] text-2xl">
                              {level.emoji}
                            </span>

                            <div>
                              <p className="font-black text-[#553b2c]">
                                {t(level.name, level.nameAZ)}
                              </p>
                              <p className="text-sm text-[#987b65]">
                                {range} {t("points", "bal")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="rounded-full bg-[#553b2c] px-3 py-1 text-xs font-bold text-white">
                                {t("Your level", "Sənin səviyyən")}
                              </span>
                            )}

                            {!isCurrent && isUnlocked && (
                              <span className="text-xs font-bold text-green-700">
                                {t("Unlocked", "Açılıb")}
                              </span>
                            )}

                            <span className="text-xl text-[#795b45]">
                              {isExpanded ? "−" : "+"}
                            </span>
                          </div>
                        </button>

                                               {isExpanded && (
                          <div className="border-t border-[#e8d8c7] bg-[#fffaf2] p-4">
                            <p className="text-sm leading-6 text-[#795b45]">
                              {t("Required points:", "Tələb olunan bonus bal:")}{" "}
                              <strong>{range}</strong>
                            </p>

                            <div className="mt-4 rounded-xl border border-[#e8d8c7] bg-white p-4">
                              <p className="text-xs font-black tracking-wider text-[#a17a59]">
                                {t("MONTHLY GIFT", "AYLIQ HƏDİYYƏ")}
                              </p>

                              <p className="mt-2 text-lg font-black text-[#553b2c]">
                                {t(level.reward, level.rewardAZ)}
                              </p>

                              <p className="mt-2 text-sm leading-6 text-[#987b65]">
                                {t(level.description, level.descriptionAZ)}
                              </p>

                              {level.min > 0 && (
                                <p className="mt-3 text-xs font-bold text-[#795b45]">
                                  {t(
                                    "Available once per month.",
                                    "Ayda bir dəfə istifadə edilə bilər."
                                  )}
                                </p>
                              )}
                            </div>

                            {isCurrent && (
                              <p className="mt-3 text-sm font-bold text-green-700">
                                {t(
                                  "This is your current level!",
                                  "Bu, sənin hazırkı səviyyəndir!"
                                )}
                              </p>
                            )}

                            {!isUnlocked && (
                              <p className="mt-3 text-sm font-bold text-[#795b45]">
                                {level.min - lifetimePoints}{" "}
                                {t(
                                  "more points needed to unlock this level.",
                                  "bal toplamalısan ki, bu səviyyəni açasan."
                                )}
                              </p>
                            )}

                            {isUnlocked && !isCurrent && (
                              <p className="mt-3 text-sm font-bold text-green-700">
                                {t(
                                  "You have unlocked this level!",
                                  "Bu səviyyəni artıq qazanmısan!"
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* MONTHLY MEMBER REWARD */}
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#e8c9a6] bg-gradient-to-r from-[#fffaf2] to-[#f1e5d5] p-7 shadow-sm sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#553b2c] text-[#f5e7d1]">
                  <Gift size={28} />
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[#a17a59]">
                    ZEBRA MONTHLY REWARD
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#553b2c]">
                    {t("Your monthly reward", "Aylıq mükafatın")}
                  </h2>
                </div>
              </div>

              {monthlyReward?.reward_name ? (
                <>
                  <div className="mt-6 rounded-2xl bg-white/80 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#a17a59]">
                      {t("THIS MONTH'S REWARD", "BU AYIN MÜKAFATI")}
                    </p>

                    <h3 className="mt-3 text-xl font-black text-[#553b2c]">
                      {monthlyRewardName()}
                    </h3>

                    <span
                      className={`mt-4 inline-block rounded-full px-4 py-2 text-xs font-bold ${
                        monthlyReward.status === "used"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {monthlyReward.status === "used"
                        ? t(
                            "Already used this month",
                            "Bu ay istifadə edilib"
                          )
                        : t(
                            "Available this month",
                            "Bu ay istifadə üçün aktivdir"
                          )}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#795b45]">
                    {t(
                      "Your monthly reward is based on your current membership level. You can use it once per month.",
                      "Aylıq mükafatın hazırkı üzvlük səviyyənə əsaslanır. Bu mükafatdan ay ərzində yalnız bir dəfə istifadə edə bilərsən."
                    )}
                  </p>
                </>
              ) : (
                <p className="mt-6 text-sm leading-6 text-[#795b45]">
                  {t(
                    "Reach 100 lifetime points to unlock your first monthly member reward.",
                    "İlk aylıq üzv mükafatını açmaq üçün ümumilikdə 100 bal topla."
                  )}
                </p>
              )}
            </section>

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

            {/* HAPPY HOUR */}
            <section className="mt-8 overflow-hidden rounded-[2rem] border border-[#e8c9a6] bg-gradient-to-r from-[#553b2c] to-[#795b45] p-7 text-white shadow-lg sm:p-9">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8c9a6]/20 text-[#f5d6ad]">
                  <Coffee size={30} />
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-[#e8c9a6]">
                    ZEBRA HAPPY HOUR
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {t("Double Points", "İkiqat bonus")}
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-4xl font-black text-[#f5d6ad]">
                08:00 – 10:00
              </p>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#f5e7d1]">
                {t(
                  "Order every day during Happy Hour and earn 2x loyalty points automatically!",
                  "Hər gün Happy Hour saatlarında sifariş et və avtomatik olaraq 2 qat bonus qazan!"
                )}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-[#f5d6ad]">
                <Star size={15} />
                {t("No activation required", "Aktivləşdirməyə ehtiyac yoxdur")}
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