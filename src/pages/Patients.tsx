import { useState } from "react";
import { useCreatePatient, useCreateCard, usePatients } from "../queries/hooks";
import { Avatar } from "../components/Avatar";
import { PhoneInput } from "../components/PhoneInput";

const BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Non identifié"];
const ELECTRO = ["AA", "AS", "SS", "AC", "SC", "CC", "Non identifié"];
const empty = {
  npi: "", nom: "", prenom: "", date_naissance: "", sexe: "M",
  groupe_sanguin: "Non identifié", electrophorese: "Non identifié",
  telephone: "", tel_urgence: "", contact_urgence_nom: "",
  allergies: "",
};

export default function Patients() {
  const { data: items = [] } = usePatients();
  const createPatient = useCreatePatient();
  const createCard = useCreateCard();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    try {
      const body = {
        ...form,
        allergies: form.allergies ? form.allergies.split(",").map((a: string) => a.trim()).filter(Boolean) : [],
      };
      const p = await createPatient.mutateAsync(body);
      await createCard.mutateAsync(p.id).catch(() => {});
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
          <h1>Patients</h1>
          <p className="muted">Enregistrement des patients + émission automatique d'une DodoCard.</p>
        </div>
        <button className="btn" onClick={() => setModal(true)}>+ Enregistrer un patient</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>NPI</th>
              <th>Patient</th>
              <th>Naissance</th>
              <th>Groupe</th>
              <th>ANIP</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: any) => (
              <tr key={p.id}>
                <td className="mono">{p.npi}</td>
                <td style={{ fontWeight: 600 }}>
                  <span className="row" style={{ gap: 8, alignItems: "center" }}>
                    <Avatar src={p.photo_url} name={p.full_name} size={28} />
                    {p.full_name}
                  </span>
                </td>
                <td>{p.date_naissance || "—"}</td>
                <td><span className="pill red">{p.groupe_sanguin || "—"}</span></td>
                <td>{p.npi_verifie_anip ? <span className="pill green">Vérifié</span> : <span className="pill amber">Non</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Enregistrer un patient</h2>
            <div className="field">
              <label className="label">NPI (ANIP)</label>
              <input className="input mono" value={form.npi} onChange={(e) => setForm({ ...form, npi: e.target.value })} placeholder="1234567890" />
            </div>
            <div className="grid cols-2">
              <div className="field">
                <label className="label">Nom</label>
                <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Date de naissance</label>
                <input className="input" type="date" value={form.date_naissance} onChange={(e) => setForm({ ...form, date_naissance: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Groupe sanguin</label>
                <select className="select" value={form.groupe_sanguin} onChange={(e) => setForm({ ...form, groupe_sanguin: e.target.value })}>
                  {BLOOD.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Électrophorèse</label>
                <select className="select" value={form.electrophorese} onChange={(e) => setForm({ ...form, electrophorese: e.target.value })}>
                  {ELECTRO.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <PhoneInput
                id="patient-tel"
                label="Téléphone"
                value={form.telephone}
                onChange={(telephone) => setForm({ ...form, telephone })}
              />
              <PhoneInput
                id="patient-tel-urgence"
                label="Tél. urgence"
                value={form.tel_urgence}
                onChange={(tel_urgence) => setForm({ ...form, tel_urgence })}
              />
            </div>
              <div className="field">
                <label className="label">Allergies (séparées par virgules)</label>
                <input className="input" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Non identifié, ou Pénicilline, Aspirine" />
              </div>
            {err && <p style={{ color: "var(--emergency)", marginBottom: 10 }}>{err}</p>}
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn" onClick={save} disabled={!form.npi || !form.nom}>Enregistrer + DodoCard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
