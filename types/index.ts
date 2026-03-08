export type Role = "Restaurant" | "Collector" | "Regulator";

export type BinStatus = "operational" | "near_full" | "full" | "maintenance";
export type PickupPriority = "low" | "medium" | "high";
export type PickupStatus = "planned" | "completed" | "missed";

export interface TelemetrySummary {
  ts: string | null;
  fill_pct: number | null;
  weight_kg: number | null;
  temp_c: number | null;
  battery_v: number | null;
}

export interface Bin {
  id: string;
  name: string;
  location_name: string;
  lat: number;
  lng: number;
  status: BinStatus;
  latest_telemetry: TelemetrySummary | null;
}

export interface BinDetail extends Bin {
  installed_at: string;
}

export interface TelemetryRow {
  id: number;
  bin_id: string;
  ts: string;
  fill_pct: number;
  weight_kg: number;
  temp_c: number;
  battery_v: number;
  signal_rssi: number | null;
}

export interface PickupRow {
  id: number;
  bin_id: string;
  scheduled_at: string;
  window_start: string;
  window_end: string;
  route_id: string;
  priority: PickupPriority;
  status: PickupStatus;
}

export interface ForecastRow {
  id: number;
  bin_id: string;
  forecast_date: string;
  predicted_fill_pct: number;
  predicted_weight_kg: number;
  recommended_pickup_date: string;
  model_version: string;
}

export interface DailyReportRow {
  day: string;
  avg_fill_pct: number;
  max_fill_pct: number;
  avg_temp_c: number;
  total_weight_kg: number;
  reading_count: number;
}

export interface ReportResponse {
  bin_id: string | null;
  period_start: string;
  period_end: string;
  pickup_count: number;
  daily_rows: DailyReportRow[];
  server_elapsed_ms: number;
}