import { describe, it, expect } from "vitest";
import { waitFor, act } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { renderHookWithProviders } from "../utils/renderWithProviders";
import { createMockPhotos } from "../utils/factories";
import { useSearchPhotos } from "@/hooks/useSearchPhotos";
import { DEFAULT_PER_PAGE } from "@/lib/constants";

describe("useSearchPhotos", () => {
  // ── initial fetch ────────────────────────────────────────────────────────────

  it("fetches a full page of photos on initial render with no options", async () => {
    const photos = createMockPhotos(DEFAULT_PER_PAGE);
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(photos)
      )
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.images).toHaveLength(DEFAULT_PER_PAGE);
    expect(result.current.isError).toBe(false);
  });

  // ── collectionId ─────────────────────────────────────────────────────────────

  it("includes the collections param when collectionId is provided", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(createMockPhotos(5));
      })
    );

    const { result } = renderHookWithProviders(() =>
      useSearchPhotos({ collectionId: "abc123" })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).toContain("collections=abc123");
  });

  // ── filter combinations ──────────────────────────────────────────────────────

  it("passes color, orientation, and order_by filters in the request URL", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(createMockPhotos(3));
      })
    );

    const { result } = renderHookWithProviders(() =>
      useSearchPhotos({
        filters: {
          color: "blue",
          orientation: "landscape",
          order_by: "latest",
        },
      })
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).toContain("color=blue");
    expect(capturedUrl).toContain("orientation=landscape");
    expect(capturedUrl).toContain("order_by=latest");
  });

  it("does not include filter params when filters are undefined", async () => {
    let capturedUrl = "";
    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(createMockPhotos(5));
      })
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(capturedUrl).not.toContain("color=");
    expect(capturedUrl).not.toContain("orientation=");
    expect(capturedUrl).not.toContain("order_by=");
  });

  // ── loading state ────────────────────────────────────────────────────────────

  it("exposes isLoading: true while the initial fetch is in-flight", () => {
    server.use(
      http.get(
        "http://localhost/api/search/photos",
        () => new Promise<Response>(() => {}) // never resolves
      )
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.images).toEqual([]);
  });

  // ── error state ──────────────────────────────────────────────────────────────

  it("sets isError and provides the error when the API fails", async () => {
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.images).toEqual([]);
  });

  // ── hasNextPage ──────────────────────────────────────────────────────────────

  it("sets hasNextPage: true when photos.length equals perPage (full page)", async () => {
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(createMockPhotos(DEFAULT_PER_PAGE))
      )
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(true);
  });

  it("sets hasNextPage: false when photos.length < perPage (partial/last page)", async () => {
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(createMockPhotos(5))
      )
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(false);
  });

  // ── pagination ───────────────────────────────────────────────────────────────

  it("flattens photos from multiple pages into a single images array", async () => {
    const page1 = createMockPhotos(DEFAULT_PER_PAGE);
    const page2 = createMockPhotos(DEFAULT_PER_PAGE);
    let callCount = 0;

    server.use(
      http.get("http://localhost/api/search/photos", () => {
        callCount++;
        return HttpResponse.json(callCount === 1 ? page1 : page2);
      })
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(result.current.images).toHaveLength(DEFAULT_PER_PAGE * 2)
    );
  });

  it("requests page 2 when fetchNextPage is called", async () => {
    const requestedPages: number[] = [];
    const page1 = createMockPhotos(DEFAULT_PER_PAGE);
    const page2 = createMockPhotos(10); // partial — no more pages after this

    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        const page = Number(
          new URL(request.url).searchParams.get("page") ?? "1"
        );
        requestedPages.push(page);
        return HttpResponse.json(page === 1 ? page1 : page2);
      })
    );

    const { result } = renderHookWithProviders(() => useSearchPhotos({}));
    await waitFor(() =>
      expect(result.current.images).toHaveLength(DEFAULT_PER_PAGE)
    );

    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() =>
      expect(result.current.images).toHaveLength(DEFAULT_PER_PAGE + 10)
    );

    expect(requestedPages).toContain(2);
    expect(result.current.hasNextPage).toBe(false);
  });

  // ── cache deduplication ──────────────────────────────────────────────────────

  it("does not re-fetch when the same query key is already cached", async () => {
    let fetchCount = 0;
    server.use(
      http.get("http://localhost/api/search/photos", () => {
        fetchCount++;
        return HttpResponse.json(createMockPhotos(5));
      })
    );

    const queryClient = (
      await import("../utils/renderWithProviders")
    ).createTestQueryClient();
    // Override staleTime so cache is actually used
    queryClient.setDefaultOptions({
      queries: { retry: false, gcTime: 0, staleTime: 60_000 },
    });

    const opts = { queryClient };

    const { result: r1 } = renderHookWithProviders(() => useSearchPhotos({}), opts);
    await waitFor(() => expect(r1.current.isLoading).toBe(false));

    const { result: r2 } = renderHookWithProviders(() => useSearchPhotos({}), opts);
    await waitFor(() => expect(r2.current.images).toHaveLength(5));

    // Both renders share the same cache — only one network request should fire
    expect(fetchCount).toBe(1);
  });
});
