"use client";

import { memo, useCallback, useRef, useState } from "react";
import { UnsplashPhoto } from "@/types/unsplash";
import { buildImageUrl, buildPlaceholderUrl } from "@/services/unsplash";

interface ImageCardProps {
  photo: UnsplashPhoto;
  priority?: boolean;
  onClick: () => void;
}

const ImageCard = memo(function ImageCard({
  photo,
  priority = false,
  onClick,
}: ImageCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleLoad = useCallback(() => setIsLoaded(true), []);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") onClick(); },
    [onClick]
  );

  // Aspect ratio from Unsplash metadata — prevents CLS
  const aspectRatio = photo.height / photo.width;

  // Responsive srcset: 3 breakpoints using Unsplash raw URL with CDN params
  const src = buildImageUrl(photo.urls.raw, 800);
  const srcSet = [
    `${buildImageUrl(photo.urls.raw, 400)} 400w`,
    `${buildImageUrl(photo.urls.raw, 800)} 800w`,
    `${buildImageUrl(photo.urls.raw, 1200)} 1200w`,
  ].join(", ");

  // Tiny blur-up placeholder rendered as background while full image loads
  const placeholderUrl = buildPlaceholderUrl(photo.urls.raw);

  return (
    <article
      className="group relative w-full overflow-hidden rounded-xl cursor-pointer
        focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={photo.alt_description ?? `Photo by ${photo.user.name}`}
    >
      {/* Blur-up placeholder — tiny low-quality image stretched and blurred */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-110 blur-lg transition-opacity duration-500"
        style={{
          backgroundImage: `url(${placeholderUrl})`,
          backgroundColor: photo.color ?? "#1a1a1a",
          opacity: isLoaded ? 0 : 1,
        }}
        aria-hidden="true"
      />

      {/* Full-resolution image */}
      <img
        ref={imgRef}
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={photo.alt_description ?? `Photo by ${photo.user.name}`}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        onLoad={handleLoad}
        className={`w-full h-full object-cover transition-all duration-700
          group-hover:scale-105
          ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />

      {/* Hover overlay with photographer info */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4
          bg-gradient-to-t from-black/70 via-black/10 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      >
        <div className="flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {/* Avatar */}
          <img
            src={photo.user.profile_image.small}
            alt={photo.user.name}
            width={28}
            height={28}
            className="rounded-full border border-white/30"
            loading="lazy"
          />
          <div>
            <p className="text-white text-sm font-medium leading-tight">
              {photo.user.name}
            </p>
            <p className="text-white/70 text-xs">@{photo.user.username}</p>
          </div>
          {/* Like count */}
          <div className="ml-auto flex items-center gap-1 text-white/80 text-xs">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.085c-1.034-1.062-2.135-2.505-2.135-4.274 0-1.978 1.642-3.5 3.5-3.5a3.98 3.98 0 012.75 1.1A3.98 3.98 0 0112.75 6.36c1.858 0 3.5 1.522 3.5 3.5 0 1.769-1.1 3.212-2.135 4.274a22.045 22.045 0 01-2.582 2.085 20.759 20.759 0 01-1.162.682l-.019.01-.005.003h-.001a.75.75 0 01-.682 0l-.001-.001z" />
            </svg>
            {photo.likes.toLocaleString()}
          </div>
        </div>
      </div>
    </article>
  );
});

export default ImageCard;
