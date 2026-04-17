"use client";
import { useState, useEffect, useRef } from "react";
import AuthGuard from "@/components/auth/AuthGuard";

interface RouteNode { id: string; name: string; lat: number; lng: number; is_depot: boolean; }
interface RouteResult {
  solver_status: string; route: RouteNode[];
  total_dist_km: number; total_time_hr: number;
  bins_served: number; bins_flagged: number;
  service_level_pct: number; baseline_dist_km: number;
  dist_saved_pct: number;
  constraints_met: { distance: boolean; time: boolean; coverage: boolean };
}

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "";

export default function RouteOptimizerPage() {
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<RouteResult | null>(null);
  const [error,      setError]      = useState("");
  const [useOrTools, setUseOrTools] = useState(false);
  const mapRef         = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || mapInstanceRef.current) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = (window as any).L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView([26.435, 50.100], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors", maxZoom: 18,
      }).addTo(map);
      mapInstanceRef.current = map;
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!result || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    map.eachLayer((layer: any) => { if (!layer._url) map.removeLayer(layer); });
    const makeIcon = (color: string, label: string, size: number) =>
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${label}</div>`,
        iconSize: [size, size], iconAnchor: [size/2, size/2],
      });
    result.route.forEach((node, idx) => {
      const color = node.is_depot ? "#16a34a" : "#3b5bdb";
      const label = node.is_depot ? "D" : String(idx);
      const size  = node.is_depot ? 30 : 24;
      L.marker([node.lat, node.lng], { icon: makeIcon(color, label, size) })
        .bindPopup(`<b style="color:#111">${node.name}</b><br><span style="color:${node.is_depot?"#16a34a":"#3b5bdb"}">${node.is_depot?"Depot":"Stop #"+idx}</span>`)
        .addTo(map);
    });
    const latlngs = result.route.map(n => [n.lat, n.lng]);
    L.polyline(latlngs, { color: "#3b5bdb", weight: 3, opacity: 0.7, dashArray: "8 5" }).addTo(map);
    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
  }, [result]);

  const runOptimizer = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      const auth = JSON.parse(localStorage.getItem("sw_auth") ?? "{}");
      const res = await fetch(`${BASE}/api/v1/routes/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${auth.token}` },
        body: JSON.stringify({ use_ortools: useOrTools, solver_time_limit: 30, fill_threshold: 60 }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.detail ?? `Error ${res.status}`); }
      setResult(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <AuthGuard allowedRoles={["collector","regulator"]}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div className="fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.3px" }}>Route Optimizer</h1>
            <p style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>
              Aseel's OR-Tools model · auto-flags bins by fill level · optimized pickup route
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"var(--text-2)", cursor:"pointer", userSelect:"none" }}>
              <input type="checkbox" checked={useOrTools} onChange={e => setUseOrTools(e.target.checked)} style={{ accentColor:"#3b5bdb" }} />
              Use OR-Tools (optimal, slower)
            </label>
            <button onClick={runOptimizer} disabled={loading} style={{
              background: loading ? "var(--bg-3)" : "#3b5bdb",
              border:"none", borderRadius:10, padding:"10px 22px",
              fontSize:13, fontWeight:600,
              color: loading ? "var(--text-3)" : "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"inherit",
              boxShadow: loading ? "none" : "0 2px 8px rgba(59,91,219,0.25)",
              display:"flex", alignItems:"center", gap:8, transition:"all 0.15s",
            }}>
              {loading ? (
                <>
                  <div style={{ width:14, height:14, border:"2px solid #d1d5db", borderTopColor:"#3b5bdb", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  Optimizing...
                </>
              ) : "Run Optimizer"}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="card fade-up-1" style={{ overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)" }}>Route Map</h2>
            <div style={{ display:"flex", gap:16, fontSize:12, color:"var(--text-3)" }}>
              {[["#16a34a","Depot"],["#3b5bdb","Bin stop"]].map(([c,l]) => (
                <span key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", background:c, display:"inline-block" }} />{l}
                </span>
              ))}
              <span style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ width:20, height:2, background:"#3b5bdb", display:"inline-block" }} />Route
              </span>
            </div>
          </div>
          <div ref={mapRef} style={{ height:460, width:"100%", background:"var(--bg-3)" }}>
            {!result && !loading && (
              <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:10, color:"var(--text-3)" }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13V7m0 13 6-3m-6-10 6-3m0 0 5.447 2.724A1 1 0 0 1 21 7.618v10.764a1 1 0 0 1-1.447.894L15 17m0-13v13" />
                </svg>
                <p style={{ fontSize:13 }}>Click "Run Optimizer" to generate the route map</p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#dc2626" }}>{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card" style={{ padding:32, textAlign:"center" }}>
            <div style={{ width:36, height:36, border:"3px solid #e8eaf2", borderTopColor:"#3b5bdb", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 14px" }} />
            <div style={{ fontSize:14, fontWeight:500, color:"var(--text-1)", marginBottom:4 }}>
              {useOrTools ? "Running CP-SAT solver (up to 30s)..." : "Running 2-opt heuristic..."}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }} className="fade-up">

            {/* Metrics */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }}>
              {[
                { label:"Bins Served",     value:`${result.bins_served}/${result.bins_flagged}`, sub:`${result.service_level_pct}% service level`, color: result.service_level_pct>=90?"#16a34a":"#d97706", bg: result.service_level_pct>=90?"#dcfce7":"#fef3c7" },
                { label:"Route Distance",  value:`${result.total_dist_km} km`, sub:"of 120 km limit",             color:"#3b5bdb", bg:"#eef2ff" },
                { label:"Shift Time",      value:`${result.total_time_hr} h`,  sub:"of 9 h limit",                color:"#d97706", bg:"#fef3c7" },
                { label:"Distance Saved",  value:`+${result.dist_saved_pct}%`, sub:`baseline ${result.baseline_dist_km} km`, color:"#16a34a", bg:"#dcfce7" },
                { label:"Solver",          value:result.solver_status,         sub:useOrTools?"OR-Tools CP-SAT":"2-opt heuristic", color: result.solver_status==="OPTIMAL"?"#16a34a":"#d97706", bg: result.solver_status==="OPTIMAL"?"#dcfce7":"#fef3c7" },
              ].map(c => (
                <div key={c.label} style={{ background:"var(--bg-2)", border:"1px solid var(--border)", borderRadius:12, padding:"16px 18px", boxShadow:"var(--shadow)" }}>
                  <p style={{ fontSize:11, fontWeight:500, color:"var(--text-3)", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.05em" }}>{c.label}</p>
                  <p style={{ fontSize:20, fontWeight:700, color:c.color }}>{c.value}</p>
                  {c.sub && <p style={{ fontSize:11, color:"var(--text-3)", marginTop:4 }}>{c.sub}</p>}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="card" style={{ padding:"14px 20px", display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ fontSize:12, fontWeight:500, color:"var(--text-3)" }}>Constraints:</span>
              {[
                { label:"Distance ≤ 120 km", met:result.constraints_met.distance },
                { label:"Time ≤ 9 h",         met:result.constraints_met.time     },
                { label:"Coverage ≥ 90%",     met:result.constraints_met.coverage },
              ].map(c => (
                <span key={c.label} style={{
                  fontSize:12, fontWeight:600,
                  color: c.met?"#16a34a":"#dc2626",
                  background: c.met?"#dcfce7":"#fee2e2",
                  borderRadius:99, padding:"4px 12px",
                  display:"inline-flex", alignItems:"center", gap:5,
                }}>
                  {c.met?"✓":"✗"} {c.label}
                </span>
              ))}
            </div>

            {/* Google Maps button */}
            <div style={{ display:"flex", justifyContent:"flex-end" }}>
              <button onClick={() => {
                const stops = result.route.filter(n => !n.is_depot);
                const origin = `${result.route[0].lat},${result.route[0].lng}`;
                const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${origin}&waypoints=${stops.map(n=>`${n.lat},${n.lng}`).join("|")}&travelmode=driving`;
                window.open(url, "_blank");
              }} style={{
                background:"#4285F4", border:"none", borderRadius:10,
                padding:"10px 20px", fontSize:13, fontWeight:600,
                color:"white", cursor:"pointer", fontFamily:"inherit",
                display:"flex", alignItems:"center", gap:8,
                boxShadow:"0 2px 8px rgba(66,133,244,0.25)",
              }}>
                🗺️ Open in Google Maps
              </button>
            </div>

            {/* Stop sequence */}
            <div className="card" style={{ padding:"18px 20px" }}>
              <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", marginBottom:14 }}>Stop Sequence</h2>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
                {result.route.map((node, idx) => (
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{
                      background: node.is_depot?"#dcfce7":"var(--bg-3)",
                      border: `1px solid ${node.is_depot?"#86efac":"var(--border)"}`,
                      borderRadius:8, padding:"5px 12px",
                      fontSize:12, fontWeight: node.is_depot?700:500,
                      color: node.is_depot?"#16a34a":"var(--text-2)",
                    }}>
                      {node.is_depot ? "⬛ Depot" : node.id}
                    </div>
                    {idx < result.route.length-1 && (
                      <span style={{ color:"var(--text-3)", fontSize:11 }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}