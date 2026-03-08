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
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(auth.role)) {
      setUser(auth);  // show not-authorized message
      return;
    }
    setUser(auth);
  }, []);

  if (user === "loading") return <LoadingSpinner label="Checking auth..." />;
  if (!user)              return null;

  if (allowedRoles && !allowedRoles.includes((user as AuthUser).role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Authorized</h2>
          <p className="text-gray-500 text-sm">
            Your role <strong>{(user as AuthUser).role}</strong> doesn't have access to this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}