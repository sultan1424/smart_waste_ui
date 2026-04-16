"use client";
import { useEffect, useState } from "react";
import { getAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const [ready, setReady]  = useState(false);
  const [user,  setUser]   = useState<AuthUser | null>(null);

  useEffect(() => {
    const auth = getAuth();
    setUser(auth);
    setReady(true);
  }, []);

  if (!ready) return <LoadingSpinner label="Loading..." />;

  // Middleware already ensures we're logged in, but double-check
  if (!user) {
    window.location.replace("/login");
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)" }}>Not Authorized</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          Your role <strong style={{ color: "var(--text-2)" }}>{user.role}</strong> cannot access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}