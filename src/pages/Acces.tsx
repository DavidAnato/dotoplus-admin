import { useState } from "react";
import { Ban, ShieldOff } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAppStore } from "../store/appStore";

export default function Acces() {
  const setToast = useAppStore((s) => s.setToast);
  const qc = useQueryClient();
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["access-blocks"],
    queryFn: () => api.accessBlocks("active=1"),
  });
  const { data: accessReqs = [] } = useQuery({
    queryKey: ["access-requests-admin"],
    queryFn: () => api.accessRequests(),
  });

  const [form, setForm] = useState({
    patient_id: "",
    blocked_user_id: "",
    reason: "Blocage forcé admin",
  });

  const createMut = useMutation({
    mutationFn: () =>
      api.createAccessBlock({
        patient_id: Number(form.patient_id),
        blocked_user_id: Number(form.blocked_user_id),
        reason: form.reason,
      }),
    onSuccess: () => {
      setToast("Blocage créé");
      qc.invalidateQueries({ queryKey: ["access-blocks"] });
    },
    onError: (e: any) => setToast(e?.data?.detail || "Échec"),
  });

  const liftMut = useMutation({
    mutationFn: (id: number) => api.liftAccessBlock(id),
    onSuccess: () => {
      setToast("Blocage levé");
      qc.invalidateQueries({ queryKey: ["access-blocks"] });
    },
  });

  const revokeMut = useMutation({
    mutationFn: (id: number) => api.forceRevokeAccess(id),
    onSuccess: () => {
      setToast("Accès révoqué (force admin)");
      qc.invalidateQueries({ queryKey: ["access-requests-admin"] });
    },
  });

  const reqs = Array.isArray(accessReqs) ? accessReqs : [];

  return (
    <div>
      <h1 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Ban size={22} /> Accès & blocages
      </h1>
      <p className="muted small" style={{ marginBottom: 16 }}>
        Force revoke et blacklist permanente patient ↔ pro / structure
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12 }}>Forcer un blocage</h3>
        <div className="grid cols-3">
          <input
            className="input"
            placeholder="ID patient"
            value={form.patient_id}
            onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
          />
          <input
            className="input"
            placeholder="ID utilisateur pro"
            value={form.blocked_user_id}
            onChange={(e) => setForm({ ...form, blocked_user_id: e.target.value })}
          />
          <input
            className="input"
            placeholder="Motif"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
        </div>
        <button
          className="btn"
          style={{ marginTop: 12 }}
          disabled={!form.patient_id || !form.blocked_user_id || createMut.isPending}
          onClick={() => {
            if (!window.confirm("Bloquer définitivement cet accès ?")) return;
            createMut.mutate();
          }}
        >
          Bloquer
        </button>
      </div>

      <h3 style={{ marginBottom: 10 }}>Blocages actifs</h3>
      {isLoading ? (
        <div className="skel" style={{ height: 80 }} />
      ) : blocks.length === 0 ? (
        <p className="muted">Aucun blocage actif.</p>
      ) : (
        <div className="grid" style={{ gap: 8, marginBottom: 24 }}>
          {blocks.map((b: any) => (
            <div className="card" key={b.id}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>
                    {b.patient_name} → {b.blocked_user_name || b.blocked_structure_nom}
                  </strong>
                  <div className="small muted">{b.reason}</div>
                </div>
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    if (!window.confirm("Lever ce blocage ?")) return;
                    liftMut.mutate(b.id);
                  }}
                >
                  Lever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <ShieldOff size={18} /> Demandes / grants (force revoke)
      </h3>
      <div className="grid" style={{ gap: 8 }}>
        {reqs.slice(0, 30).map((r: any) => (
          <div className="card" key={r.id}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div>
                <strong>
                  #{r.id} {r.patient_name} · {r.requester_name}
                </strong>
                <div className="small muted">
                  {r.status} · {r.requester_role_label}
                </div>
              </div>
              {(r.status === "approved" ||
                r.status === "emergency_bypass" ||
                r.status === "pending") && (
                <button
                  className="btn ghost sm"
                  onClick={() => {
                    if (!window.confirm(`Force revoke #${r.id} ?`)) return;
                    revokeMut.mutate(r.id);
                  }}
                >
                  Force revoke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
