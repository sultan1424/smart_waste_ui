import { supabase } from "./supabase";

export interface AuthUser {
  email: string;
  role:  "restaurant" | "collector" | "regulator";
  token: string;
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("sw_auth");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setAuth(user: AuthUser) {
  localStorage.setItem("sw_auth", JSON.stringify(user));
  document.cookie = "sw_auth=1; path=/; max-age=86400; SameSite=Lax";
}

export function clearAuth() {
  localStorage.removeItem("sw_auth");
  document.cookie = "sw_auth=; path=/; max-age=0";
  supabase.auth.signOut();
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(error?.message ?? "Login failed");

  const token = data.session.access_token;

  const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${API}/api/v1/auth/me`, {
    headers: { "Authorization": `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not fetch user role");
  const user = await res.json();

  return { email, role: user.role, token };
}