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

  const filtered = bins.filter(b =>
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.location_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>
            {restaurantMode ? "My Bins" : "Bin Status"}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {filtered.length} bins {restaurantMode ? "assigned" : "total"} · click row for details
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "6px 12px",
            fontSize: 12,
            color: "var(--text-1)",
            outline: "none",
            width: 160,
          }}
        />
      </div>

      {loading ? <LoadingSpinner /> : error ? (
        <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Bin ID","Location","Fill Level","Weight","Last Reading","Status"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "var(--text-3)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    background: "rgba(255,255,255,0.02)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const t    = b.latest_telemetry;
                const fill = t?.fill_pct ?? 0;
                const fillColor = fill >= 90 ? "#ef4444" : fill >= 70 ? "#f59e0b" : "#22c55e";
                const statusKey = fill >= 90 ? "critical" : fill >= 70 ? "warning" : "operational";
                return (
                  <tr key={b.id}
                    onClick={() => router.push(`/bins/${b.id}`)}
                    className="table-row"
                    style={{ cursor: "pointer" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)" }}>
                        {b.id}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-2)", maxWidth: 180 }}>
                      {b.location_name}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 72, height: 5, borderRadius: 99,
                          background: "var(--bg-3)", overflow: "hidden",
                        }}>
                          <div style={{
                            width: `${fill}%`, height: "100%",
                            borderRadius: 99, background: fillColor,
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: fillColor, minWidth: 36 }}>
                          {fill.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-2)" }} className="mono">
                      {t?.weight_kg ? `${t.weight_kg.toFixed(1)} kg` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 11, color: "var(--text-3)" }}>
                      {t?.ts ? new Date(t.ts).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }) : "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={statusKey} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
