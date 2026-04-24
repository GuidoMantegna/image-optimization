import {
  UnsplashPhoto,
  UnsplashUser,
  UnsplashCollection,
} from "@/types/unsplash";

let seq = 0;

export function resetSeq() {
  seq = 0;
}

export function createMockUser(overrides?: Partial<UnsplashUser>): UnsplashUser {
  const n = ++seq;
  return {
    id: `user-${n}`,
    name: `Photographer ${n}`,
    username: `photographer_${n}`,
    portfolio_url: null,
    profile_image: {
      small: `https://images.unsplash.com/profile-${n}-sm`,
      medium: `https://images.unsplash.com/profile-${n}-md`,
      large: `https://images.unsplash.com/profile-${n}-lg`,
    },
    ...overrides,
  };
}

export function createMockPhoto(
  overrides?: Partial<UnsplashPhoto>
): UnsplashPhoto {
  const n = ++seq;
  return {
    id: `photo-${n}`,
    width: 1200,
    height: 800,
    color: "#1a1a2e",
    blur_hash: "LGF5?xYk^6#M@-5c,1J5",
    alt_description: `Mock photo ${n}`,
    description: null,
    likes: n * 10,
    urls: {
      raw: `https://images.unsplash.com/photo-${n}`,
      full: `https://images.unsplash.com/photo-${n}?q=full`,
      regular: `https://images.unsplash.com/photo-${n}?q=reg`,
      small: `https://images.unsplash.com/photo-${n}?q=sm`,
      thumb: `https://images.unsplash.com/photo-${n}?q=th`,
    },
    links: {
      self: `https://api.unsplash.com/photos/photo-${n}`,
      html: `https://unsplash.com/photos/photo-${n}`,
      download: `https://unsplash.com/photos/photo-${n}/download`,
    },
    user: createMockUser(),
    location: { city: null, country: null },
    ...overrides,
  };
}

export function createMockCollection(
  overrides?: Partial<UnsplashCollection>
): UnsplashCollection {
  const n = ++seq;
  return {
    id: `collection-${n}`,
    title: `Collection ${n}`,
    description: null,
    total_photos: n * 42,
    cover_photo: createMockPhoto(),
    preview_photos: [
      { urls: { thumb: `https://images.unsplash.com/preview-${n}` } },
    ],
    user: createMockUser(),
    ...overrides,
  };
}

export function createMockPhotos(
  count: number,
  overrides?: Partial<UnsplashPhoto>
): UnsplashPhoto[] {
  return Array.from({ length: count }, () => createMockPhoto(overrides));
}

export function createMockCollections(count: number): UnsplashCollection[] {
  return Array.from({ length: count }, () => createMockCollection());
}
