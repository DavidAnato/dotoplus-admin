import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { LogOut, Menu, Moon, Sun, WifiOff } from "lucide-react";
import { useAuth } from "./auth";
import { useAppStore } from "./store/appStore";
import { api } from "./api";
import { PIN_ERROR, PIN_REGEX } from "./constants";
import { PinSessionGate } from "./components/PinSessionGate";
import { Sidebar } from "./components/Sidebar";
import { useAdminSSE } from "./hooks";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Structures from "./pages/Structures";
import StructureDetail from "./pages/StructureDetail";
import Patients from "./pages/Patients";
import PatientDetail from "./pages/PatientDetail";
import Cards from "./pages/Cards";
import CardDetail from "./pages/CardDetail";
import Audit from "./pages/Audit";
import AuditDetail from "./pages/AuditDetail";
import NotificationsPage from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import Acces from "./pages/Acces";
import AccesBlockDetail from "./pages/AccesBlockDetail";
import AccesDemandeDetail from "./pages/AccesDemandeDetail";
import Agenda from "./pages/Agenda";
import AgendaDetail from "./pages/AgendaDetail";
import Profil from "./pages/Profil";
import KycPage from "./pages/Kyc";
import KycDetail from "./pages/KycDetail";
import Affiliations from "./pages/Affiliations";
import AffiliationDetail from "./pages/AffiliationDetail";
import Ordonnances from "./pages/Ordonnances";
import OrdonnanceDetail from "./pages/OrdonnanceDetail";
import Examens from "./pages/Examens";
import ExamenDetail from "./pages/ExamenDetail";

const SIDEBAR_KEY = "dotoadmin_sidebar_collapsed";

function RedirectId({ to }: { to: string }) {
  const { id } = useParams();
  return <Navigate to={`${to}/${id}`} replace />;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const nav = useNavigate();
  const online = useAppStore((s) => s.online);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_KEY) === "1");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className={"shell" + (collapsed ? " is-collapsed" : "")}>
      <button
        type="button"
        className={"sidebar-backdrop" + (mobileOpen ? " is-on" : "")}
        aria-label="Fermer le menu"
        onClick={closeMobile}
      />
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={closeMobile}
      />
      <div className="main">
        {!online && (
          <div className="offline-banner" role="status">
            <WifiOff size={16} strokeWidth={2} aria-hidden />
            <span>Hors ligne - affichage du dernier tableau de bord en cache. Mutations désactivées.</span>
          </div>
        )}
        <div className="topbar">
          <div className="row" style={{ gap: 10 }}>
            <button
              type="button"
              className="btn ghost sm icon-btn menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={16} />
            </button>
            <strong style={{ color: "var(--navy)" }}>Administration de la plateforme</strong>
          </div>
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
        <Route path="/comptes/:id" element={<Protected><UserDetail /></Protected>} />
        <Route path="/users" element={<Navigate to="/comptes" replace />} />
        <Route path="/users/:id" element={<Protected><RedirectId to="/comptes" /></Protected>} />
        <Route path="/structures" element={<Protected><Structures /></Protected>} />
        <Route path="/structures/:id" element={<Protected><StructureDetail /></Protected>} />
        <Route path="/patients" element={<Protected><Patients /></Protected>} />
        <Route path="/patients/:id" element={<Protected><PatientDetail /></Protected>} />
        <Route path="/agenda" element={<Protected><Agenda /></Protected>} />
        <Route path="/agenda/:id" element={<Protected><AgendaDetail /></Protected>} />
        <Route path="/kyc" element={<Protected><KycPage /></Protected>} />
        <Route path="/kyc/:id" element={<Protected><KycDetail /></Protected>} />
        <Route path="/affiliations" element={<Protected><Affiliations /></Protected>} />
        <Route path="/affiliations/:id" element={<Protected><AffiliationDetail /></Protected>} />
        <Route path="/ordonnances" element={<Protected><Ordonnances /></Protected>} />
        <Route path="/ordonnances/:id" element={<Protected><OrdonnanceDetail /></Protected>} />
        <Route path="/examens" element={<Protected><Examens /></Protected>} />
        <Route path="/examens/:id" element={<Protected><ExamenDetail /></Protected>} />
        <Route path="/dotocards" element={<Protected><Cards /></Protected>} />
        <Route path="/dotocards/:id" element={<Protected><CardDetail /></Protected>} />
        <Route path="/dodocards" element={<Navigate to="/dotocards" replace />} />
        <Route path="/acces" element={<Protected><Acces /></Protected>} />
        <Route path="/acces/blocs/:id" element={<Protected><AccesBlockDetail /></Protected>} />
        <Route path="/acces/demandes/:id" element={<Protected><AccesDemandeDetail /></Protected>} />
        <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
        <Route path="/notifications/:id" element={<Protected><NotificationDetail /></Protected>} />
        <Route path="/audit" element={<Protected><Audit /></Protected>} />
        <Route path="/audit/:id" element={<Protected><AuditDetail /></Protected>} />
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
