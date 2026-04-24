import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/renderWithProviders";
import { createMockCollections } from "../utils/factories";
import { SearchBar } from "@/components/SearchBar";
import { UnsplashCollection } from "@/types/unsplash";

// Mock useDebounce to return the value immediately so tests don't need
// fake timers — debounce timing is tested at the hook level, not here.
vi.mock("@/hooks/useDebounce", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useDebounce: (value: any) => value,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function setup(props: Partial<React.ComponentProps<typeof SearchBar>> = {}) {
  const user = userEvent.setup();
  const onSelectCollection = vi.fn<(collection: UnsplashCollection) => void>();
  const onClear = vi.fn();

  renderWithProviders(
    <SearchBar
      onSelectCollection={onSelectCollection}
      onClear={onClear}
      activeCollectionTitle={undefined}
      {...props}
    />
  );

  return {
    user,
    onSelectCollection,
    onClear,
    input: screen.getByRole("searchbox", { name: "Search collections" }),
  };
}

describe("SearchBar", () => {
  // ── initial render ───────────────────────────────────────────────────────────

  it("renders the search input with the correct placeholder", () => {
    const { input } = setup();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute(
      "placeholder",
      "Search collections (e.g. nature, travel...)"
    );
  });

  // ── no dropdown for short queries ────────────────────────────────────────────

  it("does not show the listbox when fewer than 2 chars are typed", async () => {
    const { user, input } = setup();
    await user.type(input, "a");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  // ── dropdown appears when query is long enough ────────────────────────────────

  it("shows the listbox after typing 2+ characters", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });
  });

  // ── collection titles in dropdown ────────────────────────────────────────────

  it("renders collection titles as options in the listbox", async () => {
    const mockCollections = createMockCollections(3);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 3, total_pages: 1 })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");

    await waitFor(() => screen.getByRole("listbox"));

    for (const col of mockCollections) {
      expect(screen.getByText(col.title)).toBeInTheDocument();
    }
  });

  // ── keyboard navigation: ArrowDown ──────────────────────────────────────────

  it("sets aria-activedescendant to option-0 after the first ArrowDown", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", "option-0");
  });

  it("advances aria-activedescendant with each ArrowDown press", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", "option-1");
  });

  it("wraps ArrowDown back to the first option after the last one", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(2),
          total: 2,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    // index 0 → 1 → wraps back to 0
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", "option-0");
  });

  it("moves ArrowUp to the previous option", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}"); // index 1
    await user.keyboard("{ArrowUp}");   // back to index 0
    expect(input).toHaveAttribute("aria-activedescendant", "option-0");
  });

  // ── Enter selects suggestion ─────────────────────────────────────────────────

  it("calls onSelectCollection and closes the listbox when Enter is pressed on a highlighted option", async () => {
    const mockCollections = createMockCollections(3);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 3, total_pages: 1 })
      )
    );

    const { user, input, onSelectCollection } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSelectCollection).toHaveBeenCalledWith(mockCollections[0]);
    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  it("selects the first option on Enter even when no option is highlighted", async () => {
    const mockCollections = createMockCollections(3);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 3, total_pages: 1 })
      )
    );

    const { user, input, onSelectCollection } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{Enter}");
    expect(onSelectCollection).toHaveBeenCalledWith(mockCollections[0]);
  });

  // ── Escape closes dropdown ───────────────────────────────────────────────────

  it("closes the listbox when Escape is pressed", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    });
  });

  // ── clear button ─────────────────────────────────────────────────────────────

  it("does not render a clear button when the input is empty", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: "Clear search" })
    ).not.toBeInTheDocument();
  });

  it("renders a clear button when the input has a value", async () => {
    const { user, input } = setup();
    await user.type(input, "nature");
    expect(
      screen.getByRole("button", { name: "Clear search" })
    ).toBeInTheDocument();
  });

  it("clears the input and calls onClear when the clear button is clicked", async () => {
    const { user, input, onClear } = setup();
    await user.type(input, "nature");

    await user.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onClear).toHaveBeenCalledOnce();
    expect(input).toHaveValue("");
  });

  // ── empty results ────────────────────────────────────────────────────────────

  it("shows 'No collections found' when API results are empty", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: [], total: 0, total_pages: 0 })
      )
    );

    const { user, input } = setup();
    await user.type(input, "xyzzy");

    await waitFor(() => screen.getByRole("listbox"));
    expect(screen.getByText(/no collections found/i)).toBeInTheDocument();
  });

  // ── loading skeleton ─────────────────────────────────────────────────────────

  it("renders the listbox with skeleton rows while loading", async () => {
    server.use(
      http.get(
        "http://localhost/api/collections/search",
        () => new Promise<Response>(() => {})
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const listbox = screen.getByRole("listbox");
    expect(listbox.children.length).toBeGreaterThan(0);
  });

  // ── ARIA attributes ──────────────────────────────────────────────────────────

  it("renders a combobox wrapper with aria-expanded: false initially", () => {
    setup();
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("sets aria-expanded: true on the combobox when the listbox is open", async () => {
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({
          results: createMockCollections(3),
          total: 3,
          total_pages: 1,
        })
      )
    );

    const { user, input } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-expanded",
      "true"
    );
  });

  it("sets aria-autocomplete=list on the input", () => {
    const { input } = setup();
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });

  it("has no aria-activedescendant when no option is highlighted", () => {
    const { input } = setup();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  // ── activeCollectionTitle sync ────────────────────────────────────────────────

  it("shows the activeCollectionTitle in the input when provided as a prop", () => {
    setup({ activeCollectionTitle: "Nature Walks" });
    expect(
      screen.getByRole("searchbox", { name: "Search collections" })
    ).toHaveValue("Nature Walks");
  });

  // ── selecting suggestion via mousedown ───────────────────────────────────────

  it("calls onSelectCollection when a suggestion option is clicked", async () => {
    const mockCollections = createMockCollections(3);
    server.use(
      http.get("http://localhost/api/collections/search", () =>
        HttpResponse.json({ results: mockCollections, total: 3, total_pages: 1 })
      )
    );

    const { user, input, onSelectCollection } = setup();
    await user.type(input, "na");
    await waitFor(() => screen.getByRole("listbox"));

    // The component uses onMouseDown to prevent blur before click fires
    const option = screen.getByText(mockCollections[1].title).closest("li")!;
    await user.pointer({ keys: "[MouseLeft>]", target: option });

    expect(onSelectCollection).toHaveBeenCalledWith(mockCollections[1]);
  });
});
