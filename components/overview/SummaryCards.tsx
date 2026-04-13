"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Bin, PickupRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function SummaryCards() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.bins(), api.pickupsToday()])
      .then(([b, p]) => { setBins(b); setPickups(p); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading summary..." />;

  const nearFull   = bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) >= 80).length;
  const completed  = pickups.filter(p => p.status === "completed").length;
  const avgFill    = bins.length
    ? bins.reduce((s,b) => s + (b.latest_telemetry?.fill_pct ?? 0), 0) / bins.length
    : 0;

  const cards = [
    {
      label: "Total Bins",
      value: bins.length,
      sub: "monitored",
      accent: "#3b82f6",
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M20 7H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
    },
    {
      label: "Near Full",
      value: nearFull,
      sub: "need pickup",
      accent: "#f59e0b",
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
        </svg>
      ),
    },
    {
      label: "Today's Pickups",
      value: pickups.length,
      sub: `${completed} completed`,
      accent: "#22c55e",
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25" />
        </svg>
      ),
    },
    {
      label: "Avg Fill Level",
      value: `${avgFill.toFixed(1)}%`,
      sub: "across all bins",
      accent: avgFill >= 70 ? "#ef4444" : "#8b5cf6",
      icon: (
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={avgFill >= 70 ? "#ef4444" : "#8b5cf6"} strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
      {cards.map((c, i) => (
        <div key={c.label}
          className={`card fade-up-${i + 1}`}
          style={{ padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>{c.label}</span>
            <div style={{
              width: 32, height: 32,
              background: c.accent + "18",
              borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{c.icon}</div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-1)", lineHeight: 1 }}>
            {c.value}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
