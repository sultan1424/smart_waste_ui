"use client";
import AuthGuard from "@/components/auth/AuthGuard";
import WasteTrendChart from "@/components/analytics/WasteTrendChart";
import BinStatusPieChart from "@/components/analytics/BinStatusPieChart";
import PickupBarChart from "@/components/analytics/PickupBarChart";

export default function AnalyticsPage() {
  return (
    <AuthGuard allowedRoles={["regulator"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Aggregated waste and pickup insights — Regulator view</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BinStatusPieChart />
          <PickupBarChart />
        </div>
        <WasteTrendChart />
      </div>
    </AuthGuard>
  );
}