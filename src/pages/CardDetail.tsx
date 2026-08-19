import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDate, fmtDateTime } from "../components/EntityDetail";
import { useAdminCards, useReissueCard, useRevokeCard } from "../queries/hooks";

export default function CardDetail() {
  const { id } = useParams();
  const { data: cards = [] } = useAdminCards();
  const revoke = useRevokeCard();
  const reissue = useReissueCard();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nid = Number(id);
  const cached = cards.find((c: any) => c.id === nid);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    if (cached) setItem(cached);
    api
      .dodocard(nid)
      .then(setItem)
      .catch(() => {
        if (!cached) setItem(null);
      })
      .finally(() => setLoading(false));
  }, [nid, cached]);

  const patient = item?.patient_detail || {};

  return (
    <EntityDetail
      backTo="/dotocards"
      kicker="DotoCard"
      title={patient.full_name || item?.patient_nom}
      subtitle={patient.npi ? `NPI ${patient.npi}` : undefined}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.is_active ? "green" : "red")}>{item.statut_label || item.statut}</span>
        ) : null
      }
      actions={
        item ? (
          <>
            {patient.id ? (
              <Link className="btn ghost sm" to={`/patients/${patient.id}`}>
                Fiche patient
              </Link>
            ) : null}
            <button
              className="btn ghost sm"
              type="button"
              onClick={() => {
                api.downloadCardPdf(item.id).catch((e: any) => window.alert(e?.message || "PDF indisponible"));
              }}
            >
              PDF
            </button>
            {item.is_active ? (
              <button
                className="btn danger sm"
                disabled={revoke.isPending}
                onClick={() => {
                  if (window.confirm("Révoquer cette carte pour perte/vol ?")) revoke.mutate(item.id);
                }}
              >
                Signaler perte
              </button>
            ) : null}
            <button
              className="btn ghost sm"
              disabled={reissue.isPending}
              onClick={() => {
                if (window.confirm("Réémettre une nouvelle DotoCard ? L'ancienne sera invalidée.")) {
                  reissue.mutate(item.id);
                }
              }}
            >
              Réémettre
            </button>
          </>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Patient", value: display(patient.full_name || item.patient_nom) },
              { label: "NPI", value: <span className="mono">{display(patient.npi)}</span> },
              { label: "Groupe sanguin", value: display(item.groupe_sanguin) },
              { label: "Création", value: fmtDate(item.date_creation) },
              { label: "Expiration", value: fmtDate(item.date_expiration) },
              { label: "Révoquée le", value: fmtDateTime(item.revoquee_le) },
              { label: "Perte signalée", value: fmtDateTime(item.lost_at) },
              { label: "Motif", value: display(item.motif) },
            ]
          : []
      }
    >
      {item ? (
        <section className="card">
          <h2 className="detail-section-title">QR d&apos;accès</h2>
          <img
            src={api.qrUrl(item.id)}
            alt="QR"
            className="qr-surface"
            style={{
              width: 180,
              background: "#fff",
              borderRadius: 12,
              padding: 10,
            }}
          />
        </section>
      ) : null}
    </EntityDetail>
  );
}
