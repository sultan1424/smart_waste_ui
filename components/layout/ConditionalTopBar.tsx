"use client";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";

export default function ConditionalTopBar() {
  const path = usePathname();
  if (path === "/login") return null;
  return <TopBar />;
}