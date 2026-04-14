"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "unauthorized">("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const auth = getAuth();

    if (!auth || !auth.token) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      setUser(auth);
      setStatus("unauthorized");
      return;
    }

    setUser(auth);
    setStatus("ok");
  }, []);

  if (status === "loading") return <LoadingSpinner label="Loading..." />;

  if (status === "unauthorized") {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "60vh", flexDirection: "column", gap: 12,
      }}>
        <div style={{ fontSize: 32 }}>🔒</div>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)" }}>Not Authorized</h2>
        <p style={{ fontSize: 13, color: "var(--text-3)" }}>
          Your role <strong style={{ color: "var(--text-2)" }}>{user?.role}</strong> cannot access this page.
        </p>
      </div>
    );
  }

  if (status === "ok") return <>{children}</>;

  return null;
}