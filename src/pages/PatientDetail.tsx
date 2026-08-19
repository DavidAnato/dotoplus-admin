import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { Avatar } from "../components/Avatar";
import { EntityDetail, display, fmtDate, fmtDateTime } from "../components/EntityDetail";
import { usePatients } from "../queries/hooks";

export default function PatientDetail() {
  const { id } = useParams();
  const { data: items = [] } = usePatients();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nid = Number(id);
  const cached = items.find((p: any) => p.id === nid);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    if (cached) setItem(cached);
    api
      .patient(nid)
      .then(setItem)
      .catch(() => {
        if (!cached) setItem(null);
      })
      .finally(() => setLoading(false));
  }, [nid, cached]);

  const dossier = item?.dossier || {};
  const assurance = item?.assurance || {};

  return (
    <EntityDetail
      backTo="/patients"
      kicker="Patient"
      title={item?.full_name || `${item?.prenom || ""} ${item?.nom || ""}`.trim()}
      subtitle={item ? `NPI ${item.npi}` : undefined}
      media={<Avatar src={item?.photo_url} name={item?.full_name} size={72} />}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <>
            <span className="pill red">{item.groupe_sanguin || "-"}</span>
            {item.npi_verifie_anip ? (
              <span className="pill green">ANIP vérifié</span>
            ) : (
              <span className="pill amber">ANIP non vérifié</span>
            )}
          </>
        ) : null
      }
      actions={
        item ? (
          <>
            <Link className="btn ghost sm" to={`/ordonnances`}>Ordonnances</Link>
            <Link className="btn ghost sm" to={`/examens`}>Examens</Link>
          </>
        ) : null
      }
      fields={
        item
          ? [
              { label: "NPI", value: <span className="mono">{display(item.npi)}</span> },
              { label: "Nom", value: display(item.nom) },
              { label: "Prénom", value: display(item.prenom) },
              { label: "Naissance", value: fmtDate(item.date_naissance) },
              { label: "Lieu de naissance", value: display(item.lieu_naissance) },
              { label: "Sexe", value: display(item.sexe) },
              { label: "Groupe sanguin", value: display(item.groupe_sanguin) },
              { label: "Électrophorèse", value: display(item.electrophorese) },
              { label: "Téléphone", value: display(item.telephone) },
              { label: "Email", value: display(item.email) },
              { label: "Contact urgence", value: display(item.contact_urgence_nom) },
              { label: "Tél. urgence", value: display(item.tel_urgence) },
              { label: "Allergies", value: display(dossier.allergies) },
              { label: "Maladies chroniques", value: display(dossier.maladies_chroniques) },
              { label: "Assureur", value: display(assurance.assureur) },
              { label: "Police", value: display(assurance.num_police) },
              { label: "Créé le", value: fmtDateTime(item.created_at) },
            ]
          : []
      }
    />
  );
}
