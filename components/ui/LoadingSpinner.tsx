export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      padding: "48px 0",
      color: "var(--text-3)",
    }}>
      <div style={{
        width: 18, height: 18,
        border: "2px solid var(--bg-3)",
        borderTopColor: "#22c55e",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}
