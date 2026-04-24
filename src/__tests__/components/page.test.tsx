import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/renderWithProviders";
import { createMockPhotos } from "../utils/factories";
import HomePage from "@/app/page";
import { DEFAULT_PER_PAGE } from "@/lib/constants";
import { getLastIntersectionObserver } from "../setup";

// ─── next/navigation mock ─────────────────────────────────────────────────────
// vi.mock is hoisted to run before imports — must be at file top-level.
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  mockReplace.mockClear();
  // Reset URL so the page's URL-restore useEffect starts clean each test
  Object.defineProperty(window, "location", {
    writable: true,
    value: { ...window.location, search: "" },
  });
});

describe("HomePage", () => {
  // ── initial render ───────────────────────────────────────────────────────────

  it("renders the site header and search input", async () => {
    renderWithProviders(<HomePage />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("searchbox", { name: "Search collections" })
    ).toBeInTheDocument();
  });

  // ── loading state ────────────────────────────────────────────────────────────

  it("does not render photo cards while the initial fetch is loading", () => {
    server.use(
      http.get(
        "http://localhost/api/search/photos",
        () => new Promise<Response>(() => {})
      )
    );

    renderWithProviders(<HomePage />);

    expect(
      screen.queryByRole("button", { name: /mock photo/i })
    ).not.toBeInTheDocument();
  });

  // ── success state ────────────────────────────────────────────────────────────

  it("renders photo cards after the fetch resolves", async () => {
    const photos = createMockPhotos(DEFAULT_PER_PAGE);
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(photos)
      )
    );

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      // ImageCard renders article[role="button"] with aria-label = alt_description
      expect(
        screen.getAllByRole("button", { name: /mock photo/i })
      ).toHaveLength(DEFAULT_PER_PAGE);
    });
  });

  // ── error state ──────────────────────────────────────────────────────────────

  it("shows the error UI and a Try again button when the fetch fails", async () => {
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json({ error: "Rate limited" }, { status: 429 })
      )
    );

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load photos")).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: "Try again" })
    ).toBeInTheDocument();
  });

  it("retries the fetch when Try again is clicked", async () => {
    let callCount = 0;
    server.use(
      http.get("http://localhost/api/search/photos", () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json({ error: "Server error" }, { status: 500 });
        }
        return HttpResponse.json(createMockPhotos(3));
      })
    );

    renderWithProviders(<HomePage />);

    await waitFor(() =>
      screen.getByRole("button", { name: "Try again" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Failed to load photos")
      ).not.toBeInTheDocument();
    });
  });

  // ── empty state ──────────────────────────────────────────────────────────────

  it("shows 'No photos found' when the API returns an empty array", async () => {
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json([])
      )
    );

    renderWithProviders(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("No photos found.")).toBeInTheDocument();
    });
  });

  // ── filter interactions ──────────────────────────────────────────────────────

  it("re-fetches with the color param when a color filter is selected", async () => {
    const user = userEvent.setup();
    const requestedUrls: string[] = [];

    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        requestedUrls.push(request.url);
        return HttpResponse.json(createMockPhotos(5));
      })
    );

    renderWithProviders(<HomePage />);
    await waitFor(() =>
      screen.getAllByRole("button", { name: /mock photo/i })
    );

    await user.click(screen.getByRole("button", { name: "Blue" }));

    await waitFor(() => {
      expect(requestedUrls.some((u) => u.includes("color=blue"))).toBe(true);
    });
  });

  it("calls router.replace with the filter in the URL when a sort is applied", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(createMockPhotos(5))
      )
    );

    renderWithProviders(<HomePage />);
    await waitFor(() =>
      screen.getAllByRole("button", { name: /mock photo/i })
    );

    await user.click(screen.getByRole("button", { name: "Sort by latest" }));

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("order_by=latest"),
        expect.any(Object)
      );
    });
  });

  // ── infinite scroll ──────────────────────────────────────────────────────────

  it("fetches the next page when the scroll sentinel intersects the viewport", async () => {
    const requestedPages: number[] = [];
    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        const page = Number(
          new URL(request.url).searchParams.get("page") ?? "1"
        );
        requestedPages.push(page);
        return HttpResponse.json(createMockPhotos(DEFAULT_PER_PAGE));
      })
    );

    renderWithProviders(<HomePage />);
    await waitFor(() =>
      screen.getAllByRole("button", { name: /mock photo/i })
    );

    act(() => {
      getLastIntersectionObserver().simulateIntersection(true);
    });

    await waitFor(() => {
      expect(requestedPages).toContain(2);
    });
  });

  // ── lightbox ─────────────────────────────────────────────────────────────────

  it("opens the lightbox dialog when a photo card is clicked", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(createMockPhotos(3))
      )
    );

    renderWithProviders(<HomePage />);
    await waitFor(() =>
      screen.getAllByRole("button", { name: /mock photo/i })
    );

    await user.click(
      screen.getAllByRole("button", { name: /mock photo/i })[0]
    );

    // Lightbox renders via createPortal into document.body
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("closes the lightbox when the close button is clicked", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("http://localhost/api/search/photos", () =>
        HttpResponse.json(createMockPhotos(3))
      )
    );

    renderWithProviders(<HomePage />);
    await waitFor(() =>
      screen.getAllByRole("button", { name: /mock photo/i })
    );

    await user.click(
      screen.getAllByRole("button", { name: /mock photo/i })[0]
    );
    await waitFor(() => screen.getByRole("dialog"));

    await user.click(screen.getByRole("button", { name: "Close lightbox" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  // ── URL state restore ─────────────────────────────────────────────────────────

  it("restores filter state from URL search params on mount", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...window.location, search: "?color=red&order_by=latest" },
    });

    server.use(
      http.get("http://localhost/api/search/photos", ({ request }) => {
        const url = new URL(request.url);
        // The page should pass restored filters to the query
        if (url.searchParams.get("color") === "red") {
          return HttpResponse.json(createMockPhotos(3));
        }
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<HomePage />);

    // The "Sort by latest" button should show as active (aria-pressed)
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Sort by latest" })
      ).toHaveAttribute("aria-pressed", "true");
    });
  });
});
