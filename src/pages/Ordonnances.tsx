import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { fmtDate, useRowNav } from "../components/EntityDetail";

export default function Ordonnances() {
  const row = useRowNav();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "ordonnances"],
    queryFn: () => api.ordonnances(),
  });

  return (
    <div>
      <div className="page-head">
        <h1>Ordonnances</h1>
        <p className="muted">Prescriptions de la plateforme. Cliquez une ligne pour ouvrir la fiche.</p>
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
                <th>Médecin</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o: any) => (
                <tr key={o.id} {...row(`/ordonnances/${o.id}`)}>
                  <td>{fmtDate(o.date)}</td>
                  <td style={{ fontWeight: 600 }}>{o.patient_nom}</td>
                  <td>{o.medecin_nom || "-"}</td>
                  <td>
                    <span className={"pill " + (o.statut === "active" ? "green" : o.statut === "annulee" ? "red" : "blue")}>
                      {o.statut_label || o.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && !items.length ? <p className="muted" style={{ padding: 12 }}>Aucune ordonnance.</p> : null}
      </div>
    </div>
  );
}
