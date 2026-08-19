import { useAudit } from "../queries/hooks";
import { useParams } from "react-router-dom";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";

export default function AuditDetail() {
  const { id } = useParams();
  const nid = Number(id);
  const { data: logs = [], isLoading } = useAudit();
  const item = logs.find((l: any) => l.id === nid);

  return (
    <EntityDetail
      backTo="/audit"
      kicker="Événement d'audit"
      title={item?.action}
      subtitle={item?.username}
      loading={isLoading}
      notFound={!isLoading && !item}
      fields={
        item
          ? [
              { label: "Horodatage", value: fmtDateTime(item.timestamp) },
              { label: "Utilisateur", value: display(item.username) },
              { label: "Action", value: display(item.action) },
              { label: "Cible", value: display(item.target) },
              { label: "NPI", value: <span className="mono">{display(item.patient_npi)}</span> },
              { label: "IP", value: <span className="mono">{display(item.ip)}</span> },
              { label: "Méthode", value: display(item.method) },
              { label: "Chemin", value: <span className="mono">{display(item.path)}</span> },
              { label: "User-agent", value: display(item.user_agent) },
            ]
          : []
      }
    />
  );
}
