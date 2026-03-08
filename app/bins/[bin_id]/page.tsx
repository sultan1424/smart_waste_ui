"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { BinDetail, ReportResponse } from "@/types";
import TelemetryChart from "@/components/bins/TelemetryChart";
import ForecastTable from "@/components/bins/ForecastTable";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function BinDetailPage() {
  const { bin_id } = useParams<{ bin_id: string }>();
  const router = useRouter();
  const [bin, setBin]           = useState<BinDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [report, setReport]     = useState<ReportResponse | null>(null);
  const [repLoading, setRepLoading] = useState(false);

  useEffect(() => {
    api.bin(bin_id).then(setBin).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [bin_id]);

  const generateReport = async () => {
    setRepLoading(true);
    try { setReport(await api.report30(bin_id)); }
    catch (e: any) { alert(e.message); }
    finally { setRepLoading(false); }
  };

  if (loading) return <LoadingSpinner label="Loading bin..." />;
  if (error)   return <ErrorMessage message={error} />;
  if (!bin)    return null;

  const fill = bin.latest_telemetry?.fill_pct ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{bin.id}</h1>
              <StatusBadge status={bin.status} />
            </div>
            <p className="text-gray-500">{bin.name} · {bin.location_name}</p>
            <p className="text-xs text-gray-400 mt-1">
              Installed: {new Date(bin.installed_at).toLocaleDateString()} ·
              Lat: {bin.lat.toFixed(4)} · Lng: {bin.lng.toFixed(4)}
            </p>
          </div>
          <button onClick={generateReport} disabled={repLoading}
            className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2">
            {repLoading ? "⏳ Generating..." : "📋 Generate 30-day Report"}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: "Fill Level", value: `${fill.toFixed(1)}%`, color: fill >= 80 ? "text-red-600" : fill >= 60 ? "text-yellow-600" : "text-green-600" },
            { label: "Weight",     value: `${bin.latest_telemetry?.weight_kg?.toFixed(2) ?? "—"} kg`, color: "text-gray-900" },
            { label: "Temperature",value: `${bin.latest_telemetry?.temp_c?.toFixed(1) ?? "—"} °C`,   color: "text-gray-900" },
            { label: "Battery",    value: `${bin.latest_telemetry?.battery_v?.toFixed(2) ?? "—"} V`, color: "text-gray-900" },
          ].map(c => (
            <div key={c.label} className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">{c.label}</div>
              <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Report result */}
      {report && (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">30-Day Report</h2>
            <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              ⚡ Query time: {report.server_elapsed_ms} ms
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Total Pickups</div>
              <div className="text-2xl font-bold text-blue-600">{report.pickup_count}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Avg Fill %</div>
              <div className="text-2xl font-bold text-green-600">
                {(report.daily_rows.reduce((s,r) => s + r.avg_fill_pct, 0) / (report.daily_rows.length || 1)).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-xs text-gray-500 mb-1">Days Reported</div>
              <div className="text-2xl font-bold text-purple-600">{report.daily_rows.length}</div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">Period: {report.period_start} → {report.period_end}</p>
        </div>
      )}

      <TelemetryChart binId={bin_id} />
      <ForecastTable binId={bin_id} />
    </div>
  );
}