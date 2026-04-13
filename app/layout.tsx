import type { Metadata } from "next";
import "./globals.css";
import ConditionalTopBar from "@/components/layout/ConditionalTopBar";

export const metadata: Metadata = {
  title: "WasteEnergy — Operations Dashboard",
  description: "AI-driven Smart Waste Monitoring System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConditionalTopBar />
        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
