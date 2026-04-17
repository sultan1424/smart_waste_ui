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
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
        Pickups by Status
      </h2>
      <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 24 }}>Today's collection overview</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={6} barCategoryGap="40%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf2" vertical={false} />
          <XAxis dataKey="name" stroke="#9499b0" tick={{ fontSize: 12, fill: "#9499b0" }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9499b0" tick={{ fontSize: 12, fill: "#9499b0" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#ffffff", border: "1px solid #e8eaf2",
              borderRadius: 10, fontSize: 12, color: "#0f1628",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            cursor={{ fill: "rgba(59,91,219,0.04)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#4b5675", paddingTop: 12 }} />
          <Bar dataKey="Planned"   fill="#3b5bdb" radius={[6,6,0,0]} />
          <Bar dataKey="Completed" fill="#16a34a" radius={[6,6,0,0]} />
          <Bar dataKey="Missed"    fill="#dc2626" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}