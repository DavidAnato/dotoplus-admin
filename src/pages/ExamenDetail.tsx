import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDate, fmtDateTime } from "../components/EntityDetail";

export default function ExamenDetail() {
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
      .examen(nid)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [nid]);

  return (
    <EntityDetail
      backTo="/examens"
      kicker="Examen"
      title={item?.type_examen || (item ? `Examen #${item.id}` : undefined)}
      subtitle={item?.patient_nom}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.annule ? "red" : "green")}>
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
              { label: "Catégorie", value: display(item.categorie_label || item.categorie) },
              { label: "Type", value: display(item.type_examen) },
              { label: "Laboratoire", value: display(item.laboratoire) },
              { label: "Laborantin", value: display(item.laborantin_nom) },
              { label: "Prescripteur", value: display(item.medecin_prescripteur) },
              { label: "Date", value: fmtDate(item.date) },
              { label: "Résultat", value: display(item.resultat_texte) },
              { label: "Commentaire labo", value: display(item.commentaire_labo) },
              { label: "Bon lié", value: display(item.bon_id) },
              { label: "Créé le", value: fmtDateTime(item.created_at) },
            ]
          : []
      }
    >
      {item?.fichier_url ? (
        <section className="card">
          <h2 className="detail-section-title">Fichier</h2>
          <a className="btn ghost sm" href={item.fichier_url} target="_blank" rel="noreferrer">
            Ouvrir le document
          </a>
        </section>
      ) : null}
    </EntityDetail>
  );
}
