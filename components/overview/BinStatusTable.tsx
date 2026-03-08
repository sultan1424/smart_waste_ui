"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import type { Bin } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const RESTAURANT_BINS = ["BN-001","BN-002","BN-003","BN-004","BN-005"];

export default function BinStatusTable({ restaurantMode = false }: { restaurantMode?: boolean }) {
  const [bins, setBins]       = useState<Bin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [search, setSearch]   = useState("");
  const router = useRouter();

  useEffect(() => {
    api.bins()
      .then(data => {
        const auth = getAuth();
        if (restaurantMode || auth?.role === "restaurant") {
          setBins(data.filter(b => RESTAURANT_BINS.includes(b.id)));
        } else {
          setBins(data);
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [restaurantMode]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  const filtered = bins.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">
            {restaurantMode ? "🍽 My Bins" : "Bin Status"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {restaurantMode
              ? `${filtered.length} bins assigned to your restaurant`
              : "Click a row to view bin details"}
          </p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search bins..."
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 w-48" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
              {["Bin ID","Location","Fill Level","Last Seen","Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(b => {
              const t    = b.latest_telemetry;
              const fill = t?.fill_pct ?? 0;
              const fillStatus = fill >= 90 ? "critical" : fill >= 70 ? "warning" : "operational";
              return (
                <tr key={b.id} onClick={() => router.push(`/bins/${b.id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-5 py-3.5 font-mono font-semibold text-gray-900">{b.id}</td>
                  <td className="px-5 py-3.5 text-gray-600">{b.location_name}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all
                          ${fill >= 90 ? "bg-red-500" : fill >= 70 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${fill}%` }} />
                      </div>
                      <span className="font-semibold text-gray-900 w-10">{fill.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 text-xs">
                    {t?.ts ? new Date(t.ts).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3.5"><StatusBadge status={fillStatus} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {restaurantMode && (
        <div className="px-6 py-3 bg-green-50 border-t border-green-100 text-xs text-green-700">
          💡 Click any bin to view detailed telemetry and forecasts
        </div>
      )}
    </div>
  );
}