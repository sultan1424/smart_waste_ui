"use client";
import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PickupsPage() {
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [filter, setFilter]   = useState<"all"|"planned"|"completed"|"missed">("all");

  useEffect(() => {
    api.pickupsToday()
      .then(setPickups)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? pickups : pickups.filter(p => p.status === filter);

  const planned   = pickups.filter(p => p.status === "planned").length;
  const completed = pickups.filter(p => p.status === "completed").length;
  const missed    = pickups.filter(p => p.status === "missed").length;

  const chartData = [{ name: "Today", Planned: planned, Completed: completed, Missed: missed }];

  // Group by route
  const byRoute = pickups.reduce((acc, p) => {
    acc[p.route_id] = (acc[p.route_id] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const routeData = Object.entries(byRoute).map(([route, count]) => ({ route, count }));

  return (
    <AuthGuard allowedRoles={["collector"]}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🚛 Pickup Management</h1>
          <p className="text-gray-400 text-sm mt-1">Today's pickup schedule and route overview</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Planned",   value: planned,   color: "text-blue-600",  bg: "bg-blue-50",  icon: "📋" },
            { label: "Completed", value: completed, color: "text-green-600", bg: "bg-green-50", icon: "✅" },
            { label: "Missed",    value: missed,    color: "text-red-600",   bg: "bg-red-50",   icon: "❌" },
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
          {/* Status chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pickups by Status</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Legend />
                <Bar dataKey="Planned"   fill="#3b82f6" radius={[6,6,0,0]} />
                <Bar dataKey="Completed" fill="#22c55e" radius={[6,6,0,0]} />
                <Bar dataKey="Missed"    fill="#ef4444" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Route distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Pickups by Route</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={routeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="route" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="count" fill="#22c55e" radius={[6,6,0,0]} name="Pickups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pickup table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Today's Schedule</h2>
              <p className="text-xs text-gray-400 mt-0.5">{filtered.length} pickups</p>
            </div>
            {/* Filter buttons */}
            <div className="flex gap-2">
              {(["all","planned","completed","missed"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-colors
                    ${filter === f ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                    {["ID","Route","Scheduled At","Window","Bin ID","Priority","Status"].map(h => (
                      <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-gray-500 text-xs">SCH-{String(p.id).padStart(3,"0")}</td>
                      <td className="px-5 py-3.5 font-medium text-blue-600">{p.route_id}</td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">{new Date(p.scheduled_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">
                        {new Date(p.window_start).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})} –{" "}
                        {new Date(p.window_end).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-green-600">{p.bin_id}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.priority} /></td>
                      <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
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