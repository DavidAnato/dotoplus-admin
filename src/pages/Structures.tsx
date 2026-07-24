import { useState } from "react";
import { useCreateStructure, useStructures } from "../queries/hooks";
import { PhoneInput } from "../components/PhoneInput";

const TYPES = ["hopital", "clinique", "polyclinique", "centre", "pharmacie", "laboratoire"];
const empty = { nom: "", type: "clinique", localisation: "", code_structure: "", telephone: "" };

export default function Structures() {
  const { data: items = [] } = useStructures();
  const createStructure = useCreateStructure();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    try {
      await createStructure.mutateAsync(form);
      setModal(false);
      setForm(empty);
    } catch (e: any) {
      setErr(JSON.stringify(e?.data) || "Erreur");
    }
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1>Structures de santé</h1>
          <p className="muted">Hôpitaux, cliniques, pharmacies et laboratoires partenaires.</p>
        </div>
        <button className="btn" onClick={() => setModal(true)}>+ Nouvelle structure</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Localisation</th>
              <th>Code</th>
              <th>Pros</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s: any) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.nom}</td>
                <td>{s.type_label}</td>
                <td>{s.localisation || "—"}</td>
                <td className="mono">{s.code_structure}</td>
                <td>{s.nb_professionnels}</td>
                <td>
                  <span className={"pill " + (s.statut_partenaire ? "green" : "grey")}>
                    {s.statut_partenaire ? "Partenaire" : "Inactif"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Nouvelle structure</h2>
            <div className="field">
              <label className="label">Nom</label>
              <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label className="label">Type</label>
                <select className="select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Code structure</label>
                <input className="input mono" value={form.code_structure} onChange={(e) => setForm({ ...form, code_structure: e.target.value })} placeholder="STRUCT-XXX" />
              </div>
              <div className="field">
                <label className="label">Localisation</label>
                <input className="input" value={form.localisation} onChange={(e) => setForm({ ...form, localisation: e.target.value })} />
              </div>
              <PhoneInput
                id="structure-tel"
                label="Téléphone"
                value={form.telephone}
                onChange={(telephone) => setForm({ ...form, telephone })}
              />
            </div>
            {err && <p style={{ color: "var(--emergency)", marginBottom: 10 }}>{err}</p>}
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn" onClick={save} disabled={!form.nom || !form.code_structure}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
