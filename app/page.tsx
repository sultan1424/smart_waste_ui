"use client";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/auth";
import AuthGuard from "@/components/auth/AuthGuard";
import SummaryCards from "@/components/overview/SummaryCards";
import BinStatusTable from "@/components/overview/BinStatusTable";
import PickupScheduleTable from "@/components/overview/PickupScheduleTable";

export default function OverviewPage() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.role ?? null);
  }, []);

  if (!role) return null;

  return (
    <AuthGuard>
      <div className="space-y-6">

        {/* ── Restaurant ── */}
        {role === "restaurant" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🍽 My Bins</h1>
              <p className="text-gray-400 text-sm mt-1">Monitor your assigned bins — BN-001 to BN-005</p>
            </div>
            <BinStatusTable restaurantMode />
          </>
        )}

        {/* ── Collector ── */}
        {role === "collector" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🚛 Collector Dashboard</h1>
              <p className="text-gray-400 text-sm mt-1">All bins status and today's pickup schedule</p>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BinStatusTable />
              <PickupScheduleTable />
            </div>
          </>
        )}

        {/* ── Regulator ── */}
        {role === "regulator" && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📊 Operations Overview</h1>
              <p className="text-gray-400 text-sm mt-1">Full system monitoring and analytics</p>
            </div>
            <SummaryCards />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <BinStatusTable />
              <PickupScheduleTable />
            </div>
          </>
        )}

      </div>
    </AuthGuard>
  );
}