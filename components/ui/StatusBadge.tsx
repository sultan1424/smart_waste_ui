export default function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    operational: "bg-green-100 text-green-700 border border-green-200",
    near_full:   "bg-yellow-100 text-yellow-700 border border-yellow-200",
    full:        "bg-red-100 text-red-700 border border-red-200",
    maintenance: "bg-gray-100 text-gray-600 border border-gray-200",
    planned:     "bg-blue-100 text-blue-700 border border-blue-200",
    completed:   "bg-green-100 text-green-700 border border-green-200",
    missed:      "bg-red-100 text-red-700 border border-red-200",
    low:         "bg-gray-100 text-gray-600 border border-gray-200",
    medium:      "bg-yellow-100 text-yellow-700 border border-yellow-200",
    high:        "bg-red-100 text-red-700 border border-red-200",
    critical:    "bg-red-100 text-red-700 border border-red-200",
    warning:     "bg-yellow-100 text-yellow-700 border border-yellow-200",
  };
  const label = status === "near_full" ? "Near Full" : status === "operational" ? "Operational" : status;
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {label}
    </span>
  );
}