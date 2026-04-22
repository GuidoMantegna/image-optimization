import { UnsplashPhoto } from "@/types/unsplash";

export interface FetchPhotosResult {
  photos: UnsplashPhoto[];
  nextPage: number | null;
  rateLimitRemaining: number | null;
}

/**
 * Fetches a page of photos through our internal API proxy.
 * The proxy keeps UNSPLASH_ACCESS_KEY server-side.
 */
export async function fetchPhotos(
  page: number,
  perPage: number = 20
): Promise<FetchPhotosResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`/api/photos?${params}`, {
    // Let the browser use its HTTP cache for the API response (60s)
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${res.status}`);
  }

  const photos: UnsplashPhoto[] = await res.json();
  const rateLimitRemaining = Number(res.headers.get("X-Ratelimit-Remaining")) || null;

  // Unsplash returns empty array on the last page, so signal no more pages
  const nextPage = photos.length === perPage ? page + 1 : null;

  return { photos, nextPage, rateLimitRemaining };
}

/**
 * Build an Unsplash CDN URL with explicit optimisation params.
 * Using raw URL gives full control over dimensions, format, and quality.
 */
export function buildImageUrl(
  rawUrl: string,
  width: number,
  quality: number = 80,
  format: "webp" | "avif" | "jpg" = "webp"
): string {
  const url = new URL(rawUrl);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("fm", format);
  url.searchParams.set("fit", "crop");
  url.searchParams.set("auto", "format"); // Unsplash fallback format negotiation
  return url.toString();
}

/** Returns a tiny placeholder URL (20px wide, low quality) for blur-up effect */
export function buildPlaceholderUrl(rawUrl: string): string {
  return buildImageUrl(rawUrl, 20, 10, "webp");
}
