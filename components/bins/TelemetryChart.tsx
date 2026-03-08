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
  const [show, setShow]       = useState<"fill_pct" | "weight_kg" | "both">("both");

  useEffect(() => {
    const to   = new Date().toISOString();
    const from = new Date(Date.now() - 7 * 86400000).toISOString();
    api.telemetry(binId, from, to)
      .then(rows => setData(rows.filter((_, i) => i % 6 === 0)))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [binId]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  const chartData = data.map(r => ({
    time: new Date(r.ts).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    fill_pct: r.fill_pct,
    weight: r.weight_kg,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Telemetry — Last 7 Days</h2>
        <div className="flex gap-2">
          {(["fill_pct","weight_kg","both"] as const).map(v => (
            <button key={v} onClick={() => setShow(v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors
                ${show === v ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {v === "fill_pct" ? "Fill %" : v === "weight_kg" ? "Weight" : "Both"}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
          <Legend />
          {(show === "fill_pct" || show === "both") &&
            <Line type="monotone" dataKey="fill_pct" stroke="#22c55e" dot={false} name="Fill %" strokeWidth={2.5} />}
          {(show === "weight_kg" || show === "both") &&
            <Line type="monotone" dataKey="weight" stroke="#3b82f6" dot={false} name="Weight (kg)" strokeWidth={2.5} />}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}