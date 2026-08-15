/** Hooks admin — SSE sur le même bus que DotoHub / DotoPlus. */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { qk } from "./queries/keys";

export function useAdminSSE(enabled: boolean) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    const url = api.eventsUrl();
    if (!url.includes("access=") || url.endsWith("access=")) return;

    let es: EventSource | null = null;
    let closed = false;
    let retry: number | undefined;

    const onEvent = (ev: { type?: string }) => {
      if (!ev?.type || ev.type === "connected" || ev.type === "ping") return;
      if (ev.type === "appointment" || ev.type === "notification") {
        void qc.invalidateQueries({ queryKey: ["appointments"] });
      }
      if (
        ev.type === "patient_list" ||
        ev.type === "insurance_updated" ||
        ev.type === "appointment"
      ) {
        void qc.invalidateQueries({ queryKey: qk.patients });
        void qc.invalidateQueries({ queryKey: qk.dodocards });
        void qc.invalidateQueries({ queryKey: qk.dashboard });
      }
    };

    const connect = () => {
      if (closed) return;
      es?.close();
      es = new EventSource(url);
      es.onmessage = (msg) => {
        try {
          onEvent(JSON.parse(msg.data));
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        es?.close();
        es = null;
        if (!closed) retry = window.setTimeout(connect, 5000);
      };
    };

    connect();
    return () => {
      closed = true;
      if (retry) window.clearTimeout(retry);
      es?.close();
    };
  }, [enabled, qc]);
}
