import { http, HttpResponse } from "msw";
import { createMockPhotos, createMockCollections } from "../utils/factories";
import { DEFAULT_PER_PAGE } from "@/lib/constants";

// Services call fetch("/api/...") which jsdom resolves to http://localhost/api/...
// MSW v2 handlers must match the fully-resolved URL.
export const handlers = [
  http.get("http://localhost/api/search/photos", ({ request }) => {
    const url = new URL(request.url);
    const perPage = Number(
      url.searchParams.get("per_page") ?? DEFAULT_PER_PAGE
    );
    return HttpResponse.json(createMockPhotos(perPage));
  }),

  http.get("http://localhost/api/collections/search", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    if (!q.trim()) {
      return HttpResponse.json({ results: [], total: 0, total_pages: 0 });
    }
    return HttpResponse.json({
      results: createMockCollections(5),
      total: 5,
      total_pages: 1,
    });
  }),
];
