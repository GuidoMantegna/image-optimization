import { QueryClient } from "@tanstack/react-query";

// Singleton — avoids creating a new client on every render in dev (HMR)
let queryClient: QueryClient | undefined;

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,  // 5 min — no refetch on window focus within window
          gcTime: 10 * 60 * 1000,    // 10 min — keep unused data in cache
          retry: 2,
          refetchOnWindowFocus: false,
        },
      },
    });
  }
  return queryClient;
}
