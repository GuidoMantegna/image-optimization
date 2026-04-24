import { describe, it, expect } from "vitest";
import { waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { renderHookWithProviders } from "../utils/renderWithProviders";
import { createMockCollections } from "../utils/factories";
import { useCollectionSearch } from "@/hooks/useCollectionSearch";

describe("useCollectionSearch", () => {
  // ── disabled states ──────────────────────────────────────────────────────────

  it("returns empty collections and no loading when query is empty", () => {
    const { result } = renderHookWithProviders(() => useCollectionSearch(""));
    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("returns empty collections when query is a single character", () => {
    const { result } = renderHookWithProviders(() => useCollectionSearch("a"));
    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns empty collections when query trims to fewer than 2 chars", () => {
    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("  ")
    );
    expect(result.current.collections).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  // ── success states ───────────────────────────────────────────────────────────

  it("fetches and returns collections when query has 2+ chars", async () => {
    const mockCollections = createMockCollections(3);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 3, total_pages: 1 })
      )
    );

    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("nature")
    );

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(3);
    });

    expect(result.current.collections[0].id).toBe(mockCollections[0].id);
    expect(result.current.isError).toBe(false);
  });

  it("populates collections from the results field of the API response", async () => {
    const mockCollections = createMockCollections(5);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 5, total_pages: 1 })
      )
    );

    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("travel")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.collections).toHaveLength(5);
  });

  // ── empty results ────────────────────────────────────────────────────────────

  it("returns an empty array when API returns zero results", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: [], total: 0, total_pages: 0 })
      )
    );

    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("xyzzy")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.collections).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  // ── error state ──────────────────────────────────────────────────────────────

  it("sets isError when the API responds with a non-OK status", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
      )
    );

    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("dogs")
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.collections).toEqual([]);
  });

  // ── trimmed query ────────────────────────────────────────────────────────────

  it("trims whitespace from the query before fetching", async () => {
    let callCount = 0;
    server.use(
      http.get("http://localhost/api/collections/search", () => {
        callCount++;
        return HttpResponse.json({
          results: createMockCollections(2),
          total: 2,
          total_pages: 1,
        });
      })
    );

    const { result } = renderHookWithProviders(() =>
      useCollectionSearch("  cats  ")
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(callCount).toBe(1);
    expect(result.current.collections).toHaveLength(2);
  });

  // ── placeholder data ─────────────────────────────────────────────────────────

  it("shows previous results while a new query is in flight (placeholderData)", async () => {
    const firstCollections = createMockCollections(3);
    const secondCollections = createMockCollections(2);
    let callCount = 0;

    server.use(
      http.get("http://localhost/api/collections/search", () => {
        callCount++;
        return callCount === 1
          ? HttpResponse.json({ results: firstCollections, total: 3, total_pages: 1 })
          : HttpResponse.json({ results: secondCollections, total: 2, total_pages: 1 });
      })
    );

    const { result, rerender } = renderHookWithProviders(
      ({ q }: { q: string }) => useCollectionSearch(q),
      { initialProps: { q: "na" } }
    );

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(3);
    });

    // Change query — placeholder keeps previous data visible immediately
    rerender({ q: "nat" });

    // Previous data still present before second fetch resolves
    expect(result.current.collections).toHaveLength(3);

    await waitFor(() => {
      expect(result.current.collections).toHaveLength(2);
    });
  });
});
