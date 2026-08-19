import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { useStructures } from "../queries/hooks";

export default function StructureDetail() {
  const { id } = useParams();
  const { data: items = [] } = useStructures();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nid = Number(id);
  const cached = items.find((s: any) => s.id === nid);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    if (cached) setItem(cached);
    api
      .structure(nid)
      .then(setItem)
      .catch(() => {
        if (!cached) setItem(null);
      })
      .finally(() => setLoading(false));
  }, [nid, cached]);

  return (
    <EntityDetail
      backTo="/structures"
      kicker="Structure de santé"
      title={item?.nom}
      subtitle={item?.type_label || item?.type}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.statut_partenaire ? "green" : "grey")}>
            {item.statut_partenaire ? "Partenaire" : "Inactif"}
          </span>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Type", value: display(item.type_label || item.type) },
              { label: "Code", value: <span className="mono">{display(item.code_structure)}</span> },
              { label: "Localisation", value: display(item.localisation) },
              { label: "Téléphone", value: display(item.telephone) },
              { label: "Département", value: display(item.department) },
              { label: "Commune", value: display(item.commune) },
              { label: "Adresse", value: display(item.address) },
              { label: "Professionnels", value: display(item.nb_professionnels) },
              { label: "Catalogue", value: display(item.catalog_id) },
              { label: "Créée le", value: fmtDateTime(item.created_at) },
            ]
          : []
      }
    />
  );
}
