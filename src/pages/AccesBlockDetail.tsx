import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../store/appStore";

export default function AccesBlockDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const setToast = useAppStore((s) => s.setToast);
  const nid = Number(id);
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["access-blocks", "all"],
    queryFn: () => api.accessBlocks(""),
  });
  const item = blocks.find((b: any) => b.id === nid);

  const liftMut = useMutation({
    mutationFn: () => api.liftAccessBlock(nid),
    onSuccess: () => {
      setToast("Blocage levé");
      qc.invalidateQueries({ queryKey: ["access-blocks"] });
    },
  });

  return (
    <EntityDetail
      backTo="/acces"
      kicker="Blocage d'accès"
      title={item ? `${item.patient_name} → ${item.blocked_user_name || item.blocked_structure_nom}` : undefined}
      loading={isLoading}
      notFound={!isLoading && !item}
      badges={
        item ? (
          <span className={"pill " + (item.active ? "red" : "grey")}>{item.active ? "Actif" : "Levé"}</span>
        ) : null
      }
      actions={
        item?.active ? (
          <button
            className="btn ghost sm"
            onClick={() => {
              if (!window.confirm("Lever ce blocage ?")) return;
              liftMut.mutate();
            }}
          >
            Lever
          </button>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Patient", value: display(item.patient_name) },
              { label: "NPI", value: <span className="mono">{display(item.patient_npi)}</span> },
              { label: "Utilisateur bloqué", value: display(item.blocked_user_name) },
              { label: "Rôle", value: display(item.blocked_user_role) },
              { label: "Structure bloquée", value: display(item.blocked_structure_nom) },
              { label: "Motif", value: display(item.reason) },
              { label: "Créé le", value: fmtDateTime(item.created_at) },
              { label: "Levé le", value: fmtDateTime(item.lifted_at) },
            ]
          : []
      }
    />
  );
}
