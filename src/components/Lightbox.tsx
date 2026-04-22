"use client";

import { useEffect, useRef, memo } from "react";
import { createPortal } from "react-dom";
import { UnsplashPhoto } from "@/types/unsplash";
import { buildImageUrl } from "@/services/unsplash";

interface LightboxProps {
  photo: UnsplashPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox = memo(function Lightbox({
  photo,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus close button when lightbox opens
  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus();
  }, [isOpen]);

  if (!isOpen || !photo) return null;

  const fullSrc = buildImageUrl(photo.urls.raw, 1600, 85);
  const location = [photo.location?.city, photo.location?.country]
    .filter(Boolean)
    .join(", ");

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt_description ?? `Photo by ${photo.user.name}`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-screen-xl w-full h-full px-4 py-16 md:py-8">
        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          {/* Photographer */}
          <div className="flex items-center gap-2">
            <img
              src={photo.user.profile_image.medium}
              alt={photo.user.name}
              width={36}
              height={36}
              className="rounded-full border border-white/20"
            />
            <div>
              <p className="text-white text-sm font-medium">{photo.user.name}</p>
              {location && (
                <p className="text-white/60 text-xs">{location}</p>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close lightbox"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center w-full min-h-0">
          {/* Prev */}
          <button
            onClick={onPrev}
            className="absolute left-4 md:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20
              text-white transition-colors z-20 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Previous photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <img
            key={photo.id}
            src={fullSrc}
            alt={photo.alt_description ?? `Photo by ${photo.user.name}`}
            width={photo.width}
            height={photo.height}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            style={{ maxHeight: "calc(100vh - 10rem)" }}
          />

          {/* Next */}
          <button
            onClick={onNext}
            className="absolute right-4 md:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20
              text-white transition-colors z-20 focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Next photo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Bottom info */}
        <div className="mt-3 flex items-center gap-4 text-white/60 text-xs">
          <span>{photo.width} × {photo.height}px</span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.085c-1.034-1.062-2.135-2.505-2.135-4.274 0-1.978 1.642-3.5 3.5-3.5a3.98 3.98 0 012.75 1.1A3.98 3.98 0 0112.75 6.36c1.858 0 3.5 1.522 3.5 3.5 0 1.769-1.1 3.212-2.135 4.274a22.045 22.045 0 01-2.582 2.085 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.001a.75.75 0 01-.682 0l-.001-.001z" />
            </svg>
            {photo.likes.toLocaleString()} likes
          </span>
          {photo.alt_description && (
            <span className="max-w-xs truncate" title={photo.alt_description}>
              {photo.alt_description}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

export default Lightbox;
