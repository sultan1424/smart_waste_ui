"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function PickupScheduleTable() {
  const [pickups, setPickups] = useState<PickupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.pickupsToday()
      .then(setPickups)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;
  if (!pickups.length) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center text-gray-400 text-sm">
      No pickups scheduled for today
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Pickup Schedule</h2>
          <p className="text-xs text-gray-400 mt-0.5">{pickups.length} pickups today</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
              {["Schedule ID","Route","Pickup Time","Bin ID","Priority","Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pickups.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-gray-500 text-xs">SCH-{String(p.id).padStart(3,"0")}</td>
                <td className="px-5 py-3.5 font-medium text-gray-900">{p.route_id}</td>
                <td className="px-5 py-3.5 text-gray-600">
                  {new Date(p.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-5 py-3.5 font-mono font-semibold text-green-600">{p.bin_id}</td>
                <td className="px-5 py-3.5"><StatusBadge status={p.priority} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}