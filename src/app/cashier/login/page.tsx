"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { Coffee, Mail, Lock, ArrowLeft, LogIn } from "lucide-react";

export default function CashierLoginPage() {
  const router = useRouter();
  const { isAZ } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const t = (en: string, az: string) => (isAZ ? az : en);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) {
        throw new Error(
          t("Invalid email or password.", "Email və ya şifrə yanlışdır.")
        );
      }

      const userRole = data.user?.app_metadata?.role;

      if (userRole !== "cashier") {
        await supabase.auth.signOut();

        throw new Error(
          t(
            "You do not have cashier access.",
            "Sizin kassir giriş icazəniz yoxdur."
          )
        );
      }

      router.replace("/cashier");
      router.refresh();
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
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f1] px-5 py-12 text-[#38271f]">
      <div className="w-full max-w-md">

        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-[#795b45] hover:text-[#38271f]"
        >
          <ArrowLeft size={18} />
          {t("Back to home", "Ana səhifəyə qayıt")}
        </Link>

        <div className="rounded-[2rem] border border-[#eadfd1] bg-white p-8 shadow-xl sm:p-10">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#553b2c] text-[#f5e7d1]">
              <Coffee size={30} />
            </div>

            <h1 className="text-2xl font-black tracking-[0.15em]">
              ZEBRA COFFEE
            </h1>

            <p className="mt-3 text-sm font-semibold text-[#987b65]">
              {t("Cashier Login", "Kassir girişi")}
            </p>

            <p className="mt-2 text-xs text-[#a58a73]">
              {t(
                "Staff access only",
                "Yalnız əməkdaşlar üçün"
              )}
            </p>

          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  placeholder="cashier@example.com"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("Enter your password", "Şifrənizi daxil edin")}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#553b2c] py-4 font-bold text-white transition hover:bg-[#76533c] disabled:opacity-60"
            >
              <LogIn size={18} />

              {loading
                ? t("Please wait...", "Gözləyin...")
                : t("Sign in as cashier", "Kassir kimi daxil ol")}
            </button>

          </form>

          <p className="mt-7 text-center text-xs leading-6 text-[#987b65]">
            {t(
              "Authorized Zebra Coffee staff only.",
              "Yalnız icazəli Zebra Coffee əməkdaşları üçün."
            )}
          </p>

        </div>

        <p className="mt-6 text-center text-xs tracking-widest text-[#a58a73]">
          ZEBRA COFFEE · STAFF PANEL
        </p>

      </div>
    </main>
  );
}