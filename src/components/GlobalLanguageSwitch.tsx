"use client";

import { Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function GlobalLanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed right-5 top-5 z-[100]">
      <button
        onClick={() => setLanguage(language === "AZ" ? "EN" : "AZ")}
        className="flex items-center gap-2 rounded-full border border-[#e4d8c9] bg-[#faf7f1] px-4 py-2 text-sm font-bold text-[#553b2c] shadow-lg transition hover:bg-[#efe6da]"
        aria-label="Change language"
      >
        <Globe size={16} />
        {language === "AZ" ? "AZ | EN" : "EN | AZ"}
      </button>
    </div>
  );
}
