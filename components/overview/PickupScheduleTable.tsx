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

  return (
    <div className="card overflow-hidden">
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>Pickup Schedule</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{pickups.length} pickups today</p>
        </div>
        <div style={{
          fontSize: 11,
          color: "#22c55e",
          background: "rgba(34,197,94,0.1)",
          padding: "4px 10px",
          borderRadius: 99,
          border: "1px solid rgba(34,197,94,0.2)",
        }}>
          Live
        </div>
      </div>

      {error ? (
        <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>
      ) : !pickups.length ? (
        <div style={{ padding: 40, textAlign: "center", fontSize: 13, color: "var(--text-3)" }}>
          No pickups scheduled for today
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Schedule ID","Route","Time","Bin","Priority","Status"].map(h => (
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
              {pickups.map(p => (
                <tr key={p.id} className="table-row">
                  <td style={{ padding: "11px 16px" }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                      SCH-{String(p.id).padStart(3,"0")}
                    </span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 500, color: "#60a5fa" }}>
                    {p.route_id}
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: "var(--text-2)" }} className="mono">
                    {new Date(p.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
  );
}
