import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAppStore } from "../store/appStore";
import { usePatients, useStructures } from "../queries/hooks";
import { useRowNav } from "../components/EntityDetail";

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "planifie", label: "Planifié" },
  { value: "confirme", label: "Confirmé" },
  { value: "annule", label: "Annulé" },
  { value: "termine", label: "Terminé" },
  { value: "absent", label: "Absent" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDateTimeLocal() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Agenda() {
  const row = useRowNav();
  const setToast = useAppStore((s) => s.setToast);
  const qc = useQueryClient();
  const { data: structures = [] } = useStructures();
  const { data: patients = [] } = usePatients();

  const [filters, setFilters] = useState({
    date: "",
    structure: "",
    statut: "",
  });
  const [form, setForm] = useState({
    patient: "",
    structure: "",
    debut: defaultDateTimeLocal(),
    motif: "",
  });
  const [showForm, setShowForm] = useState(false);

  const queryKey = ["appointments", filters];

  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api.appointments({
        date: filters.date || undefined,
        structure: filters.structure ? Number(filters.structure) : undefined,
        statut: filters.statut || undefined,
      }),
  });

  const createMut = useMutation({
    mutationFn: () =>
      api.createAppointment({
        patient: Number(form.patient),
        structure: form.structure ? Number(form.structure) : undefined,
        debut: new Date(form.debut).toISOString(),
        motif: form.motif.trim() || "Consultation",
      }),
    onSuccess: () => {
      setToast("Rendez-vous créé");
      setShowForm(false);
      setForm({ patient: "", structure: "", debut: defaultDateTimeLocal(), motif: "" });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => setToast(e?.data?.detail || e?.message || "Création impossible"),
  });

  const patchMut = useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) =>
      api.updateAppointment(id, { statut }),
    onSuccess: () => {
      setToast("Statut mis à jour");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => setToast(e?.data?.detail || "Mise à jour impossible"),
  });

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a: any, b: any) => new Date(a.debut).getTime() - new Date(b.debut).getTime()
      ),
    [items]
  );

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <CalendarDays size={22} /> Agenda / RDV
          </h1>
          <p className="muted small">Tous les rendez-vous de la plateforme</p>
        </div>
        <button className="btn" type="button" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Fermer" : "+ Nouveau RDV"}
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-3">
          <div className="field">
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="label">Structure</label>
            <select
              className="select"
              value={filters.structure}
              onChange={(e) => setFilters({ ...filters, structure: e.target.value })}
            >
              <option value="">Toutes</option>
              {structures.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label">Statut</label>
            <select
              className="select"
              value={filters.statut}
              onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
            >
              {STATUTS.map((s) => (
                <option key={s.value || "all"} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row" style={{ gap: 8, marginTop: 10 }}>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setFilters({ date: todayISO(), structure: "", statut: "" })}
          >
            Aujourd&apos;hui
          </button>
          <button
            type="button"
            className="btn ghost sm"
            onClick={() => setFilters({ date: "", structure: "", statut: "" })}
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Créer un rendez-vous</h3>
          <div className="grid cols-2">
            <div className="field">
              <label className="label">Patient</label>
              <select
                className="select"
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
              >
                <option value="">Sélectionner…</option>
                {patients.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.npi})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Structure</label>
              <select
                className="select"
                value={form.structure}
                onChange={(e) => setForm({ ...form, structure: e.target.value })}
              >
                <option value="">-</option>
                {structures.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Date et heure</label>
              <input
                className="input"
                type="datetime-local"
                value={form.debut}
                onChange={(e) => setForm({ ...form, debut: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="label">Motif (optionnel)</label>
              <input
                className="input"
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
                placeholder="Consultation générale"
              />
            </div>
          </div>
          <button
            type="button"
            className="btn"
            style={{ marginTop: 12 }}
            disabled={!form.patient || !form.debut || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            Enregistrer
          </button>
        </div>
      ) : null}

      <div className="card">
        {isLoading ? (
          <div className="skel" style={{ height: 120 }} />
        ) : sorted.length === 0 ? (
          <p className="muted">Aucun rendez-vous pour ces filtres.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Structure</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a: any) => (
                <tr key={a.id} {...row(`/agenda/${a.id}`)}>
                  <td>
                    {a.debut
                      ? new Date(a.debut).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{a.patient_name}</div>
                    <div className="small muted mono">{a.patient_npi}</div>
                  </td>
                  <td>{a.structure_nom || "-"}</td>
                  <td>{a.motif || "-"}</td>
                  <td>
                    <span className="pill">{a.statut_label || a.statut}</span>
                  </td>
                  <td>
                    <div className="row" style={{ gap: 6, flexWrap: "wrap" }} onClick={(e) => e.stopPropagation()}>
                      {a.statut !== "termine" && a.statut !== "annule" ? (
                        <>
                          <button
                            type="button"
                            className="btn ghost sm"
                            onClick={() => patchMut.mutate({ id: a.id, statut: "termine" })}
                          >
                            Terminé
                          </button>
                          <button
                            type="button"
                            className="btn ghost sm"
                            onClick={() => patchMut.mutate({ id: a.id, statut: "annule" })}
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <span className="small muted">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
