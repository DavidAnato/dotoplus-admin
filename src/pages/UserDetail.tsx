import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import { Avatar } from "../components/Avatar";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { useToggleUser, useUnlockUser, useUsers } from "../queries/hooks";

export default function UserDetail() {
  const { id } = useParams();
  const { data: users = [] } = useUsers();
  const toggleUser = useToggleUser();
  const unlockUser = useUnlockUser();
  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);

  const nid = Number(id);
  const cached = users.find((u: any) => u.id === nid);

  useEffect(() => {
    if (!nid) {
      setLoading(false);
      return;
    }
    if (cached) setItem(cached);
    api
      .user(nid)
      .then(setItem)
      .catch((e: any) => setErr(e.message || "Chargement impossible"))
      .finally(() => setLoading(false));
  }, [nid, cached]);

  const upload = async (file: File | null) => {
    if (!file || !item) return;
    setPhotoBusy(true);
    setErr("");
    try {
      const updated = await api.uploadUserPhoto(item.id, file);
      setItem(updated);
    } catch (e: any) {
      setErr(e.message || "Upload photo impossible");
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <EntityDetail
      backTo="/comptes"
      kicker="Compte professionnel"
      title={item?.full_name || item?.username}
      subtitle={item ? `@${item.username}` : undefined}
      media={<Avatar src={item?.photo_url} name={item?.full_name || item?.username} size={72} />}
      loading={loading}
      notFound={!loading && !item}
      badges={
        item ? (
          <>
            <span className="pill blue">{item.role_label || item.role}</span>
            {item.is_locked ? (
              <span className="pill amber">Bloqué</span>
            ) : item.actif ? (
              <span className="pill green">Actif</span>
            ) : (
              <span className="pill grey">Inactif</span>
            )}
          </>
        ) : null
      }
      actions={
        item ? (
          <>
            <label className="btn ghost sm" style={{ cursor: "pointer" }}>
              {photoBusy ? "..." : "Photo d'identité"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => void upload(e.target.files?.[0] || null)}
              />
            </label>
            <button
              className="btn ghost sm"
              onClick={() => {
                const label = item.actif
                  ? `Désactiver le compte « ${item.username} » ?`
                  : `Réactiver le compte « ${item.username} » ?`;
                if (!window.confirm(label)) return;
                toggleUser.mutate(item.id, {
                  onSuccess: (next: any) => setItem({ ...item, ...next }),
                });
              }}
            >
              {item.actif ? "Désactiver" : "Activer"}
            </button>
            {item.is_locked ? (
              <button className="btn sm" onClick={() => unlockUser.mutate(item.id)}>
                Débloquer
              </button>
            ) : null}
          </>
        ) : null
      }
      fields={
        item
          ? [
              { label: "Identifiant", value: <span className="mono">{display(item.username)}</span> },
              { label: "Prénom", value: display(item.first_name) },
              { label: "Nom", value: display(item.last_name) },
              { label: "Email", value: display(item.email) },
              { label: "Téléphone", value: display(item.telephone) },
              { label: "Rôle", value: display(item.role_label || item.role) },
              { label: "Spécialité", value: display(item.specialite) },
              { label: "Type d'exercice", value: display(item.type_exercice) },
              { label: "Ville d'exercice", value: display(item.ville_exercice) },
              { label: "Établissement", value: display(item.nom_etablissement) },
              { label: "N° autorisation", value: display(item.numero_autorisation) },
              { label: "N° Ordre", value: display(item.numero_ordre) },
              { label: "Email pro", value: display(item.email_pro) },
              { label: "Ligne pro", value: display(item.ligne_pro) },
              { label: "PIN défini", value: display(item.pin_set) },
              { label: "Inscription", value: fmtDateTime(item.date_joined) },
              {
                label: "Structures",
                value: item.structures?.length
                  ? item.structures.map((s: any) => s.nom).join(", ")
                  : "-",
              },
            ]
          : []
      }
    >
      {err ? <p style={{ color: "var(--emergency)" }}>{err}</p> : null}
      {item?.kyc ? (
        <section className="card">
          <h2 className="detail-section-title">KYC lié</h2>
          <p>
            <span className={"pill " + (item.kyc.statut === "valide" ? "green" : item.kyc.statut === "refuse" ? "red" : "amber")}>
              {item.kyc.statut_label || item.kyc.statut}
            </span>
            <span className="muted" style={{ marginLeft: 8 }}>
              {item.kyc.nom} {item.kyc.prenom}
            </span>
          </p>
        </section>
      ) : null}
    </EntityDetail>
  );
}
