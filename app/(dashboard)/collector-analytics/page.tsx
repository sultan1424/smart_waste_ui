"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#16a34a","#d97706","#dc2626","#9499b0"];
const TOOLTIP = {
  background:"#ffffff", border:"1px solid #e8eaf2",
  borderRadius:10, fontSize:12, color:"#0f1628",
  boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
};

export default function CollectorAnalyticsPage() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.bins().then(setBins).finally(() => setLoading(false)); }, []);
  if (loading) return <LoadingSpinner />;

  const fillRanges = [
    { range:"0–25%",   count:bins.filter(b=>(b.latest_telemetry?.fill_pct??0)<=25).length },
    { range:"26–50%",  count:bins.filter(b=>{const f=b.latest_telemetry?.fill_pct??0;return f>25&&f<=50;}).length },
    { range:"51–75%",  count:bins.filter(b=>{const f=b.latest_telemetry?.fill_pct??0;return f>50&&f<=75;}).length },
    { range:"76–100%", count:bins.filter(b=>(b.latest_telemetry?.fill_pct??0)>75).length },
  ];

  const urgent = bins.filter(b=>(b.latest_telemetry?.fill_pct??0)>=80)
    .sort((a,b)=>(b.latest_telemetry?.fill_pct??0)-(a.latest_telemetry?.fill_pct??0));

  const statusCounts = bins.reduce((acc,b)=>{ acc[b.status]=(acc[b.status]??0)+1; return acc; },{} as Record<string,number>);
  const pieData = Object.entries(statusCounts).map(([name,value])=>({name,value}));
  const avgFill = bins.length ? bins.reduce((s,b)=>s+(b.latest_telemetry?.fill_pct??0),0)/bins.length : 0;

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div className="fade-up">
          <h1 style={{ fontSize:22, fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.3px" }}>Collector Analytics</h1>
          <p style={{ fontSize:13, color:"var(--text-3)", marginTop:4 }}>Bin fill levels and collection priority</p>
        </div>

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="fade-up-1">
          {[
            { label:"Total Bins",    value:String(bins.length),                                         color:"#3b5bdb", bg:"#eef2ff" },
            { label:"Urgent (>80%)", value:String(urgent.length),                                       color:"#dc2626", bg:"#fee2e2" },
            { label:"Avg Fill",      value:`${avgFill.toFixed(1)}%`,                                    color:"#d97706", bg:"#fef3c7" },
            { label:"Operational",   value:String(bins.filter(b=>b.status==="operational").length),     color:"#16a34a", bg:"#dcfce7" },
          ].map(c=>(
            <div key={c.label} className="card" style={{ padding:"20px 22px" }}>
              <p style={{ fontSize:12, fontWeight:500, color:"var(--text-3)", marginBottom:12 }}>{c.label}</p>
              <p style={{ fontSize:34, fontWeight:700, color:c.color, letterSpacing:"-0.5px" }}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }} className="fade-up-2">
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", marginBottom:4 }}>Fill Level Distribution</h2>
            <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:20 }}>Bins grouped by fill percentage</p>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={fillRanges} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eaf2" vertical={false} />
                <XAxis dataKey="range" stroke="#9499b0" tick={{ fontSize:11, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <YAxis stroke="#9499b0" tick={{ fontSize:11, fill:"#9499b0" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill:"rgba(59,91,219,0.04)" }} />
                <Bar dataKey="count" name="Bins" fill="#3b5bdb" radius={[6,6,0,0]}
                  label={{ position:"top", fontSize:11, fill:"#9499b0" }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:24 }}>
            <h2 style={{ fontSize:15, fontWeight:600, color:"var(--text-1)", marginBottom:4 }}>Status Distribution</h2>
            <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:20 }}>Current bin operational status</p>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                  dataKey="value" strokeWidth={2} stroke="#ffffff">
                  {pieData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
                <Legend wrapperStyle={{ fontSize:12, color:"#4b5675", paddingTop:8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent table */}
        {urgent.length>0 && (
          <div className="card overflow-hidden fade-up-3">
            <div style={{ padding:"16px 20px", borderBottom:"1px solid #fecaca", background:"#fff5f5" }}>
              <h2 style={{ fontSize:15, fontWeight:600, color:"#dc2626" }}>
                Urgent Collection Needed — {urgent.length} bins
              </h2>
              <p style={{ fontSize:12, color:"#f87171", marginTop:2 }}>Bins over 80% full</p>
            </div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"var(--bg-3)", borderBottom:"1px solid var(--border)" }}>
                  {["Bin ID","Location","Fill Level","Last Reading"].map(h=>(
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-3)", letterSpacing:"0.06em", textTransform:"uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {urgent.map(b=>{
                  const fill=b.latest_telemetry?.fill_pct??0;
                  return (
                    <tr key={b.id} className="table-row">
                      <td style={{ padding:"12px 16px" }}>
                        <span style={{ fontSize:13, fontWeight:700, color:"#dc2626" }}>{b.id}</span>
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:13, color:"var(--text-2)" }}>{b.location_name}</td>
                      <td style={{ padding:"12px 16px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:80, height:6, borderRadius:99, background:"var(--border)", overflow:"hidden" }}>
                            <div style={{ width:`${fill}%`, height:"100%", borderRadius:99, background:"#dc2626" }} />
                          </div>
                          <span style={{ fontSize:12, fontWeight:700, color:"#dc2626" }}>{fill.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={{ padding:"12px 16px", fontSize:12, color:"var(--text-3)" }}>
                        {b.latest_telemetry?.ts ? new Date(b.latest_telemetry.ts).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}