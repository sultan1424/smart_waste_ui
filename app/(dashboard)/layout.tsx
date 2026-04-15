import TopBar from "@/components/layout/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px" }}>
        {children}
      </main>
    </>
  );
}