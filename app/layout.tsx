import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WasteEnergy — Operations Dashboard",
  description: "AI-driven Smart Waste Monitoring System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}