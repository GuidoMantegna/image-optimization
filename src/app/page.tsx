"use client";

import { useCallback } from "react";
import Header from "@/components/Header";
import ImageGrid from "@/components/ImageGrid";
import InfiniteScrollTrigger from "@/components/InfiniteScrollTrigger";
import Lightbox from "@/components/Lightbox";
import { useImages } from "@/hooks/useImages";
import { useLightbox } from "@/hooks/useLightbox";

export default function HomePage() {
  const {
    images,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useImages();

  const { selectedPhoto, isOpen, open, close, next, prev } = useLightbox(images);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  return (
    <main className="min-h-screen pb-8">
      <Header />

      {/* Push content below fixed header */}
      <div className="pt-14">

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="text-neutral-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-3 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-lg font-medium text-neutral-300 mb-1">
                Failed to load photos
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                {error instanceof Error ? error.message : "Something went wrong"}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-white text-black text-sm font-medium rounded-lg
                hover:bg-neutral-200 active:scale-95 transition-all"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state (key configured but returns nothing) */}
        {!isLoading && !isError && images.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <p className="text-neutral-500 text-lg">No photos found.</p>
            <p className="text-neutral-600 text-sm mt-1">
              Check your Unsplash API key in{" "}
              <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
                .env.local
              </code>
            </p>
          </div>
        )}

        {/* Image grid */}
        {!isError && (
          <div className="mt-6">
            <ImageGrid
              images={images}
              isLoading={isLoading}
              onImageClick={open}
            />
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!isError && !isLoading && (
          <InfiniteScrollTrigger
            onIntersect={handleLoadMore}
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        )}
      </div>

      {/* Lightbox portal */}
      <Lightbox
        photo={selectedPhoto}
        isOpen={isOpen}
        onClose={close}
        onNext={next}
        onPrev={prev}
      />
    </main>
  );
}
