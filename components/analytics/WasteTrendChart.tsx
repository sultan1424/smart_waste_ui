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
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Waste Collection Trend</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 4 }}>30-day average fill level</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 500, color: "var(--text-3)",
          background: "var(--bg-3)", padding: "5px 12px",
          borderRadius: 99, border: "1px solid var(--border)",
        }}>BN-001 · 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b5bdb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b5bdb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf2" vertical={false} />
          <XAxis dataKey="day" stroke="#9499b0" tick={{ fontSize: 11, fill: "#9499b0" }} axisLine={false} tickLine={false} />
          <YAxis stroke="#9499b0" tick={{ fontSize: 11, fill: "#9499b0" }} axisLine={false} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{
              background: "#ffffff", border: "1px solid #e8eaf2",
              borderRadius: 10, fontSize: 12, color: "#0f1628",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            cursor={{ stroke: "#3b5bdb", strokeWidth: 1, strokeDasharray: "4 4" }}
          />
          <Area type="monotone" dataKey="fill" stroke="#3b5bdb" fill="url(#fillGrad)"
            strokeWidth={2.5} dot={false} name="Avg Fill %" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}