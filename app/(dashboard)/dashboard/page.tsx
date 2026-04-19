"use client";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/auth";
import SummaryCards from "@/components/overview/SummaryCards";
import BinStatusTable from "@/components/overview/BinStatusTable";
import PickupScheduleTable from "@/components/overview/PickupScheduleTable";

function PageHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 24 }} className="fade-up">
      <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>{title}</h1>
      <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>{sub}</p>
    </div>
  );
}

export default function OverviewPage() {
  const [role, setRole] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    setRole(auth?.role ?? null);
  }, []);

  // Auto-refresh every 30 seconds for collector
  useEffect(() => {
    if (role !== "collector") return;
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [role]);

  if (!role) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {role === "restaurant" && (
        <>
          <PageHeader title="My Bins" sub="Monitor your assigned bins — BN-001 to BN-005" />
          <BinStatusTable restaurantMode />
        </>
      )}
      {role === "collector" && (
        <>
          <PageHeader title="Collector Dashboard" sub="All bins status and today's pickup schedule" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <BinStatusTable key={refreshKey} />
            <PickupScheduleTable key={refreshKey} />
          </div>
        </>
      )}
      {role === "regulator" && (
        <>
          <PageHeader title="Operations Overview" sub="Full system monitoring and analytics" />
          <SummaryCards />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 4 }}>
            <BinStatusTable />
            <PickupScheduleTable />
          </div>
        </>
      )}
    </div>
  );
}