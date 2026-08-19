import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateUser,
  useToggleUser,
  useUnlockUser,
  useUsers,
} from "../queries/hooks";
import { Avatar } from "../components/Avatar";
import { api } from "../api";
import { PhoneInput } from "../components/PhoneInput";
import { HospitalPicker } from "../components/HospitalPicker";
import { useRowNav } from "../components/EntityDetail";

const ROLES = [
  { v: "medecin", l: "Médecin" },
  { v: "infirmier", l: "Infirmier" },
  { v: "pharmacien", l: "Pharmacien" },
  { v: "laborantin", l: "Laborantin" },
  { v: "ambulancier", l: "Ambulancier" },
  { v: "receptionniste", l: "Réceptionniste" },
  { v: "admin", l: "Admin structure" },
];

const NEED_HOSPITALS = new Set([
  "medecin",
  "infirmier",
  "pharmacien",
  "laborantin",
  "ambulancier",
  "receptionniste",
]);

const empty = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  telephone: "",
  role: "medecin",
  password: "",
  structure_ids: [] as number[],
  structure_principale: "" as number | "",
  type_exercice: "etablissement_sante",
  ville_exercice: "",
  nom_etablissement: "",
  numero_autorisation: "",
  numero_ordre: "",
  email_pro: "",
  ligne_pro: "",
};

export default function Users() {
  const nav = useNavigate();
  const row = useRowNav();
  const { data: users = [] } = useUsers();
  const createUser = useCreateUser();
  const toggleUser = useToggleUser();
  const unlockUser = useUnlockUser();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(empty);
  const [err, setErr] = useState("");
  const [hospitals, setHospitals] = useState<any[]>([]);

  useEffect(() => {
    api
      .hospitals()
      .then((r: any) => setHospitals(r.structures || []))
      .catch(() => setHospitals([]));
  }, []);

  const save = async () => {
    setErr("");
    if (NEED_HOSPITALS.has(form.role)) {
      if (!form.structure_ids?.length) {
        setErr("Choisissez au moins un hôpital.");
        return;
      }
      if (!form.structure_principale) {
        setErr("Désignez l'hôpital principal.");
        return;
      }
    }
    try {
      await createUser.mutateAsync({
        ...form,
        structure_principale: form.structure_principale || null,
      });
      setModal(false);
      setForm(empty);
    } catch (e: any) {
      setErr(
        e?.data?.structure_ids?.[0] ||
          e?.data?.structure_principale?.[0] ||
          JSON.stringify(e?.data) ||
          "Erreur"
      );
    }
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1>Comptes professionnels</h1>
          <p className="muted">Création, rôles, activation, photo d&apos;identité et déblocage.</p>
        </div>
        <button className="btn" onClick={() => setModal(true)}>+ Nouveau compte</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Identifiant</th>
              <th>Nom</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} {...row(`/comptes/${u.id}`)}>
                <td>
                  <Avatar src={u.photo_url} name={u.full_name || u.username} size={32} />
                </td>
                <td className="mono">{u.username}</td>
                <td>{u.full_name || "-"}</td>
                <td><span className="pill blue">{u.role_label}</span></td>
                <td>
                  {u.is_locked ? (
                    <span className="pill amber">Bloqué</span>
                  ) : u.actif ? (
                    <span className="pill green">Actif</span>
                  ) : (
                    <span className="pill grey">Inactif</span>
                  )}
                </td>
                <td>
                  <div className="row" style={{ gap: 6 }} onClick={(e) => e.stopPropagation()}>
                    <button className="btn ghost sm" onClick={() => nav(`/comptes/${u.id}`)}>
                      Fiche
                    </button>
                    <button
                      className="btn ghost sm"
                      onClick={() => {
                        const label = u.actif
                          ? `Désactiver le compte « ${u.username} » ?`
                          : `Réactiver le compte « ${u.username} » ?`;
                        if (!window.confirm(label)) return;
                        toggleUser.mutate(u.id);
                      }}
                    >
                      {u.actif ? "Désactiver" : "Activer"}
                    </button>
                    {u.is_locked && (
                      <button className="btn sm" onClick={() => unlockUser.mutate(u.id)}>
                        Débloquer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Nouveau compte professionnel</h2>
            <div className="grid cols-2">
              <div className="field">
                <label className="label">Identifiant</label>
                <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Rôle</label>
                <select className="select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r.v} value={r.v}>{r.l}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label">Prénom</label>
                <input className="input" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Nom</label>
                <input className="input" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <PhoneInput
                id="user-tel"
                label="Téléphone"
                value={form.telephone}
                onChange={(telephone) => setForm({ ...form, telephone })}
              />
            </div>
            <div className="field">
              <label className="label">Mot de passe</label>
              <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            {NEED_HOSPITALS.has(form.role) ? (
              <>
                <div className="grid cols-2">
                  <div className="field">
                    <label className="label">Type</label>
                    <select className="select" value={form.type_exercice} onChange={(e) => setForm({ ...form, type_exercice: e.target.value })}>
                      <option value="etablissement_sante">Établissement de santé</option>
                      <option value="pharmacie">Pharmacie</option>
                      <option value="laboratoire">Laboratoire</option>
                      <option value="independant">Indépendant</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Ville d'exercice</label>
                    <input className="input" value={form.ville_exercice} onChange={(e) => setForm({ ...form, ville_exercice: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Nom établissement</label>
                    <input className="input" value={form.nom_etablissement} onChange={(e) => setForm({ ...form, nom_etablissement: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">N° autorisation</label>
                    <input className="input" value={form.numero_autorisation} onChange={(e) => setForm({ ...form, numero_autorisation: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">N° Ordre National</label>
                    <input className="input" value={form.numero_ordre} onChange={(e) => setForm({ ...form, numero_ordre: e.target.value })} />
                  </div>
                  <div className="field">
                    <label className="label">Email pro</label>
                    <input className="input" value={form.email_pro} onChange={(e) => setForm({ ...form, email_pro: e.target.value })} />
                  </div>
                </div>
                <PhoneInput
                  id="user-ligne-pro"
                  label="Ligne professionnelle +229"
                  value={form.ligne_pro}
                  onChange={(ligne_pro) => setForm({ ...form, ligne_pro })}
                />
                <div className="field" style={{ marginTop: 12 }}>
                <label className="label">Hôpitaux rattachés</label>
                <HospitalPicker
                  hospitals={hospitals}
                  pickedIds={form.structure_ids || []}
                  principalId={form.structure_principale || ""}
                  onChangePicked={(ids) => setForm({ ...form, structure_ids: ids })}
                  onChangePrincipal={(id) => setForm({ ...form, structure_principale: id })}
                />
              </div>
              </>
            ) : null}
            {err && <p style={{ color: "var(--emergency)", marginBottom: 10 }}>{err}</p>}
            <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
              <button className="btn ghost" onClick={() => setModal(false)}>Annuler</button>
              <button className="btn" onClick={save} disabled={!form.username}>Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
