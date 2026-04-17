"use client";
import { useState, useEffect, useRef } from "react";
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
  const [useOrTools, setUseOrTools] = useState(false); // default to heuristic — faster & works with 20 bins
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapInstanceRef.current) return;

    // Load Leaflet dynamically
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

  // Draw route on map when result changes
  useEffect(() => {
    if (!result || !mapInstanceRef.current) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing layers except tile layer
    map.eachLayer((layer: any) => {
      if (!layer._url) map.removeLayer(layer);
    });

    const makeIcon = (color: string, label: string, size: number) =>
      L.divIcon({
        className: "",
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:600;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${label}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

    const servedIds = new Set(result.route.map(n => n.id));

    // Draw markers
    result.route.forEach((node, idx) => {
      const color = node.is_depot ? "#22c55e" : "#3b82f6";
      const label = node.is_depot ? "D" : String(idx);
      const size  = node.is_depot ? 28 : 22;
      const marker = L.marker([node.lat, node.lng], { icon: makeIcon(color, label, size) });
      marker.bindPopup(`<b style="color:#111">${node.name}</b><br><span style="color:${node.is_depot ? "#16a34a" : "#2563eb"}">${node.is_depot ? "Depot (Start/End)" : "Stop #" + idx}</span>`);
      marker.addTo(map);
    });

    // Draw route line
    const latlngs = result.route.map(n => [n.lat, n.lng]);
    L.polyline(latlngs, {
      color: "#3b82f6", weight: 3, opacity: 0.8, dashArray: "8,5",
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds(latlngs);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [result]);

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
        body: JSON.stringify({
          use_ortools: useOrTools,
          solver_time_limit: 30,
          fill_threshold: 60, // lower threshold so we always get flagged bins
        }),
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
      background: "var(--bg-3)", borderRadius: 12,
      padding: "14px 16px", border: "1px solid var(--border)",
    }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: accent }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <AuthGuard allowedRoles={["collector", "regulator"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Route Optimizer</h1>
            <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>
              Aseel's OR-Tools model · auto-flags bins by fill level · optimized pickup route
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-2)", cursor: "pointer" }}>
              <input type="checkbox" checked={useOrTools} onChange={e => setUseOrTools(e.target.checked)}
                style={{ accentColor: "#22c55e" }} />
              Use OR-Tools (optimal, slower)
            </label>
            <button onClick={runOptimizer} disabled={loading} style={{
              background: loading ? "var(--bg-3)" : "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none", borderRadius: 10, padding: "9px 20px",
              fontSize: 13, fontWeight: 500,
              color: loading ? "var(--text-3)" : "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: loading ? "none" : "0 0 20px rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  Optimizing...
                </>
              ) : "Run Optimizer"}
            </button>
          </div>
        </div>

        {/* Map — always visible */}
        <div className="card fade-up-1" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Route Map</h2>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} /> Depot
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }} /> Bin stop
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 20, height: 2, background: "#3b82f6", display: "inline-block" }} /> Route
              </span>
            </div>
          </div>
          <div ref={mapRef} style={{ height: 460, width: "100%", background: "var(--bg-3)" }}>
            {!result && !loading && (
              <div style={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 10, color: "var(--text-3)",
              }}>
                <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13V7m0 13 6-3m-6-10 6-3m0 0 5.447 2.724A1 1 0 0 1 21 7.618v10.764a1 1 0 0 1-1.447.894L15 17m0-13v13" />
                </svg>
                <p style={{ fontSize: 13 }}>Click "Run Optimizer" to generate the route map</p>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "14px 18px", color: "#f87171", fontSize: 13,
          }}>{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div style={{
              width: 36, height: 36,
              border: "3px solid var(--bg-3)", borderTopColor: "#22c55e",
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }} />
            <div style={{ fontSize: 13, color: "var(--text-2)" }}>
              {useOrTools ? "Running CP-SAT solver (up to 30s)..." : "Running 2-opt heuristic..."}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="fade-up">

            {/* Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
              <MetricCard label="Bins Served" value={`${result.bins_served}/${result.bins_flagged}`}
                sub={`${result.service_level_pct}% service level`}
                accent={result.service_level_pct >= 90 ? "#22c55e" : "#f59e0b"} />
              <MetricCard label="Route Distance" value={`${result.total_dist_km} km`}
                sub="of 120 km limit" accent="#60a5fa" />
              <MetricCard label="Shift Time" value={`${result.total_time_hr} h`}
                sub="of 9 h limit" accent="#fbbf24" />
              <MetricCard label="Distance Saved" value={`+${result.dist_saved_pct}%`}
                sub={`baseline ${result.baseline_dist_km} km`} accent="#4ade80" />
              <MetricCard label="Solver" value={result.solver_status}
                sub={useOrTools ? "OR-Tools CP-SAT" : "2-opt heuristic"}
                accent={result.solver_status === "OPTIMAL" ? "#22c55e" : "#f59e0b"} />
            </div>

            {/* Constraints */}
            <div className="card" style={{ padding: "12px 18px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--text-3)" }}>Constraints:</span>
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
                  borderRadius: 99, padding: "3px 10px",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  {c.met ? "✓" : "✗"} {c.label}
                </span>
              ))}
            </div>
            
            {/* Google Maps button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  const stops = result.route.filter(n => !n.is_depot);
                  const origin = `${result.route[0].lat},${result.route[0].lng}`;
                  const destination = origin;
                  const waypoints = stops.map(n => `${n.lat},${n.lng}`).join("|");
                  const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&travelmode=driving`;
                  window.open(url, "_blank");
                }}
                style={{
                  background: "#4285F4",
                  border: "none", borderRadius: 10,
                  padding: "9px 18px",
                  fontSize: 13, fontWeight: 500,
                  color: "white", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", gap: 8,
                }}
              >
                🗺️ Open in Google Maps
              </button>
            </div>

            {/* Route sequence */}
            <div className="card" style={{ padding: "14px 20px" }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 12 }}>Stop Sequence</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {result.route.map((node, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      background: node.is_depot ? "rgba(34,197,94,0.15)" : "var(--bg-3)",
                      border: `1px solid ${node.is_depot ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                      borderRadius: 8, padding: "4px 10px",
                      fontSize: 12, fontWeight: node.is_depot ? 600 : 400,
                      color: node.is_depot ? "#4ade80" : "var(--text-2)",
                    }}>
                      {node.is_depot ? "🏁 Depot" : node.id}
                    </div>
                    {idx < result.route.length - 1 && (
                      <span style={{ color: "var(--text-3)", fontSize: 11 }}>→</span>
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