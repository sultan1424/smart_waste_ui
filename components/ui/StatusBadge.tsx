export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    operational: { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", label: "Operational" },
    near_full:   { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", label: "Near Full"   },
    full:        { bg: "rgba(239,68,68,0.12)",  color: "#f87171", label: "Full"        },
    maintenance: { bg: "rgba(139,146,168,0.12)",color: "#8b92a8", label: "Maintenance" },
    planned:     { bg: "rgba(59,130,246,0.12)", color: "#60a5fa", label: "Planned"     },
    completed:   { bg: "rgba(34,197,94,0.12)",  color: "#4ade80", label: "Completed"   },
    missed:      { bg: "rgba(239,68,68,0.12)",  color: "#f87171", label: "Missed"      },
    low:         { bg: "rgba(139,146,168,0.12)",color: "#8b92a8", label: "Low"         },
    medium:      { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", label: "Medium"      },
    high:        { bg: "rgba(239,68,68,0.12)",  color: "#f87171", label: "High"        },
    critical:    { bg: "rgba(239,68,68,0.15)",  color: "#f87171", label: "Critical"    },
    warning:     { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", label: "Warning"     },
  };

  const s = map[status] ?? { bg: "rgba(139,146,168,0.12)", color: "#8b92a8", label: status };

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 11,
      fontWeight: 500,
      padding: "3px 9px",
      borderRadius: 99,
      background: s.bg,
      color: s.color,
      letterSpacing: "0.02em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color, display: "inline-block" }} />
      {s.label}
    </span>
  );
}
