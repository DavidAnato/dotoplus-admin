import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { useAppStore } from "../store/appStore";

export default function AccesDemandeDetail() {
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
      .accessRequest(nid)
      .then(setItem)
      .catch(async () => {
        try {
          const list = await api.accessRequests();
          const found = (Array.isArray(list) ? list : []).find((r: any) => r.id === nid);
          setItem(found || null);
        } catch {
          setItem(null);
        }
      })
      .finally(() => setLoading(false));
  }, [nid]);

  const revokeMut = useMutation({
    mutationFn: () => api.forceRevokeAccess(nid),
    onSuccess: () => {
      setToast("Accès révoqué (force admin)");
      qc.invalidateQueries({ queryKey: ["access-requests-admin"] });
      setItem((prev: any) => (prev ? { ...prev, status: "revoked" } : prev));
    },
  });

  const canRevoke =
    item && (item.status === "approved" || item.status === "emergency_bypass" || item.status === "pending");

  return (
    <EntityDetail
      backTo="/acces"
      kicker="Demande d'accès"
      title={item ? `#${item.id} ${item.patient_name}` : undefined}
      subtitle={item?.requester_name}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <span
            className={
              "pill " +
              (item.status === "approved" || item.status === "emergency_bypass"
                ? "green"
                : item.status === "denied"
                  ? "red"
                  : "amber")
            }
          >
            {item.status}
          </span>
        ) : null
      }
      actions={
        canRevoke ? (
          <button
            className="btn ghost sm"
            onClick={() => {
              if (!window.confirm(`Force revoke #${item.id} ?`)) return;
              revokeMut.mutate();
            }}
          >
            Force revoke
          </button>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Patient", value: display(item.patient_name) },
              { label: "NPI", value: <span className="mono">{display(item.patient_npi)}</span> },
              { label: "Demandeur", value: display(item.requester_name) },
              { label: "Rôle", value: display(item.requester_role_label || item.requester_role) },
              { label: "Structure", value: display(item.structure) },
              { label: "Mode", value: display(item.mode) },
              { label: "Portée", value: display(item.scope) },
              { label: "Motif", value: display(item.reason) },
              { label: "Créée le", value: fmtDateTime(item.created_at) },
              { label: "Expire le", value: fmtDateTime(item.expires_at) },
              { label: "Grant expire", value: fmtDateTime(item.grant_expires_at) },
            ]
          : []
      }
    />
  );
}
