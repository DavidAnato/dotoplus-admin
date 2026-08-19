/** Deep-link notifications admin - aligné sur core/contracts.py */
export function notificationPath(n: {
  id?: number;
  type?: string;
  payload?: Record<string, unknown> | null;
}): string {
  const payload = n.payload || {};
  const kind = String(payload.kind || n.type || "");
  const pid = Number(payload.patient_id || 0);
  const kid = Number(payload.kyc_id || 0);
  const oid = Number(payload.ordonnance_id || 0);
  const eid = Number(payload.examen_id || 0);
  const aid = Number(payload.appointment_id || payload.rdv_id || 0);
  const accid = Number(payload.access_request_id || 0);
  const affid = Number(payload.affiliation_id || 0);
  const generic = Number(payload.id || 0);

  if (kind.includes("kyc")) return kid || generic ? `/kyc/${kid || generic}` : "/kyc";
  if (kind.includes("access")) {
    return accid || generic ? `/acces/demandes/${accid || generic}` : "/acces";
  }
  if (kind.includes("rdv") || kind === "appointment") {
    return aid || generic ? `/agenda/${aid || generic}` : "/agenda";
  }
  if (kind.includes("affiliation")) {
    return affid || generic ? `/affiliations/${affid || generic}` : "/affiliations";
  }
  if (kind === "ordonnance" || kind.includes("ordonnance")) {
    return oid || generic ? `/ordonnances/${oid || generic}` : "/ordonnances";
  }
  if (kind === "examen" || kind.includes("examen") || kind.includes("bon")) {
    return eid || generic ? `/examens/${eid || generic}` : "/examens";
  }
  if (kind.includes("insurance") || kind === "insurance_updated") {
    return pid ? `/patients/${pid}` : "/patients";
  }
  return n.id ? `/notifications/${n.id}` : "/notifications";
}
