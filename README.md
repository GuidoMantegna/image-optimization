# LensFeed — Infinite Photo Gallery

A production-ready infinite-scroll image gallery powered by the Unsplash API, built with Next.js 15 App Router, TanStack Query, and Tailwind CSS.

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

> The key is only used server-side (in the Next.js API route) and never exposed to the client.

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
│   ├── api/photos/route.ts        # Server-side Unsplash proxy (keeps key secret)
│   ├── layout.tsx                 # Root layout + QueryClientProvider
│   ├── page.tsx                   # Home page — wires all hooks & components
│   ├── providers.tsx              # TanStack Query client provider
│   └── globals.css                # Tailwind + shimmer animation + parallax
├── components/
│   ├── Header.tsx                 # Fixed glassmorphism header
│   ├── ImageCard.tsx              # Card: blur-up placeholder, srcset, hover overlay
│   ├── ImageGrid.tsx              # CSS-columns masonry grid
│   ├── ImageSkeleton.tsx          # Shimmer skeleton placeholders
│   ├── InfiniteScrollTrigger.tsx  # Intersection Observer sentinel
│   └── Lightbox.tsx               # Portal modal with keyboard navigation
├── hooks/
│   ├── useImages.ts               # useInfiniteQuery — infinite scroll data
│   ├── useIntersectionObserver.ts # Reusable IO hook
│   └── useLightbox.ts             # Lightbox open/close/prev/next state
├── services/
│   └── unsplash.ts                # fetch abstraction + CDN URL builder
├── types/
│   └── unsplash.ts                # UnsplashPhoto TypeScript interfaces
└── lib/
    └── queryClient.ts             # Singleton QueryClient (5 min stale, 10 min gc)
```

## Performance Features

| Feature | Implementation |
|---|---|
| CLS prevention | `aspect-ratio` from API `width`/`height` on every card |
| LCP optimization | `loading="eager"` + `fetchpriority="high"` on first 6 images |
| Lazy loading | `loading="lazy"` on all subsequent images |
| Modern formats | Unsplash CDN `?fm=webp` on all image URLs |
| Responsive images | `srcset` at 400w / 800w / 1200w with `sizes` |
| Blur-up placeholder | 20px thumbnail blurred, fades out on full image load |
| Request deduplication | TanStack Query caches by page key, stale for 5 minutes |
| No unnecessary re-renders | `memo()` on `ImageGrid`, `ImageCard`, `Header` |
| Infinite scroll | `IntersectionObserver` sentinel 300px before viewport edge |
| Parallax | CSS scroll-driven animation (`animation-timeline: scroll()`) |

## Rate Limits

The Unsplash demo tier allows **50 requests/hour**. Each page load costs 1 request (20 photos). For production traffic, apply for a **production key** on the Unsplash developer portal to unlock 5,000 requests/hour.
