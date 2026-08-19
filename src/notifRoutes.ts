/** Deep-link notifications admin - aligné sur core/contracts.py */
export function notificationPath(n: {
  type?: string;
  payload?: Record<string, unknown> | null;
}): string {
  const payload = n.payload || {};
  const kind = String(payload.kind || n.type || "");
  if (kind.includes("access")) return "/acces";
  if (kind.includes("rdv") || kind === "appointment") return "/agenda";
  if (kind.includes("insurance") || kind === "insurance_updated") return "/patients";
  if (kind === "ordonnance" || kind.includes("ordonnance")) return "/patients";
  if (kind === "examen" || kind.includes("examen") || kind.includes("bon")) return "/patients";
  return "/notifications";
}
