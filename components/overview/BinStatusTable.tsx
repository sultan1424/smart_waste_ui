"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getAuth } from "@/lib/auth";
import type { Bin } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";

const RESTAURANT_BINS = ["BN-001","BN-002","BN-003","BN-004","BN-005"];

function StatusPill({ fill }: { fill: number }) {
  if (fill >= 90) return (
    <span style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", background: "#fee2e2", padding: "3px 10px", borderRadius: 99 }}>Critical</span>
  );
  if (fill >= 70) return (
    <span style={{ fontSize: 11, fontWeight: 600, color: "#d97706", background: "#fef3c7", padding: "3px 10px", borderRadius: 99 }}>Warning</span>
  );
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", background: "#dcfce7", padding: "3px 10px", borderRadius: 99 }}>Operational</span>
  );
}

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
        padding: "18px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
      }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
            {restaurantMode ? "My Bins" : "Bin Status"}
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
            {filtered.length} bins {restaurantMode ? "assigned" : "total"} · click row for details
          </p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search bins..."
          style={{
            background: "var(--bg-3)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "7px 12px",
            fontSize: 12,
            color: "var(--text-1)",
            outline: "none",
            width: 180,
            fontFamily: "inherit",
          }}
        />
      </div>

      {loading ? <LoadingSpinner /> : error ? (
        <div style={{ padding: 16 }}><ErrorMessage message={error} /></div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--bg-3)", borderBottom: "1px solid var(--border)" }}>
                {["Bin ID","Location","Fill Level","Weight","Last Reading","Status"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--text-3)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const t    = b.latest_telemetry;
                const fill = t?.fill_pct ?? 0;
                const fillColor = fill >= 90 ? "#dc2626" : fill >= 70 ? "#d97706" : "#16a34a";
                return (
                  <tr key={b.id}
                    onClick={() => router.push(`/bins/${b.id}`)}
                    className="table-row"
                    style={{ cursor: "pointer" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#3b5bdb" }}>{b.id}</span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-2)" }}>
                      {b.location_name}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 80, height: 6, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{
                            width: `${fill}%`, height: "100%",
                            borderRadius: 99, background: fillColor,
                            transition: "width 0.6s ease",
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: fillColor, minWidth: 36 }}>
                          {fill.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "var(--text-2)" }}>
                      {t?.weight_kg ? `${t.weight_kg.toFixed(1)} kg` : "—"}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "var(--text-3)" }}>
                      {t?.ts ? new Date(t.ts).toLocaleString("en-US", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      }) : "—"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StatusPill fill={fill} />
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