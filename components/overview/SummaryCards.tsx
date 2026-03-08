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

  const nearFull = bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) >= 80).length;

  const cards = [
    {
      label: "Total Bins",
      value: bins.length,
      sub: "+2 from yesterday",
      subColor: "text-green-600",
      icon: "🗑",
      iconBg: "bg-blue-50",
    },
    {
      label: "Bins Near Full",
      value: nearFull,
      sub: "+5 from yesterday",
      subColor: "text-red-500",
      icon: "📈",
      iconBg: "bg-yellow-50",
    },
    {
      label: "Scheduled Pickups Today",
      value: pickups.length,
      sub: `${pickups.filter(p => p.status === "completed").length} completed`,
      subColor: "text-green-600",
      icon: "📅",
      iconBg: "bg-green-50",
    },
    {
      label: "Active Alerts",
      value: 5,
      sub: "-2 from yesterday",
      subColor: "text-green-600",
      icon: "🔔",
      iconBg: "bg-red-50",
      placeholder: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 font-medium">{c.label}</span>
            <div className={`w-10 h-10 ${c.iconBg} rounded-xl flex items-center justify-center text-lg`}>
              {c.icon}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{c.value}</div>
          <div className={`text-xs font-medium ${c.subColor}`}>
            {c.sub}
            {c.placeholder && <span className="ml-2 text-gray-400">(placeholder)</span>}
          </div>
        </div>
      ))}
    </div>
  );
}