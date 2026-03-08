"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { DailyReportRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WasteTrendChart() {
  const [rows, setRows]       = useState<DailyReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.report30("BN-001").then(r => setRows(r.daily_rows)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const data = rows.map(r => ({
    day   : new Date(r.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fill  : parseFloat(r.avg_fill_pct.toFixed(1)),
    weight: parseFloat(r.total_weight_kg.toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Waste Collected Trend</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">BN-001 · 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="day" stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 12 }} />
          <Area type="monotone" dataKey="fill" stroke="#22c55e" fill="url(#grad)"
            strokeWidth={2.5} dot={{ fill: "#22c55e", r: 3 }} name="Avg Fill %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}