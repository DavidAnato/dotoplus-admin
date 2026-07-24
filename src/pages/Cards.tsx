import { api } from "../api";
import {
  useAdminCards,
  useReissueCard,
  useRevokeCard,
} from "../queries/hooks";

export default function Cards() {
  const { data: cards = [], isLoading } = useAdminCards();
  const revoke = useRevokeCard();
  const reissue = useReissueCard();

  if (isLoading) {
    return (
      <div className="grid cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skel skel-card" style={{ height: 260 }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 6 }}>DodoCard</h1>
      <p className="muted" style={{ marginBottom: 24 }}>
        Gestion des cartes d&apos;accès QR : signalement de perte (révocation &lt; 1 min), réémission et
        téléchargement PDF.
      </p>
      <div className="grid cols-3">
        {cards.map((c: any) => (
          <div className="card" key={c.id}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <strong>{c.patient_detail.full_name}</strong>
              <span className={"pill " + (c.is_active ? "green" : "red")}>{c.statut_label}</span>
            </div>
            <img
              src={api.qrUrl(c.id)}
              alt="QR"
              className="qr-surface"
              style={{
                width: "100%",
                maxWidth: 170,
                margin: "0 auto",
                display: "block",
                background: "#fff",
                borderRadius: 8,
                padding: 8,
              }}
            />
            <div className="small muted mono" style={{ textAlign: "center", marginTop: 8 }}>
              {c.patient_detail.npi}
            </div>
            <div className="small muted" style={{ textAlign: "center" }}>
              Expire le {c.date_expiration}
            </div>
            {c.motif ? (
              <div className="small muted" style={{ textAlign: "center", marginTop: 4 }}>
                Motif : {c.motif}
                {c.lost_at ? ` · perte ${new Date(c.lost_at).toLocaleString("fr-FR")}` : ""}
              </div>
            ) : null}
            <div className="row" style={{ gap: 8, marginTop: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                className="btn ghost sm"
                type="button"
                onClick={() => {
                  api.downloadCardPdf(c.id).catch((e: any) =>
                    window.alert(e?.message || "PDF indisponible")
                  );
                }}
              >
                PDF
              </button>
              {c.is_active && (
                <button
                  className="btn danger sm"
                  disabled={revoke.isPending}
                  onClick={() => {
                    if (window.confirm("Révoquer cette carte pour perte/vol ?")) {
                      revoke.mutate(c.id);
                    }
                  }}
                >
                  Signaler perte
                </button>
              )}
              <button
                className="btn ghost sm"
                disabled={reissue.isPending}
                onClick={() => {
                  if (window.confirm("Réémettre une nouvelle DodoCard ? L'ancienne sera invalidée.")) {
                    reissue.mutate(c.id);
                  }
                }}
              >
                Réémettre
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
