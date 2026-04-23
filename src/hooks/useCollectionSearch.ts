"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCollections } from "@/services/collections";
import { UnsplashCollection } from "@/types/unsplash";

export function useCollectionSearch(debouncedQuery: string) {
  const trimmed = debouncedQuery.trim();

  const query = useQuery({
    queryKey: ["collections", "search", trimmed],
    queryFn: () => searchCollections(trimmed),
    enabled: trimmed.length >= 2,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const collections: UnsplashCollection[] = query.data?.results ?? [];

  return {
    collections,
    isLoading: query.isFetching,
    isError: query.isError,
  };
}
