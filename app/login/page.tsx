"use client";
import { useState } from "react";
import { login, setAuth } from "@/lib/auth";



export default function LoginPage() {
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
      window.location.replace("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Login failed");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center",
      padding:24, background:"var(--bg)",
    }}>
      <div style={{ width:"100%", maxWidth:420 }} className="fade-up">

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{
            width:52, height:52,
            background:"linear-gradient(135deg, #3b5bdb, #6741d9)",
            borderRadius:16, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:22, fontWeight:700,
            color:"white", margin:"0 auto 16px",
            boxShadow:"0 4px 20px rgba(59,91,219,0.25)",
          }}>W</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"var(--text-1)", marginBottom:6, letterSpacing:"-0.3px" }}>
            WasteEnergy
          </h1>
          <p style={{ fontSize:13, color:"var(--text-3)" }}>Sign in to your operations dashboard</p>
        </div>

        {/* Card */}
        <div style={{
          background:"var(--bg-2)", border:"1px solid var(--border)",
          borderRadius:20, padding:32, boxShadow:"var(--shadow-lg)",
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, color:"var(--text-2)", marginBottom:7 }}>
                Email address
              </label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                required placeholder="you@example.com" style={{
                  width:"100%", background:"var(--bg-3)",
                  border:"1.5px solid var(--border)", borderRadius:10,
                  padding:"11px 14px", fontSize:14, color:"var(--text-1)",
                  outline:"none", fontFamily:"inherit", transition:"border-color 0.15s",
                }}
                onFocus={e=>(e.target.style.borderColor="#3b5bdb")}
                onBlur={e=>(e.target.style.borderColor="var(--border)")} />
            </div>

            <div style={{ marginBottom:22 }}>
              <label style={{ display:"block", fontSize:13, fontWeight:500, color:"var(--text-2)", marginBottom:7 }}>
                Password
              </label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                required placeholder="••••••••" style={{
                  width:"100%", background:"var(--bg-3)",
                  border:"1.5px solid var(--border)", borderRadius:10,
                  padding:"11px 14px", fontSize:14, color:"var(--text-1)",
                  outline:"none", fontFamily:"inherit", transition:"border-color 0.15s",
                }}
                onFocus={e=>(e.target.style.borderColor="#3b5bdb")}
                onBlur={e=>(e.target.style.borderColor="var(--border)")} />
            </div>

            {error && (
              <div style={{
                background:"#fee2e2", border:"1px solid #fca5a5",
                borderRadius:10, padding:"10px 14px", fontSize:13,
                color:"#dc2626", marginBottom:18,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width:"100%",
              background: loading?"var(--bg-3)":"#3b5bdb",
              border:"none", borderRadius:10, padding:"12px",
              fontSize:14, fontWeight:600,
              color: loading?"var(--text-3)":"white",
              cursor: loading?"not-allowed":"pointer",
              fontFamily:"inherit",
              boxShadow: loading?"none":"0 2px 8px rgba(59,91,219,0.3)",
              transition:"all 0.15s",
            }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div style={{ marginTop:20, textAlign:"center" }}>
            <p style={{ fontSize:12, color:"var(--text-3)" }}>
              Contact your administrator for access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}