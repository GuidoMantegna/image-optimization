export const UNSPLASH_BASE = "https://api.unsplash.com";
export const DEFAULT_QUERY = "photography";
export const DEFAULT_PER_PAGE = 20;
export const REVALIDATE_SECONDS = 60;
export const VALID_COLORS = new Set<string>([
    "black_and_white", "black", "white", "yellow", "orange",
    "red", "purple", "magenta", "green", "teal", "blue",
]);
export const VALID_ORIENTATIONS = new Set<string>(["landscape", "portrait", "squarish"]);
export const VALID_ORDER_BY = new Set<string>(["latest", "relevant"]);