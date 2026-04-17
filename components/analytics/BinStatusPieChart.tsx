"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const COLORS = ["#16a34a", "#d97706", "#dc2626", "#9499b0"];
const LABELS = ["Operational", "Near Full", "Full", "Maintenance"];

export default function BinStatusPieChart() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.bins().then(setBins).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const counts = { operational: 0, near_full: 0, full: 0, maintenance: 0 };
  bins.forEach(b => { if (b.status in counts) counts[b.status as keyof typeof counts]++; });
  const data = Object.entries(counts)
    .map(([, v], i) => ({ name: LABELS[i], value: v }))
    .filter(d => d.value > 0);

  return (
    <div className="card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
        Bin Status Distribution
      </h2>
      <p style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 24 }}>Current operational status</p>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <ResponsiveContainer width={150} height={150}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={44} outerRadius={68}
              dataKey="value" strokeWidth={2} stroke="#ffffff">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#ffffff",
                border: "1px solid #e8eaf2",
                borderRadius: 10,
                fontSize: 12,
                color: "#0f1628",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((d, i) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i] }} />
                <span style={{ fontSize: 13, color: "var(--text-2)" }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}