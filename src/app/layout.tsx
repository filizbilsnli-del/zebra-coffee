import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import GlobalLanguageSwitch from "@/components/GlobalLanguageSwitch";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zebra Coffee",
  description: "Zebra Coffee — A little happiness in every cup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen`}
      >
        <LanguageProvider>
          <GlobalLanguageSwitch />

          {/* MAIN CONTENT AREA */}
          <div className="min-h-screen min-w-0">
            {children}
          </div>

          {/* NAVIGATION */}
          <BottomNav />
        </LanguageProvider>
      </body>
    </html>
  );
}