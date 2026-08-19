import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { AuthShell } from "../components/AuthShell";

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
    <AuthShell
      kicker="Administration"
      headline="Le cockpit DOTO+."
      lede="KYC, affiliations et audit dans un back-office sobre."
      points={[
        { title: "Validation. ", text: "Comptes, pièces et rattachements." },
        { title: "Pilotage. ", text: "Patients, structures et cartes." },
        { title: "Traçabilité. ", text: "Journal d’accès et de session." },
      ]}
    >
      <div className="auth-head">
        <p className="auth-kicker">DotoPlus Admin</p>
        <h1>Connexion</h1>
        <p className="muted">Réservé aux administrateurs de la plateforme.</p>
      </div>
      <form onSubmit={submit}>
        <div className="field">
          <label className="label" htmlFor="admin-login-user">
            Identifiant
          </label>
          <input
            id="admin-login-user"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            autoComplete="username"
            autoFocus
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="admin-login-pass">
            Mot de passe
          </label>
          <input
            id="admin-login-pass"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="auth-error">{error}</p> : null}
        <button className="btn auth-submit" disabled={busy}>
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="auth-foot">
        Démo <span className="mono">admin</span> / <span className="mono">AdminDoto2026!</span>
      </p>
    </AuthShell>
  );
}
