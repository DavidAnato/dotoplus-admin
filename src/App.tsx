import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  IdCard,
  Shield,
  LogOut,
  Moon,
  Sun,
  WifiOff,
  Bell,
  Ban,
  CalendarDays,
  Settings,
} from "lucide-react";
import { useAuth } from "./auth";
import { useAppStore } from "./store/appStore";
import { api } from "./api";
import { PIN_ERROR, PIN_REGEX } from "./constants";
import { PinSessionGate } from "./components/PinSessionGate";
import { useAdminSSE } from "./hooks";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import Structures from "./pages/Structures";
import Patients from "./pages/Patients";
import Cards from "./pages/Cards";
import Audit from "./pages/Audit";
import NotificationsPage from "./pages/Notifications";
import Acces from "./pages/Acces";
import Agenda from "./pages/Agenda";
import Profil from "./pages/Profil";
import { Avatar } from "./components/Avatar";

const NAV: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/comptes", label: "Comptes pro", icon: Users },
  { to: "/structures", label: "Structures", icon: Building2 },
  { to: "/patients", label: "Patients", icon: UserRound },
  { to: "/agenda", label: "Agenda / RDV", icon: CalendarDays },
  { to: "/dotocards", label: "DotoCard", icon: IdCard },
  { to: "/acces", label: "Accès & blocages", icon: Ban },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/audit", label: "Journal d'audit", icon: Shield },
  { to: "/parametres", label: "Paramètres", icon: Settings },
];

function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const online = useAppStore((s) => s.online);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">
            <img src="/logo-mark.png" alt="DOTO+" />
          </div>
          <div>
            <b>DotoPlus Admin</b>
            <span>Back-office · DOTO+</span>
          </div>
        </div>
        <nav className="nav-stack">
          {NAV.map((l) => {
            const Icon = l.icon;
            return (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
              >
                <span className="nav-ico">
                  <Icon size={18} strokeWidth={2} />
                </span>
                {l.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="foot">DOTO+ · v1.0</div>
      </aside>
      <div className="main">
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={16} strokeWidth={2} aria-hidden />
            <span>Hors ligne — affichage du dernier tableau de bord en cache. Mutations désactivées.</span>
          </div>
        )}
        <div className="topbar">
          <strong style={{ color: "var(--navy)" }}>Administration de la plateforme</strong>
          <div className="row">
            <button
              type="button"
              className="btn ghost sm icon-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              aria-label="Basculer le thème"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600 }}>{user?.full_name}</div>
              <div className="small muted">{user?.role_label}</div>
            </div>
            <Avatar src={(user as any)?.photo_url} name={user?.full_name} size={36} />
            <button
              className="btn ghost sm"
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              <LogOut size={14} strokeWidth={2} aria-hidden />
              Déconnexion
            </button>
          </div>
        </div>
        <div className="content page-enter">{children}</div>
      </div>
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div style={{ padding: 40 }} className="page-enter">
        <div className="skel" style={{ height: 24, width: 200, marginBottom: 16 }} />
        <div className="skel" style={{ height: 160, width: "100%" }} />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user } = useAuth();
  const toast = useAppStore((s) => s.toast);
  const setToast = useAppStore((s) => s.setToast);
  const sessionLocked = useAppStore((s) => s.sessionLocked);
  const needsPinSetup = useAppStore((s) => s.needsPinSetup);
  const setSessionLocked = useAppStore((s) => s.setSessionLocked);
  const setNeedsPinSetup = useAppStore((s) => s.setNeedsPinSetup);
  const setUser = useAppStore((s) => s.setUser);
  useAdminSSE(!!user);
  const [pinError, setPinError] = useState("");
  const [pinBusy, setPinBusy] = useState(false);
  const pinBusyRef = useRef(false);
  const idleTimer = useRef<number | null>(null);
  const IDLE_MS = 5 * 60 * 1000;

  const lockSession = useCallback(() => {
    if (!user || needsPinSetup) return;
    setSessionLocked(true);
    setPinError("");
  }, [user, needsPinSetup, setSessionLocked]);

  const bumpIdle = useCallback(() => {
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    if (!user || needsPinSetup || sessionLocked) return;
    idleTimer.current = window.setTimeout(lockSession, IDLE_MS);
  }, [user, needsPinSetup, sessionLocked, lockSession]);

  useEffect(() => {
    if (!user) return;
    const onVis = () => {
      if (document.visibilityState === "hidden") lockSession();
      else bumpIdle();
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, bumpIdle, { passive: true }));
    document.addEventListener("visibilitychange", onVis);
    bumpIdle();
    return () => {
      events.forEach((e) => window.removeEventListener(e, bumpIdle));
      document.removeEventListener("visibilitychange", onVis);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [user, bumpIdle, lockSession]);

  const handleSetupPin = async (pin: string) => {
    if (pinBusyRef.current) return;
    if (!PIN_REGEX.test(pin)) {
      setPinError(PIN_ERROR);
      return;
    }
    pinBusyRef.current = true;
    setPinBusy(true);
    setPinError("");
    try {
      await api.setPin(pin);
      const next = user ? { ...user, pin_set: true } : null;
      if (next) {
        localStorage.setItem("dotoadmin_user", JSON.stringify(next));
        setUser(next);
      }
      setNeedsPinSetup(false);
      setSessionLocked(false);
    } catch (e: any) {
      setPinError(e?.data?.detail || e?.message || "Impossible d'enregistrer le PIN.");
    } finally {
      pinBusyRef.current = false;
      setPinBusy(false);
    }
  };

  const handleUnlock = async (pin: string) => {
    if (pinBusyRef.current) return;
    if (!PIN_REGEX.test(pin)) {
      setPinError(PIN_ERROR);
      return;
    }
    pinBusyRef.current = true;
    setPinBusy(true);
    setPinError("");
    try {
      await api.verifyPin(pin);
      setSessionLocked(false);
      bumpIdle();
    } catch (e: any) {
      setPinError(e?.data?.detail || e?.message || "PIN incorrect.");
    } finally {
      pinBusyRef.current = false;
      setPinBusy(false);
    }
  };

  const showPinGate = !!user && (needsPinSetup || sessionLocked);

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/comptes" element={<Protected><UsersPage /></Protected>} />
        <Route path="/structures" element={<Protected><Structures /></Protected>} />
        <Route path="/patients" element={<Protected><Patients /></Protected>} />
        <Route path="/agenda" element={<Protected><Agenda /></Protected>} />
        <Route path="/dotocards" element={<Protected><Cards /></Protected>} />
        <Route path="/dodocards" element={<Navigate to="/dotocards" replace />} />
        <Route path="/acces" element={<Protected><Acces /></Protected>} />
        <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
        <Route path="/audit" element={<Protected><Audit /></Protected>} />
        <Route path="/parametres" element={<Protected><Profil /></Protected>} />
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
      {toast ? (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "var(--navy, #1a2b3c)",
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,.2)",
            fontWeight: 600,
            fontSize: 14,
            maxWidth: "90vw",
          }}
        >
          {toast}
          <button
            type="button"
            onClick={() => setToast("")}
            style={{
              marginLeft: 12,
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 700,
            }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      ) : null}
      {showPinGate ? (
        <PinSessionGate
          mode={needsPinSetup ? "setup" : "unlock"}
          error={pinError}
          busy={pinBusy}
          onSubmit={needsPinSetup ? handleSetupPin : handleUnlock}
          title={needsPinSetup ? "PIN administrateur" : "Admin verrouillé"}
        />
      ) : null}
    </>
  );
}
