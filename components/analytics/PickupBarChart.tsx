"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function PickupBarChart() {
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.pickupsToday().then(setPickups).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const planned   = pickups.filter(p => p.status === "planned").length;
  const completed = pickups.filter(p => p.status === "completed").length;
  const missed    = pickups.filter(p => p.status === "missed").length;

  const data = [{ name: "Today", Planned: planned, Completed: completed, Missed: missed }];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-6">Pickups: Planned vs Completed</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
          <Legend />
          <Bar dataKey="Planned"   fill="#3b82f6" radius={[6,6,0,0]} />
          <Bar dataKey="Completed" fill="#22c55e" radius={[6,6,0,0]} />
          <Bar dataKey="Missed"    fill="#ef4444" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}