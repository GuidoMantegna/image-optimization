"use client";

import { RefObject, useEffect, useState } from "react";

interface Options extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

/**
 * Observes a DOM element and returns whether it is currently intersecting
 * with the viewport (or a custom root).
 *
 * @param ref - ref attached to the element to observe
 * @param options - standard IntersectionObserver options + freezeOnceVisible
 */
export function useIntersectionObserver(
  ref: RefObject<Element | null>,
  options: Options = {}
): boolean {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    freezeOnceVisible = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Already visible and frozen — nothing to do
    if (freezeOnceVisible && isIntersecting) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, threshold, root, rootMargin]);

  return isIntersecting;
}
