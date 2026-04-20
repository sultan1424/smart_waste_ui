"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

const roleConfig = {
  restaurant: { bg: "#dcfce7", color: "#15803d", label: "Restaurant" },
  collector:  { bg: "#dbeafe", color: "#1d4ed8", label: "Collector"  },
  regulator:  { bg: "#ede9fe", color: "#6d28d9", label: "Regulator" },
};

const navLinks = {
  restaurant: [{ href: "/dashboard", label: "My Bins" }],
  collector: [
    { href: "/dashboard",           label: "Bins"            },
    { href: "/route",               label: "Route Optimizer" },
    { href: "/collector-analytics", label: "Analytics"       },
  ],
  regulator: [
    { href: "/dashboard", label: "Overview"  },
    { href: "/analytics", label: "Analytics" },
  ],
};

export default function TopBar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [time, setTime] = useState("");
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

  const handleLogout = () => { clearAuth(); router.replace("/login"); };

  const role = user?.role as keyof typeof roleConfig;
  if (!user || !role) return null;
  const cfg   = roleConfig[role];
  const links = navLinks[role] ?? [];

  return (
    <header style={{
      background: "#1a1f37",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}
           className="flex items-center h-14 gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-6 flex-shrink-0" style={{ textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #3b5bdb, #6741d9)",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white",
          }}>W</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#ffffff", lineHeight: 1.2 }}>WasteEnergy</div>
            <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1 }}>Operations</div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {links.map(l => {
            const active = path === l.href || (l.href !== "/dashboard" && path?.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? "#ffffff" : "#a8b0cc",
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
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
          <div style={{ fontSize: 12, color: "#6b7280" }} className="hidden md:flex items-center gap-1.5">
            <div style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%", boxShadow: "0 0 0 2px rgba(22,163,74,0.25)" }} />
            {time}
          </div>

          <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.bg, padding: "3px 10px", borderRadius: 99 }}>
            {cfg.label}
          </span>

          <div style={{
            width: 32, height: 32,
            background: cfg.bg,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, color: cfg.color,
            border: `1.5px solid ${cfg.color}40`,
          }}>
            {user.email[0].toUpperCase()}
          </div>

          <button onClick={handleLogout} style={{
            fontSize: 12, fontWeight: 500,
            color: "#a8b0cc",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, padding: "5px 12px",
            cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#fca5a5";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#a8b0cc";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
          }}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}