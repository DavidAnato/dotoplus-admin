import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";

export default function AffiliationDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [motif, setMotif] = useState("");
  const nid = Number(id);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    api
      .affiliation(nid)
      .then(async (aff) => {
        setItem(aff);
        try {
          const u = await api.user(aff.user);
          setUserName(u.full_name || u.username);
        } catch {
          setUserName(`#${aff.user}`);
        }
      })
      .catch((e: any) => setErr(e.message || "Chargement impossible"))
      .finally(() => setLoading(false));
  }, [nid]);

  const approve = async () => {
    if (!item) return;
    setBusy(true);
    setErr("");
    try {
      setItem(await api.affiliationApprove(item.id));
    } catch (e: any) {
      setErr(e.message || "Validation impossible");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!item) return;
    setBusy(true);
    setErr("");
    try {
      setItem(await api.affiliationReject(item.id, motif.trim()));
    } catch (e: any) {
      setErr(e.message || "Refus impossible");
    } finally {
      setBusy(false);
    }
  };

  const pending = item && (item.statut === "en_attente" || item.statut === "brouillon");

  return (
    <EntityDetail
      backTo="/affiliations"
      kicker="Affiliation"
      title={item?.structure_nom || item?.nom_etablissement || userName}
      subtitle={userName || undefined}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <>
            <span className={"pill " + (item.statut === "valide" ? "green" : item.statut === "refuse" ? "red" : "amber")}>
              {item.statut_label || item.statut}
            </span>
            {item.principal ? <span className="pill blue">Principal</span> : null}
          </>
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
              { label: "Professionnel", value: display(userName || item.user) },
              { label: "Structure", value: display(item.structure_nom) },
              { label: "Établissement libre", value: display(item.nom_etablissement) },
              { label: "Type", value: display(item.kind_label || item.kind) },
              { label: "Ville", value: display(item.ville) },
              { label: "N° autorisation", value: display(item.numero_autorisation) },
              { label: "N° Ordre", value: display(item.numero_ordre) },
              { label: "Email pro", value: display(item.email_pro) },
              { label: "Ligne pro", value: display(item.ligne_pro) },
              { label: "Motif de refus", value: display(item.motif_refus) },
              { label: "Créée le", value: fmtDateTime(item.created_at) },
              { label: "Mise à jour", value: fmtDateTime(item.updated_at) },
            ]
          : []
      }
    >
      {err ? <p style={{ color: "var(--emergency)" }}>{err}</p> : null}
      {pending ? (
        <section className="card">
          <h2 className="detail-section-title">Motif si refus</h2>
          <input className="input" value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif de refus" />
        </section>
      ) : null}
    </EntityDetail>
  );
}
