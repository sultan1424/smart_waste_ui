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
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Waste Collected Trend</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>30-day fill % average</p>
        </div>
        <span style={{
          fontSize: 11, color: "var(--text-3)",
          background: "var(--bg-3)", padding: "4px 10px",
          borderRadius: 99, border: "1px solid var(--border)",
        }}>BN-001 · 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="day" stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
          <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} unit="%" />
          <Tooltip
            contentStyle={{
              background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10, fontSize: 12, color: "#f0f2f8",
            }} />
          <Area type="monotone" dataKey="fill" stroke="#22c55e" fill="url(#grad)"
            strokeWidth={2} dot={false} name="Avg Fill %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
