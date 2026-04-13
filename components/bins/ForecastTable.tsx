"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ForecastRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function ForecastTable({ binId }: { binId: string }) {
  const [rows, setRows]       = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.forecasts(binId).then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [binId]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>;

  return (
    <div className="card overflow-hidden">
      <div style={{
        padding: "16px 20px", borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>10-Day Forecast</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {rows[0]?.model_version ?? "Prophet v1"} · powered by Mohsen's model
          </p>
        </div>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {["Date","Predicted Fill","Predicted Weight","Recommended Pickup"].map(h => (
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
          {rows.map(r => {
            const fillColor = r.predicted_fill_pct >= 80 ? "#ef4444"
              : r.predicted_fill_pct >= 60 ? "#f59e0b" : "#22c55e";
            return (
              <tr key={r.id} className="table-row">
                <td style={{ padding: "11px 16px" }}>
                  <span className="mono" style={{ fontSize: 13, color: "var(--text-1)", fontWeight: 500 }}>
                    {r.forecast_date}
                  </span>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 64, height: 5, borderRadius: 99, background: "var(--bg-3)", overflow: "hidden" }}>
                      <div style={{
                        width: `${Math.min(r.predicted_fill_pct, 100)}%`,
                        height: "100%", borderRadius: 99, background: fillColor,
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: fillColor }}>
                      {r.predicted_fill_pct.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
                    {r.predicted_weight_kg.toFixed(2)} kg
                  </span>
                </td>
                <td style={{ padding: "11px 16px" }}>
                  <span style={{ fontSize: 12, color: "#60a5fa", fontWeight: 500 }}>
                    {r.recommended_pickup_date}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
