import { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserRound,
  IdCard,
  Shield,
  LogOut,
  Bell,
  Ban,
  CalendarDays,
  Settings,
  Fingerprint,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  FlaskConical,
  Link2,
} from "lucide-react";
import { useAuth } from "../auth";
import { Avatar } from "./Avatar";
import { BrandMark } from "./BrandMark";

type NavItem = { to: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Pilotage",
    items: [{ to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard }],
  },
  {
    label: "Identité",
    items: [
      { to: "/comptes", label: "Comptes pro", icon: Users },
      { to: "/patients", label: "Patients", icon: UserRound },
      { to: "/kyc", label: "File KYC", icon: Fingerprint },
      { to: "/affiliations", label: "Affiliations", icon: Link2 },
    ],
  },
  {
    label: "Parcours",
    items: [
      { to: "/structures", label: "Structures", icon: Building2 },
      { to: "/agenda", label: "Agenda / RDV", icon: CalendarDays },
      { to: "/ordonnances", label: "Ordonnances", icon: FileText },
      { to: "/examens", label: "Examens", icon: FlaskConical },
      { to: "/dotocards", label: "DotoCard", icon: IdCard },
    ],
  },
  {
    label: "Sécurité",
    items: [
      { to: "/acces", label: "Accès & blocages", icon: Ban },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/audit", label: "Journal d'audit", icon: Shield },
    ],
  },
  {
    label: "Système",
    items: [{ to: "/parametres", label: "Paramètres", icon: Settings }],
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    onCloseMobile();
  }, [loc.pathname, onCloseMobile]);

  return (
    <aside className={"sidebar" + (mobileOpen ? " is-open" : "")} aria-label="Navigation admin">
      <div className="brand">
        <div className="mark">
          <BrandMark size={36} />
        </div>
        <div className="brand-text">
          <b>DotoPlus Admin</b>
          <span>Back-office DOTO+</span>
        </div>
        <button
          type="button"
          className="sidebar-collapse"
          onClick={onToggleCollapse}
          title={collapsed ? "Déplier le menu" : "Replier le menu"}
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      <nav className="nav-stack">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="nav-group">
            <p className="nav-group-label">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
                >
                  <span className="nav-ico">
                    <Icon size={18} strokeWidth={2} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <Avatar src={(user as { photo_url?: string } | null)?.photo_url} name={user?.full_name} size={36} />
          <div className="sidebar-user-meta">
            <b>{user?.full_name || "Administrateur"}</b>
            <span>{user?.role_label || "Admin"}</span>
          </div>
          <button
            type="button"
            className="btn ghost sm icon-btn sidebar-logout"
            title="Déconnexion"
            aria-label="Déconnexion"
            onClick={() => {
              logout();
              nav("/login");
            }}
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
        <p className="sidebar-version">DOTO+ · v1.0</p>
      </div>
    </aside>
  );
}
