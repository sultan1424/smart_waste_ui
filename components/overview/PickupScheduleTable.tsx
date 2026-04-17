"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { PickupRow } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

function PriorityPill({ priority }: { priority: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    high:   { color: "#dc2626", bg: "#fee2e2" },
    medium: { color: "#d97706", bg: "#fef3c7" },
    low:    { color: "#16a34a", bg: "#dcfce7" },
  };
  const s = map[priority?.toLowerCase()] ?? { color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 99 }}>
      {priority}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    planned:   { color: "#3b5bdb", bg: "#eef2ff" },
    completed: { color: "#16a34a", bg: "#dcfce7" },
    missed:    { color: "#dc2626", bg: "#fee2e2" },
  };
  const s = map[status?.toLowerCase()] ?? { color: "#6b7280", bg: "#f3f4f6" };
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 99 }}>
      {status}
    </span>
  );
}

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
        padding: "18px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>Pickup Schedule</h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{pickups.length} pickups today</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600,
          color: "#16a34a", background: "#dcfce7",
          padding: "4px 12px", borderRadius: 99,
        }}>● Live</span>
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
              <tr style={{ background: "var(--bg-3)", borderBottom: "1px solid var(--border)" }}>
                {["Schedule ID","Route","Time","Bin","Priority","Status"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: 11, fontWeight: 600, color: "var(--text-3)",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pickups.map(p => (
                <tr key={p.id} className="table-row">
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-3)" }}>
                    SCH-{String(p.id).padStart(3,"0")}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "#3b5bdb" }}>
                    {p.route_id}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-2)" }}>
                    {new Date(p.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{p.bin_id}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}><PriorityPill priority={p.priority} /></td>
                  <td style={{ padding: "12px 16px" }}><StatusPill status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}