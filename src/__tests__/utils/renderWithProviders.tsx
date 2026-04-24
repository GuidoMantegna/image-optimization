import React from "react";
import { render, renderHook, RenderOptions, RenderHookOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Fresh client per test: retry:false fails fast, gcTime:0 prevents cache leaks
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function Wrapper({
  client,
  children,
}: {
  client: QueryClient;
  children: React.ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = createTestQueryClient(), ...options }: CustomRenderOptions = {}
) {
  return {
    queryClient,
    ...render(ui, {
      wrapper: ({ children }) => (
        <Wrapper client={queryClient}>{children}</Wrapper>
      ),
      ...options,
    }),
  };
}

interface CustomHookOptions<TProps> extends Omit<RenderHookOptions<TProps>, "wrapper"> {
  queryClient?: QueryClient;
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  { queryClient = createTestQueryClient(), ...options }: CustomHookOptions<TProps> = {} as CustomHookOptions<TProps>
) {
  return {
    queryClient,
    ...renderHook(hook, {
      wrapper: ({ children }) => (
        <Wrapper client={queryClient}>{children}</Wrapper>
      ),
      ...options,
    }),
  };
}
