import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { fmtDate, useRowNav } from "../components/EntityDetail";

export default function Examens() {
  const row = useRowNav();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "examens"],
    queryFn: () => api.examens(),
  });

  return (
    <div>
      <div className="page-head">
        <h1>Examens</h1>
        <p className="muted">Résultats et demandes d&apos;examens. Cliquez une ligne pour ouvrir la fiche.</p>
      </div>
      <div className="card">
        {isLoading ? (
          <div className="skel" style={{ height: 120 }} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e: any) => (
                <tr key={e.id} {...row(`/examens/${e.id}`)}>
                  <td>{fmtDate(e.date)}</td>
                  <td style={{ fontWeight: 600 }}>{e.patient_nom}</td>
                  <td>{e.type_examen || e.categorie_label || "-"}</td>
                  <td>
                    <span className={"pill " + (e.statut === "termine" || e.statut === "disponible" ? "green" : "amber")}>
                      {e.statut_label || e.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && !items.length ? <p className="muted" style={{ padding: 12 }}>Aucun examen.</p> : null}
      </div>
    </div>
  );
}
