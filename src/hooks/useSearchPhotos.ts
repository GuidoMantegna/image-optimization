"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchPhotos } from "@/services/unsplash";
import { UnsplashPhoto, PhotoFilters } from "@/types/unsplash";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { useMemo } from "react";

export interface SearchPhotosOptions {
  collectionId?: string | null;
  filters?: PhotoFilters;
}

export function useSearchPhotos({ collectionId, filters }: SearchPhotosOptions) {
  const query = useInfiniteQuery({
    queryKey: [
      "search-photos",
      {
        collectionId: collectionId ?? null,
        color: filters?.color ?? null,
        orientation: filters?.orientation ?? null,
        order_by: filters?.order_by ?? null,
      },
    ],
    queryFn: ({ pageParam }) =>
      searchPhotos({
        collectionId: collectionId ?? undefined,
        color: filters?.color,
        orientation: filters?.orientation,
        orderBy: filters?.order_by,
        page: pageParam as number,
        perPage: DEFAULT_PER_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    placeholderData: (prev) => prev,
  });

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
