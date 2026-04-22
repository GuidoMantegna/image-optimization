"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPhotos } from "@/services/unsplash";
import { UnsplashPhoto } from "@/types/unsplash";
import { useMemo } from "react";

const PER_PAGE = 20;

export function useImages() {
  const query = useInfiniteQuery({
    queryKey: ["photos"],
    queryFn: ({ pageParam }) => fetchPhotos(pageParam as number, PER_PAGE),
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
