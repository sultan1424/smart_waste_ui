const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

import { getAuth } from "./auth";

async function get<T>(path: string): Promise<T> {
  const auth    = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) headers["Authorization"] = `Bearer ${auth.token}`;

  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    headers,
  });

  if (res.status === 401) {
    // Token expired — clear and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("sw_auth");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  health:       ()             => get<{ status: string; version: string }>("/api/v1/health"),
  bins:         ()             => get<import("@/types").Bin[]>("/api/v1/bins"),
  bin:          (id: string)   => get<import("@/types").BinDetail>(`/api/v1/bins/${id}`),
  telemetry:    (id: string, from: string, to: string) =>
    get<import("@/types").TelemetryRow[]>(`/api/v1/bins/${id}/telemetry?from=${from}&to=${to}&limit=2000`),
  pickupsToday: ()             => get<import("@/types").PickupRow[]>("/api/v1/pickups/today"),
  forecasts:    (id: string)   => get<import("@/types").ForecastRow[]>(`/api/v1/forecasts/${id}`),
  report30:     (id?: string)  => get<import("@/types").ReportResponse>(
    `/api/v1/reports/30days${id ? `?bin_id=${id}` : ""}`
  ),
};