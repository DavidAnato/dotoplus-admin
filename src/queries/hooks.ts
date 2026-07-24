import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import { useAppStore } from "../store/appStore";
import { qk } from "./keys";

const DASH_CACHE = "dotoadmin_dash_cache";

export function useAdminDashboard() {
  const online = useAppStore((s) => s.online);
  return useQuery({
    queryKey: qk.dashboard,
    queryFn: async () => {
      if (!online) {
        const raw = localStorage.getItem(DASH_CACHE);
        if (raw) return { data: JSON.parse(raw), fromCache: true as const };
        throw new Error("Hors ligne et aucun cache");
      }
      try {
        const data = await api.dashboard();
        localStorage.setItem(DASH_CACHE, JSON.stringify(data));
        return { data, fromCache: false as const };
      } catch {
        const raw = localStorage.getItem(DASH_CACHE);
        if (raw) return { data: JSON.parse(raw), fromCache: true as const };
        throw new Error("Tableau de bord indisponible");
      }
    },
  });
}

export function useUsers() {
  return useQuery({ queryKey: qk.users, queryFn: () => api.users() });
}

export function useStructures() {
  return useQuery({ queryKey: qk.structures, queryFn: () => api.structures() });
}

export function usePatients() {
  return useQuery({ queryKey: qk.patients, queryFn: () => api.patients() });
}

export function useAdminCards() {
  return useQuery({ queryKey: qk.dodocards, queryFn: () => api.dodocards() });
}

export function useAudit() {
  return useQuery({ queryKey: qk.audit, queryFn: () => api.audit() });
}

export function useLoginMutation() {
  const login = useAppStore((s) => s.login);
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  });
}

export function useToggleUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.toggleUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.unlockUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: unknown) => api.createUser(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}

export function useCreateStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: unknown) => api.createStructure(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.structures }),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: unknown) => api.createPatient(b),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.patients }),
  });
}

export function useCreateCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patient: number) => api.createCard(patient),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.dodocards });
      qc.invalidateQueries({ queryKey: qk.dashboard });
    },
  });
}

export function useRevokeCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.revokeCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dodocards }),
  });
}

export function useReissueCard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.reissueCard(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.dodocards }),
  });
}
