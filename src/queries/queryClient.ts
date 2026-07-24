import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const STALE_MS = 5 * 60 * 1000;
const GC_MS = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_MS,
      gcTime: GC_MS,
      retry: 1,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      networkMode: "offlineFirst",
    },
    mutations: { retry: 0, networkMode: "offlineFirst" },
  },
});

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "dotoplus-admin-react-query",
});

export const persistOptions = {
  persister: queryPersister,
  maxAge: GC_MS,
  buster: "v1",
};
