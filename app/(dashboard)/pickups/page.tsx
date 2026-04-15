"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TOOLTIP_STYLE = {
  background: "#1e2535", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, fontSize: 12, color: "#f0f2f8",
};

export default function PickupsPage() {
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState<"all"|"planned"|"completed"|"missed">("all");

  useEffect(() => {
    api.pickupsToday().then(setPickups).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const filtered  = filter === "all" ? pickups : pickups.filter(p => p.status === filter);
  const planned   = pickups.filter(p => p.status === "planned").length;
  const completed = pickups.filter(p => p.status === "completed").length;
  const missed    = pickups.filter(p => p.status === "missed").length;

  const byRoute = pickups.reduce((acc, p) => {
    acc[p.route_id] = (acc[p.route_id] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div className="fade-up">
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-1)" }}>Pickup Management</h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>Today's pickup schedule and route overview</p>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }} className="fade-up-1">
          {[
            { label: "Planned",   value: planned,   color: "#60a5fa", bg: "rgba(59,130,246,0.1)"  },
            { label: "Completed", value: completed, color: "#4ade80", bg: "rgba(34,197,94,0.1)"   },
            { label: "Missed",    value: missed,    color: "#f87171", bg: "rgba(239,68,68,0.1)"   },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 10 }}>{c.label}</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="fade-up-2">
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>
              Status Overview
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={[{ name: "Today", Planned: planned, Completed: completed, Missed: missed }]} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
                <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#8b92a8" }} />
                <Bar dataKey="Planned"   fill="#3b82f6" radius={[6,6,0,0]} />
                <Bar dataKey="Completed" fill="#22c55e" radius={[6,6,0,0]} />
                <Bar dataKey="Missed"    fill="#ef4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)", marginBottom: 16 }}>
              By Route
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={Object.entries(byRoute).map(([route, count]) => ({ route, count }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="route" stroke="#545c72" tick={{ fontSize: 10, fill: "#545c72" }} />
                <YAxis stroke="#545c72" tick={{ fontSize: 11, fill: "#545c72" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6,6,0,0]} name="Pickups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden fade-up-3">
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Today's Schedule</h2>
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{filtered.length} pickups</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(["all","planned","completed","missed"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 8,
                  background: filter === f ? "var(--bg-3)" : "transparent",
                  border: `1px solid ${filter === f ? "var(--border-2)" : "var(--border)"}`,
                  color: filter === f ? "var(--text-1)" : "var(--text-3)",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  textTransform: "capitalize",
                }}>{f}</button>
              ))}
            </div>
          </div>

          {loading ? <LoadingSpinner /> : error ? (
            <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["ID","Route","Time","Window","Bin","Priority","Status"].map(h => (
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
                  {filtered.map(p => (
                    <tr key={p.id} className="table-row">
                      <td style={{ padding: "11px 16px" }}>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                          SCH-{String(p.id).padStart(3,"0")}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 500, color: "#60a5fa" }}>
                        {p.route_id}
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span className="mono" style={{ fontSize: 12, color: "var(--text-2)" }}>
                          {new Date(p.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                          {new Date(p.window_start).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}–
                          {new Date(p.window_end).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "#4ade80" }}>
                          {p.bin_id}
                        </span>
                      </td>
                      <td style={{ padding: "11px 16px" }}><StatusBadge status={p.priority} /></td>
                      <td style={{ padding: "11px 16px" }}><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
