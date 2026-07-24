/** Notifications admin + aperçu demandes d'accès. */
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";

export default function NotificationsPage() {
  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => api.notifications(),
  });
  const { data: access = [], isLoading: loadingAccess } = useQuery({
    queryKey: ["admin-access-requests"],
    queryFn: async () => {
      try {
        return await api.accessRequests();
      } catch {
        return [];
      }
    },
  });

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>Notifications & accès</h1>
      <p className="muted" style={{ marginBottom: 20 }}>
        Centre in-app admin et demandes d&apos;accès. L&apos;audit urgence reste dans le
        journal d&apos;audit.
      </p>

      <div className="grid cols-2">
        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Mes notifications</h2>
          {isLoading ? (
            <div className="skel" style={{ height: 120 }} />
          ) : !notifs.length ? (
            <p className="muted small">Aucune notification.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {notifs.slice(0, 30).map((n: any) => (
                <li
                  key={n.id}
                  style={{ padding: "10px 0", borderBottom: "1px solid var(--border)" }}
                >
                  <strong style={{ fontSize: 13 }}>{n.title}</strong>
                  <div className="muted small">{n.body}</div>
                  <div className="mono small muted" style={{ marginTop: 4 }}>
                    {n.type} ·{" "}
                    {n.created_at ? new Date(n.created_at).toLocaleString("fr-FR") : ""}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 style={{ fontSize: 16, marginBottom: 12 }}>Demandes d&apos;accès</h2>
          {loadingAccess ? (
            <div className="skel" style={{ height: 120 }} />
          ) : !access.length ? (
            <p className="muted small">Aucune demande pour ce compte.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Statut</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {access.slice(0, 40).map((r: any) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td>
                    <td>{r.patient_name || r.patient_npi}</td>
                    <td>
                      <span
                        className={
                          "pill " +
                          (r.status === "approved" || r.status === "emergency_bypass"
                            ? "green"
                            : r.status === "denied"
                              ? "red"
                              : "amber")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="small">{r.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

