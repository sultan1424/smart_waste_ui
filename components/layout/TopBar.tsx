"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

const roleConfig = {
  restaurant: { color: "text-green-400 bg-green-400/10 border-green-400/20", dot: "bg-green-400", label: "Restaurant" },
  collector:  { color: "text-blue-400 bg-blue-400/10 border-blue-400/20",   dot: "bg-blue-400",  label: "Collector"  },
  regulator:  { color: "text-purple-400 bg-purple-400/10 border-purple-400/20", dot: "bg-purple-400", label: "Regulator" },
};

const navLinks = {
  restaurant: [
    { href: "/",       label: "My Bins" },
  ],
  collector: [
    { href: "/",          label: "Bins" },
    { href: "/pickups",   label: "Pickups" },
    { href: "/route",     label: "Route Optimizer" },
    { href: "/collector-analytics", label: "Analytics" },
  ],
  regulator: [
    { href: "/",          label: "Overview" },
    { href: "/analytics", label: "Analytics" },
  ],
};

export default function TopBar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [time, setTime] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const path   = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getAuth());
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const role = user?.role as keyof typeof roleConfig;
    if (!user || !role) return null;
  const cfg  = roleConfig[role];
  const links = navLinks[role] ?? [];

  return (
    <header style={{
      background: "rgba(22,27,39,0.85)",
      backdropFilter: "blur(12px)",
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 24px" }}
           className="flex items-center h-14 gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-2 flex-shrink-0">
          <div style={{
            width: 30, height: 30,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, color: "white",
            boxShadow: "0 0 12px rgba(34,197,94,0.3)",
          }}>W</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", lineHeight: 1.2 }}>
              WasteEnergy
            </div>
            <div style={{ fontSize: 10, color: "var(--text-3)", lineHeight: 1 }}>
              Operations
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(l => {
            const active = path === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "5px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? "var(--text-1)" : "var(--text-3)",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                transition: "all 0.15s",
                textDecoration: "none",
              }}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-3">
          {/* Live time */}
          <div style={{ fontSize: 12, color: "var(--text-3)" }} className="hidden md:flex items-center gap-1.5">
            <span className="live-dot" style={{ width: 6, height: 6 }} />
            {time}
          </div>

          {/* Role badge */}
          {user && (
            <span style={{ fontSize: 11, fontWeight: 500 }}
              className={`px-2.5 py-1 rounded-full border ${cfg.color}`}>
              {cfg.label}
            </span>
          )}

          {/* Avatar + logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div style={{
                width: 30, height: 30,
                background: "var(--bg-3)",
                border: "1px solid var(--border-2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 600, color: "var(--text-1)",
              }}>
                {user.email[0].toUpperCase()}
              </div>
              <button onClick={handleLogout} style={{
                fontSize: 12,
                color: "var(--text-3)",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "4px 10px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.target as HTMLElement).style.color = "#ef4444";
                (e.target as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
              }}
              onMouseLeave={e => {
                (e.target as HTMLElement).style.color = "var(--text-3)";
                (e.target as HTMLElement).style.borderColor = "var(--border)";
              }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
