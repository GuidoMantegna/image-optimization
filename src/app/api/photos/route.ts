import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_BASE = "https://api.unsplash.com";

export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("per_page") ?? "20";

  // Clamp per_page to Unsplash's allowed range (1–30)
  const clampedPerPage = Math.min(Math.max(Number(perPage), 1), 30);

  const apiUrl = new URL(`${UNSPLASH_BASE}/photos`);
  apiUrl.searchParams.set("page", page);
  apiUrl.searchParams.set("per_page", String(clampedPerPage));
  apiUrl.searchParams.set("order_by", "latest");

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
    // Cache at the edge for 60 seconds to reduce API calls
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[Unsplash API Error]", res.status, body);
    return NextResponse.json(
      { error: `Unsplash API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();

  // Forward rate-limit headers to the client so it can react if needed
  const headers = new Headers();
  const rl = res.headers.get("X-Ratelimit-Remaining");
  const rlLimit = res.headers.get("X-Ratelimit-Limit");
  if (rl) headers.set("X-Ratelimit-Remaining", rl);
  if (rlLimit) headers.set("X-Ratelimit-Limit", rlLimit);

  return NextResponse.json(data, { headers });
}
