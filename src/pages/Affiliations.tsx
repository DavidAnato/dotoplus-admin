import { useEffect, useState } from "react";
import { api } from "../api";
import { useRowNav } from "../components/EntityDetail";

const STATUS: Record<string, string> = {
  brouillon: "Brouillon",
  en_attente: "En attente",
  valide: "Validé",
  refuse: "Refusé",
};

export default function Affiliations() {
  const row = useRowNav();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState("en_attente");
  const [err, setErr] = useState("");

  useEffect(() => {
    api.users().then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    api
      .affiliations(filter ? `?statut=${filter}` : "")
      .then(setItems)
      .catch((e: any) => setErr(e.message || "Chargement impossible"));
  }, [filter]);

  const nameOf = (userId: number) => {
    const u = users.find((x) => x.id === userId);
    return u?.full_name || u?.username || `#${userId}`;
  };

  return (
    <div className="page-enter">
      <div className="page-head">
        <h1>Affiliations</h1>
        <p className="muted">Rattachements professionnels aux structures, en attente de validation.</p>
      </div>
      <div className="row" style={{ gap: 8, marginBottom: 16 }}>
        {["en_attente", "valide", "refuse", ""].map((s) => (
          <button
            key={s || "all"}
            className={`btn sm ${filter === s ? "" : "ghost"}`}
            onClick={() => setFilter(s)}
          >
            {s ? STATUS[s] : "Tous"}
          </button>
        ))}
      </div>
      {err ? <p style={{ color: "var(--emergency)", marginBottom: 12 }}>{err}</p> : null}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Pro</th>
              <th>Établissement</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} {...row(`/affiliations/${a.id}`)}>
                <td style={{ fontWeight: 600 }}>{nameOf(a.user)}</td>
                <td>{a.structure_nom || a.nom_etablissement || "-"}</td>
                <td>{a.kind_label || a.kind}</td>
                <td>
                  <span className={"pill " + (a.statut === "valide" ? "green" : a.statut === "refuse" ? "red" : "amber")}>
                    {a.statut_label || STATUS[a.statut] || a.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items.length ? <p className="muted" style={{ padding: 12 }}>Aucune affiliation dans ce filtre.</p> : null}
      </div>
    </div>
  );
}
