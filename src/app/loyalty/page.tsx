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
  Crown,
  Sparkles,
  Award,
  TrendingUp,
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

  const t = (en: string, az: string) => (isAZ ? az : en);

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

  const levelTheme = {
    "Coffee Beginner": {
      background: "from-[#EADFD3] via-[#F8F1E9] to-[#DCC9B5]",
      badge: "bg-[#80563D]",
      text: "text-[#68452F]",
      border: "border-[#C9AD93]",
    },
    "Zebra Friend": {
      background: "from-[#F5DDBB] via-[#FFF4E3] to-[#E9C18D]",
      badge: "bg-[#A66B2C]",
      text: "text-[#8A551F]",
      border: "border-[#D9B27D]",
    },
    "Coffee Lover": {
      background: "from-[#E9DDF5] via-[#F8F2FC] to-[#D6C2EA]",
      badge: "bg-[#7952A3]",
      text: "text-[#68418E]",
      border: "border-[#C5A9DD]",
    },
    "Gold Member": {
      background: "from-[#F8E6A9] via-[#FFF8DC] to-[#EACB70]",
      badge: "bg-[#A77B12]",
      text: "text-[#8A6410]",
      border: "border-[#D8B94E]",
    },
    "Zebra Legend": {
      background: "from-[#C9E5ED] via-[#EDF8FC] to-[#A9D3E1]",
      badge: "bg-[#28758D]",
      text: "text-[#205F73]",
      border: "border-[#8CC1D1]",
    },
  };

  const activeTheme =
    levelTheme[currentLevel.name as keyof typeof levelTheme];

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
      return t("One free size upgrade", "Bir dəfə pulsuz ölçü artırılması");
    }

    if (rewardName === "One free standard drink") {
      return t("One free standard drink", "Bir pulsuz standart içki");
    }

    return rewardName ?? "";
  }

  const cardClass =
    "rounded-[2rem] border border-[#EEE5DA] bg-white p-6 shadow-[0_8px_30px_rgba(52,35,29,0.05)] sm:p-8";

  const mutedText = "text-[#78675B]";

  return (
    <main className="min-h-screen bg-[#FBF8F3] px-4 py-8 pb-32 text-[#34231D] sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E8DED2] bg-white px-5 py-3 text-sm font-bold text-[#80563D] shadow-sm transition hover:bg-[#F5EDE3]"
          >
            <ArrowLeft size={17} />
            {t("Home", "Ana səhifə")}
          </Link>
        </header>

        {/* HERO */}
        <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-[#EEE5DA] bg-gradient-to-br from-white via-[#FBF8F3] to-[#F0E6DA] px-6 py-12 text-center shadow-sm sm:px-12">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#C89B6D]/10" />
          <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-[#80563D]/5" />

          <div className="relative">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#80563D] text-white shadow-lg shadow-[#80563D]/20">
              <Gift size={30} />
            </div>

            <p className="mb-3 text-xs font-black tracking-[0.35em] text-[#A08065]">
              ZEBRA REWARDS
            </p>

            <h1 className="text-4xl font-black tracking-tight text-[#34231D] sm:text-5xl">
              {t("Your rewards", "Sənin bonusların")}
            </h1>

            <p className={`mx-auto mt-4 max-w-lg text-sm leading-6 ${mutedText}`}>
              {t(
                "Every coffee brings you closer to a reward.",
                "Hər qəhvə səni yeni mükafata yaxınlaşdırır."
              )}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-[#E8DED2] bg-white px-4 py-2 text-xs font-bold text-[#80563D]">
                ☕ {t("Earn points", "Bonus qazan")}
              </span>
              <span className="rounded-full border border-[#E8DED2] bg-white px-4 py-2 text-xs font-bold text-[#80563D]">
                🎁 {t("Unlock rewards", "Mükafatları aç")}
              </span>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="animate-spin text-[#80563D]" size={38} />
            <p className={`mt-4 text-sm font-medium ${mutedText}`}>
              {t("Loading your rewards...", "Bonusların yüklənir...")}
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
                {error}
              </div>
            )}

            {/* PROFILE */}
            <section className={`${cardClass} mb-8`}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EDE3] text-[#80563D]">
                    <UserRound size={23} />
                  </div>

                  <div>
                    <h2 className="text-xl font-black">
                      {t("My profile", "Profilim")}
                    </h2>
                    <p className={`mt-1 text-xs ${mutedText}`}>
                      {t("Your account information", "Hesab məlumatların")}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#F0E6DA] px-5 py-3 text-xs font-bold text-[#80563D] transition hover:bg-[#E8D8C7]"
                >
                  <Pencil size={14} />
                  {t("Edit profile", "Redaktə et")}
                </Link>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#FBF8F3] p-4">
                  <p className={`text-xs font-medium ${mutedText}`}>
                    {t("Full name", "Ad və soyad")}
                  </p>
                  <p className="mt-2 break-words font-bold text-[#34231D]">
                    {profile?.full_name || t("Not provided", "Qeyd edilməyib")}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FBF8F3] p-4">
                  <p className={`text-xs font-medium ${mutedText}`}>Email</p>
                  <p className="mt-2 break-all font-bold text-[#34231D]">
                    {userEmail}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#FBF8F3] p-4">
                  <p className={`text-xs font-medium ${mutedText}`}>
                    {t("Date of birth", "Doğum tarixi")}
                  </p>
                  <p className="mt-2 flex items-center gap-2 font-bold text-[#34231D]">
                    <CalendarDays
                      size={17}
                      className="shrink-0 text-[#A08065]"
                    />
                    {profile?.birth_date || t("Not provided", "Qeyd edilməyib")}
                  </p>
                </div>
              </div>
            </section>

            {/* MEMBER LEVEL */}
            <section
              className={`mb-8 overflow-hidden rounded-[2rem] border ${activeTheme.border} bg-gradient-to-br ${activeTheme.background} p-6 shadow-md transition-all duration-700 sm:p-9`}
            >
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div className="max-w-xl">
                  <p className="text-xs font-black tracking-[0.25em] text-[#A08065]">
                    ZEBRA REWARDS CLUB
                  </p>

                  <h2 className="mt-3 text-2xl font-black text-[#34231D] sm:text-3xl">
                    {t("Your member level", "Sənin üzvlük səviyyən")}
                  </h2>

                  <p className={`mt-3 text-sm leading-6 ${mutedText}`}>
                    {t(
                      "Your level is based on all points you have ever earned.",
                      "Səviyyən indiyə qədər qazandığın bütün bonuslara əsaslanır."
                    )}
                  </p>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/70 bg-white text-4xl shadow-md">
                  {currentLevel.emoji}
                </div>
              </div>

              {/* CURRENT LEVEL */}
              <div
                className={`mt-7 rounded-2xl border-2 ${activeTheme.border} bg-white/90 p-6 shadow-md transition-all duration-700`}
              >
                <div className={`flex items-center gap-2 ${activeTheme.text}`}>
                  <Crown size={17} />
                  <p className="text-xs font-black tracking-widest">
                    {t("CURRENT LEVEL", "HAZIRKI SƏVİYYƏ")}
                  </p>
                </div>

                <h3 className={`mt-3 text-3xl font-black ${activeTheme.text}`}>
                  {t(currentLevel.name, currentLevel.nameAZ)}
                </h3>

                <p className={`mt-2 text-sm font-semibold ${mutedText}`}>
                  {lifetimePoints}{" "}
                  {t("lifetime points", "ümumi qazanılmış bal")}
                </p>
              </div>

              {/* VISIBLE MONTHLY GIFT */}
              <div className="mt-5 rounded-2xl border-2 border-[#D8B990] bg-white p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5E6D2] text-[#A66B2C]">
                    <Gift size={29} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black tracking-widest text-[#A66B2C]">
                        {t("YOUR MONTHLY MEMBER GIFT", "AYLIQ ÜZV HƏDİYYƏN")}
                      </p>

                      <span className="rounded-full bg-[#F5E6D2] px-3 py-1 text-[10px] font-black text-[#8A551F]">
                        {t("MEMBER BENEFIT", "ÜZV ÜSTÜNLÜYÜ")}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-black text-[#34231D] sm:text-2xl">
                      {t(currentLevel.reward, currentLevel.rewardAZ)}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#78675B]">
                      {t(
                        currentLevel.description,
                        currentLevel.descriptionAZ
                      )}
                    </p>

                    {currentLevel.min > 0 && (
                      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#F5EDE3] px-4 py-2 text-xs font-bold text-[#80563D]">
                        <Sparkles size={15} />
                        {t(
                          "Your level's monthly benefit",
                          "Üzvlük səviyyənə uyğun aylıq hədiyyə"
                        )}
                      </p>
                    )}

                    {currentLevel.min === 0 && (
                      <p className="mt-4 text-xs font-semibold text-[#A08065]">
                        {t(
                          "Earn more points to unlock your first monthly gift.",
                          "İlk aylıq hədiyyəni açmaq üçün daha çox bonus balı topla."
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PROGRESS */}
              {nextLevel ? (
                <div className="mt-7">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-bold text-[#604532]">
                      {t("Next level:", "Növbəti səviyyə:")}{" "}
                      {t(nextLevel.name, nextLevel.nameAZ)}
                    </span>

                    <span className="font-black text-[#80563D]">
                      {pointsToNextLevel} {t("points left", "bal qalıb")}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-white shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#A08065] to-[#C89B6D] transition-all duration-700"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>

                  <p className={`mt-2 text-xs ${mutedText}`}>
                    {Math.round(levelProgress)}%{" "}
                    {t("completed", "tamamlanıb")}
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl bg-white/80 p-4">
                  <p className="font-bold text-[#80563D]">
                    {t(
                      "Congratulations! You have reached the highest level!",
                      "Təbriklər! Ən yüksək səviyyəyə çatmısan!"
                    )}
                  </p>
                </div>
              )}

              <p className={`mt-5 text-xs leading-5 ${mutedText}`}>
                {t(
                  "Redeeming points does not reduce your member level.",
                  "Bonuslardan istifadə etmək üzvlük səviyyəni azaltmır."
                )}
              </p>

              {/* ALL LEVELS */}
              <div className="mt-8">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-[#34231D]">
                  <Award size={20} className="text-[#A08065]" />
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
                        className="overflow-hidden rounded-2xl border border-[#E8DED2] bg-white/90 shadow-sm transition-all duration-300 hover:border-[#C89B6D] hover:shadow-md"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedLevel(isExpanded ? null : level.name)
                          }
                          aria-expanded={isExpanded}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl p-4 text-left transition-all duration-300 hover:bg-[#F0E0CC] hover:shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A08065]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F5EDE3] text-2xl">
                              {level.emoji}
                            </span>

                            <div className="min-w-0">
                              <p className="font-black text-[#34231D]">
                                {t(level.name, level.nameAZ)}
                              </p>
                              <p className={`mt-1 text-xs ${mutedText}`}>
                                {range} {t("points", "bal")}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {isCurrent && (
                              <span className="rounded-full bg-[#80563D] px-3 py-1.5 text-[10px] font-bold text-white sm:text-xs">
                                {t("Your level", "Sənin səviyyən")}
                              </span>
                            )}

                            {!isCurrent && isUnlocked && (
                              <span className="text-xs font-bold text-green-700">
                                {t("Unlocked", "Açılıb")}
                              </span>
                            )}

                            <span className="text-xl font-bold text-[#80563D]">
                              {isExpanded ? "−" : "+"}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-[#EEE5DA] bg-[#FBF8F3] p-5">
                            <p className={`text-sm leading-6 ${mutedText}`}>
                              {t("Required points:", "Tələb olunan bonus bal:")}{" "}
                              <strong className="text-[#34231D]">
                                {range}
                              </strong>
                            </p>

                            <div className="mt-4 rounded-2xl border border-[#E8DED2] bg-white p-5">
                              <p className="flex items-center gap-2 text-xs font-black tracking-wider text-[#A08065]">
                                <Gift size={15} />
                                {t("MONTHLY GIFT", "AYLIQ HƏDİYYƏ")}
                              </p>

                              <p className="mt-3 text-lg font-black text-[#34231D]">
                                {t(level.reward, level.rewardAZ)}
                              </p>

                              <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
                                {t(level.description, level.descriptionAZ)}
                              </p>

                              {level.min > 0 && (
                                <p className="mt-3 text-xs font-bold text-[#80563D]">
                                  {t(
                                    "Available once per month.",
                                    "Ayda bir dəfə istifadə edilə bilər."
                                  )}
                                </p>
                              )}
                            </div>

                            {isCurrent && (
                              <p className="mt-4 text-sm font-bold text-green-700">
                                {t(
                                  "This is your current level!",
                                  "Bu, sənin hazırkı səviyyəndir!"
                                )}
                              </p>
                            )}

                            {!isUnlocked && (
                              <p className="mt-4 text-sm font-bold text-[#80563D]">
                                {level.min - lifetimePoints}{" "}
                                {t(
                                  "more points needed to unlock this level.",
                                  "bal toplamalısan ki, bu səviyyəni açasan."
                                )}
                              </p>
                            )}

                            {isUnlocked && !isCurrent && (
                              <p className="mt-4 text-sm font-bold text-green-700">
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

            {/* MONTHLY REWARD */}
            <section className={`${cardClass} mb-8`}>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5EDE3] text-[#80563D]">
                  <Gift size={27} />
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.2em] text-[#A08065]">
                    ZEBRA MONTHLY REWARD
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#34231D] sm:text-2xl">
                    {t("Your monthly reward", "Aylıq mükafatın")}
                  </h2>
                </div>
              </div>

              {monthlyReward?.reward_name ? (
                <>
                  <div className="mt-6 rounded-2xl border border-[#E8DED2] bg-[#FBF8F3] p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-[#A08065]">
                      {t("THIS MONTH'S REWARD", "BU AYIN MÜKAFATI")}
                    </p>

                    <h3 className="mt-3 text-xl font-black text-[#34231D]">
                      {monthlyRewardName()}
                    </h3>

                    <span
                      className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                        monthlyReward.status === "used"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {monthlyReward.status === "used"
                        ? t("Already used this month", "Bu ay istifadə edilib")
                        : t("Available this month", "Bu ay istifadə üçün aktivdir")}
                    </span>
                  </div>

                  <p className={`mt-4 text-sm leading-6 ${mutedText}`}>
                    {t(
                      "Your monthly reward is based on your current membership level. You can use it once per month.",
                      "Aylıq mükafatın hazırkı üzvlük səviyyənə əsaslanır. Bu mükafatdan ay ərzində yalnız bir dəfə istifadə edə bilərsən."
                    )}
                  </p>
                </>
              ) : (
                <div className="mt-6 rounded-2xl bg-[#FBF8F3] p-5">
                  <p className="text-sm leading-6 text-[#604532]">
                    {t(
                      "Reach 100 lifetime points to unlock your first monthly member reward.",
                      "İlk aylıq üzv mükafatını açmaq üçün ümumilikdə 100 bal topla."
                    )}
                  </p>
                </div>
              )}
            </section>

            {/* POINTS BALANCE */}
            <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#80563D] via-[#68452F] to-[#34231D] p-7 text-white shadow-xl sm:p-10">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[25px] border-white/5" />
              <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[#C89B6D]/10" />

              <div className="relative">
                <div className="flex items-center gap-3 text-[#F0D9C0]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <Star size={22} />
                  </div>

                  <span className="text-sm font-bold tracking-widest">
                    {t("YOUR POINTS BALANCE", "BONUS BALANSIN")}
                  </span>
                </div>

                <div className="mt-7 flex items-end gap-3">
                  <span className="text-6xl font-black sm:text-7xl">
                    {balance}
                  </span>
                  <span className="pb-2 text-lg font-semibold text-[#F0D9C0]">
                    {t("points", "bal")}
                  </span>
                </div>

                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
                  <Wallet size={22} className="text-[#F0D9C0]" />
                  <div>
                    <p className="text-xs text-[#F0D9C0]">
                      {t("Available value", "Bonusların dəyəri")}
                    </p>
                    <p className="mt-1 text-xl font-black">{moneyValue} AZN</p>
                  </div>
                </div>

                <p className="mt-4 text-xs font-medium text-[#F0D9C0]">
                  {t(
                    "100 points = 1 AZN discount.",
                    "100 bal = 1 AZN endirim."
                  )}
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/20 pt-6">
                  <div>
                    <p className="text-xs text-[#F0D9C0]">
                      {t("Total earned", "Qazanılan")}
                    </p>
                    <p className="mt-2 text-3xl font-black">+{earned}</p>
                  </div>

                  <div>
                    <p className="text-xs text-[#F0D9C0]">
                      {t("Total redeemed", "İstifadə edilən")}
                    </p>
                    <p className="mt-2 text-3xl font-black">-{redeemed}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* HAPPY HOUR */}
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-[#E8D8C7] bg-gradient-to-br from-[#F0E6DA] to-[#FBF8F3] p-6 shadow-sm sm:p-9">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#80563D] text-white">
                  <Coffee size={28} />
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.25em] text-[#A08065]">
                    ZEBRA HAPPY HOUR
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#34231D]">
                    {t("Double Points", "İkiqat bonus")}
                  </h2>
                </div>
              </div>

              <p className="mt-6 text-4xl font-black tracking-tight text-[#80563D]">
                08:00 – 10:00
              </p>

              <p className={`mt-3 max-w-xl text-sm leading-6 ${mutedText}`}>
                {t(
                  "Order every day during Happy Hour and earn 2x loyalty points automatically!",
                  "Hər gün Happy Hour saatlarında sifariş et və avtomatik olaraq 2 qat bonus qazan!"
                )}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#E8D8C7] bg-white px-4 py-2 text-xs font-bold text-[#80563D]">
                <Sparkles size={15} />
                {t("No activation required", "Aktivləşdirməyə ehtiyac yoxdur")}
              </div>
            </section>

            {/* DISCOUNTS */}
            <section className="mb-10">
              <div className="mb-6">
                <p className="text-xs font-black tracking-[0.25em] text-[#A08065]">
                  SPECIAL BENEFITS
                </p>
                <h2 className="mt-2 text-2xl font-black text-[#34231D]">
                  {t("Your discounts", "Sənin endirimlərin")}
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* BIRTHDAY */}
                <div className="rounded-[2rem] border border-[#EEE5DA] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EDE3] text-[#80563D]">
                    <Gift size={25} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-[#34231D]">
                    {t("Birthday discount", "Ad günü endirimi")}
                  </h3>

                  <p className="my-3 text-5xl font-black text-[#A08065]">
                    15%
                  </p>

                  <p className={`text-sm leading-6 ${mutedText}`}>
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
                    <span className="mt-4 inline-flex rounded-full bg-green-100 px-4 py-2 text-xs font-bold text-green-800">
                      {t("Available today", "Bu gün aktivdir")}
                    </span>
                  )}
                </div>

                {/* STUDENT */}
                <div className="rounded-[2rem] border border-[#EEE5DA] bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5EDE3] text-[#80563D]">
                    <GraduationCap size={25} />
                  </div>

                  <h3 className="mt-5 text-lg font-black text-[#34231D]">
                    {t("Student discount", "Tələbə endirimi")}
                  </h3>

                  <p className="my-3 text-5xl font-black text-[#A08065]">
                    10%
                  </p>

                  <p className={`text-sm leading-6 ${mutedText}`}>
                    {studentStatusText()}
                  </p>

                  <span
                    className={`mt-4 inline-flex rounded-full px-4 py-2 text-xs font-bold ${
                      profile?.student_status === "verified"
                        ? "bg-green-100 text-green-800"
                        : profile?.student_status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-[#F0E6DA] text-[#80563D]"
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
            <section className={`${cardClass} mb-8`}>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5EDE3] text-[#80563D]">
                  <History size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#34231D]">
                    {t("Points history", "Bonus tarixçəsi")}
                  </h2>
                  <p className={`mt-1 text-xs ${mutedText}`}>
                    {t(
                      "Your recent loyalty transactions",
                      "Son bonus əməliyyatların"
                    )}
                  </p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="rounded-2xl bg-[#FBF8F3] py-12 text-center">
                  <Coffee
                    size={38}
                    className="mx-auto mb-4 text-[#A08065]"
                  />

                  <p className="font-bold text-[#34231D]">
                    {t("No rewards yet", "Hələ bonus yoxdur")}
                  </p>

                  <p className={`mt-2 text-sm ${mutedText}`}>
                    {t(
                      "Your points and transactions will appear here.",
                      "Bonusların və əməliyyatların burada görünəcək."
                    )}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#EEE5DA]">
                  {transactions.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 py-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            item.transaction_type === "earned"
                              ? "bg-green-50 text-green-700"
                              : "bg-[#F5EDE3] text-[#80563D]"
                          }`}
                        >
                          {item.transaction_type === "earned" ? (
                            <TrendingUp size={19} />
                          ) : (
                            <Wallet size={19} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="break-words text-sm font-bold text-[#34231D]">
                            {item.description ||
                              (item.transaction_type === "earned"
                                ? t("Points earned", "Bonus qazanıldı")
                                : t("Points redeemed", "Bonus istifadə edildi"))}
                          </p>

                          <p className={`mt-1 text-xs ${mutedText}`}>
                            {new Date(item.created_at).toLocaleDateString(
                              isAZ ? "az-AZ" : "en-US"
                            )}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-2 text-sm font-black ${
                          item.transaction_type === "earned"
                            ? "bg-green-50 text-green-700"
                            : "bg-[#F5EDE3] text-[#80563D]"
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

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap justify-center gap-4 pb-5">
              <Link
                href="/menu"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#80563D] px-7 py-4 text-sm font-bold text-white shadow-md transition hover:bg-[#68452F] hover:shadow-lg"
              >
                <Coffee size={18} />
                {t("Explore menu", "Menyuya bax")}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E8DED2] bg-white px-7 py-4 text-sm font-bold text-[#80563D] transition hover:bg-[#F5EDE3]"
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