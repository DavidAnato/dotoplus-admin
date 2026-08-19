import { useEffect, useState } from "react";
import { api } from "../api";

const STATUS: Record<string, string> = {
  brouillon: "Brouillon",
  en_attente: "En attente de validation",
  valide: "Validé",
  refuse: "Refusé",
};

export default function KycPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("en_attente");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [motif, setMotif] = useState<Record<number, string>>({});

  const load = () => {
    api
      .kycList(filter ? `?statut=${filter}` : "")
      .then(setItems)
      .catch((e: any) => setErr(e.message || "Chargement impossible"));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const approve = async (id: number) => {
    setBusyId(id);
    try {
      await api.kycApprove(id);
      load();
    } catch (e: any) {
      setErr(e.message || "Validation impossible");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: number) => {
    const m = (motif[id] || "").trim();
    if (!m) {
      setErr("Indiquez un motif de refus.");
      return;
    }
    setBusyId(id);
    try {
      await api.kycReject(id, m);
      load();
    } catch (e: any) {
      setErr(e.message || "Refus impossible");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="page-enter">
      <div className="page-head">
        <h1>File KYC</h1>
        <p className="muted">Validez ou refusez les dossiers d'identité patients et professionnels.</p>
      </div>
      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        {["en_attente", "brouillon", "valide", "refuse", ""].map((s) => (
          <button
            key={s || "all"}
            className={`btn sm ${filter === s ? "" : "ghost"}`}
            onClick={() => setFilter(s)}
          >
            {s ? STATUS[s] : "Tous"}
          </button>
        ))}
      </div>
      {err ? <p style={{ color: "var(--emergency)", marginBottom: 12 }}>{err}</p> : null}
      <div className="list-stack">
        {items.map((k) => (
          <div key={k.id} className="list-item" style={{ alignItems: "flex-start" }}>
            <div>
              <strong>
                {k.prenom} {k.nom}
              </strong>
              <div className="small muted">
                {k.user_username} · {k.subject} · {k.npi || "sans NPI"}
              </div>
              <span className={`pill ${k.statut === "valide" ? "green" : k.statut === "refuse" ? "red" : "amber"}`}>
                {k.statut_label || STATUS[k.statut] || k.statut}
              </span>
              {k.motif_refus ? <p className="small">{k.motif_refus}</p> : null}
              <div className="row" style={{ gap: 8, marginTop: 8 }}>
                {k.piece_recto_url ? (
                  <img src={k.piece_recto_url} alt="Recto" style={{ height: 72, borderRadius: 8 }} />
                ) : null}
                {k.piece_verso_url ? (
                  <img src={k.piece_verso_url} alt="Verso" style={{ height: 72, borderRadius: 8 }} />
                ) : null}
                {k.selfie_url ? (
                  <img src={k.selfie_url} alt="Selfie" style={{ height: 72, borderRadius: 8 }} />
                ) : null}
              </div>
            </div>
            {k.statut === "en_attente" || k.statut === "brouillon" ? (
              <div style={{ minWidth: 220 }}>
                <input
                  className="input"
                  placeholder="Motif si refus"
                  value={motif[k.id] || ""}
                  onChange={(e) => setMotif({ ...motif, [k.id]: e.target.value })}
                />
                <div className="row" style={{ gap: 8, marginTop: 8 }}>
                  <button className="btn sm emerald" disabled={busyId === k.id} onClick={() => void approve(k.id)}>
                    Valider
                  </button>
                  <button className="btn sm danger" disabled={busyId === k.id} onClick={() => void reject(k.id)}>
                    Refuser
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ))}
        {!items.length ? <p className="muted">Aucun dossier dans ce filtre.</p> : null}
      </div>
    </div>
  );
}
