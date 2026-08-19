import type { KeyboardEvent, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function display(value: unknown): string {
  if (value === 0) return "0";
  if (value === true) return "Oui";
  if (value === false) return "Non";
  if (value == null || value === "") return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  return String(value);
}

export function fmtDate(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("fr-FR");
}

export function fmtDateTime(value?: string | null): string {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useRowNav() {
  const nav = useNavigate();
  return (to: string, extraClass = "") => ({
    className: ("clickable-row" + (extraClass ? ` ${extraClass}` : "")).trim(),
    role: "link" as const,
    tabIndex: 0,
    onClick: () => nav(to),
    onKeyDown: (e: KeyboardEvent<HTMLTableRowElement | HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        nav(to);
      }
    },
  });
}

export type KvField = { label: string; value: ReactNode };

export function KvGrid({ fields }: { fields: KvField[] }) {
  return (
    <dl className="kv-grid">
      {fields.map((f) => (
        <div key={f.label} className="kv-item">
          <dt>{f.label}</dt>
          <dd>{f.value ?? "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EntityDetail({
  backTo,
  backLabel = "Retour à la liste",
  kicker,
  title,
  subtitle,
  media,
  badges,
  actions,
  fields,
  loading,
  notFound,
  children,
}: {
  backTo: string;
  backLabel?: string;
  kicker?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  media?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
  fields?: KvField[];
  loading?: boolean;
  notFound?: boolean;
  children?: ReactNode;
}) {
  if (loading) {
    return (
      <div className="page-enter">
        <Link to={backTo} className="back-link">
          <ArrowLeft size={16} strokeWidth={2} />
          {backLabel}
        </Link>
        <div className="skel" style={{ height: 28, width: 240, marginBottom: 16 }} />
        <div className="skel skel-card" style={{ height: 160 }} />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-enter">
        <Link to={backTo} className="back-link">
          <ArrowLeft size={16} strokeWidth={2} />
          {backLabel}
        </Link>
        <div className="card">
          <h2 style={{ marginBottom: 8 }}>Introuvable</h2>
          <p className="muted">Cette fiche n&apos;existe pas ou n&apos;est plus accessible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter entity-detail">
      <Link to={backTo} className="back-link">
        <ArrowLeft size={16} strokeWidth={2} />
        {backLabel}
      </Link>
      <header className="detail-hero card">
        <div className="detail-hero-main">
          {media ? <div className="detail-media">{media}</div> : null}
          <div className="detail-hero-copy">
            {kicker ? <p className="dash-kicker">{kicker}</p> : null}
            <h1>{title}</h1>
            {subtitle ? <p className="muted" style={{ marginTop: 4 }}>{subtitle}</p> : null}
            {badges ? <div className="detail-badges">{badges}</div> : null}
          </div>
        </div>
        {actions ? <div className="detail-actions">{actions}</div> : null}
      </header>
      {fields && fields.length > 0 ? (
        <section className="card">
          <h2 className="detail-section-title">Informations</h2>
          <KvGrid fields={fields} />
        </section>
      ) : null}
      {children}
    </div>
  );
}
