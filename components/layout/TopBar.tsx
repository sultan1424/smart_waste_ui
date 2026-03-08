"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuth, clearAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

const roleConfig = {
  restaurant: { color: "bg-green-100 text-green-700 border-green-200", icon: "🍽", label: "Restaurant" },
  collector:  { color: "bg-blue-100 text-blue-700 border-blue-200",   icon: "🚛", label: "Collector"  },
  regulator:  { color: "bg-purple-100 text-purple-700 border-purple-200", icon: "📊", label: "Regulator" },
};

const navLinks = {
  restaurant: [{ href: "/",          label: "My Bins",   icon: "🗑" }],
  collector:  [{ href: "/",          label: "Bins",      icon: "🗑" },
               { href: "/pickups",   label: "Pickups",   icon: "🚛" },
               { href: "/collector-analytics", label: "Analytics", icon: "📊" }],
  regulator:  [{ href: "/",          label: "Overview",  icon: "⊞" },
               { href: "/analytics", label: "Analytics", icon: "📊" }],
};

export default function TopBar() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [time, setTime] = useState("");
  const path   = usePathname();
  const router = useRouter();

  useEffect(() => {
    setUser(getAuth());
    const tick = () => setTime(new Date().toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
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

  const role = user?.role ?? "regulator";
  const cfg  = roleConfig[role];
  const links = navLinks[role];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center h-16 px-6 gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">W</div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">WasteEnergy</div>
            <div className="text-gray-400 text-xs leading-tight">Operations Dashboard</div>
          </div>
        </div>

        {/* Nav — role-aware */}
        <nav className="flex items-center gap-1">
          {links.map(l => (
            <Link key={l.href} href={l.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${path === l.href
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
              <span>{l.icon}</span>{l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-xs text-gray-400">Last updated</div>
            <div className="text-xs font-medium text-gray-700">{time}</div>
          </div>

          {/* Role badge */}
          {user && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.color}`}>
              <span>{cfg.icon}</span>
              {cfg.label}
            </div>
          )}

          {/* User info + logout */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.email[0].toUpperCase()}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user.email.split("@")[0].replace("_", " ")}</div>
                <div className="text-xs text-gray-400">{cfg.label}</div>
              </div>
              <button onClick={handleLogout}
                className="ml-2 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}