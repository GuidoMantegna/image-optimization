"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchCollectionPhotos } from "@/services/collections";
import { UnsplashPhoto } from "@/types/unsplash";
import { useMemo } from "react";

const PER_PAGE = 20;

export function useCollectionPhotos(collectionId: string | null) {
  const query = useInfiniteQuery({
    queryKey: ["collections", collectionId, "photos"],
    queryFn: ({ pageParam }) =>
      fetchCollectionPhotos(collectionId!, pageParam as number, PER_PAGE),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!collectionId,
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
