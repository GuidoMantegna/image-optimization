"use client";

import { useCallback, useEffect, useState } from "react";
import { UnsplashPhoto } from "@/types/unsplash";

interface UseLightboxReturn {
  selectedPhoto: UnsplashPhoto | null;
  selectedIndex: number | null;
  isOpen: boolean;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
}

export function useLightbox(photos: UnsplashPhoto[]): UseLightboxReturn {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isOpen = selectedIndex !== null;
  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] ?? null : null;

  const open = useCallback((index: number) => setSelectedIndex(index), []);
  const close = useCallback(() => setSelectedIndex(null), []);

  const next = useCallback(() => {
    setSelectedIndex((i) => (i !== null ? (i + 1) % photos.length : null));
  }, [photos.length]);

  const prev = useCallback(() => {
    setSelectedIndex((i) =>
      i !== null ? (i - 1 + photos.length) % photos.length : null
    );
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, close, next, prev]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return { selectedPhoto, selectedIndex, isOpen, open, close, next, prev };
}
