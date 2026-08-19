import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDate, fmtDateTime } from "../components/EntityDetail";

const STATUS: Record<string, string> = {
  brouillon: "Brouillon",
  en_attente: "En attente de validation",
  valide: "Validé",
  refuse: "Refusé",
};

export default function KycDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [motif, setMotif] = useState("");
  const nid = Number(id);

  const load = () => {
    if (!nid) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .kyc(nid)
      .then(setItem)
      .catch((e: any) => setErr(e.message || "Chargement impossible"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [nid]);

  const approve = async () => {
    if (!item) return;
    setBusy(true);
    setErr("");
    try {
      setItem(await api.kycApprove(item.id));
    } catch (e: any) {
      setErr(e.message || "Validation impossible");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!item) return;
    const m = motif.trim();
    if (!m) {
      setErr("Indiquez un motif de refus.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      setItem(await api.kycReject(item.id, m));
    } catch (e: any) {
      setErr(e.message || "Refus impossible");
    } finally {
      setBusy(false);
    }
  };

  const pending = item && (item.statut === "en_attente" || item.statut === "brouillon");

  return (
    <EntityDetail
      backTo="/kyc"
      kicker="Dossier KYC"
      title={item ? `${item.prenom || ""} ${item.nom || ""}`.trim() || item.user_username : undefined}
      subtitle={item ? `${item.user_username} · ${item.subject}` : undefined}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.statut === "valide" ? "green" : item.statut === "refuse" ? "red" : "amber")}>
            {item.statut_label || STATUS[item.statut] || item.statut}
          </span>
        ) : null
      }
      actions={
        pending ? (
          <>
            <button className="btn sm emerald" disabled={busy} onClick={() => void approve()}>
              Valider
            </button>
            <button className="btn sm danger" disabled={busy} onClick={() => void reject()}>
              Refuser
            </button>
          </>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Compte", value: display(item.user_username) },
              { label: "Rôle", value: display(item.user_role) },
              { label: "Sujet", value: display(item.subject) },
              { label: "Nom", value: display(item.nom) },
              { label: "Prénom", value: display(item.prenom) },
              { label: "NPI", value: <span className="mono">{display(item.npi)}</span> },
              { label: "Naissance", value: fmtDate(item.date_naissance) },
              { label: "Lieu de naissance", value: display(item.lieu_naissance) },
              { label: "Sexe", value: display(item.sexe) },
              { label: "Téléphone", value: display(item.telephone) },
              { label: "Soumis le", value: fmtDateTime(item.submitted_at) },
              { label: "Revu le", value: fmtDateTime(item.reviewed_at) },
              { label: "Motif de refus", value: display(item.motif_refus) },
            ]
          : []
      }
    >
      {err ? <p style={{ color: "var(--emergency)" }}>{err}</p> : null}
      {pending ? (
        <section className="card">
          <h2 className="detail-section-title">Motif si refus</h2>
          <input
            className="input"
            placeholder="Motif de refus"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
          />
        </section>
      ) : null}
      {item ? (
        <section className="card">
          <h2 className="detail-section-title">Pièces</h2>
          <div className="kyc-docs">
            {item.piece_recto_url ? (
              <a href={item.piece_recto_url} target="_blank" rel="noreferrer">
                <img src={item.piece_recto_url} alt="Recto" />
              </a>
            ) : null}
            {item.piece_verso_url ? (
              <a href={item.piece_verso_url} target="_blank" rel="noreferrer">
                <img src={item.piece_verso_url} alt="Verso" />
              </a>
            ) : null}
            {item.selfie_url ? (
              <a href={item.selfie_url} target="_blank" rel="noreferrer">
                <img src={item.selfie_url} alt="Selfie" />
              </a>
            ) : null}
            {!item.piece_recto_url && !item.piece_verso_url && !item.selfie_url ? (
              <p className="muted">Aucune pièce jointe.</p>
            ) : null}
          </div>
        </section>
      ) : null}
    </EntityDetail>
  );
}
