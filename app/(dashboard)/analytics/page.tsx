"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import WasteTrendChart from "@/components/analytics/WasteTrendChart";
import BinStatusPieChart from "@/components/analytics/BinStatusPieChart";
import PickupBarChart from "@/components/analytics/PickupBarChart";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AnalyticsPage() {
  const [running, setRunning] = useState(false);
  const [result,  setResult]  = useState<any>(null);
  const [error,   setError]   = useState("");

  const runForecast = async () => {
    setRunning(true);
    setError("");
    setResult(null);
    try {
      const auth = JSON.parse(localStorage.getItem("sw_auth") ?? "{}");
      const res = await fetch(`${BASE}/api/v1/forecasts/run`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <AuthGuard allowedRoles={["regulator"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.3px" }}>Analytics</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
              Aggregated waste and pickup insights — Regulator view
            </p>
          </div>
          <button onClick={runForecast} disabled={running} style={{
            background: running ? "var(--bg-3)" : "#6741d9",
            border: "none", borderRadius: 10, padding: "10px 20px",
            fontSize: 13, fontWeight: 600,
            color: running ? "var(--text-3)" : "white",
            cursor: running ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 8,
            flexShrink: 0,
            boxShadow: running ? "none" : "0 2px 8px rgba(103,65,217,0.25)",
            transition: "all 0.15s",
          }}>
            {running ? (
              <>
                <div style={{
                  width: 14, height: 14,
                  border: "2px solid #d1d5db",
                  borderTopColor: "#6741d9",
                  borderRadius: "50%",
                  animation: "spin 0.7s linear infinite",
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Running Prophet...
              </>
            ) : "Run Prophet Forecast"}
          </button>
        </div>

        {/* Forecast result */}
        {result && (
          <div className="card fade-up" style={{ padding: "14px 20px", borderLeft: "4px solid #16a34a" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>✓ Forecast complete</span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {result.total_bins} bins · {result.passed_mape} passed MAPE spec
              </span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                Avg MAPE: {result.results?.length > 0
                  ? (result.results.reduce((s: number, r: any) => s + (r.mape ?? 0), 0) / result.results.length).toFixed(1)
                  : "—"}%
              </span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#dc2626",
          }}>{error}</div>
        )}

        {running && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{
              width: 36, height: 36,
              border: "3px solid #e8eaf2", borderTopColor: "#6741d9",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 14px",
            }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-1)", marginBottom: 4 }}>
              Training Prophet models for all 20 bins...
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>This may take 2–3 minutes</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fade-up-1">
          <BinStatusPieChart />
          <PickupBarChart />
        </div>
        <div className="fade-up-2">
          <WasteTrendChart />
        </div>
      </div>
    </AuthGuard>
  );
}