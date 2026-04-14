"use client";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";

export default function ConditionalTopBar() {
  const path = usePathname();
  // Hide topbar on login page
  if (path === "/login") return null;
  return <TopBar />;
}