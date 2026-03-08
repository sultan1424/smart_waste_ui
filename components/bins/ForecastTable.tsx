"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ForecastRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function ForecastTable({ binId }: { binId: string }) {
  const [rows, setRows]       = useState<ForecastRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    api.forecasts(binId).then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [binId]);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">10-Day Forecast</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Model: {rows[0]?.model_version ?? "—"}
            <span className="ml-2 text-yellow-500">⚠ placeholder outputs</span>
          </p>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            {["Date","Predicted Fill","Predicted Weight","Recommended Pickup"].map(h => (
              <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(r => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3.5 text-gray-700 font-medium">{r.forecast_date}</td>
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full
                      ${r.predicted_fill_pct >= 80 ? "bg-red-500" : r.predicted_fill_pct >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(r.predicted_fill_pct, 100)}%` }} />
                  </div>
                  <span className="font-semibold text-gray-900">{r.predicted_fill_pct.toFixed(1)}%</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-gray-600">{r.predicted_weight_kg.toFixed(2)} kg</td>
              <td className="px-5 py-3.5 text-blue-600 font-medium">{r.recommended_pickup_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}