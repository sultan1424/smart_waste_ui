"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#22c55e","#f59e0b","#ef4444","#545c72"];
const TOOLTIP_STYLE = {
  background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: 12, color: "#f0f2f8",
};

export default function CollectorAnalyticsPage() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.bins().then(setBins).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const fillRanges = [
    { range: "0–25%",  count: bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) <= 25).length },
    { range: "26–50%", count: bins.filter(b => { const f = b.latest_telemetry?.fill_pct ?? 0; return f > 25 && f <= 50; }).length },
    { range: "51–75%", count: bins.filter(b => { const f = b.latest_telemetry?.fill_pct ?? 0; return f > 50 && f <= 75; }).length },
    { range: "76–100%",count: bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) > 75).length },
  ];

  const urgent = bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) >= 80)
    .sort((a,b) => (b.latest_telemetry?.fill_pct ?? 0) - (a.latest_telemetry?.fill_pct ?? 0));

  const statusCounts = bins.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const avgFill = bins.length
    ? bins.reduce((s,b) => s + (b.latest_telemetry?.fill_pct ?? 0), 0) / bins.length : 0;

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        <div className="fade-up">
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Collector Analytics</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Bin fill levels and collection priority</p>
        </div>

        {/* Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }} className="fade-up-1">
          {[
            { label: "Total Bins",     value: bins.length, color: "#60a5fa" },
            { label: "Urgent (>80%)",  value: urgent.length, color: "#f87171" },
            { label: "Avg Fill",       value: `${avgFill.toFixed(1)}%`, color: "#fbbf24" },
            { label: "Operational",    value: bins.filter(b => b.status === "operational").length, color: "#4ade80" },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>{c.label}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fade-up-2">
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>Fill Level Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fillRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
                <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" name="Bins" fill="#22c55e" radius={[6,6,0,0]}
                  label={{ position: "top", fontSize: 11, fill: "#8b92a8" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>Status Distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" strokeWidth={0}>
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8b92a8" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent table */}
        {urgent.length > 0 && (
          <div className="card overflow-hidden fade-up-3">
            <div style={{
              padding: "14px 20px", borderBottom: "1px solid rgba(239,68,68,0.15)",
              background: "rgba(239,68,68,0.05)",
            }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "#f87171" }}>
                Urgent Collection Needed — {urgent.length} bins
              </h2>
              <p style={{ fontSize: 12, color: "rgba(248,113,113,0.6)", marginTop: 2 }}>
                Bins over 80% full
              </p>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Bin ID","Location","Fill Level","Last Reading"].map(h => (
                    <th key={h} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, fontWeight: 500, color: "var(--text-3)",
                      letterSpacing: "0.05em", textTransform: "uppercase",
                      background: "rgba(255,255,255,0.02)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {urgent.map(b => {
                  const fill = b.latest_telemetry?.fill_pct ?? 0;
                  return (
                    <tr key={b.id} className="table-row">
                      <td style={{ padding: "11px 16px" }}>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "#f87171" }}>{b.id}</span>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 13, color: "var(--text-2)" }}>{b.location_name}</td>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 80, height: 5, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
                            <div style={{ width: `${fill}%`, height: "100%", borderRadius: 99, background: "#ef4444" }} />
                          </div>
                          <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>{fill.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 11, color: "var(--text-3)" }} className="mono">
                        {b.latest_telemetry?.ts ? new Date(b.latest_telemetry.ts).toLocaleString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
