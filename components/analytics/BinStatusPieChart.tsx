"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#6b7280"];
const LABELS = ["Operational", "Near Full", "Full", "Maintenance"];

export default function BinStatusPieChart() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.bins().then(setBins).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const counts = { operational: 0, near_full: 0, full: 0, maintenance: 0 };
  bins.forEach(b => { if (b.status in counts) counts[b.status as keyof typeof counts]++; });
  const data = Object.entries(counts).map(([, v], i) => ({ name: LABELS[i], value: v }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-900 mb-6">Bin Status Distribution</h2>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={180} height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-col gap-3 flex-1">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-sm text-gray-600">{d.name}</span>
              </div>
              <span className="font-bold text-gray-900">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}