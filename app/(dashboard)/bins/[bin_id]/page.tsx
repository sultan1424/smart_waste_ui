"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { BinDetail, ReportResponse } from "@/types";
import TelemetryChart from "@/components/bins/TelemetryChart";
import ForecastTable from "@/components/bins/ForecastTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

function StatusPill({ fill }: { fill: number }) {
  if (fill >= 90) return <span style={{ fontSize:12, fontWeight:600, color:"#dc2626", background:"#fee2e2", padding:"3px 10px", borderRadius:99 }}>Critical</span>;
  if (fill >= 70) return <span style={{ fontSize:12, fontWeight:600, color:"#d97706", background:"#fef3c7", padding:"3px 10px", borderRadius:99 }}>Warning</span>;
  return <span style={{ fontSize:12, fontWeight:600, color:"#16a34a", background:"#dcfce7", padding:"3px 10px", borderRadius:99 }}>Operational</span>;
}

export default function BinDetailPage() {
  const { bin_id } = useParams<{ bin_id: string }>();
  const router = useRouter();
  const [bin, setBin]               = useState<BinDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [report, setReport]         = useState<ReportResponse | null>(null);
  const [repLoading, setRepLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

const fetchBin = (silent = false) => {
    if (!silent) setLoading(true);
    api.bin(bin_id)
      .then(data => { setBin(data); setLastUpdated(new Date()); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBin(false);
  }, [bin_id]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBin(true);
    }, 5000);
    return () => clearInterval(interval);
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
  const fillColor = fill >= 90 ? "#dc2626" : fill >= 70 ? "#d97706" : "#16a34a";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Back */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => router.back()} style={{
          background:"transparent", border:"none", cursor:"pointer",
          fontSize:13, fontWeight:500, color:"var(--text-3)",
          display:"flex", alignItems:"center", gap:6,
          fontFamily:"inherit", padding:0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}>
          ← Back
        </button>
        {lastUpdated && (
          <span style={{ fontSize:11, color:"var(--text-3)" }}>
            Auto-refreshes every 30s · Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Header card */}
      <div className="card fade-up" style={{ padding:24 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:24, fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.5px" }}>{bin.id}</h1>
              <StatusPill fill={fill} />
            </div>
            <p style={{ fontSize:13, color:"var(--text-2)" }}>{bin.name} · {bin.location_name}</p>
            <p style={{ fontSize:12, color:"var(--text-3)", marginTop:4 }}>
              Installed {new Date(bin.installed_at).toLocaleDateString()} · {bin.lat.toFixed(4)}, {bin.lng.toFixed(4)}
            </p>
          </div>
          <button onClick={generateReport} disabled={repLoading} style={{
            background: repLoading?"var(--bg-3)":"#16a34a",
            border:"none", borderRadius:10, padding:"10px 20px",
            fontSize:13, fontWeight:600,
            color: repLoading?"var(--text-3)":"white",
            cursor: repLoading?"not-allowed":"pointer",
            fontFamily:"inherit",
            boxShadow: repLoading?"none":"0 2px 8px rgba(22,163,74,0.25)",
            transition:"all 0.15s",
          }}>
            {repLoading ? "Generating..." : "Generate 30-day Report"}
          </button>
        </div>

        {/* Stat grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
          <div style={{ background:"var(--bg-3)", borderRadius:12, padding:"16px 18px", border:"1px solid var(--border)" }}>
            <p style={{ fontSize:11, fontWeight:500, color:"var(--text-3)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>Fill Level</p>
            <div style={{ height:5, borderRadius:99, background:"var(--border)", overflow:"hidden", marginBottom:10 }}>
              <div style={{ width:`${fill}%`, height:"100%", borderRadius:99, background:fillColor, transition:"width 0.6s" }} />
            </div>
            <p style={{ fontSize:22, fontWeight:700, color:fillColor }}>{fill.toFixed(1)}%</p>
          </div>
          {[
            { label:"Weight",      value:`${bin.latest_telemetry?.weight_kg?.toFixed(2) ?? "—"} kg` },
          ].map(c => (
            <div key={c.label} style={{ background:"var(--bg-3)", borderRadius:12, padding:"16px 18px", border:"1px solid var(--border)" }}>
              <p style={{ fontSize:11, fontWeight:500, color:"var(--text-3)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.05em" }}>{c.label}</p>
              <p style={{ fontSize:22, fontWeight:700, color:"var(--text-1)" }}>{c.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Report */}
      {report && (
        <div className="card fade-up" style={{ padding:22, borderLeft:"4px solid #16a34a" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)" }}>30-Day Report</h2>
            <span style={{ fontSize:11, fontWeight:600, color:"#16a34a", background:"#dcfce7", padding:"3px 10px", borderRadius:99 }}>{report.server_elapsed_ms} ms</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { label:"Total Pickups", value:String(report.pickup_count), color:"#3b5bdb", bg:"#eef2ff" },
              { label:"Avg Fill %", value:`${(report.daily_rows.reduce((s,r)=>s+r.avg_fill_pct,0)/(report.daily_rows.length||1)).toFixed(1)}%`, color:"#16a34a", bg:"#dcfce7" },
              { label:"Days Reported", value:String(report.daily_rows.length), color:"#6741d9", bg:"#ede9fe" },
            ].map(c => (
              <div key={c.label} style={{ background:c.bg, borderRadius:12, padding:"16px 18px" }}>
                <p style={{ fontSize:11, fontWeight:500, color:"var(--text-3)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>{c.label}</p>
                <p style={{ fontSize:26, fontWeight:700, color:c.color }}>{c.value}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize:11, color:"var(--text-3)", marginTop:12 }}>Period: {report.period_start} → {report.period_end}</p>
        </div>
      )}

      <div className="fade-up-1"><TelemetryChart binId={bin_id} key={refreshKey} /></div>
      <div className="fade-up-2"><ForecastTable binId={bin_id} /></div>
    </div>
  );
}