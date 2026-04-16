const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

export interface AuthUser {
  email: string;
  role:  "restaurant" | "collector" | "regulator";
  token: string;
}

export function getAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sw_auth");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function setAuth(user: AuthUser) {
  localStorage.setItem("sw_auth", JSON.stringify(user));
  // Also set a cookie so middleware can read it
  document.cookie = `sw_auth=1; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  localStorage.removeItem("sw_auth");
  // Clear the cookie too
  document.cookie = `sw_auth=; path=/; max-age=0`;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Login failed");
  }

  const data = await res.json();
  return { email: data.email, role: data.role, token: data.access_token };
}