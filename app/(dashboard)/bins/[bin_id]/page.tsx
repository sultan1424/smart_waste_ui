"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { BinDetail, ReportResponse } from "@/types";
import TelemetryChart from "@/components/bins/TelemetryChart";
import ForecastTable from "@/components/bins/ForecastTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function BinDetailPage() {
  const { bin_id } = useParams<{ bin_id: string }>();
  const router = useRouter();
  const [bin, setBin]               = useState<BinDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [report, setReport]         = useState<ReportResponse | null>(null);
  const [repLoading, setRepLoading] = useState(false);

  useEffect(() => {
    api.bin(bin_id).then(setBin).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [bin_id]);

  const generateReport = async () => {
    setRepLoading(true);
    try { setReport(await api.report30(bin_id)); }
    catch (e: any) { alert(e.message); }
    finally { setRepLoading(false); }
  };

  if (loading) return <LoadingSpinner label="Loading bin..." />;
  if (error)   return <ErrorMessage message={error} />;
  if (!bin)    return null;

  const fill = bin.latest_telemetry?.fill_pct ?? 0;
  const fillColor = fill >= 90 ? "#ef4444" : fill >= 70 ? "#f59e0b" : "#22c55e";
  const statusKey = fill >= 90 ? "critical" : fill >= 70 ? "warning" : "operational";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Back */}
      <div className="fade-up">
        <button onClick={() => router.back()} style={{
          background: "transparent", border: "none", cursor: "pointer",
          fontSize: 13, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'DM Sans', sans-serif", padding: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          ← Back
        </button>
      </div>

      {/* Header card */}
      <div className="card fade-up-1" style={{ padding: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-1)" }}>
                {bin.id}
              </h1>
              <StatusBadge status={statusKey} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-2)" }}>{bin.name} · {bin.location_name}</p>
            <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>
              Installed {new Date(bin.installed_at).toLocaleDateString()} ·
              {" "}{bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}
            </p>
          </div>
          <button onClick={generateReport} disabled={repLoading} style={{
            background: repLoading ? "var(--bg-3)" : "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "none", borderRadius: 10, padding: "9px 18px",
            fontSize: 13, fontWeight: 500,
            color: repLoading ? "var(--text-3)" : "white",
            cursor: repLoading ? "not-allowed" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: repLoading ? "none" : "0 0 16px rgba(34,197,94,0.2)",
          }}>
            {repLoading ? "Generating..." : "Generate 30-day Report"}
          </button>
        </div>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
          {[
            { label: "Fill Level", value: `${fill.toFixed(1)}%`, color: fillColor, wide: true },
            { label: "Weight",     value: `${bin.latest_telemetry?.weight_kg?.toFixed(2) ?? "—"} kg`, color: "var(--text-1)" },
            { label: "Temperature",value: `${bin.latest_telemetry?.temp_c?.toFixed(1) ?? "—"} °C`,   color: "var(--text-1)" },
            { label: "Battery",    value: `${bin.latest_telemetry?.battery_v?.toFixed(2) ?? "—"} V`, color: "var(--text-1)" },
          ].map(c => (
            <div key={c.label} style={{
              background: "var(--bg-3)",
              borderRadius: 12,
              padding: "14px 16px",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8 }}>{c.label}</div>
              {c.label === "Fill Level" && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ height: 4, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
                    <div style={{ width: `${fill}%`, height: "100%", borderRadius: 99, background: fillColor, transition: "width 0.6s" }} />
                  </div>
                </div>
              )}
              <div className="mono" style={{ fontSize: 20, fontWeight: 600, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Report result */}
      {report && (
        <div className="card fade-up" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>30-Day Report</h2>
            <span className="mono" style={{
              fontSize: 11, color: "#4ade80",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              padding: "3px 10px", borderRadius: 99,
            }}>
              {report.server_elapsed_ms} ms
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Total Pickups",  value: report.pickup_count, color: "#60a5fa" },
              { label: "Avg Fill %",     value: `${(report.daily_rows.reduce((s,r) => s + r.avg_fill_pct, 0) / (report.daily_rows.length || 1)).toFixed(1)}%`, color: "#4ade80" },
              { label: "Days Reported",  value: report.daily_rows.length, color: "#c084fc" },
            ].map(c => (
              <div key={c.label} style={{
                background: "var(--bg-3)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)",
              }}>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>
          <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginTop: 12 }}>
            Period: {report.period_start} → {report.period_end}
          </p>
        </div>
      )}

      <div className="fade-up-2"><TelemetryChart binId={bin_id} /></div>
      <div className="fade-up-3"><ForecastTable binId={bin_id} /></div>
    </div>
  );
}
