import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDate, fmtDateTime } from "../components/EntityDetail";

export default function OrdonnanceDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nid = Number(id);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    api
      .ordonnance(nid)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [nid]);

  const meds = item?.medicaments || [];

  return (
    <EntityDetail
      backTo="/ordonnances"
      kicker="Ordonnance"
      title={item ? `Ordonnance #${item.id}` : undefined}
      subtitle={item?.patient_nom}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.statut === "active" ? "green" : item.statut === "annulee" ? "red" : "blue")}>
            {item.statut_label || item.statut}
          </span>
        ) : null
      }
      actions={
        item?.patient ? (
          <Link className="btn ghost sm" to={`/patients/${item.patient}`}>
            Fiche patient
          </Link>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Patient", value: display(item.patient_nom) },
              { label: "NPI", value: <span className="mono">{display(item.patient_npi)}</span> },
              { label: "Médecin", value: display(item.medecin_nom) },
              { label: "Téléphone médecin", value: display(item.medecin_telephone) },
              { label: "Structure", value: display(item.structure_nom) },
              { label: "Date", value: fmtDate(item.date) },
              { label: "Instructions", value: display(item.instructions) },
              { label: "Dispensée le", value: fmtDateTime(item.dispensee_le) },
              {
                label: "Alertes",
                value: Array.isArray(item.alertes_interactions)
                  ? display(item.alertes_interactions)
                  : display(item.alertes_interactions),
              },
              { label: "Créée le", value: fmtDateTime(item.created_at) },
            ]
          : []
      }
    >
      <section className="card">
        <h2 className="detail-section-title">Médicaments</h2>
        {meds.length ? (
          <table>
            <thead>
              <tr>
                <th>Nom</th>
                <th>Dosage</th>
                <th>Fréquence</th>
                <th>Durée</th>
              </tr>
            </thead>
            <tbody>
              {meds.map((m: any, i: number) => (
                <tr key={m.id || i}>
                  <td>{m.nom}</td>
                  <td>{m.dosage || "-"}</td>
                  <td>{m.frequence || m.frequence_par_jour || "-"}</td>
                  <td>{m.duree_jours ? `${m.duree_jours} j` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">Aucun médicament.</p>
        )}
      </section>
    </EntityDetail>
  );
}
