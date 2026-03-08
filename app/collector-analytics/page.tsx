"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#22c55e", "#eab308", "#ef4444", "#6b7280"];

export default function CollectorAnalyticsPage() {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bins().then(setBins).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  // Fill level distribution
  const fillRanges = [
    { range: "0-25%",   count: bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) <= 25).length },
    { range: "26-50%",  count: bins.filter(b => { const f = b.latest_telemetry?.fill_pct ?? 0; return f > 25 && f <= 50; }).length },
    { range: "51-75%",  count: bins.filter(b => { const f = b.latest_telemetry?.fill_pct ?? 0; return f > 50 && f <= 75; }).length },
    { range: "76-100%", count: bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) > 75).length },
  ];

  // Bins needing urgent pickup (>80% full)
  const urgent = bins.filter(b => (b.latest_telemetry?.fill_pct ?? 0) >= 80);

  // Status distribution
  const statusCounts = bins.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1; return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Collector Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Bin fill levels and collection priority insights</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Bins",      value: bins.length,                                              color: "text-blue-600",  bg: "bg-blue-50",   icon: "🗑" },
            { label: "Urgent (>80%)",   value: urgent.length,                                            color: "text-red-600",   bg: "bg-red-50",    icon: "🚨" },
            { label: "Avg Fill Level",  value: `${(bins.reduce((s,b) => s + (b.latest_telemetry?.fill_pct ?? 0), 0) / bins.length).toFixed(1)}%`, color: "text-yellow-600", bg: "bg-yellow-50", icon: "📈" },
            { label: "Operational",     value: bins.filter(b => b.status === "operational").length,      color: "text-green-600", bg: "bg-green-50",  icon: "✅" },
          ].map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl border border-gray-100 p-5`}>
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-gray-500 text-sm mt-1">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fill level distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Fill Level Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fillRanges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" name="Bins" radius={[6,6,0,0]}
                  fill="#22c55e"
                  label={{ position: "top", fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bin status pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Bin Status Distribution</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" label>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgent bins table */}
        {urgent.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-red-100 bg-red-50">
              <h2 className="font-semibold text-red-700">🚨 Urgent Collection Needed ({urgent.length} bins)</h2>
              <p className="text-xs text-red-400 mt-0.5">These bins are over 80% full and need immediate collection</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  {["Bin ID","Location","Fill Level","Last Seen"].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {urgent.sort((a,b) => (b.latest_telemetry?.fill_pct ?? 0) - (a.latest_telemetry?.fill_pct ?? 0))
                  .map(b => {
                    const fill = b.latest_telemetry?.fill_pct ?? 0;
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-semibold text-red-600">{b.id}</td>
                        <td className="px-5 py-3.5 text-gray-600">{b.location_name}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-100 rounded-full h-2">
                              <div className="h-2 rounded-full bg-red-500" style={{ width: `${fill}%` }} />
                            </div>
                            <span className="font-bold text-red-600">{fill.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                          {b.latest_telemetry?.ts ? new Date(b.latest_telemetry.ts).toLocaleString() : "—"}
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