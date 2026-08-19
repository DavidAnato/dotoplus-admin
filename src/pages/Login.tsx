import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../auth";
import { BrandMark, BrandWordmark } from "../components/BrandMark";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.data?.detail || "Identifiants invalides.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card card">
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div className="login-mark">
            <BrandMark size={64} />
          </div>
          <div style={{ color: "var(--navy)", display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <BrandWordmark />
          </div>
          <h1 style={{ fontSize: 20, marginTop: 4 }}>DotoPlus Admin</h1>
          <p className="muted">Back-office · DOTO+</p>
        </div>
        <form onSubmit={submit}>
          <div className="field">
            <label className="label">Identifiant administrateur</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" autoFocus />
          </div>
          <div className="field">
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          {error && <p style={{ color: "var(--emergency)", marginBottom: 12, fontWeight: 600 }}>{error}</p>}
          <button className="btn" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
        </form>
        <p className="login-footnote small muted">
          <Lock size={13} strokeWidth={2} aria-hidden />
          Réservé aux administrateurs · <span className="mono">admin</span> / <span className="mono">AdminDoto2026!</span>
        </p>
      </div>
    </div>
  );
}
