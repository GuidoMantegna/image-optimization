"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchFilteredPhotos } from "@/services/unsplash";
import { UnsplashPhoto, PhotoFilters } from "@/types/unsplash";
import { useMemo } from "react";

const PER_PAGE = 20;

export function useImages(filters?: PhotoFilters) {
  const query = useInfiniteQuery({
    queryKey: [
      "photos",
      {
        color: filters?.color ?? null,
        orientation: filters?.orientation ?? null,
        order_by: filters?.order_by ?? null,
      },
    ],
    queryFn: ({ pageParam }) =>
      fetchFilteredPhotos(pageParam as number, PER_PAGE, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    // Keep previous data visible while fetching next page — prevents flash
    placeholderData: (prev) => prev,
  });

  // Flatten pages into a single array, memoized to avoid recreating on every render
  const images: UnsplashPhoto[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.photos) ?? [],
    [query.data]
  );

  return {
    images,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
