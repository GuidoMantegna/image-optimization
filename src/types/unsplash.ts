export interface UnsplashUser {
  id: string;
  name: string;
  username: string;
  portfolio_url: string | null;
  profile_image: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  alt_description: string | null;
  description: string | null;
  likes: number;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: {
    self: string;
    html: string;
    download: string;
  };
  user: UnsplashUser;
  location?: {
    city: string | null;
    country: string | null;
  };
}

export interface UnsplashCollection {
  id: string;
  title: string;
  description: string | null;
  total_photos: number;
  cover_photo: UnsplashPhoto | null;
  preview_photos: Array<{ urls: { thumb: string } }> | null;
  user: UnsplashUser;
}

export interface SearchCollectionsResult {
  results: UnsplashCollection[];
  total: number;
  total_pages: number;
}
