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
  restaurant: [
    { href: "/dashboard", label: "My Bins" },
  ],
  collector: [
    { href: "/dashboard",           label: "Bins"            },
    { href: "/pickups",             label: "Pickups"         },
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

  const handleLogout = () => {
    clearAuth();
    router.replace("/login");
  };

  const role = user?.role as keyof typeof roleConfig;
  if (!user || !role) return null;
  const cfg   = roleConfig[role];
  const links = navLinks[role] ?? [];

  return (
    <header style={{
      background: "#ffffff",
      borderBottom: "1px solid #e4e7ef",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 28px" }}
           className="flex items-center h-14 gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 mr-4 flex-shrink-0" style={{ textDecoration: "none" }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, #16a34a, #15803d)",
            borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700, color: "white",
          }}>W</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>
              WasteEnergy
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1 }}>
              Operations
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(l => {
            const active = path === l.href || (l.href !== "/dashboard" && path?.startsWith(l.href));
            return (
              <Link key={l.href} href={l.href} style={{
                padding: "6px 14px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? "#111827" : "#6b7280",
                background: active ? "#f0f2f7" : "transparent",
                borderBottom: active ? "2px solid #16a34a" : "2px solid transparent",
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
          <div style={{ fontSize: 12, color: "#9ca3af" }} className="hidden md:flex items-center gap-1.5">
            <div style={{
              width: 6, height: 6,
              background: "#16a34a",
              borderRadius: "50%",
              boxShadow: "0 0 0 2px #dcfce7",
            }} />
            {time}
          </div>

          {/* Role badge */}
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: cfg.color,
            background: cfg.bg,
            padding: "3px 10px",
            borderRadius: 99,
          }}>
            {cfg.label}
          </span>

          {/* Avatar */}
          <div style={{
            width: 32, height: 32,
            background: cfg.bg,
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 600, color: cfg.color,
            border: `1.5px solid ${cfg.color}30`,
          }}>
            {user.email[0].toUpperCase()}
          </div>

          {/* Sign out */}
          <button onClick={handleLogout} style={{
            fontSize: 12, fontWeight: 500,
            color: "#6b7280",
            background: "transparent",
            border: "1px solid #e4e7ef",
            borderRadius: 8,
            padding: "5px 12px",
            cursor: "pointer",
            transition: "all 0.15s",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = "#dc2626";
            (e.currentTarget as HTMLElement).style.borderColor = "#fca5a5";
            (e.currentTarget as HTMLElement).style.background = "#fff1f1";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = "#6b7280";
            (e.currentTarget as HTMLElement).style.borderColor = "#e4e7ef";
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}