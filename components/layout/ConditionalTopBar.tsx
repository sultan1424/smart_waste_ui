"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import TopBar from "./TopBar";

export default function ConditionalTopBar() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side hydration is complete
  if (!mounted) return null;

  // Hide on login page
  if (path === "/login") return null;

  return <TopBar />;
}