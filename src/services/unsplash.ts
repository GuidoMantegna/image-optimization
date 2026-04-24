import { UnsplashPhoto } from "@/types/unsplash";
import { DEFAULT_PER_PAGE, DEFAULT_QUERY, REVALIDATE_SECONDS } from "@/lib/constants";

export interface FetchPhotosResult {
  photos: UnsplashPhoto[];
  nextPage: number | null;
  rateLimitRemaining: number | null;
}

export interface SearchPhotosParams {
  query?: string;
  collectionId?: string;
  color?: string;
  orientation?: string;
  orderBy?: string;
  page?: number;
  perPage?: number;
}

export async function searchPhotos({
  query,
  collectionId,
  color,
  orientation,
  orderBy,
  page = 1,
  perPage = DEFAULT_PER_PAGE,
}: SearchPhotosParams): Promise<FetchPhotosResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (query) params.set("query", query);
  if (collectionId) params.set("collections", collectionId);
  if (color) params.set("color", color);
  if (orientation) params.set("orientation", orientation);
  if (orderBy) params.set("order_by", orderBy);

  const res = await fetch(`/api/search/photos?${params}`, {
    next: { revalidate: REVALIDATE_SECONDS },
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
  url.searchParams.set("auto", "format");
  return url.toString();
}

export function buildPlaceholderUrl(rawUrl: string): string {
  return buildImageUrl(rawUrl, 20, 10, "webp");
}
