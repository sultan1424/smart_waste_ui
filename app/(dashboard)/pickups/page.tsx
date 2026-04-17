"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const TOOLTIP = {
  background: "#ffffff", border: "1px solid #e8eaf2",
  borderRadius: 10, fontSize: 12, color: "#0f1628",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function PriorityPill({ p }: { p: string }) {
  const m: Record<string, {color:string;bg:string}> = {
    high:   { color:"#dc2626", bg:"#fee2e2" },
    medium: { color:"#d97706", bg:"#fef3c7" },
    low:    { color:"#16a34a", bg:"#dcfce7" },
  };
  const s = m[p?.toLowerCase()] ?? { color:"#6b7280", bg:"#f3f4f6" };
  return <span style={{ fontSize:11, fontWeight:600, color:s.color, background:s.bg, padding:"3px 10px", borderRadius:99 }}>{p}</span>;
}

function StatusPill({ s }: { s: string }) {
  const m: Record<string, {color:string;bg:string}> = {
    planned:   { color:"#3b5bdb", bg:"#eef2ff" },
    completed: { color:"#16a34a", bg:"#dcfce7" },
    missed:    { color:"#dc2626", bg:"#fee2e2" },
  };
  const c = m[s?.toLowerCase()] ?? { color:"#6b7280", bg:"#f3f4f6" };
  return <span style={{ fontSize:11, fontWeight:600, color:c.color, background:c.bg, padding:"3px 10px", borderRadius:99 }}>{s}</span>;
}

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
  const byRoute   = pickups.reduce((acc, p) => { acc[p.route_id] = (acc[p.route_id] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div className="fade-up">
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.3px" }}>Pickup Management</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>Today's pickup schedule and route overview</p>
        </div>

        {/* Summary cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }} className="fade-up-1">
          {[
            { label:"Planned",   value:planned,   color:"#3b5bdb", bg:"#eef2ff" },
            { label:"Completed", value:completed, color:"#16a34a", bg:"#dcfce7" },
            { label:"Missed",    value:missed,    color:"#dc2626", bg:"#fee2e2" },
          ].map(c => (
            <div key={c.label} className="card" style={{ padding:"20px 22px" }}>
              <p style={{ fontSize:12, fontWeight:500, color:"var(--text-3)", marginBottom:12 }}>{c.label}</p>
              <p style={{ fontSize:34, fontWeight:700, color:c.color, letterSpacing:"-0.5px" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="fade-up-2">
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", marginBottom:4 }}>Status Overview</h2>
            <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:20 }}>Today's collection breakdown</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[{ name:"Today", Planned:planned, Completed:completed, Missed:missed }]} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf2" vertical={false} />
                <XAxis dataKey="name" stroke="#9499b0" tick={{ fontSize:12, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9499b0" tick={{ fontSize:12, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill:"rgba(59,91,219,0.04)" }} />
                <Legend wrapperStyle={{ fontSize:12, color:"#4b5675", paddingTop:12 }} />
                <Bar dataKey="Planned"   fill="#3b5bdb" radius={[6,6,0,0]} />
                <Bar dataKey="Completed" fill="#16a34a" radius={[6,6,0,0]} />
                <Bar dataKey="Missed"    fill="#dc2626" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", marginBottom:4 }}>By Route</h2>
            <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:20 }}>Pickups per route today</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={Object.entries(byRoute).map(([route, count]) => ({ route, count }))} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf2" vertical={false} />
                <XAxis dataKey="route" stroke="#9499b0" tick={{ fontSize:11, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9499b0" tick={{ fontSize:12, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill:"rgba(103,65,217,0.04)" }} />
                <Bar dataKey="count" fill="#6741d9" radius={[6,6,0,0]} name="Pickups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden fade-up-3">
          <div style={{ padding:"18px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)" }}>Today's Schedule</h2>
              <p style={{ fontSize:12, color:"var(--text-3)", marginTop:2 }}>{filtered.length} pickups</p>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {(["all","planned","completed","missed"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  fontSize:11, fontWeight:500, padding:"5px 12px", borderRadius:8,
                  background: filter===f ? "#eef2ff" : "transparent",
                  border: `1px solid ${filter===f ? "#c7d2fe" : "var(--border)"}`,
                  color: filter===f ? "#3b5bdb" : "var(--text-3)",
                  cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize",
                }}>{f}</button>
              ))}
            </div>
          </div>

          {loading ? <LoadingSpinner /> : error ? (
            <div style={{ padding:16 }}><ErrorMessage message={error} /></div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:"var(--bg-3)", borderBottom:"1px solid var(--border)" }}>
                    {["ID","Route","Time","Window","Bin","Priority","Status"].map(h => (
                      <th key={h} style={{
                        padding:"10px 16px", textAlign:"left",
                        fontSize:11, fontWeight:600, color:"var(--text-3)",
                        letterSpacing:"0.06em", textTransform:"uppercase",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="table-row">
                      <td style={{ padding:"12px 16px", fontSize:12, color:"var(--text-3)" }}>SCH-{String(p.id).padStart(3,"0")}</td>
                      <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#3b5bdb" }}>{p.route_id}</td>
                      <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-2)" }}>
                        {new Date(p.scheduled_at).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:"var(--text-3)" }}>
                        {new Date(p.window_start).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}–{new Date(p.window_end).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </td>
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>{p.bin_id}</span>
                      </td>
                      <td style={{ padding:"12px 16px" }}><PriorityPill p={p.priority} /></td>
                      <td style={{ padding:"12px 16px" }}><StatusPill s={p.status} /></td>
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