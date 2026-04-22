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
