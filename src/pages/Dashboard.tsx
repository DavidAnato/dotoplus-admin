import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Users,
  UserRound,
  IdCard,
  Building2,
  ClipboardList,
  Ban,
  Lock,
  Shield,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { useAdminDashboard } from "../queries/hooks";
import { useAppStore } from "../store/appStore";

const ROLE_LABELS: Record<string, string> = {
  patient: "Patients",
  medecin: "Médecins",
  infirmier: "Infirmiers",
  pharmacien: "Pharmaciens",
  laborantin: "Laborantins",
  admin: "Admins",
};

const ROLE_COLORS = ["#3e8295", "#1e3755", "#2f6a7a", "#085041", "#a32d2d", "#633806"];
const CARD_COLORS: Record<string, string> = {
  active: "#3e8295",
  revoquee: "#a32d2d",
  expiree: "#9ca3af",
  reemise: "#1e3755",
};

const ACTION_LABELS: Record<string, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  emettre_dodocard: "Émission DotoCard",
  revoquer_dodocard: "Révocation DotoCard",
  reemettre_dodocard: "Réémission DotoCard",
  scan_dodocard: "Scan DotoCard",
  consulter_dossier: "Consultation dossier",
  recherche_patient: "Recherche patient",
};

type Dash = {
  utilisateurs?: number;
  professionnels?: number;
  patients?: number;
  structures?: number;
  consultations?: number;
  consultations_7j?: number;
  consultations_30j?: number;
  ordonnances_actives?: number;
  examens?: number;
  dodocards_actives?: number;
  dodocards_revoquees?: number;
  dodocards_expirees?: number;
  dodocards_reemises?: number;
  dodocards_total?: number;
  dodocards_statut?: { statut: string; label: string; total: number }[];
  evenements_audit?: number;
  evenements_audit_7j?: number;
  echec_auth_7j?: number;
  comptes_verrouilles?: number;
  repartition_roles?: { role: string; total: number }[];
  consultations_trend?: { date: string; total: number }[];
  audit_recent?: {
    id: number;
    username: string;
    action: string;
    target?: string;
    patient_npi?: string;
    ip?: string;
    timestamp: string;
  }[];
  structures_recentes?: {
    id: number;
    nom: string;
    type: string;
    localisation?: string;
    code_structure?: string;
  }[];
  genere_le?: string;
};

function formatDay(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch {
    return iso;
  }
}

function Kpi({
  label,
  value,
  hint,
  tone = "navy",
  icon: Icon,
  onClick,
  delay = 0,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "navy" | "teal" | "blue" | "amber" | "red";
  icon: LucideIcon;
  onClick?: () => void;
  delay?: number;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      className={`kpi kpi-${tone} stagger ${onClick ? "clickable" : ""}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="kpi-top">
        <span className="kpi-icon" aria-hidden>
          <Icon size={18} strokeWidth={2} />
        </span>
        {hint ? <span className="kpi-hint">{hint}</span> : null}
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </Tag>
  );
}

function Qa({ to, icon: Icon, children }: { to: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Link to={to} className="qa">
      <span className="qa-ico">
        <Icon size={16} strokeWidth={2} />
      </span>
      {children}
    </Link>
  );
}

function DashSkeleton() {
  return (
    <div className="dash page-enter">
      <div className="dash-hero">
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 14, width: 120, marginBottom: 10 }} />
          <div className="skel" style={{ height: 32, width: 260, marginBottom: 10 }} />
          <div className="skel" style={{ height: 14, width: "60%" }} />
        </div>
      </div>
      <div className="kpi-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skel skel-card" style={{ height: 108 }} />
        ))}
      </div>
      <div className="dash-grid" style={{ marginTop: 16 }}>
        <div className="skel skel-card" style={{ height: 280 }} />
        <div className="skel skel-card" style={{ height: 280 }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const online = useAppStore((s) => s.online);
  const { data: result, isLoading, isError, error, refetch } = useAdminDashboard();
  const s = (result?.data || null) as Dash | null;
  const fromCache = !!result?.fromCache;
  const err = isError ? (error as Error)?.message || "Impossible de charger les statistiques." : "";

  const trend = useMemo(
    () =>
      (s?.consultations_trend || []).map((d) => ({
        ...d,
        label: formatDay(d.date),
      })),
    [s]
  );

  const cardPie = useMemo(
    () =>
      (s?.dodocards_statut || []).filter((c) => c.total > 0).length
        ? (s?.dodocards_statut || []).map((c) => ({
            name: c.label,
            value: c.total,
            statut: c.statut,
          }))
        : [{ name: "Aucune carte", value: 1, statut: "expiree" }],
    [s]
  );

  const roles = s?.repartition_roles || [];
  const maxRole = Math.max(1, ...roles.map((r) => r.total));

  if (err && !s) {
    return (
      <div className="card" style={{ borderLeft: "4px solid var(--emergency)" }}>
        <h2 style={{ marginBottom: 8 }}>Tableau de bord indisponible</h2>
        <p className="muted">{err}</p>
        <button className="btn sm" style={{ marginTop: 12 }} onClick={() => refetch()}>
          Réessayer
        </button>
      </div>
    );
  }

  if (isLoading && !s) return <DashSkeleton />;
  if (!s) return <DashSkeleton />;

  const generated = s.genere_le
    ? new Date(s.genere_le).toLocaleString("fr-FR")
    : "-";

  return (
    <div className="dash page-enter">
      <header className="dash-hero stagger" style={{ animationDelay: "40ms" }}>
        <div>
          <p className="dash-kicker">Centre de contrôle</p>
          <h1>Tableau de bord</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: 560 }}>
            Vue d&apos;ensemble de l&apos;écosystème DOTO+ - comptes, DotoCards, structures et
            activité clinique.
            {fromCache ? " (cache hors ligne)" : ""}
          </p>
        </div>
        <div className="dash-hero-meta">
          <span className={`pill ${online ? "green" : "amber"}`}>{online ? "Live" : "Hors ligne"}</span>
          <span className="small muted">Mis à jour · {generated}</span>
        </div>
      </header>

      <section className="kpi-grid">
        <Kpi label="Professionnels" value={s.professionnels ?? 0} icon={Users} tone="navy" hint="comptes pro" onClick={() => nav("/comptes")} delay={60} />
        <Kpi label="Patients" value={s.patients ?? 0} icon={UserRound} tone="blue" onClick={() => nav("/patients")} delay={90} />
        <Kpi label="DotoCards actives" value={s.dodocards_actives ?? 0} icon={IdCard} tone="teal" onClick={() => nav("/dotocards")} delay={120} />
        <Kpi label="Structures" value={s.structures ?? 0} icon={Building2} tone="navy" onClick={() => nav("/structures")} delay={150} />
        <Kpi
          label="Consultations (7 j)"
          value={s.consultations_7j ?? 0}
          icon={ClipboardList}
          tone="blue"
          hint={`${s.consultations_30j ?? 0} / 30 j`}
          onClick={() => nav("/patients")}
          delay={180}
        />
        <Kpi label="Cartes révoquées" value={s.dodocards_revoquees ?? 0} icon={Ban} tone="red" onClick={() => nav("/dotocards")} delay={210} />
        <Kpi
          label="Échecs auth (7 j)"
          value={s.echec_auth_7j ?? 0}
          icon={Lock}
          tone="amber"
          hint={`${s.comptes_verrouilles ?? 0} verrouillé(s)`}
          onClick={() => nav("/audit")}
          delay={240}
        />
        <Kpi label="Audit (7 j)" value={s.evenements_audit_7j ?? 0} icon={Shield} tone="teal" onClick={() => nav("/audit")} delay={270} />
      </section>

      <section className="quick-actions stagger" style={{ animationDelay: "300ms" }}>
        <Qa to="/comptes" icon={UserPlus}>Créer un pro</Qa>
        <Qa to="/dotocards" icon={IdCard}>Émettre une DotoCard</Qa>
        <Qa to="/audit" icon={Shield}>Journal d&apos;audit</Qa>
        <Qa to="/structures" icon={Building2}>Structures</Qa>
        <Qa to="/patients" icon={UserRound}>Patients</Qa>
      </section>

      <div className="dash-grid">
        <div className="card dash-panel stagger" style={{ animationDelay: "320ms" }}>
          <div className="panel-head">
            <div>
              <h3>Consultations - 30 jours</h3>
              <p className="small muted">
                Total période · {s.consultations_30j ?? 0} · cumul plateforme · {s.consultations ?? 0}
              </p>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="consultFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3e8295" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3e8295" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    boxShadow: "0 8px 24px rgba(18,41,77,0.12)",
                  }}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.date
                      ? new Date(payload[0].payload.date).toLocaleDateString("fr-FR")
                      : ""
                  }
                  formatter={(v) => [`${Number(v ?? 0)} consultation(s)`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#085041"
                  strokeWidth={2.5}
                  fill="url(#consultFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card dash-panel stagger" style={{ animationDelay: "360ms" }}>
          <div className="panel-head">
            <div>
              <h3>DotoCards - statuts</h3>
              <p className="small muted">
                {s.dodocards_total ?? 0} carte(s) au total · {s.ordonnances_actives ?? 0} ordonnance(s)
                active(s)
              </p>
            </div>
          </div>
          <div className="card-status-row">
            <div className="chart-wrap pie">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={cardPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={2}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    onClick={() => nav("/dotocards")}
                    style={{ cursor: "pointer" }}
                  >
                    {cardPie.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CARD_COLORS[entry.statut] || "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [`${Number(v ?? 0)}`, String(name)]}
                    contentStyle={{ borderRadius: 10, border: "1px solid var(--border)", background: "var(--surface)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="status-legend">
              {(s.dodocards_statut || []).map((c) => (
                <li
                  key={c.statut}
                  className="clickable-row"
                  onClick={() => nav("/dotocards")}
                  onKeyDown={(e) => e.key === "Enter" && nav("/dotocards")}
                  role="link"
                  tabIndex={0}
                >
                  <span
                    className="dot"
                    style={{ background: CARD_COLORS[c.statut] || "#9ca3af" }}
                  />
                  <span className="grow">{c.label}</span>
                  <strong>{c.total}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card dash-panel stagger" style={{ animationDelay: "400ms" }}>
          <div className="panel-head">
            <div>
              <h3>Répartition des rôles</h3>
              <p className="small muted">{s.utilisateurs ?? 0} utilisateur(s)</p>
            </div>
          </div>
          <div className="role-bars">
            {roles.length === 0 ? (
              <p className="muted small">Aucune donnée de rôle pour le moment.</p>
            ) : (
              roles.map((r, i) => (
                <button
                  type="button"
                  key={r.role}
                  className="role-row clickable"
                  onClick={() => nav(r.role === "patient" ? "/patients" : "/comptes")}
                >
                  <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                    <span>{ROLE_LABELS[r.role] || r.role}</span>
                    <strong>{r.total}</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(r.total / maxRole) * 100}%`,
                        background: ROLE_COLORS[i % ROLE_COLORS.length],
                      }}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="card dash-panel stagger" style={{ animationDelay: "440ms" }}>
          <div className="panel-head">
            <div>
              <h3>Structures partenaires</h3>
              <p className="small muted">Aperçu des établissements actifs</p>
            </div>
            <Link to="/structures" className="small">
              Tout voir →
            </Link>
          </div>
          <ul className="struct-list">
            {(s.structures_recentes || []).length === 0 ? (
              <li className="muted small">Aucune structure enregistrée.</li>
            ) : (
              (s.structures_recentes || []).map((st) => (
                <li
                  key={st.id}
                  className="clickable-row"
                  onClick={() => nav("/structures")}
                  onKeyDown={(e) => e.key === "Enter" && nav("/structures")}
                  role="link"
                  tabIndex={0}
                >
                  <div>
                    <strong>{st.nom}</strong>
                    <div className="small muted">
                      {st.localisation || "-"} · {st.code_structure || st.type}
                    </div>
                  </div>
                  <span className="pill blue">{st.type}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="card dash-panel stagger" style={{ marginTop: 16, animationDelay: "480ms" }}>
        <div className="panel-head">
          <div>
            <h3>Activité récente - audit</h3>
            <p className="small muted">
              {s.evenements_audit ?? 0} événement(s) · dernières actions tracées
            </p>
          </div>
          <Link to="/audit" className="btn ghost sm">
            Ouvrir le journal
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>NPI</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {(s.audit_recent || []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="muted">
                    Aucun événement d&apos;audit pour l&apos;instant - les actions apparaîtront ici.
                  </td>
                </tr>
              ) : (
                (s.audit_recent || []).map((l) => (
                  <tr
                    key={l.id}
                    className="clickable-row"
                    onClick={() => nav("/audit")}
                    onKeyDown={(e) => e.key === "Enter" && nav("/audit")}
                    tabIndex={0}
                  >
                    <td className="small">
                      {new Date(l.timestamp).toLocaleString("fr-FR")}
                    </td>
                    <td className="mono">{l.username || "-"}</td>
                    <td>
                      <span className="pill grey">
                        {ACTION_LABELS[l.action] || l.action}
                      </span>
                    </td>
                    <td className="mono small">{l.patient_npi || "-"}</td>
                    <td className="mono small">{l.ip || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dash-footer-stats">
        <span>
          Ordonnances actives · <strong>{s.ordonnances_actives ?? 0}</strong>
        </span>
        <span>
          Examens · <strong>{s.examens ?? 0}</strong>
        </span>
        <span>
          Utilisateurs · <strong>{s.utilisateurs ?? 0}</strong>
        </span>
      </div>
    </div>
  );
}
