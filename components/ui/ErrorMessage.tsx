export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 12,
      padding: "12px 16px",
      fontSize: 13,
      color: "#f87171",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="#f87171" strokeWidth="1.5"/>
        <path d="M7 4v3.5M7 9.5v.5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      {message}
    </div>
  );
}