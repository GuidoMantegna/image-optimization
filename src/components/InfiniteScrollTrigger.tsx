"use client";

import { useEffect, useRef } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export default function InfiniteScrollTrigger({
  onIntersect,
  hasNextPage,
  isFetchingNextPage,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const isIntersecting = useIntersectionObserver(triggerRef, {
    rootMargin: "300px", // start loading 300px before sentinel enters viewport
    threshold: 0,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      onIntersect();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, onIntersect]);

  return (
    <div ref={triggerRef} className="flex justify-center items-center py-12 px-4">
      {isFetchingNextPage && (
        <div className="flex flex-col items-center gap-3">
          {/* Spinner */}
          <div
            className="w-8 h-8 rounded-full border-2 border-neutral-700 border-t-white animate-spin"
            aria-label="Loading more photos"
            role="status"
          />
          <p className="text-neutral-500 text-sm">Loading more photos…</p>
        </div>
      )}
      {!hasNextPage && !isFetchingNextPage && (
        <p className="text-neutral-600 text-sm">You&apos;ve seen it all ✦</p>
      )}
    </div>
  );
}
