@AGENTS.md

## Stack

- **Next.js 16** App Router (`src/app/`) — server components by default, client components opt-in with `"use client"`
- **React 19** — latest hooks API; use `memo()` for all pure presentational components
- **Tailwind v4** — `@import "tailwindcss"` in globals.css (not `@tailwind base/components/utilities`); PostCSS via `@tailwindcss/postcss`
- **TanStack Query v5** — `useInfiniteQuery` for paginated data; `useQuery` for one-shot lookups
- **TypeScript strict** — all types live in `src/types/unsplash.ts`; branded types for filter values

## Architecture conventions

- **API proxy pattern**: every Unsplash request goes through `src/app/api/*/route.ts`. `UNSPLASH_ACCESS_KEY` is server-only and never imported in client code.
- **Shared route helpers**: `src/lib/unsplash-route-utils.ts` — use `requireAccessKey()`, `clampPerPage()`, `pickRateLimitHeaders()`, and `proxyError()` in every new API route.
- **Constants**: add shared constants (base URLs, defaults, valid enum sets) to `src/lib/constants.ts`.
- **No Next.js `<Image>`**: image optimization is handled manually. Use `buildImageUrl()` and `buildPlaceholderUrl()` from `src/services/unsplash.ts` to produce Unsplash CDN URLs with `?fm=webp`, srcset, and LQIP parameters.
- **URL state sync**: `page.tsx` syncs `selectedCollection` and `PhotoFilters` to/from query params so links are shareable. Extend this pattern for any new top-level filter state.
- **Singleton QueryClient**: defined in `src/lib/queryClient.ts`; 5 min stale, 10 min gc, `retry: 2`, `refetchOnWindowFocus: false`.

## Key patterns in use

- CSS Columns masonry (not CSS Grid) in `ImageGrid` for variable-height photo layouts
- Blur-up LQIP: 20 px / 10 % quality WebP thumbnail blurred in CSS, fades out on full-image load
- Intersection Observer sentinel (`InfiniteScrollTrigger`) with `rootMargin: "300px"` triggers `fetchNextPage` before the user reaches the bottom
- Accessible combobox (`SearchBar` + `SearchSuggestions`) with full WAI-ARIA `role="combobox"` / `role="listbox"` pattern and keyboard navigation
- `FilterBar` uses `aria-pressed` toggles; `role="group"` per filter category
- `Lightbox` renders via React Portal to `document.body` to avoid z-index stacking issues
- Debounce: 350 ms on collection search input (see `useDebounce.ts`)
