import { PIN_ERROR, PIN_REGEX } from "./constants";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://doto-backend-71tk.onrender.com");

const store = {
  get access() {
    return localStorage.getItem("dotoadmin_access");
  },
  get refresh() {
    return localStorage.getItem("dotoadmin_refresh");
  },
  set(a: string, r: string) {
    localStorage.setItem("dotoadmin_access", a);
    localStorage.setItem("dotoadmin_refresh", r);
  },
  clear() {
    localStorage.removeItem("dotoadmin_access");
    localStorage.removeItem("dotoadmin_refresh");
    localStorage.removeItem("dotoadmin_user");
  },
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.detail || "Erreur");
    this.status = status;
    this.data = data;
  }
}

const SESSION_EXPIRED_MSG = "Session expirée, reconnectez-vous";

type SessionExpiredHandler = (message: string) => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;
let sessionExpiredLock = false;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

function notifySessionExpired() {
  if (sessionExpiredLock) return;
  sessionExpiredLock = true;
  store.clear();
  try {
    sessionExpiredHandler?.(SESSION_EXPIRED_MSG);
  } finally {
    window.setTimeout(() => {
      sessionExpiredLock = false;
    }, 800);
  }
}

async function request<T = any>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (store.access) headers.Authorization = `Bearer ${store.access}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401 && retry) {
    if (store.refresh) {
      if (await tryRefresh()) return request<T>(path, options, false);
    }
    if (store.access || store.refresh) notifySessionExpired();
  }
  if (!res.ok) {
    let data: any = null;
    try {
      data = await res.json();
    } catch {}
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return undefined as T;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return (await res.blob()) as T;
  return res.json();
}

async function tryRefresh() {
  const refresh = store.refresh;
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("dotoadmin_access", data.access);
    if (data.refresh) localStorage.setItem("dotoadmin_refresh", data.refresh);
    return true;
  } catch {
    return false;
  }
}

const list = (r: any) => (r && r.results ? r.results : r);

export const api = {
  url: API_URL,
  tokens: store,
  async login(username: string, password: string) {
    const data = await request("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.user.role !== "admin") throw new ApiError(403, { detail: "Accès réservé aux administrateurs." });
    store.set(data.access, data.refresh);
    const user = { ...data.user, pin_set: data.pin_set ?? data.user?.pin_set };
    localStorage.setItem("dotoadmin_user", JSON.stringify(user));
    return user;
  },
  logout() {
    if (store.access) {
      request("/api/auth/logout/", { method: "POST" }).catch(() => {});
    }
    store.clear();
  },
  me: () => request("/api/auth/me/"),
  updateMe: (b: {
    first_name?: string;
    last_name?: string;
    telephone?: string;
    email?: string;
  }) => request("/api/auth/me/", { method: "PATCH", body: JSON.stringify(b) }),
  async setPin(pin: string, oldPin?: string) {
    if (!PIN_REGEX.test(pin)) throw Object.assign(new Error(PIN_ERROR), { data: { detail: PIN_ERROR } });
    return request("/api/auth/set-pin/", {
      method: "POST",
      body: JSON.stringify({ pin, old_pin: oldPin || "" }),
    });
  },
  async verifyPin(pin: string) {
    if (!PIN_REGEX.test(pin)) throw Object.assign(new Error(PIN_ERROR), { data: { detail: PIN_ERROR } });
    return request("/api/auth/verify-pin/", {
      method: "POST",
      body: JSON.stringify({ pin }),
    });
  },
  async uploadPhoto(file: File) {
    const form = new FormData();
    form.append("photo", file);
    const headers: Record<string, string> = {};
    if (store.access) headers.Authorization = `Bearer ${store.access}`;
    const res = await fetch(`${API_URL}/api/auth/me/photo/`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data);
    }
    return res.json();
  },
  dashboard: () => request("/api/admin/dashboard/"),

  users: () => request("/api/auth/users/").then(list),
  user: (id: number) => request(`/api/auth/users/${id}/`),
  createUser: (b: any) => request("/api/auth/users/", { method: "POST", body: JSON.stringify(b) }),
  kycList: (params = "") => request(`/api/auth/kyc/${params}`).then(list),
  kyc: (id: number) => request(`/api/auth/kyc/${id}/`),
  kycApprove: (id: number) => request(`/api/auth/kyc/${id}/approve/`, { method: "POST" }),
  kycReject: (id: number, motif: string) =>
    request(`/api/auth/kyc/${id}/reject/`, { method: "POST", body: JSON.stringify({ motif }) }),
  affiliations: (params = "") => request(`/api/auth/affiliations/${params}`).then(list),
  affiliation: (id: number) => request(`/api/auth/affiliations/${id}/`),
  affiliationApprove: (id: number) =>
    request(`/api/auth/affiliations/${id}/approve/`, { method: "POST" }),
  affiliationReject: (id: number, motif: string) =>
    request(`/api/auth/affiliations/${id}/reject/`, { method: "POST", body: JSON.stringify({ motif }) }),
  hospitals: () => request("/api/auth/hospitals/"),
  updateUser: (id: number, b: any) => request(`/api/auth/users/${id}/`, { method: "PATCH", body: JSON.stringify(b) }),
  async uploadUserPhoto(id: number, file: File) {
    const form = new FormData();
    form.append("photo", file);
    const headers: Record<string, string> = {};
    if (store.access) headers.Authorization = `Bearer ${store.access}`;
    const res = await fetch(`${API_URL}/api/auth/users/${id}/photo/`, {
      method: "POST",
      headers,
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new ApiError(res.status, data);
    }
    return res.json();
  },
  toggleUser: (id: number) => request(`/api/auth/users/${id}/toggle_active/`, { method: "POST" }),
  unlockUser: (id: number) => request(`/api/auth/users/${id}/unlock/`, { method: "POST" }),

  structures: () => request("/api/auth/structures/").then(list),
  structure: (id: number) => request(`/api/auth/structures/${id}/`),
  createStructure: (b: any) => request("/api/auth/structures/", { method: "POST", body: JSON.stringify(b) }),
  updateStructure: (id: number, b: any) => request(`/api/auth/structures/${id}/`, { method: "PATCH", body: JSON.stringify(b) }),

  patients: () => request("/api/patients/").then(list),
  patient: (id: number) => request(`/api/patients/${id}/`),
  patientSuggestions: (params?: { q?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.q) q.set("q", params.q);
    if (params?.limit != null) q.set("limit", String(params.limit));
    const qs = q.toString();
    return request(`/api/patients/suggestions/${qs ? `?${qs}` : ""}`);
  },
  createPatient: (b: any) => request("/api/patients/", { method: "POST", body: JSON.stringify(b) }),

  dodocards: () => request("/api/dodocards/").then(list),
  dodocard: (id: number) => request(`/api/dodocards/${id}/`),
  createCard: (patient: number) => request("/api/dodocards/", { method: "POST", body: JSON.stringify({ patient }) }),
  revokeCard: (id: number) => request(`/api/dodocards/${id}/revoke/`, { method: "POST", body: JSON.stringify({ motif: "perte" }) }),
  reissueCard: (id: number) => request(`/api/dodocards/${id}/reissue/`, { method: "POST", body: JSON.stringify({ motif: "reemission_admin" }) }),
  qrUrl: (id: number) => `${API_URL}/api/dodocards/${id}/qr/`,
  async downloadCardPdf(id: number) {
    const token = store.access;
    const res = await fetch(`${API_URL}/api/dodocards/${id}/pdf/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new ApiError(res.status, { detail: "PDF indisponible." });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DotoCard_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  audit: () => request("/api/audit/").then(list),
  auditExportUrl: `${API_URL}/api/audit/export/`,

  notifications: () => request("/api/notifications/").then(list),
  notification: (id: number) => request(`/api/notifications/${id}/`),
  unreadCount: () => request("/api/notifications/unread_count/"),
  markNotifRead: (id: number) =>
    request(`/api/notifications/${id}/read/`, { method: "POST" }),
  markAllNotifsRead: () =>
    request("/api/notifications/read_all/", { method: "POST" }),
  accessRequests: () => request("/api/access-requests/"),
  accessRequest: (id: number) => request(`/api/access-requests/${id}/`),
  forceRevokeAccess: (id: number) =>
    request(`/api/access-requests/${id}/force-revoke/`, { method: "POST" }),
  accessBlocks: (params = "") => request(`/api/access-blocks/${params ? `?${params}` : ""}`).then(list),
  createAccessBlock: (b: any) =>
    request("/api/access-blocks/", { method: "POST", body: JSON.stringify(b) }),
  liftAccessBlock: (id: number) =>
    request(`/api/access-blocks/${id}/lift/`, { method: "POST" }),
  appointments: (params?: {
    date?: string;
    date_from?: string;
    date_to?: string;
    structure?: number;
    statut?: string;
    patient?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.date) q.set("date", params.date);
    if (params?.date_from) q.set("date_from", params.date_from);
    if (params?.date_to) q.set("date_to", params.date_to);
    if (params?.structure != null) q.set("structure", String(params.structure));
    if (params?.statut) q.set("statut", params.statut);
    if (params?.patient != null) q.set("patient", String(params.patient));
    const qs = q.toString();
    return request(`/api/appointments/${qs ? `?${qs}` : ""}`).then(list);
  },
  appointment: (id: number) => request(`/api/appointments/${id}/`),
  ordonnances: (params = "") => request(`/api/ordonnances/${params}`).then(list),
  ordonnance: (id: number) => request(`/api/ordonnances/${id}/`),
  examens: (params = "") => request(`/api/examens/${params}`).then(list),
  examen: (id: number) => request(`/api/examens/${id}/`),
  createAppointment: (b: any) =>
    request("/api/appointments/", { method: "POST", body: JSON.stringify(b) }),
  updateAppointment: (id: number, b: any) =>
    request(`/api/appointments/${id}/`, { method: "PATCH", body: JSON.stringify(b) }),
  eventsUrl() {
    const access = encodeURIComponent(store.access || "");
    return `${API_URL}/api/events/?access=${access}`;
  },
};
