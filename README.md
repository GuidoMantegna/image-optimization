# LensFeed — Infinite Photo Gallery

A production-ready infinite-scroll image gallery powered by the Unsplash API, built with Next.js 16 App Router, React 19, TanStack Query v5, and Tailwind CSS v4.

## Features

- **Infinite scroll** — loads 20 photos at a time via Intersection Observer
- **Search** — free-text photo search with live collection suggestions (debounced, accessible combobox)
- **Filters** — color, orientation, and sort-order filters with URL sync (shareable links)
- **Lightbox** — full-resolution modal with keyboard navigation (←/→/Esc)
- **Blur-up placeholders** — low-quality image placeholders that fade out on load
- **Shimmer skeletons** — CSS-animated placeholders shown while fetching
- **Parallax** — CSS scroll-driven animation on cards

## Setup

### 1. Get a free Unsplash API key

1. Go to [unsplash.com/developers](https://unsplash.com/developers)
2. Click **Your Apps → New Application**
3. Copy the **Access Key**

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and paste your key:

```env
UNSPLASH_ACCESS_KEY=your_access_key_here
```

> The key is used server-side only (Next.js API routes) and is never exposed to the client.

### 3. Install dependencies & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── search/photos/route.ts         # Photo search proxy → Unsplash /search/photos
│   │   └── collections/search/route.ts    # Collection search proxy → Unsplash /search/collections
│   ├── layout.tsx                         # Root layout + Geist font + metadata
│   ├── page.tsx                           # Home page — search, filters, infinite grid
│   ├── providers.tsx                      # TanStack Query client provider + devtools
│   └── globals.css                        # Tailwind v4 + shimmer + parallax + dropdown
├── components/
│   ├── FilterBar.tsx                      # Color / orientation / sort toggles (WAI-ARIA)
│   ├── Header.tsx                         # Fixed glassmorphism header
│   ├── ImageCard.tsx                      # Card: blur-up placeholder, srcset, hover overlay
│   ├── ImageGrid.tsx                      # CSS-columns masonry grid
│   ├── ImageSkeleton.tsx                  # Shimmer skeleton placeholders
│   ├── InfiniteScrollTrigger.tsx          # Intersection Observer sentinel
│   ├── Lightbox.tsx                       # Portal modal with keyboard navigation
│   ├── SearchBar.tsx                      # Accessible combobox with collection suggestions
│   └── SearchSuggestions.tsx              # Collection search dropdown listbox
├── hooks/
│   ├── useCollectionSearch.ts             # Collection search (useQuery, 2 min stale)
│   ├── useDebounce.ts                     # Generic value debounce hook
│   ├── useIntersectionObserver.ts         # Reusable IntersectionObserver hook
│   ├── useLightbox.ts                     # Lightbox open/close/prev/next + keyboard
│   └── useSearchPhotos.ts                 # useInfiniteQuery — photo search + pagination
├── services/
│   ├── collections.ts                     # searchCollections() fetch abstraction
│   └── unsplash.ts                        # searchPhotos() + CDN URL builder
├── types/
│   └── unsplash.ts                        # UnsplashPhoto, UnsplashCollection, filter types
└── lib/
    ├── constants.ts                       # Shared constants (base URL, defaults, valid values)
    ├── queryClient.ts                     # Singleton QueryClient (5 min stale, 10 min gc)
    └── unsplash-route-utils.ts            # Shared route helpers (auth, clamping, errors)
```

## Performance Features

| Feature | Implementation |
|---|---|
| CLS prevention | `aspect-ratio` from API `width`/`height` on every card |
| LCP optimization | `loading="eager"` + `fetchpriority="high"` on first 6 images |
| Lazy loading | `loading="lazy"` on all subsequent images |
| Modern formats | Unsplash CDN `?fm=webp` on all image URLs |
| Responsive images | `srcset` at 400w / 800w / 1200w with `sizes` |
| Blur-up placeholder | 20 px / 10 % quality thumbnail blurred, fades out on full image load |
| Request deduplication | TanStack Query caches by page key, stale for 5 minutes |
| No unnecessary re-renders | `memo()` on `ImageGrid`, `ImageCard`, `Header`, `FilterBar` |
| Infinite scroll | `IntersectionObserver` sentinel 300 px before viewport edge |
| Parallax | CSS scroll-driven animation (`animation-timeline: scroll()`) |
| Debounced search | 350 ms debounce on collection search input |
| Shareable filters | Active filters and collection synced to URL query params |

## Rate Limits

The Unsplash demo tier allows **50 requests/hour**. Each page load costs 1 request (20 photos). For production traffic, apply for a **production key** on the Unsplash developer portal to unlock 5,000 requests/hour.
