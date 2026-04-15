export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0" }}>
      {children}
    </main>
  );
}