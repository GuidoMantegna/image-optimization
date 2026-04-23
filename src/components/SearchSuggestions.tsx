"use client";

import { memo } from "react";
import { UnsplashCollection } from "@/types/unsplash";
import { buildPlaceholderUrl } from "@/services/unsplash";

interface SearchSuggestionsProps {
  id: string;
  collections: UnsplashCollection[];
  isLoading: boolean;
  activeIndex: number;
  query: string;
  onSelect: (collection: UnsplashCollection) => void;
  onHover: (index: number) => void;
}

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 px-4 py-3" aria-hidden>
      <div className="w-10 h-10 rounded-lg bg-neutral-800 skeleton-shimmer shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-2/3 rounded bg-neutral-800 skeleton-shimmer" />
        <div className="h-3 w-1/4 rounded bg-neutral-800 skeleton-shimmer" />
      </div>
    </li>
  );
}

export const SearchSuggestions = memo(function SearchSuggestions({
  id,
  collections,
  isLoading,
  activeIndex,
  query,
  onSelect,
  onHover,
}: SearchSuggestionsProps) {
  if (isLoading) {
    return (
      <ul
        id={id}
        role="listbox"
        aria-label="Collection suggestions"
        className="absolute top-full mt-2 w-full z-50 bg-neutral-900 border border-neutral-700
          rounded-2xl overflow-hidden shadow-2xl dropdown-enter"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </ul>
    );
  }

  if (collections.length === 0) {
    return (
      <ul
        id={id}
        role="listbox"
        aria-label="Collection suggestions"
        className="absolute top-full mt-2 w-full z-50 bg-neutral-900 border border-neutral-700
          rounded-2xl overflow-hidden shadow-2xl"
      >
        <li className="px-4 py-6 text-center text-neutral-500 text-sm" role="option" aria-selected={false}>
          No collections found for &ldquo;{query}&rdquo;
        </li>
      </ul>
    );
  }

  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Collection suggestions"
      className="absolute top-full mt-2 w-full z-50 bg-neutral-900 border border-neutral-700
        rounded-2xl overflow-hidden shadow-2xl dropdown-enter"
    >
      {collections.map((collection, i) => {
        const isActive = i === activeIndex;
        const thumb =
          collection.cover_photo?.urls.thumb ??
          collection.preview_photos?.[0]?.urls.thumb ??
          null;
        const placeholder = thumb ? buildPlaceholderUrl(thumb) : null;

        return (
          <li
            key={collection.id}
            id={`option-${i}`}
            role="option"
            aria-selected={isActive}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
              ${isActive ? "bg-neutral-800" : "hover:bg-neutral-800/60"}`}
            onMouseEnter={() => onHover(i)}
            onMouseDown={(e) => {
              // Prevent input blur before click fires
              e.preventDefault();
              onSelect(collection);
            }}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-neutral-800">
              {thumb ? (
                <img
                  src={thumb}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ backgroundImage: placeholder ? `url(${placeholder})` : undefined }}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-neutral-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{collection.title}</p>
              <p className="text-xs text-neutral-500 mt-0.5">
                {collection.total_photos.toLocaleString()} photos
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
});
