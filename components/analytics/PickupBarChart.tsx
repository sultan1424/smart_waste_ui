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

  const data = [{
    name: "Today",
    Planned:   pickups.filter(p => p.status === "planned").length,
    Completed: pickups.filter(p => p.status === "completed").length,
    Missed:    pickups.filter(p => p.status === "missed").length,
  }];

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 20 }}>
        Pickups by Status
      </h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="name" stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
          <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
          <Tooltip contentStyle={{
            background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, fontSize: 12, color: "#f0f2f8",
          }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b92a8" }} />
          <Bar dataKey="Planned"   fill="#3b82f6" radius={[6,6,0,0]} />
          <Bar dataKey="Completed" fill="#22c55e" radius={[6,6,0,0]} />
          <Bar dataKey="Missed"    fill="#ef4444" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
