"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, setAuth } from "@/lib/auth";

const DEMO = [
  { role: "restaurant", label: "Restaurant", color: "#22c55e" },
  { role: "collector",  label: "Collector",  color: "#3b82f6" },
  { role: "regulator",  label: "Regulator",  color: "#8b5cf6" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await login(email, password);
      setAuth(user);
      router.replace("/");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    setEmail(`${role}_user@test.com`);
    setPassword("password");
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      background: "var(--bg)",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "fixed",
        top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: 600, height: 300,
        background: "radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ width: "100%", maxWidth: 400 }} className="fade-up">
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, color: "white",
            margin: "0 auto 16px",
            boxShadow: "0 0 32px rgba(34,197,94,0.25)",
          }}>W</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-1)", marginBottom: 6 }}>
            WasteEnergy
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>
            Sign in to your operations dashboard
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-2)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: 28,
          boxShadow: "var(--shadow-lg)",
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--text-1)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(34,197,94,0.5)")}
                onBlur={e  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-2)", marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  background: "var(--bg-3)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 14,
                  color: "var(--text-1)",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(34,197,94,0.5)")}
                onBlur={e  => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "#f87171",
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "var(--bg-3)" : "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none",
                borderRadius: 10,
                padding: "11px",
                fontSize: 14,
                fontWeight: 500,
                color: loading ? "var(--text-3)" : "white",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: loading ? "none" : "0 0 20px rgba(34,197,94,0.2)",
              }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
            <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", marginBottom: 10 }}>
              Demo accounts — click to fill
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {DEMO.map(d => (
                <button
                  key={d.role}
                  onClick={() => fillDemo(d.role)}
                  style={{
                    background: "var(--bg-3)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "7px 0",
                    fontSize: 12,
                    color: d.color,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = d.color + "40")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-3)", marginTop: 20 }}>
          JWT stored in localStorage · prototype only
        </p>
      </div>
    </div>
  );
}