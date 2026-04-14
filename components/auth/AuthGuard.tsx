"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");

  useEffect(() => {
    // Small delay to ensure localStorage is available (hydration)
    const auth = getAuth();

    if (!auth || !auth.token) {
      // No token — clear any stale state and redirect
      localStorage.removeItem("sw_auth");
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      setUser(auth);
      return;
    }

    setUser(auth);
  }, [pathname]);

  if (user === "loading") return <LoadingSpinner label="Checking auth..." />;
  if (!user) return null;

  if (allowedRoles && !allowedRoles.includes((user as AuthUser).role)) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)" }}>Not Authorized</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          Your role <strong style={{ color: "var(--text-2)" }}>{(user as AuthUser).role}</strong> cannot access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}