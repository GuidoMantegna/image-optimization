"use client";

// HOOKS
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLightbox } from "@/hooks/useLightbox";
import { useSearchPhotos } from "@/hooks/useSearchPhotos";
// UI
import Header from "@/components/Header";
import ImageGrid from "@/components/ImageGrid";
import InfiniteScrollTrigger from "@/components/InfiniteScrollTrigger";
import Lightbox from "@/components/Lightbox";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
// TYPES
import {
  UnsplashCollection,
  PhotoFilters,
  PhotoColor,
  PhotoOrientation,
  PhotoOrderBy,
} from "@/types/unsplash";
// LIB
import { VALID_COLORS, VALID_ORIENTATIONS, VALID_ORDER_BY } from "@/lib/constants";



export default function HomePage() {
  const router = useRouter();
  const [selectedCollection, setSelectedCollection] = useState<UnsplashCollection | null>(null);
  const [filters, setFilters] = useState<PhotoFilters>({});

  // Restore collection and filters from URL on mount (client-only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const id = params.get("collection");
    const title = params.get("ctitle");
    if (id && title) {
      setSelectedCollection({
        id,
        title,
        description: null,
        total_photos: 0,
        cover_photo: null,
        preview_photos: null,
        user: {} as UnsplashCollection["user"],
      });
    }

    const color = params.get("color");
    const orientation = params.get("orientation");
    const order_by = params.get("order_by");
    const restoredFilters: PhotoFilters = {};
    if (color && VALID_COLORS.has(color)) restoredFilters.color = color as PhotoColor;
    if (orientation && VALID_ORIENTATIONS.has(orientation)) restoredFilters.orientation = orientation as PhotoOrientation;
    if (order_by && VALID_ORDER_BY.has(order_by)) restoredFilters.order_by = order_by as PhotoOrderBy;
    if (Object.keys(restoredFilters).length > 0) setFilters(restoredFilters);
  }, []);

  // Keep URL in sync whenever collection or filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCollection) {
      params.set("collection", selectedCollection.id);
      params.set("ctitle", selectedCollection.title);
    }
    if (filters.color) params.set("color", filters.color);
    if (filters.orientation) params.set("orientation", filters.orientation);
    if (filters.order_by) params.set("order_by", filters.order_by);
    const search = params.toString();
    router.replace(search ? `/?${search}` : "/", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollection?.id, filters.color, filters.orientation, filters.order_by]);

  const { images, isLoading, isError, error, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useSearchPhotos({ collectionId: selectedCollection?.id, filters });

  const { selectedPhoto, isOpen, open, close, next, prev } = useLightbox(images);

  const handleLoadMore = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const handleSelectCollection = useCallback((collection: UnsplashCollection) => {
    setSelectedCollection(collection);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedCollection(null);
  }, []);

  return (
    <main className="min-h-screen pb-8">
      <Header />

      {/* Push content below fixed header */}
      <div className="pt-14">

        {/* Search + filter area */}
        <div className="px-4 md:px-6 max-w-screen-xl mx-auto pt-6 pb-2">
          <SearchBar
            onSelectCollection={handleSelectCollection}
            onClear={handleClear}
            activeCollectionTitle={selectedCollection?.title}
          />

          {/* Filter bar */}
          <div className="mt-3">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>

          {/* Active collection badge */}
          {selectedCollection && selectedCollection.total_photos > 0 && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-neutral-400">
                Collection:{" "}
                <span className="text-white font-medium">{selectedCollection.title}</span>
                <span className="text-neutral-500">
                  {" "}· {selectedCollection.total_photos.toLocaleString()} photos
                </span>
              </span>
              <button
                onClick={handleClear}
                className="ml-auto text-neutral-500 hover:text-white transition-colors text-xs"
              >
                Browse all ×
              </button>
            </div>
          )}
        </div>

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

        {/* Empty state */}
        {!isLoading && !isError && images.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            {selectedCollection ? (
              <>
                <p className="text-neutral-500 text-lg">This collection has no photos.</p>
                <button
                  onClick={handleClear}
                  className="mt-4 text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Browse all photos →
                </button>
              </>
            ) : (
              <>
                <p className="text-neutral-500 text-lg">No photos found.</p>
                <p className="text-neutral-600 text-sm mt-1">
                  Try different filters or check your Unsplash API key in{" "}
                  <code className="bg-neutral-800 px-1.5 py-0.5 rounded text-xs">
                    .env.local
                  </code>
                </p>
              </>
            )}
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
