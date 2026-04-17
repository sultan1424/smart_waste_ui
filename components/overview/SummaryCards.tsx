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

  const nearFull  = bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) >= 80).length;
  const completed = pickups.filter(p => p.status === "completed").length;
  const avgFill   = bins.length
    ? bins.reduce((s, b) => s + (b.latest_telemetry?.fill_pct ?? 0), 0) / bins.length
    : 0;

  const cards = [
    {
      label: "Total Bins",
      value: String(bins.length),
      sub: "monitored",
      accent: "#3b5bdb",
      dimBg: "#eef2ff",
      icon: "🗑️",
    },
    {
      label: "Near Full",
      value: String(nearFull),
      sub: "need pickup",
      accent: "#d97706",
      dimBg: "#fef3c7",
      icon: "⚠️",
    },
    {
      label: "Today's Pickups",
      value: String(pickups.length),
      sub: `${completed} completed`,
      accent: "#16a34a",
      dimBg: "#dcfce7",
      icon: "🚛",
    },
    {
      label: "Avg Fill Level",
      value: `${avgFill.toFixed(1)}%`,
      sub: "across all bins",
      accent: avgFill >= 70 ? "#dc2626" : "#6741d9",
      dimBg: avgFill >= 70 ? "#fee2e2" : "#ede9fe",
      icon: "📊",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {cards.map((c, i) => (
        <div key={c.label} className={`card fade-up-${i + 1}`} style={{ padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", letterSpacing: "0.02em" }}>{c.label}</p>
            <div style={{
              width: 36, height: 36,
              background: c.dimBg,
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>{c.icon}</div>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text-1)", lineHeight: 1, letterSpacing: "-0.5px" }}>
            {c.value}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>{c.sub}</p>
        </div>
      ))}
    </div>
  );
}