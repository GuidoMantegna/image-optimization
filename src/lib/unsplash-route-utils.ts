import { NextResponse } from "next/server";
import { DEFAULT_PER_PAGE } from "@/lib/constants";

/**
 * Returns the Unsplash access key from env, or a 500 NextResponse if missing.
 * Usage: const key = requireAccessKey(); if (key instanceof NextResponse) return key;
 */
export function requireAccessKey(): string | NextResponse {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in .env.local" },
      { status: 500 }
    );
  }
  return key;
}

export function clampPerPage(raw: string | null, fallback = DEFAULT_PER_PAGE): number {
  return Math.min(Math.max(Number(raw ?? fallback), 1), 30);
}

export function pickRateLimitHeaders(upstream: Response): Headers {
  const headers = new Headers();
  const remaining = upstream.headers.get("X-Ratelimit-Remaining");
  const limit = upstream.headers.get("X-Ratelimit-Limit");
  if (remaining) headers.set("X-Ratelimit-Remaining", remaining);
  if (limit) headers.set("X-Ratelimit-Limit", limit);
  return headers;
}

export async function proxyError(res: Response, label: string): Promise<NextResponse> {
  const body = await res.text().catch(() => "");
  console.error(`[${label}]`, res.status, body);
  return NextResponse.json(
    { error: `Unsplash API error: ${res.status}` },
    { status: res.status }
  );
}
