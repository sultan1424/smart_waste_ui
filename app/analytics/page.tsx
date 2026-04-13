"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import WasteTrendChart from "@/components/analytics/WasteTrendChart";
import BinStatusPieChart from "@/components/analytics/BinStatusPieChart";
import PickupBarChart from "@/components/analytics/PickupBarChart";

export default function AnalyticsPage() {
  return (
    <AuthGuard allowedRoles={["regulator"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="fade-up">
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Analytics</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
            Aggregated waste and pickup insights — Regulator view
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fade-up-1">
          <BinStatusPieChart />
          <PickupBarChart />
        </div>
        <div className="fade-up-2"><WasteTrendChart /></div>
      </div>
    </AuthGuard>
  );
}
