import { SearchCollectionsResult } from "@/types/unsplash";
import { FetchPhotosResult } from "@/services/unsplash";

export async function searchCollections(
  query: string,
  page = 1,
  perPage = 10
): Promise<SearchCollectionsResult> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`/api/collections/search?${params}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchCollectionPhotos(
  collectionId: string,
  page: number,
  perPage = 20
): Promise<FetchPhotosResult> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`/api/collections/${collectionId}/photos?${params}`);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${res.status}`);
  }

  const photos = await res.json();
  const rateLimitRemaining = Number(res.headers.get("X-Ratelimit-Remaining")) || null;
  const nextPage = photos.length === perPage ? page + 1 : null;

  return { photos, nextPage, rateLimitRemaining };
}
