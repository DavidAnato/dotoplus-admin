import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { EntityDetail, display, fmtDateTime } from "../components/EntityDetail";
import { notificationPath } from "../notifRoutes";

export default function NotificationDetail() {
  const { id } = useParams();
  const nid = Number(id);
  const { data: notifs = [], isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => api.notifications(),
  });
  const cached = notifs.find((n: any) => n.id === nid);
  const { data: item, isLoading: loadingOne } = useQuery({
    queryKey: ["admin-notification", nid],
    queryFn: () => api.notification(nid),
    enabled: Number.isFinite(nid) && nid > 0,
  });
  const n = item || cached;
  const related = n ? notificationPath(n) : "";
  const relatedIsSelf = related === `/notifications/${n?.id}`;

  return (
    <EntityDetail
      backTo="/notifications"
      kicker="Notification"
      title={n?.title}
      subtitle={n?.type}
      loading={isLoading || loadingOne}
      notFound={!isLoading && !loadingOne && !n}
      fields={
        n
          ? [
              { label: "Type", value: display(n.type) },
              { label: "Titre", value: display(n.title) },
              { label: "Message", value: display(n.body) },
              { label: "Lue", value: display(Boolean(n.read_at || n.is_read)) },
              { label: "Créée le", value: fmtDateTime(n.created_at) },
            ]
          : []
      }
    >
      {n && related && !relatedIsSelf ? (
        <Link className="btn ghost sm" to={related}>
          Ouvrir la cible
        </Link>
      ) : null}
    </EntityDetail>
  );
}
