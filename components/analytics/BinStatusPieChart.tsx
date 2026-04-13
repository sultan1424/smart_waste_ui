"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const COLORS = ["#22c55e","#f59e0b","#ef4444","#545c72"];
const LABELS = ["Operational","Near Full","Full","Maintenance"];

export default function BinStatusPieChart() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.bins().then(setBins).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const counts = { operational: 0, near_full: 0, full: 0, maintenance: 0 };
  bins.forEach(b => { if (b.status in counts) counts[b.status as keyof typeof counts]++; });
  const data = Object.entries(counts).map(([, v], i) => ({ name: LABELS[i], value: v })).filter(d => d.value > 0);

  return (
    <div className="card" style={{ padding: 20 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 20 }}>
        Bin Status Distribution
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={0}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{
              background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, fontSize: 12, color: "#f0f2f8",
            }} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {data.map((d, i) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                <span style={{ fontSize: 12, color: "var(--text-2)" }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
