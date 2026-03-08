import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalTopBar from "@/components/layout/ConditionalTopBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Waste Monitor",
  description: "AI-driven Food Waste Monitoring Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen`}>
        <ConditionalTopBar />
        <main className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}