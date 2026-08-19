import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { useAppStore } from "../store/appStore";

export default function AgendaDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const setToast = useAppStore((s) => s.setToast);
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const nid = Number(id);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    api
      .appointment(nid)
      .then(setItem)
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [nid]);

  const patchMut = useMutation({
    mutationFn: (statut: string) => api.updateAppointment(nid, { statut }),
    onSuccess: (next) => {
      setItem(next);
      setToast("Statut mis à jour");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => setToast(e?.data?.detail || "Mise à jour impossible"),
  });

  const closed = item && (item.statut === "termine" || item.statut === "annule");

  return (
    <EntityDetail
      backTo="/agenda"
      kicker="Rendez-vous"
      title={item?.patient_name || (item ? `RDV #${item.id}` : undefined)}
      subtitle={item ? fmtDateTime(item.debut) : undefined}
      loading={loading}
      notFound={!loading && !item}
      badges={item ? <span className="pill blue">{item.statut_label || item.statut}</span> : null}
      actions={
        item && !closed ? (
          <>
            <button className="btn sm emerald" onClick={() => patchMut.mutate("termine")}>
              Terminé
            </button>
            <button className="btn ghost sm" onClick={() => patchMut.mutate("annule")}>
              Annuler
            </button>
          </>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Patient", value: display(item.patient_name) },
              { label: "NPI", value: <span className="mono">{display(item.patient_npi)}</span> },
              { label: "Structure", value: display(item.structure_nom) },
              { label: "Professionnel", value: display(item.professionnel_nom) },
              { label: "Début", value: fmtDateTime(item.debut) },
              { label: "Fin", value: fmtDateTime(item.fin) },
              { label: "Motif", value: display(item.motif) },
              { label: "Notes", value: display(item.notes) },
              { label: "Créé le", value: fmtDateTime(item.created_at) },
            ]
          : []
      }
    >
      {item?.patient ? (
        <Link className="btn ghost sm" to={`/patients/${item.patient}`}>
          Ouvrir le patient
        </Link>
      ) : null}
    </EntityDetail>
  );
}
