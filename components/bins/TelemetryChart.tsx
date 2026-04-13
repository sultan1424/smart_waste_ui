"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import type { TelemetryRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function TelemetryChart({ binId }: { binId: string }) {
  const [data, setData]       = useState<TelemetryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [show, setShow]       = useState<"fill_pct"|"weight_kg"|"both">("both");

  useEffect(() => {
    const to   = new Date().toISOString();
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    api.telemetry(binId, from, to)
      .then(rows => setData(rows.filter((_, i) => i % 6 === 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [binId]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>;

  const chartData = data.map(r => ({
    time:     new Date(r.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fill_pct: r.fill_pct,
    weight:   r.weight_kg,
  }));

  const tooltipStyle = {
    background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, fontSize: 12, color: "#f0f2f8",
  };

  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Telemetry — Last 7 Days</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{data.length} readings</p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {(["fill_pct","weight_kg","both"] as const).map(v => (
            <button key={v} onClick={() => setShow(v)} style={{
              fontSize: 11, padding: "4px 10px", borderRadius: 8,
              background: show === v ? "var(--bg-3)" : "transparent",
              border: `1px solid ${show === v ? "var(--border-2)" : "var(--border)"}`,
              color: show === v ? "var(--text-1)" : "var(--text-3)",
              cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}>
              {v === "fill_pct" ? "Fill %" : v === "weight_kg" ? "Weight" : "Both"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="time" stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
          <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b92a8" }} />
          {(show === "fill_pct" || show === "both") && (
            <Line type="monotone" dataKey="fill_pct" stroke="#22c55e" dot={false}
              name="Fill %" strokeWidth={2} />
          )}
          {(show === "weight_kg" || show === "both") && (
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" dot={false}
              name="Weight (kg)" strokeWidth={2} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
