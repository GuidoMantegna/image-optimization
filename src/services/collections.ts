import { SearchCollectionsResult } from "@/types/unsplash";

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
