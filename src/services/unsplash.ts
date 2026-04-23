import { UnsplashPhoto, PhotoFilters } from "@/types/unsplash";

export interface FetchPhotosResult {
  photos: UnsplashPhoto[];
  nextPage: number | null;
  rateLimitRemaining: number | null;
}

/** Routes to the search endpoint when color/orientation/relevant-sort are active. */
export async function fetchFilteredPhotos(
  page: number,
  perPage: number = 20,
  filters?: PhotoFilters
): Promise<FetchPhotosResult> {
  const needsSearch = !!(
    filters?.color ||
    filters?.orientation ||
    filters?.order_by === "relevant"
  );
  return needsSearch
    ? fetchSearchPhotos(page, perPage, filters)
    : fetchPhotos(page, perPage, filters?.order_by);
}

export async function fetchPhotos(
  page: number,
  perPage: number = 20,
  orderBy?: string
): Promise<FetchPhotosResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (orderBy && orderBy !== "relevant") params.set("order_by", orderBy);

  const res = await fetch(`/api/photos?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${res.status}`);
  }

  const photos: UnsplashPhoto[] = await res.json();
  const rateLimitRemaining = Number(res.headers.get("X-Ratelimit-Remaining")) || null;
  const nextPage = photos.length === perPage ? page + 1 : null;

  return { photos, nextPage, rateLimitRemaining };
}

async function fetchSearchPhotos(
  page: number,
  perPage: number = 20,
  filters?: PhotoFilters
): Promise<FetchPhotosResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (filters?.color) params.set("color", filters.color);
  if (filters?.orientation) params.set("orientation", filters.orientation);
  if (filters?.order_by) params.set("order_by", filters.order_by);

  const res = await fetch(`/api/search/photos?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${res.status}`);
  }

  const photos: UnsplashPhoto[] = await res.json();
  const rateLimitRemaining = Number(res.headers.get("X-Ratelimit-Remaining")) || null;
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
