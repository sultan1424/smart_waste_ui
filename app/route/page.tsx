"use client";
import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";

interface RouteNode {
  id: string; name: string; lat: number; lng: number; is_depot: boolean;
}
interface RouteResult {
  solver_status: string;
  route: RouteNode[];
  total_dist_km: number;
  total_time_hr: number;
  bins_served: number;
  bins_flagged: number;
  service_level_pct: number;
  baseline_dist_km: number;
  dist_saved_pct: number;
  constraints_met: { distance: boolean; time: boolean; coverage: boolean };
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export default function RouteOptimizerPage() {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<RouteResult | null>(null);
  const [error,    setError]    = useState("");
  const [useOrTools, setUseOrTools] = useState(true);

  const runOptimizer = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const auth = JSON.parse(localStorage.getItem("sw_auth") ?? "{}");
      const res = await fetch(`${BASE}/api/v1/routes/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ use_ortools: useOrTools, solver_time_limit: 30 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail ?? `Error ${res.status}`);
      }
      setResult(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ label, value, sub, accent = "#22c55e" }: any) => (
    <div style={{
      background: "var(--bg-3)",
      borderRadius: 12,
      padding: "14px 16px",
      border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <AuthGuard allowedRoles={["collector", "regulator"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Route Optimizer</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
              OR-Tools CP-SAT solver · auto-flags bins ≥ 80% fill · ≥ 90% service level required
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 12, color: "var(--text-2)", cursor: "pointer",
            }}>
              <input
                type="checkbox"
                checked={useOrTools}
                onChange={e => setUseOrTools(e.target.checked)}
                style={{ accentColor: "#22c55e" }}
              />
              Use OR-Tools (slower, optimal)
            </label>
            <button
              onClick={runOptimizer}
              disabled={loading}
              style={{
                background: loading ? "var(--bg-3)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none",
                borderRadius: 10,
                padding: "9px 20px",
                fontSize: 13,
                fontWeight: 500,
                color: loading ? "var(--text-3)" : "white",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: loading ? "none" : "0 0 20px rgba(34,197,94,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Optimizing...
                </>
              ) : "Run Optimizer"}
            </button>
          </div>
        </div>

        {/* Info box */}
        {!result && !loading && !error && (
          <div className="card fade-up-1" style={{ padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { label: "Algorithm", value: useOrTools ? "CP-SAT (OR-Tools)" : "2-opt Heuristic", color: "#8b5cf6" },
                { label: "Max Distance", value: "120 km", color: "#3b82f6" },
                { label: "Max Shift", value: "9 hours", color: "#f59e0b" },
              ].map(i => (
                <div key={i.label} style={{
                  background: "var(--bg-3)", borderRadius: 10,
                  padding: "14px 16px", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{i.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: i.color }}>{i.value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>
              Click <strong style={{ color: "var(--text-2)" }}>Run Optimizer</strong> to compute the optimal
              pickup route for today. Bins with fill ≥ 80% are automatically flagged. The solver will find
              the shortest route that services at least 90% of flagged bins within the shift constraints.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "14px 18px", color: "#f87171", fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <div style={{
              width: 40, height: 40,
              border: "3px solid var(--bg-3)",
              borderTopColor: "#22c55e",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }} />
            <div style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 6 }}>
              {useOrTools ? "Running CP-SAT solver..." : "Running 2-opt heuristic..."}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>
              {useOrTools ? "This may take up to 30 seconds" : "Should be done shortly"}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-up">
            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
              <MetricCard label="Bins Served" value={`${result.bins_served}/${result.bins_flagged}`}
                sub={`${result.service_level_pct}% service level`}
                accent={result.service_level_pct >= 90 ? "#22c55e" : "#ef4444"} />
              <MetricCard label="Route Distance" value={`${result.total_dist_km} km`}
                sub={`of 120 km limit`} accent="#3b82f6" />
              <MetricCard label="Shift Time" value={`${result.total_time_hr} h`}
                sub={`of 9 h limit`} accent="#f59e0b" />
              <MetricCard label="Distance Saved" value={`+${result.dist_saved_pct}%`}
                sub={`vs baseline ${result.baseline_dist_km} km`} accent="#22c55e" />
              <MetricCard label="Solver" value={result.solver_status}
                sub={useOrTools ? "OR-Tools CP-SAT" : "2-opt heuristic"}
                accent={result.solver_status === "OPTIMAL" ? "#22c55e" : "#f59e0b"} />
            </div>

            {/* Constraints */}
            <div className="card" style={{ padding: "14px 18px", display: "flex", gap: 16, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--text-3)", marginRight: 4 }}>Constraints:</span>
              {[
                { label: "Distance ≤ 120 km", met: result.constraints_met.distance },
                { label: "Time ≤ 9 h",         met: result.constraints_met.time     },
                { label: "Coverage ≥ 90%",     met: result.constraints_met.coverage },
              ].map(c => (
                <span key={c.label} style={{
                  fontSize: 12, fontWeight: 500,
                  color: c.met ? "#4ade80" : "#f87171",
                  background: c.met ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${c.met ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 99,
                  padding: "3px 10px",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                  {c.met ? "✓" : "✗"} {c.label}
                </span>
              ))}
            </div>

            {/* Route sequence */}
            <div className="card overflow-hidden">
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Optimized Route</h2>
                <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
                  {result.route.length} stops including depot
                </p>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {result.route.map((node, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        background: node.is_depot ? "rgba(34,197,94,0.15)" : "var(--bg-3)",
                        border: `1px solid ${node.is_depot ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontWeight: node.is_depot ? 600 : 400,
                        color: node.is_depot ? "#4ade80" : "var(--text-2)",
                      }}>
                        {node.is_depot ? "🏁 Depot" : node.name.replace("Smart Bin ", "BN-")}
                      </div>
                      {idx < result.route.length - 1 && (
                        <span style={{ color: "var(--text-3)", fontSize: 12 }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Route table */}
            <div className="card overflow-hidden">
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Stop Details</h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Stop","Bin ID","Location","Coordinates"].map(h => (
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
                  {result.route.map((node, idx) => (
                    <tr key={idx} className="table-row">
                      <td style={{ padding: "10px 16px" }}>
                        <span className="mono" style={{
                          fontSize: 12, fontWeight: 600,
                          color: node.is_depot ? "#4ade80" : "var(--text-3)",
                        }}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span className="mono" style={{
                          fontSize: 13, fontWeight: 500,
                          color: node.is_depot ? "#4ade80" : "var(--text-1)",
                        }}>
                          {node.is_depot ? "DEPOT" : node.id}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "var(--text-2)" }}>
                        {node.name}
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                          {node.lat.toFixed(4)}, {node.lng.toFixed(4)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
