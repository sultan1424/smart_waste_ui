"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import WasteTrendChart from "@/components/analytics/WasteTrendChart";
import BinStatusPieChart from "@/components/analytics/BinStatusPieChart";
import PickupBarChart from "@/components/analytics/PickupBarChart";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export default function AnalyticsPage() {
  const [running,  setRunning]  = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState("");

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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Analytics</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
              Aggregated waste and pickup insights — Regulator view
            </p>
          </div>
          <button onClick={runForecast} disabled={running} style={{
            background: running ? "var(--bg-3)" : "linear-gradient(135deg, #8b5cf6, #6d28d9)",
            border: "none", borderRadius: 10, padding: "9px 18px",
            fontSize: 13, fontWeight: 500,
            color: running ? "var(--text-3)" : "white",
            cursor: running ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: running ? "none" : "0 0 20px rgba(139,92,246,0.2)",
            display: "flex", alignItems: "center", gap: 8,
            flexShrink: 0,
          }}>
            {running ? (
              <>
                <div style={{
                  width: 14, height: 14,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
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
          <div className="card fade-up" style={{ padding: "14px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 500 }}>
                ✅ Forecast complete
              </span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                {result.total_bins} bins · {result.passed_mape} passed MAPE spec
              </span>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                Overall avg MAPE: {result.results?.length > 0
                  ? (result.results.reduce((s: number, r: any) => s + (r.mape ?? 0), 0) / result.results.length).toFixed(1)
                  : "—"}%
              </span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#f87171",
          }}>{error}</div>
        )}

        {running && (
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{
              width: 32, height: 32,
              border: "3px solid var(--bg-3)", borderTopColor: "#8b5cf6",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 6 }}>
              Training Prophet models for all 20 bins...
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              This may take 2-3 minutes
            </div>
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