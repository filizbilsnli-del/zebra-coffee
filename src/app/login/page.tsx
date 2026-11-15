"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Coffee,
  Mail,
  Lock,
  ArrowLeft,
  UserRound,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const t = (en: string, az: string) => (isAZ ? az : en);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (isRegister) {
        if (!fullName.trim() || !birthDate) {
          throw new Error(
            t("Please complete all profile fields.", "Bütün profil xanalarını doldur.")
          );
        }

        if (new Date(birthDate) > new Date()) {
          throw new Error(
            t("Birth date cannot be in the future.", "Doğum tarixi gələcək tarix ola bilməz.")
          );
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              birth_date: birthDate,
              student_status: isStudent ? "pending" : "not_student",
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          router.push("/loyalty");
          router.refresh();
        } else {
          setMessage(
            t(
              "Registration successful! Please check your email to confirm your account.",
              "Qeydiyyat uğurludur! Hesabını təsdiqləmək üçün email ünvanını yoxla."
            )
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/loyalty");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t("Something went wrong.", "Xəta baş verdi.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-5 py-12 pb-28 text-[#38271f]">
      <div className="w-full max-w-md">

        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#795b45] hover:text-[#38271f]"
          >
            <ArrowLeft size={18} />
            {t("Back to home", "Ana səhifəyə qayıt")}
          </Link>
        </div>

        <div className="rounded-[2rem] border border-[#eadfd1] bg-white p-8 shadow-xl sm:p-10">

          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#553b2c] text-[#f5e7d1]">
              <Coffee size={30} />
            </div>

            <h1 className="text-2xl font-black tracking-[0.15em]">
              ZEBRA COFFEE
            </h1>

            <p className="mt-3 text-sm text-[#987b65]">
              {isRegister
                ? t("Create your account", "Hesabını yarat")
                : t("Welcome back", "Xoş gəlmisən")}
            </p>
          </div>

          <div className="mb-7 grid grid-cols-2 rounded-full bg-[#f5efe7] p-1">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
                setMessage("");
              }}
              className={`rounded-full py-3 text-sm font-bold transition ${
                !isRegister
                  ? "bg-[#553b2c] text-white shadow"
                  : "text-[#806651]"
              }`}
            >
              {t("Sign in", "Giriş")}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
                setMessage("");
              }}
              className={`rounded-full py-3 text-sm font-bold transition ${
                isRegister
                  ? "bg-[#553b2c] text-white shadow"
                  : "text-[#806651]"
              }`}
            >
              {t("Register", "Qeydiyyat")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {isRegister && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    {t("Full name", "Ad və soyad")}
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#e8ded2] px-4 py-3 focus-within:border-[#987253]">
                    <UserRound size={19} className="text-[#987253]" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={t("Your full name", "Adınız və soyadınız")}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    {t("Date of birth", "Doğum tarixi")}
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-[#e8ded2] px-4 py-3 focus-within:border-[#987253]">
                    <CalendarDays size={19} className="text-[#987253]" />
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split("T")[0]}
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e8ded2] p-4">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="mt-1 accent-[#553b2c]"
                  />

                  <span>
                    <span className="flex items-center gap-2 text-sm font-bold">
                      <GraduationCap size={19} />
                      {t("I am a student", "Mən tələbəyəm")}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-[#987b65]">
                      {t(
                        "Student discount applications require verification. Your status will initially be pending.",
                        "Tələbə endirimi üçün təsdiq tələb olunur. Statusun əvvəlcə yoxlanılır."
                      )}
                    </span>
                  </span>
                </label>
              </>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold">
                {t("Email address", "Email ünvanı")}
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#e8ded2] px-4 py-3 focus-within:border-[#987253]">
                <Mail size={19} className="text-[#987253]" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold">
                {t("Password", "Şifrə")}
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-[#e8ded2] px-4 py-3 focus-within:border-[#987253]">
                <Lock size={19} className="text-[#987253]" />

                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("At least 6 characters", "Ən azı 6 simvol")}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#553b2c] py-4 font-bold text-white transition hover:bg-[#76533c] disabled:opacity-60"
            >
              <UserRound size={18} />
              {loading
                ? t("Please wait...", "Gözlə...")
                : isRegister
                  ? t("Create account", "Hesab yarat")
                  : t("Sign in", "Daxil ol")}
            </button>
          </form>

          <p className="mt-7 text-center text-xs leading-6 text-[#987b65]">
            {t(
              "Join Zebra Rewards and collect points with every order.",
              "Zebra Rewards-a qoşul və hər sifarişlə bonus xalları qazan."
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs tracking-widest text-[#a58a73]">
          ZEBRA COFFEE HOUSE
        </p>
      </div>
    </main>
  );
}