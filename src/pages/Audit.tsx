import { api } from "../api";
import { useAudit } from "../queries/hooks";

export default function Audit() {
  const { data: logs = [], isLoading } = useAudit();

  const exportCsv = async () => {
    const blob = await fetch(api.auditExportUrl, {
      headers: { Authorization: `Bearer ${api.tokens.access}` },
    }).then((r) => r.blob());
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_doto.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1>Journal d&apos;audit</h1>
          <p className="muted">Qui · quoi · quand · IP — traçabilité complète (loi 2017-20).</p>
        </div>
        <button className="btn emerald" onClick={exportCsv}>
          Exporter CSV
        </button>
      </div>
      <div className="card">
        {isLoading ? (
          <div className="skel" style={{ height: 160 }} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Horodatage</th>
                <th>Utilisateur</th>
                <th>Action</th>
                <th>NPI</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l: any) => (
                <tr key={l.id}>
                  <td className="mono small">
                    {new Date(l.timestamp).toLocaleString("fr-FR")}
                  </td>
                  <td>{l.username}</td>
                  <td>{l.action}</td>
                  <td className="mono">{l.patient_npi || "—"}</td>
                  <td className="mono small">{l.ip || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
